import type { ReactNode } from "react";
import type { IconName } from "@antonella/ui";

export type SectionKey =
  | "componentes"
  | "navegacion"
  | "contenido"
  | "iconos"
  | "layouts"
  | "colores"
  | "animaciones";

export type VariantDemo = {
  id: string;
  label: string;
  render: () => ReactNode;
};

export type ComponentEntry = {
  id: string;
  name: string;
  description: string;
  variants: VariantDemo[];
};

export type ComponentCategory = {
  id: string;
  title: string;
  icon: IconName;
  components: ComponentEntry[];
};

export type SectionMeta = {
  key: SectionKey;
  title: string;
  icon: IconName;
  order: number;
  items: string[];
};

export type SectionWithCategories = SectionMeta & {
  categories: ComponentCategory[];
};
