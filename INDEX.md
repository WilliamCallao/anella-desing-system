# Índice de componentes — Antonella

Índice rápido de lo que aporta cada componente/export del monorepo, con su función en una oración. Guía de integración y estructura en [README.md](README.md).

## @antonella/ui — Componentes

### Básicos
- **Button** — Botón de acción principal con tamaños y estado deshabilitado.
- **Input** — Campo de texto con icono opcional (extiende `TextInputProps`).
- **Text** — Texto con variantes tipográficas (`Title`, `Heading`, `Body`, `Caption`, `Overline`, …) y color por token.
- **Icon** — Renderiza un icono de la librería por nombre (ver `AppIcons`).
- **AppIcons** — Catálogo de nombres de iconos disponibles.
- **Card** — Contenedor de tarjeta con estilo del tema.
- **CardTitle** — Título + subtítulo para encabezar una tarjeta.
- **Chip** — Etiqueta pequeña con variantes `subtle` / `solid` / `outlined`, tamaño `sm`/`md` e icono opcional.
- **AppFilterChips** — Fila de chips de filtro con selección única (opcionalmente controlada).
- **ToolsCard** — Tarjeta con una fila de herramientas/acciones separadas por divisores verticales.

### Diálogos y modales
- **AppResponsiveDialog** — Diálogo responsivo: en tablet (`width >= 600`) muestra `Modal`, en celular `BottomSheet`; maneja el teclado solo.
- **Modal** — Modal centrado (para tablet) con header, scroll y teclado seguro (se achica y se levanta con el teclado).
- **BottomSheet** — Sheet desde abajo (para celular) con handle, snap points y teclado seguro.
- **DialogHeader** — Header reutilizable de diálogo: icono, título, caption y botón de cerrar.
- **useModalKeyboardHeight** — Hook que devuelve la altura del teclado como shared value de Reanimated (negativa con teclado visible; en web mide el `visualViewport`).

### Layout
- **KeyboardSafeScreen** — Pantalla scrollable que empuja el contenido con la altura del teclado para que nunca quede detrás (usa el mismo mecanismo que Modal/BottomSheet).
- **LayoutRow** — Fila responsiva (horizontal en ancho ≥ 600, vertical en menor) con hijos `First`/`Second` que pueden expandirse o scrollear.
- **LayoutColumn** — Columna con hijos `First`/`Second` expandibles o con scroll.
- **FloatingActionButton** — Botón de acción flotante (FAB) fijo abajo a la derecha.

### Datos y formularios
- **Calendar** — Calendario mensual estático que resalta el día actual.
- **DonutChart** — Gráfico de dona (SVG) con segmentos por fracción y contenido centrado opcional.
- **Dropdown** — Selector desplegable con menú flotante posicionado junto al trigger (abre arriba o abajo según espacio).
- **PinKeypad** — Teclado numérico de PIN con puntos de progreso, borrar y `onComplete`.
- **AppCheckItem** — Fila de checklist con estado `pending`/`ok`/`not-ok`, opciones de marcado, comentario y acceso a mensajes.
- **Skeleton / SkeletonText / SkeletonCircle / SkeletonCard** — Placeholders de carga (línea, círculo, tarjeta).

### card-form (formularios con label)
- **AppFormCard** — Tarjeta contenedora de un formulario con filas separadas por divisores.
- **AppInput** — Tipos base (`label`, `labelWidth`) que comparten los campos de formulario.
- **AppTextInput** — Campo de texto con label dentro de `AppFormCard`.
- **AppTextArea** — Área de texto con label dentro de `AppFormCard`.
- **AppSelector** — Selector expandible con animación dentro de `AppFormCard`.
- **AppButton** — Botón de formulario con variantes `solid` / `outline` / `ghost`.

### text
- **AppTextHeader** — Encabezado simple: heading + caption.
- **EmptyState** — Estado vacío centrado con icono, título y caption.

### DashboardShell
- **DashboardShell** — Shell de dashboard con sidebar (responsive: sidebar completa en tablet, drawer en celular), topbar, marca, logout y tokens de tema.
- **Sidebar / MobileDrawer / MobileHeader** — Piezas internas del shell (no consumir directamente).

## @antonella/theme — Design tokens
- **Paleta base** (`basePalette`, `colors`) — Colores crudos de la marca.
- **Semánticos** (`semanticColors`) — Mapeo de colores por rol (surface, text, cta, danger, success, appInput…).
- **Dark/Light** (`themes`) — Temas claro y oscuro.
- **resolveColors / resolveSemanticColors / resolveShellTokens** — Resuelven el conjunto de tokens según el modo.
- **spacing** — Escala `space.*` de espaciado.
- **texts** — Variantes `TextType` y estilos de tipografía.
- **radius** — Radios de borde.
- **layout** — Enums `LayoutRowSize` / `LayoutColumnSize`.
- **shellTokens** — Tokens de medidas/colores del `DashboardShell`.

## @antonella/animations — Animaciones de Reanimated
- **AutoHeight** — Envuelve contenido de altura variable y anima su altura cuando cambia (crece/encoge) para que lo de arriba/abajo no salte.
- **entering / exiting** — Presets de animaciones de entrada/salida (`fade`, `fadeInDown`, `slideRight`, `zoom`, …).
- **staggeredFadeInDown** — Helper para animar listas en cascada (retardo incremental).

## @antonella/hooks — Hooks compartidos
- **useDebouncedValue** — Devuelve el valor con retardo de debounce.
- **usePrevious** — Devuelve el valor de render previo.

## @antonella/utils — Utilidades puras
- **cn** — Une clases condicionales (filtra falsy).
- **isDefined** — Type guard para valores no `null`/`undefined`.
- **noop** — Función vacía reutilizable.
- **isWeb** — Detecta si se está ejecutando en web.

## @antonella/auth — Autenticación
- **User / Session / AuthProvider** — Tipos base de sesión y contrato del provider. *(implementación con backend pendiente: Firebase/Clerk)*

## @antonella/api — Cliente API
- **ApiClient / ApiClientConfig** — Contrato tipado del cliente HTTP.
- **createApiClient** — Factory del cliente. *(implementación pendiente: Axios + retries + caché)*

## @antonella/storage — Persistencia
- **Storage** — Interfaz mínima `getItem/setItem/removeItem/clear`.
- **createMemoryStorage** — Implementación en memoria (útil para tests/mock). *(backend real AsyncStorage/MMKV pendiente)*
