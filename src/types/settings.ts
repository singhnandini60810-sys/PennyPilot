export type SupportedCurrency =
  | "INR"
  | "USD"
  | "EUR"
  | "GBP";

export type AppTheme =
  | "light"
  | "dark"
  | "system";

export interface UserProfileSettings {
  displayName: string;
  email: string;
}

export interface NotificationSettings {
  weeklySummary: boolean;
  monthlySummary: boolean;
  budgetAlerts: boolean;
}

export interface AppPreferences {
  currency: SupportedCurrency;
  defaultCategory: string;
  theme: AppTheme;
}

export interface PennyPilotSettings {
  profile: UserProfileSettings;
  preferences: AppPreferences;
  notifications: NotificationSettings;
}