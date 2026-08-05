export const radius = {
  sm: 8,
  md: 16,
  lg: 20,
} as const;

export type Radius = keyof typeof radius;
