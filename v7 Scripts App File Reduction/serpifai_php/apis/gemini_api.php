<?php
/**
 * Gemini API Handler
 * Proxies all Gemini API calls with server-side key
 */

/**
 * Helper: Get cache value
 */
function getCacheValue($key) {
    try {
        $db = getDB();
        $stmt = $db->prepare("SELECT response_data FROM fetcher_cache WHERE url_hash = ? AND expires_at > NOW()");
        $stmt->execute([$key]);
        $result = $stmt->fetch();
        return $result ? json_decode($result['response_data'], true) : null;
    } catch (Exception $e) {
        error_log("Cache read failed: " . $e->getMessage());
        return null;
    }
}

/**
 * Helper: Set cache value
 */
function setCacheValue($key, $value, $ttl = 3600) {
    try {
        $db = getDB();
        $expiresAt = date('Y-m-d H:i:s', time() + $ttl);
        
        $stmt = $db->prepare("
            INSERT INTO fetcher_cache (url_hash, url, response_data, expires_at, created_at)
            VALUES (?, 'gemini', ?, ?, NOW())
            ON DUPLICATE KEY UPDATE response_data = ?, expires_at = ?
        ");
        
        $jsonValue = is_string($value) ? $value : json_encode($value);
        $stmt->execute([$key, $jsonValue, $expiresAt, $jsonValue, $expiresAt]);
        return true;
    } catch (Exception $e) {
        error_log("Cache write failed: " . $e->getMessage());
        return false;
    }
}

function callGeminiAPI($action, $payload) {
    $apiKey = GEMINI_API_KEY;
    $model = $payload['model'] ?? $payload['modelName'] ?? 'gemini-3-flash-preview';
    
    $prompt = $payload['prompt'] ?? $payload['text'] ?? '';
    
    if (empty($prompt)) {
        throw new Exception('Missing prompt for Gemini API');
    }
    
    // Verify API key is loaded
    if (empty($apiKey)) {
        throw new Exception('GEMINI_API_KEY is not configured in .env file');
    }
    
    // Debug: Log key length (not the actual key for security)
    error_log('Gemini API: Using key of length ' . strlen($apiKey) . ', model: ' . $model);
    
    // Check cache first
    $cacheKey = 'gemini:' . $model . ':' . md5($prompt);
    $cached = getCacheValue($cacheKey);
    if ($cached) {
        return [
            'success' => true,
            'data' => $cached,
            'text' => $cached,
            'cached' => true,
            'api_service' => 'gemini'
        ];
    }
    
    // Build Gemini API request
    $url = 'https://generativelanguage.googleapis.com/v1beta/models/' . $model . ':generateContent?key=' . $apiKey;
    
    $requestBody = [
        'contents' => [
            [
                'parts' => [
                    ['text' => $prompt]
                ]
            ]
        ]
    ];
    
    // Add system instruction if provided (Elite Level Persona)
    $systemInstruction = $payload['systemInstruction'] ?? $options['systemInstruction'] ?? null;
    if (!empty($systemInstruction)) {
        $requestBody['systemInstruction'] = [
            'parts' => [
                ['text' => $systemInstruction]
            ]
        ];
        error_log('Gemini API: Using system instruction (' . strlen($systemInstruction) . ' chars)');
    }
    
    // Add generation config with defaults
    $requestBody['generationConfig'] = [
        'maxOutputTokens' => 8192  // Default: allow long responses
    ];
    
    // Override with options from payload
    $options = $payload['options'] ?? [];
    if (!empty($options) || isset($payload['temperature']) || isset($payload['maxTokens']) || isset($payload['maxOutputTokens'])) {
        // Handle options object (from Apps Script)
        if (isset($options['temperature'])) {
            $requestBody['generationConfig']['temperature'] = floatval($options['temperature']);
        }
        if (isset($options['topK'])) {
            $requestBody['generationConfig']['topK'] = intval($options['topK']);
        }
        if (isset($options['topP'])) {
            $requestBody['generationConfig']['topP'] = floatval($options['topP']);
        }
        if (isset($options['maxOutputTokens'])) {
            $requestBody['generationConfig']['maxOutputTokens'] = intval($options['maxOutputTokens']);
        }
        
        // Handle direct parameters
        if (isset($payload['temperature'])) {
            $requestBody['generationConfig']['temperature'] = floatval($payload['temperature']);
        }
        if (isset($payload['maxTokens'])) {
            $requestBody['generationConfig']['maxOutputTokens'] = intval($payload['maxTokens']);
        }
        if (isset($payload['maxOutputTokens'])) {
            $requestBody['generationConfig']['maxOutputTokens'] = intval($payload['maxOutputTokens']);
        }
    }
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($requestBody));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json'
    ]);
    
    // V7.1 FIX: Extended timeouts for large Gemini responses (~65K chars = 90+ seconds)
    curl_setopt($ch, CURLOPT_TIMEOUT, 300);         // 5 minute total timeout
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 30);   // 30 second connection timeout
    
    // Increase PHP execution time for long Gemini calls
    @set_time_limit(600);  // 10 minutes max execution time
    
    error_log('Gemini API: Making request with 5 minute timeout, model=' . $model . ', prompt_length=' . strlen($prompt));
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);
    
    // Log full response for debugging
    error_log('Gemini API Response (HTTP ' . $httpCode . '): ' . substr($response, 0, 500));
    
    if ($httpCode !== 200) {
        error_log('Gemini API error (HTTP ' . $httpCode . '): ' . $response);
        
        // Parse error response from Google
        $errorData = json_decode($response, true);
        $errorMsg = 'Gemini API returned HTTP ' . $httpCode;
        
        if (isset($errorData['error']['message'])) {
            $errorMsg .= ': ' . $errorData['error']['message'];
        } else if (!empty($response)) {
            $errorMsg .= ': ' . substr($response, 0, 200);
        }
        
        if (!empty($curlError)) {
            $errorMsg .= ' (cURL: ' . $curlError . ')';
        }
        
        throw new Exception($errorMsg);
    }
    
    $result = json_decode($response, true);
    
    // Check for valid response structure
    if (!isset($result['candidates'][0])) {
        error_log('No candidates in Gemini response: ' . json_encode($result));
        throw new Exception('Gemini API returned no candidates');
    }
    
    $candidate = $result['candidates'][0];
    $finishReason = $candidate['finishReason'] ?? 'UNKNOWN';
    $warning = null;
    
    // Handle different finish reasons
    if ($finishReason === 'MAX_TOKENS') {
        error_log('Gemini API hit MAX_TOKENS limit. Partial response may be available.');
        $warning = 'MAX_TOKENS: response truncated by model';
        // Try to extract partial text if available
        if (isset($candidate['content']['parts'][0]['text'])) {
            $generatedText = $candidate['content']['parts'][0]['text'];
            error_log('Extracted partial text (MAX_TOKENS): ' . strlen($generatedText) . ' chars');
        } else {
            // Gracefully return success with warning and empty text to avoid 500
            $generatedText = '';
            error_log('MAX_TOKENS with no text parts; returning empty text with warning.');
        }
    } elseif (!isset($candidate['content']['parts'][0]['text'])) {
        // No text in response
        error_log('Invalid Gemini response structure. FinishReason: ' . $finishReason . ', Response: ' . json_encode($result));
        throw new Exception('Gemini API returned no text. FinishReason: ' . $finishReason . '. Response: ' . substr(json_encode($result), 0, 200));
    } else {
        // Normal response with text
        $generatedText = $candidate['content']['parts'][0]['text'];
    }
    
    // Cache the result
    if (!empty($generatedText)) {
        setCacheValue($cacheKey, $generatedText, 1800); // 30 minutes
    }
    
    return [
        'success' => true,
        'data' => $generatedText,
        'text' => $generatedText,  // Apps Script expects 'text' field
        'model' => $model,
        'cached' => false,
        'api_service' => 'gemini',
        'finishReason' => $finishReason,
        'warning' => $warning
    ];
}

/**
 * Handle Gemini API actions
 * Routes different Gemini-related actions
 */
function handleGeminiAction($action, $payload) {
    // Extract action type (e.g., 'gemini_generate' or 'gemini:generate')
    $actionType = str_replace(['gemini_', 'gemini:', 'ai_'], '', $action);
    
    switch ($actionType) {
        case 'generate':
            return callGeminiAPI($action, $payload);
            
        case 'analyze':
            // Oracle DataBridge forensic analysis - uses the same Gemini API
            return analyzeWithGemini($payload);
            
        case 'list_models':
        case 'models':
            return getGeminiModels();
            
        default:
            throw new Exception('Unknown Gemini action: ' . $action);
    }
}

/**
 * Oracle DataBridge Forensic Analysis
 * Handles 'gemini_analyze' action from Oracle v16.0
 * @param {array} $payload - Contains forensicData, requestedInsights
 * @returns {array} Strategic insights (killMove, moat, dominationPlan, etc.)
 */
function analyzeWithGemini($payload) {
    $apiKey = GEMINI_API_KEY;
    
    if (empty($apiKey)) {
        throw new Exception('GEMINI_API_KEY is not configured in .env file');
    }
    
    // Extract forensic data from Oracle DataBridge payload
    $forensicData = $payload['forensicData'] ?? [];
    $requestedInsights = $payload['requestedInsights'] ?? ['killMove', 'moat', 'dominationPlan'];
    
    $url = $forensicData['url'] ?? 'unknown';
    $domain = $forensicData['domain'] ?? 'unknown';
    $keywords = $forensicData['keywords'] ?? [];
    $metrics = $forensicData['metrics'] ?? [];
    $trust = $forensicData['trust'] ?? [];
    $semantic = $forensicData['semantic'] ?? [];
    $ai = $forensicData['ai'] ?? [];
    
    // Build strategic analysis prompt
    $prompt = buildStrategicAnalysisPrompt($forensicData, $requestedInsights);
    
    // Call Gemini API
    $model = 'gemini-3-flash-preview';
    $apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/' . $model . ':generateContent?key=' . $apiKey;
    
    $requestBody = [
        'contents' => [
            [
                'parts' => [
                    ['text' => $prompt]
                ]
            ]
        ],
        'systemInstruction' => [
            'parts' => [
                ['text' => 'You are an elite SEO strategist and competitive intelligence analyst. Analyze the forensic data and provide actionable strategic insights in valid JSON format only. No markdown, no explanation - just the JSON object.']
            ]
        ],
        'generationConfig' => [
            'temperature' => 0.7,
            'maxOutputTokens' => 4096
        ]
    ];
    
    $ch = curl_init($apiUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($requestBody));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_TIMEOUT, 60);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);
    
    if ($httpCode !== 200) {
        error_log('Gemini Analyze API error (HTTP ' . $httpCode . '): ' . $response);
        throw new Exception('Gemini API error: HTTP ' . $httpCode);
    }
    
    $result = json_decode($response, true);
    
    if (!isset($result['candidates'][0]['content']['parts'][0]['text'])) {
        throw new Exception('Invalid Gemini response structure');
    }
    
    $generatedText = $result['candidates'][0]['content']['parts'][0]['text'];
    
    // Parse JSON from response (handle markdown code blocks)
    $jsonText = $generatedText;
    if (preg_match('/```(?:json)?\s*([\s\S]*?)```/', $generatedText, $matches)) {
        $jsonText = trim($matches[1]);
    }
    
    $insights = json_decode($jsonText, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        // Return raw text as insight if JSON parsing fails
        $insights = [
            'killMove' => $generatedText,
            'moat' => 'Analysis completed',
            'dominationPlan' => 'See killMove for details',
            'parseWarning' => 'Response was not valid JSON'
        ];
    }
    
    return [
        'success' => true,
        'insights' => $insights,
        'url' => $url,
        'domain' => $domain,
        'keywordsAnalyzed' => count($keywords),
        'model' => $model,
        'api_service' => 'gemini'
    ];
}

/**
 * Build strategic analysis prompt from forensic data
 */
function buildStrategicAnalysisPrompt($forensicData, $requestedInsights) {
    $url = $forensicData['url'] ?? 'unknown';
    $domain = $forensicData['domain'] ?? 'unknown';
    $keywords = $forensicData['keywords'] ?? [];
    $metrics = $forensicData['metrics'] ?? [];
    $trust = $forensicData['trust'] ?? [];
    $semantic = $forensicData['semantic'] ?? [];
    
    $keywordList = array_slice($keywords, 0, 20); // Top 20 keywords
    $keywordStr = implode(', ', $keywordList);
    
    $prompt = "COMPETITOR FORENSIC ANALYSIS REQUEST\n\n";
    $prompt .= "Target: {$url}\n";
    $prompt .= "Domain: {$domain}\n\n";
    
    if (!empty($keywordStr)) {
        $prompt .= "Keywords: {$keywordStr}\n\n";
    }
    
    if (!empty($metrics)) {
        $prompt .= "Metrics:\n";
        foreach ($metrics as $key => $value) {
            $prompt .= "- {$key}: {$value}\n";
        }
        $prompt .= "\n";
    }
    
    if (!empty($trust)) {
        $prompt .= "Trust Signals:\n";
        foreach ($trust as $key => $value) {
            if (is_array($value)) {
                $prompt .= "- {$key}: " . json_encode($value) . "\n";
            } else {
                $prompt .= "- {$key}: {$value}\n";
            }
        }
        $prompt .= "\n";
    }
    
    $prompt .= "PROVIDE STRATEGIC ANALYSIS IN JSON FORMAT:\n";
    $prompt .= "{\n";
    $prompt .= '  "killMove": "The single most effective action to outrank this competitor",'."\n";
    $prompt .= '  "moat": "Their defensive advantages we must overcome",'."\n";
    $prompt .= '  "dominationPlan": "Step-by-step 90-day plan to dominate",'."\n";
    $prompt .= '  "revenueScore": 0-100,'."\n";
    $prompt .= '  "riskAssessment": "Low/Medium/High with explanation",'."\n";
    $prompt .= '  "quickWins": ["Array of 3-5 immediate actions"]'."\n";
    $prompt .= "}\n\n";
    $prompt .= "Return ONLY the JSON object, no additional text.";
    
    return $prompt;
}

/**
 * Get available Gemini models
 */
function getGeminiModels() {
    $apiKey = GEMINI_API_KEY;
    
    // Check cache
    $cacheKey = 'gemini:models:list';
    $cached = getCacheValue($cacheKey);
    if ($cached) {
        return $cached;
    }
    
    $url = 'https://generativelanguage.googleapis.com/v1beta/models?key=' . $apiKey;
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 200) {
        // Return fallback models
        return [
            'success' => true,
            'models' => [
                ['name' => 'gemini-3-flash-preview', 'displayName' => 'Gemini 3 Flash Preview'],
                ['name' => 'gemini-3-pro-preview', 'displayName' => 'Gemini 3 Pro Preview']
            ],
            'fallback' => true
        ];
    }
    
    $result = json_decode($response, true);
    $models = [];
    
    if (isset($result['models'])) {
        foreach ($result['models'] as $model) {
            if (in_array('generateContent', $model['supportedGenerationMethods'] ?? [])) {
                $modelName = str_replace('models/', '', $model['name']);
                
                // Only include Gemini 2.5 models
                if (strpos($modelName, 'gemini-2.5') === 0) {
                    $models[] = [
                        'name' => $modelName,
                        'displayName' => $model['displayName'] ?? $modelName
                    ];
                }
            }
        }
    }
    
    $response = [
        'success' => true,
        'models' => $models,
        'fallback' => false
    ];
    
    // Cache for 1 hour
    setCacheValue($cacheKey, $response, 3600);
    
    return $response;
}
