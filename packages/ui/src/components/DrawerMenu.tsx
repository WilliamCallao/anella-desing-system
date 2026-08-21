import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Modal as RNModal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { radius, space } from "@antonella/theme";
import { neutrals, brand, danger as dangerPalette } from "@antonella/theme";
import { Text } from "./text";
import { Icon } from "./Icon";
import type { IconName } from "./Icon";
import { ColorWheel } from "./ColorCustomizer/ColorWheel";
import { ColorCustomizerDialog } from "./ColorCustomizer/ColorCustomizerDialog";
import type { ColorToken } from "./ColorCustomizer/types";

const ANIM_IN_MS = 260;
const ANIM_OUT_MS = 240;
const BACKDROP_COLOR = "#0F172A";
const BACKDROP_OPACITY = 0.45;
const DEFAULT_WIDTH = 300;

export type DrawerMenuItem = {
  icon?: IconName;
  label: string;
  onPress: () => void;
  destructive?: boolean;
  selected?: boolean;
};

export type DrawerMenuProps = {
  visible: boolean;
  onClose: () => void;
  side?: "left" | "right";
  width?: number;
  items?: DrawerMenuItem[];
  header?: React.ReactNode;
  footer?: React.ReactNode;
  dismissible?: boolean;
  customizable?: boolean;
};

const DEFAULT_TOKENS: ColorToken[] = [
  { name: "Fondo panel", key: "panelBg", value: neutrals.N950, tokenName: "N950" },
  { name: "Fondo header", key: "headerBg", value: neutrals.N900, tokenName: "N900" },
  { name: "Fondo footer", key: "footerBg", value: neutrals.N950, tokenName: "N900" },
  { name: "Fondo item", key: "itemBg", value: neutrals.N950, tokenName: "N950" },
  { name: "Fondo item presionado", key: "itemPressedBg", value: neutrals.N950, tokenName: "N950" },
  { name: "Fondo item seleccionado", key: "itemSelectedBg", value: brand.M600, tokenName: "M600" },
  { name: "Fondo ícono", key: "iconBg", value: neutrals.N900, tokenName: "N900" },
  { name: "Color ícono", key: "iconColor", value: neutrals.N500, tokenName: "N500" },
  { name: "Color ícono seleccionado", key: "iconSelectedColor", value: neutrals.N0, tokenName: "N0" },
  { name: "Color ícono destructivo", key: "iconDestructiveColor", value: dangerPalette.D600, tokenName: "D600" },
  { name: "Texto item", key: "itemText", value: neutrals.N500, tokenName: "N500" },
  { name: "Color destructivo", key: "destructive", value: dangerPalette.D600, tokenName: "D600" },
  { name: "Color CTA (seleccionado)", key: "cta", value: neutrals.N0, tokenName: "N0" },
  { name: "Separador", key: "separator", value: neutrals.N900, tokenName: "N900" },
  { name: "Backdrop", key: "backdrop", value: neutrals.N900, tokenName: "N900" },
];

export function DrawerMenu({
  visible,
  onClose,
  side = "left",
  width: widthProp,
  items,
  header,
  footer,
  dismissible = true,
  customizable = false,
}: DrawerMenuProps) {
  const { width: screenWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const panelWidth = widthProp ?? Math.min(DEFAULT_WIDTH, screenWidth * 0.8);

  const [mounted, setMounted] = useState(visible);
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [overrides, setOverrides] = useState<Record<string, string>>({});

  const progress = useSharedValue(0);

  const tokens: ColorToken[] = useMemo(
    () =>
      DEFAULT_TOKENS.map((t) => ({
        ...t,
        value: overrides[t.key] ?? t.value,
      })),
    [overrides],
  );

  const c = useMemo(() => {
    const map: Record<string, string> = {};
    for (const t of tokens) map[t.key] = t.value;
    return map;
  }, [tokens]);

  const handleTokenChange = useCallback((key: string, value: string) => {
    setOverrides((prev) => ({ ...prev, [key]: value }));
  }, []);

  useEffect(() => {
    if (visible) setMounted(true);
  }, [visible]);

  useEffect(() => {
    if (!mounted) return;
    if (visible) {
      progress.value = withTiming(1, {
        duration: ANIM_IN_MS,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      progress.value = withTiming(
        0,
        {
          duration: ANIM_OUT_MS,
          easing: Easing.in(Easing.cubic),
        },
        (finished) => {
          if (finished) runOnJS(setMounted)(false);
        },
      );
    }
  }, [mounted, visible, progress]);

  const backdropStyle = useAnimatedStyle(
    () => ({
      opacity:
        progress.value * (c.backdrop === BACKDROP_COLOR ? BACKDROP_OPACITY : 0.45),
    }),
    [c.backdrop],
  );

  const translateX = useAnimatedStyle(() => {
    const offset = (1 - progress.value) * panelWidth;
    return {
      transform: [{ translateX: side === "left" ? -offset : offset }],
    };
  }, [side, panelWidth]);

  const handleItemPress = (item: DrawerMenuItem) => {
    item.onPress();
    onClose();
  };

  return (
    <RNModal
      visible={mounted}
      transparent
      statusBarTranslucent
      animationType="none"
      onRequestClose={dismissible ? onClose : undefined}
    >
      <View style={styles.root}>
        <Pressable
          onPress={dismissible ? onClose : undefined}
          style={StyleSheet.absoluteFill}
          accessibilityRole="button"
          accessibilityLabel="Cerrar menú"
        >
          <Animated.View
            style={[StyleSheet.absoluteFill, backdropStyle]}
          />
        </Pressable>

        <Animated.View
          style={[
            styles.panel,
            { width: panelWidth, backgroundColor: c.panelBg },
            { [side]: 0 },
            translateX,
          ]}
          accessibilityViewIsModal
        >
          {header ? (
            <View
              style={[
                styles.headerSection,
                { backgroundColor: c.headerBg },
                { paddingTop: insets.top },
              ]}
            >
              <View style={styles.headerContent}>{header}</View>
              <View
                style={[
                  styles.divider,
                  { backgroundColor: c.separator },
                ]}
              />
            </View>
          ) : null}

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            bounces={false}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {items?.map((item, i) => {
              const isSelected = item.selected;
              const isDestructive = item.destructive;
              const itemIconColor = isSelected
                ? c.iconSelectedColor
                : isDestructive
                  ? c.iconDestructiveColor
                  : c.iconColor;
              const itemTextColor = isSelected
                ? c.cta
                : isDestructive
                  ? c.destructive
                  : c.itemText;

              return (
                <Pressable
                  key={i}
                  onPress={() => handleItemPress(item)}
                  style={({ pressed }) => [
                    styles.row,
                    { backgroundColor: c.itemBg },
                    isSelected && { backgroundColor: c.itemSelectedBg },
                    pressed && { backgroundColor: c.itemPressedBg },
                  ]}
                >
                  {item.icon ? (
                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: c.iconBg },
                        isSelected && {
                          backgroundColor: c.itemSelectedBg,
                        },
                      ]}
                    >
                      <Icon
                        name={item.icon}
                        size={20}
                        color={itemIconColor}
                      />
                    </View>
                  ) : null}
                  <Text
                    variant="body"
                    color={itemTextColor}
                    style={styles.rowLabel}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {footer ? (
            <View
              style={[
                styles.footerSection,
                { backgroundColor: c.footerBg },
                { paddingBottom: insets.bottom },
              ]}
            >
              <View
                style={[
                  styles.divider,
                  { backgroundColor: c.separator },
                ]}
              />
              <View style={styles.footerContent}>{footer}</View>
            </View>
          ) : null}

          {customizable ? (
            <View style={styles.wheelContainer}>
              <Pressable onPress={() => setCustomizerOpen(true)}>
                <ColorWheel
                  size={26}
                  onPress={() => setCustomizerOpen(true)}
                />
              </Pressable>
            </View>
          ) : null}
        </Animated.View>

        {customizable ? (
          <ColorCustomizerDialog
            visible={customizerOpen}
            onClose={() => setCustomizerOpen(false)}
            componentName="DrawerMenu"
            tokens={tokens}
            onTokenChange={handleTokenChange}
          />
        ) : null}
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  panel: {
    position: "absolute",
    top: 0,
    bottom: 0,
  },

  headerSection: {},
  headerContent: {
    paddingHorizontal: space.space4,
    paddingTop: space.space4,
    paddingBottom: space.space3,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },

  scrollContent: {
    paddingHorizontal: space.space3,
    paddingVertical: space.space5,
    gap: space.space2,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.space3,
    minHeight: 50,
    paddingHorizontal: 5,
    paddingVertical: 4,
    borderRadius: radius.md,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    flex: 1,
  },

  footerSection: {},
  footerContent: {
    paddingHorizontal: space.space4,
    paddingTop: space.space3,
    paddingBottom: space.space4,
  },

  wheelContainer: {
    position: "absolute",
    top: 50,
    right: 8,
    zIndex: 10,
  },
});
