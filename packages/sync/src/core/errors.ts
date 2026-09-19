/**
 * Decide si un error es de red retryable SIN conocer la clase de error del
 * consumidor: el core solo confía en el contrato estructural `{ retryable: true }`
 * (la clase `ApiError` de la app expone `retryable` como campo, así que cualquier
 * error de la app que lleve esa flag pasa la prueba sin importar su clase).
 */
export function isRetryableError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  return (error as { retryable?: unknown }).retryable === true;
}