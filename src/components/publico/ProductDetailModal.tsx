import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, MessageCircle, Ruler, Info, ChevronDown } from 'lucide-react';
import { Producto, SitioConfig } from '../../types';
import { formatearPrecioCOP, generarEnlaceWhatsApp } from '../../lib/format';

export interface ProductDetailModalProps {
  producto: Producto | null;
  config: SitioConfig | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  producto,
  config,
  onClose,
}) => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  useEffect(() => {
    if (producto) {
      setSelectedPhotoIndex(0);
      setSelectedSize(producto.tallas?.[0] || null);
    }
  }, [producto]);

  // Keyboard navigation for image gallery & Escape
  useEffect(() => {
    if (!producto) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        const total = producto.fotografias_producto?.length || 1;
        setSelectedPhotoIndex((prev) => (prev - 1 + total) % total);
      } else if (e.key === 'ArrowRight') {
        const total = producto.fotografias_producto?.length || 1;
        setSelectedPhotoIndex((prev) => (prev + 1) % total);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [producto, onClose]);

  if (!producto) return null;

  const photos = producto.fotografias_producto && producto.fotografias_producto.length > 0
    ? producto.fotografias_producto
    : [
        {
          id: 'placeholder',
          producto_id: producto.id,
          ruta_base: '',
          texto_alternativo: producto.nombre,
          es_principal: true,
          orden: 1,
          url_publica: undefined,
        },
      ];

  const currentPhoto = photos[selectedPhotoIndex] || photos[0];
  const precioTexto = formatearPrecioCOP(producto.precio);

  const whatsappMessage = selectedSize
    ? `Hola, me interesa ${producto.nombre} (Talla: ${selectedSize}) a ${precioTexto}.`
    : `Hola, me interesa ${producto.nombre} a ${precioTexto}.`;

  const whatsappUrl = generarEnlaceWhatsApp(config?.whatsapp, whatsappMessage);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modalProductTitle"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 md:p-10 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-[960px] bg-white rounded-[12px] border border-[#E7E0D6] modal-shadow overflow-hidden transition-all duration-200 animate-in zoom-in-95 max-h-[92vh] flex flex-col md:block">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar modal de detalle"
          className="absolute top-5 right-5 z-20 w-9 h-9 rounded-[4px] bg-white/90 backdrop-blur-xs border border-[#E7E0D6] flex items-center justify-center text-[#1C1917] hover:text-[#9F1D3A] hover:border-[#9F1D3A] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9F1D3A]"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 overflow-y-auto max-h-[92vh]">
          {/* Column 1: Gallery */}
          <div className="p-6 sm:p-8 bg-[#FAF7F2]/40 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#E7E0D6]">
            {/* Main Image */}
            <div className="relative w-full aspect-[3/4] rounded-[8px] overflow-hidden border border-[#E7E0D6] bg-[#F4ECE8] group">
              {currentPhoto?.url_publica ? (
                <img
                  src={currentPhoto.url_publica}
                  alt={currentPhoto.texto_alternativo || producto.nombre}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  width={600}
                  height={800}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#57534E]">
                  <span className="font-display text-base tracking-widest uppercase">VSHEIN Atelier</span>
                </div>
              )}

              {/* Prev / Next Arrows */}
              {photos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length)
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-[4px] bg-white/90 backdrop-blur-xs border border-[#E7E0D6] text-[#1C1917] flex items-center justify-center hover:text-[#9F1D3A] transition-colors ambient-shadow cursor-pointer"
                    aria-label="Imagen anterior"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPhotoIndex((prev) => (prev + 1) % photos.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-[4px] bg-white/90 backdrop-blur-xs border border-[#E7E0D6] text-[#1C1917] flex items-center justify-center hover:text-[#9F1D3A] transition-colors ambient-shadow cursor-pointer"
                    aria-label="Imagen siguiente"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Limited badge */}
              <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-[4px] border border-[#E7E0D6]">
                <span className="text-[10px] tracking-widest uppercase text-[#57534E] font-semibold">
                  Taller Exclusivo
                </span>
              </div>
            </div>

            {/* Strip of thumbnails */}
            {photos.length > 1 && (
              <div className="grid grid-cols-4 gap-2.5 mt-4">
                {photos.slice(0, 4).map((photo, idx) => (
                  <button
                    key={photo.id || idx}
                    type="button"
                    onClick={() => setSelectedPhotoIndex(idx)}
                    className={`relative aspect-[3/4] rounded-[4px] overflow-hidden border transition-all ${
                      selectedPhotoIndex === idx
                        ? 'border-2 border-[#9F1D3A] ring-1 ring-[#9F1D3A]/20'
                        : 'border-[#E7E0D6] hover:border-[#57534E]'
                    }`}
                  >
                    {photo.url_publica ? (
                      <img
                        src={photo.url_publica}
                        alt={photo.texto_alternativo || `Miniatura ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#FAF7F2]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Column 2: Details */}
          <div className="p-8 md:p-10 flex flex-col justify-between space-y-6">
            <div>
              {/* Category & Reference */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase tracking-wider text-[#57534E] font-medium">
                  {producto.categorias?.nombre || 'Colección'}
                </span>
                <span className="text-[11px] font-mono text-[#57534E]">
                  Ref. {producto.id.slice(0, 8).toUpperCase()}
                </span>
              </div>

              {/* Title */}
              <h1
                id="modalProductTitle"
                className="font-display text-2xl md:text-3xl text-[#1C1917] tracking-tight leading-tight"
              >
                {producto.nombre}
              </h1>

              {/* Price */}
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-2xl font-semibold text-[#9F1D3A] tracking-tight">
                  {precioTexto}
                </span>
              </div>

              {/* Hairline Divider */}
              <div className="w-full h-[1px] bg-[#E7E0D6] my-5" />

              {/* Description */}
              {producto.descripcion && (
                <p className="text-sm text-[#57534E] leading-relaxed font-normal">
                  {producto.descripcion}
                </p>
              )}

              {/* Size Selector */}
              {producto.tallas && producto.tallas.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs uppercase tracking-wider text-[#1C1917] font-semibold">
                      Seleccionar Talla
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowSizeGuide(!showSizeGuide)}
                      className="inline-flex items-center gap-1.5 text-xs text-[#57534E] hover:text-[#9F1D3A] transition-colors"
                    >
                      <Ruler className="w-3.5 h-3.5 text-[#57534E]" aria-hidden="true" />
                      <span className="underline underline-offset-4 decoration-[#E7E0D6]">
                        Guía de tallas
                      </span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap" role="radiogroup" aria-label="Tallas disponibles">
                    {producto.tallas.map((talla) => {
                      const isSelected = selectedSize === talla;
                      return (
                        <button
                          key={talla}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => setSelectedSize(talla)}
                          className={`min-w-12 h-10 px-3 rounded-[4px] text-xs font-semibold flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-[#1C1917] text-white border border-[#1C1917] shadow-xs'
                              : 'bg-white border border-[#E7E0D6] text-[#1C1917] hover:border-[#1C1917]'
                          }`}
                        >
                          {talla}
                        </button>
                      );
                    })}
                  </div>

                  {showSizeGuide && (
                    <div className="mt-3 p-3 bg-[#FAF7F2] border border-[#E7E0D6] rounded-[6px] text-xs text-[#57534E] animate-in fade-in">
                      <p className="font-semibold text-[#1C1917] mb-1">Guía de Tallas Atelier:</p>
                      <p>S: Busto 86-90 cm · Cintura 66-70 cm · Cadera 92-96 cm</p>
                      <p>M: Busto 90-94 cm · Cintura 70-74 cm · Cadera 96-100 cm</p>
                      <p>L: Busto 94-98 cm · Cintura 74-78 cm · Cadera 100-104 cm</p>
                    </div>
                  )}
                </div>
              )}

              {/* Main CTA: Pedir por WhatsApp */}
              <div className="mt-8 space-y-2.5">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-12 bg-[#128C7E] hover:bg-[#0E7064] text-white rounded-[4px] flex items-center justify-center gap-2.5 text-sm font-semibold tracking-wide shadow-sm transition-all active:scale-[0.99] select-none"
                >
                  <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Pedir por WhatsApp</span>
                </a>

                <div className="flex items-center justify-center gap-1.5 text-xs text-[#57534E]">
                  <Info className="w-3.5 h-3.5 text-[#57534E]" aria-hidden="true" />
                  <span>La disponibilidad se confirma directamente por WhatsApp</span>
                </div>
              </div>
            </div>

            {/* Accordions: Composition and Shipping */}
            <div className="pt-4 border-t border-[#E7E0D6] space-y-2">
              <details className="group cursor-pointer">
                <summary className="flex justify-between items-center py-2 text-xs uppercase tracking-wider text-[#1C1917] hover:text-[#9F1D3A] list-none transition-colors">
                  <span>Composición y Cuidados</span>
                  <ChevronDown className="w-4 h-4 text-[#57534E] group-open:rotate-180 transition-transform" />
                </summary>
                <div className="pb-3 pt-1 text-xs text-[#57534E] leading-relaxed">
                  Fibras seleccionadas en talleres éticos. Limpieza especializada en seco. Planchado a vapor a temperatura baja sobre paño protector.
                </div>
              </details>

              <details className="group cursor-pointer border-t border-[#E7E0D6]/60">
                <summary className="flex justify-between items-center py-2 text-xs uppercase tracking-wider text-[#1C1917] hover:text-[#9F1D3A] list-none transition-colors">
                  <span>Envíos y Atelier</span>
                  <ChevronDown className="w-4 h-4 text-[#57534E] group-open:rotate-180 transition-transform" />
                </summary>
                <div className="pb-3 pt-1 text-xs text-[#57534E] leading-relaxed">
                  Confección bajo demanda limitada. Entrega personalizada en packaging rígido con funda de algodón orgánico. Envíos nacionales coordinados vía Concierge.
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
