import React from 'react';
import { Producto, ProductoMasVendido, SitioConfig } from '../../types';
import { ProductCard } from './ProductCard';

export interface MasVendidosProps {
  productos: Producto[];
  masVendidos: ProductoMasVendido[];
  config: SitioConfig | null;
  onSelectProducto: (producto: Producto) => void;
}

export const MasVendidos: React.FC<MasVendidosProps> = ({
  productos,
  masVendidos,
  config,
  onSelectProducto,
}) => {
  if (!masVendidos || masVendidos.length === 0) return null;

  // Filter products that match the most sold view IDs with units sold > 0
  const productosFiltrados = masVendidos
    .filter((mv) => mv.unidades_vendidas > 0)
    .map((mv) => productos.find((p) => p.id === mv.id || p.slug === mv.slug))
    .filter((p): p is Producto => Boolean(p && p.activo))
    .slice(0, 4);

  if (productosFiltrados.length === 0) return null;

  return (
    <section aria-labelledby="mas-vendidos-title" className="py-12 md:py-16 bg-[#F4ECE8]/50 border-b border-[#E7E0D6]">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-[#E7E0D6] gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="w-5 h-[1px] bg-[#9F1D3A]" aria-hidden="true" />
              <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#57534E]">
                Preferencias de Clientes
              </span>
            </div>
            <h2 id="mas-vendidos-title" className="font-display text-2xl md:text-3xl text-[#1C1917] font-bold">
              Piezas Más Solicitadas
            </h2>
          </div>
          <p className="text-xs md:text-sm text-[#57534E] max-w-sm font-normal">
            Las creaciones con mayor recurrencia y aclamación en nuestro atelier.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {productosFiltrados.map((prod, idx) => (
            <ProductCard
              key={prod.id}
              producto={prod}
              config={config}
              onSelect={onSelectProducto}
              index={idx}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
