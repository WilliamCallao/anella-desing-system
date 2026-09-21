import React from "react";
import { useWindowDimensions } from "react-native";
import { Sheet } from "./Sheet";
import { Modal } from "./Modal";
import type { IconName } from "./Icon";

export enum AppDialogMode {
  Dismissable = "dismissable",
  Required = "required",
}

export type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  mode?: AppDialogMode;
  icon?: IconName;
  title?: string;
  caption?: string;
  children: React.ReactNode;
  contentStyle?: React.ComponentProps<typeof Sheet>["contentStyle"];
  snapPoints?: React.ComponentProps<typeof Sheet>["snapPoints"];
  /** Zona de acciones fija al pie del diálogo (botones, etc.). */
  actions?: React.ReactNode;
  /** Monta el diálogo sin RN Modal (para hosts modales nativos tipo expo-router). */
  embedded?: boolean;
};

export function BottomSheet({
  visible,
  onClose,
  mode = AppDialogMode.Dismissable,
  icon,
  title,
  caption,
  children,
  contentStyle,
  snapPoints,
  actions,
  embedded = false,
}: BottomSheetProps) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;
  const dismissible = mode === AppDialogMode.Dismissable;

  if (isTablet) {
    return (
      <Modal
        visible={visible}
        onClose={onClose}
        dismissible={dismissible}
        showCloseButton={dismissible}
        icon={icon}
        title={title}
        caption={caption}
        actions={actions}
        children={children}
        contentStyle={contentStyle}
        embedded={embedded}
      />
    );
  }
  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      dismissible={dismissible}
      showCloseButton={dismissible}
      icon={icon}
      title={title}
      caption={caption}
      snapPoints={snapPoints}
      actions={actions}
      children={children}
      contentStyle={contentStyle}
      embedded={embedded}
    />
  );
}