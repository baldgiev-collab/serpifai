/**
 * Application Constants and Enumerations
 * @version 2.0.0
 */

/**
 * Processing states for state machine
 */
const ProcessingState = Object.freeze({
  IDLE: 'IDLE',
  INITIALIZING: 'INITIALIZING',
  FETCHING: 'FETCHING',
  PROCESSING: 'PROCESSING',
  ANALYZING: 'ANALYZING',
  WRITING: 'WRITING',
  COMPLETING: 'COMPLETING',
  ERROR: 'ERROR',
  PAUSED: 'PAUSED'
});

/**
 * Circuit breaker states
 */
const CircuitState = Object.freeze({
  CLOSED: 'CLOSED',     // Normal operation
  OPEN: 'OPEN',         // Failing, rejecting requests
  HALF_OPEN: 'HALF_OPEN' // Testing if service recovered
});

/**
 * Log levels with numeric priorities
 */
const LogLevel = Object.freeze({
  DEBUG: { name: 'DEBUG', priority: 0 },
  INFO: { name: 'INFO', priority: 1 },
  WARN: { name: 'WARN', priority: 2 },
  ERROR: { name: 'ERROR', priority: 3 }
});

/**
 * HTTP status code categories
 */
const HttpStatus = Object.freeze({
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  RATE_LIMITED: 429,
  SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
  
  isSuccess: (code) => code >= 200 && code < 300,
  isClientError: (code) => code >= 400 && code < 500,
  isServerError: (code) => code >= 500,
  isRetryable: (code) => [429, 500, 502, 503, 504].includes(code)
});

/**
 * Cache key prefixes
 */
const CachePrefix = Object.freeze({
  SERP: 'serp:',
  AI: 'ai:',
  ANALYSIS: 'analysis:',
  USER: 'user:',
  HEALTH: 'health:'
});

/**
 * Error types for classification
 */
const ErrorType = Object.freeze({
  NETWORK: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT_ERROR',
  RATE_LIMIT: 'RATE_LIMIT_ERROR',
  AUTH: 'AUTH_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  PROCESSING: 'PROCESSING_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
});

/**
 * API service identifiers
 */
const ApiService = Object.freeze({
  SERP_API: 'serpApi',
  OPEN_ROUTER: 'openRouter',
  PERPLEXITY: 'perplexity',
  SHEETS: 'sheets'
});

/**
 * Metric types for health monitoring
 */
const MetricType = Object.freeze({
  COUNTER: 'counter',
  GAUGE: 'gauge',
  HISTOGRAM: 'histogram',
  TIMER: 'timer'
});

/**
 * Sheet column mappings (customize per project)
 */
const SheetColumns = Object.freeze({
  KEYWORD: 0,
  STATUS: 1,
  RESULTS: 2,
  TIMESTAMP: 3,
  ERROR: 4
});

/**
 * Time constants in milliseconds
 */
const Time = Object.freeze({
  SECOND: 1000,
  MINUTE: 60000,
  HOUR: 3600000,
  DAY: 86400000
});
