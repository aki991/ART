-- ═══════════════════════════════════════════════════════
-- Tabela: races
-- ═══════════════════════════════════════════════════════

CREATE TABLE public.races (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  club_id UUID REFERENCES public.clubs(id) ON DELETE SET NULL,

  name TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'club', 'public')),
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'cancelled')),

  goal_altitude INTEGER NOT NULL DEFAULT 800,

  started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,

  max_altitude INTEGER,
  avg_altitude INTEGER,
  is_valid BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX races_owner_id_idx ON public.races(owner_id);
CREATE INDEX races_club_id_idx ON public.races(club_id);
CREATE INDEX races_status_idx ON public.races(status);
CREATE INDEX races_visibility_idx ON public.races(visibility);
CREATE INDEX races_started_at_idx ON public.races(started_at DESC);

-- Partial unique index: max jedna aktivna trka po korisniku
CREATE UNIQUE INDEX races_one_active_per_user
ON public.races(owner_id)
WHERE status = 'in_progress';

CREATE TRIGGER update_races_updated_at
BEFORE UPDATE ON public.races
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════
-- Tabela: race_pigeons (junction + snapshot)
-- ═══════════════════════════════════════════════════════

CREATE TABLE public.race_pigeons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  race_id UUID NOT NULL REFERENCES public.races(id) ON DELETE CASCADE,
  pigeon_id UUID NOT NULL REFERENCES public.pigeons(id) ON DELETE CASCADE,

  programmed_ring_id TEXT,
  programmed_slot INTEGER,

  pigeon_full_ring_number TEXT NOT NULL,
  pigeon_color TEXT NOT NULL,
  pigeon_name TEXT,

  max_altitude INTEGER,
  avg_altitude INTEGER,
  reached_goal BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(race_id, pigeon_id)
);

CREATE INDEX race_pigeons_race_id_idx ON public.race_pigeons(race_id);
CREATE INDEX race_pigeons_pigeon_id_idx ON public.race_pigeons(pigeon_id);

-- ═══════════════════════════════════════════════════════
-- Tabela: altitude_readings
-- ═══════════════════════════════════════════════════════

CREATE TABLE public.altitude_readings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  race_pigeon_id UUID NOT NULL REFERENCES public.race_pigeons(id) ON DELETE CASCADE,

  altitude INTEGER NOT NULL,
  elapsed_seconds INTEGER NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX altitude_readings_race_pigeon_id_idx ON public.altitude_readings(race_pigeon_id);
CREATE INDEX altitude_readings_elapsed_idx ON public.altitude_readings(race_pigeon_id, elapsed_seconds);

-- ═══════════════════════════════════════════════════════
-- RLS POLITIKE
-- ═══════════════════════════════════════════════════════

ALTER TABLE public.races ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Korisnik vidi svoje trke"
ON public.races FOR SELECT
USING (auth.uid() = owner_id);

CREATE POLICY "Članovi kluba vide klupske trke"
ON public.races FOR SELECT
USING (
  visibility = 'club'
  AND club_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.club_members
    WHERE club_members.club_id = races.club_id
    AND club_members.user_id = auth.uid()
  )
);

CREATE POLICY "Svi vide javne trke"
ON public.races FOR SELECT
USING (visibility = 'public');

CREATE POLICY "Korisnik kreira svoje trke"
ON public.races FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Korisnik menja svoje trke"
ON public.races FOR UPDATE
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Korisnik briše svoje trke"
ON public.races FOR DELETE
USING (auth.uid() = owner_id);

-- RACE_PIGEONS: vidljivost prati roditeljsku trku
ALTER TABLE public.race_pigeons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vidi race_pigeons ako vidi trku"
ON public.race_pigeons FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.races
    WHERE races.id = race_pigeons.race_id
    AND (
      races.owner_id = auth.uid()
      OR races.visibility = 'public'
      OR (
        races.visibility = 'club'
        AND races.club_id IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM public.club_members
          WHERE club_members.club_id = races.club_id
          AND club_members.user_id = auth.uid()
        )
      )
    )
  )
);

CREATE POLICY "Vlasnik trke kreira race_pigeons"
ON public.race_pigeons FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.races
    WHERE races.id = race_pigeons.race_id
    AND races.owner_id = auth.uid()
  )
);

CREATE POLICY "Vlasnik trke menja race_pigeons"
ON public.race_pigeons FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.races
    WHERE races.id = race_pigeons.race_id
    AND races.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.races
    WHERE races.id = race_pigeons.race_id
    AND races.owner_id = auth.uid()
  )
);

CREATE POLICY "Vlasnik trke briše race_pigeons"
ON public.race_pigeons FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.races
    WHERE races.id = race_pigeons.race_id
    AND races.owner_id = auth.uid()
  )
);

-- ALTITUDE_READINGS: vidljivost prati race_pigeons
ALTER TABLE public.altitude_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vidi readings ako vidi race_pigeon"
ON public.altitude_readings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.race_pigeons
    JOIN public.races ON races.id = race_pigeons.race_id
    WHERE race_pigeons.id = altitude_readings.race_pigeon_id
    AND (
      races.owner_id = auth.uid()
      OR races.visibility = 'public'
      OR (
        races.visibility = 'club'
        AND races.club_id IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM public.club_members
          WHERE club_members.club_id = races.club_id
          AND club_members.user_id = auth.uid()
        )
      )
    )
  )
);

CREATE POLICY "Vlasnik trke kreira readings"
ON public.altitude_readings FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.race_pigeons
    JOIN public.races ON races.id = race_pigeons.race_id
    WHERE race_pigeons.id = altitude_readings.race_pigeon_id
    AND races.owner_id = auth.uid()
  )
);
