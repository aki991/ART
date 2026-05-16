-- ═══════════════════════════════════════════════════════
-- Migracija 005: race_pigeons.pigeon_id → nullable + ON DELETE SET NULL
-- ═══════════════════════════════════════════════════════
--
-- Razlog: istorijska tačnost. Trka je fiksiran događaj — brisanje
-- goluba iz "pigeons" tabele ne sme da ukloni njegovo učešće u već
-- održanim trkama. Snapshot polja (pigeon_full_ring_number,
-- pigeon_color, pigeon_name) ostaju popunjena pa UI može da prikaže
-- obrisanog goluba sa "Obrisan" oznakom.
--
-- altitude_readings nastavlja sa ON DELETE CASCADE preko
-- race_pigeon_id — i to je u redu: ako se obriše ceo race_pigeon
-- (npr. preko brisanja trke), brišu se i pripadajući readings.

-- 1. Skini postojeći FK constraint
ALTER TABLE public.race_pigeons
  DROP CONSTRAINT IF EXISTS race_pigeons_pigeon_id_fkey;

-- 2. Dozvoli NULL u pigeon_id (kad se izvorni golub obriše)
ALTER TABLE public.race_pigeons
  ALTER COLUMN pigeon_id DROP NOT NULL;

-- 3. Novi FK constraint sa SET NULL ponašanjem
ALTER TABLE public.race_pigeons
  ADD CONSTRAINT race_pigeons_pigeon_id_fkey
  FOREIGN KEY (pigeon_id) REFERENCES public.pigeons(id) ON DELETE SET NULL;
