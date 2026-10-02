import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Package,
  Mail,
  Clock,
  Plus,
  Store,
  Settings,
  Edit,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRol } from '../../hooks/useRol';
import { useProductos } from '../../hooks/useProductos';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { PanelLayout } from '../../components/panel/PanelLayout';
import { SinPermiso } from '../../components/panel/SinPermiso';
import { Badge } from '../../components/ui/Badge';

export const PanelInicioPage: React.FC = () => {
  const { perfil } = useAuth();
  const { esTrabajador } = useRol();
  const navigate = useNavigate();

  // If role is Trabajador, redirect to /equipo/productos (since trabajador doesn't have Inicio)
  useEffect(() => {
    if (esTrabajador) {
      navigate('/equipo/productos', { replace: true });
    }
  }, [esTrabajador, navigate]);

  const { productos, loading } = useProductos({ soloActivos: false });
  const [mensajesSinLeer, setMensajesSinLeer] = useState<number>(0);

  useEffect(() => {
    async function loadMensajes() {
      if (!isSupabaseConfigured || !supabase) {
        setMensajesSinLeer(0);
        return;
      }
      try {
        const { count } = await supabase
          .from('mensajes_contacto')
          .select('*', { count: 'exact', head: true })
          .eq('leido', false);
        setMensajesSinLeer(count || 0);
      } catch {
        setMensajesSinLeer(0);
      }
    }
    loadMensajes();
  }, []);

  if (esTrabajador) {
    return (
      <PanelLayout breadcrumbs={[{ label: 'Inicio' }]}>
        <SinPermiso accion="ver el resumen general del atelier" />
      </PanelLayout>
    );
  }

  const productosActivos = productos.filter((p) => p.activo).length;
  const productosInactivos = productos.filter((p) => !p.activo).length;

  const fechaHoy = new Intl.DateTimeFormat('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <PanelLayout breadcrumbs={[{ label: 'Inicio' }]}>
      <div className="space-y-8">
        {/* Welcome Editorial Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-4 border-b border-[#E7E0D6]">
          <div>
            <h1 className="font-display text-3xl md:text-4xl text-[#1C1917] tracking-tight font-bold">
              Hola, {perfil?.nombre_completo?.split(' ')[0] || 'Constanza'}
            </h1>
            <p className="text-xs md:text-sm text-[#57534E] mt-1">
              Resumen general de la actividad del atelier y accesos directos de gestión.
            </p>
          </div>
          <div className="text-left md:text-right">
            <time className="text-xs font-semibold uppercase tracking-wider text-[#57534E]">
              {fechaHoy}
            </time>
          </div>
        </div>

        {/* 4 Summary Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Productos Activos */}
          <div className="bg-white border border-[#E7E0D6] rounded-[8px] p-6 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#57534E]">
              <span className="text-xs uppercase tracking-wider font-semibold">Productos activos</span>
              <CheckCircle2 className="w-5 h-5 text-[#166534]" />
            </div>
            <div className="my-4">
              <p className="font-display text-4xl text-[#1C1917] font-bold tracking-tight">
                {String(productosActivos).padStart(2, '0')}
              </p>
            </div>
            <p className="text-xs text-[#57534E]">Colección pública sincronizada</p>
          </div>

          {/* Card 2: Productos Inactivos */}
          <div className="bg-white border border-[#E7E0D6] rounded-[8px] p-6 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#57534E]">
              <span className="text-xs uppercase tracking-wider font-semibold">Productos inactivos</span>
              <Package className="w-5 h-5 text-[#8C7072]" />
            </div>
            <div className="my-4">
              <p className="font-display text-4xl text-[#1C1917] font-bold tracking-tight">
                {String(productosInactivos).padStart(2, '0')}
              </p>
            </div>
            <p className="text-xs text-[#57534E]">En borrador o archivados</p>
          </div>

          {/* Card 3: Mensajes sin leer */}
          <div className="bg-white border border-[#E7E0D6] rounded-[8px] p-6 shadow-xs flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between text-[#57534E]">
              <span className="text-xs uppercase tracking-wider font-semibold">Mensajes sin leer</span>
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9F1D3A] opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#9F1D3A]" />
              </span>
            </div>
            <div className="my-4">
              <p className="font-display text-4xl text-[#9F1D3A] font-bold tracking-tight">
                {String(mensajesSinLeer).padStart(2, '0')}
              </p>
            </div>
            <p className="text-xs text-[#57534E]">Pendientes por atender</p>
          </div>

          {/* Card 4: Último Cambio */}
          <div className="bg-white border border-[#E7E0D6] rounded-[8px] p-6 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#57534E]">
              <span className="text-xs uppercase tracking-wider font-semibold">Último cambio</span>
              <Clock className="w-5 h-5 text-[#8C7072]" />
            </div>
            <div className="my-4">
              <p className="font-display text-2xl text-[#1C1917] font-bold tracking-tight">
                Reciente
              </p>
            </div>
            <p className="text-xs text-[#57534E]">Por {perfil?.nombre_completo || 'Atelier'}</p>
          </div>
        </div>

        {/* Quick Operations Section */}
        <section className="bg-white border border-[#E7E0D6] rounded-[8px] p-6 shadow-xs">
          <div className="mb-5">
            <h2 className="font-display text-lg text-[#1C1917] font-semibold">Accesos rápidos</h2>
            <p className="text-xs text-[#57534E] mt-0.5">Operaciones frecuentes del catálogo y mantenimiento del atelier.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/equipo/productos/nuevo"
              className="inline-flex items-center gap-2 bg-[#9F1D3A] hover:bg-[#7F1730] text-white px-5 py-2.5 rounded-[4px] text-xs font-semibold uppercase tracking-wider transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nuevo producto</span>
            </Link>

            <Link
              to="/equipo/mensajes"
              className="inline-flex items-center gap-2 bg-transparent border border-[#E7E0D6] text-[#1C1917] hover:border-[#1C1917] px-5 py-2.5 rounded-[4px] text-xs font-semibold transition-colors"
            >
              <Mail className="w-4 h-4 text-[#57534E]" />
              <span>Ver mensajes</span>
            </Link>

            <Link
              to="/#coleccion"
              className="inline-flex items-center gap-2 bg-transparent border border-[#E7E0D6] text-[#1C1917] hover:border-[#1C1917] px-5 py-2.5 rounded-[4px] text-xs font-semibold transition-colors"
            >
              <Store className="w-4 h-4 text-[#57534E]" />
              <span>Ver catálogo público</span>
            </Link>

            <Link
              to="/equipo/sitio"
              className="inline-flex items-center gap-2 bg-transparent border border-[#E7E0D6] text-[#1C1917] hover:border-[#1C1917] px-5 py-2.5 rounded-[4px] text-xs font-semibold transition-colors"
            >
              <Settings className="w-4 h-4 text-[#57534E]" />
              <span>Editar datos del sitio</span>
            </Link>
          </div>
        </section>

        {/* Recent Activity Table */}
        <section className="bg-white border border-[#E7E0D6] rounded-[8px] p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-[#E7E0D6] mb-4">
            <div>
              <h2 className="font-display text-lg text-[#1C1917] font-semibold">Actividad reciente del catálogo</h2>
              <p className="text-xs text-[#57534E] mt-0.5">Bitácora de modificaciones y curaduría de inventario.</p>
            </div>
            <Link
              to="/equipo/productos"
              className="text-xs font-semibold text-[#9F1D3A] hover:underline flex items-center gap-1"
            >
              <span>Ver registro completo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E7E0D6] text-[#57534E] uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Prenda / Referencia</th>
                  <th className="py-3 px-4">Categoría</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E0D6] text-[#1C1917]">
                {productos.slice(0, 5).map((prod) => {
                  const foto = prod.fotografias_producto?.[0]?.url_publica;
                  return (
                    <tr key={prod.id} className="hover:bg-[#FAF7F2]/50 transition-colors">
                      <td className="py-3 px-4 font-medium flex items-center gap-3">
                        <div className="w-9 h-12 rounded-[2px] bg-[#FAF7F2] border border-[#E7E0D6] overflow-hidden shrink-0">
                          {foto ? (
                            <img src={foto} alt={prod.nombre} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-[#FAF7F2]" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-xs text-[#1C1917]">{prod.nombre}</p>
                          <p className="text-[10px] text-[#57534E] font-mono mt-0.5">
                            REF: {prod.id.slice(0, 8).toUpperCase()}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#57534E]">{prod.categorias?.nombre || 'General'}</td>
                      <td className="py-3 px-4">
                        <Badge variant={prod.activo ? 'success' : 'neutral'} dot>
                          {prod.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to={`/equipo/productos/${prod.id}`}
                          className="p-1 text-[#57534E] hover:text-[#9F1D3A] inline-block"
                          title="Editar prenda"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </PanelLayout>
  );
};
