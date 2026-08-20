import {
  Activity,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BarChart,
  Bell,
  Camera,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleAlert,
  CircleCheck,
  Clipboard,
  ClipboardList,
  Clock,
  Delete,
  Ellipsis,
  EllipsisVertical,
  FileText,
  GitBranch,
  Home,
  Info,
  Leaf,
  LogIn,
  LogOut,
  Mail,
  Menu,
  MessageCircle,
  Pencil,
  Plus,
  Search,
  Settings,
  Trash2,
  User,
  Users,
  Warehouse,
  Wrench,
  X,
  Calendar,
} from "lucide-react-native";
import type { ComponentType } from "react";

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

export const iconMap: Record<IconName, ComponentType<{ size?: number; color?: string; strokeWidth?: number }>> = {
  home: Home,
  "home-filled": Home,
  mail: Mail,
  "mail-filled": Mail,
  calendar: Calendar,
  "calendar-filled": Calendar,
  "bar-chart": BarChart,
  "bar-chart-filled": BarChart,
  settings: Settings,
  "settings-filled": Settings,
  user: User,
  "user-filled": User,
  search: Search,
  clipboard: Clipboard,
  "clipboard-filled": Clipboard,
  checklist: ClipboardList,
  "checklist-filled": ClipboardList,
  menu: Menu,
  close: X,
  "chevron-down": ChevronDown,
  "chevron-forward": ChevronRight,
  "chevron-back": ChevronLeft,
  "arrow-back": ArrowLeft,
  "arrow-forward": ArrowRight,
  "arrow-down": ArrowDown,
  "arrow-up": ArrowUp,
  "arrow-up-filled": ArrowUp,
  add: Plus,
  checkmark: Check,
  pencil: Pencil,
  trash: Trash2,
  "chevron-up": ChevronUp,
  "alert-circle": CircleAlert,
  "checkmark-circle": CircleCheck,
  "information-circle": Info,
  notifications: Bell,
  "notifications-filled": Bell,
  "more-horizontal": Ellipsis,
  "more-vertical": EllipsisVertical,
  "log-in": LogIn,
  "log-out": LogOut,
  "git-network": GitBranch,
  construct: Wrench,
  chatbubble: MessageCircle,
  camera: Camera,
  time: Clock,
  analytics: Activity,
  barn: Warehouse,
  "barn-filled": Warehouse,
  farm: Leaf,
  "farm-filled": Leaf,
  people: Users,
  "people-filled": Users,
  "document-text": FileText,
  "document-text-filled": FileText,
  backspace: Delete,
};

export type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
  style?: object;
  testID?: string;
};

const STROKE_WIDTH = 2.25;

export function Icon({ name, size = 20, color, style, testID }: IconProps) {
  const LucideIcon = iconMap[name];
  return <LucideIcon size={size} color={color} strokeWidth={STROKE_WIDTH} />;
}
