import { createId } from '@/lib/id';
import {
  AppData,
  EnergyType,
  FuelLog,
  GarageVehicle,
  GlobalAssumptions,
  MaintenanceItem,
  MaintenanceRecord,
  Trip,
  Vehicle,
} from '@/types';

function makeTrip(name: string, frequencyPerYear: number, roundTripKm: number): Trip {
  return {
    id: createId('trip'),
    name,
    frequencyPerYear,
    roundTripKm,
  };
}

function makeItem(item: Omit<MaintenanceItem, 'id'>): MaintenanceItem {
  return {
    id: createId('item'),
    ...item,
  };
}

function makeFuelLog(log: Omit<FuelLog, 'id'>): FuelLog {
  return {
    id: createId('fuel'),
    ...log,
  };
}

function makeMaintenanceRecord(record: Omit<MaintenanceRecord, 'id'>): MaintenanceRecord {
  return {
    id: createId('service'),
    ...record,
  };
}

export function createDefaultTrips(): Trip[] {
  return [makeTrip('Chuy', 2, 800), makeTrip('Aguas Blancas', 8, 250)];
}

export function createDefaultAssumptions(): GlobalAssumptions {
  return {
    updatedAt: '2026-04-24',
    annualKmReference: 15000,
    gasolinePrice: 82.27,
    dieselPrice: 61.49,
    electricityPrice: 11.2,
    analysisHorizonYears: 5,
    discountRatePercent: 8,
  };
}

export function createMaintenanceCatalog(energyType: EnergyType): MaintenanceItem[] {
  const thermalItems: MaintenanceItem[] = [
    makeItem({
      name: 'Cambio de aceite + filtro',
      category: 'mantenimiento',
      cost: 4200,
      usefulLifeKm: 10000,
      usefulLifeYears: 1,
      appliesTo: 'todos',
      active: true,
      notes: 'Servicio basico anual.',
    }),
    makeItem({
      name: 'Filtro de aire',
      category: 'mantenimiento',
      cost: 950,
      usefulLifeKm: 15000,
      usefulLifeYears: 1,
      appliesTo: 'todos',
      active: true,
      notes: 'Conviene revisar en uso rutero y polvo.',
    }),
    makeItem({
      name: 'Filtro de combustible',
      category: 'mantenimiento',
      cost: 1500,
      usefulLifeKm: 25000,
      usefulLifeYears: 2,
      appliesTo: 'gasoil',
      active: true,
      notes: 'Mas critico en diesel por contaminacion del sistema.',
    }),
    makeItem({
      name: 'Filtro de habitaculo',
      category: 'mantenimiento',
      cost: 900,
      usefulLifeKm: 15000,
      usefulLifeYears: 1,
      appliesTo: 'todos',
      active: true,
      notes: 'Impacta confort y eficiencia del A/C.',
    }),
    makeItem({
      name: 'Bujias',
      category: 'mantenimiento',
      cost: 2800,
      usefulLifeKm: 40000,
      usefulLifeYears: 3,
      appliesTo: 'nafta',
      active: true,
      notes: 'Solo nafta.',
    }),
    makeItem({
      name: 'Calentadores',
      category: 'mantenimiento',
      cost: 5200,
      usefulLifeKm: 90000,
      usefulLifeYears: 5,
      appliesTo: 'gasoil',
      active: true,
      notes: 'Solo motores diesel.',
    }),
    makeItem({
      name: 'Distribucion/correa + bomba de agua',
      category: 'mantenimiento',
      cost: 18000,
      usefulLifeKm: 70000,
      usefulLifeYears: 5,
      appliesTo: 'todos',
      active: true,
      notes: 'Si el motor usa cadena, desactivar.',
    }),
    makeItem({
      name: 'Pastillas de freno',
      category: 'desgaste',
      cost: 5400,
      usefulLifeKm: 30000,
      usefulLifeYears: 3,
      appliesTo: 'todos',
      active: true,
      notes: 'Depende del uso urbano.',
    }),
    makeItem({
      name: 'Discos de freno',
      category: 'desgaste',
      cost: 9800,
      usefulLifeKm: 70000,
      usefulLifeYears: 5,
      appliesTo: 'todos',
      active: true,
      notes: 'Frecuente junto a segundo juego de pastillas.',
    }),
    makeItem({
      name: 'Liquido de frenos',
      category: 'mantenimiento',
      cost: 1800,
      usefulLifeKm: null,
      usefulLifeYears: 2,
      appliesTo: 'todos',
      active: true,
      notes: 'Reemplazo preventivo.',
    }),
    makeItem({
      name: 'Liquido refrigerante',
      category: 'mantenimiento',
      cost: 2600,
      usefulLifeKm: null,
      usefulLifeYears: 2,
      appliesTo: 'todos',
      active: true,
      notes: 'Controlar especificacion correcta.',
    }),
    makeItem({
      name: 'Bateria 12V',
      category: 'contingencia',
      cost: 6200,
      usefulLifeKm: null,
      usefulLifeYears: 4,
      appliesTo: 'todos',
      active: true,
      notes: 'Contemplar clima y uso urbano.',
    }),
    makeItem({
      name: 'Cubiertas',
      category: 'desgaste',
      cost: 26000,
      usefulLifeKm: 45000,
      usefulLifeYears: 4,
      appliesTo: 'todos',
      active: true,
      notes: 'Juego completo, ajustar segun medida.',
    }),
    makeItem({
      name: 'Alineacion y balanceo',
      category: 'desgaste',
      cost: 2400,
      usefulLifeKm: 10000,
      usefulLifeYears: 1,
      appliesTo: 'todos',
      active: true,
      notes: 'Ideal con cada rotacion o golpe fuerte.',
    }),
    makeItem({
      name: 'Amortiguadores',
      category: 'desgaste',
      cost: 24000,
      usefulLifeKm: 80000,
      usefulLifeYears: 6,
      appliesTo: 'todos',
      active: true,
      notes: 'Juego completo.',
    }),
    makeItem({
      name: 'Tren delantero: bujes, rotulas, bieletas',
      category: 'contingencia',
      cost: 18000,
      usefulLifeKm: 60000,
      usefulLifeYears: 5,
      appliesTo: 'todos',
      active: true,
      notes: 'Muy sensible a calles rotas.',
    }),
    makeItem({
      name: 'Embrague',
      category: 'contingencia',
      cost: 28000,
      usefulLifeKm: 100000,
      usefulLifeYears: 7,
      appliesTo: 'todos',
      active: true,
      notes: 'No aplica a EV ni a algunas cajas especiales.',
    }),
    makeItem({
      name: 'Correa auxiliar',
      category: 'mantenimiento',
      cost: 3200,
      usefulLifeKm: 50000,
      usefulLifeYears: 4,
      appliesTo: 'todos',
      active: true,
      notes: 'Correa de accesorios.',
    }),
    makeItem({
      name: 'Escobillas limpiaparabrisas',
      category: 'mantenimiento',
      cost: 1300,
      usefulLifeKm: null,
      usefulLifeYears: 1,
      appliesTo: 'todos',
      active: true,
      notes: 'Costo anual estimado.',
    }),
    makeItem({
      name: 'Aire acondicionado / recarga',
      category: 'contingencia',
      cost: 4200,
      usefulLifeKm: null,
      usefulLifeYears: 3,
      appliesTo: 'todos',
      active: true,
      notes: 'Preventivo o recarga moderada.',
    }),
    makeItem({
      name: 'Sensores / bobinas / electronica menor',
      category: 'contingencia',
      cost: 8500,
      usefulLifeKm: null,
      usefulLifeYears: 4,
      appliesTo: 'todos',
      active: true,
      notes: 'Fondo preventivo para fallas menores.',
    }),
    makeItem({
      name: 'Radiador / mangueras',
      category: 'contingencia',
      cost: 12000,
      usefulLifeKm: 90000,
      usefulLifeYears: 6,
      appliesTo: 'todos',
      active: true,
      notes: 'Sistema de enfriamiento.',
    }),
    makeItem({
      name: 'Inspeccion tecnica / ITV',
      category: 'fijo',
      cost: 2500,
      usefulLifeKm: null,
      usefulLifeYears: 1,
      appliesTo: 'todos',
      active: true,
      notes: 'Mantener si aplica al escenario.',
    }),
  ];

  const electricItems: MaintenanceItem[] = [
    makeItem({
      name: 'Cubiertas',
      category: 'desgaste',
      cost: 32000,
      usefulLifeKm: 42000,
      usefulLifeYears: 4,
      appliesTo: 'electrico',
      active: true,
      notes: 'El peso del EV puede acelerar desgaste.',
    }),
    makeItem({
      name: 'Alineacion y balanceo',
      category: 'desgaste',
      cost: 2600,
      usefulLifeKm: 10000,
      usefulLifeYears: 1,
      appliesTo: 'electrico',
      active: true,
      notes: 'Revisar por torque instantaneo y peso.',
    }),
    makeItem({
      name: 'Pastillas de freno',
      category: 'desgaste',
      cost: 4200,
      usefulLifeKm: 45000,
      usefulLifeYears: 4,
      appliesTo: 'electrico',
      active: true,
      notes: 'Puede durar mas por frenado regenerativo.',
    }),
    makeItem({
      name: 'Discos de freno',
      category: 'desgaste',
      cost: 9800,
      usefulLifeKm: 90000,
      usefulLifeYears: 6,
      appliesTo: 'electrico',
      active: true,
      notes: 'Vigilar corrosion por bajo uso.',
    }),
    makeItem({
      name: 'Liquido de frenos',
      category: 'mantenimiento',
      cost: 1800,
      usefulLifeKm: null,
      usefulLifeYears: 2,
      appliesTo: 'electrico',
      active: true,
      notes: 'Sigue siendo servicio critico.',
    }),
    makeItem({
      name: 'Liquido refrigerante de bateria/motor',
      category: 'electrico',
      cost: 3800,
      usefulLifeKm: null,
      usefulLifeYears: 3,
      appliesTo: 'electrico',
      active: true,
      notes: 'Si el modelo usa circuito liquido.',
    }),
    makeItem({
      name: 'Bateria 12V',
      category: 'contingencia',
      cost: 6200,
      usefulLifeKm: null,
      usefulLifeYears: 4,
      appliesTo: 'electrico',
      active: true,
      notes: 'Muy comun como costo oculto.',
    }),
    makeItem({
      name: 'Filtro habitaculo',
      category: 'mantenimiento',
      cost: 950,
      usefulLifeKm: 15000,
      usefulLifeYears: 1,
      appliesTo: 'electrico',
      active: true,
      notes: 'Mismo criterio que un termico.',
    }),
    makeItem({
      name: 'Amortiguadores',
      category: 'desgaste',
      cost: 28000,
      usefulLifeKm: 80000,
      usefulLifeYears: 6,
      appliesTo: 'electrico',
      active: true,
      notes: 'Ajustar por peso del pack.',
    }),
    makeItem({
      name: 'Tren delantero',
      category: 'contingencia',
      cost: 19000,
      usefulLifeKm: 60000,
      usefulLifeYears: 5,
      appliesTo: 'electrico',
      active: true,
      notes: 'Bujes, bieletas, rotulas.',
    }),
    makeItem({
      name: 'Escobillas limpiaparabrisas',
      category: 'mantenimiento',
      cost: 1300,
      usefulLifeKm: null,
      usefulLifeYears: 1,
      appliesTo: 'electrico',
      active: true,
      notes: 'Mantenimiento anual.',
    }),
    makeItem({
      name: 'Chequeo sistema electrico',
      category: 'electrico',
      cost: 4800,
      usefulLifeKm: null,
      usefulLifeYears: 1,
      appliesTo: 'electrico',
      active: true,
      notes: 'Diagnostico preventivo.',
    }),
    makeItem({
      name: 'Degradacion bateria de traccion',
      category: 'electrico',
      cost: 15000,
      usefulLifeKm: null,
      usefulLifeYears: 1,
      appliesTo: 'electrico',
      active: true,
      notes: 'Reserva anual para perdida de valor por salud del pack.',
    }),
    makeItem({
      name: 'Fondo de contingencia bateria/modulos',
      category: 'contingencia',
      cost: 24000,
      usefulLifeKm: null,
      usefulLifeYears: 6,
      appliesTo: 'electrico',
      active: true,
      notes: 'No es recambio completo; es fondo tecnico.',
    }),
  ];

  if (energyType === 'electrico') {
    return electricItems;
  }

  return thermalItems.filter((item) => item.appliesTo === 'todos' || item.appliesTo === energyType);
}

export function createVehicleTemplate(
  energyType: EnergyType,
  overrides: Partial<Vehicle> = {},
): Vehicle {
  const base: Record<EnergyType, Omit<Vehicle, 'id'>> = {
    nafta: {
      name: 'Peugeot 206 usado',
      brand: 'Peugeot',
      model: '206',
      year: 2008,
      energyType: 'nafta',
      consumption: 11,
      baseMonthlyKm: 680,
      energyPrice: 82.27,
      annualInsurance: 18500,
      annualRegistration: 24000,
      annualFixedCosts: 9500,
      estimatedValue: 315000,
      annualDepreciationPercent: 8,
      trips: createDefaultTrips(),
      maintenanceItems: createMaintenanceCatalog('nafta'),
    },
    gasoil: {
      name: 'Diesel referente',
      brand: 'Volkswagen',
      model: 'Gol 1.6D',
      year: 2015,
      energyType: 'gasoil',
      consumption: 15,
      baseMonthlyKm: 680,
      energyPrice: 61.49,
      annualInsurance: 24000,
      annualRegistration: 29000,
      annualFixedCosts: 9800,
      estimatedValue: 540000,
      annualDepreciationPercent: 7,
      trips: createDefaultTrips(),
      maintenanceItems: createMaintenanceCatalog('gasoil'),
    },
    electrico: {
      name: 'Electrico compacto',
      brand: 'Generico',
      model: 'Compact EV',
      year: 2023,
      energyType: 'electrico',
      consumption: 15,
      baseMonthlyKm: 680,
      energyPrice: 11.2,
      annualInsurance: 42000,
      annualRegistration: 22000,
      annualFixedCosts: 12000,
      estimatedValue: 1180000,
      annualDepreciationPercent: 12,
      trips: createDefaultTrips(),
      maintenanceItems: createMaintenanceCatalog('electrico'),
    },
  };

  return {
    id: createId('vehicle'),
    ...base[energyType],
    ...overrides,
  };
}

export function createGarageVehicleTemplate(
  energyType: EnergyType,
  overrides: Partial<GarageVehicle> = {},
): GarageVehicle {
  const baseVehicle = createVehicleTemplate(energyType);

  const seedLogsByType: Record<EnergyType, FuelLog[]> = {
    nafta: [
      makeFuelLog({
        date: '2026-03-08',
        odometerKm: 146120,
        energyUnits: 31.4,
        totalCost: 2573,
        fullRefill: true,
        station: 'ANCAP',
        notes: 'Uso mixto ciudad/ruta.',
      }),
      makeFuelLog({
        date: '2026-03-29',
        odometerKm: 146468,
        energyUnits: 29.8,
        totalCost: 2449,
        fullRefill: true,
        station: 'DUCSA',
        notes: 'Con ida a Aguas Blancas.',
      }),
      makeFuelLog({
        date: '2026-04-19',
        odometerKm: 146812,
        energyUnits: 30.7,
        totalCost: 2526,
        fullRefill: true,
        station: 'ANCAP',
        notes: 'Carga completa.',
      }),
    ],
    gasoil: [
      makeFuelLog({
        date: '2026-03-14',
        odometerKm: 78120,
        energyUnits: 34.5,
        totalCost: 2121,
        fullRefill: true,
        station: 'DUCSA',
        notes: 'Referencia diesel.',
      }),
      makeFuelLog({
        date: '2026-04-03',
        odometerKm: 78685,
        energyUnits: 35.1,
        totalCost: 2158,
        fullRefill: true,
        station: 'ANCAP',
        notes: 'Uso rutero predominante.',
      }),
    ],
    electrico: [
      makeFuelLog({
        date: '2026-03-11',
        odometerKm: 24210,
        energyUnits: 42,
        totalCost: 470,
        fullRefill: true,
        station: 'UTE hogar',
        notes: 'Carga nocturna.',
      }),
      makeFuelLog({
        date: '2026-03-28',
        odometerKm: 24495,
        energyUnits: 39,
        totalCost: 437,
        fullRefill: true,
        station: 'UTE hogar',
        notes: 'Con tramos urbanos.',
      }),
      makeFuelLog({
        date: '2026-04-15',
        odometerKm: 24780,
        energyUnits: 40,
        totalCost: 448,
        fullRefill: true,
        station: 'UTE hogar',
        notes: 'Autonomia estable.',
      }),
    ],
  };

  const seedMaintenanceByType: Record<EnergyType, MaintenanceRecord[]> = {
    nafta: [
      makeMaintenanceRecord({
        date: '2026-02-18',
        itemName: 'Cambio de aceite + filtro',
        category: 'mantenimiento',
        cost: 4300,
        odometerKm: 145800,
        notes: 'Cambio con filtro y revision general.',
      }),
      makeMaintenanceRecord({
        date: '2025-11-07',
        itemName: 'Pastillas de freno',
        category: 'desgaste',
        cost: 5600,
        odometerKm: 143950,
        notes: 'Eje delantero.',
      }),
    ],
    gasoil: [
      makeMaintenanceRecord({
        date: '2026-01-12',
        itemName: 'Cambio de aceite + filtro',
        category: 'mantenimiento',
        cost: 6100,
        odometerKm: 77500,
        notes: 'Cambio preventivo.',
      }),
    ],
    electrico: [
      makeMaintenanceRecord({
        date: '2026-02-09',
        itemName: 'Chequeo sistema electrico',
        category: 'electrico',
        cost: 5200,
        odometerKm: 24010,
        notes: 'Diagnostico sin novedades.',
      }),
      makeMaintenanceRecord({
        date: '2025-12-02',
        itemName: 'Filtro habitaculo',
        category: 'mantenimiento',
        cost: 980,
        odometerKm: 23100,
        notes: 'Mantenimiento anual.',
      }),
    ],
  };

  const defaultCurrentOdometer = Math.max(
    ...seedLogsByType[energyType].map((log) => log.odometerKm),
    0,
  );

  return {
    ...baseVehicle,
    currentOdometerKm: defaultCurrentOdometer,
    fuelLogs: seedLogsByType[energyType],
    maintenanceRecords: seedMaintenanceByType[energyType],
    ...overrides,
  };
}

export function createInitialAppData(): AppData {
  return {
    comparisonVehicles: [
      createVehicleTemplate('nafta'),
      createVehicleTemplate('gasoil', {
        name: 'Diesel compacta',
        brand: 'Toyota',
        model: 'Corolla Cross',
        year: 2022,
        estimatedValue: 1680000,
        annualInsurance: 58200,
        annualRegistration: 46781,
        annualFixedCosts: 12500,
      }),
      createVehicleTemplate('electrico', {
        name: 'Electrico compacto',
        brand: 'BYD',
        model: 'Dolphin',
        year: 2024,
        estimatedValue: 1685000,
        annualInsurance: 32450,
        annualRegistration: 27689,
        annualFixedCosts: 5000,
      }),
    ],
    garageVehicles: [
      createGarageVehicleTemplate('nafta', {
        name: 'Mi Peugeot 206',
        brand: 'Peugeot',
        model: '206',
        year: 2008,
        estimatedValue: 315000,
        annualInsurance: 18500,
        annualRegistration: 24000,
      }),
      createGarageVehicleTemplate('electrico', {
        name: 'Mi EV compacto',
        brand: 'BYD',
        model: 'Dolphin',
        year: 2024,
        baseMonthlyKm: 920,
        estimatedValue: 1685000,
        annualInsurance: 32450,
        annualRegistration: 27689,
      }),
    ],
    assumptions: createDefaultAssumptions(),
  };
}
