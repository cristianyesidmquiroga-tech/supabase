import React, { useState, useEffect } from 'react';
import { useConfig } from '../hooks/useConfig';
import { useProductos } from '../hooks/useProductos';
import { Producto } from '../types';
import { Navbar } from '../components/publico/Navbar';
import { Hero } from '../components/publico/Hero';
import { MasVendidos } from '../components/publico/MasVendidos';
import { Coleccion } from '../components/publico/Coleccion';
import { Nosotros } from '../components/publico/Nosotros';
import { Encuentranos } from '../components/publico/Encuentranos';
import { Contacto } from '../components/publico/Contacto';
import { Footer } from '../components/publico/Footer';
import { FloatingWhatsApp } from '../components/publico/FloatingWhatsApp';
import { ProductDetailModal } from '../components/publico/ProductDetailModal';

export const LandingPage: React.FC = () => {
  const { config } = useConfig();
  const { productos, categorias, promociones, masVendidos, loading, error, refetch } = useProductos({
    soloActivos: true,
  });

  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);

  // Inject JSON-LD Schema (ClothingStore / LocalBusiness)
  useEffect(() => {
    if (!config) return;

    const schemaData: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'ClothingStore',
      name: config.nombre_negocio || undefined,
      description: config.descripcion || config.eslogan || undefined,
      telephone: config.telefono || config.whatsapp || undefined,
      email: config.email_contacto || undefined,
      sameAs: [config.instagram_url, config.facebook_url, config.tiktok_url].filter(Boolean),
    };

    // La direccion solo se incluye si es real; nunca se inventa una ubicacion.
    if (config.direccion) {
      schemaData.address = {
        '@type': 'PostalAddress',
        streetAddress: config.direccion,
        addressLocality: config.ciudad || undefined,
        addressRegion: config.departamento || undefined,
        addressCountry: 'CO',
      };
    }

    let scriptTag = document.getElementById('json-ld-store') as HTMLScriptElement;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'json-ld-store';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(schemaData);

    return () => {
      const tag = document.getElementById('json-ld-store');
      if (tag) tag.remove();
    };
  }, [config]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1C1917]">
      {/* Skip to Content for Accessibility */}
      <a
        href="#coleccion"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-[#9F1D3A] text-white px-4 py-2 text-xs font-semibold rounded-[4px]"
      >
        Saltar al contenido principal
      </a>

      {/* 1. Header / Navbar */}
      <Navbar config={config} />

      {/* Main Content */}
      <main id="main-content" className="flex-1">
        {/* 2. Hero Section */}
        <Hero config={config} promociones={promociones} />

        {/* 3. Más Vendidos (solo si existe y tiene unidades > 0) */}
        <MasVendidos
          productos={productos}
          masVendidos={masVendidos}
          config={config}
          onSelectProducto={(prod) => setSelectedProducto(prod)}
        />

        {/* 4. Colección / Catálogo con Filtros */}
        <Coleccion
          productos={productos}
          categorias={categorias}
          config={config}
          loading={loading}
          error={error}
          onRetry={refetch}
          onSelectProducto={(prod) => setSelectedProducto(prod)}
        />

        {/* 5. Nosotros */}
        <Nosotros config={config} />

        {/* 6. Encuéntranos */}
        <Encuentranos config={config} />

        {/* 7. Contacto */}
        <Contacto config={config} />
      </main>

      {/* 8. Footer */}
      <Footer config={config} />

      {/* 9. Floating WhatsApp CTA */}
      <FloatingWhatsApp config={config} />

      {/* 10. Product Detail Modal */}
      {selectedProducto && (
        <ProductDetailModal
          producto={selectedProducto}
          config={config}
          onClose={() => setSelectedProducto(null)}
        />
      )}
    </div>
  );
};
