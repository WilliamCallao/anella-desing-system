import React, { useState } from "react";
import { View } from "react-native";
import { AppButton, AppFormCard, AppSelector, AppTextArea, AppTextInput } from "@william-callao/antonella-ui";
import type { ComponentCategory } from "../types";
import { PROVINCE_OPTIONS, noop } from "./shared";
import { spacing } from "@william-callao/antonella-theme";

// --- AppTextInput ---

function BasicDemo() {
  const [name, setName] = useState("María Antonella");
  return (
    <AppFormCard>
      <AppTextInput label="Nombre" value={name} onChangeText={setName} placeholder="Nombre y apellido" />
    </AppFormCard>
  );
}

function PlaceholderDemo() {
  const [value, setValue] = useState("");
  return (
    <AppFormCard>
      <AppTextInput label="Campo" value={value} onChangeText={setValue} placeholder="Ingresá un valor…" />
    </AppFormCard>
  );
}

function DisabledDemo() {
  return (
    <AppFormCard>
      <AppTextInput label="Nombre" value="Solo lectura" onChangeText={() => {}} editable={false} />
    </AppFormCard>
  );
}

// --- AppTextArea ---

function TextAreaBasicDemo() {
  const [notes, setNotes] = useState("");
  return (
    <AppFormCard>
      <AppTextArea label="Notas" value={notes} onChangeText={setNotes} placeholder="Algo que tengamos en cuenta…" />
    </AppFormCard>
  );
}

function TextAreaPreFillDemo() {
  const [notes, setNotes] = useState("Lorem ipsum dolor sit amet, consectetur adipiscing elit.");
  return (
    <AppFormCard>
      <AppTextArea label="Notas" value={notes} onChangeText={setNotes} placeholder="Algo que tengamos en cuenta…" />
    </AppFormCard>
  );
}

// --- AppSelector ---

function SelectorPlaceholderDemo() {
  const [value, setValue] = useState("");
  return (
    <AppFormCard>
      <AppSelector label="Provincia" value={value} onChange={setValue} options={PROVINCE_OPTIONS} placeholder="Seleccionar provincia" />
    </AppFormCard>
  );
}

function SelectorSelectedDemo() {
  const [value, setValue] = useState("cba");
  return (
    <AppFormCard>
      <AppSelector label="Provincia" value={value} onChange={setValue} options={PROVINCE_OPTIONS} />
    </AppFormCard>
  );
}

// --- Formularios completos ---

function FormBasicDemo() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  return (
    <AppFormCard>
      <AppTextInput label="Nombre" value={name} onChangeText={setName} placeholder="Nombre y apellido" />
      <AppTextInput label="Email" value={email} onChangeText={setEmail} placeholder="nombre@empresa.com" keyboardType="email-address" />
    </AppFormCard>
  );
}

function FormCompleteDemo() {
  const [name, setName] = useState("Antonella García");
  const [province, setProvince] = useState("cba");
  const [notes, setNotes] = useState("");
  return (
    <View style={{ gap: spacing.md }}>
      <AppFormCard>
        <AppTextInput label="Nombre" value={name} onChangeText={setName} placeholder="Nombre y apellido" />
        <AppSelector label="Provincia" value={province} onChange={setProvince} options={PROVINCE_OPTIONS} />
        <AppTextArea label="Notas" value={notes} onChangeText={setNotes} placeholder="Algo que tengamos en cuenta…" />
      </AppFormCard>
      <AppButton label="Guardar" onPress={noop} />
    </View>
  );
}

export const formularios: ComponentCategory = {
  id: "formularios",
  title: "Formularios",
  icon: "clipboard",
  components: [
    {
      id: "app-form-card",
      name: "AppFormCard",
      description: "Contenedor de inputs con divisores finos (estilo iOS inset grouped).",
      variants: [
        { id: "basico", label: "Básico", render: () => <FormBasicDemo /> },
        { id: "completo", label: "Completo", render: () => <FormCompleteDemo /> },
      ],
    },
    {
      id: "app-text-input",
      name: "AppTextInput",
      description: "Campo de texto con label, valor alineado a la derecha y crece con el contenido.",
      variants: [
        { id: "basico", label: "Básico", render: () => <BasicDemo /> },
        { id: "placeholder", label: "Placeholder", render: () => <PlaceholderDemo /> },
        { id: "disabled", label: "Deshabilitado", render: () => <DisabledDemo /> },
      ],
    },
    {
      id: "app-text-area",
      name: "AppTextArea",
      description: "Área de texto multilínea con label.",
      variants: [
        { id: "basico", label: "Básico", render: () => <TextAreaBasicDemo /> },
        { id: "prefill", label: "Con texto", render: () => <TextAreaPreFillDemo /> },
      ],
    },
    {
      id: "app-selector",
      name: "AppSelector",
      description: "Selector con dropdown animado: despliega las opciones dentro de la fila.",
      variants: [
        { id: "placeholder", label: "Placeholder", render: () => <SelectorPlaceholderDemo /> },
        { id: "seleccionado", label: "Seleccionado", render: () => <SelectorSelectedDemo /> },
      ],
    },
  ],
};
