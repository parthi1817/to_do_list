import { createClient } from '@supabase/supabase-js';

// Fallback constants provided in configuration
const FALLBACK_URL = 'https://tgamvjicllusetonuixp.supabase.co';
const FALLBACK_KEY = 'sb_publishable_zLqNs-D5qY9sX3_CY9O9Ng_5l_zTTDA';

// Read from import.meta.env first, falling back to constants
const rawUrl = import.meta.env.VITE_SUPABASE_URL || FALLBACK_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || FALLBACK_KEY;

// Clean URL in case rest/v1 or trailing slash was appended in environment variable
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
