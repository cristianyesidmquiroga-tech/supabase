import { AccionPermiso, RolUsuario } from '../types';

/**
 * Función central de autorización según la Matriz de Permisos Estricta.
 * Roles de base de datos:
 * - 'administradora' = Superadmin
 * - 'supervisor'     = Supervisor
 * - 'empleada'       = Trabajador
 */
export function puede(rol: RolUsuario | null | undefined, accion: AccionPermiso): boolean {
  if (!rol) return false;

  // Superadmin (administradora) puede realizar todas las acciones
  if (rol === 'administradora') {
    return true;
  }

  // Supervisor (supervisor):
  // Puede crear y editar en catálogo, categorías, promociones, sitio, políticas y mensajes.
  // NUNCA puede eliminar nada (ni productos, ni categorías, ni políticas, ni promociones, ni mensajes, ni fotos).
  // NO ve ni gestiona usuarios.
  if (rol === 'supervisor') {
    switch (accion) {
      case 'crear_producto':
      case 'editar_producto':
      case 'gestionar_categorias':
      case 'gestionar_sitio':
      case 'gestionar_politicas':
      case 'gestionar_promociones':
      case 'ver_mensajes':
      case 'gestionar_mensajes':
      case 'subir_imagenes':
        return true;
      case 'eliminar_producto':
      case 'eliminar_categoria':
      case 'eliminar_politica':
      case 'eliminar_promocion':
      case 'eliminar_mensaje':
      case 'eliminar_imagenes':
      case 'gestionar_usuarios':
        return false;
      default:
        return false;
    }
  }

  // Trabajador (empleada):
  // Solo visualiza el catálogo básico (nombre, precio, tallas, categoría, foto principal) de productos activos.
  // No puede crear, editar ni eliminar ningún recurso, ni acceder al resto de módulos.
  if (rol === 'empleada') {
    return false;
  }

  return false;
}
