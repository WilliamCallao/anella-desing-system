import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Card, Icon, Text } from "@antonella/ui";
import { background, border, cta1, space, spacing, text, TextType } from "@antonella/theme";
import { componentCategories, sectionCategories, type ComponentCategory } from "../../explorer/registry";

export default function ExplorerScreen() {
  const router = useRouter();

  const handleSelectCategory = (category: ComponentCategory) => {
    router.push(`/explorer/${category.id}`);
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Pressable
        onPress={() => handleSelectCategory({ id: "colores" } as ComponentCategory)}
        style={({ pressed }) => [styles.colorCard, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel="Explorar colores"
      >
        <View style={styles.colorIconBox}>
          <Icon name="analytics" size={20} color="#FFFFFF" />
        </View>
        <View style={styles.colorBody}>
          <Text variant={TextType.BodyMedium} color="#FFFFFF">
            Explorar Colores
          </Text>
          <Text variant={TextType.Caption} color="rgba(255,255,255,0.7)">
            Palette, tokens y escalas de color
          </Text>
        </View>
        <Icon name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
      </Pressable>

      {sectionCategories.filter((c) => c.id !== "colores").map((section) => (
        <Pressable
          key={section.id}
          onPress={() => handleSelectCategory(section)}
          style={({ pressed }) => [styles.semanticCard, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={section.title}
        >
          <View style={styles.semanticIconBox}>
            <Icon name={section.icon} size={20} color="#FFFFFF" />
          </View>
          <View style={styles.colorBody}>
            <Text variant={TextType.BodyMedium} color="#FFFFFF">
              {section.title}
            </Text>
            <Text variant={TextType.Caption} color="rgba(255,255,255,0.7)">
              {section.components[0]?.description?.slice(0, 60)}...
            </Text>
          </View>
          <Icon name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
        </Pressable>
      ))}

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
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: background.default,
  },
  content: {
    padding: space.space4,
    gap: space.space3,
    paddingBottom: space.space12,
  },
  pressed: {
    opacity: 0.7,
  },
  colorCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: 56,
    paddingHorizontal: space.space3,
    paddingVertical: space.space3,
    borderRadius: 14,
    backgroundColor: cta1,
  },
  semanticCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: 56,
    paddingHorizontal: space.space3,
    paddingVertical: space.space3,
    borderRadius: 14,
    backgroundColor: "#7C3AED",
  },
  colorBody: {
    flex: 1,
    gap: 2,
  },
  colorIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  semanticIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
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
