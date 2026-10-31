# @william-callao/antonella-animations

## 2.0.0

### Major Changes

- [#31](https://github.com/WilliamCallao/anella-desing-system/pull/31) [`3b66371`](https://github.com/WilliamCallao/anella-desing-system/commit/3b663719f87401f7fd40026594f2926bd606e867) Thanks [@WilliamCallao](https://github.com/WilliamCallao)! - feat(animations): centralizar transiciones en AppLayout
  
  ### Breaking
  
  - Se elimina `TransitionView`. La transición de aparición/desaparición y cambio de contenido queda a cargo de `AppLayout`.
  
  `FadeIn` y `useFadeIn` siguen disponibles.

## 1.0.1

### Patch Changes

- [`dfb38a7`](https://github.com/WilliamCallao/anella-desing-system/commit/dfb38a788df1bca6390ddff44bb2771e5417bc5a) Thanks [@WilliamCallao](https://github.com/WilliamCallao)! - feat: exportar `FadeIn` y `useFadeIn` (fade de entrada hook-driven, con `contentKey` para re-lanzar la animación)

## Unreleased

### Major Changes

- Se elimina `TransitionView`: la transición de aparición/desaparición y cambio de contenido queda centralizada en `AppLayout`. También se retiran todos sus usos en la app y el playground.

### Minor Changes

- `FadeIn` (componente) y `useFadeIn` (hook): fade de entrada controlado por hook (opacity inicial -> 1), pensado para contenidos que viven en slots del layout que se montan/remontan donde las animaciones `entering` de Reanimated se degradan. `FadeIn` soporta `contentKey` para re-lanzar la animación al cambiar de selección.

## 1.0.0

### Major Changes

- Primera liberación pública de Antonella a npm como `@william-callao/antonella-*` (versión 1.0.0).
