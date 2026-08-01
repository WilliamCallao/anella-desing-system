# DashboardShell — Contrato de scroll

Reglas de comportamiento de scroll del `DashboardShell`. Importante para que las
pantallas consumidoras no dupliquen scroll ni rompan la jerarquía visual.

## Tablet y desktop (width ≥ 600)

- El layout del shell es **fijo**: sidebar completa el alto, `topBar` fija, y la página
  **nunca scrollea**.
- El **único** área scrolleable es el `ScrollView` que el propio shell renderiza dentro de
  la content card (sobre el contenido `children`).
- Las pantallas NO deben envolver su contenido en su propio `ScrollView`/`FlatList` con
  flex: en tablet el shell ya provee el scroll. Envolver de nuevo produce scroll anidado.
- `topBar` queda fijo arriba de la content card; el contenido scrollea por debajo.

## Móvil (width < 600)

- El shell renderiza el header sticky (`sidebarHeader` de móvil + título) y luego los
  `children` **directamente, sin envolverlos en ScrollView**.
- La pantalla es la responsable de hacer su propio scroll (`ScrollView`/`FlatList` propio).
  El shell no scrollea.
- No hay doble scroll: si la pantalla usa un `FlatList` con `header`/`ListHeaderComponent`,
  ese es el scroll de la página.

## Regla práctica para las pantallas

Usar el mismo contenido scrolleable en ambas resoluciones es seguro si se escribe **una
sola vez**:

- Tablet: el `ScrollView` del shell envuelve el contenido.
- Móvil: la pantalla provee el scroll.

Para una pantalla que funciona en ambas sin duplicar scroll, envolver el contenido en un
`ScrollView` propio: en tablet queda anidado dentro del del shell (inofensivo si no fuerza
flex en contenedores), y en móvil es el scroll de la página. La alternativa correcta a nivel
producto es usar un `FlatList`/`ScrollView` único por pantalla y dejar que el shell solo
aporte el layout.

## Reglas generales

- No fijar `contentContainerStyle={{ flexGrow: 1 }}` en el contenido salvo que la pantalla
  lo necesite explícitamente para centrar verticalmente.
- No usar `ScrollView` anidados con `nestedScrollEnabled` salvo casos puntuales.
- El cierre del drawer en móvil se maneja dentro del shell; no interfiere con el scroll.
