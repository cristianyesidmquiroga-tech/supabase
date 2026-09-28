import React, { useState, useEffect } from 'react';
import {
  Mail,
  MailOpen,
  MessageCircle,
  Phone,
  Trash2,
  Calendar,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRol } from '../../hooks/useRol';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { MensajeContacto } from '../../types';
import { formatearFecha } from '../../lib/format';
import { PanelLayout } from '../../components/panel/PanelLayout';
import { SinPermiso } from '../../components/panel/SinPermiso';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorAlert } from '../../components/ui/ErrorAlert';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';

export const MensajesPage: React.FC = () => {
  const { rol } = useAuth();
  const { esSuperadmin, esTrabajador, puede } = useRol();
  const { showToast } = useToast();

  const [mensajes, setMensajes] = useState<MensajeContacto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filterLeido, setFilterLeido] = useState<'all' | 'unread' | 'read'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected message modal
  const [selectedMensaje, setSelectedMensaje] = useState<MensajeContacto | null>(null);

  // Delete message
  const [deletingMensaje, setDeletingMensaje] = useState<MensajeContacto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const cargarMensajes = React.useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    if (!isSupabaseConfigured || !supabase) {
      setMensajes([]);
      setLoadError('Supabase no está configurado.');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('mensajes_contacto')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setMensajes([]);
        setLoadError(error.message);
      } else {
        setMensajes((data || []) as MensajeContacto[]);
      }
    } catch (err: unknown) {
      setMensajes([]);
      setLoadError(err instanceof Error ? err.message : 'Error al cargar mensajes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarMensajes();
  }, [cargarMensajes]);

  if (esTrabajador || !puede('ver_mensajes')) {
    return (
      <PanelLayout breadcrumbs={[{ label: 'Mensajes' }]}>
        <SinPermiso accion="acceder a los mensajes de contacto de clientes" />
      </PanelLayout>
    );
  }

  const handleToggleLeido = async (msg: MensajeContacto) => {
    if (!isSupabaseConfigured || !supabase) {
      showToast('error', 'Supabase no está configurado. No se puede actualizar el mensaje.');
      return;
    }

    const nuevoEstado = !msg.leido;

    try {
      const { error } = await supabase
        .from('mensajes_contacto')
        .update({ leido: nuevoEstado })
        .eq('id', msg.id);
      if (error) throw error;

      setMensajes((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, leido: nuevoEstado } : m))
      );

      if (selectedMensaje?.id === msg.id) {
        setSelectedMensaje((prev) => (prev ? { ...prev, leido: nuevoEstado } : null));
      }

      showToast(
        'info',
        nuevoEstado ? 'Mensaje marcado como leído.' : 'Mensaje marcado como no leído.'
      );
    } catch {
      showToast('error', 'Error al actualizar el estado del mensaje.');
    }
  };

  const handleDelete = async () => {
    if (!deletingMensaje || !esSuperadmin) return;

    if (!isSupabaseConfigured || !supabase) {
      showToast('error', 'Supabase no está configurado. No se puede eliminar el mensaje.');
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await supabase.from('mensajes_contacto').delete().eq('id', deletingMensaje.id);
      if (error) throw error;

      setMensajes((prev) => prev.filter((m) => m.id !== deletingMensaje.id));
      if (selectedMensaje?.id === deletingMensaje.id) {
        setSelectedMensaje(null);
      }

      showToast('success', 'Mensaje eliminado de la bandeja.');
      setDeletingMensaje(null);
    } catch {
      showToast('error', 'Error al eliminar el mensaje.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenDetail = (msg: MensajeContacto) => {
    setSelectedMensaje(msg);
    if (!msg.leido) {
      handleToggleLeido(msg);
    }
  };

  // Filtered list
  const filtered = mensajes.filter((m) => {
    if (filterLeido === 'unread' && m.leido) return false;
    if (filterLeido === 'read' && !m.leido) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        m.nombre.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.mensaje.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const unreadCount = mensajes.filter((m) => !m.leido).length;

  return (
    <PanelLayout breadcrumbs={[{ label: 'Mensajes' }]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-[#E7E0D6]">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-3xl text-[#1C1917] tracking-tight font-bold">
                Mensajes de Clientes
              </h1>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#9F1D3A] text-white text-xs font-semibold">
                  {unreadCount} sin leer
                </span>
              )}
            </div>
            <p className="text-xs md:text-sm text-[#57534E] mt-1">
              Consultas recibidas desde el formulario web del atelier.
            </p>
          </div>

          {/* Filter pills */}
          <div className="flex items-center gap-1.5 p-1 bg-white border border-[#E7E0D6] rounded-[6px] text-xs">
            <button
              type="button"
              onClick={() => setFilterLeido('all')}
              className={`px-3 py-1 rounded-[4px] font-semibold transition-all ${
                filterLeido === 'all'
                  ? 'bg-[#F3E8EA] text-[#9F1D3A]'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              Todos ({mensajes.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterLeido('unread')}
              className={`px-3 py-1 rounded-[4px] font-semibold transition-all ${
                filterLeido === 'unread'
                  ? 'bg-[#F3E8EA] text-[#9F1D3A]'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              Sin leer ({unreadCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterLeido('read')}
              className={`px-3 py-1 rounded-[4px] font-semibold transition-all ${
                filterLeido === 'read'
                  ? 'bg-[#F3E8EA] text-[#9F1D3A]'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              Leídos ({mensajes.length - unreadCount})
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#57534E] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por cliente, correo o palabra clave..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#E7E0D6] rounded-[4px] text-xs text-[#1C1917] placeholder:text-[#57534E]/60 focus:border-[#9F1D3A] outline-none"
          />
        </div>

        {/* Messages List */}
        {loading ? (
          <div className="bg-white rounded-[8px] border border-[#E7E0D6] p-6 space-y-4 shadow-xs">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex items-center gap-4 py-2">
                <Skeleton className="w-9 h-9" variant="circular" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="w-1/3 h-3" />
                  <Skeleton className="w-2/3 h-3" />
                </div>
              </div>
            ))}
          </div>
        ) : loadError ? (
          <ErrorAlert message={loadError} onRetry={cargarMensajes} />
        ) : filtered.length === 0 && mensajes.length === 0 ? (
          <EmptyState
            title="No hay mensajes todavía"
            description="Las consultas que envíen las clientas desde el formulario web aparecerán aquí."
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Bandeja de mensajes al día"
            description="No hay consultas pendientes con los criterios de búsqueda seleccionados."
            actionText="Mostrar todos"
            onAction={() => {
              setFilterLeido('all');
              setSearchQuery('');
            }}
          />
        ) : (
          <div className="bg-white rounded-[8px] border border-[#E7E0D6] overflow-hidden shadow-xs divide-y divide-[#E7E0D6]">
            {filtered.map((msg) => (
              <div
                key={msg.id}
                onClick={() => handleOpenDetail(msg)}
                className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-[#FAF7F2]/60 transition-colors ${
                  !msg.leido ? 'bg-[#F3E8EA]/20 font-medium' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="pt-0.5">
                    {!msg.leido ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#9F1D3A] inline-block" />
                    ) : (
                      <MailOpen className="w-4 h-4 text-[#8C7072]" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-[#1C1917]">{msg.nombre}</span>
                      <span className="text-[11px] text-[#57534E]">({msg.email})</span>
                      {msg.telefono && (
                        <span className="text-[11px] text-[#8C7072] font-mono">
                          · {msg.telefono}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#57534E] mt-1 line-clamp-2 leading-relaxed">
                      {msg.mensaje}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end md:self-auto text-xs text-[#57534E]">
                  <span className="text-[11px] font-mono">{formatearFecha(msg.created_at)}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleLeido(msg);
                    }}
                    className="p-1.5 rounded hover:bg-black/5 text-[#57534E] hover:text-[#1C1917]"
                    title={msg.leido ? 'Marcar no leído' : 'Marcar leído'}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  {esSuperadmin && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingMensaje(msg);
                      }}
                      className="p-1.5 rounded hover:bg-[#FEE2E2] text-[#B91C1C]"
                      title="Eliminar mensaje"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message Detail Modal */}
      {selectedMensaje && (
        <Modal
          isOpen={Boolean(selectedMensaje)}
          onClose={() => setSelectedMensaje(null)}
          title={`Consulta de ${selectedMensaje.nombre}`}
          subtitle={`Recibido el ${formatearFecha(selectedMensaje.created_at)}`}
          maxWidth="max-w-lg"
        >
          <div className="space-y-4">
            <div className="bg-[#FAF7F2] p-4 rounded-[6px] border border-[#E7E0D6] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#57534E]">Remitente:</span>
                <span className="font-semibold text-[#1C1917]">{selectedMensaje.nombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#57534E]">Correo:</span>
                <a
                  href={`mailto:${selectedMensaje.email}`}
                  className="font-semibold text-[#9F1D3A] hover:underline"
                >
                  {selectedMensaje.email}
                </a>
              </div>
              {selectedMensaje.telefono && (
                <div className="flex justify-between">
                  <span className="text-[#57534E]">Teléfono / WhatsApp:</span>
                  <span className="font-mono font-semibold text-[#1C1917]">
                    {selectedMensaje.telefono}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5 pt-1 text-[11px] text-[#166534]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Aceptó formalmente la Política de Tratamiento de Datos.</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917]">
                Mensaje de la clienta:
              </label>
              <div className="p-4 bg-white border border-[#E7E0D6] rounded-[4px] text-xs text-[#1C1917] leading-relaxed whitespace-pre-wrap">
                {selectedMensaje.mensaje}
              </div>
            </div>

            {/* Direct contact action shortcuts */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2 border-t border-[#E7E0D6]">
              {selectedMensaje.telefono && (
                <a
                  href={`https://wa.me/${selectedMensaje.telefono.replace(/\D/g, '')}?text=${encodeURIComponent(
                    `Hola ${selectedMensaje.nombre}, gracias por contactar a VSHEIN Atelier. Respecto a tu consulta:`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 px-4 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-semibold rounded-[4px] flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Responder por WhatsApp</span>
                </a>
              )}

              <a
                href={`mailto:${selectedMensaje.email}?subject=${encodeURIComponent(
                  `Respuesta de VSHEIN Atelier para ${selectedMensaje.nombre}`
                )}`}
                className="flex-1 py-2.5 px-4 bg-[#1C1917] hover:bg-black text-white text-xs font-semibold rounded-[4px] flex items-center justify-center gap-2 transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>Responder por Correo</span>
              </a>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {deletingMensaje && (
        <ConfirmDialog
          isOpen={Boolean(deletingMensaje)}
          onClose={() => setDeletingMensaje(null)}
          onConfirm={handleDelete}
          title="Eliminar mensaje"
          message={`¿Estás segura de eliminar permanentemente la consulta de "${deletingMensaje.nombre}"?`}
          confirmText="Eliminar mensaje"
          isLoading={isDeleting}
        />
      )}
    </PanelLayout>
  );
};
