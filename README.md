# VSHEIN

Landing page y panel administrativo de VSHEIN. React 19 + Vite + TypeScript + Tailwind, conectado a Supabase (Postgres con RLS).

## Estructura

- `src/pages` — vistas publicas y del panel (`/equipo`).
- `src/hooks` — acceso a datos (`useProductos`, `useConfig`).
- `src/lib` — cliente de Supabase, formato y permisos por rol.
- Migracion de base de datos: `05_MIGRACION_VSHEIN.sql` (correr en el SQL Editor de Supabase antes del primer deploy).

## Desarrollo local

```
npm install --legacy-peer-deps
cp .env.example .env
# completar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env
npm run dev
```

## Variables de entorno

| Variable | Obligatoria | Descripcion |
|---|---|---|
| `VITE_SUPABASE_URL` | si | URL del proyecto Supabase. |
| `VITE_SUPABASE_ANON_KEY` | si | Clave publica (anon). Nunca la `service_role`. |

Vite incrusta estas variables en el build (`npm run build`), no las lee en runtime. Si se despliega con Docker, deben pasarse como **build args**, no solo como variables de entorno del contenedor.

## Pruebas

```
npm run lint   # tsc --noEmit
npm run test   # vitest
```

## Deploy (Docker / Coolify)

El `Dockerfile` compila la SPA y la sirve con nginx (`nginx.conf` incluye SPA fallback y cabeceras de seguridad). En Coolify: build pack "Dockerfile", agregar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` como **Build Variables**, puerto expuesto `80`.

Antes del primer deploy en produccion:
1. Correr `05_MIGRACION_VSHEIN.sql` en Supabase.
2. Crear el primer usuario (`administradora`) desde Authentication > Users, y ejecutar el `update` al final del SQL.
3. En Authentication > Sign In / Providers: desactivar "Allow new users to sign up".
4. En Authentication > URL Configuration: poner el dominio real de produccion.
5. Cargar los datos reales del negocio en el panel, seccion "Datos del sitio".
