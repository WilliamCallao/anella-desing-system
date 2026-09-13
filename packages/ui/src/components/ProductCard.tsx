import React, { useState } from "react";
import { Pressable, StyleSheet, TextInput, View, type StyleProp, type ViewStyle } from "react-native";
import { TextType, cta1, resolveSemantic, lightSemantic, space } from "@william-callao/antonella-theme";
import { Text } from "./text";
import { Icon } from "./Icon";
import type { IconName } from "./Icon";

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
  // Notifica cada cambio de cantidad (steppers o edición manual).
  onQuantityChange?: (quantity: number) => void;
  // Ícono del placeholder de imagen.
  imageIcon?: IconName;
  style?: StyleProp<ViewStyle>;
};

const LIGHT = resolveSemantic(lightSemantic).default;

export function ProductCard({
  name,
  price,
  code,
  cart,
  onQuantityChange,
  imageIcon = "camera",
  style,
}: ProductCardProps) {
  const [quantity, setQuantity] = useState(cart?.quantity ?? 1);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(cart?.quantity ?? 1));

  const commitQuantity = () => {
    const parsed = Number.parseInt(draft, 10);
    const next = Number.isNaN(parsed) || parsed < 1 ? 1 : parsed;
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
      <View style={[styles.card, styles.rowCard, style]}>
        <View style={styles.imageBoxLarge}>
          <Icon name={imageIcon} size={26} color={LIGHT.icon.subtle} />
        </View>
        <View style={styles.body}>
          <Text variant={TextType.BodyMedium} color={LIGHT.text.default} numberOfLines={1}>
            {name}
          </Text>
          {code ? (
            <View style={styles.codeRow}>
              <Icon name="scan" size={13} color={LIGHT.icon.subtle} />
              <Text variant={TextType.Caption} color={LIGHT.text.subtle} numberOfLines={1}>
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
    <View style={[styles.card, styles.stackCard, style]}>
      <View style={styles.titleRow}>
        <Text variant={TextType.BodyBold} color={LIGHT.text.default} numberOfLines={2} style={styles.titleFill}>
          {name}
        </Text>
        {price ? (
          <Text variant={TextType.BodyBold} color={cta1} numberOfLines={1} style={styles.total}>
            {price}
          </Text>
        ) : null}
      </View>
      <View style={styles.contentRow}>
        <View style={styles.imageBox}>
          <Icon name={imageIcon} size={22} color={LIGHT.icon.subtle} />
        </View>
        <View style={styles.controls}>
          {cart.code ? (
            <View style={styles.codeRow}>
              <Icon name="scan" size={13} color={LIGHT.icon.subtle} />
              <Text variant={TextType.Caption} color={LIGHT.text.subtle} numberOfLines={1} style={styles.code}>
                {cart.code}
              </Text>
            </View>
          ) : null}
          {cart.unitPrice ? (
            <View style={styles.codeRow}>
              <Text variant={TextType.Caption} color={LIGHT.text.subtle} numberOfLines={1}>
                {cart.unitPrice} c/u
              </Text>
            </View>
          ) : null}
        </View>
        <View style={styles.column}>
          <View style={styles.stepper}>
            <Pressable
              onPress={() => {
                const q = Math.max(1, quantity - 1);
                setQuantity(q);
                setDraft(String(q));
                onQuantityChange?.(q);
              }}
              style={({ pressed }) => [styles.stepperButton, pressed && styles.stepperButtonPressed]}
              accessibilityRole="button"
              accessibilityLabel="Disminuir cantidad"
            >
              <Text variant={TextType.BodyMedium} color={cta1}>−</Text>
            </Pressable>
            {editing ? (
              <TextInput
                style={styles.quantityInput}
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
                <Text variant={TextType.BodyMedium} color={LIGHT.text.default} style={styles.quantity}>
                  {quantity}
                </Text>
              </Pressable>
            )}
            <Pressable
              onPress={() => {
                const q = quantity + 1;
                setQuantity(q);
                setDraft(String(q));
                onQuantityChange?.(q);
              }}
              style={({ pressed }) => [styles.stepperButton, pressed && styles.stepperButtonPressed]}
              accessibilityRole="button"
              accessibilityLabel="Aumentar cantidad"
            >
              <Icon name="add" size={16} color={cta1} />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: LIGHT.bg.subtle,
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
    backgroundColor: LIGHT.bg.default,
    alignItems: "center",
    justifyContent: "center",
  },
  imageBoxLarge: {
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: LIGHT.bg.default,
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
    backgroundColor: LIGHT.bg.default,
    borderRadius: 999,
    padding: 3,
  },
  stepperButton: {
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: LIGHT.bg.subtle,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperButtonPressed: {
    opacity: 0.6,
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
    color: LIGHT.text.default,
  },
  codeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});