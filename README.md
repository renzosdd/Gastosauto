# Garage Cost UY

Aplicacion web para estimar y comparar el costo real anual de tener un vehiculo en Uruguay, con una segunda capa orientada a garage propio: historial de cargas, timeline de mantenimientos y seguimiento de kilometraje real.

## Stack

- React + TypeScript
- Vite
- TailwindCSS
- Estado local con persistencia en `localStorage`

## Como correrla

```bash
npm install
npm run dev
```

Build de produccion:

```bash
npm run build
```

## Estructura funcional

La app ahora se organiza en cuatro vistas:

- `Resumen`: cards, ranking, dashboard tecnico y lectura global del garage.
- `Comparador`: escenarios editables lado a lado para termicos y electricos.
- `Mis vehiculos`: autos propios con odometro, cargas y mantenimientos realizados.
- `Supuestos`: precios de referencia y horizonte de analisis.

## Lo nuevo en esta version

- Vehiculos propios persistidos por separado del comparador
- Timeline de mantenimientos realizados con fecha, costo y kilometraje
- Registro de cargas de combustible o energia por vehiculo
- Actualizacion del kilometraje actual a partir de historial registrado
- Calculo de rendimiento observado desde cargas consecutivas
- Accion para pasar un vehiculo propio al comparador usando su consumo observado cuando existe
- Import/export JSON versionado de todo el estado

## Datos iniciales

El proyecto arranca con:

- Escenarios de comparacion:
  - `Peugeot 206 usado`
  - `Diesel compacta`
  - `Electrico compacto`
- Garage propio:
  - `Mi Peugeot 206`
  - `Mi EV compacto`

Los vehiculos del garage ya traen algunas cargas y mantenimientos para mostrar el flujo.

## Formulas usadas

### Kilometraje anual estimado

```txt
km_anuales = km_mensuales_base * 12 + suma(viajes.vecesPorAnio * viajes.kmIdaVuelta)
```

### Energia / combustible

Nafta y gasoil:

```txt
litros_anuales = km_anuales / km_por_litro
costo_energia_anual = litros_anuales * precio_litro
```

Electrico:

```txt
kwh_anuales = km_anuales * kwh_100km / 100
costo_energia_anual = kwh_anuales * precio_kwh
```

### Repuestos y servicios

```txt
costo_por_km = vida_util_km ? costo / vida_util_km * km_anuales : 0
costo_por_tiempo = vida_util_anios ? costo / vida_util_anios : 0
costo_anual_item = max(costo_por_km, costo_por_tiempo)
```

### Depreciacion

```txt
depreciacion_anual = valor_vehiculo * depreciacion_porcentaje / 100
```

### Total anual

```txt
total_anual =
  costo_energia_anual
  + suma_items_activos
  + seguro_anual
  + patente_anual
  + otros_costos_fijos
  + depreciacion_anual
```

### Derivados

```txt
costo_mensual = total_anual / 12
costo_por_km = total_anual / km_anuales
```

## Rendimiento observado desde cargas

En `Mis vehiculos`, el promedio real se calcula usando cargas consecutivas con odometro creciente.

Para nafta y gasoil:

```txt
promedio_real_km_por_litro = distancia_entre_cargas / litros_de_la_carga_actual
```

Para electricos:

```txt
promedio_real_kwh_100km = (kwh_de_la_carga_actual / distancia_entre_cargas) * 100
```

La app agrega los segmentos validos para generar un promedio global por vehiculo.

## Como usar el comparador

1. Entra a `Comparador`.
2. Agrega o duplica escenarios.
3. Edita ficha tecnica, viajes y catalogo de mantenimiento.
4. Revisa total anual, mensual, costo por km y ranking.

## Como usar `Mis vehiculos`

1. Agrega un vehiculo propio.
2. Completa su ficha tecnica.
3. Registra cargas con fecha, odometro, litros o kWh y costo.
4. Registra mantenimientos realizados con fecha, costo y kilometraje.
5. Usa `Usar en comparador` para llevar ese auto al comparador con su consumo observado si ya tiene historial suficiente.

## Como comparar termicos vs electricos

- Usa el mismo perfil de kilometraje y viajes en los escenarios.
- Ajusta precios de energia por vehiculo o desde `Supuestos`.
- Si tienes un auto propio con historial, cargalo desde `Mis vehiculos` y envialo al comparador.
- Mira especialmente:
  - total anual
  - costo por km
  - energia anual
  - mantenimiento y desgaste
  - contingencia
  - costos fijos
  - depreciacion

## Estructura principal

```txt
src/
  components/
    AssumptionsPanel.tsx
    ComparisonTable.tsx
    CostSummary.tsx
    Dashboard.tsx
    FuelLogTable.tsx
    ImportExportControls.tsx
    MaintenanceHistoryTable.tsx
    MaintenanceTable.tsx
    Sidebar.tsx
    TripsEditor.tsx
    VehicleCard.tsx
    VehicleForm.tsx
  data/defaults.ts
  hooks/useLocalStorageState.ts
  lib/calculations.ts
  lib/format.ts
  types.ts
```

## Funciones clave

En `src/lib/calculations.ts` quedan centralizadas:

- `calculateAnnualKm`
- `calculateEnergyCost`
- `calculateItemAnnualCost`
- `calculateFuelLogMetrics`
- `calculateVehicleTotal`
- `compareVehicles`

## Notas tecnicas

- Los electricos cargan un catalogo especifico y no incluyen aceite, bujias, filtro de combustible, embrague ni distribucion.
- El import/export usa payload versionado `v2`.
- Los vehiculos del garage y los escenarios del comparador se guardan por separado dentro del mismo estado persistido.
