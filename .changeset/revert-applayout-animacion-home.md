---
"@william-callao/antonella-ui": patch
---

revert(ui): vuelve AppLayout al commit que centralizó la transición Home → sección

- Restaura `AppLayout` al estado de `b881a49` ("afina transiciones
  onlyCenter"), el punto que acompaña a `2094cb5` de la app ("centraliza
  transiciones en AppLayout"), donde la transición de Home a Plan de
  Cuentas/Almacenes quedó a cargo del motor.
- Se retiran los fixes posteriores de remontaje/retroceso (2.0.1 a 2.0.6), el
  remontaje por firma estructural (2.1.1) y la capa fantasma (2.1.2).
- No se toca el resto del paquete: se conservan las ilustraciones, gráficos e
  iconos de 2.1.0.
