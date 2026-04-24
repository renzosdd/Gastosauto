import { Plus, Trash2 } from 'lucide-react';

import { createId } from '@/lib/id';
import { Trip } from '@/types';

interface TripsEditorProps {
  trips: Trip[];
  onChange: (trips: Trip[]) => void;
}

export function TripsEditor({ trips, onChange }: TripsEditorProps) {
  const updateTrip = (tripId: string, patch: Partial<Trip>) => {
    onChange(trips.map((trip) => (trip.id === tripId ? { ...trip, ...patch } : trip)));
  };

  const addTrip = () => {
    onChange([
      ...trips,
      {
        id: createId('trip'),
        name: 'Nuevo viaje',
        frequencyPerYear: 1,
        roundTripKm: 100,
      },
    ]);
  };

  const removeTrip = (tripId: string) => {
    onChange(trips.filter((trip) => trip.id !== tripId));
  };

  return (
    <div className="panel space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="section-kicker">Km extraordinarios</p>
          <h3 className="section-title">Viajes recurrentes</h3>
        </div>
        <button className="action-button" type="button" onClick={addTrip}>
          <Plus className="h-4 w-4" />
          Agregar viaje
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="data-table min-w-full">
          <thead>
            <tr>
              <th>Viaje</th>
              <th>Veces/anio</th>
              <th>Km ida y vuelta</th>
              <th>Km anuales</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {trips.map((trip) => (
              <tr key={trip.id}>
                <td>
                  <input
                    className="table-input"
                    value={trip.name}
                    onChange={(event) => updateTrip(trip.id, { name: event.target.value })}
                  />
                </td>
                <td>
                  <input
                    className="table-input"
                    type="number"
                    value={trip.frequencyPerYear}
                    onChange={(event) =>
                      updateTrip(trip.id, { frequencyPerYear: Number(event.target.value) || 0 })
                    }
                  />
                </td>
                <td>
                  <input
                    className="table-input"
                    type="number"
                    value={trip.roundTripKm}
                    onChange={(event) =>
                      updateTrip(trip.id, { roundTripKm: Number(event.target.value) || 0 })
                    }
                  />
                </td>
                <td>{(trip.frequencyPerYear * trip.roundTripKm).toLocaleString('es-UY')}</td>
                <td className="text-right">
                  <button
                    className="icon-button"
                    type="button"
                    onClick={() => removeTrip(trip.id)}
                    aria-label={`Eliminar viaje ${trip.name}`}
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
