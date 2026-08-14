import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "@antonella/ui";
import { space, text, TextType } from "@antonella/theme";
import type { ComponentEntry } from "./types";

type ComponentShowcaseProps = {
  component: ComponentEntry;
};

export function ComponentShowcase({ component }: ComponentShowcaseProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant={TextType.Heading}>{component.name}</Text>
        {component.description ? (
          <Text variant={TextType.Caption} color={text.secondary}>
            {component.description}
          </Text>
        ) : null}
      </View>

      <View style={styles.variants}>
        {component.variants.map((variant) => (
          <View key={variant.id} style={styles.variant}>
            <Text variant={TextType.Overline}>{variant.label}</Text>
            <View style={styles.demo}>{variant.render()}</View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: space.space3,
  },
  header: {
    gap: space.space1,
  },
  variants: {
    gap: space.space4,
  },
  variant: {
    gap: space.space2,
  },
  demo: {
    gap: space.space2,
  },
});
