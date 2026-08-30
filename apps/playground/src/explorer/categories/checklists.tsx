import React, { useState } from "react";
import { AppCheckItem } from "@william-callao/antonella-ui";
import type { ComponentCategory } from "../types";

type CheckItemDemoProps = {
  label?: string;
  initialStatus?: "pending" | "ok" | "not-ok";
  readOnly?: boolean;
};

function CheckItemDemo({
  label = "Inspeccionar tanque",
  initialStatus = "pending",
  readOnly = false,
}: CheckItemDemoProps) {
  const [status, setStatus] = useState(initialStatus);
  return (
    <AppCheckItem
      label={label}
      description="Revisar fugas y presión"
      value={status}
      onChange={setStatus}
      readOnly={readOnly}
    />
  );
}

export const checklists: ComponentCategory = {
  id: "checklists",
  title: "Checklists",
  icon: "checklist",
  components: [
    {
      id: "app-check-item",
      name: "AppCheckItem",
      description: "Fila de checklist con estado pending / ok / not-ok y acciones de marcado.",
      variants: [
        { id: "pending", label: "Pendiente", render: () => <CheckItemDemo /> },
        { id: "ok", label: "Correcto", render: () => <CheckItemDemo initialStatus="ok" /> },
        { id: "not-ok", label: "Incorrecto", render: () => <CheckItemDemo initialStatus="not-ok" /> },
        { id: "readonly", label: "Solo lectura", render: () => <CheckItemDemo initialStatus="ok" readOnly /> },
      ],
    },
  ],
};
