# Tehnički izveštaj — integracija sa baznom stanicom (nRF52840)

**Aplikacija:** Aero Ring Tech (`aero-ring-tech`, verzija 0.1.0)
**Datum analize:** 2026-07-04
**Analizirana grana:** `main` (commit `3ccb422`)
**Svrha izveštaja:** Utvrditi trenutno stanje koda relevantno za povezivanje web aplikacije sa fizičkom baznom stanicom zasnovanom na nRF52840, i definisati šta je potrebno za protokol.

---

## ⚠️ Ključni zaključak (TL;DR)

**U aplikaciji NE POSTOJI nijedan red koda koji komunicira sa fizičkim hardverom.** Svi „hardverski" tokovi (povezivanje, čitanje visine, programiranje prstenova, baterija, signal) su **softverska simulacija / mock**. Direktorijumi predviđeni za transport/protokol/uređaj (`src/lib/transport`, `src/lib/protocol`, `src/lib/device`, `src/components/connection`) sadrže **samo prazne `.gitkeep` fajlove**.

Aplikacija je trenutno **funkcionalan proizvod bez hardvera** — kompletna baza podataka, autentifikacija, trke, golubovi i grafici rade, ali podatke o visini generiše lokalni matematički model (`flight-model.ts`), a ne uređaj.

---

## 1. PLATFORMA I TEHNOLOGIJE

### Tip aplikacije
**Web aplikacija (browser-only)**. Radi u pretraživaču. Ne postoji izgrađena mobilna (Android/iOS) ni desktop (Windows/Tauri) verzija.

> Napomena: `CLAUDE.md` navodi da se *planiraju* React Native i Tauri verzije, i da se kod piše sa apstrakcijama za to. U praksi te apstrakcije (transport sloj) **još nisu napisane** — postoje samo prazni direktorijumi.

### Stack i verzije (iz `package.json`)

| Sloj | Tehnologija | Verzija |
|---|---|---|
| Framework | **Next.js** (App Router, Turbopack) | 15.5.18 |
| UI runtime | **React** / React DOM | 19.1.0 |
| Jezik | **TypeScript** (strict mode) | ^5 |
| Stilizovanje | **Tailwind CSS** | 3.4.19 |
| Client state | **Zustand** | 5.0.13 |
| Validacija | **Zod** | 4.4.3 |
| Baza / Auth | **Supabase** (`@supabase/ssr`, `@supabase/supabase-js`) | 0.10.3 / 2.105.4 |
| ORM (delimično) | **Prisma + PostgreSQL** | 5.22.0 |
| Grafici | **Recharts** | 3.8.1 |
| PDF izvoz | **@react-pdf/renderer**, `html2canvas` | 4.5.1 / 1.4.1 |
| Ikone | **lucide-react** | 1.14.0 |
| Testovi | **Vitest** | 4.1.5 |

> **Bitno za hardver:** u `devDependencies` postoje tipovi `@types/w3c-web-serial` (^1.0.8) i `@types/web-bluetooth` (^0.0.21). To pokazuje **nameru** da se koriste Web Serial i Web Bluetooth API-jevi, ali ti tipovi se **nigde u kodu ne koriste** — instalirani su „unapred".

### Baza podataka — dvojno stanje (važno)
- **Supabase / PostgreSQL** je stvarna, aktivna baza. Šema je u `supabase/migrations/*.sql` (9 migracija). Tu su tabele `profiles`, `clubs`, `pigeons`, `races`, `race_pigeons`, `altitude_readings`.
- **Prisma** (`prisma/schema.prisma`) je prisutan u projektu, ali sadrži **samo model `Owner`** — praktično neiskorišćen/zaostatak. Prava šema je u Supabase migracijama, ne u Prismi.

### Kako se pokreće i builduje (iz `package.json` skripti)
```bash
docker compose up -d    # PostgreSQL u Docker-u (lokalni razvoj)
npm run db:push         # prisma db push (kreiranje tabela — Prisma putanja)
npm run dev             # next dev --turbopack  (dev server, http://localhost:3000)
npm run build           # next build --turbopack (produkcijski build)
npm run start           # next start (produkcijski server)
npm run typecheck       # tsc --noEmit
npm run test            # vitest
```
Za autentifikaciju i pravu bazu potrebne su Supabase env promenljive (`.env`, `.env.local`).

### Kako se aplikacija distribuira
Kao standardna Next.js aplikacija — hostuje se na serveru (npr. Vercel) uz hostovan PostgreSQL/Supabase. **Trenutno nije deployana na javni URL** — pokreće se lokalno.

---

## 2. KOMUNIKACIJA SA HARDVEROM

### ❌ Status: NIJE IMPLEMENTIRANO

Ne postoji **nijedan** transport ka spoljnom uređaju. Konkretno:

#### Prazni (rezervisani) direktorijumi — samo `.gitkeep`:
- `src/lib/transport/` — apstrakcija transporta (Serial/Bluetooth) → **prazno**
- `src/lib/protocol/` — protokol komunikacije sa prstenovima → **prazno**
- `src/lib/device/` — device management logika → **prazno**
- `src/components/connection/` — UI za konekciju → **prazno**

#### Pretraga celog `src/` na hardverske API-je vraća 0 rezultata:
Ne postoji nijedno pojavljivanje sledećeg u kodu:
`navigator.serial`, `navigator.bluetooth`, `navigator.usb`, `requestPort()`, `requestDevice()`, `SerialPort`, `gatt`, `characteristic`, `CDC/ACM`, `new WebSocket`, TCP/socket.

#### „Povezivanje" je mock (lažna konekcija)
Fajl: `src/lib/store/connection-store.ts`, metoda `connectWithMethod` (linije ~118–131):
```ts
connectWithMethod: async (method) => {
  set({ status: "connecting", method });
  await new Promise((resolve) => setTimeout(resolve, 800)); // lažno "čekanje"
  set({
    status: "connected",
    connectedAt: new Date(),
    deviceInfo: {
      deviceId: "ART-DEMO-001",      // hardkodovano
      firmwareVersion: "1.0.0",      // hardkodovano
      batteryPct: 87,                // hardkodovano
    },
  });
},
```
Klik na „USB-C" ili „Bluetooth" (`src/components/scanning/ConnectionMethodCard.tsx`) samo poziva ovaj mock, sačeka 800 ms i prikaže „Uspešno povezano". Tipovi konekcije koji se nude korisniku su `"usb-c" | "bluetooth"` (`ConnectionMethod` tip), ali iza njih **nema stvarne implementacije**.

#### „Zdravlje uređaja" (baterija/signal) je hardkodovano
Fajl: `src/components/scanning/DeviceHealthCards.tsx`:
```ts
const SIGNAL_STRENGTH = 85;   // konstanta
const BATTERY_LEVEL = 67;     // konstanta
```
(Uz to je nekonzistentno sa `batteryPct: 87` iz connection-store — dva različita izvora lažnih podataka.)

#### Programiranje prstenova je takođe mock
- `src/lib/store/programmer-store.ts`, metoda `programRing`: samo `await delay(600)` pa upiše u lokalni Zustand/localStorage. Ne šalje ništa uređaju.
- `src/lib/programmer/ring-id-generator.ts`: ID prstena se **generiše nasumično u browseru** (`crypto.getRandomValues`), 4 hex karaktera. Ne dolazi sa uređaja.
- `src/app/emulator/page.tsx` + `src/lib/store/emulator-store.ts`: **softverski emulator bazne stanice** sa 8 slotova, stanje u `localStorage`. Slot generiše nasumičan ID prstena pri „ubaci prsten". Ovo zamenjuje fizičku baznu stanicu tokom razvoja.

### Šta NEDOSTAJE (za nRF52840 integraciju)
1. **Transport sloj** (`src/lib/transport/`): implementacija za
   - **USB serijski (Web Serial / CDC-ACM)** — `navigator.serial.requestPort()`, otvaranje porta, `ReadableStream`/`WritableStream`. nRF52840 preko USB-a se najčešće javlja kao CDC-ACM virtuelni COM port.
   - **BLE (Web Bluetooth)** — `navigator.bluetooth.requestDevice()`, GATT servisi i karakteristike. **Nijedan UUID servisa/karakteristike nije definisan u kodu** — treba ih uskladiti sa firmverom (npr. Nordic UART Service `6E400001-...`, ili custom servis za telemetriju/programiranje).
2. **Protokol sloj** (`src/lib/protocol/`): enkodiranje/dekodiranje poruka (framing, komande, checksum). **Ne postoji nikakva definicija formata poruke.**
3. **Device sloj** (`src/lib/device/`): apstrakcija uređaja (konekcija, uparivanje simuliranog i realnog izvora telemetrije preko postojećeg interfejsa `TelemetryDataSource`).
4. **Zamena simulatora stvarnim izvorom**: postojeći interfejs `TelemetryDataSource` (vidi sekciju 3) je dobra tačka ubacivanja — trenutno ga „popunjava" simulator, treba ga popuniti realni transport.

---

## 3. FORMAT PODATAKA

### ⚠️ Ne postoji definisan „žični" (wire) format
Aplikacija **ne parsira nikakav ulaz sa uređaja** — nema JSON/binarnog/CSV/tekst-linijskog parsera za hardver, jer nema hardvera. Postoje samo **interne TypeScript strukture** i **šema baze**. One su najbolji orijentir šta protokol treba da prenosi.

### 3.1. Interni telemetrijski model (najbliže „očekivanoj poruci")
Fajl: `src/lib/telemetry/types.ts`
```ts
export interface TelemetryReading {
  ringId: string;          // ID prstena (4-hex, npr "A1F3")
  pigeonName: string;      // ime/oznaka goluba
  altitudeMeters: number;  // visina u METRIMA
  timestamp: Date;         // vreme očitavanja
}

export interface PigeonProfile {
  ringId: string;
  pigeonName: string;
  color: string;            // boja linije na grafiku
  cruisingAltitude: number; // ciljna visina krstarenja
}

// Interfejs koji bi realni transport trebalo da implementira:
export interface TelemetryDataSource {
  start(): void;
  stop(): void;
  isRunning(): boolean;
  onReading(handler: (reading: TelemetryReading) => void): () => void;
  getProfiles(): PigeonProfile[];
}
```
> `TelemetryDataSource` je **ključna apstrakcija za integraciju**: definiše ugovor „izvor daje `TelemetryReading` objekte". Realni nRF52840 transport treba da implementira ovaj interfejs i emituje `TelemetryReading` za svako očitavanje sa prstena.

### 3.2. Format u kojem se podaci upisuju (šema baze i batch)
Ono što aplikacija stvarno skladišti definiše potreban sadržaj poruke.

**Batch koji klijent šalje serveru** (`src/lib/types/race.ts`):
```ts
export interface AltitudeBatchEntry {
  pigeonId: string;       // UUID goluba u bazi
  altitude: number;       // visina (ceo broj, metri)
  elapsedSeconds: number; // sekundi od starta trke
}
```

**Tabela `altitude_readings`** (`supabase/migrations/004_create_races.sql`):
```sql
CREATE TABLE public.altitude_readings (
  id UUID PRIMARY KEY,
  race_pigeon_id UUID NOT NULL,       -- veza ka golubu u trci
  altitude INTEGER NOT NULL,          -- VISINA: ceo broj (metri)
  elapsed_seconds INTEGER NOT NULL,   -- vreme od starta (sekunde)
  recorded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

**Veza prsten ↔ golub ↔ slot** (`race_pigeons`):
```sql
programmed_ring_id  TEXT,     -- ID prstena (4-hex string)
programmed_slot     INTEGER,  -- broj slota bazne stanice (1–8); trenutno se šalje NULL
pigeon_full_ring_number TEXT, -- savezni broj alkice, npr "SRB-444-11-22-25"
```

### 3.3. Format ID-a prstena
Fajl: `src/lib/programmer/ring-id-generator.ts`
- **4 heksadecimalna karaktera**, `0–9 A–F`, regex `^[0-9A-F]{4}$`, normalizuje se na velika slova.
- Prostor od 16⁴ = **65.536** mogućih ID-eva.

### 3.4. Šta protokol NE definiše (a šema podrazumeva)
Iz baze/koda se vidi da poruka sa uređaja treba minimalno da nosi: **ID prstena** (4-hex), **visinu** (ceo broj, metri) i neku vremensku referencu. Baterija/signal se pominju u UI-ju kao polja (`batteryPct`), ali za sada su hardkodovani — protokol bi ih morao uvesti ako se žele stvarne vrednosti.

---

## 4. FUNKCIONALNOSTI (ekrani/funkcije)

Rute su u `src/app/(app)/`. Legenda: ✅ završeno i radi sa podacima · 🟡 UI radi ali podaci su SIMULIRANI · ⚪ pomoćno/mock alat.

| Ekran / ruta | Opis | Status |
|---|---|---|
| **Auth** (`/`, `src/components/auth/*`) | Login, registracija, zaboravljena lozinka, izbor jezika | ✅ Radi (Supabase auth) |
| **Dashboard** (`/dashboard`) | Statistike, `LastRaceChart`, tabela skorašnjih trka, top golubovi | ✅ Radi (podaci iz baze) |
| **Golubovi** (`/pigeons`, `/pigeons/[id]`) | CRUD golubova, kartica goluba, statistika i istorija letova po golubu | ✅ Radi (baza) |
| **Trke — lista/detalj** (`/races`, `/races/[id]`) | Pregled trki, detalj sa grafikom visine, **PDF izvoz** rezultata | ✅ Radi (baza) |
| **Skeniranje / živo praćenje** (`/scanning`) | Izbor konekcije (USB-C/BT), live dashboard, **grafik visine u realnom vremenu** (`AltitudeChart`), max visina, statistika sesije, legenda golubova, health karte | 🟡 UI kompletan, ali konekcija je mock i **visina dolazi iz simulatora**, ne sa uređaja |
| **Programiranje** (`/programming`) | Hub za programiranje prstenova, forma za goluba, tabela detektovanih/programiranih prstenova, slotovi | 🟡 UI kompletan, ali programiranje je mock (`delay(600)`), ID se generiše u browseru |
| **Emulator** (`/emulator`) | Softverski emulator bazne stanice sa 8 slotova (ubaci/izbaci prsten, boja prstena) | ⚪ Test alat koji zamenjuje fizički hardver |
| **Podešavanja** (`/settings`) | Profil, izgled (tema), golubarnik (loft), društvo/klub, obaveštenja, o aplikaciji, kontakt podrška | ✅ Radi |
| **Profil** (`/profile`, `/u/[username]`) | Javni/privatni profil korisnika | ✅ Radi |
| **Klubovi / Super-admin** (`/super-admin/club-requests`) | Zahtevi za kreiranje kluba, administracija | ✅ Radi |

### Kako „živo praćenje" trenutno funkcioniše (bez hardvera)
Tok podataka je potpuno softverski (fajlovi navedeni):
1. **`useRaceSimulator.ts`** — na svakih **5 s** (`TICK_INTERVAL_MS = 5000`) računa visine preko `flight-model.ts` i šalje batch u bazu (`recordAltitudeBatch`). Radi samo u tabu koji je „vlasnik" simulacije (localStorage rola).
2. **`flight-model.ts`** — matematički model: faza poletanja 120 s (kvadratni easing), zatim krstarenje 2900–3100 m sa `sin`-turbulencijom i driftom. **Ovo je izvor svih „live" visina.**
3. **`useRaceReadingsSync.ts`** — svaki tab poluje bazu na **2 s** (`POLL_INTERVAL_MS = 2000`) i puni `live-race-store`; grafik čita odatle.

Kod integracije nRF52840: korak 1–2 (simulator) treba zameniti realnim transportom koji emituje `TelemetryReading` → upis u istu tabelu `altitude_readings`. Ostatak (poll + grafik) ostaje netaknut.

---

## 5. UPRAVLJANJE VREMENOM I JEDINICE

### Vreme
| Kontekst | Reprezentacija | Gde |
|---|---|---|
| Start/kraj trke, `recorded_at` u bazi | **`TIMESTAMPTZ`** (PostgreSQL, čuva se u UTC) | `004_create_races.sql` |
| Klijent → server (kraj trke) | `new Date().toISOString()` (ISO 8601, UTC) | `races.ts` (`ended_at`) |
| Start trke u browseru | **Unix milisekunde** (`Date.now()`), polje `raceStartedAtMs` / `startedAtMs` | `connection-store.ts`, `SimulationControls.tsx` |
| Vreme očitavanja unutar trke | **`elapsed_seconds`** — celi broj sekundi od starta (`Math.floor((Date.now() - raceStartedAtMs) / 1000)`) | `useRaceSimulator.ts`, tabela `altitude_readings` |
| Interni telemetrijski objekat | `timestamp: Date` (JS Date) | `telemetry/types.ts` |

**Zaključci o vremenu:**
- Baza radi u **UTC** (TIMESTAMPTZ). Prikaz u UI-ju koristi lokalno vreme browsera (`date-fns`).
- Ključna vremenska osa za telemetriju je **`elapsed_seconds` (relativno vreme od starta trke)**, a ne apsolutni timestamp. Uređaj bi mogao slati ili apsolutno vreme ili delta — treba dogovoriti.
- **Nema sinhronizacije časovnika sa uređajem.** Trenutno vreme računa isključivo browser (`Date.now()`). nRF52840 verovatno nema RTC/tačno vreme — model sa `elapsed_seconds` (uređaj šalje očitavanja, host im dodeljuje vreme) je prirodno rešenje, ali to treba eksplicitno definisati.

### Jedinice visine
- **Metri (m).** Eksplicitno: polje `altitudeMeters` u `telemetry/types.ts`; model krstarenja 2900–3100 (`flight-model.ts`); `goal_altitude INTEGER NOT NULL DEFAULT 800` (metara) u `races` tabeli.
- Visina se skladišti kao **ceo broj** (`INTEGER`, uz `Math.round()` na klijentu i serveru). Nema decimala.
- **Stope (ft) se nigde ne koriste.** Nema konverzije jedinica u kodu. Ako uređaj/barometar daje ft ili Pa (pritisak), konverzija u metre mora se dodati.

---

## 6. LISTA PITANJA (za definisanje protokola app ↔ bazna stanica)

### A. Transport i fizička veza
1. **USB:** Da li se nRF52840 preko USB-a prijavljuje kao **CDC-ACM (virtuelni COM port)**? Ako da, ciljamo **Web Serial API** — koji baud rate, koji podaci o portu (VID/PID za filter)?
2. **BLE:** Koje **GATT servise i karakteristike** firmver izlaže? Da li je to **Nordic UART Service (NUS)** (`6E400001-B5A3-F393-E0A9-E50E24DCCA9E`) ili custom servis? Potrebni su UUID-evi za: telemetriju (notify), komande/programiranje (write), status/bateriju (read/notify).
3. Da li podržavamo **oba** transporta sa istim protokolom poruka, ili se format razlikuje (npr. binarno na BLE, tekst na Serial)?
4. Koji je **MTU / veličina paketa** na BLE-u (bitno za framing)?

### B. Format poruka (payload)
5. **Enkodiranje:** binarno, JSON, ili tekst-linije (npr. `RING,ALT,TIME\n`)? Preporuka za BLE je kompaktno binarno.
6. Ako binarno: **endianness**, širine polja (npr. visina `uint16` u metrima? `int16`? fixed-point?), redosled polja.
7. **Framing / delimitiranje:** kako se poruke razdvajaju (dužina-prefiks, newline, COBS)? Ima li **checksum/CRC**?
8. Da li jedan paket nosi **jedno očitavanje ili batch** više prstenova odjednom (kao što baza prima batch)?

### C. Semantika telemetrije
9. **Visina:** u kojim jedinicama uređaj šalje — **metri**, stope, ili sirov **barometarski pritisak (Pa)** koji host konvertuje? Da li je relativna (od poletanja) ili apsolutna (nadmorska)?
10. **Rezolucija i opseg** visine (aplikacija sada koristi cele metre, opseg ~0–3100+). Da li ima negativnih vrednosti / kalibracije na nulu pri startu?
11. **Frekvencija slanja:** aplikacija sada agregira na 5 s. Kojom brzinom uređaj emituje očitavanja po prstenu?
12. Da li uređaj šalje i **kvalitet signala / RSSI po prstenu**, ili samo visinu?

### D. Vreme
13. Ima li uređaj/bazna stanica **RTC (tačno vreme)**? Ako ne — prihvatamo model gde host dodeljuje `elapsed_seconds`/timestamp pri prijemu?
14. Ako uređaj šalje vreme: apsolutno (UTC/unix) ili **delta od starta**? U kojoj jedinici (s, ms)?
15. Ko definiše „start trke" — host komandom ka uređaju, ili uređaj sam? (Trenutno start pokreće host: `Date.now()`.)

### E. Identifikacija prstena i slotova
16. Format **ID-a prstena** koji uređaj čita: da li se poklapa sa aplikacijskim **4-hex (16-bit)** formatom, ili prsten ima duži/drugačiji hardverski ID (npr. 32/64-bit, EPC)? Ako je duži, treba mapiranje.
17. Bazna stanica ima **8 slotova** (emulator). Da li fizička stanica ima 8, i da li protokol prenosi **broj slota** uz očitavanje? (`programmed_slot` postoji u bazi ali se sada šalje `NULL`.)
18. Da li je ID prstena **fabrički/nepromenljiv**, ili ga aplikacija **upisuje** (programira) na prsten? (Sada ga app generiše nasumično — treba razjasniti ko je autoritet za ID.)

### F. Programiranje prstenova
19. Koji je **protokol upisa** (programiranja) prstena preko bazne stanice? Koje komande, koji odgovor/potvrda (ACK), timeout, retry?
20. Šta se tačno upisuje na prsten — samo ID, ili i dodatni podaci (boja, oznaka goluba)?
21. Kako uređaj javlja **detekciju umetnutog prstena** u slot (event/notify), da bi UI mogao da prikaže „detektovan" bez poll-a?

### G. Status uređaja i pouzdanost
22. Kako se dobija **stvarni nivo baterije i jačina signala** bazne stanice (sada hardkodovano 67% / 85%)? Posebna karakteristika/komanda?
23. Ponašanje pri **prekidu veze** usred trke — bafero­vanje na uređaju? Reconnect logika? Da li uređaj čuva očitavanja lokalno pa ih pošalje kasnije?
24. **Firmver i deviceId:** kako host čita stvarni `firmwareVersion` i `deviceId` (sada hardkodovano `ART-DEMO-001` / `1.0.0`)?
25. Maksimalan broj golubova/prstenova koje jedna bazna stanica prati istovremeno?

### H. Arhitektura integracije
26. Da li ostaje pristup „**bazna stanica → browser → Supabase**" (host upisuje u bazu, kao simulator sada), ili bazna stanica ima svoj mrežni put (WiFi/TCP direktno u backend)? U kodu **nema WiFi/TCP** — samo se pominju USB/BT.
27. Da li treba podržati **više baznih stanica** istovremeno (npr. razni golubarnici u istoj trci)?

---

## Dodatak — mapa relevantnih fajlova

| Namena | Fajl |
|---|---|
| Mock konekcije (USB/BT) | `src/lib/store/connection-store.ts` → `connectWithMethod` |
| UI izbor konekcije | `src/components/scanning/ConnectionHub.tsx`, `ConnectionMethodCard.tsx` |
| Hardkodovana baterija/signal | `src/components/scanning/DeviceHealthCards.tsx` |
| Telemetrijski interfejs (tačka integracije) | `src/lib/telemetry/types.ts` (`TelemetryDataSource`) |
| Simulator visine (zameniti hardverom) | `src/lib/telemetry/flight-model.ts`, `src/lib/hooks/useRaceSimulator.ts` |
| Sinhronizacija očitavanja iz baze | `src/lib/hooks/useRaceReadingsSync.ts` |
| Upis batch-a visina | `src/app/actions/races.ts` → `recordAltitudeBatch` |
| Programiranje prstenova (mock) | `src/lib/store/programmer-store.ts` |
| Generisanje ID prstena (4-hex) | `src/lib/programmer/ring-id-generator.ts` |
| Emulator bazne stanice (8 slotova) | `src/app/emulator/page.tsx`, `src/lib/store/emulator-store.ts` |
| Šema baze (visina/vreme/slot) | `supabase/migrations/004_create_races.sql`, `003_create_pigeons.sql` |
| Prazni rezervisani slojevi | `src/lib/transport/`, `src/lib/protocol/`, `src/lib/device/`, `src/components/connection/` (samo `.gitkeep`) |

---
*Izveštaj generisan analizom koda bez izmena. Nijedan fajl aplikacije nije menjan.*
