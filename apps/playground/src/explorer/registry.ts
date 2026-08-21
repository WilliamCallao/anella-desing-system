import { animaciones } from "./categories/animaciones";
import { arbol } from "./categories/arbol";
import { botones } from "./categories/botones";
import { bottomBars } from "./categories/bottom-bars";
import { checklists } from "./categories/checklists";
import { colores } from "./categories/colores";
import { composingOrb } from "./categories/composing-orb";
import { dialogos } from "./categories/dialogos";
import { drawerMenu } from "./categories/drawer-menu";
import { filtros } from "./categories/filtros";
import { formularios } from "./categories/formularios";
import { inputs } from "./categories/inputs";
import { layout } from "./categories/layout";
import { other } from "./categories/other";
import { semanticTokens } from "./categories/semantic-tokens";
import { tipografia } from "./categories/tipografia";
import type { ComponentCategory } from "./types";

export type { ComponentCategory, ComponentEntry, VariantDemo } from "./types";

export const componentCategories = [formularios, inputs, animaciones, botones, dialogos, checklists, filtros, arbol, other, tipografia, bottomBars, composingOrb, drawerMenu, layout];

export const sectionCategories: ComponentCategory[] = [colores, semanticTokens];

export function findCategory(id: string): ComponentCategory | undefined {
  return [...componentCategories, ...sectionCategories].find((category) => category.id === id);
}
