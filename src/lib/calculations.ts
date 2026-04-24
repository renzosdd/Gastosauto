import {
  ComparisonResult,
  CostBreakdown,
  FuelLog,
  FuelLogMetrics,
  GarageVehicle,
  MaintenanceItem,
  Vehicle,
  VehicleResult,
} from '@/types';

export function calculateAnnualKm(baseMonthlyKm: number, trips: Vehicle['trips']): number {
  const tripKm = trips.reduce(
    (total, trip) => total + trip.frequencyPerYear * trip.roundTripKm,
    0,
  );

  return baseMonthlyKm * 12 + tripKm;
}

export function calculateEnergyCost(
  vehicle: Vehicle,
  annualKm: number,
  consumptionOverride?: number | null,
): {
  annualUnits: number;
  annualCost: number;
} {
  const effectiveConsumption = consumptionOverride ?? vehicle.consumption;

  if (vehicle.energyType === 'electrico') {
    const annualUnits = (annualKm * effectiveConsumption) / 100;
    return {
      annualUnits,
      annualCost: annualUnits * vehicle.energyPrice,
    };
  }

  const annualUnits = effectiveConsumption > 0 ? annualKm / effectiveConsumption : 0;
  return {
    annualUnits,
    annualCost: annualUnits * vehicle.energyPrice,
  };
}

export function calculateItemAnnualCost(
  item: MaintenanceItem,
  annualKm: number,
): {
  annualCost: number;
  costByKm: number;
  costByTime: number;
} {
  const costByKm = item.usefulLifeKm ? (item.cost / item.usefulLifeKm) * annualKm : 0;
  const costByTime = item.usefulLifeYears ? item.cost / item.usefulLifeYears : 0;

  return {
    annualCost: Math.max(costByKm, costByTime),
    costByKm,
    costByTime,
  };
}

function getSortedFuelLogs(logs: FuelLog[]): FuelLog[] {
  return [...logs].sort((first, second) => {
    if (first.odometerKm === second.odometerKm) {
      return first.date.localeCompare(second.date);
    }

    return first.odometerKm - second.odometerKm;
  });
}

export function calculateFuelLogMetrics(vehicle: GarageVehicle): FuelLogMetrics {
  const logs = getSortedFuelLogs(vehicle.fuelLogs);

  if (logs.length === 0) {
    return {
      averageEfficiency: null,
      totalDistanceKm: 0,
      totalEnergyUnits: 0,
      totalSpent: 0,
      validSegments: 0,
      latestOdometerKm: vehicle.currentOdometerKm,
    };
  }

  let totalDistanceKm = 0;
  let totalEnergyUnits = 0;
  let validSegments = 0;

  for (let index = 1; index < logs.length; index += 1) {
    const previousLog = logs[index - 1];
    const currentLog = logs[index];
    const deltaKm = currentLog.odometerKm - previousLog.odometerKm;

    if (deltaKm <= 0 || !previousLog.fullRefill || !currentLog.fullRefill) {
      continue;
    }

    totalDistanceKm += deltaKm;
    totalEnergyUnits += currentLog.energyUnits;
    validSegments += 1;
  }

  let averageEfficiency: number | null = null;

  if (totalDistanceKm > 0 && totalEnergyUnits > 0) {
    averageEfficiency =
      vehicle.energyType === 'electrico'
        ? (totalEnergyUnits / totalDistanceKm) * 100
        : totalDistanceKm / totalEnergyUnits;
  }

  return {
    averageEfficiency,
    totalDistanceKm,
    totalEnergyUnits,
    validSegments,
    totalSpent: logs.reduce((total, log) => total + log.totalCost, 0),
    latestOdometerKm: Math.max(vehicle.currentOdometerKm, logs[logs.length - 1]?.odometerKm ?? 0),
  };
}

function buildAlerts(vehicle: Vehicle, breakdown: CostBreakdown): string[] {
  const alerts: string[] = [];

  if (breakdown.annualTotal <= 0) {
    return alerts;
  }

  if (breakdown.annualEnergyCost / breakdown.annualTotal > 0.6) {
    alerts.push('El gasto de energia supera el 60% del costo total anual.');
  }

  if (breakdown.contingency / breakdown.annualTotal > 0.2) {
    alerts.push('La contingencia supera el 20% del costo anual y merece seguimiento.');
  }

  if (
    (breakdown.maintenance + breakdown.wear) / breakdown.annualTotal < 0.12 &&
    breakdown.depreciation / breakdown.annualTotal > 0.22
  ) {
    alerts.push('Tiene mantenimiento relativamente bajo, pero la depreciacion pesa fuerte.');
  }

  if (
    vehicle.energyType === 'electrico' &&
    breakdown.annualEnergyCost < breakdown.fixedCosts &&
    breakdown.depreciation > breakdown.annualEnergyCost
  ) {
    alerts.push('El electrico ahorra en energia, pero conviene revisar seguro y depreciacion.');
  }

  if (breakdown.costPerKm > 20) {
    alerts.push('El costo por kilometro es alto para el kilometraje actual.');
  }

  return alerts;
}

export function calculateVehicleTotal(
  vehicle: Vehicle,
  options?: { consumptionOverride?: number | null },
): VehicleResult {
  const annualKm = calculateAnnualKm(vehicle.baseMonthlyKm, vehicle.trips);
  const energy = calculateEnergyCost(vehicle, annualKm, options?.consumptionOverride);

  let maintenance = 0;
  let wear = 0;
  let contingency = 0;
  let electricSpecific = 0;
  let fixedItems = 0;

  const itemResults = vehicle.maintenanceItems
    .filter((item) => item.active)
    .filter((item) => item.appliesTo === 'todos' || item.appliesTo === vehicle.energyType)
    .map((item) => {
      const itemCost = calculateItemAnnualCost(item, annualKm);

      if (item.category === 'mantenimiento') maintenance += itemCost.annualCost;
      if (item.category === 'desgaste') wear += itemCost.annualCost;
      if (item.category === 'contingencia') contingency += itemCost.annualCost;
      if (item.category === 'electrico') electricSpecific += itemCost.annualCost;
      if (item.category === 'fijo') fixedItems += itemCost.annualCost;

      return {
        item,
        annualCost: itemCost.annualCost,
      };
    });

  const itemsTotal = maintenance + wear + contingency + electricSpecific + fixedItems;
  const depreciation = (vehicle.estimatedValue * vehicle.annualDepreciationPercent) / 100;
  const fixedCosts =
    vehicle.annualInsurance + vehicle.annualRegistration + vehicle.annualFixedCosts + fixedItems;
  const annualTotal =
    energy.annualCost +
    itemsTotal +
    vehicle.annualInsurance +
    vehicle.annualRegistration +
    vehicle.annualFixedCosts +
    depreciation;
  const monthlyTotal = annualTotal / 12;
  const costPerKm = annualKm > 0 ? annualTotal / annualKm : 0;

  const breakdown: CostBreakdown = {
    annualKm,
    annualEnergyUnits: energy.annualUnits,
    annualEnergyCost: energy.annualCost,
    maintenance,
    wear,
    contingency,
    electricSpecific,
    fixedItems,
    fixedCosts,
    depreciation,
    itemsTotal,
    annualTotal,
    monthlyTotal,
    costPerKm,
    percentages: {
      energia: annualTotal > 0 ? energy.annualCost / annualTotal : 0,
      mantenimiento: annualTotal > 0 ? (maintenance + electricSpecific) / annualTotal : 0,
      desgaste: annualTotal > 0 ? wear / annualTotal : 0,
      contingencia: annualTotal > 0 ? contingency / annualTotal : 0,
      fijos: annualTotal > 0 ? fixedCosts / annualTotal : 0,
      depreciacion: annualTotal > 0 ? depreciation / annualTotal : 0,
    },
  };

  return {
    vehicle,
    breakdown,
    itemResults,
    alerts: buildAlerts(vehicle, breakdown),
  };
}

export function compareVehicles(results: VehicleResult[]): ComparisonResult {
  const sorted = [...results].sort(
    (first, second) => first.breakdown.annualTotal - second.breakdown.annualTotal,
  );

  const cheapestAnnual = sorted[0];
  const lowestCostPerKm = [...results].sort(
    (first, second) => first.breakdown.costPerKm - second.breakdown.costPerKm,
  )[0];
  const lowestEnergyCost = [...results].sort(
    (first, second) => first.breakdown.annualEnergyCost - second.breakdown.annualEnergyCost,
  )[0];
  const highestMaintenance = [...results].sort((first, second) => {
    const firstTotal =
      first.breakdown.maintenance + first.breakdown.wear + first.breakdown.electricSpecific;
    const secondTotal =
      second.breakdown.maintenance + second.breakdown.wear + second.breakdown.electricSpecific;

    return secondTotal - firstTotal;
  })[0];

  const annualDifferences = results.reduce<Record<string, number>>((accumulator, result) => {
    accumulator[result.vehicle.id] = cheapestAnnual
      ? result.breakdown.annualTotal - cheapestAnnual.breakdown.annualTotal
      : 0;
    return accumulator;
  }, {});

  return {
    cheapestAnnualId: cheapestAnnual?.vehicle.id,
    lowestCostPerKmId: lowestCostPerKm?.vehicle.id,
    lowestEnergyCostId: lowestEnergyCost?.vehicle.id,
    highestMaintenanceId: highestMaintenance?.vehicle.id,
    annualDifferences,
    annualRanking: sorted,
  };
}
