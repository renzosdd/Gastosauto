import { Plus, Trash2 } from 'lucide-react';

import { createId } from '@/lib/id';
import { formatCurrency, formatDate, formatObservedEfficiency, getFuelLogUnitLabel } from '@/lib/format';
import { EnergyType, FuelLog, FuelLogMetrics } from '@/types';

interface FuelLogTableProps {
  energyType: EnergyType;
  logs: FuelLog[];
  metrics: FuelLogMetrics;
  onChange: (logs: FuelLog[]) => void;
}

export function FuelLogTable({ energyType, logs, metrics, onChange }: FuelLogTableProps) {
  const sortedLogs = [...logs].sort((first, second) => second.odometerKm - first.odometerKm);

  const updateLog = (logId: string, patch: Partial<FuelLog>) => {
    onChange(logs.map((log) => (log.id === logId ? { ...log, ...patch } : log)));
  };

  const addLog = () => {
    onChange([
      ...logs,
      {
        id: createId('fuel'),
        date: new Date().toISOString().slice(0, 10),
        odometerKm: metrics.latestOdometerKm || 0,
        energyUnits: 0,
        totalCost: 0,
        fullRefill: true,
        station: '',
        notes: '',
      },
    ]);
  };

  const removeLog = (logId: string) => {
    onChange(logs.filter((log) => log.id !== logId));
  };

  return (
    <div className="panel space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="section-kicker">Rendimiento observado</p>
          <h3 className="section-title">Cargas y kilometraje</h3>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="rounded-2xl border border-emerald-400/15 bg-emerald-500/5 px-4 py-3">
            <div className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">Promedio real</div>
            <div className="mt-2 text-lg font-semibold text-emerald-100">
              {formatObservedEfficiency(metrics.averageEfficiency, energyType)}
            </div>
          </div>
          <button className="action-button" type="button" onClick={addLog}>
            <Plus className="h-4 w-4" />
            Registrar carga
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">Distancia medida</div>
          <div className="mt-2 text-lg font-semibold text-zinc-50">{metrics.totalDistanceKm.toLocaleString('es-UY')} km</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">Energia registrada</div>
          <div className="mt-2 text-lg font-semibold text-zinc-50">
            {metrics.totalEnergyUnits.toLocaleString('es-UY')} {energyType === 'electrico' ? 'kWh' : 'L'}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">Gasto acumulado</div>
          <div className="mt-2 text-lg font-semibold text-zinc-50">{formatCurrency(metrics.totalSpent)}</div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="data-table min-w-[980px]">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Odometro</th>
              <th>{getFuelLogUnitLabel(energyType)}</th>
              <th>Costo</th>
              <th>Tanque/carga completa</th>
              <th>Estacion</th>
              <th>Notas</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sortedLogs.map((log) => (
              <tr key={log.id}>
                <td>
                  <input
                    className="table-input"
                    type="date"
                    value={log.date}
                    onChange={(event) => updateLog(log.id, { date: event.target.value })}
                    aria-label={`Fecha de carga ${formatDate(log.date)}`}
                  />
                </td>
                <td>
                  <input
                    className="table-input"
                    type="number"
                    value={log.odometerKm}
                    onChange={(event) =>
                      updateLog(log.id, { odometerKm: Number(event.target.value) || 0 })
                    }
                  />
                </td>
                <td>
                  <input
                    className="table-input"
                    type="number"
                    step="0.1"
                    value={log.energyUnits}
                    onChange={(event) =>
                      updateLog(log.id, { energyUnits: Number(event.target.value) || 0 })
                    }
                  />
                </td>
                <td>
                  <input
                    className="table-input"
                    type="number"
                    step="0.01"
                    value={log.totalCost}
                    onChange={(event) =>
                      updateLog(log.id, { totalCost: Number(event.target.value) || 0 })
                    }
                  />
                </td>
                <td>
                  <label className="inline-flex items-center gap-2 text-sm text-zinc-300">
                    <input
                      className="h-4 w-4 accent-cyan-400"
                      type="checkbox"
                      checked={log.fullRefill}
                      onChange={(event) => updateLog(log.id, { fullRefill: event.target.checked })}
                    />
                    Completa
                  </label>
                </td>
                <td>
                  <input
                    className="table-input"
                    value={log.station}
                    onChange={(event) => updateLog(log.id, { station: event.target.value })}
                  />
                </td>
                <td>
                  <input
                    className="table-input"
                    value={log.notes}
                    onChange={(event) => updateLog(log.id, { notes: event.target.value })}
                  />
                </td>
                <td className="text-right">
                  <button
                    className="icon-button"
                    type="button"
                    onClick={() => removeLog(log.id)}
                    aria-label="Eliminar carga"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
