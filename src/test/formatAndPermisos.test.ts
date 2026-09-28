import { describe, it, expect } from 'vitest';
import { formatearPrecioCOP, validarFormularioContacto, reemplazarMarcadoresPolitica } from '../lib/format';
import { puede } from '../lib/permisos';
import { SitioConfig } from '../types';

describe('formatearPrecioCOP', () => {
  it('debe devolver "Consultar precio" cuando el valor es null', () => {
    expect(formatearPrecioCOP(null)).toBe('Consultar precio');
  });

  it('debe devolver "Consultar precio" cuando el valor es undefined', () => {
    expect(formatearPrecioCOP(undefined)).toBe('Consultar precio');
  });

  it('debe formatear números enteros en moneda COP correctamente sin decimales', () => {
    const formateado = formatearPrecioCOP(480000);
    // Debería contener 480.000 y el símbolo $ o COP
    expect(formateado).toContain('480.000');
    expect(formateado).toContain('$');
  });

  it('debe formatear 0 como $ 0 y nunca como "Consultar precio"', () => {
    const formateado = formatearPrecioCOP(0);
    expect(formateado).toContain('0');
    expect(formateado).not.toBe('Consultar precio');
  });
});

describe('validarFormularioContacto', () => {
  it('debe fallar si los campos obligatorios están vacíos', () => {
    const res = validarFormularioContacto({
      nombre: '',
      email: '',
      mensaje: '',
      acepta_politica: false,
    });
    expect(res.esValido).toBe(false);
    expect(res.errores.nombre).toBeDefined();
    expect(res.errores.email).toBeDefined();
    expect(res.errores.mensaje).toBeDefined();
    expect(res.errores.acepta_politica).toBeDefined();
  });

  it('debe fallar con correo inválido', () => {
    const res = validarFormularioContacto({
      nombre: 'Constanza Silva',
      email: 'correo-invalido',
      mensaje: 'Hola, deseo consultar disponibilidad.',
      acepta_politica: true,
    });
    expect(res.esValido).toBe(false);
    expect(res.errores.email).toBe('Ingrese un correo electrónico válido.');
  });

  it('debe pasar con todos los campos válidos y política aceptada', () => {
    const res = validarFormularioContacto({
      nombre: 'Constanza Silva',
      email: 'constanza@ejemplo.com',
      telefono: '+57 300 123 4567',
      mensaje: 'Quisiera coordinar una cita para probar el blazer.',
      acepta_politica: true,
    });
    expect(res.esValido).toBe(true);
    expect(Object.keys(res.errores).length).toBe(0);
  });
});

describe('reemplazarMarcadoresPolitica', () => {
  const mockConfig: SitioConfig = {
    id: 1,
    nombre_negocio: 'VSHEIN Atelier',
    razon_social: 'VSHEIN Moda S.A.S.',
    nit: '901.456.789-1',
    eslogan: 'Elegancia arquitectónica',
    descripcion: 'Alta costura',
    hero_titulo: 'Nueva Colección',
    hero_subtitulo: 'Primavera Verano',
    hero_imagen_url: null,
    logo_url: null,
    nosotros_titulo: null,
    nosotros_texto: null,
    mision: null,
    vision: null,
    whatsapp: '573001234567',
    mensaje_whatsapp: 'Hola',
    telefono: '+57 1 654 3210',
    email_contacto: 'concierge@vshein.com',
    direccion: 'Carrera 11 # 85-32',
    ciudad: 'Bogotá',
    departamento: 'Cundinamarca',
    horario: null,
    latitud: null,
    longitud: null,
    mapa_embed_url: null,
    instagram_url: null,
    facebook_url: null,
    tiktok_url: null,
    responsable_datos: 'Oficial de Privacidad VSHEIN',
    updated_at: '2025-10-24T10:00:00Z',
  };

  it('reemplaza correctamente los marcadores {{nombre_negocio}} y {{nit}}', () => {
    const raw = 'Bienvenido a {{nombre_negocio}} identificada con {{nit}}. Escríbenos a {{email_contacto}}.';
    const resultado = reemplazarMarcadoresPolitica(raw, mockConfig, '2025-10-24');
    expect(resultado).toBe('Bienvenido a VSHEIN Atelier identificada con 901.456.789-1. Escríbenos a concierge@vshein.com.');
  });
});

describe('puede (Matriz de Permisos)', () => {
  it('Superadmin (administradora) puede realizar todas las acciones', () => {
    expect(puede('administradora', 'crear_producto')).toBe(true);
    expect(puede('administradora', 'editar_producto')).toBe(true);
    expect(puede('administradora', 'eliminar_producto')).toBe(true);
    expect(puede('administradora', 'gestionar_categorias')).toBe(true);
    expect(puede('administradora', 'eliminar_categoria')).toBe(true);
    expect(puede('administradora', 'gestionar_usuarios')).toBe(true);
    expect(puede('administradora', 'eliminar_imagenes')).toBe(true);
  });

  it('Supervisor (supervisor) puede crear y editar pero NUNCA eliminar', () => {
    expect(puede('supervisor', 'crear_producto')).toBe(true);
    expect(puede('supervisor', 'editar_producto')).toBe(true);
    expect(puede('supervisor', 'gestionar_categorias')).toBe(true);
    expect(puede('supervisor', 'gestionar_sitio')).toBe(true);

    // No puede eliminar
    expect(puede('supervisor', 'eliminar_producto')).toBe(false);
    expect(puede('supervisor', 'eliminar_categoria')).toBe(false);
    expect(puede('supervisor', 'eliminar_politica')).toBe(false);
    expect(puede('supervisor', 'eliminar_promocion')).toBe(false);
    expect(puede('supervisor', 'eliminar_mensaje')).toBe(false);
    expect(puede('supervisor', 'eliminar_imagenes')).toBe(false);

    // No puede gestionar usuarios
    expect(puede('supervisor', 'gestionar_usuarios')).toBe(false);
  });

  it('Trabajador (empleada) NO tiene permisos de mutación ni administración', () => {
    expect(puede('empleada', 'crear_producto')).toBe(false);
    expect(puede('empleada', 'editar_producto')).toBe(false);
    expect(puede('empleada', 'eliminar_producto')).toBe(false);
    expect(puede('empleada', 'gestionar_categorias')).toBe(false);
    expect(puede('empleada', 'gestionar_sitio')).toBe(false);
    expect(puede('empleada', 'gestionar_usuarios')).toBe(false);
  });

  it('Sin rol devuelto o nulo devuelve siempre false', () => {
    expect(puede(null, 'crear_producto')).toBe(false);
    expect(puede(undefined, 'ver_mensajes')).toBe(false);
  });
});
