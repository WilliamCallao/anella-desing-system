---
"@william-callao/antonella-ui": patch
---

fix(ui): motor `AppLayout` — medición del alto natural robusta, sin vestigios de altura entre pantallas y fondo del page claro

- Se elimina `_withBottomHold` (retención del alto del `bottom` entre rutas) y la siembra con los naturales de la ruta previa.
- Proxy de medición fuera del recorte de transición + relecturas con `measure()` hasta estabilizar (no mide alturas "capadas" por animaciones de descendientes).
- Instrumentación `layoutDebug` (`EXPO_PUBLIC_LAYOUT_DEBUG=1`, `__ANTONELLA_LAYOUT_DEBUG__(true)`, dump `__ANTONELLA_LAYOUT_DUMP__()`).
- Fondo del page = color del cuerpo/`mid` cuando está visible.
