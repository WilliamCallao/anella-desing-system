import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { brand, cta1, neutrals, radius, space, TextType } from "@william-callao/antonella-theme";
import { Text } from "./text/Text";
import { Icon } from "./Icon";
import { AppIcon } from "../AppIcons";
import { TrackedPressable } from "./TrackedPressable";

export type TreeNodeKind = "group" | "item";

export type TreeNode = {
  id: string;
  code: string;
  name: string;
  /** Contenedor (grupo/cuenta título) o contenido (artículo/cuenta movimiento). */
  kind: TreeNodeKind;
  children: TreeNode[];
};

export type TreeEditorMode = "view" | "edit";

export type TreeEditorVariant = "default" | "darkness";

type VariantTokens = {
  containerBg: string;
  groupIcon: string;
  itemIcon: string;
  groupText: string;
  itemText: string;
  groupMeta: string;
  codeText: string;
  groupTileBg: string;
  groupRowExpandedBg: string;
  groupRowPressedBg: string;
  rowPressedBg: string;
  addRootText: string;
  actionsColor: string;
};

const VARIANT_TOKENS: Record<TreeEditorVariant, VariantTokens> = {
  default: {
    containerBg: "transparent",
    groupIcon: brand.M600,
    itemIcon: neutrals.N500,
    groupText: neutrals.N900,
    itemText: neutrals.N700,
    groupMeta: neutrals.N500,
    codeText: neutrals.N500,
    groupTileBg: brand.M50,
    groupRowExpandedBg: neutrals.N100,
    groupRowPressedBg: neutrals.N200,
    rowPressedBg: "rgba(0,0,0,0.04)",
    addRootText: cta1,
    actionsColor: neutrals.N500,
  },
  darkness: {
    containerBg: "transparent",
    groupIcon: brand.M300,
    itemIcon: neutrals.N500,
    groupText: neutrals.N0,
    itemText: neutrals.N300,
    groupMeta: neutrals.N400,
    codeText: neutrals.N500,
    groupTileBg: "rgba(100,164,215,0.16)",
    // Equivalente sólido del rgba(255,255,255,0.07) sobre N950. El borde usa
    // este mismo valor sin alpha: si ambos fueran rgba, el borde compone dos
    // capas y se ve más claro que el fondo.
    groupRowExpandedBg: "#181D26",
    groupRowPressedBg: "rgba(255,255,255,0.10)",
    rowPressedBg: "rgba(255,255,255,0.04)",
    addRootText: brand.M300,
    actionsColor: neutrals.N400,
  },
};

export type TreeEditorProps = {
  value: TreeNode[];
  onChange: (value: TreeNode[]) => void;
  /** Default: "view" (solo visualización). Con "edit" se muestran las acciones. */
  mode?: TreeEditorMode;
  /** Variant visual del árbol. Default: "default". "darkness" usa cards oscuras individuales. */
  variant?: TreeEditorVariant;
  /** Estado controlado de nodos colapsados. Si se provee, sobreescribe el estado interno. */
  collapsed?: Record<string, boolean>;
  /** Callback cuando cambia el estado de colapso de un nodo. Requiere `collapsed` controlado. */
  onCollapsedChange?: (collapsed: Record<string, boolean>) => void;
  /** Etiqueta del botón de agregar raíz (solo modo edición). Default: "Agregar raíz". */
  rootLabel?: string;
  /** Render custom para el contenido de cada nodo. Recibe el nodo y el render por defecto. */
  renderNode?: (node: TreeNode, defaultContent: React.ReactNode) => React.ReactNode;
  /** Called when user taps any add button/row. When provided, the built-in add dialog is bypassed. */
  onRequestAdd?: (parentId: string | null) => void;
  /** Called when user taps "Editar" from the node menu. When provided, the built-in edit dialog is bypassed. */
  onRequestEdit?: (node: TreeNode) => void;
  /** Called when the user confirms deletion of a node. When provided, the built-in removal is bypassed (the node is NOT deleted). */
  onRequestDelete?: (node: TreeNode) => void;
  /**
   * Menú de acciones en modo edición: `"menu"` (default) muestra el botón de
   * tres puntos por fila; `"longPress"` lo oculta. En ambos casos una pulsación
   * larga sobre la fila abre las acciones.
   */
  nodeActions?: "menu" | "longPress";
  /** Toque corto en una hoja (nodo sin hijas). Los grupos siguen expandiendo/colapsando. */
  onPressNode?: (node: TreeNode) => void;
  style?: StyleProp<ViewStyle>;
};

// ----------------------------------------------------------------
// Helpers puros: mutan copias del bosque y devuelven nuevos arrays
// ----------------------------------------------------------------

export function createNode(
  code: string,
  name: string,
  children: TreeNode[] = [],
  kind: TreeNodeKind = "item",
): TreeNode {
  return {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    code,
    name,
    kind,
    children,
  };
}

export function addChild(nodes: TreeNode[], parentId: string, node: TreeNode): TreeNode[] {
  return nodes.map((n) =>
    n.id === parentId
      ? { ...n, children: [...n.children, node] }
      : { ...n, children: addChild(n.children, parentId, node) },
  );
}

export function addSibling(nodes: TreeNode[], nodeId: string, node: TreeNode): TreeNode[] {
  const idx = nodes.findIndex((n) => n.id === nodeId);
  if (idx >= 0) {
    const copy = [...nodes];
    copy.splice(idx + 1, 0, node);
    return copy;
  }
  return nodes.map((n) => ({ ...n, children: addSibling(n.children, nodeId, node) }));
}

export function updateNode(
  nodes: TreeNode[],
  nodeId: string,
  patch: Partial<Pick<TreeNode, "code" | "name">>,
): TreeNode[] {
  return nodes.map((n) =>
    n.id === nodeId ? { ...n, ...patch } : { ...n, children: updateNode(n.children, nodeId, patch) },
  );
}

export function removeNode(nodes: TreeNode[], nodeId: string): TreeNode[] {
  return nodes
    .filter((n) => n.id !== nodeId)
    .map((n) => ({ ...n, children: removeNode(n.children, nodeId) }));
}

export function findNode(nodes: TreeNode[], nodeId: string): TreeNode | undefined {
  for (const n of nodes) {
    if (n.id === nodeId) return n;
    const found = findNode(n.children, nodeId);
    if (found) return found;
  }
  return undefined;
}

/** Marca en `acc` el nodo y todos sus descendientes como colapsados. */
function markBranchCollapsed(nodes: TreeNode[], acc: Record<string, boolean>) {
  for (const n of nodes) {
    acc[n.id] = true;
    markBranchCollapsed(n.children, acc);
  }
}

export function hasCode(nodes: TreeNode[], code: string, excludeId?: string): boolean {
  for (const n of nodes) {
    if (n.code === code && n.id !== excludeId) return true;
    if (hasCode(n.children, code, excludeId)) return true;
  }
  return false;
}

export function countNodes(nodes: TreeNode[]): number {
  return nodes.reduce((acc, n) => acc + 1 + countNodes(n.children), 0);
}

/**
 * Estado colapso inicial: todo contraído salvo la primera raíz, que se muestra
 * expandida con su primer nivel visible.
 */
export function buildInitialCollapsed(nodes: TreeNode[]): Record<string, boolean> {
  const acc: Record<string, boolean> = {};
  const markAll = (list: TreeNode[]) => {
    for (const n of list) {
      acc[n.id] = true;
      markAll(n.children);
    }
  };
  if (nodes.length > 0) {
    markAll(nodes.slice(1));
    markAll(nodes[0].children);
  }
  return acc;
}

// ----------------------------------------------------------------
// Construcción de filas (DFS) para dibujar conectores tipo file-explorer.
// Solo las filas VISIBLES (respetando el colapso) se usan para los índices
// de conectores; el render recursivo monta siempre los subárboles y los
// anima/clipea con overflow hidden.
// ----------------------------------------------------------------

const INDENT = 20;
const GROUP_ROW_HEIGHT = 56;
const ITEM_ROW_HEIGHT = 68;
const CARD_RADIUS = radius.lg;
const ROW_VERTICAL_PADDING = space.space1;
const ROW_LEFT_PADDING = space.space1;
const ROW_RIGHT_PADDING = space.space3;
const FOLDER_TILE_WIDTH = 48;
// Radio concéntrico: el radio interior se reduce por el padding que lo separa
// del borde exterior de la fila.
const FOLDER_TILE_RADIUS = CARD_RADIUS - ROW_LEFT_PADDING;

const EXPAND_FADE = 180;


// Contexto compartido entre el render recursivo y las filas.
// No incluye mapas mutables (`collapsed`/versiones): se leen por referencia vía
// `getCollapsed()`/`getVersion()` para que el objeto ctx sea estable.
// La memoización por RAMA usa una VERSIÓN numérica (no un flag booleano):
// `branchVersion` cambia solo para los nodos afectados por el toggle, de modo
// que el React.memo re-renderiza SOLO la rama tocada y jamás queda "atascado"
// (un número siempre es comparable; un booleano sucio se queda en true).
type TreeRenderContext = {
  isEdit: boolean;
  actionsOnLongPress: boolean;
  onToggle: (id: string) => void;
  onOpenActions: (id: string) => void;
  onPressNode?: (node: TreeNode) => void;
  renderNode?: (node: TreeNode, defaultContent: React.ReactNode) => React.ReactNode;
  vt: VariantTokens;
  getCollapsed: () => Record<string, boolean>;
  getVersion: (id: string) => number;
};

// Columnas de conectores tipo file-explorer ("│/├/└"). Cada nivel es un item
// flex de ancho INDENT con su riel vertical y, en el último, el stub horizontal
// que llega hasta el borde del card. Al ser items del propio row (sin absolutos
// sobre la fila ni padding intermedio), la alineación entre filas es exacta por
// construcción. `terminal` cierra el codo en el centro de la fila: es el "└"
// del último item visible del nivel.
const NodeGutter = React.memo(function NodeGutter({ depth }: { depth: number }) {
  if (depth === 0) return null;
  return <View style={{ width: INDENT * depth }} />;
});

// Renderiza el bosque visible; el colapso se resuelve en cada nodo.
function renderForest(
  ctx: TreeRenderContext,
  nodes: TreeNode[],
  depth: number,
): React.ReactNode {
  const collapsed = ctx.getCollapsed();
  return (
    <>
      {nodes.map((node) => (
        <TreeNodeItem
          key={node.id}
          node={node}
          depth={depth}
          isCollapsed={!!collapsed[node.id]}
          branchVersion={ctx.getVersion(node.id)}
          ctx={ctx}
        />
      ))}
    </>
  );
}

/** Marca en `acc` el nodo y todos sus ancestros hasta la raíz (camino afectado). */
function markDirtyPath(id: string, parentMap: Map<string, string>, acc: Set<string>) {
  let curr: string | undefined = id;
  while (curr) {
    acc.add(curr);
    curr = parentMap.get(curr);
  }
}

/** Marca en `acc` el nodo y TODOS sus descendientes (subárbol entero). */
function markSubtreeDirty(node: TreeNode, acc: Set<string>) {
  acc.add(node.id);
  for (const child of node.children) markSubtreeDirty(child, acc);
}

// Nodo del árbol: fila clickeable (colapsa/expande en toda la fila) + contenedor
// animado del subárbol (altura/opacidad/chevron, patrón de AppSelector).
//
// Memoizado: solo re-renderiza si realmente cambió su nodo/estado. Esto evita
// que renders ajenos del padre (transiciones de pantalla, renders dobles) o el
// colapso de OTRO nodo hermano re-pinte el subárbol entero.
const TreeNodeItem = React.memo(function TreeNodeItem({
  node,
  depth,
  isCollapsed,
  branchVersion,
  ctx,
}: {
  node: TreeNode;
  depth: number;
  isCollapsed: boolean;
  branchVersion: number;
  ctx: TreeRenderContext;
}) {
  const isGroup = node.kind === "group";
  const hasChildren = node.children.length > 0;
  const canToggle = isGroup && hasChildren;
  const isExpanded = canToggle && !isCollapsed;

  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // El subárbol solo existe en el tree cuando está expandido; al montarlo se
    // hace un fade-in (native driver, sin tocar layout). No hay fade-out: al
    // colapsar se desmonta al instante para no dejar hueco ni animar altura.
    if (isCollapsed) return;
    const animation = Animated.timing(contentOpacity, {
      toValue: 1,
      duration: EXPAND_FADE,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [isCollapsed, node.id, node.name, contentOpacity]);

  const defaultContent = (
    <>
      {isGroup ? (
        <>
          <View
            style={[
              styles.folderTile,
              { backgroundColor: ctx.vt.groupTileBg },
            ]}
          >
            <Icon
              name={isExpanded ? AppIcon.FolderOpen : AppIcon.Folder}
              size={20}
              color={ctx.vt.groupIcon}
            />
          </View>
          <View style={styles.groupTextBlock}>
            <Text
              variant={TextType.BodyMedium}
              color={ctx.vt.groupText}
              numberOfLines={1}
              style={styles.groupName}
            >
              {node.name}
            </Text>
            <Text
              variant={TextType.Caption}
              color={ctx.vt.groupMeta}
              numberOfLines={1}
            >
              {node.code}
            </Text>
          </View>
        </>
      ) : (
        <View style={styles.itemBody}>
          <View style={styles.itemTopRow}>
            <Icon
              name={AppIcon.File}
              size={16}
              color={ctx.vt.itemIcon}
            />
            <Text
              variant={TextType.Caption}
              color={ctx.vt.codeText}
              numberOfLines={1}
              style={styles.codeText}
            >
              {node.code}
            </Text>
          </View>
          <Text
            variant={TextType.BodyMedium}
            color={ctx.vt.itemText}
            numberOfLines={1}
            style={styles.itemName}
          >
            {node.name}
          </Text>
        </View>
      )}
    </>
  );

  // Un nodo es interactivo si expande/colapsa, si abre su detalle (nodo sin
  // hijos) o si expone acciones (menú o pulsación larga).
  const canOpenDetail = !canToggle && ctx.onPressNode != null;
  const canOpenActions = ctx.isEdit;
  const interactive = canToggle || canOpenDetail || canOpenActions;

  const handlePress = canToggle
    ? () => ctx.onToggle(node.id)
    : canOpenDetail
      ? () => ctx.onPressNode?.(node)
      : undefined;
  // La pulsación larga abre acciones en modo edición sin importar el estilo del
  // menú; el botón de tres puntos se mantiene cuando `nodeActions="menu"`.
  const handleLongPress = ctx.isEdit ? () => ctx.onOpenActions(node.id) : undefined;
  const pressedRowBg = isGroup
    ? ctx.vt.groupRowPressedBg
    : ctx.vt.rowPressedBg;
  const selectedRowBg = isExpanded
    ? ctx.vt.groupRowExpandedBg
    : "transparent";

  return (
    <>
      <View style={styles.nodeRow}>
        <NodeGutter depth={depth} />
          <TrackedPressable
            onPress={handlePress}
            tracking={{
              component: "TreeEditor",
              label: node.name,
              kind: "item",
              data: {
                code: node.code,
                depth,
                kind: node.kind,
                childCount: isGroup ? node.children.length : undefined,
                expanded: canToggle ? !isCollapsed : undefined,
              },
            }}
            onLongPress={handleLongPress}
            delayLongPress={450}
            disabled={!interactive}
            style={({ pressed }) => [
              styles.nodeCard,
              {
                minHeight: isGroup ? GROUP_ROW_HEIGHT : ITEM_ROW_HEIGHT,
                marginTop: isGroup ? space.space1 : 0,
                marginBottom: isGroup ? space.space1 : 2,
                borderColor: ctx.vt.groupRowExpandedBg,
                backgroundColor: pressed ? pressedRowBg : selectedRowBg,
              },
            ]}
            accessibilityRole={interactive ? "button" : undefined}
            accessibilityState={
              isGroup
                ? { expanded: canToggle ? !isCollapsed : false }
                : undefined
            }
            accessibilityLabel={
              isGroup
                ? `${node.name}, ${canToggle ? (isCollapsed ? "grupo colapsado" : "grupo expandido") : "grupo sin subelementos"}`
                : canOpenDetail
                  ? `${node.name}, ver detalle`
                  : undefined
            }
            accessibilityHint={
              ctx.isEdit ? "Mantené presionado para ver las acciones" : undefined
            }
            accessibilityActions={
              ctx.isEdit ? [{ name: "actions", label: "Acciones" }] : undefined
            }
            onAccessibilityAction={(event) => {
              if (event.nativeEvent.actionName === "actions") ctx.onOpenActions(node.id);
            }}
          >
            <View
              style={[
                styles.rowContent,
                !isGroup && styles.itemRowContent,
              ]}
            >
              {ctx.renderNode ? ctx.renderNode(node, defaultContent) : defaultContent}
            </View>
          </TrackedPressable>
          {ctx.isEdit && !ctx.actionsOnLongPress ? (
            <TrackedPressable
              onPress={() => ctx.onOpenActions(node.id)}
              tracking={{ component: "TreeEditor", label: `Acciones de ${node.name}`, kind: "button", data: { code: node.code } }}
              hitSlop={12}
              style={({ pressed }) => [styles.actions, pressed && { backgroundColor: ctx.vt.rowPressedBg }]}
              accessibilityRole="button"
              accessibilityLabel={`Acciones de ${node.name}`}
            >
              <Icon name="more-vertical" size={20} color={ctx.vt.actionsColor} />
            </TrackedPressable>
          ) : null}
      </View>
      {canToggle && !isCollapsed ? (
        <Animated.View style={[styles.subtreeFade, { opacity: contentOpacity }]}>
          {renderForest(ctx, node.children, depth + 1)}
        </Animated.View>
      ) : null}
    </>
  );
});

// ----------------------------------------------------------------
// Componente
// ----------------------------------------------------------------

export function TreeEditor({ value, onChange, mode = "view", variant = "default", collapsed: collapsedProp, onCollapsedChange, rootLabel = "Agregar raíz", renderNode, onRequestAdd, onRequestEdit, onRequestDelete, nodeActions = "menu", onPressNode, style }: TreeEditorProps) {
  const [internalCollapsed, setInternalCollapsed] = useState<Record<string, boolean>>({});
  const source = collapsedProp ?? internalCollapsed;
  const needsImplicitInit = value.length > 0 && Object.keys(source).length === 0;
  const implicitInit = useMemo(
    () => (needsImplicitInit ? buildInitialCollapsed(value) : null),
    [needsImplicitInit, value],
  );
  const collapsed = implicitInit ?? source;

  // Mapa hijo -> padre, para propagar hacia arriba (camino afectado) los cambios
  // de colapso. Se reconstruye solo cuando cambia el árbol (raro).
  const parentMap = useMemo(() => {
    const map = new Map<string, string>();
    const walk = (list: TreeNode[], parent?: string) => {
      for (const n of list) {
        if (parent) map.set(n.id, parent);
        walk(n.children, n.id);
      }
    };
    walk(value);
    return map;
  }, [value]);

  // Refs "latest value" para que callbacks estables (toggle/actions) lean el
  // estado vigente sin recrear su identidad en cada cambio.
  const collapsedRef = useRef(collapsed);
  collapsedRef.current = collapsed;
  const valueRef = useRef(value);
  valueRef.current = value;
  const onCollapsedChangeRef = useRef(onCollapsedChange);
  onCollapsedChangeRef.current = onCollapsedChange;
  const onRequestEditRef = useRef(onRequestEdit);
  onRequestEditRef.current = onRequestEdit;
  const controlledRef = useRef(collapsedProp !== undefined);

  // Memoización por RAMA basada en versión numérica (no en un flag booleano).
  // `versions` mapea id -> última renderSeq en la que ese nodo fue afectado por
  // un toggle. Como `branchVersion` es un number, React.memo lo compara bien y
  // NO se queda atascado: cada toggle que toca un nodo le asigna una versión
  // nueva, y los nodos de otras ramas conservan la suya (no re-renderizan).
  const versionRef = useRef(new Map<string, number>());
  const renderSeqRef = useRef(0);
  const prevCollapsedRef = useRef(collapsed);
  const parentMapRef = useRef(parentMap);
  parentMapRef.current = parentMap;
  {
    const versions = versionRef.current;
    const dirty = new Set<string>();
    const prev = prevCollapsedRef.current;
    const markChange = (id: string) => {
      markDirtyPath(id, parentMapRef.current, dirty);
      const node = findNode(value, id);
      if (node) markSubtreeDirty(node, dirty);
    };
    for (const id of Object.keys(collapsed)) {
      if (prev[id] !== collapsed[id]) markChange(id);
    }
    for (const id of Object.keys(prev)) {
      if (prev[id] === true && !(id in collapsed)) markChange(id);
    }
    prevCollapsedRef.current = collapsed;
    if (dirty.size > 0) {
      renderSeqRef.current += 1;
      const seq = renderSeqRef.current;
      for (const id of dirty) versions.set(id, seq);
    }
  }

  useEffect(() => {
    if (implicitInit == null) return;
    if (collapsedProp != null) {
      onCollapsedChange?.(implicitInit);
    } else {
      setInternalCollapsed(implicitInit);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [implicitInit]);

  const vt = VARIANT_TOKENS[variant];
  const isEdit = mode === "edit";
  const actionsOnLongPress = nodeActions === "longPress";

  const getCollapsed = useCallback(() => collapsedRef.current, []);

  const getVersion = useCallback((id: string) => versionRef.current.get(id) ?? 0, []);

  const toggleCollapse = useCallback((id: string) => {
    const collapseMap = collapsedRef.current;
    const tree = valueRef.current;
    const collapsing = !collapseMap[id];
    let next: Record<string, boolean>;
    if (collapsing) {
      // Colapsar: el nodo + su subárbol entero.
      next = { ...collapseMap, [id]: true };
      const node = findNode(tree, id);
      if (node) markBranchCollapsed(node.children, next);
    } else {
      // Expandir: solo el nodo, sin colapsar a sus hermanos (se pueden abrir
      // varios hijos del mismo padre a la vez).
      next = { ...collapseMap, [id]: false };
    }
    if (controlledRef.current) {
      onCollapsedChangeRef.current?.(next);
    } else {
      setInternalCollapsed(next);
    }
  }, []);

  const onOpenActions = useCallback((nodeId: string) => {
    const node = findNode(valueRef.current, nodeId);
    if (node) onRequestEditRef.current?.(node);
  }, []);

  const ctx: TreeRenderContext = useMemo(
    () => ({
      isEdit,
      actionsOnLongPress,
      onToggle: toggleCollapse,
      onOpenActions,
      onPressNode,
      renderNode,
      vt,
      getCollapsed,
      getVersion,
    }),
    [isEdit, actionsOnLongPress, toggleCollapse, onOpenActions, onPressNode, renderNode, vt, getCollapsed, getVersion],
  );

  return (
    <View
      style={[styles.container, { backgroundColor: vt.containerBg }, style]}
    >
      <View>
        {renderForest(ctx, value, 0)}
      </View>

      {isEdit ? (
        <TrackedPressable
          onPress={() => onRequestAdd?.(null)}
          tracking={{ component: "TreeEditor", label: rootLabel, kind: "button" }}
          style={({ pressed }) => [
            styles.addRoot,
            pressed && { backgroundColor: vt.rowPressedBg },
          ]}
          accessibilityRole="button"
        >
          <View style={[styles.addChip, { borderColor: vt.addRootText }]}>
            <Icon name="add" size={13} color={vt.addRootText} />
          </View>
          <Text variant={TextType.BodyMedium} color={vt.addRootText}>
            {rootLabel}
          </Text>
        </TrackedPressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: space.space2,
  },
  addRoot: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.space1,
    minHeight: 44,
    // No dejar que el CTA de alta se comprima a altura cero cuando el árbol es
    // largo y el contenedor queda acotado (APP-002: "Agregar raíz" degeneraba a
    // bounds con y1 == y2 y dejaba de ser accionable).
    flexShrink: 0,
    paddingHorizontal: space.space2,
    borderRadius: radius.sm,
  },
  nodeCard: {
    position: "relative",
    flex: 1,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    justifyContent: "center",
    overflow: "hidden",
  },
  nodeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: space.space2,
    paddingTop: ROW_VERTICAL_PADDING,
    paddingBottom: ROW_VERTICAL_PADDING,
    paddingLeft: ROW_LEFT_PADDING,
    paddingRight: ROW_RIGHT_PADDING,
  },
  itemRowContent: {
    paddingTop: space.space3,
    paddingBottom: space.space3,
    paddingLeft: space.space4,
    paddingRight: space.space4,
  },
  folderTile: {
    width: FOLDER_TILE_WIDTH,
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: FOLDER_TILE_RADIUS,
    flexShrink: 0,
  },
  groupTextBlock: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
    gap: 1,
  },
  codeText: {
    textAlign: "left",
  },
  itemBody: {
    flex: 1,
    minWidth: 0,
    gap: space.space1,
  },
  itemTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.space1,
  },
  groupName: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "600",
  },
  itemName: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "400",
  },
  actions: {
    padding: space.space2,
    marginLeft: space.space1,
    borderRadius: radius.sm,
  },
  subtreeFade: {
    // Fade puro (native driver): sin medir/animar altura, evita el layout en
    // cascada al expandir/colapsar subárboles anidados.
  },
  addChip: {
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 11,
  },
});
