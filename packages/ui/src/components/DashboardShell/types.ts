import React from "react";
import type { DashboardShellTokens } from "@william-callao/antonella-theme";
import type { IconName } from "../Icon";

export type SidebarItem = {
  id: string;
  label: string;
  icon?: IconName;
  badge?: string | number;
  active?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
  testID?: string;
};

export type SidebarSection = {
  id: string;
  title?: string;
  items: SidebarItem[];
};

export type SidebarType = "responsive" | "full" | "icon";

export type DashboardShellProps = {
  sections: SidebarSection[];
  sidebarHeader?: React.ReactNode;
  sidebarFooter?: React.ReactNode;
  topBar?: React.ReactNode;
  title?: string;
  brand?: string;
  logoutLabel?: string;
  onLogout?: () => void;
  type?: SidebarType;
  themeMode?: "light" | "dark";
  tokens?: Partial<DashboardShellTokens>;
  selectedItemId?: string;
  children: React.ReactNode;
};
