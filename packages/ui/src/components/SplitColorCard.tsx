import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Text } from "./text";

function contrast(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? "#1C1C1E" : "#FFFFFF";
}

// ── SplitColorCard ───────────────────────────────────────────
// Card que muestra mitad light / mitad dark de un token de color.
// El label del token queda centrado superpuesto.

type SplitColorCardProps = {
  label: string;
  lightHex: string;
  darkHex: string;
  lightTokenName: string;
  darkTokenName: string;
  onPress?: () => void;
};

export function SplitColorCard({
  label,
  lightHex,
  darkHex,
  lightTokenName,
  darkTokenName,
  onPress,
}: SplitColorCardProps) {
  const Wrapper = onPress ? TouchableOpacity : View;
  const wrapperProps = onPress ? { onPress, activeOpacity: 0.7 } : {};

  return (
    <Wrapper {...wrapperProps}>
      <View style={styles.card}>
        <View style={styles.splitRow}>
          {/* ── Half: Light ── */}
          <View style={[styles.half, { backgroundColor: lightHex }]}>
            <Text variant="caption" style={[styles.halfLabel, { color: contrast(lightHex), opacity: 0.6 }]}>
              LIGHT
            </Text>
            <Text variant="caption" style={[styles.tokenName, { color: contrast(lightHex) }]}>
              {lightTokenName}
            </Text>
          </View>
          {/* ── Half: Dark ── */}
          <View style={[styles.half, { backgroundColor: darkHex }]}>
            <Text variant="caption" style={[styles.halfLabel, { color: contrast(darkHex), opacity: 0.6 }]}>
              DARK
            </Text>
            <Text variant="caption" style={[styles.tokenName, { color: contrast(darkHex) }]}>
              {darkTokenName}
            </Text>
          </View>
        </View>
        {/* ── Label centrado ── */}
        <View style={styles.labelBar}>
          <Text variant="caption" style={styles.labelText}>{label}</Text>
        </View>
      </View>
    </Wrapper>
  );
}

// ── SplitTextCard ────────────────────────────────────────────
// Card que muestra texto real en cada modo, sobre el fondo apropiado.

type SplitTextCardProps = {
  label: string;
  lightHex: string;
  darkHex: string;
  lightBgHex: string;
  darkBgHex: string;
  lightTokenName: string;
  darkTokenName: string;
  textContent?: string;
  onPress?: () => void;
};

export function SplitTextCard({
  label,
  lightHex,
  darkHex,
  lightBgHex,
  darkBgHex,
  lightTokenName,
  darkTokenName,
  textContent = "El veloz murciélago",
  onPress,
}: SplitTextCardProps) {
  const Wrapper = onPress ? TouchableOpacity : View;
  const wrapperProps = onPress ? { onPress, activeOpacity: 0.7 } : {};

  return (
    <Wrapper {...wrapperProps}>
      <View style={styles.card}>
        <View style={styles.splitRow}>
          {/* ── Half: Light mode ── */}
          <View style={[styles.half, { backgroundColor: lightBgHex, paddingVertical: 16 }]}>
            <Text style={[styles.textSample, { color: lightHex }]}>{textContent}</Text>
            <Text variant="caption" style={[styles.tokenBadge, { color: contrast(lightBgHex), backgroundColor: lightHex + "22" }]}>
              {lightTokenName}
            </Text>
          </View>
          {/* ── Half: Dark mode ── */}
          <View style={[styles.half, { backgroundColor: darkBgHex, paddingVertical: 16 }]}>
            <Text style={[styles.textSample, { color: darkHex }]}>{textContent}</Text>
            <Text variant="caption" style={[styles.tokenBadge, { color: contrast(darkBgHex), backgroundColor: darkHex + "22" }]}>
              {darkTokenName}
            </Text>
          </View>
        </View>
        <View style={styles.labelBar}>
          <Text variant="caption" style={styles.labelText}>{label}</Text>
        </View>
      </View>
    </Wrapper>
  );
}

// ── SplitDarknessCard ────────────────────────────────────────
// Card para darkness tokens — bloques lado a lado sobre fondo oscuro.

type SplitDarknessCardProps = {
  label: string;
  lightHex: string;
  darkHex: string;
  lightTokenName: string;
  darkTokenName: string;
  lightKey: string;
  darkKey: string;
  onPress?: () => void;
};

export function SplitDarknessCard({
  label,
  lightHex,
  darkHex,
  lightTokenName,
  darkTokenName,
  lightKey,
  darkKey,
  onPress,
}: SplitDarknessCardProps) {
  const Wrapper = onPress ? TouchableOpacity : View;
  const wrapperProps = onPress ? { onPress, activeOpacity: 0.7 } : {};

  return (
    <Wrapper {...wrapperProps}>
      <View style={styles.card}>
        <View style={styles.splitRow}>
          {/* ── Left: light mode darkness ── */}
          <View style={[styles.half, { backgroundColor: lightHex, paddingVertical: 20 }]}>
            <Text variant="caption" style={[styles.halfLabel, { color: "#FFFFFF", opacity: 0.6 }]}>LIGHT</Text>
            <Text variant="caption" style={[styles.tokenName, { color: "#FFFFFF" }]}>{lightTokenName}</Text>
            <Text variant="caption" style={[styles.subKey, { color: "#9E9E9E" }]}>{lightKey}</Text>
          </View>
          {/* ── Right: dark mode darkness ── */}
          <View style={[styles.half, { backgroundColor: darkHex, paddingVertical: 20 }]}>
            <Text variant="caption" style={[styles.halfLabel, { color: "#FFFFFF", opacity: 0.6 }]}>DARK</Text>
            <Text variant="caption" style={[styles.tokenName, { color: "#FFFFFF" }]}>{darkTokenName}</Text>
            <Text variant="caption" style={[styles.subKey, { color: "#9E9E9E" }]}>{darkKey}</Text>
          </View>
        </View>
        <View style={styles.labelBar}>
          <Text variant="caption" style={styles.labelText}>{label}</Text>
        </View>
      </View>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E5EA",
  },
  splitRow: {
    flexDirection: "row",
  },
  half: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  halfLabel: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  tokenName: {
    fontSize: 13,
    fontWeight: "600",
  },
  subKey: {
    fontSize: 10,
  },
  labelBar: {
    backgroundColor: "#F5F7FA",
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E5EA",
    alignItems: "center",
  },
  labelText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6E6E6E",
    letterSpacing: 0.3,
  },
  textSample: {
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
  },
  tokenBadge: {
    fontSize: 10,
    fontWeight: "600",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden",
    marginTop: 4,
  },
});
