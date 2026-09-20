# Estándares actuales

## Alto estándar de acciones: 52

Toda superficie accionable (búsqueda, botones de acción, chips de row) apunta a un alto de **52** en condiciones normales.

### No es un alto fijo

**No** se define `height: 52`. Un alto fijo se rompe en pantallas con escala de fuente mayor (Dynamic Type / fontScale) o con contenidos más altos.

El patrón es **derivado**:

1. Dimensionar los **elementos internos** según su contenido natural (icono + `lineHeight` del texto).
2. Aplicar **paddings de `space`** para el aire interno.
3. Sobre esa caja se declara **`minHeight`** (mínimo, nunca fijo): en condiciones normales la superficie mide exactamente `52`, y si el contenido crece, la superficie crece con él sin recortarse.

### Composición que da 52

- Contenido interno: icono + `lineHeight` del texto (ej. 20px).
- `paddingVertical: space.space2` (8).
- `minHeight: 52` (no existe token de `space` para 52; se usa el literal).

En condiciones normales el contenido interno (20) + paddings (16) queda por debajo del mínimo y la superficie se asienta en **52**. Con fuente más grande, el contenido supera el mínimo y la superficie crece de forma natural.

### Texto interno preferente

En superficies con el alto estándar (52), el texto interno se pasa preferentemente en **`fontSize: 14` / `lineHeight: 18` con `fontWeight: "500"`** (peso medium, como `captionMedium`). Evita `fontWeight` más pesados o tamaños mayores en este contexto: rompen el aire del estándar.

### Componentes alineados

| Componente                                    | Superficie accionable                     | Regla                                |
| --------------------------------------------- | ----------------------------------------- | ------------------------------------ |
| `SearchBar.row`                               | `minHeight: 52`                           | mín + paddings de `space`            |
| `TopAction` botón redondo (menú)               | `BUTTON_SIZE: 52` (matchea el SearchBar)  | retícula compartida del header       |
| `ChipTabs` item (`Item.row`)                  | `minHeight: 52`                           | interno (icon 28) + `space3` (24) = 52 |