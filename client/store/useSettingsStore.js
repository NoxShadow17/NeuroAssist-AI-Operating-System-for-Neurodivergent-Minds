import { create } from 'zustand';
import api from '../lib/api';

export const useSettingsStore = create((set, get) => ({
  settings: null,
  overwhelmMode: false,
  dyslexiaMode: false,
  
  fetchSettings: async () => {
    try {
      const { data } = await api.get('/users/settings');
      set({ settings: data, dyslexiaMode: data.dyslexia_font });
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  },

  updateSettings: async (newSettings) => {
    try {
      const { data } = await api.put('/users/settings', newSettings);
      set({ settings: data, dyslexiaMode: data.dyslexia_font });
    } catch (err) {
      console.error('Error updating settings:', err);
    }
  },

  toggleOverwhelmMode: () => set({ overwhelmMode: !get().overwhelmMode }),
  setDyslexiaMode: (val) => set({ dyslexiaMode: val }),
}));
