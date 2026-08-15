# Responsive Dialog Reanimated Implementation Plan

> **For agentic workers:** Use `mobiai-mobile-executing-plans-with-subagents` (recommended) or `mobiai-mobile-executing-plans` to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Rewrite `Modal` and `BottomSheet` (used by `AppResponsiveDialog`) so las animaciones de entrada/salida y el dimming del fondo corren en el UI thread con Reanimated, y montar `KeyboardProvider` en el root del playground.

**Architecture:** Se reemplaza `react-native-modal` por el `Modal` nativo de RN + Reanimated (`withTiming`/`useAnimatedStyle`, todo en UI thread). El panel se anima con `translateY` (bottom sheet) o `opacity`+`scale` (modal centrado); el backdrop es un `Pressable` de pantalla completa con `opacity` animada. Un estado interno `mounted` mantiene el `Modal` nativo montado hasta que termina la animación de salida. Se conserva la API pública y el manejo de teclado (`useModalKeyboardHeight`).

**Tech Stack:** React Native 0.81 (`Modal` nativo), react-native-reanimated v4 (`withTiming`, `useAnimatedStyle`, `useSharedValue`, `runOnJS`, `Easing`), react-native-keyboard-controller 1.18.5 (`KeyboardProvider`).

**Platform:** React Native (Android / iOS / web)

---

### Task 1: Reescribir `Modal.tsx` con Modal nativo + Reanimated

**Files:**
- Modify: `packages/ui/src/components/Modal.tsx`

- [ ] **Step 1: Reemplazar el contenido completo del archivo**

```tsx
import React, { useEffect, useRef, useState } from "react";
import {
  Modal as RNModal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { background, radius, space } from "@antonella/theme";
import { DialogHeader } from "./DialogHeader";
import type { IconName } from "./Icon";
import { useModalKeyboardHeight } from "./useModalKeyboard";

const ANIM_IN_TIMING = 220;
const ANIM_OUT_TIMING = 180;
const BACKDROP_COLOR = "#0F172A";
const BACKDROP_OPACITY = 0.4;
const PANEL_IN_SCALE = 0.92;

export type ModalProps = {
  visible: boolean;
  onClose: () => void;
  dismissible?: boolean;
  showCloseButton?: boolean;
  icon?: IconName;
  title?: string;
  caption?: string;
  children: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
};

export function Modal({
  visible,
  onClose,
  dismissible = true,
  showCloseButton = false,
  icon,
  title,
  caption,
  children,
  contentStyle,
}: ModalProps) {
  const { height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const keyboardHeight = useModalKeyboardHeight();

  const [mounted, setMounted] = useState(visible);
  const progress = useSharedValue(0);
  const transitionAt = useRef<number | null>(null);

  const panelMaxHeight = Math.max(
    space.space16,
    screenHeight - insets.top - insets.bottom - space.space8,
  );

  // [debug] métricas de layout y transición
  useEffect(() => {
    console.log(
      `[Modal:metrics] screenH=${screenHeight} insets(top=${insets.top},bottom=${insets.bottom}) panelMaxHeight=${panelMaxHeight} driver=UI(reanimated)`,
    );
  }, [screenHeight, insets.top, insets.bottom, panelMaxHeight]);

  useEffect(() => {
    if (visible) {
      transitionAt.current = performance.now();
      console.log(
        `[Modal:transition] enter → fadeIn+scale(${ANIM_IN_TIMING}ms) + backdropFadeIn(${ANIM_IN_TIMING}ms, alpha ${BACKDROP_OPACITY})`,
      );
      setMounted(true);
    } else if (transitionAt.current != null) {
      transitionAt.current = performance.now();
      console.log(
        `[Modal:transition] exit → fadeOut(${ANIM_OUT_TIMING}ms) + backdropFadeOut(${ANIM_OUT_TIMING}ms)`,
      );
    }
  }, [visible]);

  const logShown = () => {
    const t = transitionAt.current;
    console.log(
      `[Modal:onModalShow] totalmente visible (desde trigger: ${
        t == null ? "n/a" : `${Math.round(performance.now() - t)}ms`
      })`,
    );
  };

  const logHidden = () => {
    const t = transitionAt.current;
    console.log(
      `[Modal:onModalHide] totalmente oculto (desde trigger: ${
        t == null ? "n/a" : `${Math.round(performance.now() - t)}ms`
      })`,
    );
  };

  useEffect(() => {
    if (!mounted) return;
    if (visible) {
      progress.value = withTiming(1, {
        duration: ANIM_IN_TIMING,
        easing: Easing.out(Easing.cubic),
      }, () => runOnJS(logShown)());
    } else {
      progress.value = withTiming(0, {
        duration: ANIM_OUT_TIMING,
        easing: Easing.in(Easing.cubic),
      }, (finished) => {
        if (finished) runOnJS(setMounted)(false);
        if (finished) runOnJS(logHidden)();
      });
    }
  }, [mounted, visible, progress]);

  const backdropStyle = useAnimatedStyle(
    () => ({ opacity: progress.value * BACKDROP_OPACITY }),
    [],
  );

  const panelStyle = useAnimatedStyle(
    () => ({
      opacity: progress.value,
      transform: [{ scale: PANEL_IN_SCALE + (1 - PANEL_IN_SCALE) * progress.value }],
    }),
    [],
  );

  const containerAnimatedStyle = useAnimatedStyle(
    () => ({
      paddingBottom: Math.max(0, -keyboardHeight.value),
    }),
    [],
  );

  const panelHeightStyle = useAnimatedStyle(
    () => {
      const kb = Math.max(0, -keyboardHeight.value);
      return {
        maxHeight: Math.max(
          space.space16,
          screenHeight - kb - insets.top - insets.bottom - space.space8,
        ),
      };
    },
    [screenHeight, insets.top, insets.bottom],
  );

  return (
    <RNModal
      visible={mounted}
      transparent
      statusBarTranslucent
      animationType="none"
      onRequestClose={dismissible ? onClose : undefined}
    >
      <View style={styles.container}>
        <Pressable
          onPress={dismissible ? onClose : undefined}
          style={StyleSheet.absoluteFill}
          accessibilityRole="button"
          accessibilityLabel="Cerrar diálogo"
        >
          <Animated.View style={[styles.backdrop, backdropStyle]} />
        </Pressable>
        <Animated.View style={[styles.centered, containerAnimatedStyle]}>
          <Animated.View style={[styles.panel, panelHeightStyle, panelStyle, contentStyle]}>
            {title || icon || caption || showCloseButton ? (
              <DialogHeader
                icon={icon}
                title={title}
                caption={caption}
                onClose={onClose}
                showCloseButton={showCloseButton}
              />
            ) : null}
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollContent}
            >
              {children}
            </ScrollView>
          </Animated.View>
        </Animated.View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: BACKDROP_COLOR,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  panel: {
    width: 420,
    maxWidth: "100%",
    backgroundColor: background.default,
    borderRadius: radius.lg,
    padding: space.space4,
  },
  scrollContent: {
    paddingBottom: space.space3,
  },
});
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @antonella/ui typecheck`
Expected: PASS (sin errores)

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/components/Modal.tsx
git commit -m "feat(ui): rewrite Modal with native RN Modal + Reanimated UI-thread animations"
```

---

### Task 2: Reescribir `BottomSheet.tsx` con Modal nativo + Reanimated

**Files:**
- Modify: `packages/ui/src/components/BottomSheet.tsx`

- [ ] **Step 1: Reemplazar el contenido completo del archivo**

```tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Modal as RNModal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { background, radius, space } from "@antonella/theme";
import { DialogHeader } from "./DialogHeader";
import type { IconName } from "./Icon";
import { useModalKeyboardHeight } from "./useModalKeyboard";

const ANIM_IN_TIMING = 260;
const ANIM_OUT_TIMING = 240;
const BACKDROP_COLOR = "#0F172A";
const BACKDROP_OPACITY = 0.45;

export type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  dismissible?: boolean;
  showCloseButton?: boolean;
  icon?: IconName;
  title?: string;
  caption?: string;
  children: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  snapPoints?: Array<string | number>;
};

export function BottomSheet({
  visible,
  onClose,
  dismissible = true,
  showCloseButton = false,
  icon,
  title,
  caption,
  children,
  contentStyle,
  snapPoints,
}: BottomSheetProps) {
  const { height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const keyboardHeight = useModalKeyboardHeight();

  const [mounted, setMounted] = useState(visible);
  const progress = useSharedValue(0);
  const transitionAt = useRef<number | null>(null);

  const maxHeightRatio = useMemo(() => {
    let ratio = 0.9;
    for (const value of snapPoints ?? []) {
      if (typeof value === "string" && value.endsWith("%")) {
        const n = Number(value.slice(0, -1));
        if (!Number.isNaN(n) && n / 100 > ratio) ratio = n / 100;
      }
    }
    return ratio;
  }, [snapPoints]);

  const panelMaxHeight = Math.max(
    space.space16,
    (screenHeight - insets.top - insets.bottom) * maxHeightRatio,
  );

  // [debug] métricas de layout y transición
  useEffect(() => {
    console.log(
      `[BottomSheet:metrics] screenH=${screenHeight} insets(top=${insets.top},bottom=${insets.bottom}) snapPoints=${JSON.stringify(
        snapPoints,
      )} maxHeightRatio=${maxHeightRatio} panelMaxHeight=${panelMaxHeight} driver=UI(reanimated)`,
    );
  }, [screenHeight, insets.top, insets.bottom, snapPoints, maxHeightRatio, panelMaxHeight]);

  useEffect(() => {
    if (visible) {
      transitionAt.current = performance.now();
      console.log(
        `[BottomSheet:transition] enter → slideInUp(${ANIM_IN_TIMING}ms) + backdropFadeIn(${ANIM_IN_TIMING}ms, alpha ${BACKDROP_OPACITY})`,
      );
      setMounted(true);
    } else if (transitionAt.current != null) {
      transitionAt.current = performance.now();
      console.log(
        `[BottomSheet:transition] exit → slideOutDown(${ANIM_OUT_TIMING}ms) + backdropFadeOut(${ANIM_OUT_TIMING}ms)`,
      );
    }
  }, [visible]);

  const logShown = () => {
    const t = transitionAt.current;
    console.log(
      `[BottomSheet:onModalShow] totalmente visible (desde trigger: ${
        t == null ? "n/a" : `${Math.round(performance.now() - t)}ms`
      })`,
    );
  };

  const logHidden = () => {
    const t = transitionAt.current;
    console.log(
      `[BottomSheet:onModalHide] totalmente oculto (desde trigger: ${
        t == null ? "n/a" : `${Math.round(performance.now() - t)}ms`
      })`,
    );
  };

  useEffect(() => {
    if (!mounted) return;
    if (visible) {
      progress.value = withTiming(1, {
        duration: ANIM_IN_TIMING,
        easing: Easing.out(Easing.cubic),
      }, () => runOnJS(logShown)());
    } else {
      progress.value = withTiming(0, {
        duration: ANIM_OUT_TIMING,
        easing: Easing.in(Easing.cubic),
      }, (finished) => {
        if (finished) runOnJS(setMounted)(false);
        if (finished) runOnJS(logHidden)();
      });
    }
  }, [mounted, visible, progress]);

  const backdropStyle = useAnimatedStyle(
    () => ({ opacity: progress.value * BACKDROP_OPACITY }),
    [],
  );

  const panelStyle = useAnimatedStyle(
    () => ({
      transform: [{ translateY: (1 - progress.value) * screenHeight }],
    }),
    [screenHeight],
  );

  const containerAnimatedStyle = useAnimatedStyle(
    () => ({
      paddingBottom: Math.max(0, -keyboardHeight.value),
    }),
    [],
  );

  const panelHeightStyle = useAnimatedStyle(
    () => {
      const kb = Math.max(0, -keyboardHeight.value);
      const available = screenHeight - kb - insets.top - insets.bottom;
      return {
        maxHeight: Math.max(space.space16, available * maxHeightRatio),
      };
    },
    [screenHeight, insets.top, insets.bottom, maxHeightRatio],
  );

  return (
    <RNModal
      visible={mounted}
      transparent
      statusBarTranslucent
      animationType="none"
      onRequestClose={dismissible ? onClose : undefined}
    >
      <View style={styles.container}>
        <Pressable
          onPress={dismissible ? onClose : undefined}
          style={StyleSheet.absoluteFill}
          accessibilityRole="button"
          accessibilityLabel="Cerrar"
        >
          <Animated.View style={[styles.backdrop, backdropStyle]} />
        </Pressable>
        <Animated.View style={[styles.panelWrapper, containerAnimatedStyle]}>
          <Animated.View style={[styles.panel, panelHeightStyle, panelStyle]}>
            <View style={styles.handleBar} />
            {title || icon || caption || showCloseButton ? (
              <DialogHeader
                icon={icon}
                title={title}
                caption={caption}
                onClose={onClose}
                showCloseButton={showCloseButton}
              />
            ) : null}
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={[styles.content, contentStyle]}
            >
              {children}
            </ScrollView>
          </Animated.View>
        </Animated.View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: BACKDROP_COLOR,
  },
  panelWrapper: {
    flex: 1,
    justifyContent: "flex-end",
  },
  panel: {
    width: "100%",
    backgroundColor: background.default,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingTop: space.space2,
    paddingHorizontal: space.space4,
  },
  handleBar: {
    alignSelf: "center",
    width: 36,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: background.default,
    marginBottom: space.space2,
  },
  content: {
    paddingTop: space.space2,
    paddingBottom: Math.max(space.space3, 24),
  },
});
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @antonella/ui typecheck`
Expected: PASS (sin errores)

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/components/BottomSheet.tsx
git commit -m "feat(ui): rewrite BottomSheet with native RN Modal + Reanimated UI-thread animations"
```

---

### Task 3: Montar `KeyboardProvider` en el root del playground

**Files:**
- Modify: `apps/playground/src/app/_layout.tsx`

- [ ] **Step 1: Editar el layout**

```tsx
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { KeyboardProvider } from "react-native-keyboard-controller";

export default function RootLayout() {
  return (
    <KeyboardProvider>
      <SafeAreaProvider>
        <Stack />
      </SafeAreaProvider>
    </KeyboardProvider>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: PASS (9 packages)

- [ ] **Step 3: Commit**

```bash
git add apps/playground/src/app/_layout.tsx
git commit -m "feat(playground): mount KeyboardProvider in root layout"
```

---

### Task 4: Quitar dependencia `react-native-modal`

**Files:**
- Modify: `packages/ui/package.json`
- Modify: `package.json` (root)
- Modify: `pnpm-lock.yaml` (via install)

- [ ] **Step 1: Verificar que no quedan imports**

Run: `rg -l "react-native-modal" packages apps`
Expected: solo `package.json` y `pnpm-lock.yaml` (sin imports en `.tsx`)

- [ ] **Step 2: Eliminar la dependencia de `packages/ui/package.json`**

Remover la línea `"react-native-modal": ">=13.0.0",`.

- [ ] **Step 3: Eliminar la dependencia del root `package.json`**

Remover la línea `"react-native-modal": "^13.0.1",`.

- [ ] **Step 4: Actualizar lockfile e instalar**

Run: `pnpm install`
Expected: actualiza `pnpm-lock.yaml` sin errores

- [ ] **Step 5: Typecheck**

Run: `pnpm typecheck`
Expected: PASS (9 packages)

- [ ] **Step 6: Commit**

```bash
git add packages/ui/package.json package.json pnpm-lock.yaml
git commit -m "chore: remove react-native-modal dependency"
```

---

### Task 5: Verificar en dispositivo

**Files:**
- Ninguno (verificación manual)

- [ ] **Step 1: Correr la app y medir**

Run: app en celular (expo), abrir y cerrar: BottomSheet de acciones de TreeEditor + diálogo de editar + AppResponsiveDialog (categoría Diálogos).

Expected: los logs `[Modal:onModalShow]` / `[BottomSheet:onModalShow]` muestran `desde trigger` ≈ al timing configurado (220ms/260ms) con pocos ms de overhead, igual que antes; la diferencia debe percibirse: backdrop y panel animan **suaves** (sin saltos), aunque el JS esté ocupado.

Registrar los valores medidos para compararlos con la baseline (285ms).

- [ ] **Step 2: Confirmar que el WARN de KeyboardContext desapareció**

Expected: ya no aparece `Couldn't find real values for KeyboardContext`; abrir el diálogo con un `TextField` enfocado → el panel sube por encima del teclado (el `paddingBottom` del contenedor se anima con el teclado).

- [ ] **Step 3: Confirmar cierre por backdrop y back button**

Expected: tap fuera cierra (si `dismissible`), botón atrás de Android cierra, y la animación de salida se completa antes de desmontar (sin flash).

---

### Task 6: Limpiar logs de debug

**Files:**
- Modify: `packages/ui/src/components/Modal.tsx`
- Modify: `packages/ui/src/components/BottomSheet.tsx`

- [ ] **Step 1: Quitar todos los `console.log` y el `transitionAt`/`logShown`/`logHidden`**

En `Modal.tsx`: eliminar el `useRef` de `transitionAt`, los `useEffect` de `[debug]` y `[transition]`, `logShown`, `logHidden`, y el callback de `withTiming` de entrada. Mantener el callback de salida que hace `runOnJS(setMounted)(false)`.

En `BottomSheet.tsx`: idéntico.

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: PASS (9 packages)

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/components/Modal.tsx packages/ui/src/components/BottomSheet.tsx
git commit -m "chore(ui): remove debug logs from Modal and BottomSheet"
```

---

## Self-Review

**1. Spec coverage:**
- ✅ Rewrite sin `react-native-modal` (Tasks 1, 2, 4)
- ✅ Animaciones en UI thread con Reanimated (Tasks 1, 2)
- ✅ Backdrop animado con suavidad (Tasks 1, 2)
- ✅ KeyboardProvider montado → desaparece el WARN y el panel sube con el teclado (Task 3)
- ✅ Medición comparada con la baseline (Task 5)
- ✅ Limpieza de logs (Task 6)

**2. Placeholder scan:** Todos los archivos tienen código completo; sin TODOs.

**3. Type consistency:**
- `ModalProps` / `BottomSheetProps` sin cambios → `AppResponsiveDialog`, `TreeEditor` y el showcase no se tocan.
- `snapPoints`, `contentStyle`, `dismissible`, `showCloseButton`, `icon`, `title`, `caption` se conservan.
- `space.space16`, `space.space8`, `space.space2/3/4`, `radius.lg`, `background.default` existen en `@antonella/theme` (ya usados en los archivos originales).
- `runOnJS`, `withTiming`, `useAnimatedStyle`, `useSharedValue`, `Easing` son exports de `react-native-reanimated` v4.
- `KeyboardProvider` es export de `react-native-keyboard-controller` (verificado en `lib/commonjs/index.js`).
