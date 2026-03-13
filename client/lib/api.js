import axios from 'axios';
import { supabase } from './supabase';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
});

// Inject auth token into every request
apiClient.interceptors.request.use(async (config) => {
  try {
    // Skip auth check for specific public routes if needed
    if (config.url.includes('/public')) return config;

    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      console.log('🔑 Injecting Token for:', config.url);
      config.headers['Authorization'] = `Bearer ${session.access_token}`;
    } else {
      console.warn('⚠️ No active session for:', config.url);
      // We don't throw here so we can handle 401s in components, 
      // but we could also redirect to login if we wanted.
    }
  } catch (err) {
    console.error('Interceptor session error:', err);
  }
  return config;
});

export default apiClient;
