/**
 * ═══════════════════════════════════════════════════════════════════════════
 * QUICK FIX: V6 Forensic Scan Handler (Minimal Version)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * DEPLOYMENT: Copy this entire file to your Fetcher Apps Script project
 * 
 * This adds the `fetch:fullScan` action to fetcher_router.gs
 * 
 * @module QuickV6Handler
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * ADD THIS CASE TO YOUR fetcher_router.gs FET_handle() function:
 * 
 * case 'fetch:fullScan':
 * case 'forensic':
 *   result = FET_quickForensicScan(payload.url, payload.competitorUrls || []);
 *   break;
 */

/**
 * Quick forensic scan - returns basic structure with real data
 * This is a temporary solution until you deploy the full V6 engine
 */
function FET_quickForensicScan(url, competitorUrls) {
  if (!url) {
    return { ok: false, error: 'URL required' };
  }
  
  try {
    // Fetch HTML
    var response = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      followRedirects: true,
      validateHttpsCertificates: false
    });
    
    var html = response.getContentText();
    var headers = response.getHeaders();
    
    // Load Cheerio
    var Cheerio = CheerioApp.load(html);
    var $ = Cheerio.load(html);
    
    // Extract basic data
    var title = $('title').text() || '';
    var h1 = $('h1').first().text() || '';
    var h1Count = $('h1').length;
    var bodyText = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 1500);
    
    // Count form fields (friction score)
    var formFields = $('input[type="text"], input[type="email"], input[type="tel"], input[type="number"], textarea, select').length;
    var frictionScore = formFields;
    var frictionLevel = formFields < 5 ? 'Low' : (formFields < 10 ? 'Medium' : 'High');
    
    // Detect CMS
    var cms = 'Unknown';
    if (html.indexOf('wp-content') > -1) cms = 'WordPress';
    else if (html.indexOf('shopify') > -1) cms = 'Shopify';
    else if (html.indexOf('webflow') > -1) cms = 'Webflow';
    
    // Calculate humanity score (simple version - sentence length variance)
    var sentences = bodyText.split(/[.!?]+/).filter(function(s) { return s.trim().length > 10; });
    var lengths = sentences.map(function(s) { return s.trim().split(/\s+/).length; });
    var avgLength = lengths.reduce(function(a, b) { return a + b; }, 0) / lengths.length || 0;
    var variance = lengths.reduce(function(sum, len) { 
      return sum + Math.pow(len - avgLength, 2);
    }, 0) / lengths.length || 0;
    var humanityScore = Math.min(100, Math.round(Math.sqrt(variance) * 2));
    
    // Security headers
    var securityHeaders = {
      xFrameOptions: headers['X-Frame-Options'] || headers['x-frame-options'] || 'None',
      hsts: headers['Strict-Transport-Security'] || headers['strict-transport-security'] ? 'true' : 'false'
    };
    
    // Build V6 forensic response
    var forensics = {
      // Category I: Market Intelligence
      market_intel: {
        cms: cms,
        tech_stack: [],
        brand_text: bodyText
      },
      
      // Category II: Brand Positioning
      brand_pos: {
        eeat_schema: [],
        trust_signals: []
      },
      
      // Category III: Technical SEO
      technical: {
        security_headers: securityHeaders,
        indexability: 'Unknown'
      },
      
      // Category IV: Content Intelligence
      content_intel: {
        humanity_score: humanityScore,
        velocity_30d: 0,
        uniqueness_score: 0
      },
      
      // Category V: Structure
      structure: {
        h1_count: h1Count,
        hierarchy_valid: h1Count === 1
      },
      
      // Category VI: Systems
      systems: {
        automation_tools: [],
        chat_widget: false
      },
      
      // Category VII: Conversion
      conversion: {
        friction_score: frictionScore,
        friction_level: frictionLevel,
        pricing_detected: false,
        tripwire_links: []
      }
    };
    
    return {
      ok: true,
      forensics: forensics
    };
    
  } catch (e) {
    return {
      ok: false,
      error: 'Forensic scan failed: ' + e
    };
  }
}
