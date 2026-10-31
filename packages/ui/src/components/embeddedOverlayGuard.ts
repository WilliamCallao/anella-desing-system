let lockedCount = 0;

/**
 * Bloquea el backdrop del host modal `embedded` mientras haya un diálogo que
 * exige cierre explícito. El host no conoce `dismissible`; consulta este flag
 * antes de cerrarse por un tap afuera.
 */
export function lockEmbeddedOverlay(): () => void {
  lockedCount += 1;
  return () => {
    lockedCount = Math.max(0, lockedCount - 1);
  };
}

export function isEmbeddedOverlayLocked(): boolean {
  return lockedCount > 0;
}
