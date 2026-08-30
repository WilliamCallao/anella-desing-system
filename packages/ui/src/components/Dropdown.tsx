import React, { useState, useRef } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
  type ViewStyle,
} from "react-native";
import { Icon, Text, type IconName } from "../";
import { background, card, cta1, cta1Contrast, spacing, texts } from "@william-callao/antonella-theme";

export type DropdownOption = {
  label: string;
  value: string;
  icon?: IconName;
  disabled?: boolean;
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
  style?: ViewStyle;
  maxHeight?: number;
  disabled?: boolean;
};

const DROPDOWN_HEIGHT = 320;
const TRIGGER_OFFSET = 8;

export function Dropdown({
  value,
  placeholder = "Seleccionar…",
  options,
  onChange,
  style,
  maxHeight = DROPDOWN_HEIGHT,
  disabled = false,
}: DropdownProps) {
  const [state, setState] = useState<DropdownState>({ value: value ?? "", open: false });
  const triggerRef = useRef<View>(null);
  const [triggerBounds, setTriggerBounds] = useState<{
    pageX: number;
    pageY: number;
    width: number;
    height: number;
  } | null>(null);
  const [isBelow, setIsBelow] = useState(true);
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();

  const selectedLabel = state.value
    ? options.find((o) => o.value === state.value)?.label ?? ""
    : placeholder;

  const handleOpen = () => {
    if (triggerRef.current) {
      triggerRef.current.measureInWindow((pageX, pageY, width, height) => {
        const spaceBelow = screenHeight - pageY - height;
        const spaceAbove = pageY;
        const showBelow = spaceBelow >= Math.min(spaceAbove, DROPDOWN_HEIGHT);
        setIsBelow(showBelow);
        setTriggerBounds({ pageX, pageY, width, height });
      });
    }
    setState((s) => ({ ...s, open: true }));
  };

  const handleSelect = (option: DropdownOption) => {
    if (option.disabled) return;
    setState({ value: option.value, open: false });
    setTriggerBounds(null);
    onChange(option);
  };

  const handleClose = () => {
    setState((s) => ({ ...s, open: false }));
    setTriggerBounds(null);
  };

  const dropdownTop = triggerBounds
    ? isBelow
      ? triggerBounds.pageY + triggerBounds.height + TRIGGER_OFFSET
      : triggerBounds.pageY - maxHeight - TRIGGER_OFFSET
    : screenHeight / 2 - maxHeight / 2;

  const dropdownLeft = triggerBounds ? triggerBounds.pageX : 24;
  const dropdownRight = triggerBounds
    ? screenWidth - triggerBounds.pageX - triggerBounds.width
    : 24;

  const dropdownStyle: ViewStyle = triggerBounds
    ? {
        top: dropdownTop,
        left: dropdownLeft,
        right: dropdownRight,
        maxHeight,
      }
    : {
        top: dropdownTop,
        left: 24,
        right: 24,
        maxHeight,
      };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        ref={triggerRef}
        onPress={handleOpen}
        style={[styles.trigger, disabled && styles.triggerDisabled]}
        activeOpacity={0.7}
        accessibilityRole="button"
        disabled={disabled}
      >
        <Text style={[styles.triggerText, !state.value && styles.placeholder]} numberOfLines={1}>
          {selectedLabel}
        </Text>
        <Icon name="chevron-down" size={16} color={card.text.secondary} style={styles.icon} />
      </TouchableOpacity>

      <Modal
        transparent
        visible={state.open}
        animationType="fade"
        hardwareAccelerated
        onRequestClose={handleClose}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        <View style={[styles.modalBox, dropdownStyle]}>
          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            showsVerticalScrollIndicator={false}
            style={styles.list}
            renderItem={({ item }) => {
              const selected = item.value === state.value;
              return (
                <TouchableOpacity
                  style={[
                    styles.option,
                    selected && styles.optionSelected,
                    item.disabled && styles.optionDisabled,
                  ]}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.7}
                  disabled={item.disabled}
                >
                  {item.icon ? <Icon name={item.icon} size={16} color={card.text.primary} style={styles.optionIcon} /> : null}
                  <Text style={[styles.optionText, selected && styles.optionTextSelected, item.disabled && styles.optionTextDisabled]}>
                    {item.label}
                  </Text>
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
    borderColor: background.default,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: card.background,
    minHeight: 48,
  },
  triggerDisabled: {
    opacity: 0.5,
  },
  triggerText: {
    fontSize: texts.body.fontSize,
    color: card.text.primary,
    flex: 1,
  },
  placeholder: {
    color: card.text.secondary,
  },
  icon: {
    marginLeft: spacing.sm,
  },
  modalBox: {
    position: "absolute",
    backgroundColor: card.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: background.default,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  list: {
    flexGrow: 0,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  optionSelected: {
    backgroundColor: cta1,
  },
  optionDisabled: {
    opacity: 0.5,
  },
  optionIcon: {
    marginRight: spacing.sm,
  },
  optionText: {
    fontSize: texts.label.fontSize,
    color: card.text.primary,
  },
  optionTextSelected: {
    fontWeight: "600",
    color: cta1Contrast,
  },
  optionTextDisabled: {
    color: card.text.secondary,
  },
});
