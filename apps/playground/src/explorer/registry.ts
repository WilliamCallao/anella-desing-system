import { animaciones } from "./categories/animaciones";
import { arbol } from "./categories/arbol";
import { botones } from "./categories/botones";
import { bottomBars } from "./categories/bottom-bars";
import { checklists } from "./categories/checklists";
import { composingOrb } from "./categories/composing-orb";
import { dialogos } from "./categories/dialogos";
import { filtros } from "./categories/filtros";
import { formularios } from "./categories/formularios";
import { inputs } from "./categories/inputs";
import { other } from "./categories/other";
import { tipografia } from "./categories/tipografia";
import type { ComponentCategory } from "./types";

export type { ComponentCategory, ComponentEntry, VariantDemo } from "./types";

export const componentCategories = [formularios, inputs, animaciones, botones, dialogos, checklists, filtros, arbol, other, tipografia, bottomBars, composingOrb];

export function findCategory(id: string): ComponentCategory | undefined {
  return componentCategories.find((category) => category.id === id);
}
