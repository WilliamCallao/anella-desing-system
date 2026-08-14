import { View } from "react-native";
import { AppButton, Button } from "@antonella/ui";
import type { ComponentCategory } from "../types";
import { demoStyles, noop } from "./shared";

export const botones: ComponentCategory = {
  id: "botones",
  title: "Botones",
  icon: "add",
  components: [
    {
      id: "app-button",
      name: "AppButton",
      description: "Botón de formulario con variantes solid, outline y ghost.",
      variants: [
        { id: "solid", label: "Solid", render: () => <AppButton label="Guardar" onPress={noop} /> },
        { id: "outline", label: "Outline", render: () => <AppButton label="Cancelar" variant="outline" onPress={noop} /> },
        { id: "ghost", label: "Ghost", render: () => <AppButton label="Más información" variant="ghost" onPress={noop} /> },
        { id: "disabled", label: "Deshabilitado", render: () => <AppButton label="Guardar" disabled /> },
      ],
    },
    {
      id: "button",
      name: "Button",
      description: "Botón general con variantes primary, secondary, ghost y danger.",
      variants: [
        {
          id: "row",
          label: "Row",
          render: () => (
            <View style={demoStyles.row}>
              <Button label="Primary" variant="primary" onPress={noop} />
              <Button label="Secondary" variant="secondary" onPress={noop} />
              <Button label="Ghost" variant="ghost" onPress={noop} />
              <Button label="Danger" variant="danger" onPress={noop} />
            </View>
          ),
        },
        {
          id: "sizes",
          label: "Sizes",
          render: () => (
            <View style={demoStyles.row}>
              <Button label="Sm" size="sm" onPress={noop} />
              <Button label="Md" size="md" onPress={noop} />
              <Button label="Lg" size="lg" onPress={noop} />
            </View>
          ),
        },
      ],
    },
  ],
};
