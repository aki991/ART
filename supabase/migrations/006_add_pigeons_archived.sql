-- ═══════════════════════════════════════════════════════
-- Migracija 006: pigeons.is_archived
-- ═══════════════════════════════════════════════════════
--
-- Razlog: golubovi uneti ručno tokom programiranja prstena
-- (broj alkice koji ne postoji u bazi vlasnika) treba transparentno
-- da se upišu u "pigeons" tabelu, ali ne smeju da se prikazuju
-- na stranici "Golubovi" niti u Top Golubova. Razlikujemo ih
-- kolonom is_archived = TRUE.

ALTER TABLE public.pigeons
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT false;

-- Indeks za brz filter na getMyPigeons() / searchMyPigeons()
CREATE INDEX IF NOT EXISTS pigeons_owner_archived_idx
  ON public.pigeons(owner_id, is_archived);

COMMENT ON COLUMN public.pigeons.is_archived IS
  'TRUE = golub je unet samo za trku (sakriven iz Golubovi liste i Top Golubova). FALSE = "pravi" golub koji se prati.';
