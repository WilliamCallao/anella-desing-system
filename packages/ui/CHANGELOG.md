# @william-callao/antonella-ui

## 2.0.2

### Patch Changes

- [#35](https://github.com/WilliamCallao/anella-desing-system/pull/35) [`8b96616`](https://github.com/WilliamCallao/anella-desing-system/commit/8b96616d2bba2e339d1c3ddc23ecf013b2c8a329) Thanks [@WilliamCallao](https://github.com/WilliamCallao)! - fix(ui): optimiza el render y la navegación de AppLayout
  
  - Elimina la instrumentación temporal de logs que penalizaba cada render.
  - Deja de escribir `contentOutProgress` durante el render; la animación se configura solo en el efecto de transición.
  - Memoiza el contexto de navegación para evitar re-renders innecesarios de las pantallas.
  - Aplica la transición de layout solo a las secciones cuya altura cambió.
  - Al volver a Home remonta la sección afectada por el área táctil obsoleta; en el resto de los retrocesos conserva el nodo nativo.

## 2.0.1

### Patch Changes

- [#33](https://github.com/WilliamCallao/anella-desing-system/pull/33) [`bfae49a`](https://github.com/WilliamCallao/anella-desing-system/commit/bfae49a94bdecf68fd1007ec734ed6c1a75a402a) Thanks [@WilliamCallao](https://github.com/WilliamCallao)! - fix(ui): desmonta las capas salientes al retroceder
  
  - `AppLayout` ya no conserva el contenido de la sección que deja de estar visible al volver atrás.
  - Evita que una capa anterior quede por encima del body restaurado y bloquee el touch en Android release.
  - El contenido entrante mantiene su fade; solo se elimina la capa saliente.

## 2.0.0

### Major Changes

- [#31](https://github.com/WilliamCallao/anella-desing-system/pull/31) [`3b66371`](https://github.com/WilliamCallao/anella-desing-system/commit/3b663719f87401f7fd40026594f2926bd606e867) Thanks [@WilliamCallao](https://github.com/WilliamCallao)! - feat(ui): formularios de lectura, árbol mobile y notas semánticas
  
  ### Breaking
  
  - `TreeEditor`: `TreeNode.kind` (`"group" | "item"`) ahora es obligatorio. Los consumidores deben declararlo en cada nodo para distinguir grupos de elementos aunque el grupo esté vacío.
  - `AppFormCard`: el estilo de lista de lectura se declara con `variant="readOnly"`; ya no se infiere de los hijos. Funciona igual con wrappers, fragmentos y condicionales.
  
  ### Added
  
  - `AppReadOnlyField` con tonos claro/oscuro, valor vacío, acción y métricas compartidas de `card-form`.
  - `AppFormCard tone="dark"` y `variant="readOnly"` con divisores a sangre.
  - `AppStepIndicator`, `BottomDialog`, `InfoNote`, `PropertySummary`, `SelectableTable`, `ScreenOverlay` y `TrackedPressable`.
  - `AppTextInput`: `readOnly`, `onPress`, `trailingAction`, `trailingIcon` y `selectable`.
  - `TreeEditor`: rediseño mobile con grupos/elementos, acciones por nodo y soporte de contexto oscuro.
  
  ### Fixed
  
  - Selección de texto visible en `AppTextInput`, `AppTextArea` y `TextField` (`brand.M300`).
  - `AppLayout`: medición del alto natural, transiciones `onlyCenter`/`fullBottom` y fades sin vestigios entre pantallas.
  - Contraste de labels, captions, placeholders y acciones oscuras.

### Patch Changes

- Updated dependencies [[`3b66371`](https://github.com/WilliamCallao/anella-desing-system/commit/3b663719f87401f7fd40026594f2926bd606e867)]:
  - @william-callao/antonella-theme@1.1.0

## 1.3.0

### Minor Changes

- [`840da33`](https://github.com/WilliamCallao/anella-desing-system/commit/840da33b513dfb90af3c047690526248e3abd00f) Thanks [@WilliamCallao](https://github.com/WilliamCallao)! - feat(ui): `AppButton` acepta `loading` — spinner a la derecha del texto
  
  - Nueva prop opcional `loading?: boolean`: mientras está activa renderiza un `ActivityIndicator`
    a la derecha del label (con el color del texto) y marca el botón como no accionable
    (`accessibilityState.busy`), evitando dobles taps sin grisear el botón.
  - Compatible hacia atrás: default `false`, sin cambios para los consumidores existentes.

### Patch Changes

- [#29](https://github.com/WilliamCallao/anella-desing-system/pull/29) [`ff8cb40`](https://github.com/WilliamCallao/anella-desing-system/commit/ff8cb4057dba66ec23f4da3a45cb87bf4d7acbe4) Thanks [@WilliamCallao](https://github.com/WilliamCallao)! - fix(ui): motor `AppLayout` — medición del alto natural robusta, sin vestigios de altura entre pantallas y fondo del page claro
  
  - Se elimina `_withBottomHold` (retención del alto del `bottom` entre rutas) y la siembra con los naturales de la ruta previa.
  - Proxy de medición fuera del recorte de transición + relecturas con `measure()` hasta estabilizar (no mide alturas "capadas" por animaciones de descendientes).
  - Instrumentación `layoutDebug` (`EXPO_PUBLIC_LAYOUT_DEBUG=1`, `__ANTONELLA_LAYOUT_DEBUG__(true)`, dump `__ANTONELLA_LAYOUT_DUMP__()`).
  - Fondo del page = color del cuerpo/`mid` cuando está visible.
- Updated dependencies [[`f97be82`](https://github.com/WilliamCallao/anella-desing-system/commit/f97be822eaf8902401847cd4bbdcbf06f1dfa1e2)]:
  - @william-callao/antonella-theme@1.0.1

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
