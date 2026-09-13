import type { CameraType, FlashMode } from "expo-camera";

/** Orientación de la cámara (cámara trasera o frontal). */
export type CameraFacing = CameraType;

/** Modo de flash para la captura de fotos (off → on → auto). */
export type CameraFlashMode = FlashMode;

/** Resultado de una foto capturada con la cámara. */
export type CapturePhoto = {
  /** URI local (nativo) o base64 (web) de la imagen capturada. */
  uri: string;
  /** Ancho de la imagen. */
  width: number;
  /** Alto de la imagen. */
  height: number;
};

/** Resultado de un código escaneado. */
export type ScanResult = {
  /** Tipo de código escaneado (ej. "qr", "code128"). */
  type: string;
  /** Información decodificada del código. */
  value: string;
};