import React, { useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "@william-callao/antonella-ui";
import { space, text, TextType } from "@william-callao/antonella-theme";
import type { ComponentEntry } from "./types";

type ComponentShowcaseProps = {
  component: ComponentEntry;
};

const nowMs = () => globalThis.performance?.now?.() ?? Date.now();

export function ComponentShowcase({ component }: ComponentShowcaseProps) {
  const t0 = useRef<number>(nowMs());
  const reported = useRef(false);
  const [openMs, setOpenMs] = useState<number | null>(null);
  return (
    <View
      style={styles.container}
      onLayout={() => {
        if (reported.current) return;
        reported.current = true;
        const ms = Math.round(nowMs() - t0.current);
        setOpenMs(ms);
        console.log(
          `[showcase] "${component.name}": mount→layout ${ms}ms (${component.variants.length} variantes)`,
        );
      }}
    >
      <View style={styles.header}>
        <Text variant={TextType.Heading}>{component.name}</Text>
        {component.description ? (
          <Text variant={TextType.Caption} color={text.secondary}>
            {component.description}
          </Text>
        ) : null}
        {openMs !== null ? (
          <Text variant={TextType.Caption} color={text.secondary}>
            Apertura: {openMs}ms
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
