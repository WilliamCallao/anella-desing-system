import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { brand, card, cta1, neutrals, radius, resolveSemantic, lightSemantic, space, text, TextType } from "@william-callao/antonella-theme";
import { Text } from "./text/Text";
import { Icon } from "./Icon";
import { AppIcon } from "../AppIcons";

export type TreeNode = {
  id: string;
  code: string;
  name: string;
  children: TreeNode[];
};

export type TreeEditorMode = "view" | "edit";

export type TreeEditorVariant = "default" | "darkness";

type VariantTokens = {
  containerBg: string;
  cardBg: string;
  /** Color de estructura: conectores del árbol (token semántico subtle). */
  lineColor: string;
  /** Icono de carpeta abierta en grupos expandidos (brand). */
  iconExpanded: string;
  /** Relleno y texto del chip de código (espejo del resaltado de Item). */
  chipBg: string;
  chipText: string;
  /** Chip inactivo (grupo colapsado): sin relleno, borde gris discreto. */
  neutralChipBg: string;
  neutralChipBorder: string;
  neutralChipText: string;
  /** Item activo (grupo expandido): fondo brand y textos con contraste ajustado. */
  activeCardBg: string;
  activeTextPrimary: string;
  activeTextSecondary: string;
  activeIconColor: string;
  activeChipBg: string;
  activeChipText: string;
  activePressedBg: string;
  textPrimary: string;
  textSecondary: string;
  codeColor: string;
  chevronColor: string;
  addRootText: string;
  actionsColor: string;
  pressedBg: string;
};

const _semantic = resolveSemantic(lightSemantic);

const VARIANT_TOKENS: Record<TreeEditorVariant, VariantTokens> = {
  default: {
    containerBg: "transparent",
    cardBg: card.background,
    lineColor: neutrals.N700,
    iconExpanded: brand.M500,
    chipBg: brand.M100,
    chipText: brand.M700,
    neutralChipBg: "transparent",
    neutralChipBorder: neutrals.N300,
    neutralChipText: _semantic.default.text.default,
    activeCardBg: brand.M100,
    activeTextPrimary: brand.M900,
    activeTextSecondary: brand.M700,
    activeIconColor: brand.M700,
    activeChipBg: neutrals.N0,
    activeChipText: brand.M800,
    activePressedBg: "rgba(0,0,0,0.08)",
    textPrimary: card.text.primary,
    textSecondary: card.text.secondary,
    codeColor: card.text.secondary,
    chevronColor: text.secondary,
    addRootText: cta1,
    actionsColor: text.secondary,
    pressedBg: "rgba(0,0,0,0.04)",
  },
  darkness: {
    containerBg: "transparent",
    cardBg: _semantic.darkness.bg.subtle,
    lineColor: _semantic.darkness.text.subtlest,
    iconExpanded: brand.M300,
    chipBg: brand.M700,
    chipText: _semantic.darkness.text.default,
    neutralChipBg: "transparent",
    neutralChipBorder: _semantic.darkness.text.subtlest,
    neutralChipText: _semantic.darkness.text.subtle,
    activeCardBg: brand.M700,
    activeTextPrimary: _semantic.darkness.text.default,
    activeTextSecondary: _semantic.darkness.text.subtle,
    activeIconColor: _semantic.darkness.icon.default,
    activeChipBg: "rgba(255,255,255,0.18)",
    activeChipText: _semantic.darkness.text.default,
    activePressedBg: "rgba(255,255,255,0.10)",
    textPrimary: _semantic.darkness.text.default,
    textSecondary: _semantic.darkness.text.subtle,
    codeColor: _semantic.darkness.text.subtle,
    chevronColor: _semantic.darkness.icon.subtle,
    addRootText: brand.M400,
    actionsColor: _semantic.darkness.icon.subtle,
    pressedBg: "rgba(255,255,255,0.06)",
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
  style?: StyleProp<ViewStyle>;
};

// ----------------------------------------------------------------
// Helpers puros: mutan copias del bosque y devuelven nuevos arrays
// ----------------------------------------------------------------

export function createNode(code: string, name: string, children: TreeNode[] = []): TreeNode {
  return {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    code,
    name,
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

/** Grupo de hermanos al que pertenece `nodeId` (o null si es raíz del bosque). */
function findSiblingGroup(nodes: TreeNode[], id: string): TreeNode[] | null {
  if (nodes.some((n) => n.id === id)) return nodes;
  for (const n of nodes) {
    const found = findSiblingGroup(n.children, id);
    if (found) return found;
  }
  return null;
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

const INDENT = 28;
const ROW_HEIGHT = 72;
const CARD_MARGIN = 12;
const CARD_PADDING_H = space.space4;
const CARD_RADIUS = 24;
/** Offset del riel vertical dentro de su columna de indentación. */
const LINE_X = 10;

const EXPAND_FADE = 180;

/** Icono de nodo (folder/file) alineado con el título. */
const NODE_ICON_SIZE = 18;

// Contexto compartido entre el render recursivo y las filas.
// No incluye mapas mutables (`collapsed`/dirty): se leen por referencia vía
// `getCollapsed()`/`getDirty()` para que el objeto ctx sea estable y React.memo
// de TreeNodeItem cumpla su función (colapsar/expandir un nodo NO re-renderiza
// las ramas ajenas al camino afectado).
type TreeRenderContext = {
  isEdit: boolean;
  onToggle: (id: string) => void;
  onOpenActions: (id: string) => void;
  renderNode?: (node: TreeNode, defaultContent: React.ReactNode) => React.ReactNode;
  vt: VariantTokens;
  getCollapsed: () => Record<string, boolean>;
  getDirty: () => Set<string>;
};

// Columnas de conectores tipo file-explorer ("│/├/└"). Cada nivel es un item
// flex de ancho INDENT con su riel vertical y, en el último, el stub horizontal
// que llega hasta el borde del card. Al ser items del propio row (sin absolutos
// sobre la fila ni padding intermedio), la alineación entre filas es exacta por
// construcción. `terminal` cierra el codo en el centro de la fila: es el "└"
// del último item visible del nivel.
const NodeGutter = React.memo(function NodeGutter({
  depth,
  lineColor,
  terminal,
}: {
  depth: number;
  lineColor: string;
  terminal: boolean;
}) {
  if (depth === 0) return null;
  const columns = [];
  for (let k = 0; k < depth; k++) {
    const isElbow = k === depth - 1;
    columns.push(
      <View key={`g${k}`} style={styles.gutterCol}>
        <View
          style={[
            styles.gutterRail,
            {
              left: LINE_X,
              backgroundColor: lineColor,
              top: 0,
              bottom: isElbow && terminal ? "50%" : 0,
            },
          ]}
        />
        {isElbow ? (
          <View style={[styles.gutterStub, { left: LINE_X, backgroundColor: lineColor }]} />
        ) : null}
      </View>,
    );
  }
  return <>{columns}</>;
});

// Fila compacta "+ Agregar" de un nivel. El riel del padre termina en el chip,
// así el botón se lee como el último item del nivel y queda conectado.
function renderForest(
  ctx: TreeRenderContext,
  nodes: TreeNode[],
  depth: number,
  parentName?: string,
): React.ReactNode {
  const collapsed = ctx.getCollapsed();
  const dirty = ctx.getDirty();
  // DEBUG(tree): traza qué filas renderiza y su estado de colapso.
  // eslint-disable-next-line no-console
  console.log("[TREE:renderForest]", {
    depth,
    parentName: parentName ?? null,
    nodes: nodes.map((n) => ({ id: n.id, code: n.code, collapsed: !!collapsed[n.id], children: n.children.length })),
    dirty: [...dirty],
  });
  return (
    <>
      {nodes.map((node, i) => (
        <TreeNodeItem
          key={node.id}
          node={node}
          depth={depth}
          isLast={i === nodes.length - 1}
          parentName={parentName}
          isCollapsed={!!collapsed[node.id]}
          subtreeDirty={dirty.has(node.id)}
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
  isLast,
  parentName,
  isCollapsed,
  subtreeDirty,
  ctx,
}: {
  node: TreeNode;
  depth: number;
  isLast: boolean;
  parentName?: string;
  isCollapsed: boolean;
  subtreeDirty: boolean;
  ctx: TreeRenderContext;
}) {
  const hasChildren = node.children.length > 0;
  // Activo: grupo expandido. Pinta el card de brand con textos contrastados.
  const isActive = hasChildren && !isCollapsed;

  // DEBUG(tree): estado final con el que renderiza cada fila.
  // eslint-disable-next-line no-console
  console.log(`[TREE:item] id=${node.id} code=${node.code} depth=${depth} isCollapsed=${isCollapsed} subtreeDirty=${subtreeDirty} hasChildren=${hasChildren}`);

  // El "└" del riel cierra en el último hijo visible del nivel.
  const terminalElbow = isLast;

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

  // Fila 1: icono + título. Fila 2: descripción alineada con el título.
  // Grupos: folder cerrado/abierto según colapso; hojas: file.
  const defaultContent = (
    <View style={styles.textBlock}>
      <View style={styles.titleRow}>
        <Icon
          name={hasChildren ? (isCollapsed ? AppIcon.Folder : AppIcon.FolderOpen) : AppIcon.File}
          size={NODE_ICON_SIZE}
          color={isActive ? ctx.vt.activeIconColor : hasChildren ? ctx.vt.chevronColor : ctx.vt.codeColor}
        />
        <Text
          variant={TextType.Caption}
          color={isActive ? ctx.vt.activeTextPrimary : ctx.vt.textPrimary}
          numberOfLines={1}
        >
          {node.name}
        </Text>
      </View>
      <View style={styles.captionRow}>
        <View
          style={[
            styles.codeChip,
            isActive
              ? { backgroundColor: ctx.vt.activeChipBg }
              : !hasChildren
                ? { backgroundColor: ctx.vt.chipBg }
                : {
                    backgroundColor: ctx.vt.neutralChipBg,
                    borderWidth: 1,
                    borderColor: ctx.vt.neutralChipBorder,
                  },
          ]}
        >
          <Text
            variant={TextType.Caption}
            color={
              isActive ? ctx.vt.activeChipText : !hasChildren ? ctx.vt.chipText : ctx.vt.neutralChipText
            }
            numberOfLines={1}
          >
            {node.code}
          </Text>
        </View>
        {parentName ? (
          <Text
            variant={TextType.Caption}
            color={isActive ? ctx.vt.activeTextSecondary : ctx.vt.textSecondary}
            numberOfLines={1}
          >
            {parentName}
          </Text>
        ) : null}
      </View>
    </View>
  );

  return (
    <>
      <View style={styles.nodeRow}>
        <NodeGutter depth={depth} lineColor={ctx.vt.lineColor} terminal={terminalElbow} />
          <Pressable
            onPress={hasChildren ? () => ctx.onToggle(node.id) : undefined}
            disabled={!hasChildren}
            style={({ pressed }) => [
              styles.nodeCard,
              {
                backgroundColor: pressed
                  ? isActive
                    ? ctx.vt.activePressedBg
                    : ctx.vt.pressedBg
                  : isActive
                    ? ctx.vt.activeCardBg
                    : ctx.vt.cardBg,
              },
            ]}
            accessibilityRole={hasChildren ? "button" : undefined}
            accessibilityState={hasChildren ? { expanded: !isCollapsed } : undefined}
            accessibilityLabel={hasChildren ? `${isCollapsed ? "Expandir" : "Colapsar"} ${node.name}` : undefined}
          >
            <View style={styles.rowContent}>
              {ctx.renderNode ? ctx.renderNode(node, defaultContent) : defaultContent}
            </View>
          </Pressable>
          {ctx.isEdit ? (
            <Pressable
              onPress={() => ctx.onOpenActions(node.id)}
              hitSlop={12}
              style={({ pressed }) => [styles.actions, pressed && { backgroundColor: ctx.vt.pressedBg }]}
              accessibilityRole="button"
              accessibilityLabel={`Acciones de ${node.name}`}
            >
              <Icon name="more-vertical" size={20} color={ctx.vt.actionsColor} />
            </Pressable>
          ) : null}
      </View>
      {hasChildren && !isCollapsed ? (
        <Animated.View style={[styles.subtreeFade, { opacity: contentOpacity }]}>
          {renderForest(ctx, node.children, depth + 1, node.name)}
        </Animated.View>
      ) : null}
    </>
  );
});

// ----------------------------------------------------------------
// Componente
// ----------------------------------------------------------------

export function TreeEditor({ value, onChange, mode = "view", variant = "default", collapsed: collapsedProp, onCollapsedChange, rootLabel = "Agregar raíz", renderNode, onRequestAdd, onRequestEdit, onRequestDelete, style }: TreeEditorProps) {
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

  // Camino afectado del render: ids cuyo estado de colapso (propio o de algún
  // descendiente) cambió respecto al render anterior. Por eso un toggle solo
  // re-renderiza el nodo tocado y sus ancestros, no todo el árbol.
  //
  // IMPORTANTE: cuando un nodo cambia de colapso, su subárbol entero pasa a
  // montarse/desmontarse (renderForest anida `hasChildren && !isCollapsed`).
  // Si solo marcamos el camino a raíz, los descendientes re-montados quedan con
  // un `React.memo` que conserva el isCollapsed viejo y dejan de responder al
  // tap (el bug de "no se puede expandir los hijos tras colapsar el padre").
  // Por eso marcamos dirty el nodo cambiado + TODO su subárbol + el camino.
  const dirtyRef = useRef(new Set<string>());
  const prevCollapsedRef = useRef(collapsed);
  {
    const dirty = dirtyRef.current;
    const prev = prevCollapsedRef.current;
    dirty.clear();
    const markChange = (id: string) => {
      markDirtyPath(id, parentMap, dirty);
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

  const getCollapsed = useCallback(() => collapsedRef.current, []);

  const getDirty = useCallback(() => dirtyRef.current, []);

  const toggleCollapse = useCallback((id: string) => {
    const collapseMap = collapsedRef.current;
    const tree = valueRef.current;
    const collapsing = !collapseMap[id];
    // DEBUG(tree): qué nodo se presiona y hacia dónde (colapsar/expandir).
    // eslint-disable-next-line no-console
    console.log(`[TREE:toggle] id=${id} (prev collapsed=${collapseMap[id]}) -> ${collapsing ? "COLLAPSE" : "EXPAND"}`);
    let next: Record<string, boolean>;
    if (collapsing) {
      next = { ...collapseMap, [id]: true };
      const node = findNode(tree, id);
      if (node) markBranchCollapsed(node.children, next);
    } else {
      next = { ...collapseMap, [id]: false };
      const siblings = findSiblingGroup(tree, id);
      const rootId = tree.length > 0 ? tree[0].id : null;
      if (siblings) {
        for (const s of siblings) {
          if (s.id !== id && s.id !== rootId && s.children.length > 0) {
            next[s.id] = true;
            markBranchCollapsed(s.children, next);
          }
        }
      }
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
      onToggle: toggleCollapse,
      onOpenActions,
      renderNode,
      vt,
      getCollapsed,
      getDirty,
    }),
    [isEdit, toggleCollapse, onOpenActions, renderNode, vt, getCollapsed, getDirty],
  );

  return (
    <View
      style={[styles.container, { backgroundColor: vt.containerBg }, style]}
    >
      <View>
        {renderForest(ctx, value, 0)}
      </View>

      {isEdit ? (
        <Pressable
          onPress={() => onRequestAdd?.(null)}
          style={({ pressed }) => [
            styles.addRoot,
            pressed && { backgroundColor: vt.pressedBg },
          ]}
          accessibilityRole="button"
        >
          <View style={[styles.addChip, { borderColor: vt.addRootText }]}>
            <Icon name="add" size={13} color={vt.addRootText} />
          </View>
          <Text variant={TextType.BodyMedium} color={vt.addRootText}>
            {rootLabel}
          </Text>
        </Pressable>
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
    paddingHorizontal: space.space2,
    borderRadius: radius.sm,
  },
  nodeCard: {
    position: "relative",
    flex: 1,
    borderRadius: CARD_RADIUS,
    minHeight: ROW_HEIGHT,
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: CARD_MARGIN,
  },
  nodeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  gutterCol: {
    width: INDENT,
    alignSelf: "stretch",
  },
  gutterRail: {
    position: "absolute",
    width: 1,
  },
  gutterStub: {
    position: "absolute",
    height: 1,
    right: 0,
    top: "50%",
    marginTop: -0.5,
  },
  rowContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: space.space2,
    paddingHorizontal: CARD_PADDING_H,
    paddingVertical: space.space1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.space2,
  },
  captionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.space2,
    marginLeft: NODE_ICON_SIZE + space.space2,
  },
  codeChip: {
    borderRadius: 999,
    paddingHorizontal: space.space4,
    paddingVertical: 2,
  },
  textBlock: {
    flex: 0,
    gap: space.space1,
  },
  actions: {
    padding: space.space2,
    marginLeft: space.space1,
    marginBottom: CARD_MARGIN,
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
