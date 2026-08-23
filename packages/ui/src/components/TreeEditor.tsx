import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { brand, card, cta1, neutrals, palette, radius, resolveSemantic, lightSemantic, space, text, TextType } from "@antonella/theme";
import { Text } from "./text/Text";
import { Icon, type IconName } from "./Icon";
import { AppResponsiveDialog } from "./AppResponsiveDialog";
import { CardStackSheet } from "./CardStackSheet";
import { Card } from "./Card";
import { OptionListItem, OptionListItemVariant } from "./OptionListItem";
import { TransitionView } from "@antonella/animations";
import { TextField } from "./TextField";
import { AppButton } from "./card-form/AppButton";
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
    cardBg: "#1C1C1E",
    lineColor: neutrals.N600,
    iconExpanded: brand.M300,
    chipBg: brand.M700,
    chipText: neutrals.N0,
    neutralChipBg: "transparent",
    neutralChipBorder: neutrals.N600,
    neutralChipText: _semantic.darkness.text.default,
    activeCardBg: brand.M700,
    activeTextPrimary: neutrals.N0,
    activeTextSecondary: "rgba(255,255,255,0.72)",
    activeIconColor: neutrals.N0,
    activeChipBg: "rgba(255,255,255,0.18)",
    activeChipText: neutrals.N0,
    activePressedBg: "rgba(255,255,255,0.10)",
    textPrimary: "#F2F2F7",
    textSecondary: "#98989F",
    codeColor: "#AEAEB2",
    chevronColor: "#98989F",
    addRootText: "#64A4D7",
    actionsColor: "#98989F",
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

const EXPAND_DURATION = 220;
const EXPAND_FADE = 180;
const COLLAPSE_FADE = 120;

/** Icono de nodo (folder/file) alineado con el título. */
const NODE_ICON_SIZE = 18;

type FlatRow = { node: TreeNode; depth: number };

function buildRows(
  nodes: TreeNode[],
  depth: number,
  collapsed: Record<string, boolean>,
  out: FlatRow[],
): FlatRow[] {
  nodes.forEach((node) => {
    out.push({ node, depth });
    const isCollapsed = !!collapsed[node.id];
    if (node.children.length > 0 && !isCollapsed) {
      buildRows(node.children, depth + 1, collapsed, out);
    }
  });
  return out;
}

// Contexto compartido entre el render recursivo y las filas.
type TreeRenderContext = {
  isEdit: boolean;
  collapsed: Record<string, boolean>;
  onToggle: (id: string) => void;
  onOpenActions: (id: string) => void;
  renderNode?: (node: TreeNode, defaultContent: React.ReactNode) => React.ReactNode;
  vt: VariantTokens;
};

// Columnas de conectores tipo file-explorer ("│/├/└"). Cada nivel es un item
// flex de ancho INDENT con su riel vertical y, en el último, el stub horizontal
// que llega hasta el borde del card. Al ser items del propio row (sin absolutos
// sobre la fila ni padding intermedio), la alineación entre filas es exacta por
// construcción. `terminal` cierra el codo en el centro de la fila: es el "└"
// del último item visible del nivel.
function NodeGutter({
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
}

// Fila compacta "+ Agregar" de un nivel. El riel del padre termina en el chip,
// así el botón se lee como el último item del nivel y queda conectado.
function renderForest(
  ctx: TreeRenderContext,
  nodes: TreeNode[],
  depth: number,
  parentName?: string,
): React.ReactNode {
  return (
    <>
      {nodes.map((node, i) => (
        <TreeNodeItem
          key={node.id}
          node={node}
          depth={depth}
          isLast={i === nodes.length - 1}
          parentName={parentName}
          ctx={ctx}
        />
      ))}
    </>
  );
}

// Nodo del árbol: fila clickeable (colapsa/expande en toda la fila) + contenedor
// animado del subárbol (altura/opacidad/chevron, patrón de AppSelector).
function TreeNodeItem({
  node,
  depth,
  isLast,
  parentName,
  ctx,
}: {
  node: TreeNode;
  depth: number;
  isLast: boolean;
  parentName?: string;
  ctx: TreeRenderContext;
}) {
  const hasChildren = node.children.length > 0;
  const isCollapsed = !!ctx.collapsed[node.id];
  // Activo: grupo expandido. Pinta el card de brand con textos contrastados.
  const isActive = hasChildren && !isCollapsed;

  // El "└" del riel cierra en el último hijo visible del nivel.
  const terminalElbow = isLast;

  const subtreeRows: FlatRow[] = [];
  buildRows(node.children, depth + 1, ctx.collapsed, subtreeRows);
  const expandedHeight = subtreeRows.length * (ROW_HEIGHT + CARD_MARGIN) + 2;

  const heightAnim = useRef(new Animated.Value(isCollapsed ? 0 : expandedHeight)).current;
  const contentOpacity = useRef(new Animated.Value(isCollapsed ? 0 : 1)).current;
  const measured = useRef(false);

  useEffect(() => {
    if (!measured.current) {
      measured.current = true;
      heightAnim.setValue(isCollapsed ? 0 : expandedHeight);
      contentOpacity.setValue(isCollapsed ? 0 : 1);
      return;
    }
    const animation = Animated.parallel([
      Animated.timing(heightAnim, {
        toValue: isCollapsed ? 0 : expandedHeight,
        duration: EXPAND_DURATION,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(contentOpacity, {
        toValue: isCollapsed ? 0 : 1,
        duration: isCollapsed ? COLLAPSE_FADE : EXPAND_FADE,
        useNativeDriver: false,
      }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [isCollapsed, expandedHeight, heightAnim, contentOpacity]);

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
      {hasChildren ? (
        <Animated.View style={[styles.subtree, { height: heightAnim }]}>
          <Animated.View style={{ opacity: contentOpacity }}>
            {renderForest(ctx, node.children, depth + 1, node.name)}
          </Animated.View>
        </Animated.View>
      ) : null}
    </>
  );
}

// ----------------------------------------------------------------
// Componente
// ----------------------------------------------------------------

type DialogMode = "add-root" | "add-child" | "add-sibling" | "edit";

type DialogState = {
  mode: DialogMode;
  nodeId?: string;
  parentId?: string;
} | null;

type FormErrors = { code?: string; name?: string };

export function TreeEditor({ value, onChange, mode = "view", variant = "default", collapsed: collapsedProp, onCollapsedChange, rootLabel = "Agregar raíz", renderNode, onRequestAdd, onRequestEdit, onRequestDelete, style }: TreeEditorProps) {
  const [internalCollapsed, setInternalCollapsed] = useState<Record<string, boolean>>({});
  // Estado inicial implícito: mientras el mapa de colapso esté vacío y haya
  // datos, se muestra solo la primera rama expandida. Se deriva DURANTE el
  // render para que el primer frame ya salga correcto (sin flash del árbol
  // completo), funcione o no el componente sea controlado.
  const source = collapsedProp ?? internalCollapsed;
  const needsImplicitInit = value.length > 0 && Object.keys(source).length === 0;
  const implicitInit = useMemo(
    () => (needsImplicitInit ? buildInitialCollapsed(value) : null),
    [needsImplicitInit, value],
  );
  const collapsed = implicitInit ?? source;

  // Sincroniza el estado inicial con el dueño del estado.
  useEffect(() => {
    if (implicitInit == null) return;
    if (collapsedProp != null) {
      onCollapsedChange?.(implicitInit);
    } else {
      setInternalCollapsed(implicitInit);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [implicitInit]);
  const [actionsNodeId, setActionsNodeId] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [dialog, setDialog] = useState<DialogState>(null);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const vt = VARIANT_TOKENS[variant];
  const isEdit = mode === "edit";
  const actionsNode = actionsNodeId ? findNode(value, actionsNodeId) : undefined;
  const dialogNode = dialog?.nodeId ? findNode(value, dialog.nodeId) : undefined;
  const dialogParent = dialog?.parentId ? findNode(value, dialog.parentId) : undefined;

  const ctx: TreeRenderContext = {
    isEdit,
    collapsed,
    onToggle: toggleCollapse,
    onOpenActions: openActions,
    renderNode,
    vt,
  };

  function toggleCollapse(id: string) {
    const collapsing = !collapsed[id];
    let next: Record<string, boolean>;
    if (collapsing) {
      // Al colapsar un nivel se colapsan también todos sus descendientes,
      // así al re-expandirlo sus hijos vuelven contraídos.
      next = { ...collapsed, [id]: true };
      const node = findNode(value, id);
      if (node) markBranchCollapsed(node.children, next);
    } else {
      // Acordeón por nivel: al expandir un nodo se colapsan sus hermanos
      // (y las ramas de estos) para que solo uno quede desplegado por nivel.
      next = { ...collapsed, [id]: false };
      const siblings = findSiblingGroup(value, id);
      if (siblings) {
        for (const s of siblings) {
          if (s.id !== id && s.children.length > 0) {
            next[s.id] = true;
            markBranchCollapsed(s.children, next);
          }
        }
      }
    }
    if (collapsedProp != null) {
      onCollapsedChange?.(next);
    } else {
      setInternalCollapsed(next);
    }
  }

  function openActions(nodeId: string) {
    setActionsNodeId(nodeId);
  }

  function openDialog(mode: DialogMode, opts: { nodeId?: string; parentId?: string } = {}) {
    setActionsNodeId(null);
    const node = opts.nodeId ? findNode(value, opts.nodeId) : undefined;
    const isEdit = mode === "edit";
    setCode(isEdit ? (node?.code ?? "") : "");
    setName(isEdit ? node?.name ?? "" : "");
    setErrors({});
    setDialog({ mode, nodeId: opts.nodeId, parentId: opts.parentId });
  }

  function openLevelAdd() {
    if (onRequestAdd) {
      onRequestAdd(null);
      setActionsNodeId(null);
      return;
    }
    openDialog("add-root");
  }

  function closeActions() {
    setActionsNodeId(null);
    setConfirmingDelete(false);
  }

  function handleAddChild(node: TreeNode) {
    if (onRequestAdd) {
      closeActions();
      onRequestAdd(node.id);
    } else {
      openDialog("add-child", { parentId: node.id });
    }
  }

  function handleEditNode(node: TreeNode) {
    if (onRequestEdit) {
      closeActions();
      onRequestEdit(node);
    } else {
      openDialog("edit", { nodeId: node.id });
    }
  }

  function performDelete() {
    const node = actionsNode;
    closeActions();
    if (!node) return;
    if (onRequestDelete) {
      onRequestDelete(node);
      return;
    }
    onChange(removeNode(value, node.id));
  }

  function save() {
    if (!dialog) return;
    const nextErrors: FormErrors = {};
    const trimmedCode = code.trim();

    if (!trimmedCode) {
      nextErrors.code = "El código es obligatorio";
    } else if (hasCode(value, trimmedCode, dialog.mode === "edit" ? dialog.nodeId : undefined)) {
      nextErrors.code = "El código ya existe en el árbol";
    }

    if (!name.trim()) {
      nextErrors.name = "El nombre es obligatorio";
    }

    if (nextErrors.code || nextErrors.name) {
      setErrors(nextErrors);
      return;
    }

    const node = createNode(trimmedCode, name.trim());
    const apply = (nodes: TreeNode[]): TreeNode[] => {
      switch (dialog.mode) {
        case "add-root":
          return [...nodes, node];
        case "add-child":
          return dialog.parentId ? addChild(nodes, dialog.parentId, node) : nodes;
        case "add-sibling":
          return dialog.nodeId ? addSibling(nodes, dialog.nodeId, node) : nodes;
        case "edit":
          return dialog.nodeId ? updateNode(nodes, dialog.nodeId, { code: trimmedCode, name: name.trim() }) : nodes;
      }
    };
    onChange(apply(value));
    setDialog(null);
  }

  const dialogTitle = (() => {
    switch (dialog?.mode) {
      case "add-root":
        return "Nueva raíz";
      case "add-child":
        return `Nuevo hijo de ${dialogParent?.name ?? ""}`;
      case "add-sibling":
        return `Nuevo al lado de ${dialogNode?.name ?? ""}`;
      case "edit":
        return `Editar ${dialogNode?.name ?? ""}`;
      default:
        return "";
    }
  })();

  return (
    <View style={[styles.container, { backgroundColor: vt.containerBg }, style]}>
      <View>
        {renderForest(ctx, value, 0)}
      </View>

      {isEdit ? (
        <Pressable
          onPress={openLevelAdd}
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

      <CardStackSheet visible={actionsNodeId !== null} onClose={closeActions}>
        <Card>
          {actionsNode ? (
            <>
              <OptionListItem
                icon={AppIcon.Add}
                title="Agregar hijo"
                description="Creá una cuenta dependiente de esta."
                onPress={() => handleAddChild(actionsNode)}
                showSeparator
              />
              <OptionListItem
                icon={AppIcon.Pencil}
                title="Editar"
                description="Modificá el código y el nombre."
                onPress={() => handleEditNode(actionsNode)}
                showSeparator
              />
              <OptionListItem
                icon={AppIcon.Trash}
                title="Eliminar"
                description="Borrá la cuenta y sus subcuentas."
                variant={OptionListItemVariant.Destructive}
                onPress={() => setConfirmingDelete(true)}
              />
            </>
          ) : null}
        </Card>
        <TransitionView contentKey={confirmingDelete ? "confirm" : "none"}>
          {confirmingDelete && actionsNode ? (
            <Card>
              <Text variant={TextType.BodyMedium} color={palette.danger}>
                {countNodes(actionsNode.children) > 0
                  ? `¿Eliminar "${actionsNode.name}" y sus ${countNodes(actionsNode.children)} subitem${countNodes(actionsNode.children) === 1 ? "" : "s"}?`
                  : `¿Eliminar "${actionsNode.name}"?`}
              </Text>
              <Text variant={TextType.Caption} color={vt.textSecondary}>
                Esta acción no se puede deshacer.
              </Text>
              <View style={styles.confirmActions}>
                <AppButton
                  label="Cancelar"
                  variant="ghost"
                  style={styles.confirmButton}
                  onPress={() => setConfirmingDelete(false)}
                />
                <AppButton
                  label="Eliminar"
                  backgroundColor={palette.danger}
                  textColor="#FFFFFF"
                  style={styles.confirmButton}
                  onPress={performDelete}
                />
              </View>
            </Card>
          ) : null}
        </TransitionView>
      </CardStackSheet>

      <AppResponsiveDialog
        visible={dialog !== null}
        onClose={() => setDialog(null)}
        title={dialogTitle}
        caption="El código debe ser único en todo el árbol"
        snapPoints={["60%"]}
      >
        <View style={styles.dialogBody}>
          <TextField
            label="Código"
            value={code}
            onChangeText={(v) => {
              setCode(v);
              if (errors.code) setErrors((prev) => ({ ...prev, code: undefined }));
            }}
            placeholder="Ej: 1.1.1.1"
            error={errors.code}
          />
          <TextField
            label="Nombre"
            value={name}
            onChangeText={(v) => {
              setName(v);
              if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
            }}
            placeholder="Ej: Activo fijo"
            error={errors.name}
          />
          <View style={styles.dialogActions}>
            <AppButton label="Cancelar" variant="ghost" onPress={() => setDialog(null)} style={styles.dialogButton} />
            <AppButton label="Guardar" onPress={save} style={styles.dialogButton} />
          </View>
        </View>
      </AppResponsiveDialog>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: space.space2,
  },
  pressed: {
    opacity: 0.6,
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
  subtree: {
    overflow: "hidden",
  },
  addChip: {
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 11,
  },
  confirmActions: {
    flexDirection: "row",
    gap: space.space3,
    marginTop: space.space4,
  },
  confirmButton: {
    flex: 1,
  },
  dialogBody: {
    gap: space.space4,
  },
  dialogActions: {
    flexDirection: "row",
    gap: space.space3,
    marginTop: space.space2,
  },
  dialogButton: {
    flex: 1,
  },
});
