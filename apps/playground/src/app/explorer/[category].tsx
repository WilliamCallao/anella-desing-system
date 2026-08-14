import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState, Icon, Text } from "@antonella/ui";
import { background, border, space, spacing, text, TextType } from "@antonella/theme";
import { ComponentShowcase } from "../../explorer/ComponentShowcase";
import { findCategory } from "../../explorer/registry";

export default function CategoryScreen() {
  const router = useRouter();
  const { category: categoryId } = useLocalSearchParams<{ category: string }>();
  const category = findCategory(categoryId ?? "");

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />

      {!category ? (
        <>
          <Header title="Componentes" caption="Categoría no encontrada" onBack={goBack} />
          <View style={styles.empty}>
            <EmptyState
              icon="alert-circle"
              title="Categoría no encontrada"
              caption={`No existe una categoría con id "${categoryId}".`}
            />
          </View>
        </>
      ) : (
        <>
          <Header
            title={category.title}
            caption={`${category.components.length} componentes · variantes y estados`}
            onBack={goBack}
          />
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {category.components.map((component) => (
              <ComponentShowcase key={component.id} component={component} />
            ))}
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
}

function Header({
  title,
  caption,
  onBack,
}: {
  title: string;
  caption: string;
  onBack: () => void;
}) {
  return (
    <View style={styles.header}>
      <Pressable
        onPress={onBack}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Volver"
        style={({ pressed }) => [styles.back, pressed && styles.pressed]}
      >
        <Icon name="arrow-back" size={22} color={text.default} />
      </Pressable>
      <View style={styles.headerText}>
        <Text variant={TextType.Title}>{title}</Text>
        <Text variant={TextType.Caption} color={text.secondary}>
          {caption}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: background.default,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: border.divider.secondary,
    backgroundColor: background.surface,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: background.default,
  },
  headerText: {
    flex: 1,
    gap: 2,
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
  empty: {
    flex: 1,
    justifyContent: "center",
    padding: space.space5,
  },
});
