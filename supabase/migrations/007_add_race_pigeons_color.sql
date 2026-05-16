-- ═══════════════════════════════════════════════════════
-- Migracija 007: race_pigeons.color
-- ═══════════════════════════════════════════════════════
--
-- Razlog: boje linija na grafikonu se trenutno dodeljuju lokalno
-- u klijentu po index-u — različiti redosled iz Supabase upita
-- može da da različite boje između browsera/tabova. Sad fiksiramo
-- boju u bazi pri startRace, klijent samo čita.
--
-- Postojeće trke ostaju sa color = NULL — klijent ima fallback
-- (PIGEON_COLOR_PALETTE[idx]) za te slučajeve, što čuva staro
-- ponašanje za istorijske test trke.

ALTER TABLE public.race_pigeons
  ADD COLUMN IF NOT EXISTS color TEXT;

COMMENT ON COLUMN public.race_pigeons.color IS
  'Hex boja linije goluba na grafikonu. Dodeljuje server pri startRace iz PIGEON_COLOR_PALETTE po redosledu kreiranja race_pigeons redova.';
