import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  AppButton,
  AppIcon,
  FloatingActionButton,
  DrawerMenu,
  type DrawerMenuItem,
  Text,
} from "@antonella/ui";
import type { ComponentCategory } from "../types";
import { demoStyles } from "./shared";
import { background, radius, spacing, text, space } from "@antonella/theme";

function DrawerLeftDemo() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("inicio");

  const items: DrawerMenuItem[] = [
    { icon: AppIcon.Home, label: "Inicio", onPress: () => setSelected("inicio"), selected: selected === "inicio" },
    { icon: AppIcon.Reportes, label: "Reportes", onPress: () => setSelected("reportes"), selected: selected === "reportes" },
    { icon: AppIcon.Calendario, label: "Calendario", onPress: () => setSelected("calendario"), selected: selected === "calendario" },
    { icon: AppIcon.Configuracion, label: "Ajustes", onPress: () => setSelected("ajustes"), selected: selected === "ajustes" },
    { icon: AppIcon.Users, label: "Mi perfil", onPress: () => setSelected("perfil"), selected: selected === "perfil" },
  ];

  return (
    <View style={demoStyles.gap}>
      <AppButton label="Abrir drawer izquierdo" variant="ghost" onPress={() => setOpen(true)} />
      <DrawerMenu
        visible={open}
        onClose={() => setOpen(false)}
        side="left"
        items={items}
        header={
          <View style={styles.drawerHeader}>
            <View style={styles.avatar}>
              <Text variant="heading" color="#FFFFFF">A</Text>
            </View>
            <View style={styles.headerInfo}>
              <Text variant="bodyMedium" color={text.default}>Antonella</Text>
              <Text variant="caption" color={text.secondary}>antonella@app.com</Text>
            </View>
          </View>
        }
      />
    </View>
  );
}

function DrawerRightDemo() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("calendario");

  const items: DrawerMenuItem[] = [
    { icon: AppIcon.Calendario, label: "Calendario", onPress: () => setSelected("calendario"), selected: selected === "calendario" },
    { icon: AppIcon.Inspeccion, label: "Inspección", onPress: () => setSelected("inspeccion"), selected: selected === "inspeccion" },
    { icon: AppIcon.Templates, label: "Templates", onPress: () => setSelected("templates"), selected: selected === "templates" },
    { icon: AppIcon.Configuracion, label: "Configuración", onPress: () => setSelected("config"), selected: selected === "config" },
    { label: "Cerrar sesión", destructive: true, onPress: () => {} },
  ];

  return (
    <View style={demoStyles.gap}>
      <AppButton label="Abrir drawer derecho" variant="ghost" onPress={() => setOpen(true)} />
      <DrawerMenu
        visible={open}
        onClose={() => setOpen(false)}
        side="right"
        items={items}
        header={
          <View style={styles.drawerHeaderSimple}>
            <Text variant="heading" color={text.default}>Opciones</Text>
          </View>
        }
        footer={
          <Text variant="caption" color={text.secondary}>
            Antonella v1.0.0
          </Text>
        }
      />
    </View>
  );
}

function DrawerFABDemo() {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.fabCanvas}>
      <View style={demoStyles.gap}>
        <Text variant="caption" color={text.secondary}>
          El FAB abre el drawer izquierdo.
        </Text>
      </View>
      <FloatingActionButton
        icon={AppIcon.Menu}
        position="bottom-left"
        onPress={() => setOpen(true)}
      />
      <DrawerMenu
        visible={open}
        onClose={() => setOpen(false)}
        side="left"
        items={[
          { icon: AppIcon.Home, label: "Inicio", onPress: () => {} },
          { icon: AppIcon.Reportes, label: "Reportes", onPress: () => {} },
          { icon: AppIcon.Configuracion, label: "Ajustes", onPress: () => {} },
        ]}
      />
    </View>
  );
}

function DrawerCustomizableDemo() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("inicio");

  const items: DrawerMenuItem[] = [
    { icon: AppIcon.Home, label: "Inicio", onPress: () => setSelected("inicio"), selected: selected === "inicio" },
    { icon: AppIcon.Reportes, label: "Reportes", onPress: () => setSelected("reportes"), selected: selected === "reportes" },
    { icon: AppIcon.Calendario, label: "Calendario", onPress: () => setSelected("calendario"), selected: selected === "calendario" },
    { icon: AppIcon.Configuracion, label: "Ajustes", onPress: () => setSelected("ajustes"), selected: selected === "ajustes" },
    { label: "Cerrar sesión", destructive: true, onPress: () => {} },
  ];

  return (
    <View style={demoStyles.gap}>
      <AppButton label="Abrir drawer personalizable" variant="ghost" onPress={() => setOpen(true)} />
      <Text variant="caption" color={text.secondary}>
        Toca el ícono de colores arriba a la derecha para personalizar.
      </Text>
      <DrawerMenu
        visible={open}
        onClose={() => setOpen(false)}
        side="left"
        customizable
        items={items}
        header={
          <View style={styles.drawerHeader}>
            <View style={styles.avatar}>
              <Text variant="heading" color="#FFFFFF">A</Text>
            </View>
            <View style={styles.headerInfo}>
              <Text variant="bodyMedium" color={text.default}>Antonella</Text>
              <Text variant="caption" color={text.secondary}>antonella@app.com</Text>
            </View>
          </View>
        }
        footer={
          <Text variant="caption" color={text.secondary}>
            Antonella v1.0.0
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fabCanvas: {
    height: 220,
    backgroundColor: background.default,
    borderRadius: radius.lg,
    overflow: "hidden",
    padding: spacing.md,
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.space3,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
  },
  headerInfo: {
    flex: 1,
    gap: 2,
  },
  drawerHeaderSimple: {
    gap: space.space1,
  },
});

export const drawerMenu: ComponentCategory = {
  id: "drawer-menu",
  title: "Drawer menu",
  icon: "menu",
  components: [
    {
      id: "drawer-left",
      name: "Drawer izquierdo",
      description:
        "Menú lateral con items navegables, header con avatar y estado seleccionado.",
      variants: [{ id: "left", label: "Izquierdo", render: () => <DrawerLeftDemo /> }],
    },
    {
      id: "drawer-right",
      name: "Drawer derecho",
      description:
        "Drawer derecho con acción destructiva y footer.",
      variants: [{ id: "right", label: "Derecho", render: () => <DrawerRightDemo /> }],
    },
    {
      id: "drawer-fab",
      name: "Drawer + FAB",
      description:
        "Drawer abierto por un FloatingActionButton.",
      variants: [{ id: "fab", label: "Con FAB", render: () => <DrawerFABDemo /> }],
    },
    {
      id: "drawer-customizable",
      name: "Drawer personalizable",
      description:
        "Drawer con soporte de personalización de colores. Toca el ícono de colores para editar.",
      variants: [{ id: "customizable", label: "Personalizable", render: () => <DrawerCustomizableDemo /> }],
    },
  ],
};
