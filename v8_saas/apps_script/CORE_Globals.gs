/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CORE_Globals.gs - GLOBAL CONSTANTS AND STATE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * SerpifAI v8.0.0 - Shared constants and module registry
 * 
 * @module CORE_Globals
 * @version 8.0.0
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════
// VERSION INFORMATION
// ═══════════════════════════════════════════════════════════════════════════

const SERPIFAI_VERSION = '8.0.0';
const SERPIFAI_BUILD = '2026-01-08';
const SERPIFAI_CODENAME = 'Elite Intelligence Engine';

// ═══════════════════════════════════════════════════════════════════════════
// SHEET NAMES
// ═══════════════════════════════════════════════════════════════════════════

const SHEET_NAMES = {
  MAIN: 'Main',
  CONFIG: 'Config',
  KEYWORDS: 'Keywords',
  COMPETITORS: 'Competitors',
  FORENSIC: 'Forensic Analysis',
  CONTENT_GAP: 'Content Gap',
  SERP_FEATURES: 'SERP Features',
  TECHNICAL: 'Technical SEO',
  BACKLINKS: 'Backlink Analysis',
  LOCAL: 'Local SEO',
  HISTORY: 'History',
  LOGS: 'Logs',
  DASHBOARD: 'Dashboard'
};

// ═══════════════════════════════════════════════════════════════════════════
// API CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const API_NAMES = {
  GEMINI: 'gemini',
  SERPER: 'serper',
  PAGE_SPEED: 'pageSpeed',
  OPEN_PAGE_RANK: 'openPageRank',
  GATEWAY: 'gateway'
};

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  RATE_LIMITED: 429,
  SERVER_ERROR: 500
};

// ═══════════════════════════════════════════════════════════════════════════
// ANALYSIS TYPES
// ═══════════════════════════════════════════════════════════════════════════

const ANALYSIS_TYPES = {
  KEYWORD: 'keyword',
  COMPETITOR: 'competitor',
  FORENSIC: 'forensic',
  CONTENT_GAP: 'contentGap',
  SERP_FEATURES: 'serpFeatures',
  TECHNICAL: 'technical',
  BACKLINKS: 'backlinks',
  LOCAL: 'local',
  FULL: 'full'
};

// ═══════════════════════════════════════════════════════════════════════════
// STATUS CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  PAUSED: 'paused'
};

// ═══════════════════════════════════════════════════════════════════════════
// SCORE THRESHOLDS
// ═══════════════════════════════════════════════════════════════════════════

const SCORE_THRESHOLDS = {
  EXCELLENT: 90,
  GOOD: 70,
  AVERAGE: 50,
  POOR: 30,
  CRITICAL: 0
};

// ═══════════════════════════════════════════════════════════════════════════
// COLOR PALETTE
// ═══════════════════════════════════════════════════════════════════════════

const COLORS = {
  // Brand colors
  PRIMARY: '#667eea',
  SECONDARY: '#764ba2',
  ACCENT: '#f093fb',
  
  // Status colors
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#3b82f6',
  
  // Neutral colors
  DARK: '#1a1a2e',
  MEDIUM: '#374151',
  LIGHT: '#f3f4f6',
  WHITE: '#ffffff',
  
  // Chart colors
  CHART: [
    '#667eea', '#764ba2', '#f093fb', '#10b981',
    '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899',
    '#14b8a6', '#f97316', '#6366f1', '#a855f7'
  ]
};

// ═══════════════════════════════════════════════════════════════════════════
// CACHE KEYS
// ═══════════════════════════════════════════════════════════════════════════

const CACHE_KEYS = {
  SESSION: 'session_',
  USER: 'user_',
  KEYWORDS: 'keywords_',
  ANALYSIS: 'analysis_',
  SERP: 'serp_',
  CONFIG: 'config_'
};

const CACHE_TTL = {
  SHORT: 300,      // 5 minutes
  MEDIUM: 3600,    // 1 hour
  LONG: 86400,     // 24 hours
  WEEK: 604800     // 7 days
};

// ═══════════════════════════════════════════════════════════════════════════
// MODULE REGISTRY
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Registry of all V8 modules
 * Used for dependency tracking and initialization order
 */
const MODULE_REGISTRY = {
  // Core (load first)
  CORE: ['CORE_Config', 'CORE_Globals', 'CORE_Logger', 'CORE_ErrorHandler', 'CORE_Utils'],
  
  // Data Bridge (load second)
  DB: [
    'DB_Main', 'DB_Sheets', 'DB_MySQL', 'DB_Cache', 'DB_Session',
    'DB_Keywords', 'DB_Competitors', 'DB_Analysis', 'DB_History'
  ],
  
  // Fetchers (load third)
  FT: [
    'FT_Main', 'FT_Serper', 'FT_Gemini', 'FT_PageSpeed', 'FT_PageRank',
    'FT_Comp_Main', 'FT_Comp_Queue', 'FT_Comp_Process', 'FT_Comp_Batch',
    'FT_Forensic_Main', 'FT_Forensic_Intent', 'FT_Forensic_SERP',
    'FT_Forensic_Semantic', 'FT_Forensic_Competitor', 'FT_Forensic_Content',
    'FT_Forensic_Technical', 'FT_Forensic_Authority', 'FT_Forensic_UX'
  ],
  
  // UI (load last)
  UI: [
    'UI_Main', 'UI_Sidebar', 'UI_Modal', 'UI_Dashboard', 'UI_Charts',
    'UI_Tables', 'UI_Cards', 'UI_Forms', 'UI_Elite_Renderer'
  ]
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get version string
 * @return {string} Version string
 */
function CORE_getVersion() {
  return `SerpifAI ${SERPIFAI_CODENAME} v${SERPIFAI_VERSION}`;
}

/**
 * Get build info
 * @return {Object} Build information
 */
function CORE_getBuildInfo() {
  return {
    version: SERPIFAI_VERSION,
    build: SERPIFAI_BUILD,
    codename: SERPIFAI_CODENAME,
    runtime: 'V8',
    modules: Object.values(MODULE_REGISTRY).flat().length
  };
}

/**
 * Get color by score
 * @param {number} score - Score 0-100
 * @return {string} Color hex
 */
function CORE_getScoreColor(score) {
  if (score >= SCORE_THRESHOLDS.EXCELLENT) return COLORS.SUCCESS;
  if (score >= SCORE_THRESHOLDS.GOOD) return COLORS.INFO;
  if (score >= SCORE_THRESHOLDS.AVERAGE) return COLORS.WARNING;
  return COLORS.ERROR;
}

/**
 * Get score label
 * @param {number} score - Score 0-100
 * @return {string} Label
 */
function CORE_getScoreLabel(score) {
  if (score >= SCORE_THRESHOLDS.EXCELLENT) return 'Excellent';
  if (score >= SCORE_THRESHOLDS.GOOD) return 'Good';
  if (score >= SCORE_THRESHOLDS.AVERAGE) return 'Average';
  if (score >= SCORE_THRESHOLDS.POOR) return 'Poor';
  return 'Critical';
}

/**
 * Get all module names
 * @return {Array} All module names
 */
function CORE_getAllModules() {
  return Object.values(MODULE_REGISTRY).flat();
}

/**
 * Check if running in Apps Script environment
 * @return {boolean} True if Apps Script
 */
function CORE_isAppsScript() {
  return typeof SpreadsheetApp !== 'undefined';
}
