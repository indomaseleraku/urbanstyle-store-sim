-- ==============================================================================
-- URBANSTYLE STORE - V4.5 SECURITY, ATOMICITY & DATA RECONCILIATION MIGRATION
-- Project: qrrdfbdzcozjdaysfimi
-- Safe & Idempotent Migration
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Fix default rating produk baru agar 0.0 sampai menerima ulasan nyata
ALTER TABLE public.products ALTER COLUMN rating SET DEFAULT 0;
ALTER TABLE public.products ALTER COLUMN reviews_count SET DEFAULT 0;

-- 2. Rekonsiliasi rating & reviews_count agar 100% sinkron dengan tabel reviews
UPDATE public.products p
SET
  rating = COALESCE(agg.avg_rating, 0),
  reviews_count = COALESCE(agg.cnt, 0)
FROM (
  SELECT
    p2.id,
    ROUND(AVG(r.rating)::numeric, 1) AS avg_rating,
    COUNT(r.id)::int AS cnt
  FROM public.products p2
  LEFT JOIN public.reviews r ON r.product_id = p2.id
  GROUP BY p2.id
) agg
WHERE p.id = agg.id
  AND (
    p.rating IS DISTINCT FROM COALESCE(agg.avg_rating, 0)
    OR p.reviews_count IS DISTINCT FROM COALESCE(agg.cnt, 0)
  );

-- 3. Backfill user_id pesanan legacy jika customer_email cocok dengan profil terdaftar
UPDATE public.orders o
SET user_id = p.id
FROM public.profiles p
WHERE o.user_id IS NULL
  AND o.customer_email IS NOT NULL
  AND LOWER(o.customer_email) = LOWER(p.email);

-- 4. Rekonsiliasi pesanan 'Menunggu Pembayaran' > 20 menit & kembalikan stok secara atomik
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    WITH expired AS (
      UPDATE public.orders
      SET status = 'Dibatalkan', updated_at = NOW()
      WHERE status = 'Menunggu Pembayaran'
        AND created_at < NOW() - INTERVAL '20 minutes'
      RETURNING id
    )
    SELECT oi.product_id, SUM(oi.quantity)::int AS qty
    FROM expired e
    JOIN public.order_items oi ON oi.order_id = e.id
    WHERE oi.product_id IS NOT NULL AND oi.quantity > 0
    GROUP BY oi.product_id
  LOOP
    UPDATE public.products
    SET stock = GREATEST(0, COALESCE(stock, 0) + rec.qty)
    WHERE id = rec.product_id;
  END LOOP;
END $$;

-- 5. Atomic Inventory Restock & Atomic Coupon Claim/Release RPCs (service_role only)
CREATE OR REPLACE FUNCTION public.atomic_increment_stock(p_product_id BIGINT, p_qty INT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_qty IS NULL OR p_qty <= 0 THEN
    RAISE EXCEPTION 'Kuantitas restock harus lebih dari 0.';
  END IF;

  UPDATE public.products
  SET stock = GREATEST(0, COALESCE(stock, 0) + p_qty)
  WHERE id = p_product_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Produk ID % tidak ditemukan untuk restock.', p_product_id;
  END IF;

  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.atomic_increment_stock(BIGINT, INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.atomic_increment_stock(BIGINT, INT) TO service_role;

CREATE OR REPLACE FUNCTION public.atomic_claim_coupon(p_coupon_id BIGINT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.coupons
  SET used_count = COALESCE(used_count, 0) + 1
  WHERE id = p_coupon_id
    AND is_active = TRUE
    AND (valid_until IS NULL OR valid_until > NOW())
    AND (usage_limit IS NULL OR COALESCE(used_count, 0) < usage_limit);

  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.atomic_claim_coupon(BIGINT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.atomic_claim_coupon(BIGINT) TO service_role;

CREATE OR REPLACE FUNCTION public.atomic_release_coupon(p_coupon_id BIGINT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.coupons
  SET used_count = GREATEST(0, COALESCE(used_count, 0) - 1)
  WHERE id = p_coupon_id;
END;
$$;

REVOKE ALL ON FUNCTION public.atomic_release_coupon(BIGINT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.atomic_release_coupon(BIGINT) TO service_role;

-- 6. Single-use & attempt-limited OTP challenge table
CREATE TABLE IF NOT EXISTS public.auth_otp_challenges (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email        TEXT NOT NULL,
  purpose      VARCHAR(20) NOT NULL CHECK (purpose IN ('login', 'register', 'reset')),
  otp_hash     TEXT NOT NULL,
  nonce        TEXT NOT NULL UNIQUE,
  attempts     INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 5,
  expires_at   TIMESTAMPTZ NOT NULL,
  verified_at  TIMESTAMPTZ,
  consumed_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auth_otp_email_purpose ON public.auth_otp_challenges (email, purpose, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auth_otp_expires_at    ON public.auth_otp_challenges (expires_at);

-- 7. Newsletter subscribers persistence
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL UNIQUE,
  source        VARCHAR(50) NOT NULL DEFAULT 'footer',
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Store & Finance Configuration Settings (persisted from StoresChannels UI)
CREATE TABLE IF NOT EXISTS public.store_settings (
  key        VARCHAR(100) PRIMARY KEY,
  value      JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_by TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_store_settings_updated_at ON public.store_settings;
CREATE TRIGGER trg_store_settings_updated_at BEFORE UPDATE ON public.store_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.store_settings (key, value, updated_by)
VALUES ('finance_tax_config', '{"ppnRate":11,"approvalLimit":10000000}'::jsonb, 'system')
ON CONFLICT (key) DO NOTHING;

-- 9. Enable RLS & Service-Role Only policies for new tables
ALTER TABLE public.auth_otp_challenges    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings         ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service Role Full Auth OTP Challenges"    ON public.auth_otp_challenges;
DROP POLICY IF EXISTS "Service Role Full Newsletter Subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Service Role Full Store Settings"         ON public.store_settings;

CREATE POLICY "Service Role Full Auth OTP Challenges"
  ON public.auth_otp_challenges FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service Role Full Newsletter Subscribers"
  ON public.newsletter_subscribers FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service Role Full Store Settings"
  ON public.store_settings FOR ALL TO service_role USING (true) WITH CHECK (true);
