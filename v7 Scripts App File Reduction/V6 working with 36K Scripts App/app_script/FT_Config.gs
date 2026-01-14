/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FT_Config.gs - ELITE CONFIGURATION SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * SerpifAI v6 Elite - Top 0.1% Configuration Management
 * 
 * ENHANCEMENTS:
 * ✓ Dynamic throttling based on server response
 * ✓ Multi-region User-Agent rotation (compliance)
 * ✓ Adaptive circuit breaker settings
 * ✓ Enterprise-grade forensic detection
 * ✓ GDPR-compliant data retention settings
 * ✓ Rate limit intelligence (learns from responses)
 * ✓ Security headers enforcement
 * 
 * @module FetcherConfig
 * @version 6.0.0-elite
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Project Setup Configuration
 * @return {object} Project configuration
 */
function FT_setupProject() {
  return {
    // Apps Script Properties
    sheetId: PropertiesService.getScriptProperties().getProperty('SHEET_ID') || '',
    
    // Circuit Breaker Settings v2 (Enhanced)
    circuitBreaker: {
      maxFailures: 5,              // Failures before circuit opens
      cooldownMinutes: 30,         // Cooldown period
      adaptiveThrottling: true,    // Learn from server responses
      exponentialBackoff: true,    // Exponential retry delays
      maxRetries: 3,               // Max retry attempts
      retryDelayMs: 1000,          // Initial retry delay
      retryMultiplier: 2           // Backoff multiplier
    },
    
    // User-Agent Rotation (Google TOS Compliant)
    userAgents: [
      // Desktop Browsers (Latest)
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
      
      // Enterprise Bot (Proper Identification per RFC 2616)
      'SerpifAI-Bot/6.0 (+https://serpifai.com/bot.html; enterprise@serpifai.com)',
      
      // Mobile (For mobile-first sites)
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
    ],
    
    // Rate Limiting (Google TOS Compliant)
    rateLimits: {
      defaultDelayMs: 100,          // Min delay between requests
      burstLimit: 10,               // Max requests in burst
      burstWindowMs: 1000,          // Burst window
      respectCrawlDelay: true,      // Honor robots.txt crawl-delay
      respectRetryAfter: true,      // Honor Retry-After header
      maxConcurrent: 5,             // Max parallel requests
      perDomainLimit: true          // Separate limits per domain
    },
    
    // Timeout Settings (Elite Performance)
    timeouts: {
      fetchTimeoutSeconds: 30,      // Max fetch time
      parseTimeoutSeconds: 15,      // Max parse time
      totalTimeoutSeconds: 60,      // Total operation timeout
      connectionTimeoutSeconds: 10   // Connection establishment timeout
    },
    
    // Cache Settings (Performance Optimization)
    cache: {
      enabled: true,
      ttlSeconds: 3600,             // 1 hour default TTL
      maxSize: 100,                 // Max cached items
      keyPrefix: 'ft_cache_',
      useEtag: true,                // Use ETag for validation
      useLastModified: true         // Use Last-Modified headers
    },
    
    // Security Settings (Elite Protection)
    security: {
      validateHttpsCertificates: true,  // CRITICAL: Always validate HTTPS
      allowHttp: false,                 // Force HTTPS only
      maxRedirects: 5,                  // Max redirect chain
      followRedirects: true,
      preventSSRF: true,                // Prevent SSRF attacks
      domainWhitelist: [],              // Optional domain whitelist
      blacklistedDomains: [             // Known malicious domains
        'localhost', '127.0.0.1', '0.0.0.0',
        '169.254.169.254',              // AWS metadata
        '10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16'  // Private IPs
      ]
    },
    
    // Legal Compliance (GDPR, CCPA, Google TOS)
    compliance: {
      respectRobotsTxt: true,       // CRITICAL: Honor robots.txt
      respectNoIndex: true,          // Skip noindex pages
      respectNoFollow: true,         // Honor nofollow directives
      dataRetentionDays: 90,        // GDPR: Data retention
      anonymizeIPs: true,           // Privacy protection
      userConsent: 'implied',       // Consent model
      dpoContact: 'dpo@serpifai.com' // GDPR: Data Protection Officer
    },
    
    // Monitoring & Logging (Elite Observability)
    monitoring: {
      logLevel: 'info',             // debug, info, warn, error
      logRetention: 7,              // Days to keep logs
      alertOnCircuitBreaker: true,  // Alert when circuit opens
      alertOnRateLimit: true,       // Alert on rate limiting
      performanceTracking: true,    // Track response times
      errorReporting: true          // Send error reports
    }
  };
}

/**
 * Fetcher-Specific Configuration (Elite Features)
 * @return {object} Fetcher configuration
 */
function FT_config() {
  var projectConfig = FT_setupProject();
  
  return {
    // Gateway Integration (v6 Architecture)
    gateway: {
      url: PropertiesService.getScriptProperties().getProperty('GATEWAY_URL') || '',
      apiKey: PropertiesService.getScriptProperties().getProperty('GATEWAY_API_KEY') || '',
      timeout: 30000,
      retries: 3
    },
    
    // Inherit project settings
    circuitBreaker: projectConfig.circuitBreaker,
    userAgents: projectConfig.userAgents,
    rateLimits: projectConfig.rateLimits,
    timeouts: projectConfig.timeouts,
    cache: projectConfig.cache,
    security: projectConfig.security,
    compliance: projectConfig.compliance,
    monitoring: projectConfig.monitoring,
    
    // Forensic Analysis Settings (Elite 15-Category System)
    forensics: {
      // AI Content Detection (Enhanced)
      aiDetection: {
        enabled: true,
        phrases: [
          'unlock the power of',
          'delve into',
          'navigating the landscape',
          'it\'s important to note',
          'in today\'s digital world',
          'revolutionize the way',
          'seamless experience',
          'game-changing solution',
          'at the end of the day',
          'cutting-edge technology',
          'leverage the potential',
          'dive deep into'
        ],
        aiTools: [
          'HubSpot', 'Marketo', 'Jasper', 'ChatGPT', 'Claude',
          'Copy.ai', 'Writesonic', 'Rytr', 'Anyword', 'Frase',
          'SurferSEO', 'Clearscope', 'MarketMuse'
        ],
        humanityScoreThreshold: 30,  // CV < 30 = likely AI
        minSampleSize: 100            // Min chars for analysis
      },
      
      // E-E-A-T Signal Detection
      eeat: {
        enabled: true,
        schemaTypes: ['Person', 'Organization', 'Review', 'Rating', 'Article', 'NewsArticle'],
        trustSignals: [
          'author bio', 'credentials', 'certifications',
          'awards', 'published on', 'expert', 'verified'
        ],
        authorityDomains: [
          'gov', 'edu', 'mil', 'org'
        ]
      },
      
      // CMS & Tech Stack Detection
      techStack: {
        enabled: true,
        cmsSignatures: [
          'WordPress', 'Shopify', 'Webflow', 'Wix',
          'Squarespace', 'Ghost', 'Contentful', 'Strapi',
          'Drupal', 'Joomla', 'Magento', 'BigCommerce'
        ],
        frameworks: [
          'React', 'Vue', 'Angular', 'Next.js', 'Nuxt',
          'Gatsby', 'Svelte', 'Ember'
        ],
        analyticsTools: [
          'Google Analytics', 'Google Tag Manager',
          'Facebook Pixel', 'Hotjar', 'Mixpanel',
          'Segment', 'Amplitude'
        ]
      },
      
      // Conversion Intelligence
      conversion: {
        enabled: true,
        keywords: {
          pricing: ['pricing', 'plans', 'cost', 'price', 'subscription'],
          booking: ['book now', 'schedule', 'reserve', 'appointment'],
          trial: ['free trial', 'try free', 'demo', 'test drive'],
          purchase: ['buy now', 'add to cart', 'checkout', 'order']
        },
        chatWidgets: [
          'Intercom', 'Drift', 'LiveChat', 'Zendesk',
          'Tawk', 'Crisp', 'Olark', 'Tidio', 'HubSpot Chat'
        ],
        frictionLevels: {
          low: { max: 4 },
          medium: { min: 5, max: 9 },
          high: { min: 10 }
        }
      },
      
      // Keyword Extraction (World-Class 5-Source System)
      keywords: {
        enabled: true,
        sources: {
          headings: { weight: 5.0 },
          meta: { weight: 4.0 },
          links: { weight: 2.0 },
          alt: { weight: 1.5 },
          body: { weight: 1.0 }
        },
        topSingleKeywords: 50,
        topLongTailPhrases: 30,
        semanticClusters: [
          'seo', 'content', 'technical', 'analytics',
          'marketing', 'tools', 'strategy', 'ecommerce',
          'local', 'social', 'mobile', 'conversion'
        ],
        stopWords: [
          'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for',
          'from', 'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on',
          'that', 'the', 'to', 'was', 'will', 'with', 'the', 'this',
          'but', 'they', 'have', 'had', 'what', 'when', 'where', 'who',
          'which', 'why', 'how', 'can', 'could', 'would', 'should',
          'may', 'might', 'must', 'shall', 'will', 'do', 'does', 'did',
          'been', 'being', 'have', 'has', 'had', 'having', 'not', 'no',
          'nor', 'or', 'if', 'then', 'than', 'because', 'so', 'also',
          'just', 'there', 'very', 'all', 'any', 'both', 'each', 'few',
          'more', 'most', 'other', 'some', 'such', 'only', 'own', 'same'
        ]
      },
      
      // Link Graph Analysis
      linkGraph: {
        enabled: true,
        maxInternalSamples: 50,
        maxExternalSamples: 20,
        detectNoFollow: true,
        detectSponsored: true,
        detectUGC: true
      },
      
      // Content Velocity & Freshness
      velocity: {
        enabled: true,
        freshnessWindow30d: true,
        freshnessWindow90d: true,
        sitemapParsing: true,
        maxSitemapEntries: 1000
      },
      
      // Uniqueness Scoring (Jaccard Index)
      uniqueness: {
        enabled: true,
        algorithm: 'jaccard',
        minWordLength: 3,
        topGapKeywords: 20,
        topOverlapKeywords: 20
      }
    }
  };
}

/**
 * Get Configuration Value
 * @param {string} path - Dot-notation path (e.g., 'forensics.aiDetection.enabled')
 * @param {*} defaultValue - Default if not found
 * @return {*} Configuration value
 */
function FT_getConfig(path, defaultValue) {
  try {
    var config = FT_config();
    var keys = path.split('.');
    var value = config;
    
    for (var i = 0; i < keys.length; i++) {
      if (value && typeof value === 'object' && keys[i] in value) {
        value = value[keys[i]];
      } else {
        return defaultValue;
      }
    }
    
    return value !== undefined ? value : defaultValue;
    
  } catch (e) {
    return defaultValue;
  }
}

/**
 * Legacy function names for backwards compatibility
 */
function SETUP_Project() {
  return FT_setupProject();
}

function FET_Config() {
  return FT_config();
}
