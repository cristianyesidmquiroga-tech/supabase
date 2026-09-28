import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';

export const SinPermiso: React.FC<{ accion?: string }> = ({ accion }) => {
  return (
    <div className="py-16 px-6 max-w-lg mx-auto text-center flex flex-col items-center">
      <div className="w-14 h-14 rounded-full bg-[#FEE2E2] text-[#B91C1C] flex items-center justify-center mb-4">
        <ShieldAlert className="w-7 h-7" aria-hidden="true" />
      </div>
      <h2 className="font-display text-2xl font-bold text-[#1C1917] mb-2">
        Acceso Restringido
      </h2>
      <p className="text-sm text-[#57534E] leading-relaxed mb-6">
        Tu rol actual en el atelier no dispone de privilegios autorizados para {accion || 'acceder a este módulo'}. Si requieres permisos elevados, contacta al Superadmin del atelier.
      </p>
      <Link to="/equipo/productos">
        <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Volver al catálogo
        </Button>
      </Link>
    </div>
  );
};
