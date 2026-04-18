import { createClient } from '@supabase/supabase-js';

// ค่าเดิมของคุณ
export const API_BASE_URL = import.meta.env.VITE_API_URL;

// เพิ่มการตั้งค่า Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);