import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Skeleton } from '../ui/Skeleton';

export interface RutaProtegidaProps {
  children: React.ReactNode;
}

export const RutaProtegida: React.FC<RutaProtegidaProps> = ({ children }) => {
  const { session, perfil, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-8">
        <div className="max-w-md w-full space-y-4">
          <Skeleton className="w-1/2 h-8 mx-auto" />
          <Skeleton className="w-full h-12" />
          <Skeleton className="w-3/4 h-6 mx-auto" />
        </div>
      </div>
    );
  }

  // Not authenticated or inactive
  if (!session || !perfil || !perfil.activo) {
    return <Navigate to="/equipo" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
