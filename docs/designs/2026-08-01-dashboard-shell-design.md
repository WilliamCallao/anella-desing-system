# DashboardShell — Design

**Fecha:** 2026-08-01 · **Estado:** aprobado · **Paquete:** `@antonella/ui` + tokens en `@antonella/theme`

## Objetivo

Componente de layout reutilizable para aplicaciones empresariales (ERPs, paneles de
administración, dashboards operativos, logística, inventario, contabilidad). Responsable
únicamente de: **layout, navegación, comportamiento responsive y manejo de scroll**.
El contenido de negocio se inyecta por children (content slot).

Funciona en tablet landscape (target primario), tablet portrait, mobile y futuro desktop.

## Principios visuales

- Toda la app parece estar dentro de una **card** flotando sobre el fondo del sidebar.
- El color del sidebar actúa como fondo de la aplicación.
- Sin sombras, sin elevation: profundidad por color-blocking (ver `docs/DESIGN.md`).
- Esquinas grandes redondeadas en la content card.
- Jerarquía: Screen Background → Sidebar Color Layer → Rounded Content Card → Contenido.

## Tokens (en `@antonella/theme`)

```ts
type DashboardShellTokens = {
  sidebarBackground: string
  sidebarText: string
  sidebarActiveBackground: string
  sidebarActiveText: string
  contentBackground: string
  borderRadius: number
  spacing: number // margen exterior de la content card
}
```

- `shellTokens` (light) y `darkShellTokens` (dark) derivados de `palette` / `darkPalette`.
- `resolveShellTokens(mode: "light" | "dark"): DashboardShellTokens`.
- Sin colores hardcodeados en el componente. `tokens` prop permite override parcial (custom).

Defaults (light): sidebarBackground = `palette.surface`, contentBackground = `palette.background`,
active = `palette.primary`. Dark: equivalentes de `darkPalette`.

## API

```ts
type SidebarItem = {
  id: string
  label: string
  icon?: ReactNode
  badge?: string | number
  active?: boolean
  disabled?: boolean
  onPress?: () => void
  accessibilityLabel?: string
  testID?: string
}

type SidebarSection = {
  id: string
  title?: string
  items: SidebarItem[]
}

type SidebarMode = "auto" | "full" | "compact"

type DashboardShellProps = {
  sections: SidebarSection[]
  sidebarHeader?: ReactNode   // logo, avatar, selector de proyecto/finca/sucursal
  sidebarFooter?: ReactNode   // logout, usuario actual, versión
  topBar?: ReactNode          // toolbar dentro de la content card (tablet)
  title?: string              // solo móvil: header hamburguesa + título
  mode?: SidebarMode          // default "auto"
  themeMode?: "light" | "dark" // default "light" — resuelve tokens
  tokens?: Partial<DashboardShellTokens> // override custom
  selectedItemId?: string     // resalta el item activo
  children: ReactNode
}
```

`active` (por item) y/o `selectedItemId` determinan el item seleccionado. La selección se
mantiene visible tras navegar (es estado controlado por el padre).

## Estructura

```
DashboardShell
├── Sidebar (tablet)          ├── MobileHeader (móvil)
│   ├── Header (slot)         │   ├── Botón hamburguesa
│   ├── Sections              │   └── Título
│   ├── Navigation Items      └── MobileDrawer (Modal animado)
│   └── Footer (slot)             └── reusa Header/Sections/Footer
└── Content Card
    ├── Top Bar (opcional)
    └── Content Area (ScrollView tablet)
```

## Responsive

- `useWindowDimensions` (width).
- Breakpoints: width ≥ 1024 → **full** · 600–1023 → **compact** · < 600 → **móvil**.
- `mode` prop: `"auto"` usa breakpoints; `"full"`/`"compact"` fuerzan en tablet.
- En móvil siempre drawer (ignora `mode`).

## Scroll (contrato)

> Detalle operativo: `packages/ui/src/components/DashboardShell/SCROLL_CONTRACT.md`.

- **Tablet**: `Sidebar` fijo 100% alto, `TopBar` fijo, layout fijo. Solo el contenido
  (ScrollView del shell dentro de la content card) scrollea. La página nunca scrollea.
- **Móvil**: header sticky. El shell **no** envuelve en ScrollView; la pantalla hace el
  scroll normal (FlatList/ScrollView propios). Sin doble scroll.
- La selección del item en móvil: ejecuta `onPress` y cierra el drawer.

## Móvil

- Header sticky full-width, color sidebar: hamburguesa + `title`.
- Drawer: Modal transparente + slide izquierda (RN Animated, sin deps nuevas).
  Ancho ≈ 300 (o 80% pantalla). Backdrop toca fuera → cierra.

## Accesibilidad

- Cada item: `Pressable` ≥ 44px alto, `accessibilityRole="button"`,
  `accessibilityState={{ selected, disabled }}`, `accessibilityLabel` y `testID`.
- Estados pressed / active / disabled visibles (bg + color de texto/ícono).
- Badge: contenedor accesible (texto).
- Navegación por teclado / focus: nota futura (desktop).

## Dependencias

- Peer nuevo en `@antonella/ui`: `react-native-safe-area-context` (SafeAreaView del shell;
  requiere `SafeAreaProvider` en el root de la app).
- Resto: peers existentes (react, react-native, react-native-reanimated).

## Archivos

- `packages/theme/src/shellTokens.ts` (nuevo) + export en `packages/theme/src/index.ts`.
- `packages/ui/src/components/DashboardShell/types.ts`
- `packages/ui/src/components/DashboardShell/DashboardShell.tsx`
- `packages/ui/src/components/DashboardShell/Sidebar.tsx`
- `packages/ui/src/components/DashboardShell/MobileHeader.tsx`
- `packages/ui/src/components/DashboardShell/MobileDrawer.tsx`
- `packages/ui/src/index.ts` (export DashboardShell + tipos)
- Playground: pantalla demo consumiendo el shell.

## Verificación

- `pnpm typecheck` (9/9).
- Playground: render tablet/móvil del shell.
- App consumidora (`Process_Management/app`): integrar el shell y verificar bundle
  (`npx expo export -p android` + Expo Go).
- Tests automatizados: diferidos (sin runner en el monorepo por ahora).

## Fuera de alcance

- Render de contenido de negocio.
- Temas del shell fuera de light/dark/custom-tokens.
- Navegación por teclado funcional (desktop) — solo a11y básica por ahora.
