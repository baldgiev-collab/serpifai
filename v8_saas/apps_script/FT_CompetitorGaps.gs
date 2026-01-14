/**
 * FT_CompetitorGaps.gs - Competitor Gap Analysis
 * SerpifAI V8 - Find keyword and content gaps
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// GAP ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Analyze competitor keyword gaps
 */
function FT_analyzeCompetitorGaps(params) {
  const domain = params.domain;
  const competitors = params.competitors || [];
  
  if (!domain) {
    return { ok: false, error: 'Domain is required' };
  }
  
  if (competitors.length === 0) {
    return { ok: false, error: 'At least one competitor is required' };
  }
  
  try {
    // Get your keywords
    const yourKeywords = getKeywordsForDomain(domain);
    
    // Get competitor keywords
    const competitorKeywords = {};
    competitors.forEach(function(comp) {
      competitorKeywords[comp] = getKeywordsForDomain(comp);
    });
    
    // Find missing keywords
    const missing = findMissingKeywords(yourKeywords, competitorKeywords);
    
    // Find weak positions
    const weak = findWeakPositions(yourKeywords, competitorKeywords);
    
    // Find content gaps
    const contentGaps = findContentGaps(yourKeywords, competitorKeywords);
    
    return {
      ok: true,
      missing: missing,
      weak: weak,
      contentGaps: contentGaps
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Get keywords for a domain (mock for demo)
 */
function getKeywordsForDomain(domain) {
  // In production, would use SEO API
  // For demo, return mock data based on domain hash
  
  const hash = simpleHash(domain);
  const baseKeywords = [
    { keyword: 'seo tools', rank: 5, volume: 8100 },
    { keyword: 'keyword research', rank: 8, volume: 14800 },
    { keyword: 'backlink checker', rank: 12, volume: 22200 },
    { keyword: 'site audit', rank: 15, volume: 6600 },
    { keyword: 'rank tracker', rank: 3, volume: 5400 },
    { keyword: 'competitor analysis', rank: 7, volume: 9900 },
    { keyword: 'content optimization', rank: 20, volume: 3600 },
    { keyword: 'technical seo', rank: 11, volume: 4400 },
    { keyword: 'on-page seo', rank: 6, volume: 12100 },
    { keyword: 'local seo', rank: 25, volume: 27100 },
    { keyword: 'link building', rank: 9, volume: 18100 },
    { keyword: 'serp analysis', rank: 4, volume: 2900 }
  ];
  
  // Vary keywords based on domain hash
  return baseKeywords
    .filter(function(_, i) { return (hash + i) % 3 !== 0; })
    .map(function(kw) {
      return {
        keyword: kw.keyword,
        rank: Math.max(1, kw.rank + (hash % 10) - 5),
        volume: kw.volume
      };
    });
}

/**
 * Simple hash for demo variation
 */
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * Find keywords competitors have that you don't
 */
function findMissingKeywords(yourKeywords, competitorKeywords) {
  const yourSet = {};
  yourKeywords.forEach(function(kw) {
    yourSet[kw.keyword.toLowerCase()] = true;
  });
  
  const missing = [];
  const seen = {};
  
  Object.keys(competitorKeywords).forEach(function(comp) {
    competitorKeywords[comp].forEach(function(kw) {
      const kwLower = kw.keyword.toLowerCase();
      
      if (!yourSet[kwLower] && !seen[kwLower]) {
        seen[kwLower] = true;
        
        // Count how many competitors have this keyword
        let count = 0;
        Object.keys(competitorKeywords).forEach(function(c) {
          if (competitorKeywords[c].some(function(k) { return k.keyword.toLowerCase() === kwLower; })) {
            count++;
          }
        });
        
        missing.push({
          keyword: kw.keyword,
          volume: kw.volume,
          difficulty: estimateDifficulty(kw.keyword, kw.volume),
          competitorCount: count
        });
      }
    });
  });
  
  // Sort by opportunity (volume * (100 - difficulty))
  return missing.sort(function(a, b) {
    const oppA = a.volume * (100 - a.difficulty);
    const oppB = b.volume * (100 - b.difficulty);
    return oppB - oppA;
  });
}

/**
 * Find keywords where competitors rank better
 */
function findWeakPositions(yourKeywords, competitorKeywords) {
  const weak = [];
  
  yourKeywords.forEach(function(kw) {
    const kwLower = kw.keyword.toLowerCase();
    let bestCompRank = 100;
    let bestComp = '';
    
    Object.keys(competitorKeywords).forEach(function(comp) {
      const compKw = competitorKeywords[comp].find(function(k) {
        return k.keyword.toLowerCase() === kwLower;
      });
      
      if (compKw && compKw.rank < bestCompRank) {
        bestCompRank = compKw.rank;
        bestComp = comp;
      }
    });
    
    // If competitor ranks at least 3 positions better
    if (bestCompRank < kw.rank - 2) {
      weak.push({
        keyword: kw.keyword,
        yourRank: kw.rank,
        bestCompetitorRank: bestCompRank,
        bestCompetitor: bestComp,
        gap: kw.rank - bestCompRank,
        volume: kw.volume
      });
    }
  });
  
  // Sort by gap size
  return weak.sort(function(a, b) { return b.gap - a.gap; });
}

/**
 * Estimate keyword difficulty
 */
function estimateDifficulty(keyword, volume) {
  // Simple heuristic based on volume
  let base = 30;
  
  if (volume > 50000) base = 70;
  else if (volume > 20000) base = 55;
  else if (volume > 10000) base = 45;
  else if (volume > 5000) base = 35;
  
  // Add randomness
  return base + Math.floor(Math.random() * 15);
}

/**
 * Find content gaps (topics competitors cover)
 */
function findContentGaps(yourKeywords, competitorKeywords) {
  // Identify topic clusters from competitor keywords
  const topicPatterns = {
    'How-to Guides': ['how to', 'guide', 'tutorial', 'step by step'],
    'Tool Comparisons': ['vs', 'versus', 'alternative', 'comparison'],
    'Best Lists': ['best', 'top 10', 'top 5'],
    'Beginner Content': ['beginner', 'basics', 'what is', 'introduction'],
    'Case Studies': ['case study', 'example', 'success story']
  };
  
  const gaps = [];
  const yourKwSet = yourKeywords.map(function(k) { return k.keyword.toLowerCase(); });
  
  // Collect all competitor keywords
  const allCompKws = [];
  Object.keys(competitorKeywords).forEach(function(comp) {
    competitorKeywords[comp].forEach(function(kw) {
      if (yourKwSet.indexOf(kw.keyword.toLowerCase()) < 0) {
        allCompKws.push(kw.keyword.toLowerCase());
      }
    });
  });
  
  // Check each topic pattern
  Object.keys(topicPatterns).forEach(function(topic) {
    const patterns = topicPatterns[topic];
    const matchingKws = allCompKws.filter(function(kw) {
      return patterns.some(function(p) { return kw.indexOf(p) >= 0; });
    });
    
    if (matchingKws.length >= 2) {
      gaps.push({
        topic: topic,
        description: 'Competitors are ranking for ' + matchingKws.length + ' keywords in this category',
        keywords: matchingKws.slice(0, 5)
      });
    }
  });
  
  return gaps;
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SPECIFIC GAP REPORTS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Get quick wins (low difficulty, high volume gaps)
 */
function FT_getQuickWins(params) {
  const result = FT_analyzeCompetitorGaps(params);
  
  if (!result.ok) return result;
  
  const quickWins = (result.missing || []).filter(function(kw) {
    return kw.difficulty < 40 && kw.volume > 1000;
  });
  
  return {
    ok: true,
    quickWins: quickWins,
    count: quickWins.length
  };
}

/**
 * Get high value gaps (high volume regardless of difficulty)
 */
function FT_getHighValueGaps(params) {
  const result = FT_analyzeCompetitorGaps(params);
  
  if (!result.ok) return result;
  
  const highValue = (result.missing || []).filter(function(kw) {
    return kw.volume > 5000;
  }).sort(function(a, b) { return b.volume - a.volume; });
  
  return {
    ok: true,
    highValueGaps: highValue,
    count: highValue.length,
    totalVolume: highValue.reduce(function(s, k) { return s + k.volume; }, 0)
  };
}

/**
 * Get overlap analysis
 */
function FT_getKeywordOverlap(params) {
  const domain = params.domain;
  const competitors = params.competitors || [];
  
  try {
    const yourKeywords = getKeywordsForDomain(domain);
    const yourSet = {};
    yourKeywords.forEach(function(kw) {
      yourSet[kw.keyword.toLowerCase()] = true;
    });
    
    const overlap = {};
    
    competitors.forEach(function(comp) {
      const compKws = getKeywordsForDomain(comp);
      let shared = 0;
      let compOnly = 0;
      
      compKws.forEach(function(kw) {
        if (yourSet[kw.keyword.toLowerCase()]) {
          shared++;
        } else {
          compOnly++;
        }
      });
      
      overlap[comp] = {
        shared: shared,
        competitorOnly: compOnly,
        total: compKws.length,
        overlapPercent: Math.round((shared / compKws.length) * 100)
      };
    });
    
    return {
      ok: true,
      yourKeywordCount: yourKeywords.length,
      overlap: overlap
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Export gap analysis to sheet
 */
function FT_exportGapAnalysis(params) {
  const result = FT_analyzeCompetitorGaps(params);
  
  if (!result.ok) return result;
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Missing keywords sheet
    let sheet = ss.getSheetByName('Missing Keywords');
    if (!sheet) sheet = ss.insertSheet('Missing Keywords');
    else sheet.clear();
    
    const headers = ['Keyword', 'Volume', 'Difficulty', 'Competitors With'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    
    const rows = (result.missing || []).map(function(kw) {
      return [kw.keyword, kw.volume, kw.difficulty, kw.competitorCount];
    });
    
    if (rows.length > 0) {
      sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
    }
    
    return { ok: true, exported: rows.length };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
