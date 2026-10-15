-- ==============================================================================
-- Migration: Email Branding and Shared Signatures System
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ==============================================================================

-- 1. Table for Global Email Branding (Header and Footer)
CREATE TABLE IF NOT EXISTS public.email_branding (
    id TEXT PRIMARY KEY DEFAULT 'global_default',
    header_url TEXT,
    header_filename TEXT,
    footer_url TEXT,
    footer_filename TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by TEXT DEFAULT 'admin'
);

-- Ensure default row exists
INSERT INTO public.email_branding (id, header_url, footer_url)
VALUES ('global_default', NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- 2. Table for Shared Signatures Library
CREATE TABLE IF NOT EXISTS public.email_signatures (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    image_url TEXT NOT NULL,
    filename TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT DEFAULT 'officer'
);

-- Index for sorting signatures
CREATE INDEX IF NOT EXISTS idx_email_signatures_created_at ON public.email_signatures(created_at DESC);
