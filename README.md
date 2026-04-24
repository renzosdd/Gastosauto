# Garage Cost UY

Aplicacion web moderna para comparar el costo real anual de tener un vehiculo en Uruguay.

La app permite cargar autos a nafta, gasoil y electricos, editar sus parametros tecnicos y comparar escenarios con foco en:

- energia o combustible
- mantenimiento programado
- repuestos de desgaste
- contingencias
- costos fijos anuales
- depreciacion

Todo queda guardado automaticamente en `localStorage`, y tambien se puede exportar/importar el estado completo en JSON.

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

## Que incluye

- Dashboard tecnico con cards, ranking y alertas
- Comparacion lado a lado entre multiples vehiculos
- Alta, edicion, duplicado y eliminacion de vehiculos
- Viajes recurrentes editables para sumar kilometraje anual real
- Catalogo editable de mantenimiento y desgaste por vehiculo
- Reset a datos semilla
- Export/import JSON

## Datos iniciales

La app arranca con dos escenarios precargados:

1. `Peugeot 206 usado` a nafta
   - consumo: `11 km/L`
   - km mensuales: `680`
   - precio nafta: `82.27`
   - viajes: `Chuy 2x800` y `Aguas Blancas 8x250`
2. `Electrico compacto`
   - consumo: `15 kWh/100 km`
   - km mensuales: `680`
   - precio energia editable
   - mismos viajes
   - mantenimiento adaptado a electrico

## Formulas usadas

### Kilometraje anual

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

## Como agregar o editar vehiculos

1. Usa `Agregar vehiculo` para crear un nuevo escenario.
2. Completa la ficha tecnica: marca, modelo, anio, tipo de energia, consumo, precio de energia, seguros y depreciacion.
3. Ajusta los viajes recurrentes para reflejar tu kilometraje real.
4. Activa, desactiva o modifica items del catalogo de mantenimiento.
5. Si quieres comparar variantes del mismo auto, usa `Duplicar`.

## Como comparar termicos vs electricos

- Usa un vehiculo a nafta o gasoil como base de referencia.
- Duplica o crea un segundo vehiculo electrico.
- Mantene el mismo kilometraje y los mismos viajes para que la comparacion sea limpia.
- Revisa en la tabla comparativa:
  - total anual
  - costo mensual
  - costo por km
  - energia anual
  - mantenimiento/desgaste
  - contingencia
  - costos fijos
  - depreciacion
- Mira las alertas del dashboard para detectar si el ahorro en energia queda opacado por seguro, depreciacion o contingencias.

## Estructura principal

```txt
src/
  components/
    ComparisonTable.tsx
    CostSummary.tsx
    Dashboard.tsx
    ImportExportControls.tsx
    MaintenanceTable.tsx
    TripsEditor.tsx
    VehicleCard.tsx
    VehicleForm.tsx
  data/defaults.ts
  hooks/useLocalStorageState.ts
  lib/calculations.ts
  lib/format.ts
  types.ts
```

## Funciones puras clave

En `src/lib/calculations.ts` quedan centralizadas las funciones pedidas:

- `calculateAnnualKm`
- `calculateEnergyCost`
- `calculateItemAnnualCost`
- `calculateVehicleTotal`
- `compareVehicles`

## Notas tecnicas

- Los electricos cargan un catalogo de mantenimiento especifico y no incluyen aceite, bujias, filtro de combustible, embrague ni distribucion.
- Los costos fijos anuales se manejan por campos dedicados del vehiculo para evitar dobles conteos.
- El import/export usa un payload versionado para facilitar extensiones futuras.
