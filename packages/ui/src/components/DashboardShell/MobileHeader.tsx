import { Pressable, StyleSheet, Text, View } from "react-native";
import { texts } from "@antonella/theme";
import { Icon } from "../Icon";

export type MobileHeaderProps = {
  title?: string;
  onMenuPress: () => void;
  backgroundColor: string;
  textColor: string;
  titleColor?: string;
};

export function MobileHeader({ title, onMenuPress, backgroundColor, textColor, titleColor }: MobileHeaderProps) {
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open menu"
        testID="dashboard-mobile-menu-button"
        onPress={onMenuPress}
        hitSlop={8}
        style={({ pressed }) => [styles.menuButton, pressed && styles.pressed]}
      >
        <Icon name="menu" size={22} color={textColor} />
      </Pressable>
      {title ? (
        <Text style={[styles.title, { color: titleColor ?? textColor }]} numberOfLines={1}>
          {title}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 56,
    paddingHorizontal: 12,
  },
  menuButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    fontSize: texts.bodyBold.fontSize,
    fontWeight: texts.bodyBold.fontWeight,
    marginLeft: 8,
  },
  pressed: {
    opacity: 0.7,
  },
});
