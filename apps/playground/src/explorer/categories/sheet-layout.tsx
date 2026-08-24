import React, { useState } from "react";
import { StyleSheet, View, TextInput, Pressable } from "react-native";
import { useRouter } from "expo-router";
import {
  Button,
  Text,
  SheetLayout,
  useSheetLayout,
  type Route,
} from "@antonella/ui";
import type { ComponentCategory } from "../types";

const palette = {
  light: "#FFFFFF",
  dark: "#1C1C1E",
  pink: "#FFE5EC",
  blue: "#E8F0FF",
};

function Switcher() {
  const { change } = useSheetLayout();
  const items: { key: string; label: string }[] = [
    { key: "top", label: "Top" },
    { key: "bottom", label: "Bottom" },
    { key: "fullH", label: "Full H" },
    { key: "fullB", label: "Full B" },
  ];
  return (
    <View style={styles.switcher}>
      <Text variant="caption" style={styles.switcherTitle}>
        Cambiar vista (sin navegación)
      </Text>
      <View style={styles.switcherRow}>
        {items.map((it) => (
          <Pressable
            key={it.key}
            onPress={() => change(it.key)}
            style={({ pressed }) => [
              styles.chip,
              pressed && { opacity: 0.6 },
            ]}
          >
            <Text variant="caption" style={styles.chipText}>
              {it.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function SampleHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.headerInner}>
      <Text variant="heading" style={styles.headerTitle}>
        {title}
      </Text>
      {subtitle ? (
        <Text variant="body" style={styles.headerSubtitle}>
          {subtitle}
        </Text>
      ) : null}
      <View style={styles.searchBar}>
        <TextInput
          placeholder="Buscar..."
          placeholderTextColor="#8E8E93"
          style={styles.searchInput}
        />
      </View>
    </View>
  );
}

function SampleBody({ note }: { note: string }) {
  return (
    <View style={styles.bodyContent}>
      <Switcher />
      <Text variant="heading" style={styles.sectionTitle}>
        {note}
      </Text>
      {Array.from({ length: 16 }).map((_, i) => (
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

function buildRoutes(): Route[] {
  return [
    {
      key: "top",
      kind: "topSheet",
      headerBackgroundColor: palette.light,
      bodyBackgroundColor: palette.dark,
      header: <SampleHeader title="Top Sheet" subtitle="Hoja superior fija" />,
      body: <SampleBody note="Top Sheet · body" />,
    },
    {
      key: "bottom",
      kind: "bottomSheet",
      headerBackgroundColor: palette.pink,
      bodyBackgroundColor: palette.dark,
      header: <SampleHeader title="Bottom Sheet" subtitle="Hoja que sube al scroll" />,
      body: <SampleBody note="Bottom Sheet · body" />,
    },
    {
      key: "fullH",
      kind: "fullHeader",
      headerBackgroundColor: palette.blue,
      bodyBackgroundColor: palette.blue,
      header: <SampleHeader title="Full Header" subtitle="Toda la pantalla del color del header" />,
      body: <SampleBody note="Full Header · body" />,
    },
    {
      key: "fullB",
      kind: "fullBody",
      headerBackgroundColor: palette.dark,
      bodyBackgroundColor: palette.dark,
      header: <SampleHeader title="Full Body" subtitle="Toda la pantalla del color del body" />,
      body: <SampleBody note="Full Body · body" />,
    },
  ];
}

export function SheetLayoutDemo() {
  const [active, setActive] = useState("top");
  return (
    <SheetLayout
      routes={buildRoutes()}
      activeKey={active}
      onRequestChange={setActive}
      style={styles.demoContainer}
    />
  );
}

export function SheetLayoutFullScreen() {
  const router = useRouter();
  const [active, setActive] = useState("top");
  return (
    <>
      <SheetLayout
        routes={buildRoutes()}
        activeKey={active}
        onRequestChange={setActive}
        style={styles.full}
      />
      <View style={styles.backFloat}>
        <Button
          variant="ghost"
          label="← Volver"
          onPress={() => router.back()}
        />
      </View>
    </>
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
  full: {
    flex: 1,
  },
  backFloat: {
    position: "absolute",
    top: 50,
    left: 12,
  },
  headerInner: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
  },
  headerSubtitle: {
    fontSize: 14,
    opacity: 0.6,
  },
  searchBar: {
    backgroundColor: "rgba(0,0,0,0.06)",
    borderRadius: 12,
    height: 44,
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  searchInput: {
    fontSize: 16,
  },
  bodyContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 4,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.92)",
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
  switcher: {
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 14,
    padding: 12,
    gap: 8,
  },
  switcherTitle: {
    fontWeight: "600",
  },
  switcherRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    backgroundColor: "#0A84FF",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  chipText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});

function FullScreenButton() {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push("/explorer/sheet-layout-full")}
      style={({ pressed }) => [styles.chip, pressed && { opacity: 0.7 }]}
    >
      <Text variant="body" style={styles.chipText}>
        Abrir en pantalla completa →
      </Text>
    </Pressable>
  );
}

export const sheetLayout: ComponentCategory = {
  id: "sheet-layout",
  title: "Sheet Layout",
  icon: "git-network",
  components: [
    {
      id: "sheet-layout",
      name: "SheetLayout",
      description:
        "Sistema de capas (topSheet, bottomSheet, fullHeader, fullBody) que intercambian vistas en sitio sin navegación. Transiciones consistentes dirigidas por datos y resize animado del header.",
      variants: [
        {
          id: "preview",
          label: "Preview (altura fija)",
          render: () => <SheetLayoutDemo />,
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
