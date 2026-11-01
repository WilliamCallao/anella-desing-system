---
"@william-callao/antonella-animations": major
---

feat(animations): centralizar transiciones en AppLayout

### Breaking

- Se elimina `TransitionView`. La transición de aparición/desaparición y cambio de contenido queda a cargo de `AppLayout`.

`FadeIn` y `useFadeIn` siguen disponibles.
