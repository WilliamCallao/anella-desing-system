import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { DashboardShellTokens } from "@antonella/theme";
import { Icon } from "../Icon";
import type { SidebarItem, SidebarSection } from "./types";

type SidebarContentProps = {
  sections: SidebarSection[];
  selectedItemId?: string;
  tokens: DashboardShellTokens;
  compact: boolean;
  onSelect: (item: SidebarItem) => void;
};

export function SidebarContent({ sections, selectedItemId, tokens, compact, onSelect }: SidebarContentProps) {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {sections.map((section) => (
        <View key={section.id} style={styles.section}>
          {!compact && section.title ? (
            <Text style={[styles.sectionTitle, { color: tokens.sidebarSectionTitle }]} numberOfLines={1}>
              {section.title}
            </Text>
          ) : null}
          {section.items.map((item) => (
            <SidebarItemRow
              key={item.id}
              item={item}
              selected={item.active ?? item.id === selectedItemId}
              compact={compact}
              tokens={tokens}
              onPress={() => onSelect(item)}
            />
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

export type SidebarProps = {
  sections: SidebarSection[];
  header?: React.ReactNode;
  footer?: React.ReactNode;
  selectedItemId?: string;
  tokens: DashboardShellTokens;
  compact: boolean;
  onSelect: (item: SidebarItem) => void;
};

export function Sidebar({ sections, header, footer, selectedItemId, tokens, compact, onSelect }: SidebarProps) {
  return (
    <View
      style={[
        styles.sidebar,
        compact && styles.sidebarCompact,
        { width: compact ? tokens.sidebarCompactWidth : tokens.sidebarWidth, backgroundColor: tokens.background },
      ]}
    >
      {header ? <View style={styles.header}>{header}</View> : null}
      <SidebarContent sections={sections} selectedItemId={selectedItemId} tokens={tokens} compact={compact} onSelect={onSelect} />
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  );
}

type SidebarItemRowProps = {
  item: SidebarItem;
  selected: boolean;
  compact: boolean;
  tokens: DashboardShellTokens;
  onPress: () => void;
};

function SidebarItemRow({ item, selected, compact, tokens, onPress }: SidebarItemRowProps) {
  const color = selected ? tokens.sidebarActiveText : tokens.sidebarText;
  const badgeBackground = selected ? tokens.sidebarActiveText : "rgba(255, 255, 255, 0.1)";
  const badgeTextColor = selected ? tokens.sidebarActiveBackground : tokens.sidebarText;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled: item.disabled }}
      accessibilityLabel={item.accessibilityLabel ?? item.label}
      testID={item.testID}
      disabled={item.disabled}
      onPress={item.disabled ? undefined : onPress}
      style={(state) => {
        const pressed = state.pressed;
        const hovered = (state as { hovered?: boolean }).hovered;
        return [
          styles.item,
          compact ? styles.itemCompact : styles.itemFull,
          { borderRadius: tokens.itemRadius },
          selected && { backgroundColor: tokens.sidebarActiveBackground },
          !selected && (pressed || hovered) && { backgroundColor: tokens.sidebarHover },
          item.disabled && styles.disabled,
        ];
      }}
    >
      {item.icon ? (
        <View style={styles.icon}>
          <Icon name={item.icon} size={20} color={color} />
        </View>
      ) : null}
      {!compact ? (
        <Text style={[styles.itemLabel, { color }]} numberOfLines={1}>
          {item.label}
        </Text>
      ) : null}
      {!compact && item.badge !== undefined ? (
        <View style={[styles.badge, { backgroundColor: badgeBackground }]}>
          <Text style={[styles.badgeText, { color: badgeTextColor }]}>{item.badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    alignSelf: "stretch",
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  sidebarCompact: {
    paddingLeft: 16,
    paddingRight: 0,
  },
  header: {
    marginBottom: 32,
  },
  footer: {
    marginTop: "auto",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.3,
    textTransform: "uppercase",
    paddingHorizontal: 12,
    marginBottom: 6,
  },
  item: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 6,
  },
  itemFull: {
    paddingHorizontal: 12,
  },
  itemCompact: {
    width: 44,
    height: 44,
    alignSelf: "center",
    justifyContent: "center",
  },
  disabled: {
    opacity: 0.4,
  },
  icon: {
    width: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  itemLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  badge: {
    minWidth: 20,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
});
