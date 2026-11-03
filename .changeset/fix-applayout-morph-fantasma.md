---
"@william-callao/antonella-ui": patch
---

fix(ui): recupera el morph de transición con una capa fantasma no interactiva

- Los cruces de forma (Home → Cuentas/Almacenes, sección → detalle `fullBottom`
  y vueltas) vuelven a animar la banda clara y el borde de la hoja.
- El morph se dibuja en un overlay absoluto con `pointerEvents="none"` que se
  desmonta al terminar; el layout destino ya está montado en su geometría final
  y es el que recibe los toques.
- Se mantiene el remontaje por firma estructural: la animación ya no puede
  dejar un área táctil obsoleta en Android release.
- Al volver a Home, una cortina del color del page oculta y revela el contenido
  nuevo debajo del borde que crece.
