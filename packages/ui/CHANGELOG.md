# @william-callao/antonella-ui

## 1.0.4

### Patch Changes

- [`4c13525`](https://github.com/WilliamCallao/anella-desing-system/commit/4c135253bcf98a9f9a43bc9303fc36c7e105dc35) Thanks [@WilliamCallao](https://github.com/WilliamCallao)! - fix(ui): ternario en contentContainerStyle con ReactNode falsy y onChangeText opcional en AppTextInput
  
  - `Sheet` y `Modal`: cambiar `actions && styles.x` por ternario para que los falsy de ReactNode (0, "", false) no rompan el DTS build.
  - `AppTextInput`: `onChangeText` ahora es opcional, permitiendo campos readOnly/escaneo sin handler de texto.

## Unreleased

### Added

- Nuevo componente `StackDetails`: card de filas clave-valor compactas (label Caption a la izquierda, valor Caption a la derecha), con chevron y fila presionable cuando se pasa `onPress`. Estilos DEFAULT / LIGHT / DARKNESS. Extraído de la card de cuentas enlazadas del detalle de categoría de la app.
- Nuevo ícono `tag` / `tag-filled` para etiquetas y precios.
- `StackDetails`: soporte opcional de `actions` por fila (array de íconos táctiles al final, p. ej. editar/eliminar, como en `KeyValueList`).
- `AppTextInput`: prop opcional `onPress` que reemplaza el foco del input al tocar la fila (p. ej. campos que solo se completan escaneando: tocar el campo abre el escáner y no el teclado). Prop opcional `readOnly`: bloquea el ingreso de texto (sin teclado) conservando el aspecto normal y dejando operativas las acciones.

### Breaking

- `CardStackSheet` se renombra a `AppBottomSheet` (tipo `CardStackSheetProps` → `AppBottomSheetProps`). Misma API: pila de cards en un bottom sheet, con `areaColor`, `snapPoints`, `dismissible` y `embedded`. Renombrado para alinearlo con el prefijo `App*` de los primitivos del paquete.

## 1.0.1

### Patch Changes

- [#14](https://github.com/WilliamCallao/anella-desing-system/pull/14) [`dc12376`](https://github.com/WilliamCallao/anella-desing-system/commit/dc12376ded5b81482759f8af561447d77de1853d) Thanks [@WilliamCallao](https://github.com/WilliamCallao)! - Mejora Input, Button y Toast del login; agrega prop areaColor a CardStackSheet; optimiza TreeEditor con fade y memoización de nodos.

## 1.0.0

### Major Changes

- Primera liberación pública de Antonella a npm como `@william-callao/antonella-*` (versión 1.0.0).

### Patch Changes

- Updated dependencies []:
  - @william-callao/antonella-theme@1.0.0
