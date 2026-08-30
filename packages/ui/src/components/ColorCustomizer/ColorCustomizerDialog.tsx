import React, { useCallback, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  Platform,
  Alert,
} from "react-native";
import { background, border, radius, space, text } from "@william-callao/antonella-theme";
import { neutrals, brand, success, warning, danger } from "@william-callao/antonella-theme";
import { Text } from "../text";
import { AppResponsiveDialog, AppDialogMode } from "../AppResponsiveDialog";
import type { ColorToken } from "./types";

type ColorCustomizerDialogProps = {
  visible: boolean;
  onClose: () => void;
  componentName: string;
  tokens: ColorToken[];
  onTokenChange: (key: string, value: string) => void;
};

function isValidHex(hex: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(hex);
}

function normalizeHex(raw: string): string {
  let v = raw.trim();
  if (!v.startsWith("#")) v = "#" + v;
  if (v.length === 4) {
    v = "#" + v[1] + v[1] + v[2] + v[2] + v[3] + v[3];
  }
  return v.toUpperCase();
}

type PaletteEntry = { label: string; value: string };

const PALETTE_GROUPS: { title: string; colors: PaletteEntry[] }[] = [
  {
    title: "Neutrales",
    colors: Object.entries(neutrals).map(([label, value]) => ({ label, value })),
  },
  {
    title: "Marca",
    colors: Object.entries(brand).map(([label, value]) => ({ label, value })),
  },
  {
    title: "Éxito",
    colors: Object.entries(success).map(([label, value]) => ({ label, value })),
  },
  {
    title: "Advertencia",
    colors: Object.entries(warning).map(([label, value]) => ({ label, value })),
  },
  {
    title: "Peligro",
    colors: Object.entries(danger).map(([label, value]) => ({ label, value })),
  },
];

const ALL_COLORS: PaletteEntry[] = PALETTE_GROUPS.flatMap((g) => g.colors);

function findTokenLabel(hex: string): string | null {
  const upper = normalizeHex(hex);
  const match = ALL_COLORS.find((c) => c.value.toUpperCase() === upper);
  return match?.label ?? null;
}

export function ColorCustomizerDialog({
  visible,
  onClose,
  componentName,
  tokens,
  onTokenChange,
}: ColorCustomizerDialogProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const handleChange = useCallback(
    (key: string, raw: string) => {
      const normalized = normalizeHex(raw);
      if (isValidHex(normalized)) {
        onTokenChange(key, normalized);
      }
    },
    [onTokenChange],
  );

  const handleSelectPalette = useCallback(
    (key: string, hex: string) => {
      onTokenChange(key, hex);
      setExpanded(null);
    },
    [onTokenChange],
  );

  const handleCopy = useCallback(() => {
    const config: Record<string, string> = {};
    for (const t of tokens) {
      const current = normalizeHex(t.value);
      const paletteMatch = findTokenLabel(current);
      config[t.key] = paletteMatch ?? t.tokenName ?? current;
    }
    const json = JSON.stringify(config, null, 2);

    if (Platform.OS === "web") {
      navigator.clipboard.writeText(json);
    } else {
      Alert.alert("Colores copiados", json);
    }
  }, [tokens]);

  return (
    <AppResponsiveDialog
      visible={visible}
      onClose={onClose}
      mode={AppDialogMode.Dismissable}
      icon="settings"
      title={`Personalizar: ${componentName}`}
      caption="Selecciona un token de la paleta o escribe un hex."
      snapPoints={["90%"]}
    >
      <ScrollView
        contentContainerStyle={styles.list}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        {tokens.map((token) => {
          const current = normalizeHex(token.value);
          const tokenLabel = findTokenLabel(current);
          const displayLabel = tokenLabel ?? token.tokenName ?? current;
          const isOpen = expanded === token.key;

          return (
            <View key={token.key}>
              <Pressable
                style={styles.row}
                onPress={() => setExpanded(isOpen ? null : token.key)}
              >
                <View style={[styles.swatch, { backgroundColor: current }]} />
                <View style={styles.rowContent}>
                  <Text variant="caption" color={text.secondary} style={styles.tokenName}>
                    {token.name}
                  </Text>
                  <View style={styles.valueBadge}>
                    <Text variant="caption" color={text.default} style={styles.valueLabel}>
                      {displayLabel}
                    </Text>
                  </View>
                </View>
              </Pressable>

              {isOpen ? (
                <View style={styles.paletteContainer}>
                  {PALETTE_GROUPS.map((group) => (
                    <View key={group.title} style={styles.groupSection}>
                      <Text variant="caption" color={text.secondary} style={styles.groupTitle}>
                        {group.title}
                      </Text>
                      <View style={styles.grid}>
                        {group.colors.map((color) => {
                          const isSelected = current === normalizeHex(color.value);
                          return (
                            <Pressable
                              key={color.label}
                              style={styles.gridItem}
                              onPress={() => handleSelectPalette(token.key, color.value)}
                            >
                              <View
                                style={[
                                  styles.gridSwatch,
                                  { backgroundColor: color.value },
                                  isSelected && styles.gridSwatchSelected,
                                ]}
                              />
                              <Text
                                variant="caption"
                                color={isSelected ? cta1 : text.secondary}
                                style={styles.gridLabel}
                              >
                                {color.label}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>
                  ))}

                  <View style={styles.hexRow}>
                    <Text variant="caption" color={text.secondary}>
                      Hex personalizado:
                    </Text>
                    <TextInput
                      style={styles.input}
                      value={current}
                      onChangeText={(raw) => handleChange(token.key, raw)}
                      autoCapitalize="none"
                      autoCorrect={false}
                      spellCheck={false}
                      placeholder="#000000"
                      placeholderTextColor={border.skeleton}
                    />
                  </View>
                </View>
              ) : null}
            </View>
          );
        })}
      </ScrollView>

      <Pressable style={styles.copyButton} onPress={handleCopy}>
        <Text variant="bodyMedium" color="#FFFFFF" style={styles.copyLabel}>
          Copiar colores
        </Text>
      </Pressable>
    </AppResponsiveDialog>
  );
}

const cta1 = "#007AFF";

const styles = StyleSheet.create({
  list: {
    paddingVertical: space.space2,
    gap: space.space2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.space3,
    paddingHorizontal: space.space3,
    paddingVertical: space.space2,
    borderRadius: radius.sm,
    backgroundColor: background.surface,
  },
  swatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: border.divider.secondary,
  },
  rowContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tokenName: {
    flexShrink: 0,
  },
  valueBadge: {
    paddingHorizontal: space.space2,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: background.default,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: border.divider.secondary,
  },
  valueLabel: {
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontSize: 11,
  },
  paletteContainer: {
    marginTop: space.space1,
    paddingHorizontal: space.space3,
    paddingBottom: space.space2,
    gap: space.space3,
  },
  groupSection: {
    gap: space.space1,
  },
  groupTitle: {
    fontWeight: "600",
    marginTop: space.space1,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.space1,
  },
  gridItem: {
    alignItems: "center",
    width: 48,
    gap: 2,
  },
  gridSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: border.divider.secondary,
  },
  gridSwatchSelected: {
    borderWidth: 2,
    borderColor: cta1,
  },
  gridLabel: {
    fontSize: 9,
  },
  hexRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.space2,
    marginTop: space.space1,
  },
  input: {
    flex: 1,
    paddingHorizontal: space.space2,
    paddingVertical: space.space1,
    borderRadius: 8,
    backgroundColor: background.default,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: border.divider.secondary,
    fontSize: 13,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    color: text.default,
  },
  copyButton: {
    marginTop: space.space4,
    marginHorizontal: space.space3,
    marginBottom: space.space2,
    paddingVertical: space.space3,
    borderRadius: radius.sm,
    backgroundColor: "#007AFF",
    alignItems: "center",
  },
  copyLabel: {
    fontWeight: "600",
  },
});
