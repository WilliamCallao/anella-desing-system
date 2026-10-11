# Guía de AppLayout (navegación por estados)

`AppLayout` es un layout genérico para React Native donde **cada pantalla es un estado del
layout** (no una pantalla separada). Una ruta elige el estado + el contenido por slot
(`header` / `body` / `footer`), y `AppLayout` se encarga de animar la transición entre
estados y de mantener una pila de navegación interna con retroceso.

> Parte de `@antonella/ui` (paquete `packages/ui`).

---

## 1. Concepto

El layout tiene 3 secciones apiladas verticalmente:

```
┌─────────┐  top    (arriba)
│         │
├─────────┤  mid    (medio)
│         │
├─────────┤  bottom (abajo)
│         │
└─────────┘
```

Cada ruta mapea su contenido a una de esas secciones a través de los **slots**
(`header`, `body`, `footer`). El estado define qué secciones son visibles y cómo
ocupan el alto (altura fija, contenido medido, llenar, o rellenar el resto).

---

## 2. Presets (estados listos para usar)

Se importan como `layoutStates` y se referencian por nombre (`LayoutStateName`):

| Estado        | Secciones visibles            | Scroll        | Slots usados        | Comportamiento                                                                 |
|---------------|-------------------------------|---------------|---------------------|--------------------------------------------------------------------------------|
| `stacked`     | top, mid, bottom (1/3 c/u)    | ninguno       | header, body, footer| Tres bloques iguales, sin scroll.                                              |
| `bottom`      | mid (header), bottom (footer) | de **página** | header, footer      | Header se **desvanece** al scrollear; el footer es la lista que scrollea.     |
| `fullBottom`  | bottom (footer)               | de **página** | footer              | Solo el body ocupa la pantalla (inmersivo).                                    |
| `onlyCenter`  | mid (body)                    | **interno**   | body                | Un solo bloque que llena y scrollea internamente.                              |
| `top`         | top (header), mid (body)      | **interno**   | header, body        | Header sticky que crece con su contenido; el body scrollea debajo.            |

> Para cambiar de un estado a otro, solo cambiás el `state` de la ruta: el layout
> anima las alturas y el contenido se intercambia al asentar la transición.

---

## 3. Definir una ruta

```tsx
import { AppLayout, useAppNavigation, type AppRoute } from "@antonella/ui";

const home: AppRoute = {
  name: "home",                 // clave única de la pantalla
  state: "bottom",              // preset por nombre (o un LayoutState custom)
  slots: {
    header: <HomeHeader />,     // se renderiza en la sección "mid"
    footer: <HomeFooter />,     // se renderiza en la sección "bottom"
  },
};
```

Los slots disponibles son `header`, `body` y `footer`. El mapeo a la sección
correcta lo define el estado (ver sección 5).

---

## 4. Navegar

Dentro de cualquier componente renderizado como contenido de un slot podés usar
el hook `useAppNavigation()`:

```tsx
function HomeFooter() {
  const { navigate, back, canGoBack, currentRoute, stack, replace } = useAppNavigation();

  return (
    <View>
      <Button label="Ir a Perfil" onPress={() => navigate(profileRoute)} />
      {canGoBack && <Button label="Volver" onPress={back} />}
    </View>
  );
}
```

| Método          | Descripción                                                            |
|-----------------|------------------------------------------------------------------------|
| `navigate(r)`   | Apila una ruta y transiciona a su estado.                               |
| `back()`        | Saca la ruta actual de la pila (retrocede).                             |
| `canGoBack`     | `true` si hay más de una ruta en la pila.                               |
| `currentRoute`  | Ruta actual.                                                            |
| `stack`         | Arreglo completo de rutas (útil para breadcrumbs).                     |
| `replace(r)`    | Reemplaza la ruta actual por otra (sin apilar).                         |

`AppLayout` también muestra un **botón de volver global** cuando `canGoBack` es
`true` (se desactiva con `showBackButton={false}`).

### Retroceso del dispositivo (Android)

`AppLayout` captura el botón de retroceso de hardware con `BackHandler`:

- Si `canGoBack` → hace `back()` y consume el evento (no sale de la app).
- Si estás en la raíz → comportamiento por defecto (salir de la app).

> **iOS:** el swipe-back depende del navegador (Expo Router), no del hardware.
> Como `AppLayout` usa su propia pila, para iOS podés envolver la pantalla raíz en
> un `Navigator` y, al llegar a la raíz, llamar `router.back()` desde el host.

---

## 5. Estado custom (avanzado)

Si ningún preset te sirve, definí tu propio `LayoutState`. Cada sección acepta:

```ts
type SectionBehavior = {
  visible?: boolean;                 // default true
  height?: "content" | "fill" | "fillRest" | "minFillRest" | "third" | number;
  scroll?: boolean;                  // scroll interno (ScrollView propio)
  sticky?: boolean;                  // se queda fija
  fadeOnScroll?: boolean;            // se desvanece al scroll de página
  slot?: "header" | "body" | "footer";
  restsOn?: "top" | "mid" | "bottom"; // para "fillRest": de qué sección se descuenta H
  backgroundColor?: string;
};

type LayoutState = {
  pageScroll?: boolean;              // la página scrollea (en vez de secciones internas)
  sections: Record<"top" | "mid" | "bottom", SectionBehavior>;
};
```

Ejemplo: un estado donde el body scrollea internamente y el header es fijo:

```tsx
const custom: LayoutState = {
  pageScroll: false,
  sections: {
    top:    { visible: true,  height: 120, slot: "header", backgroundColor: DARK_BG },
    mid:    { visible: true,  height: "fill", scroll: true, slot: "body", backgroundColor: DEFAULT_BG },
    bottom: { visible: false },
  },
};
```

`height` significa:

- `"content"` → alto = contenido medido (crece dinámicamente con el contenido).
- `"fill"` → alto = `H` (llena la pantalla).
- `"fillRest"` → alto = `H - altoNatural(restsOn)` (rellena lo que sobra).
- `"minFillRest"` → alto = `max(altoNatural, H - altoNatural(restsOn))` (rellena lo
  que sobra, pero crece con el contenido si lo supera).
- `"third"` → alto = `H / 3`.
- `number` → alto fijo en px.

Las secciones de tipo `"content"` o `"fillRest"` **miden su alto natural automáticamente**
y crecen/reencogen cuando el contenido cambia (después de asentar la transición).

---

## 5b. Modelo de medición y ciclo de ruta (robusto)

El motor no usa heurísticas de valor para decidir si una medición es válida. La
robustez viene de la estructura:

1. **Proxy de medición no restringido.** Cada sección dinámica
   (`content`/`minFillRest`) se mide con un proxy offscreen de alto automático
   (`position:absolute`, `opacity:0`, `pointerEvents:none`). Al no fijarle alto,
   el proxy reporta siempre la **altura intrínseca real** del contenido: el
   artefacto clásico de un árbol `flex:1` que medía ~32px de padding en un
   contenedor de alto fijo es estructuralmente imposible. Por eso **no existe un
   guard de umbral** que descarte mediciones (ese guard era la causa de que un
   header legítimamente más bajo al navegar quedara "pegado" en su alto anterior).

2. **Snapshot de naturales por ruta.** Los naturales medidos se cachean por
   `route.name`. Al volver a una ruta ya vista se siembran sus naturales, de modo
   que el primer frame se pinta con el alto correcto (sin "header distinto al
   volver"). Los cambios de contenido dentro de la misma ruta actualizan el
   snapshot de esa ruta. Una ruta **nunca vista** se siembra con un neutro
   derivado de la ventana (`initialNaturals(H)`) — **jamás con los naturales de
   la ruta anterior**: heredar el alto de otra pantalla es un "vestigio" que
   dejaba al motor convencido de seguir en la pantalla grande aunque ya estuviera
   en la chica (el caso "vuelvo a la categoría y creció un poco").

3. **Medición que resiste hijos que animan su alto.** El proxy vive **fuera** del
   wrapper que recorta (`overflow:hidden`) durante las transiciones, así el
   recorte nunca "capa" la altura medida. Además, como un descendiente puede
   animar su propio alto en el hilo UI (`TransitionView` arranca en 0 y crece),
   el `onLayout` de JS puede quedar con un frame intermedio y no volver a
   dispararse en iOS; por eso el motor re-lee con `measure()` (cada 150 ms) hasta
   que la altura queda **estable** (dos lecturas iguales) o pasa el tope de 4 s.
   Nunca se mide un alto a medio animar de forma permanente.

4. **Reset de scroll por ruta.** El `ScrollView` de página se reutiliza entre
   rutas; su offset se resetea al tope **solo cuando cambia `route.name`**. Los
   cambios intra-ruta (categorías ↔ subcategorías, filtros de búsqueda) preservan
   la posición.

5. **Fondo del page = color del cuerpo/mid.** `selectPageBackground` devuelve el
   color del `mid` (el header/cuerpo, claro) cuando está visible, y solo cae al
   color de la última sección visible cuando no hay `mid` (patrón full-bottom,
   todo hoja). Así, durante los morphs, el hueco que se abre entre el header
   claro y la hoja asoma el color claro del header y no un corte oscuro. El body
   no se sobredimensiona con colas artificiales (`BODY_TAIL`) ni overscans.

> **Contrato de slots dinámicos:** el contenido de una sección `content`/
> `minFillRest` se monta **dos veces** (proxy + visible). Debe ser puro e
> idempotente: sin efectos destructivos al montar. Cuando las pantallas
> pre-crean los elementos de slot a nivel de módulo (referencia estable), React
> hace bailout de los re-renders y el costo es un único montaje doble.

La matemática del motor (`computeSectionTargets`, `selectPageBackground`,
`seedNaturals`, `shouldResetScroll`, …) vive aislada y sin dependencias de
`react-native` en `layoutMath.ts`, y está cubierta por tests con vitest
(`layoutMath.test.ts`).

---

## 5c. Instrumentación (`layoutDebug`)

El motor emite eventos estructurados (`seed`, `measure`, `apply`, `route`,
`pageScroll`) con la ruta, la sección, la altura medida, los naturales y los
targets derivados. **No cambia el comportamiento: solo observa.**

- Se activa con `EXPO_PUBLIC_LAYOUT_DEBUG=1` (requiere reiniciar Metro) o en
  runtime con `__ANTONELLA_LAYOUT_DEBUG__(true)`; también con la prop
  `debug` de `<AppLayout>`.
- El buffer (últimos 400 eventos) **siempre** se llena. Para volcarlo:
  `__ANTONELLA_LAYOUT_DUMP__()` (imprime y devuelve) o el array crudo
  `__ANTONELLA_LAYOUT_LOG__`.

---


## 6. Ejemplo completo

```tsx
import React from "react";
import { View } from "react-native";
import { AppLayout, useAppNavigation, type AppRoute } from "@antonella/ui";

function HomeHeader() {
  return <Text variant="heading">Inicio</Text>;
}

function HomeFooter() {
  const { navigate } = useAppNavigation();
  return (
    <View>
      <Button label="Ir a Perfil (top)" onPress={() => navigate(profile)} />
      <Button label="Ver Galería (onlyCenter)" onPress={() => navigate(gallery)} />
    </View>
  );
}

function ProfileHeader() {
  return <Text variant="heading">Perfil</Text>;
}

function ProfileBody() {
  const { navigate } = useAppNavigation();
  return (
    <View>
      <MockList />
      <Button label="Ver galería" onPress={() => navigate(gallery)} />
    </View>
  );
}

const home: AppRoute = {
  name: "home",
  state: "bottom",
  slots: { header: <HomeHeader />, footer: <HomeFooter /> },
};

const profile: AppRoute = {
  name: "profile",
  state: "top",
  slots: { header: <ProfileHeader />, body: <ProfileBody /> },
};

const gallery: AppRoute = {
  name: "gallery",
  state: "onlyCenter",
  slots: { body: <GalleryGrid /> },
};

export function MainApp() {
  return <AppLayout initialRoute={home} animateTransitions />;
}
```

---

## 7. Props de `AppLayout`

| Prop                 | Tipo                    | Default    | Descripción                                                                 |
|----------------------|-------------------------|------------|------------------------------------------------------------------------------|
| `initialRoute`       | `AppRoute`              | —          | Ruta inicial (raíz de la pila).                                              |
| `showBackButton`     | `boolean`               | `true`     | Muestra el botón de volver global cuando `canGoBack`.                        |
| `animateTransitions` | `boolean`               | `false`    | Anima transiciones de estado con layout transitions (morph de altura).       |
| `contentReveal`      | `"always"` \| `"after"` | `"always"` | Cuándo revelar el contenido visible durante una transición animada.          |

---

## 8. Buenas prácticas

- **No uses pantallas separadas** para lo que es un estado del layout: navegá cambiando
  el `state` de la ruta. Esto evita remontar toda la pantalla y permite animar.
- Encadená la navegación **desde los bodies**, no desde un único lugar, para que el
  flujo se sienta natural (botones en listas, tarjetas, etc.).
- Para contenido que debe crecer (headers con texto variable, listas dinámicas) usá
  estados donde la sección sea `"content"` o `"fillRest"`; el alto se ajusta solo.
- En iOS, resolvé el swipe-back en el host (Expo Router) cuando estés en la raíz.
