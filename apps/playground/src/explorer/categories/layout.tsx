import React from "react";
import { StyleSheet, View, TextInput, Pressable } from "react-native";
import { useRouter } from "expo-router";
import {
  Text,
  HeaderCardLayout,
  ReverseHeaderCardLayout,
} from "@william-callao/antonella-ui";
import type { ComponentCategory } from "../types";

function HeaderCardDemo() {
  return (
    <View style={styles.demoContainer}>
      <HeaderCardLayout
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
          {Array.from({ length: 20 }).map((_, i) => (
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
    </View>
  );
}

const styles = StyleSheet.create({
  demoContainer: {
    height: 520,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E5EA",
  },
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
  headerSubtitle: {
    fontSize: 14,
    color: "#8E8E93",
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
  fullScreenBtn: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  fullScreenBtnText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});

function ReverseHeaderCardDemo() {
  return (
    <View style={styles.demoContainer}>
      <ReverseHeaderCardLayout
        header={
          <View style={styles.headerInner}>
            <Text variant="heading" style={styles.headerTitle}>
              Perfil
            </Text>
            <Text variant="body" style={styles.headerSubtitle}>
              Información de la cuenta
            </Text>
          </View>
        }
      >
        <View style={styles.bodyContent}>
          <Text variant="heading" style={styles.sectionTitle}>
            Configuración
          </Text>
          {Array.from({ length: 20 }).map((_, i) => (
            <View key={i} style={styles.card}>
              <View style={styles.cardIcon} />
              <View style={styles.cardBody}>
                <View style={styles.cardLine} />
                <View style={[styles.cardLine, styles.cardLineShort]} />
              </View>
            </View>
          ))}
        </View>
      </ReverseHeaderCardLayout>
    </View>
  );
}

function FullScreenButton() {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push("/explorer/header-card-full")}
      style={({ pressed }) => [styles.fullScreenBtn, pressed && { opacity: 0.7 }]}
    >
      <Text variant="body" style={styles.fullScreenBtnText}>
        Abrir en pantalla completa →
      </Text>
    </Pressable>
  );
}

function ReverseFullScreenButton() {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push("/explorer/reverse-header-card-full")}
      style={({ pressed }) => [styles.fullScreenBtn, pressed && { opacity: 0.7 }]}
    >
      <Text variant="body" style={styles.fullScreenBtnText}>
        Abrir en pantalla completa →
      </Text>
    </Pressable>
  );
}

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
          label: "Preview (altura fija)",
          render: () => <HeaderCardDemo />,
        },
        {
          id: "fullscreen",
          label: "Pantalla completa",
          render: () => <FullScreenButton />,
        },
      ],
    },
    {
      id: "reverse-header-card",
      name: "ReverseHeaderCardLayout",
      description:
        "Layout inverso: el body tiene bordes redondeados superiores y se superpone al header al hacer scroll, ocultándolo completamente.",
      variants: [
        {
          id: "preview",
          label: "Preview (altura fija)",
          render: () => <ReverseHeaderCardDemo />,
        },
        {
          id: "fullscreen",
          label: "Pantalla completa",
          render: () => <ReverseFullScreenButton />,
        },
      ],
    },
  ],
};
