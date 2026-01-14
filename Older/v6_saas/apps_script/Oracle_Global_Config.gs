/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * SERPIFAI ORACLE v16.0 - CENTRALIZED GLOBAL CONFIGURATION
 * Single Source of Truth for All Module Constants
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * This file MUST be named with "A_" prefix to ensure it loads FIRST in GAS.
 * Google Apps Script loads files alphabetically, so this guarantees all
 * configurations are defined before any module attempts to use them.
 * 
 * ARCHITECTURE:
 *   - SerpifAI namespace contains all sub-configurations
 *   - Each module can still access via legacy names (GOVERNANCE_CONFIG, etc.)
 *   - Prevents "Identifier already declared" errors in V8 engine
 * 
 * @author SerpifAI Engineering
 * @version 16.0
 * @license Proprietary - serpifai.com
 * ═══════════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// MASTER NAMESPACE - SINGLE GLOBAL OBJECT
// ═══════════════════════════════════════════════════════════════════════════════════

var SerpifAI = SerpifAI || {};

// ─────────────────────────────────────────────────────────────────────────────────
// IDENTITY - Bot identification for ethical crawling
// ─────────────────────────────────────────────────────────────────────────────────

SerpifAI.Identity = {
  BOT_NAME: 'SerpifAI-OracleBot',
  BOT_VERSION: '1.0',
  BOT_POLICY_URL: 'https://serpifai.com/bot-policy',
  USER_AGENT: 'SerpifAI-OracleBot/1.0 (+https://serpifai.com/bot-policy)',
  CONTACT_EMAIL: 'compliance@serpifai.com'
};

// ─────────────────────────────────────────────────────────────────────────────────
// GOVERNANCE - Compliance, throttling, quota management
// ─────────────────────────────────────────────────────────────────────────────────

SerpifAI.Governance = {
  THROTTLING: {
    POLITE_DELAY_MS: 5000,
    RATE_LIMIT_RESCHEDULE_MS: 3600000,
    MAX_RETRIES: 3,
    BACKOFF_MULTIPLIER: 2.0,
    JITTER_MAX_MS: 1000
  },
  QUOTA: {
    DAILY_URL_FETCH_LIMIT: 20000,
    SAFETY_THRESHOLD: 0.80,
    QUOTA_PROPERTY_KEY: 'ORACLE_DAILY_QUOTA_COUNT',
    QUOTA_DATE_KEY: 'ORACLE_QUOTA_DATE'
  },
  EXECUTION: {
    MAX_RUNTIME_MS: 270000,
    SAFETY_MARGIN_MS: 30000,
    HEARTBEAT_PROPERTY_KEY: 'ORACLE_HEARTBEAT_STATE'
  },
  LOGGING: {
    ENABLED: true,
    LOG_PROPERTY_KEY: 'ORACLE_COMPLIANCE_LOG',
    MAX_LOG_ENTRIES: 1000
  }
};

// ─────────────────────────────────────────────────────────────────────────────────
// WAREHOUSE - MySQL/JDBC database configuration
// ─────────────────────────────────────────────────────────────────────────────────

SerpifAI.Warehouse = {
  MYSQL: {
    HOST_PROPERTY: 'ORACLE_MYSQL_HOST',
    PORT_PROPERTY: 'ORACLE_MYSQL_PORT',
    DATABASE_PROPERTY: 'ORACLE_MYSQL_DATABASE',
    USER_PROPERTY: 'ORACLE_MYSQL_USER',
    PASSWORD_PROPERTY: 'ORACLE_MYSQL_PASSWORD',
    DEFAULT_PORT: 3306,
    CONNECTION_TIMEOUT: 30000,
    MAX_RETRIES: 3
  },
  BATCH: {
    MAX_BATCH_SIZE: 100,
    KEYWORD_BATCH_SIZE: 75,
    COMMIT_THRESHOLD: 500
  },
  TABLES: {
    DOMAINS: 'domains',
    PAGES: 'pages',
    KEYWORD_CLUSTERS: 'keyword_clusters',
    LINK_FORENSICS: 'link_forensics',
    GOVERNANCE_LOGS: 'governance_logs'
  }
};

// ─────────────────────────────────────────────────────────────────────────────────
// FETCHER - Stealth fetcher and queue management
// ─────────────────────────────────────────────────────────────────────────────────

SerpifAI.Fetcher = {
  PRIORITY: {
    MAX_PAGES: 15,
    MAX_KEYWORDS_PER_PAGE: 75,
    REVENUE_WEIGHT_TRAFFIC: 0.4,
    REVENUE_WEIGHT_CPC: 0.4,
    REVENUE_WEIGHT_CONVERSION: 0.2
  },
  HEARTBEAT: {
    STATE_PROPERTY_KEY: 'ORACLE_FETCHER_STATE',
    QUEUE_PROPERTY_KEY: 'ORACLE_FETCH_QUEUE',
    TRIGGER_FUNCTION: 'oracleFetcherContinue',
    CONTINUATION_DELAY_MS: 60000
  },
  FETCH: {
    TIMEOUT_MS: 30000,
    MAX_CONTENT_LENGTH: 5000000,
    FOLLOW_REDIRECTS: true,
    VALIDATE_CERTIFICATES: true
  }
};

// ─────────────────────────────────────────────────────────────────────────────────
// PARSER - Forensic Parser sub-modules
// ─────────────────────────────────────────────────────────────────────────────────

SerpifAI.Parser = {
  // Semantic Intelligence (Module 3.1)
  Semantic: {
    CONTENT: {
      MIN_WORD_COUNT: 100,
      MAX_WORD_COUNT: 50000,
      HEADING_DEPTH: 6
    },
    KEYWORDS: {
      EXTRACTION_DEPTH: 100,
      MIN_FREQUENCY: 2,
      STOPWORDS_ENABLED: true
    },
    INTENT: {
      PATTERNS_ENABLED: true,
      AI_CLASSIFICATION_ENABLED: true
    }
  },
  
  // Trust & Authority (Module 3.2)
  Trust: {
    EEAT: {
      EXPERIENCE_WEIGHT: 0.25,
      EXPERTISE_WEIGHT: 0.25,
      AUTHORITY_WEIGHT: 0.25,
      TRUST_WEIGHT: 0.25
    },
    SYNTHETIC_KD: {
      EEAT_WEIGHT: 0.40,
      FRESHNESS_WEIGHT: 0.15,
      LINK_PROFILE_WEIGHT: 0.25,
      CONTENT_DEPTH_WEIGHT: 0.20
    },
    THRESHOLDS: {
      EASY_KD: 30,
      MODERATE_KD: 55,
      HARD_KD: 75
    }
  },
  
  // AI/AEO Readiness (Module 3.3)
  AI: {
    SCHEMA: {
      REQUIRED_TYPES: ['Article', 'FAQPage', 'HowTo', 'Product', 'LocalBusiness'],
      BONUS_TYPES: ['Organization', 'Person', 'BreadcrumbList']
    },
    SPO: {
      MIN_TRIPLETS: 3,
      PREFERRED_TRIPLETS: 10
    },
    RAG: {
      CHUNK_SIZE: 500,
      OVERLAP: 50
    }
  }
};

// ─────────────────────────────────────────────────────────────────────────────────
// DATABRIDGE - Gemini integration and sync
// ─────────────────────────────────────────────────────────────────────────────────

SerpifAI.DataBridge = {
  GEMINI: {
    API_KEY_PROPERTY: 'GEMINI_API_KEY',
    GATEWAY_URL_PROPERTY: 'GATEWAY_GEMINI_URL',
    GATEWAY_KEY_PROPERTY: 'GATEWAY_API_KEY',
    MODEL: 'gemini-1.5-flash',
    ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    MAX_TOKENS: 4096,
    TEMPERATURE: 0.7,
    TIMEOUT_MS: 60000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY_MS: 2000
  },
  KILL_MOVE: {
    SNIPE: { MAX_KD: 35, MIN_CPC: 15, MAX_EEAT: 50 },
    AEO_HIJACK: { MAX_AEO: 40, MIN_PAGE_RANK: 3 },
    INSTANT_TAKEOVER: { MAX_KD: 35, MAX_FRESHNESS: 40 },
    VULNERABLE: { MAX_TRUST: 40, MAX_CONTENT_DEPTH: 500 }
  },
  SYNC: {
    BATCH_SIZE: 10,
    MAX_KEYWORDS_PER_PAGE: 75,
    ENABLE_GEMINI_INSIGHTS: true,
    ENABLE_KILL_ALERTS: true
  },
  ALERTS: {
    EMAIL_PROPERTY: 'ALERT_EMAIL',
    SLACK_WEBHOOK_PROPERTY: 'SLACK_WEBHOOK_URL',
    ENABLE_EMAIL: true,
    ENABLE_SLACK: false
  }
};

// ─────────────────────────────────────────────────────────────────────────────────
// JDBC BRIDGE - Direct MySQL JDBC configuration
// ─────────────────────────────────────────────────────────────────────────────────

SerpifAI.JDBCBridge = {
  PROPERTY_KEYS: {
    DB_HOST: 'DB_HOST',
    DB_USER: 'DB_USER',
    DB_PASS: 'DB_PASS',
    DB_NAME: 'DB_NAME',
    DB_PORT: 'DB_PORT'
  },
  CONNECTION: {
    DEFAULT_PORT: '3306',
    TIMEOUT_MS: 30000,
    USE_SSL: true,
    VERIFY_SERVER_CERT: false
  },
  BATCH: {
    SIZE: 100,
    MAX_KEYWORDS_PER_COMMIT: 450,
    COMMIT_INTERVAL: 100
  },
  TABLES: {
    DOMAINS: 'domains',
    PAGES: 'pages',
    KEYWORD_INTELLIGENCE: 'keyword_intelligence',
    LINK_FORENSICS: 'link_forensics',
    GOVERNANCE_LOGS: 'governance_logs'
  }
};

// ─────────────────────────────────────────────────────────────────────────────────
// TEST CONFIG - Oracle test suite configuration
// ─────────────────────────────────────────────────────────────────────────────────

SerpifAI.Test = {
  MOCK_URLS: [
    'https://example.com/test-page',
    'https://example.com/product-review',
    'https://example.com/how-to-guide'
  ],
  THRESHOLDS: {
    FETCH_LATENCY_WARN: 5000,
    PARSE_LATENCY_WARN: 3000,
    GEMINI_LATENCY_WARN: 15000,
    MIN_KEYWORDS: 5
  },
  TIMEOUTS: {
    FETCH_REQUEST: 30000,
    PARSE_OPERATION: 60000,
    GEMINI_CALL: 60000,
    MYSQL_SAVE: 30000
  }
};

// ═══════════════════════════════════════════════════════════════════════════════════
// LEGACY COMPATIBILITY LAYER
// These aliases ensure existing code continues to work without modification
// ═══════════════════════════════════════════════════════════════════════════════════

// Map legacy names to SerpifAI namespace
// These use the namespace pattern to prevent "Identifier already declared" errors

var SERPIFAI_IDENTITY = SERPIFAI_IDENTITY || SerpifAI.Identity;
var GOVERNANCE_CONFIG = GOVERNANCE_CONFIG || SerpifAI.Governance;
var WAREHOUSE_CONFIG = WAREHOUSE_CONFIG || SerpifAI.Warehouse;
var FETCHER_CONFIG = FETCHER_CONFIG || SerpifAI.Fetcher;
var SEMANTIC_CONFIG = SEMANTIC_CONFIG || SerpifAI.Parser.Semantic;
var TRUST_CONFIG = TRUST_CONFIG || SerpifAI.Parser.Trust;
var AEO_CONFIG = AEO_CONFIG || SerpifAI.Parser.AI;
var DATABRIDGE_CONFIG = DATABRIDGE_CONFIG || SerpifAI.DataBridge;
var JDBC_BRIDGE_CONFIG = JDBC_BRIDGE_CONFIG || SerpifAI.JDBCBridge;
var ORACLE_TEST_CONFIG = ORACLE_TEST_CONFIG || SerpifAI.Test;

// ═══════════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Get configuration value with fallback
 * @param {string} path - Dot-notation path (e.g., 'Governance.THROTTLING.POLITE_DELAY_MS')
 * @param {*} defaultValue - Fallback value if path not found
 * @returns {*} Configuration value
 */
function getSerpifAIConfig(path, defaultValue) {
  const parts = path.split('.');
  let current = SerpifAI;
  
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return defaultValue;
    }
  }
  
  return current;
}

/**
 * Override configuration value at runtime
 * @param {string} path - Dot-notation path
 * @param {*} value - New value
 */
function setSerpifAIConfig(path, value) {
  const parts = path.split('.');
  const lastKey = parts.pop();
  let current = SerpifAI;
  
  for (const part of parts) {
    if (!(part in current)) {
      current[part] = {};
    }
    current = current[part];
  }
  
  current[lastKey] = value;
}

/**
 * Log all active configurations (for debugging)
 */
function logSerpifAIConfig() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('SERPIFAI ORACLE v16.0 - ACTIVE CONFIGURATION');
  console.log('═══════════════════════════════════════════════════════════════');
  
  console.log('\n📋 Identity:', JSON.stringify(SerpifAI.Identity, null, 2));
  console.log('\n🛡️ Governance:', JSON.stringify(SerpifAI.Governance, null, 2));
  console.log('\n🗄️ Warehouse:', JSON.stringify(SerpifAI.Warehouse, null, 2));
  console.log('\n🔍 Fetcher:', JSON.stringify(SerpifAI.Fetcher, null, 2));
  console.log('\n🧬 Parser:', JSON.stringify(SerpifAI.Parser, null, 2));
  console.log('\n🌉 DataBridge:', JSON.stringify(SerpifAI.DataBridge, null, 2));
  console.log('\n🔌 JDBCBridge:', JSON.stringify(SerpifAI.JDBCBridge, null, 2));
  console.log('\n🧪 Test:', JSON.stringify(SerpifAI.Test, null, 2));
  
  console.log('\n═══════════════════════════════════════════════════════════════');
}
