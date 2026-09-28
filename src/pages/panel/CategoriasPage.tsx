import React, { useState } from 'react';
import {
  FolderTree,
  Plus,
  Edit,
  Trash2,
  FolderOpen,
  CheckCircle2,
  ShieldAlert,
  ArrowUpDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRol } from '../../hooks/useRol';
import { useProductos } from '../../hooks/useProductos';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { Categoria } from '../../types';
import { PanelLayout } from '../../components/panel/PanelLayout';
import { SinPermiso } from '../../components/panel/SinPermiso';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';

export const CategoriasPage: React.FC = () => {
  const { rol } = useAuth();
  const { esSuperadmin, esTrabajador, puede } = useRol();
  const { categorias, productos, refetch } = useProductos({ soloActivos: false });
  const { showToast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);

  // Form states
  const [nombre, setNombre] = useState('');
  const [slug, setSlug] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [orden, setOrden] = useState(1);
  const [activa, setActiva] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Delete modal state
  const [deletingCategoria, setDeletingCategoria] = useState<Categoria | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Workers cannot view or manage categories
  if (esTrabajador || !puede('gestionar_categorias')) {
    return (
      <PanelLayout breadcrumbs={[{ label: 'Categorías' }]}>
        <SinPermiso accion="gestionar las categorías del atelier" />
      </PanelLayout>
    );
  }

  const handleOpenCreate = () => {
    setEditingCategoria(null);
    setNombre('');
    setSlug('');
    setDescripcion('');
    setOrden(categorias.length + 1);
    setActiva(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (cat: Categoria) => {
    setEditingCategoria(cat);
    setNombre(cat.nombre);
    setSlug(cat.slug);
    setDescripcion(cat.descripcion || '');
    setOrden(cat.orden);
    setActiva(cat.activa);
    setModalOpen(true);
  };

  const handleNombreChange = (val: string) => {
    setNombre(val);
    if (!editingCategoria) {
      // Auto generate slug
      const generatedSlug = val
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generatedSlug);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !slug.trim()) {
      showToast('error', 'El nombre y slug de la categoría son obligatorios.');
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      showToast('error', 'Supabase no está configurado. No se puede guardar la categoría.');
      return;
    }

    setGuardando(true);
    try {
      if (editingCategoria) {
        const { error } = await supabase
          .from('categorias')
          .update({
            nombre,
            slug,
            descripcion: descripcion.trim() || null,
            orden,
            activa,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingCategoria.id);

        if (error) throw error;
        showToast('success', `Categoría "${nombre}" actualizada con éxito.`);
      } else {
        const { error } = await supabase.from('categorias').insert([
          {
            nombre,
            slug,
            descripcion: descripcion.trim() || null,
            orden,
            activa,
          },
        ]);

        if (error) throw error;
        showToast('success', `Categoría "${nombre}" creada con éxito.`);
      }

      setModalOpen(false);
      await refetch();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar categoría.';
      showToast('error', msg);
    } finally {
      setGuardando(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCategoria || !esSuperadmin) return;

    // Check if category has products
    const productosEnCategoria = productos.filter((p) => p.categoria_id === deletingCategoria.id);
    if (productosEnCategoria.length > 0) {
      showToast(
        'error',
        `No es posible eliminar "${deletingCategoria.nombre}" porque contiene ${productosEnCategoria.length} prendas asociadas. Reubícalas o desactiva la categoría.`
      );
      setDeletingCategoria(null);
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      showToast('error', 'Supabase no está configurado. No se puede eliminar la categoría.');
      setDeletingCategoria(null);
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('id', deletingCategoria.id);

      if (error) throw error;

      showToast('success', `Categoría "${deletingCategoria.nombre}" eliminada correctamente.`);
      setDeletingCategoria(null);
      await refetch();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar categoría.';
      showToast('error', msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <PanelLayout breadcrumbs={[{ label: 'Categorías' }]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
          <div>
            <h1 className="font-display text-3xl text-[#1C1917] tracking-tight font-bold">
              Categorías
            </h1>
            <p className="text-xs md:text-sm text-[#57534E] mt-1">
              Curaduría y taxonomía del catálogo editorial de VSHEIN Atelier.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={handleOpenCreate}
          >
            + Nueva categoría
          </Button>
        </div>

        {/* Categories Table Card */}
        <div className="bg-white rounded-[8px] border border-[#E7E0D6] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E7E0D6] bg-[#FAF7F2]/60 text-[#57534E] uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-6" scope="col">Orden</th>
                  <th className="py-3.5 px-4" scope="col">Nombre</th>
                  <th className="py-3.5 px-4" scope="col">Slug Identificador</th>
                  <th className="py-3.5 px-4" scope="col">Prendas Vinculadas</th>
                  <th className="py-3.5 px-4" scope="col">Estado</th>
                  <th className="py-3.5 pl-4 pr-6 text-right" scope="col">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#E7E0D6] text-[#1C1917]">
                {categorias.map((cat) => {
                  const conteo = productos.filter((p) => p.categoria_id === cat.id).length;

                  return (
                    <tr key={cat.id} className="hover:bg-[#FAF7F2]/40 transition-colors">
                      <td className="py-3.5 px-6 font-mono font-semibold text-[#57534E]">
                        #{cat.orden}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-[#1C1917]">{cat.nombre}</p>
                        {cat.descripcion && (
                          <p className="text-[11px] text-[#57534E] mt-0.5 line-clamp-1">
                            {cat.descripcion}
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#8C7072]">
                        /{cat.slug}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#FAF7F2] border border-[#E7E0D6] rounded-[2px] font-semibold text-[#1C1917]">
                          <FolderOpen className="w-3.5 h-3.5 text-[#9F1D3A]" />
                          <span>{conteo} prendas</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={cat.activa ? 'success' : 'neutral'} dot>
                          {cat.activa ? 'Activa' : 'Oculta'}
                        </Badge>
                      </td>
                      <td className="py-3.5 pl-4 pr-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1 justify-end">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(cat)}
                            className="p-1.5 rounded-[4px] hover:bg-black/5 text-[#57534E] hover:text-[#9F1D3A] transition-colors"
                            title="Editar categoría"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {esSuperadmin && (
                            <button
                              type="button"
                              onClick={() => setDeletingCategoria(cat)}
                              className="p-1.5 rounded-[4px] hover:bg-[#FEE2E2] text-[#B91C1C] transition-colors"
                              title="Eliminar categoría"
                            >
                              <Trash2 className="w-4 h-4" />
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
      </div>

      {/* Modal Crear / Editar Categoría */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategoria ? 'Editar Categoría' : 'Nueva Categoría'}
        subtitle="Organiza las familias de prendas de la colección contemporánea."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Nombre de la categoría *"
            value={nombre}
            onChange={(e) => handleNombreChange(e.target.value)}
            placeholder="Ej. Sastrería & Blazers"
            required
          />

          <Input
            label="Slug (Ruta web) *"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="sastreria-blazers"
            required
            helperText="Identificador único utilizado en la dirección web."
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917]">
              Descripción editorial (Opcional)
            </label>
            <textarea
              rows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción breve de la colección o siluetas que agrupa..."
              className="w-full bg-white text-[#1C1917] placeholder:text-[#8C7072]/60 border border-[#E7E0D6] rounded-[4px] p-3 text-xs focus:border-[#9F1D3A] focus:ring-1 focus:ring-[#9F1D3A] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              label="Orden numérico"
              value={String(orden)}
              onChange={(e) => setOrden(parseInt(e.target.value) || 1)}
              min={1}
            />

            <div className="flex flex-col justify-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-[#1C1917]">
                <input
                  type="checkbox"
                  checked={activa}
                  onChange={(e) => setActiva(e.target.checked)}
                  className="w-4 h-4 rounded-[3px] border-[#E7E0D6] text-[#9F1D3A] focus:ring-[#9F1D3A]"
                />
                <span className="font-semibold">Categoría visible</span>
              </label>
            </div>
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
              {editingCategoria ? 'Guardar Cambios' : 'Crear Categoría'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      {deletingCategoria && (
        <ConfirmDialog
          isOpen={Boolean(deletingCategoria)}
          onClose={() => setDeletingCategoria(null)}
          onConfirm={handleDelete}
          title="Eliminar categoría"
          message={`¿Estás segura de eliminar la categoría "${deletingCategoria.nombre}"? Esta acción solo se permite si no hay prendas asignadas a ella.`}
          confirmText="Eliminar permanentemente"
          requiredConfirmationText={deletingCategoria.nombre}
          isLoading={isDeleting}
        />
      )}
    </PanelLayout>
  );
};
