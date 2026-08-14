# TreeEditor — Design

**Fecha:** 2026-08-14 · **Estado:** aprobado · **App:** `@antonella/ui` + `apps/playground`

## Objetivo

Componente para **ver y editar una estructura jerárquica de árbol** donde cada item
tiene un **código numérico** y un **nombre**. Permite agregar items fácilmente en
cualquier nivel: **dentro** de un nodo (hijo) o **al lado** (hermano), además de
editar y eliminar.

Es la **v1 funcional** para iterar con feedback del usuario.

## Principio rector

- **Componente controlado**: el estado vive afuera (`value`/`onChange`). El componente
  no guarda el árbol, solo muta copias inmutables y las devuelve.
- **Bosque**: `value` es un array de raíces (permite "agregar al lado" también en el nivel superior).
- Construido con bloques del DS existentes: `BottomSheet`, `AppResponsiveDialog`,
  `TextField`, `AppButton`, `Icon`, `Text`; tokens de `@antonella/theme`.

## Modelo de datos

```ts
export type TreeNode = {
  id: string;            // generado al crear (Date.now + random)
  code: number;          // código numérico
  name: string;          // nombre
  children: TreeNode[];
};

export type TreeEditorProps = {
  value: TreeNode[];
  onChange: (value: TreeNode[]) => void;
  rootLabel?: string;    // etiqueta del botón "+ Agregar raíz"
};
```

## Interacción

### Filas
- Indentación por nivel (profundidad × 20px).
- Chevron: expandir/colapsar si tiene hijos (`chevron-down`/`chevron-forward`); spacer si no.
- `code` (semibold, color `cta1`) + `name` (`card.text.primary`).
- Botón `⋮` (`more-horizontal`) al final de cada fila → abre un `BottomSheet`.

### BottomSheet de acciones por nodo
| Opción | Icono | Acción |
| ------ | ----- | ------ |
| Agregar hijo | `add` | Abre diálogo, inserta dentro del nodo |
| Agregar al lado | `arrow-down` | Abre diálogo, inserta después del nodo como hermano |
| Editar | `pencil` | Abre diálogo precargado |
| Eliminar | `trash` | Confirma con `Alert` y elimina el subárbol |

### Diálogo de alta/edición (`AppResponsiveDialog`)
- Título contextual: "Nuevo hijo de X" / "Nuevo al lado de X" / "Editar X" / "Nueva raíz".
- Campos `TextField`: **Código** (`keyboardType="number-pad"`) y **Nombre**.
- Al abrir un alta, sugiere el siguiente código libre (`maxCode + 1`), editable.
- Botones: Cancelar (ghost) + Guardar (solid).

### Validación
- `code`: obligatorio, numérico y **único en todo el árbol** (excluyendo el nodo en edición).
- `name`: obligatorio.
- Los errores se muestran en el `error` prop de cada `TextField` y bloquean Guardar.

### Agregar raíz
Botón "+ Agregar raíz" arriba de la lista → mismo diálogo, inserta en el nivel superior.

## Helpers (exportados)

Funciones puras que operan sobre el bosque (devuelven nuevos arrays):

- `createNode(code, name): TreeNode`
- `addChild(nodes, parentId, node): TreeNode[]`
- `addSibling(nodes, nodeId, node): TreeNode[]`
- `updateNode(nodes, nodeId, patch): TreeNode[]`
- `removeNode(nodes, nodeId): TreeNode[]`
- `findNode(nodes, nodeId): TreeNode | undefined`
- `hasCode(nodes, code, excludeId?): boolean`
- `maxCode(nodes): number`

## Explorador

Categoría nueva **"Árbol"** (`id: arbol`, `icon: git-network`) con un demo de plan de
cuentas de ejemplo (3 raíces, ~9 nodos). El demo envuelve el TreeEditor en una
superficie blanca (`card.background`, padding, radius) para contraste con el fondo
gris, igual que los demos de inputs.

## Verificación

- `pnpm --filter @antonella/ui typecheck`
- `pnpm --filter @antonella/playground typecheck`
- `pnpm typecheck` (monorepo 9/9)

## Fuera de alcance (v1)

- No hay drag & drop para reordenar (solo agregar/editar/eliminar).
- No hay búsqueda/filtro del árbol.
- No hay persistencia (el consumidor decide dónde guardar el árbol).
- El código se ingresa manualmente (la sugerencia `maxCode + 1` es editable).
- Eliminar usa `Alert` nativo de RN (no un diálogo del DS) por simplicidad.
