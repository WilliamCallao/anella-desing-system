import React, { useState } from "react";
import { AppFilterChips } from "@antonella/ui";
import type { ComponentCategory } from "../types";
import { FILTER_OPTIONS } from "./shared";

function FilterChipsDemo() {
  const [value, setValue] = useState("all");
  return <AppFilterChips options={FILTER_OPTIONS} value={value} onChange={setValue} />;
}

export const filtros: ComponentCategory = {
  id: "filtros",
  title: "Filtros",
  icon: "search",
  components: [
    {
      id: "app-filter-chips",
      name: "AppFilterChips",
      description: "Fila de chips de filtro con selección única. Puede controlarse desde afuera.",
      variants: [
        { id: "filtros", label: "Filtros", render: () => <FilterChipsDemo /> },
      ],
    },
  ],
};
