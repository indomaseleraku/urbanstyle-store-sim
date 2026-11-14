-- Migration V4.4: Identity UUID Unification, Profiles Email Uniqueness, Coupon Atomic Increment, & Strict Reviews RLS
-- Date: 2026-11-15

BEGIN;

-- 1. Unify existing legacy profiles.id references in orders, user_addresses, and wishlists to canonical user_credentials.id
WITH id_map AS (
  SELECT p.id AS old_id, c.id AS new_id
  FROM public.profiles p
  JOIN public.user_credentials c ON LOWER(p.email) = LOWER(c.email)
  WHERE p.id <> c.id
)
UPDATE public.orders o
SET user_id = m.new_id
FROM id_map m
WHERE o.user_id = m.old_id;

WITH id_map AS (
  SELECT p.id AS old_id, c.id AS new_id
  FROM public.profiles p
  JOIN public.user_credentials c ON LOWER(p.email) = LOWER(c.email)
  WHERE p.id <> c.id
)
UPDATE public.user_addresses a
SET user_id = m.new_id::text
FROM id_map m
WHERE a.user_id = m.old_id::text;

WITH id_map AS (
  SELECT p.id AS old_id, c.id AS new_id
  FROM public.profiles p
  JOIN public.user_credentials c ON LOWER(p.email) = LOWER(c.email)
  WHERE p.id <> c.id
)
UPDATE public.wishlists w
SET user_id = m.new_id::text
FROM id_map m
WHERE w.user_id = m.old_id::text;

-- 2. Align profiles.id PK to match canonical user_credentials.id (no FK references profiles.id)
UPDATE public.profiles p
SET id = c.id,
    updated_at = NOW()
FROM public.user_credentials c
WHERE LOWER(p.email) = LOWER(c.email)
  AND p.id <> c.id;

-- 3. Provision missing profiles rows for any user_credentials account not yet present in profiles
INSERT INTO public.profiles (id, email, full_name, phone, preferred_size, role, created_at, updated_at)
SELECT
  c.id,
  LOWER(c.email),
  COALESCE(NULLIF(c.full_name, ''), SPLIT_PART(c.email, '@', 1)),
  c.phone,
  COALESCE(NULLIF(c.preferred_size, ''), 'M'),
  COALESCE(NULLIF(c.role, ''), 'customer'),
  COALESCE(c.created_at, NOW()),
  NOW()
FROM public.user_credentials c
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE LOWER(p.email) = LOWER(c.email)
)
ON CONFLICT (id) DO NOTHING;

-- 4. Normalize profile emails to lowercase & ensure UNIQUE constraint on profiles(email) for upsert support
UPDATE public.profiles SET email = LOWER(TRIM(email)) WHERE email IS NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_email_key' AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_email_key UNIQUE (email);
  END IF;
END $$;

-- 5. Tighten reviews RLS: inserts must go through authenticated server endpoint /api/products/[id]/reviews (service_role)
DROP POLICY IF EXISTS "Public Insert Reviews" ON public.reviews;

-- 6. Atomic coupon usage increment RPC
CREATE OR REPLACE FUNCTION public.atomic_increment_coupon_usage(p_coupon_id BIGINT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.coupons
  SET used_count = COALESCE(used_count, 0) + 1
  WHERE id = p_coupon_id
    AND (usage_limit IS NULL OR COALESCE(used_count, 0) < usage_limit);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.atomic_increment_coupon_usage(BIGINT) TO service_role;

COMMIT;
