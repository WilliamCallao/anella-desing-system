import React from "react";
import { StyleSheet, View, TextInput } from "react-native";
import { Text, HeaderCardLayout } from "@antonella/ui";
import type { ComponentCategory } from "../types";

function HeaderCardDemo() {
  return (
    <HeaderCardLayout
      headerBackgroundColor="#FFFFFF"
      bodyBackgroundColor="#E8EBF0"
      header={
        <View style={styles.headerInner}>
          <Text variant="heading" style={styles.headerTitle}>
            Buscar
          </Text>
          <View style={styles.searchBar}>
            <TextInput
              placeholder="Buscar..."
              placeholderTextColor="#8E8E93"
              style={styles.searchInput}
            />
          </View>
        </View>
      }
    >
      <View style={styles.bodyContent}>
        <Text variant="heading" style={styles.sectionTitle}>
          Resultados
        </Text>
        {Array.from({ length: 12 }).map((_, i) => (
          <View key={i} style={styles.card}>
            <View style={styles.cardIcon} />
            <View style={styles.cardBody}>
              <View style={styles.cardLine} />
              <View style={[styles.cardLine, styles.cardLineShort]} />
            </View>
          </View>
        ))}
      </View>
    </HeaderCardLayout>
  );
}

const styles = StyleSheet.create({
  headerInner: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1C1C1E",
  },
  searchBar: {
    backgroundColor: "#F2F2F7",
    borderRadius: 12,
    height: 44,
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  searchInput: {
    fontSize: 16,
    color: "#1C1C1E",
  },
  bodyContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1C1C1E",
    marginBottom: 4,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#E5E5EA",
  },
  cardBody: {
    flex: 1,
    gap: 6,
  },
  cardLine: {
    height: 12,
    borderRadius: 6,
    backgroundColor: "#E5E5EA",
  },
  cardLineShort: {
    width: "60%",
  },
});

export const layout: ComponentCategory = {
  id: "layout",
  title: "Layout",
  icon: "document-text",
  components: [
    {
      id: "header-card",
      name: "HeaderCardLayout",
      description:
        "Layout de pantalla con header tipo card en la parte superior. El header tiene bordes redondeados inferiores y se superpone al body con scroll.",
      variants: [
        {
          id: "search",
          label: "Con Search Bar",
          render: () => <HeaderCardDemo />,
        },
      ],
    },
  ],
};
