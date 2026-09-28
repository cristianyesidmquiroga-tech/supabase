import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Star,
  CheckCircle2,
  ShieldAlert,
  PhoneCall,
  Lock,
  Eye,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRol } from '../../hooks/useRol';
import { useProductos } from '../../hooks/useProductos';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { Producto } from '../../types';
import { formatearPrecioCOP } from '../../lib/format';
import { PanelLayout } from '../../components/panel/PanelLayout';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Pagination } from '../../components/ui/Pagination';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorAlert } from '../../components/ui/ErrorAlert';
import { useToast } from '../../components/ui/Toast';

export const ProductosPage: React.FC = () => {
  const { rol, rolEtiqueta } = useAuth();
  const { esSuperadmin, esSupervisor, esTrabajador, puede } = useRol();
  const { showToast } = useToast();

  const { productos, categorias, loading, error, refetch } = useProductos({
    rol,
    soloActivos: esTrabajador,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState('');
  const [selectedTalla, setSelectedTalla] = useState('');
  const [selectedOrden, setSelectedOrden] = useState('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Deletion state
  const [deletingProduct, setDeletingProduct] = useState<Producto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteErrorSuggestion, setDeleteErrorSuggestion] = useState<string | null>(null);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...productos];

    if (esTrabajador) {
      result = result.filter((p) => p.activo);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.nombre.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.categorias?.nombre?.toLowerCase().includes(q)
      );
    }

    if (selectedCategoria) {
      result = result.filter((p) => p.categoria_id === selectedCategoria);
    }

    if (selectedTalla) {
      result = result.filter((p) => p.tallas?.includes(selectedTalla));
    }

    // Sort
    result.sort((a, b) => {
      if (selectedOrden === 'price_low') return (a.precio || 0) - (b.precio || 0);
      if (selectedOrden === 'price_high') return (b.precio || 0) - (a.precio || 0);
      if (selectedOrden === 'az') return a.nombre.localeCompare(b.nombre);
      // 'recent'
      return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
    });

    return result;
  }, [productos, searchQuery, selectedCategoria, selectedTalla, selectedOrden, esTrabajador]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginated = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Handle Delete (Superadmin only)
  const handleDeleteProduct = async () => {
    if (!deletingProduct || !esSuperadmin) return;

    if (!isSupabaseConfigured || !supabase) {
      showToast('error', 'Supabase no está configurado. No se puede eliminar la prenda.');
      setDeletingProduct(null);
      return;
    }

    setIsDeleting(true);
    setDeleteErrorSuggestion(null);

    try {
      const { error: delErr } = await supabase.from('productos').delete().eq('id', deletingProduct.id);

      if (delErr) {
        // If foreign key constraint failure (e.g. inventory movements)
        if (delErr.code === '23503' || delErr.message.includes('foreign key')) {
          setDeleteErrorSuggestion(
            'La prenda cuenta con registros históricos asociados. Sugerimos desactivarla en lugar de eliminarla.'
          );
          setIsDeleting(false);
          return;
        }
        throw new Error(delErr.message);
      }

      showToast('success', `La prenda ${deletingProduct.nombre} ha sido eliminada del catálogo.`);
      setDeletingProduct(null);
      await refetch();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar el producto.';
      showToast('error', msg);
      setDeletingProduct(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeactivateInstead = async () => {
    if (!deletingProduct) return;
    if (!isSupabaseConfigured || !supabase) {
      showToast('error', 'Supabase no está configurado. No se puede desactivar la prenda.');
      setDeletingProduct(null);
      return;
    }
    const { error } = await supabase.from('productos').update({ activo: false }).eq('id', deletingProduct.id);
    if (error) {
      showToast('error', error.message);
      return;
    }
    showToast('info', `La prenda ${deletingProduct.nombre} ha sido desactivada del catálogo.`);
    setDeletingProduct(null);
    await refetch();
  };

  return (
    <PanelLayout breadcrumbs={[{ label: 'Productos' }]}>
      <div className="space-y-6">
        {/* Banner Informativo específico según Rol */}
        {esTrabajador ? (
          <div className="rounded-[8px] border border-[#DFBFC0] bg-[#FAF2EE] px-4 py-3.5 flex items-start gap-3 shadow-xs">
            <Eye className="w-5 h-5 text-[#9F1D3A] shrink-0 mt-0.5" />
            <div className="flex-1 text-xs text-[#57534E] leading-relaxed">
              <strong className="font-semibold text-[#1C1917]">
                Modo actual: Rol Trabajador (Solo consulta).
              </strong>{' '}
              Tienes permisos de visualización de inventario, tallas y referencias disponibles para atención en tienda y WhatsApp. No tienes permisos para crear, modificar o eliminar registros.
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 bg-white border border-[#E7E0D6] rounded-[2px] text-[#57534E]">
              Lectura
            </span>
          </div>
        ) : (
          <div className="bg-[#FAF2EE] border border-[#E7E0D6] rounded-[8px] px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 text-[#9F1D3A]" />
              <span className="text-xs text-[#1C1917]">
                Modo actual: <strong>{rolEtiqueta}</strong>.{' '}
                {esSuperadmin
                  ? 'Control total sobre edición, cambios de precio y supresión de referencias.'
                  : 'Edición y curaduría autorizada. Supresión de referencias reservada a Superadmin.'}
              </span>
            </div>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-[2px] bg-[#F3E8EA] text-[#9F1D3A] border border-[#9F1D3A]/20 self-start sm:self-auto">
              {esSuperadmin ? 'Permiso Completo' : 'Edición Autorizada'}
            </span>
          </div>
        )}

        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-2">
          <div>
            <h1 className="font-display text-3xl text-[#1C1917] tracking-tight font-bold">
              Productos
            </h1>
            <p className="text-xs md:text-sm text-[#57534E] mt-1">
              {esTrabajador
                ? 'Consulta de catálogo, disponibilidad de referencias y tallas para asesoría de clientes.'
                : 'Gestión de catálogo, curaduría de inventario y disponibilidad editorial para pedidos WhatsApp.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* "+ Nuevo producto" button (ONLY for Superadmin & Supervisor, NEVER for Trabajador) */}
            {puede('crear_producto') && (
              <Link to="/equipo/productos/nuevo">
                <Button variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />}>
                  + Nuevo producto
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Filter Toolbar */}
        <section className="bg-white rounded-[8px] border border-[#E7E0D6] p-4 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
            {/* Search */}
            <div className="lg:col-span-4 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#57534E] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Buscar por prenda, ref o descripción..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#E7E0D6] rounded-[4px] text-xs text-[#1C1917] placeholder:text-[#57534E]/60 focus:border-[#9F1D3A] focus:ring-1 focus:ring-[#9F1D3A] outline-none"
              />
            </div>

            {/* Category Select */}
            <div className="lg:col-span-3">
              <select
                value={selectedCategoria}
                onChange={(e) => {
                  setSelectedCategoria(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-white border border-[#E7E0D6] rounded-[4px] text-xs text-[#1C1917] focus:border-[#9F1D3A] outline-none cursor-pointer"
              >
                <option value="">Todas las categorías</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Size Select */}
            <div className="lg:col-span-2">
              <select
                value={selectedTalla}
                onChange={(e) => {
                  setSelectedTalla(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-white border border-[#E7E0D6] rounded-[4px] text-xs text-[#1C1917] focus:border-[#9F1D3A] outline-none cursor-pointer"
              >
                <option value="">Todas las tallas</option>
                <option value="S">Talla S</option>
                <option value="M">Talla M</option>
                <option value="L">Talla L</option>
                <option value="XL">Talla XL</option>
                <option value="Única">Talla Única</option>
              </select>
            </div>

            {/* Sort Select */}
            <div className="lg:col-span-3">
              <select
                value={selectedOrden}
                onChange={(e) => setSelectedOrden(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E7E0D6] rounded-[4px] text-xs text-[#1C1917] focus:border-[#9F1D3A] outline-none cursor-pointer"
              >
                <option value="recent">Más recientes</option>
                <option value="price_low">Precio menor</option>
                <option value="price_high">Precio mayor</option>
                <option value="az">Nombre A-Z</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-[#E7E0D6]/60 mt-3 pt-3 text-xs text-[#57534E]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#9F1D3A]" />
              <strong>{filteredProducts.length} prendas catalogadas</strong> en colección activa
            </span>
            <span className="text-[11px] hidden sm:inline">Canal WhatsApp Concierge Sincronizado</span>
          </div>
        </section>

        {/* Products Table Card */}
        <div className="bg-white rounded-[8px] border border-[#E7E0D6] overflow-hidden shadow-xs">
          {loading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="w-full h-12" />
              <Skeleton className="w-full h-12" />
              <Skeleton className="w-full h-12" />
            </div>
          ) : error ? (
            <div className="p-6">
              <ErrorAlert message={error} onRetry={refetch} />
            </div>
          ) : paginated.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="No hay prendas disponibles"
                description="No se encontraron registros con los filtros actuales."
                actionText="Limpiar filtros"
                onAction={() => {
                  setSearchQuery('');
                  setSelectedCategoria('');
                  setSelectedTalla('');
                }}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#E7E0D6] bg-[#FAF7F2]/60 text-[#57534E] uppercase tracking-wider font-semibold">
                    <th className="py-3.5 pl-6 pr-3 w-16 text-center" scope="col">Miniatura</th>
                    <th className="py-3.5 px-4" scope="col">Prenda / Referencia</th>
                    <th className="py-3.5 px-4" scope="col">Categoría</th>
                    <th className="py-3.5 px-4" scope="col">Precio</th>
                    <th className="py-3.5 px-4" scope="col">Tallas</th>
                    <th className="py-3.5 px-4" scope="col">Estado</th>

                    {/* Columns ONLY for Superadmin & Supervisor: Destacado and Acciones */}
                    {!esTrabajador && (
                      <>
                        <th className="py-3.5 px-3 text-center" scope="col">Destacado</th>
                        <th className="py-3.5 pl-4 pr-6 text-right" scope="col">Acciones</th>
                      </>
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#E7E0D6] text-[#1C1917]">
                  {paginated.map((prod) => {
                    const foto = prod.fotografias_producto?.[0]?.url_publica;
                    const precioTxt = formatearPrecioCOP(prod.precio);

                    return (
                      <tr key={prod.id} className="hover:bg-[#FAF7F2]/40 transition-colors">
                        {/* Miniatura */}
                        <td className="py-3 pl-6 pr-3 text-center">
                          <div className="w-11 h-14 rounded-[2px] overflow-hidden bg-[#FAF7F2] border border-[#E7E0D6] mx-auto shrink-0 shadow-xs">
                            {foto ? (
                              <img src={foto} alt={prod.nombre} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-[#FAF7F2] flex items-center justify-center text-[#8C7072] text-[9px]">
                                VS
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Prenda / Referencia */}
                        <td className="py-3 px-4">
                          <p className="font-semibold text-xs text-[#1C1917] leading-snug">{prod.nombre}</p>
                          <p className="text-[10px] text-[#57534E] font-mono mt-0.5">
                            REF: {prod.id.slice(0, 8).toUpperCase()}
                          </p>
                        </td>

                        {/* Categoría */}
                        <td className="py-3 px-4 text-[#57534E]">
                          {prod.categorias?.nombre || 'General'}
                        </td>

                        {/* Precio */}
                        <td className="py-3 px-4 font-semibold text-[#9F1D3A] tracking-tight">
                          {precioTxt}
                        </td>

                        {/* Tallas */}
                        <td className="py-3 px-4">
                          <div className="flex gap-1 flex-wrap">
                            {prod.tallas?.map((t) => (
                              <span
                                key={t}
                                className="px-1.5 py-0.5 text-[10px] font-semibold bg-[#FAF7F2] rounded-[2px] border border-[#E7E0D6] text-[#1C1917]"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Estado */}
                        <td className="py-3 px-4">
                          <Badge variant={prod.activo ? 'success' : 'neutral'} dot>
                            {prod.activo ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </td>

                        {/* Non-worker columns: Destacado & Acciones */}
                        {!esTrabajador && (
                          <>
                            {/* Destacado */}
                            <td className="py-3 px-3 text-center">
                              {prod.destacado ? (
                                <Star className="w-4 h-4 text-[#9F1D3A] fill-[#9F1D3A] mx-auto" />
                              ) : (
                                <Star className="w-4 h-4 text-[#E7E0D6] mx-auto" />
                              )}
                            </td>

                            {/* Acciones */}
                            <td className="py-3 pl-4 pr-6 text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-1 justify-end">
                                <Link
                                  to={`/equipo/productos/${prod.id}`}
                                  className="p-1.5 rounded-[4px] hover:bg-black/5 text-[#57534E] hover:text-[#9F1D3A] transition-colors"
                                  title="Editar prenda"
                                >
                                  <Edit className="w-4 h-4" />
                                </Link>

                                {/* Delete button: STRICTLY for Superadmin, NEVER for Supervisor */}
                                {esSuperadmin && (
                                  <button
                                    type="button"
                                    onClick={() => setDeletingProduct(prod)}
                                    className="p-1.5 rounded-[4px] hover:bg-[#FEE2E2] text-[#B91C1C] transition-colors"
                                    title="Eliminar producto"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="p-4 border-t border-[#E7E0D6] bg-white">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredProducts.length}
              itemsPerPage={itemsPerPage}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        </div>

        {/* Quick Guide Cards for Worker Mode (Google Stitch Image 11) */}
        {esTrabajador && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-white rounded-[8px] border border-[#E7E0D6] flex items-start gap-3 shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-[#166534] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-[#1C1917]">Consulta Inmediata</h4>
                <p className="text-[11px] text-[#57534E] mt-0.5 leading-relaxed">
                  Utiliza la referencia REF para responder ágilmente a consultas de clientes en showroom o WhatsApp.
                </p>
              </div>
            </div>

            <div className="p-4 bg-white rounded-[8px] border border-[#E7E0D6] flex items-start gap-3 shadow-xs">
              <PhoneCall className="w-5 h-5 text-[#9F1D3A] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-[#1C1917]">Soporte WhatsApp</h4>
                <p className="text-[11px] text-[#57534E] mt-0.5 leading-relaxed">
                  Confirma disponibilidad de tallas activas antes de confirmar envíos de pedidos por chat.
                </p>
              </div>
            </div>

            <div className="p-4 bg-white rounded-[8px] border border-[#E7E0D6] flex items-start gap-3 shadow-xs">
              <Lock className="w-5 h-5 text-[#57534E] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-[#1C1917]">Modificaciones</h4>
                <p className="text-[11px] text-[#57534E] mt-0.5 leading-relaxed">
                  Para ajustes de precio o catálogo de prendas, solicita el cambio al Administrador o Supervisor.
                </p>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Confirmation Dialog for Product Deletion */}
      {deletingProduct && (
        <ConfirmDialog
          isOpen={Boolean(deletingProduct)}
          onClose={() => {
            setDeletingProduct(null);
            setDeleteErrorSuggestion(null);
          }}
          onConfirm={handleDeleteProduct}
          title="Confirmar eliminación irreversible"
          message={`Esta acción eliminará "${deletingProduct.nombre}" del catálogo público, descatalogará sus fotos y cancelará el vínculo directo con WhatsApp.`}
          confirmText="Eliminar prenda"
          requiredConfirmationText={deletingProduct.nombre}
          isLoading={isDeleting}
          suggestionText={deleteErrorSuggestion || undefined}
          onSuggestionAction={handleDeactivateInstead}
          suggestionActionLabel="Desactivar prenda"
        />
      )}
    </PanelLayout>
  );
};
