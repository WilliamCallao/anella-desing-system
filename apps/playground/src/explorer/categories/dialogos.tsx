import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  AppButton,
  AppDialogMode,
  AppResponsiveDialog,
  Card,
  CardStackSheet,
  OptionListItem,
  OptionListItemVariant,
  Text,
} from "@william-callao/antonella-ui";
import type { ComponentCategory } from "../types";
import { demoStyles } from "./shared";
import { palette, spacing } from "@william-callao/antonella-theme";
import { TransitionView } from "@william-callao/antonella-animations";

function ResponsiveDialogDemo() {
  const [open, setOpen] = useState(false);
  return (
    <View style={demoStyles.gap}>
      <AppButton label="Abrir diálogo responsivo" variant="ghost" onPress={() => setOpen(true)} />
      <AppResponsiveDialog
        visible={open}
        onClose={() => setOpen(false)}
        title="Diálogo responsivo"
        caption="En celular abre como BottomSheet; en tablet como Modal centrado. Se cierra tocando afuera o con atrás."
      >
        <Text variant="body">El mismo código sirve para ambas resoluciones.</Text>
      </AppResponsiveDialog>
    </View>
  );
}

function ResponsiveDialogRequiredDemo() {
  const [open, setOpen] = useState(false);
  return (
    <View style={demoStyles.gap}>
      <AppButton label="Abrir diálogo no dismissable" variant="ghost" onPress={() => setOpen(true)} />
      <AppResponsiveDialog
        visible={open}
        onClose={() => setOpen(false)}
        mode={AppDialogMode.Required}
        title="Diálogo no dismissable"
        caption="No se cierra tocando afuera ni con atrás; solo con la acción del contenido."
      >
        <AppButton label="Cerrar diálogo" onPress={() => setOpen(false)} />
      </AppResponsiveDialog>
    </View>
  );
}

function CardStackSheetDemo() {
  const [open, setOpen] = useState(false);
  return (
    <View style={demoStyles.gap}>
      <AppButton label="Abrir pila de cards" variant="ghost" onPress={() => setOpen(true)} />
      <CardStackSheet visible={open} onClose={() => setOpen(false)}>
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
      </CardStackSheet>
    </View>
  );
}

function CardStackSheetOptionsDemo() {
  const [open, setOpen] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const closeAll = () => {
    setOpen(false);
    setConfirmVisible(false);
  };

  return (
    <View style={demoStyles.gap}>
      <AppButton label="Abrir opciones" variant="ghost" onPress={() => setOpen(true)} />
      <CardStackSheet visible={open} onClose={closeAll}>
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
      </CardStackSheet>
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
      id: "app-responsive-dialog",
      name: "AppResponsiveDialog",
      description: "Diálogo responsivo: BottomSheet en celular, Modal centrado en tablet. Un solo componente.",
      variants: [
        { id: "open", label: "Abrir", render: () => <ResponsiveDialogDemo /> },
        { id: "required", label: "No dismissable", render: () => <ResponsiveDialogRequiredDemo /> },
      ],
    },
    {
      id: "card-stack-sheet",
      name: "CardStackSheet",
      description: "Cards flotando sobre el fondo oscuro, separadas de los bordes de la pantalla.",
      variants: [
        { id: "open", label: "Abrir", render: () => <CardStackSheetDemo /> },
        { id: "options", label: "Opciones", render: () => <CardStackSheetOptionsDemo /> },
      ],
    },
  ],
};
