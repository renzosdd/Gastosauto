import { ReactNode } from 'react';
import { BadgeDollarSign, BatteryCharging, Gauge, Wrench } from 'lucide-react';

import { formatCurrency, formatDecimal, formatNumber, formatPercent } from '@/lib/format';
import { VehicleResult } from '@/types';

interface CostSummaryProps {
  result: VehicleResult;
}

const categoryBars = [
  { key: 'energia', label: 'Energia', tone: 'from-cyan-400 to-sky-500' },
  { key: 'mantenimiento', label: 'Mant./EV', tone: 'from-emerald-400 to-green-500' },
  { key: 'desgaste', label: 'Desgaste', tone: 'from-indigo-400 to-indigo-600' },
  { key: 'contingencia', label: 'Contingencia', tone: 'from-rose-400 to-rose-600' },
  { key: 'fijos', label: 'Fijos', tone: 'from-zinc-300 to-zinc-500' },
  { key: 'depreciacion', label: 'Depreciacion', tone: 'from-amber-300 to-amber-500' },
] as const;

function Metric({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="metric-card">
      <div className="metric-icon">{icon}</div>
      <p className="metric-label">{label}</p>
      <p className="metric-value">{value}</p>
    </div>
  );
}

export function CostSummary({ result }: CostSummaryProps) {
  const maintenanceTotal =
    result.breakdown.maintenance + result.breakdown.wear + result.breakdown.electricSpecific;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Total anual"
          value={formatCurrency(result.breakdown.annualTotal)}
          icon={<BadgeDollarSign className="h-5 w-5" />}
        />
        <Metric
          label="Mensual"
          value={formatCurrency(result.breakdown.monthlyTotal)}
          icon={<Gauge className="h-5 w-5" />}
        />
        <Metric
          label="Costo por km"
          value={`$${formatDecimal(result.breakdown.costPerKm)}`}
          icon={<BatteryCharging className="h-5 w-5" />}
        />
        <Metric
          label="Mantenimiento"
          value={formatCurrency(maintenanceTotal)}
          icon={<Wrench className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-zinc-100">Peso por categoria</p>
            <span className="text-xs text-zinc-400">{formatNumber(result.breakdown.annualKm)} km/a</span>
          </div>
          <div className="mt-4 space-y-3">
            {categoryBars.map((bar) => (
              <div key={bar.key} className="space-y-1">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>{bar.label}</span>
                  <span>{formatPercent(result.breakdown.percentages[bar.key])}</span>
                </div>
                <div className="h-2 rounded-full bg-white/5">
                  <div
                    className={`h-2 rounded-full bg-gradient-to-r ${bar.tone}`}
                    style={{ width: `${Math.max(result.breakdown.percentages[bar.key] * 100, 3)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-medium text-zinc-100">Lectura rapida</p>
          <div className="mt-4 space-y-3 text-sm text-zinc-300">
            <div className="rounded-2xl border border-cyan-400/15 bg-cyan-500/5 p-3">
              Energia anual: <span className="font-medium text-zinc-50">{formatCurrency(result.breakdown.annualEnergyCost)}</span>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              Fijos + patente + seguro: <span className="font-medium text-zinc-50">{formatCurrency(result.breakdown.fixedCosts)}</span>
            </div>
            <div className="rounded-2xl border border-amber-400/15 bg-amber-500/5 p-3">
              Depreciacion: <span className="font-medium text-zinc-50">{formatCurrency(result.breakdown.depreciation)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
