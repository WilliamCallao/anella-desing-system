import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  ReduceMotion,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { space } from "@william-callao/antonella-theme";
import { Toast, ToastTone } from "../components/Toast";

// ── Public API ──────────────────────────────────────────────

export const TOAST_DEFAULT_DURATION_MS = 3000;

export type ToastOptions = {
  message: string;
  tone?: ToastTone;
  /** Milisegundos hasta el auto-cierre. Default: 3000. Con 0 no se autocierra y muestra botón de cerrar. */
  duration?: number;
};

type ActiveToast = Required<ToastOptions> & { id: number };

type ToastContextValue = {
  showToast: (options: ToastOptions) => void;
};

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export function useToast(): ToastContextValue {
  return useContext(ToastContext);
}

// ── Provider ────────────────────────────────────────────────
// Patrón Provider + Host (como DrawerProvider): se monta una vez
// cerca de la raíz y cualquier pantalla llama a `showToast`.
// Solo hay un toast visible: una nueva llamada reemplaza al anterior
// y reinicia el timer de auto-cierre.

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ActiveToast | null>(null);
  const idRef = useRef(0);

  const showToast = useCallback((options: ToastOptions) => {
    idRef.current += 1;
    setToast({
      id: idRef.current,
      message: options.message,
      tone: options.tone ?? ToastTone.Info,
      duration: options.duration ?? TOAST_DEFAULT_DURATION_MS,
    });
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  // Auto-cierre (los toasts manuales, duration <= 0, no tienen timer).
  useEffect(() => {
    if (!toast || toast.duration <= 0) return;
    const timer = setTimeout(() => setToast(null), toast.duration);
    return () => clearTimeout(timer);
  }, [toast]);

  const dismiss = useCallback(() => setToast(null), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastHost toast={toast} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

// ── Host ────────────────────────────────────────────────────

const ENTER_DURATION_MS = 240;
const EXIT_DURATION_MS = 180;

function ToastHost({ toast, onDismiss }: { toast: ActiveToast | null; onDismiss: () => void }) {
  const insets = useSafeAreaInsets();
  const progress = useSharedValue(0);
  const [current, setCurrent] = useState<ActiveToast | null>(null);
  const currentRef = useRef<ActiveToast | null>(null);
  currentRef.current = current;

  const clearCurrent = useCallback(() => setCurrent(null), []);

  useEffect(() => {
    if (toast) {
      // Entrada (o reemplazo del toast anterior).
      setCurrent(toast);
      cancelAnimation(progress);
      progress.value = 0;
      progress.value = withTiming(1, {
        duration: ENTER_DURATION_MS,
        easing: Easing.out(Easing.cubic),
        reduceMotion: ReduceMotion.System,
      });
      return;
    }
    // Salida: animar fuera y recién ahí desmontar la píldora.
    if (!currentRef.current) return;
    cancelAnimation(progress);
    progress.value = withTiming(
      0,
      { duration: EXIT_DURATION_MS, easing: Easing.in(Easing.quad), reduceMotion: ReduceMotion.System },
      (finished) => {
        if (finished) runOnJS(clearCurrent)();
      },
    );
  }, [toast, clearCurrent, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * -space.space5 }],
  }));

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      {current ? (
        <Animated.View
          pointerEvents="box-none"
          style={[styles.host, animatedStyle]}
        >
          <Toast
            message={current.message}
            tone={current.tone}
            topInset={insets.top}
            onClose={current.duration <= 0 ? onDismiss : undefined}
          />
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "stretch",
  },
});
