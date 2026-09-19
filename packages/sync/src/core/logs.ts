/**
 * Destino de log mínimo que el core usa (opcional y NO obligatorio): si el
 * consumidor quiere observabilidad, inyecta un sink con los métodos que use;
 * sin él, el core no loguea nada (no depende de logwood ni de Firebase).
 */
export interface LogSink {
  debug?(message: string, meta?: Record<string, unknown>): void;
  info?(message: string, meta?: Record<string, unknown>): void;
  warn?(message: string, meta?: Record<string, unknown>): void;
  error?(message: string, meta?: Record<string, unknown>): void;
}

export const noopLogSink: LogSink = {};