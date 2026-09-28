import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { Perfil, RolUsuario, AccionPermiso, ETIQUETAS_ROL } from '../types';
import { puede } from '../lib/permisos';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  perfil: Perfil | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  rol: RolUsuario | null;
  rolEtiqueta: string;
  puede: (accion: AccionPermiso) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (userId: string, userEmail: string): Promise<Perfil | null> => {
    if (!isSupabaseConfigured || !supabase) return null;

    try {
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, nombre_completo, rol, activo')
        .eq('id', userId)
        .single();

      if (profileError || !data) {
        return null;
      }

      return data as Perfil;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    // Check current session
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      if (!isMounted) return;

      if (currentSession?.user) {
        setSession(currentSession);
        setUser(currentSession.user);
        const p = await fetchProfile(currentSession.user.id, currentSession.user.email || '');

        if (!p || !p.activo) {
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          setPerfil(null);
          setError('Tu cuenta no está habilitada.');
        } else {
          setPerfil(p);
        }
      }
      setLoading(false);
    });

    // Listen to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!isMounted) return;

      if (newSession?.user) {
        setSession(newSession);
        setUser(newSession.user);
        const p = await fetchProfile(newSession.user.id, newSession.user.email || '');

        if (!p || !p.activo) {
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          setPerfil(null);
          setError('Tu cuenta no está habilitada.');
        } else {
          setPerfil(p);
        }
      } else {
        setSession(null);
        setUser(null);
        setPerfil(null);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setError(null);

    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: 'Servicio de autenticación no configurado en Supabase.' };
    }

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError || !data.user) {
        return { success: false, error: signInError?.message || 'Correo o contraseña incorrectos' };
      }

      const p = await fetchProfile(data.user.id, data.user.email || '');
      if (!p) {
        await supabase.auth.signOut();
        return { success: false, error: 'Tu cuenta no está habilitada o no tiene perfil registrado.' };
      }

      if (!p.activo) {
        await supabase.auth.signOut();
        return { success: false, error: 'Tu cuenta no está habilitada.' };
      }

      setSession(data.session);
      setUser(data.user);
      setPerfil(p);
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al autenticar';
      return { success: false, error: msg };
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // Continue cleanup
      }
    }
    setSession(null);
    setUser(null);
    setPerfil(null);
    setError(null);
  };

  const rol = perfil?.rol || null;
  const rolEtiqueta = rol ? ETIQUETAS_ROL[rol] : '';

  const verificarPermiso = useCallback(
    (accion: AccionPermiso) => {
      return puede(rol, accion);
    },
    [rol]
  );

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        perfil,
        loading,
        error,
        signIn,
        signOut,
        rol,
        rolEtiqueta,
        puede: verificarPermiso,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
}
