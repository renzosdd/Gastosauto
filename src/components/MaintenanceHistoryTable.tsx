import { Plus, Trash2 } from 'lucide-react';

import { createId } from '@/lib/id';
import { formatCurrency, formatDate, getCategoryLabel, getCategoryTone } from '@/lib/format';
import { MaintenanceRecord } from '@/types';

interface MaintenanceHistoryTableProps {
  records: MaintenanceRecord[];
  onChange: (records: MaintenanceRecord[]) => void;
}

export function MaintenanceHistoryTable({
  records,
  onChange,
}: MaintenanceHistoryTableProps) {
  const sortedRecords = [...records].sort((first, second) => {
    if (first.date === second.date) {
      return second.odometerKm - first.odometerKm;
    }

    return second.date.localeCompare(first.date);
  });

  const updateRecord = (recordId: string, patch: Partial<MaintenanceRecord>) => {
    onChange(records.map((record) => (record.id === recordId ? { ...record, ...patch } : record)));
  };

  const addRecord = () => {
    onChange([
      ...records,
      {
        id: createId('service'),
        date: new Date().toISOString().slice(0, 10),
        itemName: 'Nuevo mantenimiento',
        category: 'mantenimiento',
        cost: 0,
        odometerKm: 0,
        notes: '',
      },
    ]);
  };

  const removeRecord = (recordId: string) => {
    onChange(records.filter((record) => record.id !== recordId));
  };

  return (
    <div className="panel space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="section-kicker">Timeline</p>
          <h3 className="section-title">Mantenimientos realizados</h3>
        </div>
        <button className="action-button" type="button" onClick={addRecord}>
          <Plus className="h-4 w-4" />
          Registrar mantenimiento
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">Eventos</div>
          <div className="mt-2 text-lg font-semibold text-zinc-50">{records.length}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">Costo acumulado</div>
          <div className="mt-2 text-lg font-semibold text-zinc-50">
            {formatCurrency(records.reduce((total, record) => total + record.cost, 0))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">Ultimo registro</div>
          <div className="mt-2 text-lg font-semibold text-zinc-50">
            {sortedRecords[0] ? formatDate(sortedRecords[0].date) : 'Sin datos'}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">Ultimo kilometraje</div>
          <div className="mt-2 text-lg font-semibold text-zinc-50">
            {sortedRecords[0] ? `${sortedRecords[0].odometerKm.toLocaleString('es-UY')} km` : 'Sin datos'}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {sortedRecords.map((record) => (
          <div
            key={record.id}
            className="rounded-[26px] border border-white/10 bg-white/5 p-4"
          >
            <div className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr_0.8fr_1fr_auto]">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    className="field-input"
                    value={record.itemName}
                    onChange={(event) => updateRecord(record.id, { itemName: event.target.value })}
                  />
                  <span className={`inline-flex rounded-full px-2 py-1 text-[11px] ring-1 ${getCategoryTone(record.category)}`}>
                    {getCategoryLabel(record.category)}
                  </span>
                </div>
                <input
                  className="field-input"
                  value={record.notes}
                  placeholder="Notas tecnicas"
                  onChange={(event) => updateRecord(record.id, { notes: event.target.value })}
                />
              </div>
              <label className="space-y-2">
                <span className="field-label">Fecha</span>
                <input
                  className="field-input"
                  type="date"
                  value={record.date}
                  onChange={(event) => updateRecord(record.id, { date: event.target.value })}
                />
              </label>
              <label className="space-y-2">
                <span className="field-label">Km</span>
                <input
                  className="field-input"
                  type="number"
                  value={record.odometerKm}
                  onChange={(event) =>
                    updateRecord(record.id, { odometerKm: Number(event.target.value) || 0 })
                  }
                />
              </label>
              <label className="space-y-2">
                <span className="field-label">Costo</span>
                <input
                  className="field-input"
                  type="number"
                  value={record.cost}
                  onChange={(event) => updateRecord(record.id, { cost: Number(event.target.value) || 0 })}
                />
              </label>
              <div className="flex items-end justify-end">
                <button
                  className="icon-button"
                  type="button"
                  onClick={() => removeRecord(record.id)}
                  aria-label={`Eliminar ${record.itemName}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
