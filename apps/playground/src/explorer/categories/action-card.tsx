import React from "react";
import { StyleSheet, View } from "react-native";
import { ActionCard, ActionCardStyle } from "@william-callao/antonella-ui";
import { lightSemantic, radius, resolveSemantic, space } from "@william-callao/antonella-theme";
import type { ComponentCategory } from "../types";
import { noop } from "./shared";

const STYLE_CONTEXT: Record<ActionCardStyle, "default" | "light" | "darkness"> = {
  [ActionCardStyle.DEFAULT]: "default",
  [ActionCardStyle.LIGHT]: "light",
  [ActionCardStyle.DARKNESS]: "darkness",
};

function ActionCardRowDemo({ style, count = 3 }: { style: ActionCardStyle; count?: 2 | 3 }) {
  const ctx = resolveSemantic(lightSemantic)[STYLE_CONTEXT[style]];
  const cards = count === 2 ? (
    <>
      <ActionCard
        height={116}
        icon="cart"
        caption="Ventas"
        label="Pedidos"
        style={style}
        onPress={noop}
      />
      <ActionCard
        height={116}
        icon="analytics"
        caption="Resumen"
        label="Reportes"
        style={style}
        onPress={noop}
      />
    </>
  ) : (
    <>
      <ActionCard
        height={116}
        icon="cart"
        caption="Ventas"
        label="Pedidos"
        style={style}
        onPress={noop}
      />
      <ActionCard
        height={116}
        icon="analytics"
        caption="Resumen"
        label="Reportes"
        style={style}
        onPress={noop}
      />
      <ActionCard
        height={116}
        icon="settings"
        caption="Preferencias"
        label="Ajustes"
        style={style}
        onPress={noop}
      />
    </>
  );
  return (
    <View style={[styles.surface, { backgroundColor: ctx.bg.default }]}>
      <View style={styles.row}>{cards}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    borderRadius: radius.lg,
    padding: space.space4,
  },
  row: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: space.space3,
  },
});

export const actionCard: ComponentCategory = {
  id: "actionCard",
  title: "ActionCard",
  icon: "add",
  components: [
    {
      id: "action-card",
      name: "ActionCard",
      description:
        "Card de acción cuadrada para filas del home (3 por fila). Recibe alto, ancho, ícono tipado arriba a la derecha y dos líneas de texto abajo a la izquierda.",
      variants: [
        {
          id: "default",
          label: "Default",
          render: () => <ActionCardRowDemo style={ActionCardStyle.DEFAULT} />,
        },
        {
          id: "light",
          label: "Light",
          render: () => <ActionCardRowDemo style={ActionCardStyle.LIGHT} />,
        },
        {
          id: "darkness",
          label: "Darkness",
          render: () => <ActionCardRowDemo style={ActionCardStyle.DARKNESS} />,
        },
        {
          id: "row-2",
          label: "2 en fila",
          render: () => (
            <>
              <ActionCardRowDemo style={ActionCardStyle.DEFAULT} count={2} />
              <ActionCardRowDemo style={ActionCardStyle.DARKNESS} count={2} />
            </>
          ),
        },
      ],
    },
  ],
};