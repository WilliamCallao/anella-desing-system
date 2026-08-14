import { animaciones } from "./categories/animaciones";
import { botones } from "./categories/botones";
import { checklists } from "./categories/checklists";
import { dialogos } from "./categories/dialogos";
import { filtros } from "./categories/filtros";
import { formularios } from "./categories/formularios";
import { other } from "./categories/other";
import { tipografia } from "./categories/tipografia";
import type { ComponentCategory } from "./types";

export type { ComponentCategory, ComponentEntry, VariantDemo } from "./types";

export const componentCategories = [formularios, animaciones, botones, dialogos, checklists, filtros, other, tipografia];

export function findCategory(id: string): ComponentCategory | undefined {
  return componentCategories.find((category) => category.id === id);
}
