import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { SearchBar, SearchBarStyle } from "@antonella/ui";
import { resolveSemantic, lightSemantic } from "@antonella/theme";
import type { ComponentCategory } from "../types";

const _s = resolveSemantic(lightSemantic);

function SearchBarDefaultDemo() {
  const [text, setText] = useState("");
  return (
    <View style={[styles.container, { backgroundColor: _s.default.bg.default, borderRadius: 16, padding: 12 }]}>
      <SearchBar
        value={text}
        onChangeText={setText}
        placeholder="Buscar..."
        style={SearchBarStyle.DEFAULT}
        onFocus={() => {}}
      />
    </View>
  );
}

function SearchBarLightDemo() {
  const [text, setText] = useState("");
  return (
    <View style={[styles.container, { backgroundColor: _s.light.bg.default, borderRadius: 16, padding: 12 }]}>
      <SearchBar
        value={text}
        onChangeText={setText}
        placeholder="Buscar..."
        style={SearchBarStyle.LIGHT}
        onFocus={() => {}}
      />
    </View>
  );
}

function SearchBarDarknessDemo() {
  const [text, setText] = useState("");
  return (
    <View style={[styles.container, { backgroundColor: _s.default.bg.default, borderRadius: 16, padding: 12 }]}>
      <SearchBar
        value={text}
        onChangeText={setText}
        placeholder="Buscar..."
        style={SearchBarStyle.DARKNESS}
        bgColor={_s.darkness.bg.subtle}
        onFocus={() => {}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
});

export const searchBar: ComponentCategory = {
  id: "search-bar",
  title: "SearchBar",
  icon: "search",
  components: [
    {
      id: "default",
      name: "DEFAULT",
      description: "Fondo bg.default.subtle, icono subtle.",
      variants: [
        { id: "all", label: "SearchBar", render: () => <SearchBarDefaultDemo /> },
      ],
    },
    {
      id: "light",
      name: "LIGHT",
      description: "Fondo bg.light.subtle, icono subtle.",
      variants: [
        { id: "all", label: "SearchBar", render: () => <SearchBarLightDemo /> },
      ],
    },
    {
      id: "darkness",
      name: "DARKNESS",
      description: "Fondo bg.darkness.subtle, icono subtle.",
      variants: [
        { id: "all", label: "SearchBar", render: () => <SearchBarDarknessDemo /> },
      ],
    },
  ],
};
