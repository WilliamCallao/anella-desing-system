import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Input, TextField } from "@antonella/ui";
import { card, radius, spacing } from "@antonella/theme";
import type { ComponentCategory } from "../types";

function DemoSurface({ children }: { children: React.ReactNode }) {
  return <View style={styles.surface}>{children}</View>;
}

function BasicDemo() {
  const [value, setValue] = useState("");
  return (
    <DemoSurface>
      <TextField
        label="Nombre"
        value={value}
        onChangeText={setValue}
        placeholder="Nombre y apellido"
      />
    </DemoSurface>
  );
}

function PlaceholderDemo() {
  const [value, setValue] = useState("");
  return (
    <DemoSurface>
      <TextField
        label="Campo"
        value={value}
        onChangeText={setValue}
        placeholder="Ingresá un valor…"
      />
    </DemoSurface>
  );
}

function WithValueDemo() {
  const [value, setValue] = useState("María Antonella");
  return (
    <DemoSurface>
      <TextField
        label="Nombre"
        value={value}
        onChangeText={setValue}
        placeholder="Nombre y apellido"
      />
    </DemoSurface>
  );
}

function MultilineDemo() {
  const [notes, setNotes] = useState("");
  return (
    <DemoSurface>
      <TextField
        label="Notas"
        value={notes}
        onChangeText={setNotes}
        placeholder="Algo que tengamos en cuenta…"
        multiline
      />
    </DemoSurface>
  );
}

function DisabledDemo() {
  return (
    <DemoSurface>
      <TextField
        label="Nombre"
        value="María Antonella"
        onChangeText={() => {}}
        editable={false}
      />
    </DemoSurface>
  );
}

function ErrorDemo() {
  const [value, setValue] = useState("");
  return (
    <DemoSurface>
      <TextField
        label="Email"
        value={value}
        onChangeText={setValue}
        placeholder="nombre@empresa.com"
        keyboardType="email-address"
        error="Este campo es obligatorio"
      />
    </DemoSurface>
  );
}

function SecureDemo() {
  const [value, setValue] = useState("");
  return (
    <DemoSurface>
      <TextField
        label="Contraseña"
        value={value}
        onChangeText={setValue}
        placeholder="••••••••"
        secureTextEntry
      />
    </DemoSurface>
  );
}

function InputBasicDemo() {
  const [value, setValue] = useState("");
  return (
    <DemoSurface>
      <Input placeholder="Buscar…" value={value} onChangeText={setValue} />
    </DemoSurface>
  );
}

function InputIconDemo() {
  const [value, setValue] = useState("");
  return (
    <DemoSurface>
      <Input icon="search" placeholder="Buscar…" value={value} onChangeText={setValue} />
    </DemoSurface>
  );
}

const styles = StyleSheet.create({
  surface: {
    backgroundColor: card.background,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.sm,
  },
});

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
