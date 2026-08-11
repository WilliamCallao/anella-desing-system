import React, { useState } from "react";
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import {
  appInputCard,
  background,
  border,
  danger,
  radius,
  space,
  success,
  text,
  TextType,
} from "@antonella/theme";
import { Icon } from "./Icon";
import { Text } from "./text/Text";

export type AppCheckItemStatus = "pending" | "ok" | "not-ok";

export type AppCheckItemProps = {
  label: string;
  description?: string;
  value?: AppCheckItemStatus;
  comment?: string;
  hasMessages?: boolean;
  noActions?: boolean;
  readOnly?: boolean;
  onOpenMessages?: () => void;
  onPress?: () => void;
  onChange?: (status: AppCheckItemStatus) => void;
  onCommentChange?: (comment: string) => void;
  style?: StyleProp<ViewStyle>;
};

export function AppCheckItem({
  label,
  description,
  value,
  comment,
  hasMessages,
  noActions,
  readOnly,
  onOpenMessages,
  onPress,
  onChange,
  onCommentChange,
  style,
}: AppCheckItemProps) {
  const [internal, setInternal] = useState<AppCheckItemStatus>("pending");
  const [open, setOpen] = useState(false);
  const status = value ?? internal;
  const resolved = status !== "pending";

  const select = (next: AppCheckItemStatus) => {
    setInternal(next);
    setOpen(false);
    onChange?.(next);
  };

  const handleRowPress = readOnly
    ? undefined
    : noActions
      ? onPress
      : () => setOpen((o) => !o);

  const disabled = readOnly || (noActions && onPress == null);

  const rowContent = (
    <>
      {!noActions ? (
        <View
          style={[
            styles.circle,
            status === "ok" && styles.circleOk,
            status === "not-ok" && styles.circleNotOk,
          ]}
        >
          {status === "ok" ? <Icon name="checkmark" size={14} color="#FFFFFF" /> : null}
          {status === "not-ok" ? <Icon name="close" size={14} color="#FFFFFF" /> : null}
        </View>
      ) : null}

      <View style={styles.content}>
        <Text
          variant={TextType.Body}
          color={resolved ? text.secondary : text.default}
          numberOfLines={2}
          style={resolved ? styles.strikethrough : undefined}
        >
          {label}
        </Text>
        {description != null ? (
          <Text
            variant={TextType.Caption}
            numberOfLines={2}
            style={resolved ? styles.strikethrough : undefined}
          >
            {description}
          </Text>
        ) : null}
      </View>

      {hasMessages && !noActions && !readOnly ? (
        <Pressable
          onPress={onOpenMessages}
          hitSlop={8}
          android_ripple={{ color: "rgba(15,23,42,0.08)" }}
          style={({ pressed }) => [styles.messagesButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Abrir mensajes"
        >
          <Icon name="chatbubble" size={20} color={text.secondary} />
        </Pressable>
      ) : null}
    </>
  );

  return (
    <View style={[styles.card, style]}>
      <Pressable
        onPress={handleRowPress}
        disabled={disabled}
        android_ripple={{ color: "rgba(15,23,42,0.06)" }}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityState={
          readOnly
            ? { disabled: true }
            : noActions
              ? undefined
              : { selected: resolved, expanded: open }
        }
        accessibilityLabel={label}
      >
        {rowContent}
      </Pressable>

      {!readOnly && open ? (
        <View style={styles.options}>
          <Pressable
            onPress={() => select("ok")}
            android_ripple={{ color: "rgba(22,163,74,0.12)" }}
            style={({ pressed }) => [styles.option, styles.optionOk, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Marcar como correcto"
          >
            <Icon name="checkmark" size={16} color={success.S700} />
            <Text variant={TextType.BodyMedium} color={success.S700}>
              Correcto
            </Text>
          </Pressable>
          <Pressable
            onPress={() => select("not-ok")}
            android_ripple={{ color: "rgba(220,38,38,0.12)" }}
            style={({ pressed }) => [styles.option, styles.optionNotOk, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Marcar como incorrecto"
          >
            <Icon name="close" size={16} color={danger.D700} />
            <Text variant={TextType.BodyMedium} color={danger.D700}>
              Incorrecto
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: background.surface,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: border.divider.secondary,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.space3,
    minHeight: 48,
    paddingVertical: space.space4,
    paddingHorizontal: space.space4,
  },
  pressed: {
    opacity: 0.7,
  },
  content: {
    flex: 1,
    gap: space.space1,
  },
  strikethrough: {
    textDecorationLine: "line-through",
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: appInputCard.border,
    alignItems: "center",
    justifyContent: "center",
  },
  circleOk: {
    backgroundColor: success.S700,
    borderColor: success.S700,
  },
  circleNotOk: {
    backgroundColor: danger.D700,
    borderColor: danger.D700,
  },
  messagesButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  options: {
    flexDirection: "row",
    gap: space.space2,
    paddingHorizontal: space.space4,
    paddingBottom: space.space4,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.space2,
    minHeight: 34,
    paddingHorizontal: space.space3,
    borderRadius: 999,
  },
  optionOk: {
    backgroundColor: success.S50,
  },
  optionNotOk: {
    backgroundColor: danger.D50,
  },
});
