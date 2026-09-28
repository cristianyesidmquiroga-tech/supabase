import React from 'react';
import { MessageCircle } from 'lucide-react';
import { SitioConfig } from '../../types';
import { generarEnlaceWhatsApp } from '../../lib/format';

export interface FloatingWhatsAppProps {
  config: SitioConfig | null;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ config }) => {
  const whatsappUrl = generarEnlaceWhatsApp(
    config?.whatsapp,
    config?.mensaje_whatsapp || 'Hola VSHEIN, deseo coordinar una asesoría personalizada.'
  );

  return (
    <aside className="fixed bottom-6 right-6 z-30 select-none">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar a VSHEIN por WhatsApp"
        className="group relative flex items-center justify-center w-14 h-14 bg-[#128C7E] hover:bg-[#0E7064] text-white rounded-full shadow-lg transition-transform duration-200 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#128C7E] focus-visible:ring-offset-2"
      >
        <MessageCircle className="w-7 h-7" aria-hidden="true" />
        {/* Subtle Tooltip Label on Hover */}
        <span className="absolute right-16 px-3 py-1.5 bg-[#1C1917] text-[#FAF7F2] text-xs font-medium rounded-[4px] shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Asesoría WhatsApp
        </span>
      </a>
    </aside>
  );
};
