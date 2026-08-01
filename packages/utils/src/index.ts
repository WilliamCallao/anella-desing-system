export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}

export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export function noop(): void {}

export function isWeb(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}
