import React, { useCallback, useRef, useState } from "react";
import { CameraView } from "expo-camera";
import { StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { CameraPermissionGate } from "./CameraPermissionGate";
import { CameraScreenContainer } from "./CameraScreenContainer";
import { CameraHud } from "./CameraHud";
import type { CameraFacing, CameraFlashMode, CapturePhoto } from "./types";

// ── Props ──────────────────────────────────────────────────

export type CameraCaptureScreenProps = {
  /** Si es false, la pantalla no se renderiza. Default true. */
  visible?: boolean;
  /** Título de la cabecera. Default "Cámara". */
  title?: string;
  /** Botón de volver (prop del host). */
  onClose?: () => void;
  /** Flash actual. Cicla off → on → auto → off al tocar. Default "off". */
  flash?: CameraFlashMode;
  onFlashChange?: (flash: CameraFlashMode) => void;
  /** Cámara activa. Default "back". */
  facing?: CameraFacing;
  onFacingChange?: (facing: CameraFacing) => void;
  /** Calidad JPEG de la captura (0–1). Default 0.85. */
  quality?: number;
  /** Incluir la imagen en Base64. Default false. */
  includeBase64?: boolean;
  /** Incluir datos EXIF. Default false. */
  includeExif?: boolean;
  /** Espejar la frontal. Default true. */
  mirrorFront?: boolean;
  /** Resultado de una foto tomada. */
  onCapture?: (photo: CapturePhoto) => void;
  /** Preview de la cámara listo. */
  onOpenCamera?: () => void;
  /** Error de montaje o captura. */
  onCameraError?: (error: unknown) => void;
  style?: StyleProp<ViewStyle>;
};

// ── Component ──────────────────────────────────────────────
// Pantalla completa de captura de fotos, host-agnóstica: montable en una ruta
// expo-router o dentro de un Modal. Toma la foto con `takePictureAsync` y entrega
// `CapturePhoto` vía `onCapture`. El flash toca la cámara frontal también (la
// aclara), por eso se permite en ambos sentidos.

const FLASH_ORDER: CameraFlashMode[] = ["off", "on", "auto"];

export function CameraCaptureScreen({
  visible = true,
  title = "Cámara",
  onClose,
  flash = "off",
  onFlashChange,
  facing = "back",
  onFacingChange,
  quality = 0.85,
  includeBase64 = false,
  includeExif = false,
  mirrorFront = true,
  onCapture,
  onOpenCamera,
  onCameraError,
  style,
}: CameraCaptureScreenProps) {
  const cameraRef = useRef<CameraView | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [flashState, setFlashState] = useState<CameraFlashMode>(flash);
  const [facingState, setFacingState] = useState<CameraFacing>(facing);

  const toggleFlash = useCallback(() => {
    const next = FLASH_ORDER[(FLASH_ORDER.indexOf(flashState) + 1) % FLASH_ORDER.length];
    setFlashState(next);
    onFlashChange?.(next);
  }, [flashState, onFlashChange]);

  const flipCamera = useCallback(() => {
    const next = facingState === "back" ? "front" : "back";
    setFacingState(next);
    onFacingChange?.(next);
  }, [facingState, onFacingChange]);

  const handleCapture = useCallback(async () => {
    if (busy || !ready || !cameraRef.current) return;
    setBusy(true);
    try {
      const picture = await cameraRef.current.takePictureAsync({
        quality,
        base64: includeBase64,
        exif: includeExif,
      });
      onCapture?.({
        uri: picture.uri,
        width: picture.width,
        height: picture.height,
      });
    } catch (error) {
      onCameraError?.(error);
    } finally {
      setBusy(false);
    }
  }, [busy, ready, quality, includeBase64, includeExif, onCapture, onCameraError]);

  if (!visible) return null;

  return (
    <CameraPermissionGate onClose={onClose} title={title}>
      <CameraScreenContainer style={style}>
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing={facingState}
          flash={flashState}
          mirror={facingState === "front" ? mirrorFront : undefined}
          autofocus="on"
          mode="picture"
          onCameraReady={() => {
            setReady(true);
            onOpenCamera?.();
          }}
          onMountError={({ message }) => onCameraError?.(new Error(message))}
        />
        <CameraHud
          title={title}
          onClose={onClose}
          flash={flashState}
          onToggleFlash={toggleFlash}
          canFlipCamera
          onFlipCamera={flipCamera}
          onCapture={handleCapture}
          capturing={busy}
          canCapture={ready}
        />
      </CameraScreenContainer>
    </CameraPermissionGate>
  );
}