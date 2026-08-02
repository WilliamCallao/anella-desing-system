import type { neutrals, brand, success, warning, danger } from "./basePalette";

export type NeutralKeys = keyof typeof neutrals;
export type BrandKeys = keyof typeof brand;
export type SuccessKeys = keyof typeof success;
export type WarningKeys = keyof typeof warning;
export type DangerKeys = keyof typeof danger;

export type TextColors = {
  heading: string;
  body: string;
  caption: string;
  brand: string;
  subtle: string;
  subtlest: string;
  disabled: string;
  success: string;
  successMid: string;
  successContrast: string;
  warning: string;
  warningMid: string;
  warningContrast: string;
  danger: string;
  dangerContrast: string;
  linkDefault: string;
  linkHover: string;
  linkPressed: string;
  negative: string;
};

export type IconColors = {
  default: string;
  brand: string;
  subtle: string;
  subtlest: string;
  disabled: string;
  success: string;
  successMid: string;
  successContrast: string;
  warning: string;
  warningMid: string;
  warningContrast: string;
  danger: string;
  dangerContrast: string;
  linkDefault: string;
  linkHover: string;
  linkPressed: string;
  negative: string;
};

export type BorderColors = {
  default: string;
  subtle: string;
  subtlest: string;
  light: string;
  lightest: string;
  brand: string;
  brandLight: string;
  brandLighter: string;
  brandContrast: string;
  focus: string;
  error: string;
  success: string;
  warning: string;
  danger: string;
};

export type SurfaceColors = {
  pageDefault: string;
  pageSubtlest: string;
  pageSubtle: string;
  card: string;
  cardBorder: string;
  brand: string;
  brandSubtle: string;
  brandSubtler: string;
  brandSubtlest: string;
  success: string;
  successSubtle: string;
  warning: string;
  warningSubtle: string;
  danger: string;
  dangerSubtle: string;
  overlay: string;
  modal: string;
};

export type SidebarColors = {
  background: string;
  hover: string;
  activeBackground: string;
  activeText: string;
  text: string;
  sectionTitle: string;
  title: string;
};

export type ButtonColors = {
  primaryBg: string;
  primaryText: string;
  primaryHover: string;
  primaryPressed: string;
  primaryDisabled: string;
  secondaryBg: string;
  secondaryText: string;
  secondaryBorder: string;
  secondaryHover: string;
  ghostText: string;
  ghostHover: string;
  dangerBg: string;
  dangerText: string;
};

export type InputColors = {
  bg: string;
  border: string;
  borderActive: string;
  borderError: string;
  text: string;
  placeholder: string;
  disabled: string;
};

export type BadgeColors = {
  bg: string;
  text: string;
};

export type SkeletonColors = {
  default: string;
};

export type ComponentColors = {
  sidebar: SidebarColors;
  button: ButtonColors;
  input: InputColors;
  badge: BadgeColors;
  skeleton: SkeletonColors;
};

export type SemanticColors = {
  text: TextColors;
  icon: IconColors;
  border: BorderColors;
  surface: SurfaceColors;
  components: ComponentColors;
};
