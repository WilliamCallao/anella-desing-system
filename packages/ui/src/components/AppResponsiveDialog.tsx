import React from "react";
import { useWindowDimensions } from "react-native";
import { BottomSheet } from "./BottomSheet";
import { Modal } from "./Modal";
import type { IconName } from "./Icon";

export enum AppDialogMode {
  Dismissable = "dismissable",
  Required = "required",
}

export type AppResponsiveDialogProps = {
  visible: boolean;
  onClose: () => void;
  mode?: AppDialogMode;
  icon?: IconName;
  title?: string;
  caption?: string;
  children: React.ReactNode;
  contentStyle?: React.ComponentProps<typeof BottomSheet>["contentStyle"];
  snapPoints?: React.ComponentProps<typeof BottomSheet>["snapPoints"];
};

export function AppResponsiveDialog({
  visible,
  onClose,
  mode = AppDialogMode.Dismissable,
  icon,
  title,
  caption,
  children,
  contentStyle,
  snapPoints,
}: AppResponsiveDialogProps) {
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
        children={children}
        contentStyle={contentStyle}
      />
    );
  }
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      dismissible={dismissible}
      showCloseButton={dismissible}
      icon={icon}
      title={title}
      caption={caption}
      snapPoints={snapPoints}
      children={children}
      contentStyle={contentStyle}
    />
  );
}
