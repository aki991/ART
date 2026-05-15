# Aero Ring Tech

Web aplikacija za upravljanje elektronskim prstenovima golubova — live praćenje, programiranje prstenova, baza golubova/vlasnika/trka.

## Quickstart

### 1. Instaliraj dependencies

```bash
npm install
```

### 2. Podesi Supabase

Kopiraj `.env.example` u `.env.local` i popuni vrednosti iz svog Supabase projekta (Settings → API):

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable key>
SUPABASE_SERVICE_ROLE_KEY=<secret key>  # potreban za brisanje naloga
```

### 3. Pokreni SQL migraciju

Otvori Supabase Dashboard → SQL Editor i pokreni sadržaj fajla:

```
supabase/migrations/001_create_profiles.sql
```

Skripta kreira `profiles` tabelu, RLS pravila, trigger koji automatski popunjava profil pri registraciji, i RPC funkciju za login pomoću korisničkog imena.

### 4. (Opciono) Pokreni lokalnu PostgreSQL bazu

Aplikacija koristi Supabase za auth i profil. Lokalna Postgres baza ostaje za eventualne Prisma modele:

```bash
docker compose up -d
npm run db:push
```

### 5. Pokreni dev server

```bash
npm run dev
```

Aplikacija je dostupna na [http://localhost:3000](http://localhost:3000).

## Korisne komande

| Komanda | Opis |
|---|---|
| `npm run dev` | Dev server sa Turbopack-om |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript provjera |
| `npm run test` | Vitest testovi |
| `npm run db:push` | Sync schema → baza (bez migracija) |
| `npm run db:migrate` | Kreira migraciju i primijeni |
| `npm run db:studio` | Prisma Studio GUI |
| `npm run db:generate` | Generiše Prisma klijenta |

## Dizajn referenca

Originalni HTML/CSS dizajn se nalazi u `_design-reference/` — ne mijenjaj te fajlove.
