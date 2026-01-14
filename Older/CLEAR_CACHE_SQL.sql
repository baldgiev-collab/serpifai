-- Clear Gemini API Cache
-- Run this in Hostinger phpMyAdmin to clear old cached error responses

-- Option 1: Clear ONLY Gemini cache (recommended)
DELETE FROM fetcher_cache WHERE url_hash LIKE 'gemini:%';

-- Option 2: Clear ALL cache (if Option 1 doesn't work)
-- TRUNCATE TABLE fetcher_cache;

-- Verify cache cleared
SELECT COUNT(*) as gemini_cache_count FROM fetcher_cache WHERE url_hash LIKE 'gemini:%';
