# Antonella

Plataforma compartida para todas las aplicaciones React Native + Expo de iKonSoft.

Antonella no es solo un Design System: es una plataforma reutilizable que contiene Design System, Theme, Componentes UI, Animaciones, Auth, API, Storage, Hooks y Utilidades. Cualquier aplicación (Inventario, POS, CRM, Ventas, etc.) consume Antonella como dependencia y **nunca** contiene su código.

## Estructura

```
antonella/
├── apps/
│   └── playground/        # App Expo: documentación viva del sistema
├── packages/
│   ├── ui/                # @antonella/ui        Componentes (Button, Input, Card, ...)
│   ├── theme/             # @antonella/theme     Colores, tipografía, spacing, dark/light
│   ├── auth/              # @antonella/auth      Autenticación
│   ├── api/               # @antonella/api       Cliente API
│   ├── storage/           # @antonella/storage   Capa de persistencia
│   ├── animations/        # @antonella/animations  Animaciones (Reanimated)
│   ├── hooks/             # @antonella/hooks     Hooks compartidos
│   └── utils/             # @antonella/utils     Utilidades puras
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

## Stack

- Expo + React Native + TypeScript
- pnpm Workspaces (`nodeLinker: hoisted`) + Turborepo
- Expo Router (Playground)
- React Native Reanimated + React Native Gesture Handler

Preparado para sumar luego (sin reorganizar): Zustand, TanStack Query, MMKV, FlashList, React Hook Form, Zod, Axios, NativeWind.

## Desarrollo

```sh
pnpm install        # instala todo el monorepo
pnpm dev            # corre el Playground vía Turbo
```

Todos los paquetes exportan su fuente TypeScript directamente (`"main": "src/index.ts"`). Metro transpila los paquetes del workspace sin necesidad de build en desarrollo.

## Playground

El Playground (`apps/playground`) consume los paquetes con los **mismos imports** que usarán las aplicaciones reales, p. ej.:

```tsx
import { Button } from "@antonella/ui";
```

Cada componente tiene su propia pantalla de documentación con variantes, estados, casos de uso, animaciones, responsive y tema claro/oscuro.

## Cómo consumen Antonella las aplicaciones

Las aplicaciones viven en repositorios independientes (`inventario-app`, `ventas-app`, `crm-app`) y consumen Antonella publicada:

```ts
// @antonella/ui -> 1.0.0
import { Button } from "@antonella/ui";
```

### Modo desarrollo local (useLocalKit)

Para modificar Antonella sin publicar una versión tras cada cambio, cualquier aplicación puede clonar este repositorio dentro de sí misma:

```
inventario-app/
├── packages/
│   └── antonella/        # clon git normal (NO submodule)
```

La resolución se controla con un único archivo `antonella.config.ts`:

```ts
export default {
  useLocalKit: true, // true → resuelve desde packages/antonella
}
```

- `useLocalKit: true` → los imports de `@antonella/*` apuntan al clon local (`packages/antonella/packages/*`).
- `useLocalKit: false` → se usa la versión publicada en npm.

La aplicación **no cambia sus imports** ni se entera de la diferencia (mecanismo a implementar en el consumidor: pnpm overrides, alias de Metro, scripts, etc.). Fast Refresh refleja los cambios al instante.

### Flujo esperado

1. Desarrollo normal → Antonella publicada (`useLocalKit: false`).
2. Necesito cambiar Antonella → clono, activo `useLocalKit: true`, desarrollo en tiempo real.
3. Termino → commit + push + release + publicar versión, y vuelvo a `useLocalKit: false`.

## Docs

- [Integración en una app React Native (Expo)](docs/integracion-react-native.md) — pasos validados para consumir Antonella desde una app SDK 54 (`file:` + `metro.config.js`, troubleshooting).
