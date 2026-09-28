import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { SitioConfig } from '../types';

export function useConfig() {
  const [config, setConfig] = useState<SitioConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured || !supabase) {
      setConfig(null);
      setError('Supabase no está configurado.');
      setLoading(false);
      return;
    }

    try {
      const { data, error: fetchErr } = await supabase
        .from('sitio_config')
        .select('*')
        .eq('id', 1)
        .single();

      if (fetchErr) {
        setConfig(null);
        setError(fetchErr.message || 'No se pudo cargar la configuración del sitio.');
      } else {
        setConfig(data as SitioConfig);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar configuración del sitio');
      setConfig(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const updateConfig = async (nuevosDatos: Partial<SitioConfig>): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: 'Supabase no está configurado.' };
    }

    try {
      const { error: updateErr } = await supabase
        .from('sitio_config')
        .update({
          ...nuevosDatos,
          updated_at: new Date().toISOString(),
        })
        .eq('id', 1);

      if (updateErr) {
        if (updateErr.code === '42501' || updateErr.message?.includes('row-level security')) {
          return { success: false, error: 'No tienes permiso para esta acción.' };
        }
        return { success: false, error: updateErr.message };
      }

      await fetchConfig();
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Error al guardar configuración' };
    }
  };

  return {
    config,
    loading,
    error,
    refetch: fetchConfig,
    updateConfig,
  };
}
