import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Save,
  Building2,
  Phone,
  MessageCircle,
  MapPin,
  Share2,
  FileText,
  Sparkles,
  Info,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRol } from '../../hooks/useRol';
import { useConfig } from '../../hooks/useConfig';
import { PanelLayout } from '../../components/panel/PanelLayout';
import { SinPermiso } from '../../components/panel/SinPermiso';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';

export const SitioConfigPage: React.FC = () => {
  const { rol } = useAuth();
  const { esTrabajador, puede } = useRol();
  const { config, updateConfig } = useConfig();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'general' | 'hero' | 'nosotros' | 'contacto' | 'social'>('general');
  const [guardando, setGuardando] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    nombre_negocio: '',
    razon_social: '',
    nit: '',
    eslogan: '',
    descripcion: '',
    hero_titulo: '',
    hero_subtitulo: '',
    hero_imagen_url: '',
    logo_url: '',
    nosotros_titulo: '',
    nosotros_texto: '',
    mision: '',
    vision: '',
    whatsapp: '',
    mensaje_whatsapp: '',
    telefono: '',
    email_contacto: '',
    direccion: '',
    ciudad: '',
    departamento: '',
    mapa_embed_url: '',
    instagram_url: '',
    facebook_url: '',
    tiktok_url: '',
    responsable_datos: '',
  });

  useEffect(() => {
    if (config) {
      setFormData({
        nombre_negocio: config.nombre_negocio || '',
        razon_social: config.razon_social || '',
        nit: config.nit || '',
        eslogan: config.eslogan || '',
        descripcion: config.descripcion || '',
        hero_titulo: config.hero_titulo || '',
        hero_subtitulo: config.hero_subtitulo || '',
        hero_imagen_url: config.hero_imagen_url || '',
        logo_url: config.logo_url || '',
        nosotros_titulo: config.nosotros_titulo || '',
        nosotros_texto: config.nosotros_texto || '',
        mision: config.mision || '',
        vision: config.vision || '',
        whatsapp: config.whatsapp || '',
        mensaje_whatsapp: config.mensaje_whatsapp || '',
        telefono: config.telefono || '',
        email_contacto: config.email_contacto || '',
        direccion: config.direccion || '',
        ciudad: config.ciudad || '',
        departamento: config.departamento || '',
        mapa_embed_url: config.mapa_embed_url || '',
        instagram_url: config.instagram_url || '',
        facebook_url: config.facebook_url || '',
        tiktok_url: config.tiktok_url || '',
        responsable_datos: config.responsable_datos || '',
      });
    }
  }, [config]);

  // Worker check
  if (esTrabajador || !puede('gestionar_sitio')) {
    return (
      <PanelLayout breadcrumbs={[{ label: 'Datos del sitio' }]}>
        <SinPermiso accion="modificar la configuración institucional del atelier" />
      </PanelLayout>
    );
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);

    try {
      const res = await updateConfig(formData);
      if (res.success) {
        showToast('success', 'Configuración del sitio actualizada correctamente.');
      } else {
        showToast('error', res.error || 'Error al guardar configuración.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error inesperado.';
      showToast('error', msg);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <PanelLayout breadcrumbs={[{ label: 'Datos del sitio' }]}>
      <form onSubmit={handleSave} className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-[#E7E0D6]">
          <div>
            <h1 className="font-display text-3xl text-[#1C1917] tracking-tight font-bold">
              Datos del Sitio y Atelier
            </h1>
            <p className="text-xs md:text-sm text-[#57534E] mt-1">
              Personaliza la identidad de marca, canales de WhatsApp y textos editoriales.
            </p>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            leftIcon={<Save className="w-4 h-4" />}
            isLoading={guardando}
          >
            Guardar Cambios
          </Button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-[#E7E0D6] overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2 text-xs font-semibold rounded-[4px] transition-colors whitespace-nowrap ${
              activeTab === 'general'
                ? 'bg-[#F3E8EA] text-[#9F1D3A] border-b-2 border-[#9F1D3A]'
                : 'text-[#57534E] hover:text-[#1C1917] hover:bg-white'
            }`}
          >
            1. Identidad & Razón Social
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('hero')}
            className={`px-4 py-2 text-xs font-semibold rounded-[4px] transition-colors whitespace-nowrap ${
              activeTab === 'hero'
                ? 'bg-[#F3E8EA] text-[#9F1D3A] border-b-2 border-[#9F1D3A]'
                : 'text-[#57534E] hover:text-[#1C1917] hover:bg-white'
            }`}
          >
            2. Portada & Hero
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('nosotros')}
            className={`px-4 py-2 text-xs font-semibold rounded-[4px] transition-colors whitespace-nowrap ${
              activeTab === 'nosotros'
                ? 'bg-[#F3E8EA] text-[#9F1D3A] border-b-2 border-[#9F1D3A]'
                : 'text-[#57534E] hover:text-[#1C1917] hover:bg-white'
            }`}
          >
            3. Manifiesto & Nosotros
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('contacto')}
            className={`px-4 py-2 text-xs font-semibold rounded-[4px] transition-colors whitespace-nowrap ${
              activeTab === 'contacto'
                ? 'bg-[#F3E8EA] text-[#9F1D3A] border-b-2 border-[#9F1D3A]'
                : 'text-[#57534E] hover:text-[#1C1917] hover:bg-white'
            }`}
          >
            4. WhatsApp & Ubicación
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('social')}
            className={`px-4 py-2 text-xs font-semibold rounded-[4px] transition-colors whitespace-nowrap ${
              activeTab === 'social'
                ? 'bg-[#F3E8EA] text-[#9F1D3A] border-b-2 border-[#9F1D3A]'
                : 'text-[#57534E] hover:text-[#1C1917] hover:bg-white'
            }`}
          >
            5. Redes & Legal
          </button>
        </div>

        {/* Tab 1: General */}
        {activeTab === 'general' && (
          <div className="bg-white rounded-[8px] border border-[#E7E0D6] p-6 space-y-5 shadow-xs">
            <h2 className="font-display text-lg font-bold text-[#1C1917] flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#9F1D3A]" />
              <span>Identidad Comercial y Fiscal</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre de marca / Fantasía *"
                value={formData.nombre_negocio}
                onChange={(e) => handleChange('nombre_negocio', e.target.value)}
                placeholder="VSHEIN"
                required
              />
              <Input
                label="Razón Social Legal"
                value={formData.razon_social}
                onChange={(e) => handleChange('razon_social', e.target.value)}
                placeholder="VSHEIN S.A.S."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="NIT / Identificación Tributaria"
                value={formData.nit}
                onChange={(e) => handleChange('nit', e.target.value)}
                placeholder="901.876.543-2"
              />
              <Input
                label="Eslogan Editorial"
                value={formData.eslogan}
                onChange={(e) => handleChange('eslogan', e.target.value)}
                placeholder="Moda femenina contemporánea, siluetas sobrias y piezas de edición limitada."
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917]">
                Descripción general del estudio
              </label>
              <textarea
                rows={3}
                value={formData.descripcion}
                onChange={(e) => handleChange('descripcion', e.target.value)}
                className="w-full bg-white text-[#1C1917] border border-[#E7E0D6] rounded-[4px] p-3 text-xs focus:border-[#9F1D3A] outline-none"
                placeholder="Resumen del catálogo editorial para metadatos y buscadores..."
              />
            </div>

            <Input
              label="URL del Logo (Opcional - Imagen de isotipo)"
              value={formData.logo_url}
              onChange={(e) => handleChange('logo_url', e.target.value)}
              placeholder="https://... o dejar vacío para logotipo tipográfico Playfair"
            />
          </div>
        )}

        {/* Tab 2: Hero */}
        {activeTab === 'hero' && (
          <div className="bg-white rounded-[8px] border border-[#E7E0D6] p-6 space-y-5 shadow-xs">
            <h2 className="font-display text-lg font-bold text-[#1C1917] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#9F1D3A]" />
              <span>Portada Principal (Hero)</span>
            </h2>

            <Input
              label="Título del Hero"
              value={formData.hero_titulo}
              onChange={(e) => handleChange('hero_titulo', e.target.value)}
              placeholder="Elegancia Silenciosa"
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917]">
                Subtítulo del Hero
              </label>
              <textarea
                rows={3}
                value={formData.hero_subtitulo}
                onChange={(e) => handleChange('hero_subtitulo', e.target.value)}
                className="w-full bg-white text-[#1C1917] border border-[#E7E0D6] rounded-[4px] p-3 text-xs focus:border-[#9F1D3A] outline-none"
                placeholder="Colección editorial concebida para la mujer contemporánea..."
              />
            </div>

            <Input
              label="URL Imagen de fondo del Hero"
              value={formData.hero_imagen_url}
              onChange={(e) => handleChange('hero_imagen_url', e.target.value)}
              placeholder="https://..."
              helperText="Imagen editorial de alta resolución para el fondo de pantalla completa."
            />
          </div>
        )}

        {/* Tab 3: Nosotros */}
        {activeTab === 'nosotros' && (
          <div className="bg-white rounded-[8px] border border-[#E7E0D6] p-6 space-y-5 shadow-xs">
            <h2 className="font-display text-lg font-bold text-[#1C1917] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#9F1D3A]" />
              <span>Manifiesto del Atelier & Sección Nosotros</span>
            </h2>

            <Input
              label="Título de la sección"
              value={formData.nosotros_titulo}
              onChange={(e) => handleChange('nosotros_titulo', e.target.value)}
              placeholder="Nuestra Historia y Filosofía Textil"
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917]">
                Texto editorial de historia
              </label>
              <textarea
                rows={5}
                value={formData.nosotros_texto}
                onChange={(e) => handleChange('nosotros_texto', e.target.value)}
                className="w-full bg-white text-[#1C1917] border border-[#E7E0D6] rounded-[4px] p-3 text-xs focus:border-[#9F1D3A] outline-none leading-relaxed"
                placeholder="Narrativa sobre la concepción del taller, hilados nobles y patronaje..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917]">
                  Misión del Atelier
                </label>
                <textarea
                  rows={4}
                  value={formData.mision}
                  onChange={(e) => handleChange('mision', e.target.value)}
                  className="w-full bg-white text-[#1C1917] border border-[#E7E0D6] rounded-[4px] p-3 text-xs focus:border-[#9F1D3A] outline-none"
                  placeholder="Nuestra misión textil..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917]">
                  Visión y Futuro
                </label>
                <textarea
                  rows={4}
                  value={formData.vision}
                  onChange={(e) => handleChange('vision', e.target.value)}
                  className="w-full bg-white text-[#1C1917] border border-[#E7E0D6] rounded-[4px] p-3 text-xs focus:border-[#9F1D3A] outline-none"
                  placeholder="Nuestra visión sostenible..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Contacto */}
        {activeTab === 'contacto' && (
          <div className="bg-white rounded-[8px] border border-[#E7E0D6] p-6 space-y-5 shadow-xs">
            <h2 className="font-display text-lg font-bold text-[#1C1917] flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-[#9F1D3A]" />
              <span>Canales Directos & WhatsApp Concierge</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Línea WhatsApp Concierge *"
                value={formData.whatsapp}
                onChange={(e) => handleChange('whatsapp', e.target.value)}
                placeholder="+57 310 987 6543"
                required
                helperText="Número con código internacional (ej. +573109876543)."
              />
              <Input
                label="Mensaje predeterminado de WhatsApp"
                value={formData.mensaje_whatsapp}
                onChange={(e) => handleChange('mensaje_whatsapp', e.target.value)}
                placeholder="Hola, deseo consultar por una prenda de la colección"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Teléfono fijo o celular alterno"
                value={formData.telefono}
                onChange={(e) => handleChange('telefono', e.target.value)}
                placeholder="+57 (601) 456 7890"
              />
              <Input
                type="email"
                label="Correo de atención y solicitudes"
                value={formData.email_contacto}
                onChange={(e) => handleChange('email_contacto', e.target.value)}
                placeholder="concierge@vshein.com"
              />
            </div>

            <h3 className="font-display text-base font-bold text-[#1C1917] pt-3 flex items-center gap-2 border-t border-[#E7E0D6]">
              <MapPin className="w-4 h-4 text-[#9F1D3A]" />
              <span>Ubicación del Showroom</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Dirección"
                value={formData.direccion}
                onChange={(e) => handleChange('direccion', e.target.value)}
                placeholder="Calle 82 # 12-45, Chicó Norte"
              />
              <Input
                label="Ciudad"
                value={formData.ciudad}
                onChange={(e) => handleChange('ciudad', e.target.value)}
                placeholder="Bogotá D.C."
              />
              <Input
                label="Departamento / Región"
                value={formData.departamento}
                onChange={(e) => handleChange('departamento', e.target.value)}
                placeholder="Cundinamarca"
              />
            </div>

            <Input
              label="URL Embed de Google Maps"
              value={formData.mapa_embed_url}
              onChange={(e) => handleChange('mapa_embed_url', e.target.value)}
              placeholder="https://www.google.com/maps/embed?..."
              helperText="Enlace seguro de iframe proporcionado por Google Maps."
            />
          </div>
        )}

        {/* Tab 5: Social & Legal */}
        {activeTab === 'social' && (
          <div className="bg-white rounded-[8px] border border-[#E7E0D6] p-6 space-y-5 shadow-xs">
            <h2 className="font-display text-lg font-bold text-[#1C1917] flex items-center gap-2">
              <Share2 className="w-5 h-5 text-[#9F1D3A]" />
              <span>Redes Sociales & Cumplimiento Legal</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Instagram URL"
                value={formData.instagram_url}
                onChange={(e) => handleChange('instagram_url', e.target.value)}
                placeholder="https://instagram.com/vshein_atelier"
              />
              <Input
                label="Facebook URL"
                value={formData.facebook_url}
                onChange={(e) => handleChange('facebook_url', e.target.value)}
                placeholder="https://facebook.com/vshein"
              />
              <Input
                label="TikTok URL"
                value={formData.tiktok_url}
                onChange={(e) => handleChange('tiktok_url', e.target.value)}
                placeholder="https://tiktok.com/@vshein"
              />
            </div>

            <Input
              label="Responsable de Protección de Datos (Habeas Data)"
              value={formData.responsable_datos}
              onChange={(e) => handleChange('responsable_datos', e.target.value)}
              placeholder="Oficial de Privacidad y Cumplimiento VSHEIN"
              helperText="Nombre o cargo utilizado en las plantillas dinámicas de políticas legales."
            />
          </div>
        )}
      </form>
    </PanelLayout>
  );
};
