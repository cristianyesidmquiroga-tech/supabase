import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured: boolean = Boolean(
  url &&
  key &&
  url !== 'https://tu-proyecto.supabase.co' &&
  !url.includes('[TU_SUPABASE_URL]') &&
  !key.includes('[TU_SUPABASE_ANON_KEY]')
);

// Solo inicializa el cliente si las variables existen; evita el crash fatal en tiempo de importación
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(url as string, key as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : (null as unknown as SupabaseClient);
