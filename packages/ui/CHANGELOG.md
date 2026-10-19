# @william-callao/antonella-ui

## 1.2.0

### Added

- `TreeEditor`: prop opcional `nodeActions` (`"menu" | "longPress"`, default `"menu"`).
  Con `"longPress"` no se renderiza el botón de tres puntos por fila. En ambos modos una
  pulsación larga sobre el nodo abre el menú de acciones; la fila expone además una acción
  accesible ("Acciones") para lectores de pantalla. Retrocompatible: sin el prop, el
  componente se comporta igual que antes.
- `TreeEditor`: prop opcional `onPressNode`, invocado en el toque corto de un nodo hoja
  (los grupos siguen expandiendo/colapsando). Permite abrir un detalle de solo lectura sin
  tocar la gestualidad del árbol.

## 1.0.5

### Added

- `ProductCard`: prop opcional `maxQuantity` — topa el stepper (`+` deshabilitado al
  alcanzarlo), las ediciones manuales (clamp en commit) y deshabilita el botón
  "Añadir" con máximo 0. Se usa en la venta rápida para no exceder el stock
  disponible. Retrocompatible: sin el prop, el card acepta cualquier cantidad.

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

### Fixed

- `AppLayout` (motor de layout): medición del alto natural robusta y determinista.
  - Se elimina la retención del alto de la sección `bottom` entre pantallas (`_withBottomHold`) y la siembra con los naturales de la ruta previa: al volver a una pantalla ya vista se usa su snapshot, y una ruta nunca vista se siembra con un neutro de ventana. Se acabó el "vestigio" en el que el motor creía seguir en la pantalla grande estando en la chica.
  - El proxy de medición se mueve fuera del contenedor recortado (`overflow:hidden`) y se re-mide con `measure()` hasta estabilizar, para no quedar con un alto "capado" por un descendiente que anima su propio alto (p. ej. `TransitionView`).
  - Nueva instrumentación `layoutDebug` (`EXPO_PUBLIC_LAYOUT_DEBUG=1` o `__ANTONELLA_LAYOUT_DEBUG__(true)`; volcado con `__ANTONELLA_LAYOUT_DUMP__()`), sin cambio de comportamiento.
  - Fondo del page: vuelve a ser el color del cuerpo/`mid` (claro) cuando está visible, en vez del de la hoja oscura, para que los morphs no muestren un corte oscuro.

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
