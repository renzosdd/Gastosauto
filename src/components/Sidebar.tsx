import {
  CarFront,
  ClipboardList,
  Fuel,
  Gauge,
  Shield,
  SlidersHorizontal,
  Wrench,
} from 'lucide-react';

import { AppPage, GlobalAssumptions } from '@/types';
import { formatDate, formatNumber, getAppPageLabel } from '@/lib/format';

interface SidebarProps {
  activePage: AppPage;
  onPageChange: (page: AppPage) => void;
  assumptions: GlobalAssumptions;
}

const navItems: Array<{ page: AppPage; icon: React.ComponentType<{ className?: string }> }> = [
  { page: 'resumen', icon: Gauge },
  { page: 'comparador', icon: SlidersHorizontal },
  { page: 'mis-vehiculos', icon: CarFront },
  { page: 'supuestos', icon: ClipboardList },
];

const quickLinks = [
  { label: 'Mantenimiento', icon: Wrench },
  { label: 'Energia', icon: Fuel },
  { label: 'Coberturas', icon: Shield },
];

export function Sidebar({ activePage, onPageChange, assumptions }: SidebarProps) {
  return (
    <aside className="sidebar-shell">
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-100">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-semibold tracking-tight text-zinc-50">Costo Auto</div>
              <div className="text-xs uppercase tracking-[0.28em] text-cyan-300">Uruguay</div>
            </div>
          </div>
          <p className="text-sm leading-6 text-zinc-400">
            Panel tecnico para costos, mantenimiento y rendimiento observado.
          </p>
        </div>

        <nav className="space-y-2">
          {navItems.map(({ page, icon: Icon }) => {
            const isActive = activePage === page;

            return (
              <button
                key={page}
                className={`sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
                type="button"
                onClick={() => onPageChange(page)}
              >
                <Icon className="h-4 w-4" />
                {getAppPageLabel(page)}
              </button>
            );
          })}
        </nav>

        <div className="space-y-3">
          <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-600">Focos rapidos</p>
          <div className="space-y-2">
            {quickLinks.map(({ label, icon: Icon }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-zinc-300"
              >
                <Icon className="h-4 w-4 text-zinc-500" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[26px] border border-white/10 bg-white/5 p-4">
        <p className="text-sm font-medium text-zinc-100">Perfil de uso</p>
        <div className="mt-4 space-y-3 text-sm text-zinc-400">
          <div className="flex items-center justify-between gap-3">
            <span>Kilometraje anual</span>
            <span className="text-zinc-100">{formatNumber(assumptions.annualKmReference)} km</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span>Energia base</span>
            <span className="text-zinc-100">{formatDate(assumptions.updatedAt)}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span>Horizonte</span>
            <span className="text-zinc-100">{assumptions.analysisHorizonYears} anios</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
