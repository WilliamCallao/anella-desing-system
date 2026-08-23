import React from "react";
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { danger, neutrals, space, success, TextType, warning } from "@antonella/theme";
import { Text } from "./text/Text";
import { Icon, type IconName } from "./Icon";

// ── Enums ───────────────────────────────────────────────────

export enum ToastTone {
  Success = "success",
  Error = "error",
  Warning = "warning",
  Info = "info",
}

export enum ToastStyle {
  DEFAULT = "DEFAULT",
  DARKNESS = "DARKNESS",
}

// ── Props ───────────────────────────────────────────────────

export type ToastProps = {
  message: string;
  tone?: ToastTone;
  style?: ToastStyle;
  /** Si se define, muestra botón de cerrar (toast manual). */
  onClose?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
};

const TONE_ICONS: Record<ToastTone, IconName> = {
  [ToastTone.Success]: "checkmark-circle",
  [ToastTone.Error]: "alert-circle",
  [ToastTone.Warning]: "triangle-alert",
  [ToastTone.Info]: "information-circle",
};

// ── Component ───────────────────────────────────────────────
// Píldora flotante de feedback. Se muestra vía `useToast().showToast()`
// (ver ToastProvider); también puede montarse a mano.

export function Toast({
  message,
  tone = ToastTone.Info,
  style = ToastStyle.DEFAULT,
  onClose,
  containerStyle,
}: ToastProps) {
  const c = STYLE_COLORS[style][tone];

  return (
    <View style={[styles.toast, { backgroundColor: c.bg }, containerStyle]}>
      <Icon name={TONE_ICONS[tone]} size={18} color={c.content} />
      <Text variant={TextType.Caption} color={c.content} style={styles.message}>
        {message}
      </Text>
      {onClose ? (
        <Pressable
          onPress={onClose}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Cerrar aviso"
          style={({ pressed }) => [styles.close, pressed && styles.closePressed]}
        >
          <Icon name="close" size={15} color={c.content} />
        </Pressable>
      ) : null}
    </View>
  );
}

// ── Color maps per style/tone ───────────────────────────────

const _white = neutrals.N0;

const STYLE_COLORS: Record<ToastStyle, Record<ToastTone, { bg: string; content: string }>> = {
  [ToastStyle.DEFAULT]: {
    [ToastTone.Success]: { bg: success.S600, content: _white },
    [ToastTone.Error]: { bg: danger.D600, content: _white },
    [ToastTone.Warning]: { bg: warning.W600, content: _white },
    [ToastTone.Info]: { bg: neutrals.N700, content: _white },
  },
  [ToastStyle.DARKNESS]: {
    [ToastTone.Success]: { bg: success.S500, content: _white },
    [ToastTone.Error]: { bg: danger.D500, content: _white },
    [ToastTone.Warning]: { bg: warning.W500, content: _white },
    [ToastTone.Info]: { bg: neutrals.N700, content: _white },
  },
};

// ── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.space2,
    minHeight: 44,
    borderRadius: 14,
    paddingVertical: space.space2 + 2,
    paddingHorizontal: space.space4,
    shadowColor: "#000000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  message: {
    flexShrink: 1,
  },
  close: {
    marginLeft: space.space1,
    alignItems: "center",
    justifyContent: "center",
  },
  closePressed: {
    opacity: 0.6,
  },
});
