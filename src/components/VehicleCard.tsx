import { BatteryCharging, Copy, Fuel, Trash2 } from 'lucide-react';

import { CostSummary } from '@/components/CostSummary';
import { MaintenanceTable } from '@/components/MaintenanceTable';
import { TripsEditor } from '@/components/TripsEditor';
import { VehicleForm } from '@/components/VehicleForm';
import { formatCurrency, formatNumber, getEnergyTone, getEnergyTypeLabel, getEnergyUnitName } from '@/lib/format';
import { EnergyType, Vehicle, VehicleResult } from '@/types';

interface VehicleCardProps {
  vehicle: Vehicle;
  result: VehicleResult;
  onChange: (patch: Partial<Vehicle>) => void;
  onEnergyTypeChange: (energyType: EnergyType) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function VehicleCard({
  vehicle,
  result,
  onChange,
  onEnergyTypeChange,
  onDuplicate,
  onDelete,
}: VehicleCardProps) {
  return (
    <article className="card-shell space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ring-1 ${getEnergyTone(vehicle.energyType)}`}>
            {vehicle.energyType === 'electrico' ? (
              <BatteryCharging className="h-4 w-4" />
            ) : (
              <Fuel className="h-4 w-4" />
            )}
            {getEnergyTypeLabel(vehicle.energyType)}
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-50">{vehicle.name}</h2>
            <p className="text-sm text-zinc-400">
              {vehicle.brand} {vehicle.model} - {vehicle.year}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
            <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">Uso anual</div>
            <div className="text-lg font-semibold text-zinc-50">{formatNumber(result.breakdown.annualKm)} km</div>
            <div className="text-xs text-zinc-400">
              {formatNumber(result.breakdown.annualEnergyUnits)} {getEnergyUnitName(vehicle.energyType)}
            </div>
          </div>
          <div className="rounded-2xl border border-cyan-400/10 bg-cyan-500/5 px-4 py-3">
            <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">Total anual</div>
            <div className="text-lg font-semibold text-cyan-100">
              {formatCurrency(result.breakdown.annualTotal)}
            </div>
            <div className="text-xs text-zinc-400">
              {formatCurrency(result.breakdown.monthlyTotal)}/mes
            </div>
          </div>
          <button className="action-button" type="button" onClick={onDuplicate}>
            <Copy className="h-4 w-4" />
            Duplicar
          </button>
          <button className="action-button" type="button" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
            Eliminar
          </button>
        </div>
      </div>

      <CostSummary result={result} />

      <VehicleForm
        vehicle={vehicle}
        onChange={onChange}
        onEnergyTypeChange={onEnergyTypeChange}
      />

      <TripsEditor
        trips={vehicle.trips}
        onChange={(trips) => onChange({ trips })}
      />

      <MaintenanceTable
        items={vehicle.maintenanceItems}
        annualKm={result.breakdown.annualKm}
        energyType={vehicle.energyType}
        onChange={(maintenanceItems) => onChange({ maintenanceItems })}
      />
    </article>
  );
}
