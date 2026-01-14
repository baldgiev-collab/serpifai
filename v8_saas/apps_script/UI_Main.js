/**
 * ═══════════════════════════════════════════════════════════════════════════
 * UI_Main.gs - UI MAIN ENTRY POINT
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * SerpifAI v8.0.0 - Main UI controller and menu setup
 * 
 * @module UI_Main
 * @version 8.0.0
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Apps Script entry point - runs when spreadsheet opens
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  
  ui.createMenu('🚀 SerpifAI Elite')
    .addItem('🎯 Open Dashboard', 'UI_showDashboard')
    .addItem('📊 Start Analysis', 'UI_showAnalysis')
    .addSeparator()
    .addSubMenu(ui.createMenu('⚙️ Settings')
      .addItem('🔑 Configure API Keys', 'UI_showApiConfig')
      .addItem('📋 License Management', 'UI_showLicense')
      .addItem('🔄 Clear Cache', 'UI_clearCache'))
    .addSubMenu(ui.createMenu('📈 Reports')
      .addItem('Keyword Report', 'UI_showKeywordReport')
      .addItem('Competitor Report', 'UI_showCompetitorReport')
      .addItem('Export All Data', 'UI_exportData'))
    .addSeparator()
    .addItem('❓ Help & Documentation', 'UI_showHelp')
    .addItem('ℹ️ About SerpifAI', 'UI_showAbout')
    .addToUi();
  
  LOG_info('UI_Main', 'Menu created');
}

/**
 * Show main dashboard sidebar (Full V7 UI)
 */
function UI_showDashboard() {
  const html = HtmlService.createTemplateFromFile('UI_Dashboard_Full')
    .evaluate()
    .setTitle('SerpifAI Elite — Architect of Authority');
  
  SpreadsheetApp.getUi().showSidebar(html);
}

/**
 * Show analysis modal
 */
function UI_showAnalysis() {
  const html = HtmlService.createHtmlOutputFromFile('UI_Analysis')
    .setWidth(800)
    .setHeight(600);
  
  SpreadsheetApp.getUi().showModalDialog(html, 'Start New Analysis');
}

/**
 * Show API configuration
 */
function UI_showApiConfig() {
  const html = HtmlService.createHtmlOutputFromFile('UI_ApiConfig')
    .setWidth(500)
    .setHeight(400);
  
  SpreadsheetApp.getUi().showModalDialog(html, 'Configure API Keys');
}

/**
 * Show license management
 */
function UI_showLicense() {
  const html = HtmlService.createHtmlOutputFromFile('UI_License')
    .setWidth(500)
    .setHeight(300);
  
  SpreadsheetApp.getUi().showModalDialog(html, 'License Management');
}

/**
 * Clear all caches
 */
function UI_clearCache() {
  DB_Cache_clearAll();
  SpreadsheetApp.getUi().alert('✅ Cache cleared successfully!');
}

/**
 * Show keyword report
 */
function UI_showKeywordReport() {
  const html = HtmlService.createHtmlOutputFromFile('UI_KeywordReport')
    .setWidth(900)
    .setHeight(700);
  
  SpreadsheetApp.getUi().showModalDialog(html, 'Keyword Report');
}

/**
 * Show competitor report
 */
function UI_showCompetitorReport() {
  const html = HtmlService.createHtmlOutputFromFile('UI_CompetitorReport')
    .setWidth(900)
    .setHeight(700);
  
  SpreadsheetApp.getUi().showModalDialog(html, 'Competitor Report');
}

/**
 * Export all data
 */
function UI_exportData() {
  const result = DB_exportAll();
  
  if (CORE_isError(result)) {
    SpreadsheetApp.getUi().alert('❌ Export failed: ' + result.message);
    return;
  }
  
  const json = JSON.stringify(result.data, null, 2);
  const blob = Utilities.newBlob(json, 'application/json', 'serpifai_export.json');
  const file = DriveApp.createFile(blob);
  
  SpreadsheetApp.getUi().alert(
    '✅ Data exported successfully!\n\n' +
    'File: ' + file.getName() + '\n' +
    'Location: Google Drive root folder'
  );
}

/**
 * Show help documentation
 */
function UI_showHelp() {
  const html = HtmlService.createHtmlOutputFromFile('UI_Help')
    .setWidth(700)
    .setHeight(500);
  
  SpreadsheetApp.getUi().showModalDialog(html, 'SerpifAI Help & Documentation');
}

/**
 * Show about dialog
 */
function UI_showAbout() {
  const buildInfo = CORE_getBuildInfo();
  
  SpreadsheetApp.getUi().alert(
    '🚀 SerpifAI Elite Intelligence Engine\n\n' +
    'Version: ' + buildInfo.version + '\n' +
    'Build: ' + buildInfo.build + '\n' +
    'Runtime: ' + buildInfo.runtime + '\n' +
    'Modules: ' + buildInfo.modules + '\n\n' +
    'The AI-Powered SEO Intelligence Platform\n' +
    '© 2026 SerpifAI'
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CLIENT-CALLABLE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get dashboard data (called from client)
 * @return {Object} Dashboard data
 */
function UI_getDashboardData() {
  const session = DB_Session_get();
  const keywordStats = DB_Keywords_getStats();
  const competitorStats = DB_Competitors_getStats();
  const fetchStatus = FT_GetStatus();
  
  return {
    session: session,
    keywords: CORE_isError(keywordStats) ? {} : keywordStats.data,
    competitors: CORE_isError(competitorStats) ? {} : competitorStats.data,
    fetchStatus: fetchStatus,
    version: CORE_getVersion()
  };
}

/**
 * Get API configuration status (called from client)
 * @return {Object} API config status
 */
function UI_getApiStatus() {
  return CORE_validateApiKeys();
}

/**
 * Save API keys (called from client)
 * @param {Object} keys - API keys to save
 * @return {Object} Save result
 */
function UI_saveApiKeys(keys) {
  try {
    const props = PropertiesService.getScriptProperties();
    
    if (keys.gemini) props.setProperty('GEMINI_API_KEY', keys.gemini);
    if (keys.serper) props.setProperty('SERPER_API_KEY', keys.serper);
    if (keys.pageSpeed) props.setProperty('PAGE_SPEED_API_KEY', keys.pageSpeed);
    if (keys.openPageRank) props.setProperty('OPEN_PAGERANK_API_KEY', keys.openPageRank);
    if (keys.license) props.setProperty('LICENSE_KEY', keys.license);
    
    LOG_info('UI_Main', 'API keys saved');
    return { success: true };
  } catch (error) {
    return CORE_handleError('UI_Main', 'saveApiKeys', error);
  }
}

/**
 * Start analysis (called from client)
 * @param {Object} options - Analysis options
 * @return {Object} Start result
 */
function UI_startAnalysis(options) {
  LOG_info('UI_Main', 'Starting analysis', options);
  
  const competitors = options.competitors || [];
  const geminiData = options.geminiData || {};
  
  // Update session
  DB_Session_setSelectedCompetitors(competitors);
  DB_Session_updateAnalysisState({ status: 'running', startedAt: new Date().toISOString() });
  DB_Session_addHistory('start_analysis', { competitors: competitors.length });
  
  // Start fetch
  const result = FT_StartFetch(competitors, geminiData);
  
  return result;
}

/**
 * Get analysis progress (called from client)
 * @return {Object} Progress data
 */
function UI_getAnalysisProgress() {
  return FT_GetStatus();
}

/**
 * Pause analysis (called from client)
 * @return {Object} Pause result
 */
function UI_pauseAnalysis() {
  DB_Session_updateAnalysisState({ status: 'paused' });
  return FT_PauseFetch();
}

/**
 * Resume analysis (called from client)
 * @return {Object} Resume result
 */
function UI_resumeAnalysis() {
  DB_Session_updateAnalysisState({ status: 'running' });
  return FT_ResumeFetch();
}

/**
 * Get keywords for display (called from client)
 * @param {Object} options - Query options
 * @return {Object} Keywords
 */
function UI_getKeywords(options) {
  return DB_Keywords_getAll(options);
}

/**
 * Get competitors for display (called from client)
 * @param {Object} options - Query options
 * @return {Object} Competitors
 */
function UI_getCompetitors(options) {
  return DB_Competitors_getAll(options);
}
