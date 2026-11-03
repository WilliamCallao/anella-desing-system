---
"@william-callao/antonella-ui": patch
---

revert(ui): vuelve el motor de AppLayout a la versión de 2.0.6

- Restaura `AppLayout`, `layoutMath`, sus tests y `APPLAYOUT.md` al estado de
  `31e723e` (2.0.6), el último punto con navegación estable y la transición de
  Home a Cuentas/Almacenes.
- Se retiran el remontaje por firma estructural y la capa fantasma de 2.1.1 /
  2.1.2.
- No toca el resto del paquete: se conservan las ilustraciones, gráficos e
  iconos agregados en 2.1.0.
