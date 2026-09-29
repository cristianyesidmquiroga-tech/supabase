import React from 'react';
import { MapPin, Clock, Phone, Navigation } from 'lucide-react';
import { SitioConfig } from '../../types';
import { useScrollReveal } from '../../hooks/useScrollReveal';

export interface EncuentranosProps {
  config: SitioConfig | null;
}

export const Encuentranos: React.FC<EncuentranosProps> = ({ config }) => {
  const tieneUbicacion = Boolean(config?.direccion || config?.mapa_embed_url);
  const { ref: infoRef, visible: infoVisible } = useScrollReveal<HTMLDivElement>();
  const { ref: mapaRef, visible: mapaVisible } = useScrollReveal<HTMLDivElement>();

  // Directions destination URL
  const comoLlegarUrl =
    config?.latitud && config?.longitud
      ? `https://www.google.com/maps/dir/?api=1&destination=${config.latitud},${config.longitud}`
      : config?.direccion
      ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
          `${config.direccion}, ${config.ciudad || ''}, ${config.departamento || ''}`
        )}`
      : 'https://maps.google.com';

  return (
    <section
      id="encuentranos"
      aria-labelledby="encuentranos-heading"
      className="py-20 md:py-28 bg-[#FAF7F2]"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="w-5 h-[1px] bg-[#9F1D3A]" aria-hidden="true" />
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#57534E]">
              Boutique & Showroom
            </span>
          </div>
          <h2
            id="encuentranos-heading"
            className="font-display text-3xl md:text-4xl text-[#1C1917] font-bold tracking-tight"
          >
            Encuéntranos
          </h2>
        </div>

        {!tieneUbicacion ? (
          /* ── Fallback cuando no hay datos configurados ── */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            <div className="lg:col-span-5 flex flex-col justify-between bg-white p-8 rounded-[12px] border border-[#E7E0D6] shadow-xs space-y-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-[6px] bg-[#FAF7F2] border border-[#E7E0D6] flex items-center justify-center text-[#9F1D3A] shrink-0 mt-0.5">
                    <MapPin className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-base font-semibold text-[#1C1917]">Showroom Principal</h3>
                    <p className="text-xs md:text-sm text-[#57534E] mt-1 leading-relaxed">Dirección por confirmar</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-[6px] bg-[#FAF7F2] border border-[#E7E0D6] flex items-center justify-center text-[#9F1D3A] shrink-0 mt-0.5">
                    <Clock className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div className="w-full">
                    <h3 className="font-headline-sm text-base font-semibold text-[#1C1917] mb-2">Horarios de Atención</h3>
                    <ul className="text-xs divide-y divide-[#E7E0D6]/60 space-y-2">
                      <li className="flex justify-between pt-2 text-[#57534E]">
                        <span>Lunes – Viernes</span>
                        <span className="font-medium text-[#1C1917]">9:00 – 18:00</span>
                      </li>
                      <li className="flex justify-between pt-2 text-[#57534E]">
                        <span>Sábados</span>
                        <span className="font-medium text-[#1C1917]">10:00 – 15:00</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-[6px] bg-[#FAF7F2] border border-[#E7E0D6] flex items-center justify-center text-[#9F1D3A] shrink-0 mt-0.5">
                    <Phone className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-base font-semibold text-[#1C1917]">Línea Directa</h3>
                    <p className="text-xs md:text-sm text-[#57534E] mt-1">Contáctenos por WhatsApp</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-[#E7E0D6]">
                <span className="w-full py-3.5 px-6 rounded-[4px] border border-[#E7E0D6] text-[#57534E] text-xs font-semibold uppercase tracking-wider text-center flex items-center justify-center gap-2 select-none opacity-60 cursor-default">
                  <Navigation className="w-4 h-4" aria-hidden="true" />
                  <span>Cómo llegar</span>
                </span>
              </div>
            </div>

            <div className="lg:col-span-7 relative min-h-[380px] lg:min-h-[440px] rounded-[12px] overflow-hidden border border-[#E7E0D6] shadow-xs bg-[#F4ECE8] flex items-center justify-center">
              <div className="text-center p-8">
                <MapPin className="w-10 h-10 mx-auto text-[#9F1D3A] mb-4 opacity-50" />
                <p className="font-display text-lg text-[#1C1917] font-semibold mb-1">Próximamente</p>
                <p className="text-xs text-[#57534E]">La ubicación de nuestro showroom estará disponible pronto.</p>
              </div>
            </div>
          </div>
        ) : (
          /* ── Contenido real cuando hay datos ── */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          {/* Column 1: Info, Hours, Phone and Directions CTA */}
          <div
            ref={infoRef}
            className={`reveal-slide-left ${infoVisible ? 'is-visible' : ''} lg:col-span-5 flex flex-col justify-between bg-white p-8 rounded-[12px] border border-[#E7E0D6] shadow-xs space-y-8`}
          >
            <div className="space-y-6">
              {/* Dirección */}
              {config?.direccion && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-[6px] bg-[#FAF7F2] border border-[#E7E0D6] flex items-center justify-center text-[#9F1D3A] shrink-0 mt-0.5">
                    <MapPin className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-base font-semibold text-[#1C1917]">
                      Showroom Principal
                    </h3>
                    <p className="text-xs md:text-sm text-[#57534E] mt-1 leading-relaxed">
                      {config.direccion}
                      {config.ciudad && <><br />{config.ciudad}{config.departamento ? `, ${config.departamento}` : ''}</>}
                    </p>
                  </div>
                </div>
              )}

              {/* Horarios */}
              {config?.horario && config.horario.length > 0 && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-[6px] bg-[#FAF7F2] border border-[#E7E0D6] flex items-center justify-center text-[#9F1D3A] shrink-0 mt-0.5">
                    <Clock className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div className="w-full">
                    <h3 className="font-headline-sm text-base font-semibold text-[#1C1917] mb-2">
                      Horarios de Atención
                    </h3>
                    <ul className="text-xs divide-y divide-[#E7E0D6]/60 space-y-2">
                      {config.horario.map((item, idx) => (
                        <li key={idx} className="flex justify-between pt-2 text-[#57534E]">
                          <span>{item.dias}</span>
                          <span className="font-medium text-[#1C1917]">{item.horas}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Teléfono */}
              {config?.telefono && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-[6px] bg-[#FAF7F2] border border-[#E7E0D6] flex items-center justify-center text-[#9F1D3A] shrink-0 mt-0.5">
                    <Phone className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-base font-semibold text-[#1C1917]">
                      Línea Directa
                    </h3>
                    <a
                      href={`tel:${config.telefono.replace(/\s+/g, '')}`}
                      className="text-xs md:text-sm text-[#57534E] hover:text-[#9F1D3A] transition-colors mt-1 block font-medium"
                    >
                      {config.telefono}
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* CTA Button "Cómo llegar" */}
            <div className="pt-6 border-t border-[#E7E0D6]">
              <a
                href={comoLlegarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-6 rounded-[4px] border border-[#1C1917] hover:bg-[#1C1917] hover:text-white text-[#1C1917] text-xs font-semibold uppercase tracking-wider text-center flex items-center justify-center gap-2 transition-all duration-150 select-none shadow-xs"
              >
                <Navigation className="w-4 h-4" aria-hidden="true" />
                <span>Cómo llegar</span>
              </a>
            </div>
          </div>

          {/* Column 2: Styled Architectural Map */}
          <div
            ref={mapaRef}
            className={`reveal-scale-in ${mapaVisible ? 'is-visible' : ''} lg:col-span-7 relative min-h-[380px] lg:min-h-[440px] rounded-[12px] overflow-hidden border border-[#E7E0D6] shadow-xs bg-[#F4ECE8]`}
          >
            {config?.mapa_embed_url ? (
              <iframe
                src={config.mapa_embed_url}
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '380px' }}
                allowFullScreen={false}
                loading="lazy"
                title={`Ubicación de ${config?.nombre_negocio || 'la tienda'}`}
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              />
            ) : (
              <div className="w-full h-full min-h-[380px] flex items-center justify-center p-8 bg-[#F4ECE8] text-[#57534E] text-center">
                <div>
                  <MapPin className="w-8 h-8 mx-auto text-[#9F1D3A] mb-2" />
                  {config?.direccion && (
                    <p className="font-display text-lg text-[#1C1917] font-semibold">{config.direccion}</p>
                  )}
                  {config?.ciudad && <p className="text-xs text-[#57534E] mt-1">{config.ciudad}</p>}
                </div>
              </div>
            )}
          </div>
          </div>
        )}
      </div>
    </section>
  );
};

