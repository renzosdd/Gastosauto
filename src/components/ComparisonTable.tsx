import { ArrowDown, ArrowUp, Zap } from 'lucide-react';

import { ComparisonResult, VehicleResult } from '@/types';
import { formatCurrency, formatDecimal, formatNumber, getEnergyTypeLabel, getEnergyUnitName } from '@/lib/format';

interface ComparisonTableProps {
  results: VehicleResult[];
  comparison: ComparisonResult;
}

function highlightClass(active: boolean): string {
  return active ? 'bg-emerald-500/10 text-emerald-100 ring-1 ring-emerald-400/20' : '';
}

interface MetricRow {
  label: string;
  value: (result: VehicleResult) => string;
  isBest: (result: VehicleResult) => boolean;
  invertBadge?: boolean;
}

export function ComparisonTable({ results, comparison }: ComparisonTableProps) {
  const metricRows: MetricRow[] = [
    {
      label: 'Total anual',
      value: (result: VehicleResult) => formatCurrency(result.breakdown.annualTotal),
      isBest: (result: VehicleResult) => result.vehicle.id === comparison.cheapestAnnualId,
    },
    {
      label: 'Total mensual',
      value: (result: VehicleResult) => formatCurrency(result.breakdown.monthlyTotal),
      isBest: () => false,
    },
    {
      label: 'Costo por km',
      value: (result: VehicleResult) => `$${formatDecimal(result.breakdown.costPerKm)}`,
      isBest: (result: VehicleResult) => result.vehicle.id === comparison.lowestCostPerKmId,
    },
    {
      label: 'Energia anual',
      value: (result: VehicleResult) => formatCurrency(result.breakdown.annualEnergyCost),
      isBest: (result: VehicleResult) => result.vehicle.id === comparison.lowestEnergyCostId,
    },
    {
      label: 'Mantenimiento anual',
      value: (result: VehicleResult) =>
        formatCurrency(
          result.breakdown.maintenance + result.breakdown.wear + result.breakdown.electricSpecific,
        ),
      isBest: (result: VehicleResult) => result.vehicle.id === comparison.highestMaintenanceId,
      invertBadge: true,
    },
    {
      label: 'Contingencia anual',
      value: (result: VehicleResult) => formatCurrency(result.breakdown.contingency),
      isBest: () => false,
    },
    {
      label: 'Costos fijos',
      value: (result: VehicleResult) => formatCurrency(result.breakdown.fixedCosts),
      isBest: () => false,
    },
    {
      label: 'Depreciacion',
      value: (result: VehicleResult) => formatCurrency(result.breakdown.depreciation),
      isBest: () => false,
    },
    {
      label: 'Km anuales',
      value: (result: VehicleResult) => formatNumber(result.breakdown.annualKm),
      isBest: () => false,
    },
    {
      label: 'Unidades de energia',
      value: (result: VehicleResult) =>
        `${formatNumber(result.breakdown.annualEnergyUnits)} ${getEnergyUnitName(result.vehicle.energyType).replace(' anuales', '')}`,
      isBest: () => false,
    },
  ];

  return (
    <section className="panel space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="section-kicker">Vista comparativa</p>
          <h2 className="section-title">Comparacion lado a lado</h2>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-500/5 px-3 py-2 text-xs text-cyan-100">
          <Zap className="h-4 w-4" />
          Mejor anual: {comparison.annualRanking[0]?.vehicle.name ?? 'Sin datos'}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="data-table min-w-[900px]">
          <thead>
            <tr>
              <th>Metrica</th>
              {results.map((result) => (
                <th key={result.vehicle.id}>
                    <div className="space-y-1">
                      <div className="font-semibold text-zinc-100">{result.vehicle.name}</div>
                      <div className="text-xs text-zinc-400">
                        {result.vehicle.brand} {result.vehicle.model} - {getEnergyTypeLabel(result.vehicle.energyType)}
                      </div>
                    </div>
                  </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metricRows.map((row) => (
              <tr key={row.label}>
                <td className="font-medium text-zinc-300">{row.label}</td>
                {results.map((result) => {
                  const active = row.isBest(result);
                  const delta = comparison.annualDifferences[result.vehicle.id];
                  const showDelta = row.label === 'Total anual' && delta > 0;

                  return (
                    <td key={`${row.label}-${result.vehicle.id}`} className={highlightClass(active)}>
                      <div className="space-y-1">
                        <div className="font-semibold text-zinc-100">{row.value(result)}</div>
                        {showDelta ? (
                          <div className="inline-flex items-center gap-1 text-xs text-rose-200">
                            <ArrowUp className="h-3.5 w-3.5" />
                            +{formatCurrency(delta, true)}
                          </div>
                        ) : null}
                        {row.label === 'Total anual' && delta === 0 ? (
                          <div className="inline-flex items-center gap-1 text-xs text-emerald-200">
                            <ArrowDown className="h-3.5 w-3.5" />
                            Base de referencia
                          </div>
                        ) : null}
                        {active && row.invertBadge ? (
                          <div className="text-xs text-amber-200">Mayor gasto de mantenimiento</div>
                        ) : null}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
