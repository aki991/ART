-- Tabela profila (vezana 1:1 sa auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indeks na username za bržu pretragu
CREATE INDEX profiles_username_idx ON public.profiles(username);

-- Trigger koji automatski popunjava updated_at pri svakoj izmeni
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) — svaki korisnik vidi/menja samo svoj profil
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Korisnici vide sve profile (read-only)"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Korisnici menjaju samo svoj profil"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Korisnici brišu samo svoj profil"
ON public.profiles FOR DELETE
USING (auth.uid() = id);

-- Trigger koji automatski kreira profil kad se kreira novi auth user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RPC za login pomoću korisničkog imena: vraća email iz auth.users na osnovu username-a.
-- SECURITY DEFINER omogućava pristup auth.users tabeli koja inače nije dostupna anon klijentu.
CREATE OR REPLACE FUNCTION public.get_email_for_username(p_username TEXT)
RETURNS TEXT AS $$
DECLARE
  user_email TEXT;
BEGIN
  SELECT u.email INTO user_email
  FROM auth.users u
  JOIN public.profiles p ON p.id = u.id
  WHERE p.username = p_username;
  RETURN user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_email_for_username(TEXT) TO anon, authenticated;
