/**
 * Fetch a single URL and return HTML content
 * @param {string} url - The URL to fetch
 * @return {object} Response object with html, status, headers
 */
function FET_fetchSingleUrl(url) {
  if (!url) {
    return { ok: false, error: 'URL is required' };
  }
  
  // Validate URL format
  if (!url.match(/^https?:\/\//i)) {
    return { ok: false, error: 'Invalid URL format. Must start with http:// or https://' };
  }
  
  try {
    var response = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      followRedirects: true,
      validateHttpsCertificates: false,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SERPIFAI Bot/2.1; +https://serpifai.com)'
      }
    });
    
    var statusCode = response.getResponseCode();
    var html = response.getContentText();
    var headers = response.getHeaders();
    
    return {
      ok: statusCode >= 200 && statusCode < 300,
      status: statusCode,
      html: html,
      headers: headers,
      url: url,
      finalUrl: headers['Location'] || url,
      contentType: headers['Content-Type'] || '',
      contentLength: html.length,
      error: statusCode >= 400 ? 'HTTP ' + statusCode : null
    };
  } catch (e) {
    return {
      ok: false,
      error: String(e),
      url: url,
      status: 0
    };
  }
}
