-- ============================================================================
-- MIGRATION: Add missing total_credits_used column if it doesn't exist
-- Run this SQL on your Hostinger database to fix the schema
-- ============================================================================

-- Check if column exists before adding
SET @dbname = 'u187453795_SrpAIDataGate';  -- Replace with your actual database name
SET @tablename = 'users';
SET @columnname = 'total_credits_used';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      TABLE_SCHEMA = @dbname
      AND TABLE_NAME = @tablename
      AND COLUMN_NAME = @columnname
  ) > 0,
  "SELECT 1",
  CONCAT("ALTER TABLE ", @tablename, " ADD ", @columnname, " INT DEFAULT 0 AFTER total_credits_purchased")
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Verify the column was added
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    COLUMN_DEFAULT, 
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'u187453795_SrpAIDataGate'  -- Replace with your actual database name
  AND TABLE_NAME = 'users'
  AND COLUMN_NAME IN ('credits', 'total_credits_purchased', 'total_credits_used');
