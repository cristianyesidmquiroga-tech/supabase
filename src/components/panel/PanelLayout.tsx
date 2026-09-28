import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Shirt,
  FolderTree,
  Percent,
  Sliders,
  FileText,
  Mail,
  Users,
  LogOut,
  Lock,
  ArrowUpRight,
  Menu,
  X,
  Shield,
  LifeBuoy,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRol } from '../../hooks/useRol';

export interface PanelLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export const PanelLayout: React.FC<PanelLayoutProps> = ({ children, breadcrumbs = [] }) => {
  const { perfil, signOut, rol, rolEtiqueta } = useAuth();
  const { esSuperadmin, esSupervisor, esTrabajador } = useRol();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/equipo');
  };

  // Define sidebar navigation items based on strict role matrix
  const navItems = [
    {
      label: 'Inicio',
      href: '/equipo/panel',
      icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
      visible: esSuperadmin || esSupervisor, // Hidden for Trabajador
    },
    {
      label: 'Productos',
      href: '/equipo/productos',
      icon: <Shirt className="w-4 h-4 shrink-0" />,
      visible: true, // Visible for all 3 roles
    },
    {
      label: 'Categorías',
      href: '/equipo/categorias',
      icon: <FolderTree className="w-4 h-4 shrink-0" />,
      visible: esSuperadmin || esSupervisor,
    },
    {
      label: 'Promociones',
      href: '/equipo/promociones',
      icon: <Percent className="w-4 h-4 shrink-0" />,
      visible: esSuperadmin || esSupervisor,
    },
    {
      label: 'Datos del sitio',
      href: '/equipo/sitio',
      icon: <Sliders className="w-4 h-4 shrink-0" />,
      visible: esSuperadmin || esSupervisor,
    },
    {
      label: 'Políticas',
      href: '/equipo/politicas',
      icon: <FileText className="w-4 h-4 shrink-0" />,
      visible: esSuperadmin || esSupervisor,
    },
    {
      label: 'Mensajes',
      href: '/equipo/mensajes',
      icon: <Mail className="w-4 h-4 shrink-0" />,
      visible: esSuperadmin || esSupervisor,
      hasDot: true,
    },
    {
      label: 'Usuarios',
      href: '/equipo/usuarios',
      icon: <Users className="w-4 h-4 shrink-0" />,
      visible: esSuperadmin, // Only superadmin!
    },
  ].filter((item) => item.visible);

  const initialLetter = perfil?.nombre_completo?.charAt(0).toUpperCase() || 'U';

  const roleBadgeStyle = {
    administradora: 'bg-[#F3E8EA] text-[#9F1D3A] border-[#9F1D3A]/20',
    supervisor: 'bg-[#FAF7F2] text-[#1C1917] border-[#E7E0D6]',
    empleada: 'bg-[#F4ECE8] text-[#57534E] border-[#E7E0D6]',
  }[rol || 'empleada'];

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C1917] flex flex-col font-body">
      {/* Top Global Bar */}
      <header className="bg-white/90 backdrop-blur-md sticky top-0 z-40 w-full border-b border-[#E7E0D6]">
        <div className="flex justify-between items-center w-full px-4 md:px-8 max-w-7xl mx-auto h-16">
          {/* Brand Anchor + Mobile menu trigger */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="md:hidden p-1.5 rounded-[4px] border border-[#E7E0D6] text-[#1C1917]"
              aria-label="Abrir barra lateral"
            >
              {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <span className="font-display text-xl tracking-wider uppercase text-[#1C1917] font-bold">
              VSHEIN
            </span>
            <span className="hidden sm:inline-block text-[10px] uppercase tracking-widest text-[#57534E] border-l border-[#E7E0D6] pl-3 ml-1 font-semibold">
              Atelier Internal
            </span>
          </div>

          {/* Links & Return to Site */}
          <div className="flex items-center gap-6">
            <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-[#57534E]">
              <Link to="/" className="hover:text-[#9F1D3A] transition-colors">
                Main Boutique
              </Link>
              <a
                href="mailto:soporte@vshein.com"
                className="hover:text-[#9F1D3A] transition-colors flex items-center gap-1"
              >
                <LifeBuoy className="w-3.5 h-3.5" />
                <span>Concierge Support</span>
              </a>
            </nav>

            <div className="h-4 w-px bg-[#E7E0D6] hidden lg:block" />

            <Link
              to="/"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#57534E] hover:text-[#9F1D3A] transition-colors"
            >
              <span>Return to Site</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>

            {/* Profile pill */}
            <div className="flex items-center gap-3 pl-3 border-l border-[#E7E0D6]">
              <div className="w-8 h-8 rounded-full bg-[#1C1917] text-white flex items-center justify-center font-display text-xs font-semibold shadow-xs">
                {initialLetter}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold text-[#1C1917] leading-tight">
                  {perfil?.nombre_completo || 'Usuario'}
                </span>
                <span className="text-[10px] text-[#57534E] uppercase tracking-wider">
                  {rolEtiqueta}
                </span>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="p-1.5 rounded-[4px] text-[#57534E] hover:text-[#B91C1C] hover:bg-[#FEE2E2]/60 transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace: 240px Fixed Sidebar + Content */}
      <div className="flex flex-1 min-h-[calc(100vh-64px)]">
        {/* SIDEBAR (240px fixed on desktop, drawer on mobile) */}
        <aside
          className={`${
            mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          } fixed md:static inset-y-16 left-0 z-30 w-60 bg-white border-r border-[#E7E0D6] flex flex-col justify-between select-none transition-transform duration-200 ease-in-out md:transition-none`}
        >
          <div>
            {/* Sidebar Brand Header */}
            <div className="px-6 pt-6 pb-4 border-b border-[#FAF7F2]">
              <p className="font-display text-base font-semibold text-[#1C1917] tracking-tight">
                VSHEIN Atelier
              </p>
              <p className="text-[10px] text-[#57534E] uppercase tracking-wider font-semibold mt-0.5">
                Panel de Control
              </p>
            </div>

            {/* Navigation links */}
            <nav className="py-4 flex flex-col space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={`flex items-center justify-between px-6 py-2.5 text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-[#F3E8EA] text-[#9F1D3A] border-l-[3px] border-[#9F1D3A]'
                        : 'text-[#57534E] hover:text-[#1C1917] hover:bg-[#FAF7F2]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    {item.hasDot && (
                      <span className="w-2 h-2 rounded-full bg-[#9F1D3A]" aria-hidden="true" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Sidebar bottom */}
          <div className="p-5 border-t border-[#E7E0D6] bg-[#FAF7F2]/60 space-y-2">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-[#166534]" />
              <span className="text-[11px] font-semibold text-[#1C1917]">
                {esTrabajador ? 'Acceso: Trabajador' : 'Conexión Segura'}
              </span>
            </div>
            {esTrabajador ? (
              <div className="bg-white border border-[#E7E0D6] px-2.5 py-1.5 rounded-[4px]">
                <p className="text-[10px] font-semibold text-[#1C1917] uppercase tracking-wider">
                  Solo Lectura
                </p>
                <p className="text-[9px] text-[#57534E]">Sin permisos de edición</p>
              </div>
            ) : (
              <span className={`inline-block px-2 py-0.5 rounded-[2px] text-[10px] font-semibold uppercase tracking-wider border ${roleBadgeStyle}`}>
                Rol {rolEtiqueta}
              </span>
            )}
            <p className="text-[10px] text-[#57534E]/80 tracking-tight">Atelier System v2.6.4</p>
          </div>
        </aside>

        {/* Backdrop for mobile */}
        {mobileSidebarOpen && (
          <div
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 z-20 md:hidden"
            aria-hidden="true"
          />
        )}

        {/* MAIN CANVAS */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#FAF7F2] overflow-y-auto">
          {/* Breadcrumb sub-header */}
          <div className="h-14 bg-white border-b border-[#E7E0D6] px-6 md:px-8 flex items-center justify-between">
            <nav aria-label="Migas de pan" className="flex items-center gap-2 text-xs text-[#57534E]">
              <Link to="/equipo/panel" className="hover:text-[#1C1917] transition-colors">
                Panel
              </Link>
              {breadcrumbs.map((bc, idx) => (
                <React.Fragment key={idx}>
                  <span className="text-[#8C7072]">/</span>
                  {bc.href ? (
                    <Link to={bc.href} className="hover:text-[#1C1917] transition-colors">
                      {bc.label}
                    </Link>
                  ) : (
                    <span className="font-semibold text-[#1C1917]">{bc.label}</span>
                  )}
                </React.Fragment>
              ))}
            </nav>

            <div className="flex items-center gap-2 text-xs text-[#57534E]">
              <span className={`px-2 py-0.5 rounded-[2px] text-[10px] font-semibold uppercase tracking-wider border ${roleBadgeStyle}`}>
                {rolEtiqueta}
              </span>
            </div>
          </div>

          {/* Page Content Body */}
          <div className="p-6 md:p-8 max-w-7xl w-full mx-auto flex-1">{children}</div>
        </main>
      </div>

      {/* Internal Staff Footer */}
      <footer className="bg-white border-t border-[#E7E0D6] py-3.5 px-6 md:px-8 text-xs text-[#57534E]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2 text-center md:text-left">
          <span>© {new Date().getFullYear()} VSHEIN Atelier. Internal Staff Access Portal. Confidential.</span>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <Link to="/politicas/privacidad" className="hover:text-[#9F1D3A]">Security Policy</Link>
            <span>·</span>
            <Link to="/politicas/terminos" className="hover:text-[#9F1D3A]">Terms of Access</Link>
            <span>·</span>
            <a href="mailto:soporte@vshein.com" className="hover:text-[#9F1D3A]">Direct Concierge</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
