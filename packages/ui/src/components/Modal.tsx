import React from "react";
import {
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import RNModal from "react-native-modal";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { card, radius, space } from "@antonella/theme";
import { useModalKeyboardHeight } from "./useModalKeyboard";

export type ModalProps = {
  visible: boolean;
  onClose: () => void;
  dismissible?: boolean;
  children: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
};

export function Modal({
  visible,
  onClose,
  dismissible = true,
  children,
  contentStyle,
}: ModalProps) {
  const { height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const keyboardHeight = useModalKeyboardHeight();

  const containerAnimatedStyle = useAnimatedStyle(
    () => ({
      paddingBottom: Math.max(0, -keyboardHeight.value),
    }),
    [],
  );

  const panelAnimatedStyle = useAnimatedStyle(
    () => {
      const kb = Math.max(0, -keyboardHeight.value);
      return {
        maxHeight: Math.max(
          space.space16,
          screenHeight - kb - insets.top - insets.bottom - space.space8,
        ),
      };
    },
    [screenHeight, insets.top, insets.bottom],
  );

  return (
    <RNModal
      isVisible={visible}
      onBackdropPress={dismissible ? onClose : undefined}
      onBackButtonPress={dismissible ? onClose : undefined}
      animationIn="fadeIn"
      animationOut="fadeOut"
      animationInTiming={220}
      animationOutTiming={180}
      backdropColor="#0F172A"
      backdropOpacity={0.4}
      backdropTransitionInTiming={200}
      backdropTransitionOutTiming={150}
      statusBarTranslucent
      style={styles.modal}
    >
      <Animated.View style={[styles.centered, containerAnimatedStyle]}>
        <Animated.View style={[styles.panel, panelAnimatedStyle, contentStyle]}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
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
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  panel: {
    width: 420,
    maxWidth: "100%",
    backgroundColor: card.background,
    borderRadius: radius.lg,
    padding: space.space4,
  },
  scrollContent: {
    paddingBottom: space.space3,
  },
});
