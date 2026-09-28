import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Trash2,
  UploadCloud,
  X,
  Plus,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Info,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRol } from '../../hooks/useRol';
import { useProductos } from '../../hooks/useProductos';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { Producto, FotografiaProducto, Categoria } from '../../types';
import { PanelLayout } from '../../components/panel/PanelLayout';
import { SinPermiso } from '../../components/panel/SinPermiso';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';

export const ProductoFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const { rol } = useAuth();
  const { puede, esSuperadmin, esTrabajador } = useRol();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const { productos, categorias, refetch } = useProductos({ soloActivos: false });

  // Form states
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState<string>('');
  const [categoriaId, setCategoriaId] = useState('');
  const [tallas, setTallas] = useState<string[]>(['S', 'M', 'L']);
  const [nuevaTalla, setNuevaTalla] = useState('');
  const [activo, setActivo] = useState(true);
  const [destacado, setDestacado] = useState(false);
  const [stockActual, setStockActual] = useState<number>(0);
  const [stockMinimo, setStockMinimo] = useState<number>(0);

  // Photos
  const [fotografias, setFotografias] = useState<FotografiaProducto[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Validation
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [guardando, setGuardando] = useState(false);

  // Delete dialog
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load existing product if editing
  useEffect(() => {
    if (isEditing && id) {
      const prod = productos.find((p) => p.id === id);
      if (prod) {
        setNombre(prod.nombre);
        setDescripcion(prod.descripcion || '');
        setPrecio(prod.precio !== null && prod.precio !== undefined ? String(prod.precio) : '');
        setCategoriaId(prod.categoria_id);
        setTallas(prod.tallas || []);
        setActivo(prod.activo);
        setDestacado(prod.destacado);
        setStockActual(prod.stock_actual);
        setStockMinimo(prod.stock_minimo);
        setFotografias(prod.fotografias_producto || []);
      }
    } else {
      // Default to first category if creating
      if (categorias.length > 0 && !categoriaId) {
        setCategoriaId(categorias[0].id);
      }
    }
  }, [isEditing, id, productos, categorias]);

  // Authorization check: Trabajador cannot create or edit
  if (esTrabajador || !puede('crear_producto')) {
    return (
      <PanelLayout breadcrumbs={[{ label: 'Productos', href: '/equipo/productos' }, { label: isEditing ? 'Editar' : 'Crear' }]}>
        <SinPermiso accion="crear o editar prendas del atelier" />
      </PanelLayout>
    );
  }

  const handleAddTalla = () => {
    const t = nuevaTalla.trim().toUpperCase();
    if (!t) return;
    if (!tallas.includes(t)) {
      setTallas([...tallas, t]);
    }
    setNuevaTalla('');
  };

  const handleRemoveTalla = (tallaToRemove: string) => {
    setTallas(tallas.filter((t) => t !== tallaToRemove));
  };

  const handleSetPrincipalPhoto = (photoId: string) => {
    setFotografias((prev) =>
      prev.map((f) => ({
        ...f,
        es_principal: f.id === photoId,
      }))
    );
  };

  const handleRemovePhoto = (photoId: string) => {
    // Only superadmin can remove photos per Section 6.3
    if (!esSuperadmin) {
      showToast('error', 'Solo el Superadmin tiene permisos para eliminar fotografías de archivo.');
      return;
    }
    setFotografias((prev) => prev.filter((f) => f.id !== photoId));
  };

  // Mock upload or real upload to Supabase storage 'catalogo'
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.size > 5 * 1024 * 1024) {
      showToast('error', 'La imagen supera el límite permitido de 5 MB.');
      return;
    }

    setUploadProgress(15);
    const progressTimer = setInterval(() => {
      setUploadProgress((prev) => {
        if (!prev) return 15;
        if (prev >= 90) {
          clearInterval(progressTimer);
          return 90;
        }
        return prev + 25;
      });
    }, 200);

    try {
      const prodId = id || `new-${Date.now()}`;
      const ext = file.name.split('.').pop() || 'webp';
      const path = `productos/${prodId}/${Math.random().toString(36).substring(2, 9)}.${ext}`;

      let publicUrl = URL.createObjectURL(file);

      if (isSupabaseConfigured && supabase) {
        const { error: uploadError } = await supabase.storage.from('catalogo').upload(path, file);
        if (uploadError) {
          throw uploadError;
        }
        publicUrl = supabase.storage.from('catalogo').getPublicUrl(path).data.publicUrl;
      }

      clearInterval(progressTimer);
      setUploadProgress(100);

      const nuevaFoto: FotografiaProducto = {
        id: `photo-${Date.now()}`,
        producto_id: prodId,
        ruta_base: path,
        texto_alternativo: `Fotografía de ${nombre || 'prenda atelier'}`,
        es_principal: fotografias.length === 0,
        orden: fotografias.length + 1,
        url_publica: publicUrl,
      };

      setFotografias((prev) => [...prev, nuevaFoto]);
      showToast('success', 'Fotografía cargada con éxito.');
    } catch (err: unknown) {
      clearInterval(progressTimer);
      showToast('error', err instanceof Error ? err.message : 'Error al subir fotografía.');
    } finally {
      setTimeout(() => setUploadProgress(null), 800);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const nuevosErrores: Record<string, string> = {};
    if (!nombre.trim()) {
      nuevosErrores.nombre = 'El título editorial es obligatorio para la indexación de boutique.';
    } else if (nombre.trim().length < 2 || nombre.trim().length > 140) {
      nuevosErrores.nombre = 'El nombre debe tener entre 2 y 140 caracteres.';
    }

    if (!descripcion.trim()) {
      nuevosErrores.descripcion = 'La descripción de atelier & composición es requerida.';
    } else if (descripcion.trim().length > 600) {
      nuevosErrores.descripcion = 'La descripción no debe exceder 600 caracteres.';
    }

    if (!categoriaId) {
      nuevosErrores.categoria_id = 'Seleccione una categoría editorial.';
    }

    let parsedPrecio: number | null = null;
    if (precio.trim()) {
      const p = Number(precio.replace(/\D/g, ''));
      if (isNaN(p) || p < 0) {
        nuevosErrores.precio = 'Ingrese un precio válido.';
      } else {
        parsedPrecio = p;
      }
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      showToast('error', 'Por favor corrija los campos requeridos.');
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      showToast('error', 'Supabase no está configurado. No se puede guardar la prenda.');
      return;
    }

    setErrores({});
    setGuardando(true);

    try {
      if (isEditing && id) {
          // Update product
          const { error: updErr } = await supabase
            .from('productos')
            .update({
              nombre: nombre.trim(),
              descripcion: descripcion.trim(),
              precio: parsedPrecio,
              categoria_id: categoriaId,
              tallas,
              activo,
              destacado,
              updated_at: new Date().toISOString(),
            })
            .eq('id', id);

          if (updErr) throw updErr;

          // Update photo alt texts
          for (const foto of fotografias) {
            if (foto.id.startsWith('photo-')) {
              await supabase.from('fotografias_producto').insert([
                {
                  producto_id: id,
                  ruta_base: foto.ruta_base,
                  texto_alternativo: foto.texto_alternativo,
                  es_principal: foto.es_principal,
                  orden: foto.orden,
                },
              ]);
            } else {
              await supabase
                .from('fotografias_producto')
                .update({
                  texto_alternativo: foto.texto_alternativo,
                  es_principal: foto.es_principal,
                  orden: foto.orden,
                })
                .eq('id', foto.id);
            }
          }
        } else {
          // Insert new product
          const { data: newProd, error: insErr } = await supabase
            .from('productos')
            .insert([
              {
                nombre: nombre.trim(),
                descripcion: descripcion.trim(),
                precio: parsedPrecio,
                categoria_id: categoriaId,
                tallas,
                activo,
                destacado,
                stock_actual: 1,
                stock_minimo: 1,
              },
            ])
            .select()
            .single();

          if (insErr) throw insErr;

          // Insert photos for the new product
          if (newProd && fotografias.length > 0) {
            for (const foto of fotografias) {
              await supabase.from('fotografias_producto').insert([
                {
                  producto_id: newProd.id,
                  ruta_base: foto.ruta_base,
                  texto_alternativo: foto.texto_alternativo,
                  es_principal: foto.es_principal,
                  orden: foto.orden,
                },
              ]);
            }
          }
        }

      showToast('success', isEditing ? 'Prenda actualizada con éxito.' : 'Nueva prenda catalogada con éxito.');
      await refetch();
      navigate('/equipo/productos');
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Error al guardar la prenda.');
    } finally {
      setGuardando(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!id || !esSuperadmin) return;
    if (!isSupabaseConfigured || !supabase) {
      showToast('error', 'Supabase no está configurado. No se puede eliminar la prenda.');
      return;
    }
    setIsDeleting(true);
    try {
      const { error: delErr } = await supabase.from('productos').delete().eq('id', id);
      if (delErr) throw delErr;
      showToast('success', 'Prenda eliminada definitivamente del atelier.');
      await refetch();
      navigate('/equipo/productos');
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Error al eliminar.');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <PanelLayout
      breadcrumbs={[
        { label: 'Productos', href: '/equipo/productos' },
        { label: isEditing ? `Editar #${id?.slice(0, 6)}` : 'Nueva Prenda' },
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-8 pb-24">
        {/* Header Page Title & Mode Badge */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E7E0D6] pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl md:text-3xl font-bold text-[#1C1917] tracking-tight">
                {isEditing ? 'Editar Producto' : 'Crear Producto'}
              </h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-[#DCFCE7] text-[#166534] border border-[#166534]/20">
                {esSuperadmin ? 'Superadmin Mode' : 'Supervisor Mode'}
              </span>
            </div>
            <p className="text-xs md:text-sm text-[#57534E] mt-1.5 max-w-2xl leading-relaxed">
              Ficha técnica y curaduría de la prenda destinada a exhibición editorial en boutique online y gestión directa de pedidos concierge.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#57534E] italic font-serif">
              SKU: {isEditing && id ? `VSH-2026-${id.slice(0, 4).toUpperCase()}` : 'Autogenerado'}
            </span>
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* COLUMN 1: DATOS DE LA PRENDA (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-[12px] border border-[#E7E0D6] p-7 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-[#FAF7F2] mb-6">
                <h2 className="font-display text-lg font-semibold text-[#1C1917]">
                  Especificaciones Técnicas
                </h2>
                <span className="text-[11px] text-[#57534E]">* Campos obligatorios para indexación</span>
              </div>

              <div className="space-y-5">
                {/* Nombre de la prenda */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5" htmlFor="prod-nombre">
                    Nombre de la prenda <span className="text-[#9F1D3A]">*</span>
                  </label>
                  <input
                    id="prod-nombre"
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. Sobretodo Chesterfield Lana Virgen"
                    className={`w-full bg-white rounded-[4px] border px-3.5 py-2.5 text-xs text-[#1C1917] placeholder-[#57534E]/60 outline-none transition-all ${
                      errores.nombre
                        ? 'border-[#B91C1C] focus:ring-2 focus:ring-[#B91C1C]/20'
                        : 'border-[#E7E0D6] focus:border-[#9F1D3A] focus:ring-2 focus:ring-[#9F1D3A]/20'
                    }`}
                  />
                  {errores.nombre && (
                    <p className="text-xs text-[#B91C1C] flex items-center gap-1 mt-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errores.nombre}</span>
                    </p>
                  )}
                </div>

                {/* Descripción de atelier */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917]" htmlFor="prod-desc">
                      Descripción de atelier & composición <span className="text-[#9F1D3A]">*</span>
                    </label>
                    <span className="text-[10px] text-[#57534E] font-mono">{descripcion.length} / 600</span>
                  </div>
                  <textarea
                    id="prod-desc"
                    rows={4}
                    required
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Describe el corte, caída, origen del tejido y recomendaciones de estilismo..."
                    className={`w-full bg-white rounded-[4px] border p-3 text-xs text-[#1C1917] placeholder-[#57534E]/60 outline-none leading-relaxed resize-none transition-all ${
                      errores.descripcion
                        ? 'border-[#B91C1C] focus:ring-2 focus:ring-[#B91C1C]/20'
                        : 'border-[#E7E0D6] focus:border-[#9F1D3A] focus:ring-2 focus:ring-[#9F1D3A]/20'
                    }`}
                  />
                  {errores.descripcion && (
                    <p className="text-xs text-[#B91C1C] mt-1">{errores.descripcion}</p>
                  )}
                  <p className="text-[11px] text-[#57534E] mt-1">
                    Nota editorial: Mantenga el vocabulario sobrio, enfocado en tactilidad y manufactura artesanal.
                  </p>
                </div>

                {/* Precio & Categoría Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Precio */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5" htmlFor="prod-precio">
                      Precio unitario (COP)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 font-semibold text-[#9F1D3A] text-xs pointer-events-none select-none">
                        $
                      </span>
                      <input
                        id="prod-precio"
                        type="text"
                        value={precio}
                        onChange={(e) => setPrecio(e.target.value)}
                        placeholder="Ej. 480000 (Vacio = Consultar)"
                        className="w-full bg-white rounded-[4px] border border-[#E7E0D6] pl-8 pr-3.5 py-2.5 text-xs text-[#1C1917] font-semibold focus:border-[#9F1D3A] focus:ring-2 focus:ring-[#9F1D3A]/20 outline-none transition-all"
                      />
                    </div>
                    <p className="text-[10px] text-[#57534E] mt-1">
                      Dejar vacío mostrará 'Consultar precio' en vitrina.
                    </p>
                  </div>

                  {/* Categoría */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5" htmlFor="prod-cat">
                      Categoría editorial <span className="text-[#9F1D3A]">*</span>
                    </label>
                    <select
                      id="prod-cat"
                      value={categoriaId}
                      onChange={(e) => setCategoriaId(e.target.value)}
                      className="w-full bg-white rounded-[4px] border border-[#E7E0D6] px-3.5 py-2.5 text-xs text-[#1C1917] focus:border-[#9F1D3A] focus:ring-2 focus:ring-[#9F1D3A]/20 outline-none transition-all cursor-pointer"
                    >
                      <option value="">Seleccione una categoría</option>
                      {categorias.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nombre}
                        </option>
                      ))}
                    </select>
                    {errores.categoria_id && (
                      <p className="text-xs text-[#B91C1C] mt-1">{errores.categoria_id}</p>
                    )}
                  </div>
                </div>

                {/* Stock Info (Solo lectura en formulario per Section 4 & 6.4) */}
                {isEditing && (
                  <div className="p-3 bg-[#FAF7F2] border border-[#E7E0D6] rounded-[4px] flex items-center justify-between text-xs text-[#57534E]">
                    <span>Stock actual en inventario: <strong className="text-[#1C1917]">{stockActual} unidades</strong></span>
                    <span className="text-[10px] uppercase font-semibold text-[#8C7072]">Gestionado por módulo central</span>
                  </div>
                )}

                {/* Tallas disponibles */}
                <div className="pt-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-2">
                    Tallas disponibles en inventario
                  </label>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {tallas.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1.5 bg-[#1C1917] text-white px-3 py-1 rounded-[4px] text-xs font-medium select-none"
                      >
                        <span>{t}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTalla(t)}
                          className="hover:text-red-300 transition-colors"
                          aria-label={`Quitar talla ${t}`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                    {tallas.length === 0 && (
                      <span className="text-xs text-[#57534E] italic">Sin tallas asignadas</span>
                    )}
                  </div>

                  {/* Input Agregar Talla */}
                  <div className="flex items-center gap-2 max-w-xs">
                    <input
                      type="text"
                      value={nuevaTalla}
                      onChange={(e) => setNuevaTalla(e.target.value)}
                      placeholder="Ej. XS, XXL, Bespoke"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTalla();
                        }
                      }}
                      className="flex-1 bg-white rounded-[4px] border border-[#E7E0D6] px-3 py-1.5 text-xs text-[#1C1917] outline-none focus:border-[#9F1D3A]"
                    />
                    <Button type="button" variant="outline" size="sm" onClick={handleAddTalla} leftIcon={<Plus className="w-3.5 h-3.5" />}>
                      Agregar
                    </Button>
                  </div>
                </div>

                {/* Advisory note */}
                <div className="p-3.5 rounded-[4px] bg-[#FEF3C7] border border-[#FDE68A] flex items-start gap-2.5 text-[#92400E] text-xs leading-relaxed">
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#92400E]" />
                  <p>
                    Las prendas catalogadas se envían automáticamente al canal de WhatsApp Concierge con el SKU de atelier para responder a pedidos asistidos.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMN 2: MULTIMEDIA & VISIBILIDAD (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Tarjeta de Fotografía Editorial */}
            <div className="bg-white rounded-[12px] border border-[#E7E0D6] p-7 shadow-xs">
              <h2 className="font-display text-lg font-semibold text-[#1C1917] mb-1">
                Fotografía Editorial & Lookbook
              </h2>
              <p className="text-xs text-[#57534E] mb-5">
                Proporción 3:4 recomendada con iluminación suave natural (máx 5MB).
              </p>

              {/* Upload Zone */}
              <label className="border-2 border-dashed border-[#E7E0D6] hover:border-[#9F1D3A] transition-colors rounded-[8px] p-6 text-center bg-[#FAF7F2]/50 flex flex-col items-center justify-center cursor-pointer group">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-white border border-[#E7E0D6] flex items-center justify-center text-[#57534E] group-hover:text-[#9F1D3A] group-hover:border-[#9F1D3A] transition-all mb-3 shadow-xs">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-[#1C1917] mb-1">
                  Arrastra aquí la fotografía o haz clic
                </p>
                <p className="text-[10px] text-[#57534E] uppercase tracking-wider">
                  PNG, WEBP O JPG HASTA 5MB
                </p>
              </label>

              {/* Progress bar */}
              {uploadProgress !== null && (
                <div className="mt-4 pt-3 border-t border-[#FAF7F2]">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-[#1C1917] font-medium">Subiendo fotografía...</span>
                    <span className="font-semibold text-[#9F1D3A]">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-[#FAF7F2] h-1.5 rounded-full overflow-hidden border border-[#E7E0D6]">
                    <div
                      className="bg-[#9F1D3A] h-full rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Gallery of active thumbnails */}
              <div className="mt-6 pt-5 border-t border-[#E7E0D6]">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1C1917] mb-3">
                  Secuencia de lookbook ({fotografias.length} vistas)
                </h3>

                {fotografias.length === 0 ? (
                  <p className="text-xs text-[#57534E] italic">No hay fotografías cargadas aún.</p>
                ) : (
                  <div className="space-y-3">
                    {fotografias.map((foto, idx) => (
                      <div
                        key={foto.id}
                        className="flex items-center gap-3 p-2.5 rounded-[4px] border border-[#E7E0D6] bg-white hover:border-[#1C1917]/30 transition-all"
                      >
                        <div className="relative w-14 h-18 shrink-0 bg-[#FAF7F2] rounded-[2px] overflow-hidden border border-[#E7E0D6]">
                          {foto.url_publica ? (
                            <img
                              src={foto.url_publica}
                              alt={foto.texto_alternativo}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-[#FAF7F2]" />
                          )}
                          {foto.es_principal && (
                            <span className="absolute bottom-0 inset-x-0 bg-[#9F1D3A] text-white text-[8px] font-semibold text-center py-0.5 tracking-wider uppercase">
                              Principal
                            </span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                          <input
                            type="text"
                            value={foto.texto_alternativo}
                            onChange={(e) => {
                              const newAlt = e.target.value;
                              setFotografias((prev) =>
                                prev.map((f) => (f.id === foto.id ? { ...f, texto_alternativo: newAlt } : f))
                              );
                            }}
                            placeholder="Texto alternativo accesible"
                            className="w-full text-xs text-[#1C1917] border border-[#E7E0D6] rounded-[2px] px-2 py-1 focus:border-[#9F1D3A] outline-none"
                          />
                          <div className="flex items-center justify-between text-[10px] text-[#57534E]">
                            <span>Posición #{idx + 1} en slider</span>
                            {!foto.es_principal && (
                              <button
                                type="button"
                                onClick={() => handleSetPrincipalPhoto(foto.id)}
                                className="text-[#9F1D3A] hover:underline font-semibold"
                              >
                                Marcar Principal
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Delete photo: strictly for Superadmin */}
                        {esSuperadmin && (
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(foto.id)}
                            className="text-[#57534E] hover:text-[#B91C1C] transition-colors p-1"
                            title="Eliminar imagen"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Visibility & Highlights Switches */}
            <div className="bg-white rounded-[12px] border border-[#E7E0D6] p-7 shadow-xs">
              <h2 className="font-display text-lg font-semibold text-[#1C1917] mb-4">
                Visibilidad en Plataforma
              </h2>
              <div className="space-y-4">
                {/* Switch: Activo */}
                <div className="flex items-start justify-between py-2 border-b border-[#FAF7F2]">
                  <div className="pr-4">
                    <span className="text-xs font-semibold text-[#1C1917] block">Activo en catálogo público</span>
                    <p className="text-[11px] text-[#57534E] mt-0.5">
                      Visible en la vitrina pública para cotizaciones y pedidos vía WhatsApp.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={activo}
                    onClick={() => setActivo(!activo)}
                    className={`w-11 h-6 rounded-full p-1 relative transition-colors duration-150 flex-shrink-0 cursor-pointer ${
                      activo ? 'bg-[#9F1D3A]' : 'bg-[#E7E0D6]'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 bg-white rounded-full block shadow-xs transition-transform duration-150 ${
                        activo ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Switch: Destacado */}
                <div className="flex items-start justify-between py-2">
                  <div className="pr-4">
                    <span className="text-xs font-semibold text-[#1C1917] block">Prenda destacada en vitrina</span>
                    <p className="text-[11px] text-[#57534E] mt-0.5">
                      Prioridad en carrusel superior de la colección seleccionada.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={destacado}
                    onClick={() => setDestacado(!destacado)}
                    className={`w-11 h-6 rounded-full p-1 relative transition-colors duration-150 flex-shrink-0 cursor-pointer ${
                      destacado ? 'bg-[#1C1917]' : 'bg-[#E7E0D6]'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 bg-white rounded-full block shadow-xs transition-transform duration-150 ${
                        destacado ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Docked Bottom Actions Bar */}
        <aside className="fixed bottom-0 left-0 md:left-60 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E7E0D6] py-3.5 px-6 md:px-8 shadow-md">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Left: Delete action for Superadmin when editing */}
            <div>
              {isEditing && esSuperadmin ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-1.5 text-[#B91C1C] hover:text-[#93000A] text-xs font-semibold px-3 py-2 rounded-[4px] hover:bg-[#FEE2E2] transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar producto</span>
                </button>
              ) : (
                <span className="text-[11px] text-[#57534E]">
                  {isEditing ? `ID: ${id?.slice(0, 8).toUpperCase()}` : 'Borrador nuevo'}
                </span>
              )}
            </div>

            {/* Right: Cancel & Save buttons */}
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" size="md" onClick={() => navigate('/equipo/productos')}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" size="md" isLoading={guardando} leftIcon={<Save className="w-4 h-4" />}>
                Guardar prenda
              </Button>
            </div>
          </div>
        </aside>
      </form>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <ConfirmDialog
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteProduct}
          title="Confirmar eliminación irreversible"
          message={`Esta acción eliminará "${nombre}" del catálogo público del atelier.`}
          confirmText="Eliminar definitivamente"
          requiredConfirmationText={nombre}
          isLoading={isDeleting}
        />
      )}
    </PanelLayout>
  );
};
