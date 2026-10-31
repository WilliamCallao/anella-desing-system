import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { appInputCard, danger, text, TextType } from "@william-callao/antonella-theme";
import { Icon, type IconName } from "../Icon";
import { Text } from "../text/Text";
import { CARD_ERROR, CARD_ROW, CARD_TEXT } from "./cardForm";

export type AppReadOnlyFieldProps = {
  label: string;
  labelWidth?: number;
  value?: string | null;
  /** Texto cuando no hay valor (la app pasa su copy i18n; por defecto "—"). */
  emptyLabel?: string;
  onPress?: () => void;
  /** Campo bloqueado: el valor se pinta como dato fijo, no como placeholder, y
   *  la fila anuncia el estado `disabled` al lector de pantalla. */
  disabled?: boolean;
  /** Icono decorativo al final de la fila (p. ej. `lock` en campos bloqueados). */
  trailingIcon?: IconName;
  /** Error de validación mostrado debajo de la fila, como en `AppTextInput`. */
  error?: string;
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
  disabled = false,
  trailingIcon,
  error,
  accessibilityHint,
}: AppReadOnlyFieldProps) {
  const hasValue = value != null && value.trim() !== "";
  const displayValue = hasValue ? value : emptyLabel;
  const accessibilityLabel = `${label}: ${displayValue}`;
  const valueColor = disabled
    ? text.readOnly
    : hasValue
      ? appInputCard.text.value
      : appInputCard.text.empty;

  const content = (
    <>
      <Text
        variant={TextType.Label}
        color={error ? danger.D700 : appInputCard.text.label}
        numberOfLines={1}
        style={[styles.label, CARD_TEXT, labelWidth != null && { width: labelWidth }]}
      >
        {label}
      </Text>
      <Text
        variant={hasValue ? TextType.Value : TextType.Caption}
        color={valueColor}
        style={[styles.value, hasValue ? CARD_TEXT : null]}
      >
        {displayValue}
      </Text>
      {trailingIcon ? <Icon name={trailingIcon} size={16} color={text.readOnly} /> : null}
    </>
  );

  if (onPress && !disabled) {
    return (
      <View style={styles.wrapper}>
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
          accessibilityState={{ disabled }}
          style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
        >
          {content}
        </Pressable>
        {error ? (
          <Text
            variant={TextType.Caption}
            color={danger.D700}
            style={styles.error}
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
          >
            {error}
          </Text>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View
        style={styles.row}
        accessible
        accessibilityRole="text"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled }}
      >
        {content}
      </View>
      {error ? (
        <Text
          variant={TextType.Caption}
          color={danger.D700}
          style={styles.error}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "stretch",
  },
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
  error: {
    ...CARD_ERROR,
  },
});
