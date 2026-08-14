# TextField + sección Inputs — Design

**Fecha:** 2026-08-14 · **Estado:** aprobado · **App:** `apps/playground` + `@antonella/ui`

## Objetivo

Agregar al DS un **input de texto típico iOS** (`TextField`): label fijo arriba y campo
redondeado de fondo gris claro debajo, con placeholder adentro. Complementa a la familia
`App*` de formularios (label a la izquierda dentro de `AppFormCard`) sin reemplazarla.
Se expone en una **sección nueva "Inputs"** del explorador de componentes.

## Componente: `TextField`

### Ubicación

```
packages/ui/src/components/TextField/
  TextField.tsx
  index.ts
```

- Exportado desde `packages/ui/src/index.ts` como `export * from "./components/TextField"`.
- **Independiente** de `card-form` (no usa `AppInput`/`AppTextInput`/`AppFormCard`).
- No comparte código con el `Input` existente (look distinto: gris claro redondeado vs borde).

### API

```ts
export interface TextFieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  editable?: boolean;          // default true
  secureTextEntry?: boolean;   // default false
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  maxLength?: number;
  multiline?: boolean;         // default false
  error?: string;              // opcional: texto de error debajo del campo
  style?: StyleProp<ViewStyle>; // estilo del contenedor (label + campo)
}
```

- Componente controlado (`value` + `onChangeText`), mismo patrón que `AppTextInput`.
- Sin prop `labelPosition`: el label **siempre arriba** (decisión de diseño, estándar iOS).

### Look & tokens

| Elemento          | Valor                              | Token                                            |
| ----------------- | ---------------------------------- | ------------------------------------------------ |
| Label             | `texts.label` (15/600), color `text.default` | `texts.label`, `text.default`          |
| Gap label→campo   | 8                                 | `spacing.sm`                                     |
| Campo fondo       | gris claro `#F2F2F7`               | `background.content.primary`                     |
| Campo texto       | `texts.body` (14/400), color `text.default` | `texts.body`, `text.default`           |
| Placeholder       | `texts.placeholder`, `text.placeholder` | `texts.placeholder` (14, `#C7C7CC`)        |
| Campo borde       | sin borde visible (0)              | —                                                |
| Campo radio       | 10                                 | constante local (consistente con `Input.tsx`)    |
| Padding campo     | horizontal 12 / vertical 12        | `spacing.md`                                     |
| Campo min-height  | 44                                 | constante local (tamaño táctil iOS)              |
| Campo disabled    | opacidad 0.5 + `editable={false}`  | como `AppTextInput`                              |
| Error             | `texts.caption` color `palette.danger` debajo del campo | `texts.caption`, `palette.danger` |
| Error gap         | 4                                 | `spacing.xs`                                     |

- El campo usa `underlineColorAndroid="transparent"`, `outlineWidth: 0`, `selectionColor` = `text.default`.
- Al enfocar no cambia el fondo (estilo iOS); el foco se percibe por el cursor.
- `placeholderTextColor` = `text.placeholder`.

## Sección "Inputs" en el explorador

### Registry

Nuevo archivo `apps/playground/src/explorer/categories/inputs.tsx` que exporta:

```ts
export const inputs: ComponentCategory = {
  id: "inputs",
  title: "Inputs",
  icon: "pencil",             // create-outline (equivalente "edit" en Ionicons)
  components: [/* entradas TextField */],
};
```

Se agrega a `componentCategories` en `registry.ts`. Posición propuesta: después de
`formularios` (primera sección: `[formularios, inputs, animaciones, botones, dialogos, checklists, filtros, other, tipografia]`).

### Demos (variantes de `TextField`)

| Variante        | Descripción                                              |
| --------------- | -------------------------------------------------------- |
| Básico          | `TextField` con label "Nombre", placeholder "Nombre y apellido" |
| Placeholder     | Campo vacío mostrando el placeholder                     |
| Con valor       | Campo precargado (ej. "María Antonella")                 |
| Multilínea      | `multiline` para notas                                   |
| Deshabilitado   | `editable={false}` con valor fijo, opacidad reducida     |
| Con error       | `error="Este campo es obligatorio"` en rojo debajo       |
| Seguro          | `secureTextEntry` (ej. label "Contraseña")               |

Cada demo va en su propio `View` (sin `AppFormCard`, son inputs sueltos); usar `gap` de
`spacing.lg`/`spacing.xl` entre demos dentro de un grupo si hace falta, siguiendo el patrón
de `ComponentShowcase` que ya renderiza las variantes en cascada.

## Fuera de alcance

- No se toca la familia `card-form` (AppInput/AppTextInput/AppFormCard).
- No se modifica el `Input` existente (queda como está; posible migración futura a TextField).
- No se agrega `labelPosition` ni etiqueta flotante (Material) — el label es fijo arriba.
- No se agrega icono/left adorn al campo en esta iteración.
