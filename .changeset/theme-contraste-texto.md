---
"@william-callao/antonella-theme": minor
---

feat(theme): escala de valor y contraste AA

### Added

- `TextType.Value` y `texts.value`: valor de formulario con peso regular, mismo tamaño que `label`.
- `text.readOnly` y `appInputCard.text.empty` para separar dato fijo, placeholder y valor vacío.

### Fixed

- `textMuted`, `text.secondary`, `text.subtle`, `text.placeholder` y `palette.danger` cumplen contraste AA sobre card y superficies claras.
- `appInputCard.text.value` usa el tono de dato fijo en lugar del gris de placeholder.
