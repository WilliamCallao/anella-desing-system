import { useEffect, useRef } from "react";
import { Animated, Modal, Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import type { DashboardShellTokens } from "@william-callao/antonella-theme";
import { SidebarContent } from "./Sidebar";
import type { SidebarItem, SidebarSection } from "./types";

export type MobileDrawerProps = {
  visible: boolean;
  onClose: () => void;
  sections: SidebarSection[];
  header?: React.ReactNode;
  footer?: React.ReactNode;
  selectedItemId?: string;
  tokens: DashboardShellTokens;
  onSelect: (item: SidebarItem) => void;
};

const OPEN_DURATION = 250;
const CLOSE_DURATION = 200;

export function MobileDrawer({ visible, onClose, sections, header, footer, selectedItemId, tokens, onSelect }: MobileDrawerProps) {
  const { width: windowWidth } = useWindowDimensions();
  const width = Math.min(300, windowWidth * 0.8);
  const progress = useRef(new Animated.Value(0)).current;
  const animating = useRef(false);
  const animation = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (visible) {
      progress.setValue(0);
      animating.current = true;
      animation.current?.stop();
      const open = Animated.timing(progress, {
        toValue: 1,
        duration: OPEN_DURATION,
        useNativeDriver: true,
      });
      animation.current = open;
      open.start(({ finished }) => {
        animating.current = false;
        animation.current = null;
      });
    }
    return () => {
      animation.current?.stop();
      animation.current = null;
      animating.current = false;
    };
  }, [visible, progress]);

  const requestClose = () => {
    if (animating.current) {
      return;
    }
    animating.current = true;
    const close = Animated.timing(progress, {
      toValue: 0,
      duration: CLOSE_DURATION,
      useNativeDriver: true,
    });
    animation.current = close;
    close.start(({ finished }) => {
      animating.current = false;
      animation.current = null;
      if (finished) {
        onClose();
      }
    });
  };

  const handleSelect = (item: SidebarItem) => {
    onSelect(item);
    requestClose();
  };

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, 0],
  });

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={requestClose}>
      <View style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: progress }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cerrar menú"
            style={StyleSheet.absoluteFill}
            onPress={requestClose}
          />
        </Animated.View>
        <Animated.View
          accessibilityViewIsModal
          style={[
            styles.panel,
            { width, backgroundColor: tokens.sidebarBackground, transform: [{ translateX }] },
          ]}
        >
          {header ? <View style={styles.header}>{header}</View> : null}
          <SidebarContent sections={sections} selectedItemId={selectedItemId} tokens={tokens} compact={false} onSelect={handleSelect} />
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  panel: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 32,
  },
  footer: {
    marginTop: "auto",
  },
});
