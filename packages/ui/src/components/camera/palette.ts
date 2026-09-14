import { brand, danger, neutrals } from "@william-callao/antonella-theme";

// Paleta oscura dedicada a las escenas de cámara (preview inmersivo oscuro).
// Derivada de la paleta base del tema para no introducir colores sueltos.
export const cameraPalette = {
  background: neutrals.N950,
  surface: neutrals.N900,
  /** Dim del área fuera del viewfinder del scanner. */
  overlay: "rgba(7, 12, 22, 0.66)",
  /** Interior sutil del viewfinder. */
  boxFill: "rgba(255, 255, 255, 0.04)",
  hairline: "rgba(255, 255, 255, 0.14)",
  text: neutrals.N0,
  textSubtle: neutrals.N400,
  textFaint: neutrals.N600,
  accent: brand.M300,
  accentStrong: brand.M200,
  danger: danger.D400,
  scanLine: brand.M300,
} as const;