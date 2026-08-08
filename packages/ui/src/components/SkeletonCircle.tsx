import React from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { Skeleton } from "./Skeleton";

export interface SkeletonCircleProps {
  /** Diámetro del círculo en px (default 32, imita iconos/avatares). */
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export function SkeletonCircle({ size = 32, style }: SkeletonCircleProps) {
  return (
    <Skeleton width={size} height={size} shape="circle" style={style} />
  );
}
