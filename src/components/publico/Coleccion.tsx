import React, { useState, useMemo, useEffect } from 'react';
import { Search, ChevronDown, Sparkles } from 'lucide-react';
import { Producto, Categoria, SitioConfig } from '../../types';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from '../ui/Skeleton';
import { EmptyState } from '../ui/EmptyState';
import { ErrorAlert } from '../ui/ErrorAlert';

export interface ColeccionProps {
  productos: Producto[];
  categorias: Categoria[];
  config: SitioConfig | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onSelectProducto: (producto: Producto) => void;
}

export const Coleccion: React.FC<ColeccionProps> = ({
  productos,
  categorias,
  config,
  loading,
  error,
  onRetry,
  onSelectProducto,
}) => {
  // Read initial query params from hash
  const getInitialParams = () => {
    try {
      const hash = window.location.hash;
      const queryIndex = hash.indexOf('?');
      if (queryIndex !== -1) {
        const params = new URLSearchParams(hash.slice(queryIndex));
        return {
          cat: params.get('cat') || 'todas',
          q: params.get('q') || '',
          talla: params.get('talla') || '',
          orden: params.get('orden') || 'recientes',
        };
      }
    } catch {
      // Ignore
    }
    return { cat: 'todas', q: '', talla: '', orden: 'recientes' };
  };

  const initial = getInitialParams();
  const [selectedCategoria, setSelectedCategoria] = useState<string>(initial.cat);
  const [searchQuery, setSearchQuery] = useState<string>(initial.q);
  const [selectedTalla, setSelectedTalla] = useState<string>(initial.talla);
  const [selectedOrden, setSelectedOrden] = useState<string>(initial.orden);
  const [visibleCount, setVisibleCount] = useState<number>(12);

  // Sync state to URL hash query params without page reload
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategoria && selectedCategoria !== 'todas') params.set('cat', selectedCategoria);
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (selectedTalla) params.set('talla', selectedTalla);
    if (selectedOrden && selectedOrden !== 'recientes') params.set('orden', selectedOrden);

    const queryString = params.toString();
    const baseHash = window.location.hash.split('?')[0] || '#/';
    const newHash = queryString ? `${baseHash}?${queryString}` : baseHash;

    if (window.location.hash !== newHash) {
      window.history.replaceState(null, '', newHash);
    }
  }, [selectedCategoria, searchQuery, selectedTalla, selectedOrden]);

  // Extract all available unique sizes
  const tallasDisponibles = useMemo(() => {
    const set = new Set<string>();
    productos.forEach((p) => {
      p.tallas?.forEach((t) => set.add(t));
    });
    return Array.from(set).sort();
  }, [productos]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = productos.filter((p) => p.activo);

    // Filter by Category
    if (selectedCategoria && selectedCategoria !== 'todas') {
      result = result.filter(
        (p) =>
          p.categoria_id === selectedCategoria ||
          p.categorias?.slug === selectedCategoria ||
          p.categorias?.nombre === selectedCategoria
      );
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.nombre.toLowerCase().includes(q) ||
          p.descripcion?.toLowerCase().includes(q) ||
          p.categorias?.nombre.toLowerCase().includes(q)
      );
    }

    // Filter by Size
    if (selectedTalla) {
      result = result.filter((p) => p.tallas?.includes(selectedTalla));
    }

    // Sort
    result.sort((a, b) => {
      if (selectedOrden === 'precio_menor') {
        return (a.precio || 0) - (b.precio || 0);
      }
      if (selectedOrden === 'precio_mayor') {
        return (b.precio || 0) - (a.precio || 0);
      }
      // 'recientes' default
      return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
    });

    return result;
  }, [productos, selectedCategoria, searchQuery, selectedTalla, selectedOrden]);

  // Featured products subset
  const destacados = useMemo(() => {
    return productos.filter((p) => p.activo && p.destacado);
  }, [productos]);

  const clearFilters = () => {
    setSelectedCategoria('todas');
    setSearchQuery('');
    setSelectedTalla('');
    setSelectedOrden('recientes');
  };

  const paginatedProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  return (
    <section id="coleccion" aria-labelledby="coleccion-heading" className="py-20 md:py-24 bg-[#FAF7F2]">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        {/* Header & Curator info */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b border-[#E7E0D6] gap-6">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="w-5 h-[1px] bg-[#9F1D3A]" aria-hidden="true" />
              <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#57534E]">
                Catálogo Disponible
              </span>
            </div>
            <h2 id="coleccion-heading" className="font-display text-3xl md:text-4xl text-[#1C1917] font-bold">
              Colección Seleccionada
            </h2>
          </div>
          <p className="text-sm text-[#57534E] max-w-md font-normal leading-relaxed">
            Explora las prendas disponibles y consulta directamente por WhatsApp.
          </p>
        </div>

        {/* Featured Section (only if destacados exist) */}
        {destacados.length > 0 && selectedCategoria === 'todas' && !searchQuery && !selectedTalla && (
          <div className="mb-14 pb-12 border-b border-[#E7E0D6]">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-4 h-4 text-[#9F1D3A]" />
              <h3 className="font-display text-xl text-[#1C1917] font-semibold">Selección de Atelier (Destacados)</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {destacados.slice(0, 4).map((prod, idx) => (
                <ProductCard key={`dest-${prod.id}`} producto={prod} config={config} onSelect={onSelectProducto} index={idx} />
              ))}
            </div>
          </div>
        )}

        {/* Filter & Search Toolbar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 mb-12 p-4 bg-white rounded-[8px] border border-[#E7E0D6] shadow-xs">
          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none" role="tablist" aria-label="Categorías">
            <button
              type="button"
              role="tab"
              aria-selected={selectedCategoria === 'todas'}
              onClick={() => setSelectedCategoria('todas')}
              className={`px-4 py-2 rounded-[4px] text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-colors ${
                selectedCategoria === 'todas'
                  ? 'bg-[#1C1917] text-white shadow-xs'
                  : 'bg-[#FAF7F2] hover:bg-white text-[#1C1917] border border-[#E7E0D6]'
              }`}
            >
              Todas
            </button>

            {categorias
              .filter((c) => c.activa)
              .map((cat) => {
                const isSelected = selectedCategoria === cat.id || selectedCategoria === cat.slug;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => setSelectedCategoria(cat.id)}
                    className={`px-4 py-2 rounded-[4px] text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-colors ${
                      isSelected
                        ? 'bg-[#1C1917] text-white shadow-xs'
                        : 'bg-[#FAF7F2] hover:bg-white text-[#1C1917] border border-[#E7E0D6]'
                    }`}
                  >
                    {cat.nombre}
                  </button>
                );
              })}
          </div>

          {/* Controls: Search + Selectors */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-60 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#57534E] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar prenda..."
                className="w-full bg-[#FAF7F2] pl-9 pr-3 py-2 text-xs text-[#1C1917] rounded-[4px] border border-[#E7E0D6] focus:outline-none focus:border-[#9F1D3A] focus:ring-1 focus:ring-[#9F1D3A] transition-all"
              />
            </div>

            {/* Size Selector */}
            <div className="relative">
              <select
                value={selectedTalla}
                onChange={(e) => setSelectedTalla(e.target.value)}
                aria-label="Filtrar por talla"
                className="appearance-none bg-[#FAF7F2] pl-3 pr-8 py-2 text-xs text-[#1C1917] rounded-[4px] border border-[#E7E0D6] focus:outline-none focus:border-[#9F1D3A] cursor-pointer"
              >
                <option value="">Tallas (Todas)</option>
                {tallasDisponibles.map((t) => (
                  <option key={t} value={t}>
                    Talla {t}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#57534E]" />
            </div>

            {/* Order Selector */}
            <div className="relative">
              <select
                value={selectedOrden}
                onChange={(e) => setSelectedOrden(e.target.value)}
                aria-label="Ordenar productos"
                className="appearance-none bg-[#FAF7F2] pl-3 pr-8 py-2 text-xs text-[#1C1917] rounded-[4px] border border-[#E7E0D6] focus:outline-none focus:border-[#9F1D3A] cursor-pointer"
              >
                <option value="recientes">Más recientes</option>
                <option value="precio_menor">Precio menor</option>
                <option value="precio_mayor">Precio mayor</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#57534E]" />
            </div>
          </div>
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, idx) => (
              <ProductCardSkeleton key={idx} />
            ))}
          </div>
        )}

        {/* Error Alert */}
        {error && !loading && (
          <ErrorAlert
            title="No pudimos cargar la colección"
            message={error}
            onRetry={onRetry}
            className="my-8"
          />
        )}

        {/* Empty State */}
        {!loading && !error && filteredProducts.length === 0 && (
          <EmptyState
            title="No se encontraron prendas"
            description="No hay piezas en la colección que coincidan con los criterios seleccionados."
            actionText="Limpiar filtros"
            onAction={clearFilters}
            className="my-12"
          />
        )}

        {/* Product Grid */}
        {!loading && !error && paginatedProducts.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {paginatedProducts.map((prod, idx) => (
                <ProductCard
                  key={prod.id}
                  producto={prod}
                  config={config}
                  onSelect={onSelectProducto}
                  index={idx}
                />
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="mt-14 text-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + 12)}
                  className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-white hover:bg-[#FAF7F2] border border-[#E7E0D6] text-[#1C1917] text-xs font-semibold tracking-wider uppercase rounded-[4px] transition-colors shadow-xs"
                >
                  <span>Cargar más</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};
