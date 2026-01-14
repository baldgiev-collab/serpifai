/**
 * API Configuration Manager
 * Centralizes endpoint URLs and API keys for DataBridge and Fetcher communication
 */

/**
 * Get Fetcher Web App endpoint URL
 */
function CONFIG_getFetcherUrl() {
  var url = PropertiesService.getScriptProperties().getProperty('FETCHER_WEB_APP_URL');
  
  // Fallback to hardcoded URL if not configured
  if (!url) {
  url = 'https://script.google.com/macros/s/AKfycbx_wyL9BOcfKy63vY16oqxidGzm_4Abh70crBF76w4BfKsfCuDtlxB6BYH-a_ZNgs8x/exec';
    Logger.log('⚠️ Using hardcoded FETCHER_WEB_APP_URL. Set in Script Properties for production.');
  }
  
  return url;
}

/**
 * Get DataBridge Web App endpoint URL
 */
function CONFIG_getDataBridgeUrl() {
  var url = PropertiesService.getScriptProperties().getProperty('DATABRIDGE_WEB_APP_URL');
  
  // Fallback to hardcoded URL if not set
  if (!url) {
  url = 'https://script.google.com/macros/s/AKfycbx_wyL9BOcfKy63vY16oqxidGzm_4Abh70crBF76w4BfKsfCuDtlxB6BYH-a_ZNgs8x/exec';
    Logger.log('⚠️ Using hardcoded DATABRIDGE_WEB_APP_URL. Set in Script Properties for production.');
  }
  
  return url;
}

/**
 * Get API key for Fetcher authentication
 */
function CONFIG_getFetcherApiKey() {
  return PropertiesService.getScriptProperties().getProperty('FETCHER_API_KEY') || '';
}

/**
 * Get API key for DataBridge authentication
 */
function CONFIG_getDataBridgeApiKey() {
  return PropertiesService.getScriptProperties().getProperty('DATABRIDGE_API_KEY') || '';
}

/**
 * Set Fetcher URL (for setup scripts)
 */
function CONFIG_setFetcherUrl(url) {
  PropertiesService.getScriptProperties().setProperty('FETCHER_WEB_APP_URL', url);
  Logger.log('✅ Updated FETCHER_WEB_APP_URL');
}

/**
 * Set DataBridge URL (for setup scripts)
 */
function CONFIG_setDataBridgeUrl(url) {
  PropertiesService.getScriptProperties().setProperty('DATABRIDGE_WEB_APP_URL', url);
  Logger.log('✅ Updated DATABRIDGE_WEB_APP_URL');
}

/**
 * Initialize API configuration with provided URLs
 */
function CONFIG_initializeApiUrls() {
  var props = PropertiesService.getScriptProperties();
  
  // Set URLs if not already configured
  if (!props.getProperty('FETCHER_WEB_APP_URL')) {
    props.setProperty('FETCHER_WEB_APP_URL', 
  'https://script.google.com/macros/s/AKfycbx_wyL9BOcfKy63vY16oqxidGzm_4Abh70crBF76w4BfKsfCuDtlxB6BYH-a_ZNgs8x/exec');
  }
  
  if (!props.getProperty('DATABRIDGE_WEB_APP_URL')) {
    props.setProperty('DATABRIDGE_WEB_APP_URL', 
  'https://script.google.com/macros/s/AKfycbx_wyL9BOcfKy63vY16oqxidGzm_4Abh70crBF76w4BfKsfCuDtlxB6BYH-a_ZNgs8x/exec');
  }
  
  Logger.log('API URLs initialized successfully');
  return { ok: true, message: 'API URLs configured' };
}

/**
 * Get all API configuration (for debugging)
 */
function CONFIG_getApiConfig() {
  return {
    fetcherUrl: CONFIG_getFetcherUrl(),
    dataBridgeUrl: CONFIG_getDataBridgeUrl(),
    hasFetcherKey: !!CONFIG_getFetcherApiKey(),
    hasDataBridgeKey: !!CONFIG_getDataBridgeApiKey()
  };
}
