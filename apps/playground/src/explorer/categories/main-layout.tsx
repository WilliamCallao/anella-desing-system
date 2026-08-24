import React, { useState } from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { Button, MainLayout, Text } from "@antonella/ui";
import type { ComponentCategory } from "../types";

const COLLAPSE = 160;
const APP_OPTIONS = ["TEST", "BOTTOM"] as const;

function AppSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={styles.selectorRow}>
      {APP_OPTIONS.map((opt) => (
        <Pressable
          key={opt}
          onPress={() => onChange(opt)}
          style={({ pressed }) => [
            styles.chip,
            value === opt && styles.chipActive,
            pressed && styles.chipPressed,
          ]}
        >
          <Text
            variant="body"
            style={[
              styles.chipText,
              value === opt && styles.chipTextActive,
            ]}
          >
            {opt}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

function ThreeSections() {
  return (
    <>
      <View style={[styles.section, { backgroundColor: "#FF3B30" }]} />
      <View style={[styles.section, { backgroundColor: "#007AFF" }]} />
      <View style={[styles.section, { backgroundColor: "#FFCC00" }]} />
    </>
  );
}

export function MainLayoutDemo() {
  return (
    <MainLayout scroll={false} style={styles.demoContainer}>
      <ThreeSections />
    </MainLayout>
  );
}

export function MainLayoutFullScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<"TEST" | "BOTTOM">("TEST");
  const [showLines, setShowLines] = useState(false);

  const isBottom = mode === "BOTTOM";
  const scrollY = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  // En BOTTOM la azul sube con el scroll y se desvanece (opacity).
  const blueFade = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [0, COLLAPSE],
      [1, 0],
      Extrapolation.CLAMP
    ),
  }));

  const blueContent = (
    <View style={styles.midBar}>
      <Button variant="ghost" label="← Volver" onPress={() => router.back()} />
      <Text variant="heading" style={styles.selectorLabel}>
        App
      </Text>
      <AppSelector
        value={mode}
        onChange={(v) => setMode(v as "TEST" | "BOTTOM")}
      />
      <Button
        variant="secondary"
        label={showLines ? "Ocultar líneas" : "Mostrar líneas"}
        onPress={() => setShowLines((v) => !v)}
      />
      {showLines && (
        <View style={styles.lines}>
          <Text variant="body" style={styles.lineText}>
            Línea simulada 1 del header
          </Text>
          <Text variant="body" style={styles.lineText}>
            Línea simulada 2 del header
          </Text>
        </View>
      )}
    </View>
  );

  // TEST: tres secciones iguales, sin scroll.
  if (!isBottom) {
    return (
      <MainLayout scroll={false}>
        <View style={[styles.section, { backgroundColor: "#FF3B30" }]} />
        <View style={[styles.section, { backgroundColor: "#007AFF" }]}>
          {blueContent}
        </View>
        <View style={[styles.section, { backgroundColor: "#FFCC00" }]} />
      </MainLayout>
    );
  }

  // BOTTOM: scroll de página. La azul sube y se desvanece; la amarilla (lista) es el contenido.
  return (
    <MainLayout scroll={false}>
      <Animated.ScrollView
        style={styles.pageScroll}
        contentContainerStyle={styles.pageScrollContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={onScroll}
      >
        <Animated.View
          style={[styles.block, { backgroundColor: "#007AFF" }, blueFade]}
        >
          {blueContent}
        </Animated.View>
        <View style={[styles.block, { backgroundColor: "#FFCC00" }]}>
          {Array.from({ length: 30 }).map((_, i) => (
            <View key={i} style={styles.rect}>
              <Text variant="body" style={styles.rectText}>
                {`Item ${i + 1}`}
              </Text>
            </View>
          ))}
        </View>
      </Animated.ScrollView>
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
  section: {
    flex: 1,
  },
  pageScroll: {
    flex: 1,
  },
  pageScrollContent: {
    gap: 0,
  },
  block: {
    width: "100%",
  },
  midBar: {
    paddingTop: 12,
    paddingHorizontal: 12,
    gap: 12,
  },
  selectorLabel: {
    color: "#FFFFFF",
  },
  selectorRow: {
    flexDirection: "row",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  chipActive: {
    backgroundColor: "#FFFFFF",
  },
  chipPressed: {
    opacity: 0.7,
  },
  chipText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  chipTextActive: {
    color: "#007AFF",
  },
  lines: {
    gap: 4,
  },
  lineText: {
    color: "#FFFFFF",
  },
  rect: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 16,
    margin: 12,
  },
  rectText: {
    color: "#000000",
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
        "TEST: tres secciones iguales sin scroll. BOTTOM: la sección roja se oculta y, al scrollear la página, la azul sube y se desvanece mientras la amarilla (lista) es el contenido.",
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
