import React from 'react';
import { Instagram, Facebook, Music, ShieldCheck } from 'lucide-react';
import { SitioConfig, Politica } from '../../types';
import { generarEnlaceWhatsApp } from '../../lib/format';

export interface FooterProps {
  config: SitioConfig | null;
  politicas?: Politica[];
}

export const Footer: React.FC<FooterProps> = ({ config, politicas = [] }) => {
  const anio = new Date().getFullYear();

  const whatsappUrl = generarEnlaceWhatsApp(
    config?.whatsapp,
    config?.mensaje_whatsapp || 'Hola VSHEIN, deseo realizar una consulta.'
  );

  return (
    <footer className="w-full bg-[#1C1917] text-[#FAF7F2] border-t border-[#33302D]">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-16">
        {/* Top Row Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-[#33302D]">
          {/* Brand Info */}
          <div className="lg:col-span-4 space-y-4">
            <span className="font-display text-2xl uppercase tracking-widest text-[#FAF7F2] block">
              {config?.nombre_negocio || 'VSHEIN'}
            </span>
            {config?.eslogan && (
              <p className="text-xs text-[#E0D8D5] font-light leading-relaxed max-w-sm">
                {config.eslogan}
              </p>
            )}
            {config?.razon_social && (
              <p className="text-[11px] text-[#A8A29E] leading-normal">
                {config.razon_social} {config.nit && `· NIT: ${config.nit}`}
              </p>
            )}
          </div>

          {/* Links Column 1: Atelier & Legal */}
          <div className="lg:col-span-3 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-white block">
              Atelier & Legal
            </span>
            <ul className="space-y-2 text-xs text-[#E0D8D5]">
              <li>
                <a href="#/politicas/privacidad" className="hover:text-white transition-colors">
                  Política de Privacidad
                </a>
              </li>
              <li>
                <a href="#/politicas/terminos" className="hover:text-white transition-colors">
                  Términos de Servicio
                </a>
              </li>
              <li>
                <a href="#/politicas/cambios-devoluciones" className="hover:text-white transition-colors">
                  Cambios y Devoluciones
                </a>
              </li>
              {politicas
                .filter(
                  (p) =>
                    p.slug !== 'privacidad' &&
                    p.slug !== 'terminos' &&
                    p.slug !== 'cambios-devoluciones'
                )
                .map((p) => (
                  <li key={p.slug}>
                    <a href={`#/politicas/${p.slug}`} className="hover:text-white transition-colors">
                      {p.titulo}
                    </a>
                  </li>
                ))}
            </ul>
          </div>

          {/* Links Column 2: Atención al Cliente */}
          <div className="lg:col-span-3 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-white block">
              Atención al Cliente
            </span>
            <ul className="space-y-2 text-xs text-[#E0D8D5]">
              <li>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  WhatsApp Concierge
                </a>
              </li>
              {config?.email_contacto && (
                <li>
                  <a href={`mailto:${config.email_contacto}`} className="hover:text-white transition-colors">
                    {config.email_contacto}
                  </a>
                </li>
              )}
              {config?.direccion && (
                <li>
                  <a href="#encuentranos" className="hover:text-white transition-colors">
                    Citas Privadas Showroom
                  </a>
                </li>
              )}
              <li>
                <a href="#/equipo" className="hover:text-[#9F1D3A] transition-colors flex items-center gap-1.5 opacity-60 hover:opacity-100">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Acceso de Equipo</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Social Channels */}
          <div className="lg:col-span-2 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-white block">
              Redes
            </span>
            <div className="flex items-center gap-4 text-[#E0D8D5]">
              {config?.instagram_url && (
                <a
                  href={config.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram de VSHEIN"
                  className="hover:text-white transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {config?.facebook_url && (
                <a
                  href={config.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook de VSHEIN"
                  className="hover:text-white transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {config?.tiktok_url && (
                <a
                  href={config.tiktok_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok de VSHEIN"
                  className="hover:text-white transition-colors"
                >
                  <Music className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-xs text-[#A8A29E]">
          <p>
            © {anio} {config?.nombre_negocio || 'VSHEIN'}. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};
