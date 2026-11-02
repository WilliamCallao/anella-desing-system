---
"@william-callao/antonella-ui": patch
---

fix(ui): optimiza el render y la navegación de AppLayout

- Elimina la instrumentación temporal de logs que penalizaba cada render.
- Deja de escribir `contentOutProgress` durante el render; la animación se configura solo en el efecto de transición.
- Memoiza el contexto de navegación para evitar re-renders innecesarios de las pantallas.
- Aplica la transición de layout solo a las secciones cuya altura cambió.
- Al volver a Home remonta la sección afectada por el área táctil obsoleta; en el resto de los retrocesos conserva el nodo nativo.
