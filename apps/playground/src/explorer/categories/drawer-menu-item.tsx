import React from "react";
import { StyleSheet, View } from "react-native";
import { Item, ItemStyle, ChipRow, AppIcon } from "@antonella/ui";
import { resolveSemantic, lightSemantic } from "@antonella/theme";
import type { ComponentCategory } from "../types";
import type { IconName } from "@antonella/ui";

const _s = resolveSemantic(lightSemantic);

function ItemDefaultDemo() {
  return (
    <View style={[styles.container, { backgroundColor: _s.default.bg.default, borderRadius: 16, padding: 12 }]}>
      <Item icon={AppIcon.Chat} label="Chat" onPress={() => {}} />
      <Item icon={AppIcon.Bell} label="Notificaciones" onPress={() => {}} />
      <Item icon={AppIcon.Pencil} label="Editar perfil" onPress={() => {}} selected />
    </View>
  );
}

function ItemLightDemo() {
  return (
    <View style={[styles.container, { backgroundColor: _s.light.bg.default, borderRadius: 16, padding: 12 }]}>
      <Item icon={AppIcon.Chat} label="Chat" onPress={() => {}} style={ItemStyle.LIGHT} />
      <Item icon={AppIcon.Bell} label="Notificaciones" onPress={() => {}} style={ItemStyle.LIGHT} />
      <Item icon={AppIcon.Pencil} label="Editar perfil" onPress={() => {}} style={ItemStyle.LIGHT} selected />
    </View>
  );
}

function ItemDarknessDemo() {
  return (
    <View style={[styles.container, { backgroundColor: _s.darkness.bg.default, borderRadius: 16, padding: 12 }]}>
      <Item icon={AppIcon.Chat} label="Chat" onPress={() => {}} style={ItemStyle.DARKNESS} />
      <Item icon={AppIcon.Bell} label="Notificaciones" onPress={() => {}} style={ItemStyle.DARKNESS} />
      <Item icon={AppIcon.Pencil} label="Editar perfil" onPress={() => {}} style={ItemStyle.DARKNESS} selected />
    </View>
  );
}

function ItemNoIconDemo() {
  return (
    <View style={[styles.container, { backgroundColor: _s.default.bg.default, borderRadius: 16, padding: 12 }]}>
      <Item label="Sin icono" onPress={() => {}} />
      <Item label="Seleccionado" onPress={() => {}} selected />
    </View>
  );
}

// ── Horizontal chip row ─────────────────────────────────────

const CHIP_OPTIONS = [
  { icon: AppIcon.Home, label: "Inicio", value: "inicio" },
  { icon: AppIcon.Chat, label: "Chat", value: "chat" },
  { icon: AppIcon.Bell, label: "Alertas", value: "alertas" },
  { icon: AppIcon.Analytics, label: "Reportes", value: "reportes" },
  { icon: AppIcon.Calendario, label: "Calendario", value: "calendario" },
  { icon: AppIcon.Configuracion, label: "Ajustes", value: "ajustes" },
];

function HorizontalChipRowDemo() {
  return (
    <View style={[styles.chipSection, { backgroundColor: _s.darkness.bg.default }]}>
      <ChipRow
        options={CHIP_OPTIONS}
        selected="inicio"
        style={ItemStyle.DARKNESS}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  chipSection: {
    borderRadius: 16,
  },
});

export const drawerMenuItem: ComponentCategory = {
  id: "drawer-menu-item",
  title: "Item",
  icon: "menu",
  components: [
    {
      id: "default",
      name: "DEFAULT",
      description: "Fondo bg.default.subtle, icono bg.default.default.",
      variants: [
        { id: "all", label: "Items", render: () => <ItemDefaultDemo /> },
      ],
    },
    {
      id: "light",
      name: "LIGHT",
      description: "Fondo bg.light.subtle, icono bg.light.default.",
      variants: [
        { id: "all", label: "Items", render: () => <ItemLightDemo /> },
      ],
    },
    {
      id: "darkness",
      name: "DARKNESS",
      description: "Fondo bg.darkness.subtle, icono bg.darkness.default.",
      variants: [
        { id: "all", label: "Items", render: () => <ItemDarknessDemo /> },
      ],
    },
    {
      id: "no-icon",
      name: "Sin icono",
      description: "Solo texto, sin icono.",
      variants: [
        { id: "all", label: "Items", render: () => <ItemNoIconDemo /> },
      ],
    },
    {
      id: "horizontal-chip",
      name: "Chip Row",
      description: "Fila horizontal con scroll, borde brand al seleccionar.",
      variants: [
        { id: "all", label: "Chips", render: () => <HorizontalChipRowDemo /> },
      ],
    },
  ],
};
