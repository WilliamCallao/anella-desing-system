import React, { useState } from "react";
import { Alert, Pressable, StyleSheet } from "react-native";
import { useRouter, type Href } from "expo-router";
import {
  BarcodeScannerScreen,
  CameraCaptureScreen,
  Text,
  type ScanResult,
} from "@william-callao/antonella-ui";
import type { ComponentCategory } from "../types";

// ── Botón de apertura (variante "Abrir") ───────────────────

function OpenScreenButton({ href, label }: { href: Href; label: string }) {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push(href)}
      style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
    >
      <Text variant="body" style={styles.chipText}>
        {label} →
      </Text>
    </Pressable>
  );
}

// ── Demos de pantalla completa (montados por las rutas) ────

function useClose() {
  const router = useRouter();
  return () => {
    if (router.canGoBack()) router.back();
  };
}

/** Captura de foto a pantalla completa. Entrega `CapturePhoto` vía `onCapture`. */
export function CameraCaptureDemo() {
  const close = useClose();
  return (
    <CameraCaptureScreen
      title="Cámara"
      onClose={close}
      onCapture={(photo) => {
        Alert.alert("Foto capturada", `URI: ${photo.uri} · ${photo.width}×${photo.height}`);
        close();
      }}
      onCameraError={(error) => Alert.alert("Error de cámara", String(error))}
    />
  );
}

/** Escaneo de QR a pantalla completa. Entrega `ScanResult` vía `onScan`. */
export function CameraScanDemo() {
  const close = useClose();
  const [torch, setTorch] = useState(false);
  return (
    <BarcodeScannerScreen
      title="Escanear QR"
      caption="Enfocá un código QR dentro del marco."
      onClose={close}
      torch={torch}
      onTorchChange={setTorch}
      onScan={(result: ScanResult) => {
        Alert.alert("Código leído", `${result.type}: ${result.value}`);
        close();
      }}
      onCameraError={(error) => Alert.alert("Error de cámara", String(error))}
    />
  );
}

// ── Categoría ──────────────────────────────────────────────

export const camara: ComponentCategory = {
  id: "camara",
  title: "Cámara",
  icon: "camera",
  components: [
    {
      id: "camera-capture-screen",
      name: "CameraCaptureScreen",
      description:
        "Pantalla de captura de fotos host-agnóstica (ruta o Modal): preview full, flash off→on→auto, cambio de cámara y obturador. Permiso de cámara resuelto automáticamente.",
      variants: [
        {
          id: "fullscreen",
          label: "Abrir captura",
          render: () => (
            <OpenScreenButton
              href={"/explorer/camera-capture" as Href}
              label="Abrir en pantalla completa"
            />
          ),
        },
      ],
    },
    {
      id: "barcode-scanner-screen",
      name: "BarcodeScannerScreen",
      description:
        "Escáner de códigos (QR por defecto) con viewfinder de esquinas, línea animada, linterna y vibración al detectar. Scaffold listo para conectar `onScan` a la lógica del host.",
      variants: [
        {
          id: "fullscreen",
          label: "Abrir escáner",
          render: () => (
            <OpenScreenButton
              href={"/explorer/camera-scan" as Href}
              label="Abrir en pantalla completa"
            />
          ),
        },
      ],
    },
  ],
};

const styles = StyleSheet.create({
  chip: {
    alignSelf: "flex-start",
    backgroundColor: "#0A84FF",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipPressed: {
    opacity: 0.7,
  },
  chipText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});