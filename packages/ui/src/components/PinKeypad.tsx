import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { background, border, card, cta1, space, text, texts, TextType } from "@william-callao/antonella-theme";
import { Icon } from "./Icon";
import { Text } from "./text/Text";

export type PinKeypadProps = {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (pin: string) => void;
  pinLength?: number;
  style?: StyleProp<ViewStyle>;
};

const KEY_ROWS: (string | null)[][] = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  [null, "0", "backspace"],
];

export function PinKeypad({ value, onChange, onComplete, pinLength = 4, style }: PinKeypadProps) {
  const handleKey = (key: string | null) => {
    if (!key) return;
    if (key === "backspace") {
      onChange(value.slice(0, -1));
      return;
    }
    if (value.length >= pinLength) return;
    const next = value + key;
    onChange(next);
    if (next.length === pinLength) {
      onComplete?.(next);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.dots}>
        {Array.from({ length: pinLength }).map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i < value.length ? styles.dotFilled : styles.dotEmpty]}
          />
        ))}
      </View>

      <View style={styles.keypad}>
        {KEY_ROWS.map((row, ri) => (
          <View key={ri} style={styles.row}>
            {row.map((key, ki) => {
              if (key === null) {
                return <View key={ki} style={styles.keySpacer} />;
              }
              const isBackspace = key === "backspace";
              return (
                <Pressable
                  key={ki}
                  onPress={() => handleKey(key)}
                  android_ripple={{ color: "rgba(15,23,42,0.08)" }}
                  accessibilityRole="button"
                  accessibilityLabel={isBackspace ? "Borrar" : key}
                  style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
                >
                  {isBackspace ? (
                    <Icon name="backspace" size={24} color={card.text.secondary} />
                  ) : (
                    <Text variant={TextType.Heading} color={text.default} style={styles.keyText}>
                      {key}
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: space.space4,
  },
  dots: {
    flexDirection: "row",
    gap: space.space2,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  dotEmpty: {
    borderWidth: 2,
    borderColor: border.divider.secondary,
  },
  dotFilled: {
    backgroundColor: cta1,
  },
  keypad: {
    gap: space.space2,
  },
  row: {
    flexDirection: "row",
    gap: space.space2,
  },
  key: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: background.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: border.divider.secondary,
    overflow: "hidden",
  },
  keyPressed: {
    opacity: 0.7,
  },
  keySpacer: {
    width: 72,
    height: 72,
  },
  keyText: {
    fontSize: texts.title.fontSize,
    fontWeight: texts.title.fontWeight,
  },
});
