import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { useSettingsStore } from '../store/useSettingsStore';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const loading = useAuthStore((state) => state.loading);
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const profileLoading = useAuthStore((state) => state.profileLoading);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const fetchProfile = useAuthStore((state) => state.fetchProfile);
  const fetchSettings = useSettingsStore((state) => state.fetchSettings);

  useEffect(() => {
    if (!isInitialized) return;

    const path = router.pathname;
    const isPublicPath = path === '/';
    const isOnboardingPath = path === '/onboarding';

    console.log(`[AuthGuard] Path: ${path} | Init: ${isInitialized} | user: ${user?.email}`);
    console.log(`[AuthGuard] Profile: ${!!profile} | Done: ${profile?.onboarding_completed} | Type: ${profile?.neuro_profile}`);

    if (!user) {
      if (!isPublicPath) {
        console.log('[AuthGuard] Redirecting to login: No session');
        router.push('/');
      }
    } else {
      // Logged in
      // Precise check: If onboarding_completed is strictly false, or missing (undefined), 
      // AND we don't have a valid neurological profile (not even the old 'mixed' default), trigger onboarding.
      const isDone = profile?.onboarding_completed === true;
      const hasChosenProfile = !!profile?.neuro_profile && profile?.neuro_profile !== 'mixed';
      
      const needsOnboarding = !isDone && !hasChosenProfile;

      if (needsOnboarding) {
        if (!isOnboardingPath) {
          console.log('[AuthGuard] Redirecting to onboarding: Profile incomplete');
          router.push('/onboarding');
        }
      } else {
        if (isPublicPath || isOnboardingPath) {
          console.log('[AuthGuard] Redirecting to dashboard: Complete');
          router.push('/dashboard');
        }
      }
    }
  }, [user, profile, isInitialized, router.pathname]);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        fetchProfile();
        fetchSettings();
      } else {
        setUser(null);
        if (router.pathname !== '/') {
          router.push('/');
        }
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user);
        fetchProfile();
        fetchSettings();
      } else {
        setUser(null);
        if (router.pathname !== '/') {
          router.push('/');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [router.pathname]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold animate-pulse">Initializing NeuroAssist...</p>
      </div>
    );
  }

  return <Component {...pageProps} />;
}

export default MyApp;
