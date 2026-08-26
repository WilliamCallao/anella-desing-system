import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Icon, Text } from "@antonella/ui";
import { background, border, cta1, space, spacing, text, TextType } from "@antonella/theme";
import { getSections, type ComponentCategory, type SectionWithCategories } from "../../explorer/registry";

export default function ExplorerScreen() {
  const router = useRouter();
  const sections = getSections();

  const handleSelectCategory = (category: ComponentCategory) => {
    router.push(`/explorer/${category.id}`);
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {sections.map((section) => (
        <SectionBlock
          key={section.key}
          section={section}
          onSelect={handleSelectCategory}
        />
      ))}
    </ScrollView>
  );
}

function SectionBlock({
  section,
  onSelect,
}: {
  section: SectionWithCategories;
  onSelect: (category: ComponentCategory) => void;
}) {
  if (section.categories.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIconBox}>
          <Icon name={section.icon} size={18} color={cta1} />
        </View>
        <Text variant={TextType.Heading}>{section.title}</Text>
      </View>

      <View style={styles.legend}>
        {section.categories.map((category) => (
          <Pressable
            key={category.id}
            onPress={() => onSelect(category)}
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
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: background.default,
  },
  content: {
    padding: space.space4,
    gap: space.space5,
    paddingBottom: space.space12,
  },
  pressed: {
    opacity: 0.7,
  },
  section: {
    gap: space.space3,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: space.space1,
  },
  sectionIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,122,255,0.10)",
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
