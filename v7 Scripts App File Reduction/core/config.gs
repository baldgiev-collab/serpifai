/**
 * Elite Configuration Management System
 * Provides centralized, type-safe configuration with validation
 * @version 2.0.0
 */

/**
 * Configuration namespace
 */
const Config = (function() {
  'use strict';
  
  // Private configuration cache
  let _configCache = null;
  let _lastLoad = 0;
  const CACHE_TTL = 300000; // 5 minutes
  
  /**
   * Default configuration values
   */
  const DEFAULTS = Object.freeze({
    // API Configuration
    api: {
      serpApi: {
        baseUrl: 'https://serpapi.com/search',
        timeout: 30000,
        maxRetries: 3,
        rateLimit: { requests: 100, windowMs: 60000 }
      },
      openRouter: {
        baseUrl: 'https://openrouter.ai/api/v1',
        timeout: 60000,
        maxRetries: 3,
        rateLimit: { requests: 60, windowMs: 60000 }
      },
      perplexity: {
        baseUrl: 'https://api.perplexity.ai',
        timeout: 45000,
        maxRetries: 3,
        rateLimit: { requests: 50, windowMs: 60000 }
      }
    },
    
    // Processing Configuration
    processing: {
      batchSize: 10,
      maxConcurrent: 5,
      defaultTimeout: 30000,
      maxQueueSize: 1000
    },
    
    // Circuit Breaker Configuration
    circuitBreaker: {
      failureThreshold: 5,
      resetTimeout: 60000,
      halfOpenRequests: 3
    },
    
    // Retry Configuration
    retry: {
      maxAttempts: 3,
      baseDelay: 1000,
      maxDelay: 30000,
      backoffMultiplier: 2,
      jitterFactor: 0.1
    },
    
    // Cache Configuration
    cache: {
      defaultTtl: 3600000, // 1 hour
      maxSize: 1000,
      cleanupInterval: 300000 // 5 minutes
    },
    
    // Logging Configuration
    logging: {
      level: 'INFO',
      includeTimestamp: true,
      includeContext: true,
      maxMessageLength: 10000
    },
    
    // Health Monitoring
    health: {
      checkInterval: 60000,
      alertThresholds: {
        errorRate: 0.1,
        latencyMs: 5000,
        memoryUsagePercent: 80
      }
    },
    
    // Feature Flags
    features: {
      enableCaching: true,
      enableCircuitBreaker: true,
      enableMetrics: true,
      enableHealthChecks: true,
      debugMode: false
    }
  });
  
  /**
   * Environment variable mappings
   */
  const ENV_MAPPINGS = {
    'SERP_API_KEY': 'api.serpApi.apiKey',
    'OPENROUTER_API_KEY': 'api.openRouter.apiKey',
    'PERPLEXITY_API_KEY': 'api.perplexity.apiKey',
    'LOG_LEVEL': 'logging.level',
    'DEBUG_MODE': 'features.debugMode',
    'BATCH_SIZE': 'processing.batchSize'
  };
  
  /**
   * Deep merge utility
   */
  function deepMerge(target, source) {
    const result = { ...target };
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    return result;
  }
  
  /**
   * Get nested value from object using dot notation
   */
  function getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => 
      current && current[key] !== undefined ? current[key] : undefined, obj);
  }
  
  /**
   * Set nested value in object using dot notation
   */
  function setNestedValue(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key];
    }, obj);
    target[lastKey] = value;
  }
  
  /**
   * Load configuration from Script Properties
   */
  function loadFromProperties() {
    try {
      const props = PropertiesService.getScriptProperties();
      const allProps = props.getProperties();
      const config = {};
      
      // Map environment variables to config paths
      for (const [envKey, configPath] of Object.entries(ENV_MAPPINGS)) {
        if (allProps[envKey]) {
          let value = allProps[envKey];
          // Parse boolean strings
          if (value === 'true') value = true;
          else if (value === 'false') value = false;
          // Parse numeric strings
          else if (!isNaN(value) && value !== '') value = Number(value);
          
          setNestedValue(config, configPath, value);
        }
      }
      
      // Load custom config JSON if exists
      if (allProps['CONFIG_JSON']) {
        try {
          const customConfig = JSON.parse(allProps['CONFIG_JSON']);
          return deepMerge(config, customConfig);
        } catch (e) {
          console.warn('Failed to parse CONFIG_JSON:', e.message);
        }
      }
      
      return config;
    } catch (e) {
      console.warn('Failed to load properties:', e.message);
      return {};
    }
  }
  
  /**
   * Validate configuration values
   */
  function validateConfig(config) {
    const errors = [];
    
    // Validate numeric ranges
    if (config.processing?.batchSize < 1 || config.processing?.batchSize > 100) {
      errors.push('processing.batchSize must be between 1 and 100');
    }
    
    if (config.retry?.maxAttempts < 1 || config.retry?.maxAttempts > 10) {
      errors.push('retry.maxAttempts must be between 1 and 10');
    }
    
    // Validate log level
    const validLevels = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
    if (config.logging?.level && !validLevels.includes(config.logging.level)) {
      errors.push(`logging.level must be one of: ${validLevels.join(', ')}`);
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Public API
   */
  return {
    /**
     * Get configuration value by path
     * @param {string} path - Dot-notation path (e.g., 'api.serpApi.timeout')
     * @param {*} defaultValue - Default if not found
     * @returns {*} Configuration value
     */
    get: function(path, defaultValue) {
      const config = this.getAll();
      const value = getNestedValue(config, path);
      return value !== undefined ? value : defaultValue;
    },
    
    /**
     * Get all configuration merged with defaults
     * @returns {Object} Complete configuration object
     */
    getAll: function() {
      const now = Date.now();
      if (_configCache && (now - _lastLoad) < CACHE_TTL) {
        return _configCache;
      }
      
      const propsConfig = loadFromProperties();
      _configCache = deepMerge(DEFAULTS, propsConfig);
      _lastLoad = now;
      
      return _configCache;
    },
    
    /**
     * Validate current configuration
     * @returns {Object} Validation result with valid flag and errors array
     */
    validate: function() {
      return validateConfig(this.getAll());
    },
    
    /**
     * Clear configuration cache
     */
    clearCache: function() {
      _configCache = null;
      _lastLoad = 0;
    },
    
    /**
     * Get API configuration for a specific service
     * @param {string} service - Service name (serpApi, openRouter, perplexity)
     * @returns {Object} API configuration
     */
    getApiConfig: function(service) {
      return this.get(`api.${service}`, {});
    },
    
    /**
     * Check if a feature is enabled
     * @param {string} feature - Feature name
     * @returns {boolean} Whether feature is enabled
     */
    isFeatureEnabled: function(feature) {
      return this.get(`features.${feature}`, false);
    },
    
    /**
     * Get default configuration
     * @returns {Object} Default configuration object
     */
    getDefaults: function() {
      return DEFAULTS;
    }
  };
})();

// Global accessor for backward compatibility
function getConfig(path, defaultValue) {
  return Config.get(path, defaultValue);
}
