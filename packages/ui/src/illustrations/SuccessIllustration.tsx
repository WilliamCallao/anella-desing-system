import type { StyleProp, ViewStyle } from "react-native";
import Svg, { Circle, G, Path } from "react-native-svg";

const VIEW_BOX_WIDTH = 375;
const VIEW_BOX_HEIGHT = 251;

const CENTER_X = 187.5;
const CENTER_Y = 124;
const OUTER_RADIUS = 116;
const INNER_RADIUS = 84;
const CHECK_RADIUS = 60;

/**
 * Círculo con el check calado. El marcador (`Z`) deja el check como hueco,
 * así toma el color del fondo del contenedor.
 * Extraído del nodo `circle-check-filled` (Figma 2501:63967).
 */
const CHECK_PATH =
  "M85 16.7C92.5413 21.0543 98.8147 27.3026 103.199 34.8265C107.583 42.3504 109.927 50.8889 109.997 59.5967C110.067 68.3045 107.862 76.8798 103.6 84.4735C99.3378 92.0672 93.1662 98.4161 85.6962 102.892C78.2262 107.367 69.7168 109.814 61.0105 109.99C52.3042 110.167 43.7027 108.066 36.0578 103.896C28.4128 99.7266 21.9894 93.6326 17.4233 86.2176C12.8573 78.8025 10.307 70.3236 10.025 61.62L10 60L10.025 58.38C10.305 49.7449 12.8177 41.3298 17.3182 33.955C21.8187 26.5801 28.1533 20.4973 35.7045 16.2994C43.2557 12.1016 51.7657 9.93198 60.405 10.0022C69.0443 10.0724 77.518 12.38 85 16.7ZM78.535 46.465C77.674 45.6041 76.5285 45.087 75.3134 45.0106C74.0983 44.9342 72.897 45.3037 71.935 46.05L71.465 46.465L55 62.925L48.535 56.465L48.065 56.05C47.1029 55.3043 45.9019 54.9351 44.687 55.0118C43.4722 55.0884 42.327 55.6056 41.4663 56.4663C40.6056 57.327 40.0884 58.4722 40.0118 59.687C39.9351 60.9019 40.3043 62.1029 41.05 63.065L41.465 63.535L51.465 73.535L51.935 73.95C52.8119 74.6303 53.8902 74.9996 55 74.9996C56.1098 74.9996 57.1881 74.6303 58.065 73.95L58.535 73.535L78.535 53.535L78.95 53.065C79.6963 52.103 80.0658 50.9017 79.9894 49.6866C79.913 48.4715 79.3959 47.326 78.535 46.465Z";

const STAR_PATH =
  "M7.02655 0.799747C7.2445 -0.266583 8.76809 -0.266582 8.98604 0.799748L9.91048 5.32262C9.99071 5.71514 10.2975 6.02188 10.69 6.10211L15.2128 7.02655C16.2792 7.2445 16.2792 8.76809 15.2128 8.98604L10.69 9.91048C10.2975 9.99071 9.9907 10.2975 9.91048 10.69L8.98604 15.2128C8.76809 16.2792 7.2445 16.2792 7.02655 15.2128L6.10211 10.69C6.02188 10.2975 5.71514 9.9907 5.32262 9.91048L0.799747 8.98604C-0.266583 8.76809 -0.266582 7.2445 0.799748 7.02655L5.32262 6.10211C5.71514 6.02188 6.02188 5.71514 6.10211 5.32262L7.02655 0.799747Z";
const STAR_UNIT = 16.0126;

type Star = {
  x: number;
  y: number;
  size: number;
  opacity: number;
};

const STARS: Star[] = [
  { x: 81, y: 76, size: 24.0126, opacity: 1 },
  { x: 302, y: 154, size: 16.0126, opacity: 1 },
  { x: 99, y: 186, size: 12.0126, opacity: 0.2 },
  { x: 281, y: 68, size: 12.0126, opacity: 0.2 },
];

/** Color principal (círculo, estrellas) del diseño original. */
export const SUCCESS_DEFAULT_COLOR = "#07CABC";
/** Color base de los anillos; se pintan con opacidades 0.2 y 0.4. */
export const SUCCESS_DEFAULT_RING_COLOR = "#05857E";

export type SuccessIllustrationProps = {
  /** Color del círculo principal y de las estrellas. Default `#07CABC`. */
  color?: string;
  /** Color base de los anillos concéntricos. Default `#05857E`. */
  ringColor?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * Ilustración de estado de éxito: check dentro de un círculo, dos anillos
 * concéntricos y destellos. El check es un hueco, así toma el color del fondo
 * del contenedor. Escala manteniendo proporción (`meet`).
 */
export function SuccessIllustration({
  color = SUCCESS_DEFAULT_COLOR,
  ringColor = SUCCESS_DEFAULT_RING_COLOR,
  style,
}: SuccessIllustrationProps) {
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${VIEW_BOX_WIDTH} ${VIEW_BOX_HEIGHT}`}
      preserveAspectRatio="xMidYMid meet"
      style={style}
      pointerEvents="none"
    >
      <Circle
        cx={CENTER_X}
        cy={CENTER_Y}
        r={OUTER_RADIUS}
        stroke={ringColor}
        strokeOpacity={0.2}
        strokeWidth={1}
        fill="none"
      />
      <Circle
        cx={CENTER_X}
        cy={CENTER_Y}
        r={INNER_RADIUS}
        stroke={ringColor}
        strokeOpacity={0.4}
        strokeWidth={1}
        fill="none"
      />
      <G transform={`translate(${CENTER_X - CHECK_RADIUS} ${CENTER_Y - CHECK_RADIUS})`}>
        <Path d={CHECK_PATH} fill={color} />
      </G>
      {STARS.map((star, index) => {
        const scale = star.size / STAR_UNIT;
        return (
          <G
            key={index}
            transform={`translate(${star.x - star.size / 2} ${star.y - star.size / 2}) scale(${scale})`}
            opacity={star.opacity}
          >
            <Path d={STAR_PATH} fill={color} />
          </G>
        );
      })}
    </Svg>
  );
}
