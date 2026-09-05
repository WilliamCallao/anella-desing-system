import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { BackHandler } from "react-native";
import type { AppRoute } from "./AppLayout";

export type AppShellNavigation = {
  /** Nombre de la ruta actual del shell (lockedRoute si está bloqueada). */
  current: string;
  /** AppRoute resuelto de `current` contra el mapa `routes` (con fallback), listo para alimentar el AppLayout. */
  currentRoute: AppRoute;
  /** Hay una ruta anterior en el stack a la que volver. */
  canGoBack: boolean;
  /** Empuja una ruta al shell (no-op si ya es la actual o si está bloqueado). */
  navigate: (name: string) => void;
  /** Vuelve a la ruta anterior (no-op si no hay stack). */
  back: () => void;
  /** Reemplaza todo el stack por [name] (reset al salir del shell hacia una ruta expo-router). */
  reset: (name: string) => void;
};

export type AppShellProps = {
  /** Mapa name → AppRoute del shell. */
  routes: Record<string, AppRoute>;
  /** Nombre de la ruta inicial del stack. Default: `fallbackRoute`. */
  initialRoute?: string;
  /** Ruta por defecto cuando un nombre no existe en `routes`. Default "home". */
  fallbackRoute?: string;
  /**
   * Ruta bloqueada: si está definida, el shell muestra SIEMPRE esta ruta y la
   * navegación interna se ignora (p. ej. "login" cuando no hay sesión). Al
   * volver a undefined, el shell cae a la ruta que esté en el tope del stack.
   */
  lockedRoute?: string;
  children?: ReactNode;
};

const AppShellContext = createContext<AppShellNavigation | null>(null);

export function useAppShell(): AppShellNavigation {
  const ctx = useContext(AppShellContext);
  if (!ctx) {
    throw new Error("useAppShell debe usarse dentro de <AppShell>");
  }
  return ctx;
}

/** Route sintética para un nombre que no está en el mapa (nunca debería pasar). */
function unknownRoute(name: string): AppRoute {
  return { name, state: "onlyCenter", slots: {} };
}

export function AppShell({
  routes,
  initialRoute,
  fallbackRoute = "home",
  lockedRoute,
  children,
}: AppShellProps) {
  const [stack, setStack] = useState<string[]>(() =>
    initialRoute ? [initialRoute] : [fallbackRoute]
  );

  const resolve = useCallback(
    (name: string): AppRoute => {
      if (routes[name]) return routes[name];
      if (routes[fallbackRoute]) return routes[fallbackRoute];
      return unknownRoute(name);
    },
    [routes, fallbackRoute]
  );

  const top = stack[stack.length - 1];
  const current = lockedRoute ?? top;
  const currentRoute = resolve(current);
  const canGoBack = stack.length > 1;

  const navigate = useCallback(
    (name: string) => {
      if (lockedRoute) return;
      const cur = stack[stack.length - 1];
      if (cur === name) return;
      setStack((s) => [...s, name]);
    },
    [stack, lockedRoute]
  );

  const back = useCallback(() => {
    if (stack.length <= 1) return;
    setStack((s) => s.slice(0, -1));
  }, [stack]);

  const reset = useCallback((name: string) => {
    setStack([name]);
  }, []);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (stack.length > 1) {
        back();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [stack, back]);

  const value = useMemo<AppShellNavigation>(
    () => ({ current, currentRoute, canGoBack, navigate, back, reset }),
    [current, currentRoute, canGoBack, navigate, back, reset]
  );

  return <AppShellContext.Provider value={value}>{children}</AppShellContext.Provider>;
}