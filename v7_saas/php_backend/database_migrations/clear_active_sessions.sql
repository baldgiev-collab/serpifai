-- Clear Active Sessions
-- Use this to manually clear stuck sessions if needed

-- Option 1: Clear a specific user's session by email
UPDATE users 
SET active_session_ip = NULL, 
    session_started = NULL 
WHERE email = 'baldgiev@gmail.com';

-- Option 2: Clear a specific user's session by license key
UPDATE users 
SET active_session_ip = NULL, 
    session_started = NULL 
WHERE license_key = 'SERP-FAI-TEST-KEY-123456';

-- Option 3: Clear ALL expired sessions (older than 30 minutes)
UPDATE users 
SET active_session_ip = NULL, 
    session_started = NULL 
WHERE session_started IS NOT NULL 
  AND session_started < DATE_SUB(NOW(), INTERVAL 30 MINUTE);

-- Option 4: Clear ALL sessions (use with caution!)
UPDATE users 
SET active_session_ip = NULL, 
    session_started = NULL 
WHERE active_session_ip IS NOT NULL;

-- Check current sessions
SELECT email, license_key, active_session_ip, session_started,
       TIMESTAMPDIFF(MINUTE, session_started, NOW()) as minutes_active
FROM users
WHERE active_session_ip IS NOT NULL
ORDER BY session_started DESC;
