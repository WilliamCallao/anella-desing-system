import React, { useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import RNModal from "react-native-modal";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { background, card, radius, space } from "@antonella/theme";
import { useModalKeyboardHeight } from "./useModalKeyboard";

export type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  dismissible?: boolean;
  children: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  snapPoints?: Array<string | number>;
};

export function BottomSheet({
  visible,
  onClose,
  dismissible = true,
  children,
  contentStyle,
  snapPoints,
}: BottomSheetProps) {
  const { height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const keyboardHeight = useModalKeyboardHeight();

  const maxHeightRatio = useMemo(() => {
    let ratio = 0.9;
    for (const value of snapPoints ?? []) {
      if (typeof value === "string" && value.endsWith("%")) {
        const n = Number(value.slice(0, -1));
        if (!Number.isNaN(n) && n / 100 > ratio) ratio = n / 100;
      }
    }
    return ratio;
  }, [snapPoints]);

  const containerAnimatedStyle = useAnimatedStyle(
    () => ({
      paddingBottom: Math.max(0, -keyboardHeight.value),
    }),
    [],
  );

  const panelAnimatedStyle = useAnimatedStyle(
    () => {
      const kb = Math.max(0, -keyboardHeight.value);
      const available = screenHeight - kb - insets.top - insets.bottom;
      return {
        maxHeight: Math.max(space.space16, available * maxHeightRatio),
      };
    },
    [screenHeight, insets.top, insets.bottom, maxHeightRatio],
  );

  return (
    <RNModal
      isVisible={visible}
      onBackdropPress={dismissible ? onClose : undefined}
      onBackButtonPress={dismissible ? onClose : undefined}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      animationInTiming={260}
      animationOutTiming={240}
      backdropColor="#0F172A"
      backdropOpacity={0.45}
      backdropTransitionInTiming={240}
      backdropTransitionOutTiming={200}
      statusBarTranslucent
      style={styles.modal}
    >
      <Animated.View style={[styles.container, containerAnimatedStyle]}>
        <Animated.View style={[styles.panel, panelAnimatedStyle]}>
          <View style={styles.handleBar} />
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[styles.content, contentStyle]}
          >
            {children}
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  modal: {
    margin: 0,
  },
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  panel: {
    width: "100%",
    backgroundColor: card.background,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingTop: space.space2,
    paddingHorizontal: space.space4,
  },
  handleBar: {
    alignSelf: "center",
    width: 36,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: background.default,
    marginBottom: space.space2,
  },
  content: {
    paddingTop: space.space2,
    paddingBottom: Math.max(space.space3, 24),
  },
});
