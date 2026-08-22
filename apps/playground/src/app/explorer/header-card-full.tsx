import React from "react";
import { StyleSheet, View, TextInput } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Text, HeaderCardLayout, Button } from "@antonella/ui";

export default function HeaderCardFullScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen
        options={{
          title: "HeaderCardLayout",
          headerShown: false,
        }}
      />
      <HeaderCardLayout
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
              Mis contactos
            </Text>
            <View style={styles.searchBar}>
              <TextInput
                placeholder="Buscar contacto..."
                placeholderTextColor="#8E8E93"
                style={styles.searchInput}
              />
            </View>
            <View style={styles.chips}>
              {["Todos", "Familia", "Amigos", "Trabajo"].map((chip) => (
                <View key={chip} style={styles.chip}>
                  <Text variant="caption" style={styles.chipText}>
                    {chip}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        }
      >
        <View style={styles.bodyContent}>
          <Text variant="caption" color="#8E8E93" style={styles.sectionLabel}>
            RECIENTES
          </Text>
          {Array.from({ length: 8 }).map((_, i) => (
            <View key={i} style={styles.contactCard}>
              <View style={styles.avatar} />
              <View style={styles.contactInfo}>
                <View style={styles.nameLine} />
                <View style={[styles.nameLine, styles.phoneLine]} />
              </View>
            </View>
          ))}

          <Text
            variant="caption"
            color="#8E8E93"
            style={[styles.sectionLabel, { marginTop: 16 }]}
          >
            TODOS
          </Text>
          {Array.from({ length: 15 }).map((_, i) => (
            <View key={`all-${i}`} style={styles.contactCard}>
              <View style={styles.avatar} />
              <View style={styles.contactInfo}>
                <View style={styles.nameLine} />
                <View style={[styles.nameLine, styles.phoneLine]} />
              </View>
            </View>
          ))}
        </View>
      </HeaderCardLayout>
    </>
  );
}

const styles = StyleSheet.create({
  headerInner: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 10,
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
  searchBar: {
    backgroundColor: "#F2F2F7",
    borderRadius: 12,
    height: 44,
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  searchInput: {
    fontSize: 16,
    color: "#1C1C1E",
  },
  chips: {
    flexDirection: "row",
    gap: 8,
  },
  chip: {
    backgroundColor: "#F2F2F7",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  chipText: {
    color: "#1C1C1E",
    fontWeight: "500",
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
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E5E5EA",
  },
  contactInfo: {
    flex: 1,
    gap: 6,
  },
  nameLine: {
    height: 12,
    width: "50%",
    borderRadius: 6,
    backgroundColor: "#E5E5EA",
  },
  phoneLine: {
    height: 10,
    width: "35%",
    backgroundColor: "#F2F2F7",
  },
});
