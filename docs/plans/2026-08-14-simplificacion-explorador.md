# Simplificación del Explorador de Componentes - Plan de Implementación

> **For agentic workers:** Use `mobiai-mobile-executing-plans-with-subagents` (recommended) or `mobiai-mobile-executing-plans` to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Simplificar la interfaz del playground: quitar el FAB de la pantalla principal, convertir los ítems del menú lateral/drawer en navegación directa, separar AppButton en su propia categoría "Buttons", eliminar los Cards de los demos de formulario, y aclarar la diferencia entre AppInput (contrato/solo tipos) y AppTextInput (implementación real).

**Architecture:** La navegación ya está basada en expo-router con `/explorer` (lista de categorías) y `/explorer/[category]` (detalle). El flujo cambia: en lugar de FAB → Drawer → seleccionar categoría, los ítems de la lista de categorías de la pantalla principal navegan directamente. Se reorganizan los componentes en `formularios.tsx`: los inputs van sin wrapper de `AppFormCard`, y `AppButton` se mueve a una nueva categoría `botones.tsx`.

**Tech Stack:** React Native, Expo Router, TypeScript, pnpm monorepo

**Platform:** React Native (Expo SDK 54)

---

## Análisis de cambios

### 1. Pantalla principal (`apps/playground/src/app/explorer/index.tsx`)
- Actualmente: lista de categorías + FAB flotante bottom-left que abre `ComponentDrawer`
- Deseado: lista de categorías hace clic → navega directamente a `/explorer/[category]`. Quitar FAB. Quitar `ComponentDrawer` import.

### 2. Componentes de formulario (`apps/playground/src/explorer/categories/formularios.tsx`)
- **AppInput vs AppTextInput**: `AppInput.tsx` es SOLO un tipo/contract (`AppInputProps`, `AppInputElement`). `AppTextInput` e `AppTextArea` son las implementaciones que consumen ese contrato. No es un componente visual.
- Quitar `AppButton` de formularios → va a nueva categoría.
- Quitar `AppFormCard` de los demos (no envolver inputs en card). Mostrar los inputs directamente.
- Quitar `AppInput` de los demos también (es solo un tipo, no se muestra nada).

### 3. Nueva categoría "Botones" (`apps/playground/src/explorer/categories/botones.tsx`)
- Contendrá `AppButton` (del card-form) y `Button` (del paquete ui principal).
- Registrar en `registry.ts`.

---

## Tareas

### Task 1: Crear categoría "Botones"

**Files:**
- Create: `apps/playground/src/explorer/categories/botones.tsx`
- Modify: `apps/playground/src/explorer/registry.ts:2` (import + export)

- [ ] **Step 1: Write the new botones.tsx file**

```tsx
import { View } from "react-native";
import { AppButton, Button } from "@antonella/ui";
import type { ComponentCategory } from "../types";
import { demoStyles } from "./shared";
import { noop } from "./shared";

export const botones: ComponentCategory = {
  id: "botones",
  title: "Botones",
  icon: "power",
  components: [
    {
      id: "app-button",
      name: "AppButton",
      description: "Botón de formulario con variantes solid, outline y ghost.",
      variants: [
        { id: "solid", label: "Solid", render: () => <AppButton label="Guardar" onPress={noop} /> },
        { id: "outline", label: "Outline", render: () => <AppButton label="Cancelar" variant="outline" onPress={noop} /> },
        { id: "ghost", label: "Ghost", render: () => <AppButton label="Más información" variant="ghost" onPress={noop} /> },
        { id: "disabled", label: "Deshabilitado", render: () => <AppButton label="Guardar" disabled /> },
      ],
    },
    {
      id: "button",
      name: "Button",
      description: "Botón general con variantes primary, secondary, ghost y danger.",
      variants: [
        { id: "row", label: "Row", render: () => (
          <View style={demoStyles.row}>
            <Button label="Primary" variant="primary" onPress={noop} />
            <Button label=" Secondary" variant="secondary" onPress={noop} />
            <Button label="Ghost" variant="ghost" onPress={noop} />
            <Button label="Danger" variant="danger" onPress={noop} />
          </View>
        )},
        { id: "sizes", label: "Sizes", render: () => (
          <View style={demoStyles.row}>
            <Button label="Sm" size="sm" onPress={noop} />
            <Button label="Md" size="md" onPress={noop} />
            <Button label="Lg" size="lg" onPress={noop} />
          </View>
        )},
      ],
    },
  ],
};
```

- [ ] **Step 2: Modify registry.ts**

```bash
# Add import line after filtros import
# Add botones to componentCategories array
```

### Task 2: Actualizar formularios.tsx — quitar AppButton y AppFormCard, eliminar AppInput demo

**Files:**
- Modify: `apps/playground/src/explorer/categories/formularios.tsx`

- [ ] **Step 1: Remove AppButton imports and component entry**

Delete:
- `AppButton,` from imports
- The entire `app-button` component entry (lines 170-180)
- `import { noop } from "./shared"` (if not used elsewhere — it's still used by AppButton in shared)

- [ ] **Step 2: Remove AppInput component entry**

Delete the `AppInput` component entry (lines 131-138) — it's just a type contract, not a visual component.

- [ ] **Step 3: Quitar AppFormCard wrapper de los demos**

Los `FormBasicDemo`, `FormCompleteDemo`, `AppInputDefaultDemo`, `AppInputCustomWidthDemo` usarán los inputs directamente sin `AppFormCard`.

```tsx
// Antes:
<AppFormCard>
  <AppTextInput ... />
</AppFormCard>

// Después:
<AppTextInput ... />
```

- [ ] **Step 4: Update AppFormCard component entry**

Mantener `AppFormCard` como componente registrado pero los demos ya no usan card. El card sigue existiendo como componente, solo no se usa como envoltorio en demos.

### Task 3: Actualizar pantalla principal — quitar FAB y navegación directa

**Files:**
- Modify: `apps/playground/src/app/explorer/index.tsx`

- [ ] **Step 1: Remove FloatingActionButton y ComponentDrawer imports**

Delete:
- `FloatingActionButton` from imports
- `ComponentDrawer` from imports
- `useState` (si no se usa para drawer)

- [ ] **Step 2: Remove FAB JSX and drawer state**

Delete:
- `const [drawerOpen, setDrawerOpen] = useState(false);`
- `<FloatingActionButton ... />`
- `<ComponentDrawer ... />`

- [ ] **Step 3: Add onPress to category items for direct navigation**

Convertir cada item de la leyenda en un `Pressable` que navegue directamente:

```tsx
<Pressable
  key={category.id}
  onPress={() => handleSelectCategory(category)}
  style={({ pressed }) => [styles.legendRow, pressed && styles.pressed]}
  accessibilityRole="button"
>
  {/* existing content */}
</Pressable>
```

- [ ] **Step 4: Simplify handleSelectCategory**

```tsx
const handleSelectCategory = (category: ComponentCategory) => {
  router.push(`/explorer/${category.id}`);
};
```

### Task 4: Verificar build y tipos

- [ ] **Step 1: Run typecheck**

```bash
cd C:\Projects\iKonSoft\antonella && npx tsc --noEmit -p apps/playground/tsconfig.json
```

- [ ] **Step 2: Verify app builds**

```bash
cd C:\Projects\iKonSoft\antonella && pnpm --filter playground build 2>&1 || true (expose full output if fails)
```

---

## Archivos afectados

| Archivo | Acción |
|---------|--------|
| `apps/playground/src/app/explorer/index.tsx` | Remove FAB, drawer, add direct navigation |
| `apps/playground/src/explorer/categories/formularios.tsx` | Remove AppButton entry, remove AppInput entry, remove AppFormCard wrappers |
| `apps/playground/src/explorer/categories/botones.tsx` | **Create** — new category with AppButton + Button |
| `apps/playground/src/explorer/registry.ts` | Add `botones` import and to array |
| `apps/playground/src/explorer/ComponentDrawer.tsx` | **Opcional** — puede eliminarse si ya no se usa |

## Notas sobre AppInput vs AppTextInput

- **`AppInput.tsx`** (8 líneas): Solo define `AppInputProps` (label, labelWidth) y el tipo genérico `AppInputElement`. Es un **contrato/tipo**, no un componente visual. Sirve para que `AppFormCard` genere clones tipados.
- **`AppTextInput`** y **`AppTextArea`**: Son las implementaciones concretas que consumen `AppInputProps` y renderizan la UI real.

No se mostrará `AppInput` como componente en el explorador porque no tiene UI.
