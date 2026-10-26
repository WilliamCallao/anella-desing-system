import React, { forwardRef } from "react";
import { Pressable, type PressableProps, type View } from "react-native";

export type PressKind = "button" | "card" | "item" | "tab" | "chip" | "fab" | "header" | "other";

/**
 * Evento semántico de interacción. NO hay coordenadas: un tap en una zona vacía no
 * interesa a nadie y llenaría la DB de ruido.
 */
export type PressEvent = {
  component: string;
  label?: string;
  kind: PressKind;
  data?: Record<string, unknown>;
  ts: number;
};

export type PressObserver = (event: PressEvent) => void;

let observer: PressObserver | null = null;

/**
 * La app registra un único observer (que escribe a logwood). El DS no sabe nada de
 * logging: solo avisa que un componente semántico recibió un tap.
 */
export function setPressObserver(next: PressObserver | null): void {
  observer = next;
}

export function getPressObserver(): PressObserver | null {
  return observer;
}

export function emitPress(event: Omit<PressEvent, "ts">): void {
  if (!observer) return;
  try {
    observer({ ...event, ts: Date.now() });
  } catch {
    // un observer que explota no puede romper la UI
  }
}

export type PressTracking = {
  component: string;
  label?: string;
  kind: PressKind;
  data?: Record<string, unknown>;
};

export type TrackedPressableProps = PressableProps & {
  /** Si se omite, el componente se comporta como un Pressable normal y no emite nada. */
  tracking?: PressTracking;
};

/**
 * Reemplazo de `Pressable` para componentes con significado (un botón "Guardar", un card
 * de acción, un ítem de lista, una tab). Cada caso pasa su `tracking`; el observer global
 * convierte eso en un evento de log.
 */
export const TrackedPressable = forwardRef<View, TrackedPressableProps>(
  function TrackedPressable({ tracking, onPress, ...rest }, ref) {
    const handlePress: PressableProps["onPress"] = (event) => {
      if (tracking) emitPress(tracking);
      onPress?.(event);
    };

    return <Pressable ref={ref} onPress={handlePress} {...rest} />;
  }
);
