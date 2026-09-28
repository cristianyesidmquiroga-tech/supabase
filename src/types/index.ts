export type RolUsuario = 'administradora' | 'supervisor' | 'empleada';

export type RolUI = 'superadmin' | 'supervisor' | 'trabajador';

export const ETIQUETAS_ROL: Record<RolUsuario, string> = {
  administradora: 'Superadmin',
  supervisor: 'Supervisor',
  empleada: 'Trabajador',
};

export const MAPA_ROL_UI: Record<RolUsuario, RolUI> = {
  administradora: 'superadmin',
  supervisor: 'supervisor',
  empleada: 'trabajador',
};

export interface Perfil {
  id: string;
  email: string;
  nombre_completo: string;
  rol: RolUsuario;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Categoria {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  orden: number;
  activa: boolean;
  created_at?: string;
  updated_at?: string;
  conteo_productos?: number;
}

export interface FotografiaProducto {
  id: string;
  producto_id: string;
  ruta_base: string;
  texto_alternativo: string;
  es_principal: boolean;
  orden: number;
  created_at?: string;
  url_publica?: string;
}

export interface Producto {
  id: string;
  categoria_id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  stock_actual: number;
  stock_minimo: number;
  destacado: boolean;
  activo: boolean;
  precio: number | null; // COP entero
  tallas: string[];
  created_at?: string;
  updated_at?: string;
  categorias?: Categoria | null;
  fotografias_producto?: FotografiaProducto[];
}

export interface ProductoTrabajador {
  id: string;
  nombre: string;
  precio: number | null;
  tallas: string[];
  categoria_id: string;
  categorias?: { nombre: string } | null;
  fotografia_principal?: {
    ruta_base: string;
    texto_alternativo: string;
    url_publica?: string;
  } | null;
}

export interface Promocion {
  id: string;
  titulo: string;
  subtitulo: string | null;
  ruta_imagen: string;
  texto_alternativo: string;
  enlace_destino: string | null;
  ubicacion: string | null;
  activa: boolean;
  orden: number;
  vigencia_inicio: string | null;
  vigencia_fin: string | null;
  created_at?: string;
  updated_at?: string;
  url_publica?: string;
}

export interface HorarioDia {
  dias: string;
  horas: string;
}

export interface SitioConfig {
  id: number;
  nombre_negocio: string;
  razon_social: string | null;
  nit: string | null;
  eslogan: string | null;
  descripcion: string | null;
  hero_titulo: string | null;
  hero_subtitulo: string | null;
  hero_imagen_url: string | null;
  logo_url: string | null;
  nosotros_titulo: string | null;
  nosotros_texto: string | null;
  mision: string | null;
  vision: string | null;
  whatsapp: string | null;
  mensaje_whatsapp: string | null;
  telefono: string | null;
  email_contacto: string | null;
  direccion: string | null;
  ciudad: string | null;
  departamento: string | null;
  horario: HorarioDia[] | null;
  latitud: number | null;
  longitud: number | null;
  mapa_embed_url: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  tiktok_url: string | null;
  responsable_datos: string | null;
  updated_at?: string;
}

export interface Politica {
  slug: string;
  titulo: string;
  contenido: string; // Markdown con {{marcadores}}
  orden: number;
  updated_at: string;
}

export interface MensajeContacto {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  mensaje: string;
  acepta_politica: boolean;
  leido: boolean;
  created_at: string;
}

export interface ProductoMasVendido {
  id: string;
  nombre: string;
  slug: string;
  stock_actual: number;
  unidades_vendidas: number;
}

export type AccionPermiso =
  | 'crear_producto'
  | 'editar_producto'
  | 'eliminar_producto'
  | 'gestionar_categorias'
  | 'eliminar_categoria'
  | 'gestionar_sitio'
  | 'gestionar_politicas'
  | 'eliminar_politica'
  | 'gestionar_promociones'
  | 'eliminar_promocion'
  | 'ver_mensajes'
  | 'gestionar_mensajes'
  | 'eliminar_mensaje'
  | 'subir_imagenes'
  | 'eliminar_imagenes'
  | 'gestionar_usuarios';
