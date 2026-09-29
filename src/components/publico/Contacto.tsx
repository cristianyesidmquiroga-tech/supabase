import React, { useState } from 'react';
import {
  MessageCircle,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Send,
  Loader2,
} from 'lucide-react';
import { SitioConfig } from '../../types';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { generarEnlaceWhatsApp, validarFormularioContacto } from '../../lib/format';
import { useToast } from '../ui/Toast';
import { ErrorAlert } from '../ui/ErrorAlert';
import { useScrollReveal } from '../../hooks/useScrollReveal';

export interface ContactoProps {
  config: SitioConfig | null;
}

export const Contacto: React.FC<ContactoProps> = ({ config }) => {
  const { showToast } = useToast();

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [aceptaPolitica, setAceptaPolitica] = useState(false);
  const [honeypot, setHoneypot] = useState(''); // Anti-spam honeypot

  const [errores, setErrores] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [bloqueoSegundos, setBloqueoSegundos] = useState(0);
  const { ref: canalesRef, visible: canalesVisible } = useScrollReveal<HTMLDivElement>();
  const { ref: formRef, visible: formVisible } = useScrollReveal<HTMLDivElement>();

  const whatsappUrl = generarEnlaceWhatsApp(
    config?.whatsapp,
    config?.mensaje_whatsapp || 'Hola VSHEIN, deseo realizar una consulta directa.'
  );

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Check honeypot
    if (honeypot.trim()) {
      showToast('success', 'Mensaje enviado correctamente.');
      return;
    }

    if (bloqueoSegundos > 0) {
      showToast('warning', `Por favor espere ${bloqueoSegundos}s antes de enviar otro mensaje.`);
      return;
    }

    // Client-side validation
    const validacion = validarFormularioContacto({
      nombre,
      email,
      telefono,
      mensaje,
      acepta_politica: aceptaPolitica,
    });

    if (!validacion.esValido) {
      setErrores(validacion.errores as Record<string, string>);
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      setErrorEnvio('No fue posible enviar el mensaje. Por favor escríbanos directamente por WhatsApp.');
      return;
    }

    setErrores({});
    setEnviando(true);
    setErrorEnvio(null);

    try {
      const { error: insertError } = await supabase.from('mensajes_contacto').insert([
        {
          nombre: nombre.trim(),
          email: email.trim(),
          telefono: telefono.trim() || null,
          mensaje: mensaje.trim(),
          acepta_politica: true,
          leido: false,
        },
      ]);

      if (insertError) {
        throw new Error(insertError.message || 'No fue posible enviar el mensaje.');
      }

      // Success
      showToast('success', 'Su mensaje ha sido remitido con éxito a nuestra estilista principal.', 'Mensaje Enviado');
      setNombre('');
      setEmail('');
      setTelefono('');
      setMensaje('');
      setAceptaPolitica(false);

      // Start 30s lockout against rapid repeat submissions
      setBloqueoSegundos(30);
      const timer = setInterval(() => {
        setBloqueoSegundos((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error inesperado al enviar.';
      setErrorEnvio(msg);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section
      id="contacto"
      aria-labelledby="contacto-heading"
      className="py-20 md:py-28 bg-[#F4ECE8]/50 border-t border-[#E7E0D6]"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="w-5 h-[1px] bg-[#9F1D3A]" aria-hidden="true" />
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#57534E]">
              Atención Personal
            </span>
            <span className="w-5 h-[1px] bg-[#9F1D3A]" aria-hidden="true" />
          </div>
          <h2
            id="contacto-heading"
            className="font-display text-3xl md:text-4xl text-[#1C1917] font-bold tracking-tight"
          >
            Estamos a su Disposición
          </h2>
          <p className="text-xs md:text-sm text-[#57534E] mt-3 font-normal leading-relaxed">
            Escríbanos directamente por su plataforma preferida o déjenos sus datos para recibir una respuesta de nuestro atelier.
          </p>
        </div>

        {/* Multi-Channel Row — mismo ancho que el formulario */}
        <div className="max-w-2xl mx-auto mb-10">
          <div
            ref={canalesRef}
            className={`reveal-fade-up ${canalesVisible ? 'is-visible' : ''} grid grid-cols-3 gap-3`}
          >
            {/* WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white hover:bg-[#FAF7F2] py-4 px-2 rounded-[8px] border border-[#E7E0D6] shadow-xs flex flex-col items-center justify-center text-center group transition-colors select-none"
            >
              <MessageCircle className="w-6 h-6 text-[#128C7E] group-hover:scale-110 transition-transform mb-2" />
              <span className="text-xs font-semibold text-[#1C1917]">WhatsApp</span>
              <span className="text-[10px] text-[#57534E] mt-0.5">Inmediato</span>
            </a>

            {/* Instagram */}
            <a
              href={config?.instagram_url || '#'}
              target={config?.instagram_url ? '_blank' : '_self'}
              rel="noopener noreferrer"
              className="bg-white hover:bg-[#FAF7F2] py-4 px-2 rounded-[8px] border border-[#E7E0D6] shadow-xs flex flex-col items-center justify-center text-center group transition-colors select-none"
            >
              <Instagram className="w-6 h-6 text-[#1C1917] group-hover:scale-110 transition-transform mb-2" />
              <span className="text-xs font-semibold text-[#1C1917]">Instagram</span>
              <span className="text-[10px] text-[#57534E] mt-0.5">Lookbook</span>
            </a>

            {/* Facebook */}
            <a
              href={config?.facebook_url || '#'}
              target={config?.facebook_url ? '_blank' : '_self'}
              rel="noopener noreferrer"
              className="bg-white hover:bg-[#FAF7F2] py-4 px-2 rounded-[8px] border border-[#E7E0D6] shadow-xs flex flex-col items-center justify-center text-center group transition-colors select-none"
            >
              <Facebook className="w-6 h-6 text-[#1C1917] group-hover:scale-110 transition-transform mb-2" />
              <span className="text-xs font-semibold text-[#1C1917]">Facebook</span>
              <span className="text-[10px] text-[#57534E] mt-0.5">Atelier Studio</span>
            </a>
          </div>
        </div>


        {/* Curated Contact Form */}
        <div
          ref={formRef}
          className={`reveal-scale-in ${formVisible ? 'is-visible' : ''} max-w-2xl mx-auto bg-white p-8 md:p-12 rounded-[12px] border border-[#E7E0D6] shadow-sm`}
        >
          {errorEnvio && (
            <ErrorAlert
              title="No se pudo remitir su consulta"
              message={errorEnvio}
              onRetry={() => {
                handleSubmit();
              }}
              className="mb-6"
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Honeypot field for bot prevention */}
            <input
              type="text"
              name="b_url_security"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Nombre */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-2">
                  Nombre completo <span className="text-[#9F1D3A]">*</span>
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Constanza Silva"
                  className={`w-full bg-[#FAF7F2] px-4 py-3 text-sm text-[#1C1917] rounded-[4px] border ${
                    errores.nombre ? 'border-[#B91C1C]' : 'border-[#E7E0D6]'
                  } focus:outline-none focus:border-[#9F1D3A] focus:ring-1 focus:ring-[#9F1D3A] transition-colors`}
                />
                {errores.nombre && (
                  <p className="text-xs text-[#B91C1C] mt-1">{errores.nombre}</p>
                )}
              </div>

              {/* Correo */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-2">
                  Correo electrónico <span className="text-[#9F1D3A]">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="constanza@ejemplo.com"
                  className={`w-full bg-[#FAF7F2] px-4 py-3 text-sm text-[#1C1917] rounded-[4px] border ${
                    errores.email ? 'border-[#B91C1C]' : 'border-[#E7E0D6]'
                  } focus:outline-none focus:border-[#9F1D3A] focus:ring-1 focus:ring-[#9F1D3A] transition-colors`}
                />
                {errores.email && (
                  <p className="text-xs text-[#B91C1C] mt-1">{errores.email}</p>
                )}
              </div>
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-2">
                Teléfono o WhatsApp (opcional)
              </label>
              <input
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="+57 300 000 0000"
                className={`w-full bg-[#FAF7F2] px-4 py-3 text-sm text-[#1C1917] rounded-[4px] border ${
                  errores.telefono ? 'border-[#B91C1C]' : 'border-[#E7E0D6]'
                } focus:outline-none focus:border-[#9F1D3A] focus:ring-1 focus:ring-[#9F1D3A] transition-colors`}
              />
              {errores.telefono && (
                <p className="text-xs text-[#B91C1C] mt-1">{errores.telefono}</p>
              )}
            </div>

            {/* Mensaje */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-2">
                Mensaje o consulta de prendas <span className="text-[#9F1D3A]">*</span>
              </label>
              <textarea
                rows={4}
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                placeholder="Indíquenos el modelo o la inquietud que desea coordinar..."
                className={`w-full bg-[#FAF7F2] px-4 py-3 text-sm text-[#1C1917] rounded-[4px] border ${
                  errores.mensaje ? 'border-[#B91C1C]' : 'border-[#E7E0D6]'
                } focus:outline-none focus:border-[#9F1D3A] focus:ring-1 focus:ring-[#9F1D3A] transition-colors resize-none`}
              />
              {errores.mensaje && (
                <p className="text-xs text-[#B91C1C] mt-1">{errores.mensaje}</p>
              )}
            </div>

            {/* Checkbox Tratamiento de Datos (Colombia Ley 1581) */}
            <div>
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="acepta-datos"
                  checked={aceptaPolitica}
                  onChange={(e) => setAceptaPolitica(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded-[3px] border-[#E7E0D6] text-[#9F1D3A] focus:ring-[#9F1D3A] cursor-pointer"
                />
                <label htmlFor="acepta-datos" className="text-xs text-[#57534E] leading-relaxed select-none cursor-pointer">
                  Autorizo el tratamiento de mis datos personales según la{' '}
                  <a
                    href="#/politicas/privacidad"
                    className="underline text-[#1C1917] hover:text-[#9F1D3A] transition-colors"
                  >
                    Política de privacidad
                  </a>
                  .
                </label>
              </div>
              {errores.acepta_politica && (
                <p className="text-xs text-[#B91C1C] mt-1">{errores.acepta_politica}</p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={enviando || bloqueoSegundos > 0}
              className="w-full py-4 bg-[#9F1D3A] hover:bg-[#7F1730] text-white text-xs font-semibold uppercase tracking-widest rounded-[4px] transition-all duration-150 active:scale-[0.99] shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none"
            >
              {enviando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Enviando mensaje...</span>
                </>
              ) : bloqueoSegundos > 0 ? (
                <span>Reenviar en {bloqueoSegundos}s</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Enviar mensaje</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};
