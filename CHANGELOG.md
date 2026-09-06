# Antonella

Changelog raíz de Antonella. Agrupa cambios relevantes del monorepo (packages: ui, theme, utils, hooks, animations).

## Unreleased

### @william-callao/antonella-ui

- `CategoryText`: agrega las props opcionales `actionIcon` y `onActionIcon` para mostrar un ícono a la derecha de la acción. `actionIcon` está tipado como `IconName` (mismo patrón que el resto de los componentes del paquete) y `onActionIcon` usa `onAction` como fallback si no se especifica. Incluye un `gap` en la fila y `hitSlop` en el touch del ícono. Iconos disponibles para este caso: `pencil` (edición), `settings` (configuración), `add` (agregar).
