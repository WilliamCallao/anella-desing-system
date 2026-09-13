import React from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { cameraPalette } from "./palette";

export type CameraScreenContainerProps = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

// Raíz de cualquier escena de cámara: fondo oscuro opaco (evita flashes claros del
// preview) y host-agnóstico (rellena el área que le dé el padre: una ruta, un Modal,
// un panel). Los overlays de cámara se posicionan absolutos sobre esta base.
export function CameraScreenContainer({ children, style }: CameraScreenContainerProps) {
  return (
    <View accessibilityViewIsModal style={[styles.root, style]} testID="camera-screen-container">
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: cameraPalette.background,
    overflow: "hidden",
  },
});