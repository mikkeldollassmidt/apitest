import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Manglende Supabase miljøvariabler. Tjek din .env.local fil.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);