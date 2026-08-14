import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, Icon, Text } from "@antonella/ui";
import { background, border, cta1, space, spacing, text, TextType } from "@antonella/theme";
import { componentCategories, type ComponentCategory } from "../../explorer/registry";

export default function ExplorerScreen() {
  const router = useRouter();

  const handleSelectCategory = (category: ComponentCategory) => {
    router.push(`/explorer/${category.id}`);
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.header}>
        <Text variant={TextType.Title}>Explorador</Text>
        <Text variant={TextType.Caption} color={text.secondary}>
          Componentes Antonella
        </Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card>
          <Text variant={TextType.Heading}>Componentes App*</Text>
          <Text variant={TextType.Caption} color={text.secondary}>
            Tocá una categoría para ver cada componente con sus variantes.
          </Text>
        </Card>

        <View style={styles.legend}>
          {componentCategories.map((category) => (
            <Pressable
              key={category.id}
              onPress={() => handleSelectCategory(category)}
              style={({ pressed }) => [styles.legendRow, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel={category.title}
            >
              <View style={styles.iconBox}>
                <Icon name={category.icon} size={18} color={cta1} />
              </View>
              <View style={styles.legendBody}>
                <Text variant={TextType.BodyMedium}>{category.title}</Text>
                <Text variant={TextType.Caption} color={text.secondary}>
                  {category.components.length} {category.components.length === 1 ? "componente" : "componentes"}
                </Text>
              </View>
              <Icon name="chevron-forward" size={18} color={text.secondary} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: background.default,
  },
  header: {
    flexDirection: "column",
    gap: 2,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: border.divider.secondary,
    backgroundColor: background.surface,
  },
  pressed: {
    opacity: 0.7,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: space.space4,
    gap: space.space4,
    paddingBottom: space.space12,
  },
  legend: {
    gap: space.space2,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: 52,
    paddingHorizontal: space.space3,
    paddingVertical: space.space2,
    borderRadius: 14,
    backgroundColor: background.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: border.divider.secondary,
  },
  legendBody: {
    flex: 1,
    gap: 2,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,122,255,0.10)",
  },
});
