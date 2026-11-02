---
"@william-callao/antonella-ui": patch
---

fix(ui): restaura la transición de Home a Cuentas/Almacenes

- El remontaje de sección se limita a la restauración de Home.
- Al salir de Home se conserva el nodo nativo y vuelve el morph de altura de la transición.
- Las capas salientes se siguen descartando para evitar bloqueos táctiles.
