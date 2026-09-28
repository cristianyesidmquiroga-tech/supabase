import React, { useState, useEffect } from 'react';
import {
  FileText,
  Edit,
  Save,
  Eye,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../../context/AuthContext';
import { useRol } from '../../hooks/useRol';
import { useConfig } from '../../hooks/useConfig';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { Politica } from '../../types';
import { reemplazarMarcadoresPolitica, formatearFecha } from '../../lib/format';
import { PanelLayout } from '../../components/panel/PanelLayout';
import { SinPermiso } from '../../components/panel/SinPermiso';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorAlert } from '../../components/ui/ErrorAlert';
import { useToast } from '../../components/ui/Toast';

export const PoliticasAdminPage: React.FC = () => {
  const { rol } = useAuth();
  const { esTrabajador, puede } = useRol();
  const { config } = useConfig();
  const { showToast } = useToast();

  const [politicas, setPoliticas] = useState<Politica[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedPolitica, setSelectedPolitica] = useState<Politica | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Edit fields
  const [editTitulo, setEditTitulo] = useState('');
  const [editContenido, setEditContenido] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const cargarPoliticas = React.useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    if (!isSupabaseConfigured || !supabase) {
      setPoliticas([]);
      setLoadError('Supabase no está configurado.');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.from('politicas').select('*').order('orden');
      if (error) {
        setPoliticas([]);
        setLoadError(error.message);
      } else {
        setPoliticas((data || []) as Politica[]);
      }
    } catch (err: unknown) {
      setPoliticas([]);
      setLoadError(err instanceof Error ? err.message : 'Error al cargar políticas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarPoliticas();
  }, [cargarPoliticas]);

  if (esTrabajador || !puede('gestionar_politicas')) {
    return (
      <PanelLayout breadcrumbs={[{ label: 'Políticas' }]}>
        <SinPermiso accion="gestionar las políticas legales del atelier" />
      </PanelLayout>
    );
  }

  const handleOpenEdit = (p: Politica) => {
    setSelectedPolitica(p);
    setEditTitulo(p.titulo);
    setEditContenido(p.contenido);
    setPreviewMode(false);
    setEditModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPolitica) return;

    if (!isSupabaseConfigured || !supabase) {
      showToast('error', 'Supabase no está configurado. No se puede guardar la política.');
      return;
    }

    setGuardando(true);
    const updatedDate = new Date().toISOString();

    try {
      const { error } = await supabase
        .from('politicas')
        .update({
          titulo: editTitulo,
          contenido: editContenido,
          updated_at: updatedDate,
        })
        .eq('slug', selectedPolitica.slug);
      if (error) throw error;

      setPoliticas((prev) =>
        prev.map((item) =>
          item.slug === selectedPolitica.slug
            ? { ...item, titulo: editTitulo, contenido: editContenido, updated_at: updatedDate }
            : item
        )
      );

      showToast('success', `Política "${editTitulo}" actualizada correctamente.`);
      setEditModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar política.';
      showToast('error', msg);
    } finally {
      setGuardando(false);
    }
  };

  const previewContenido = selectedPolitica
    ? reemplazarMarcadoresPolitica(editContenido, config, new Date().toISOString())
    : '';

  return (
    <PanelLayout breadcrumbs={[{ label: 'Políticas' }]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-[#E7E0D6]">
          <div>
            <h1 className="font-display text-3xl text-[#1C1917] tracking-tight font-bold">
              Políticas Legales y Términos
            </h1>
            <p className="text-xs md:text-sm text-[#57534E] mt-1">
              Documentos legales redactados bajo el marco regulatorio colombiano (Leyes 1581 de 2012 y 1480 de 2011).
            </p>
          </div>
        </div>

        {/* Dynamic Markers Guide Callout */}
        <div className="bg-[#FAF7F2] border border-[#E7E0D6] rounded-[8px] p-5 shadow-xs">
          <div className="flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-[#9F1D3A] shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs text-[#57534E]">
              <strong className="text-[#1C1917] font-semibold">
                Marcadores dinámicos disponibles en el texto:
              </strong>
              <p>
                Puedes insertar etiquetas entre dobles llaves para que se reemplacen automáticamente con los datos actuales del sitio:
              </p>
              <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px] text-[#9F1D3A]">
                <code className="bg-white px-2 py-0.5 rounded border border-[#E7E0D6]">&#123;&#123;nombre_negocio&#125;&#125;</code>
                <code className="bg-white px-2 py-0.5 rounded border border-[#E7E0D6]">&#123;&#123;razon_social&#125;&#125;</code>
                <code className="bg-white px-2 py-0.5 rounded border border-[#E7E0D6]">&#123;&#123;nit&#125;&#125;</code>
                <code className="bg-white px-2 py-0.5 rounded border border-[#E7E0D6]">&#123;&#123;ciudad&#125;&#125;</code>
                <code className="bg-white px-2 py-0.5 rounded border border-[#E7E0D6]">&#123;&#123;direccion&#125;&#125;</code>
                <code className="bg-white px-2 py-0.5 rounded border border-[#E7E0D6]">&#123;&#123;whatsapp&#125;&#125;</code>
                <code className="bg-white px-2 py-0.5 rounded border border-[#E7E0D6]">&#123;&#123;email_contacto&#125;&#125;</code>
                <code className="bg-white px-2 py-0.5 rounded border border-[#E7E0D6]">&#123;&#123;fecha_actualizacion&#125;&#125;</code>
              </div>
            </div>
          </div>
        </div>

        {/* Policies List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <Skeleton key={n} className="w-full h-24" />
            ))}
          </div>
        ) : loadError ? (
          <ErrorAlert message={loadError} onRetry={cargarPoliticas} />
        ) : politicas.length === 0 ? (
          <EmptyState
            title="No hay políticas registradas"
            description="Corre la migración de Supabase para crear las políticas de privacidad, términos y cambios/devoluciones."
            actionText="Reintentar"
            onAction={cargarPoliticas}
          />
        ) : (
        <div className="space-y-4">
          {politicas.map((pol) => (
            <div
              key={pol.slug}
              className="bg-white rounded-[8px] border border-[#E7E0D6] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#9F1D3A]" />
                  <span className="font-mono text-xs font-semibold text-[#8C7072]">
                    /politicas/{pol.slug}
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold text-[#1C1917]">{pol.titulo}</h3>
                <p className="text-xs text-[#57534E]">
                  Última revisión: {formatearFecha(pol.updated_at)}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={`#/politicas/${pol.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 bg-transparent border border-[#E7E0D6] hover:border-[#1C1917] rounded-[4px] text-xs font-semibold text-[#1C1917] transition-colors flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-[#57534E]" />
                  <span>Ver pública</span>
                </a>

                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Edit className="w-3.5 h-3.5" />}
                  onClick={() => handleOpenEdit(pol)}
                >
                  Editar documento
                </Button>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>

      {/* Edit Policy Modal */}
      {selectedPolitica && (
        <Modal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title={`Editar ${selectedPolitica.titulo}`}
          subtitle="Formato Markdown con soporte para marcadores institucionales."
          maxWidth="max-w-3xl"
        >
          <form onSubmit={handleSave} className="space-y-4">
            <Input
              label="Título del Documento Legal *"
              value={editTitulo}
              onChange={(e) => setEditTitulo(e.target.value)}
              required
            />

            {/* Mode switch */}
            <div className="flex items-center justify-between border-b border-[#E7E0D6] pb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#1C1917]">
                Contenido Markdown
              </span>
              <div className="inline-flex rounded-[4px] border border-[#E7E0D6] p-0.5 bg-[#FAF7F2] text-xs">
                <button
                  type="button"
                  onClick={() => setPreviewMode(false)}
                  className={`px-3 py-1 rounded-[2px] font-semibold transition-all ${
                    !previewMode ? 'bg-white text-[#9F1D3A] shadow-xs' : 'text-[#57534E]'
                  }`}
                >
                  Editor
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode(true)}
                  className={`px-3 py-1 rounded-[2px] font-semibold transition-all ${
                    previewMode ? 'bg-white text-[#9F1D3A] shadow-xs' : 'text-[#57534E]'
                  }`}
                >
                  Vista previa interpolada
                </button>
              </div>
            </div>

            {previewMode ? (
              <div className="max-h-[50vh] overflow-y-auto bg-[#FAF7F2] border border-[#E7E0D6] rounded-[4px] p-6 text-xs text-[#1C1917] prose prose-stone max-w-none">
                <ReactMarkdown>{previewContenido}</ReactMarkdown>
              </div>
            ) : (
              <textarea
                rows={16}
                value={editContenido}
                onChange={(e) => setEditContenido(e.target.value)}
                className="w-full bg-white text-[#1C1917] font-mono border border-[#E7E0D6] rounded-[4px] p-3 text-xs focus:border-[#9F1D3A] outline-none leading-relaxed"
                placeholder="## 1. Sección..."
                required
              />
            )}

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#E7E0D6]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={guardando}
              >
                Guardar Documento
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </PanelLayout>
  );
};
