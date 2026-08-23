# Antonella Design System

Design system para React Native (Expo). Paquetes: `packages/ui`, `packages/theme`.

## Git Workflow — Subir cambios al repositorio

Seguir este proceso **antes de hacer push o merge**:

1. **Crear issue** en GitHub describiendo el cambio (título + descripción detallada).
2. **Crear rama** siguiendo convencional commits:
   - `feat/` — nuevas funcionalidades
   - `fix/` — corrección de bugs
   - `refactor/` — refactorización sin cambio de comportamiento
   - `chore/` — tareas de mantenimiento, dependencias, configs
   - Ejemplo: `feat/tree-editor-darkness`
3. **Commitear** con mensajes convencionales:
   - `feat(scope): descripción corta`
   - `fix(scope): descripción corta`
   - `refactor(scope): descripción corta`
   - Si hay múltiples cambios relacionados, usar un solo commit descriptivo o commits separados por scope.
4. **Push** la rama al origin.
5. **Abrir PR** hacia `main` con descripción que referencie la issue (`Closes #N`).
6. **Mergear** el PR una vez revisado.

### Reglas
- Nunca commitear directamente a `main`.
- Correr `pnpm typecheck` antes de commitear.
- No incluir archivos sensibles (tokens, credenciales).
