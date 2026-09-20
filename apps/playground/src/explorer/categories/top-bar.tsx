import React from "react";
import { StyleSheet, View } from "react-native";
import { TopBar, TopAction, TopActionStyle } from "@william-callao/antonella-ui";
import { resolveSemantic, lightSemantic } from "@william-callao/antonella-theme";
import type { ComponentCategory } from "../types";

const _s = resolveSemantic(lightSemantic);

function TopBarDefaultDemo() {
  return (
    <View style={[styles.container, { backgroundColor: _s.default.bg.default, borderRadius: 16, padding: 12 }]}>
      <TopBar>
        <TopAction icon="menu" onPress={() => {}} />
      </TopBar>
      <TopBar>
        <TopAction icon="chevron-back" onPress={() => {}} accessibilityLabel="Volver" />
      </TopBar>
    </View>
  );
}

function TopBarDarknessDemo() {
  return (
    <View style={[styles.container, { backgroundColor: _s.darkness.bg.default, borderRadius: 16, padding: 12 }]}>
      <TopBar>
        <TopAction icon="menu" style={TopActionStyle.DARKNESS} onPress={() => {}} />
      </TopBar>
      <TopBar>
        <TopAction icon="chevron-back" style={TopActionStyle.DARKNESS} onPress={() => {}} />
      </TopBar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
});

export const topBar: ComponentCategory = {
  id: "top-bar",
  title: "TopBar",
  icon: "menu",
  components: [
    {
      id: "default",
      name: "DEFAULT",
      description: "Barra superior contenedora, con un TopAction (botón redondo de menú).",
      variants: [
        { id: "all", label: "Default", render: () => <TopBarDefaultDemo /> },
      ],
    },
    {
      id: "darkness",
      name: "DARKNESS",
      description: "Variante sobre fondo oscuro (tokens darkness).",
      variants: [
        { id: "all", label: "Darkness", render: () => <TopBarDarknessDemo /> },
      ],
    },
  ],
};