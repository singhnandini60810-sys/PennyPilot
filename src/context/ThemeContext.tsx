import {
  createContext,
  useContext,
  useEffect,
  type ReactNode,
} from "react";

import {
  applyAppTheme,
  loadAppSettings,
  SETTINGS_UPDATED_EVENT,
} from "../utils/appSettings";

const ThemeContext = createContext({});

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  useEffect(() => {
    const settings = loadAppSettings();

    applyAppTheme(settings.preferences.theme);

    const updateTheme = (event: Event) => {
      const customEvent = event as CustomEvent;

      applyAppTheme(
        customEvent.detail.preferences.theme,
      );
    };

    window.addEventListener(
      SETTINGS_UPDATED_EVENT,
      updateTheme,
    );

    return () => {
      window.removeEventListener(
        SETTINGS_UPDATED_EVENT,
        updateTheme,
      );
    };
  }, []);

  return (
    <ThemeContext.Provider value={{}}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}