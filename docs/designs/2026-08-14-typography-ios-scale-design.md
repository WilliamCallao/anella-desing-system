# Escala tipográfica iOS — Design

**Fecha:** 2026-08-14 · **Estado:** aprobado · **App:** `@antonella/theme` + `@antonella/ui` + `apps/playground`

## Objetivo

Estandarizar la tipografía de Antonella sobre la **escala oficial de iOS (HIG)** para que
todo el DS parezca consistente y "estándar", alineado con la paleta Apple ya adoptada.
Incluye:
- Nueva escala de 11 roles con tamaños/weights iOS en `texts.ts`.
- Migración de los estilos tipográficos hardcodeados en componentes al sistema de tipos.
- Documentación del **caso de uso** de cada tipo.
- Sección **"Textos"** en el explorador que lista todos los tipos con su muestra y uso.

## Principio rector

Se mantienen los **mismos nombres** de `TextType` (no rompe el API): solo cambian valores.
`subtitle`, `bodyBold` y `captionMedium` dejan de ser tipos muertos y pasan a ser roles
reales de la escala. La fuente sigue siendo la del sistema (SF en iOS / Roboto en Android).

## Nueva escala en `texts.ts`

| TextType | iOS equiv. | fontSize | fontWeight | lineHeight | Caso de uso |
| -------- | ---------- | -------- | ---------- | ---------- | ----------- |
| `title` | Title 1 | 28 | 700 | 34 | Título de pantalla (headers de pantalla/categoría) |
| `subtitle` | Title 2 | 22 | 700 | 28 | Subtítulo de pantalla / secciones grandes |
| `heading` | Title 3 | 20 | 600 | 25 | Encabezado de card / sección |
| `bodyBold` | Headline | 17 | 600 | 22 | Texto destacado en cards/listas, botones |
| `body` | Body | 17 | 400 | 22 | Texto base, valor de inputs |
| `bodyMedium` | Callout | 16 | 500 | 21 | Énfasis medio (chips, títulos de card) |
| `label` | Subheadline | 15 | 600 | 20 | Labels de formularios (600 por legibilidad) |
| `caption` | Footnote | 13 | 400 | 18 | Descripciones secundarias |
| `captionMedium` | — | 13 | 500 | 18 | Caption con énfasis |
| `overline` | Caption 2 | 11 | 600 | 14 | Micro-etiquetas (uppercase, letterSpacing 0.5) |
| `placeholder` | Body | 17 | 400 | 22 | Placeholder de inputs (color `appInput.placeholder`) |

Notas:
- `label` y `bodyMedium` agregan peso (600/500) sobre el valor iOS (400) para preservar
  jerarquía; documentado como decisión del DS.
- `overline` mantiene `textTransform: "uppercase"` y `letterSpacing: 0.5`.
- Colores por defecto sin cambio (tomados de `text`/`appInput`).

## Migración de componentes (hardcoded → tipos)

| Componente | Hoy (hardcoded) | Nuevo tipo |
| ---------- | --------------- | ---------- |
| `Input.tsx` | `fontSize: 16` | `texts.body` (17/400) |
| `TextField.tsx` | default RN (14) | `texts.body` (17/400) |
| `Button.tsx` | 16/600 (md/lg), 14 (sm) | `texts.bodyBold` (md/lg), `texts.label` (sm) |
| `Chip.tsx` | 11/600 uppercase, 13 | `texts.overline`, `texts.caption` |
| `Calendar.tsx` | 16/600, 12/500, 14, 14/600 | `texts.bodyBold`, `texts.captionMedium`, `texts.body`, `texts.bodyBold` |
| `Dropdown.tsx` | 16, 15/600 | `texts.body`, `texts.label` |
| `PinKeypad.tsx` | 24/600 | `texts.title` (28/700) o `title2` |
| `MobileHeader.tsx` | 18/700 | `texts.title3`→`heading` (20/600) o `bodyBold` |
| `Sidebar.tsx` | 11/600 ls1.2, 14/500, 11/600 | `texts.overline`, `texts.bodyMedium`, `texts.caption` |
| `DashboardShell.tsx` | 18/700, 16/700, 14/500 | `texts.heading`, `texts.bodyBold`, `texts.bodyMedium` |
| `AppSelector.tsx` | `optionText fontSize: 14` | quitar, usar `TextType.Body` |

Se aceptan cambios visuales de tamaño (body 14→17, title 18→28): es la consecuencia
natural de la escala iOS. Los valores específicos de cada componente se ajustan durante la
implementación al rol más cercano de la escala, preservando intención semántica.

## Sección "Textos" en el explorador

Reemplaza la categoría `tipografia` actual. Lista los 11 tipos con:
- Nombre del tipo + equivalente iOS.
- `fontSize` / `fontWeight` / `lineHeight`.
- Color default y caso de uso (documentado).
- Muestra renderizada (`<Text variant={...}>Ejemplo</Text>`).

Se renderiza como una lista de entradas (no como showcase de componente único), con la
misma estructura visual de las otras categorías.

## Fuera de alcance

- No se renombra `TextType` (sin breaking change).
- No se bundlea fuente (sigue la del sistema).
- No se toca `colors.ts` ni `basePalette`.
- No se agrega tipo Display ni fuentes de 34+ (no hay pantallas hero hoy).
