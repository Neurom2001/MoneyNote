/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

// Standard Vite environment variable access
// Note: We use import.meta.env.VITE_KEY directly to ensure Vite replaces it during build.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Supabase Keys are missing! Check your .env file or Vercel settings.");
}

export const supabase = createClient(
  SUPABASE_URL || '', 
  SUPABASE_ANON_KEY || ''
);