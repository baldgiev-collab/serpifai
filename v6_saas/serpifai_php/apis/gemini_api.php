<?php
/**
 * Gemini API Handler
 * Proxies all Gemini API calls with server-side key
 */

function callGeminiAPI($action, $payload) {
    $apiKey = GEMINI_API_KEY;
    $model = $payload['model'] ?? $payload['modelName'] ?? 'gemini-2.5-flash';
    
    $prompt = $payload['prompt'] ?? $payload['text'] ?? '';
    
    if (empty($prompt)) {
        throw new Exception('Missing prompt for Gemini API');
    }
    
    // Check cache first
    $cacheKey = 'gemini:' . $model . ':' . md5($prompt);
    $cached = getCacheValue($cacheKey);
    if ($cached) {
        return [
            'success' => true,
            'data' => $cached,
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
    
    // Add generation config if provided
    if (isset($payload['temperature']) || isset($payload['maxTokens'])) {
        $requestBody['generationConfig'] = [];
        if (isset($payload['temperature'])) {
            $requestBody['generationConfig']['temperature'] = floatval($payload['temperature']);
        }
        if (isset($payload['maxTokens'])) {
            $requestBody['generationConfig']['maxOutputTokens'] = intval($payload['maxTokens']);
        }
    }
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($requestBody));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json'
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 200) {
        error_log('Gemini API error: ' . $response);
        throw new Exception('Gemini API returned HTTP ' . $httpCode);
    }
    
    $result = json_decode($response, true);
    
    if (!isset($result['candidates'][0]['content']['parts'][0]['text'])) {
        throw new Exception('Invalid Gemini API response format');
    }
    
    $generatedText = $result['candidates'][0]['content']['parts'][0]['text'];
    
    // Cache the result
    setCacheValue($cacheKey, $generatedText, 1800); // 30 minutes
    
    return [
        'success' => true,
        'data' => $generatedText,
        'model' => $model,
        'cached' => false,
        'api_service' => 'gemini'
    ];
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
                ['name' => 'gemini-2.5-flash', 'displayName' => 'Gemini 2.5 Flash'],
                ['name' => 'gemini-2.5-pro', 'displayName' => 'Gemini 2.5 Pro']
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
