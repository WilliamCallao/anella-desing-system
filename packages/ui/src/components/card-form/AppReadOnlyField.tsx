import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { appInputCard, TextType } from "@william-callao/antonella-theme";
import { Text } from "../text/Text";
import { CARD_ROW, CARD_TEXT } from "./cardForm";

export type AppReadOnlyFieldProps = {
  label: string;
  labelWidth?: number;
  value?: string | null;
  /** Texto cuando no hay valor (la app pasa su copy i18n; por defecto "—"). */
  emptyLabel?: string;
  onPress?: () => void;
  accessibilityHint?: string;
};

/**
 * Fila de solo lectura con el mismo ritmo que `AppTextInput`: etiqueta a la
 * izquierda y valor a la derecha, sin apariencia de input. El label va en
 * negro y el valor en gris (dato fijo); si no hay valor, el `emptyLabel` baja
 * a Caption para que nunca se confunda con un valor escrito.
 */
export function AppReadOnlyField({
  label,
  labelWidth,
  value,
  emptyLabel = "—",
  onPress,
  accessibilityHint,
}: AppReadOnlyFieldProps) {
  const hasValue = value != null && value.trim() !== "";
  const displayValue = hasValue ? value : emptyLabel;
  const accessibilityLabel = `${label}: ${displayValue}`;

  const content = (
    <>
      <Text
        variant={TextType.Label}
        color={appInputCard.text.label}
        numberOfLines={1}
        style={[styles.label, CARD_TEXT, labelWidth != null && { width: labelWidth }]}
      >
        {label}
      </Text>
      <Text
        variant={hasValue ? TextType.Value : TextType.Caption}
        color={hasValue ? appInputCard.text.value : appInputCard.text.placeholder}
        style={[styles.value, hasValue ? CARD_TEXT : null]}
      >
        {displayValue}
      </Text>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View
      style={styles.row}
      accessible
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel}
    >
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    ...CARD_ROW,
  },
  rowPressed: {
    // El fondo del card es el mismo gris: sin esto el tap no da feedback.
    backgroundColor: appInputCard.separator,
  },
  label: {
    flexShrink: 0,
  },
  value: {
    flex: 1,
    textAlign: "right",
  },
});
