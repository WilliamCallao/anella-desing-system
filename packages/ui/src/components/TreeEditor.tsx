import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { border, card, cta1, palette, radius, space, text, TextType } from "@antonella/theme";
import { Text } from "./text/Text";
import { Icon, type IconName } from "./Icon";
import { AppResponsiveDialog } from "./AppResponsiveDialog";
import { BottomSheet } from "./BottomSheet";
import { TextField } from "./TextField";
import { AppButton } from "./card-form/AppButton";
import { AppIcon } from "../AppIcons";

export type TreeNode = {
  id: string;
  code: number;
  name: string;
  children: TreeNode[];
};

export type TreeEditorMode = "view" | "edit";

export type TreeEditorProps = {
  value: TreeNode[];
  onChange: (value: TreeNode[]) => void;
  /** Default: "view" (solo visualización). Con "edit" se muestran las acciones. */
  mode?: TreeEditorMode;
  /** Etiqueta del botón de agregar raíz (solo modo edición). Default: "Agregar raíz". */
  rootLabel?: string;
  style?: StyleProp<ViewStyle>;
};

// ----------------------------------------------------------------
// Helpers puros: mutan copias del bosque y devuelven nuevos arrays
// ----------------------------------------------------------------

export function createNode(code: number, name: string, children: TreeNode[] = []): TreeNode {
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

export function hasCode(nodes: TreeNode[], code: number, excludeId?: string): boolean {
  for (const n of nodes) {
    if (n.code === code && n.id !== excludeId) return true;
    if (hasCode(n.children, code, excludeId)) return true;
  }
  return false;
}

export function maxCode(nodes: TreeNode[]): number {
  let max = 0;
  for (const n of nodes) {
    if (n.code > max) max = n.code;
    const childMax = maxCode(n.children);
    if (childMax > max) max = childMax;
  }
  return max;
}

export function countNodes(nodes: TreeNode[]): number {
  return nodes.reduce((acc, n) => acc + 1 + countNodes(n.children), 0);
}

// ----------------------------------------------------------------
// Construcción de filas (DFS) para dibujar conectores tipo file-explorer.
// Solo las filas VISIBLES (respetando el colapso) se usan para los índices
// de conectores; el render recursivo monta siempre los subárboles y los
// anima/clipea con overflow hidden.
// ----------------------------------------------------------------

const INDENT = 24;
const ROW_HEIGHT = 54;
const LINE_COLOR = border.divider.secondary;

const EXPAND_DURATION = 220;
const EXPAND_FADE = 180;
const COLLAPSE_FADE = 120;
const CHEVRON_DURATION = 180;

type FlatRow =
  | { kind: "node"; node: TreeNode; depth: number }
  | { kind: "add"; parentId: string | null; depth: number };

function buildRows(
  nodes: TreeNode[],
  depth: number,
  collapsed: Record<string, boolean>,
  includeAdd: boolean,
  out: FlatRow[],
): FlatRow[] {
  nodes.forEach((node) => {
    out.push({ kind: "node", node, depth });
    const isCollapsed = !!collapsed[node.id];
    if (node.children.length > 0 && !isCollapsed) {
      buildRows(node.children, depth + 1, collapsed, includeAdd, out);
      if (includeAdd) {
        out.push({ kind: "add", parentId: node.id, depth: depth + 1 });
      }
    }
  });
  return out;
}

// Contexto compartido entre el render recursivo y las filas.
type TreeRenderContext = {
  isEdit: boolean;
  collapsed: Record<string, boolean>;
  lastByDepth: Record<number, number>;
  nodeIndex: Map<string, number>;
  addIndex: Map<string, number>;
  onToggle: (id: string) => void;
  onOpenActions: (id: string) => void;
  onAdd: (parentId: string | null) => void;
};

// Dibuja los conectores de una fila. Lógica verificada contra el render
// canónico de VS Code ("├─/│/└─"): por el nivel k pasa una línea mientras
// exista una fila posterior de profundidad k+1; la última fila de ese nivel
// recibe solo el tramo superior (el codo "└") que se une al stub.
function renderGutter(
  depth: number,
  rowIndex: number,
  lastByDepth: Record<number, number>,
): React.ReactNode {
  const segments = [];
  for (let k = 0; k < depth; k++) {
    const last = lastByDepth[k + 1];
    if (last === undefined || last < rowIndex) continue;
    const isLastStub = last === rowIndex;
    segments.push(
      <View
        key={`v${k}`}
        style={[
          styles.line,
          {
            left: k * INDENT,
            top: 0,
            bottom: isLastStub ? ROW_HEIGHT / 2 - 0.5 : 0,
          },
        ]}
      />,
    );
  }
  // Stub horizontal: conecta la línea del padre con el contenido de la fila.
  // Las filas "+ Agregar" también lo reciben, para verse como un item más
  // del nivel.
  if (depth > 0) {
    segments.push(
      <View
        key="h"
        style={[
          styles.line,
          {
            left: (depth - 1) * INDENT,
            top: ROW_HEIGHT / 2 - 0.5,
            width: INDENT,
            height: 1,
          },
        ]}
      />,
    );
  }
  return <>{segments}</>;
}

// Fila "+ Agregar" de un nivel. Solo visible si el padre está expandido (o es
// la raíz); si el padre está colapsado queda clipeada dentro del contenedor.
function renderAddRow(ctx: TreeRenderContext, parentId: string | null, depth: number): React.ReactNode {
  const rowIndex = ctx.addIndex.get(parentId ?? "root") ?? -1;
  return (
    <View key={`add-${parentId ?? "root"}`} style={[styles.row, { paddingLeft: depth * INDENT }]}>
      {renderGutter(depth, rowIndex, ctx.lastByDepth)}
      <View style={styles.rowContent}>
        <View style={styles.chevronSpacer} />
        <Pressable
          onPress={() => ctx.onAdd(parentId)}
          style={({ pressed }) => [styles.addRow, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Agregar item en este nivel"
        >
          <Icon name="add" size={14} color={text.secondary} />
          <Text variant={TextType.Caption} color={text.secondary}>
            Agregar
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function renderForest(ctx: TreeRenderContext, nodes: TreeNode[], depth: number): React.ReactNode {
  return (
    <>
      {nodes.map((node) => (
        <TreeNodeItem key={node.id} node={node} depth={depth} ctx={ctx} />
      ))}
    </>
  );
}

// Nodo del árbol: fila clickeable (colapsa/expande en toda la fila) + contenedor
// animado del subárbol (altura/opacidad/chevron, patrón de AppSelector).
function TreeNodeItem({ node, depth, ctx }: { node: TreeNode; depth: number; ctx: TreeRenderContext }) {
  const hasChildren = node.children.length > 0;
  const isCollapsed = !!ctx.collapsed[node.id];
  const rowIndex = ctx.nodeIndex.get(node.id) ?? -1;

  // Altura del subárbol calculada de forma determinística: cada fila visible
  // (nodo o "+ Agregar") mide exactamente ROW_HEIGHT, así que no hace falta
  // medir con onLayout (que reporta 0 por el overflow:hidden del contenedor).
  const subtreeRows: FlatRow[] = [];
  buildRows(node.children, depth + 1, ctx.collapsed, ctx.isEdit, subtreeRows);
  const expandedHeight = (subtreeRows.length + (ctx.isEdit ? 1 : 0)) * ROW_HEIGHT;

  const heightAnim = useRef(new Animated.Value(isCollapsed ? 0 : expandedHeight)).current;
  const contentOpacity = useRef(new Animated.Value(isCollapsed ? 0 : 1)).current;
  const chevronAnim = useRef(new Animated.Value(isCollapsed ? 0 : 1)).current;
  const measured = useRef(false);

  const chevronRotate = useMemo(
    () => chevronAnim.interpolate({ inputRange: [0, 1], outputRange: ["-90deg", "0deg"] }),
    [chevronAnim],
  );

  useEffect(() => {
    if (!measured.current) {
      // Primer render: fijar el estado sin animación.
      measured.current = true;
      heightAnim.setValue(isCollapsed ? 0 : expandedHeight);
      contentOpacity.setValue(isCollapsed ? 0 : 1);
      chevronAnim.setValue(isCollapsed ? 0 : 1);
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
      Animated.timing(chevronAnim, {
        toValue: isCollapsed ? 0 : 1,
        duration: CHEVRON_DURATION,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [isCollapsed, expandedHeight, heightAnim, contentOpacity, chevronAnim]);

  return (
    <>
      <Pressable
        onPress={hasChildren ? () => ctx.onToggle(node.id) : undefined}
        disabled={!hasChildren}
        style={({ pressed }) => [
          styles.row,
          { paddingLeft: depth * INDENT },
          hasChildren && pressed && styles.pressed,
        ]}
        accessibilityRole={hasChildren ? "button" : undefined}
        accessibilityState={hasChildren ? { expanded: !isCollapsed } : undefined}
        accessibilityLabel={hasChildren ? `${isCollapsed ? "Expandir" : "Colapsar"} ${node.name}` : undefined}
      >
        {renderGutter(depth, rowIndex, ctx.lastByDepth)}
        <View style={styles.rowContent}>
          {hasChildren ? (
            <Animated.View style={[styles.chevron, { transform: [{ rotate: chevronRotate }] }]}>
              <Icon name="chevron-down" size={14} color={text.secondary} />
            </Animated.View>
          ) : (
            <View style={styles.chevronSpacer} />
          )}
          <View style={styles.textBlock}>
            <Text variant={TextType.Overline} color={text.secondary} numberOfLines={1}>
              {String(node.code)}
            </Text>
            <Text variant={TextType.BodyMedium} color={card.text.primary} numberOfLines={1}>
              {node.name}
            </Text>
          </View>
          {ctx.isEdit ? (
            <Pressable
              onPress={() => ctx.onOpenActions(node.id)}
              hitSlop={8}
              style={({ pressed }) => [styles.actions, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel={`Acciones de ${node.name}`}
            >
              <Icon name="more-horizontal" size={18} color={text.secondary} />
            </Pressable>
          ) : null}
        </View>
      </Pressable>
      {hasChildren ? (
        <Animated.View style={[styles.subtree, { height: heightAnim }]}>
          <Animated.View style={{ opacity: contentOpacity }}>
            {renderForest(ctx, node.children, depth + 1)}
            {ctx.isEdit ? renderAddRow(ctx, node.id, depth + 1) : null}
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

export function TreeEditor({ value, onChange, mode = "view", rootLabel = "Agregar raíz", style }: TreeEditorProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [actionsNodeId, setActionsNodeId] = useState<string | null>(null);
  const [dialog, setDialog] = useState<DialogState>(null);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const isEdit = mode === "edit";
  const actionsNode = actionsNodeId ? findNode(value, actionsNodeId) : undefined;
  const dialogNode = dialog?.nodeId ? findNode(value, dialog.nodeId) : undefined;
  const dialogParent = dialog?.parentId ? findNode(value, dialog.parentId) : undefined;

  // Filas visibles (respetando colapso) usadas solo para los índices de
  // conectores. El render real es recursivo y monta siempre los subárboles,
  // animándolos con overflow hidden.
  const rows: FlatRow[] = [];
  buildRows(value, 0, collapsed, isEdit, rows);
  if (isEdit) {
    rows.push({ kind: "add", parentId: null, depth: 0 });
  }

  // Último índice de fila por profundidad + mapas de índice (nodo y fila "+") para los conectores.
  const lastByDepth: Record<number, number> = {};
  const nodeIndex = new Map<string, number>();
  const addIndex = new Map<string, number>();
  rows.forEach((row, i) => {
    // Incluye también las filas "+ Agregar": así la línea del padre llega hasta
    // el botón y se ve como un item más del nivel.
    lastByDepth[row.depth] = i;
    if (row.kind === "node") {
      nodeIndex.set(row.node.id, i);
    } else {
      addIndex.set(row.parentId ?? "root", i);
    }
  });

  const ctx: TreeRenderContext = {
    isEdit,
    collapsed,
    lastByDepth,
    nodeIndex,
    addIndex,
    onToggle: toggleCollapse,
    onOpenActions: openActions,
    onAdd: openLevelAdd,
  };

  function toggleCollapse(id: string) {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function openActions(nodeId: string) {
    setActionsNodeId(nodeId);
  }

  function openDialog(mode: DialogMode, opts: { nodeId?: string; parentId?: string } = {}) {
    setActionsNodeId(null);
    const node = opts.nodeId ? findNode(value, opts.nodeId) : undefined;
    const isEdit = mode === "edit";
    setCode(isEdit ? String(node?.code ?? "") : String(maxCode(value) + 1));
    setName(isEdit ? node?.name ?? "" : "");
    setErrors({});
    setDialog({ mode, nodeId: opts.nodeId, parentId: opts.parentId });
  }

  function openLevelAdd(parentId: string | null) {
    if (parentId === null) {
      openDialog("add-root");
      return;
    }
    const parent = findNode(value, parentId);
    const lastChild = parent?.children[parent.children.length - 1];
    if (lastChild) openDialog("add-sibling", { nodeId: lastChild.id });
  }

  function confirmDelete(nodeId: string) {
    setActionsNodeId(null);
    const node = findNode(value, nodeId);
    if (!node) return;
    const subItems = countNodes(node.children);
    const message =
      subItems > 0
        ? `¿Eliminar "${node.name}" y sus ${subItems} subitem${subItems === 1 ? "" : "s"}?`
        : `¿Eliminar "${node.name}"?`;
    Alert.alert("Eliminar", message, [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => onChange(removeNode(value, nodeId)) },
    ]);
  }

  function save() {
    if (!dialog) return;
    const nextErrors: FormErrors = {};
    const codeNum = Number(code.trim());

    if (!code.trim()) {
      nextErrors.code = "El código es obligatorio";
    } else if (!Number.isInteger(codeNum) || codeNum <= 0) {
      nextErrors.code = "Ingresá un código numérico válido";
    } else if (hasCode(value, codeNum, dialog.mode === "edit" ? dialog.nodeId : undefined)) {
      nextErrors.code = "El código ya existe en el árbol";
    }

    if (!name.trim()) {
      nextErrors.name = "El nombre es obligatorio";
    }

    if (nextErrors.code || nextErrors.name) {
      setErrors(nextErrors);
      return;
    }

    const node = createNode(codeNum, name.trim());
    const apply = (nodes: TreeNode[]): TreeNode[] => {
      switch (dialog.mode) {
        case "add-root":
          return [...nodes, node];
        case "add-child":
          return dialog.parentId ? addChild(nodes, dialog.parentId, node) : nodes;
        case "add-sibling":
          return dialog.nodeId ? addSibling(nodes, dialog.nodeId, node) : nodes;
        case "edit":
          return dialog.nodeId ? updateNode(nodes, dialog.nodeId, { code: codeNum, name: name.trim() }) : nodes;
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

  const ACTION_SHEET_OPTIONS: {
    key: string;
    label: string;
    icon: IconName;
    danger?: boolean;
    onPress: () => void;
  }[] = actionsNode
    ? [
        { key: "child", label: "Agregar hijo", icon: AppIcon.Add, onPress: () => openDialog("add-child", { parentId: actionsNode.id }) },
        { key: "edit", label: "Editar", icon: AppIcon.Pencil, onPress: () => openDialog("edit", { nodeId: actionsNode.id }) },
        { key: "delete", label: "Eliminar", icon: AppIcon.Trash, danger: true, onPress: () => confirmDelete(actionsNode.id) },
      ]
    : [];

  // Dibuja los conectores de una fila. Lógica verificada contra el render
  // canónico de VS Code ("├─/│/└─"): por el nivel k pasa una línea mientras
  // exista una fila posterior de profundidad k+1; la última fila de ese nivel
  // recibe solo el tramo superior (el codo "└") que se une al stub.

  return (
    <View style={[styles.container, style]}>
      {isEdit ? (
        <Pressable
          onPress={() => openDialog("add-root")}
          style={({ pressed }) => [styles.addRoot, pressed && styles.pressed]}
          accessibilityRole="button"
        >
          <Icon name="add" size={18} color={cta1} />
          <Text variant={TextType.BodyMedium} color={cta1}>
            {rootLabel}
          </Text>
        </Pressable>
      ) : null}

      <View>
        {renderForest(ctx, value, 0)}
        {ctx.isEdit ? renderAddRow(ctx, null, 0) : null}
      </View>

      <BottomSheet
        visible={actionsNodeId !== null}
        onClose={() => setActionsNodeId(null)}
        title={actionsNode?.name}
        caption="Seleccioná una acción"
        showCloseButton
      >
        <View style={styles.sheetOptions}>
          {ACTION_SHEET_OPTIONS.map((option, idx) => (
            <Pressable
              key={option.key}
              onPress={option.onPress}
              style={({ pressed }) => [
                styles.sheetOption,
                idx < ACTION_SHEET_OPTIONS.length - 1 && styles.sheetOptionSeparator,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
            >
              <Icon name={option.icon} size={20} color={option.danger ? palette.danger : text.default} />
              <Text variant={TextType.Body} color={option.danger ? palette.danger : card.text.primary}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </BottomSheet>

      <AppResponsiveDialog
        visible={dialog !== null}
        onClose={() => setDialog(null)}
        title={dialogTitle}
        caption="El código debe ser numérico y único en todo el árbol"
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
            keyboardType="number-pad"
            placeholder="Ej: 1300"
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
    backgroundColor: card.background,
    borderRadius: radius.md,
    overflow: "hidden",
  },
  pressed: {
    opacity: 0.6,
  },
  addRoot: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.space2,
    minHeight: ROW_HEIGHT,
    paddingHorizontal: space.space3,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: border.divider.secondary,
  },
  row: {
    position: "relative",
    minHeight: ROW_HEIGHT,
    justifyContent: "center",
  },
  line: {
    position: "absolute",
    width: 1,
    backgroundColor: LINE_COLOR,
  },
  rowContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: space.space1,
    paddingRight: space.space2,
  },
  chevron: {
    width: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  chevronSpacer: {
    width: 24,
  },
  textBlock: {
    flex: 1,
    gap: 1,
  },
  actions: {
    padding: space.space1,
    marginLeft: space.space1,
  },
  subtree: {
    overflow: "hidden",
  },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.space1,
    minHeight: 34,
    paddingHorizontal: space.space2,
    marginVertical: space.space1,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: border.divider.secondary,
    borderRadius: radius.sm,
  },
  sheetOptions: {
    gap: 0,
  },
  sheetOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.space3,
    minHeight: 52,
    paddingHorizontal: space.space2,
  },
  sheetOptionSeparator: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: border.divider.secondary,
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
