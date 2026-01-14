<?php
/**
 * SecurityLayer - Production-Grade Request/Response Security
 * 
 * Implements:
 * 1. Base64(JSON) encoding for payloads
 * 2. HMAC SHA256 signature verification
 * 3. Timestamp validation (±60 seconds)
 * 4. HTTPS enforcement
 * 
 * Usage:
 *   $security = new SecurityLayer($_ENV['HMAC_SECRET']);
 *   $signed = $security->signRequest(['data' => 'value']);
 *   $verified = $security->verifyRequest($signedPayload);
 */

class SecurityLayer {
    private $hmacSecret;
    private $timestampWindow;
    
    public function __construct($hmacSecret, $timestampWindow = 60) {
        if (empty($hmacSecret)) {
            throw new Exception("HMAC_SECRET not configured in environment");
        }
        
        $this->hmacSecret = $hmacSecret;
        $this->timestampWindow = $timestampWindow;
        
        // Enforce HTTPS in production
        $serverEnv = $_ENV['SERVER_ENV'] ?? 'production';
        if ($serverEnv !== 'development' && empty($_SERVER['HTTPS'])) {
            http_response_code(403);
            die(json_encode([
                'success' => false,
                'error' => 'HTTPS required'
            ]));
        }
    }
    
    /**
     * Sign a request payload
     * Returns: [
     *   'payload' => base64(json($data)),
     *   'signature' => hmac_sha256(timestamp + base64Payload),
     *   'timestamp' => current_timestamp
     * ]
     */
    public function signRequest($data) {
        $timestamp = time();
        $jsonPayload = json_encode($data);
        $base64Payload = base64_encode($jsonPayload);
        
        // Create signature: HMAC-SHA256(timestamp + base64Payload)
        $signatureData = $timestamp . $base64Payload;
        $signature = hash_hmac('sha256', $signatureData, $this->hmacSecret, false);
        
        return [
            'payload' => $base64Payload,
            'signature' => $signature,
            'timestamp' => $timestamp
        ];
    }
    
    /**
     * Verify an incoming request
     * Checks: signature, timestamp validity
     * Returns: Decoded data or throws exception
     */
    public function verifyRequest($base64Payload, $signature, $timestamp) {
        // 1. Verify timestamp is within window
        $now = time();
        $timeDiff = abs($now - $timestamp);
        
        if ($timeDiff > $this->timestampWindow) {
            throw new Exception("Request timestamp outside valid window (±{$this->timestampWindow}s). Possible replay attack.");
        }
        
        // 2. Verify HMAC signature
        $signatureData = $timestamp . $base64Payload;
        $expectedSignature = hash_hmac('sha256', $signatureData, $this->hmacSecret, false);
        
        if (!hash_equals($signature, $expectedSignature)) {
            throw new Exception("Invalid request signature. Possible tampering detected.");
        }
        
        // 3. Decode payload
        $jsonPayload = base64_decode($base64Payload, true);
        if ($jsonPayload === false) {
            throw new Exception("Invalid Base64 payload encoding");
        }
        
        $data = json_decode($jsonPayload, true);
        if ($data === null) {
            throw new Exception("Invalid JSON in payload");
        }
        
        return $data;
    }
    
    /**
     * Create a secure response
     * All API responses should use this
     */
    public function createSecureResponse($data, $statusCode = 200) {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: DENY');
        header('X-XSS-Protection: 1; mode=block');
        
        $signedResponse = $this->signRequest($data);
        
        echo json_encode([
            'payload' => $signedResponse['payload'],
            'signature' => $signedResponse['signature'],
            'timestamp' => $signedResponse['timestamp']
        ]);
        exit;
    }
    
    /**
     * Verify and decode incoming payload from client
     * Should be called at start of api_gateway.php
     */
    public static function verifyIncomingRequest() {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['payload'], $input['signature'], $input['timestamp'])) {
            throw new Exception("Missing required security fields: payload, signature, timestamp");
        }
        
        $security = new self($_ENV['HMAC_SECRET'] ?? '', $_ENV['TIMESTAMP_WINDOW'] ?? 60);
        return $security->verifyRequest(
            $input['payload'],
            $input['signature'],
            $input['timestamp']
        );
    }
}
?>
