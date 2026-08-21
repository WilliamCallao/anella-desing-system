import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { radius } from "@antonella/theme";

export type HeaderCardLayoutProps = {
  headerBackgroundColor?: string;
  bodyBackgroundColor?: string;
  header: React.ReactNode;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

const CARD_RADIUS = 24;
const BODY_OVERLAP = 12;

export function HeaderCardLayout({
  headerBackgroundColor = "#FFFFFF",
  bodyBackgroundColor = "#F5F7FA",
  header,
  children,
  style,
}: HeaderCardLayoutProps) {
  const insets = useSafeAreaInsets();
  const [headerHeight, setHeaderHeight] = useState(0);

  const onHeaderLayout = (e: LayoutChangeEvent) => {
    setHeaderHeight(e.nativeEvent.layout.height);
  };

  return (
    <View style={[styles.root, { backgroundColor: bodyBackgroundColor }, style]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + headerHeight - BODY_OVERLAP },
        ]}
        bounces={false}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>

      <View
        onLayout={onHeaderLayout}
        style={[
          styles.header,
          {
            backgroundColor: headerBackgroundColor,
            paddingTop: insets.top,
            borderBottomLeftRadius: CARD_RADIUS,
            borderBottomRightRadius: CARD_RADIUS,
          },
        ]}
      >
        {header}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
});
