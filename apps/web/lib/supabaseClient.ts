import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://skgcqpoxdatddehvgskf.supabase.co';

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_xzZ9lkZq3DdGcI1l0rnnFQ_5C5cKhD7';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
