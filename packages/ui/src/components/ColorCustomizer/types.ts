export type ColorToken = {
  /** Nombre legible del token (ej: "Fondo panel") */
  name: string;
  /** Token key interno (ej: "panelBg") */
  key: string;
  /** Valor hex actual (ej: "#020617") */
  value: string;
  /** Nombre del token de paleta si coincide (ej: "N950", "M600") */
  tokenName?: string;
};
