-- ============================================================================
-- Migration: RAG Sync System Database Tables
-- Description: Adds tables and fields to support RAG synchronization tracking
-- Date: 2026-02-04
-- ============================================================================

-- ============================================================================
-- PART 1: Create rag_sync_log table
-- ============================================================================
CREATE TABLE IF NOT EXISTS rag_sync_log (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,  -- 'yoga_class', 'massage', 'therapy', 'content', 'activity'
    entity_id INTEGER NOT NULL,
    action VARCHAR(20) NOT NULL,  -- 'create', 'update', 'delete'
    vector_id VARCHAR(255),  -- ID en Qdrant (UUID o similar)
    status VARCHAR(20) NOT NULL DEFAULT 'pending',  -- 'pending', 'processing', 'success', 'failed'
    error_message TEXT,
    webhook_sent_at TIMESTAMP,
    vectorized_at TIMESTAMP,
    metadata JSONB,  -- Para guardar info adicional (modelo usado, idioma, etc.)
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para rag_sync_log
CREATE INDEX idx_rag_sync_entity ON rag_sync_log(entity_type, entity_id);
CREATE INDEX idx_rag_sync_status ON rag_sync_log(status);
CREATE INDEX idx_rag_sync_created ON rag_sync_log(created_at DESC);
CREATE INDEX idx_rag_sync_vector_id ON rag_sync_log(vector_id) WHERE vector_id IS NOT NULL;

-- ============================================================================
-- PART 2: Add RAG sync fields to existing tables
-- ============================================================================

-- Add to yoga_classes
ALTER TABLE yoga_classes 
    ADD COLUMN IF NOT EXISTS vector_id VARCHAR(255),
    ADD COLUMN IF NOT EXISTS vectorized_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS needs_reindex BOOLEAN DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_yoga_classes_needs_reindex ON yoga_classes(needs_reindex) WHERE needs_reindex = TRUE;
CREATE INDEX IF NOT EXISTS idx_yoga_classes_vector_id ON yoga_classes(vector_id) WHERE vector_id IS NOT NULL;

-- Add to massage_types
ALTER TABLE massage_types 
    ADD COLUMN IF NOT EXISTS vector_id VARCHAR(255),
    ADD COLUMN IF NOT EXISTS vectorized_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS needs_reindex BOOLEAN DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_massage_needs_reindex ON massage_types(needs_reindex) WHERE needs_reindex = TRUE;
CREATE INDEX IF NOT EXISTS idx_massage_vector_id ON massage_types(vector_id) WHERE vector_id IS NOT NULL;

-- Add to therapy_types
ALTER TABLE therapy_types 
    ADD COLUMN IF NOT EXISTS vector_id VARCHAR(255),
    ADD COLUMN IF NOT EXISTS vectorized_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS needs_reindex BOOLEAN DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_therapy_needs_reindex ON therapy_types(needs_reindex) WHERE needs_reindex = TRUE;
CREATE INDEX IF NOT EXISTS idx_therapy_vector_id ON therapy_types(vector_id) WHERE vector_id IS NOT NULL;

-- Add to contents
ALTER TABLE contents 
    ADD COLUMN IF NOT EXISTS vector_id VARCHAR(255),
    ADD COLUMN IF NOT EXISTS vectorized_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS needs_reindex BOOLEAN DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_contents_needs_reindex ON contents(needs_reindex) WHERE needs_reindex = TRUE;
CREATE INDEX IF NOT EXISTS idx_contents_vector_id ON contents(vector_id) WHERE vector_id IS NOT NULL;

-- Add to activities
ALTER TABLE activities 
    ADD COLUMN IF NOT EXISTS vector_id VARCHAR(255),
    ADD COLUMN IF NOT EXISTS vectorized_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS needs_reindex BOOLEAN DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_activities_needs_reindex ON activities(needs_reindex) WHERE needs_reindex = TRUE;
CREATE INDEX IF NOT EXISTS idx_activities_vector_id ON activities(vector_id) WHERE vector_id IS NOT NULL;

-- ============================================================================
-- PART 3: Helper functions
-- ============================================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_rag_sync_log_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for rag_sync_log updated_at
DROP TRIGGER IF EXISTS trigger_rag_sync_log_updated_at ON rag_sync_log;
CREATE TRIGGER trigger_rag_sync_log_updated_at
    BEFORE UPDATE ON rag_sync_log
    FOR EACH ROW
    EXECUTE FUNCTION update_rag_sync_log_timestamp();

-- ============================================================================
-- PART 4: Mark all existing content for reindexing
-- ============================================================================

-- Mark existing yoga classes
UPDATE yoga_classes SET needs_reindex = TRUE WHERE needs_reindex IS NULL;

-- Mark existing massages
UPDATE massage_types SET needs_reindex = TRUE WHERE needs_reindex IS NULL;

-- Mark existing therapies
UPDATE therapy_types SET needs_reindex = TRUE WHERE needs_reindex IS NULL;

-- Mark existing contents (only published ones)
UPDATE contents SET needs_reindex = TRUE WHERE needs_reindex IS NULL AND status = 'published';

-- Mark existing activities (only active ones)
UPDATE activities SET needs_reindex = TRUE WHERE needs_reindex IS NULL AND is_active = TRUE;

-- ============================================================================
-- Verification Queries (optional, for testing)
-- ============================================================================

-- Check rag_sync_log structure
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'rag_sync_log' 
-- ORDER BY ordinal_position;

-- Check added columns in yoga_classes
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'yoga_classes' 
-- AND column_name IN ('vector_id', 'vectorized_at', 'needs_reindex');

-- Count items needing reindexing
-- SELECT 
--     'yoga_classes' as table_name, COUNT(*) as needs_reindex_count
-- FROM yoga_classes WHERE needs_reindex = TRUE
-- UNION ALL
-- SELECT 'massage_types', COUNT(*) FROM massage_types WHERE needs_reindex = TRUE
-- UNION ALL
-- SELECT 'therapy_types', COUNT(*) FROM therapy_types WHERE needs_reindex = TRUE
-- UNION ALL
-- SELECT 'contents', COUNT(*) FROM contents WHERE needs_reindex = TRUE
-- UNION ALL
-- SELECT 'activities', COUNT(*) FROM activities WHERE needs_reindex = TRUE;
