import React from "react";
import { StyleSheet, View } from "react-native";
import { PatternIllustration, SuccessIllustration } from "@william-callao/antonella-ui";
import { space } from "@william-callao/antonella-theme";
import type { ComponentCategory } from "../types";

const ORIGINAL_BACKGROUND = "#3596FF";
const CUSTOM_BACKGROUND = "#1E1B4B";
const SUCCESS_BACKGROUND = "#0B1220";

function PatternCard({
  colors,
  zoom,
  backgroundColor,
  height = 180,
}: {
  colors?: readonly string[];
  zoom?: number;
  backgroundColor: string;
  height?: number;
}) {
  return (
    <View style={[styles.card, { backgroundColor, height }]}>
      <PatternIllustration colors={colors} zoom={zoom} />
    </View>
  );
}

function SuccessCard({
  color,
  ringColor,
  backgroundColor = SUCCESS_BACKGROUND,
  height = 220,
}: {
  color?: string;
  ringColor?: string;
  backgroundColor?: string;
  height?: number;
}) {
  return (
    <View style={[styles.card, { backgroundColor, height }]}>
      <SuccessIllustration color={color} ringColor={ringColor} />
    </View>
  );
}

export const ilustraciones: ComponentCategory = {
  id: "ilustraciones",
  title: "Ilustraciones",
  icon: "palette",
  components: [
    {
      id: "pattern",
      name: "PatternIllustration",
      description:
        "Fondo vectorial de rayos/zigzag. Cubre el contenedor y recorta los bordes, así nunca se ven el inicio ni el fin de las líneas. Colores y zoom configurables por props.",
      variants: [
        {
          id: "default",
          label: "Diseño original",
          render: () => <PatternCard backgroundColor={ORIGINAL_BACKGROUND} />,
        },
        {
          id: "colors",
          label: "Colores personalizados",
          render: () => (
            <PatternCard
              backgroundColor={CUSTOM_BACKGROUND}
              colors={["#818CF8", "#6366F1", "#C7D2FE"]}
            />
          ),
        },
        {
          id: "zoom",
          label: "Zoom de trazos",
          render: () => (
            <PatternCard backgroundColor={ORIGINAL_BACKGROUND} zoom={2.2} />
          ),
        },
        {
          id: "heights",
          label: "Adaptable al alto",
          render: () => (
            <View style={styles.stack}>
              <PatternCard backgroundColor={ORIGINAL_BACKGROUND} height={96} />
              <PatternCard backgroundColor={CUSTOM_BACKGROUND} height={150} />
            </View>
          ),
        },
      ],
    },
    {
      id: "success",
      name: "SuccessIllustration",
      description:
        "Ilustración de estado de éxito: check dentro de un círculo, dos anillos concéntricos y destellos. El check es un hueco (toma el fondo del contenedor) y el color principal/anillos son configurables.",
      variants: [
        {
          id: "default",
          label: "Diseño original",
          render: () => <SuccessCard />,
        },
        {
          id: "color",
          label: "Color personalizado",
          render: () => <SuccessCard color="#818CF8" ringColor="#6366F1" />,
        },
      ],
    },
  ],
};

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
  },
  stack: {
    gap: space.space3,
  },
});
