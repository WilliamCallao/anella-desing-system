import type { StyleProp, ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";

const VIEW_BOX_WIDTH = 651.937;
const VIEW_BOX_HEIGHT = 713.021;
const DEFAULT_STROKE_WIDTH = 79;
const DEFAULT_ZOOM = 1.35;

/**
 * Trazos del patrón extraído del header "Explore Wallet Apps" del UI Kit
 * Telegram Mini Apps (Figma, nodo 284:15284). Son tres subpaths del mismo
 * `path` original; se separan para poder pintar cada uno con un color distinto.
 */
const PATTERN_PATHS = [
  "M89.3125 150.747L66.8527 218.398C66.6378 219.045 67.1197 219.713 67.8018 219.713H106.682C107.447 219.713 107.928 220.537 107.553 221.204L59.6241 306.258C59.2485 306.924 59.7302 307.749 60.4953 307.749H106.939C107.64 307.749 108.124 308.451 107.873 309.106L39.7472 487.058C39.3828 488.009 40.5094 488.833 41.3056 488.196L156.911 395.766C157.664 395.164 158.748 395.87 158.503 396.802L89.3125 659.255",
  "M248.315 102.756L216.439 172.406C216.16 173.016 216.547 173.722 217.211 173.813L242.682 177.324C243.177 177.393 243.545 177.815 243.545 178.315V276.968C243.545 277.6 244.125 278.074 244.744 277.948L363.694 253.806C364.689 253.604 365.317 254.842 364.566 255.525L194.645 410.106C194.14 410.565 194.234 411.384 194.829 411.718L334.511 489.969C335.018 490.252 335.177 490.906 334.857 491.391L248.315 622.706",
  "M491.59 39.5104L444.497 154.975C444.217 155.662 444.756 156.404 445.496 156.35L521.642 150.804C522.107 150.771 522.533 151.062 522.67 151.508L553.687 252.33C553.823 252.772 553.638 253.25 553.239 253.485L404.16 341.511C403.334 341.999 403.602 343.257 404.555 343.366L577.146 363.15C577.947 363.241 578.316 364.195 577.785 364.802L467.914 490.294C467.799 490.425 467.721 490.584 467.686 490.754L430.999 672.204C430.824 673.068 431.773 673.719 432.517 673.245L612.432 558.507",
] as const;

/** Colores del diseño original: fondo `#3596FF` con trazos `#007AFF`. */
export const PATTERN_DEFAULT_COLORS = ["#007AFF"] as const;

export type PatternIllustrationProps = {
  /**
   * Colores de los trazos. Se reparten en ciclo entre los tres subpaths, así
   * que un solo color pinta todo igual (diseño original) y tres pintan cada
   * trazo por separado. El fondo lo aporta el contenedor.
   */
  colors?: readonly string[];
  /** Grosor del trazo en unidades del viewBox. Default 79. */
  strokeWidth?: number;
  /**
   * Acercamiento del patrón. `1` muestra todo el dibujo; valores mayores
   * agrandan los trazos y recortan los bordes. Default 1.35.
   */
  zoom?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Patrón de rayos/zigzag para fondos de hero, como un papel tapiz: escala
 * para cubrir el contenedor (`preserveAspectRatio="slice"`) y recorta los
 * sobrantes, así nunca se ven el comienzo ni el final de las líneas.
 */
export function PatternIllustration({
  colors = PATTERN_DEFAULT_COLORS,
  strokeWidth = DEFAULT_STROKE_WIDTH,
  zoom = DEFAULT_ZOOM,
  style,
}: PatternIllustrationProps) {
  const palette = colors.length > 0 ? colors : PATTERN_DEFAULT_COLORS;
  const safeZoom = zoom > 0 ? zoom : 1;
  const viewWidth = VIEW_BOX_WIDTH / safeZoom;
  const viewHeight = VIEW_BOX_HEIGHT / safeZoom;
  const viewBox = `${(VIEW_BOX_WIDTH - viewWidth) / 2} ${(VIEW_BOX_HEIGHT - viewHeight) / 2} ${viewWidth} ${viewHeight}`;

  return (
    <Svg
      width="100%"
      height="100%"
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid slice"
      style={style}
      pointerEvents="none"
    >
      {PATTERN_PATHS.map((d, index) => (
        <Path
          key={index}
          d={d}
          fill="none"
          stroke={palette[index % palette.length]}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </Svg>
  );
}
