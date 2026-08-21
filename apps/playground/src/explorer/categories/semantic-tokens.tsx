import React, { useState, useCallback } from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Text, Icon, AppIcon, ColorCustomizerDialog } from "@antonella/ui";
import type { ColorToken } from "@antonella/ui";
import {
  neutrals,
  brand,
  lightBackground,
  darkBackground,
  lightText,
  darkText,
  resolveBackground,
  resolveText,
  type BackgroundMap,
  type TextMap,
} from "@antonella/theme";
import type { ComponentCategory } from "../types";
import { demoStyles } from "./shared";

type EditingTarget = {
  category: "background" | "text";
  group: "light" | "dark";
  key: string;
};

type SemanticEntryProps = {
  label: string;
  description: string;
  currentTokenName: string;
  currentHex: string;
  onColorPress: () => void;
};

function SemanticEntry({
  label,
  description,
  currentTokenName,
  currentHex,
  onColorPress,
}: SemanticEntryProps) {
  return (
    <View style={styles.entry}>
      <View style={styles.entryLeft}>
        <View style={styles.entryInfo}>
          <Text variant="body" style={styles.entryLabel}>
            {label}
          </Text>
          <Text variant="caption" color="#8E8E93">
            {description}
          </Text>
        </View>
      </View>
      <View style={styles.entryRight}>
        <TouchableOpacity onPress={onColorPress} activeOpacity={0.6}>
          <View style={styles.tokenBadge}>
            <View style={[styles.tokenSwatch, { backgroundColor: currentHex }]} />
            <Text variant="caption" color="#1C1C1E" style={styles.tokenName}>
              {currentTokenName}
            </Text>
            <Icon name={AppIcon.ChevronForward} size={12} color="#8E8E93" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function SemanticTokensDemo() {
  const [lightBgMap, setLightBgMap] = useState<BackgroundMap>(lightBackground);
  const [darkBgMap, setDarkBgMap] = useState<BackgroundMap>(darkBackground);
  const [lightTextMap, setLightTextMap] = useState<TextMap>(lightText);
  const [darkTextMap, setDarkTextMap] = useState<TextMap>(darkText);
  const [editing, setEditing] = useState<EditingTarget | null>(null);

  const lightBg = resolveBackground(lightBgMap);
  const darkBg = resolveBackground(darkBgMap);
  const lightTxt = resolveText(lightTextMap);
  const darkTxt = resolveText(darkTextMap);

  const getCurrentTokens = (): ColorToken[] => {
    if (!editing) return [];
    if (editing.category === "background") {
      const map = editing.group === "light" ? lightBgMap : darkBgMap;
      const resolved = editing.group === "light" ? lightBg : darkBg;
      return [{
        name: `background.${editing.key}`,
        key: editing.key,
        value: resolved[editing.key as keyof typeof resolved],
        tokenName: map[editing.key as keyof typeof map],
      }];
    } else {
      const map = editing.group === "light" ? lightTextMap : darkTextMap;
      const resolved = editing.group === "light" ? lightTxt : darkTxt;
      return [{
        name: `text.${editing.key}`,
        key: editing.key,
        value: resolved[editing.key as keyof typeof resolved],
        tokenName: map[editing.key as keyof typeof map],
      }];
    }
  };

  const handleTokenChange = useCallback(
    (key: string, value: string) => {
      if (!editing) return;
      if (editing.category === "background") {
        if (editing.group === "light") setLightBgMap((p) => ({ ...p, [key]: value }));
        else setDarkBgMap((p) => ({ ...p, [key]: value }));
      } else {
        if (editing.group === "light") setLightTextMap((p) => ({ ...p, [key]: value }));
        else setDarkTextMap((p) => ({ ...p, [key]: value }));
      }
    },
    [editing]
  );

  const dialogTitle = editing
    ? `${editing.group === "light" ? "Light" : "Dark"} · ${editing.category}.${editing.key}`
    : "";

  return (
    <View style={demoStyles.gap}>
      {/* ── Preview Light ── */}
      <View style={styles.previewCard}>
        <Text variant="body" style={styles.previewTitle}>Light Mode</Text>
        <View style={[styles.previewBg, { backgroundColor: lightBg.default }]}>
          <Text variant="caption" style={{ color: lightTxt.subtle, marginBottom: 4 }}>
            ← background.default ({lightBgMap.default})
          </Text>
          <View style={[styles.previewSurface, { backgroundColor: lightBg.subtle }]}>
            <Text variant="body" style={{ color: lightTxt.default }}>
              text.default ({lightTextMap.default})
            </Text>
          </View>
          <View style={[styles.previewSurfaceAlt, { backgroundColor: lightBg.subtlest }]}>
            <Text variant="caption" style={{ color: lightTxt.subtle }}>
              text.subtle ({lightTextMap.subtle})
            </Text>
          </View>
        </View>
      </View>

      {/* ── Preview Dark ── */}
      <View style={styles.previewCard}>
        <Text variant="body" style={styles.previewTitle}>Dark Mode</Text>
        <View style={[styles.previewBgDark, { backgroundColor: darkBg.default }]}>
          <Text variant="caption" style={{ color: darkTxt.subtle, marginBottom: 4 }}>
            ← background.default ({darkBgMap.default})
          </Text>
          <View style={[styles.previewSurfaceDark, { backgroundColor: darkBg.subtle }]}>
            <Text variant="body" style={{ color: darkTxt.default }}>
              text.default ({darkTextMap.default})
            </Text>
          </View>
          <View style={[styles.previewSurfaceAltDark, { backgroundColor: darkBg.subtlest }]}>
            <Text variant="caption" style={{ color: darkTxt.subtle }}>
              text.subtle ({darkTextMap.subtle})
            </Text>
          </View>
        </View>
      </View>

      {/* ── Config Light ── */}
      <View style={styles.configSection}>
        <Text variant="heading">Light Mode</Text>
        <Text variant="caption" color="#8E8E93" style={{ marginBottom: 4 }}>Background</Text>
        {(["default", "subtle", "subtlest"] as const).map((key) => (
          <SemanticEntry
            key={`lb-${key}`}
            label={`background.${key}`}
            description={
              key === "default" ? "Fondo principal" : key === "subtle" ? "Cards / superficies" : "Bordes / separadores"
            }
            currentTokenName={lightBgMap[key]}
            currentHex={lightBg[key]}
            onColorPress={() => setEditing({ category: "background", group: "light", key })}
          />
        ))}
        <Text variant="caption" color="#8E8E93" style={{ marginTop: 8, marginBottom: 4 }}>Text</Text>
        {(["default", "subtle", "light"] as const).map((key) => (
          <SemanticEntry
            key={`lt-${key}`}
            label={`text.${key}`}
            description={
              key === "default" ? "Texto principal" : key === "subtle" ? "Texto secundario / caption" : "Texto sobre fondos oscuros"
            }
            currentTokenName={lightTextMap[key]}
            currentHex={lightTxt[key]}
            onColorPress={() => setEditing({ category: "text", group: "light", key })}
          />
        ))}
      </View>

      {/* ── Config Dark ── */}
      <View style={styles.configSection}>
        <Text variant="heading">Dark Mode</Text>
        <Text variant="caption" color="#8E8E93" style={{ marginBottom: 4 }}>Background</Text>
        {(["default", "subtle", "subtlest"] as const).map((key) => (
          <SemanticEntry
            key={`db-${key}`}
            label={`background.${key}`}
            description={
              key === "default" ? "Fondo principal" : key === "subtle" ? "Cards / superficies" : "Bordes / separadores"
            }
            currentTokenName={darkBgMap[key]}
            currentHex={darkBg[key]}
            onColorPress={() => setEditing({ category: "background", group: "dark", key })}
          />
        ))}
        <Text variant="caption" color="#8E8E93" style={{ marginTop: 8, marginBottom: 4 }}>Text</Text>
        {(["default", "subtle", "light"] as const).map((key) => (
          <SemanticEntry
            key={`dt-${key}`}
            label={`text.${key}`}
            description={
              key === "default" ? "Texto principal" : key === "subtle" ? "Texto secundario / caption" : "Texto sobre fondos oscuros"
            }
            currentTokenName={darkTextMap[key]}
            currentHex={darkTxt[key]}
            onColorPress={() => setEditing({ category: "text", group: "dark", key })}
          />
        ))}
      </View>

      {editing && (
        <ColorCustomizerDialog
          visible
          onClose={() => setEditing(null)}
          componentName={dialogTitle}
          tokens={getCurrentTokens()}
          onTokenChange={handleTokenChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  previewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E5EA",
  },
  previewTitle: {
    marginBottom: 12,
    fontWeight: "600",
  },
  previewBg: {
    borderRadius: 12,
    padding: 12,
    gap: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E5EA",
  },
  previewSurface: {
    borderRadius: 8,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E5EA",
  },
  previewSurfaceAlt: {
    borderRadius: 8,
    padding: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E5EA",
  },
  previewBgDark: {
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  previewSurfaceDark: {
    borderRadius: 8,
    padding: 12,
  },
  previewSurfaceAltDark: {
    borderRadius: 8,
    padding: 10,
  },
  configSection: {
    gap: 8,
  },
  entry: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E5EA",
  },
  entryLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 10,
  },
  entryInfo: {
    flex: 1,
  },
  entryLabel: {
    fontWeight: "500",
  },
  entryRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tokenBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F5F7FA",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tokenSwatch: {
    width: 14,
    height: 14,
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E5EA",
  },
  tokenName: {
    fontWeight: "500",
  },
});

export const semanticTokens: ComponentCategory = {
  id: "semantic-tokens",
  title: "Tokens Semánticos",
  icon: "palette",
  components: [
    {
      id: "semantic",
      name: "Tokens Semánticos",
      description:
        "Tokens de fondo y texto que mapean a tokens base. Cambia las equivalencias para ver cómo cambia el look en light/dark.",
      variants: [
        {
          id: "all",
          label: "Configurar",
          render: () => <SemanticTokensDemo />,
        },
      ],
    },
  ],
};
