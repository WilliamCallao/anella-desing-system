import React, { useCallback, useEffect, useRef, type ComponentType } from "react";
import {
  Pressable,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  LinearTransition,
  ZoomIn,
  ZoomOut,
  interpolateColor,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { background, border, cta1, space, text } from "@william-callao/antonella-theme";
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
  /**
   * Activa el "modo agente": muestra el orb de composición a la derecha de
   * la barra. Se pausa solo cuando el dock no es visible.
   * El componente se provee desde afuera via `renderAgentOrb`.
   */
  agentMode?: boolean;
  renderAgentOrb?: React.ComponentType<{ size: number; paused: boolean }>;
  style?: StyleProp<ViewStyle>;
};

const SPRING = { damping: 20, stiffness: 260, mass: 0.6 };
const transition = LinearTransition.springify()
  .damping(SPRING.damping)
  .stiffness(SPRING.stiffness)
  .mass(SPRING.mass);

type LucideIconComponent = ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

function LucideIconRenderer({
  icon,
  size,
  color = text.secondary,
  strokeWidth = 2.25,
}: {
  icon: LucideIconComponent;
  size: number;
  color?: string;
  strokeWidth?: number;
}) {
  const IconComponent = icon;
  return <IconComponent size={size} color={color} strokeWidth={strokeWidth} />;
}

const AnimatedLucideIcon = Animated.createAnimatedComponent(LucideIconRenderer);

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
          <AnimatedLucideIcon icon={iconMap[item.icon]} size={22} color={text.secondary} animatedProps={iconProps} />
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

export function Dock({ items, selectedIndex, onSelect, visible, agentMode, renderAgentOrb, style }: DockProps) {
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
      <View style={styles.bar}>
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
      </View>
      {agentMode && renderAgentOrb ? (
        <Animated.View
          entering={ZoomIn.duration(160)}
          exiting={ZoomOut.duration(130)}
          style={styles.agentBadge}
        >
          {React.createElement(renderAgentOrb, { size: 44, paused: !visible })}
        </Animated.View>
      ) : null}
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
    flexDirection: "row",
    alignItems: "center",
    gap: space.space2,
  },
  bar: {
    flexGrow: 1,
    flexShrink: 1,
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
  agentBadge: {
    width: 56,
    height: 56,
    flexShrink: 0,
    borderRadius: 999,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
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
