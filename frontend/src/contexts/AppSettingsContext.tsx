"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getAppSettings, updateAppSettings } from "@/lib/api";
import { fetchAndCacheServerTime } from "@/lib/serverTime";

const DEFAULT_APP_NAME = "IPMAS";
const DEFAULT_LOGO_PATH = "/assets/logo.png"; // Fallback to assets folder

interface AppSettingsContextType {
  appName: string;
  appLogoUrl: string | null;
  assistNumber: string | null;
  setAppName: (name: string) => Promise<void>;
  setAppLogoUrl: (url: string | null) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export function AppSettingsProvider({ children }: { children: React.ReactNode }) {
  const [appName, setAppNameState] = useState<string>(DEFAULT_APP_NAME);
  const [appLogoUrl, setAppLogoUrlState] = useState<string | null>(null);
  const [assistNumber, setAssistNumberState] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch app settings and server time in parallel (server time for year calculations)
      const [result] = await Promise.all([
        getAppSettings(),
        fetchAndCacheServerTime(),
      ]);
      if (result?.success && result?.settings) {
        setAppNameState(result.settings.app_name || DEFAULT_APP_NAME);
        // Use server logo URL if available, otherwise fallback to assets
        setAppLogoUrlState(
          result.settings.app_logo_url || null
        );
        setAssistNumberState(result.settings.assist_number || null);
      } else {
        // Fallback to defaults if fetch fails
        setAppNameState(DEFAULT_APP_NAME);
        setAppLogoUrlState(null);
        setAssistNumberState(null);
      }
    } catch (error) {
      console.error("Failed to fetch app settings:", error);
      setAppNameState(DEFAULT_APP_NAME);
      setAppLogoUrlState(null);
      setAssistNumberState(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const setAppName = useCallback(async (name: string) => {
    const value = name.trim() || DEFAULT_APP_NAME;
    setAppNameState(value);
    try {
      await updateAppSettings({ app_name: value });
    } catch (error) {
      console.error("Failed to update app name:", error);
    }
  }, []);

  const setAppLogoUrl = useCallback(async (url: string | null) => {
    setAppLogoUrlState(url);
    try {
      await updateAppSettings({ app_logo_url: url || undefined });
    } catch (error) {
      console.error("Failed to update app logo:", error);
    }
  }, []);

  const resetToDefaults = useCallback(async () => {
    setAppNameState(DEFAULT_APP_NAME);
    setAppLogoUrlState(null);
    setAssistNumberState(null);
    try {
      await updateAppSettings({ 
        app_name: DEFAULT_APP_NAME,
        app_logo_url: undefined 
      });
    } catch (error) {
      console.error("Failed to reset app settings:", error);
    }
  }, []);

  return (
    <AppSettingsContext.Provider
      value={{
        appName,
        appLogoUrl,
        assistNumber,
        setAppName,
        setAppLogoUrl,
        resetToDefaults,
        loading,
        refreshSettings: fetchSettings,
      }}
    >
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const ctx = useContext(AppSettingsContext);
  if (ctx === undefined) {
    throw new Error("useAppSettings must be used within AppSettingsProvider");
  }
  return ctx;
}
