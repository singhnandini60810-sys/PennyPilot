import type {
  PennyPilotSettings,
  SupportedCurrency,
} from "../types/settings";

export const SETTINGS_STORAGE_KEY =
  "pennypilot-app-settings";

export const SETTINGS_UPDATED_EVENT =
  "pennypilot-settings-updated";

export const DEFAULT_SETTINGS: PennyPilotSettings = {
  profile: {
    displayName: "",
    email: "",
  },

  preferences: {
    currency: "INR",
    defaultCategory: "Food",
    theme: "light",
  },

  notifications: {
    weeklySummary: false,
    monthlySummary: false,
    budgetAlerts: true,
  },
};

export const CURRENCY_OPTIONS: Array<{
  value: SupportedCurrency;
  label: string;
}> = [
  {
    value: "INR",
    label: "₹ INR — Indian Rupee",
  },
  {
    value: "USD",
    label: "$ USD — US Dollar",
  },
  {
    value: "EUR",
    label: "€ EUR — Euro",
  },
  {
    value: "GBP",
    label: "£ GBP — British Pound",
  },
];

export function loadAppSettings(): PennyPilotSettings {
  try {
    const storedSettings = localStorage.getItem(
      SETTINGS_STORAGE_KEY,
    );

    if (!storedSettings) {
      return DEFAULT_SETTINGS;
    }

    const parsedSettings = JSON.parse(
      storedSettings,
    ) as Partial<PennyPilotSettings>;

    return {
      profile: {
        ...DEFAULT_SETTINGS.profile,
        ...parsedSettings.profile,
      },

      preferences: {
        ...DEFAULT_SETTINGS.preferences,
        ...parsedSettings.preferences,
      },

      notifications: {
        ...DEFAULT_SETTINGS.notifications,
        ...parsedSettings.notifications,
      },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveAppSettings(
  settings: PennyPilotSettings,
): void {
  localStorage.setItem(
    SETTINGS_STORAGE_KEY,
    JSON.stringify(settings),
  );

  window.dispatchEvent(
    new CustomEvent(SETTINGS_UPDATED_EVENT, {
      detail: settings,
    }),
  );

  applyAppTheme(settings.preferences.theme);
}

export function resetAppSettings(): PennyPilotSettings {
  localStorage.removeItem(SETTINGS_STORAGE_KEY);

  const defaultSettings: PennyPilotSettings = {
    profile: {
      ...DEFAULT_SETTINGS.profile,
    },

    preferences: {
      ...DEFAULT_SETTINGS.preferences,
    },

    notifications: {
      ...DEFAULT_SETTINGS.notifications,
    },
  };

  window.dispatchEvent(
    new CustomEvent(SETTINGS_UPDATED_EVENT, {
      detail: defaultSettings,
    }),
  );

  applyAppTheme(defaultSettings.preferences.theme);

  return defaultSettings;
}

export function applyAppTheme(
  theme: PennyPilotSettings["preferences"]["theme"],
): void {
  const root = document.documentElement;

  root.dataset.theme = theme;

  if (theme === "system") {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    root.dataset.resolvedTheme = prefersDark
      ? "dark"
      : "light";

    return;
  }

  root.dataset.resolvedTheme = theme;
}