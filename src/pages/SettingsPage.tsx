import {
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  Bell,
  Check,
  Cloud,
  Code2,
  Database,
  Info,
  KeyRound,
  Laptop,
  Moon,
  Palette,
  RefreshCw,
  Save,
  ShieldCheck,
  Sun,
  UserRound,
  WalletCards,
} from "lucide-react";

import {
  CURRENCY_OPTIONS,
  loadAppSettings,
  resetAppSettings,
  saveAppSettings,
} from "../utils/appSettings";

import {
  EXPENSE_CATEGORIES,
} from "../types/expense";

import type {
  AppTheme,
  PennyPilotSettings,
  SupportedCurrency,
} from "../types/settings";

import "../components/settings/settings.css";

type SettingsSection =
  | "profile"
  | "preferences"
  | "notifications"
  | "security"
  | "about";

const settingsNavigation: Array<{
  id: SettingsSection;
  label: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    id: "profile",
    label: "Profile",
    description: "Personal information",
    icon: <UserRound size={19} />,
  },
  {
    id: "preferences",
    label: "Preferences",
    description: "Currency, category and theme",
    icon: <Palette size={19} />,
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "Reminders and alerts",
    icon: <Bell size={19} />,
  },
  {
    id: "security",
    label: "Security",
    description: "Account security options",
    icon: <ShieldCheck size={19} />,
  },
  {
    id: "about",
    label: "About",
    description: "Technology and application details",
    icon: <Info size={19} />,
  },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("profile");

  const [settings, setSettings] =
    useState<PennyPilotSettings>(
      loadAppSettings,
    );

  const [savedSettings, setSavedSettings] =
    useState<PennyPilotSettings>(
      loadAppSettings,
    );

  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const hasChanges =
    JSON.stringify(settings) !==
    JSON.stringify(savedSettings);

  useEffect(() => {
    if (!message) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setMessage("");
    }, 3500);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [message]);

  function updateProfile(
    field:
      keyof PennyPilotSettings["profile"],
    value: string,
  ) {
    setSettings((currentSettings) => ({
      ...currentSettings,

      profile: {
        ...currentSettings.profile,
        [field]: value,
      },
    }));

    setMessage("");
  }

  function updatePreference<
    Key extends keyof PennyPilotSettings["preferences"],
  >(
    field: Key,
    value: PennyPilotSettings["preferences"][Key],
  ) {
    setSettings((currentSettings) => ({
      ...currentSettings,

      preferences: {
        ...currentSettings.preferences,
        [field]: value,
      },
    }));

    setMessage("");
  }

  function updateNotification(
    field:
      keyof PennyPilotSettings["notifications"],
    value: boolean,
  ) {
    setSettings((currentSettings) => ({
      ...currentSettings,

      notifications: {
        ...currentSettings.notifications,
        [field]: value,
      },
    }));

    setMessage("");
  }

  async function handleSave(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const displayName =
      settings.profile.displayName.trim();

    const email =
      settings.profile.email.trim().toLowerCase();

    if (!displayName) {
      setActiveSection("profile");
      setMessage(
        "Please enter your display name.",
      );
      return;
    }

    if (
      email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      setActiveSection("profile");
      setMessage(
        "Please enter a valid email address.",
      );
      return;
    }

    const normalizedSettings: PennyPilotSettings = {
      ...settings,

      profile: {
        displayName,
        email,
      },
    };

    setIsSaving(true);

    try {
      saveAppSettings(normalizedSettings);

      setSettings(normalizedSettings);
      setSavedSettings(normalizedSettings);

      setMessage(
        "Your settings were saved successfully.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function handleReset() {
    const restoredSettings =
      resetAppSettings();

    setSettings(restoredSettings);
    setSavedSettings(restoredSettings);
    setActiveSection("profile");

    setMessage(
      "Settings were restored to their defaults.",
    );
  }

  return (
    <section className="settings-page">
      <header className="settings-page__header">
        <div>
          <span className="settings-page__eyebrow">
            Account control
          </span>

          <h1>Settings &amp; Profile</h1>

          <p>
            Manage your PennyPilot profile,
            preferences, reminders and application
            information.
          </p>
        </div>

        <div className="settings-page__status">
          <Cloud size={17} />

          <div>
            <strong>Local preferences</strong>
            <span>
              Automatically saved in this browser
            </span>
          </div>
        </div>
      </header>

      {message && (
        <div
          className={
            message.includes("valid") ||
            message.includes("Please")
              ? "settings-message settings-message--error"
              : "settings-message settings-message--success"
          }
          role="status"
        >
          <Check size={18} />
          {message}
        </div>
      )}

      <form
        className="settings-layout"
        onSubmit={handleSave}
      >
        <aside className="settings-navigation">
          <div className="settings-navigation__profile">
            <div className="settings-navigation__avatar">
              {settings.profile.displayName
                .trim()
                .charAt(0)
                .toUpperCase() || "P"}
            </div>

            <div>
              <strong>
                {settings.profile.displayName ||
                  "PennyPilot User"}
              </strong>

              <span>
                {settings.profile.email ||
                  "Profile not completed"}
              </span>
            </div>
          </div>

          <nav aria-label="Settings navigation">
            {settingsNavigation.map((item) => (
              <button
                className={
                  activeSection === item.id
                    ? "settings-navigation__item settings-navigation__item--active"
                    : "settings-navigation__item"
                }
                type="button"
                key={item.id}
                onClick={() =>
                  setActiveSection(item.id)
                }
              >
                <span className="settings-navigation__icon">
                  {item.icon}
                </span>

                <span>
                  <strong>{item.label}</strong>
                  <small>{item.description}</small>
                </span>
              </button>
            ))}
          </nav>
        </aside>

        <div className="settings-content">
          {activeSection === "profile" && (
            <section className="settings-section">
              <div className="settings-section__header">
                <div className="settings-section__icon">
                  <UserRound size={22} />
                </div>

                <div>
                  <h2>Profile information</h2>

                  <p>
                    Set the name and email shown
                    throughout PennyPilot.
                  </p>
                </div>
              </div>

              <div className="settings-profile-card">
                <div className="settings-profile-card__avatar">
                  {settings.profile.displayName
                    .trim()
                    .charAt(0)
                    .toUpperCase() || "P"}
                </div>

                <div>
                  <strong>
                    {settings.profile.displayName ||
                      "PennyPilot User"}
                  </strong>

                  <span>
                    Personal finance account
                  </span>
                </div>
              </div>

              <div className="settings-form-grid">
                <label className="settings-field">
                  <span>Display name</span>

                  <input
                    type="text"
                    maxLength={80}
                    value={
                      settings.profile.displayName
                    }
                    placeholder="Enter your name"
                    onChange={(event) =>
                      updateProfile(
                        "displayName",
                        event.target.value,
                      )
                    }
                  />

                  <small>
                    This name will appear in your
                    dashboard header.
                  </small>
                </label>

                <label className="settings-field">
                  <span>Email address</span>

                  <input
                    type="email"
                    value={settings.profile.email}
                    placeholder="you@example.com"
                    onChange={(event) =>
                      updateProfile(
                        "email",
                        event.target.value,
                      )
                    }
                  />

                  <small>
                    Your Cognito sign-in email is not
                    changed by this field.
                  </small>
                </label>
              </div>
            </section>
          )}

          {activeSection === "preferences" && (
            <section className="settings-section">
              <div className="settings-section__header">
                <div className="settings-section__icon">
                  <Palette size={22} />
                </div>

                <div>
                  <h2>Application preferences</h2>

                  <p>
                    Choose how financial information
                    appears in PennyPilot.
                  </p>
                </div>
              </div>

              <div className="settings-form-grid">
                <label className="settings-field">
                  <span>Currency</span>

                  <select
                    value={
                      settings.preferences.currency
                    }
                    onChange={(event) =>
                      updatePreference(
                        "currency",
                        event.target
                          .value as SupportedCurrency,
                      )
                    }
                  >
                    {CURRENCY_OPTIONS.map(
                      (currency) => (
                        <option
                          value={currency.value}
                          key={currency.value}
                        >
                          {currency.label}
                        </option>
                      ),
                    )}
                  </select>

                  <small>
                    This will be connected globally
                    during the export phase.
                  </small>
                </label>

                <label className="settings-field">
                  <span>Default expense category</span>

                  <select
                    value={
                      settings.preferences
                        .defaultCategory
                    }
                    onChange={(event) =>
                      updatePreference(
                        "defaultCategory",
                        event.target.value,
                      )
                    }
                  >
                    {EXPENSE_CATEGORIES.map(
                      (category) => (
                        <option
                          value={category}
                          key={category}
                        >
                          {category}
                        </option>
                      ),
                    )}
                  </select>

                  <small>
                    Used automatically when opening the
                    Add Expense form.
                  </small>
                </label>
              </div>

              <div className="settings-theme">
                <div className="settings-theme__heading">
                  <h3>Appearance</h3>

                  <p>
                    Select the visual theme used by the
                    application.
                  </p>
                </div>

                <div className="settings-theme__options">
                  {[
                    {
                      value: "light",
                      label: "Light",
                      icon: <Sun size={20} />,
                    },
                    {
                      value: "dark",
                      label: "Dark",
                      icon: <Moon size={20} />,
                    },
                    {
                      value: "system",
                      label: "System",
                      icon: <Laptop size={20} />,
                    },
                  ].map((theme) => (
                    <button
                      className={
                        settings.preferences.theme ===
                        theme.value
                          ? "settings-theme__option settings-theme__option--active"
                          : "settings-theme__option"
                      }
                      type="button"
                      key={theme.value}
                      onClick={() =>
                        updatePreference(
                          "theme",
                          theme.value as AppTheme,
                        )
                      }
                    >
                      {theme.icon}
                      <span>{theme.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          )}

          {activeSection ===
            "notifications" && (
            <section className="settings-section">
              <div className="settings-section__header">
                <div className="settings-section__icon">
                  <Bell size={22} />
                </div>

                <div>
                  <h2>Notifications</h2>

                  <p>
                    Configure reminders and financial
                    progress alerts.
                  </p>
                </div>
              </div>

              <div className="settings-switch-list">
                <label className="settings-switch-row">
                  <div>
                    <strong>Weekly summary</strong>

                    <span>
                      Receive a reminder to review your
                      weekly spending.
                    </span>
                  </div>

                  <input
                    type="checkbox"
                    checked={
                      settings.notifications
                        .weeklySummary
                    }
                    onChange={(event) =>
                      updateNotification(
                        "weeklySummary",
                        event.target.checked,
                      )
                    }
                  />
                </label>

                <label className="settings-switch-row">
                  <div>
                    <strong>Monthly summary</strong>

                    <span>
                      Receive a reminder at the end of
                      each month.
                    </span>
                  </div>

                  <input
                    type="checkbox"
                    checked={
                      settings.notifications
                        .monthlySummary
                    }
                    onChange={(event) =>
                      updateNotification(
                        "monthlySummary",
                        event.target.checked,
                      )
                    }
                  />
                </label>

                <label className="settings-switch-row">
                  <div>
                    <strong>Budget alerts</strong>

                    <span>
                      Show an alert when spending reaches
                      or exceeds a budget.
                    </span>
                  </div>

                  <input
                    type="checkbox"
                    checked={
                      settings.notifications
                        .budgetAlerts
                    }
                    onChange={(event) =>
                      updateNotification(
                        "budgetAlerts",
                        event.target.checked,
                      )
                    }
                  />
                </label>
              </div>

              <div className="settings-information">
                <Bell size={18} />

                <p>
                  These preferences prepare PennyPilot
                  for reminders. Browser or email
                  delivery will require a notification
                  service later.
                </p>
              </div>
            </section>
          )}

          {activeSection === "security" && (
            <section className="settings-section">
              <div className="settings-section__header">
                <div className="settings-section__icon">
                  <ShieldCheck size={22} />
                </div>

                <div>
                  <h2>Security</h2>

                  <p>
                    Review the services protecting your
                    PennyPilot account.
                  </p>
                </div>
              </div>

              <div className="settings-security-grid">
                <article className="settings-security-card">
                  <div>
                    <KeyRound size={22} />
                  </div>

                  <h3>Password management</h3>

                  <p>
                    Password reset is securely handled
                    through Amazon Cognito.
                  </p>

                  <a href="/forgot-password">
                    Change password
                  </a>
                </article>

                <article className="settings-security-card">
                  <div>
                    <ShieldCheck size={22} />
                  </div>

                  <h3>Protected account</h3>

                  <p>
                    Application routes require a valid
                    authenticated Cognito session.
                  </p>

                  <span>Protection enabled</span>
                </article>
              </div>
            </section>
          )}

          {activeSection === "about" && (
            <section className="settings-section">
              <div className="settings-section__header">
                <div className="settings-section__icon">
                  <Info size={22} />
                </div>

                <div>
                  <h2>About PennyPilot</h2>

                  <p>
                    Application information and
                    technology overview.
                  </p>
                </div>
              </div>

              <div className="settings-about">
                <div className="settings-about__brand">
                  <div>
                    <WalletCards size={30} />
                  </div>

                  <div>
                    <h3>PennyPilot</h3>
                    <p>
                      Serverless Personal Finance
                      Manager
                    </p>
                  </div>

                  <span>Version 1.0.0</span>
                </div>

                <div className="settings-technology-grid">
                  <article>
                    <Code2 size={21} />
                    <strong>Frontend</strong>
                    <span>
                      React, TypeScript and Vite
                    </span>
                  </article>

                  <article>
                    <Cloud size={21} />
                    <strong>Cloud</strong>
                    <span>
                      AWS Lambda and API Gateway
                    </span>
                  </article>

                  <article>
                    <Database size={21} />
                    <strong>Database</strong>
                    <span>Amazon DynamoDB</span>
                  </article>

                  <article>
                    <ShieldCheck size={21} />
                    <strong>Authentication</strong>
                    <span>Amazon Cognito</span>
                  </article>
                </div>
              </div>
            </section>
          )}

          <footer className="settings-actions">
            <div>
              {hasChanges ? (
                <span>
                  You have unsaved changes.
                </span>
              ) : (
                <span>
                  All changes are saved.
                </span>
              )}
            </div>

            <div>
              <button
                className="settings-reset-button"
                type="button"
                disabled={isSaving}
                onClick={handleReset}
              >
                <RefreshCw size={17} />
                Reset
              </button>

              <button
                className="settings-save-button"
                type="submit"
                disabled={
                  isSaving || !hasChanges
                }
              >
                <Save size={17} />

                {isSaving
                  ? "Saving..."
                  : "Save changes"}
              </button>
            </div>
          </footer>
        </div>
      </form>
    </section>
  );
}