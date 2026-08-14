import React, { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { border, card, cta1, palette, radius, space, text, TextType } from "@antonella/theme";
import { Text } from "./text/Text";
import { Icon } from "./Icon";
import { AppResponsiveDialog } from "./AppResponsiveDialog";
import { BottomSheet } from "./BottomSheet";
import { TextField } from "./TextField";
import { AppButton } from "./card-form/AppButton";

export type TreeNode = {
  id: string;
  code: number;
  name: string;
  children: TreeNode[];
};

export type TreeEditorProps = {
  value: TreeNode[];
  onChange: (value: TreeNode[]) => void;
  /** Etiqueta del botón de agregar raíz. Default: "Agregar raíz". */
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
// Componente
// ----------------------------------------------------------------

const INDENT = 20;
const ROW_MIN_HEIGHT = 44;

type DialogMode = "add-root" | "add-child" | "add-sibling" | "edit";

type DialogState = {
  mode: DialogMode;
  nodeId?: string;
  parentId?: string;
} | null;

type FormErrors = { code?: string; name?: string };

export function TreeEditor({ value, onChange, rootLabel = "Agregar raíz", style }: TreeEditorProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [actionsNodeId, setActionsNodeId] = useState<string | null>(null);
  const [dialog, setDialog] = useState<DialogState>(null);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const actionsNode = actionsNodeId ? findNode(value, actionsNodeId) : undefined;
  const dialogNode = dialog?.nodeId ? findNode(value, dialog.nodeId) : undefined;
  const dialogParent = dialog?.parentId ? findNode(value, dialog.parentId) : undefined;

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
    icon: "add" | "arrow-down" | "pencil" | "trash";
    danger?: boolean;
    onPress: () => void;
  }[] = actionsNode
    ? [
        { key: "child", label: "Agregar hijo", icon: "add", onPress: () => openDialog("add-child", { parentId: actionsNode.id }) },
        { key: "sibling", label: "Agregar al lado", icon: "arrow-down", onPress: () => openDialog("add-sibling", { nodeId: actionsNode.id }) },
        { key: "edit", label: "Editar", icon: "pencil", onPress: () => openDialog("edit", { nodeId: actionsNode.id }) },
        { key: "delete", label: "Eliminar", icon: "trash", danger: true, onPress: () => confirmDelete(actionsNode.id) },
      ]
    : [];

  function renderRows(nodes: TreeNode[], depth: number) {
    return nodes.map((node) => {
      const isCollapsed = !!collapsed[node.id];
      const hasChildren = node.children.length > 0;
      return (
        <View key={node.id}>
          <View style={[styles.row, { paddingLeft: depth * INDENT + space.space2 }]}>
            {hasChildren ? (
              <Pressable
                onPress={() => toggleCollapse(node.id)}
                hitSlop={8}
                style={styles.chevron}
                accessibilityRole="button"
                accessibilityLabel={isCollapsed ? `Expandir ${node.name}` : `Colapsar ${node.name}`}
              >
                <Icon name={isCollapsed ? "chevron-forward" : "chevron-down"} size={16} color={text.secondary} />
              </Pressable>
            ) : (
              <View style={styles.chevronSpacer} />
            )}
            <Text variant={TextType.BodyMedium} color={cta1} style={styles.code} numberOfLines={1}>
              {String(node.code)}
            </Text>
            <Text variant={TextType.Body} color={card.text.primary} style={styles.name} numberOfLines={1}>
              {node.name}
            </Text>
            <Pressable
              onPress={() => openActions(node.id)}
              hitSlop={8}
              style={styles.actions}
              accessibilityRole="button"
              accessibilityLabel={`Acciones de ${node.name}`}
            >
              <Icon name="more-horizontal" size={18} color={text.secondary} />
            </Pressable>
          </View>
          {hasChildren && !isCollapsed ? (
            <View>{renderRows(node.children, depth + 1)}</View>
          ) : null}
        </View>
      );
    });
  }

  return (
    <View style={[styles.container, style]}>
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

      <View>{renderRows(value, 0)}</View>

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
    minHeight: ROW_MIN_HEIGHT,
    paddingHorizontal: space.space3,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: border.divider.secondary,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: ROW_MIN_HEIGHT,
    paddingRight: space.space2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: border.divider.secondary,
  },
  chevron: {
    width: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  chevronSpacer: {
    width: 24,
  },
  code: {
    minWidth: 56,
    marginRight: space.space2,
  },
  name: {
    flex: 1,
  },
  actions: {
    padding: space.space1,
    marginLeft: space.space1,
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
