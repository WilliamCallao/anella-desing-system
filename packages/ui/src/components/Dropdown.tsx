import React, { useState, useRef } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Icon, Text, type IconName } from "../";
import { palette, spacing } from "@antonella/theme";

export type DropdownOption = {
  label: string;
  value: string;
  icon?: IconName;
};

export type DropdownState = {
  value: string;
  open: boolean;
};

export type DropdownProps = {
  value?: string;
  placeholder?: string;
  options: DropdownOption[];
  onChange: (option: DropdownOption) => void;
  style?: object;
};

export function Dropdown({
  value,
  placeholder = "Seleccionar…",
  options,
  onChange,
  style,
}: DropdownProps) {
  const [state, setState] = useState<DropdownState>({ value: value ?? "", open: false });
  const triggerRef = useRef<View>(null);
  const [triggerBounds, setTriggerBounds] = useState<{ pageY: number } | null>(null);

  const selectedLabel = state.value
    ? options.find((o) => o.value === state.value)?.label ?? ""
    : placeholder;

  const handleOpen = () => {
    if (triggerRef.current) {
      triggerRef.current.measureLayout(View.prototype, (x, y) => {
        setTriggerBounds({ pageY: y });
      });
    }
    setState((s) => ({ ...s, open: true }));
  };

  const handleSelect = (option: DropdownOption) => {
    setState({ value: option.value, open: false });
    setTriggerBounds(null);
    onChange(option);
  };

  const handleClose = () => {
    setState((s) => ({ ...s, open: false }));
    setTriggerBounds(null);
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        ref={triggerRef}
        onPress={handleOpen}
        style={styles.trigger}
        activeOpacity={0.7}
        accessibilityRole="button"
      >
        <Text style={[styles.triggerText, !state.value && styles.placeholder]}>{selectedLabel}</Text>
        <Icon name="chevron-down" size={16} color={palette.textMuted} style={styles.icon} />
      </TouchableOpacity>

      <Modal
        transparent
        visible={state.open}
        animationType="fade"
        hardwareAccelerated
        onRequestClose={handleClose}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        <View style={[styles.modalBox, triggerBounds ? { top: triggerBounds.pageY + 48 } : styles.modalCenter]}>
          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            showsVerticalScrollIndicator={false}
            style={styles.list}
            renderItem={({ item }) => {
              const selected = item.value === state.value;
              return (
                <TouchableOpacity
                  style={[styles.option, selected && styles.optionSelected]}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.7}
                >
                  {item.icon ? <Icon name={item.icon} size={16} color={palette.text} style={styles.optionIcon} /> : null}
                  <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{item.label}</Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: palette.background,
    minHeight: 44,
  },
  triggerText: {
    fontSize: 16,
    color: palette.text,
    flex: 1,
  },
  placeholder: {
    color: palette.textMuted,
  },
  icon: {
    marginLeft: spacing.sm,
  },
  modalCenter: {
    position: "absolute",
    top: 120,
    left: 24,
    right: 24,
    backgroundColor: palette.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    maxHeight: 320,
    overflow: "hidden",
  },
  modalBox: {
    position: "absolute",
    left: 24,
    right: 24,
    backgroundColor: palette.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    maxHeight: 320,
    overflow: "hidden",
  },
  list: {
    flexGrow: 0,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  optionSelected: {
    backgroundColor: palette.primary + "10",
  },
  optionIcon: {
    marginRight: spacing.sm,
  },
  optionText: {
    fontSize: 15,
    color: palette.text,
  },
  optionTextSelected: {
    fontWeight: "600",
    color: palette.primary,
  },
});
