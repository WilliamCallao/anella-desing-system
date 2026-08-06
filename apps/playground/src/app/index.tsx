import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, DashboardShell, Input, Text, ToolsCard } from "@antonella/ui";
import type { SidebarSection } from "@antonella/ui";
import { palette, shellTokens, spacing } from "@antonella/theme";

const sections: SidebarSection[] = [
  {
    id: "principal",
    title: "Main",
    items: [
      { id: "dashboard", label: "Dashboard", icon: "home", onPress: () => Alert.alert("Dashboard") },
      {
        id: "analytics",
        label: "Analytics",
        icon: "bar-chart",
        badge: 3,
        onPress: () => Alert.alert("Analytics"),
      },
      { id: "users", label: "Users", icon: "user", onPress: () => Alert.alert("Users") },
    ],
  },
  {
    id: "config",
    title: "Config",
    items: [
      { id: "settings", label: "Settings", icon: "settings", onPress: () => Alert.alert("Settings") },
      { id: "notifications", label: "Notifications", icon: "notifications", onPress: () => Alert.alert("Notifications") },
      { id: "profile", label: "Profile", icon: "user-filled", onPress: () => Alert.alert("Profile") },
    ],
  },
];

export default function Index() {
  return (
    <DashboardShell
      sections={sections}
      selectedItemId="dashboard"
      title="Antonella Demo"
      brand="A"
      logoutLabel="Log out"
      onLogout={() => Alert.alert("Log out")}
      topBar={
        <View style={styles.topBar}>
          <Text variant="heading">Antonella Demo</Text>
          <Button label="New" size="sm" onPress={() => Alert.alert("New")} />
        </View>
      }
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text variant="title">Antonella Playground</Text>
        <Text variant="caption" color={palette.textMuted}>
          Documentation live for the platform. Each component will have its own screen.
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
          <Input placeholder="Type something…" />
        </Card>

        <Card>
          <Text variant="heading">Typography</Text>
          <Text variant="title">Title</Text>
          <Text variant="heading">Heading</Text>
          <Text variant="body">Body</Text>
          <Text variant="caption">Caption</Text>
        </Card>

        <Card>
          <Text variant="heading">ToolsCard</Text>
          <Text variant="caption" color={palette.textMuted}>
            Card de herramientas agrupadas: icono arriba, nombre debajo, separadores verticales.
          </Text>
          <View style={styles.row}>
            <ToolsCard
              tools={[
                { id: "t1", icon: "clipboard-filled", label: "Checklists", onPress: () => Alert.alert("Checklists") },
                { id: "t2", icon: "checklist-filled", label: "Inspección", onPress: () => Alert.alert("Inspección") },
                { id: "t3", icon: "bar-chart-filled", label: "Reportes", onPress: () => Alert.alert("Reportes") },
              ]}
            />
          </View>
        </Card>

        <Card>
          <Text variant="heading">DashboardShell</Text>
          <Text variant="body">
            This demo wraps its content in a DashboardShell: fixed sidebar on tablet and desktop, drawer on mobile.
          </Text>
          <Text variant="body">
            The content uses its own ScrollView to stay scrollable at both resolutions.
          </Text>
          <Text variant="body">
            Badges, the disabled item, and the active item are resolved from the shell props.
          </Text>
          <Text variant="body">
            The sidebar uses semantic icon names (IconName) from the design system — the app maps them to library icons via AppIcons.
          </Text>
        </Card>
      </ScrollView>
    </DashboardShell>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: shellTokens.contentBorder,
  },
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  content: {
    gap: spacing.lg,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
