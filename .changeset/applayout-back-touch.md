---
"@william-callao/antonella-ui": patch
---

fix(ui): desmonta las capas salientes al retroceder

- `AppLayout` ya no conserva el contenido de la sección que deja de estar visible al volver atrás.
- Evita que una capa anterior quede por encima del body restaurado y bloquee el touch en Android release.
- El contenido entrante mantiene su fade; solo se elimina la capa saliente.
