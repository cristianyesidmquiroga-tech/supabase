import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { SitioConfig, Promocion } from '../../types';
import { generarEnlaceWhatsApp } from '../../lib/format';
import { useScrollReveal } from '../../hooks/useScrollReveal';

export interface HeroProps {
  config: SitioConfig | null;
  promociones?: Promocion[];
}

export const Hero: React.FC<HeroProps> = ({ config, promociones = [] }) => {
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const { ref: textoRef, visible: textoVisible } = useScrollReveal<HTMLDivElement>(0.1);
  const { ref: fotoRef, visible: fotoVisible } = useScrollReveal<HTMLDivElement>(0.1);

  const activePromos = promociones.filter((p) => p.activa && (p.url_publica || p.ruta_imagen));

  // Accessible auto-advance (only if promos exist, not paused, reduced motion not preferred)
  useEffect(() => {
    if (activePromos.length <= 1 || isPaused) return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;

    const interval = setInterval(() => {
      setCurrentPromoIndex((prev) => (prev + 1) % activePromos.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [activePromos.length, isPaused]);

  const whatsappUrl = generarEnlaceWhatsApp(
    config?.whatsapp,
    config?.mensaje_whatsapp || 'Hola VSHEIN, deseo consultar sobre la nueva colección.'
  );

  const currentPromo = activePromos[currentPromoIndex];
  const heroImageUrl = currentPromo?.url_publica || config?.hero_imagen_url || null;

  const prevSlide = () => {
    setCurrentPromoIndex((prev) => (prev - 1 + activePromos.length) % activePromos.length);
  };

  const nextSlide = () => {
    setCurrentPromoIndex((prev) => (prev + 1) % activePromos.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (activePromos.length <= 1) return;
    if (e.key === 'ArrowLeft') prevSlide();
    if (e.key === 'ArrowRight') nextSlide();
  };

  return (
    <section
      id="inicio"
      ref={heroRef}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label="Presentación editorial y colecciones destacadas"
      className="relative bg-[#FAF7F2] border-b border-[#E7E0D6] focus:outline-none"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-12 md:py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Editorial Copy Column */}
          <div
            ref={textoRef}
            className={`reveal-slide-left ${textoVisible ? 'is-visible' : ''} lg:col-span-6 flex flex-col justify-center pr-0 lg:pr-8 space-y-6`}
          >
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[56px] text-[#1C1917] font-bold tracking-tight leading-[1.1] text-balance">
              {currentPromo?.titulo || config?.hero_titulo || config?.nombre_negocio || 'Bienvenida'}
            </h1>

            {(currentPromo?.subtitulo || config?.hero_subtitulo) && (
              <p className="text-sm sm:text-base text-[#57534E] max-w-lg font-normal leading-relaxed">
                {currentPromo?.subtitulo || config?.hero_subtitulo}
              </p>
            )}

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#9F1D3A] hover:bg-[#7F1730] text-white px-7 py-3.5 rounded-[4px] text-xs font-semibold tracking-wider uppercase transition-all duration-150 active:scale-[0.99] shadow-sm select-none"
              >
                <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Escríbenos por WhatsApp</span>
              </a>

              <a
                href="#coleccion"
                className="inline-flex items-center px-7 py-3.5 rounded-[4px] border border-[#E7E0D6] hover:border-[#1C1917] text-[#1C1917] bg-transparent text-xs font-semibold tracking-wider uppercase transition-colors duration-150 select-none"
              >
                Ver colección
              </a>
            </div>
          </div>

          {/* Editorial Photography Column */}
          <div ref={fotoRef} className={`reveal-scale-in ${fotoVisible ? 'is-visible' : ''} lg:col-span-6 relative`}>
            <div className="relative mx-auto w-full max-w-lg lg:max-w-none aspect-[4/5] bg-[#F4ECE8] rounded-[12px] overflow-hidden border border-[#E7E0D6] shadow-sm">
              {heroImageUrl ? (
                <img
                  src={heroImageUrl}
                  alt={currentPromo?.texto_alternativo || 'Lookbook oficial de atelier VSHEIN'}
                  className="w-full h-full object-cover object-top transition-transform duration-700 hover:scale-105"
                  width={800}
                  height={1000}
                  loading="eager"
                  fetchPriority="high"
                />
              ) : (
                <div className="w-full h-full bg-[#FAF7F2] flex items-center justify-center text-[#57534E]">
                  <span className="font-display text-2xl uppercase tracking-widest text-[#1C1917]">VSHEIN</span>
                </div>
              )}

              {/* Slide controls if multiple promotions exist */}
              {activePromos.length > 1 && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/90 backdrop-blur-md p-1 rounded-[6px] border border-[#E7E0D6]">
                  <button
                    type="button"
                    onClick={prevSlide}
                    className="p-1 hover:text-[#9F1D3A] transition-colors"
                    aria-label="Promoción anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-[11px] font-mono px-1">
                    {currentPromoIndex + 1}/{activePromos.length}
                  </span>
                  <button
                    type="button"
                    onClick={nextSlide}
                    className="p-1 hover:text-[#9F1D3A] transition-colors"
                    aria-label="Siguiente promoción"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
