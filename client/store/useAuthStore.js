import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import api from '../lib/api';

export const useAuthStore = create((set) => ({
  user: null,
  profile: null,
  loading: true,
  profileLoading: false,
  isInitialized: false,
  
  fetchProfile: async () => {
    set({ profileLoading: true });
    try {
      const { data } = await api.get('/users/profile');
      set({ profile: data, profileLoading: false, isInitialized: true });
    } catch (err) {
      console.error('Error fetching profile:', err);
      // Clear profile on error and mark as initialized (we're done checking)
      set({ profile: null, profileLoading: false, isInitialized: true });
    }
  },

  setUser: (user) => set((state) => {
    // If no user, we are initialized (nothing to fetch)
    if (!user) {
      return { user: null, profile: null, loading: false, profileLoading: false, isInitialized: true };
    }
    // If user is new or changed, we are NOT initialized until profile is fetched
    if (!state.user || state.user.id !== user.id) {
      return { user, profile: null, loading: false, profileLoading: false, isInitialized: false };
    }
    // Same user, keep existing state
    return { user, loading: false };
  }),
  
  updateProfile: async (updates) => {
    try {
      const { data } = await api.put('/users/profile', updates);
      set({ profile: data });
      return data;
    } catch (err) {
      console.error('Error updating profile:', err);
      throw err;
    }
  },
  
  updateProfileLocal: (updates) => {
    set((state) => ({
      profile: state.profile ? { ...state.profile, ...updates } : null
    }));
  },
  
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null, loading: false, isInitialized: true });
  }
}));
