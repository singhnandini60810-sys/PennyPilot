import type { LucideIcon } from "lucide-react";

import {
  ChartNoAxesCombined,
  LayoutDashboard,
  PiggyBank,
  ReceiptText,
  Settings,
} from "lucide-react";

export interface NavigationItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

export const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Expenses",
    path: "/expenses",
    icon: ReceiptText,
  },
  {
    label: "Reports",
    path: "/reports",
    icon: ChartNoAxesCombined,
  },
  {
    label: "Savings",
    path: "/savings",
    icon: PiggyBank,
  },
  {
    label: "Settings",
    path: "/settings",
    icon: Settings,
  },
];