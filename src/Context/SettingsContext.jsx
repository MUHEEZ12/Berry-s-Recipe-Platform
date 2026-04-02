import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('appSettings');
      return saved ? JSON.parse(saved) : {
        darkMode: false,
        emailNotifications: true,
        recipeNotifications: true,
        privateProfile: false,
      };
    } catch {
      return {
        darkMode: false,
        emailNotifications: true,
        recipeNotifications: true,
        privateProfile: false,
      };
    }
  });

  // Apply theme on mount and when darkMode changes
  useEffect(() => {
    applyTheme(settings.darkMode);
  }, [settings.darkMode]);

  // Persist settings to localStorage
  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
  }, [settings]);

  const applyTheme = (isDark) => {
    const root = document.documentElement;
    if (isDark) {
      root.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      root.setAttribute('data-theme', 'light');
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleDarkMode = () => {
    updateSetting('darkMode', !settings.darkMode);
  };

  const toggleEmailNotifications = () => {
    updateSetting('emailNotifications', !settings.emailNotifications);
  };

  const toggleRecipeNotifications = () => {
    updateSetting('recipeNotifications', !settings.recipeNotifications);
  };

  const togglePrivateProfile = () => {
    updateSetting('privateProfile', !settings.privateProfile);
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSetting,
        toggleDarkMode,
        toggleEmailNotifications,
        toggleRecipeNotifications,
        togglePrivateProfile,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}
