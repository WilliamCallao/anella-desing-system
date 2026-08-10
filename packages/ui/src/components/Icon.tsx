import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

type LibraryIconName = ComponentProps<typeof Ionicons>["name"];

export type IconName =
  | "home"
  | "home-filled"
  | "mail"
  | "mail-filled"
  | "calendar"
  | "calendar-filled"
  | "bar-chart"
  | "bar-chart-filled"
  | "settings"
  | "settings-filled"
  | "user"
  | "user-filled"
  | "search"
  | "clipboard"
  | "clipboard-filled"
  | "checklist"
  | "checklist-filled"
  | "menu"
  | "close"
  | "chevron-down"
  | "chevron-forward"
  | "chevron-back"
  | "arrow-back"
  | "arrow-forward"
  | "arrow-down"
  | "arrow-up"
  | "arrow-up-filled"
  | "add"
  | "checkmark"
  | "pencil"
  | "trash"
  | "chevron-up"
  | "alert-circle"
  | "checkmark-circle"
  | "information-circle"
  | "notifications"
  | "notifications-filled"
  | "more-horizontal"
  | "more-vertical"
  | "log-in"
  | "log-out"
  | "git-network"
  | "construct"
  | "chatbubble"
  | "camera"
   | "time"
  | "analytics"
  | "barn"
  | "barn-filled"
  | "farm"
  | "farm-filled"
  | "people"
  | "people-filled"
   | "document-text"
   | "document-text-filled"
   | "backspace";

const iconMap: Record<IconName, LibraryIconName> = {
  home: "home-outline",
  "home-filled": "home",
  mail: "mail-outline",
  "mail-filled": "mail",
  calendar: "calendar-outline",
  "calendar-filled": "calendar",
  "bar-chart": "bar-chart-outline",
  "bar-chart-filled": "bar-chart",
  settings: "settings-outline",
  "settings-filled": "settings",
  user: "person-outline",
  "user-filled": "person",
  search: "search",
  clipboard: "clipboard",
  "clipboard-filled": "clipboard",
  checklist: "list-outline",
  "checklist-filled": "list",
  menu: "menu",
  close: "close",
  "chevron-down": "chevron-down",
  "chevron-forward": "chevron-forward",
  "chevron-back": "chevron-back",
  "arrow-back": "arrow-back",
  "arrow-forward": "arrow-forward",
  "arrow-down": "arrow-down",
  "arrow-up": "arrow-up",
  "arrow-up-filled": "arrow-up",
  add: "add",
  checkmark: "checkmark",
  pencil: "create-outline",
  trash: "trash-outline",
  "chevron-up": "chevron-up",
  "alert-circle": "alert-circle-outline",
  "checkmark-circle": "checkmark-circle-outline",
  "information-circle": "information-circle-outline",
  notifications: "notifications-outline",
  "notifications-filled": "notifications",
  "more-horizontal": "ellipsis-horizontal",
  "more-vertical": "ellipsis-vertical",
  "log-in": "log-in-outline",
  "log-out": "log-out-outline",
  "git-network": "git-network-outline",
  construct: "construct-outline",
  chatbubble: "chatbubble-outline",
  camera: "camera-outline",
  time: "time-outline",
   analytics: "analytics-outline",
  barn: "cube-outline",
  "barn-filled": "cube",
  farm: "leaf-outline",
  "farm-filled": "leaf",
  people: "people-outline",
  "people-filled": "people",
   "document-text": "document-text-outline",
  "document-text-filled": "document-text",
  backspace: "backspace-outline",
};

export type IconProps = Omit<ComponentProps<typeof Ionicons>, "name"> & {
  name: IconName;
};

export function Icon({ name, size = 20, color, style, testID, ...rest }: IconProps) {
  return <Ionicons name={iconMap[name]} size={size} color={color} style={style} testID={testID} {...rest} />;
}
