import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View, type LayoutChangeEvent } from "react-native";
import { space } from "@william-callao/antonella-theme";
import { Label, LabelStyle } from "./Label";
import type { IconName } from "./Icon";

// ── Style enum ──────────────────────────────────────────────

export enum TabNavigationStyle {
  DEFAULT = "DEFAULT",
  LIGHT = "LIGHT",
  DARKNESS = "DARKNESS",
}

const STYLE_LABEL: Record<TabNavigationStyle, LabelStyle> = {
  [TabNavigationStyle.DEFAULT]: LabelStyle.DEFAULT,
  [TabNavigationStyle.LIGHT]: LabelStyle.LIGHT,
  [TabNavigationStyle.DARKNESS]: LabelStyle.DARKNESS,
};

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
  /** Fuerza el modo de reparto sin medir. `true` reparte el espacio en partes
   *  iguales siempre (equivalente al modo fit, útil cuando se sabe que las
   *  opciones son pocas y deben llenar el ancho); `false` fuerza scroll
   *  horizontal con las chips a ancho natural. Si no se pasa, el componente
   *  mide el ancho natural de las chips y decide solo: fit si entran, scroll si
   *  se desbordan. */
  fits?: boolean;
  /** Margin horizontal del contenedor (si no se pasa, 0). Cuando las opciones
   *  caben (fit) inserta el bar desde los costados del sitio de uso; si se
   *  desbordan (scroll) el bar va a ancho completo y el margen se reparte como
   *  colchones internos del contenido: margen izquierdo en la primera chip y
   *  margen derecho en la última. */
  horizontalMargin?: number;
};

// ── Config ──────────────────────────────────────────────────

// ── Component ───────────────────────────────────────────────

type TabMode = "fit" | "scroll";

export function TabNavigation({
  options,
  selected: controlledSelected,
  onSelect,
  style = TabNavigationStyle.DEFAULT,
  fits,
  horizontalMargin,
}: TabNavigationProps) {
  const selected = controlledSelected ?? options[0]?.value ?? "";
  const labelStyle = STYLE_LABEL[style];

  const [mode, setMode] = useState<TabMode | null>(null);
  const [availableWidth, setAvailableWidth] = useState<number | null>(null);
  const [contentWidth, setContentWidth] = useState<number | null>(null);

  const optionsKey = options.map((opt) => opt.value).join("|");

  // Con `fits` fijado, el modo no se mide: se usa el valor dado directamente.
  const measure = fits == null;
  const resolvedMode = measure ? mode : fits ? "fit" : "scroll";
  const fitMode = resolvedMode === "fit";

  // Si cambian las opciones, re-medir el contenido: vuelve a leerse el ancho
  // natural de las chips para decidir si entran o necesitan scroll.
  useEffect(() => {
    if (!measure) return;
    setMode(null);
    setContentWidth(null);
  }, [optionsKey, measure]);

  // Si cambia el ancho disponible (rotación, layout), re-decidir sin descartar
  // el ancho natural ya medido (no depende del viewport).
  useEffect(() => {
    if (!measure) return;
    setMode(null);
  }, [availableWidth, measure]);

  useEffect(() => {
    if (!measure) return;
    if (mode == null && availableWidth != null && contentWidth != null) {
      setMode(contentWidth <= availableWidth ? "fit" : "scroll");
    }
  }, [mode, availableWidth, contentWidth, measure]);

  // El ancho disponible se mide en el wrapper exterior (constante): el margen de
  // fit (marginHorizontal) se aplica sobre el propio wrapper, así que nunca
  // cambia el ancho medido y no hay bucle de re-medición fit→measuring→…
  const handleWrapperLayout = (e: LayoutChangeEvent) => {
    setAvailableWidth(e.nativeEvent.layout.width);
  };

  // El ancho natural del contenido se mide en una capa invisible y quieta
  // (positions offscreen), no en el ScrollView visible: mientras se decide el
  // modo el bar aún no se renderiza, por lo que no hay salto visible entre
  // "ancho natural" (scroll) y "repartido" (fit).
  const handleMeasuredWidth = (e: LayoutChangeEvent) => {
    if (mode == null) setContentWidth(e.nativeEvent.layout.width);
  };

  const renderChip = (opt: TabNavigationOption, distribute: boolean) => {
    const active = opt.value === selected;
    return (
      <Label
        key={opt.value}
        label={opt.label}
        icon={opt.icon}
        selected={active}
        onPress={() => onSelect?.(opt.value)}
        style={labelStyle}
        // Solo se distribuye el espacio en el modo fit; en scroll quedan a su
        // ancho natural.
        containerStyle={distribute && fitMode ? styles.chipFilled : undefined}
      />
    );
  };

  return (
    <View
      style={[
        styles.wrapper,
        // El margen inserta el bar desde los costados solo cuando las opciones
        // caben (fit); al desbordar (scroll) el bar va a ancho completo y los
        // colchones pasan a vivir dentro del contenido (ver contentContainerStyle).
        horizontalMargin != null && fitMode ? { marginHorizontal: horizontalMargin } : null,
      ]}
      onLayout={measure ? handleWrapperLayout : undefined}
    >
      {/* Capa de medición invisible: chips a ancho natural, fuera de pantalla.
          Decide fit vs. scroll sin destellar el cambio de modo en el bar visible.
          Solo se monta cuando el modo se mide (sin prop `fits`). */}
      {measure ? (
        <View
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={styles.measurer}
          onLayout={handleMeasuredWidth}
        >
          {options.map((opt) => renderChip(opt, false))}
        </View>
      ) : null}

      {resolvedMode != null ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            // En modo fit el contenido llena el ancho disponible (flexGrow) y las
            // chips se reparten el espacio en partes iguales.
            fitMode ? styles.contentFit : null,
            // En scroll los colchones viven dentro del contenido: la primera chip
            // conserva el margen izquierdo y la última el derecho, y viajan con
            // el desplazamiento (nunca quedan pegadas a un borde del bar).
            !fitMode && horizontalMargin != null
              ? { paddingHorizontal: horizontalMargin }
              : null,
          ]}
        >
          {options.map((opt) => renderChip(opt, true))}
        </ScrollView>
      ) : null}
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    // Sin marco exterior: el borde pertenece a cada chip y se desplaza con el
    // contenido al hacer scroll.
  },
  measurer: {
    // Capa invisible (offscreen y opacity 0) para medir el ancho natural de las
    // chips sin que el modo intermedio se renderice en pantalla.
    position: "absolute",
    left: -9999,
    top: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: space.space1,
    opacity: 0,
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
  chipFilled: {
    flex: 1,
  },
});