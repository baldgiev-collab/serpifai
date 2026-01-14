<?php
/**
 * User Handler - License Key Verification and User Info
 * Handles user authentication, credits, and license key management
 */

require_once __DIR__ . '/../config/db_config.php';

class UserHandler {
    
    /**
     * Verify license key and return user info
     * Returns the account email from database (support@serpifai.com, etc.)
     * SECURITY: Tracks active session by IP address - only one active user per license
     * FLEXIBLE: Supports user-provided email - validates license key can be used by this email
     * 
     * @param string $licenseKey - The license key to validate
     * @param string $clientIp - The client IP address
     * @param string $userEmail - Optional: The email address user wants to use (if different from DB email)
     */
    public static function verifyLicenseKey($licenseKey, $clientIp = null, $userEmail = null) {
        try {
            $db = getDB();
            
            // Get client IP if not provided
            if (!$clientIp) {
                $clientIp = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
                // Handle proxy/load balancer
                if (isset($_SERVER['HTTP_X_FORWARDED_FOR'])) {
                    $clientIp = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0];
                }
            }
            
            // If userEmail is provided, validate it matches the license key's email
            // Otherwise, just validate the license key exists and is active
            if ($userEmail) {
                $stmt = $db->prepare("
                    SELECT id, email, license_key, status, credits, created_at, last_login,
                           active_session_ip, session_started
                    FROM users
                    WHERE license_key = ? AND email = ? AND status = 'active'
                    LIMIT 1
                ");
                $stmt->execute([$licenseKey, $userEmail]);
            } else {
                $stmt = $db->prepare("
                    SELECT id, email, license_key, status, credits, created_at, last_login,
                           active_session_ip, session_started
                    FROM users
                    WHERE license_key = ? AND status = 'active'
                    LIMIT 1
                ");
                $stmt->execute([$licenseKey]);
            }
            
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$user) {
                if ($userEmail) {
                    return [
                        'success' => false,
                        'error' => 'License key not found or not assigned to email: ' . $userEmail
                    ];
                } else {
                    return [
                        'success' => false,
                        'error' => 'Invalid or inactive license key'
                    ];
                }
            }
            
            // SECURITY: Check active session
            $sessionTimeout = 30 * 60; // 30 minutes
            $currentTime = time();
            
            if ($user['active_session_ip']) {
                $sessionAge = $currentTime - strtotime($user['session_started']);
                
                // IMPORTANT: If the same email is trying to log in again, allow it
                // This handles cases where:
                // - User's IP changed (VPN, mobile network switch, etc.)
                // - User closed browser and reopened
                // - User is logging in from a different device but same email
                $isSameUserEmail = ($userEmail && $userEmail === $user['email']);
                
                // If someone else is using this license (different IP AND different/unknown email)
                if ($user['active_session_ip'] !== $clientIp && !$isSameUserEmail) {
                    // Check if session is still active (within timeout)
                    if ($sessionAge < $sessionTimeout) {
                        error_log('SECURITY: License ' . $licenseKey . ' attempted by ' . $clientIp . 
                                 ' (email: ' . ($userEmail ?? 'unknown') . ') but active session from ' . 
                                 $user['active_session_ip'] . ' for email ' . $user['email']);
                        return [
                            'success' => false,
                            'error' => 'License key is currently in use by another user. Please wait 30 minutes or contact support.',
                            'error_code' => 'SESSION_ACTIVE',
                            'active_since' => $user['session_started'],
                            'active_user_email' => $user['email']
                        ];
                    }
                    // Session expired - allow new user
                    error_log('Session expired for license ' . $licenseKey . ', allowing new IP: ' . $clientIp);
                } else if ($isSameUserEmail && $user['active_session_ip'] !== $clientIp) {
                    // Same user (email), different IP - allow and log
                    error_log('INFO: User ' . $userEmail . ' logging in from new IP: ' . $clientIp . 
                             ' (previous: ' . $user['active_session_ip'] . ') - ALLOWED');
                }
            }
            
            // Update session info and last login
            $updateStmt = $db->prepare("
                UPDATE users 
                SET last_login = NOW(), 
                    active_session_ip = ?, 
                    session_started = NOW() 
                WHERE id = ?
            ");
            $updateStmt->execute([$clientIp, $user['id']]);
            
            // Update user data with current session info
            $user['active_session_ip'] = $clientIp;
            $user['session_started'] = date('Y-m-d H:i:s');
            
            return [
                'success' => true,
                'message' => 'License key verified',
                'user' => $user
            ];
            
        } catch (Exception $e) {
            error_log('UserHandler::verifyLicenseKey error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Database error: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Get user info by license key
     */
    public static function getUserInfo($licenseKey, $clientIp = null, $userEmail = null) {
        return self::verifyLicenseKey($licenseKey, $clientIp, $userEmail);
    }
    
    /**
     * Deduct credits from user account
     */
    public static function deductCredits($licenseKey, $amount) {
        try {
            $db = getDB();
            
            // Get current credits
            $stmt = $db->prepare("SELECT id, credits FROM users WHERE license_key = ? AND status = 'active'");
            $stmt->execute([$licenseKey]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$user) {
                return [
                    'success' => false,
                    'error' => 'User not found or inactive'
                ];
            }
            
            if ($user['credits'] < $amount) {
                return [
                    'success' => false,
                    'error' => 'Insufficient credits. You have ' . $user['credits'] . ' credits, but need ' . $amount
                ];
            }
            
            // Deduct credits
            $newCredits = $user['credits'] - $amount;
            $updateStmt = $db->prepare("UPDATE users SET credits = ? WHERE id = ?");
            $updateStmt->execute([$newCredits, $user['id']]);
            
            return [
                'success' => true,
                'credits_remaining' => $newCredits,
                'credits_used' => $amount
            ];
            
        } catch (Exception $e) {
            error_log('UserHandler::deductCredits error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Error deducting credits: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Add credits to user account
     */
    public static function addCredits($licenseKey, $amount) {
        try {
            $db = getDB();
            
            // Get current credits
            $stmt = $db->prepare("SELECT id, credits FROM users WHERE license_key = ? AND status = 'active'");
            $stmt->execute([$licenseKey]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$user) {
                return [
                    'success' => false,
                    'error' => 'User not found or inactive'
                ];
            }
            
            // Add credits
            $newCredits = $user['credits'] + $amount;
            $updateStmt = $db->prepare("UPDATE users SET credits = ? WHERE id = ?");
            $updateStmt->execute([$newCredits, $user['id']]);
            
            return [
                'success' => true,
                'credits_remaining' => $newCredits,
                'credits_added' => $amount
            ];
            
        } catch (Exception $e) {
            error_log('UserHandler::addCredits error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Error adding credits: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Check if user has sufficient credits
     */
    public static function hasCredits($licenseKey, $requiredAmount) {
        try {
            $db = getDB();
            
            $stmt = $db->prepare("SELECT credits FROM users WHERE license_key = ? AND status = 'active'");
            $stmt->execute([$licenseKey]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$user) {
                return [
                    'success' => false,
                    'hasCredits' => false,
                    'error' => 'User not found or inactive'
                ];
            }
            
            return [
                'success' => true,
                'hasCredits' => $user['credits'] >= $requiredAmount,
                'current_credits' => $user['credits'],
                'required_credits' => $requiredAmount
            ];
            
        } catch (Exception $e) {
            error_log('UserHandler::hasCredits error: ' . $e->getMessage());
            return [
                'success' => false,
                'hasCredits' => false,
                'error' => 'Error checking credits: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Get user's credit balance
     */
    public static function getCredits($licenseKey) {
        try {
            $db = getDB();
            
            $stmt = $db->prepare("SELECT credits FROM users WHERE license_key = ? AND status = 'active'");
            $stmt->execute([$licenseKey]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$user) {
                return [
                    'success' => false,
                    'error' => 'User not found or inactive'
                ];
            }
            
            return [
                'success' => true,
                'credits' => $user['credits']
            ];
            
        } catch (Exception $e) {
            error_log('UserHandler::getCredits error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Error retrieving credits: ' . $e->getMessage()
            ];
        }
    }
}
