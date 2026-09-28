import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { resolverUrlImagen } from '../lib/format';
import { Producto, Categoria, Promocion, ProductoMasVendido, RolUsuario } from '../types';

export function useProductos(options?: { rol?: RolUsuario | null; soloActivos?: boolean }) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [masVendidos, setMasVendidos] = useState<ProductoMasVendido[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const esTrabajador = options?.rol === 'empleada';
  const soloActivos = options?.soloActivos ?? (esTrabajador || !options?.rol);

  const fetchCategorias = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setCategorias([]);
      return [];
    }

    try {
      let query = supabase.from('categorias').select('*').order('orden', { ascending: true });
      if (!options?.rol) {
        query = query.eq('activa', true);
      }
      const { data, error: catErr } = await query;
      if (catErr) {
        setCategorias([]);
        return [];
      }
      setCategorias((data || []) as Categoria[]);
      return (data || []) as Categoria[];
    } catch {
      setCategorias([]);
      return [];
    }
  }, [options?.rol]);

  const fetchProductos = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured || !supabase) {
      setProductos([]);
      setPromociones([]);
      setMasVendidos([]);
      setError('Supabase no está configurado.');
      setLoading(false);
      return;
    }

    try {
      // Cumplimiento seccion 6.3: el trabajador consulta unicamente columnas
      // permitidas (nunca stock, activo ni descripcion).
      let selectCols = esTrabajador
        ? 'id, nombre, precio, tallas, categoria_id, categorias(nombre), fotografias_producto(id, ruta_base, texto_alternativo, es_principal, orden)'
        : '*, categorias(*), fotografias_producto(*)';

      let query = supabase.from('productos').select(selectCols);

      if (soloActivos) {
        query = query.eq('activo', true);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error: prodErr } = await query;

      if (prodErr) {
        setProductos([]);
        setError(prodErr.message);
      } else {
        const mapped = (data || []).map((prod: any) => {
          const fotos = (prod.fotografias_producto || []).map((f: any) => ({
            ...f,
            url_publica: resolverUrlImagen(supabase, 'catalogo', f.ruta_base),
          }));

          fotos.sort((a: any, b: any) => a.orden - b.orden);

          return {
            ...prod,
            fotografias_producto: fotos,
          };
        });

        setProductos(mapped as Producto[]);
      }

      // Promociones vigentes para el hero publico. Si no hay filas o falla,
      // la seccion simplemente queda vacia (nunca se rellena con datos falsos).
      try {
        const { data: promoData } = await supabase
          .from('promociones')
          .select('*')
          .eq('activa', true)
          .order('orden', { ascending: true });

        const mappedPromos = (promoData || []).map((p) => ({
          ...p,
          url_publica: resolverUrlImagen(supabase, 'promociones', p.ruta_imagen),
        }));
        setPromociones(mappedPromos);
      } catch {
        setPromociones([]);
      }

      // Vista de mas vendidos. Igual: vacio si no hay datos reales.
      try {
        const { data: mvData } = await supabase
          .from('productos_mas_vendidos')
          .select('id, nombre, slug, stock_actual, unidades_vendidas')
          .gt('unidades_vendidas', 0)
          .limit(4);

        setMasVendidos((mvData || []) as ProductoMasVendido[]);
      } catch {
        setMasVendidos([]);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al consultar productos');
      setProductos([]);
    } finally {
      setLoading(false);
    }
  }, [soloActivos, esTrabajador]);

  useEffect(() => {
    fetchCategorias();
    fetchProductos();
  }, [fetchCategorias, fetchProductos]);

  return {
    productos,
    categorias,
    promociones,
    masVendidos,
    loading,
    error,
    refetch: fetchProductos,
    refetchCategorias: fetchCategorias,
  };
}
