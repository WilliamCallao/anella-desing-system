import React, { useState } from "react";
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { background, border, cta1, cta1Contrast, space, text, TextType } from "@antonella/theme";
import { Text } from "./text/Text";

export type AppFilterChipOption = {
  label: string;
  value: string;
};

export type AppFilterChipsProps = {
  options: AppFilterChipOption[];
  value?: string;
  onChange?: (value: string) => void;
  style?: StyleProp<ViewStyle>;
};

export function AppFilterChips({ options, value, onChange, style }: AppFilterChipsProps) {
  const [internal, setInternal] = useState<string>(options[0]?.value ?? "");
  const selected = value ?? internal;

  const handlePress = (chipValue: string) => {
    if (chipValue === selected) return;
    setInternal(chipValue);
    onChange?.(chipValue);
  };

  return (
    <View style={[styles.row, style]}>
      {options.map((option) => {
        const isSelected = option.value === selected;
        return (
          <Pressable
            key={option.value}
            onPress={() => handlePress(option.value)}
            style={({ pressed }) => [
              styles.chip,
              isSelected ? styles.chipSelected : styles.chipIdle,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
          >
            <Text variant={TextType.BodyMedium} color={isSelected ? cta1Contrast : text.default}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.space2,
  },
  chip: {
    minHeight: 32,
    paddingHorizontal: space.space3,
    paddingVertical: space.space2,
    justifyContent: "center",
    borderRadius: 999,
  },
  chipIdle: {
    backgroundColor: background.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: border.divider.secondary,
  },
  chipSelected: {
    backgroundColor: cta1,
  },
  pressed: {
    opacity: 0.7,
  },
});
