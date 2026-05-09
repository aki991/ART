# Aero Ring Tech — Claude Context

## Šta je aplikacija

Web aplikacija za upravljanje elektronskim prstenovima golubova. Funkcionalnosti: live praćenje, bežično programiranje prstenova (Web Serial / Web Bluetooth), baza golubova, vlasnika i trka. Planiraju se i React Native i Tauri verzije — kod se piše sa apstrakcijama koje to omogućavaju.

## Stack

- **Next.js 15** — App Router, React 19, TypeScript (strict)
- **Tailwind CSS v3** — utility-first styling
- **Prisma + PostgreSQL** — ORM, baza se pokreće lokalno u Docker-u
- **Zustand** — client state management
- **Zod** — validacija šema
- **Vitest** — unit i integracijoni testovi
- **Lucide React** — ikone
- **shadcn/ui pristup** — CVA + Radix, komponente se instaliraju jednu po jednu po potrebi

## Konvencije

- **App Router** — sve stranice su u `src/app/`
- **Server Components po defaultu** — `"use client"` samo tamo gdje je neophodno (event handleri, browser API, React state/effects)
- **Import alias** — uvijek koristiti `@/` umjesto relativnih putanja (npr. `@/lib/utils`)
- **Tailwind bez inline stilova** — ne koristiti `style={{}}`, sve klase idu kroz Tailwind
- **cn() helper** — za spajanje klasa koristiti `cn()` iz `@/lib/utils`
- **Nema komentara** osim kad je `WHY` neoočigledan
- **Nema ESLint setup-a** — dodaje se ručno po potrebi

## Struktura

```
src/
├── app/              # Next.js App Router stranice i layouti
├── components/
│   ├── connection/   # Komponente za konekciju sa uređajima
│   ├── scanning/     # Skeniranje prstenova
│   ├── programming/  # Programiranje prstenova
│   ├── providers/    # React context provideri
│   └── ui/           # Generičke UI komponente (shadcn/ui stil)
├── lib/
│   ├── transport/    # Apstrakcija transportnog sloja (Serial/Bluetooth)
│   ├── protocol/     # Protokol za komunikaciju sa prstenovima
│   ├── device/       # Device management logika
│   ├── store/        # Zustand store-ovi
│   ├── hooks/        # Custom React hookovi
│   └── utils.ts      # cn() i ostale utilities
├── server/
│   └── db.ts         # Singleton Prisma klijent (HMR-safe)
└── types/            # Zajednički TypeScript tipovi
```

## Dizajn referenca

Originalni HTML/CSS dizajn login stranice nalazi se u `_design-reference/` — **ne mijenjaj te fajlove**. Oni su source of truth za vizuelni izgled.

## Komande

```bash
docker compose up -d    # Pokreni PostgreSQL
npm run db:push         # Kreiraj tabele
npm run dev             # Dev server
npm run typecheck       # TypeScript provjera
npm run build           # Production build
npm run test            # Testovi
```
