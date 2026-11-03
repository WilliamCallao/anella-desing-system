---
"@william-callao/antonella-ui": patch
---

fix(ui): remonta secciones por firma estructural y restaura el touch

- El nodo nativo de una sección se remonta cuando cambia su firma de layout
  (visibilidad, tipo de alto, scroll, slot y ancla), no según la dirección de
  navegación ni por ser Home.
- Corrige el área táctil obsoleta en Android release al entrar a Plan de
  cuentas/Almacenes desde Home y al volver de un detalle `fullBottom`: el
  contenido se veía bien pero los toques caían en la geometría anterior.
- Cuando la firma no cambia, el nodo se conserva y sigue animando su altura
  (mediciones intra-ruta y rutas que comparten preset).
