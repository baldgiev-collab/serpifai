<?php
/**
 * User Handler - License Key Verification and User Info
 * Handles user authentication, credits, and license key management
 */

require_once __DIR__ . '/../config/db_config.php';

class UserHandler {
    
    /**
     * Verify license key and return user info
     * Security: Binds license key to specific Google account on first use
     * 
     * @param string $licenseKey The license key to verify
     * @param string|null $googleAccountEmail The Google account email attempting to use this license
     */
    public static function verifyLicenseKey($licenseKey, $googleAccountEmail = null) {
        try {
            $db = getDB();
            
            $stmt = $db->prepare("
                SELECT id, email, license_key, status, credits, created_at, last_login, google_account_email
                FROM users
                WHERE license_key = ? AND status = 'active'
                LIMIT 1
            ");
            
            $stmt->execute([$licenseKey]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$user) {
                return [
                    'success' => false,
                    'error' => 'Invalid or inactive license key'
                ];
            }
            
            // SECURITY: Google Account Binding
            if ($googleAccountEmail) {
                // If license key is already bound to a Google account
                if ($user['google_account_email']) {
                    // Check if the requesting Google account matches
                    if ($user['google_account_email'] !== $googleAccountEmail) {
                        error_log('SECURITY ALERT: License key ' . $licenseKey . ' attempted by ' . $googleAccountEmail . ' but bound to ' . $user['google_account_email']);
                        return [
                            'success' => false,
                            'error' => 'License key is registered to a different Google account',
                            'error_code' => 'GOOGLE_ACCOUNT_MISMATCH',
                            'bound_to' => $user['google_account_email']
                        ];
                    }
                    // Google account matches - proceed
                } else {
                    // License key not yet bound - bind it now to this Google account
                    error_log('Binding license key ' . $licenseKey . ' to Google account: ' . $googleAccountEmail);
                    $bindStmt = $db->prepare("UPDATE users SET google_account_email = ? WHERE id = ?");
                    $bindStmt->execute([$googleAccountEmail, $user['id']]);
                    $user['google_account_email'] = $googleAccountEmail;
                }
            }
            
            // Update last login
            $updateStmt = $db->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
            $updateStmt->execute([$user['id']]);
            
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
     * 
     * @param string $licenseKey The license key
     * @param string|null $googleAccountEmail The Google account email (for validation)
     */
    public static function getUserInfo($licenseKey, $googleAccountEmail = null) {
        return self::verifyLicenseKey($licenseKey, $googleAccountEmail);
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
