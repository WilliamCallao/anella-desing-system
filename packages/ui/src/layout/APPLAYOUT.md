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
  height?: "content" | "fill" | "fillRest" | "third" | number;
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
- `"third"` → alto = `H / 3`.
- `number` → alto fijo en px.

Las secciones de tipo `"content"` o `"fillRest"` **miden su alto natural automáticamente**
y crecen/reencogen cuando el contenido cambia (después de asentar la transición).

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
  return <AppLayout initialRoute={home} debug />;
}
```

---

## 7. Props de `AppLayout`

| Prop             | Tipo      | Default | Descripción                                          |
|------------------|-----------|---------|------------------------------------------------------|
| `initialRoute`   | `AppRoute`| —       | Ruta inicial (raíz de la pila).                      |
| `showBackButton` | `boolean` | `true`  | Muestra el botón de volver global cuando `canGoBack`.|
| `debug`          | `boolean` | `false` | Logs de transición en consola (`[APP] transition`).  |

---

## 8. Buenas prácticas

- **No uses pantallas separadas** para lo que es un estado del layout: navegá cambiando
  el `state` de la ruta. Esto evita remontar toda la pantalla y permite animar.
- Encadená la navegación **desde los bodies**, no desde un único lugar, para que el
  flujo se sienta natural (botones en listas, tarjetas, etc.).
- Para contenido que debe crecer (headers con texto variable, listas dinámicas) usá
  estados donde la sección sea `"content"` o `"fillRest"`; el alto se ajusta solo.
- En iOS, resolvé el swipe-back en el host (Expo Router) cuando estés en la raíz.
