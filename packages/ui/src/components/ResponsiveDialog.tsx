import React from "react";
import { useWindowDimensions } from "react-native";
import { BottomSheet } from "./BottomSheet";
import { Modal } from "./Modal";

export type ResponsiveDialogProps = {
  visible: boolean;
  onClose: () => void;
  dismissible?: boolean;
  children: React.ReactNode;
  contentStyle?: React.ComponentProps<typeof BottomSheet>["contentStyle"];
  snapPoints?: React.ComponentProps<typeof BottomSheet>["snapPoints"];
};

export function ResponsiveDialog({
  visible,
  onClose,
  dismissible,
  children,
  contentStyle,
  snapPoints,
}: ResponsiveDialogProps) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;

  if (isTablet) {
    return (
      <Modal
        visible={visible}
        onClose={onClose}
        dismissible={dismissible}
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
      snapPoints={snapPoints}
      children={children}
      contentStyle={contentStyle}
    />
  );
}
