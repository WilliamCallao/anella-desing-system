import type { ReactElement } from "react";

export type AppInputProps = {
  label: string;
  labelWidth?: number;
  /** Mensaje de error de validación: se muestra como caption roja debajo de la
   *  fila. */
  error?: string;
};

export type AppInputElement = ReactElement<AppInputProps>;
