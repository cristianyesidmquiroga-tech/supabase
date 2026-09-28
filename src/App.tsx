import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import { OfflineBanner } from './components/ui/OfflineBanner';
import { RutaProtegida } from './components/panel/RutaProtegida';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { PoliticaDetallePage } from './pages/PoliticaDetallePage';

// Panel Pages
import { LoginPage } from './pages/panel/LoginPage';
import { PanelInicioPage } from './pages/panel/PanelInicioPage';
import { ProductosPage } from './pages/panel/ProductosPage';
import { ProductoFormPage } from './pages/panel/ProductoFormPage';
import { CategoriasPage } from './pages/panel/CategoriasPage';
import { PromocionesPage } from './pages/panel/PromocionesPage';
import { SitioConfigPage } from './pages/panel/SitioConfigPage';
import { PoliticasAdminPage } from './pages/panel/PoliticasAdminPage';
import { MensajesPage } from './pages/panel/MensajesPage';
import { UsuariosPage } from './pages/panel/UsuariosPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <OfflineBanner />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/politicas/:slug" element={<PoliticaDetallePage />} />

            {/* Auth / Login */}
            <Route path="/equipo" element={<LoginPage />} />
            <Route path="/equipo/login" element={<LoginPage />} />

            {/* Protected Admin Routes */}
            <Route
              path="/equipo/panel"
              element={
                <RutaProtegida>
                  <PanelInicioPage />
                </RutaProtegida>
              }
            />
            <Route
              path="/equipo/inicio"
              element={
                <RutaProtegida>
                  <PanelInicioPage />
                </RutaProtegida>
              }
            />
            <Route
              path="/equipo/productos"
              element={
                <RutaProtegida>
                  <ProductosPage />
                </RutaProtegida>
              }
            />
            <Route
              path="/equipo/productos/nuevo"
              element={
                <RutaProtegida>
                  <ProductoFormPage />
                </RutaProtegida>
              }
            />
            <Route
              path="/equipo/productos/:id"
              element={
                <RutaProtegida>
                  <ProductoFormPage />
                </RutaProtegida>
              }
            />
            <Route
              path="/equipo/categorias"
              element={
                <RutaProtegida>
                  <CategoriasPage />
                </RutaProtegida>
              }
            />
            <Route
              path="/equipo/promociones"
              element={
                <RutaProtegida>
                  <PromocionesPage />
                </RutaProtegida>
              }
            />
            <Route
              path="/equipo/sitio"
              element={
                <RutaProtegida>
                  <SitioConfigPage />
                </RutaProtegida>
              }
            />
            <Route
              path="/equipo/politicas"
              element={
                <RutaProtegida>
                  <PoliticasAdminPage />
                </RutaProtegida>
              }
            />
            <Route
              path="/equipo/mensajes"
              element={
                <RutaProtegida>
                  <MensajesPage />
                </RutaProtegida>
              }
            />
            <Route
              path="/equipo/usuarios"
              element={
                <RutaProtegida>
                  <UsuariosPage />
                </RutaProtegida>
              }
            />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
