import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, TextInput, View } from "react-native";
import { Icon, StreamlineIcon, Text, STREAMLINE_ICON_NAMES } from "@william-callao/antonella-ui";
import { background, border, cta1, space, spacing, text, TextType } from "@william-callao/antonella-theme";
import type { IconName } from "@william-callao/antonella-ui";
import { iconMap } from "@william-callao/antonella-ui";
import type { ComponentCategory } from "../types";

const ALL_ICONS = Object.keys(iconMap).sort() as IconName[];

function IconGallery() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_ICONS;
    return ALL_ICONS.filter((name) => name.toLowerCase().includes(q));
  }, [query]);

  return (
    <View style={styles.wrap}>
      <TextInput
        style={styles.search}
        placeholder="Buscar ícono…"
        placeholderTextColor={text.secondary}
        value={query}
        onChangeText={setQuery}
      />
      <View style={styles.grid}>
        {filtered.map((name) => (
          <View key={name} style={styles.cell}>
            <Icon name={name} size={24} color={cta1} />
            <Text variant={TextType.Caption} color={text.secondary} style={styles.cellLabel}>
              {name}
            </Text>
          </View>
        ))}
      </View>
      {filtered.length === 0 ? (
        <Text variant={TextType.Caption} color={text.secondary}>
          Sin resultados para "{query}".
        </Text>
      ) : null}
    </View>
  );
}

function StreamlineGallery() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return STREAMLINE_ICON_NAMES;
    return STREAMLINE_ICON_NAMES.filter((name) => name.includes(q));
  }, [query]);

  return (
    <View style={styles.wrap}>
      <TextInput
        style={styles.search}
        placeholder="Buscar ícono Streamline…"
        placeholderTextColor={text.secondary}
        value={query}
        onChangeText={setQuery}
      />
      <View style={styles.grid}>
        {filtered.map((name) => (
          <View key={name} style={styles.cell}>
            <StreamlineIcon name={name} size={24} />
            <Text variant={TextType.Caption} color={text.secondary} style={styles.cellLabel}>
              {name}
            </Text>
          </View>
        ))}
      </View>
      {filtered.length === 0 ? (
        <Text variant={TextType.Caption} color={text.secondary}>
          Sin resultados para "{query}".
        </Text>
      ) : null}
    </View>
  );
}

export const iconos: ComponentCategory = {
  id: "iconos",
  title: "Iconos",
  icon: "palette",
  components: [
    {
      id: "gallery",
      name: "Galería",
      description: "Todos los íconos disponibles en Antonella, con su nombre de token.",
      variants: [{ id: "all", label: "Todos", render: () => <IconGallery /> }],
    },
    {
      id: "streamline",
      name: "StreamlineIcon",
      description:
        "Set de íconos Streamline vectoriales (Ghost Crypto Wallet UI Kit), de dos tonos configurables (`color` y `secondaryColor`).",
      variants: [{ id: "all", label: "Todos", render: () => <StreamlineGallery /> }],
    },
  ],
};

const styles = StyleSheet.create({
  wrap: {
    gap: space.space3,
  },
  search: {
    backgroundColor: background.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: border.divider.secondary,
    borderRadius: 12,
    paddingHorizontal: space.space3,
    paddingVertical: space.space2,
    fontSize: 16,
    color: text.default,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  cell: {
    width: "31%",
    alignItems: "center",
    gap: space.space1,
    paddingVertical: space.space3,
    paddingHorizontal: space.space1,
    borderRadius: 12,
    backgroundColor: background.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: border.divider.secondary,
  },
  cellLabel: {
    textAlign: "center",
  },
});
