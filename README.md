# Akwantuo — Roots-First Travel

This project is the Akwantuo landing site, a Vite-powered React experience that celebrates cultural travel across West Africa. It leans on shadcn-ui components, Tailwind CSS, and a bespoke `AdinkraIcon` SVG system to keep the visual language rooted in Ghanaian heritage (you already saw the sankofa symbol make its way into the favicon and layout). The app also taps Supabase for whatever backend data, auth, or CMS you wire up, and it ships with analytics + structured-data metadata so marketing pages stay indexed properly.

## Local development

### Prerequisites
- Node.js 20+ (we have `package-lock.json`, so npm is the package manager in use)
- A Supabase project with a public URL, project ID, and publishable key (values like `VITE_SUPABASE_URL`, `VITE_SUPABASE_PROJECT_ID`, and `VITE_SUPABASE_PUBLISHABLE_KEY` go into `.env`)

### Setup

```sh
# install dependencies
npm install

# copy the sample env stub and fill in your Supabase values
cp .env .env.local
# edit .env.local so it contains the real credentials

# start the dev server with Vite
npm run dev
```

The dev server runs on `http://localhost:5173/` by default. Since `.env*` files are ignored, your secrets stay local.

## Useful scripts
- `npm run dev` – launch Vite with hot reload.
- `npm run build` – produce a production build in `dist`.
- `npm run preview` – serve the production build locally for verification.
- `npm run lint` / `npm run test` – run linters or tests when you add them.

## Project structure highlights

- `src/components/ui/AdinkraIcon.tsx` – SVG definitions for the sankofa, gye-nyame, adinkrahene, and dwennimmen icons; these feed the favicon and UI badges.
- `src/pages/` – Vite routes for pages like home, login, signup, and password reset.
- `src/components/layout/` – shared Navbar/Footer that reference the Adinkra icons and social links.
- `public/` – static assets such as `adinkra-sankofa.svg` (used as the favicon), `og-image.jpg`, and robots/sitemap files.

## Deployment

1. Build with `npm run build`.
2. Deploy the `dist/` folder to your platform of choice (Vercel, Netlify, etc.).
3. Add the same Supabase keys from `.env.local` to your host’s environment settings so the client can talk to Supabase securely.

## Domain & Share

If you are using Lovable, go to **Project > Settings > Domains** to connect a custom domain, or follow your host’s guide for SSL. Otherwise the generated `dist/` is a static SPA that can live on any CDN.
