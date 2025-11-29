/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FETCHER MODULE - CONFIGURATION & SETUP
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * SerpifAI v6 Elite - One-Shot Forensic Engine
 * 
 * @module FetcherConfig
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Project Configuration
 * Returns sheet ID and API keys for the forensic engine
 */
function SETUP_Project() {
  return {
    sheetId: '14LrX3Yk78SCwSNhQinrWw9fTM_TVLz1NkNGq_Us-PcU',
    sheetName: 'CircuitBreaker',
    maxFailures: 5,
    cooldownMinutes: 30,
    userAgents: [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
    ]
  };
}

/**
 * Fetcher Configuration
 * Returns runtime config for forensic engine
 */
function FET_Config() {
  var props = PropertiesService.getScriptProperties();
  
  return {
    // API Keys
    fetcherApiKey: props.getProperty('FETCHER_API_KEY') || 'serpifai_2024_secure_key_j8k3m9n2p5q7r4s6',
    
    // Timeout settings
    fetchTimeout: 30000, // 30 seconds
    parseTimeout: 15000, // 15 seconds
    
    // Circuit Breaker
    circuitBreaker: {
      enabled: true,
      maxFailures: 5,
      cooldownMs: 30 * 60 * 1000 // 30 minutes
    },
    
    // Forensic Analysis Settings
    forensics: {
      narrativeLength: 1500, // First N chars for archetype analysis
      humanityScoreThreshold: 70, // Below = likely AI content
      frictionThreshold: 5, // Form fields > N = high friction
      
      // AI Detection Keywords
      aiPhrases: [
        'unlock the power of',
        'in the realm of',
        'it\'s worth noting',
        'delve into',
        'dive deep',
        'harness the potential',
        'revolutionize the way',
        'in today\'s fast-paced'
      ],
      
      // AI Workflow Signatures
      aiTools: [
        'HubSpot',
        'Marketo',
        'Jasper',
        'Jasper.ai',
        'Copy.ai',
        'Intercom',
        'Drift',
        'ChatGPT',
        'OpenAI',
        'Claude',
        'Anthropic'
      ],
      
      // CMS Detection
      cmsSignatures: {
        'WordPress': ['wp-content', 'wp-includes', 'wp-json'],
        'Shopify': ['cdn.shopify.com', 'myshopify.com'],
        'Webflow': ['webflow.io', 'webflow.com'],
        'Wix': ['wix.com', 'wixstatic.com'],
        'Squarespace': ['squarespace.com', 'sqsp.com'],
        'Ghost': ['ghost.io', 'ghost.org'],
        'Contentful': ['contentful.com'],
        'Strapi': ['strapi.io']
      },
      
      // Conversion Intent Keywords
      conversionKeywords: {
        pricing: ['pricing', 'plans', 'cost', 'price'],
        booking: ['book', 'schedule', 'demo', 'meeting', 'consultation'],
        trial: ['free trial', 'start free', 'get started', 'try free'],
        purchase: ['buy now', 'order', 'checkout', 'add to cart']
      }
    }
  };
}

/**
 * Get rotating User-Agent
 */
function FET_getUserAgent() {
  var config = SETUP_Project();
  var index = Math.floor(Math.random() * config.userAgents.length);
  return config.userAgents[index];
}
