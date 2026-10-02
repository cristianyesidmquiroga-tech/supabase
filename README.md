# Clothing Store: Landing Page and Admin Panel

Public catalog and role-based admin panel for a women's clothing store. Built with React 19, TypeScript, Tailwind CSS 4 and Supabase (PostgreSQL with Row Level Security), packaged in Docker with Nginx and ready to deploy on Coolify.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-RLS-3ECF8E?logo=supabase&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?logo=vitest&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Nginx-2496ED?logo=docker&logoColor=white)

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
