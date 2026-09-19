/**
 * Coerciones del shape wire (protojson crudo, EmitUnpopulated) al formato que
 * consumen los mappers de los repos locales. El gateway puede entregar los
 * booleanos como `true`/`false` Y como `1`/`0` según el batch, y los números
 * vienen o ya numéricos o como string; estos helpers normalizan sin fallar.
 */

export function coerceBool(v: unknown): boolean {
  return v === true || v === 1;
}

export function coerceNumber(v: unknown): number {
  return typeof v === "number" ? v : Number(v ?? 0);
}