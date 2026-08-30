import React from "react";
import { StyleSheet, View } from "react-native";
import { Button, useToast, ToastTone } from "@william-callao/antonella-ui";
import type { ComponentCategory } from "../types";

function ToastDemo() {
  const { showToast } = useToast();

  const fire = (tone: ToastTone, message: string) => showToast({ message, tone });

  return (
    <View style={styles.wrap}>
      <Button label="Success" onPress={() => fire(ToastTone.Success, "Cambios guardados correctamente")} />
      <Button label="Error" onPress={() => fire(ToastTone.Error, "No se pudo completar la acción")} />
      <Button label="Warning" onPress={() => fire(ToastTone.Warning, "Revisá los campos antes de continuar")} />
      <Button label="Info" onPress={() => fire(ToastTone.Info, "Nueva actualización disponible")} />
      <Button
        label="Manual (no autocierra)"
        onPress={() => showToast({ message: "Cerrá este aviso manualmente", tone: ToastTone.Info, duration: 0 })}
      />
    </View>
  );
}

export const toast: ComponentCategory = {
  id: "toast",
  title: "Toast",
  icon: "information-circle",
  components: [
    {
      id: "demo",
      name: "Toast (barra superior)",
      description: "Barra superior edge-to-edge, inmune al IME. Toca un botón para disparar cada tono.",
      variants: [{ id: "all", label: "Demo", render: () => <ToastDemo /> }],
    },
  ],
};

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
  },
});
