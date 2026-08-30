import React from "react";
import { StyleSheet, View, type ViewProps } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { neutrals } from "@william-callao/antonella-theme";

export type DonutSegment = {
  /** Fracción del anillo (0-1) que ocupa el segmento. */
  value: number;
  color: string;
};

export interface DonutChartProps extends ViewProps {
  size?: number;
  thickness?: number;
  segments: DonutSegment[];
  trackColor?: string;
  startAngle?: number;
  children?: React.ReactNode;
}

export function DonutChart({
  size = 120,
  thickness = 12,
  segments,
  trackColor = neutrals.N100,
  startAngle = -90,
  style,
  children,
  ...rest
}: DonutChartProps) {
  const radius = (size - thickness) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulative = 0;

  return (
    <View style={[styles.container, { width: size, height: size }, style]} {...rest}>
      <Svg width={size} height={size}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={trackColor}
          strokeWidth={thickness}
          fill="none"
        />
        {segments.map((segment, index) => {
          const fraction = Math.min(1, Math.max(0, segment.value));
          const arcLength = fraction * circumference;
          const rotation = startAngle + cumulative * 360;
          cumulative += fraction;
          if (arcLength <= 0) {
            return null;
          }
          return (
            <Circle
              key={index}
              cx={center}
              cy={center}
              r={radius}
              stroke={segment.color}
              strokeWidth={thickness}
              fill="none"
              strokeDasharray={`${arcLength} ${circumference}`}
              rotation={rotation}
              origin={`${center}, ${center}`}
            />
          );
        })}
      </Svg>
      {children ? <View style={styles.center}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
});
