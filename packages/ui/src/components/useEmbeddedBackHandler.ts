import { useEffect } from "react";
import { BackHandler } from "react-native";
import { lockEmbeddedOverlay } from "./embeddedOverlayGuard";

/**
 * Maneja el back de Android en diálogos `embedded`: el host modal nativo
 * (expo-router) no conoce `dismissible`, así que el propio primitivo decide si
 * cierra o bloquea. Fuera de `embedded`, el `onRequestClose` del `RN Modal`
 * hace el mismo trabajo.
 */
export function useEmbeddedBackHandler({
  embedded,
  visible,
  dismissible,
  onClose,
}: {
  embedded: boolean;
  visible: boolean;
  dismissible: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!embedded || !visible) return;
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (dismissible) onClose();
        return true;
      },
    );
    return () => subscription.remove();
  }, [dismissible, embedded, onClose, visible]);

  useEffect(() => {
    if (!embedded || !visible || dismissible) return;
    return lockEmbeddedOverlay();
  }, [dismissible, embedded, visible]);
}
