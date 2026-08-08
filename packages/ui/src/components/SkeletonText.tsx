import React from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { Skeleton } from "./Skeleton";

export interface SkeletonTextProps {
  /** Ancho de la línea: número (px) o string (ej. "100%", "60%"). */
  width?: number | string;
  /** Alto de la línea en px (default 14, imita un `Caption`/`Body`). */
  height?: number;
  style?: StyleProp<ViewStyle>;
}

export function SkeletonText({
  width = "100%",
  height = 14,
  style,
}: SkeletonTextProps) {
  return (
    <Skeleton
      width={width}
      height={height}
      borderRadius={height / 2}
      style={style}
    />
  );
}
