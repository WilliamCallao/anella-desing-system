import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View, type LayoutChangeEvent } from "react-native";
import { neutrals, radius, space, TextType } from "@william-callao/antonella-theme";
import { Text } from "./text/Text";
import { Icon, type IconName } from "./Icon";

// ── Style enum ──────────────────────────────────────────────

export enum TabNavigationStyle {
  DEFAULT = "DEFAULT",
  LIGHT = "LIGHT",
  DARKNESS = "DARKNESS",
}

// ── Types ───────────────────────────────────────────────────

export type TabNavigationOption = {
  value: string;
  label: string;
  icon?: IconName;
};

export type TabNavigationProps = {
  options: TabNavigationOption[];
  selected?: string;
  onSelect?: (value: string) => void;
  style?: TabNavigationStyle;
  /** Margin horizontal del contenedor (si no se pasa, 0). Cuando las opciones
   *  caben (fit) inserta el bar desde los costados del sitio de uso; si se
   *  desbordan (scroll) el bar va a ancho completo y el margen se reparte como
   *  colchones internos del contenido: margen izquierdo en la primera chip y
   *  margen derecho en la última. */
  horizontalMargin?: number;
};

// ── Config ──────────────────────────────────────────────────

const TONES: Record<
  TabNavigationStyle,
  { border: string; fill: string; active: string; inactive: string }
> = {
  [TabNavigationStyle.DEFAULT]: {
    border: neutrals.N200,
    fill: neutrals.N950,
    active: "#FFFFFF",
    inactive: neutrals.N600,
  },
  [TabNavigationStyle.LIGHT]: {
    border: neutrals.N200,
    fill: neutrals.N950,
    active: "#FFFFFF",
    inactive: neutrals.N600,
  },
  [TabNavigationStyle.DARKNESS]: {
    border: neutrals.N800,
    fill: neutrals.N800,
    active: neutrals.N0,
    inactive: neutrals.N400,
  },
};

// ── Component ───────────────────────────────────────────────

type TabMode = "measuring" | "fit" | "scroll";

export function TabNavigation({
  options,
  selected: controlledSelected,
  onSelect,
  style = TabNavigationStyle.DEFAULT,
  horizontalMargin,
}: TabNavigationProps) {
  const selected = controlledSelected ?? options[0]?.value ?? "";
  const tone = TONES[style];

  const [mode, setMode] = useState<TabMode>("measuring");
  const [availableWidth, setAvailableWidth] = useState<number | null>(null);
  const [contentWidth, setContentWidth] = useState<number | null>(null);

  const optionsKey = options.map((opt) => opt.value).join("|");

  // Si cambian las opciones o el ancho disponible, re-medir: las chips vuelven a
  // su tamaño natural para decidir si entran o necesitan scroll.
  useEffect(() => {
    setMode("measuring");
    setContentWidth(null);
  }, [optionsKey, availableWidth]);

  useEffect(() => {
    if (mode === "measuring" && availableWidth != null && contentWidth != null) {
      setMode(contentWidth <= availableWidth ? "fit" : "scroll");
    }
  }, [mode, availableWidth, contentWidth]);

  const fits = mode === "fit";

  const handleContainerLayout = (e: LayoutChangeEvent) => {
    setAvailableWidth(e.nativeEvent.layout.width);
  };

  const handleContentSizeChange = (w: number) => {
    // Solo se mide en modo "measuring" (chips al ancho natural). En modo fit las
    // chips con flex:1 igualan el ancho del viewport y ensuciarían la medición.
    if (mode === "measuring") setContentWidth(w);
  };

  return (
    <View
      style={[
        styles.wrapper,
        // El margen inserta el bar desde los costados solo cuando las opciones
        // caben (fit); al desbordar (scroll) el bar va a ancho completo y los
        // colchones pasan a vivir dentro del contenido (ver contentContainerStyle).
        horizontalMargin != null && fits ? { marginHorizontal: horizontalMargin } : null,
      ]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        onLayout={handleContainerLayout}
        onContentSizeChange={handleContentSizeChange}
        contentContainerStyle={[
          styles.content,
          // En modo fit el contenido llena el ancho disponible (flexGrow) y las
          // chips se reparten el espacio en partes iguales.
          fits ? styles.contentFit : null,
          // En scroll los colchones viven dentro del contenido: la primera chip
          // conserva el margen izquierdo y la última el derecho, y viajan con
          // el desplazamiento (nunca quedan pegadas a un borde del bar).
          !fits && horizontalMargin != null
            ? { paddingHorizontal: horizontalMargin }
            : null,
        ]}
      >
        {options.map((opt) => {
          const active = opt.value === selected;
          const color = active ? tone.active : tone.inactive;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onSelect?.(opt.value)}
              style={({ pressed }) => [
                styles.chip,
                // Cada chip lleva su propio borde: al desbordar, el borde viaja
                // con el scroll (no hay marco exterior fijo). Solo la tab
                // seleccionada lleva fondo (relleno).
                { borderColor: tone.border, backgroundColor: active ? tone.fill : "transparent" },
                // Solo se distribuye el espacio cuando las opciones entran; si
                // hacen falta scroll, quedan a su ancho natural.
                fits ? styles.chipFilled : null,
                pressed && styles.chipPressed,
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              {opt.icon ? <Icon name={opt.icon} size={16} color={color} /> : null}
              <Text variant={TextType.Caption} color={color} numberOfLines={1}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    // Sin marco exterior: el borde pertenece a cada chip y se desplaza con el
    // contenido al hacer scroll.
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.space1,
    // flexGrow hace que el contenido llene el viewport cuando las opciones
    // entran (requisito para repartir con flex:1). Cuando desbordan, el scroll
    // usa el ancho natural del contenido.
    flexGrow: 1,
  },
  contentFit: {
    flexGrow: 1,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: space.space1,
    paddingHorizontal: space.space4,
    paddingVertical: space.space2,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  chipFilled: {
    flex: 1,
  },
  chipPressed: {
    opacity: 0.7,
  },
});