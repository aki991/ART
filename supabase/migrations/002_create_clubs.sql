-- ═══════════════════════════════════════════════════════
-- Proširenje profila sa Super Admin flag-om
-- ═══════════════════════════════════════════════════════

ALTER TABLE public.profiles
ADD COLUMN is_super_admin BOOLEAN NOT NULL DEFAULT false;

-- ═══════════════════════════════════════════════════════
-- Tabela: clubs
-- ═══════════════════════════════════════════════════════

CREATE TABLE public.clubs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  logo_url TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX clubs_name_idx ON public.clubs(name);
CREATE INDEX clubs_city_idx ON public.clubs(city);

CREATE TRIGGER update_clubs_updated_at
BEFORE UPDATE ON public.clubs
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════
-- Tabela: club_members (members + admins)
-- ═══════════════════════════════════════════════════════

CREATE TABLE public.club_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(user_id) -- jedan korisnik = jedan klub (1:1)
);

CREATE INDEX club_members_club_id_idx ON public.club_members(club_id);
CREATE INDEX club_members_role_idx ON public.club_members(role);

-- ═══════════════════════════════════════════════════════
-- Tabela: club_join_requests (zahtevi za pridruživanje klubu)
-- ═══════════════════════════════════════════════════════

CREATE TABLE public.club_join_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Partial unique index: korisnik može imati samo JEDAN pending zahtev odjednom.
CREATE UNIQUE INDEX club_join_requests_one_pending_per_user
ON public.club_join_requests(user_id)
WHERE status = 'pending';

CREATE INDEX club_join_requests_club_id_idx ON public.club_join_requests(club_id);

-- ═══════════════════════════════════════════════════════
-- Tabela: club_creation_requests (Super Admin odobrava nove klubove)
-- ═══════════════════════════════════════════════════════

CREATE TABLE public.club_creation_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requested_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  proposed_name TEXT NOT NULL,
  proposed_city TEXT NOT NULL,
  proposed_logo_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Korisnik može imati samo JEDAN pending zahtev za kreiranje odjednom.
CREATE UNIQUE INDEX club_creation_requests_one_pending_per_user
ON public.club_creation_requests(requested_by)
WHERE status = 'pending';

-- ═══════════════════════════════════════════════════════
-- Helper: provera Super Admin statusa (koristi se u policy-jima)
-- ═══════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_super_admin = true
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.is_super_admin() TO anon, authenticated;

-- ═══════════════════════════════════════════════════════
-- RLS POLITIKE
-- ═══════════════════════════════════════════════════════

-- CLUBS
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Svi mogu da čitaju klubove"
ON public.clubs FOR SELECT
USING (true);

CREATE POLICY "Samo Super Admin može da kreira klubove direktno"
ON public.clubs FOR INSERT
WITH CHECK (public.is_super_admin());

CREATE POLICY "Admin kluba ili Super Admin može da menja klub"
ON public.clubs FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.club_members
    WHERE club_id = clubs.id AND user_id = auth.uid() AND role = 'admin'
  )
  OR public.is_super_admin()
);

CREATE POLICY "Samo Super Admin može da briše klub"
ON public.clubs FOR DELETE
USING (public.is_super_admin());

-- CLUB_MEMBERS
ALTER TABLE public.club_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Svi mogu da čitaju članstva"
ON public.club_members FOR SELECT
USING (true);

CREATE POLICY "Korisnik može sam sebe da izbaci (napušta klub)"
ON public.club_members FOR DELETE
USING (auth.uid() = user_id);

-- INSERT/UPDATE ide preko server actions (service_role bypassa RLS).

-- CLUB_JOIN_REQUESTS
ALTER TABLE public.club_join_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Korisnik vidi svoje zahteve"
ON public.club_join_requests FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admin kluba vidi zahteve za svoj klub"
ON public.club_join_requests FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.club_members
    WHERE club_id = club_join_requests.club_id
    AND user_id = auth.uid()
    AND role = 'admin'
  )
);

CREATE POLICY "Super Admin vidi sve zahteve za pridruživanje"
ON public.club_join_requests FOR SELECT
USING (public.is_super_admin());

CREATE POLICY "Korisnik može da kreira svoj zahtev"
ON public.club_join_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Korisnik može da otkaže svoj pending zahtev"
ON public.club_join_requests FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (status IN ('cancelled', 'pending'));

-- CLUB_CREATION_REQUESTS
ALTER TABLE public.club_creation_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Korisnik vidi svoje zahteve za kreiranje"
ON public.club_creation_requests FOR SELECT
USING (auth.uid() = requested_by);

CREATE POLICY "Super Admin vidi sve zahteve za kreiranje"
ON public.club_creation_requests FOR SELECT
USING (public.is_super_admin());

CREATE POLICY "Korisnik može da kreira svoj zahtev za novi klub"
ON public.club_creation_requests FOR INSERT
WITH CHECK (auth.uid() = requested_by);

CREATE POLICY "Korisnik može da otkaže svoj pending zahtev za kreiranje"
ON public.club_creation_requests FOR UPDATE
USING (auth.uid() = requested_by AND status = 'pending')
WITH CHECK (status IN ('cancelled', 'pending'));

CREATE POLICY "Super Admin može da odobri/odbije zahtev za kreiranje"
ON public.club_creation_requests FOR UPDATE
USING (public.is_super_admin());
