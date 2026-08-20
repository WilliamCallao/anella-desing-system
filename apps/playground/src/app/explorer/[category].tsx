import { Stack, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { EmptyState } from "@antonella/ui";
import { background, space } from "@antonella/theme";
import { ComponentShowcase } from "../../explorer/ComponentShowcase";
import { findCategory } from "../../explorer/registry";

export default function CategoryScreen() {
  const { category: categoryId } = useLocalSearchParams<{ category: string }>();
  const category = findCategory(categoryId ?? "");

  return (
    <>
      <Stack.Screen
        options={{
          title: category?.title ?? "Categoría",
        }}
      />

      {!category ? (
        <View style={styles.empty}>
          <EmptyState
            icon="alert-circle"
            title="Categoría no encontrada"
            caption={`No existe una categoría con id "${categoryId}".`}
          />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {category.components.map((component) => (
            <ComponentShowcase key={component.id} component={component} />
          ))}
        </ScrollView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: background.default,
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
    backgroundColor: background.default,
  },
});
