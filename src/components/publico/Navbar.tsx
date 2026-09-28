import React, { useState, useEffect } from 'react';
import { MessageCircle, Menu, X, ArrowUpRight } from 'lucide-react';
import { SitioConfig } from '../../types';
import { generarEnlaceWhatsApp } from '../../lib/format';

export interface NavbarProps {
  config: SitioConfig | null;
}

const SECCIONES = ['inicio', 'coleccion', 'nosotros', 'encuentranos', 'contacto'];

export const Navbar: React.FC<NavbarProps> = ({ config }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [seccionActiva, setSeccionActiva] = useState('inicio');

  // Resalta en el menu la seccion que realmente esta a la vista.
  useEffect(() => {
    const elementos = SECCIONES.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => Boolean(el)
    );
    if (elementos.length === 0 || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibles = entries.filter((e) => e.isIntersecting);
        if (visibles.length > 0) {
          const masVisible = visibles.reduce((a, b) => (a.intersectionRatio > b.intersectionRatio ? a : b));
          setSeccionActiva(masVisible.target.id);
        }
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    elementos.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const whatsappUrl = generarEnlaceWhatsApp(
    config?.whatsapp,
    config?.mensaje_whatsapp || 'Hola VSHEIN, deseo comunicarme con el Concierge.'
  );

  const closeMenu = () => setMobileMenuOpen(false);

  const claseLink = (id: string) =>
    `text-xs uppercase tracking-widest font-medium pb-1 transition-colors ${
      seccionActiva === id
        ? 'font-semibold text-[#9F1D3A] border-b border-[#9F1D3A]'
        : 'text-[#57534E] hover:text-[#1C1917]'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#E7E0D6] shadow-xs">
      <div className="max-w-7xl mx-auto px-6 md:px-10 h-20 flex items-center justify-between">
        {/* Brand Anchor */}
        <div className="flex items-center gap-10">
          <a
            href="#/"
            className="font-display text-2xl md:text-3xl tracking-tight uppercase text-[#1C1917] hover:opacity-90 transition-opacity"
          >
            {config?.logo_url ? (
              <img
                src={config.logo_url}
                alt={config.nombre_negocio}
                className="h-10 w-auto object-contain"
                width={120}
                height={40}
              />
            ) : (
              config?.nombre_negocio || 'VSHEIN'
            )}
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-7" aria-label="Navegación principal">
            <a href="#inicio" className={claseLink('inicio')}>
              Inicio
            </a>
            <a href="#coleccion" className={claseLink('coleccion')}>
              Colección
            </a>
            <a href="#nosotros" className={claseLink('nosotros')}>
              Nosotros
            </a>
            <a href="#encuentranos" className={claseLink('encuentranos')}>
              Encuéntranos
            </a>
            <a href="#contacto" className={claseLink('contacto')}>
              Contacto
            </a>
          </nav>
        </div>

        {/* Trailing Action & WhatsApp Concierge Button */}
        <div className="flex items-center gap-4">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#128C7E] hover:bg-[#0E7064] text-white px-4 py-2.5 rounded-[4px] text-xs font-semibold tracking-wide transition-all duration-150 active:scale-[0.99] shadow-sm select-none"
          >
            <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">Escríbenos por WhatsApp</span>
            <span className="sm:hidden">WhatsApp</span>
          </a>

          {/* Mobile menu trigger button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-[4px] text-[#1C1917] hover:bg-black/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9F1D3A]"
            aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#E7E0D6] px-6 py-6 animate-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col space-y-4" aria-label="Menú móvil">
            <a
              href="#inicio"
              onClick={closeMenu}
              className={`text-sm uppercase tracking-wider py-1 ${claseLink('inicio')}`}
            >
              Inicio
            </a>
            <a
              href="#coleccion"
              onClick={closeMenu}
              className={`text-sm uppercase tracking-wider py-1 ${claseLink('coleccion')}`}
            >
              Colección
            </a>
            <a
              href="#nosotros"
              onClick={closeMenu}
              className={`text-sm uppercase tracking-wider py-1 ${claseLink('nosotros')}`}
            >
              Nosotros
            </a>
            <a
              href="#encuentranos"
              onClick={closeMenu}
              className={`text-sm uppercase tracking-wider py-1 ${claseLink('encuentranos')}`}
            >
              Encuéntranos
            </a>
            <a
              href="#contacto"
              onClick={closeMenu}
              className={`text-sm uppercase tracking-wider py-1 ${claseLink('contacto')}`}
            >
              Contacto
            </a>
            <div className="pt-3 border-t border-[#E7E0D6] flex justify-between items-center text-xs text-[#57534E]">
              <a href="#/equipo" onClick={closeMenu} className="hover:text-[#9F1D3A] flex items-center gap-1">
                <span>Acceso Equipo</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
