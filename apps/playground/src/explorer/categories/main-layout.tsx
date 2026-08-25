import React, { useState, useLayoutEffect, useRef } from "react";
import { StyleSheet, View, Pressable, ScrollView, useWindowDimensions } from "react-native";
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
const APP_OPTIONS = ["TEST", "BOTTOM", "FULLBOTTOM", "ONLYCENTER", "TOP"] as const;

function AppSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.selectorRow}
      contentContainerStyle={styles.selectorRowContent}
    >
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
    </ScrollView>
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
  const [mode, setMode] = useState<"TEST" | "BOTTOM" | "FULLBOTTOM" | "ONLYCENTER" | "TOP">(
    "TEST"
  );
  const [showLines, setShowLines] = useState(false);

  const isBottom = mode === "BOTTOM" || mode === "FULLBOTTOM";
  const isFullBottom = mode === "FULLBOTTOM";
  const isOnlyCenter = mode === "ONLYCENTER";
  const isTop = mode === "TOP";
  const blueScrolls = isOnlyCenter || isTop;

  const scrollRef = useRef<Animated.ScrollView>(null);
  const scrollY = useSharedValue(0);
  const animating = useSharedValue(0);
  const redHeight = useSharedValue(H / 3);
  const blueHeight = useSharedValue(H / 3);
  const yellowHeight = useSharedValue(H / 3);
  const blueNatural = useSharedValue(0);
  const yellowNatural = useSharedValue(0);
  const redNatural = useSharedValue(0);

  // Alturas animadas DIRECTO al objetivo del modo (sin pasar por otros modos,
  // evita que BOTTOM<->ONLYCENTER crucen por el 0 de FULLBOTTOM).
  useLayoutEffect(() => {
    console.log(
      "[MODE] transición ->",
      mode,
      "| isBottom:",
      isBottom,
      "| isFullBottom:",
      isFullBottom,
      "| isOnlyCenter:",
      isOnlyCenter,
      "| blueNatural:",
      blueNatural.value,
      "| yellowNatural:",
      yellowNatural.value
    );
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    scrollY.value = 0;
    animating.value = 1;
    const targets = {
      red: mode === "TEST" ? H / 3 : mode === "TOP" ? redNatural.value : 0,
      blue:
        mode === "TEST"
          ? H / 3
          : mode === "BOTTOM"
          ? blueNatural.value
          : mode === "FULLBOTTOM"
          ? 0
          : mode === "ONLYCENTER"
          ? H
          : H - redNatural.value,
      yellow:
        mode === "TEST"
          ? H / 3
          : mode === "TOP" || mode === "ONLYCENTER"
          ? 0
          : yellowNatural.value,
    };
    const done = () => {
      animating.value = 0;
      // Al asentar, sincronizamos las secciones dinámicas con su contenido
      // actual (por si hubo un cambio de contenido durante la entrada).
      if (mode === "BOTTOM") {
        blueHeight.value = blueNatural.value;
        console.log("[DONE] BOTTOM blueHeight ->", blueNatural.value);
      } else if (mode === "TOP") {
        redHeight.value = redNatural.value;
        blueHeight.value = H - redNatural.value;
      }
    };
    redHeight.value = withTiming(targets.red, { duration: 320 }, done);
    blueHeight.value = withTiming(targets.blue, { duration: 320 }, done);
    yellowHeight.value = withTiming(targets.yellow, { duration: 320 }, done);
  }, [mode]);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  const redStyle = useAnimatedStyle(() => ({
    height: redHeight.value,
  }));

  const blueStyle = useAnimatedStyle(
    () => ({
      height: blueHeight.value,
      // El fade solo aplica en BOTTOM; en ONLYCENTER la azul scrollea a sí misma.
      opacity: isBottom
        ? interpolate(scrollY.value, [0, COLLAPSE], [1, 0], Extrapolation.CLAMP)
        : 1,
    }),
    [isBottom, H]
  );

  const yellowStyle = useAnimatedStyle(() => ({
    height: yellowHeight.value,
  }));

  const blueContent = (
    <View style={styles.midBar}>
      <Button variant="ghost" label="← Volver" onPress={() => router.back()} />
      <Text variant="heading" style={styles.selectorLabel}>
        App
      </Text>
      <AppSelector
        value={mode}
        onChange={(v) => setMode(v as "TEST" | "BOTTOM" | "FULLBOTTOM" | "ONLYCENTER" | "TOP")}
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
        >
          <View
            style={styles.measureCopy}
            onLayout={(e) => {
              const h = e.nativeEvent.layout.height;
              if (animating.value === 0) {
                redNatural.value = h;
                // En TOP la roja es el header dinámico: crece/encoge con su
                // contenido y la azul se ajusta para llenar el resto (H - h).
                if (animating.value === 0 && mode === "TOP") {
                  redHeight.value = h;
                  blueHeight.value = H - h;
                }
              }
            }}
          >
            {blueContent}
          </View>
          {isTop && blueContent}
        </Animated.View>
        <Animated.View
          style={[
            styles.colBlock,
            { backgroundColor: "#007AFF", overflow: "hidden" },
            blueStyle,
          ]}
        >
          {/* Copia oculta y absoluta para medir la altura natural de la azul
              sin el constraint del padre (que recorta el onLayout durante la
              animación y al cambiar el contenido). */}
          <View
            style={styles.measureCopy}
            onLayout={(e) => {
              const h = e.nativeEvent.layout.height;
              console.log(
                "[BLUE] onLayout =",
                h,
                "| mode:",
                mode,
                "| animating:",
                animating.value
              );
              // La copia es absoluta/unconstrained, así que reporta la altura
              // natural real aunque el padre esté animando: la medimos siempre.
              blueNatural.value = h;
              if (animating.value === 0 && mode === "BOTTOM") {
                // En BOTTOM la azul es dinámica: crece/encoge con su contenido.
                blueHeight.value = h;
                console.log("[BLUE] set blueHeight =", h);
              }
            }}
          >
            {blueContent}
          </View>
          {blueScrolls ? (
            <Animated.ScrollView
              style={styles.blueScroll}
              showsVerticalScrollIndicator={false}
              scrollEventThrottle={16}
              onScroll={onScroll}
            >
              {isTop ? (
                Array.from({ length: 30 }).map((_, i) => (
                  <View key={i} style={styles.rect}>
                    <Text variant="body" style={styles.rectText}>
                      {`Item ${i + 1}`}
                    </Text>
                  </View>
                ))
              ) : (
                <>
                  <View style={styles.midBar}>{blueContent}</View>
                  {Array.from({ length: 30 }).map((_, i) => (
                    <View key={i} style={[styles.rect, { backgroundColor: "#E5E5EA" }]}>
                      <Text variant="body" style={styles.rectText}>
                        {`Item ${i + 1}`}
                      </Text>
                    </View>
                  ))}
                </>
              )}
            </Animated.ScrollView>
          ) : (
            <View>{blueContent}</View>
          )}
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
              console.log(
                "[YELLOW] onLayout =",
                h,
                "| mode:",
                mode,
                "| animating:",
                animating.value
              );
              // Solo medimos la altura natural cuando la amarilla es visible
              // (TEST/BOTTOM/FULLBOTTOM). En TOP/ONLYCENTER la amarilla está a 0,
              // y ese 0 no debe corromper yellowNatural.
              if (
                animating.value === 0 &&
                (mode === "TEST" || mode === "BOTTOM" || mode === "FULLBOTTOM")
              ) {
                yellowNatural.value = h;
              }
            }}
          >
            {isFullBottom && (
              <View style={styles.fullBar}>
                <Text variant="heading" style={styles.selectorLabel}>
                  App
                </Text>
                <AppSelector
                  value={mode}
                  onChange={(v) =>
                    setMode(v as "TEST" | "BOTTOM" | "FULLBOTTOM" | "ONLYCENTER" | "TOP")
                  }
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
  measureCopy: {
    position: "absolute",
    width: "100%",
    opacity: 0,
    pointerEvents: "none",
  },
  blueScroll: {
    flex: 1,
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
    flexGrow: 0,
  },
  selectorRowContent: {
    gap: 8,
    paddingVertical: 2,
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
  fullBar: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 12,
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
        "TEST: tres secciones iguales sin scroll. BOTTOM: la roja colapsa, la azul pasa a su alto de contenido (y se desvanece al scrollear) y la amarilla muestra la lista. FULLBOTTOM: roja y azul a 0, solo amarilla. ONLYCENTER: roja y amarilla a 0, la azul ocupa toda la pantalla y scrollea a sí misma. La transición entre modos está animada con reanimated.",
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
