# Tienda de ropa: landing y panel administrativo

<details>
<summary><b>Read this in English</b></summary>

Public catalog and role-based admin panel for a women's clothing store. Built with React 19, TypeScript, Tailwind CSS 4 and Supabase (PostgreSQL with Row Level Security), packaged in Docker with Nginx and ready to deploy on Coolify.


## Features

**Public site**
- Single-page landing: hero, collection by category, best sellers, product detail modal, about, contact form, store location and a floating WhatsApp button.
- Promotions and policy pages (`/politicas/:slug`).
- Scroll reveal animations and an offline banner.

**Admin panel** (`/equipo`)
- Products with several photos each, categories, promotions, site settings, policies (Markdown editor with live preview), contact messages and users.
- Image uploads to Supabase Storage.

**Roles and permissions**
- Three roles: superadmin, supervisor and employee.
- One central function (`src/lib/permisos.ts`) decides what each role can do: for example, a supervisor can create and edit but never delete, and cannot manage users.
- The panel hides what a role cannot use, and Row Level Security enforces the same rules in the database.

## Stack

| Layer | Tools |
|---|---|
| Front end | React 19, TypeScript, React Router 7, Tailwind CSS 4, Motion, Lucide icons, react-markdown |
| Backend as a service | Supabase: PostgreSQL, Auth, Storage, Row Level Security |
| Build | Vite |
| Tests | Vitest |
| Deploy | Docker (multi-stage build), Nginx, Coolify |

## Project structure

```
src/
├── components/   publico/ (landing sections), panel/ (layout, protected routes), ui/
├── context/      AuthContext
├── hooks/        useProductos, useConfig, useRol, useScrollReveal
├── lib/          supabase client, permissions by role, formatting
├── pages/        LandingPage, PoliticaDetallePage, panel/ (one page per section)
├── styles/       design tokens
├── test/         Vitest tests
└── types/
docker/           Dockerfile, docker-compose.yml, nginx.conf
```

## Data model

Tables: `productos`, `fotografias_producto`, `categorias`, `promociones`, `politicas`, `sitio_config`, `mensajes_contacto` and `profiles` (role per user), plus the `catalogo` and `productos_mas_vendidos` views and the `catalogo` storage bucket.

## Run it locally

You need Node.js 20 and a Supabase project.

```bash
git clone https://github.com/cristianyesidmquiroga-tech/supabase.git
cd supabase
npm install --legacy-peer-deps
cp .env.example .env      # Windows: copy .env.example .env
npm run dev
```

Set these variables in `.env`:

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | URL of the Supabase project |
| `VITE_SUPABASE_ANON_KEY` | Public anon key. Never use the `service_role` key in the front end |

Vite embeds these values at build time; they are not read at runtime.

## Scripts

```bash
npm run dev      # development server
npm run build    # production build in dist/
npm run lint     # type check (tsc --noEmit)
npm run test     # Vitest
```

## Deploy with Docker and Coolify

The `Dockerfile` builds the app with Node 20 and serves it with Nginx, including SPA fallback and security headers.

1. In Coolify choose the **Dockerfile** build pack and expose port `80`.
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as **Build Variables**.
3. In Supabase, under Authentication, turn off public sign-ups and set the production domain in URL Configuration.
4. Create the first superadmin user from Authentication and load the store data from the admin panel.

## Author

Cristian Muñoz · [GitHub](https://github.com/cristianyesidmquiroga-tech)

</details>

Catálogo público y panel administrativo con roles para una tienda de ropa femenina. Hecho con React 19, TypeScript, Tailwind CSS 4 y Supabase (PostgreSQL con Row Level Security), empaquetado en Docker con Nginx y listo para desplegar en Coolify.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-RLS-3ECF8E?logo=supabase&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?logo=vitest&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Nginx-2496ED?logo=docker&logoColor=white)

## Qué incluye

**Sitio público**
- Landing de una sola vista: portada, colección por categoría, más vendidos, detalle de producto en modal, quiénes somos, formulario de contacto, ubicación de la tienda y botón flotante de WhatsApp.
- Promociones y páginas de políticas (`/politicas/:slug`).
- Animaciones al hacer scroll y aviso cuando se pierde la conexión.

**Panel administrativo** (`/equipo`)
- Productos con varias fotos, categorías, promociones, configuración del sitio, políticas (editor Markdown con vista previa), mensajes de contacto y usuarios.
- Subida de imágenes a Supabase Storage.

**Roles y permisos**
- Tres roles: superadministradora, supervisor y empleada.
- Una función central (`src/lib/permisos.ts`) decide qué puede hacer cada rol: por ejemplo, el supervisor crea y edita pero nunca elimina, y no gestiona usuarios.
- El panel oculta lo que el rol no puede usar y Row Level Security aplica las mismas reglas en la base de datos.

## Stack

| Capa | Herramientas |
|---|---|
| Frontend | React 19, TypeScript, React Router 7, Tailwind CSS 4, Motion, Lucide, react-markdown |
| Backend como servicio | Supabase: PostgreSQL, Auth, Storage, Row Level Security |
| Build | Vite |
| Pruebas | Vitest |
| Despliegue | Docker (build en dos etapas), Nginx, Coolify |

## Estructura

```
src/
├── components/   publico/ (secciones de la landing), panel/ (layout, rutas protegidas), ui/
├── context/      AuthContext
├── hooks/        useProductos, useConfig, useRol, useScrollReveal
├── lib/          cliente de Supabase, permisos por rol, formato
├── pages/        LandingPage, PoliticaDetallePage, panel/ (una página por sección)
├── styles/       tokens de diseño
├── test/         pruebas con Vitest
└── types/
docker/           Dockerfile, docker-compose.yml, nginx.conf
```

## Modelo de datos

Tablas: `productos`, `fotografias_producto`, `categorias`, `promociones`, `politicas`, `sitio_config`, `mensajes_contacto` y `profiles` (rol de cada usuario), más las vistas `catalogo` y `productos_mas_vendidos` y el bucket `catalogo` de Storage.

## Cómo ponerlo a correr

Se necesita Node.js 20 y un proyecto de Supabase.

```bash
git clone https://github.com/cristianyesidmquiroga-tech/supabase.git
cd supabase
npm install --legacy-peer-deps
cp .env.example .env      # en Windows: copy .env.example .env
npm run dev
```

Variables de `.env`:

| Variable | Descripción |
|---|---|
| `VITE_SUPABASE_URL` | URL del proyecto de Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clave pública (anon). Nunca la `service_role` en el frontend |

Vite incrusta estos valores al compilar; no se leen en tiempo de ejecución.

## Scripts

```bash
npm run dev      # servidor de desarrollo
npm run build    # compilación de producción en dist/
npm run lint     # revisión de tipos (tsc --noEmit)
npm run test     # Vitest
```

## Despliegue con Docker y Coolify

El `Dockerfile` compila la app con Node 20 y la sirve con Nginx, con redirección a `index.html` para la SPA y cabeceras de seguridad.

1. En Coolify elegir el build pack **Dockerfile** y exponer el puerto `80`.
2. Agregar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` como **Build Variables**.
3. En Supabase, en Authentication, desactivar el registro público y poner el dominio de producción en URL Configuration.
4. Crear la primera superadministradora desde Authentication y cargar los datos de la tienda desde el panel.

## Autor

Cristian Muñoz · [GitHub](https://github.com/cristianyesidmquiroga-tech)
