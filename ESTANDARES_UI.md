# Estándares de componentes UI — Antonella

Estándares verificados (no reglas genéricas) para que los componentes del paquete `@william-callao/antonella-ui` mantengan la misma geometría y el mismo lenguaje de bordes al diseñar componentes nuevos.

## Cálculo de border radius

Los radios de borde salen de los tokens `radius.*` (`packages/theme/src/radius.ts`):

| Token        | Valor |
| ------------ | ----- |
| `radius.sm`  | 8     |
| `radius.md`  | 16    |
| `radius.lg`  | 20    |

**Regla general:** todo radio se deriva de un token de `radius`, nunca se hardcodea un número suelto.

### Pieza interna inseteada dentro de un contenedor redondeado

Cuando un elemento interno (pill/chip/thumb/tab seleccionada) vive **dentro** de un contenedor con `borderRadius`, separado del borde por un padding (inset), su radio debe seguir la curva del contenedor:

```
innerRadius = outerRadius − insets
```

**Referencia implementada:** `TabNavigation` —
- Contenedor: `borderRadius: radius.md` (16).
- Padding interno del contenido: `space.space1` (4), aplicado con una constante `PAD`.
- Chip/pill seleccionado: `borderRadius: radius.md − PAD` = 12.

En `TabNavigation` el `PAD` se define una sola vez y se usa tanto en el `padding` del contenido como en el cálculo del radio del chip, para que ambos nunca queden desincronizados:

```ts
const PAD = space.space1;

content: {
  padding: PAD,                          // inset entre borde y pill
},
chip: {
  borderRadius: radius.md - PAD,        // 16 - 4 = 12, sigue la curva del contenedor
},
```

Si el componente interno **no** tiene inset (queda pegado al borde), usa el mismo token `radius.*` que su contenedor (no le restes nada).

## Bordes en modo darkness

El color de borde tenue sobre superficies oscuras se resuelve con tokens de `neutrals` — mismo idioma que usan las cards del app en dark (`N800`/`N900` sobre página `N950`).

### Borde de contenedor sutil (solo contorno, sin fondo)

Para un contenedor que en darkness es **solo borde** (fondo transparente sobre la página `N950`):

- **Color:** `neutrals.N800` (`#171F30`). Es tenue sobre `N950` y coincide con el relleno de las pills/cards del mismo modo.
- **Ancho:** 1 (hairline fina de contorno).

**Referencia implementada:** `TabNavigation` (`TabNavigationStyle.DARKNESS`) —
`border: neutrals.N800`, `fill: neutrals.N800`.

> Evitar `neutrals.N700` para contorno de contenedor en darkness: resultó demasiado llamativo. `N700` queda reservado para bordes de inputs con más presencia.

### Divisores finos (hairlines) dentro de cards oscuras

Para separar filas dentro de una superficie oscura (`N800`/`N900`) se usa un divider translúcido blanco:

- **Color:** `rgba(255, 255, 255, 0.12)`.
- **Ancho:** `StyleSheet.hairlineWidth`.

**Referencias implementadas:** `ProductDetailPanel` (`rowDivider`), `CategoryDetailPanel` (`linkedDivider`) y `ActionTiles` (`ActionTilesStyle.DARKNESS`, divider entre acciones).

## Resumen rápido

| Caso                                                        | Fórmula / valor                                                            |
| ----------------------------------------------------------- | -------------------------------------------------------------------------- |
| Radio de pieza interna inseteada                             | `radius.md − PAD` (usar un único `PAD` para padding y radio)               |
| Radio de pieza pegada al borde                               | el mismo token `radius.*` del contenedor                                   |
| Borde de contenedor sutil en darkness                        | `neutrals.N800` (`#171F30`), `borderWidth: 1`                              |
| Divider hairline en superficies oscuras (`N800`/`N900`)      | `rgba(255, 255, 255, 0.12)` + `StyleSheet.hairlineWidth`                  |