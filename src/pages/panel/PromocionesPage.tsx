import React, { useState } from 'react';
import {
  Percent,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Image as ImageIcon,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRol } from '../../hooks/useRol';
import { useProductos } from '../../hooks/useProductos';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { Promocion } from '../../types';
import { PanelLayout } from '../../components/panel/PanelLayout';
import { SinPermiso } from '../../components/panel/SinPermiso';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';

export const PromocionesPage: React.FC = () => {
  const { rol } = useAuth();
  const { esSuperadmin, esTrabajador, puede } = useRol();
  const { promociones, refetch } = useProductos({ soloActivos: false });
  const { showToast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promocion | null>(null);

  // Form states
  const [titulo, setTitulo] = useState('');
  const [subtitulo, setSubtitulo] = useState('');
  const [rutaImagen, setRutaImagen] = useState('');
  const [textoAlternativo, setTextoAlternativo] = useState('');
  const [enlaceDestino, setEnlaceDestino] = useState('');
  const [ubicacion, setUbicacion] = useState('hero');
  const [orden, setOrden] = useState(1);
  const [activa, setActiva] = useState(true);
  const [vigenciaInicio, setVigenciaInicio] = useState('');
  const [vigenciaFin, setVigenciaFin] = useState('');
  const [guardando, setGuardando] = useState(false);

  // Delete modal state
  const [deletingPromo, setDeletingPromo] = useState<Promocion | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Workers cannot view or manage promotions
  if (esTrabajador || !puede('gestionar_promociones')) {
    return (
      <PanelLayout breadcrumbs={[{ label: 'Promociones' }]}>
        <SinPermiso accion="gestionar los banners y promociones del atelier" />
      </PanelLayout>
    );
  }

  const handleOpenCreate = () => {
    setEditingPromo(null);
    setTitulo('');
    setSubtitulo('');
    setRutaImagen('');
    setTextoAlternativo('');
    setEnlaceDestino('#coleccion');
    setUbicacion('hero');
    setOrden(promociones.length + 1);
    setActiva(true);
    setVigenciaInicio('');
    setVigenciaFin('');
    setModalOpen(true);
  };

  const handleOpenEdit = (promo: Promocion) => {
    setEditingPromo(promo);
    setTitulo(promo.titulo);
    setSubtitulo(promo.subtitulo || '');
    setRutaImagen(promo.ruta_imagen || promo.url_publica || '');
    setTextoAlternativo(promo.texto_alternativo || '');
    setEnlaceDestino(promo.enlace_destino || '');
    setUbicacion(promo.ubicacion || 'hero');
    setOrden(promo.orden);
    setActiva(promo.activa);
    setVigenciaInicio(promo.vigencia_inicio ? promo.vigencia_inicio.split('T')[0] : '');
    setVigenciaFin(promo.vigencia_fin ? promo.vigencia_fin.split('T')[0] : '');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) {
      showToast('error', 'El título de la promoción es obligatorio.');
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      showToast('error', 'Supabase no está configurado. No se puede guardar la promoción.');
      return;
    }

    setGuardando(true);
    try {
      const payload = {
        titulo,
        subtitulo: subtitulo.trim() || null,
        ruta_imagen: rutaImagen.trim() || 'promociones/banner-default.jpg',
        texto_alternativo: textoAlternativo.trim() || titulo,
        enlace_destino: enlaceDestino.trim() || null,
        ubicacion,
        orden,
        activa,
        vigencia_inicio: vigenciaInicio ? new Date(vigenciaInicio).toISOString() : null,
        vigencia_fin: vigenciaFin ? new Date(vigenciaFin).toISOString() : null,
      };

      if (editingPromo) {
        const { error } = await supabase
          .from('promociones')
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq('id', editingPromo.id);
        if (error) throw error;
        showToast('success', `Promoción "${titulo}" actualizada.`);
      } else {
        const { error } = await supabase.from('promociones').insert([payload]);
        if (error) throw error;
        showToast('success', `Promoción "${titulo}" creada con éxito.`);
      }

      setModalOpen(false);
      await refetch();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar promoción.';
      showToast('error', msg);
    } finally {
      setGuardando(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingPromo || !esSuperadmin) return;

    if (!isSupabaseConfigured || !supabase) {
      showToast('error', 'Supabase no está configurado. No se puede eliminar la promoción.');
      setDeletingPromo(null);
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('promociones')
        .delete()
        .eq('id', deletingPromo.id);
      if (error) throw error;

      showToast('success', `Promoción "${deletingPromo.titulo}" eliminada.`);
      setDeletingPromo(null);
      await refetch();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar promoción.';
      showToast('error', msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <PanelLayout breadcrumbs={[{ label: 'Promociones' }]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
          <div>
            <h1 className="font-display text-3xl text-[#1C1917] tracking-tight font-bold">
              Banners y Promociones
            </h1>
            <p className="text-xs md:text-sm text-[#57534E] mt-1">
              Campañas de temporada, avisos de showroom y banners destacados del Hero.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={handleOpenCreate}
          >
            + Nueva promoción
          </Button>
        </div>

        {/* Promotions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promociones.map((promo) => (
            <div
              key={promo.id}
              className="bg-white rounded-[8px] border border-[#E7E0D6] overflow-hidden shadow-xs flex flex-col justify-between"
            >
              {/* Banner visual preview */}
              <div className="relative aspect-[16/9] bg-[#FAF7F2] border-b border-[#E7E0D6] overflow-hidden">
                {promo.url_publica || promo.ruta_imagen ? (
                  <img
                    src={promo.url_publica || promo.ruta_imagen}
                    alt={promo.texto_alternativo}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[#8C7072] text-xs">
                    <ImageIcon className="w-8 h-8 mb-1" />
                    <span>Sin imagen</span>
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <Badge variant={promo.activa ? 'success' : 'neutral'} dot>
                    {promo.activa ? 'Activa' : 'Pausada'}
                  </Badge>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[10px] text-[#57534E] uppercase tracking-wider font-semibold mb-1">
                    <span>Ubicación: {promo.ubicacion || 'Hero'}</span>
                    <span>·</span>
                    <span>Orden: #{promo.orden}</span>
                  </div>
                  <h3 className="font-display text-base font-bold text-[#1C1917] mb-1">
                    {promo.titulo}
                  </h3>
                  {promo.subtitulo && (
                    <p className="text-xs text-[#57534E] mb-3 line-clamp-2">
                      {promo.subtitulo}
                    </p>
                  )}
                  {promo.enlace_destino && (
                    <div className="inline-flex items-center gap-1 text-[11px] text-[#9F1D3A] font-semibold mb-2">
                      <ExternalLink className="w-3 h-3" />
                      <span>Destino: {promo.enlace_destino}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-[#E7E0D6] flex items-center justify-between mt-3 text-xs">
                  <div className="flex items-center gap-1.5 text-[#57534E]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-[11px]">
                      {promo.vigencia_fin
                        ? `Hasta ${new Date(promo.vigencia_fin).toLocaleDateString('es-CO')}`
                        : 'Vigencia indefinida'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(promo)}
                      className="p-1.5 rounded-[4px] hover:bg-black/5 text-[#57534E] hover:text-[#9F1D3A] transition-colors"
                      title="Editar promoción"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    {esSuperadmin && (
                      <button
                        type="button"
                        onClick={() => setDeletingPromo(promo)}
                        className="p-1.5 rounded-[4px] hover:bg-[#FEE2E2] text-[#B91C1C] transition-colors"
                        title="Eliminar promoción"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Crear / Editar */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingPromo ? 'Editar Promoción' : 'Nueva Promoción'}
        subtitle="Configura avisos editoriales para la cabecera del atelier."
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Título de la campaña *"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ej. Cápsula Otoño: 20% en Hilados de Lino"
            required
          />

          <Input
            label="Subtítulo descriptivo"
            value={subtitulo}
            onChange={(e) => setSubtitulo(e.target.value)}
            placeholder="Ej. Válido exclusivamente para órdenes asistidas vía WhatsApp."
          />

          <Input
            label="URL de la imagen (o ruta en Storage)"
            value={rutaImagen}
            onChange={(e) => setRutaImagen(e.target.value)}
            placeholder="https://... o promociones/banner.jpg"
          />

          <Input
            label="Texto alternativo accesible"
            value={textoAlternativo}
            onChange={(e) => setTextoAlternativo(e.target.value)}
            placeholder="Descripción visual del banner para lectores de pantalla"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Enlace de destino"
              value={enlaceDestino}
              onChange={(e) => setEnlaceDestino(e.target.value)}
              placeholder="#coleccion"
            />
            <Input
              type="number"
              label="Orden de rotación"
              value={String(orden)}
              onChange={(e) => setOrden(parseInt(e.target.value) || 1)}
              min={1}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              label="Inicio de vigencia"
              value={vigenciaInicio}
              onChange={(e) => setVigenciaInicio(e.target.value)}
            />
            <Input
              type="date"
              label="Fin de vigencia"
              value={vigenciaFin}
              onChange={(e) => setVigenciaFin(e.target.value)}
            />
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-[#1C1917]">
              <input
                type="checkbox"
                checked={activa}
                onChange={(e) => setActiva(e.target.checked)}
                className="w-4 h-4 rounded-[3px] border-[#E7E0D6] text-[#9F1D3A] focus:ring-[#9F1D3A]"
              />
              <span className="font-semibold">Campaña activa en Hero</span>
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
              {editingPromo ? 'Guardar Cambios' : 'Publicar Promoción'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      {deletingPromo && (
        <ConfirmDialog
          isOpen={Boolean(deletingPromo)}
          onClose={() => setDeletingPromo(null)}
          onConfirm={handleDelete}
          title="Eliminar promoción"
          message={`¿Estás segura de eliminar la promoción "${deletingPromo.titulo}"? Esta acción retirará el banner inmediatamente del carrusel público.`}
          confirmText="Eliminar promoción"
          requiredConfirmationText={deletingPromo.titulo}
          isLoading={isDeleting}
        />
      )}
    </PanelLayout>
  );
};
