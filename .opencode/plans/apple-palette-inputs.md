# Plan: Look Apple en Antonella (paleta + inputs)

**Fecha:** 2026-08-14 · **Rama:** `chore/simplify-explorer-playground`

## Objetivo

Alinear `colors.ts` a la gama oficial de colores de Apple (iOS HIG) para un look Apple
consistente que no se vea forzado en Android; formalizar los colores de inputs (token
`appInput`); migrar `Input.tsx` de borde (Material outlined) a relleno gris (iOS filled).
Fuente: **del sistema** (SF en iOS, Roboto en Android), sin expo-font.

## Aprobado por el usuario

- Alcance: Paleta + Input + fuentes.
- Fuente: del sistema.
- Los 7 cambios de look listados abajo, aprobados.

## Cambios que alteran el look actual

| # | Token | De → A |
|---|-------|--------|
| 1 | `background.default` | `#EAE9EE` (beige) → `#F2F2F7` |
| 2 | `text.default` | `#1C1C1E` → `#000000` |
| 3 | `text.secondary` | `#6E6E73` → `#8E8E93` |
| 4 | `card.background` | `#FCFCFE` → `#FFFFFF` |
| 5 | `border.divider.secondary` | `#EEEEEE` → `#E5E5EA` |
| 6 | `appInputCard.text.value` | `#3A3A3C` → `text.secondary` (sin consumidores hoy) |
| 7 | `palette.primaryDark` | `#0062E6` → `#0A84FF` |

## Mapeo completo

### palette (light)
- primary `#007AFF` ✓ · primaryDark → `#0A84FF` · background `#F2F2F7` ✓
- surface → `#FFFFFF` · border `#E5E5EA` ✓ · text → `#000000`
- textMuted `#8E8E93` ✓ · danger/success/warning ✓

### darkPalette
- primary → `#0A84FF` · primaryDark `#007AFF` ✓ · background `#000000` ✓
- surface `#1C1C1E` ✓ · border `#2C2C2E` ✓ · text → `#FFFFFF`
- textMuted `#98989F` ✓ (es systemGray dark oficial; NO cambia)
- danger → `#FF453A` · success → `#30D158` · warning → `#FF9F0A`

### Nuevo token appInput
```ts
export const appInput = {
  background: background.content.primary, // #F2F2F7 (systemGray6)
  text: text.default,                     // #000000 (label)
  placeholder: text.placeholder,          // #C7C7CC (systemGray3)
  error: palette.danger,                  // #FF3B30 (systemRed)
} as const;
```

## Tareas de implementación

1. Escribir design doc `docs/designs/2026-08-14-apple-color-palette-design.md` y commitear.
2. `packages/theme/src/colors.ts`: aplicar mapeo + crear `appInput` (ubicado después del bloque `border`, referenciando palette/background/text). Commit.
3. `packages/ui/src/components/TextField/TextField.tsx`: migrar a `appInput.*` (fondo, texto, placeholder, error); imports pasan a `{ appInput, spacing, TextType }`. Commit.
4. `packages/ui/src/components/Input.tsx`: quitar borde, `backgroundColor: appInput.background`, `color: appInput.text`, placeholder `appInput.placeholder`, ícono `text.secondary`. Commit.
5. `apps/playground/src/explorer/categories/inputs.tsx`: agregar entrada `Input` con 2 variantes (Básico, Con ícono `search`). Commit.
6. Verificación: `pnpm typecheck` (9 paquetes). Lint bloqueado por infraestructura pre-existente (ERR_PNPM_UNEXPECTED_STORE); sin framework de tests.

## Fuera de alcance

- `basePalette.ts` intacta · `semanticColors components.input` intacto · `background.subtle` sin tocar
- Fuente del sistema (sin expo-font) · familia `card-form` sin tocar salvo `appInputCard.text.value`

## Archivos

- `packages/theme/src/colors.ts`
- `packages/ui/src/components/TextField/TextField.tsx`
- `packages/ui/src/components/Input.tsx`
- `apps/playground/src/explorer/categories/inputs.tsx`
- `docs/designs/2026-08-14-apple-color-palette-design.md`
