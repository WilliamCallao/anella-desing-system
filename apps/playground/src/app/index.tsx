import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, Icon, Text } from "@antonella/ui";
import { background, cta1, space, spacing, text, TextType } from "@antonella/theme";

export default function Index() {
  const router = useRouter();

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text variant={TextType.Title}>Antonella Playground</Text>
          <Text variant={TextType.Caption} color={text.secondary}>
            Documentación viva del sistema de diseño.
          </Text>
        </View>

        <Card>
          <View style={styles.cardHeader}>
            <Icon name="git-network" size={24} color={cta1} />
            <Text variant={TextType.Heading}>AppLayout (navegación)</Text>
          </View>
          <Text variant={TextType.Caption} color={text.secondary}>
            Demo de navegación completa: 6 pantallas con AppLayout y stack interno.
            El ejemplo más importante del sistema.
          </Text>
          <View style={styles.cta}>
            <Button label="Abrir navegación" onPress={() => router.push("/explorer/main-layout-app")} />
          </View>
        </Card>

        <Card>
          <View style={styles.cardHeader}>
            <Icon name="clipboard" size={24} color={cta1} />
            <Text variant={TextType.Heading}>Explorador de componentes</Text>
          </View>
          <Text variant={TextType.Caption} color={text.secondary}>
            Navegá los componentes Antonella (los que empiezan con "App") agrupados por categoría,
            cada uno con sus variantes y estados.
          </Text>
          <View style={styles.cta}>
            <Button label="Explorar componentes" onPress={() => router.push("/explorer")} />
          </View>
        </Card>

        <Card>
          <View style={styles.cardHeader}>
            <Icon name="barn" size={24} color={cta1} />
            <Text variant={TextType.Heading}>Explorador de animaciones</Text>
          </View>
          <Text variant={TextType.Caption} color={text.secondary}>
            Componentes de animación (TransitionView y presets) para transiciones fluidas.
          </Text>
          <View style={styles.cta}>
            <Button label="Explorar animaciones" onPress={() => router.push("/explorer/animaciones")} />
          </View>
        </Card>

        <Card>
          <View style={styles.cardHeader}>
            <Icon name="palette" size={24} color={cta1} />
            <Text variant={TextType.Heading}>Explorador de íconos</Text>
          </View>
          <Text variant={TextType.Caption} color={text.secondary}>
            Galería de todos los íconos de Antonella con su nombre de token.
          </Text>
          <View style={styles.cta}>
            <Button label="Explorar íconos" onPress={() => router.push("/explorer/iconos")} />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: background.default,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: space.space4,
    gap: space.space4,
  },
  hero: {
    gap: space.space1,
    paddingTop: space.space5,
    paddingBottom: space.space3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: space.space3,
  },
  cta: {
    marginTop: space.space4,
    alignItems: "flex-start",
    gap: spacing.sm,
  },
});
