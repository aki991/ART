-- ═══════════════════════════════════════════════════════
-- Tabela: pigeons
-- ═══════════════════════════════════════════════════════

CREATE TABLE public.pigeons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Broj savezne alkice (5 segmenata)
  ring_country TEXT NOT NULL DEFAULT 'SRB',
  ring_number TEXT NOT NULL,           -- npr "444"
  ring_segment_3 TEXT NOT NULL,        -- npr "11"
  ring_segment_4 TEXT NOT NULL,        -- npr "22"
  ring_year TEXT NOT NULL,             -- npr "25"

  -- Generisana kolona za pun broj alkice (lako za pretragu i prikaz)
  full_ring_number TEXT GENERATED ALWAYS AS (
    ring_country || '-' || ring_number || '-' || ring_segment_3 || '-' || ring_segment_4 || '-' || ring_year
  ) STORED,

  color TEXT NOT NULL,
  name TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Jedan vlasnik ne može imati dva goluba sa istim brojem alkice
  UNIQUE(owner_id, ring_country, ring_number, ring_segment_3, ring_segment_4, ring_year)
);

-- Indeksi za brže pretrage
CREATE INDEX pigeons_owner_id_idx ON public.pigeons(owner_id);
CREATE INDEX pigeons_full_ring_number_idx ON public.pigeons(full_ring_number);

-- Updated_at trigger (koristi postojeću funkciju iz 001_create_profiles.sql)
CREATE TRIGGER update_pigeons_updated_at
BEFORE UPDATE ON public.pigeons
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════
-- RLS POLITIKE — strogo privatno
-- ═══════════════════════════════════════════════════════

ALTER TABLE public.pigeons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Korisnik vidi samo svoje golube"
ON public.pigeons FOR SELECT
USING (auth.uid() = owner_id);

CREATE POLICY "Korisnik kreira samo svoje golube"
ON public.pigeons FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Korisnik menja samo svoje golube"
ON public.pigeons FOR UPDATE
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Korisnik briše samo svoje golube"
ON public.pigeons FOR DELETE
USING (auth.uid() = owner_id);
