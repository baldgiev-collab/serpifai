-- ============================================================================
-- DATABASE MIGRATION: Add Session Tracking for License Keys
-- ============================================================================
-- Purpose: Prevent multiple users from using the same license key simultaneously
-- Security: Tracks active sessions by IP address with 30-minute timeout
-- Date: 2025-12-01
-- Version: v6.0.2
-- ============================================================================

-- Add session tracking columns
ALTER TABLE users 
ADD COLUMN active_session_ip VARCHAR(45) NULL 
AFTER last_login
COMMENT 'IP address of current active session';

ALTER TABLE users 
ADD COLUMN session_started DATETIME NULL 
AFTER active_session_ip
COMMENT 'When the current session started';

-- Add index for session lookups
CREATE INDEX idx_session_ip ON users(active_session_ip);
CREATE INDEX idx_session_started ON users(session_started);

-- ============================================================================
-- HOW IT WORKS
-- ============================================================================
-- 
-- Session Timeout: 30 minutes
-- 
-- Scenario 1: First User Login
-- - User enters license key
-- - Server saves their IP in active_session_ip
-- - Server saves timestamp in session_started
-- - User can use the system
-- 
-- Scenario 2: Different User Tries Same License (Within 30 min)
-- - Different IP tries to use same license key
-- - Server checks: active_session_ip != requesting IP
-- - Server checks: session_started < 30 minutes ago
-- - Server BLOCKS access with error: "License key is currently in use"
-- 
-- Scenario 3: Session Expired (After 30 min)
-- - Different IP tries to use same license key
-- - Server checks: session_started > 30 minutes ago
-- - Server ALLOWS access and updates IP to new user
-- - Old session is invalidated
-- 
-- Scenario 4: Same User Continues
-- - Same IP keeps using license key
-- - Server recognizes IP matches active_session_ip
-- - Server updates session_started to current time (extends session)
-- - User continues without interruption
-- 
-- ============================================================================
-- SECURITY BENEFITS
-- ============================================================================
-- 
-- ✅ Prevents Password Sharing: Only ONE active user per license
-- ✅ IP-Based Tracking: Cannot bypass by clearing cookies/cache
-- ✅ Auto-Expiration: Old sessions expire after 30 minutes of inactivity
-- ✅ Audit Trail: Can see who used license and when (check error logs)
-- ✅ Fair Usage: User who logs in first gets the session
-- 
-- ============================================================================
-- ADMIN OPERATIONS
-- ============================================================================

-- View all active sessions
SELECT 
    email,
    license_key,
    active_session_ip,
    session_started,
    TIMESTAMPDIFF(MINUTE, session_started, NOW()) AS session_age_minutes
FROM users
WHERE active_session_ip IS NOT NULL
ORDER BY session_started DESC;

-- Clear a specific user's session (force logout)
UPDATE users 
SET active_session_ip = NULL, 
    session_started = NULL 
WHERE license_key = 'SERP-FAI-XXXX-XXXX';

-- Clear all expired sessions (older than 30 minutes)
UPDATE users 
SET active_session_ip = NULL, 
    session_started = NULL 
WHERE session_started < DATE_SUB(NOW(), INTERVAL 30 MINUTE);

-- View session collision attempts (from error log)
-- Check: /home/u187453795/domains/serpifai.com/public_html/error_log
-- Look for: "SECURITY: License X attempted by Y but active session from Z"

-- ============================================================================
-- DEPLOYMENT INSTRUCTIONS
-- ============================================================================
-- 
-- 1. Login to Hostinger cPanel → phpMyAdmin
-- 2. Select database: u187453795_SrpAIDataGate
-- 3. Click "SQL" tab
-- 4. Paste this entire script
-- 5. Click "Go"
-- 6. Upload updated PHP files (user_handler.php, api_gateway.php)
-- 7. Deploy updated Apps Script (UI_Settings.gs)
-- 8. Test with two different browsers/IPs
-- 
-- ============================================================================
-- TESTING
-- ============================================================================
-- 
-- Test Case 1: Normal Usage
-- 1. User A enters license key from IP 1.2.3.4
-- 2. Expected: ✅ Success, session started
-- 3. Check: SELECT active_session_ip FROM users WHERE license_key = 'XXX'
-- 4. Expected: active_session_ip = '1.2.3.4'
-- 
-- Test Case 2: Concurrent Access Blocked
-- 1. User A is active from IP 1.2.3.4
-- 2. User B tries same license from IP 5.6.7.8 (within 30 min)
-- 3. Expected: ❌ Error "License key is currently in use"
-- 4. Check error log for: "SECURITY: License attempted by 5.6.7.8..."
-- 
-- Test Case 3: Session Expiration
-- 1. User A was active from IP 1.2.3.4
-- 2. Wait 31 minutes (or manually set session_started to past)
-- 3. User B tries same license from IP 5.6.7.8
-- 4. Expected: ✅ Success, IP updated to 5.6.7.8
-- 
-- Test Case 4: Same User Continues
-- 1. User A active from IP 1.2.3.4
-- 2. User A makes another request from same IP 1.2.3.4
-- 3. Expected: ✅ Success, session_started updated (extends timeout)
-- 
-- ============================================================================
-- NOTES
-- ============================================================================
-- 
-- IPv4 vs IPv6:
-- - VARCHAR(45) supports both IPv4 (15 chars) and IPv6 (39 chars)
-- - Example IPv4: 192.168.1.1 (11 chars)
-- - Example IPv6: 2001:0db8:85a3:0000:0000:8a2e:0370:7334 (39 chars)
-- 
-- Proxy/Load Balancer:
-- - PHP code checks X-Forwarded-For header
-- - Gets real client IP behind proxies
-- 
-- Session Timeout Customization:
-- - Current: 30 minutes ($sessionTimeout = 30 * 60)
-- - To change: Edit user_handler.php line with $sessionTimeout
-- - Options: 15 min, 60 min, 120 min, etc.
-- 
-- Multi-User Licenses (Future):
-- - Add max_concurrent_users column
-- - Track multiple IPs in separate sessions table
-- - Allow N concurrent users per license
-- 
-- ============================================================================
-- ROLLBACK (if needed)
-- ============================================================================

-- Remove session tracking (uncomment to rollback)
-- ALTER TABLE users DROP COLUMN active_session_ip;
-- ALTER TABLE users DROP COLUMN session_started;
-- DROP INDEX idx_session_ip ON users;
-- DROP INDEX idx_session_started ON users;

-- ============================================================================
-- Date: December 1, 2025
-- Version: v6.0.2 (Session Tracking)
-- Status: ✅ READY FOR DEPLOYMENT
-- ============================================================================
