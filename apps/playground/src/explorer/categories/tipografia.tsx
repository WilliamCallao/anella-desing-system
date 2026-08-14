import { AppTextHeader } from "@antonella/ui";
import type { ComponentCategory } from "../types";

export const tipografia: ComponentCategory = {
  id: "tipografia",
  title: "Tipografía",
  icon: "document-text",
  components: [
    {
      id: "app-text-header",
      name: "AppTextHeader",
      description: "Encabezado simple: heading + caption.",
      variants: [
        {
          id: "con-caption",
          label: "Con caption",
          render: () => <AppTextHeader heading="Resumen de la semana" caption="Últimos 7 días · 3 reportes" />,
        },
        {
          id: "solo-heading",
          label: "Solo heading",
          render: () => <AppTextHeader heading="Inventario" />,
        },
      ],
    },
  ],
};
