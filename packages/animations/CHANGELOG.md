# @william-callao/antonella-animations

## 1.0.1

### Patch Changes

- [`dfb38a7`](https://github.com/WilliamCallao/anella-desing-system/commit/dfb38a788df1bca6390ddff44bb2771e5417bc5a) Thanks [@WilliamCallao](https://github.com/WilliamCallao)! - feat: exportar `FadeIn` y `useFadeIn` (fade de entrada hook-driven, con `contentKey` para re-lanzar la animación)

## Unreleased

### Minor Changes

- `FadeIn` (componente) y `useFadeIn` (hook): fade de entrada controlado por hook (opacity inicial -> 1), pensado para contenidos que viven en slots del layout que se montan/remontan donde las animaciones `entering` de Reanimated se degradan. `FadeIn` soporta `contentKey` para re-lanzar la animación al cambiar de selección.

## 1.0.0

### Major Changes

- Primera liberación pública de Antonella a npm como `@william-callao/antonella-*` (versión 1.0.0).
