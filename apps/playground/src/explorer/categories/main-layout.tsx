import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View, Pressable, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  withTiming,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { Button, MainLayout, Text } from "@antonella/ui";
import type { ComponentCategory } from "../types";

const COLLAPSE = 160;
const APP_OPTIONS = ["TEST", "BOTTOM", "FULLBOTTOM"] as const;
const MODE_INDEX = { TEST: 0, BOTTOM: 1, FULLBOTTOM: 2 } as const;

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
  const { height: H } = useWindowDimensions();
  const [mode, setMode] = useState<"TEST" | "BOTTOM" | "FULLBOTTOM">("TEST");
  const [showLines, setShowLines] = useState(false);

  const isBottom = mode === "BOTTOM" || mode === "FULLBOTTOM";
  const isFullBottom = mode === "FULLBOTTOM";
  const progress = useSharedValue(0);
  const scrollY = useSharedValue(0);
  const blueH = useSharedValue(0);
  const yellowH = useSharedValue(0);
  const scrollRef = useRef<Animated.ScrollView>(null);

  // Animación de la transición TEST (0) <-> BOTTOM (1) <-> FULLBOTTOM (2).
  useEffect(() => {
    console.log(
      "[MODE] transición ->",
      mode,
      "| isBottom:",
      isBottom,
      "| isFullBottom:",
      isFullBottom,
      "| progress target:",
      MODE_INDEX[mode],
      "| blueH:",
      blueH.value,
      "| yellowH:",
      yellowH.value
    );
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    scrollY.value = 0;
    progress.value = withTiming(MODE_INDEX[mode], { duration: 320 }, () => {
      console.log(
        "[PROGRESS] completado ->",
        mode,
        "| blueH:",
        blueH.value,
        "| yellowH:",
        yellowH.value
      );
    });
  }, [mode, progress]);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  const redStyle = useAnimatedStyle(() => ({
    height: interpolate(progress.value, [0, 1, 2], [H / 3, 0, 0]),
  }));

  const blueStyle = useAnimatedStyle(() => ({
    height: interpolate(progress.value, [0, 1, 2], [H / 3, blueH.value, 0]),
    opacity: interpolate(
      scrollY.value,
      [0, COLLAPSE],
      [1, 0],
      Extrapolation.CLAMP
    ),
  }));

  const yellowStyle = useAnimatedStyle(() => ({
    height: interpolate(progress.value, [0, 1, 2], [H / 3, yellowH.value, yellowH.value]),
  }));

  const blueContent = (
    <View style={styles.midBar}>
      <Button variant="ghost" label="← Volver" onPress={() => router.back()} />
      <Text variant="heading" style={styles.selectorLabel}>
        App
      </Text>
      <AppSelector
        value={mode}
        onChange={(v) => setMode(v as "TEST" | "BOTTOM" | "FULLBOTTOM")}
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

  return (
    <MainLayout scroll={false}>
      <Animated.ScrollView
        ref={scrollRef}
        style={styles.pageScroll}
        contentContainerStyle={styles.pageContent}
        scrollEnabled={isBottom || isFullBottom}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={onScroll}
      >
        <Animated.View
          style={[styles.colBlock, { backgroundColor: "#FF3B30" }, redStyle]}
        />
        <Animated.View
          style={[
            styles.colBlock,
            { backgroundColor: "#007AFF", overflow: "hidden" },
            blueStyle,
          ]}
        >
          <View
            onLayout={(e) => {
              const h = e.nativeEvent.layout.height;
              console.log("[BLUE] onLayout height =", h, "| mode:", mode);
              // En FULLBOTTOM la azul colapsa y su onLayout reporta 0; no
              // sobreescribimos la medida natural, si no BOTTOM no reaparece.
              if (mode !== "FULLBOTTOM") blueH.value = h;
            }}
          >
            {blueContent}
          </View>
        </Animated.View>
        <Animated.View
          style={[
            styles.colBlock,
            { backgroundColor: "#FFCC00", overflow: "hidden" },
            yellowStyle,
          ]}
        >
          <View
            onLayout={(e) => {
              const h = e.nativeEvent.layout.height;
              console.log("[YELLOW] onLayout height =", h, "| mode:", mode);
              yellowH.value = h;
            }}
          >
            {isFullBottom && (
              <View style={styles.fullBar}>
                <Text variant="heading" style={styles.selectorLabel}>
                  App
                </Text>
                <AppSelector
                  value={mode}
                  onChange={(v) => setMode(v as "TEST" | "BOTTOM" | "FULLBOTTOM")}
                />
              </View>
            )}
            {Array.from({ length: 30 }).map((_, i) => (
              <View key={i} style={styles.rect}>
                <Text variant="body" style={styles.rectText}>
                  {`Item ${i + 1}`}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>
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
  pageContent: {
    gap: 0,
  },
  colBlock: {
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
  fullBar: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 12,
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
        "TEST: tres secciones iguales sin scroll. BOTTOM: la roja colapsa, la azul pasa a su alto de contenido (y se desvanece al scrollear) y la amarilla muestra la lista. FULLBOTTOM: roja y azul a alto 0, solo queda la amarilla. La transición entre modos está animada con reanimated.",
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
