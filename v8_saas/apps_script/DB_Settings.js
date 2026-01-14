/**
 * DB_Settings.gs - User Settings Management
 * SerpifAI V8 - Settings storage and retrieval
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// SETTINGS MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Get all user settings
 */
function DB_getSettings() {
  try {
    const props = PropertiesService.getUserProperties();
    const allProps = props.getProperties();
    
    // Default settings
    const defaults = {
      theme: 'light',
      language: 'en',
      timezone: 'America/New_York',
      dateFormat: 'MM/DD/YYYY',
      emailNotifications: 'true',
      autoRefresh: 'false',
      refreshInterval: '60',
      defaultProject: '',
      resultsPerPage: '25',
      showTutorials: 'true'
    };
    
    // Merge defaults with stored settings
    const settings = {};
    Object.keys(defaults).forEach(function(key) {
      settings[key] = allProps['setting_' + key] || defaults[key];
    });
    
    return { ok: true, settings: settings };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Save setting
 */
function DB_saveSetting(params) {
  const key = params.key;
  const value = params.value;
  
  if (!key) {
    return { ok: false, error: 'Setting key required' };
  }
  
  try {
    const props = PropertiesService.getUserProperties();
    props.setProperty('setting_' + key, String(value));
    
    return { ok: true, key: key, value: value };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Save multiple settings
 */
function DB_saveSettings(params) {
  const settings = params.settings || {};
  
  try {
    const props = PropertiesService.getUserProperties();
    
    Object.keys(settings).forEach(function(key) {
      props.setProperty('setting_' + key, String(settings[key]));
    });
    
    return { ok: true, count: Object.keys(settings).length };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Get single setting
 */
function DB_getSetting(params) {
  const key = params.key;
  const defaultValue = params.default || '';
  
  if (!key) {
    return { ok: false, error: 'Setting key required' };
  }
  
  try {
    const props = PropertiesService.getUserProperties();
    const value = props.getProperty('setting_' + key) || defaultValue;
    
    return { ok: true, key: key, value: value };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Delete setting
 */
function DB_deleteSetting(params) {
  const key = params.key;
  
  if (!key) {
    return { ok: false, error: 'Setting key required' };
  }
  
  try {
    const props = PropertiesService.getUserProperties();
    props.deleteProperty('setting_' + key);
    
    return { ok: true, key: key };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Reset settings to defaults
 */
function DB_resetSettings() {
  try {
    const props = PropertiesService.getUserProperties();
    const allProps = props.getProperties();
    
    // Delete all setting_ properties
    Object.keys(allProps).forEach(function(key) {
      if (key.startsWith('setting_')) {
        props.deleteProperty(key);
      }
    });
    
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// API KEYS MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Get API keys (masked)
 */
function DB_getApiKeys() {
  try {
    const props = PropertiesService.getScriptProperties();
    
    const keys = {
      serper: maskApiKey(props.getProperty('SERPER_API_KEY')),
      gemini: maskApiKey(props.getProperty('GEMINI_API_KEY')),
      pageSpeed: maskApiKey(props.getProperty('PAGESPEED_API_KEY')),
      gateway: props.getProperty('GATEWAY_URL') ? 'Configured' : 'Not Set'
    };
    
    return { ok: true, keys: keys };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Mask API key for display
 */
function maskApiKey(key) {
  if (!key) return 'Not Set';
  if (key.length <= 8) return '****';
  return key.substring(0, 4) + '****' + key.substring(key.length - 4);
}

/**
 * Save API key
 */
function DB_saveApiKey(params) {
  const keyType = params.keyType;
  const value = params.value;
  
  if (!keyType || !value) {
    return { ok: false, error: 'Key type and value required' };
  }
  
  const keyMap = {
    serper: 'SERPER_API_KEY',
    gemini: 'GEMINI_API_KEY',
    pageSpeed: 'PAGESPEED_API_KEY',
    gateway: 'GATEWAY_URL'
  };
  
  const propName = keyMap[keyType];
  if (!propName) {
    return { ok: false, error: 'Invalid key type' };
  }
  
  try {
    const props = PropertiesService.getScriptProperties();
    props.setProperty(propName, value);
    
    return { ok: true, keyType: keyType };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Test API key
 */
function DB_testApiKey(params) {
  const keyType = params.keyType;
  
  try {
    const props = PropertiesService.getScriptProperties();
    
    switch (keyType) {
      case 'serper':
        return testSerperKey(props.getProperty('SERPER_API_KEY'));
      case 'gemini':
        return testGeminiKey(props.getProperty('GEMINI_API_KEY'));
      case 'gateway':
        return testGatewayConnection(props.getProperty('GATEWAY_URL'));
      default:
        return { ok: false, error: 'Invalid key type' };
    }
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Test Serper API key
 */
function testSerperKey(key) {
  if (!key) return { ok: false, error: 'No Serper API key configured' };
  
  try {
    const response = UrlFetchApp.fetch('https://google.serper.dev/search', {
      method: 'post',
      contentType: 'application/json',
      headers: { 'X-API-KEY': key },
      payload: JSON.stringify({ q: 'test' }),
      muteHttpExceptions: true
    });
    
    const code = response.getResponseCode();
    if (code === 200) {
      return { ok: true, message: 'Serper API key is valid' };
    } else if (code === 401) {
      return { ok: false, error: 'Invalid Serper API key' };
    } else {
      return { ok: false, error: 'Serper API returned status ' + code };
    }
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Test Gemini API key
 */
function testGeminiKey(key) {
  if (!key) return { ok: false, error: 'No Gemini API key configured' };
  
  try {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models?key=' + key;
    const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    
    const code = response.getResponseCode();
    if (code === 200) {
      return { ok: true, message: 'Gemini API key is valid' };
    } else if (code === 401 || code === 403) {
      return { ok: false, error: 'Invalid Gemini API key' };
    } else {
      return { ok: false, error: 'Gemini API returned status ' + code };
    }
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Test gateway connection
 */
function testGatewayConnection(url) {
  if (!url) return { ok: false, error: 'No gateway URL configured' };
  
  try {
    const response = UrlFetchApp.fetch(url + '/health', { muteHttpExceptions: true });
    const code = response.getResponseCode();
    
    if (code === 200) {
      return { ok: true, message: 'Gateway connection successful' };
    } else {
      return { ok: false, error: 'Gateway returned status ' + code };
    }
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// PROJECT PREFERENCES
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Get project preferences
 */
function DB_getProjectPreferences(params) {
  const projectId = params.projectId;
  
  if (!projectId) {
    return { ok: false, error: 'Project ID required' };
  }
  
  try {
    const props = PropertiesService.getUserProperties();
    const prefKey = 'projectPref_' + projectId;
    const stored = props.getProperty(prefKey);
    
    const prefs = stored ? JSON.parse(stored) : {
      trackingFrequency: 'weekly',
      notifyOnRankChange: true,
      rankChangeThreshold: 5,
      autoGenerateReports: false,
      reportFrequency: 'monthly'
    };
    
    return { ok: true, preferences: prefs };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Save project preferences
 */
function DB_saveProjectPreferences(params) {
  const projectId = params.projectId;
  const preferences = params.preferences;
  
  if (!projectId || !preferences) {
    return { ok: false, error: 'Project ID and preferences required' };
  }
  
  try {
    const props = PropertiesService.getUserProperties();
    const prefKey = 'projectPref_' + projectId;
    props.setProperty(prefKey, JSON.stringify(preferences));
    
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
