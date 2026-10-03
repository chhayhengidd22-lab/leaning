import React, { createContext, useContext, useState, useEffect } from 'react';
import { WebsiteSettings } from '../types/index.ts';
import { api } from '../services/api.ts';
import { saveSettingsToFirestore, getSettingsFromFirestore } from '../services/firebaseSync.ts';

interface SettingsContextType {
  settings: WebsiteSettings | null;
  loading: boolean;
  refreshSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<WebsiteSettings>) => Promise<WebsiteSettings>;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: null,
  loading: true,
  refreshSettings: async () => {},
  updateSettings: async () => { throw new Error('Not implemented'); }
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSettings = async () => {
    try {
      // 1. Load primary from API
      const res = await api.getSettings();
      if (res.success && res.data) {
        setSettings(res.data);
      }
      
      // 2. Check if Google Cloud Firestore has newer cloud settings
      getSettingsFromFirestore().then(cloudSettings => {
        if (cloudSettings && cloudSettings.siteName) {
          setSettings(prev => ({ ...prev, ...cloudSettings }));
        }
      }).catch(e => console.log('[Cloud Datastore]', e));
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<WebsiteSettings>): Promise<WebsiteSettings> => {
    const res = await api.updateSettings(newSettings);
    if (res.success && res.data) {
      setSettings(res.data);
      // Synchronously persist to Google Cloud Firestore datastore
      saveSettingsToFirestore(res.data).catch(e => console.warn('Firestore sync background notice:', e));
      return res.data;
    }
    throw new Error(res.message || 'Failed to update settings');
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
