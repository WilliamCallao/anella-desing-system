import React from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import {
  Button,
  Text,
  MainLayout,
} from "@antonella/ui";
import type { ComponentCategory } from "../types";

function SampleBody() {
  return (
    <View style={styles.bodyContent}>
      {Array.from({ length: 18 }).map((_, i) => (
        <View key={i} style={styles.card}>
          <View style={styles.cardIcon} />
          <View style={styles.cardBody}>
            <View style={styles.cardLine} />
            <View style={[styles.cardLine, styles.cardLineShort]} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function MainLayoutDemo() {
  return (
    <MainLayout style={styles.demoContainer}>
      <SampleBody />
    </MainLayout>
  );
}

export function MainLayoutFullScreen() {
  const router = useRouter();
  return (
    <MainLayout>
      <View style={styles.headerBar}>
        <Button
          variant="ghost"
          label="← Volver"
          onPress={() => router.back()}
        />
      </View>
      <SampleBody />
    </MainLayout>
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
  headerBar: {
    gap: 4,
  },
  headerInner: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
  },
  headerSubtitle: {
    fontSize: 14,
    opacity: 0.6,
  },
  bodyContent: {
    paddingHorizontal: 16,
    gap: 10,
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

function FullScreenButton() {
  const router = useRouter();
  return (
    <Button
      variant="primary"
      label="Abrir en pantalla completa →"
      onPress={() => router.push("/explorer/main-layout-full")}
    />
  );
}

export const mainLayout: ComponentCategory = {
  id: "main-layout",
  title: "Main Layout",
  icon: "document-text",
  components: [
    {
      id: "main-layout",
      name: "MainLayout",
      description:
        "Pantalla simple y normal: respeta el safe area y muestra un body scrolleable. Base mínima para construir encima.",
      variants: [
        {
          id: "preview",
          label: "Preview (altura fija)",
          render: () => <MainLayoutDemo />,
        },
        {
          id: "fullscreen",
          label: "Pantalla completa",
          render: () => <FullScreenButton />,
        },
      ],
    },
  ],
};
