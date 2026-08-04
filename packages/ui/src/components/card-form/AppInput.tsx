import type { ReactElement } from "react";

export type AppInputProps = {
  label: string;
  labelWidth?: number;
};

export type AppInputElement = ReactElement<AppInputProps>;
