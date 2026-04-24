import { EnergyType, MaintenanceCategory } from '@/types';

const currencyFormatter = new Intl.NumberFormat('es-UY', {
  style: 'currency',
  currency: 'UYU',
  maximumFractionDigits: 0,
});

const compactCurrencyFormatter = new Intl.NumberFormat('es-UY', {
  style: 'currency',
  currency: 'UYU',
  notation: 'compact',
  maximumFractionDigits: 1,
});

const numberFormatter = new Intl.NumberFormat('es-UY', {
  maximumFractionDigits: 0,
});

const decimalFormatter = new Intl.NumberFormat('es-UY', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat('es-UY', {
  style: 'percent',
  maximumFractionDigits: 0,
});

export function formatCurrency(value: number, compact = false): string {
  return compact ? compactCurrencyFormatter.format(value) : currencyFormatter.format(value);
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function formatDecimal(value: number): string {
  return decimalFormatter.format(value);
}

export function formatPercent(value: number): string {
  return percentFormatter.format(value);
}

export function getEnergyLabel(energyType: EnergyType): string {
  if (energyType === 'electrico') {
    return 'kWh/100 km';
  }

  return 'km/L';
}

export function getEnergyUnitName(energyType: EnergyType): string {
  return energyType === 'electrico' ? 'kWh anuales' : 'litros anuales';
}

export function getEnergyPriceLabel(energyType: EnergyType): string {
  return energyType === 'electrico' ? '$/kWh' : '$/litro';
}

export function getEnergyTypeLabel(energyType: EnergyType): string {
  return {
    nafta: 'Nafta',
    gasoil: 'Gasoil',
    electrico: 'Electrico',
  }[energyType];
}

export function getEnergyTone(energyType: EnergyType): string {
  return {
    nafta: 'bg-amber-500/15 text-amber-200 ring-amber-400/25',
    gasoil: 'bg-sky-500/15 text-sky-200 ring-sky-400/25',
    electrico: 'bg-emerald-500/15 text-emerald-200 ring-emerald-400/25',
  }[energyType];
}

export function getCategoryLabel(category: MaintenanceCategory): string {
  return {
    mantenimiento: 'Mantenimiento',
    desgaste: 'Desgaste',
    contingencia: 'Contingencia',
    electrico: 'Electrico',
    fijo: 'Fijo',
  }[category];
}

export function getCategoryTone(category: MaintenanceCategory): string {
  return {
    mantenimiento: 'bg-cyan-500/10 text-cyan-200 ring-cyan-400/25',
    desgaste: 'bg-indigo-500/10 text-indigo-200 ring-indigo-400/25',
    contingencia: 'bg-rose-500/10 text-rose-200 ring-rose-400/25',
    electrico: 'bg-emerald-500/10 text-emerald-200 ring-emerald-400/25',
    fijo: 'bg-zinc-500/15 text-zinc-200 ring-white/10',
  }[category];
}
