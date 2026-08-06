# Integración de Antonella en una app React Native (Expo)

Guía práctica para consumir `@antonella/*` desde una aplicación Expo independiente
(otro repositorio, p. ej. `inventario-app`, `ventas-app`, `Process_Management/app`).

Estos pasos son los que se validaron de punta a punta: la app instala Antonella localmente
(sin publicar a npm), compila con Metro/TypeScript y corre en **Expo Go SDK 54**.

> Requisito de versión: Expo Go de Play Store es **SDK 54**. La app consumidora debe
> estar en SDK 54 (`expo ~54`, `react 19.1.0`, `react-native 0.81.x`) o no abrirá en Expo Go.
> La app se baja con `npx expo install expo@~54.0.0 --fix` (o editando `package.json`).

---

## Requisitos

- Node 20+ y npm (la app consume con npm, no pnpm).
- Antonella en una carpeta **hermana** de la app (misma carpeta padre):

  ```
  C:\Projects\<padre>\
  ├── antonella/                  # este repositorio
  └── mi-app/                     # tu app Expo (SDK 54)
      └── package.json
  ```

- La app debe ser un proyecto Expo SDK 54. Si venís de SDK 57, mirá
  [cómo bajar a SDK 54](#apendice-bajar-la-app-de-sdk-57-a-54).

---

## 1. Agregar Antonella como dependencia

Los paquetes se instalan por `file:` apuntando a las carpetas de este repositorio.
npm los enlaza como **junctions (symlinks)**, así que los cambios en Antonella se
reflejan en la app sin reinstalar.

En `mi-app/package.json` (los 5 paquetes son obligatorios: `ui` depende de los otros 4):

```json
{
  "dependencies": {
    "@antonella/animations": "file:../../antonella/packages/animations",
    "@antonella/hooks": "file:../../antonella/packages/hooks",
    "@antonella/theme": "file:../../antonella/packages/theme",
    "@antonella/ui": "file:../../antonella/packages/ui",
    "@antonella/utils": "file:../../antonella/packages/utils",
    "expo": "~54.0.36",
    "react": "19.1.0",
    "react-native": "0.81.5",
    "react-native-reanimated": "~4.1.1",
    "react-native-worklets": "0.5.1"
  }
}
```

Los peers de Antonella que la app ya debe tener (los incluye el template SDK 54):
`react >=19`, `react-native >=0.81`, `react-native-reanimated >=4`, `react-native-worklets`.

Instalá:

```sh
npm install
```

Verificá que quedaron como enlaces (junctions) a Antonella:

```sh
Get-ChildItem node_modules/@antonella   # Windows: LinkType = Junction
ls -la node_modules/@antonella          # macOS/Linux: -> ../../antonella/packages/...
```

> **Por qué `^0.0.0` y no `workspace:*`:** npm no soporta el protocolo `workspace:*`.
> Por eso dentro de `packages/ui/package.json` las deps internas usan rangos `^0.0.0`.
> El `pnpm-workspace.yaml` de Antonella tiene `linkWorkspacePackages: true` y
> `preferWorkspacePackages: true`, así pnpm (para desarrollo dentro de este repo)
> sigue resolviendo todo al workspace local.

---

## 2. Configurar Metro (paso crítico)

Los paquetes de Antonella viven **fuera del root del proyecto** de tu app. Para que
Metro los encuentre y resuelva sus dependencias nativas (`react-native`, `reanimated`, …)
creá `mi-app/metro.config.js`:

```js
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Ruta al repositorio de Antonella (ajustá si está en otro lugar).
const ANTONELLA_PATH = path.resolve(__dirname, "../../antonella");

// 1. Los archivos de Antonella quedan "mirándolos" (Fast Refresh).
config.watchFolders = [
  ...(config.watchFolders ?? []),
  path.join(ANTONELLA_PATH, "packages"),
];

// 2. nodeModulesPaths es el fix clave: para módulos resueltos a través de los
//    symlinks de Antonella, Metro NO agrega el node_modules de la app por sí solo.
//    Hay que listar ambos: el de la app y el de Antonella.
const appNodeModules = path.resolve(__dirname, "node_modules");
const antonellaNodeModules = path.join(ANTONELLA_PATH, "node_modules");

config.resolver.nodeModulesPaths = [
  appNodeModules,
  ...(config.resolver.nodeModulesPaths ?? []).filter((p) => p !== appNodeModules),
  antonellaNodeModules,
];

module.exports = config;
```

Sin este archivo, Metro falla con:

```
Unable to resolve module react-native from ...\antonella\packages\ui\src\components\Button.tsx
```

---

## 3. Configuración de Expo (app.json)

**Desactivá el React Compiler.** Si `experiments.reactCompiler` está en `true`, en
Expo Go la app revienta al renderizar:

```
TypeError: Cannot read property 'useMemoCache' of null
```

(expo/expo#37685). En `mi-app/app.json` dejá solo `typedRoutes` (si usás expo-router):

```json
{
  "expo": {
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

Luego arrancá con caché limpio para descartar transforms viejos:

```sh
npx expo start --clear
```

---

## 4. Uso

Los imports son idénticos a los del Playground. Ejemplo mínimo:

```tsx
import { StyleSheet, View } from "react-native";
import { Button, Card, Input, Text } from "@antonella/ui";
import { palette, spacing } from "@antonella/theme";

export default function Screen() {
  return (
    <View style={styles.container}>
      <Card>
        <Text variant="heading">Hola</Text>
        <Input placeholder="Escribí algo…" />
        <Button label="Guardar" />
        <Button label="Borrar" variant="danger" size="sm" />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, backgroundColor: palette.background },
});
```

### Paquetes y exports disponibles

| Paquete           | Exports principales                                             |
| ----------------- | --------------------------------------------------------------- |
| `@antonella/ui`   | `Button`, `Card`, `Input`, `Text`                               |
| `@antonella/theme`| `palette`, `darkPalette`, `resolveColors(mode)`, `spacing`, `texts`, `text` |
| `@antonella/animations` | `entering` (`fade`, `slideRight`, `zoom`), `exiting` (`fade`, `slideRight`) |
| `@antonella/hooks`| `useDebouncedValue`, `usePrevious`                              |
| `@antonella/utils`| `cn`, `isDefined`, `noop`, `isWeb`                              |
| `@antonella/auth` | tipos `User`, `Session`, `AuthProvider`                         |
| `@antonella/api`  | `createApiClient` (aún sin implementar)                         |
| `@antonella/storage` | interface `Storage` + `createMemoryStorage`                  |

Ejemplos:

```tsx
import { entering } from "@antonella/animations";
import { useDebouncedValue } from "@antonella/hooks";
import { resolveColors } from "@antonella/theme";

function Demo() {
  const colors = resolveColors("dark");
  const [query, setQuery] = React.useState("");
  const debounced = useDebouncedValue(query, 300);

  return (
    <Animated.View entering={entering.fade}>
      {/* … */}
    </Animated.View>
  );
}
```

---

## 5. Verificación

```sh
npx tsc --noEmit                    # tipos OK (resuelve @antonella/* desde node_modules)
npx expo export -p android          # bundle nativo compila (esperado: ~970 módulos)
npx expo start                      # QR para Expo Go
```

---

## 6. Cómo funciona por dentro (resumen)

1. `npm install` crea junctions `node_modules/@antonella/*` → `antonella/packages/*`.
2. Metro compila el TypeScript directo de los paquetes (`"main": "src/index.ts"`, sin build).
3. `metro.config.js` hace que Metro (a) vea los archivos fuera del root y (b) resuelva
   `react-native`, `reanimated`, etc. desde `node_modules` de la app **y** de Antonella.
4. Como son enlaces, editar `antonella/packages/*` se refleja con Fast Refresh.

---

## 7. Troubleshooting

| Error | Causa | Solución |
| ----- | ----- | -------- |
| `Cannot read property 'useMemoCache' of null` | React Compiler activo (`experiments.reactCompiler`) en Expo Go | Sacar `reactCompiler` del `app.json` y `npx expo start --clear` |
| `Unable to resolve module react-native from ...\antonella\packages\ui\...` | Metro no tiene los `nodeModulesPaths` correctos | Seguir el paso 2: agregar `node_modules` de la app + de Antonella |
| `npm ERR! Unknown protocol "workspace:"` | Algún paquete todavía declara `workspace:*` | En Antonella usar rangos `^0.0.0` (ver paso 1) |
| `EUNSUPPORTEDPROTOCOL` / peers rotos | Faltan `react-native-reanimated`, `react-native-worklets` o `react` | `npx expo install react-native-reanimated react-native-worklets` |
| Cambios en Antonella no se ven | La instalación quedó copiada, no enlazada | Borrar `node_modules/@antonella` y `npm install` (debe quedar Junction) |

---

## Apéndice: bajar la app de SDK 57 a 54

1. Editar `package.json` con las versiones SDK 54 (ver tabla abajo).
2. Borrar `node_modules` y `package-lock.json`, y `npm install`.
3. `npx expo install --fix` para alinear el resto.
4. Quitar dependencias que no existen en SDK 54: `@expo/ui`, `expo-device`, `expo-glass-effect`, `expo-router@57`, etc.

Versiones SDK 54 probadas:

```
expo ~54.0.36
react 19.1.0 / react-dom 19.1.0
react-native 0.81.5
expo-router ~6.0.24
react-native-reanimated ~4.1.1
react-native-worklets 0.5.1
react-native-gesture-handler ~2.28.0
react-native-screens ~4.16.0
react-native-safe-area-context ~5.6.0
expo-constants ~18.0.13
expo-font ~14.0.12
expo-image ~3.0.11
expo-linking ~8.0.12
expo-splash-screen ~31.0.13
expo-status-bar ~3.0.9
expo-symbols ~1.0.8
expo-system-ui ~6.0.9
expo-web-browser ~15.0.11
react-native-web ~0.21.0
typescript ~5.9.2
@types/react ~19.1.0
```

---

## Relación con el README

Esta guía documenta el **consumo local actual** (app → carpeta de Antonella, sin publicar).
La estrategia de publicación a npm y el switch `useLocalKit` (clon dentro de la app +
`antonella.config.ts`) que describe el README quedan como evolución futura; cuando exista,
consumir Antonella será simplemente `npm install @antonella/ui`.
