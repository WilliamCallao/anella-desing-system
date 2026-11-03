import React from "react";
import { StyleSheet, View } from "react-native";
import { BarChart, DonutChart, Text, type BarChartDatum } from "@william-callao/antonella-ui";
import { space, TextType } from "@william-callao/antonella-theme";
import type { ComponentCategory } from "../types";

const WEEKLY: BarChartDatum[] = [
  { label: "M", value: 86 },
  { label: "T", value: 58 },
  { label: "W", value: 75 },
  { label: "T", value: 37 },
  { label: "F", value: 81 },
  { label: "S", value: 58 },
  { label: "S", value: 100 },
];

function ChartCard({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

const money = (value: number) => `$${value.toFixed(2)}`;

export const graficos: ComponentCategory = {
  id: "graficos",
  title: "Gráficos",
  icon: "bar-chart",
  components: [
    {
      id: "bar-chart",
      name: "BarChart",
      description:
        "Gráfico de barras verticales de una serie. Alturas proporcionales al máximo, etiquetas debajo y selección opcional con tooltip. Colores configurables.",
      variants: [
        {
          id: "weekly",
          label: "Serie semanal",
          render: () => (
            <ChartCard>
              <BarChart data={WEEKLY} />
            </ChartCard>
          ),
        },
        {
          id: "selected",
          label: "Con selección y tooltip",
          render: () => (
            <ChartCard>
              <BarChart data={WEEKLY} selectedIndex={1} formatValue={money} />
            </ChartCard>
          ),
        },
        {
          id: "custom",
          label: "Colores personalizados",
          render: () => (
            <ChartCard>
              <BarChart
                data={WEEKLY}
                selectedIndex={6}
                color="#6366F1"
                mutedColor="#E0E7FF"
                labelColor="#4B5563"
                formatValue={money}
              />
            </ChartCard>
          ),
        },
      ],
    },
    {
      id: "donut",
      name: "DonutChart",
      description:
        "Gráfico de dona con pista de fondo, uno o varios segmentos y contenido central (children). Tamaño, grosor y colores configurables.",
      variants: [
        {
          id: "progress",
          label: "Progreso",
          render: () => (
            <ChartCard>
              <View style={styles.center}>
                <DonutChart
                  size={129}
                  thickness={14.5}
                  trackColor="#DADEE3"
                  segments={[{ value: 0.3, color: "#032542" }]}
                >
                  <Text variant={TextType.BodyBold} color="#282F39">
                    2547
                  </Text>
                  <Text variant={TextType.Value} color="#7F7F7F">
                    Total Trips
                  </Text>
                </DonutChart>
              </View>
            </ChartCard>
          ),
        },
        {
          id: "segments",
          label: "Varios segmentos",
          render: () => (
            <ChartCard>
              <View style={styles.center}>
                <DonutChart
                  size={129}
                  thickness={14.5}
                  segments={[
                    { value: 0.45, color: "#032542" },
                    { value: 0.3, color: "#FCD223" },
                    { value: 0.25, color: "#DADEE3" },
                  ]}
                >
                  <Text variant={TextType.BodyBold} color="#282F39">
                    100%
                  </Text>
                </DonutChart>
              </View>
            </ChartCard>
          ),
        },
      ],
    },
  ],
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: space.space4,
  },
  center: {
    alignItems: "center",
  },
});
