-- Migration 002: Add note and translations columns to schedules table
-- Run this in Supabase SQL Editor

ALTER TABLE schedules
    ADD COLUMN IF NOT EXISTS note VARCHAR(500) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS translations JSONB DEFAULT NULL;

-- Verify
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'schedules' 
  AND column_name IN ('note', 'translations');
