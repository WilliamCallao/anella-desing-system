import type { StyleProp, ViewStyle } from "react-native";
import Svg, { Circle, G, Path, Rect } from "react-native-svg";
import {
  STREAMLINE_ICONS,
  type StreamlineIconLayer,
  type StreamlineIconName,
  type StreamlineIconShape,
} from "./streamlineIcons";

const PRIMARY_COLOR = "#2859C5";
const SECONDARY_COLORS = new Set(["#8FBFFA", "#3B82F6", "#B2D3FB", "#EFF6FF"]);

export const STREAMLINE_DEFAULT_COLOR = PRIMARY_COLOR;
export const STREAMLINE_DEFAULT_SECONDARY_COLOR = "#8FBFFA";

export type StreamlineIconProps = {
  name: StreamlineIconName;
  /** Lado del ícono en px. Default 24. */
  size?: number;
  /** Color primario (reemplaza `#2859C5`). Default `#2859C5`. */
  color?: string;
  /** Color secundario (reemplaza los azules claros). Default `#8FBFFA`. */
  secondaryColor?: string;
  style?: StyleProp<ViewStyle>;
};

function resolveColor(fill: string | undefined, color: string, secondaryColor: string) {
  if (!fill || fill === "none") return fill;
  const upper = fill.toUpperCase();
  if (upper === PRIMARY_COLOR) return color;
  if (SECONDARY_COLORS.has(upper)) return secondaryColor;
  return fill;
}

function renderShape(
  shape: StreamlineIconShape,
  index: number,
  color: string,
  secondaryColor: string
) {
  if (shape.kind === "path") {
    return (
      <Path
        key={index}
        d={shape.d}
        fill={resolveColor(shape.fill, color, secondaryColor)}
        fillRule={shape.fillRule === "evenodd" ? "evenodd" : "nonzero"}
        stroke={resolveColor(shape.stroke, color, secondaryColor)}
        strokeWidth={shape.strokeWidth}
        strokeLinecap={shape.strokeLinecap as "butt" | "round" | "square" | undefined}
        strokeLinejoin={shape.strokeLinejoin as "miter" | "round" | "bevel" | undefined}
      />
    );
  }
  if (shape.kind === "rect") {
    return (
      <Rect
        key={index}
        x={shape.x}
        y={shape.y}
        width={shape.width}
        height={shape.height}
        rx={shape.rx}
        fill={resolveColor(shape.fill, color, secondaryColor)}
        transform={shape.transform}
      />
    );
  }
  return (
    <Circle
      key={index}
      cx={shape.cx}
      cy={shape.cy}
      r={shape.r}
      fill={resolveColor(shape.fill, color, secondaryColor)}
      transform={shape.transform}
    />
  );
}

function layerTransform(layer: StreamlineIconLayer) {
  const scaleX = layer.width / layer.viewWidth;
  const scaleY = layer.height / layer.viewHeight;
  const rotate = layer.rotation ?? 0;
  const centerX = layer.x + layer.width / 2;
  const centerY = layer.y + layer.height / 2;
  const base = `translate(${layer.x} ${layer.y}) scale(${scaleX} ${scaleY})`;
  return rotate ? `rotate(${rotate} ${centerX} ${centerY}) ${base}` : base;
}

/**
 * Íconos vectoriales del set Streamline (Ghost Crypto Wallet UI Kit).
 * Dos tonos configurables: `color` y `secondaryColor`.
 */
export function StreamlineIcon({
  name,
  size = 24,
  color = STREAMLINE_DEFAULT_COLOR,
  secondaryColor = STREAMLINE_DEFAULT_SECONDARY_COLOR,
  style,
}: StreamlineIconProps) {
  const icon = STREAMLINE_ICONS[name];
  if (!icon) return null;

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={style} pointerEvents="none">
      {icon.layers.map((layer, layerIndex) => (
        <G key={layerIndex} transform={layerTransform(layer)}>
          {layer.shapes.map((shape, shapeIndex) =>
            renderShape(shape, shapeIndex, color, secondaryColor)
          )}
        </G>
      ))}
    </Svg>
  );
}
