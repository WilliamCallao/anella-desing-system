import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";

export type SheetKind = "topSheet" | "bottomSheet" | "fullHeader" | "fullBody";

export interface RouteOptions {
  /** Para bottomSheet: colapsa el header al hacer scroll. Default true. */
  collapseOnScroll?: boolean;
  /** Radio de la hoja (esquinas). Default 32. */
  radius?: number;
  /** Ignora el alto medido del header y fija este alto (px). */
  fixedHeaderHeight?: number;
}

export interface Route {
  key: string;
  kind: SheetKind;
  header?: ReactNode;
  body?: ReactNode;
  headerBackgroundColor?: string;
  bodyBackgroundColor?: string;
  options?: RouteOptions;
}

export interface SheetLayoutProps {
  routes: Route[];
  activeKey: string;
  /** Se dispara cuando una capa interna pide cambiar de ruta. */
  onRequestChange?: (key: string) => void;
  style?: StyleProp<ViewStyle>;
}

export type LayerRole = "active" | "entering" | "exiting";
