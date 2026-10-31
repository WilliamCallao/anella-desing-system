import React from "react";
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import {
  border,
  cta1,
  space,
  text,
  TextType,
} from "@william-callao/antonella-theme";
import { Icon, type IconName } from "./Icon";
import { Text } from "./text/Text";

export type SelectableTableColumn = {
  key: string;
  label: string;
  /** Ancho fijo de la columna. */
  width?: number;
  /** Factor de reparto para columnas flexibles. */
  flex?: number;
};

export type SelectableTableItem = {
  id: string;
  values: Record<string, string>;
};

export type SelectableTableRowAction = {
  icon: IconName;
  color?: string;
  onPress: (item: SelectableTableItem) => void;
  accessibilityLabel?: (item: SelectableTableItem) => string;
};

export type SelectableTableProps = {
  columns: SelectableTableColumn[];
  items: SelectableTableItem[];
  /** Fila opcional para "ninguno"; se selecciona con id `""`. */
  noneItem?: SelectableTableItem;
  selectedId?: string;
  /** Si se pasa, las filas son seleccionables. */
  onSelect?: (id: string) => void;
  /** Acción al final de cada fila (ej. eliminar en gestión). */
  rowAction?: SelectableTableRowAction;
  emptyLabel?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * Tabla compacta de filas seleccionables: cabecera, separadores y estado de
 * selección. La usan los selectores de unidades/cuentas y las pantallas de
 * gestión.
 */
export function SelectableTable({
  columns,
  items,
  noneItem,
  selectedId,
  onSelect,
  rowAction,
  emptyLabel,
  style,
}: SelectableTableProps) {
  const renderRow = (item: SelectableTableItem, key: string) => {
    const selected = onSelect != null && item.id === selectedId;
    const content = (
      <>
        {columns.map((column) => (
          <Text
            key={column.key}
            variant={TextType.Caption}
            color={selected ? cta1 : text.default}
            numberOfLines={1}
            style={[
              column.width != null ? { width: column.width, flexShrink: 0 } : null,
              column.flex != null ? { flex: column.flex } : null,
            ]}
          >
            {item.values[column.key] ?? ""}
          </Text>
        ))}
        {rowAction ? (
          <Pressable
            onPress={() => rowAction.onPress(item)}
            hitSlop={8}
            style={styles.actionCell}
            accessibilityRole="button"
            accessibilityLabel={rowAction.accessibilityLabel?.(item)}
          >
            <Icon name={rowAction.icon} size={18} color={rowAction.color ?? text.secondary} />
          </Pressable>
        ) : onSelect ? (
          <View style={styles.checkCell}>
            <Icon
              name={selected ? "checkmark" : "chevron-forward"}
              size={selected ? 16 : 14}
              color={selected ? cta1 : text.secondary}
            />
          </View>
        ) : null}
      </>
    );

    return (
      <View key={key}>
        {onSelect ? (
          <Pressable
            onPress={() => onSelect(item.id)}
            style={({ pressed }) => [
              styles.row,
              selected ? styles.rowSelected : undefined,
              pressed ? styles.rowPressed : undefined,
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={columns
              .map((column) => item.values[column.key] ?? "")
              .filter(Boolean)
              .join(", ")}
          >
            {content}
          </Pressable>
        ) : (
          <View style={styles.row}>{content}</View>
        )}
        <View style={styles.separator} />
      </View>
    );
  };

  return (
    <View style={[styles.table, style]}>
      <View style={styles.header}>
        {columns.map((column) => (
          <Text
            key={column.key}
            variant={TextType.CaptionMedium}
            color={text.default}
            style={[
              styles.headerText,
              column.width != null ? { width: column.width, flexShrink: 0 } : null,
              column.flex != null ? { flex: column.flex } : null,
            ]}
          >
            {column.label}
          </Text>
        ))}
        {rowAction ? (
          <View style={styles.actionCell} />
        ) : onSelect ? (
          <View style={styles.checkCell} />
        ) : null}
      </View>
      <View style={styles.separator} />
      {noneItem != null ? renderRow(noneItem, "__none__") : null}
      {items.length === 0 ? (
        emptyLabel ? (
          <Text variant={TextType.Caption} color={text.secondary} style={styles.empty}>
            {emptyLabel}
          </Text>
        ) : null
      ) : (
        items.map((item) => renderRow(item, item.id))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  table: {
    gap: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.space3,
    paddingHorizontal: space.space3,
    paddingBottom: space.space2,
  },
  headerText: {
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.space3,
    minHeight: 48,
    paddingHorizontal: space.space3,
  },
  rowSelected: {
    backgroundColor: "#F7F7FA",
  },
  rowPressed: {
    backgroundColor: "#F7F7FA",
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: border.divider.secondary,
  },
  checkCell: {
    width: 16,
    alignItems: "flex-end",
  },
  actionCell: {
    width: 18,
    alignItems: "flex-end",
  },
  empty: {
    paddingHorizontal: space.space3,
    paddingVertical: space.space4,
  },
});
