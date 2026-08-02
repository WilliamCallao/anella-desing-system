export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const space = {
  space1: 4,
  space2: 8,
  space3: 12,
  space4: 16,
  space5: 20,
  space6: 24,
  space7: 28,
  space8: 32,
  space9: 36,
  space10: 40,
  space12: 48,
  space16: 64,
  space20: 80,
  space24: 96,
  space32: 128,
} as const;

export type Spacing = keyof typeof spacing;
export type Space = keyof typeof space;
