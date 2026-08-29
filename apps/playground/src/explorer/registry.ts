import { animaciones } from "./categories/animaciones";
import { arbol } from "./categories/arbol";
import { botones } from "./categories/botones";
import { bottomBars } from "./categories/bottom-bars";
import { checklists } from "./categories/checklists";
import { colores } from "./categories/colores";
import { composingOrb } from "./categories/composing-orb";
import { dialogos } from "./categories/dialogos";
import { drawerMenu } from "./categories/drawer-menu";
import { drawerMenuItem } from "./categories/drawer-menu-item";
import { headerBar } from "./categories/header-bar";
import { searchBar } from "./categories/search-bar";
import { categoryText } from "./categories/category-text";
import { filtros } from "./categories/filtros";
import { formularios } from "./categories/formularios";
import { inputs } from "./categories/inputs";
import { layout } from "./categories/layout";
import { sheetLayout } from "./categories/sheet-layout";
import { mainLayout } from "./categories/main-layout";
import { mainLayoutApp } from "./categories/main-layout-app";
import { other } from "./categories/other";
import { semanticTokens } from "./categories/semantic-tokens";
import { tipografia } from "./categories/tipografia";
import { iconos } from "./categories/iconos";
import { toast } from "./categories/toast";
import type { ComponentCategory, SectionMeta, SectionWithCategories } from "./types";

export type { ComponentCategory, ComponentEntry, VariantDemo, SectionMeta, SectionWithCategories } from "./types";

export const componentCategories = [formularios, inputs, animaciones, botones, dialogos, checklists, filtros, arbol, other, tipografia, bottomBars, composingOrb, drawerMenu, drawerMenuItem, headerBar, searchBar, categoryText, layout, sheetLayout, mainLayout, mainLayoutApp, iconos, toast];

export const sectionCategories: ComponentCategory[] = [colores, semanticTokens];

export const sections: SectionMeta[] = [
  {
    key: "componentes",
    title: "Componentes",
    icon: "clipboard",
    order: 1,
    items: ["botones", "inputs", "formularios", "dialogos", "checklists", "filtros", "searchBar", "toast"],
  },
  {
    key: "navegacion",
    title: "Navegación",
    icon: "menu",
    order: 2,
    items: ["drawerMenu", "drawerMenuItem", "bottomBars", "headerBar", "categoryText"],
  },
  {
    key: "contenido",
    title: "Contenido",
    icon: "document-text",
    order: 3,
    items: ["arbol", "composingOrb", "other", "tipografia"],
  },
  {
    key: "iconos",
    title: "Iconos",
    icon: "palette",
    order: 4,
    items: ["iconos"],
  },
  {
    key: "layouts",
    title: "Layouts",
    icon: "bar-chart",
    order: 5,
    items: ["layout", "sheetLayout", "mainLayout", "mainLayoutApp"],
  },
  {
    key: "colores",
    title: "Colores",
    icon: "palette",
    order: 6,
    items: ["colores", "semanticTokens"],
  },
  {
    key: "animaciones",
    title: "Animaciones",
    icon: "loader",
    order: 7,
    items: ["animaciones"],
  },
];

export function getSections(): SectionWithCategories[] {
  return [...sections]
    .sort((a, b) => a.order - b.order)
    .map((section) => {
      const categories: ComponentCategory[] = [];
      for (const id of section.items) {
        const category = findCategory(id);
        if (!category) {
          console.warn(`[registry] Sección "${section.key}" referencia categoría inexistente: "${id}"`);
          continue;
        }
        categories.push(category);
      }
      return { ...section, categories };
    });
}

export function findCategory(id: string): ComponentCategory | undefined {
  return [...componentCategories, ...sectionCategories].find((category) => category.id === id);
}
