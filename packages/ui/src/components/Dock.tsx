import React, { useCallback, useEffect, useRef } from "react";
import {
  Pressable,
  StyleSheet,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  LinearTransition,
  interpolateColor,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { background, border, cta1, space, text } from "@antonella/theme";
import { iconMap, type IconName } from "./Icon";

export type DockItem = {
  icon: IconName;
  label: string;
};

export type DockProps = {
  items: DockItem[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  visible: boolean;
  style?: StyleProp<ViewStyle>;
};

const SPRING = { damping: 20, stiffness: 260, mass: 0.6 };
const transition = LinearTransition.springify()
  .damping(SPRING.damping)
  .stiffness(SPRING.stiffness)
  .mass(SPRING.mass);

const AnimatedIonicons = Animated.createAnimatedComponent(Ionicons);

type Frame = { x: number; width: number };

function DockItem({
  item,
  selected,
  onPress,
  onLayout,
}: {
  item: DockItem;
  selected: boolean;
  onPress: () => void;
  onLayout: (event: LayoutChangeEvent) => void;
}) {
  const progress = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(selected ? 1 : 0, SPRING);
  }, [selected, progress]);

  const iconProps = useAnimatedProps(() => ({
    color: interpolateColor(progress.value, [0, 1], [text.secondary, cta1]),
  }));

  return (
    <Animated.View
      layout={transition}
      onLayout={onLayout}
      style={selected ? styles.itemSelected : styles.item}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.pressable,
          selected && styles.pressableSelected,
          pressed && styles.pressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={item.label}
        accessibilityState={{ selected }}
      >
        <Animated.View style={styles.content}>
          <AnimatedIonicons name={iconMap[item.icon]} size={22} animatedProps={iconProps} />
          {selected ? (
          <Animated.Text
            entering={FadeIn.duration(140)}
            style={styles.label}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
              {item.label}
            </Animated.Text>
          ) : null}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

export function Dock({ items, selectedIndex, onSelect, visible, style }: DockProps) {
  const insets = useSafeAreaInsets();
  const visibility = useSharedValue(visible ? 1 : 0);
  const pillLeft = useSharedValue(0);
  const pillWidth = useSharedValue(0);
  const framesRef = useRef<Record<number, Frame>>({});
  const selectedIndexRef = useRef(selectedIndex);
  const hasMeasuredRef = useRef(false);
  selectedIndexRef.current = selectedIndex;

  useEffect(() => {
    visibility.value = withTiming(visible ? 1 : 0, {
      duration: 200,
      easing: Easing.out(Easing.cubic),
    });
  }, [visible, visibility]);

  const dockStyle = useAnimatedStyle(
    () => ({
      opacity: visibility.value,
      transform: [{ translateY: (1 - visibility.value) * 16 }],
    }),
    [],
  );

  const pillStyle = useAnimatedStyle(
    () => ({
      left: pillLeft.value,
      width: pillWidth.value,
    }),
    [],
  );

  const handleLayout = useCallback(
    (index: number) => (event: LayoutChangeEvent) => {
      const { x, width } = event.nativeEvent.layout;
      framesRef.current[index] = { x, width };
      if (index !== selectedIndexRef.current) return;
      if (!hasMeasuredRef.current) {
        hasMeasuredRef.current = true;
        pillLeft.value = x;
        pillWidth.value = width;
      } else {
        pillLeft.value = withSpring(x, SPRING);
        pillWidth.value = withSpring(width, SPRING);
      }
    },
    [pillLeft, pillWidth],
  );

  return (
    <Animated.View
      pointerEvents={visible ? "auto" : "none"}
      style={[styles.dock, { bottom: insets.bottom + space.space3 }, dockStyle, style]}
    >
      <Animated.View style={styles.row} layout={transition}>
        <Animated.View pointerEvents="none" style={[styles.pill, pillStyle]} />
        {items.map((item, index) => (
          <DockItem
            key={item.label}
            item={item}
            selected={index === selectedIndex}
            onPress={() => onSelect(index)}
            onLayout={handleLayout(index)}
          />
        ))}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  dock: {
    position: "absolute",
    alignSelf: "center",
    maxWidth: 440,
    left: space.space3,
    right: space.space3,
    backgroundColor: background.surface,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: border.divider.secondary,
    paddingVertical: space.space2,
    paddingHorizontal: space.space2,
  },
  row: {
    flexDirection: "row",
  },
  pill: {
    position: "absolute",
    top: 0,
    bottom: 0,
    backgroundColor: background.default,
    borderRadius: 999,
  },
  item: {
    flexGrow: 1,
    flexShrink: 1,
  },
  itemSelected: {
    flexGrow: 0,
    maxWidth: "70%",
  },
  pressable: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: space.space3,
    paddingHorizontal: space.space2,
  },
  pressableSelected: {
    paddingHorizontal: space.space3,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.space1,
    maxWidth: "100%",
  },
  pressed: {
    opacity: 0.6,
  },
  label: {
    color: cta1,
    fontSize: 13,
    fontWeight: "600",
    flexShrink: 1,
  },
});
