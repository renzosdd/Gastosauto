import { ReactNode } from 'react';

import { getEnergyLabel, getEnergyPriceLabel, getEnergyTypeLabel } from '@/lib/format';
import { EnergyType, Vehicle } from '@/types';

interface VehicleFormProps {
  vehicle: Vehicle;
  onChange: (patch: Partial<Vehicle>) => void;
  onEnergyTypeChange: (energyType: EnergyType) => void;
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="space-y-2">
      <span className="field-label">{label}</span>
      {children}
    </label>
  );
}

export function VehicleForm({ vehicle, onChange, onEnergyTypeChange }: VehicleFormProps) {
  return (
    <div className="panel space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="section-kicker">Ficha tecnica</p>
          <h3 className="section-title">Parametros del vehiculo</h3>
        </div>
        <span className="mono-pill">{getEnergyTypeLabel(vehicle.energyType)}</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Field label="Nombre">
          <input
            className="field-input"
            value={vehicle.name}
            onChange={(event) => onChange({ name: event.target.value })}
          />
        </Field>

        <Field label="Marca">
          <input
            className="field-input"
            value={vehicle.brand}
            onChange={(event) => onChange({ brand: event.target.value })}
          />
        </Field>

        <Field label="Modelo">
          <input
            className="field-input"
            value={vehicle.model}
            onChange={(event) => onChange({ model: event.target.value })}
          />
        </Field>

        <Field label="Ano">
          <input
            className="field-input"
            type="number"
            value={vehicle.year}
            onChange={(event) => onChange({ year: Number(event.target.value) || 0 })}
          />
        </Field>

        <Field label="Tipo de energia">
          <select
            className="field-input"
            value={vehicle.energyType}
            onChange={(event) => onEnergyTypeChange(event.target.value as EnergyType)}
          >
            <option value="nafta">Nafta</option>
            <option value="gasoil">Gasoil</option>
            <option value="electrico">Electrico</option>
          </select>
        </Field>

        <Field label={getEnergyLabel(vehicle.energyType)}>
          <input
            className="field-input"
            type="number"
            step="0.1"
            value={vehicle.consumption}
            onChange={(event) => onChange({ consumption: Number(event.target.value) || 0 })}
          />
        </Field>

        <Field label="Km mensuales base">
          <input
            className="field-input"
            type="number"
            step="1"
            value={vehicle.baseMonthlyKm}
            onChange={(event) => onChange({ baseMonthlyKm: Number(event.target.value) || 0 })}
          />
        </Field>

        <Field label={getEnergyPriceLabel(vehicle.energyType)}>
          <input
            className="field-input"
            type="number"
            step="0.01"
            value={vehicle.energyPrice}
            onChange={(event) => onChange({ energyPrice: Number(event.target.value) || 0 })}
          />
        </Field>

        <Field label="Seguro anual">
          <input
            className="field-input"
            type="number"
            value={vehicle.annualInsurance}
            onChange={(event) => onChange({ annualInsurance: Number(event.target.value) || 0 })}
          />
        </Field>

        <Field label="Patente anual">
          <input
            className="field-input"
            type="number"
            value={vehicle.annualRegistration}
            onChange={(event) => onChange({ annualRegistration: Number(event.target.value) || 0 })}
          />
        </Field>

        <Field label="Otros costos fijos anuales">
          <input
            className="field-input"
            type="number"
            value={vehicle.annualFixedCosts}
            onChange={(event) => onChange({ annualFixedCosts: Number(event.target.value) || 0 })}
          />
        </Field>

        <Field label="Valor estimado del vehiculo">
          <input
            className="field-input"
            type="number"
            value={vehicle.estimatedValue}
            onChange={(event) => onChange({ estimatedValue: Number(event.target.value) || 0 })}
          />
        </Field>

        <Field label="Depreciacion anual %">
          <input
            className="field-input"
            type="number"
            step="0.1"
            value={vehicle.annualDepreciationPercent}
            onChange={(event) =>
              onChange({ annualDepreciationPercent: Number(event.target.value) || 0 })
            }
          />
        </Field>
      </div>
    </div>
  );
}
