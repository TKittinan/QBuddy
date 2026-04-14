import { createClient } from '@supabase/supabase-js';

// env variables for Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://aoylktqvyzkkuabjyylm.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'sb_publishable_HlBO8tsOPcK3Nv8akltvlg_dwMxYmdX';

// Create client to interact with Supabase
export const supabase = createClient(supabaseUrl, supabaseKey);