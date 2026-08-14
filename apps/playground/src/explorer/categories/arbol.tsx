import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { TreeEditor, type TreeEditorMode, type TreeNode } from "@antonella/ui";
import { card, radius, space } from "@antonella/theme";
import type { ComponentCategory } from "../types";

const SAMPLE_TREE: TreeNode[] = [
  {
    id: "activo",
    code: 1000,
    name: "Activo",
    children: [
      {
        id: "activo-caja-bancos",
        code: 1100,
        name: "Caja y bancos",
        children: [
          { id: "activo-caja", code: 1110, name: "Caja", children: [] },
          { id: "activo-bancos", code: 1120, name: "Bancos", children: [] },
        ],
      },
      {
        id: "activo-creditos",
        code: 1200,
        name: "Créditos",
        children: [{ id: "activo-deudores", code: 1210, name: "Deudores por ventas", children: [] }],
      },
    ],
  },
  {
    id: "pasivo",
    code: 2000,
    name: "Pasivo",
    children: [{ id: "pasivo-proveedores", code: 2100, name: "Proveedores", children: [] }],
  },
  { id: "patrimonio", code: 3000, name: "Patrimonio neto", children: [] },
];

function TreeDemo({ mode }: { mode: TreeEditorMode }) {
  const [tree, setTree] = useState<TreeNode[]>(SAMPLE_TREE);
  return (
    <View style={styles.surface}>
      <TreeEditor value={tree} onChange={setTree} mode={mode} />
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    backgroundColor: card.background,
    borderRadius: radius.md,
    padding: space.space3,
  },
});

export const arbol: ComponentCategory = {
  id: "arbol",
  title: "Árbol",
  icon: "git-network",
  components: [
    {
      id: "tree-editor",
      name: "TreeEditor",
      description:
        "Editor de estructuras jerárquicas: cada item tiene código numérico y nombre. Soporta modo vista o edición, con conectores de árbol y alta por nivel.",
      variants: [
        { id: "vista", label: "Modo vista", render: () => <TreeDemo mode="view" /> },
        { id: "edicion", label: "Modo edición", render: () => <TreeDemo mode="edit" /> },
      ],
    },
  ],
};
