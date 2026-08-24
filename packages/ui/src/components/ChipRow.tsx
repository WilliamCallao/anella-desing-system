import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { space } from "@antonella/theme";
import { Item } from "./Item";
import { ItemStyle } from "./Item";
import type { ItemProps } from "./Item";
import type { IconName } from "./Icon";

// ── Props ───────────────────────────────────────────────────

export type ChipRowOption = {
  icon: IconName;
  label: string;
  value: string;
};

export type ChipRowProps = {
  options: ChipRowOption[];
  selected?: string;
  onSelect?: (value: string) => void;
  style?: ItemStyle;
  /** Cuando es true, los items se reparten el ancho completo (flex: 1) sin scroll horizontal. */
  fullWidth?: boolean;
};

// ── Component ───────────────────────────────────────────────

export function ChipRow({
  options,
  selected: controlledSelected,
  onSelect,
  style = ItemStyle.DARKNESS,
  fullWidth = false,
}: ChipRowProps) {
  const [internalSelected, setInternalSelected] = useState(
    options[0]?.value ?? ""
  );
  const selected = controlledSelected ?? internalSelected;

  const handlePress = (value: string) => {
    onSelect?.(value);
    if (!controlledSelected) setInternalSelected(value);
  };

  if (fullWidth) {
    return (
      <View style={styles.fullWidth}>
        {options.map((opt) => (
          <View key={opt.value} style={styles.fullWidthItem}>
            <Item
              icon={opt.icon}
              label={opt.label}
              style={style}
              selected={selected === opt.value}
              onPress={() => handlePress(opt.value)}
            />
          </View>
        ))}
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
    >
      {options.map((opt) => (
        <Item
          key={opt.value}
          icon={opt.icon}
          label={opt.label}
          style={style}
          selected={selected === opt.value}
          onPress={() => handlePress(opt.value)}
        />
      ))}
    </ScrollView>
  );
}

// ── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
  scroll: {
    gap: 8,
    paddingLeft: space.space3,
    paddingRight: space.space3,
  },
  fullWidth: {
    flexDirection: "row",
    gap: 8,
  },
  fullWidthItem: {
    flex: 1,
  },
});
