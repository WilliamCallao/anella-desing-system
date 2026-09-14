import React from "react";
import { useCameraPermissions } from "expo-camera";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { space } from "@william-callao/antonella-theme";
import { Text } from "../text/Text";
import { Icon, type IconName } from "../Icon";
import { Button } from "../Button";
import { CameraHud, HudIconButton } from "./CameraHud";
import { CameraScreenContainer } from "./CameraScreenContainer";
import { cameraPalette } from "./palette";

// ── Props ──────────────────────────────────────────────────

export type CameraPermissionGateProps = {
  children?: React.ReactNode;
  /** Título mostrado en la cabecera (recién el host provee un onClose). */
  title?: string;
  onClose?: () => void;
  /** Texto del estado sin permiso. Default: mensaje estándar. */
  deniedMessage?: string;
};

// ── Component ──────────────────────────────────────────────
// Puerta de acceso: mientras no haya permiso (o se esté pidiendo) muestra una
// escena oscura de estado; una vez concedido monta `children`. Es host-agnóstico
// y reutiliza el mismo contenedor y cabecera que las escenas de cámara.

export function CameraPermissionGate({ children, title, onClose, deniedMessage }: CameraPermissionGateProps) {
  const [permission, requestPermission] = useCameraPermissions();

  if (permission == null) {
    return <CameraStatus title={title} onClose={onClose} loading />;
  }

  if (permission.granted) {
    return <React.Fragment>{children}</React.Fragment>;
  }

  const canAsk = permission.canAskAgain;
  return (
    <CameraStatus
      title={title}
      onClose={onClose}
      icon={canAsk ? "camera" : "alert-circle"}
      heading={canAsk ? "Acceso a la cámara" : "Sin permiso de cámara"}
      message={
        canAsk
          ? deniedMessage ?? "Antonella necesita la cámara para sacar fotos y escanear códigos."
          : deniedMessage ??
            "Habilitá el acceso a la cámara en los ajustes del dispositivo para poder usarla."
      }
      actionLabel={canAsk ? "Permitir acceso" : undefined}
      onAction={canAsk ? requestPermission : undefined}
    />
  );
}

// ── Estado interno (carga / denegada / sin re-petición) ─────

function CameraStatus({
  loading,
  title,
  onClose,
  icon,
  heading,
  message,
  actionLabel,
  onAction,
}: {
  loading?: boolean;
  title?: string;
  onClose?: () => void;
  icon?: IconName;
  heading?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <CameraScreenContainer>
      <View style={[styles.header, { paddingTop: insets.top + space.space2 }]}>
        {onClose ? (
          <HudIconButton icon="arrow-back" label="Volver" onPress={onClose} />
        ) : (
          <View style={styles.headerSlot} />
        )}
        <View style={styles.headerTitle}>
          {title ? (
            <Text variant="label" color={cameraPalette.text}>
              {title}
            </Text>
          ) : null}
        </View>
        <View style={styles.headerSlot} />
      </View>

      <View style={styles.body}>
        <Icon
          name={loading ? "loader" : icon ?? "camera"}
          size={40}
          color={icon === "alert-circle" ? cameraPalette.danger : cameraPalette.textSubtle}
        />
        {heading ? (
          <Text variant="heading" color={cameraPalette.text} style={styles.bodyHeading}>
            {heading}
          </Text>
        ) : null}
        {message ? (
          <Text variant="caption" color={cameraPalette.textSubtle} style={styles.bodyMessage}>
            {message}
          </Text>
        ) : null}
        {actionLabel && onAction ? (
          <Button label={actionLabel} onPress={onAction} style={styles.action} />
        ) : null}
      </View>
    </CameraScreenContainer>
  );
}

// ── Estilos ────────────────────────────────────────────────

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: space.space4,
    paddingBottom: space.space3,
    flexDirection: "row",
    alignItems: "center",
  },
  headerSlot: {
    width: 44,
    height: 44,
  },
  headerTitle: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: space.space2,
  },
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: space.space2,
    paddingHorizontal: space.space8,
    paddingBottom: space.space20,
  },
  bodyHeading: {
    textAlign: "center",
    marginTop: space.space1,
  },
  bodyMessage: {
    textAlign: "center",
    maxWidth: 420,
  },
  action: {
    marginTop: space.space2,
  },
});
