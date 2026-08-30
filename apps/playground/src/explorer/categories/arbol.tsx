import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { TreeEditor, type TreeEditorMode, type TreeEditorVariant, type TreeNode } from "@william-callao/antonella-ui";
import { radius, space } from "@william-callao/antonella-theme";
import type { ComponentCategory } from "../types";

const SAMPLE_TREE: TreeNode[] = [
  {
    id: "activo",
    code: "1000",
    name: "Activo",
    children: [
      {
        id: "activo-corriente",
        code: "1100",
        name: "Activo corriente",
        children: [
          {
            id: "activo-caja-bancos",
            code: "1110",
            name: "Caja y bancos",
            children: [
              { id: "activo-caja", code: "1111", name: "Caja MN", children: [] },
              { id: "activo-bancos", code: "1112", name: "Bancos", children: [] },
            ],
          },
          { id: "activo-mercaderias", code: "1120", name: "Inventario de mercaderías", children: [] },
        ],
      },
      {
        id: "activo-nocorriente",
        code: "1200",
        name: "Activo no corriente",
        children: [
          { id: "activo-equipo", code: "1210", name: "Propiedad planta equipo", children: [] },
        ],
      },
    ],
  },
  {
    id: "pasivo",
    code: "2000",
    name: "Pasivo",
    children: [
      {
        id: "pasivo-corriente",
        code: "2100",
        name: "Pasivo corriente",
        children: [
          { id: "pasivo-iva", code: "2110", name: "IVA débito fiscal", children: [] },
        ],
      },
    ],
  },
  { id: "patrimonio", code: "3000", name: "Patrimonio neto", children: [] },
];

function TreeDemo({ mode, variant }: { mode: TreeEditorMode; variant?: TreeEditorVariant }) {
  const [tree, setTree] = useState<TreeNode[]>(SAMPLE_TREE);
  return (
    <View style={variant === "darkness" ? styles.surfaceDark : styles.surface}>
      <TreeEditor value={tree} onChange={setTree} mode={mode} variant={variant} />
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    backgroundColor: "#F7F7FA",
    borderRadius: radius.md,
    padding: space.space3,
  },
  surfaceDark: {
    backgroundColor: "#000000",
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
        "Editor de estructuras jerárquicas con conectores tipo file-explorer. Modo vista (solo lectura) y edición (acciones por nodo). Variantes default y darkness.",
      variants: [
        { id: "vista", label: "Vista", render: () => <TreeDemo mode="view" /> },
        { id: "edicion", label: "Edición", render: () => <TreeDemo mode="edit" /> },
        { id: "darkness-vista", label: "Darkness vista", render: () => <TreeDemo mode="view" variant="darkness" /> },
        { id: "darkness-edicion", label: "Darkness edición", render: () => <TreeDemo mode="edit" variant="darkness" /> },
      ],
    },
  ],
};
