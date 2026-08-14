# Paleta Apple + inputs estilo iOS — Design

**Fecha:** 2026-08-14 · **Estado:** aprobado · **App:** `@antonella/theme` + `@antonella/ui`

## Objetivo

Alinear la paleta de Antonella con la **gama oficial de colores de Apple (iOS Human
Interface Guidelines)** en `colors.ts`, sin tocar `basePalette`, para lograr un look
Apple consistente que **no se vea forzado en Android** (los grises neutros, superficies
redondeadas y el flat design son convenciones que Android 12+ / Material You ya adoptó).

Complementariamente:
- Formalizar los colores de los inputs de texto en el sistema de colores (nuevo token `appInput`).
- Migrar `Input.tsx` del patrón **borde 1px (Material outlined)** al patrón **relleno gris
  redondeado** (iOS), el mismo que ya usa `TextField`.
- Decisión de fuente: **fuente del sistema** (iOS ya renderiza SF Pro, Android Roboto).
  No se agrega expo-font ni se bundlea una fuente.

## Principio rector

"Look Apple" = paleta gris neutra + superficies blancas + radios 10–16 + superficies planas
sin elevación + hairline separators + amplitud. Eso es **plataforma-neutral**. Lo que NO se
adopta (para no verse forzado en Android): SF Pro bundleada, large-title/back chevron como
default, tab bar iOS sin indicador, botones *tinted* translúcidos como default.

## Mapeo `colors.ts` → gama Apple

### `palette` (light)

| Token | Antes | Después | Valor oficial iOS |
| ----- | ----- | ------- | ----------------- |
| `primary` | `#007AFF` | — (sin cambio) | systemBlue light |
| `primaryDark` | `#0062E6` | `#0A84FF` | systemBlue dark |
| `background` | `#F2F2F7` | — | systemGray6 light |
| `surface` | `#FAFAFC` | `#FFFFFF` | systemBackground light |
| `border` | `#E5E5EA` | — | systemGray5 light |
| `text` | `#1C1C1E` | `#000000` | label light |
| `textMuted` | `#8E8E93` | — | systemGray light |
| `danger` | `#FF3B30` | — | systemRed light |
| `success` | `#34C759` | — | systemGreen light |
| `warning` | `#FF9500` | — | systemOrange light |

### `darkPalette`

| Token | Antes | Después | Valor oficial iOS |
| ----- | ----- | ------- | ----------------- |
| `primary` | `#4DA3FF` | `#0A84FF` | systemBlue dark |
| `primaryDark` | `#007AFF` | — | systemBlue light |
| `background` | `#000000` | — | systemBackground dark |
| `surface` | `#1C1C1E` | — | systemGray6 dark |
| `border` | `#2C2C2E` | — | systemGray5 dark |
| `text` | `#F5F5F7` | `#FFFFFF` | label dark |
| `textMuted` | `#98989F` | — (sin cambio) | systemGray dark |
| `danger` | `#FF6369` | `#FF453A` | systemRed dark |
| `success` | `#46C88C` | `#30D158` | systemGreen dark |
| `warning` | `#FFC043` | `#FF9F0A` | systemOrange dark |

> Nota: `darkPalette.textMuted` ya es `#98989F`, el `systemGray` dark oficial. No cambia.

### Tokens derivados

| Token | Antes | Después | Nota |
| ----- | ----- | ------- | ---- |
| `background.default` | `#EAE9EE` (beige) | `#F2F2F7` | Fondo = systemGray6. **Cambio de look #1** |
| `background.content.primary` | `#F2F2F7` | — | Ya es systemGray6 (lo usan inputs) |
| `background.content.secondary` | `#8E8E93` | — | systemGray |
| `text.default` | `#1C1C1E` | `#000000` | label. **Cambio de look #2** |
| `text.secondary` | `#6E6E73` | `#8E8E93` | secondaryLabel ≈ systemGray. **Cambio de look #3** |
| `text.subtle` | `#8E8E93` | — | systemGray |
| `text.placeholder` | `#C7C7CC` | — | systemGray3 |
| `card.background` | `#FCFCFE` | `#FFFFFF` | systemBackground. **Cambio de look #4** |
| `border.divider.secondary` | `#EEEEEE` | `#E5E5EA` | Hairlines más visibles. **Cambio de look #5** |
| `appInputCard.text.value` | `#3A3A3C` | `text.secondary` (`#8E8E93`) | secondaryLabel. **Cambio de look #6** (sin consumidores hoy) |

## Nuevo token `appInput`

Formaliza los colores de los inputs de texto (pedido del usuario: "define el color o colores
que usas en los inputs en el sistema de colores de Antonella"). Definido como alias de tokens
base para una única fuente de verdad.

```ts
export const appInput = {
  background: background.content.primary, // #F2F2F7  (systemGray6)
  text: text.default,                     // #000000  (label)
  placeholder: text.placeholder,          // #C7C7CC  (systemGray3)
  error: palette.danger,                  // #FF3B30  (systemRed)
} as const;
```

Regla: sobre `appInput.background` se pinta texto `appInput.text`; placeholder
`appInput.placeholder`; mensaje de error `appInput.error`. Usado por `Input` y `TextField`.

## Migración de componentes

### `Input.tsx` (Material outlined → iOS filled)

- Quitar `borderWidth`/`borderColor`.
- `backgroundColor` → `appInput.background` (`#F2F2F7`).
- `color` → `appInput.text`.
- `placeholderTextColor` default → `appInput.placeholder`.
- Ícono: color `text.secondary`.
- Conserva `borderRadius 10`, padding y soporte de ícono (`icon`).

### `TextField.tsx`

- Migrar tokens sueltos a `appInput.*`: fondo, texto, placeholder, error.
- Sin cambio de comportamiento ni de API.

## Cambios de look que alteran la apariencia actual

1. Fondo beige `#EAE9EE` → gris iOS `#F2F2F7` (pierde identidad beige).
2. Texto principal `#1C1C1E` → negro puro `#000000` (label oficial).
3. Texto secundario `#6E6E73` → `#8E8E93` (más claro, secondaryLabel Apple).
4. Cards `#FCFCFE` → blanco puro `#FFFFFF`.
5. Hairlines `#EEEEEE` → `#E5E5EA` (levemente más visibles).
6. Valores de formulario `#3A3A3C` → `#8E8E93` (más claros; sin consumidores hoy).
7. `primaryDark` light `#0062E6` → `#0A84FF` (variante del azul más brillante).

## Fuera de alcance

- `basePalette.ts` intacta (neutrals N0..N950, brand M50..M900, etc.).
- `semanticColors` `components.input` intacto (nadie lo consume; solo el sidebar se usa
  vía `resolveShellTokens`).
- `background.subtle` (`#dadadaff`, sin usos): se deja.
- Fuente: del sistema (SF en iOS / Roboto en Android). Sin expo-font.
- No se toca la familia `card-form` salvo `appInputCard.text.value`.
- No se adoptan convenciones iOS-sistema (large-title, tab bar iOS, tinted buttons).
