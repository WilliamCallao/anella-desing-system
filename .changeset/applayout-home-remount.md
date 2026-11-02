---
"@william-callao/antonella-ui": patch
---

fix(ui): restaura el touch de Home al volver desde AppShell

- `AppShell` cambia `initialRoute` sin ejecutar el `back()` interno de `AppLayout`, por lo que `goingBack` quedaba en `forward`.
- El remontaje de la sección y el descarte de capas salientes ahora se activan por el cambio de layout a `onlyCenter`, no por la dirección de navegación.
- Esto restaura el área táctil del body de Home al volver desde Plan de cuentas, Almacenes u otra pantalla.
