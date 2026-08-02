# DashboardShell — Scroll Contract

Rules for scroll behavior within the shell. Prevents nested-scroll issues and
keeps the visual hierarchy clean.

## Tablet / Desktop (width >= 600)

- The shell layout is **fixed**: sidebar spans full height, `topBar` is fixed.
- The content card is a **plain `<View>`** (`flex: 1`), NOT a ScrollView.
- Scrolling is handled by **layout primitives** (`LayoutColumn`, `LayoutRow`)
  via their `scroll` prop. A child with `scroll` + `EXPAND` renders a
  `<ScrollView style={{ flex: 1 }}>`; a child with `scroll` + `FIT` renders a
  plain `<View>` (content height, no scroll).
- Screens should NOT wrap their entire content in a top-level `ScrollView`.
  Use `LayoutColumn.Second ... scroll` for scrollable regions instead.

## Mobile (width < 600)

- Header is sticky (sidebar header + title).
- Children render directly, no ScrollView wrapper.
- The screen is responsible for its own scroll (`ScrollView` / `FlatList`).
- LayoutColumn children on mobile: both are `FIT` (content height). If a child
  has `scroll` but is `FIT`, it renders a plain `View` — no individual scroll.
  Overflow scrolls via the page-level scroll that the screen provides.

## General Rules

| Scenario | Scroll mechanism |
|---|---|
| Long content in EXPAND region | `LayoutColumn.Second scroll` → inner ScrollView |
| Content fits screen | No scroll, plain View |
| Mobile page scroll | Screen provides its own ScrollView/FlatList |

- Do NOT nest `ScrollView` inside `ScrollView` with `flex` unless absolutely
  necessary — causes gesture conflicts.
- `flex: 0` on a ScrollView collapses to 0 height — use `flex: 1` on scrollable
  ScrollViews only when the parent provides a defined height.
