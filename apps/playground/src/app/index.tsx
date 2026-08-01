import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Input, Text } from "@antonella/ui";
import { palette, spacing } from "@antonella/theme";

export default function Index() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text variant="title">Antonella Playground</Text>
      <Text variant="caption" color={palette.textMuted}>
        Documentación viva de la plataforma. Cada componente tendrá su propia pantalla.
      </Text>

      <Card>
        <Text variant="heading">Button</Text>
        <View style={styles.row}>
          <Button label="Primary" />
          <Button label="Secondary" variant="secondary" />
          <Button label="Ghost" variant="ghost" />
          <Button label="Danger" variant="danger" />
        </View>
        <View style={styles.row}>
          <Button label="Small" size="sm" />
          <Button label="Large" size="lg" />
          <Button label="Disabled" disabled />
        </View>
      </Card>

      <Card>
        <Text variant="heading">Input</Text>
        <Input placeholder="Escribí algo…" />
      </Card>

      <Card>
        <Text variant="heading">Typography</Text>
        <Text variant="title">Title</Text>
        <Text variant="heading">Heading</Text>
        <Text variant="body">Body</Text>
        <Text variant="caption">Caption</Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
