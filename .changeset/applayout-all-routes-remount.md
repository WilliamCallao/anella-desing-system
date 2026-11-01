---
"@william-callao/antonella-ui": patch
---

fix(ui): remonta las secciones en cada cambio de ruta

- El nodo nativo de una sección se reutilizaba entre pantallas y podía conservar un área táctil obsoleta en Android release.
- Ahora cada ruta monta nodos de sección nuevos, cubriendo Home ↔ Cuentas/Almacenes y también la navegación entre secciones.
- Se mantiene el fade del contenido; solo se desactiva el morph de altura cuando la sección se remonta.
