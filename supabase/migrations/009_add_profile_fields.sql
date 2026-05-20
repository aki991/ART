-- ═══════════════════════════════════════════════════════
-- Profil: bio + privatnost
-- ═══════════════════════════════════════════════════════
-- Kolona avatar_url i indeks profiles_username_idx već postoje
-- (migracija 001), pa se ovde NE dodaju ponovo.
--
-- Privatnost se NE sprovodi kroz RLS: postojeća SELECT politika je
-- USING(true) (svi vide sve profile) i oslonac je za prikaz imena
-- vlasnika na listama letova. Ograničavanje SELECT-a bi to pokvarilo.
-- Umesto toga, getPublicProfile na nivou aplikacije proverava
-- is_public_profile i vraća null za privatne profile.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS bio TEXT
    CHECK (bio IS NULL OR length(bio) <= 500),
  ADD COLUMN IF NOT EXISTS is_public_profile BOOLEAN NOT NULL DEFAULT TRUE;
