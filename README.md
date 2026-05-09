# Aero Ring Tech

Web aplikacija za upravljanje elektronskim prstenovima golubova — live praćenje, programiranje prstenova, baza golubova/vlasnika/trka.

## Quickstart

### 1. Instaliraj dependencies

```bash
npm install
```

### 2. Kopiraj env i podesi konekciju

```bash
cp .env.example .env
```

### 3. Pokreni PostgreSQL

```bash
docker compose up -d
```

### 4. Kreiraj tabele u bazi

```bash
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
