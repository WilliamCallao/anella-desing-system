import React from "react";
import { StyleSheet, View } from "react-native";
import { CategoryText, CategoryTextStyle } from "@william-callao/antonella-ui";
import { resolveSemantic, lightSemantic } from "@william-callao/antonella-theme";
import type { ComponentCategory } from "../types";

const _s = resolveSemantic(lightSemantic);

function CategoryTextDefaultDemo() {
  return (
    <View style={[styles.container, { backgroundColor: _s.default.bg.default, borderRadius: 16, padding: 12 }]}>
      <CategoryText
        title="Lista de items"
        action="Ver todo"
        onAction={() => {}}
        style={CategoryTextStyle.DEFAULT}
      />
    </View>
  );
}

function CategoryTextLightDemo() {
  return (
    <View style={[styles.container, { backgroundColor: _s.light.bg.default, borderRadius: 16, padding: 12 }]}>
      <CategoryText
        title="Lista de items"
        action="Ver todo"
        onAction={() => {}}
        style={CategoryTextStyle.LIGHT}
      />
    </View>
  );
}

function CategoryTextDarknessDemo() {
  return (
    <View style={[styles.container, { backgroundColor: _s.darkness.bg.default, borderRadius: 16, padding: 12 }]}>
      <CategoryText
        title="Lista de items"
        action="Ver todo"
        onAction={() => {}}
        style={CategoryTextStyle.DARKNESS}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
});

export const categoryText: ComponentCategory = {
  id: "category-text",
  title: "CategoryText",
  icon: "document-text",
  components: [
    {
      id: "default",
      name: "DEFAULT",
      description: "Título text.default, acción text.subtlest.",
      variants: [
        { id: "all", label: "CategoryText", render: () => <CategoryTextDefaultDemo /> },
      ],
    },
    {
      id: "light",
      name: "LIGHT",
      description: "Título text.default, acción text.subtlest.",
      variants: [
        { id: "all", label: "CategoryText", render: () => <CategoryTextLightDemo /> },
      ],
    },
    {
      id: "darkness",
      name: "DARKNESS",
      description: "Título text.default, acción text.subtlest.",
      variants: [
        { id: "all", label: "CategoryText", render: () => <CategoryTextDarknessDemo /> },
      ],
    },
  ],
};
