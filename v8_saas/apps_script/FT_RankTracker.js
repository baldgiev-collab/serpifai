/**
 * FT_RankTracker.gs - Keyword Rank Tracking
 * SerpifAI V8 - Track keyword rankings over time
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// RANK TRACKING
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Get current ranking data
 */
function FT_getRankingData() {
  try {
    const rankings = loadRankings();
    
    return {
      ok: true,
      rankings: rankings,
      lastUpdated: getLastUpdateTime()
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Refresh all rankings
 */
function FT_refreshRankings() {
  try {
    const rankings = loadRankings();
    const updated = [];
    
    rankings.forEach(function(ranking) {
      const newPosition = checkRanking(ranking.keyword, ranking.domain);
      
      // Calculate change
      const previousPosition = ranking.position || 100;
      const change = previousPosition - newPosition;
      
      // Update history
      const history = ranking.history || [];
      history.push(newPosition);
      if (history.length > 30) history.shift();
      
      // Update best rank
      const bestRank = Math.min(ranking.bestRank || 100, newPosition);
      
      updated.push({
        keyword: ranking.keyword,
        domain: ranking.domain,
        position: newPosition,
        change: change,
        bestRank: bestRank,
        history: history,
        volume: ranking.volume || 0,
        url: ranking.url,
        lastUpdated: new Date().toISOString()
      });
    });
    
    saveRankings(updated);
    setLastUpdateTime();
    
    return {
      ok: true,
      rankings: updated,
      lastUpdated: new Date().toISOString()
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Add keyword to track
 */
function FT_addTrackedKeyword(params) {
  const keyword = params.keyword;
  const domain = params.domain || getDefaultDomain();
  
  if (!keyword) {
    return { ok: false, error: 'Keyword is required' };
  }
  
  try {
    const rankings = loadRankings();
    
    // Check if already tracked
    const exists = rankings.some(function(r) {
      return r.keyword.toLowerCase() === keyword.toLowerCase();
    });
    
    if (exists) {
      return { ok: false, error: 'Keyword already tracked' };
    }
    
    // Check initial position
    const position = checkRanking(keyword, domain);
    
    rankings.push({
      keyword: keyword,
      domain: domain,
      position: position,
      bestRank: position,
      change: 0,
      history: [position],
      volume: 0,
      addedAt: new Date().toISOString()
    });
    
    saveRankings(rankings);
    
    return { ok: true, keyword: keyword, position: position };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Remove tracked keyword
 */
function FT_removeTrackedKeyword(params) {
  const keyword = params.keyword;
  
  try {
    let rankings = loadRankings();
    
    rankings = rankings.filter(function(r) {
      return r.keyword.toLowerCase() !== keyword.toLowerCase();
    });
    
    saveRankings(rankings);
    
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// POSITION CHECKING
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Check ranking position for keyword
 */
function checkRanking(keyword, domain) {
  // Try to use Serper API
  const apiKey = getSerperKey();
  
  if (apiKey) {
    return checkRankingWithSerper(keyword, domain, apiKey);
  }
  
  // Return mock position for demo
  return mockRankPosition();
}

/**
 * Check ranking with Serper API
 */
function checkRankingWithSerper(keyword, domain, apiKey) {
  try {
    const url = 'https://google.serper.dev/search';
    
    const response = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      headers: { 'X-API-KEY': apiKey },
      payload: JSON.stringify({
        q: keyword,
        num: 100
      }),
      muteHttpExceptions: true
    });
    
    const data = JSON.parse(response.getContentText());
    const organic = data.organic || [];
    
    // Find our domain in results
    for (let i = 0; i < organic.length; i++) {
      const resultDomain = extractDomain(organic[i].link);
      if (resultDomain.indexOf(domain) >= 0 || domain.indexOf(resultDomain) >= 0) {
        return i + 1;
      }
    }
    
    return 100; // Not found in top 100
  } catch (err) {
    console.error('Serper error: ' + err.message);
    return mockRankPosition();
  }
}

/**
 * Extract domain from URL
 */
function FT_RT_extractDomain(url) {
  try {
    const match = url.match(/^https?:\/\/([^\/]+)/);
    return match ? match[1].replace('www.', '') : '';
  } catch (e) {
    return '';
  }
}

/**
 * Mock rank position for demo
 */
function mockRankPosition() {
  // Random position between 1-50 with weighted distribution
  const rand = Math.random();
  
  if (rand < 0.2) return Math.floor(Math.random() * 3) + 1; // 20% top 3
  if (rand < 0.5) return Math.floor(Math.random() * 7) + 4; // 30% 4-10
  if (rand < 0.8) return Math.floor(Math.random() * 20) + 11; // 30% 11-30
  return Math.floor(Math.random() * 70) + 31; // 20% 31-100
}

// ═══════════════════════════════════════════════════════════════════════════════════
// STORAGE
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Load rankings from storage
 */
function loadRankings() {
  try {
    const props = PropertiesService.getScriptProperties();
    const data = props.getProperty('RANK_TRACKER_DATA');
    
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Load rankings error: ' + e.message);
  }
  
  return getDefaultRankings();
}

/**
 * Save rankings to storage
 */
function saveRankings(rankings) {
  const props = PropertiesService.getScriptProperties();
  props.setProperty('RANK_TRACKER_DATA', JSON.stringify(rankings));
}

/**
 * Get default rankings for demo
 */
function getDefaultRankings() {
  return [
    { keyword: 'seo optimization tips', position: 5, change: 2, bestRank: 3, volume: 2400, history: [8, 7, 6, 5, 5] },
    { keyword: 'content marketing strategy', position: 12, change: -1, bestRank: 10, volume: 5400, history: [11, 11, 12, 11, 12] },
    { keyword: 'keyword research guide', position: 3, change: 1, bestRank: 2, volume: 3600, history: [5, 4, 4, 4, 3] },
    { keyword: 'technical seo checklist', position: 8, change: 0, bestRank: 6, volume: 1900, history: [9, 8, 9, 8, 8] },
    { keyword: 'backlink building strategies', position: 15, change: 3, bestRank: 12, volume: 2800, history: [20, 18, 18, 18, 15] }
  ];
}

/**
 * Get Serper API key
 */
function getSerperKey() {
  try {
    const props = PropertiesService.getScriptProperties();
    return props.getProperty('SERPER_API_KEY');
  } catch (e) {
    return null;
  }
}

/**
 * Get default domain
 */
function getDefaultDomain() {
  try {
    const props = PropertiesService.getScriptProperties();
    return props.getProperty('DEFAULT_DOMAIN') || 'example.com';
  } catch (e) {
    return 'example.com';
  }
}

/**
 * Get last update time
 */
function getLastUpdateTime() {
  try {
    const props = PropertiesService.getScriptProperties();
    return props.getProperty('RANK_LAST_UPDATE') || null;
  } catch (e) {
    return null;
  }
}

/**
 * Set last update time
 */
function setLastUpdateTime() {
  const props = PropertiesService.getScriptProperties();
  props.setProperty('RANK_LAST_UPDATE', new Date().toISOString());
}

// ═══════════════════════════════════════════════════════════════════════════════════
// BULK OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Import keywords to track from sheet
 */
function FT_importTrackedKeywords(sheetName) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      return { ok: false, error: 'Sheet not found' };
    }
    
    const data = sheet.getDataRange().getValues();
    let imported = 0;
    
    data.forEach(function(row, index) {
      if (index === 0) return; // Skip header
      
      const keyword = row[0];
      if (keyword) {
        const result = FT_addTrackedKeyword({ keyword: keyword });
        if (result.ok) imported++;
      }
    });
    
    return { ok: true, imported: imported };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Export rankings to sheet
 */
function FT_exportRankings(sheetName) {
  try {
    const rankings = loadRankings();
    
    const headers = ['Keyword', 'Position', 'Change', 'Best', 'Volume', 'Last Updated'];
    const rows = rankings.map(function(r) {
      return [r.keyword, r.position, r.change, r.bestRank, r.volume, r.lastUpdated || ''];
    });
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    } else {
      sheet.clear();
    }
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    if (rows.length > 0) {
      sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
    }
    
    return { ok: true, exported: rows.length };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
