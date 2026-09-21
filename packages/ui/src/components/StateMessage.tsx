import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { danger, neutrals, space, TextType, resolveSemantic, lightSemantic } from "@william-callao/antonella-theme";
import Animated, {
  cancelAnimation,
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { Text } from "./text/Text";
import { Icon, type IconName } from "./Icon";
import { Button } from "./Button";

// ── Enums ───────────────────────────────────────────────────

export enum StateMessageType {
  LOADING = "LOADING",
  EMPTY = "EMPTY",
  ERROR = "ERROR",
}

export enum StateMessageStyle {
  DEFAULT = "DEFAULT",
  LIGHT = "LIGHT",
  WHITE = "WHITE",
  DARKNESS = "DARKNESS",
  SECONDARY = "SECONDARY",
}

// ── Props ───────────────────────────────────────────────────

export type StateMessageProps = {
  /** Qué estado representa el mensaje. */
  state: StateMessageType;
  /** Icono del mensaje (AppIcon). Default por estado: loader / inbox / alerta. */
  icon?: IconName;
  /** Texto principal. Default por estado si se omite. */
  title?: string;
  /** Texto secundario bajo el título (opcional). */
  message?: string;
  /** Label del botón de acción (ej. "Reintentar"). Si se omite, no hay botón. */
  actionLabel?: string;
  onAction?: () => void;
  style?: StateMessageStyle;
};

const STATE_DEFAULTS: Record<StateMessageType, { icon: IconName; title: string }> = {
  [StateMessageType.LOADING]: { icon: "loader", title: "Cargando..." },
  [StateMessageType.EMPTY]: { icon: "inbox", title: "No hay nada por aquí." },
  [StateMessageType.ERROR]: { icon: "alert-circle", title: "Algo salió mal." },
};

// ── Component ───────────────────────────────────────────────
// Mensaje centrado de icono + texto para estados de carga o vacío.
// Para intercambiarlo animado con el contenido real, envolverlo en un
// `TransitionView` (de @william-callao/antonella-animations) usando `contentKey`.

export function StateMessage({
  state,
  icon,
  title,
  message,
  actionLabel,
  onAction,
  style = StateMessageStyle.DEFAULT,
}: StateMessageProps) {
  const c = STYLE_COLORS[style];
  const d = STATE_DEFAULTS[state];
  // Cargando: mucho más discreto que los demás estados.
  const isLoading = state === StateMessageType.LOADING;

  return (
    <View style={[styles.container, isLoading && styles.compact]}>
      {isLoading ? (
        <SpinningIcon name={icon ?? d.icon} size={c.loadingIconSize} color={c.iconColor} />
      ) : (
        <Icon
          name={icon ?? d.icon}
          size={c.iconSize}
          color={state === StateMessageType.ERROR ? c.errorIconColor : c.iconColor}
        />
      )}
      <Text
        variant={isLoading ? TextType.Caption : TextType.Label}
        color={isLoading ? c.messageColor : c.titleColor}
        style={styles.title}
      >
        {title ?? d.title}
      </Text>
      {!isLoading && message ? (
        <Text variant={TextType.Caption} color={c.messageColor} style={styles.message}>
          {message}
        </Text>
      ) : null}
      {!isLoading && actionLabel ? (
        <Button label={actionLabel} onPress={onAction} style={styles.action} />
      ) : null}
    </View>
  );
}

/** Icono en rotación continua (se detiene si el sistema pide menos movimiento). */
function SpinningIcon({ name, size, color }: { name: IconName; size: number; color: string }) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1400, easing: Easing.linear, reduceMotion: ReduceMotion.System }),
      -1,
    );
    return () => cancelAnimation(rotation);
  }, [rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Icon name={name} size={size} color={color} />
    </Animated.View>
  );
}

// ── Color maps per style ────────────────────────────────────

const _semantic = resolveSemantic(lightSemantic);

const STYLE_COLORS: Record<
  StateMessageStyle,
  {
    iconColor: string;
    titleColor: string;
    messageColor: string;
    errorIconColor: string;
    iconSize: number;
    loadingIconSize: number;
  }
> = {
  [StateMessageStyle.DEFAULT]: {
    iconColor: _semantic.default.text.subtle,
    titleColor: _semantic.default.text.default,
    messageColor: _semantic.default.text.subtle,
    errorIconColor: danger.D600,
    iconSize: 40,
    loadingIconSize: 26,
  },
  // Light: variante invertida de la familia light (misma lógica que SearchBar
  // LIGHT): ícono N600, título N950, mensaje N500 — texto oscuro sobre
  // superficies claras.
  [StateMessageStyle.LIGHT]: {
    iconColor: _semantic.light.icon.default,
    titleColor: _semantic.light.text.default,
    messageColor: _semantic.light.text.subtle,
    errorIconColor: danger.D600,
    iconSize: 40,
    loadingIconSize: 26,
  },
  // White: variante para fondos oscuros — ícono y textos en blanco (N0), con
  // el mensaje en un blanco suavizado (N100) para preservar jerarquía.
  [StateMessageStyle.WHITE]: {
    iconColor: neutrals.N0,
    titleColor: neutrals.N0,
    messageColor: neutrals.N100,
    errorIconColor: danger.D400,
    iconSize: 40,
    loadingIconSize: 26,
  },
  // Darkness: escala de intensidad con jerarquía clara — ícono N500, mensaje N500,
  // título N400 (el más claro). Contraste medio, discreto.
  [StateMessageStyle.DARKNESS]: {
    iconColor: neutrals.N500,
    titleColor: neutrals.N400,
    messageColor: neutrals.N500,
    errorIconColor: danger.D400,
    iconSize: 32,
    loadingIconSize: 20,
  },
  // Variante discreta: menos contraste y a menor tamaño para no robar
  // protagonismo (se usa dentro de paneles/contextos ya ocupados).
  [StateMessageStyle.SECONDARY]: {
    iconColor: neutrals.N600,
    titleColor: neutrals.N500,
    messageColor: neutrals.N600,
    errorIconColor: danger.D400,
    iconSize: 26,
    loadingIconSize: 20,
  },
};

// ── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: space.space2,
    paddingVertical: space.space8,
    paddingHorizontal: space.space5,
  },
  compact: {
    paddingVertical: space.space7,
    gap: space.space1,
  },
  title: {
    textAlign: "center",
  },
  message: {
    textAlign: "center",
    maxWidth: 420,
  },
  action: {
    marginTop: space.space2,
  },
});
