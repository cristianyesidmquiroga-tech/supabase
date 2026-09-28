import React from 'react';
import { Sparkles, Eye } from 'lucide-react';
import { SitioConfig } from '../../types';

export interface NosotrosProps {
  config: SitioConfig | null;
}

export const Nosotros: React.FC<NosotrosProps> = ({ config }) => {
  const tieneNosotros = Boolean(config?.nosotros_texto || config?.mision || config?.vision);
  if (!tieneNosotros) return null;

  return (
    <section
      id="nosotros"
      aria-labelledby="nosotros-heading"
      className="py-20 md:py-28 bg-[#F4ECE8]/50 border-y border-[#E7E0D6]"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Column 1: Editorial Atelier Photography */}
          <div className="lg:col-span-6">
            <div className="relative rounded-[12px] overflow-hidden border border-[#E7E0D6] shadow-sm aspect-[4/5] bg-white">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3aabXxxUcdNMLd6e90XPyepaat8eF7R82O1kUvswraLVd8Aav9yIjMgiup7eJFtOMGkwLfe8MfxSK08fj_E9-DNW3EVg6JR6popgbKJDZLSe2aFGd1d3MjgPjKJv0OgxteraQ4Z2LyHOO4qf8qZmqoqsdVtpAfRn57ZdYQoBQwqw9ZVzltcwQC_fnFRpHWO6OKO-dnJueqx52Y8SRxMqDOPiszXfq0btN2Aaz2O7eU18htYWtIUWR"
                alt="Taller de confección artesanal y patronaje de alta costura"
                className="w-full h-full object-cover"
                loading="lazy"
                width={700}
                height={875}
              />
              <div className="absolute bottom-6 left-6 right-6 md:right-auto md:max-w-xs bg-white/90 backdrop-blur-md px-5 py-4 rounded-[8px] border border-[#E7E0D6] shadow-xs">
                <p className="font-display text-sm md:text-base text-[#1C1917] italic">
                  "Cada costura cuenta una historia de paciencia y rigor."
                </p>
              </div>
            </div>
          </div>

          {/* Column 2: Narrative & Mission/Vision Cards */}
          <div className="lg:col-span-6 space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 mb-2">
                <span className="w-5 h-[1px] bg-[#9F1D3A]" aria-hidden="true" />
                <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#57534E]">
                  Sobre la Casa
                </span>
              </div>
              <h2
                id="nosotros-heading"
                className="font-display text-3xl md:text-4xl text-[#1C1917] font-bold mb-6 tracking-tight"
              >
                {config?.nosotros_titulo || 'El Arte de la Confección Silenciosa'}
              </h2>
              {config?.nosotros_texto && (
                <div className="text-sm md:text-base text-[#57534E] leading-relaxed font-normal space-y-4">
                  {config.nosotros_texto.split('\n\n').map((parrafo, idx) => (
                    <p key={idx}>{parrafo}</p>
                  ))}
                </div>
              )}
            </div>

            {/* Misión & Visión Cards (only if they have content) */}
            {(config?.mision || config?.vision) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                {config?.mision && (
                  <div className="bg-white p-6 rounded-[8px] border border-[#E7E0D6] shadow-xs">
                    <div className="w-10 h-10 rounded-[6px] bg-[#FAF7F2] border border-[#E7E0D6] flex items-center justify-center text-[#9F1D3A] mb-4">
                      <Sparkles className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <h3 className="font-display text-lg font-semibold text-[#1C1917] mb-2">
                      Misión
                    </h3>
                    <p className="text-xs md:text-sm text-[#57534E] leading-relaxed">
                      {config.mision}
                    </p>
                  </div>
                )}

                {config?.vision && (
                  <div className="bg-white p-6 rounded-[8px] border border-[#E7E0D6] shadow-xs">
                    <div className="w-10 h-10 rounded-[6px] bg-[#FAF7F2] border border-[#E7E0D6] flex items-center justify-center text-[#9F1D3A] mb-4">
                      <Eye className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <h3 className="font-display text-lg font-semibold text-[#1C1917] mb-2">
                      Visión
                    </h3>
                    <p className="text-xs md:text-sm text-[#57534E] leading-relaxed">
                      {config.vision}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
