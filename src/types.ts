export type EnergyType = 'nafta' | 'gasoil' | 'electrico';
export type ApplicableEnergyType = EnergyType | 'todos';
export type AppPage = 'resumen' | 'comparador' | 'mis-vehiculos' | 'supuestos';

export type MaintenanceCategory =
  | 'mantenimiento'
  | 'desgaste'
  | 'contingencia'
  | 'electrico'
  | 'fijo';

export interface Trip {
  id: string;
  name: string;
  frequencyPerYear: number;
  roundTripKm: number;
}

export interface MaintenanceItem {
  id: string;
  name: string;
  category: MaintenanceCategory;
  cost: number;
  usefulLifeKm: number | null;
  usefulLifeYears: number | null;
  appliesTo: ApplicableEnergyType;
  active: boolean;
  notes: string;
}

export interface Vehicle {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  energyType: EnergyType;
  consumption: number;
  baseMonthlyKm: number;
  energyPrice: number;
  annualInsurance: number;
  annualRegistration: number;
  annualFixedCosts: number;
  estimatedValue: number;
  annualDepreciationPercent: number;
  trips: Trip[];
  maintenanceItems: MaintenanceItem[];
}

export interface FuelLog {
  id: string;
  date: string;
  odometerKm: number;
  energyUnits: number;
  totalCost: number;
  fullRefill: boolean;
  station: string;
  notes: string;
}

export interface MaintenanceRecord {
  id: string;
  date: string;
  itemName: string;
  category: MaintenanceCategory;
  cost: number;
  odometerKm: number;
  notes: string;
}

export interface GarageVehicle extends Vehicle {
  currentOdometerKm: number;
  fuelLogs: FuelLog[];
  maintenanceRecords: MaintenanceRecord[];
}

export interface GlobalAssumptions {
  updatedAt: string;
  annualKmReference: number;
  gasolinePrice: number;
  dieselPrice: number;
  electricityPrice: number;
  analysisHorizonYears: number;
  discountRatePercent: number;
}

export interface AppData {
  comparisonVehicles: Vehicle[];
  garageVehicles: GarageVehicle[];
  assumptions: GlobalAssumptions;
}

export interface ItemAnnualCostResult {
  annualCost: number;
  costByKm: number;
  costByTime: number;
}

export interface FuelLogMetrics {
  averageEfficiency: number | null;
  totalDistanceKm: number;
  totalEnergyUnits: number;
  totalSpent: number;
  validSegments: number;
  latestOdometerKm: number;
}

export interface CostBreakdown {
  annualKm: number;
  annualEnergyUnits: number;
  annualEnergyCost: number;
  maintenance: number;
  wear: number;
  contingency: number;
  electricSpecific: number;
  fixedItems: number;
  fixedCosts: number;
  depreciation: number;
  itemsTotal: number;
  annualTotal: number;
  monthlyTotal: number;
  costPerKm: number;
  percentages: Record<
    'energia' | 'mantenimiento' | 'desgaste' | 'contingencia' | 'fijos' | 'depreciacion',
    number
  >;
}

export interface VehicleItemResult {
  item: MaintenanceItem;
  annualCost: number;
}

export interface VehicleResult {
  vehicle: Vehicle;
  breakdown: CostBreakdown;
  itemResults: VehicleItemResult[];
  alerts: string[];
}

export interface ComparisonResult {
  cheapestAnnualId?: string;
  lowestCostPerKmId?: string;
  lowestEnergyCostId?: string;
  highestMaintenanceId?: string;
  annualDifferences: Record<string, number>;
  annualRanking: VehicleResult[];
}

export interface ImportPayload {
  version: 2;
  exportedAt: string;
  data: AppData;
}
