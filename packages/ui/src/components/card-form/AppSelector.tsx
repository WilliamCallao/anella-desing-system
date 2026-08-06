import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, TouchableOpacity, View } from "react-native";
import { appInputCard, cta1, space, spacing, text, TextType } from "@antonella/theme";
import { Icon } from "../Icon";
import { Text } from "../text/Text";
import type { AppInputProps } from "./AppInput";

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
  value,
  onChange,
  options,
  placeholder = "Seleccionar",
  disabled = false,
}: AppSelectorProps) {
  const [open, setOpen] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const chevron = useRef(new Animated.Value(0)).current;
  const height = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const selected = options.find((o) => o.value === value);

  const chevronRotate = useMemo(
    () => chevron.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] }),
    [chevron]
  );

  useEffect(() => {
    Animated.timing(chevron, {
      toValue: open ? 1 : 0,
      duration: 180,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [open, chevron]);

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(height, {
        toValue: open ? Math.max(contentHeight, options.length * OPTION_ROW_HEIGHT) : 0,
        duration: ANIM_DURATION,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(contentOpacity, {
        toValue: open ? 1 : 0,
        duration: open ? 180 : 120,
        useNativeDriver: false,
      }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [open, contentHeight, options.length, height, contentOpacity]);

  const toggle = () => {
    if (disabled) return;
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
      >
        <Text
          variant={TextType.Label}
          color={disabled ? text.placeholder : undefined}
          numberOfLines={1}
          style={[styles.label, labelWidth != null && { width: labelWidth }]}
        >
          {label}
        </Text>
        <Text
          variant={selected ? TextType.Body : TextType.Placeholder}
          numberOfLines={1}
          style={styles.value}
        >
          {selected?.label ?? placeholder}
        </Text>
        <Animated.View style={{ transform: [{ rotate: chevronRotate }] }}>
          <Icon name="chevron-down" size={16} color={disabled ? text.placeholder : text.default} />
        </Animated.View>
      </TouchableOpacity>

      <Animated.View style={{ height, overflow: "hidden" }}>
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
              >
                <Text
                  variant={TextType.Body}
                  color={isSelected ? cta1 : text.default}
                  numberOfLines={1}
                  style={styles.optionText}
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
    gap: spacing.md,
    minHeight: 52,
    paddingHorizontal: space.space4,
    paddingVertical: space.space4,
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
  optionText: {
    flex: 1,
    fontSize: 14,
  },
});
