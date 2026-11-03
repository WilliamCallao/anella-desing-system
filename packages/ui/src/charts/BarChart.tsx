import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { TextType } from "@william-callao/antonella-theme";
import { Text } from "../components/text";

const DEFAULT_COLOR = "#032542";
const DEFAULT_MUTED_COLOR = "#EDF0F3";
const DEFAULT_LABEL_COLOR = "#7F7F7F";
const DEFAULT_TOOLTIP_TEXT_COLOR = "#282F39";
const TOOLTIP_SPACE = 48;

export type BarChartDatum = {
  label: string;
  value: number;
};

export type BarChartProps = {
  data: readonly BarChartDatum[];
  /** Alto de la barra más alta. Default 100. */
  height?: number;
  /** Ancho máximo de cada barra. Default 40. */
  barWidth?: number;
  /** Radio de las esquinas superiores. Default 8. */
  radius?: number;
  /** Color de la barra activa. Default `#032542`. */
  color?: string;
  /** Color de las barras inactivas cuando hay una seleccionada. Default `#EDF0F3`. */
  mutedColor?: string;
  /** Color de las etiquetas. Default `#7F7F7F`. */
  labelColor?: string;
  /** Índice seleccionado: resalta esa barra, atenúa el resto y muestra el tooltip. */
  selectedIndex?: number;
  /** Color del tooltip. Default `#FFFFFF`. */
  tooltipColor?: string;
  /** Color del texto del tooltip. Default `#282F39`. */
  tooltipTextColor?: string;
  /** Formatea el valor que se muestra en el tooltip. */
  formatValue?: (value: number, item: BarChartDatum) => string;
  style?: StyleProp<ViewStyle>;
};

/**
 * Gráfico de barras verticales de una serie. Pensado para estadísticas:
 * alturas proporcionales al máximo, etiquetas debajo y, opcionalmente, una
 * barra seleccionada con tooltip. Los colores son configurables.
 */
export function BarChart({
  data,
  height = 100,
  barWidth = 40,
  radius = 8,
  color = DEFAULT_COLOR,
  mutedColor = DEFAULT_MUTED_COLOR,
  labelColor = DEFAULT_LABEL_COLOR,
  selectedIndex,
  tooltipColor = "#FFFFFF",
  tooltipTextColor = DEFAULT_TOOLTIP_TEXT_COLOR,
  formatValue = (value) => String(value),
  style,
}: BarChartProps) {
  if (data.length === 0) return null;

  const hasSelection = selectedIndex != null && selectedIndex >= 0 && selectedIndex < data.length;
  const maxValue = Math.max(...data.map((item) => item.value), 0);
  const plotHeight = height + (hasSelection ? TOOLTIP_SPACE : 0);

  return (
    <View style={style}>
      <View style={[styles.plot, { height: plotHeight }]}>
        {data.map((item, index) => {
          const isSelected = hasSelection && index === selectedIndex;
          const ratio = maxValue > 0 ? item.value / maxValue : 0;
          const barHeight = Math.max(0, ratio * height);
          const barColor = hasSelection && !isSelected ? mutedColor : color;

          return (
            <View key={`${item.label}-${index}`} style={styles.column}>
              <View
                style={[
                  styles.bar,
                  {
                    height: barHeight,
                    width: "100%",
                    maxWidth: barWidth,
                    backgroundColor: barColor,
                    borderTopLeftRadius: radius,
                    borderTopRightRadius: radius,
                  },
                ]}
              />
              {isSelected ? (
                <View style={[styles.tooltipAnchor, { bottom: barHeight + 10 }]}>
                  <View style={[styles.tooltip, { backgroundColor: tooltipColor }]}>
                    <Text
                      variant={TextType.Value}
                      color={tooltipTextColor}
                      style={styles.tooltipText}
                      numberOfLines={1}
                    >
                      {formatValue(item.value, item)}
                    </Text>
                    <View style={[styles.tooltipTail, { backgroundColor: tooltipColor }]} />
                  </View>
                </View>
              ) : null}
            </View>
          );
        })}
      </View>

      <View style={styles.labels}>
        {data.map((item, index) => (
          <View key={`${item.label}-label-${index}`} style={styles.column}>
            <Text
              variant={TextType.Value}
              color={index === selectedIndex ? color : labelColor}
              style={styles.label}
              numberOfLines={1}
            >
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  plot: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  column: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  bar: {
    alignSelf: "center",
  },
  labels: {
    flexDirection: "row",
    marginTop: 10,
  },
  label: {
    textAlign: "center",
  },
  tooltipAnchor: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  tooltip: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 48,
    shadowColor: "#000000",
    shadowOpacity: 0.16,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  tooltipText: {
    textAlign: "center",
    fontWeight: "700",
  },
  tooltipTail: {
    position: "absolute",
    bottom: -3,
    left: "50%",
    marginLeft: -4,
    width: 8,
    height: 8,
    borderRadius: 2,
    transform: [{ rotate: "45deg" }],
  },
});
