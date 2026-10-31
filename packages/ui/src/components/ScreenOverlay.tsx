import React from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { background, space } from "@william-callao/antonella-theme";
import { SectionTitle } from "./SectionTitle";
import { TopAction } from "./TopAction";
import { TopBar } from "./TopBar";

export type ScreenOverlayProps = {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  accessibilityLabel?: string;
};

/**
 * Pantalla completa que se monta por delante de la pantalla actual sin
 * navegación de router. Sirve para flujos secundarios que deben preservar el
 * estado de la pantalla de abajo (formularios, pickers, etc.).
 */
export function ScreenOverlay({
  visible,
  title,
  onClose,
  children,
  accessibilityLabel = "Volver",
}: ScreenOverlayProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={[styles.screen, { paddingTop: insets.top + space.space4 }]}>
        <View style={styles.header}>
          <View style={styles.topBar}>
            <TopBar>
              <TopAction
                icon="chevron-back"
                onPress={onClose}
                accessibilityLabel={accessibilityLabel}
              />
            </TopBar>
          </View>
          <SectionTitle title={title} style={styles.title} />
        </View>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: background.default,
  },
  header: {
    paddingBottom: space.space4,
    gap: space.space3,
  },
  title: {
    marginTop: space.space1,
  },
  topBar: {
    paddingHorizontal: space.space3,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingTop: space.space3,
    paddingHorizontal: space.space3,
    paddingBottom: space.space12,
    gap: space.space3,
  },
});
