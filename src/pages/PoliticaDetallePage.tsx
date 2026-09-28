import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { ChevronRight, ArrowLeft, ShieldCheck, ListOrdered } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { useConfig } from '../hooks/useConfig';
import { Politica } from '../types';
import { reemplazarMarcadoresPolitica, formatearFecha } from '../lib/format';
import { Navbar } from '../components/publico/Navbar';
import { Footer } from '../components/publico/Footer';
import { FloatingWhatsApp } from '../components/publico/FloatingWhatsApp';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorAlert } from '../components/ui/ErrorAlert';

export const PoliticaDetallePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { config } = useConfig();

  const [politica, setPolitica] = useState<Politica | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPolitica() {
      if (!slug) return;
      setLoading(true);
      setError(null);

      if (!isSupabaseConfigured || !supabase) {
        setError('Supabase no está configurado.');
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchErr } = await supabase
          .from('politicas')
          .select('*')
          .eq('slug', slug)
          .single();

        if (fetchErr || !data) {
          setError('Política no encontrada.');
        } else {
          setPolitica(data as Politica);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error al cargar política.');
      } finally {
        setLoading(false);
      }
    }

    loadPolitica();
  }, [slug]);

  // Extract table of contents headings (lines starting with ## )
  const headings = React.useMemo(() => {
    if (!politica?.contenido) return [];
    const lines = politica.contenido.split('\n');
    const result: string[] = [];
    for (const line of lines) {
      const match = line.match(/^##\s+(.*)/);
      if (match) {
        result.push(match[1]);
      }
    }
    return result;
  }, [politica]);

  const contenidoFinal = politica
    ? reemplazarMarcadoresPolitica(politica.contenido, config, politica.updated_at)
    : '';

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1C1917]">
      <Navbar config={config} />

      <main className="flex-1 py-14 px-6 md:px-10">
        <div className="max-w-[720px] mx-auto">
          {/* Breadcrumbs */}
          <nav aria-label="Migas de pan" className="mb-8">
            <ol className="flex items-center space-x-2 text-xs text-[#57534E]">
              <li>
                <Link to="/" className="hover:text-[#9F1D3A] transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <ChevronRight className="w-3.5 h-3.5 text-[#8C7072]" />
              </li>
              <li>
                <span className="text-[#57534E]">Políticas Legales</span>
              </li>
              <li>
                <ChevronRight className="w-3.5 h-3.5 text-[#8C7072]" />
              </li>
              <li aria-current="page" className="text-[#1C1917] font-semibold">
                {politica?.titulo || 'Documento Legal'}
              </li>
            </ol>
          </nav>

          {loading && (
            <div className="space-y-6">
              <Skeleton className="w-3/4 h-10" />
              <Skeleton className="w-1/3 h-4" />
              <Skeleton className="w-full h-32" />
              <Skeleton className="w-full h-48" />
            </div>
          )}

          {error && !loading && (
            <EmptyState
              title="Documento no encontrado"
              description="La política que intenta consultar no existe o ha sido reubicada."
              actionText="Volver al inicio"
              onAction={() => (window.location.hash = '#/')}
            />
          )}

          {!loading && !error && politica && (
            <article className="space-y-8">
              {/* Document Header */}
              <header className="border-b border-[#E7E0D6] pb-6 mb-8">
                <h1 className="font-display text-3xl md:text-4xl text-[#1C1917] font-bold tracking-tight mb-3">
                  {politica.titulo}
                </h1>
                <p className="text-xs text-[#57534E] flex items-center gap-2">
                  <span>Última actualización: {formatearFecha(politica.updated_at)}</span>
                  <span className="w-1 h-1 rounded-full bg-[#8C7072]" />
                  <span>Versión Regulada Colombia (Ley 1581 / 1480)</span>
                </p>
              </header>

              {/* Table of Contents (if >= 3 headings) */}
              {headings.length >= 3 && (
                <div className="bg-white border border-[#E7E0D6] rounded-[8px] p-6 mb-8 ambient-shadow">
                  <div className="flex items-center gap-2 mb-4 text-[#1C1917]">
                    <ListOrdered className="w-4 h-4 text-[#9F1D3A]" />
                    <h2 className="font-display text-base font-semibold">Tabla de Contenido</h2>
                  </div>
                  <ol className="grid grid-cols-1 md:grid-cols-2 gap-y-2.5 gap-x-6 text-xs text-[#57534E]">
                    {headings.map((h, i) => (
                      <li key={i} className="flex items-baseline gap-2">
                        <span className="font-mono text-[#9F1D3A] font-semibold">{String(i + 1).padStart(2, '0')}.</span>
                        <span className="hover:text-[#1C1917] transition-colors">{h}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Notice callout */}
              <aside className="bg-[#FAF7F2] border-l-2 border-[#9F1D3A] p-5 rounded-r-[6px] border border-t-[#E7E0D6] border-r-[#E7E0D6] border-b-[#E7E0D6] shadow-xs">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-[#9F1D3A] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                      Aviso Relevante: Compras y Pagos Asistidos
                    </h3>
                    <p className="text-xs text-[#57534E] leading-relaxed">
                      {config?.nombre_negocio || 'VSHEIN'} no utiliza pasarelas de pago automatizadas de terceros dentro de esta web editorial. Cada adquisición se concibe como una transacción boutique coordinada directamente por nuestro equipo concierge en WhatsApp, evitando el almacenamiento no solicitado de credenciales bancarias.
                    </p>
                  </div>
                </div>
              </aside>

              {/* Secure Markdown Render */}
              <div className="prose prose-stone max-w-none text-sm md:text-base leading-relaxed text-[#1C1917] space-y-6">
                <ReactMarkdown
                  components={{
                    h2: ({ children }) => (
                      <h2 className="font-display text-xl md:text-2xl font-bold text-[#1C1917] mt-8 mb-3 tracking-tight border-b border-[#E7E0D6]/60 pb-2">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="font-display text-lg font-semibold text-[#1C1917] mt-6 mb-2">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="text-[#57534E] leading-relaxed mb-4 text-sm md:text-base">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc pl-5 space-y-2 text-[#57534E] text-sm mb-4">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal pl-5 space-y-2 text-[#57534E] text-sm mb-4">
                        {children}
                      </ol>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-[#1C1917]">{children}</strong>
                    ),
                  }}
                >
                  {contenidoFinal}
                </ReactMarkdown>
              </div>

              {/* Return to Home Anchor */}
              <div className="mt-16 pt-8 border-t border-[#E7E0D6] flex justify-center">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 px-8 py-3.5 border border-[#9F1D3A] text-[#9F1D3A] hover:bg-[#9F1D3A] hover:text-white rounded-[4px] text-xs font-semibold uppercase tracking-wider transition-all duration-150 shadow-xs"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Volver al inicio</span>
                </Link>
              </div>
            </article>
          )}
        </div>
      </main>

      <Footer config={config} />
      <FloatingWhatsApp config={config} />
    </div>
  );
};
