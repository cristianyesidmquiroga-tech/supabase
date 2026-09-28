import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Producto, SitioConfig } from '../../types';
import { formatearPrecioCOP, generarEnlaceWhatsApp } from '../../lib/format';

export interface ProductCardProps {
  producto: Producto;
  config: SitioConfig | null;
  onSelect: (producto: Producto) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ producto, config, onSelect }) => {
  const principalPhoto =
    producto.fotografias_producto?.find((f) => f.es_principal) ||
    producto.fotografias_producto?.[0];

  const imageUrl = principalPhoto?.url_publica;
  const isAgotado = producto.stock_actual <= 0;

  const precioTexto = formatearPrecioCOP(producto.precio);

  const whatsappMessage = `Hola, me interesa ${producto.nombre} a ${precioTexto}.`;
  const whatsappUrl = generarEnlaceWhatsApp(config?.whatsapp, whatsappMessage);

  return (
    <article
      onClick={() => onSelect(producto)}
      className="bg-white rounded-[12px] border border-[#E7E0D6] overflow-hidden flex flex-col group transition-all duration-200 hover:border-[#8C7072] ambient-shadow cursor-pointer select-none"
    >
      {/* Product Image Slot (3:4 aspect ratio) */}
      <div className="relative aspect-[3/4] bg-[#F4ECE8] overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={principalPhoto?.texto_alternativo || producto.nombre}
            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            width={400}
            height={533}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#FAF7F2] text-[#57534E]">
            <span className="font-display text-sm tracking-widest uppercase">VSHEIN Atelier</span>
          </div>
        )}

        {/* Status Pills / Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {isAgotado && (
            <span className="bg-[#1C1917]/90 backdrop-blur-xs text-white px-2.5 py-0.5 text-[10px] uppercase font-semibold tracking-wider rounded-[2px]">
              Agotado
            </span>
          )}
          {producto.destacado && !isAgotado && (
            <span className="bg-white/90 backdrop-blur-xs text-[#9F1D3A] px-2.5 py-0.5 text-[10px] uppercase font-semibold tracking-wider rounded-[2px] border border-[#E7E0D6]">
              Destacado
            </span>
          )}
        </div>
      </div>

      {/* Body Information */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <span className="text-[10px] font-semibold text-[#57534E] uppercase tracking-widest block mb-1">
            {producto.categorias?.nombre || 'Colección'}
          </span>
          <h3 className="font-display text-base md:text-lg font-semibold text-[#1C1917] group-hover:text-[#9F1D3A] transition-colors leading-snug line-clamp-1">
            {producto.nombre}
          </h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-base font-semibold text-[#9F1D3A] tracking-tight">
              {precioTexto}
            </span>
          </div>
        </div>

        {/* Sizes & WhatsApp CTA */}
        <div className="pt-3 border-t border-[#E7E0D6]/80 space-y-3">
          {producto.tallas && producto.tallas.length > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#57534E]">Tallas disp.:</span>
              <div className="flex gap-1 flex-wrap justify-end">
                {producto.tallas.map((talla) => (
                  <span
                    key={talla}
                    className="min-w-6 h-6 px-1.5 rounded-[2px] flex items-center justify-center text-[10px] font-semibold border border-[#E7E0D6] text-[#1C1917] bg-[#FAF7F2]"
                  >
                    {talla}
                  </span>
                ))}
              </div>
            </div>
          )}

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="w-full py-2.5 px-3 bg-[#FAF7F2] hover:bg-white border border-[#E7E0D6] hover:border-[#1C1917] rounded-[4px] text-[#1C1917] text-xs font-semibold text-center flex items-center justify-center gap-2 transition-colors select-none"
          >
            <MessageCircle className="w-3.5 h-3.5 text-[#128C7E]" aria-hidden="true" />
            <span>Consultar por WhatsApp</span>
          </a>
        </div>
      </div>
    </article>
  );
};
