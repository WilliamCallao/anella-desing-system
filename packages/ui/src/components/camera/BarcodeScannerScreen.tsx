import React, { useCallback, useEffect, useRef, useState } from "react";
import { CameraView, type BarcodeScanningResult, type BarcodeType } from "expo-camera";
import { Platform, StyleSheet, View, Vibration, type LayoutChangeEvent, type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { space } from "@william-callao/antonella-theme";
import { Text } from "../text/Text";
import { CameraPermissionGate } from "./CameraPermissionGate";
import { CameraScreenContainer } from "./CameraScreenContainer";
import { CameraHud } from "./CameraHud";
import { cameraPalette } from "./palette";
import type { CameraFacing, ScanResult } from "./types";

// ── Props ──────────────────────────────────────────────────

export type BarcodeScannerScreenProps = {
  /** Si es false, la pantalla no se renderiza. Default true. */
  visible?: boolean;
  /** Título de la cabecera. Default "Escanear". */
  title?: string;
  /** Ayuda que se muestra bajo el viewfinder. */
  caption?: string;
  onClose?: () => void;
  /** Resultado de un código detectado. */
  onScan?: (result: ScanResult) => void;
  /** Tipos a reconocer. Default solo QR. */
  barcodeTypes?: BarcodeType[];
  /** Tiempo mínimo entre scans consecutivos (ms). Default 1500. */
  throttleMs?: number;
  /** Vibra al detectar (nativo). Default true. */
  haptics?: boolean;
  /** Linterna encendida (light durante el escaneo). */
  torch?: boolean;
  onTorchChange?: (torch: boolean) => void;
  facing?: CameraFacing;
  onFacingChange?: (facing: CameraFacing) => void;
  onOpenCamera?: () => void;
  onCameraError?: (error: unknown) => void;
  style?: StyleProp<ViewStyle>;
};

// ── Constantes ─────────────────────────────────────────────

const DEFAULT_BARCODE_TYPES: BarcodeType[] = ["qr"];

// ── Component ──────────────────────────────────────────────
// Pantalla completa para escanear códigos. Usa el escáner en preview
// (`barcodeScannerSettings` + `onBarcodeScanned`), cross-platform, con un
// viewfinder de esquinas + línea animada. El contrato es host-agnóstico
// (mismo `visible/onClose/onScan` que los diálogos).

export function BarcodeScannerScreen({
  visible = true,
  title = "Escanear",
  caption = "Enfocá un código QR para leerlo.",
  onClose,
  onScan,
  barcodeTypes = DEFAULT_BARCODE_TYPES,
  throttleMs = 1500,
  haptics = true,
  torch = false,
  onTorchChange,
  facing = "back",
  onFacingChange,
  onOpenCamera,
  onCameraError,
  style,
}: BarcodeScannerScreenProps) {
  const lastScanAt = useRef(0);
  const locked = useRef(false);
  const [facingState, setFacingState] = useState<CameraFacing>(facing);

  const handleBarcode = useCallback(
    (result: BarcodeScanningResult) => {
      if (locked.current) return;
      const now = Date.now();
      if (now - lastScanAt.current < throttleMs) return;
      lastScanAt.current = now;
      locked.current = true;
      if (haptics && Platform.OS !== "web") Vibration.vibrate(80);
      onScan?.({ type: result.type, value: result.data });
      setTimeout(() => {
        locked.current = false;
      }, throttleMs);
    },
    [throttleMs, haptics, onScan],
  );

  const flipCamera = useCallback(() => {
    const next = facingState === "back" ? "front" : "back";
    setFacingState(next);
    onFacingChange?.(next);
  }, [facingState, onFacingChange]);

  if (!visible) return null;

  return (
    <CameraPermissionGate onClose={onClose} title={title}>
      <CameraScreenContainer style={style}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing={facingState}
          enableTorch={torch}
          mode="picture"
          barcodeScannerSettings={{ barcodeTypes }}
          onBarcodeScanned={handleBarcode}
          onCameraReady={() => onOpenCamera?.()}
          onMountError={({ message }) => onCameraError?.(new Error(message))}
        />
        <Viewfinder caption={caption} />
        <CameraHud
          title={title}
          onClose={onClose}
          torch={torch}
          onToggleTorch={onTorchChange ? () => onTorchChange(!torch) : undefined}
          canFlipCamera
          onFlipCamera={flipCamera}
        />
      </CameraScreenContainer>
    </CameraPermissionGate>
  );
}

// ── Viewfinder ─────────────────────────────────────────────
// Viewfinder con esquinas, dim del exterior y línea de escaneo animada.
// El área útil es un cuadrado centrado (óptimo para QR).

function Viewfinder({ caption }: { caption?: string }) {
  const [box, setBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    const w = Math.min(width * 0.76, 300);
    const h = w;
    setBox({ x: (width - w) / 2, y: (height - h) / 2, w, h });
  }, []);

  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = 0;
    progress.value = withRepeat(
      withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.quad), reduceMotion: ReduceMotion.System }),
      -1,
      false,
    );
    return () => cancelAnimation(progress);
  }, [progress]);

  const lineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: box ? progress.value * Math.max(0, box.h - 24) : 0 }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" onLayout={onLayout}>
      {box ? (
        <>
          <View style={[styles.dim, styles.dimTop, { height: box.y }]} />
          <View
            style={[styles.dim, styles.dimBottom, { top: box.y + box.h }]}
          />
          <View style={[styles.dim, styles.dimSide, { top: box.y, height: box.h, left: 0, width: box.x }]} />
          <View
            style={[
              styles.dim,
              styles.dimSide,
              { top: box.y, height: box.h, left: box.x + box.w, right: 0 },
            ]}
          />

          <View
            style={[
              styles.box,
              { left: box.x, top: box.y, width: box.w, height: box.h },
            ]}
          />
          <View style={[styles.corner, styles.cornerTL, { left: box.x - 2, top: box.y - 2 }]} />
          <View style={[styles.corner, styles.cornerTR, { right: undefined, left: box.x + box.w - 22, top: box.y - 2 }]} />
          <View style={[styles.corner, styles.cornerBL, { left: box.x - 2, top: box.y + box.h - 22 }]} />
          <View style={[styles.corner, styles.cornerBR, { left: box.x + box.w - 22, top: box.y + box.h - 22 }]} />

          <View
            style={[
              styles.scanArea,
              { left: box.x, top: box.y + 10, width: box.w, height: box.h - 20 },
            ]}
          >
            <Animated.View style={[styles.scanLine, lineStyle]} />
          </View>

          {caption ? (
            <Text
              variant="caption"
              color={cameraPalette.textSubtle}
              style={[styles.captionBox, { top: box.y + box.h + space.space5 }]}
            >
              {caption}
            </Text>
          ) : null}
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  dim: {
    position: "absolute",
    backgroundColor: cameraPalette.overlay,
  },
  dimTop: {
    left: 0,
    right: 0,
    top: 0,
  },
  dimBottom: {
    left: 0,
    right: 0,
    bottom: 0,
  },
  dimSide: {
    position: "absolute",
  },
  box: {
    position: "absolute",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: cameraPalette.hairline,
    backgroundColor: cameraPalette.boxFill,
  },
  corner: {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: 6,
  },
  cornerTL: {
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: cameraPalette.accent,
    borderTopLeftRadius: 10,
  },
  cornerTR: {
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: cameraPalette.accent,
    borderTopRightRadius: 10,
  },
  cornerBL: {
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: cameraPalette.accent,
    borderBottomLeftRadius: 10,
  },
  cornerBR: {
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: cameraPalette.accent,
    borderBottomRightRadius: 10,
  },
  scanArea: {
    position: "absolute",
    overflow: "hidden",
  },
  scanLine: {
    height: 2,
    borderRadius: 1,
    backgroundColor: cameraPalette.scanLine,
  },
  captionBox: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    paddingHorizontal: space.space8,
  },
});
