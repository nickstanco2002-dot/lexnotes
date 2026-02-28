import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let supabaseClient: ReturnType<typeof createClient> | null = null;

// Only initialize if we have valid environment variables
if (supabaseUrl && supabaseUrl !== 'your-project-url' && supabaseAnonKey && supabaseAnonKey !== 'your-anon-key') {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = supabaseClient || createClient('https://placeholder.supabase.co', 'placeholder-key');

export default supabase;
