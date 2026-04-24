import { Plus, RotateCcw, Trash2 } from 'lucide-react';

import { createMaintenanceCatalog } from '@/data/defaults';
import { calculateItemAnnualCost } from '@/lib/calculations';
import { formatCurrency, getCategoryLabel, getCategoryTone } from '@/lib/format';
import { createId } from '@/lib/id';
import { EnergyType, MaintenanceCategory, MaintenanceItem } from '@/types';

interface MaintenanceTableProps {
  items: MaintenanceItem[];
  annualKm: number;
  energyType: EnergyType;
  onChange: (items: MaintenanceItem[]) => void;
}

const categories: MaintenanceCategory[] = [
  'mantenimiento',
  'desgaste',
  'contingencia',
  'electrico',
  'fijo',
];

export function MaintenanceTable({
  items,
  annualKm,
  energyType,
  onChange,
}: MaintenanceTableProps) {
  const updateItem = (itemId: string, patch: Partial<MaintenanceItem>) => {
    onChange(items.map((item) => (item.id === itemId ? { ...item, ...patch } : item)));
  };

  const addItem = () => {
    onChange([
      ...items,
      {
        id: createId('item'),
        name: 'Nuevo item',
        category: energyType === 'electrico' ? 'electrico' : 'mantenimiento',
        cost: 0,
        usefulLifeKm: null,
        usefulLifeYears: 1,
        appliesTo: energyType,
        active: true,
        notes: '',
      },
    ]);
  };

  const resetCatalog = () => {
    onChange(createMaintenanceCatalog(energyType));
  };

  const removeItem = (itemId: string) => {
    onChange(items.filter((item) => item.id !== itemId));
  };

  return (
    <div className="panel space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="section-kicker">Desgaste y servicios</p>
          <h3 className="section-title">Tabla editable de mantenimiento</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="action-button" type="button" onClick={resetCatalog}>
            <RotateCcw className="h-4 w-4" />
            Recargar catalogo
          </button>
          <button className="action-button" type="button" onClick={addItem}>
            <Plus className="h-4 w-4" />
            Agregar item
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="data-table min-w-[1100px]">
          <thead>
            <tr>
              <th>On</th>
              <th>Item</th>
              <th>Categoria</th>
              <th>Costo</th>
              <th>Vida km</th>
              <th>Vida anios</th>
              <th>Anualizado</th>
              <th>Notas</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const cost = calculateItemAnnualCost(item, annualKm).annualCost;
              const inactiveForType = item.appliesTo !== 'todos' && item.appliesTo !== energyType;

              return (
                <tr key={item.id} className={inactiveForType ? 'opacity-45' : ''}>
                  <td>
                    <input
                      className="h-4 w-4 accent-cyan-400"
                      type="checkbox"
                      checked={item.active}
                      onChange={(event) => updateItem(item.id, { active: event.target.checked })}
                    />
                  </td>
                  <td>
                    <input
                      className="table-input"
                      value={item.name}
                      onChange={(event) => updateItem(item.id, { name: event.target.value })}
                    />
                  </td>
                  <td>
                    <select
                      className="table-input"
                      value={item.category}
                      onChange={(event) =>
                        updateItem(item.id, {
                          category: event.target.value as MaintenanceCategory,
                        })
                      }
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {getCategoryLabel(category)}
                        </option>
                      ))}
                    </select>
                    <div className="mt-2">
                      <span className={`inline-flex rounded-full px-2 py-1 text-[11px] ring-1 ${getCategoryTone(item.category)}`}>
                        {getCategoryLabel(item.category)}
                      </span>
                    </div>
                  </td>
                  <td>
                    <input
                      className="table-input"
                      type="number"
                      value={item.cost}
                      onChange={(event) =>
                        updateItem(item.id, { cost: Number(event.target.value) || 0 })
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="table-input"
                      type="number"
                      value={item.usefulLifeKm ?? ''}
                      onChange={(event) =>
                        updateItem(item.id, {
                          usefulLifeKm: event.target.value ? Number(event.target.value) : null,
                        })
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="table-input"
                      type="number"
                      value={item.usefulLifeYears ?? ''}
                      onChange={(event) =>
                        updateItem(item.id, {
                          usefulLifeYears: event.target.value ? Number(event.target.value) : null,
                        })
                      }
                    />
                  </td>
                  <td className="font-medium text-zinc-100">{formatCurrency(cost)}</td>
                  <td>
                    <input
                      className="table-input"
                      value={item.notes}
                      onChange={(event) => updateItem(item.id, { notes: event.target.value })}
                    />
                  </td>
                  <td className="text-right">
                    <button
                      className="icon-button"
                      type="button"
                      onClick={() => removeItem(item.id)}
                      aria-label={`Eliminar ${item.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
