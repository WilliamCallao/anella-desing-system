import React from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { space } from "@william-callao/antonella-theme";

export type AppFormProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * Contenedor de un formulario dentro de un `BottomSheet`: el ritmo estándar
 * entre el card de campos y las notas que van debajo (gap 8, margen superior 8).
 */
export function AppForm({ children, style }: AppFormProps) {
  return <View style={[styles.container, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    gap: space.space2,
    marginTop: space.space2,
  },
});
