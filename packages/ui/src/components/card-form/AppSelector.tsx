import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Keyboard,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { appInput, appInputCard, cta1, space, spacing, text, TextType } from "@william-callao/antonella-theme";
import { Icon } from "../Icon";
import { Text } from "../text/Text";
import type { AppInputProps } from "./AppInput";
import { CARD_ERROR, CARD_ROW, CARD_TEXT } from "./cardForm";

export type AppSelectorOption = {
  label: string;
  value: string;
};

export type AppSelectorProps = AppInputProps & {
  type?: "select";
  value: string;
  onChange: (value: string) => void;
  options: AppSelectorOption[];
  placeholder?: string;
  disabled?: boolean;
};

const OPTION_ROW_HEIGHT = 48;
const OPTION_INDENT = space.space12;
const ANIM_DURATION = 220;

export function AppSelector({
  label,
  labelWidth,
  error,
  value,
  onChange,
  options,
  placeholder = "Seleccionar",
  disabled = false,
}: AppSelectorProps) {
  const [open, setOpen] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  // Reduce Motion: las animaciones de altura/opacidad se vuelven instantáneas.
  const [reduceMotion, setReduceMotion] = useState(false);
  const chevron = useRef(new Animated.Value(0)).current;
  const height = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (mounted) setReduceMotion(reduced);
    });
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  const chevronRotate = useMemo(
    () => chevron.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] }),
    [chevron]
  );

  useEffect(() => {
    Animated.timing(chevron, {
      toValue: open ? 1 : 0,
      duration: reduceMotion ? 0 : 180,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [open, chevron, reduceMotion]);

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(height, {
        toValue: open ? Math.max(contentHeight, options.length * OPTION_ROW_HEIGHT) : 0,
        duration: reduceMotion ? 0 : ANIM_DURATION,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(contentOpacity, {
        toValue: open ? 1 : 0,
        duration: reduceMotion ? 0 : open ? 180 : 120,
        useNativeDriver: false,
      }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [open, contentHeight, options.length, height, contentOpacity, reduceMotion]);

  const toggle = () => {
    if (disabled) return;
    // Con el teclado abierto la fila (y sus opciones inline) puede quedar fuera
    // del viewport del sheet; cerrarlo libera el espacio antes de expandir
    // (APP-001: el primer tap lo consumía el IME).
    if (!open) Keyboard.dismiss();
    setOpen((o) => !o);
  };

  const handleSelect = (option: AppSelectorOption) => {
    onChange(option.value);
    setOpen(false);
  };

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={styles.row}
        onPress={toggle}
        activeOpacity={0.6}
        accessibilityRole="button"
        accessibilityState={{ expanded: open, disabled }}
        accessibilityLabel={`${label}: ${selected?.label ?? placeholder}`}
      >
        <Text
          variant={TextType.Label}
          numberOfLines={1}
          color={error ? appInput.error : undefined}
          style={[styles.label, CARD_TEXT, labelWidth != null && { width: labelWidth }]}
        >
          {label}
        </Text>
        <Text
          variant={TextType.Value}
          color={disabled ? text.readOnly : selected ? text.default : appInputCard.text.placeholder}
          numberOfLines={1}
          style={[styles.value, CARD_TEXT, !selected && !disabled ? styles.placeholder : undefined]}
        >
          {selected?.label ?? placeholder}
        </Text>
        <Animated.View style={{ transform: [{ rotate: chevronRotate }] }}>
          <Icon name="chevron-down" size={16} color={disabled ? text.readOnly : text.default} />
        </Animated.View>
      </TouchableOpacity>

      {error ? (
        <Text
          variant={TextType.Caption}
          color={appInput.error}
          style={styles.error}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          {error}
        </Text>
      ) : null}

      <Animated.View
        style={{ height, overflow: "hidden" }}
        // Cerrada, la lista sigue montada (para medirla) pero no debe existir
        // para el lector de pantalla: si no, TalkBack enfoca opciones invisibles.
        accessibilityElementsHidden={!open}
        importantForAccessibility={open ? "auto" : "no-hide-descendants"}
        pointerEvents={open ? "auto" : "none"}
      >
        <Animated.View
          style={{ opacity: contentOpacity }}
          onLayout={(event) => setContentHeight(event.nativeEvent.layout.height)}
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            return (
              <TouchableOpacity
                key={option.value}
                style={[styles.option, index > 0 && styles.optionSeparated]}
                onPress={() => handleSelect(option)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
              >
                <Text
                  variant={TextType.BodyMedium}
                  color={isSelected ? cta1 : text.default}
                  numberOfLines={1}
                  style={[styles.optionText, CARD_TEXT]}
                >
                  {option.label}
                </Text>
                {isSelected ? <Icon name="checkmark" size={16} color={cta1} /> : null}
              </TouchableOpacity>
            );
          })}
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    ...CARD_ROW,
    overflow: "hidden",
  },
  label: {
    flexShrink: 0,
  },
  value: {
    flex: 1,
    paddingRight: 2,
    textAlign: "right",
    overflow: "hidden",
  },
  placeholder: {
    fontWeight: "300",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: 48,
    paddingLeft: OPTION_INDENT,
    paddingVertical: spacing.sm,
    paddingRight: spacing.lg,
  },
  optionSeparated: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: appInputCard.separator,
  },
  error: {
    ...CARD_ERROR,
  },
  optionText: {
    flex: 1,
  },
});
