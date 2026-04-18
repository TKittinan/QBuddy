import { createClient } from '@supabase/supabase-js';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);