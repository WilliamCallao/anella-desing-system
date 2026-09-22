import React, { useState } from "react";
import { Pressable, StyleSheet, TextInput, View, type StyleProp, type ViewStyle } from "react-native";
import { TextType, cta1, lightSemantic, resolveSemantic, space } from "@william-callao/antonella-theme";
import { Text } from "./text";
import { Icon } from "./Icon";
import type { IconName } from "./Icon";

// ── Style enum ──────────────────────────────────────────────

export enum ProductCardStyle {
  DEFAULT = "DEFAULT",
  LIGHT = "LIGHT",
  DARKNESS = "DARKNESS",
}

// ── Types ───────────────────────────────────────────────────

export type ProductCardCart = {
  quantity?: number;
  unitPrice?: string;
  code?: string;
};

export type ProductCardProps = {
  name: string;
  // Precio total opcional: en el modo carrito se muestra a la derecha del título.
  price?: string;
  // Código de barras: se muestra en ambos modos.
  code?: string;
  // Modo carrito: cambia el layout (título sobre la imagen, código + precio
  // unitario junto a la imagen, total y stepper a la derecha).
  cart?: ProductCardCart;
  // Tope de unidades seleccionables: limita steppers y edición manual a este
  // máximo (p. ej. el stock disponible). Sin el prop, el card acepta cualquier
  // cantidad (comportamiento previo). Con máximo 0, el botón Añadir queda
  // deshabilitado (sin stock).
  maxQuantity?: number;
  // Notifica cada cambio de cantidad (steppers o edición manual).
  onQuantityChange?: (quantity: number) => void;
  // Ícono del placeholder de imagen.
  imageIcon?: IconName;
  style?: ProductCardStyle;
  // Override de estilo para el card contenedor.
  containerStyle?: StyleProp<ViewStyle>;
};

// ── Config ──────────────────────────────────────────────────

const STYLE_CONTEXT: Record<ProductCardStyle, "default" | "light" | "darkness"> = {
  [ProductCardStyle.DEFAULT]: "default",
  [ProductCardStyle.LIGHT]: "light",
  [ProductCardStyle.DARKNESS]: "darkness",
};

// ── Component ───────────────────────────────────────────────

export function ProductCard({
  name,
  price,
  code,
  cart,
  maxQuantity,
  onQuantityChange,
  imageIcon = "camera",
  style = ProductCardStyle.DEFAULT,
  containerStyle,
}: ProductCardProps) {
  const ctx = resolveSemantic(lightSemantic)[STYLE_CONTEXT[style]];
  const [quantity, setQuantity] = useState(cart?.quantity ?? 0);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(cart?.quantity ?? 0));

  const hasMax = maxQuantity != null && Number.isFinite(maxQuantity);
  const max = hasMax ? Math.max(0, Math.floor(maxQuantity as number)) : 0;
  const atMax = hasMax && quantity >= max;

  const commitQuantity = () => {
    const parsed = Number.parseInt(draft, 10);
    const raw = Number.isNaN(parsed) || parsed < 0 ? 0 : parsed;
    const next = hasMax ? Math.min(raw, max) : raw;
    setQuantity(next);
    setDraft(String(next));
    setEditing(false);
    onQuantityChange?.(next);
  };

  const startEditing = () => {
    setDraft(String(quantity));
    setEditing(true);
  };

  // Modo solo-info: horizontal y compacto (imagen a la izquierda).
  if (!cart) {
    return (
      <View style={[styles.card, styles.rowCard, { backgroundColor: ctx.bg.subtle }, containerStyle]}>
        <View style={[styles.imageBoxLarge, { backgroundColor: ctx.bg.default }]}>
          <Icon name={imageIcon} size={26} color={ctx.icon.subtle} />
        </View>
        <View style={styles.body}>
          <Text variant={TextType.BodyMedium} color={ctx.text.default} numberOfLines={1}>
            {name}
          </Text>
          {code ? (
            <View style={styles.codeRow}>
              <Icon name="scan" size={13} color={ctx.icon.subtle} />
              <Text variant={TextType.Caption} color={ctx.text.subtle} numberOfLines={1}>
                {code}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    );
  }

  // Modo carrito: apilado, el título va por encima de la imagen.
  return (
    <View style={[styles.card, styles.stackCard, { backgroundColor: ctx.bg.subtle }, containerStyle]}>
      <View style={styles.titleRow}>
        <Text variant={TextType.BodyBold} color={ctx.text.default} numberOfLines={2} style={styles.titleFill}>
          {name}
        </Text>
        {price ? (
          <Text variant={TextType.BodyBold} color={cta1} numberOfLines={1} style={styles.total}>
            {price}
          </Text>
        ) : null}
      </View>
      <View style={styles.contentRow}>
        <View style={[styles.imageBox, { backgroundColor: ctx.bg.default }]}>
          <Icon name={imageIcon} size={22} color={ctx.icon.subtle} />
        </View>
        <View style={styles.controls}>
          {cart.code ? (
            <View style={styles.codeRow}>
              <Icon name="scan" size={13} color={ctx.icon.subtle} />
              <Text variant={TextType.Caption} color={ctx.text.subtle} numberOfLines={1} style={styles.code}>
                {cart.code}
              </Text>
            </View>
          ) : null}
          {cart.unitPrice ? (
            <View style={styles.codeRow}>
              <Text variant={TextType.Caption} color={ctx.text.subtle} numberOfLines={1}>
                {cart.unitPrice} c/u
              </Text>
            </View>
          ) : null}
        </View>
        <View style={styles.column}>
          {quantity >= 1 ? (
          <View style={[styles.stepper, { backgroundColor: ctx.bg.default }]}>
            <Pressable
              onPress={() => {
                const q = Math.max(0, quantity - 1);
                setQuantity(q);
                setDraft(String(q));
                onQuantityChange?.(q);
              }}
              style={({ pressed }) => [
                styles.stepperButton,
                { backgroundColor: ctx.bg.subtle },
                pressed && styles.stepperButtonPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Disminuir cantidad"
            >
              <Text variant={TextType.BodyMedium} color={cta1}>−</Text>
            </Pressable>
            {editing ? (
              <TextInput
                style={[styles.quantityInput, { color: ctx.text.default }]}
                value={draft}
                onChangeText={setDraft}
                keyboardType="number-pad"
                autoFocus
                selectTextOnFocus
                onBlur={commitQuantity}
                onSubmitEditing={commitQuantity}
                returnKeyType="done"
              />
            ) : (
              <Pressable onPress={startEditing} accessibilityRole="button" accessibilityLabel="Editar cantidad">
                <Text variant={TextType.BodyMedium} color={ctx.text.default} style={styles.quantity}>
                  {quantity}
                </Text>
              </Pressable>
            )}
            <Pressable
              onPress={() => {
                if (atMax) return;
                const q = quantity + 1;
                setQuantity(q);
                setDraft(String(q));
                onQuantityChange?.(q);
              }}
              style={({ pressed }) => [
                styles.stepperButton,
                { backgroundColor: ctx.bg.subtle },
                pressed && styles.stepperButtonPressed,
                atMax && styles.stepperButtonDisabled,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Aumentar cantidad"
              accessibilityState={{ disabled: atMax }}
            >
              <Icon name="add" size={16} color={cta1} />
            </Pressable>
          </View>
          ) : (
          <Pressable
            onPress={() => {
              setQuantity(1);
              setDraft("1");
              onQuantityChange?.(1);
            }}
            disabled={hasMax && max <= 0}
            style={({ pressed }) => [
              styles.addButton,
              { backgroundColor: ctx.bg.default },
              hasMax && max <= 0
                ? styles.addButtonDisabled
                : pressed && styles.stepperButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Añadir al carrito"
            accessibilityState={{ disabled: hasMax && max <= 0 }}
          >
            <Icon name="add" size={16} color={hasMax && max <= 0 ? ctx.text.subtle : cta1} />
            <Text variant={TextType.Caption} color={hasMax && max <= 0 ? ctx.text.subtle : cta1}>Añadir</Text>
          </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: space.space3,
  },
  rowCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.space3,
  },
  stackCard: {
    gap: space.space2,
  },
  imageBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  imageBoxLarge: {
    width: 72,
    height: 72,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: space.space2,
  },
  titleFill: {
    flex: 1,
  },
  total: {
    textAlign: "right",
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: space.space3,
  },
  controls: {
    flex: 1,
    gap: space.space2,
    alignItems: "flex-start",
  },
  code: {
    flex: 1,
  },
  column: {
    alignItems: "flex-end",
    alignSelf: "stretch",
    justifyContent: "flex-end",
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.space1,
    borderRadius: 999,
    padding: 3,
  },
  stepperButton: {
    width: 28,
    height: 28,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperButtonPressed: {
    opacity: 0.6,
  },
  stepperButtonDisabled: {
    opacity: 0.35,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.space2,
    paddingHorizontal: space.space3,
    paddingVertical: space.space2,
    borderRadius: 999,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  quantity: {
    minWidth: 32,
    textAlign: "center",
  },
  quantityInput: {
    minWidth: 40,
    height: 28,
    paddingVertical: 0,
    paddingHorizontal: space.space1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  codeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});