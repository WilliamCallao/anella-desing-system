import React, { useState } from "react";
import { View } from "react-native";
import { AppButton, AppResponsiveDialog, Text } from "@antonella/ui";
import type { ComponentCategory } from "../types";
import { demoStyles } from "./shared";

function ResponsiveDialogDemo() {
  const [open, setOpen] = useState(false);
  return (
    <View style={demoStyles.gap}>
      <AppButton label="Abrir diálogo responsivo" variant="ghost" onPress={() => setOpen(true)} />
      <AppResponsiveDialog
        visible={open}
        onClose={() => setOpen(false)}
        title="Diálogo responsivo"
        caption="En celular abre como BottomSheet; en tablet como Modal centrado."
      >
        <Text variant="body">El mismo código sirve para ambas resoluciones.</Text>
      </AppResponsiveDialog>
    </View>
  );
}

export const dialogos: ComponentCategory = {
  id: "dialogos",
  title: "Diálogos",
  icon: "chatbubble",
  components: [
    {
      id: "app-responsive-dialog",
      name: "AppResponsiveDialog",
      description: "Diálogo responsivo: BottomSheet en celular, Modal centrado en tablet. Un solo componente.",
      variants: [
        { id: "open", label: "Abrir", render: () => <ResponsiveDialogDemo /> },
      ],
    },
  ],
};
