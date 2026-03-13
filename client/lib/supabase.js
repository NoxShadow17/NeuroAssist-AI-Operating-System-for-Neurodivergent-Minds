import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://chmieapbgvxvpfqpjjst.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNobWllYXBiZ3Z4dnBmcXBqanN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMDM2NzMsImV4cCI6MjA4ODg3OTY3M30.d-irmN72oepXRSmCli-StzLZUY2Hman9tVZLeyHF61Q';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
