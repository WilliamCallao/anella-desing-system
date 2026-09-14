import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { space } from "@william-callao/antonella-theme";
import { Text } from "../text/Text";
import { Icon, type IconName } from "../Icon";
import { cameraPalette } from "./palette";
import type { CameraFlashMode } from "./types";

// ── Props ──────────────────────────────────────────────────

export type CameraHudProps = {
  /** Título centrado de la barra superior. */
  title?: string;
  /** Si se pasa, muestra el botón de volver (barra superior izquierda). */
  onClose?: () => void;
  /** Ícono del botón de volver. Default "arrow-back". */
  closeIcon?: IconName;
  /** Flash de captura (barra superior derecha). Se muestra solo en modo captura. */
  flash?: CameraFlashMode;
  onToggleFlash?: () => void;
  /** Linterna del scanner (barra superior derecha en modo escaneo). */
  torch?: boolean;
  onToggleTorch?: () => void;
  /** Par de botones del modo captura. */
  onFlipCamera?: () => void;
  canFlipCamera?: boolean;
  onCapture?: () => void;
  capturing?: boolean;
  canCapture?: boolean;
};

// ── Component ──────────────────────────────────────────────
// HUD que se superpone al preview de la cámara: barra superior
// (volver / título / flash o linterna) y barra inferior
// (girar cámara / obturador o linterna). Posicionado absoluto.

export function CameraHud({
  title,
  onClose,
  closeIcon = "arrow-back",
  flash,
  onToggleFlash,
  torch,
  onToggleTorch,
  onFlipCamera,
  canFlipCamera = true,
  onCapture,
  capturing = false,
  canCapture = true,
}: CameraHudProps) {
  const insets = useSafeAreaInsets();
  const isCapture = onCapture != null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <View
        style={[styles.topBar, { paddingTop: insets.top + space.space2 }]}
        pointerEvents="box-none"
      >
        {onClose ? (
          <HudIconButton icon={closeIcon} label="Volver" onPress={onClose} />
        ) : (
          <View style={styles.topSlot} />
        )}

        <View style={styles.topTitle}>
          {title ? (
            <Text variant="label" color={cameraPalette.text}>
              {title}
            </Text>
          ) : null}
        </View>

        {isCapture ? (
          flash != null && onToggleFlash ? (
            <FlashButton flash={flash} onPress={onToggleFlash} />
          ) : (
            <View style={styles.topSlot} />
          )
        ) : torch != null && onToggleTorch ? (
          <HudIconButton
            icon={torch ? "torch" : "torch-off"}
            label="Linterna"
            active={torch}
            onPress={onToggleTorch}
          />
        ) : (
          <View style={styles.topSlot} />
        )}
      </View>

      <View
        style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, space.space4) }]}
        pointerEvents="box-none"
      >
        {onFlipCamera && canFlipCamera ? (
          <HudIconButton icon="flip-camera" label="Girar cámara" onPress={onFlipCamera} />
        ) : (
          <View style={styles.bottomSlot} />
        )}

        {isCapture && onCapture ? (
          <ShutterButton busy={capturing} enabled={canCapture} onPress={onCapture} />
        ) : torch != null && onToggleTorch ? (
          <BigTorchButton torch={torch} onPress={onToggleTorch} />
        ) : (
          <View style={styles.bottomSlot} />
        )}

        <View style={styles.bottomSlot} />
      </View>
    </View>
  );
}

// ── Botones ────────────────────────────────────────────────

export type HudIconButtonProps = {
  icon: IconName;
  label: string;
  onPress?: () => void;
  active?: boolean;
  size?: "md" | "lg";
};

export function HudIconButton({ icon, label, onPress, active = false, size = "md" }: HudIconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      onPress={onPress}
      disabled={!onPress}
      hitSlop={10}
      android_ripple={{ color: "rgba(255,255,255,0.14)", borderless: true }}
      style={[
        styles.iconButton,
        size === "lg" && styles.iconButtonLg,
        active && styles.iconButtonActive,
      ]}
    >
      <Icon
        name={icon}
        size={size === "lg" ? 26 : 22}
        color={active ? cameraPalette.accent : cameraPalette.text}
      />
    </Pressable>
  );
}

function FlashButton({ flash, onPress }: { flash: CameraFlashMode; onPress: () => void }) {
  const active = flash !== "off";
  const label = flash === "auto" ? "Auto" : active ? "Flash" : "Apagado";
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Flash: ${label}`}
      onPress={onPress}
      hitSlop={10}
      android_ripple={{ color: "rgba(255,255,255,0.14)", borderless: true }}
      style={styles.flashButton}
    >
      <Icon name={active ? "flash" : "flash-off"} size={22} color={active ? cameraPalette.text : cameraPalette.textSubtle} />
      <Text variant="caption" color={active ? cameraPalette.text : cameraPalette.textSubtle}>
        {label}
      </Text>
    </Pressable>
  );
}

function BigTorchButton({ torch, onPress }: { torch: boolean; onPress: () => void }) {
  return (
    <HudIconButton
      icon={torch ? "torch" : "torch-off"}
      label="Linterna"
      active={torch}
      size="lg"
      onPress={onPress}
    />
  );
}

export function ShutterButton({
  busy,
  enabled,
  onPress,
}: {
  busy?: boolean;
  enabled?: boolean;
  onPress?: () => void;
}) {
  const disabledShutter = busy || enabled === false || onPress == null;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Tomar foto"
      disabled={disabledShutter}
      onPress={onPress}
      hitSlop={10}
      style={({ pressed }) => [
        styles.shutterOuter,
        pressed && !disabledShutter && styles.shutterPressed,
        disabledShutter && styles.shutterDisabled,
      ]}
    >
      <View style={styles.shutterInner}>
        {busy ? <ActivityIndicator color={cameraPalette.background} /> : null}
      </View>
    </Pressable>
  );
}

// ── Estilos ────────────────────────────────────────────────

const styles = StyleSheet.create({
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: space.space4,
    paddingBottom: space.space3,
  },
  topSlot: {
    width: 44,
    height: 44,
  },
  topTitle: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: space.space2,
  },
  flashButton: {
    alignItems: "center",
    gap: 2,
    minWidth: 52,
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: space.space6,
    paddingTop: space.space5,
  },
  bottomSlot: {
    width: 60,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: cameraPalette.overlay,
    borderWidth: 1,
    borderColor: cameraPalette.hairline,
  },
  iconButtonLg: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  iconButtonActive: {
    borderColor: cameraPalette.accent,
  },
  shutterOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.9)",
    backgroundColor: "rgba(7,12,22,0.32)",
    alignItems: "center",
    justifyContent: "center",
  },
  shutterPressed: {
    opacity: 0.75,
  },
  shutterDisabled: {
    opacity: 0.5,
  },
  shutterInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
});
