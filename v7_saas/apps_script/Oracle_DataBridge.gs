/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * SERPIFAI ORACLE v16.0 - MODULE 4.1: INTELLIGENT DATABRIDGE
 * Gemini Oracle Integration, MySQL Synchronization, Kill Move Automation
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * This module implements the DataBridge system:
 *   - Gemini 1.5 Flash Integration for Executive Insights
 *   - Relational Synchronization to MySQL 5-Table Schema
 *   - Kill Move Detection & Alert Automation
 *   - PII Compliance via Governance Integration
 * 
 * @author SerpifAI Engineering
 * @version 16.0
 * @license Proprietary - serpifai.com
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 4.1A: DATABRIDGE CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════

var DATABRIDGE_CONFIG = DATABRIDGE_CONFIG || {
  // Gemini API Configuration
  GEMINI: {
    API_KEY_PROPERTY: 'GEMINI_API_KEY',
    MODEL: 'gemini-3-flash-preview',
    ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent',
    MAX_TOKENS: 4096,
    TEMPERATURE: 0.7,
    TIMEOUT_MS: 60000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY_MS: 2000
  },
  
  // Kill Move Thresholds
  KILL_MOVE: {
    SNIPE: {
      MAX_KD: 35,
      MIN_CPC: 15,
      MAX_EEAT: 50
    },
    AEO_HIJACK: {
      MAX_AEO: 40,
      MIN_PAGE_RANK: 3
    },
    INSTANT_TAKEOVER: {
      MAX_KD: 35,
      MAX_FRESHNESS: 40
    },
    VULNERABLE: {
      MAX_TRUST: 40,
      MAX_CONTENT_DEPTH: 500
    }
  },
  
  // Sync Configuration
  SYNC: {
    BATCH_SIZE: 10,
    MAX_KEYWORDS_PER_PAGE: 75,
    ENABLE_GEMINI_INSIGHTS: true,
    ENABLE_KILL_ALERTS: true
  },
  
  // Alert Configuration
  ALERTS: {
    EMAIL_PROPERTY: 'ALERT_EMAIL',
    SLACK_WEBHOOK_PROPERTY: 'SLACK_WEBHOOK_URL',
    ENABLE_EMAIL: true,
    ENABLE_SLACK: false
  }
};

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 4.1B: GEMINI ORACLE ENGINE
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * GeminiOracleEngine - AI-Powered Strategic Insight Generation
 */
class GeminiOracleEngine {
  
  constructor() {
    this.props = PropertiesService.getScriptProperties();
    this.apiKey = this.props.getProperty(DATABRIDGE_CONFIG.GEMINI.API_KEY_PROPERTY);
    
    // PHP Gateway Configuration
    // FIXED: Use domain instead of IP - domain has proper Apache routing
    // Files are at: /home/u187453795/public_html/serpifai_php/api_gateway.php
    this.phpGatewayUrl = 'https://serpifai.com/serpifai_php/api_gateway.php';
    this.gatewayTimeout = 30000;  // 30 seconds for server-side AI processing
  }
  
  /**
   * Call Gemini for strategic insight generation
   * Priority: PHP Gateway (API key in server .env) > Direct API > Fallback
   * @param {Object} payload - Analysis payload (keywords, E-E-A-T, metrics)
   * @returns {Object} Gemini insight response with killMove, moat, etc.
   */
  callGeminiInsightEngine(payload) {
    console.log('🧠 Gemini Oracle: Generating strategic insights...');
    
    // Priority 1: PHP Gateway (API key lives in server's .env)
    console.log('🔗 Connecting to PHP Gateway: ' + this.phpGatewayUrl);
    const gatewayResult = this._callPHPGateway(payload);
    
    if (gatewayResult.success) {
      return this._mapGatewayResponse(gatewayResult, payload);
    }
    
    // Priority 2: Check for script property gateway URL as backup (only if different from primary)
    const serverGatewayUrl = this.props.getProperty('SERPIFAI_GATEWAY_URL');
    
    if (serverGatewayUrl && serverGatewayUrl.trim() !== '' && serverGatewayUrl !== this.phpGatewayUrl) {
      console.log('🔗 Using backup SerpifAI Server Gateway: ' + serverGatewayUrl);
      const backupResult = this._callServerGateway(serverGatewayUrl, payload);
      
      if (backupResult.success) {
        return this._mapGatewayResponse(backupResult, payload);
      }
    } else {
      console.log('📦 No alternate gateway configured, proceeding to direct API or fallback...');
    }
    
    // Priority 3: Direct Gemini API (if key is in ScriptProperties)
    if (this.apiKey && this.apiKey.trim() !== '') {
      console.log('🔗 Using direct Gemini API');
      
      const scrubbedPayload = this._scrubPayloadPII(payload);
      const prompt = this._buildStrategicPrompt(scrubbedPayload);
      const response = this._callGeminiAPI(prompt);
      
      if (response.success) {
        return this._parseGeminiResponse(response.content, scrubbedPayload);
      }
      
      console.warn('⚠️ Direct Gemini API failed, using Basic Insight Fallback...');
      return this._generateBasicInsightFallback(payload, response.error);
    }
    
    // Priority 4: No API configured - use Basic Insight Fallback
    console.warn('⚠️ Gateway failed, using Basic Insight Fallback...');
    return this._generateBasicInsightFallback(payload, gatewayResult.error || 'Gateway unavailable');
  }
  
  /**
   * Call PHP Gateway for Gemini analysis (Task 1)
   * Endpoint: https://srv1388.hstgr.io/serpifai_php/api_gateway.php
   * Security: X-SerpifAI-Handshake header with shared secret
   * @param {Object} payload - Forensic data to analyze
   * @returns {Object} Gateway response with insights
   */
  _callPHPGateway(payload) {
    try {
      // Scrub PII before sending
      const scrubbedPayload = this._scrubPayloadPII(payload);
      
      // Shared secret for gateway authorization
      const sharedSecret = 'OoRB1Pz9i?H';
      
      // Build request payload for PHP gateway
      // CRITICAL: Include 'action' and 'secret' in POST body (not just headers)
      const requestBody = {
        action: 'gemini_analyze',
        secret: sharedSecret,  // Authentication in body for PHP $_POST access
        forensicData: {
          url: scrubbedPayload.url || '',
          domain: scrubbedPayload.domain || '',
          semantic: scrubbedPayload.semantic || {},
          trust: scrubbedPayload.trust || {},
          ai: scrubbedPayload.ai || {},
          metrics: scrubbedPayload.metrics || {},
          keywords: (scrubbedPayload.keywords || scrubbedPayload.semantic?.keywords || []).slice(0, 90)  // 90 KW per competitor batch
        },
        requestedInsights: ['killMove', 'moat', 'dominationPlan', 'revenueScore', 'riskAssessment']
      };
      
      console.log('📤 Gateway Request: action=' + requestBody.action + ', keywords=' + (requestBody.forensicData.keywords?.length || 0));
      
      const response = UrlFetchApp.fetch(this.phpGatewayUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-SerpifAI-Handshake': sharedSecret,
          'X-Request-Source': 'Oracle-DataBridge-v16',
          'X-Timestamp': new Date().toISOString()
        },
        payload: JSON.stringify(requestBody),
        muteHttpExceptions: true,  // CRITICAL: Get real error message instead of exception
        followRedirects: true
      });
      
      const responseCode = response.getResponseCode();
      const responseBody = response.getContentText();
      
      if (responseCode === 200) {
        const parsed = JSON.parse(responseBody);
        console.log('✅ PHP Gateway: Received insights from server');
        return {
          success: true,
          raw: parsed,
          source: 'php-gateway'
        };
      }
      
      console.error(`❌ PHP Gateway error ${responseCode}: ${responseBody.substring(0, 200)}`);
      return { 
        success: false, 
        error: `PHP Gateway error ${responseCode}`,
        details: responseBody
      };
      
    } catch (e) {
      console.error(`❌ PHP Gateway exception: ${e.message}`);
      return { success: false, error: e.message };
    }
  }
  
  /**
   * Map gateway response to standard insight format
   * Ensures data maps correctly to gemini_kill_move and gemini_moat columns
   * @param {Object} gatewayResult - Raw gateway response
   * @param {Object} payload - Original payload
   * @returns {Object} Mapped insight for database
   */
  _mapGatewayResponse(gatewayResult, payload) {
    const raw = gatewayResult.raw || {};
    const insight = raw.insight || raw;
    
    return {
      success: true,
      insight: {
        fullResponse: JSON.stringify(insight),
        // Map to database columns: gemini_kill_move
        killMove: insight.killMove || insight.kill_move || insight.strategicKillMove || null,
        // Map to database columns: gemini_moat
        psychologicalMoat: insight.moat || insight.psychologicalMoat || insight.psychological_moat || null,
        dominationPlan: insight.dominationPlan || insight.domination_plan || insight['90DayPlan'] || null,
        revenueScore: parseInt(insight.revenueScore || insight.revenue_score || 0) || null,
        riskAssessment: insight.riskAssessment || insight.risk_assessment || null,
        timestamp: new Date().toISOString(),
        model: 'gemini-3-flash-preview',
        source: 'server-gateway'
      },
      // Flattened for easy access
      killMove: insight.killMove || insight.kill_move || null,
      moat: insight.moat || insight.psychologicalMoat || null,
      dominationPlan: insight.dominationPlan || null,
      revenueScore: parseInt(insight.revenueScore || 0) || null,
      riskAssessment: insight.riskAssessment || null,
      url: payload.url,
      domain: payload.domain,
      source: 'server-gateway'
    };
  }
  
  /**
   * Call backup Server Gateway (Priority 2)
   * Uses SERPIFAI_GATEWAY_URL from Script Properties
   * @param {string} gatewayUrl - Backup gateway URL
   * @param {Object} payload - Forensic data to analyze
   * @returns {Object} Gateway response with insights
   */
  _callServerGateway(gatewayUrl, payload) {
    try {
      console.log('🔗 Backup Gateway: ' + gatewayUrl);
      
      const scrubbedPayload = this._scrubPayloadPII(payload);
      const sharedSecret = 'OoRB1Pz9i?H';
      
      const requestBody = {
        action: 'gemini_analyze',
        secret: sharedSecret,
        forensicData: {
          url: scrubbedPayload.url || '',
          domain: scrubbedPayload.domain || '',
          semantic: scrubbedPayload.semantic || {},
          trust: scrubbedPayload.trust || {},
          ai: scrubbedPayload.ai || {},
          metrics: scrubbedPayload.metrics || {},
          keywords: (scrubbedPayload.keywords || []).slice(0, 90)
        },
        requestedInsights: ['killMove', 'moat', 'dominationPlan', 'revenueScore', 'riskAssessment']
      };
      
      const response = UrlFetchApp.fetch(gatewayUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-SerpifAI-Handshake': sharedSecret,
          'X-Request-Source': 'Oracle-DataBridge-v16'
        },
        payload: JSON.stringify(requestBody),
        muteHttpExceptions: true,
        followRedirects: true
      });
      
      const responseCode = response.getResponseCode();
      const responseBody = response.getContentText();
      
      if (responseCode === 200) {
        try {
          const parsed = JSON.parse(responseBody);
          console.log('✅ Backup Gateway: Success');
          return { success: true, raw: parsed, source: 'backup-gateway' };
        } catch (parseErr) {
          console.error('❌ Backup Gateway: Invalid JSON response');
          return { success: false, error: 'Invalid JSON response' };
        }
      }
      
      console.error(`❌ Backup Gateway error ${responseCode}`);
      return { success: false, error: `HTTP ${responseCode}` };
      
    } catch (e) {
      console.error(`❌ Backup Gateway exception: ${e.message}`);
      return { success: false, error: e.message };
    }
  }
  
  /**
   * Generate Basic Insight Fallback when API is unavailable
   * Ensures database save doesn't crash even without Gemini
   * @param {Object} payload - Analysis payload
   * @param {string} errorReason - Why the API failed
   * @returns {Object} Basic insight object
   */
  _generateBasicInsightFallback(payload, errorReason) {
    console.log('📦 Generating Basic Insight Fallback...');
    
    const metrics = payload.metrics || {};
    const syntheticKD = metrics.syntheticKD || 50;
    const eeatScore = metrics.eeatScore || 50;
    const aeoScore = metrics.aeoScore || 50;
    
    // Generate basic kill move recommendation based on metrics
    let killMove = 'MONITOR';
    let moat = 'Unknown - API unavailable';
    let action = 'Configure Gemini API for detailed strategic analysis';
    
    if (syntheticKD < 35 && eeatScore < 50) {
      killMove = 'SNIPE_CANDIDATE';
      moat = 'Weak E-E-A-T signals detected';
      action = 'Create authoritative content with strong trust signals';
    } else if (aeoScore < 40) {
      killMove = 'AEO_OPPORTUNITY';
      moat = 'Low AI/AEO optimization detected';
      action = 'Implement FAQ schema and direct-answer content structures';
    } else if (syntheticKD < 30) {
      killMove = 'LOW_COMPETITION';
      moat = 'Low keyword difficulty - opportunity exists';
      action = 'Create comprehensive content targeting this keyword cluster';
    }
    
    return {
      success: true,
      insight: {
        fullResponse: `[FALLBACK] ${errorReason}. Basic analysis performed.`,
        killMove: killMove,
        psychologicalMoat: moat,
        dominationPlan: action,
        revenueScore: null,
        riskAssessment: 'Unable to assess - configure Gemini API for full analysis',
        timestamp: new Date().toISOString(),
        model: 'fallback-basic',
        source: 'local-fallback'
      },
      // Flattened for easy access (maps to gemini_kill_move, gemini_moat columns)
      killMove: killMove,
      moat: moat,
      dominationPlan: action,
      revenueScore: null,
      riskAssessment: null,
      url: payload.url,
      domain: payload.domain,
      source: 'local-fallback',
      fallbackReason: errorReason
    };
  }
  
  /**
   * Scrub PII from payload using Governance module
   * @param {Object} payload - Raw payload
   * @returns {Object} Scrubbed payload
   */
  _scrubPayloadPII(payload) {
    // Guard: Return empty object if payload is null/undefined
    if (!payload || typeof payload !== 'object') {
      console.warn('⚠️ PII scrub: payload is null or not an object, returning empty object');
      return {};
    }
    
    try {
      // Safely stringify payload
      const jsonString = JSON.stringify(payload);
      
      // Try to use Governance module's PIIScrubber
      if (typeof PIIScrubber !== 'undefined') {
        const scrubber = new PIIScrubber();
        const scrubbed = scrubber.scrub(jsonString);
        return JSON.parse(scrubbed.scrubbed || jsonString);
      }
      
      // Try PIIIntegration from AI module
      if (typeof PIIIntegration !== 'undefined') {
        const scrubbed = PIIIntegration.scrub(jsonString);
        return JSON.parse(scrubbed.scrubbed || jsonString);
      }
    } catch (e) {
      console.warn('⚠️ PII scrubbing failed, using raw payload:', e.message);
    }
    
    return payload;
  }
  
  /**
   * Build the strategic insight prompt
   * @param {Object} payload - Scrubbed payload
   * @returns {string} Prompt for Gemini
   */
  _buildStrategicPrompt(payload) {
    const {
      url = 'Unknown',
      domain = 'Unknown',
      metrics = {},
      keywords = [],
      eeat = {},
      trust = {}
    } = payload;
    
    // Extract top 20 keywords for prompt
    const topKeywords = (keywords || []).slice(0, 20).map(k => 
      `${k.keyword} (Intent: ${k.intent || 'info'}, Vol: ${k.estimatedVolume || k.volume || 0})`
    ).join('\n');
    
    return `You are a Billionaire SEO Consultant with 25 years of experience dominating search markets. You have generated over $500M in client revenue through strategic SEO.

ANALYSIS TARGET:
- URL: ${url}
- Domain: ${domain}

COMPETITIVE INTELLIGENCE METRICS:
- Synthetic Keyword Difficulty: ${metrics.syntheticKD || 'N/A'}
- E-E-A-T Score: ${metrics.eeatScore || 'N/A'}/100
- AEO/RAG Readiness: ${metrics.aeoScore || 'N/A'}/100
- Trust Score: ${metrics.trustScore || 'N/A'}/100
- Word Count: ${metrics.wordCount || 'N/A'}
- Schema Richness: ${metrics.schemaRichness || 'N/A'}/100

E-E-A-T BREAKDOWN:
- Experience: ${eeat.experience?.score || 'N/A'}/100
- Expertise: ${eeat.expertise?.score || 'N/A'}/100
- Authority: ${eeat.authoritativeness?.score || 'N/A'}/100
- Trust: ${eeat.trustworthiness?.score || 'N/A'}/100

TOP KEYWORD OPPORTUNITIES:
${topKeywords || 'No keywords extracted'}

YOUR STRATEGIC ANALYSIS TASK:

1. **STRATEGIC KILL MOVE**: Identify the single most effective attack vector to outrank this page. Consider:
   - Content gaps exploitable with superior E-E-A-T
   - Technical SEO weaknesses (schema, structure, AEO)
   - Authority vulnerabilities (low trust signals, weak backlink profile indicators)
   - Keyword cannibalization opportunities

2. **PSYCHOLOGICAL MOAT**: Define the emotional and trust barrier this competitor has built. What makes users trust them? How do we break it?

3. **90-DAY DOMINATION PLAN**: Provide 3 specific, actionable steps to claim this keyword territory within 90 days.

4. **REVENUE OPPORTUNITY SCORE**: Rate 1-100 the revenue potential if we successfully capture this position.

5. **RISK ASSESSMENT**: What could go wrong? What's their likely counter-strategy?

Format your response as a structured executive brief. Be brutally honest and strategically ruthless.`;
  }
  
  /**
   * Call Gemini API with gateway support and fallback
   * Supports both direct API key and gateway Authorization header
   * @param {string} prompt - The prompt to send
   * @returns {Object} API response
   */
  _callGeminiAPI(prompt) {
    // Try gateway URL first, then fallback to direct Gemini API
    const gatewayUrl = this.props.getProperty('GATEWAY_GEMINI_URL');
    const gatewayApiKey = this.props.getProperty('GATEWAY_API_KEY');
    
    // Determine endpoint and headers
    let url, headers;
    
    if (gatewayUrl && gatewayApiKey) {
      // Use gateway with Authorization header
      console.log('🔗 Using Gateway for Gemini API');
      url = gatewayUrl;
      headers = {
        'Authorization': `Bearer ${gatewayApiKey}`,
        'Content-Type': 'application/json'
      };
    } else if (this.apiKey) {
      // Use direct Gemini API with key in URL
      console.log('🔗 Using direct Gemini API');
      url = `${DATABRIDGE_CONFIG.GEMINI.ENDPOINT}?key=${this.apiKey}`;
      headers = {
        'Content-Type': 'application/json'
      };
    } else {
      console.error('❌ No API key configured: Set GEMINI_API_KEY or GATEWAY_GEMINI_URL + GATEWAY_API_KEY');
      return { success: false, error: 'API key not configured' };
    }
    
    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: DATABRIDGE_CONFIG.GEMINI.TEMPERATURE,
        maxOutputTokens: DATABRIDGE_CONFIG.GEMINI.MAX_TOKENS
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' }
      ]
    };
    
    let attempts = 0;
    while (attempts < DATABRIDGE_CONFIG.GEMINI.RETRY_ATTEMPTS) {
      attempts++;
      
      try {
        const fetchOptions = {
          method: 'POST',
          headers: headers,
          payload: JSON.stringify(requestBody),
          muteHttpExceptions: true,
          timeout: DATABRIDGE_CONFIG.GEMINI.TIMEOUT_MS
        };
        
        // Add contentType for direct API (gateway uses headers)
        if (!gatewayUrl) {
          fetchOptions.contentType = 'application/json';
        }
        
        const response = UrlFetchApp.fetch(url, fetchOptions);
        
        const responseCode = response.getResponseCode();
        const responseBody = response.getContentText();
        
        if (responseCode === 200) {
          const parsed = JSON.parse(responseBody);
          const content = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
          
          console.log(`✅ Gemini Oracle: Response received (${content.length} chars)`);
          
          return {
            success: true,
            content: content,
            tokensUsed: parsed.usageMetadata?.totalTokenCount || 0
          };
        }
        
        // Handle rate limiting
        if (responseCode === 429) {
          console.warn(`⚠️ Gemini rate limited, attempt ${attempts}/${DATABRIDGE_CONFIG.GEMINI.RETRY_ATTEMPTS}`);
          Utilities.sleep(DATABRIDGE_CONFIG.GEMINI.RETRY_DELAY_MS * attempts);
          continue;
        }
        
        console.error(`❌ Gemini API error ${responseCode}: ${responseBody}`);
        return { success: false, error: `API error ${responseCode}`, details: responseBody };
        
      } catch (e) {
        console.error(`❌ Gemini request failed: ${e.message}`);
        if (attempts < DATABRIDGE_CONFIG.GEMINI.RETRY_ATTEMPTS) {
          Utilities.sleep(DATABRIDGE_CONFIG.GEMINI.RETRY_DELAY_MS * attempts);
        }
      }
    }
    
    return { success: false, error: 'Max retry attempts exceeded' };
  }
  
  /**
   * Parse and structure Gemini response
   * @param {string} content - Raw Gemini response
   * @param {Object} payload - Original payload
   * @returns {Object} Structured insight
   */
  _parseGeminiResponse(content, payload) {
    // Extract key sections using regex
    const extractSection = (text, sectionName) => {
      const regex = new RegExp(`\\*\\*${sectionName}[:\\*]+([\\s\\S]*?)(?=\\*\\*[A-Z]|$)`, 'i');
      const match = text.match(regex);
      return match ? match[1].trim() : null;
    };
    
    // Extract revenue score
    const revenueMatch = content.match(/Revenue[^:]*:\s*(\d+)/i);
    const revenueScore = revenueMatch ? parseInt(revenueMatch[1]) : null;
    
    return {
      success: true,
      insight: {
        fullResponse: content,
        killMove: extractSection(content, 'STRATEGIC KILL MOVE') || extractSection(content, 'KILL MOVE'),
        psychologicalMoat: extractSection(content, 'PSYCHOLOGICAL MOAT'),
        dominationPlan: extractSection(content, '90-DAY DOMINATION PLAN') || extractSection(content, 'DOMINATION PLAN'),
        revenueScore: revenueScore,
        riskAssessment: extractSection(content, 'RISK ASSESSMENT'),
        timestamp: new Date().toISOString(),
        model: DATABRIDGE_CONFIG.GEMINI.MODEL
      },
      url: payload.url,
      domain: payload.domain
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 4.1C: KILL MOVE DETECTOR
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * KillMoveDetector - Automated vulnerability detection
 */
class KillMoveDetector {
  
  /**
   * Analyze page for Kill Move opportunities
   * @param {Object} analysisData - Complete analysis data
   * @returns {Object} Kill Move detection result
   */
  static detect(analysisData) {
    const {
      metrics = {},
      trust = {},
      ai = {},
      semantic = {}
    } = analysisData;
    
    const killMoves = [];
    const alerts = [];
    
    // Check SNIPE opportunity (Low KD + High CPC + Low E-E-A-T)
    const syntheticKD = metrics.syntheticKD || trust?.syntheticKD?.syntheticKD || 100;
    const eeatScore = metrics.eeatScore || trust?.eeat?.overall?.score || 100;
    
    if (syntheticKD < DATABRIDGE_CONFIG.KILL_MOVE.SNIPE.MAX_KD && 
        eeatScore < DATABRIDGE_CONFIG.KILL_MOVE.SNIPE.MAX_EEAT) {
      killMoves.push({
        type: 'SNIPE',
        priority: 'HIGH',
        reason: `Low KD (${syntheticKD}) + Weak E-E-A-T (${eeatScore})`,
        action: 'Create superior E-E-A-T content with author credentials and trust signals'
      });
      alerts.push('🎯 SNIPE OPPORTUNITY: High-value keyword with weak competitor');
    }
    
    // Check AEO HIJACK opportunity (Low AEO + High PageRank)
    const aeoScore = metrics.aeoScore || ai?.aeoScore?.score || 100;
    const pageRank = metrics.pageRankEstimate || 0;
    
    if (aeoScore < DATABRIDGE_CONFIG.KILL_MOVE.AEO_HIJACK.MAX_AEO) {
      killMoves.push({
        type: 'AEO_HIJACK',
        priority: 'HIGH',
        reason: `Low AEO score (${aeoScore}) - Not AI-ready`,
        action: 'Implement FAQ schema, SPO-rich content, and direct answer structures'
      });
      alerts.push('🤖 AEO HIJACK: Competitor not optimized for AI search');
    }
    
    // Check INSTANT TAKEOVER (Low KD + Stale Content)
    const contentFreshness = KillMoveDetector._estimateContentFreshness(analysisData);
    
    if (syntheticKD < DATABRIDGE_CONFIG.KILL_MOVE.INSTANT_TAKEOVER.MAX_KD && 
        contentFreshness < DATABRIDGE_CONFIG.KILL_MOVE.INSTANT_TAKEOVER.MAX_FRESHNESS) {
      killMoves.push({
        type: 'INSTANT_TAKEOVER',
        priority: 'CRITICAL',
        reason: `Low KD (${syntheticKD}) + Stale content (Freshness: ${contentFreshness})`,
        action: 'Publish comprehensive, fresh content with current data and dates',
        vulnerable: true
      });
      alerts.push('⚡ INSTANT TAKEOVER: Vulnerable target - immediate action recommended');
    }
    
    // Check VULNERABLE status (Low Trust + Thin Content)
    const trustScore = metrics.trustScore || trust?.overallTrust?.score || 100;
    const wordCount = metrics.wordCount || semantic?.wordCount || 0;
    
    if (trustScore < DATABRIDGE_CONFIG.KILL_MOVE.VULNERABLE.MAX_TRUST && 
        wordCount < DATABRIDGE_CONFIG.KILL_MOVE.VULNERABLE.MAX_CONTENT_DEPTH) {
      killMoves.push({
        type: 'VULNERABLE',
        priority: 'MEDIUM',
        reason: `Low trust (${trustScore}) + Thin content (${wordCount} words)`,
        action: 'Create in-depth, authoritative content with strong E-E-A-T signals'
      });
    }
    
    // Calculate overall vulnerability score
    const vulnerabilityScore = KillMoveDetector._calculateVulnerability(
      syntheticKD, eeatScore, aeoScore, trustScore, contentFreshness
    );
    
    return {
      killMoves: killMoves,
      alerts: alerts,
      vulnerabilityScore: vulnerabilityScore,
      isVulnerable: vulnerabilityScore >= 60,
      primaryOpportunity: killMoves[0] || null,
      recommendedAction: killMoves[0]?.action || 'Monitor for future opportunities'
    };
  }
  
  /**
   * Estimate content freshness
   * @param {Object} data - Analysis data
   * @returns {number} Freshness score (0-100)
   */
  static _estimateContentFreshness(data) {
    let freshness = 50; // Base score
    
    // Check for date indicators in content
    const currentYear = new Date().getFullYear();
    const content = data.rawContent || data.html || '';
    
    if (content.includes(currentYear.toString())) {
      freshness += 30;
    } else if (content.includes((currentYear - 1).toString())) {
      freshness += 15;
    } else if (content.includes((currentYear - 2).toString())) {
      freshness -= 10;
    } else {
      freshness -= 20;
    }
    
    // Check for "updated" signals
    if (/updated|modified|revised/i.test(content)) {
      freshness += 10;
    }
    
    // Check schema for dateModified
    if (data.ai?.schema?.jsonLD?.schemas) {
      for (const schema of data.ai.schema.jsonLD.schemas) {
        if (schema.raw && schema.raw.includes('dateModified')) {
          freshness += 10;
          break;
        }
      }
    }
    
    return Math.max(0, Math.min(100, freshness));
  }
  
  /**
   * Calculate overall vulnerability score
   * @param {number} kd - Keyword difficulty
   * @param {number} eeat - E-E-A-T score
   * @param {number} aeo - AEO score
   * @param {number} trust - Trust score
   * @param {number} freshness - Content freshness
   * @returns {number} Vulnerability score (0-100)
   */
  static _calculateVulnerability(kd, eeat, aeo, trust, freshness) {
    // Invert scores (lower competitor scores = higher vulnerability for them = opportunity for us)
    const kdVuln = 100 - kd;
    const eeatVuln = 100 - eeat;
    const aeoVuln = 100 - aeo;
    const trustVuln = 100 - trust;
    const freshnessVuln = 100 - freshness;
    
    // Weighted combination
    const score = (
      kdVuln * 0.25 +
      eeatVuln * 0.25 +
      aeoVuln * 0.20 +
      trustVuln * 0.15 +
      freshnessVuln * 0.15
    );
    
    return Math.round(score);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 4.1D: WAREHOUSE BRIDGE
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * WarehouseBridge - Synchronizes analysis to MySQL warehouse
 */
class WarehouseBridge {
  
  constructor() {
    this.warehouse = null;
  }
  
  /**
   * Initialize warehouse connection
   * @returns {boolean} Connection success
   */
  _initWarehouse() {
    if (this.warehouse) return true;
    
    try {
      if (typeof MarketDominationWarehouse !== 'undefined') {
        this.warehouse = new MarketDominationWarehouse();
        return this.warehouse.connect();
      } else if (typeof getWarehouse === 'function') {
        this.warehouse = getWarehouse();
        return this.warehouse.connect();
      }
    } catch (e) {
      console.error(`❌ Warehouse initialization failed: ${e.message}`);
    }
    
    return false;
  }
  
  /**
   * Bridge analysis results to warehouse
   * @param {Object} results - Complete analysis results
   * @returns {Object} Sync result
   */
  bridgeToWarehouse(results) {
    console.log(`🌉 DataBridge: Syncing to warehouse...`);
    
    if (!this._initWarehouse()) {
      return { success: false, error: 'Warehouse connection failed' };
    }
    
    try {
      const {
        url = '',
        domain = '',
        metrics = {},
        semantic = {},
        trust = {},
        ai = {},
        geminiInsight = null,
        killMove = null
      } = results;
      
      // Extract domain from URL if not provided
      let domainName = domain;
      if (!domainName && url) {
        try {
          domainName = new URL(url).hostname.replace('www.', '');
        } catch (e) {
          domainName = 'unknown';
        }
      }
      
      // Build warehouse payload with DECIMAL extraction (Task 3: avoid [object Object])
      // Extract numeric values explicitly to ensure proper DECIMAL storage
      const syntheticKDValue = this._extractDecimalValue([
        metrics.syntheticKD,
        trust?.syntheticKD?.syntheticKD,
        trust?.syntheticKD?.difficulty,
        trust?.syntheticKD
      ]);
      
      const aeoScoreValue = this._extractDecimalValue([
        metrics.aeoScore,
        ai?.aeoScore?.score,
        ai?.overall?.score,
        ai?.aeoScore
      ]);
      
      const eeatScoreValue = this._extractDecimalValue([
        metrics.eeatScore,
        trust?.eeat?.overall?.score,
        trust?.eeat?.overall,
        trust?.eeat
      ]);
      
      const warehousePayload = {
        // Domain data
        domain: domainName,
        synthetic_da: syntheticKDValue,
        trust_velocity: this._extractDecimalValue([trust?.overallTrust?.score, trust?.overallTrust]),
        total_rd: 0, // Would need backlink data
        global_rank: 0,
        
        // Page data
        url: url,
        page_rank_estimate: 0,
        word_count: metrics.wordCount || semantic?.wordCount || 0,
        lcp_ms: 0,
        schema_detected: this._extractSchemaTypes(ai),
        aeo_score: aeoScoreValue,
        eeat_score: eeatScoreValue,
        content_hash: this._hashContent(results.rawContent || url),
        
        // Gemini insight (for executive_insights column)
        gemini_insight: geminiInsight ? JSON.stringify(geminiInsight.insight) : null,
        
        // Keywords
        keywords: this._prepareKeywords(semantic?.keywords || []),
        
        // Link forensics
        links: {
          ref_domains: 0,
          backlinks: 0,
          link_efficiency_ratio: trust?.linkForensics?.linkEfficiencyRatio || 0,
          anchor_diversity: trust?.anchorDiversity?.diversityScore || 0,
          internal_links: trust?.linkForensics?.counts?.internal || 0,
          external_links: trust?.linkForensics?.counts?.external || 0,
          dofollow_ratio: (trust?.linkForensics?.ratios?.dofollowRatio || 0) / 100
        },
        
        // Governance
        robots_status: 'allowed',
        pii_scrubbed: results.compliance?.piiScrubbed || false,
        pii_items_removed: results.compliance?.piiItemsRemoved || 0,
        fetch_status_code: 200,
        session_id: Utilities.getUuid()
      };
      
      // Save to warehouse
      const saveResult = this.warehouse.savePageAnalysis(warehousePayload);
      
      if (saveResult.success) {
        console.log(`✅ DataBridge: Synced to warehouse (Page ID: ${saveResult.pageId})`);
        
        // Update Gemini insight column separately if needed
        if (geminiInsight && saveResult.pageId) {
          this._updateGeminiInsight(saveResult.pageId, geminiInsight);
        }
      }
      
      return {
        success: saveResult.success,
        domainId: saveResult.domainId,
        pageId: saveResult.pageId,
        keywordsInserted: saveResult.keywordsInserted,
        error: saveResult.error
      };
      
    } catch (e) {
      console.error(`❌ DataBridge: Sync failed: ${e.message}`);
      return { success: false, error: e.message };
    }
  }
  
  /**
   * Extract schema types as comma-separated string
   * @param {Object} ai - AI analysis result
   * @returns {string} Schema types
   */
  _extractSchemaTypes(ai) {
    const types = [];
    
    if (ai?.schema?.jsonLD?.schemas) {
      for (const schema of ai.schema.jsonLD.schemas) {
        types.push(...(schema.types || []));
      }
    }
    
    if (ai?.schema?.microdata?.types) {
      types.push(...ai.schema.microdata.types);
    }
    
    return [...new Set(types)].join(',').substring(0, 500);
  }
  
  /**
   * Extract DECIMAL value from various possible object structures (Task 3)
   * Prevents [object Object] errors when storing to MySQL DECIMAL columns
   * @param {Array} candidates - Array of potential value sources
   * @returns {number} Numeric value suitable for DECIMAL storage
   */
  _extractDecimalValue(candidates) {
    for (const candidate of candidates) {
      if (candidate === null || candidate === undefined) continue;
      
      // If it's already a number, return it
      if (typeof candidate === 'number' && !isNaN(candidate)) {
        return Math.round(candidate * 100) / 100;  // Round to 2 decimal places
      }
      
      // If it's a string that looks like a number
      if (typeof candidate === 'string') {
        const parsed = parseFloat(candidate);
        if (!isNaN(parsed)) {
          return Math.round(parsed * 100) / 100;
        }
      }
      
      // If it's an object with a score property
      if (typeof candidate === 'object' && candidate !== null) {
        if (typeof candidate.score === 'number') {
          return Math.round(candidate.score * 100) / 100;
        }
        if (typeof candidate.value === 'number') {
          return Math.round(candidate.value * 100) / 100;
        }
        // Try syntheticKD specifically
        if (typeof candidate.syntheticKD === 'number') {
          return Math.round(candidate.syntheticKD * 100) / 100;
        }
      }
    }
    
    return 0;  // Default to 0 if no valid value found
  }
  
  /**
   * Hash content for deduplication
   * @param {string} content - Content to hash
   * @returns {string} SHA-256 hash
   */
  _hashContent(content) {
    if (!content) return null;
    const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, content.substring(0, 10000));
    return digest.map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
  }
  
  /**
   * Prepare keywords for warehouse
   * @param {Array} keywords - Raw keywords
   * @returns {Array} Prepared keywords
   */
  _prepareKeywords(keywords) {
    return keywords.slice(0, DATABRIDGE_CONFIG.SYNC.MAX_KEYWORDS_PER_PAGE).map(kw => ({
      keyword: kw.keyword || '',
      volume: kw.estimatedVolume || kw.volume || 0,
      kd: 0, // Would need external data
      cpc: 0, // Would need external data
      intent: kw.intent || 'informational',
      serp_features: null,
      position_estimate: 0,
      traffic_potential: kw.estimatedVolume || 0
    }));
  }
  
  /**
   * Update Gemini insight for a page
   * Maps insight data to gemini_kill_move and gemini_moat columns
   * @param {number} pageId - Page ID
   * @param {Object} insight - Gemini insight object
   */
  _updateGeminiInsight(pageId, insight) {
    if (!this.warehouse || !this.warehouse.isConnected) return;
    
    try {
      // Extract kill move and moat for dedicated columns
      const insightData = insight.insight || insight;
      const killMove = insightData.killMove || insight.killMove || null;
      const moat = insightData.psychologicalMoat || insightData.moat || insight.moat || null;
      const fullInsight = JSON.stringify(insightData);
      
      const sql = `
        UPDATE pages 
        SET gemini_insights = ?,
            gemini_kill_move = ?,
            gemini_moat = ?,
            updated_at = NOW()
        WHERE id = ?
      `;
      
      const stmt = this.warehouse.connection.prepareStatement(sql);
      stmt.setString(1, fullInsight);
      stmt.setString(2, killMove ? killMove.substring(0, 500) : null);
      stmt.setString(3, moat ? moat.substring(0, 1000) : null);
      stmt.setInt(4, pageId);
      stmt.executeUpdate();
      stmt.close();
      
      console.log(`✅ DataBridge: Gemini insight saved for page ${pageId} (Kill Move: ${killMove ? 'Yes' : 'No'})`);
    } catch (e) {
      // If gemini_kill_move/gemini_moat columns don't exist, fallback to just gemini_insights
      console.warn(`⚠️ DataBridge: Column update failed, trying fallback: ${e.message}`);
      try {
        const fallbackSql = `
          UPDATE pages 
          SET gemini_insights = ?, updated_at = NOW()
          WHERE id = ?
        `;
        const insightData = insight.insight || insight;
        const stmt = this.warehouse.connection.prepareStatement(fallbackSql);
        stmt.setString(1, JSON.stringify(insightData));
        stmt.setInt(2, pageId);
        stmt.executeUpdate();
        stmt.close();
        console.log(`✅ DataBridge: Gemini insight saved (fallback) for page ${pageId}`);
      } catch (fallbackError) {
        console.error(`❌ DataBridge: Failed to save Gemini insight: ${fallbackError.message}`);
      }
    }
  }
  
  /**
   * Disconnect from warehouse
   */
  disconnect() {
    if (this.warehouse) {
      this.warehouse.disconnect();
      this.warehouse = null;
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 4.1E: ALERT MANAGER
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * AlertManager - Sends Kill Move alerts via email and Slack
 */
class AlertManager {
  
  constructor() {
    this.props = PropertiesService.getScriptProperties();
  }
  
  /**
   * Send Kill Move alert
   * @param {Object} killMoveResult - Kill Move detection result
   * @param {Object} pageData - Page analysis data
   */
  sendKillMoveAlert(killMoveResult, pageData) {
    if (!killMoveResult.isVulnerable && killMoveResult.killMoves.length === 0) {
      return;
    }
    
    console.log(`🚨 AlertManager: Sending Kill Move alert...`);
    
    const alertContent = this._buildAlertContent(killMoveResult, pageData);
    
    // Send email alert
    if (DATABRIDGE_CONFIG.ALERTS.ENABLE_EMAIL) {
      this._sendEmailAlert(alertContent);
    }
    
    // Send Slack alert
    if (DATABRIDGE_CONFIG.ALERTS.ENABLE_SLACK) {
      this._sendSlackAlert(alertContent);
    }
  }
  
  /**
   * Build alert content
   * @param {Object} killMove - Kill Move result
   * @param {Object} pageData - Page data
   * @returns {Object} Alert content
   */
  _buildAlertContent(killMove, pageData) {
    const primaryOpp = killMove.primaryOpportunity;
    
    return {
      subject: `🎯 SerpifAI Kill Move Alert: ${primaryOpp?.type || 'OPPORTUNITY'} Detected`,
      url: pageData.url || 'Unknown',
      domain: pageData.domain || 'Unknown',
      vulnerabilityScore: killMove.vulnerabilityScore,
      killMoveType: primaryOpp?.type || 'N/A',
      priority: primaryOpp?.priority || 'MEDIUM',
      reason: primaryOpp?.reason || 'Multiple vulnerability signals detected',
      recommendedAction: killMove.recommendedAction,
      alerts: killMove.alerts,
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Send email alert
   * @param {Object} content - Alert content
   */
  _sendEmailAlert(content) {
    const email = this.props.getProperty(DATABRIDGE_CONFIG.ALERTS.EMAIL_PROPERTY);
    if (!email) {
      console.warn('⚠️ Alert email not configured');
      return;
    }
    
    try {
      const htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #e74c3c;">🎯 Kill Move Alert</h1>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin: 0 0 10px 0;">${content.killMoveType} - ${content.priority}</h2>
            <p style="color: #666; margin: 0;">Vulnerability Score: <strong>${content.vulnerabilityScore}/100</strong></p>
          </div>
          
          <h3>Target</h3>
          <p><strong>URL:</strong> ${content.url}<br>
          <strong>Domain:</strong> ${content.domain}</p>
          
          <h3>Analysis</h3>
          <p>${content.reason}</p>
          
          <h3>Recommended Action</h3>
          <p style="background: #d4edda; padding: 15px; border-radius: 8px;">
            ${content.recommendedAction}
          </p>
          
          <h3>Alerts</h3>
          <ul>
            ${content.alerts.map(a => `<li>${a}</li>`).join('')}
          </ul>
          
          <hr style="margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">
            SerpifAI Oracle v16.0 | ${content.timestamp}
          </p>
        </div>
      `;
      
      MailApp.sendEmail({
        to: email,
        subject: content.subject,
        htmlBody: htmlBody
      });
      
      console.log(`✅ AlertManager: Email sent to ${email}`);
    } catch (e) {
      console.error(`❌ AlertManager: Email failed: ${e.message}`);
    }
  }
  
  /**
   * Send Slack alert
   * @param {Object} content - Alert content
   */
  _sendSlackAlert(content) {
    const webhookUrl = this.props.getProperty(DATABRIDGE_CONFIG.ALERTS.SLACK_WEBHOOK_PROPERTY);
    if (!webhookUrl) {
      console.warn('⚠️ Slack webhook not configured');
      return;
    }
    
    try {
      const payload = {
        text: content.subject,
        blocks: [
          {
            type: 'header',
            text: { type: 'plain_text', text: `🎯 ${content.killMoveType} - ${content.priority}` }
          },
          {
            type: 'section',
            fields: [
              { type: 'mrkdwn', text: `*URL:*\n${content.url}` },
              { type: 'mrkdwn', text: `*Vulnerability:*\n${content.vulnerabilityScore}/100` }
            ]
          },
          {
            type: 'section',
            text: { type: 'mrkdwn', text: `*Action:* ${content.recommendedAction}` }
          }
        ]
      };
      
      UrlFetchApp.fetch(webhookUrl, {
        method: 'POST',
        contentType: 'application/json',
        payload: JSON.stringify(payload)
      });
      
      console.log('✅ AlertManager: Slack notification sent');
    } catch (e) {
      console.error(`❌ AlertManager: Slack failed: ${e.message}`);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 4.1F: DATABRIDGE ORCHESTRATOR (MAIN CLASS)
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * DataBridgeOrchestrator - Main orchestrator for the complete data pipeline
 */
class DataBridgeOrchestrator {
  
  constructor() {
    this.geminiEngine = new GeminiOracleEngine();
    this.warehouseBridge = new WarehouseBridge();
    this.alertManager = new AlertManager();
  }
  
  /**
   * Process complete analysis and sync to all destinations
   * @param {string} html - Raw HTML content
   * @param {string} url - Page URL
   * @param {Object} options - Processing options
   * @returns {Object} Complete processing result
   */
  process(html, url, options = {}) {
    console.log(`🌉 DataBridge: Starting full pipeline for ${url}...`);
    const startTime = Date.now();
    
    const results = {
      url: url,
      domain: '',
      forensicAnalysis: null,
      geminiInsight: null,
      killMove: null,
      warehouseSync: null,
      alerts: []
    };
    
    try {
      // Extract domain
      try {
        results.domain = new URL(url).hostname.replace('www.', '');
      } catch (e) {
        results.domain = 'unknown';
      }
      
      // Step 1: Run forensic analysis
      console.log('📊 Step 1: Running forensic analysis...');
      if (typeof analyzePageForensics === 'function') {
        results.forensicAnalysis = analyzePageForensics(html, url, options);
      } else {
        // Fallback: run individual analyzers
        results.forensicAnalysis = this._runIndividualAnalyzers(html, url, options);
      }
      
      if (!results.forensicAnalysis?.success) {
        throw new Error('Forensic analysis failed');
      }
      
      // Step 2: Detect Kill Moves
      console.log('🎯 Step 2: Detecting Kill Move opportunities...');
      results.killMove = KillMoveDetector.detect({
        metrics: results.forensicAnalysis.metrics,
        trust: results.forensicAnalysis.trust,
        ai: results.forensicAnalysis.ai,
        semantic: results.forensicAnalysis.semantic,
        rawContent: html
      });
      
      // Step 3: Get Gemini strategic insight (if enabled and vulnerable)
      if (DATABRIDGE_CONFIG.SYNC.ENABLE_GEMINI_INSIGHTS && 
          (results.killMove.isVulnerable || options.forceGemini)) {
        console.log('🧠 Step 3: Getting Gemini strategic insight...');
        
        const geminiPayload = {
          url: url,
          domain: results.domain,
          metrics: results.forensicAnalysis.metrics,
          keywords: results.forensicAnalysis.semantic?.keywords || [],
          eeat: results.forensicAnalysis.trust?.eeat || {},
          trust: results.forensicAnalysis.trust || {}
        };
        
        results.geminiInsight = this.geminiEngine.callGeminiInsightEngine(geminiPayload);
      }
      
      // Step 4: Sync to warehouse
      console.log('💾 Step 4: Syncing to MySQL warehouse...');
      results.warehouseSync = this.warehouseBridge.bridgeToWarehouse({
        ...results.forensicAnalysis,
        url: url,
        domain: results.domain,
        geminiInsight: results.geminiInsight,
        killMove: results.killMove
      });
      
      // Step 5: Send alerts (if enabled)
      if (DATABRIDGE_CONFIG.SYNC.ENABLE_KILL_ALERTS && results.killMove.isVulnerable) {
        console.log('🚨 Step 5: Sending Kill Move alerts...');
        this.alertManager.sendKillMoveAlert(results.killMove, {
          url: url,
          domain: results.domain
        });
        results.alerts = results.killMove.alerts;
      }
      
      // Cleanup
      this.warehouseBridge.disconnect();
      
      const duration = Date.now() - startTime;
      console.log(`✅ DataBridge: Pipeline complete in ${duration}ms`);
      
      return {
        success: true,
        url: url,
        domain: results.domain,
        processingTime: duration,
        metrics: results.forensicAnalysis.metrics,
        killMove: results.killMove,
        geminiInsight: results.geminiInsight?.insight || null,
        warehouseSync: results.warehouseSync,
        alerts: results.alerts
      };
      
    } catch (e) {
      console.error(`❌ DataBridge: Pipeline failed: ${e.message}`);
      this.warehouseBridge.disconnect();
      return {
        success: false,
        error: e.message,
        url: url
      };
    }
  }
  
  /**
   * Run individual analyzers as fallback
   * @param {string} html - HTML content
   * @param {string} url - Page URL
   * @param {Object} options - Options
   * @returns {Object} Combined analysis
   */
  _runIndividualAnalyzers(html, url, options) {
    const results = {
      success: true,
      semantic: null,
      trust: null,
      ai: null,
      metrics: {}
    };
    
    // Semantic analysis
    if (typeof analyzePageSemantics === 'function') {
      results.semantic = analyzePageSemantics(html, url);
    }
    
    // Trust analysis
    if (typeof analyzePageTrust === 'function') {
      results.trust = analyzePageTrust(html, url, options);
    }
    
    // AI analysis
    if (typeof analyzeAIReadiness === 'function') {
      results.ai = analyzeAIReadiness(html, url, {
        headingAnalysis: results.semantic?.headingAnalysis
      });
    }
    
    // Compile metrics
    results.metrics = {
      syntheticKD: results.trust?.syntheticKD?.syntheticKD || 0,
      eeatScore: results.trust?.eeat?.overall?.score || 0,
      aeoScore: results.ai?.aeoScore?.score || 0,
      trustScore: results.trust?.overallTrust?.score || 0,
      wordCount: results.semantic?.wordCount || 0,
      keywordCount: results.semantic?.keywordCount || 0,
      schemaRichness: results.ai?.schema?.richness || 0
    };
    
    return results;
  }
  
  /**
   * Process multiple URLs in batch
   * @param {Array} urls - Array of URLs to process
   * @param {Object} options - Processing options
   * @returns {Array} Array of results
   */
  processBatch(urls, options = {}) {
    console.log(`🌉 DataBridge: Processing batch of ${urls.length} URLs...`);
    
    const results = [];
    
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      console.log(`\n📄 Processing ${i + 1}/${urls.length}: ${url}`);
      
      try {
        // Fetch the page
        const html = this._fetchPage(url);
        if (!html) {
          results.push({ url, success: false, error: 'Fetch failed' });
          continue;
        }
        
        // Process the page
        const result = this.process(html, url, options);
        results.push(result);
        
        // Throttle between requests
        if (i < urls.length - 1) {
          Utilities.sleep(2000);
        }
        
      } catch (e) {
        results.push({ url, success: false, error: e.message });
      }
    }
    
    return results;
  }
  
  /**
   * Fetch a page using Governance-compliant fetcher
   * @param {string} url - URL to fetch
   * @returns {string|null} HTML content or null
   */
  _fetchPage(url) {
    try {
      // Try to use Governance module's compliant fetcher
      if (typeof GovernanceOrchestrator !== 'undefined') {
        const orchestrator = new GovernanceOrchestrator();
        const result = orchestrator.compliantFetch(url);
        return result.success ? result.content : null;
      }
      
      // Fallback: direct fetch with proper headers
      const response = UrlFetchApp.fetch(url, {
        muteHttpExceptions: true,
        headers: {
          'User-Agent': 'SerpifAI-OracleBot/1.0 (+https://serpifai.com/bot-policy)'
        }
      });
      
      if (response.getResponseCode() === 200) {
        return response.getContentText();
      }
    } catch (e) {
      console.error(`❌ Fetch failed for ${url}: ${e.message}`);
    }
    
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 4.1G: GSHEET SYNC UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * GSheetSync - Sync analysis to Google Sheets dashboard
 */
class GSheetSync {
  
  /**
   * Sync analysis to a Google Sheet
   * @param {Object} analysis - Analysis result
   * @param {string} sheetId - Google Sheet ID
   * @param {string} sheetName - Sheet tab name
   * @returns {Object} Sync result
   */
  static sync(analysis, sheetId, sheetName = 'Oracle Data') {
    try {
      const ss = SpreadsheetApp.openById(sheetId);
      let sheet = ss.getSheetByName(sheetName);
      
      if (!sheet) {
        sheet = ss.insertSheet(sheetName);
        // Add headers
        const headers = [
          'Timestamp', 'URL', 'Domain', 'Synthetic KD', 'EEAT Score', 
          'AEO Score', 'Trust Score', 'Word Count', 'Kill Move Type',
          'Vulnerability Score', 'Recommended Action', 'Gemini Insight'
        ];
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      }
      
      // Prepare row data
      const row = [
        new Date().toISOString(),
        analysis.url || '',
        analysis.domain || '',
        analysis.metrics?.syntheticKD || 0,
        analysis.metrics?.eeatScore || 0,
        analysis.metrics?.aeoScore || 0,
        analysis.metrics?.trustScore || 0,
        analysis.metrics?.wordCount || 0,
        analysis.killMove?.primaryOpportunity?.type || 'NONE',
        analysis.killMove?.vulnerabilityScore || 0,
        analysis.killMove?.recommendedAction || '',
        analysis.geminiInsight?.killMove?.substring(0, 500) || ''
      ];
      
      sheet.appendRow(row);
      
      return { success: true, sheetId: sheetId };
      
    } catch (e) {
      console.error(`❌ GSheet sync failed: ${e.message}`);
      return { success: false, error: e.message };
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 4.1H: GLOBAL DATABRIDGE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Get DataBridge orchestrator instance
 * @returns {DataBridgeOrchestrator}
 */
function getDataBridge() {
  return new DataBridgeOrchestrator();
}

/**
 * Process a single page through the complete pipeline
 * @param {string} html - HTML content
 * @param {string} url - Page URL
 * @param {Object} options - Processing options
 * @returns {Object} Processing result
 */
function processPagePipeline(html, url, options) {
  const bridge = getDataBridge();
  return bridge.process(html, url, options);
}

/**
 * Fetch and process a URL
 * @param {string} url - URL to process
 * @param {Object} options - Processing options
 * @returns {Object} Processing result
 */
function fetchAndProcessUrl(url, options = {}) {
  const bridge = getDataBridge();
  const html = bridge._fetchPage(url);
  
  if (!html) {
    return { success: false, error: 'Failed to fetch URL' };
  }
  
  return bridge.process(html, url, options);
}

/**
 * Process multiple URLs in batch
 * @param {Array} urls - Array of URLs
 * @param {Object} options - Processing options
 * @returns {Array} Array of results
 */
function processBatchUrls(urls, options) {
  const bridge = getDataBridge();
  return bridge.processBatch(urls, options);
}

/**
 * Get Gemini strategic insight for analysis
 * @param {Object} payload - Analysis payload
 * @returns {Object} Gemini insight
 */
function getGeminiInsight(payload) {
  const engine = new GeminiOracleEngine();
  return engine.callGeminiInsightEngine(payload);
}

/**
 * Detect Kill Move opportunities
 * @param {Object} analysisData - Analysis data
 * @returns {Object} Kill Move detection result
 */
function detectKillMoves(analysisData) {
  return KillMoveDetector.detect(analysisData);
}

/**
 * Sync analysis to warehouse
 * @param {Object} results - Analysis results
 * @returns {Object} Sync result
 */
function bridgeToWarehouse(results) {
  const bridge = new WarehouseBridge();
  const result = bridge.bridgeToWarehouse(results);
  bridge.disconnect();
  return result;
}

/**
 * Sync analysis to Google Sheet
 * @param {Object} analysis - Analysis result
 * @param {string} sheetId - Sheet ID
 * @returns {Object} Sync result
 */
function syncToGSheet(analysis, sheetId) {
  return GSheetSync.sync(analysis, sheetId);
}

/**
 * Test DataBridge with a sample URL
 */
function testDataBridge() {
  const testUrl = 'https://example.com';
  
  // Mock HTML for testing
  const mockHtml = `
    <html>
    <head><title>Test Page - Best Online Casinos 2024</title></head>
    <body>
      <h1>Best Online Casinos for Real Money</h1>
      <p>Welcome to our comprehensive guide on online casinos.</p>
      <h2>Top Casino Bonuses</h2>
      <p>The best casino bonuses include welcome offers worth up to $500.</p>
    </body>
    </html>
  `;
  
  const bridge = getDataBridge();
  const result = bridge.process(mockHtml, testUrl, {
    targetKeyword: 'best online casinos',
    brandName: 'example',
    forceGemini: false // Set to true to test Gemini
  });
  
  console.log('DataBridge Test Result:', JSON.stringify(result, null, 2));
  return result;
}

/**
 * Test Gemini Oracle integration
 */
function testGeminiOracle() {
  const engine = new GeminiOracleEngine();
  
  const testPayload = {
    url: 'https://example.com/test',
    domain: 'example.com',
    metrics: {
      syntheticKD: 45,
      eeatScore: 62,
      aeoScore: 38,
      trustScore: 55,
      wordCount: 1500
    },
    keywords: [
      { keyword: 'best online casinos', intent: 'commercial', estimatedVolume: 50000 },
      { keyword: 'casino bonus', intent: 'transactional', estimatedVolume: 30000 },
      { keyword: 'how to play slots', intent: 'informational', estimatedVolume: 20000 }
    ],
    eeat: {
      experience: { score: 50 },
      expertise: { score: 65 },
      authoritativeness: { score: 70 },
      trustworthiness: { score: 60 }
    }
  };
  
  const result = engine.callGeminiInsightEngine(testPayload);
  console.log('Gemini Oracle Test Result:', JSON.stringify(result, null, 2));
  return result;
}

/**
 * Test Kill Move detection
 */
function testKillMoveDetection() {
  const testData = {
    metrics: {
      syntheticKD: 28,
      eeatScore: 35,
      aeoScore: 32,
      trustScore: 42,
      wordCount: 800
    }
  };
  
  const result = KillMoveDetector.detect(testData);
  console.log('Kill Move Detection Result:', JSON.stringify(result, null, 2));
  return result;
}
