# TextField + sección Inputs — Plan de Implementación

> **For agentic workers:** Use `mobiai-mobile-executing-plans-with-subagents` (recommended) or `mobiai-mobile-executing-plans` to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Agregar al DS el componente `TextField` (input de texto típico iOS: label fijo arriba, campo gris claro redondeado con placeholder abajo) y exponerlo en una sección nueva "Inputs" del explorador de componentes del playground.

**Architecture:** `TextField` vive en `packages/ui/src/components/TextField/` como componente self-contained (un `TextInput` dentro de un `View`, sin depender de `card-form`). Se exporta desde el índice del paquete UI y se consume en una categoría nueva `inputs.tsx` del registro del explorador (`apps/playground/src/explorer/categories/`), agregada a `registry.ts` con su posición en la lista de categorías.

**Tech Stack:** React Native, Expo SDK 54, TypeScript, pnpm monorepo (turborepo)

**Platform:** React Native (Expo SDK 54)

**Verificación:** Este repo no tiene framework de tests unitarios (solo `typecheck` y `lint`). La verificación de cada task es `pnpm typecheck` (raíz, turbo) y `pnpm --filter @antonella/ui typecheck`. La verificación visual se hace en el playground corriendo `pnpm dev`.

---

## Archivos afectados

| Archivo | Acción |
|---------|--------|
| `packages/ui/src/components/TextField/TextField.tsx` | **Create** — componente `TextField` |
| `packages/ui/src/components/TextField/index.ts` | **Create** — re-export |
| `packages/ui/src/index.ts` | **Modify** — `export * from "./components/TextField"` |
| `apps/playground/src/explorer/categories/inputs.tsx` | **Create** — categoría "Inputs" con demos |
| `apps/playground/src/explorer/registry.ts` | **Modify** — import + posición en `componentCategories` |

---

### Task 1: Crear el componente `TextField`

**Files:**
- Create: `packages/ui/src/components/TextField/TextField.tsx`
- Create: `packages/ui/src/components/TextField/index.ts`

- [ ] **Step 1: Crear `packages/ui/src/components/TextField/TextField.tsx`**

```tsx
import React from "react";
import {
  StyleSheet,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { background, palette, spacing, text, texts, TextType } from "@antonella/theme";
import { Text } from "../text/Text";

export interface TextFieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  /** Default `true`. */
  editable?: boolean;
  /** Default `false`. */
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  maxLength?: number;
  /** Default `false`. */
  multiline?: boolean;
  /** Texto de error opcional, se muestra debajo del campo en rojo. */
  error?: string;
  /** Estilo del contenedor (label + campo). */
  style?: StyleProp<ViewStyle>;
}

const FIELD_RADIUS = 10;
const FIELD_MIN_HEIGHT = 44;
const FIELD_MULTILINE_MIN_HEIGHT = 96;

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  editable = true,
  secureTextEntry = false,
  keyboardType,
  autoCapitalize,
  maxLength,
  multiline = false,
  error,
  style,
}: TextFieldProps) {
  return (
    <View style={[styles.container, style]}>
      <Text variant={TextType.Label} numberOfLines={1}>
        {label}
      </Text>
      <TextInput
        style={[
          styles.field,
          multiline && styles.fieldMultiline,
          !editable && styles.fieldDisabled,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={texts.placeholder.color}
        editable={editable}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        maxLength={maxLength}
        multiline={multiline}
        selectionColor={text.default}
        underlineColorAndroid="transparent"
      />
      {error ? (
        <Text variant={TextType.Caption} color={palette.danger}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  field: {
    minHeight: FIELD_MIN_HEIGHT,
    borderRadius: FIELD_RADIUS,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: background.content.primary,
    color: text.default,
    outlineWidth: 0,
    textAlignVertical: "top",
  },
  fieldMultiline: {
    minHeight: FIELD_MULTILINE_MIN_HEIGHT,
  },
  fieldDisabled: {
    opacity: 0.5,
  },
});
```

- [ ] **Step 2: Crear `packages/ui/src/components/TextField/index.ts`**

```ts
export * from "./TextField";
```

- [ ] **Step 3: Verificar typecheck del paquete UI**

```bash
pnpm --filter @antonella/ui typecheck
```

Expected: PASS (sin errores). Si TypeScript se queja de `outlineWidth` o `textAlignVertical` (tipos web del TextInput), quitarlos de `styles.field`.

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/components/TextField/
git commit -m "feat(ui): add TextField component (iOS-style labeled input)"
```

---

### Task 2: Exportar `TextField` desde el paquete UI

**Files:**
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 1: Agregar el export**

En `packages/ui/src/index.ts`, junto a los demás `export * from "./components/..."`, agregar la línea:

```ts
export * from "./components/TextField";
```

(Insertarla cerca de las otras: después de `export * from "./components/ToolsCard";` y antes de `export * from "./components/text";`.)

- [ ] **Step 2: Verificar typecheck del paquete UI**

```bash
pnpm --filter @antonella/ui typecheck
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/index.ts
git commit -m "feat(ui): export TextField from package index"
```

---

### Task 3: Crear la categoría "Inputs" en el explorador

**Files:**
- Create: `apps/playground/src/explorer/categories/inputs.tsx`

- [ ] **Step 1: Crear `apps/playground/src/explorer/categories/inputs.tsx`**

```tsx
import React, { useState } from "react";
import { TextField } from "@antonella/ui";
import type { ComponentCategory } from "../types";

function BasicDemo() {
  const [value, setValue] = useState("");
  return (
    <TextField
      label="Nombre"
      value={value}
      onChangeText={setValue}
      placeholder="Nombre y apellido"
    />
  );
}

function PlaceholderDemo() {
  const [value, setValue] = useState("");
  return (
    <TextField
      label="Campo"
      value={value}
      onChangeText={setValue}
      placeholder="Ingresá un valor…"
    />
  );
}

function WithValueDemo() {
  const [value, setValue] = useState("María Antonella");
  return (
    <TextField
      label="Nombre"
      value={value}
      onChangeText={setValue}
      placeholder="Nombre y apellido"
    />
  );
}

function MultilineDemo() {
  const [notes, setNotes] = useState("");
  return (
    <TextField
      label="Notas"
      value={notes}
      onChangeText={setNotes}
      placeholder="Algo que tengamos en cuenta…"
      multiline
    />
  );
}

function DisabledDemo() {
  return (
    <TextField
      label="Nombre"
      value="María Antonella"
      onChangeText={() => {}}
      editable={false}
    />
  );
}

function ErrorDemo() {
  const [value, setValue] = useState("");
  return (
    <TextField
      label="Email"
      value={value}
      onChangeText={setValue}
      placeholder="nombre@empresa.com"
      keyboardType="email-address"
      error="Este campo es obligatorio"
    />
  );
}

function SecureDemo() {
  const [value, setValue] = useState("");
  return (
    <TextField
      label="Contraseña"
      value={value}
      onChangeText={setValue}
      placeholder="••••••••"
      secureTextEntry
    />
  );
}

export const inputs: ComponentCategory = {
  id: "inputs",
  title: "Inputs",
  icon: "pencil",
  components: [
    {
      id: "text-field",
      name: "TextField",
      description: "Input de texto estilo iOS: label fijo arriba, campo gris redondeado con placeholder debajo.",
      variants: [
        { id: "basico", label: "Básico", render: () => <BasicDemo /> },
        { id: "placeholder", label: "Placeholder", render: () => <PlaceholderDemo /> },
        { id: "valor", label: "Con valor", render: () => <WithValueDemo /> },
        { id: "multiline", label: "Multilínea", render: () => <MultilineDemo /> },
        { id: "deshabilitado", label: "Deshabilitado", render: () => <DisabledDemo /> },
        { id: "error", label: "Con error", render: () => <ErrorDemo /> },
        { id: "seguro", label: "Seguro", render: () => <SecureDemo /> },
      ],
    },
  ],
};
```

Nota: cada demo es un `TextField` suelto; `ComponentShowcase` ya separa las variantes con `gap`, no hace falta `AppFormCard` ni un `View` extra por demo. No importar `View`/`spacing` — no se usan y el `tsc` con `noUnusedLocals` los rechazaría.

- [ ] **Step 2: Commit**

```bash
git add apps/playground/src/explorer/categories/inputs.tsx
git commit -m "feat(playground): add Inputs category with TextField demos"
```

---

### Task 4: Registrar la categoría en `registry.ts`

**Files:**
- Modify: `apps/playground/src/explorer/registry.ts`

- [ ] **Step 1: Importar `inputs` y agregarlo al array**

En `apps/playground/src/explorer/registry.ts`:

1. Agregar el import (alfabético, después de `formularios`):

```ts
import { inputs } from "./categories/inputs";
```

2. Agregar `inputs` al array, después de `formularios`:

```ts
export const componentCategories = [
  formularios,
  inputs,
  animaciones,
  botones,
  dialogos,
  checklists,
  filtros,
  other,
  tipografia,
];
```

- [ ] **Step 2: Verificar typecheck del playground**

```bash
pnpm --filter @antonella/playground typecheck
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/playground/src/explorer/registry.ts
git commit -m "feat(playground): register Inputs category in explorer"
```

---

### Task 5: Verificación integral

- [ ] **Step 1: Typecheck del monorepo**

```bash
pnpm typecheck
```

Expected: PASS en todos los paquetes (9/9).

- [ ] **Step 2: Lint**

```bash
pnpm lint
```

Expected: PASS (sin errores de reglas).

- [ ] **Step 3: Verificación visual en el playground**

```bash
cd apps/playground && pnpm dev
```

Abrir la app → Home → "Explorar componentes" → verificar que aparece la categoría "Inputs" con ícono de lápiz después de "Formularios" → entrar y chequear las 7 variantes: básico, placeholder, con valor, multilínea, deshabilitado (opacidad), con error (rojo debajo) y seguro (puntos).

---

## Notas

- El `TextField` es independiente de `card-form`; no comparte `AppInputProps`. Si más adelante se quiere unificar, es un refactor aparte.
- La label usa `TextType.Label` (15/600) con `texts.label`; el campo `texts.body` (14/400) — ver `packages/theme/src/texts.ts`.
- El gris del campo es `background.content.primary` (`#F2F2F7`), el placeholder `texts.placeholder.color` (`#C7C7CC`), el error `palette.danger` (`#FF3B30`).
- Icono "pencil" mapea a `create-outline` en `Icon.tsx` (ya existe).
