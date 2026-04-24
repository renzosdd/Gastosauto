import { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  BatteryCharging,
  CarFront,
  Copy,
  Gauge,
  Plus,
  ShieldCheck,
  Trash2,
  Wrench,
} from 'lucide-react';

import { AssumptionsPanel } from '@/components/AssumptionsPanel';
import { ComparisonTable } from '@/components/ComparisonTable';
import { Dashboard } from '@/components/Dashboard';
import { FuelLogTable } from '@/components/FuelLogTable';
import { ImportExportControls } from '@/components/ImportExportControls';
import { MaintenanceHistoryTable } from '@/components/MaintenanceHistoryTable';
import { MaintenanceTable } from '@/components/MaintenanceTable';
import { Sidebar } from '@/components/Sidebar';
import { TripsEditor } from '@/components/TripsEditor';
import { VehicleCard } from '@/components/VehicleCard';
import { VehicleForm } from '@/components/VehicleForm';
import {
  createDefaultAssumptions,
  createGarageVehicleTemplate,
  createInitialAppData,
  createMaintenanceCatalog,
  createVehicleTemplate,
} from '@/data/defaults';
import { useLocalStorageState } from '@/hooks/useLocalStorageState';
import {
  calculateFuelLogMetrics,
  calculateVehicleTotal,
  compareVehicles,
} from '@/lib/calculations';
import {
  formatCurrency,
  formatDate,
  formatObservedEfficiency,
  formatPercent,
  getEnergyTone,
  getEnergyTypeLabel,
} from '@/lib/format';
import { createId } from '@/lib/id';
import { AppData, AppPage, EnergyType, GarageVehicle, GlobalAssumptions, ImportPayload, Vehicle } from '@/types';

const STORAGE_KEY = 'garage-cost-uy:v2';

function cloneVehicle(vehicle: Vehicle): Vehicle {
  return {
    ...vehicle,
    id: createId('vehicle'),
    name: `${vehicle.name} - copia`,
    trips: vehicle.trips.map((trip) => ({ ...trip, id: createId('trip') })),
    maintenanceItems: vehicle.maintenanceItems.map((item) => ({ ...item, id: createId('item') })),
  };
}

function cloneGarageVehicle(vehicle: GarageVehicle): GarageVehicle {
  return {
    ...vehicle,
    id: createId('vehicle'),
    name: `${vehicle.name} - copia`,
    trips: vehicle.trips.map((trip) => ({ ...trip, id: createId('trip') })),
    maintenanceItems: vehicle.maintenanceItems.map((item) => ({ ...item, id: createId('item') })),
    fuelLogs: vehicle.fuelLogs.map((log) => ({ ...log, id: createId('fuel') })),
    maintenanceRecords: vehicle.maintenanceRecords.map((record) => ({
      ...record,
      id: createId('service'),
    })),
  };
}

function getEnergyDefaults(energyType: EnergyType, assumptions: GlobalAssumptions) {
  const defaults: Record<EnergyType, { consumption: number; energyPrice: number }> = {
    nafta: { consumption: 11, energyPrice: assumptions.gasolinePrice },
    gasoil: { consumption: 15, energyPrice: assumptions.dieselPrice },
    electrico: { consumption: 15, energyPrice: assumptions.electricityPrice },
  };

  return defaults[energyType];
}

function syncGarageVehicle(vehicle: GarageVehicle): GarageVehicle {
  const latestFuelKm = Math.max(0, ...vehicle.fuelLogs.map((log) => log.odometerKm));
  const latestMaintenanceKm = Math.max(0, ...vehicle.maintenanceRecords.map((record) => record.odometerKm));

  return {
    ...vehicle,
    currentOdometerKm: Math.max(vehicle.currentOdometerKm, latestFuelKm, latestMaintenanceKm),
  };
}

function createComparisonVehicleFromGarage(garageVehicle: GarageVehicle): Vehicle {
  const observed = calculateFuelLogMetrics(garageVehicle);

  return {
    ...cloneVehicle(garageVehicle),
    consumption: observed.averageEfficiency ?? garageVehicle.consumption,
  };
}

function getPageHeading(page: AppPage) {
  const headings: Record<AppPage, { title: string; description: string }> = {
    resumen: {
      title: 'Resumen operativo',
      description: 'Lectura global del comparador, costos agregados y estado del garage propio.',
    },
    comparador: {
      title: 'Comparador de costos',
      description: 'Calcula y compara el costo total de propiedad entre escenarios a nafta, gasoil y electrico.',
    },
    'mis-vehiculos': {
      title: 'Mis vehiculos',
      description: 'Guarda tus autos, registra cargas, servicios y segui el timeline real de uso.',
    },
    supuestos: {
      title: 'Supuestos principales',
      description: 'Centraliza precios de referencia y horizonte de analisis para usar como base del tablero.',
    },
  };

  return headings[page];
}

export default function App() {
  const [data, setData] = useLocalStorageState<AppData>(STORAGE_KEY, createInitialAppData);
  const [activePage, setActivePage] = useState<AppPage>('comparador');
  const [selectedGarageVehicleId, setSelectedGarageVehicleId] = useState<string | null>(
    data.garageVehicles[0]?.id ?? null,
  );

  useEffect(() => {
    if (!data.garageVehicles.length) {
      setSelectedGarageVehicleId(null);
      return;
    }

    const selectedStillExists = data.garageVehicles.some(
      (vehicle) => vehicle.id === selectedGarageVehicleId,
    );

    if (!selectedStillExists) {
      setSelectedGarageVehicleId(data.garageVehicles[0].id);
    }
  }, [data.garageVehicles, selectedGarageVehicleId]);

  const comparisonResults = useMemo(
    () => data.comparisonVehicles.map((vehicle) => calculateVehicleTotal(vehicle)),
    [data.comparisonVehicles],
  );
  const comparison = useMemo(() => compareVehicles(comparisonResults), [comparisonResults]);
  const bestCostPerKmResult = comparisonResults.find(
    (result) => result.vehicle.id === comparison.lowestCostPerKmId,
  );

  const garageSnapshots = useMemo(
    () =>
      data.garageVehicles.map((vehicle) => {
        const fuelMetrics = calculateFuelLogMetrics(vehicle);
        const projectedResult = calculateVehicleTotal(vehicle, {
          consumptionOverride: fuelMetrics.averageEfficiency ?? undefined,
        });

        return {
          vehicle,
          fuelMetrics,
          projectedResult,
        };
      }),
    [data.garageVehicles],
  );

  const selectedGarageSnapshot = garageSnapshots.find(
    (snapshot) => snapshot.vehicle.id === selectedGarageVehicleId,
  );

  const totalAnnual = comparisonResults.reduce(
    (total, result) => total + result.breakdown.annualTotal,
    0,
  );
  const totalMaintenance = comparisonResults.reduce(
    (total, result) =>
      total +
      result.breakdown.maintenance +
      result.breakdown.wear +
      result.breakdown.contingency +
      result.breakdown.electricSpecific,
    0,
  );

  const updateComparisonVehicles = (updater: (current: Vehicle[]) => Vehicle[]) => {
    setData((current) => ({
      ...current,
      comparisonVehicles: updater(current.comparisonVehicles),
    }));
  };

  const updateGarageVehicles = (updater: (current: GarageVehicle[]) => GarageVehicle[]) => {
    setData((current) => ({
      ...current,
      garageVehicles: updater(current.garageVehicles).map(syncGarageVehicle),
    }));
  };

  const updateComparisonVehicle = (vehicleId: string, patch: Partial<Vehicle>) => {
    updateComparisonVehicles((current) =>
      current.map((vehicle) => (vehicle.id === vehicleId ? { ...vehicle, ...patch } : vehicle)),
    );
  };

  const updateGarageVehicle = (vehicleId: string, patch: Partial<GarageVehicle>) => {
    updateGarageVehicles((current) =>
      current.map((vehicle) => (vehicle.id === vehicleId ? { ...vehicle, ...patch } : vehicle)),
    );
  };

  const updateComparisonEnergyType = (vehicleId: string, energyType: EnergyType) => {
    updateComparisonVehicles((current) =>
      current.map((vehicle) => {
        if (vehicle.id !== vehicleId) {
          return vehicle;
        }

        const defaults = getEnergyDefaults(energyType, data.assumptions);

        return {
          ...vehicle,
          energyType,
          consumption: defaults.consumption,
          energyPrice: defaults.energyPrice,
          maintenanceItems: createMaintenanceCatalog(energyType),
        };
      }),
    );
  };

  const updateGarageEnergyType = (vehicleId: string, energyType: EnergyType) => {
    updateGarageVehicles((current) =>
      current.map((vehicle) => {
        if (vehicle.id !== vehicleId) {
          return vehicle;
        }

        const defaults = getEnergyDefaults(energyType, data.assumptions);

        return {
          ...vehicle,
          energyType,
          consumption: defaults.consumption,
          energyPrice: defaults.energyPrice,
          maintenanceItems: createMaintenanceCatalog(energyType),
          fuelLogs: [],
          maintenanceRecords: [],
        };
      }),
    );
  };

  const addComparisonVehicle = () => {
    updateComparisonVehicles((current) => [
      ...current,
      createVehicleTemplate('nafta', {
        name: `Escenario ${current.length + 1}`,
        brand: 'Marca',
        model: 'Modelo',
        year: 2020,
        energyPrice: data.assumptions.gasolinePrice,
      }),
    ]);
  };

  const addGarageVehicle = () => {
    const nextVehicle = createGarageVehicleTemplate('nafta', {
      name: `Mi vehiculo ${data.garageVehicles.length + 1}`,
      brand: 'Marca',
      model: 'Modelo',
      year: 2020,
      currentOdometerKm: 0,
      fuelLogs: [],
      maintenanceRecords: [],
      energyPrice: data.assumptions.gasolinePrice,
    });

    updateGarageVehicles((current) => [
      ...current,
      nextVehicle,
    ]);
    setSelectedGarageVehicleId(nextVehicle.id);
    setActivePage('mis-vehiculos');
  };

  const duplicateComparisonVehicle = (vehicleId: string) => {
    const vehicle = data.comparisonVehicles.find((entry) => entry.id === vehicleId);

    if (!vehicle) {
      return;
    }

    updateComparisonVehicles((current) => [...current, cloneVehicle(vehicle)]);
  };

  const duplicateGarageVehicle = (vehicleId: string) => {
    const vehicle = data.garageVehicles.find((entry) => entry.id === vehicleId);

    if (!vehicle) {
      return;
    }

    const cloned = cloneGarageVehicle(vehicle);

    updateGarageVehicles((current) => [...current, cloned]);
    setSelectedGarageVehicleId(cloned.id);
  };

  const deleteComparisonVehicle = (vehicleId: string) => {
    if (data.comparisonVehicles.length === 1) {
      window.alert('Necesitas al menos un vehiculo en el comparador.');
      return;
    }

    updateComparisonVehicles((current) => current.filter((vehicle) => vehicle.id !== vehicleId));
  };

  const deleteGarageVehicle = (vehicleId: string) => {
    if (data.garageVehicles.length === 1) {
      window.alert('Necesitas al menos un vehiculo guardado en el garage.');
      return;
    }

    updateGarageVehicles((current) => current.filter((vehicle) => vehicle.id !== vehicleId));
  };

  const pushGarageVehicleToComparator = (vehicleId: string) => {
    const vehicle = data.garageVehicles.find((entry) => entry.id === vehicleId);

    if (!vehicle) {
      return;
    }

    updateComparisonVehicles((current) => [...current, createComparisonVehicleFromGarage(vehicle)]);
    setActivePage('comparador');
  };

  const resetData = () => {
    const confirmed = window.confirm('Esto reemplaza los escenarios, vehiculos propios y supuestos por los datos iniciales.');

    if (confirmed) {
      const nextData = createInitialAppData();
      setData(nextData);
      setSelectedGarageVehicleId(nextData.garageVehicles[0]?.id ?? null);
    }
  };

  const exportState = () => {
    const payload: ImportPayload = {
      version: 2,
      exportedAt: new Date().toISOString(),
      data,
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
      const parsed = JSON.parse(rawText) as Partial<ImportPayload> & Partial<AppData> & { vehicles?: Vehicle[] };

      if (parsed.version === 2 && parsed.data) {
        setData(parsed.data);
        setSelectedGarageVehicleId(parsed.data.garageVehicles[0]?.id ?? null);
        return;
      }

      if (Array.isArray(parsed.vehicles)) {
        const migrated: AppData = {
          comparisonVehicles: parsed.vehicles,
          garageVehicles: parsed.vehicles.slice(0, 1).map((vehicle) => ({
            ...vehicle,
            currentOdometerKm: 0,
            fuelLogs: [],
            maintenanceRecords: [],
          })),
          assumptions: createDefaultAssumptions(),
        };
        setData(migrated);
        setSelectedGarageVehicleId(migrated.garageVehicles[0]?.id ?? null);
        return;
      }

      if (Array.isArray(parsed.comparisonVehicles) && Array.isArray(parsed.garageVehicles)) {
        const fallback: AppData = {
          comparisonVehicles: parsed.comparisonVehicles,
          garageVehicles: parsed.garageVehicles.map(syncGarageVehicle),
          assumptions: parsed.assumptions ?? createDefaultAssumptions(),
        };
        setData(fallback);
        setSelectedGarageVehicleId(fallback.garageVehicles[0]?.id ?? null);
        return;
      }

      throw new Error('Formato invalido.');
    } catch (error) {
      console.error(error);
      window.alert('No pude importar ese archivo JSON.');
    }
  };

  const pageHeading = getPageHeading(activePage);

  return (
    <div className="min-h-screen bg-app-gradient text-zinc-50">
      <div className="flex min-h-screen">
        <Sidebar
          activePage={activePage}
          onPageChange={setActivePage}
          assumptions={data.assumptions}
        />

        <div className="flex-1 px-4 py-5 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1680px] space-y-6">
            <header className="main-topbar">
              <div>
                <div className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
                  Garage Cost UY
                </div>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
                  {pageHeading.title}
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-zinc-400 sm:text-base">
                  {pageHeading.description}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-400">
                  Precios actualizados: <span className="text-zinc-100">{formatDate(data.assumptions.updatedAt)}</span>
                </div>
                <button className="action-button" type="button" onClick={exportState}>
                  Guardar estado
                </button>
              </div>
            </header>

            {activePage === 'resumen' ? (
              <section className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="hero-metric">
                    <CarFront className="h-5 w-5 text-cyan-300" />
                    <p className="metric-label">Vehiculos comparando</p>
                    <p className="metric-value">{data.comparisonVehicles.length}</p>
                    <p className="text-sm text-zinc-400">Escenarios activos en el tablero</p>
                  </div>
                  <div className="hero-metric">
                    <Gauge className="h-5 w-5 text-emerald-300" />
                    <p className="metric-label">Costo anual agregado</p>
                    <p className="metric-value">{formatCurrency(totalAnnual, true)}</p>
                    <p className="text-sm text-zinc-400">Suma anual de todos los escenarios</p>
                  </div>
                  <div className="hero-metric">
                    <Wrench className="h-5 w-5 text-amber-300" />
                    <p className="metric-label">Mantenimiento + desgaste</p>
                    <p className="metric-value">{formatCurrency(totalMaintenance, true)}</p>
                    <p className="text-sm text-zinc-400">Incluye contingencias y EV</p>
                  </div>
                  <div className="hero-metric">
                    <ShieldCheck className="h-5 w-5 text-sky-300" />
                    <p className="metric-label">Mejor costo por km</p>
                    <p className="metric-value">
                      {bestCostPerKmResult
                        ? `$${bestCostPerKmResult.breakdown.costPerKm.toFixed(2)}`
                        : 'Sin datos'}
                    </p>
                    <p className="text-sm text-zinc-400">
                      {bestCostPerKmResult?.vehicle.name ?? 'Sin datos'}
                    </p>
                  </div>
                </div>

                <ImportExportControls
                  onExport={exportState}
                  onImport={importState}
                  onReset={resetData}
                  onAddVehicle={addComparisonVehicle}
                  addLabel="Agregar escenario"
                />

                <Dashboard results={comparisonResults} comparison={comparison} />

                <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                  <div className="panel space-y-4">
                    <div>
                      <p className="section-kicker">Garage propio</p>
                      <h2 className="section-title">Vehiculos guardados</h2>
                    </div>
                    <div className="space-y-3">
                      {garageSnapshots.map(({ vehicle, fuelMetrics, projectedResult }) => (
                        <button
                          key={vehicle.id}
                          className={`garage-list-card w-full text-left ${
                            selectedGarageVehicleId === vehicle.id ? 'garage-list-card-active' : ''
                          }`}
                          type="button"
                          onClick={() => {
                            setSelectedGarageVehicleId(vehicle.id);
                            setActivePage('mis-vehiculos');
                          }}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="font-medium text-zinc-100">{vehicle.name}</div>
                              <div className="mt-1 text-sm text-zinc-400">
                                {vehicle.brand} {vehicle.model} - {vehicle.year}
                              </div>
                            </div>
                            <span className={`inline-flex rounded-full px-2 py-1 text-[11px] ring-1 ${getEnergyTone(vehicle.energyType)}`}>
                              {getEnergyTypeLabel(vehicle.energyType)}
                            </span>
                          </div>
                          <div className="mt-4 grid gap-3 md:grid-cols-3">
                            <div>
                              <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">Odometro</div>
                              <div className="mt-1 text-sm text-zinc-100">
                                {vehicle.currentOdometerKm.toLocaleString('es-UY')} km
                              </div>
                            </div>
                            <div>
                              <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">Promedio real</div>
                              <div className="mt-1 text-sm text-zinc-100">
                                {formatObservedEfficiency(fuelMetrics.averageEfficiency, vehicle.energyType)}
                              </div>
                            </div>
                            <div>
                              <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">Proyeccion anual</div>
                              <div className="mt-1 text-sm text-zinc-100">
                                {formatCurrency(projectedResult.breakdown.annualTotal)}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <AssumptionsPanel
                    assumptions={data.assumptions}
                    onChange={(patch) =>
                      setData((current) => ({
                        ...current,
                        assumptions: { ...current.assumptions, ...patch },
                      }))
                    }
                  />
                </div>
              </section>
            ) : null}

            {activePage === 'comparador' ? (
              <section className="space-y-6">
                <div className="grid gap-4 xl:grid-cols-[1.5fr_0.5fr]">
                  <div className="panel space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="section-kicker">Escenarios</p>
                        <h2 className="section-title">Flota comparativa</h2>
                      </div>
                      <button className="action-button-primary" type="button" onClick={addComparisonVehicle}>
                        <Plus className="h-4 w-4" />
                        Agregar vehiculo
                      </button>
                    </div>

                    <div className="grid gap-4 xl:grid-cols-3">
                      {comparisonResults.map((result) => (
                        <div key={result.vehicle.id} className="rounded-[28px] border border-white/10 bg-white/5 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <span className={`inline-flex rounded-full px-2 py-1 text-[11px] ring-1 ${getEnergyTone(result.vehicle.energyType)}`}>
                                {getEnergyTypeLabel(result.vehicle.energyType)}
                              </span>
                              <div className="mt-4 text-xl font-semibold text-zinc-50">{result.vehicle.brand} {result.vehicle.model}</div>
                              <div className="text-sm text-zinc-400">{result.vehicle.name}</div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                className="icon-button"
                                type="button"
                                onClick={() => duplicateComparisonVehicle(result.vehicle.id)}
                                aria-label="Duplicar escenario"
                              >
                                <Copy className="h-4 w-4" />
                              </button>
                              <button
                                className="icon-button"
                                type="button"
                                onClick={() => deleteComparisonVehicle(result.vehicle.id)}
                                aria-label="Eliminar escenario"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          <div className="mt-5 grid gap-3 md:grid-cols-2">
                            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                              <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">Costo anual</div>
                              <div className="mt-2 text-lg font-semibold text-zinc-50">
                                {formatCurrency(result.breakdown.annualTotal)}
                              </div>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                              <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">Costo por km</div>
                              <div className="mt-2 text-lg font-semibold text-emerald-100">
                                ${result.breakdown.costPerKm.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="panel flex flex-col items-center justify-center gap-4 border-dashed text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5">
                      <Plus className="h-6 w-6 text-zinc-400" />
                    </div>
                    <div>
                      <div className="font-medium text-zinc-100">Agregar escenario</div>
                      <div className="mt-1 text-sm text-zinc-400">
                        Duplica un auto o agrega uno nuevo para comparar.
                      </div>
                    </div>
                    <button className="action-button" type="button" onClick={addComparisonVehicle}>
                      Nuevo vehiculo
                    </button>
                  </div>
                </div>

                <ComparisonTable results={comparisonResults} comparison={comparison} />

                <div className="space-y-8">
                  {comparisonResults.map((result) => (
                    <VehicleCard
                      key={result.vehicle.id}
                      vehicle={result.vehicle}
                      result={result}
                      onChange={(patch) => updateComparisonVehicle(result.vehicle.id, patch)}
                      onEnergyTypeChange={(energyType) =>
                        updateComparisonEnergyType(result.vehicle.id, energyType)
                      }
                      onDuplicate={() => duplicateComparisonVehicle(result.vehicle.id)}
                      onDelete={() => deleteComparisonVehicle(result.vehicle.id)}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {activePage === 'mis-vehiculos' ? (
              <section className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
                <div className="space-y-4">
                  <div className="panel space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="section-kicker">Garage</p>
                        <h2 className="section-title">Vehiculos propios</h2>
                      </div>
                      <button className="action-button-primary" type="button" onClick={addGarageVehicle}>
                        <Plus className="h-4 w-4" />
                        Agregar
                      </button>
                    </div>

                    <div className="space-y-3">
                      {garageSnapshots.map(({ vehicle, fuelMetrics }) => (
                        <button
                          key={vehicle.id}
                          className={`garage-list-card w-full text-left ${
                            selectedGarageVehicleId === vehicle.id ? 'garage-list-card-active' : ''
                          }`}
                          type="button"
                          onClick={() => setSelectedGarageVehicleId(vehicle.id)}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="font-medium text-zinc-100">{vehicle.name}</div>
                              <div className="mt-1 text-sm text-zinc-400">
                                {vehicle.brand} {vehicle.model}
                              </div>
                            </div>
                            <span className={`inline-flex rounded-full px-2 py-1 text-[11px] ring-1 ${getEnergyTone(vehicle.energyType)}`}>
                              {getEnergyTypeLabel(vehicle.energyType)}
                            </span>
                          </div>
                          <div className="mt-4 space-y-2 text-sm text-zinc-400">
                            <div className="flex items-center justify-between">
                              <span>Odometro</span>
                              <span className="text-zinc-100">{vehicle.currentOdometerKm.toLocaleString('es-UY')} km</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Promedio real</span>
                              <span className="text-zinc-100">
                                {formatObservedEfficiency(fuelMetrics.averageEfficiency, vehicle.energyType)}
                              </span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {selectedGarageSnapshot ? (
                  <div className="space-y-6">
                    <div className="panel">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-3">
                          <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-medium ring-1 ${getEnergyTone(selectedGarageSnapshot.vehicle.energyType)}`}>
                            {selectedGarageSnapshot.vehicle.energyType === 'electrico' ? (
                              <BatteryCharging className="mr-2 h-4 w-4" />
                            ) : (
                              <CarFront className="mr-2 h-4 w-4" />
                            )}
                            {getEnergyTypeLabel(selectedGarageSnapshot.vehicle.energyType)}
                          </span>
                          <div>
                            <h2 className="text-3xl font-semibold tracking-tight text-zinc-50">
                              {selectedGarageSnapshot.vehicle.name}
                            </h2>
                            <p className="mt-2 text-sm text-zinc-400">
                              {selectedGarageSnapshot.vehicle.brand} {selectedGarageSnapshot.vehicle.model} - {selectedGarageSnapshot.vehicle.year}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            className="action-button"
                            type="button"
                            onClick={() => duplicateGarageVehicle(selectedGarageSnapshot.vehicle.id)}
                          >
                            <Copy className="h-4 w-4" />
                            Duplicar
                          </button>
                          <button
                            className="action-button"
                            type="button"
                            onClick={() => pushGarageVehicleToComparator(selectedGarageSnapshot.vehicle.id)}
                          >
                            <ArrowUpRight className="h-4 w-4" />
                            Usar en comparador
                          </button>
                          <button
                            className="action-button"
                            type="button"
                            onClick={() => deleteGarageVehicle(selectedGarageSnapshot.vehicle.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Eliminar
                          </button>
                        </div>
                      </div>

                      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <div className="metric-card">
                          <p className="metric-label">Odometro actual</p>
                          <input
                            className="mt-3 field-input"
                            type="number"
                            value={selectedGarageSnapshot.vehicle.currentOdometerKm}
                            onChange={(event) =>
                              updateGarageVehicle(selectedGarageSnapshot.vehicle.id, {
                                currentOdometerKm: Number(event.target.value) || 0,
                              })
                            }
                          />
                        </div>
                        <div className="metric-card">
                          <p className="metric-label">Promedio real</p>
                          <p className="metric-value">
                            {formatObservedEfficiency(
                              selectedGarageSnapshot.fuelMetrics.averageEfficiency,
                              selectedGarageSnapshot.vehicle.energyType,
                            )}
                          </p>
                        </div>
                        <div className="metric-card">
                          <p className="metric-label">Proyeccion anual</p>
                          <p className="metric-value">
                            {formatCurrency(selectedGarageSnapshot.projectedResult.breakdown.annualTotal)}
                          </p>
                          <p className="text-sm text-zinc-400">
                            {formatPercent(
                              selectedGarageSnapshot.projectedResult.breakdown.percentages.energia,
                            )}{' '}
                            del total en energia
                          </p>
                        </div>
                        <div className="metric-card">
                          <p className="metric-label">Mantenimientos</p>
                          <p className="metric-value">
                            {selectedGarageSnapshot.vehicle.maintenanceRecords.length}
                          </p>
                          <p className="text-sm text-zinc-400">Eventos guardados en timeline</p>
                        </div>
                      </div>
                    </div>

                    <FuelLogTable
                      energyType={selectedGarageSnapshot.vehicle.energyType}
                      logs={selectedGarageSnapshot.vehicle.fuelLogs}
                      metrics={selectedGarageSnapshot.fuelMetrics}
                      onChange={(fuelLogs) =>
                        updateGarageVehicle(selectedGarageSnapshot.vehicle.id, { fuelLogs })
                      }
                    />

                    <MaintenanceHistoryTable
                      records={selectedGarageSnapshot.vehicle.maintenanceRecords}
                      onChange={(maintenanceRecords) =>
                        updateGarageVehicle(selectedGarageSnapshot.vehicle.id, { maintenanceRecords })
                      }
                    />

                    <VehicleForm
                      vehicle={selectedGarageSnapshot.vehicle}
                      onChange={(patch) =>
                        updateGarageVehicle(selectedGarageSnapshot.vehicle.id, patch)
                      }
                      onEnergyTypeChange={(energyType) =>
                        updateGarageEnergyType(selectedGarageSnapshot.vehicle.id, energyType)
                      }
                    />

                    <TripsEditor
                      trips={selectedGarageSnapshot.vehicle.trips}
                      onChange={(trips) =>
                        updateGarageVehicle(selectedGarageSnapshot.vehicle.id, { trips })
                      }
                    />

                    <MaintenanceTable
                      items={selectedGarageSnapshot.vehicle.maintenanceItems}
                      annualKm={selectedGarageSnapshot.projectedResult.breakdown.annualKm}
                      energyType={selectedGarageSnapshot.vehicle.energyType}
                      onChange={(maintenanceItems) =>
                        updateGarageVehicle(selectedGarageSnapshot.vehicle.id, { maintenanceItems })
                      }
                    />
                  </div>
                ) : (
                  <div className="panel flex min-h-[420px] items-center justify-center text-zinc-400">
                    No hay vehiculos guardados.
                  </div>
                )}
              </section>
            ) : null}

            {activePage === 'supuestos' ? (
              <section className="space-y-6">
                <AssumptionsPanel
                  assumptions={data.assumptions}
                  onChange={(patch) =>
                    setData((current) => ({
                      ...current,
                      assumptions: { ...current.assumptions, ...patch },
                    }))
                  }
                />

                <div className="grid gap-6 xl:grid-cols-2">
                  <div className="panel space-y-4">
                    <div>
                      <p className="section-kicker">Referencia actual</p>
                      <h2 className="section-title">Impacto en escenarios</h2>
                    </div>
                    <div className="space-y-3">
                      {comparisonResults.map((result) => (
                        <div key={result.vehicle.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-zinc-100">{result.vehicle.name}</div>
                              <div className="text-sm text-zinc-400">
                                Energia anual: {formatCurrency(result.breakdown.annualEnergyCost)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-zinc-50">
                                {formatCurrency(result.breakdown.annualTotal)}
                              </div>
                              <div className="text-xs text-zinc-400">
                                {formatPercent(result.breakdown.percentages.energia)} energia
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="panel space-y-4">
                    <div>
                      <p className="section-kicker">Acciones</p>
                      <h2 className="section-title">Gestion de datos</h2>
                    </div>
                    <ImportExportControls
                      onExport={exportState}
                      onImport={importState}
                      onReset={resetData}
                      onAddVehicle={addGarageVehicle}
                      addLabel="Agregar vehiculo propio"
                    />
                  </div>
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
