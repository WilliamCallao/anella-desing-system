---
"@william-callao/antonella-ui": patch
---

fix(ui): remonta secciones solo en los cruces Home ↔ secciones

- 2.0.4 remontaba todas las rutas, lo que arreglaba las secciones pero rompía Home y degradaba las animaciones.
- El remontaje vuelve a limitarse a los cruces Home ↔ secciones.
- Las rutas dentro del mismo layout conservan el nodo nativo y sus transiciones de altura.
