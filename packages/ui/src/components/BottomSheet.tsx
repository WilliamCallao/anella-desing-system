import React from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideInRight,
  SlideOutDown,
  SlideOutRight,
} from "react-native-reanimated";
import { background, card, space } from "@antonella/theme";

export type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  dismissible?: boolean;
  children: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
};

export function BottomSheet({
  visible,
  onClose,
  dismissible = true,
  children,
  contentStyle,
}: BottomSheetProps) {
  const { width, height } = useWindowDimensions();
  const isMobile = width < 600;

  if (!visible) return null;

  const handleBackdropPress = () => {
    if (dismissible) {
      onClose();
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={handleBackdropPress}
      animationType="none"
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlayContainer}
      >
        {/* Backdrop Overlay */}
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={styles.backdrop}
        >
          <Pressable
            style={styles.backdropPressable}
            onPress={handleBackdropPress}
            disabled={!dismissible}
          />
        </Animated.View>

        {/* Animated Panel */}
        {isMobile ? (
          <Animated.View
            entering={SlideInDown.duration(280)}
            exiting={SlideOutDown.duration(220)}
            style={[styles.bottomSheetPanel, { maxHeight: height * 0.85 }, contentStyle]}
          >
            <View style={styles.handleBar} />
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              {children}
            </ScrollView>
          </Animated.View>
        ) : (
          <Animated.View
            entering={SlideInRight.duration(260)}
            exiting={SlideOutRight.duration(200)}
            style={[styles.sideDialogPanel, contentStyle]}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              {children}
            </ScrollView>
          </Animated.View>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
  },
  backdropPressable: {
    flex: 1,
  },
  bottomSheetPanel: {
    backgroundColor: card.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: space.space4,
    paddingBottom: space.space4,
    paddingTop: space.space2,
  },
  sideDialogPanel: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 420,
    maxWidth: "100%",
    backgroundColor: card.background,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    padding: space.space4,
  },
  handleBar: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: background.default,
    alignSelf: "center",
    marginVertical: space.space2,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: space.space3,
  },
});
