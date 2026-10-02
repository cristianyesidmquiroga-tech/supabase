# Clothing Store: Landing Page and Admin Panel

Public catalog and role-based admin panel for a clothing store, built with React 19, TypeScript, Tailwind CSS 4 and Supabase (Postgres with Row Level Security). Dockerized with Nginx and ready to deploy on Coolify.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-RLS-3ECF8E?logo=supabase&logoColor=white)

## Features

- **Public site:** hero, collection, best sellers, product detail, promotions, contact, location and a floating WhatsApp button.
- **Admin panel** (`/equipo`): products, categories, promotions, site settings, policies, messages and users.
- **Three roles** (superadmin, supervisor, employee) with a central permissions function; destructive actions are restricted by role, and the database enforces the same rules with RLS.
- Stock alerts and image uploads.
- Design tokens in CSS, Vitest tests for the permissions and formatting logic, and a Docker build with Nginx (SPA fallback and security headers).

## Quick start

```bash
git clone https://github.com/cristianyesidmquiroga-tech/supabase.git
cd supabase
npm install --legacy-peer-deps
cp .env.example .env     # set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```

Use only the public anon key in the front end, never the `service_role` key. Deployment steps for Docker and Coolify are in the Spanish section below.

---

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
