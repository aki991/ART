-- ═══════════════════════════════════════════════════════
-- Ispravka: races.is_valid
-- ═══════════════════════════════════════════════════════
-- Ranije je endRace postavljao is_valid = true ako je BAR jedan golub
-- DOSEGAO 800m (max_altitude >= 800) makar na trenutak. Izveštaj na
-- /races/[id] koristi drugi (ispravan) kriterijum: golub je validan ako je
-- > 50% svojih merenja proveo iznad 800m (VIS prag). Zbog te razlike je
-- lista letova pokazivala "Validna" za trke koje su u izveštaju nevalidne.
--
-- Ova migracija ponovo računa is_valid za SVE završene trke po ispravnom
-- kriterijumu. Nove trke su već ispravne (endRace je popravljen u kodu).

UPDATE public.races r
SET is_valid = COALESCE((
  SELECT bool_or(rp_stats.valid_flight)
  FROM (
    SELECT
      COUNT(*) FILTER (WHERE ar.altitude >= 800) > COUNT(*) * 0.5
        AS valid_flight
    FROM public.race_pigeons rp
    JOIN public.altitude_readings ar ON ar.race_pigeon_id = rp.id
    WHERE rp.race_id = r.id
    GROUP BY rp.id
  ) AS rp_stats
), false)
WHERE r.status = 'completed';
