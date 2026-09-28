import { useAuth } from '../context/AuthContext';
import { AccionPermiso, RolUsuario, RolUI, MAPA_ROL_UI } from '../types';

export function useRol() {
  const { rol, rolEtiqueta, puede } = useAuth();

  const rolUI: RolUI | null = rol ? MAPA_ROL_UI[rol] : null;
  const esSuperadmin = rol === 'administradora';
  const esSupervisor = rol === 'supervisor';
  const esTrabajador = rol === 'empleada';

  return {
    rol: rol as RolUsuario | null,
    rolUI,
    rolEtiqueta,
    puede: (accion: AccionPermiso) => puede(accion),
    esSuperadmin,
    esSupervisor,
    esTrabajador,
  };
}
