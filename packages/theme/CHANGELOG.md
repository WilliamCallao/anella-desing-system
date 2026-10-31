# @william-callao/antonella-theme

## 1.1.0

### Minor Changes

- [#31](https://github.com/WilliamCallao/anella-desing-system/pull/31) [`3b66371`](https://github.com/WilliamCallao/anella-desing-system/commit/3b663719f87401f7fd40026594f2926bd606e867) Thanks [@WilliamCallao](https://github.com/WilliamCallao)! - feat(theme): escala de valor y contraste AA
  
  ### Added
  
  - `TextType.Value` y `texts.value`: valor de formulario con peso regular, mismo tamaño que `label`.
  - `text.readOnly` y `appInputCard.text.empty` para separar dato fijo, placeholder y valor vacío.
  
  ### Fixed
  
  - `textMuted`, `text.secondary`, `text.subtle`, `text.placeholder` y `palette.danger` cumplen contraste AA sobre card y superficies claras.
  - `appInputCard.text.value` usa el tono de dato fijo en lugar del gris de placeholder.

## 1.0.1

### Patch Changes

- [`f97be82`](https://github.com/WilliamCallao/anella-desing-system/commit/f97be822eaf8902401847cd4bbdcbf06f1dfa1e2) Thanks [@WilliamCallao](https://github.com/WilliamCallao)! - fix(theme): tipografía compacta estilo iOS
  
  - Tracking negativo suave y `lineHeight` más ajustado en `title`, `subtitle`, `heading`,
    `body`, `bodyBold`, `bodyMedium`, `label`, `caption`, `captionMedium` y `placeholder`.
  - Sin cambios de tamaño, peso ni jerarquía.

## 1.0.0

### Major Changes

- Primera liberación pública de Antonella a npm como `@william-callao/antonella-*` (versión 1.0.0).
