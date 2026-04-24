import { GlobalAssumptions } from '@/types';
import { formatDate } from '@/lib/format';

interface AssumptionsPanelProps {
  assumptions: GlobalAssumptions;
  onChange: (patch: Partial<GlobalAssumptions>) => void;
}

export function AssumptionsPanel({ assumptions, onChange }: AssumptionsPanelProps) {
  return (
    <div className="panel space-y-5">
      <div>
        <p className="section-kicker">Base de referencia</p>
        <h2 className="section-title">Supuestos principales</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <label className="space-y-2">
          <span className="field-label">Fecha de actualizacion</span>
          <input
            className="field-input"
            type="date"
            value={assumptions.updatedAt}
            onChange={(event) => onChange({ updatedAt: event.target.value })}
          />
        </label>
        <label className="space-y-2">
          <span className="field-label">Km anuales referencia</span>
          <input
            className="field-input"
            type="number"
            value={assumptions.annualKmReference}
            onChange={(event) => onChange({ annualKmReference: Number(event.target.value) || 0 })}
          />
        </label>
        <label className="space-y-2">
          <span className="field-label">Precio nafta</span>
          <input
            className="field-input"
            type="number"
            step="0.01"
            value={assumptions.gasolinePrice}
            onChange={(event) => onChange({ gasolinePrice: Number(event.target.value) || 0 })}
          />
        </label>
        <label className="space-y-2">
          <span className="field-label">Precio gasoil</span>
          <input
            className="field-input"
            type="number"
            step="0.01"
            value={assumptions.dieselPrice}
            onChange={(event) => onChange({ dieselPrice: Number(event.target.value) || 0 })}
          />
        </label>
        <label className="space-y-2">
          <span className="field-label">Precio electricidad</span>
          <input
            className="field-input"
            type="number"
            step="0.01"
            value={assumptions.electricityPrice}
            onChange={(event) => onChange({ electricityPrice: Number(event.target.value) || 0 })}
          />
        </label>
        <label className="space-y-2">
          <span className="field-label">Horizonte de analisis</span>
          <input
            className="field-input"
            type="number"
            value={assumptions.analysisHorizonYears}
            onChange={(event) =>
              onChange({ analysisHorizonYears: Number(event.target.value) || 0 })
            }
          />
        </label>
        <label className="space-y-2">
          <span className="field-label">Tasa de descuento %</span>
          <input
            className="field-input"
            type="number"
            step="0.1"
            value={assumptions.discountRatePercent}
            onChange={(event) =>
              onChange({ discountRatePercent: Number(event.target.value) || 0 })
            }
          />
        </label>
      </div>

      <div className="rounded-2xl border border-cyan-400/10 bg-cyan-500/5 p-4 text-sm text-zinc-300">
        Ultima referencia cargada: <span className="font-medium text-cyan-100">{formatDate(assumptions.updatedAt)}</span>
      </div>
    </div>
  );
}
