---
"@william-callao/antonella-ui": minor
---

feat(ui): `AppButton` acepta `loading` — spinner a la derecha del texto

- Nueva prop opcional `loading?: boolean`: mientras está activa renderiza un `ActivityIndicator`
  a la derecha del label (con el color del texto) y marca el botón como no accionable
  (`accessibilityState.busy`), evitando dobles taps sin grisear el botón.
- Compatible hacia atrás: default `false`, sin cambios para los consumidores existentes.
