<?php
/**
 * Stripe Webhook Handler
 * Processes payment events and updates user credits
 */

require_once __DIR__ . '/../config.php';

// Set Stripe secret key
\Stripe\Stripe::setApiKey(STRIPE_SECRET_KEY);

/**
 * Verify Stripe webhook signature
 */
function verifyStripeSignature($payload, $signature) {
    try {
        $event = \Stripe\Webhook::constructEvent(
            $payload,
            $signature,
            STRIPE_WEBHOOK_SECRET
        );
        return $event;
    } catch (\Exception $e) {
        return false;
    }
}

/**
 * Process successful payment
 */
function processSuccessfulPayment($session) {
    $db = getDbConnection();
    
    if (!$db) {
        return false;
    }
    
    try {
        // Extract metadata
        $licenseKey = $session->metadata->license_key ?? null;
        $planType = $session->metadata->plan_type ?? null;
        $topupCredits = $session->metadata->topup_credits ?? null;
        
        if (!$licenseKey) {
            error_log('No license key in session metadata');
            return false;
        }
        
        // Get user
        $stmt = $db->prepare("SELECT id, plan_type FROM users WHERE license_key = ?");
        $stmt->bind_param('s', $licenseKey);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            error_log('User not found: ' . $licenseKey);
            return false;
        }
        
        $user = $result->fetch_assoc();
        $userId = $user['id'];
        
        // Handle subscription payment
        if ($planType) {
            // Update user plan and reset credits
            $monthlyCredits = PLAN_LIMITS[$planType]['monthly_credits'] ?? 20;
            
            $stmt = $db->prepare("
                UPDATE users 
                SET plan_type = ?,
                    credits_remaining = ?,
                    subscription_status = 'active',
                    last_reset_date = NOW()
                WHERE id = ?
            ");
            $stmt->bind_param('sii', $planType, $monthlyCredits, $userId);
            $stmt->execute();
            
            error_log("Updated user $userId to plan $planType with $monthlyCredits credits");
        }
        
        // Handle top-up payment
        if ($topupCredits) {
            // Add credits to user
            $stmt = $db->prepare("
                UPDATE users 
                SET credits_remaining = credits_remaining + ?
                WHERE id = ?
            ");
            $stmt->bind_param('ii', $topupCredits, $userId);
            $stmt->execute();
            
            // Log top-up purchase
            $amount = $session->amount_total / 100; // Convert cents to dollars
            $stmt = $db->prepare("
                INSERT INTO topup_purchases 
                (user_id, credits_purchased, amount_paid, stripe_session_id)
                VALUES (?, ?, ?, ?)
            ");
            $sessionId = $session->id;
            $stmt->bind_param('iids', $userId, $topupCredits, $amount, $sessionId);
            $stmt->execute();
            
            error_log("Added $topupCredits credits to user $userId");
        }
        
        return true;
        
    } catch (Exception $e) {
        error_log('Error processing payment: ' . $e->getMessage());
        return false;
    } finally {
        $db->close();
    }
}

/**
 * Process failed payment
 */
function processFailedPayment($session) {
    $db = getDbConnection();
    
    if (!$db) {
        return false;
    }
    
    try {
        $licenseKey = $session->metadata->license_key ?? null;
        
        if ($licenseKey) {
            // Mark subscription as past_due
            $stmt = $db->prepare("
                UPDATE users 
                SET subscription_status = 'past_due'
                WHERE license_key = ?
            ");
            $stmt->bind_param('s', $licenseKey);
            $stmt->execute();
            
            error_log("Marked subscription as past_due for: $licenseKey");
        }
        
        return true;
        
    } catch (Exception $e) {
        error_log('Error processing failed payment: ' . $e->getMessage());
        return false;
    } finally {
        $db->close();
    }
}

/**
 * Process subscription cancellation
 */
function processSubscriptionCancelled($subscription) {
    $db = getDbConnection();
    
    if (!$db) {
        return false;
    }
    
    try {
        $customerId = $subscription->customer;
        
        // Find user by Stripe customer ID
        $stmt = $db->prepare("
            UPDATE users 
            SET subscription_status = 'cancelled',
                plan_type = 'starter'
            WHERE stripe_customer_id = ?
        ");
        $stmt->bind_param('s', $customerId);
        $stmt->execute();
        
        error_log("Cancelled subscription for customer: $customerId");
        
        return true;
        
    } catch (Exception $e) {
        error_log('Error processing cancellation: ' . $e->getMessage());
        return false;
    } finally {
        $db->close();
    }
}

/**
 * Main webhook handler
 */
function handleStripeWebhook() {
    // Get raw POST body
    $payload = @file_get_contents('php://input');
    $signature = $_SERVER['HTTP_STRIPE_SIGNATURE'] ?? '';
    
    // Verify signature
    $event = verifyStripeSignature($payload, $signature);
    
    if (!$event) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid signature']);
        exit;
    }
    
    // Log webhook
    $db = getDbConnection();
    if ($db) {
        $stmt = $db->prepare("
            INSERT INTO webhook_logs (event_type, event_data)
            VALUES (?, ?)
        ");
        $eventType = $event->type;
        $eventData = json_encode($event->data);
        $stmt->bind_param('ss', $eventType, $eventData);
        $stmt->execute();
        $db->close();
    }
    
    // Handle event
    switch ($event->type) {
        case 'checkout.session.completed':
            $session = $event->data->object;
            processSuccessfulPayment($session);
            break;
            
        case 'payment_intent.payment_failed':
            $session = $event->data->object;
            processFailedPayment($session);
            break;
            
        case 'customer.subscription.deleted':
            $subscription = $event->data->object;
            processSubscriptionCancelled($subscription);
            break;
            
        case 'customer.subscription.updated':
            // Handle subscription updates (plan changes, etc.)
            break;
            
        default:
            error_log('Unhandled event type: ' . $event->type);
    }
    
    // Return success
    http_response_code(200);
    echo json_encode(['received' => true]);
}

// Execute webhook handler if called directly
if (basename($_SERVER['PHP_SELF']) === 'webhook_handler.php') {
    handleStripeWebhook();
}
