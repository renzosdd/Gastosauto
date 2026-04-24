import { CarFront, Gauge, ShieldCheck, Wrench } from 'lucide-react';

import { ComparisonTable } from '@/components/ComparisonTable';
import { Dashboard } from '@/components/Dashboard';
import { ImportExportControls } from '@/components/ImportExportControls';
import { VehicleCard } from '@/components/VehicleCard';
import { createInitialVehicles, createMaintenanceCatalog, createVehicleTemplate } from '@/data/defaults';
import { useLocalStorageState } from '@/hooks/useLocalStorageState';
import { calculateVehicleTotal, compareVehicles } from '@/lib/calculations';
import { formatCurrency, formatDecimal } from '@/lib/format';
import { createId } from '@/lib/id';
import { EnergyType, ImportPayload, Vehicle } from '@/types';

const STORAGE_KEY = 'garage-cost-uy:v1';

function cloneVehicle(vehicle: Vehicle): Vehicle {
  return {
    ...vehicle,
    id: createId('vehicle'),
    name: `${vehicle.name} - copia`,
    trips: vehicle.trips.map((trip) => ({ ...trip, id: createId('trip') })),
    maintenanceItems: vehicle.maintenanceItems.map((item) => ({ ...item, id: createId('item') })),
  };
}

export default function App() {
  const [vehicles, setVehicles] = useLocalStorageState<Vehicle[]>(STORAGE_KEY, createInitialVehicles);

  const results = vehicles.map(calculateVehicleTotal);
  const comparison = compareVehicles(results);
  const bestCostPerKmResult = results.find(
    (result) => result.vehicle.id === comparison.lowestCostPerKmId,
  );

  const totalAnnual = results.reduce((total, result) => total + result.breakdown.annualTotal, 0);
  const totalMaintenance = results.reduce(
    (total, result) =>
      total +
      result.breakdown.maintenance +
      result.breakdown.wear +
      result.breakdown.contingency +
      result.breakdown.electricSpecific,
    0,
  );

  const updateVehicle = (vehicleId: string, patch: Partial<Vehicle>) => {
    setVehicles((current) =>
      current.map((vehicle) => (vehicle.id === vehicleId ? { ...vehicle, ...patch } : vehicle)),
    );
  };

  const updateVehicleEnergyType = (vehicleId: string, energyType: EnergyType) => {
    const energyDefaults: Record<EnergyType, { consumption: number; energyPrice: number }> = {
      nafta: { consumption: 11, energyPrice: 82.27 },
      gasoil: { consumption: 15, energyPrice: 61.49 },
      electrico: { consumption: 15, energyPrice: 11.2 },
    };

    setVehicles((current) =>
      current.map((vehicle) =>
        vehicle.id === vehicleId
          ? {
              ...vehicle,
              energyType,
              consumption: energyDefaults[energyType].consumption,
              energyPrice: energyDefaults[energyType].energyPrice,
              maintenanceItems: createMaintenanceCatalog(energyType),
            }
          : vehicle,
      ),
    );
  };

  const addVehicle = () => {
    setVehicles((current) => [
      ...current,
      createVehicleTemplate('nafta', {
        name: `Escenario ${current.length + 1}`,
        brand: 'Marca',
        model: 'Modelo',
        year: 2020,
      }),
    ]);
  };

  const duplicateVehicle = (vehicleId: string) => {
    const vehicle = vehicles.find((entry) => entry.id === vehicleId);

    if (!vehicle) {
      return;
    }

    setVehicles((current) => [...current, cloneVehicle(vehicle)]);
  };

  const deleteVehicle = (vehicleId: string) => {
    if (vehicles.length === 1) {
      window.alert('Necesitas al menos un vehiculo para mantener la comparativa.');
      return;
    }

    setVehicles((current) => current.filter((vehicle) => vehicle.id !== vehicleId));
  };

  const resetVehicles = () => {
    const confirmed = window.confirm('Esto reemplaza todos los datos actuales por los valores de ejemplo.');

    if (confirmed) {
      setVehicles(createInitialVehicles());
    }
  };

  const exportState = () => {
    const payload: ImportPayload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      vehicles,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'garage-cost-uy.json';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const importState = async (file: File) => {
    try {
      const rawText = await file.text();
      const parsed = JSON.parse(rawText) as Partial<ImportPayload>;

      if (!parsed || !Array.isArray(parsed.vehicles)) {
        throw new Error('Formato invalido.');
      }

      setVehicles(parsed.vehicles);
    } catch (error) {
      console.error(error);
      window.alert('No pude importar ese archivo JSON.');
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(77,215,255,0.12),transparent_28%),radial-gradient(circle_at_85%_10%,_rgba(115,240,167,0.08),transparent_22%),linear-gradient(180deg,_#06080a_0%,_#0a0d11_48%,_#050607_100%)] text-zinc-50">
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <header className="hero-shell">
          <div className="grid gap-8 xl:grid-cols-[1.3fr_0.9fr]">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-500/5 px-3 py-1 text-xs uppercase tracking-[0.3em] text-cyan-100">
                Garage Cost UY
              </div>
              <div className="max-w-3xl space-y-4">
                <h1 className="text-4xl font-semibold tracking-[-0.04em] text-zinc-50 sm:text-5xl">
                  Calculadora tecnica para estimar el costo real de tener un vehiculo en Uruguay.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg">
                  Compara autos a nafta, gasoil y electricos con una lectura anual, mensual y por kilometro.
                  Incluye energia, mantenimiento, desgaste, contingencias, fijos y depreciacion.
                </p>
              </div>
              <ImportExportControls
                onExport={exportState}
                onImport={importState}
                onReset={resetVehicles}
                onAddVehicle={addVehicle}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="hero-metric">
                <CarFront className="h-5 w-5 text-cyan-300" />
                <p className="metric-label">Vehiculos en comparacion</p>
                <p className="metric-value">{vehicles.length}</p>
                <p className="text-sm text-zinc-400">Escenarios editables y duplicables</p>
              </div>
              <div className="hero-metric">
                <Gauge className="h-5 w-5 text-emerald-300" />
                <p className="metric-label">Costo anual agregado</p>
                <p className="metric-value">{formatCurrency(totalAnnual, true)}</p>
                <p className="text-sm text-zinc-400">Suma de todos los escenarios cargados</p>
              </div>
              <div className="hero-metric">
                <Wrench className="h-5 w-5 text-amber-300" />
                <p className="metric-label">Mantenimiento + desgaste</p>
                <p className="metric-value">{formatCurrency(totalMaintenance, true)}</p>
                <p className="text-sm text-zinc-400">Incluye contingencias y rubros EV</p>
              </div>
              <div className="hero-metric">
                <ShieldCheck className="h-5 w-5 text-sky-300" />
                <p className="metric-label">Mejor costo por km</p>
                <p className="metric-value">
                  $
                  {formatDecimal(
                    bestCostPerKmResult?.breakdown.costPerKm ?? 0,
                  )}
                </p>
                <p className="text-sm text-zinc-400">
                  {bestCostPerKmResult?.vehicle.name ?? 'Sin datos'}
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="mt-8 space-y-8">
          <Dashboard results={results} comparison={comparison} />
          <ComparisonTable results={results} comparison={comparison} />

          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="section-kicker">Escenarios editables</p>
                <h2 className="section-title">Gestion de vehiculos</h2>
              </div>
            </div>

            <div className="space-y-8">
              {results.map((result) => (
                <VehicleCard
                  key={result.vehicle.id}
                  vehicle={result.vehicle}
                  result={result}
                  onChange={(patch) => updateVehicle(result.vehicle.id, patch)}
                  onEnergyTypeChange={(energyType) =>
                    updateVehicleEnergyType(result.vehicle.id, energyType)
                  }
                  onDuplicate={() => duplicateVehicle(result.vehicle.id)}
                  onDelete={() => deleteVehicle(result.vehicle.id)}
                />
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
