---
"@william-callao/antonella-ui": major
---

feat(ui): formularios de lectura, árbol mobile y notas semánticas

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
