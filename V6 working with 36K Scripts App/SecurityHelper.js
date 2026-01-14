/**
 * SecurityHelper - Apps Script Client for Signed Requests
 * 
 * Handles client-side security:
 * 1. Base64(JSON) encoding
 * 2. HMAC SHA256 signing
 * 3. Timestamp inclusion
 * 4. Signature verification on responses
 * 
 * Usage in Apps Script:
 *   const helper = new SecurityHelper(HMAC_SECRET);
 *   const signedPayload = helper.signRequest(data);
 *   const response = helper.sendSecureRequest(url, signedPayload);
 */

class SecurityHelper {
    constructor(hmacSecret) {
        this.hmacSecret = hmacSecret;
    }

    /**
     * Sign a request payload (client-side)
     * Mimics PHP SecurityLayer.signRequest()
     */
    signRequest(data) {
        const timestamp = Math.floor(Date.now() / 1000);
        const jsonPayload = JSON.stringify(data);
        const base64Payload = Utilities.base64Encode(jsonPayload);

        // Create signature: HMAC-SHA256(timestamp + base64Payload)
        const signatureData = timestamp.toString() + base64Payload;
        
        // computeHmacSignature expects: (DigestAlgorithm, value, key)
        // where both value and key are strings or byte arrays
        const signature = Utilities.computeHmacSignature(
            Utilities.DigestAlgorithm.SHA_256,
            signatureData,
            this.hmacSecret  // Pass as string - Apps Script handles conversion
        );
        
        // Convert signature bytes to hex string
        const signatureHex = signature
            .map(function(byte) { return ('0' + (byte & 0xFF).toString(16)).slice(-2); })
            .join('');

        return {
            payload: base64Payload,
            signature: signatureHex,
            timestamp: timestamp
        };
    }

    /**
     * Send a secure POST request
     */
    sendSecureRequest(url, data, options) {
        options = options || {};
        const signedPayload = this.signRequest(data);

        const fetchOptions = {
            method: 'post',
            payload: JSON.stringify(signedPayload),
            headers: {
                'Content-Type': 'application/json'
            },
            muteHttpExceptions: true
        };

        // Merge custom options
        for (var key in options) {
            if (options.hasOwnProperty(key)) {
                fetchOptions[key] = options[key];
            }
        }

        try {
            const response = UrlFetchApp.fetch(url, fetchOptions);
            const responseText = response.getContentText();
            
            if (response.getResponseCode() === 200) {
                const parsedResponse = JSON.parse(responseText);
                
                // Verify response signature if present
                if (parsedResponse.signature && parsedResponse.timestamp && parsedResponse.payload) {
                    this.verifyResponseSignature(parsedResponse);
                }
                
                return parsedResponse;
            } else {
                Logger.log('Error: ' + response.getResponseCode() + ' - ' + responseText);
                return {
                    success: false,
                    error: 'HTTP ' + response.getResponseCode(),
                    details: responseText
                };
            }
        } catch (error) {
            Logger.log('Request error: ' + error);
            return {
                success: false,
                error: error.toString()
            };
        }
    }

    /**
     * Verify response signature (optional, for extra security)
     */
    verifyResponseSignature(response) {
        const signatureData = response.timestamp.toString() + response.payload;
        
        // computeHmacSignature expects: (DigestAlgorithm, value, key)
        // where both value and key are strings or byte arrays
        const signature = Utilities.computeHmacSignature(
            Utilities.DigestAlgorithm.SHA_256,
            signatureData,
            this.hmacSecret  // Pass as string - Apps Script handles conversion
        );
        const expectedSignature = signature
            .map(function(byte) { return ('0' + (byte & 0xFF).toString(16)).slice(-2); })
            .join('');

        if (expectedSignature !== response.signature) {
            throw new Error('Response signature verification failed - possible tampering');
        }

        return true;
    }

    /**
     * Decode response payload
     */
    decodeResponse(response) {
        if (!response.payload) {
            return response;
        }

        try {
            const decodedPayload = Utilities.newBlob(
                Utilities.base64Decode(response.payload)
            ).getDataAsString();
            return JSON.parse(decodedPayload);
        } catch (error) {
            Logger.log('Decode error: ' + error);
            return response;
        }
    }
}
