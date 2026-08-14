import { StyleSheet } from "react-native";
import { spacing } from "@antonella/theme";

export const noop = () => {};

export const PROVINCE_OPTIONS = [
  { label: "Buenos Aires", value: "bsas" },
  { label: "Córdoba", value: "cba" },
  { label: "Santa Fe", value: "sfe" },
  { label: "Mendoza", value: "mza" },
];

export const FILTER_OPTIONS = [
  { label: "Todos", value: "all" },
  { label: "Activos", value: "active" },
  { label: "Pendientes", value: "pending" },
  { label: "Finalizados", value: "done" },
];

export const demoStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    alignItems: "center",
  },
  gap: {
    gap: spacing.sm,
  },
});
