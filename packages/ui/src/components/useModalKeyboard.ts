import { useEffect } from "react";
import { Platform } from "react-native";
import { useReanimatedKeyboardAnimation } from "react-native-keyboard-controller";
import type { SharedValue } from "react-native-reanimated";

/**
 * Altura del teclado como shared value de Reanimated (negativo: visible,
 * 0: oculto). En nativo lo alimenta react-native-keyboard-controller
 * (incluido dentro de Modal vía ModalAttachedWatcher); en web se mide el
 * `visualViewport`.
 */
export function useModalKeyboardHeight(): SharedValue<number> {
  const { height } = useReanimatedKeyboardAnimation();

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const viewport = window.visualViewport;
    if (!viewport) return;
    const update = () => {
      const covered = Math.max(
        0,
        window.innerHeight - (viewport.offsetTop + viewport.height),
      );
      height.value = -covered;
    };
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    update();
    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
    };
  }, [height]);

  return height;
}
