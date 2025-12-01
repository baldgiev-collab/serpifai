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
     */
    public static function verifyLicenseKey($licenseKey) {
        try {
            $db = getDB();
            
            $stmt = $db->prepare("
                SELECT id, email, license_key, status, credits, created_at, last_login
                FROM users
                WHERE license_key = ? AND status = 'active'
                LIMIT 1
            ");
            
            $stmt->execute([$licenseKey]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($user) {
                // Update last login
                $updateStmt = $db->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
                $updateStmt->execute([$user['id']]);
                
                return [
                    'success' => true,
                    'message' => 'License key verified',
                    'user' => $user
                ];
            } else {
                return [
                    'success' => false,
                    'error' => 'Invalid or inactive license key'
                ];
            }
            
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
    public static function getUserInfo($licenseKey) {
        return self::verifyLicenseKey($licenseKey);
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
