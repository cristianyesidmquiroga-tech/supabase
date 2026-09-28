import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Edit,
  UserCheck,
  UserX,
  Info,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRol } from '../../hooks/useRol';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { Perfil, RolUsuario, ETIQUETAS_ROL } from '../../types';
import { formatearFecha } from '../../lib/format';
import { PanelLayout } from '../../components/panel/PanelLayout';
import { SinPermiso } from '../../components/panel/SinPermiso';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { useToast } from '../../components/ui/Toast';

export const UsuariosPage: React.FC = () => {
  const { perfil: miPerfil } = useAuth();
  const { esSuperadmin, puede } = useRol();
  const { showToast } = useToast();

  const [usuarios, setUsuarios] = useState<Perfil[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Perfil | null>(null);

  // Form fields for editing
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [rolSeleccionado, setRolSeleccionado] = useState<RolUsuario>('empleada');
  const [activo, setActivo] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    if (!isSupabaseConfigured || !supabase) {
      setUsuarios([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: true });

      if (!error && data) {
        setUsuarios(data as Perfil[]);
      } else {
        setUsuarios([]);
      }
    } catch {
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  // Strict check: Only Superadmin can manage users
  if (!esSuperadmin || !puede('gestionar_usuarios')) {
    return (
      <PanelLayout breadcrumbs={[{ label: 'Usuarios' }]}>
        <SinPermiso accion="gestionar cuentas del equipo de trabajo y credenciales" />
      </PanelLayout>
    );
  }

  const handleOpenEdit = (usr: Perfil) => {
    setEditingUsuario(usr);
    setNombreCompleto(usr.nombre_completo || '');
    setEmail(usr.email || '');
    setRolSeleccionado(usr.rol);
    setActivo(usr.activo);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUsuario) return;

    if (!nombreCompleto.trim()) {
      showToast('error', 'El nombre completo es obligatorio.');
      return;
    }

    // Safeguard: Cannot deactivate self
    if (editingUsuario.id === miPerfil?.id && !activo) {
      showToast('error', 'No puedes desactivar tu propia cuenta administradora.');
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      showToast('error', 'Supabase no está configurado. No se puede guardar el usuario.');
      return;
    }

    setGuardando(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          nombre_completo: nombreCompleto.trim(),
          rol: rolSeleccionado,
          activo,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingUsuario.id);

      if (error) throw error;

      setUsuarios((prev) =>
        prev.map((u) =>
          u.id === editingUsuario.id
            ? {
                ...u,
                nombre_completo: nombreCompleto.trim(),
                rol: rolSeleccionado,
                activo,
              }
            : u
        )
      );

      showToast('success', `Rol y permisos de "${nombreCompleto}" actualizados con éxito.`);
      setModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar usuario.';
      showToast('error', msg);
    } finally {
      setGuardando(false);
    }
  };

  const handleToggleActivo = async (usr: Perfil) => {
    if (usr.id === miPerfil?.id) {
      showToast('error', 'No puedes desactivar tu propia cuenta administradora.');
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      showToast('error', 'Supabase no está configurado. No se puede cambiar el estado del usuario.');
      return;
    }

    const nuevoEstado = !usr.activo;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ activo: nuevoEstado })
        .eq('id', usr.id);

      if (error) throw error;

      setUsuarios((prev) =>
        prev.map((u) => (u.id === usr.id ? { ...u, activo: nuevoEstado } : u))
      );

      showToast(
        'info',
        nuevoEstado
          ? `Acceso de "${usr.nombre_completo}" activado.`
          : `Acceso de "${usr.nombre_completo}" desactivado.`
      );
    } catch {
      showToast('error', 'Error al modificar estado del usuario.');
    }
  };

  return (
    <PanelLayout breadcrumbs={[{ label: 'Usuarios' }]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-[#E7E0D6]">
          <div>
            <h1 className="font-display text-3xl text-[#1C1917] tracking-tight font-bold">
              Gestión de Equipo y Permisos
            </h1>
            <p className="text-xs md:text-sm text-[#57534E] mt-1">
              Control de acceso y asignación de roles operativos en Supabase.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
              onClick={fetchUsuarios}
              disabled={loading}
            >
              Actualizar lista
            </Button>
          </div>
        </div>

        {/* Notice Card: How to create a user in Supabase */}
        <div className="p-4 rounded-[8px] bg-[#FAF7F2] border border-[#E7E0D6] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-[6px] bg-[#F3E8EA] text-[#9F1D3A] shrink-0 mt-0.5 sm:mt-0">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-[#1C1917]">
                Aviso de creación de miembros:
              </p>
              <p className="text-[#57534E] mt-0.5 font-medium leading-relaxed">
                Para crear un usuario nuevo: <span className="font-mono font-semibold text-[#1C1917] bg-[#E7E0D6]/50 px-1.5 py-0.5 rounded">Supabase &gt; Authentication &gt; Users &gt; Add user</span>. Su perfil aparece aquí y desde aquí le asignas el rol.
              </p>
            </div>
          </div>
          <div className="sm:self-center shrink-0">
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-white border border-[#E7E0D6] text-[11px] font-semibold text-[#1C1917] hover:border-[#9F1D3A] hover:text-[#9F1D3A] transition-colors"
            >
              <span>Ir a Supabase</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Roles Policy Overview Callout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-[#E7E0D6] rounded-[8px] p-4 shadow-xs">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#9F1D3A]" />
              <h4 className="text-xs font-bold text-[#1C1917] uppercase tracking-wider">
                Superadmin
              </h4>
            </div>
            <p className="text-[11px] text-[#57534E] leading-relaxed">
              Control total e irreversible: creación, edición, supresión de referencias, fotos, categorías, políticas y administración de roles.
            </p>
          </div>

          <div className="bg-white border border-[#E7E0D6] rounded-[8px] p-4 shadow-xs">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#1C1917]" />
              <h4 className="text-xs font-bold text-[#1C1917] uppercase tracking-wider">
                Supervisor
              </h4>
            </div>
            <p className="text-[11px] text-[#57534E] leading-relaxed">
              Curaduría y edición de catálogo, categorías, campañas y mensajes. Ninguna acción destructiva o gestión de cuentas permitida.
            </p>
          </div>

          <div className="bg-white border border-[#E7E0D6] rounded-[8px] p-4 shadow-xs">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#006B5F]" />
              <h4 className="text-xs font-bold text-[#1C1917] uppercase tracking-wider">
                Trabajador
              </h4>
            </div>
            <p className="text-[11px] text-[#57534E] leading-relaxed">
              Exclusivamente consulta de referencias activas, tallas y PVP para asesoría presencial o WhatsApp. Sin acceso a datos sensibles o edición.
            </p>
          </div>
        </div>

        {/* Users State: Skeleton vs EmptyState vs Table */}
        {loading ? (
          <div className="bg-white rounded-[8px] border border-[#E7E0D6] p-6 space-y-4 shadow-xs">
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="flex items-center justify-between py-3 border-b border-[#E7E0D6]/50">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-9 h-9 rounded-full" />
                    <div className="space-y-1.5">
                      <Skeleton className="w-36 h-4" />
                      <Skeleton className="w-24 h-3" />
                    </div>
                  </div>
                  <Skeleton className="w-40 h-4 hidden sm:block" />
                  <Skeleton className="w-24 h-6 rounded-[4px]" />
                  <Skeleton className="w-16 h-5" />
                  <Skeleton className="w-16 h-8 rounded-[4px]" />
                </div>
              ))}
            </div>
          </div>
        ) : usuarios.length === 0 ? (
          <div className="bg-white rounded-[8px] border border-[#E7E0D6] p-8 shadow-xs">
            <EmptyState
              icon={<Users className="w-8 h-8 text-[#9F1D3A]" />}
              title="No hay usuarios registrados"
              description="Para crear un usuario nuevo: Supabase > Authentication > Users > Add user. Su perfil aparece aquí y desde aquí le asignas el rol."
              actionText="Actualizar lista"
              onAction={fetchUsuarios}
            />
          </div>
        ) : (
          <div className="bg-white rounded-[8px] border border-[#E7E0D6] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#E7E0D6] bg-[#FAF7F2]/60 text-[#57534E] uppercase tracking-wider font-semibold">
                    <th className="py-3.5 px-6" scope="col">Miembro del Atelier</th>
                    <th className="py-3.5 px-4" scope="col">Correo Autorizado</th>
                    <th className="py-3.5 px-4" scope="col">Rol Asignado</th>
                    <th className="py-3.5 px-4" scope="col">Estado</th>
                    <th className="py-3.5 px-4" scope="col">Registro</th>
                    <th className="py-3.5 pl-4 pr-6 text-right" scope="col">Acciones</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#E7E0D6] text-[#1C1917]">
                  {usuarios.map((usr) => {
                    const initial = (usr.nombre_completo || usr.email || 'U').charAt(0).toUpperCase();
                    const isCurrent = usr.id === miPerfil?.id;

                    return (
                      <tr key={usr.id} className="hover:bg-[#FAF7F2]/40 transition-colors">
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#1C1917] text-white flex items-center justify-center font-display font-semibold text-xs shrink-0">
                              {initial}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-[#1C1917]">
                                  {usr.nombre_completo || 'Sin nombre'}
                                </span>
                                {isCurrent && (
                                  <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-[#F3E8EA] text-[#9F1D3A]">
                                    Tú
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-[#57534E] font-mono">
                                ID: {usr.id.slice(0, 8)}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[#57534E]">{usr.email}</td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-[4px] text-[10px] font-semibold uppercase tracking-wider border ${
                              usr.rol === 'administradora'
                                ? 'bg-[#F3E8EA] text-[#9F1D3A] border-[#9F1D3A]/20'
                                : usr.rol === 'supervisor'
                                ? 'bg-[#FAF7F2] text-[#1C1917] border-[#E7E0D6]'
                                : 'bg-[#F4ECE8] text-[#006B5F] border-[#E7E0D6]'
                            }`}
                          >
                            {ETIQUETAS_ROL[usr.rol] || usr.rol}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <Badge variant={usr.activo ? 'success' : 'danger'} dot>
                            {usr.activo ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </td>

                        <td className="py-3.5 px-4 text-[#57534E]">
                          {usr.created_at ? formatearFecha(usr.created_at) : 'Inicial'}
                        </td>

                        <td className="py-3.5 pl-4 pr-6 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-2 justify-end">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(usr)}
                              className="p-1.5 rounded-[4px] hover:bg-black/5 text-[#57534E] hover:text-[#9F1D3A] transition-colors"
                              title="Editar rol y permisos"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            {!isCurrent && (
                              <button
                                type="button"
                                onClick={() => handleToggleActivo(usr)}
                                className={`p-1.5 rounded-[4px] transition-colors ${
                                  usr.activo
                                    ? 'hover:bg-[#FEE2E2] text-[#B91C1C]'
                                    : 'hover:bg-[#DCFCE7] text-[#166534]'
                                }`}
                                title={usr.activo ? 'Desactivar acceso' : 'Activar acceso'}
                              >
                                {usr.activo ? (
                                  <UserX className="w-4 h-4" />
                                ) : (
                                  <UserCheck className="w-4 h-4" />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal Editar Rol y Permisos */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Modificar Rol y Acceso de Miembro"
        subtitle="Asignación estricta de permisos operativos en la plataforma."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Nombre completo *"
            value={nombreCompleto}
            onChange={(e) => setNombreCompleto(e.target.value)}
            placeholder="Ej. Constanza Valenzuela"
            required
          />

          <Input
            type="email"
            label="Correo electrónico"
            value={email}
            disabled
            helperText="Gestionado en Supabase Authentication (Users)."
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917]">
              Rol y Nivel de Autorización *
            </label>
            <select
              value={rolSeleccionado}
              onChange={(e) => setRolSeleccionado(e.target.value as RolUsuario)}
              className="w-full px-3 py-2.5 bg-white border border-[#E7E0D6] rounded-[4px] text-xs text-[#1C1917] focus:border-[#9F1D3A] outline-none"
            >
              <option value="empleada">Trabajador (Solo lectura de catálogo y PVP)</option>
              <option value="supervisor">Supervisor (Edición de prendas, categorías y mensajes)</option>
              <option value="administradora">Superadmin (Control absoluto y supresión)</option>
            </select>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-[#1C1917]">
              <input
                type="checkbox"
                checked={activo}
                onChange={(e) => setActivo(e.target.checked)}
                className="w-4 h-4 rounded-[3px] border-[#E7E0D6] text-[#9F1D3A] focus:ring-[#9F1D3A]"
              />
              <span className="font-semibold">Cuenta habilitada para iniciar sesión</span>
            </label>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#E7E0D6]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={guardando}
            >
              Guardar Cambios
            </Button>
          </div>
        </form>
      </Modal>
    </PanelLayout>
  );
};
