# Explorador de componentes — Design

**Fecha:** 2026-08-13 · **Estado:** aprobado · **App:** `apps/playground`

## Objetivo

Reestructurar el ejemplo del playground para que el **explorador de componentes** viva en una
**sección específica** (ruta `/explorer`) y no envuelva toda la app. El explorador lista
**solo los componentes `App*`** de `@antonella/ui` con sus variantes, con una estructura de
registro simple pero extensible.

## Rutas

```
/                     Home simple: título + tarjeta con botón "Explorador de componentes" → /explorer.
                      Sin DashboardShell, sin FAB.
/explorer             Sección del explorador: pantalla con instrucción + FAB (abajo-izquierda) +
                      drawer de categorías. Al elegir categoría → /explorer/[category].
/explorer/[category]  Pantalla por categoría: header con back + un ComponentShowcase
                      (nombre + descripción + variantes) por cada componente. Sin FAB.
```

- El FAB + drawer solo se montan dentro de `/explorer`.
- El demo del `DashboardShell` queda fuera del alcance por ahora (se quita de la home; no se
  mueve a otra ruta en esta iteración).
- Las pantallas de categoría usan back nativo/header y fallback a `/` si no hay historial.

## Estructura del registro (Enfoque A: archivo por categoría)

```
apps/playground/src/explorer/
  registry.ts                 # tipos + componentCategories (agregado) + findCategory
  categories/
    formularios.tsx           # AppFormCard, AppTextInput, AppTextArea, AppSelector, AppInput, AppButton
    dialogos.tsx              # AppResponsiveDialog
    checklists.tsx            # AppCheckItem
    filtros.tsx               # AppFilterChips
    tipografia.tsx            # AppTextHeader
  ComponentDrawer.tsx         # drawer (BottomSheet) con categorías (se mantiene)
  ComponentShowcase.tsx       # nombre + descripción + variantes (se mantiene)
```

- Cada archivo de categoría exporta un `ComponentCategory`.
- Agregar un componente = editarlo en el archivo de su categoría.
- Agregar una categoría = archivo nuevo + una línea en `registry.ts`.
- Los demos stateful actuales (TextInputDemo, SelectorDemo, etc.) se mueven a su archivo de
  categoría, reutilizando la implementación ya existente.

## Contenido (solo `App*`)

Componentes incluidos (10) y sus categorías:

| Categoría     | Componentes                                                        |
| ------------- | ------------------------------------------------------------------ |
| Formularios   | AppFormCard, AppTextInput, AppTextArea, AppSelector, AppInput, AppButton |
| Diálogos      | AppResponsiveDialog                                                |
| Checklists    | AppCheckItem                                                       |
| Filtros       | AppFilterChips                                                     |
| Tipografía    | AppTextHeader                                                      |

Quedan **fuera** los primitivos del DS (Button, Input, Card, Text, Chip, Calendar, Dropdown,
DonutChart, EmptyState, Icon, LayoutRow/Column, Modal, PinKeypad, Skeleton*, ToolsCard,
BottomSheet, FloatingActionButton) y el DashboardShell. Es extensible: sumar primitivos más
adelante es agregar sus entradas.

## Fuera de alcance

- No se migran primitivos al explorador.
- No se mueve el demo de DashboardShell a otra ruta.
- No se toca `@antonella/ui` (solo se consume).
