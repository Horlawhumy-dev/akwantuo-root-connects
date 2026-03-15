
# Akwantuo Platform

**Akwantuo** is an AI-powered travel planning and logistics platform designed to simplify travel to Ghana for international visitors. The platform combines **AI-assisted trip planning, verified local experiences, booking infrastructure, and integrated payments** into one system so travelers can plan and organize their entire trip before arrival.

The goal is to remove common travel friction points such as fragmented information, unreliable provider discovery, and complex coordination between bookings, tours, transport, and accommodation.

---

# System Overview

Akwantuo consists of several core components:

1. **Frontend Application**
2. **Backend API**
3. **AI Services**
4. **Database Layer**
5. **Background Workers**
6. **Infrastructure Services**

The platform follows a **modular architecture** that separates user interfaces, application logic, AI processing, and background tasks.

---

# Architecture

![System Design](<Screenshot from 2026-03-05 07-53-25.png>)
```

User
|
v
React Frontend (TypeScript + Tailwind)
|
v
FastAPI Backend (API Gateway)
|
├── PostgreSQL Database (Supabase)
├── Redis (Queue / Cache)
├── Celery Workers (Async Tasks)
└── AI Layer (Gemini + RAG)
|
└── Travel Knowledge Base

```

---

# Technology Stack

![Tech Stacks](<WhatsApp Image 2026-03-05 at 05.48.33.jpeg>)
## Frontend

- React
- TypeScript
- Tailwind CSS
- Vite (build tool)

Responsibilities:

- user interface
- trip planning interface
- AI chat interface
- booking flows

---

## Backend

- FastAPI
- Python
- Celery
- Redis

Responsibilities:

- API gateway
- business logic
- booking coordination
- AI orchestration
- payment integrations

---

## Database

- PostgreSQL
- Supabase (managed Postgres)

Stores:

- users
- trips
- itineraries
- providers
- bookings
- reviews
- AI conversations

---

## AI Layer

- Google Gemini
- Retrieval Augmented Generation (RAG)

Used for:

- travel Q&A
- itinerary generation
- local recommendations

---

# Project Structure

```

akwantuo-platform
│
├── frontend
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── hooks
│   │   ├── services
│   │   ├── types
│   │   └── utils
│   │
│   └── styles
│
├── backend
│   ├── app
│   │   ├── api
│   │   ├── core
│   │   ├── models
│   │   ├── schemas
│   │   ├── services
│   │   ├── ai
│   │   └── db
│   │
│   ├── workers
│   └── tests
│
├── infrastructure
│   ├── docker
│   ├── terraform
│   └── deployment
│
└── docs

```

---

# Prerequisites

Before running the project locally ensure the following are installed:

- Node.js (>= 18)
- Python (>= 3.10)
- Redis
- PostgreSQL (optional if using Supabase)
- Git

---

# Environment Variables

Create a `.env` file in the root directory.

Example:

```

DATABASE_URL=postgresql://user:password@localhost:5432/akwantuo
REDIS_URL=redis://localhost:6379
GEMINI_API_KEY=your_api_key
STRIPE_SECRET_KEY=your_key
PAYSTACK_SECRET_KEY=your_key

```

---

# Running the Project Locally

## 1. Clone the Repository

```

git clone ([git@github.com:Horlawhumy-dev/akwantuo-platform.git])
cd akwantuo-platform

```

# Backend-Only Build & Run Guide

## 1) Install prerequisites

Ensure these are installed:

- Python >= 3.10
- Redis
- PostgreSQL (optional if using Supabase)
- Git

## 2) Clone the repository

```bash
git clone git@github.com:Horlawhumy-dev/akwantuo-platform.git
cd akwantuo-platform
```

## 3) Configure environment variables

Create a root `.env` file with at least:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/akwantuo
REDIS_URL=redis://localhost:6379
GEMINI_API_KEY=your_api_key
STRIPE_SECRET_KEY=your_key
PAYSTACK_SECRET_KEY=your_key
```

## 4) Set up backend virtual environment

```bash
cd backend
python -m venv venv
source venv/bin/activate   # macOS/Linux
# venv\Scripts\activate   # Windows
```

## 5) Install backend dependencies

```bash
pip install -r requirements.txt
```

## 6) Start backend API

```bash
uvicorn app.main:app --reload
```

- API base URL: `http://localhost:8000`
- API docs: `http://localhost:8000/docs`

## 7) Start background worker (backend async jobs)

In a separate terminal (with env activated), start Redis first, then run:

```bash
celery -A workers.celery_worker worker --loglevel=info

```

Workers handle tasks such as:

- itinerary generation
- AI processing
- notifications
- background bookings


## 8) Run backend tests

```bash
pytest
```

## 9) Recommended backend-only local workflow

Run these in parallel terminals:

```bash
redis-server
uvicorn app.main:app --reload
celery -A workers.celery_worker worker --loglevel=info

```


---

# Frontend Setup

Navigate to frontend directory:

```

cd frontend

```

Install dependencies:

```

npm install

```

Start development server:

```

npm run dev

```

Frontend will be available at:

```

[http://localhost:5173](http://localhost:5173)

```

---

# Development Workflow

Typical local workflow:

1. Start Redis
2. Start Backend API
3. Start Celery Workers
4. Start Frontend

Example:

```

redis-server
uvicorn app.main:app --reload
celery -A workers.celery_worker worker --loglevel=info
npm run dev

```

---

# Testing

Backend tests:

```

pytest

```

Frontend tests (if configured):

```

npm test

```

---

# Deployment Overview

Typical production deployment uses:

Frontend

- Vercel

Backend

- Railway or Render

Database

- Supabase (PostgreSQL)

Background Jobs

- Redis + Celery workers

---

# Future Improvements

Planned enhancements include:

- offline itinerary access
- provider dashboards
- trust and verification systems
- automated tour provider onboarding
- group travel planning
- recommendation engines

---

# License

MIT License

---

# Vision

Akwantuo aims to become the **operating system for African travel**, enabling seamless discovery, planning, and execution of travel experiences across the continent.


<!-- # Akwantuo — Roots-First Travel

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

If you are using Lovable, go to **Project > Settings > Domains** to connect a custom domain, or follow your host’s guide for SSL. Otherwise the generated `dist/` is a static SPA that can live on any CDN. -->
