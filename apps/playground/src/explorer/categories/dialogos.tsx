import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  AppBottomSheet,
  AppButton,
  Card,
  OptionListItem,
  OptionListItemVariant,
  Sheet,
  Text,
} from "@william-callao/antonella-ui";
import type { ComponentCategory } from "../types";
import { demoStyles } from "./shared";
import { palette, spacing } from "@william-callao/antonella-theme";
import { TransitionView } from "@william-callao/antonella-animations";

function SheetDemo() {
  const [open, setOpen] = useState(false);
  return (
    <View style={demoStyles.gap}>
      <AppButton label="Abrir sheet" variant="ghost" onPress={() => setOpen(true)} />
      <Sheet
        visible={open}
        onClose={() => setOpen(false)}
        icon="chatbubble"
        title="Sheet"
        caption="En celular abre como sheet con header; se cierra tocando afuera o con atrás."
      >
        <Text variant="body">Incluye header con icono, título y caption, y zona de acciones fija.</Text>
      </Sheet>
    </View>
  );
}

function SheetRequiredDemo() {
  const [open, setOpen] = useState(false);
  return (
    <View style={demoStyles.gap}>
      <AppButton label="Abrir sheet no dismissable" variant="ghost" onPress={() => setOpen(true)} />
      <Sheet
        visible={open}
        onClose={() => setOpen(false)}
        dismissible={false}
        icon="alert-circle"
        title="Sheet no dismissable"
        caption="No se cierra tocando afuera ni con atrás; solo con la acción del contenido."
      >
        <AppButton label="Cerrar sheet" onPress={() => setOpen(false)} />
      </Sheet>
    </View>
  );
}

function AppBottomSheetDemo() {
  const [open, setOpen] = useState(false);
  return (
    <View style={demoStyles.gap}>
      <AppButton label="Abrir pila de cards" variant="ghost" onPress={() => setOpen(true)} />
      <AppBottomSheet visible={open} onClose={() => setOpen(false)}>
        <Card>
          <Text variant="heading">Card 1</Text>
          <Text variant="body" color="#8E8E93">
            Primera card de la pila. Todo el contenido queda visible apilado en columna.
          </Text>
        </Card>
        <Card>
          <Text variant="heading">Card 2</Text>
          <Text variant="body" color="#8E8E93">
            Otra card debajo, con su propia separación.
          </Text>
        </Card>
        <Card>
          <Text variant="heading">Card 3</Text>
          <Text variant="body" color="#8E8E93">
            Última card de ejemplo. Se puede cerrar tocando afuera o con atrás.
          </Text>
        </Card>
      </AppBottomSheet>
    </View>
  );
}

function AppBottomSheetOptionsDemo() {
  const [open, setOpen] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const closeAll = () => {
    setOpen(false);
    setConfirmVisible(false);
  };

  return (
    <View style={demoStyles.gap}>
      <AppButton label="Abrir opciones" variant="ghost" onPress={() => setOpen(true)} />
      <AppBottomSheet visible={open} onClose={closeAll}>
        <Card>
          <OptionListItem
            icon="pencil"
            title="Editar"
            description="Modificá los datos"
            onPress={() => {}}
            showSeparator
          />
          <OptionListItem
            icon="document-text"
            title="Opción 2"
            description="Segunda opción del menú"
            onPress={() => {}}
            showSeparator
          />
          <OptionListItem
            icon="trash"
            title="Eliminar"
            description="Esta acción no se puede deshacer"
            variant={OptionListItemVariant.Destructive}
            onPress={() => setConfirmVisible(true)}
          />
        </Card>
        <TransitionView contentKey={confirmVisible ? "confirm" : "none"}>
          {confirmVisible ? (
            <Card>
              <View style={styles.confirmTexts}>
                <Text variant="bodyMedium" color={palette.danger}>
                  ¿Eliminar?
                </Text>
                <Text variant="caption" color="#8E8E93">
                  Esta acción no se puede deshacer.
                </Text>
              </View>
              <View style={styles.buttonRow}>
                <AppButton
                  label="Cancelar"
                  variant="ghost"
                  style={styles.button}
                  onPress={() => setConfirmVisible(false)}
                />
                <AppButton
                  label="Eliminar"
                  backgroundColor={palette.danger}
                  textColor="#FFFFFF"
                  style={styles.button}
                  onPress={closeAll}
                />
              </View>
            </Card>
          ) : null}
        </TransitionView>
      </AppBottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  button: {
    flex: 1,
  },
  confirmTexts: {
    paddingVertical: spacing.xs,
    gap: 2,
  },
});

export const dialogos: ComponentCategory = {
  id: "dialogos",
  title: "Diálogos",
  icon: "chatbubble",
  components: [
    {
      id: "sheet",
      name: "Sheet",
      description: "Sheet con header (icono, título, caption) y zona de acciones fija.",
      variants: [
        { id: "open", label: "Abrir", render: () => <SheetDemo /> },
        { id: "required", label: "No dismissable", render: () => <SheetRequiredDemo /> },
      ],
    },
    {
      id: "app-bottom-sheet",
      name: "AppBottomSheet",
      description: "Cards flotando sobre el fondo oscuro, separadas de los bordes de la pantalla.",
      variants: [
        { id: "open", label: "Abrir", render: () => <AppBottomSheetDemo /> },
        { id: "options", label: "Opciones", render: () => <AppBottomSheetOptionsDemo /> },
      ],
    },
  ],
};
