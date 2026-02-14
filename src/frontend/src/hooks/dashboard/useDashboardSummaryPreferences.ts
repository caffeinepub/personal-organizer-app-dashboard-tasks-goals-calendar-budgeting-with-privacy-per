import { useState, useEffect } from 'react';

export type SummaryMode = 'stats' | 'recent';
export type SectionKey = 'tasks' | 'goals' | 'calendar' | 'budget';

export interface SectionPreference {
  enabled: boolean;
  mode: SummaryMode;
}

export interface DashboardPreferences {
  tasks: SectionPreference;
  goals: SectionPreference;
  calendar: SectionPreference;
  budget: SectionPreference;
}

const DEFAULT_PREFERENCES: DashboardPreferences = {
  tasks: { enabled: true, mode: 'stats' },
  goals: { enabled: true, mode: 'stats' },
  calendar: { enabled: true, mode: 'stats' },
  budget: { enabled: true, mode: 'stats' },
};

const STORAGE_KEY = 'dashboard-summary-preferences';

export function useDashboardSummaryPreferences() {
  const [preferences, setPreferences] = useState<DashboardPreferences>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load dashboard preferences:', error);
    }
    return DEFAULT_PREFERENCES;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save dashboard preferences:', error);
    }
  }, [preferences]);

  const toggleSection = (section: SectionKey) => {
    setPreferences((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        enabled: !prev[section].enabled,
      },
    }));
  };

  const setMode = (section: SectionKey, mode: SummaryMode) => {
    setPreferences((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        mode,
      },
    }));
  };

  return {
    preferences,
    toggleSection,
    setMode,
  };
}
