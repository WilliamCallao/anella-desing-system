import React, { useState, useCallback } from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Text, ColorCustomizerDialog } from "@antonella/ui";
import type { ColorToken } from "@antonella/ui";
import {
  lightSemantic,
  darkSemantic,
  resolveSemantic,
  type SemanticMap,
  type ContextMap,
  type ContextTokens,
} from "@antonella/theme";
import type { ComponentCategory } from "../types";
import { demoStyles } from "./shared";

type Ctx = "default" | "light" | "darkness";
type BgKey = "default" | "subtle";
type TextKey = "default" | "subtle" | "subtlest";

type EditingTarget =
  | { category: "bg"; ctx: Ctx; key: BgKey; group: "light" | "dark" }
  | { category: "text"; ctx: Ctx; key: TextKey; group: "light" | "dark" };

function contrast(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? "#1C1C1E" : "#FFFFFF";
}

// ── Card de contexto ────────────────────────────────────────
// Muestra bg.default como fondo, bg.subtle como franja interna,
// y texto en cada zona.

function ContextCard({
  ctx,
  resolved,
  map,
  group,
  onEditBg,
  onEditText,
}: {
  ctx: Ctx;
  resolved: ContextTokens;
  map: ContextMap;
  group: "light" | "dark";
  onEditBg: (key: BgKey) => void;
  onEditText: (key: TextKey) => void;
}) {
  const defaultBg = resolved.bg.default;
  const subtleBg = resolved.bg.subtle;
  const cDef = contrast(defaultBg);
  const cSub = contrast(subtleBg);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text variant="caption" style={styles.cardCtx}>{ctx}</Text>
        <Text variant="caption" style={styles.cardGroup}>{group}</Text>
      </View>

      {/* ── Zona default ── */}
      <View style={[styles.zone, { backgroundColor: defaultBg }]}>
        <TouchableOpacity onPress={() => onEditBg("default")} activeOpacity={0.6}>
          <View style={[styles.tokenChip, { backgroundColor: subtleBg }]}>
            <Text variant="caption" style={{ color: cSub, fontWeight: "600", fontSize: 10 }}>
              bg.{ctx}.default = {map.bg.default}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onEditText("default")} activeOpacity={0.6}>
          <Text style={{ color: resolved.text.default, fontSize: 15, fontWeight: "500" }}>
            text.default — El veloz murciélago hindú
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onEditText("subtle")} activeOpacity={0.6}>
          <Text style={{ color: resolved.text.subtle, fontSize: 13 }}>
            text.subtle — comía feliz cardillo y kiwi
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onEditText("subtlest")} activeOpacity={0.6}>
          <Text style={{ color: resolved.text.subtlest, fontSize: 12 }}>
            text.subtlest —能量不足请充电
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Franja subtle ── */}
      <View style={[styles.zone, { backgroundColor: subtleBg, marginTop: 6 }]}>
        <TouchableOpacity onPress={() => onEditBg("subtle")} activeOpacity={0.6}>
          <View style={[styles.tokenChip, { backgroundColor: defaultBg }]}>
            <Text variant="caption" style={{ color: cDef, fontWeight: "600", fontSize: 10 }}>
              bg.{ctx}.subtle = {map.bg.subtle}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onEditText("default")} activeOpacity={0.6}>
          <Text style={{ color: resolved.text.default, fontSize: 15, fontWeight: "500" }}>
            text.default — El veloz murciélago hindú
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onEditText("subtle")} activeOpacity={0.6}>
          <Text style={{ color: resolved.text.subtle, fontSize: 13 }}>
            text.subtle — comía feliz cardillo y kiwi
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onEditText("subtlest")} activeOpacity={0.6}>
          <Text style={{ color: resolved.text.subtlest, fontSize: 12 }}>
            text.subtlest —能量不足请充电
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function SemanticTokensDemo() {
  const [lightMap, setLightMap] = useState<SemanticMap>(lightSemantic);
  const [darkMap, setDarkMap] = useState<SemanticMap>(darkSemantic);
  const [editing, setEditing] = useState<EditingTarget | null>(null);

  const lightResolved = resolveSemantic(lightMap);
  const darkResolved = resolveSemantic(darkMap);

  const getCurrentTokens = (): ColorToken[] => {
    if (!editing) return [];
    const isL = editing.group === "light";
    const map = isL ? lightMap : darkMap;
    const resolved = isL ? lightResolved : darkResolved;

    if (editing.category === "bg") {
      return [{
        name: `bg.${editing.ctx}.${editing.key}`,
        key: editing.key,
        value: resolved[editing.ctx].bg[editing.key],
        tokenName: map[editing.ctx].bg[editing.key],
      }];
    }
    return [{
      name: `text.${editing.ctx}.${editing.key}`,
      key: editing.key,
      value: resolved[editing.ctx].text[editing.key],
      tokenName: map[editing.ctx].text[editing.key],
    }];
  };

  const handleTokenChange = useCallback((key: string, value: string) => {
    if (!editing) return;
    const isL = editing.group === "light";
    const setter = isL ? setLightMap : setDarkMap;

    if (editing.category === "bg") {
      setter((p) => ({
        ...p,
        [editing.ctx]: {
          ...p[editing.ctx],
          bg: { ...p[editing.ctx].bg, [key]: value },
        },
      }));
    } else {
      setter((p) => ({
        ...p,
        [editing.ctx]: {
          ...p[editing.ctx],
          text: { ...p[editing.ctx].text, [key]: value },
        },
      }));
    }
  }, [editing]);

  const contexts: Ctx[] = ["default", "light", "darkness"];

  return (
    <View style={demoStyles.gap}>
      <Text variant="heading" style={styles.sectionTitle}>Light Mode</Text>
      {contexts.map((ctx) => (
        <ContextCard
          key={`l-${ctx}`}
          ctx={ctx}
          resolved={lightResolved[ctx]}
          map={lightMap[ctx]}
          group="light"
          onEditBg={(key) => setEditing({ category: "bg", ctx, key, group: "light" })}
          onEditText={(key) => setEditing({ category: "text", ctx, key, group: "light" })}
        />
      ))}

      <Text variant="heading" style={styles.sectionTitle}>Dark Mode</Text>
      {contexts.map((ctx) => (
        <ContextCard
          key={`d-${ctx}`}
          ctx={ctx}
          resolved={darkResolved[ctx]}
          map={darkMap[ctx]}
          group="dark"
          onEditBg={(key) => setEditing({ category: "bg", ctx, key, group: "dark" })}
          onEditText={(key) => setEditing({ category: "text", ctx, key, group: "dark" })}
        />
      ))}

      {editing && (
        <ColorCustomizerDialog
          visible
          onClose={() => setEditing(null)}
          componentName={`${editing.group} · ${editing.category === "bg" ? "bg" : "text"}.${editing.ctx}.${editing.key}`}
          tokens={getCurrentTokens()}
          onTokenChange={handleTokenChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontWeight: "700",
    fontSize: 18,
    marginTop: 4,
  },
  card: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E5EA",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 6,
  },
  cardCtx: {
    fontWeight: "700",
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: "#8E8E93",
  },
  cardGroup: {
    fontSize: 10,
    fontWeight: "600",
    color: "#B0B0B0",
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden",
  },
  zone: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 6,
  },
  tokenChip: {
    alignSelf: "flex-start",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 2,
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
        "3 contextos (default, light, darkness) × bg + text. Toca cualquier zona para editar.",
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
