import { ReactNode } from 'react';
import { BarChart3, Gauge, ListOrdered, TriangleAlert } from 'lucide-react';

import { ComparisonResult, VehicleResult } from '@/types';
import { formatCurrency, formatDecimal, formatPercent } from '@/lib/format';

interface DashboardProps {
  results: VehicleResult[];
  comparison: ComparisonResult;
}

function InsightCard({
  title,
  value,
  detail,
  icon,
}: {
  title: string;
  value: string;
  detail: string;
  icon: ReactNode;
}) {
  return (
    <div className="metric-card min-h-[152px]">
      <div className="metric-icon">{icon}</div>
      <p className="metric-label">{title}</p>
      <p className="metric-value">{value}</p>
      <p className="text-sm text-zinc-400">{detail}</p>
    </div>
  );
}

export function Dashboard({ results, comparison }: DashboardProps) {
  const averageMonthly =
    results.reduce((total, result) => total + result.breakdown.monthlyTotal, 0) / (results.length || 1);
  const averageCostPerKm =
    results.reduce((total, result) => total + result.breakdown.costPerKm, 0) / (results.length || 1);
  const allAlerts = results.flatMap((result) =>
    result.alerts.map((alert) => ({ vehicleName: result.vehicle.name, alert })),
  );

  return (
    <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <InsightCard
            title="Escenario lider"
            value={comparison.annualRanking[0]?.vehicle.name ?? 'N/D'}
            detail={
              comparison.annualRanking[0]
                ? `${formatCurrency(comparison.annualRanking[0].breakdown.annualTotal)} al anio`
                : 'Sin datos'
            }
            icon={<ListOrdered className="h-5 w-5" />}
          />
          <InsightCard
            title="Mensual promedio"
            value={formatCurrency(averageMonthly)}
            detail="Promedio de todos los vehiculos cargados"
            icon={<Gauge className="h-5 w-5" />}
          />
          <InsightCard
            title="Costo medio por km"
            value={`$${formatDecimal(averageCostPerKm)}`}
            detail="Referencia util para escenarios mixtos"
            icon={<BarChart3 className="h-5 w-5" />}
          />
          <InsightCard
            title="Alertas tecnicas"
            value={String(allAlerts.length)}
            detail="Se generan automaticamente segun el peso de cada rubro"
            icon={<TriangleAlert className="h-5 w-5" />}
          />
        </div>

        <div className="panel space-y-4">
          <div>
            <p className="section-kicker">Detalle por vehiculo</p>
            <h2 className="section-title">Dashboard tecnico</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="data-table min-w-[920px]">
              <thead>
                <tr>
                  <th>Vehiculo</th>
                  <th>Total anual</th>
                  <th>Energia</th>
                  <th>Mantenimiento</th>
                  <th>Desgaste</th>
                  <th>Contingencia</th>
                  <th>Fijos</th>
                  <th>Depreciacion</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr key={result.vehicle.id}>
                    <td>
                      <div className="font-medium text-zinc-100">{result.vehicle.name}</div>
                      <div className="text-xs text-zinc-400">
                        {result.vehicle.brand} {result.vehicle.model}
                      </div>
                    </td>
                    <td>{formatCurrency(result.breakdown.annualTotal)}</td>
                    <td>{formatCurrency(result.breakdown.annualEnergyCost)}</td>
                    <td>{formatCurrency(result.breakdown.maintenance + result.breakdown.electricSpecific)}</td>
                    <td>{formatCurrency(result.breakdown.wear)}</td>
                    <td>{formatCurrency(result.breakdown.contingency)}</td>
                    <td>{formatCurrency(result.breakdown.fixedCosts)}</td>
                    <td>{formatCurrency(result.breakdown.depreciation)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel space-y-4">
          <div>
            <p className="section-kicker">Desglose agregado</p>
            <h2 className="section-title">Peso porcentual de categorias</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {results.map((result) => (
              <div key={result.vehicle.id} className="rounded-2xl border border-white/8 bg-white/3 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <p className="font-medium text-zinc-100">{result.vehicle.name}</p>
                  <span className="text-xs text-zinc-400">
                    {formatCurrency(result.breakdown.annualTotal, true)}
                  </span>
                </div>
                <div className="space-y-3">
                  {Object.entries(result.breakdown.percentages).map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-zinc-400">
                        <span className="capitalize">{key}</span>
                        <span>{formatPercent(value)}</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/5">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                          style={{ width: `${Math.max(value * 100, 2)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="panel space-y-4">
          <div>
            <p className="section-kicker">Ranking</p>
            <h2 className="section-title">Costo anual</h2>
          </div>
          <div className="space-y-3">
            {comparison.annualRanking.map((result, index) => (
              <div
                key={result.vehicle.id}
                className="rounded-2xl border border-white/8 bg-white/3 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">
                      #{index + 1}
                    </div>
                    <div className="font-medium text-zinc-100">{result.vehicle.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-zinc-50">
                      {formatCurrency(result.breakdown.annualTotal)}
                    </div>
                    <div className="text-xs text-zinc-400">
                      ${formatDecimal(result.breakdown.costPerKm)}/km
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel space-y-4">
          <div>
            <p className="section-kicker">Alertas</p>
            <h2 className="section-title">Lecturas tecnicas</h2>
          </div>
          <div className="space-y-3">
            {allAlerts.length === 0 ? (
              <div className="rounded-2xl border border-white/8 bg-white/3 p-4 text-sm text-zinc-400">
                Sin alertas disparadas con los valores actuales.
              </div>
            ) : (
              allAlerts.map((entry, index) => (
                <div
                  key={`${entry.vehicleName}-${index}`}
                  className="rounded-2xl border border-amber-400/15 bg-amber-500/5 p-4 text-sm text-zinc-300"
                >
                  <span className="font-medium text-amber-100">{entry.vehicleName}:</span> {entry.alert}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
