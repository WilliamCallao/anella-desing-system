---
"@william-callao/antonella-ui": patch
---

fix(ui): ternario en contentContainerStyle con ReactNode falsy y onChangeText opcional en AppTextInput

- `Sheet` y `Modal`: cambiar `actions && styles.x` por ternario para que los falsy de ReactNode (0, "", false) no rompan el DTS build.
- `AppTextInput`: `onChangeText` ahora es opcional, permitiendo campos readOnly/escaneo sin handler de texto.