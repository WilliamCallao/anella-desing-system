import { useState } from "react";
import { ScrollView, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { resolveShellTokens, texts } from "@william-callao/antonella-theme";
import type { DashboardShellTokens } from "@william-callao/antonella-theme";
import { Icon } from "../Icon";
import { Sidebar } from "./Sidebar";
import { MobileHeader } from "./MobileHeader";
import { MobileDrawer } from "./MobileDrawer";
import type { DashboardShellProps, SidebarItem } from "./types";

export default function DashboardShell({
  sections,
  sidebarHeader,
  sidebarFooter,
  topBar,
  title,
  brand,
  logoutLabel,
  onLogout,
  type = "responsive",
  themeMode = "light",
  tokens,
  selectedItemId,
  children,
}: DashboardShellProps) {
  const { width } = useWindowDimensions();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const t = { ...resolveShellTokens(themeMode), ...tokens };
  const isMobile = width < 600;
  const compact = !isMobile && (type === "icon" || (type === "responsive" && width < 1024));
  const safeEdges: ("top" | "bottom")[] = isMobile ? ["top"] : ["top", "bottom"];
  const outerMargin = width >= 1440 ? t.outerMargin + 8 : t.outerMargin;
  const hasLogout = logoutLabel !== undefined || onLogout !== undefined;
  const sidebarHeaderNode = sidebarHeader ?? <SidebarBrand name={title} brand={brand} compact={compact} tokens={t} />;
  const sidebarFooterNode = sidebarFooter ?? (
    hasLogout ? <SidebarLogout compact={compact} label={logoutLabel} onPress={onLogout} tokens={t} /> : undefined
  );
  const drawerHeaderNode = sidebarHeader ?? <SidebarBrand name={title} brand={brand} compact={false} tokens={t} />;
  const drawerFooterNode = sidebarFooter ?? (
    hasLogout ? <SidebarLogout compact={false} label={logoutLabel} onPress={onLogout} tokens={t} /> : undefined
  );

  const onSelect = (item: SidebarItem) => {
    item.onPress?.();
  };

  const openDrawer = () => {
    setShowModal(true);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setShowModal(false);
  };

  return (
    <SafeAreaView edges={safeEdges} style={[styles.root, { backgroundColor: t.background }]}>
      {isMobile ? (
        <>
          <MobileHeader
            title={title}
            onMenuPress={openDrawer}
            backgroundColor={t.sidebarBackground}
            textColor={t.sidebarText}
            titleColor={t.sidebarTitle}
          />
          <ScrollView
            style={[styles.mobileContent, { backgroundColor: t.contentBackground }]}
            contentContainerStyle={styles.mobileContentInner}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
          <MobileDrawer
            visible={drawerOpen}
            onClose={closeDrawer}
            sections={sections}
            header={drawerHeaderNode}
            footer={drawerFooterNode}
            selectedItemId={selectedItemId}
            tokens={t}
            onSelect={onSelect}
          />
        </>
      ) : (
        <View style={[styles.row, { backgroundColor: t.sidebarBackground }]}>
          <Sidebar
            sections={sections}
            header={sidebarHeaderNode}
            footer={sidebarFooterNode}
            selectedItemId={selectedItemId}
            tokens={t}
            compact={compact}
            onSelect={onSelect}
          />
          <View
            style={[
              styles.card,
              { margin: outerMargin, borderRadius: t.borderRadius, backgroundColor: t.contentBackground },
            ]}
          >
            {topBar}
            <View style={[styles.cardContent]}>{children}</View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  row: {
    flex: 1,
    flexDirection: "row",
  },
  card: {
    flex: 1,
    overflow: "hidden",
  },
  cardContent: {
    flex: 1,
    overflow: "hidden",
  },
  mobileContent: {
    flex: 1,
  },
  mobileContentInner: {
    flexGrow: 1,
  },
});

type SidebarBrandProps = {
  name?: string;
  brand?: string;
  compact: boolean;
  tokens: DashboardShellTokens;
};

function SidebarBrand({ name, brand, compact, tokens }: SidebarBrandProps) {
  if (compact && !brand) {
    return null;
  }
  return (
    <View style={compact ? brandStyles.brandCompact : brandStyles.brand}>
      {brand ? (
        <View
          style={[
            brandStyles.brandMark,
            { backgroundColor: tokens.sidebarActiveBackground, borderRadius: tokens.itemRadius },
          ]}
        >
          <Text style={[brandStyles.brandMarkText, { color: tokens.sidebarActiveText }]}>{brand}</Text>
        </View>
      ) : null}
      {!compact && name ? (
        <Text style={[brandStyles.brandName, { color: tokens.sidebarTitle }]} numberOfLines={1}>
          {name}
        </Text>
      ) : null}
    </View>
  );
}

type SidebarLogoutProps = {
  compact: boolean;
  tokens: DashboardShellTokens;
  label?: string;
  onPress?: () => void;
};

function SidebarLogout({ compact, tokens, label, onPress }: SidebarLogoutProps) {
  const content = (
    <>
      <Icon name="log-out" size={20} color={tokens.sidebarText} />
      {label && !compact ? (
        <Text style={[brandStyles.logoutLabel, { color: tokens.sidebarText }]} numberOfLines={1}>
          {label}
        </Text>
      ) : null}
    </>
  );
  const containerStyle = [
    brandStyles.logout,
    compact ? brandStyles.logoutCompact : brandStyles.logoutFull,
    { borderRadius: tokens.itemRadius },
  ];
  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label ?? "Log out"}
        onPress={onPress}
        style={containerStyle}
      >
        {content}
      </Pressable>
    );
  }
  return <View style={containerStyle}>{content}</View>;
}

const brandStyles = StyleSheet.create({
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  brandCompact: {
    alignItems: "center",
    justifyContent: "center",
  },
  brandMark: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  brandMarkText: {
    fontSize: texts.heading.fontSize,
    fontWeight: texts.heading.fontWeight,
  },
  brandName: {
    flex: 1,
    fontSize: texts.bodyBold.fontSize,
    fontWeight: texts.bodyBold.fontWeight,
  },
  logout: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 44,
  },
  logoutCompact: {
    width: 44,
    height: 44,
    alignSelf: "center",
    justifyContent: "center",
  },
  logoutFull: {
    paddingHorizontal: 12,
  },
  logoutLabel: {
    fontSize: texts.bodyMedium.fontSize,
    fontWeight: texts.bodyMedium.fontWeight,
  },
});
