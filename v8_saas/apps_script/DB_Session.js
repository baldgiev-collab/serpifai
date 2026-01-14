/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DB_Session.gs - SESSION MANAGEMENT
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * SerpifAI v8.0.0 - User session state management
 * 
 * @module DB_Session
 * @version 8.0.0
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SESSION_TTL = 3600;  // 1 hour
const SESSION_PREFIX = 'session_';

/**
 * Get or create session
 * @return {Object} Session object
 */
function DB_Session_get() {
  const sessionId = _getSessionId();
  let session = DB_Cache_getUser(SESSION_PREFIX + sessionId);
  
  if (!session) {
    session = _createSession(sessionId);
    DB_Session_save(session);
  }
  
  return session;
}

/**
 * Save session
 * @param {Object} session - Session data
 * @return {boolean} Success
 */
function DB_Session_save(session) {
  if (!session || !session.id) return false;
  
  session.lastActivity = new Date().toISOString();
  return DB_Cache_setUser(SESSION_PREFIX + session.id, session, SESSION_TTL);
}

/**
 * Update session data
 * @param {Object} updates - Fields to update
 * @return {Object} Updated session
 */
function DB_Session_update(updates) {
  const session = DB_Session_get();
  
  Object.keys(updates).forEach(key => {
    if (key !== 'id' && key !== 'createdAt') {
      session[key] = updates[key];
    }
  });
  
  DB_Session_save(session);
  return session;
}

/**
 * Get session value
 * @param {string} key - Value key
 * @param {*} defaultValue - Default if not found
 * @return {*} Value
 */
function DB_Session_getValue(key, defaultValue) {
  const session = DB_Session_get();
  return session[key] !== undefined ? session[key] : defaultValue;
}

/**
 * Set session value
 * @param {string} key - Value key
 * @param {*} value - Value to set
 * @return {boolean} Success
 */
function DB_Session_setValue(key, value) {
  const session = DB_Session_get();
  session[key] = value;
  return DB_Session_save(session);
}

/**
 * Clear session
 * @return {boolean} Success
 */
function DB_Session_clear() {
  const sessionId = _getSessionId();
  DB_Cache_setUser(SESSION_PREFIX + sessionId, null, 1);
  return true;
}

/**
 * Get current step in workflow
 * @return {number} Current step
 */
function DB_Session_getCurrentStep() {
  return DB_Session_getValue('currentStep', 1);
}

/**
 * Set current step
 * @param {number} step - Step number
 * @return {boolean} Success
 */
function DB_Session_setCurrentStep(step) {
  return DB_Session_setValue('currentStep', step);
}

/**
 * Get analysis state
 * @return {Object} Analysis state
 */
function DB_Session_getAnalysisState() {
  return DB_Session_getValue('analysisState', {
    status: 'idle',
    progress: 0,
    startedAt: null,
    completedAt: null
  });
}

/**
 * Update analysis state
 * @param {Object} state - State updates
 * @return {boolean} Success
 */
function DB_Session_updateAnalysisState(state) {
  const current = DB_Session_getAnalysisState();
  return DB_Session_setValue('analysisState', { ...current, ...state });
}

/**
 * Get selected competitors
 * @return {Array} Selected competitors
 */
function DB_Session_getSelectedCompetitors() {
  return DB_Session_getValue('selectedCompetitors', []);
}

/**
 * Set selected competitors
 * @param {Array} competitors - Competitors
 * @return {boolean} Success
 */
function DB_Session_setSelectedCompetitors(competitors) {
  return DB_Session_setValue('selectedCompetitors', competitors);
}

/**
 * Get session history (actions taken)
 * @return {Array} History
 */
function DB_Session_getHistory() {
  return DB_Session_getValue('history', []);
}

/**
 * Add to session history
 * @param {string} action - Action taken
 * @param {Object} data - Action data
 */
function DB_Session_addHistory(action, data) {
  const history = DB_Session_getHistory();
  history.push({
    action: action,
    data: data,
    timestamp: new Date().toISOString()
  });
  
  // Keep only last 50 entries
  if (history.length > 50) {
    history.splice(0, history.length - 50);
  }
  
  DB_Session_setValue('history', history);
}

/**
 * Check if user has license
 * @return {boolean} Has valid license
 */
function DB_Session_hasLicense() {
  const session = DB_Session_get();
  
  if (session.licenseValid !== undefined) {
    return session.licenseValid;
  }
  
  // Check license
  const licenseKey = CORE_getProperty('LICENSE_KEY');
  const isValid = _validateLicense(licenseKey);
  
  DB_Session_setValue('licenseValid', isValid);
  return isValid;
}

/**
 * Get session expiry time
 * @return {Date} Expiry time
 */
function DB_Session_getExpiry() {
  const session = DB_Session_get();
  const lastActivity = new Date(session.lastActivity);
  return new Date(lastActivity.getTime() + SESSION_TTL * 1000);
}

/**
 * Refresh session (extend TTL)
 * @return {Object} Refreshed session
 */
function DB_Session_refresh() {
  const session = DB_Session_get();
  DB_Session_save(session);
  return session;
}

// ═══════════════════════════════════════════════════════════════════════════
// PRIVATE HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get unique session ID for current user
 * @return {string} Session ID
 */
function _getSessionId() {
  try {
    const email = Session.getActiveUser().getEmail();
    if (email) {
      // Hash email for privacy
      const hash = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, email)
        .map(b => (b < 0 ? b + 256 : b).toString(16).padStart(2, '0'))
        .join('');
      return hash.substring(0, 16);
    }
  } catch (e) {}
  
  // Fallback: use script properties for anonymous session
  let anonId = PropertiesService.getUserProperties().getProperty('anon_session_id');
  if (!anonId) {
    anonId = UTIL_generateId('anon_');
    PropertiesService.getUserProperties().setProperty('anon_session_id', anonId);
  }
  return anonId;
}

/**
 * Create new session
 * @param {string} sessionId - Session ID
 * @return {Object} New session
 */
function _createSession(sessionId) {
  return {
    id: sessionId,
    createdAt: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
    currentStep: 1,
    selectedCompetitors: [],
    analysisState: {
      status: 'idle',
      progress: 0
    },
    history: [],
    preferences: {}
  };
}

/**
 * Validate license key
 * @param {string} key - License key
 * @return {boolean} Is valid
 */
function _validateLicense(key) {
  if (!key) return false;
  
  // Basic format check
  if (key.length < 10) return false;
  
  // Could add server-side validation here
  return true;
}
