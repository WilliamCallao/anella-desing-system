import React from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text, AppLayout, useAppNavigation, type AppRoute } from "@antonella/ui";
import type { ComponentCategory } from "../types";

const pad = (children: React.ReactNode, style?: object) => (
  <View style={[styles.screenPad, style]}>{children}</View>
);

function Row({ label, index }: { label: string; index: number }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowIcon} />
      <View style={styles.rowBody}>
        <Text variant="bodyMedium" style={styles.rowTitle}>
          {label} #{index + 1}
        </Text>
        <Text variant="caption" style={styles.rowCaption}>
          Descripción de ejemplo para la fila
        </Text>
      </View>
    </View>
  );
}

function MockList({ n, label }: { n: number; label: string }) {
  return (
    <View style={styles.list}>
      {Array.from({ length: n }).map((_, i) => (
        <Row key={i} label={label} index={i} />
      ))}
    </View>
  );
}

function HomeHeader() {
  const { navigate } = useAppNavigation();
  return pad(
    <View style={styles.gap}>
      <Text variant="heading" style={styles.screenTitle}>
        Inicio
      </Text>
      <Text variant="body" style={styles.screenSubtitle}>
        Layout "bottom": el header se desvanece al scrollear y el body (abajo) tiene la
        navegación encadenada a otras pantallas.
      </Text>
    </View>
  );
}

function HomeFooter() {
  const { navigate } = useAppNavigation();
  return pad(
    <View style={styles.gap}>
      <Text variant="heading" style={styles.screenTitle}>
        Explorar
      </Text>
      <Text variant="body" style={styles.screenSubtitle}>
        Navegación desde el body (encadenada, no desde un solo lugar):
      </Text>
      <Button label="Ir a Artículo (fullBottom)" onPress={() => navigate(routes.article)} />
      <Button label="Ir a Perfil (top)" onPress={() => navigate(routes.profile)} />
      <Button label="Ir a Ajustes (bottom)" onPress={() => navigate(routes.settings)} />
      <Button label="Ver Galería (onlyCenter)" onPress={() => navigate(routes.gallery)} />
      <Button label="Vista debug (stacked)" onPress={() => navigate(routes.stacked)} />
      <MockList n={12} label="Novedad" />
    </View>
  );
}

function ArticleFooter() {
  const { navigate } = useAppNavigation();
  return pad(
    <View style={styles.gap}>
      <Text variant="heading" style={styles.screenTitle}>
        Artículo
      </Text>
      <Text variant="body" style={styles.screenSubtitle}>
        Layout "fullBottom": solo el body ocupa la pantalla (scroll de página).
      </Text>
      <MockList n={24} label="Párrafo" />
      <Button label="Ir a Galería (onlyCenter)" onPress={() => navigate(routes.gallery)} />
    </View>
  );
}

function ProfileHeader() {
  return pad(
    <View style={styles.gap}>
      <View style={styles.avatar} />
      <Text variant="heading" style={styles.screenTitle}>
        Ana Torres
      </Text>
      <Text variant="body" style={styles.screenSubtitle}>
        Diseñadora de producto · Antonia Labs
      </Text>
      <Text variant="caption" style={styles.screenSubtitle}>
        Header sticky "top": crece con su contenido y queda fijo mientras el body scrollea.
      </Text>
    </View>
  );
}

function ProfileBody() {
  const { navigate } = useAppNavigation();
  return pad(
    <View style={styles.gap}>
      <MockList n={20} label="Publicación" />
      <Button label="Ver galería (onlyCenter)" onPress={() => navigate(routes.gallery)} />
    </View>,
    { paddingTop: 0 }
  );
}

function GalleryBody() {
  const { navigate } = useAppNavigation();
  return (
    <View style={styles.gap}>
      <View style={styles.gallery}>
        {Array.from({ length: 40 }).map((_, i) => (
          <View key={i} style={styles.tile} />
        ))}
      </View>
      <View style={styles.screenPad}>
        <Button label="Ir a Ajustes (bottom)" onPress={() => navigate(routes.settings)} />
      </View>
    </View>
  );
}

function SettingsHeader() {
  return pad(
    <View style={styles.gap}>
      <Text variant="heading" style={styles.screenTitle}>
        Ajustes
      </Text>
      <Text variant="body" style={styles.screenSubtitle}>
        Mismo estado "bottom" que Inicio, pero con contenido distinto.
      </Text>
    </View>
  );
}

function SettingsFooter() {
  return pad(<MockList n={18} label="Opción" />, { paddingTop: 0 });
}

function StackedHeader() {
  return pad(<Text variant="heading">Header (stacked)</Text>);
}
function StackedBody() {
  return pad(<Text variant="body">Body (stacked) — las tres secciones en tercios.</Text>);
}
function StackedFooter() {
  return pad(<Text variant="caption">Footer (stacked)</Text>);
}

const routes: Record<string, AppRoute> = {
  home: {
    name: "home",
    state: "bottom",
    slots: { header: <HomeHeader />, footer: <HomeFooter /> },
  },
  article: {
    name: "article",
    state: "fullBottom",
    slots: { footer: <ArticleFooter /> },
  },
  profile: {
    name: "profile",
    state: "top",
    slots: { header: <ProfileHeader />, body: <ProfileBody /> },
  },
  gallery: {
    name: "gallery",
    state: "onlyCenter",
    slots: { body: <GalleryBody /> },
  },
  settings: {
    name: "settings",
    state: "bottom",
    slots: { header: <SettingsHeader />, footer: <SettingsFooter /> },
  },
  stacked: {
    name: "stacked",
    state: "stacked",
    slots: { header: <StackedHeader />, body: <StackedBody />, footer: <StackedFooter /> },
  },
};

export function MainLayoutApp() {
  return <AppLayout initialRoute={routes.home} debug />;
}

const styles = StyleSheet.create({
  screenPad: { paddingHorizontal: 20, paddingVertical: 18, gap: 12 },
  gap: { gap: 12 },
  screenTitle: { fontSize: 24, fontWeight: "700", color: "#fff" },
  screenSubtitle: { color: "rgba(255,255,255,0.85)" },
  list: { gap: 10 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 14,
    padding: 12,
    gap: 12,
  },
  rowIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.4)" },
  rowBody: { flex: 1, gap: 4 },
  rowTitle: { color: "#fff" },
  rowCaption: { color: "rgba(255,255,255,0.7)" },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.5)",
    alignSelf: "center",
  },
  gallery: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    padding: 16,
  },
  tile: {
    width: 90,
    height: 90,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
});

export const mainLayoutApp: ComponentCategory = {
  id: "main-layout-app",
  title: "AppLayout (navegación)",
  icon: "git-network",
  components: [
    {
      id: "app-layout-demo",
      name: "AppLayout",
      description:
        "Layout genérico donde cada pantalla es un estado del layout (stacked / bottom / fullBottom / onlyCenter / top). Navegación con stack interno y botón de volver. Las rutas indican el estado + contenido por slot (header/body/footer).",
      variants: [
        {
          id: "demo",
          label: "Demo de navegación (6 pantallas)",
          render: () => <MainLayoutApp />,
        },
      ],
    },
  ],
};
