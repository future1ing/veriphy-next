-- ═══════════════════════════════════════════════════════════
-- Veriphy — Supabase Schema
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── PROFILES (extends Supabase auth.users) ────────────────
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  phone         TEXT,
  country       TEXT DEFAULT 'MA',
  language      TEXT DEFAULT 'fr',
  role          TEXT DEFAULT 'client' CHECK (role IN ('client', 'admin')),
  plan          TEXT DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'business')),
  is_active     BOOLEAN DEFAULT TRUE,
  -- Crops & preferences
  crops         TEXT DEFAULT '',          -- comma-separated: "tomate,poivron"
  countries_watched TEXT DEFAULT 'EU',   -- comma-separated: "EU,MA"
  notify_channels   TEXT DEFAULT 'email', -- comma-separated: "email,whatsapp"
  min_severity  TEXT DEFAULT 'info' CHECK (min_severity IN ('info', 'warning', 'critical')),
  -- Stripe
  stripe_customer_id    TEXT UNIQUE,
  stripe_subscription_id TEXT,
  plan_expires_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', 'Utilisateur'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── ALERTS ────────────────────────────────────────────────
CREATE TABLE alerts (
  id              BIGSERIAL PRIMARY KEY,
  user_id         UUID REFERENCES profiles(id) ON DELETE CASCADE,
  event_type      TEXT NOT NULL,
  severity        TEXT NOT NULL CHECK (severity IN ('critical', 'warning', 'info')),
  substance_name  TEXT NOT NULL,
  substance_id    TEXT,
  product_code    TEXT,
  product_name    TEXT,
  old_mrl         TEXT,
  new_mrl         TEXT,
  regulation      TEXT,
  description     TEXT NOT NULL,
  country         TEXT DEFAULT 'EU',
  source          TEXT DEFAULT 'EU_Commission',
  detected_at     TEXT,
  is_read         BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alerts_user_id ON alerts(user_id);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_is_read ON alerts(is_read);
CREATE INDEX idx_alerts_created_at ON alerts(created_at DESC);

-- ─── SNAPSHOTS (parsed DB versions) ───────────────────────
CREATE TABLE snapshots (
  id                BIGSERIAL PRIMARY KEY,
  snapshot_id       TEXT UNIQUE NOT NULL,  -- e.g. "EU_20260608"
  country           TEXT NOT NULL,
  source            TEXT NOT NULL,
  db_creation_date  TEXT,
  extracted_at      TIMESTAMPTZ DEFAULT NOW(),
  total_substances  INTEGER DEFAULT 0,
  total_records     INTEGER DEFAULT 0,
  storage_path      TEXT,                  -- Vercel Blob or Supabase Storage path
  is_current        BOOLEAN DEFAULT FALSE
);

-- ─── DIFF REPORTS ─────────────────────────────────────────
CREATE TABLE diff_reports (
  id                BIGSERIAL PRIMARY KEY,
  report_id         TEXT UNIQUE NOT NULL,
  snapshot_old      TEXT,
  snapshot_new      TEXT,
  country           TEXT DEFAULT 'EU',
  total_changes     INTEGER DEFAULT 0,
  critical_count    INTEGER DEFAULT 0,
  warning_count     INTEGER DEFAULT 0,
  info_count        INTEGER DEFAULT 0,
  substances_affected INTEGER DEFAULT 0,
  generated_at      TIMESTAMPTZ DEFAULT NOW(),
  report_data       JSONB              -- stores the full diff report
);

-- ─── NOTIFICATION LOGS ────────────────────────────────────
CREATE TABLE notification_logs (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  alert_id    BIGINT REFERENCES alerts(id),
  channel     TEXT CHECK (channel IN ('email', 'whatsapp', 'sms')),
  status      TEXT CHECK (status IN ('sent', 'failed', 'dry_run')),
  sent_at     TIMESTAMPTZ DEFAULT NOW(),
  error_msg   TEXT
);

-- ─── ROW LEVEL SECURITY ───────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users see own profile" ON profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users see own alerts" ON alerts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users see own notifications" ON notification_logs
  FOR ALL USING (auth.uid() = user_id);

-- Admins see everything (via service role key — bypasses RLS)
-- snapshots and diff_reports are public read
ALTER TABLE snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE diff_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read snapshots" ON snapshots FOR SELECT USING (TRUE);
CREATE POLICY "Anyone can read diff reports" ON diff_reports FOR SELECT USING (TRUE);

-- ─── HELPER FUNCTIONS ────────────────────────────────────
-- Get unread alert count for a user
CREATE OR REPLACE FUNCTION get_alert_stats(p_user_id UUID)
RETURNS JSON AS $$
  SELECT json_build_object(
    'total',    COUNT(*),
    'unread',   COUNT(*) FILTER (WHERE NOT is_read),
    'critical', COUNT(*) FILTER (WHERE severity = 'critical'),
    'warning',  COUNT(*) FILTER (WHERE severity = 'warning'),
    'info',     COUNT(*) FILTER (WHERE severity = 'info')
  ) FROM alerts WHERE user_id = p_user_id;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
