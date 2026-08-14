# Escala tipográfica iOS — Implementation Plan

> **For agentic workers:** Use `mobiai-mobile-executing-plans-with-subagents` (recommended) or `mobiai-mobile-executing-plans` to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Estandarizar la tipografía de Antonella sobre la escala oficial iOS (HIG) en `texts.ts`, migrar los estilos tipográficos hardcodeados de los componentes a los tipos del sistema y crear la sección "Textos" en el explorador con caso de uso de cada tipo.

**Architecture:** Se mantienen los nombres de `TextType` (sin breaking change); solo cambian valores (sizes/weights a iOS). Los componentes pasan de `fontSize`/`fontWeight` hardcodeados a referencias `texts.*`. La sección "Textos" lista los 11 tipos con metadata de uso.

**Tech Stack:** React Native, TypeScript, Expo (SDK 54), pnpm monorepo con turbo.

**Platform:** React Native

**Verificación:** este repo no tiene framework de tests; la verificación es `pnpm typecheck` (9 paquetes). El lint de `@antonella/playground` está bloqueado por infraestructura pre-existente (ERR_PNPM_UNEXPECTED_STORE) y no se toca.

---

### Task 1: `texts.ts` — nueva escala iOS

**Files:**
- Modify: `packages/theme/src/texts.ts` (completo)

- [ ] **Step 1: Reescribir `texts.ts` con la escala iOS y docs de uso**

```ts
import { text } from "./colors";

/**
 * TextType — tipos de texto del DS, referenciables por nombre para no usar
 * strings sueltos. El tipo `TextType` (mismo nombre) es la unión de los
 * valores; en el código del DS se usa `TextType.X`, las apps pueden usar el
 * tipo con strings literales validados por el compilador.
 *
 * ESCALA: alineada a la escala tipográfica oficial de iOS (HIG).
 * fuente del sistema: SF Pro en iOS / Roboto en Android.
 */
export const TextType = {
  Title: "title",
  Subtitle: "subtitle",
  Heading: "heading",
  Body: "body",
  BodyMedium: "bodyMedium",
  BodyBold: "bodyBold",
  Label: "label",
  Caption: "caption",
  CaptionMedium: "captionMedium",
  Overline: "overline",
  Placeholder: "placeholder",
} as const;

export type TextType = (typeof TextType)[keyof typeof TextType];

/**
 * Sistema de textos del DS. Cada tipo define el estilo tipográfico completo
 * (fontSize, fontWeight, lineHeight; opcional letterSpacing/textTransform)
 * más el color por defecto tomado del token `text` de colors.ts.
 *
 * CASO DE USO (documentado por rol):
 * - title      : título de pantalla (headers de pantalla/categoría).
 * - subtitle   : subtítulo de pantalla / secciones grandes.
 * - heading    : encabezado de card / sección.
 * - bodyBold   : texto destacado en cards/listas, labels de botones.
 * - body       : texto base, valor de inputs.
 * - bodyMedium : énfasis medio (chips, títulos de card).
 * - label      : labels de formularios (peso 600 por legibilidad).
 * - caption    : descripciones secundarias.
 * - captionMedium: caption con énfasis.
 * - overline   : micro-etiquetas (uppercase + letterSpacing 0.5).
 * - placeholder: placeholder de inputs (color `text.placeholder`).
 */
export const texts = {
  title: { fontSize: 28, fontWeight: "700", lineHeight: 34, color: text.default },
  subtitle: { fontSize: 22, fontWeight: "700", lineHeight: 28, color: text.default },
  heading: { fontSize: 20, fontWeight: "600", lineHeight: 25, color: text.default },
  bodyBold: { fontSize: 17, fontWeight: "600", lineHeight: 22, color: text.default },
  body: { fontSize: 17, fontWeight: "400", lineHeight: 22, color: text.default },
  bodyMedium: { fontSize: 16, fontWeight: "500", lineHeight: 21, color: text.default },
  label: { fontSize: 15, fontWeight: "600", lineHeight: 20, color: text.default },
  caption: { fontSize: 13, fontWeight: "400", lineHeight: 18, color: text.secondary },
  captionMedium: { fontSize: 13, fontWeight: "500", lineHeight: 18, color: text.secondary },
  overline: {
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 14,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: text.secondary,
  },
  placeholder: { fontSize: 17, fontWeight: "400", lineHeight: 22, color: text.placeholder },
} as const;
```

- [ ] **Step 2: Verificar**

Run: `pnpm --filter @antonella/theme typecheck`
Expected: PASS (sin errores)

- [ ] **Step 3: Commit**

```bash
git add packages/theme/src/texts.ts
git commit -m "feat(theme): apply iOS HIG typography scale to texts"
```

---

### Task 2: Inputs de texto → `texts.body`

**Files:**
- Modify: `packages/ui/src/components/Input.tsx`
- Modify: `packages/ui/src/components/TextField/TextField.tsx`

- [ ] **Step 1: `Input.tsx` — texto del campo 16 → `texts.body`**

Import actual: `import { appInput, spacing, text } from "@antonella/theme";`
Nuevo import: `import { appInput, spacing, text, texts } from "@antonella/theme";`

En `styles`:
```ts
input: {
  borderRadius: 10,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  fontSize: texts.body.fontSize,
  color: appInput.text,
  backgroundColor: appInput.background,
},
...
inputFlex: {
  flex: 1,
  paddingVertical: spacing.sm,
  fontSize: texts.body.fontSize,
  color: appInput.text,
},
```

- [ ] **Step 2: `TextField.tsx` — agregar `fontSize` de `texts.body`**

Import actual: `import { appInput, spacing, TextType } from "@antonella/theme";`
Nuevo import: `import { appInput, spacing, texts, TextType } from "@antonella/theme";`

En `styles.field` agregar:
```ts
field: {
  minHeight: FIELD_MIN_HEIGHT,
  borderRadius: FIELD_RADIUS,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.md,
  backgroundColor: appInput.background,
  color: appInput.text,
  fontSize: texts.body.fontSize,
  outlineWidth: 0,
  textAlignVertical: "top",
},
```

- [ ] **Step 3: Verificar**

Run: `pnpm --filter @antonella/ui typecheck`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/components/Input.tsx packages/ui/src/components/TextField/TextField.tsx
git commit -m "refactor(ui): text inputs use texts.body font size"
```

---

### Task 3: `Button.tsx` → `texts.bodyBold` / `texts.label`

**Files:**
- Modify: `packages/ui/src/components/Button.tsx`

- [ ] **Step 1: Mapear label de botón**

Import actual: `import { background, card, palette } from "@antonella/theme";`
Nuevo import: `import { background, card, palette, texts } from "@antonella/theme";`

En `styles`:
```ts
label: { fontSize: texts.bodyBold.fontSize, fontWeight: texts.bodyBold.fontWeight },
labelSm: { fontSize: texts.label.fontSize },
```

- [ ] **Step 2: Verificar**

Run: `pnpm --filter @antonella/ui typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/components/Button.tsx
git commit -m "refactor(ui): Button label uses texts.bodyBold/texts.label"
```

---

### Task 4: `Chip.tsx` → tamaños de `texts.overline` / `texts.caption`

**Files:**
- Modify: `packages/ui/src/components/Chip.tsx`

- [ ] **Step 1: Reemplazar tamaños hardcodeados**

Import actual: `import { neutrals, space } from "@antonella/theme";`
Nuevo import: `import { neutrals, space, texts } from "@antonella/theme";`

En `styles`:
```ts
text: {
  fontWeight: "600",
},
textSm: {
  fontSize: texts.overline.fontSize,
  lineHeight: texts.overline.lineHeight,
},
textMd: {
  fontSize: texts.caption.fontSize,
  lineHeight: texts.caption.lineHeight,
},
```

- [ ] **Step 2: Verificar**

Run: `pnpm --filter @antonella/ui typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/components/Chip.tsx
git commit -m "refactor(ui): Chip text sizes use texts.overline/texts.caption"
```

---

### Task 5: `Calendar.tsx` → `texts.bodyBold` / `texts.captionMedium` / `texts.body`

**Files:**
- Modify: `packages/ui/src/components/Calendar.tsx`

- [ ] **Step 1: Mapear estilos del calendario**

Agregar `texts` al import de `@antonella/theme` (ver imports actuales al editar).

En `styles`:
```ts
headerText: {
  fontSize: texts.bodyBold.fontSize,
  fontWeight: texts.bodyBold.fontWeight,
  color: card.text.primary,
},
weekdayText: {
  fontSize: texts.captionMedium.fontSize,
  fontWeight: texts.captionMedium.fontWeight,
  color: card.text.secondary,
},
dayText: {
  fontSize: texts.body.fontSize,
  color: card.text.primary,
},
todayText: {
  fontSize: texts.bodyBold.fontSize,
  fontWeight: texts.bodyBold.fontWeight,
  color: "#FFFFFF",
},
```

- [ ] **Step 2: Verificar**

Run: `pnpm --filter @antonella/ui typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/components/Calendar.tsx
git commit -m "refactor(ui): Calendar text styles use texts tokens"
```

---

### Task 6: `Dropdown.tsx` → `texts.body` / `texts.label` y `AppSelector.tsx` (quitar fontSize 14)

**Files:**
- Modify: `packages/ui/src/components/Dropdown.tsx`
- Modify: `packages/ui/src/components/card-form/AppSelector.tsx`

- [ ] **Step 1: `Dropdown.tsx`**

Agregar `texts` al import de `@antonella/theme` (ver imports actuales al editar).

```ts
triggerText: {
  fontSize: texts.body.fontSize,
  color: card.text.primary,
  flex: 1,
},
...
optionText: {
  fontSize: texts.label.fontSize,
  color: card.text.primary,
},
```

- [ ] **Step 2: `AppSelector.tsx` — quitar `fontSize: 14` de `optionText`**

```ts
optionText: {
  flex: 1,
},
```

(El `variant={TextType.Body}` ya fija 17/400.)

- [ ] **Step 3: Verificar**

Run: `pnpm --filter @antonella/ui typecheck`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/components/Dropdown.tsx packages/ui/src/components/card-form/AppSelector.tsx
git commit -m "refactor(ui): Dropdown/AppSelector use texts tokens"
```

---

### Task 7: Shell components → `texts.*`

**Files:**
- Modify: `packages/ui/src/components/PinKeypad.tsx`
- Modify: `packages/ui/src/components/DashboardShell/MobileHeader.tsx`
- Modify: `packages/ui/src/components/DashboardShell/Sidebar.tsx`
- Modify: `packages/ui/src/components/DashboardShell/DashboardShell.tsx`

- [ ] **Step 1: `PinKeypad.tsx` — dígitos 24/600 → `texts.title`**

Agregar `texts` al import de `@antonella/theme`.

```ts
keyText: {
  fontSize: texts.title.fontSize,
  fontWeight: texts.title.fontWeight,
},
```

- [ ] **Step 2: `MobileHeader.tsx` — título 18/700 → `texts.bodyBold`**

Agregar `import { texts } from "@antonella/theme";` (no importa nada de theme hoy).

```ts
title: {
  flex: 1,
  fontSize: texts.bodyBold.fontSize,
  fontWeight: texts.bodyBold.fontWeight,
  marginLeft: 8,
},
```

- [ ] **Step 3: `Sidebar.tsx`**

Agregar `import { texts } from "@antonella/theme";`.

```ts
sectionTitle: {
  fontSize: texts.overline.fontSize,
  fontWeight: texts.overline.fontWeight,
  letterSpacing: texts.overline.letterSpacing,
  textTransform: texts.overline.textTransform,
  paddingHorizontal: 14,
  marginBottom: 8,
},
itemLabel: {
  flex: 1,
  fontSize: texts.bodyMedium.fontSize,
  fontWeight: texts.bodyMedium.fontWeight,
},
badgeText: {
  fontSize: texts.caption.fontSize,
  fontWeight: texts.caption.fontWeight,
},
```

- [ ] **Step 4: `DashboardShell.tsx` (brandStyles)**

Agregar `texts` al import de theme (hoy: `import { resolveShellTokens } from "@antonella/theme";`).

```ts
brandMarkText: {
  fontSize: texts.heading.fontSize,
  fontWeight: texts.heading.fontWeight,
},
brandName: {
  flex: 1,
  fontSize: texts.bodyBold.fontSize,
  fontWeight: texts.bodyBold.fontWeight,
},
logoutLabel: {
  fontSize: texts.bodyMedium.fontSize,
  fontWeight: texts.bodyMedium.fontWeight,
},
```

- [ ] **Step 5: Verificar**

Run: `pnpm --filter @antonella/ui typecheck`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/components/PinKeypad.tsx packages/ui/src/components/DashboardShell/MobileHeader.tsx packages/ui/src/components/DashboardShell/Sidebar.tsx packages/ui/src/components/DashboardShell/DashboardShell.tsx
git commit -m "refactor(ui): shell components use texts tokens"
```

---

### Task 8: Sección "Textos" en el explorador

**Files:**
- Rewrite: `apps/playground/src/explorer/categories/tipografia.tsx`

- [ ] **Step 1: Reescribir `tipografia.tsx`** — lista los 11 tipos con iOS equiv., size/weight, caso de uso y muestra, más la entrada existente `AppTextHeader`.

```tsx
import { StyleSheet, View } from "react-native";
import { AppTextHeader, Text } from "@antonella/ui";
import { text, texts, TextType } from "@antonella/theme";
import type { ComponentCategory } from "../types";

const TYPE_ENTRIES: {
  type: TextType;
  ios: string;
  weight: string;
  usage: string;
}[] = [
  { type: TextType.Title, ios: "Title 1", weight: "Bold", usage: "Título de pantalla" },
  { type: TextType.Subtitle, ios: "Title 2", weight: "Bold", usage: "Subtítulo de pantalla / secciones grandes" },
  { type: TextType.Heading, ios: "Title 3", weight: "Semibold", usage: "Encabezado de card / sección" },
  { type: TextType.BodyBold, ios: "Headline", weight: "Semibold", usage: "Texto destacado en cards / botones" },
  { type: TextType.Body, ios: "Body", weight: "Regular", usage: "Texto base, valor de inputs" },
  { type: TextType.BodyMedium, ios: "Callout", weight: "Medium", usage: "Énfasis medio (chips, títulos de card)" },
  { type: TextType.Label, ios: "Subheadline", weight: "Semibold", usage: "Labels de formularios" },
  { type: TextType.Caption, ios: "Footnote", weight: "Regular", usage: "Descripciones secundarias" },
  { type: TextType.CaptionMedium, ios: "—", weight: "Medium", usage: "Caption con énfasis" },
  { type: TextType.Overline, ios: "Caption 2", weight: "Semibold", usage: "Micro-etiquetas (uppercase)" },
  { type: TextType.Placeholder, ios: "Body", weight: "Regular", usage: "Placeholder de inputs" },
];

function TypeSample({ entry }: { entry: (typeof TYPE_ENTRIES)[number] }) {
  const style = texts[entry.type];
  return (
    <View style={styles.sample}>
      <Text variant={entry.type}>Antonella {entry.ios}</Text>
      <Text variant={TextType.Caption} color={text.secondary}>
        {entry.type} · {style.fontSize}/{style.fontWeight} · {entry.weight} — {entry.usage}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sample: {
    gap: 4,
  },
});

export const tipografia: ComponentCategory = {
  id: "tipografia",
  title: "Textos",
  icon: "document-text",
  components: [
    {
      id: "escala",
      name: "Escala de texto (iOS)",
      description: "Los 11 tipos del DS con su equivalente iOS, tamaño/peso y caso de uso.",
      variants: TYPE_ENTRIES.map((entry) => ({
        id: entry.type,
        label: `${entry.type} · ${entry.ios}`,
        render: () => <TypeSample entry={entry} />,
      })),
    },
    {
      id: "app-text-header",
      name: "AppTextHeader",
      description: "Encabezado simple: heading + caption.",
      variants: [
        {
          id: "con-caption",
          label: "Con caption",
          render: () => <AppTextHeader heading="Resumen de la semana" caption="Últimos 7 días · 3 reportes" />,
        },
        {
          id: "solo-heading",
          label: "Solo heading",
          render: () => <AppTextHeader heading="Inventario" />,
        },
      ],
    },
  ],
};
```

- [ ] **Step 2: Verificar**

Run: `pnpm --filter @antonella/playground typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add apps/playground/src/explorer/categories/tipografia.tsx
git commit -m "feat(playground): add Textos section listing text scale with use cases"
```

---

### Task 9: Verificación final

**Files:**
- None (verificación)

- [ ] **Step 1: Typecheck de todo el monorepo**

Run: `pnpm typecheck`
Expected: `Tasks: 9 successful, 9 total`

- [ ] **Step 2: Git limpio**

Run: `git status`
Expected: solo untracked pre-existentes (`dev.err`, `.opencode/`), nada más.

---

## Self-Review

**Spec coverage:**
- Escala iOS en `texts.ts` → Task 1 ✓
- Migración de todos los hardcoded a tipos → Tasks 2–7 ✓ (Input, TextField, Button, Chip, Calendar, Dropdown, AppSelector, PinKeypad, MobileHeader, Sidebar, DashboardShell)
- Caso de uso de cada texto → Task 1 (JSDoc) + Task 8 (sección Textos) ✓
- Sección "Textos" lista todos los tipos → Task 8 ✓
- Sin renombrar `TextType` → se mantienen nombres ✓
- Fuente del sistema (sin bundle) → no se toca ✓

**Placeholder scan:** sin TBD/TODO; todo tiene código exacto. La verificación usa typecheck porque el repo no tiene framework de tests.

**Type consistency:** `texts.*` expone `fontSize`/`fontWeight`/`lineHeight`/`letterSpacing`/`textTransform` con los mismos nombres que ya se usan en estilos; `TextType` mantiene los mismos valores de string.
