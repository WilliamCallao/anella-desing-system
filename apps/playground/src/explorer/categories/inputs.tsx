import React, { useState } from "react";
import { Input, TextField } from "@antonella/ui";
import type { ComponentCategory } from "../types";

function BasicDemo() {
  const [value, setValue] = useState("");
  return (
    <TextField
      label="Nombre"
      value={value}
      onChangeText={setValue}
      placeholder="Nombre y apellido"
    />
  );
}

function PlaceholderDemo() {
  const [value, setValue] = useState("");
  return (
    <TextField
      label="Campo"
      value={value}
      onChangeText={setValue}
      placeholder="Ingresá un valor…"
    />
  );
}

function WithValueDemo() {
  const [value, setValue] = useState("María Antonella");
  return (
    <TextField
      label="Nombre"
      value={value}
      onChangeText={setValue}
      placeholder="Nombre y apellido"
    />
  );
}

function MultilineDemo() {
  const [notes, setNotes] = useState("");
  return (
    <TextField
      label="Notas"
      value={notes}
      onChangeText={setNotes}
      placeholder="Algo que tengamos en cuenta…"
      multiline
    />
  );
}

function DisabledDemo() {
  return (
    <TextField
      label="Nombre"
      value="María Antonella"
      onChangeText={() => {}}
      editable={false}
    />
  );
}

function ErrorDemo() {
  const [value, setValue] = useState("");
  return (
    <TextField
      label="Email"
      value={value}
      onChangeText={setValue}
      placeholder="nombre@empresa.com"
      keyboardType="email-address"
      error="Este campo es obligatorio"
    />
  );
}

function SecureDemo() {
  const [value, setValue] = useState("");
  return (
    <TextField
      label="Contraseña"
      value={value}
      onChangeText={setValue}
      placeholder="••••••••"
      secureTextEntry
    />
  );
}

function InputBasicDemo() {
  const [value, setValue] = useState("");
  return (
    <Input placeholder="Buscar…" value={value} onChangeText={setValue} />
  );
}

function InputIconDemo() {
  const [value, setValue] = useState("");
  return (
    <Input icon="search" placeholder="Buscar…" value={value} onChangeText={setValue} />
  );
}

export const inputs: ComponentCategory = {
  id: "inputs",
  title: "Inputs",
  icon: "pencil",
  components: [
    {
      id: "text-field",
      name: "TextField",
      description: "Input de texto estilo iOS: label fijo arriba, campo gris redondeado con placeholder debajo.",
      variants: [
        { id: "basico", label: "Básico", render: () => <BasicDemo /> },
        { id: "placeholder", label: "Placeholder", render: () => <PlaceholderDemo /> },
        { id: "valor", label: "Con valor", render: () => <WithValueDemo /> },
        { id: "multiline", label: "Multilínea", render: () => <MultilineDemo /> },
        { id: "deshabilitado", label: "Deshabilitado", render: () => <DisabledDemo /> },
        { id: "error", label: "Con error", render: () => <ErrorDemo /> },
        { id: "seguro", label: "Seguro", render: () => <SecureDemo /> },
      ],
    },
    {
      id: "input",
      name: "Input",
      description: "Campo de texto estilo iOS con relleno gris redondeado y soporte de ícono opcional.",
      variants: [
        { id: "basico", label: "Básico", render: () => <InputBasicDemo /> },
        { id: "icono", label: "Con ícono", render: () => <InputIconDemo /> },
      ],
    },
  ],
};
