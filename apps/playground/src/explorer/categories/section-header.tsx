import React from "react";
import { StyleSheet, View } from "react-native";
import { SectionHeader, SectionHeaderStyle } from "@william-callao/antonella-ui";
import { resolveSemantic, lightSemantic } from "@william-callao/antonella-theme";
import type { ComponentCategory } from "../types";

const _s = resolveSemantic(lightSemantic);

function SectionHeaderDefaultDemo() {
  return (
    <View style={[styles.container, { backgroundColor: _s.default.bg.default, borderRadius: 16, padding: 12 }]}>
      <SectionHeader
        title="Lista de items"
        action="Ver todo"
        onAction={() => {}}
        style={SectionHeaderStyle.DEFAULT}
      />
    </View>
  );
}

function SectionHeaderLightDemo() {
  return (
    <View style={[styles.container, { backgroundColor: _s.light.bg.default, borderRadius: 16, padding: 12 }]}>
      <SectionHeader
        title="Lista de items"
        action="Ver todo"
        onAction={() => {}}
        style={SectionHeaderStyle.LIGHT}
      />
    </View>
  );
}

function SectionHeaderDarknessDemo() {
  return (
    <View style={[styles.container, { backgroundColor: _s.darkness.bg.default, borderRadius: 16, padding: 12 }]}>
      <SectionHeader
        title="Lista de items"
        action="Ver todo"
        onAction={() => {}}
        style={SectionHeaderStyle.DARKNESS}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
});

export const sectionHeader: ComponentCategory = {
  id: "section-header",
  title: "SectionHeader",
  icon: "document-text",
  components: [
    {
      id: "default",
      name: "DEFAULT",
      description: "Título text.default, acción text.subtlest.",
      variants: [
        { id: "all", label: "SectionHeader", render: () => <SectionHeaderDefaultDemo /> },
      ],
    },
    {
      id: "light",
      name: "LIGHT",
      description: "Título text.default, acción text.subtlest.",
      variants: [
        { id: "all", label: "SectionHeader", render: () => <SectionHeaderLightDemo /> },
      ],
    },
    {
      id: "darkness",
      name: "DARKNESS",
      description: "Título text.default, acción text.subtlest.",
      variants: [
        { id: "all", label: "SectionHeader", render: () => <SectionHeaderDarknessDemo /> },
      ],
    },
  ],
};