import React from "react";
import { StyleSheet, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Text, ReverseHeaderCardLayout, Button } from "@william-callao/antonella-ui";

export default function ReverseHeaderCardFullScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen
        options={{
          title: "ReverseHeaderCardLayout",
          headerShown: false,
        }}
      />
      <ReverseHeaderCardLayout
        header={
          <View style={styles.headerInner}>
            <View style={styles.headerTop}>
              <Button
                variant="ghost"
                label="← Volver"
                onPress={() => router.back()}
                style={styles.backBtn}
              />
            </View>
            <Text variant="heading" style={styles.headerTitle}>
              Mi perfil
            </Text>
            <Text variant="body" style={styles.headerSubtitle}>
              Configuración de la cuenta
            </Text>
          </View>
        }
      >
        <View style={styles.bodyContent}>
          <Text variant="caption" color="#AEAEB2" style={styles.sectionLabel}>
            PREFERENCIAS
          </Text>
          {[
            "Notificaciones",
            "Privacidad",
            "Seguridad",
            "Idioma",
            "Accesibilidad",
            "Tema oscuro",
          ].map((label, i) => (
            <View key={i} style={styles.card}>
              <View style={styles.cardIcon} />
              <View style={styles.cardBody}>
                <Text variant="body" style={styles.cardLabel}>
                  {label}
                </Text>
                <Text variant="caption" color="#AEAEB2">
                  Descripción breve de la opción
                </Text>
              </View>
            </View>
          ))}

          <Text
            variant="caption"
            color="#AEAEB2"
            style={[styles.sectionLabel, { marginTop: 16 }]}
          >
            CUENTA
          </Text>
          {[
            "Editar perfil",
            "Cambiar contraseña",
            "Correo electrónico",
            "Teléfono",
            "Dirección",
            "Métodos de pago",
            "Historial de compras",
            "Mis pedidos",
            "Favoritos",
            "Centro de ayuda",
          ].map((label, i) => (
            <View key={`all-${i}`} style={styles.card}>
              <View style={styles.cardIcon} />
              <View style={styles.cardBody}>
                <Text variant="body" style={styles.cardLabel}>
                  {label}
                </Text>
                <Text variant="caption" color="#AEAEB2">
                  Detalles de la sección
                </Text>
              </View>
            </View>
          ))}

          <View style={{ height: 40 }} />
        </View>
      </ReverseHeaderCardLayout>
    </>
  );
}

const styles = StyleSheet.create({
  headerInner: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  backBtn: {
    alignSelf: "flex-start",
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1C1C1E",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#8E8E93",
  },
  bodyContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  sectionLabel: {
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#E5E5EA",
  },
  cardBody: {
    flex: 1,
    gap: 4,
  },
  cardLabel: {
    fontWeight: "600",
  },
});
