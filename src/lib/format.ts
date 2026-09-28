import { SitioConfig } from '../types';

/**
 * Formatea un valor numérico a moneda colombiana (COP) sin decimales.
 * Si el precio es null o undefined, devuelve 'Consultar precio' y nunca $0.
 */
export function formatearPrecioCOP(precio: number | null | undefined): string {
  if (precio === null || precio === undefined) {
    return 'Consultar precio';
  }

  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(precio);
}

/**
 * Formatea una fecha ISO a texto en español.
 */
export function formatearFecha(fechaIso?: string | null): string {
  if (!fechaIso) return '';
  try {
    const fecha = new Date(fechaIso);
    return new Intl.DateTimeFormat('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(fecha);
  } catch {
    return fechaIso;
  }
}

/**
 * Reemplaza los marcadores de política con los datos del sitio y la fecha de actualización.
 */
export function reemplazarMarcadoresPolitica(
  contenido: string,
  config: SitioConfig | null,
  fechaActualizacion?: string
): string {
  if (!contenido) return '';

  const fechaTexto = fechaActualizacion ? formatearFecha(fechaActualizacion) : formatearFecha(new Date().toISOString());

  const marcadores: Record<string, string> = {
    '{{nombre_negocio}}': config?.nombre_negocio || 'No informado',
    '{{razon_social}}': config?.razon_social || config?.nombre_negocio || 'No informado',
    '{{nit}}': config?.nit || 'No informado',
    '{{direccion}}': config?.direccion || 'No informado',
    '{{ciudad}}': config?.ciudad || 'No informado',
    '{{email_contacto}}': config?.email_contacto || 'No informado',
    '{{telefono}}': config?.telefono || config?.whatsapp || 'No informado',
    '{{responsable_datos}}': config?.responsable_datos || config?.razon_social || config?.nombre_negocio || 'No informado',
    '{{fecha}}': fechaTexto,
  };

  let resultado = contenido;
  for (const [marcador, valor] of Object.entries(marcadores)) {
    resultado = resultado.replaceAll(marcador, valor);
  }

  return resultado;
}

/**
 * Genera el enlace directo a WhatsApp con texto codificado.
 */
export function generarEnlaceWhatsApp(
  telefonoWhatsApp: string | null | undefined,
  mensaje: string
): string {
  if (!telefonoWhatsApp) return '#';
  const numeroLimpio = telefonoWhatsApp.replace(/\D/g, '');
  if (!numeroLimpio) return '#';
  return `https://wa.me/${numeroLimpio}?text=${encodeURIComponent(mensaje)}`;
}

/**
 * Validador del formulario de contacto para clientes.
 */
export interface ErrorValidacionContacto {
  nombre?: string;
  email?: string;
  telefono?: string;
  mensaje?: string;
  acepta_politica?: string;
  [key: string]: string | undefined;
}

export function validarFormularioContacto(datos: {
  nombre: string;
  email: string;
  telefono?: string;
  mensaje: string;
  acepta_politica: boolean;
}): { esValido: boolean; errores: ErrorValidacionContacto } {
  const errores: ErrorValidacionContacto = {};

  const nombreLimpio = datos.nombre.trim();
  if (!nombreLimpio) {
    errores.nombre = 'El nombre completo es obligatorio.';
  } else if (nombreLimpio.length < 2 || nombreLimpio.length > 120) {
    errores.nombre = 'El nombre debe tener entre 2 y 120 caracteres.';
  }

  const emailLimpio = datos.email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailLimpio) {
    errores.email = 'El correo electrónico es obligatorio.';
  } else if (!emailRegex.test(emailLimpio)) {
    errores.email = 'Ingrese un correo electrónico válido.';
  }

  if (datos.telefono) {
    const telLimpio = datos.telefono.replace(/\s+/g, '');
    if (telLimpio.length > 0 && (telLimpio.length < 7 || telLimpio.length > 20)) {
      errores.telefono = 'El teléfono debe tener entre 7 y 20 caracteres.';
    }
  }

  const mensajeLimpio = datos.mensaje.trim();
  if (!mensajeLimpio) {
    errores.mensaje = 'El mensaje es obligatorio.';
  } else if (mensajeLimpio.length < 5 || mensajeLimpio.length > 2000) {
    errores.mensaje = 'El mensaje debe tener entre 5 y 2000 caracteres.';
  }

  if (!datos.acepta_politica) {
    errores.acepta_politica = 'Debe autorizar el tratamiento de datos personales.';
  }

  return {
    esValido: Object.keys(errores).length === 0,
    errores,
  };
}
