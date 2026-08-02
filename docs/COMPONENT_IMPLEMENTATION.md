# Component Implementation Guide

**Package:** `@antonella/ui` · **Status:** active

## Objective

This guide defines the conventions every UI component in Antonella must follow.
Read it before creating or modifying any component.

## Core Principles

### 1. No business logic

Reusable DS components **must not** contain business logic. They receive data
and callbacks via props and remain agnostic of domain concepts.

- ✅ Accept `onPress?: () => void`, render `children`, or slot props
- ✅ Use optional props with sensible DS-only defaults (spacing, typography)
- ❌ Hardcoded text labels, routes, API calls, or domain constants
- ❌ Import from app-specific modules

**Exception:** `DashboardShell` accepts `brand?`, `logoutLabel?`, `onLogout?`
as fully optional escape hatches — these are not DS logic, they are injection
points. The DS never renders them unless the consumer provides them.

### 2. Fully typed API

Every component, every prop, every return type must be typed. No `any`,
no `React.FC` implicit children, no untyped callbacks.

```ts
// ✅ Typed props with explicit children field
type MyComponentProps = {
  label: string
  icon?: IconName
  onPress?: () => void
  children: ReactNode
}

function MyComponent({ label, icon, onPress, children }: MyComponentProps) { ... }
```

- Use `ReactNode` (not `any`) for children/slots
- Use `type` (not `interface`) for component props — `type` supports unions
- Mark all props optional with `?` when the component has a reasonable default
- Export all prop types from the component file and re-export from `@antonella/ui`

### 3. Responsive by default

Components that affect layout **must** handle three screen ranges. Breakpoints
are defined in the DS:

| Range | Width | Behavior |
|---|---|---|
| Small (mobile) | `< 600px` | Content-sized, no flex growth, scroll delegated to page |
| Medium (tablet) | `600–1023px` | Conditional layout (compact/full modes) |
| Wide (desktop) | `≥ 1024px` | Full layout, flex distribution, defined heights |

Key rule: **ScrollViews need a defined height.** A `ScrollView` with `flex: 0`
collapses to 0 height. When a component needs to scroll:

- If the child is in `EXPAND` mode (wide screen): render a `ScrollView` with `flex: 1`
- If the child is in `FIT` mode (small screen or explicit FIT): render a plain `View`
  (content-height); scrolling is delegated to a parent ScrollView/page

```ts
const computedSize = isSmall ? LayoutColumnSize.FIT : size
if (scroll && computedSize === LayoutColumnSize.EXPAND) {
  // Wide: child fills remaining height → scrollable viewport
  return <ScrollView style={{ flex: 1 }}>{children}</ScrollView>
}
// Small or FIT: child is content-height → plain View (no scroll needed)
return <View>{children}</View>
```

### 4. Sub-component pattern for layout primitives

Layout components (`LayoutColumn`, `LayoutRow`) use a **sub-component pattern**:

```tsx
<LayoutColumn debug>
  <LayoutColumn.First size={LayoutColumnSize.FIT}>
    <Text>Header</Text>
  </LayoutColumn.First>
  <LayoutColumn.Second size={LayoutColumnSize.EXPAND} scroll>
    <Text>Content</Text>
  </LayoutColumn.Second>
</LayoutColumn>
```

- Each child declares its own `size` (typed enum: `FIT` | `EXPAND`) and `scroll` (boolean)
- The parent provides shared context (debug mode, screen size via `useWindowDimensions`)
- The parent does **not** inject `flex` values — children self-manage based on size + screen
- Avoid `flex: 0` — use `undefined`/omitted `flex` for content-sizing (more reliable than `0`)

## File Structure

```
packages/ui/src/components/
├── MyComponent/
│   ├── MyComponent.tsx        # component implementation
│   ├── types.ts              # prop types + sub-types
│   ├── index.ts              # barrel (optional for complex components)
│   └── MYCOMPONENT.md        # design doc (if design-critical)
└── index.ts                  # re-exports all components + types
```

- Keep component + types in the same `.tsx` for small primitives (`Button`, `Text`)
- Use a folder with `types.ts` for complex components (`DashboardShell`, `Sidebar`)
- Design docs live in `/docs/designs/` at the monorepo root

## Token Access

Never hardcode colors, spacing, or border radii. Use tokens:

- From `@antonella/theme`: `resolveSemanticColors(mode)`, `resolveShellTokens(mode)`,
  `spacing`, `palette`
- Inside components that receive `tokens` prop: use `tokens.xxx`
- The `DashboardShell` passes resolved `DashboardShellTokens` to children — components
  inside the shell receive tokens via prop or context, never via direct theme import

## Debug Mode

Components should expose a `debug?: boolean` prop. When enabled:

- Render distinct background colors per child/region (use a fixed palette array)
- Do not change layout structure — only visual overlays
- Debug is propagated via React Context so nested children can read it

## Testing Checklist

Before committing a component:

1. `pnpm typecheck` passes (all 9 packages)
2. Component renders without errors in the Playground
3. Wide/medium/small screen behavior is correct
4. `debug` prop shows distinct regions
5. No `any` types (grep for `any`)
6. No business-logic strings/props baked in
7. Export is re-exported from `@antonella/ui`
8. If layout-affecting: README/docs reference the scroll contract

## Related

- [DashboardShell Scroll Contract](src/components/DashboardShell/SCROLL_CONTRACT.md)
- [Dashboard Shell Design](docs/designs/2026-08-01-dashboard-shell-design.md)
