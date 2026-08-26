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
import type { ComponentCategory } from "./types";

export type { ComponentCategory, ComponentEntry, VariantDemo } from "./types";

export const componentCategories = [formularios, inputs, animaciones, botones, dialogos, checklists, filtros, arbol, other, tipografia, bottomBars, composingOrb, drawerMenu, drawerMenuItem, searchBar, categoryText, layout, sheetLayout, mainLayout, mainLayoutApp];

export const sectionCategories: ComponentCategory[] = [colores, semanticTokens];

export function findCategory(id: string): ComponentCategory | undefined {
  return [...componentCategories, ...sectionCategories].find((category) => category.id === id);
}
