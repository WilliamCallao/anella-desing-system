import React from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import {
  brand,
  neutrals,
  radius,
  space,
  success,
  text,
  TextType,
  warning,
} from "@william-callao/antonella-theme";
import { Icon, type IconName } from "./Icon";
import { Label, LabelStyle } from "./Label";
import { Text } from "./text/Text";

export type InfoNoteTone = "light" | "dark";

export enum InfoNoteStatus {
  INFO = "INFO",
  WARNING = "WARNING",
  SUCCESS = "SUCCESS",
}

type NotePalette = {
  background: string;
  border: string;
  icon: string;
  title: string;
  message: string;
};

type StatusConfig = {
  icon: IconName;
  light: NotePalette;
  dark: NotePalette;
};

const STATUS_CONFIG: Record<InfoNoteStatus, StatusConfig> = {
  [InfoNoteStatus.INFO]: {
    icon: "information-circle",
    light: {
      background: brand.M50,
      border: brand.M200,
      icon: brand.M600,
      title: neutrals.N900,
      message: text.default,
    },
    dark: {
      background: "rgba(100, 164, 215, 0.08)",
      border: "rgba(100, 164, 215, 0.28)",
      icon: brand.M300,
      title: neutrals.N0,
      message: neutrals.N300,
    },
  },
  [InfoNoteStatus.WARNING]: {
    icon: "alert-circle",
    light: {
      background: warning.W50,
      border: warning.W200,
      icon: warning.W600,
      title: warning.W900,
      message: neutrals.N700,
    },
    dark: {
      background: "rgba(251, 191, 36, 0.10)",
      border: "rgba(251, 191, 36, 0.30)",
      icon: warning.W300,
      title: neutrals.N0,
      message: neutrals.N300,
    },
  },
  [InfoNoteStatus.SUCCESS]: {
    icon: "checkmark-circle",
    light: {
      background: success.S50,
      border: success.S200,
      icon: success.S600,
      title: success.S900,
      message: neutrals.N700,
    },
    dark: {
      background: "rgba(74, 222, 128, 0.10)",
      border: "rgba(74, 222, 128, 0.28)",
      icon: success.S300,
      title: neutrals.N0,
      message: neutrals.N300,
    },
  },
};

export type InfoNoteAction = {
  label: string;
  icon?: IconName;
  onPress: () => void;
  accessibilityLabel?: string;
};

export type InfoNoteProps = {
  title?: string;
  message: string;
  icon?: IconName;
  /** Estado semántico de la nota. Default: `INFO`. */
  status?: InfoNoteStatus;
  /** Acciones que se muestran debajo de la nota, alineadas a la izquierda. */
  actions?: InfoNoteAction[];
  /** Superficie sobre la que se pinta la nota. */
  tone?: InfoNoteTone;
  style?: StyleProp<ViewStyle>;
};

/**
 * Nota informativa compacta para formularios y selectores. El estado (`INFO`,
 * `WARNING`, `SUCCESS`) define el color de fondo, borde e icono; las acciones
 * usan el botón de alto contraste cuando la nota vive sobre una superficie
 * oscura.
 */
export function InfoNote({
  title,
  message,
  icon,
  status = InfoNoteStatus.INFO,
  actions,
  tone = "light",
  style,
}: InfoNoteProps) {
  const isDark = tone === "dark";
  const config = STATUS_CONFIG[status];
  const palette = isDark ? config.dark : config.light;

  return (
    <View style={[styles.wrapper, style]}>
      <View
        style={[
          styles.note,
          {
            backgroundColor: palette.background,
            borderColor: palette.border,
          },
        ]}
      >
        <Icon
          name={icon ?? config.icon}
          size={20}
          color={palette.icon}
        />
        <View style={styles.content}>
          {title ? (
            <Text variant={TextType.BodyMedium} color={palette.title}>
              {title}
            </Text>
          ) : null}
          <Text variant={TextType.Caption} color={palette.message}>
            {message}
          </Text>
        </View>
      </View>
      {actions && actions.length > 0 ? (
        <View style={styles.actions}>
          {actions.map((action, index) => (
            <Label
              key={`${action.label}-${index}`}
              label={action.label}
              icon={action.icon}
              onPress={action.onPress}
              accessibilityLabel={action.accessibilityLabel}
              style={isDark ? LabelStyle.DARKNESS_ACTION : undefined}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: space.space2,
  },
  note: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: space.space2,
    padding: space.space3,
    borderWidth: 1,
    borderRadius: radius.md,
  },
  content: {
    flex: 1,
    gap: space.space1,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: space.space2,
  },
});
