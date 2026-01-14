/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * FT_PARSER.GS - FORENSIC TRAFFIC PARSER
 * Data Normalization Engine for Bento-Grid UI Rendering
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * PURPOSE:
 * - Normalizes raw JSON into Scalar Coordinates (X, Y, Mass)
 * - Outputs a Master_Reservoir JSON matching the UI Payload schema
 * - Provides grouped data for Virtualized Grid rendering
 * 
 * SCALAR MATH:
 * - Mass (Size) = (Competitor_Traffic / Total_Market_Share) * 100
 * - X (Intent Velocity) = Transactional Weighting (0-100)
 * - Y (Authority Gap) = Competitor_DA relative to Our_DA
 * 
 * OUTPUT SCHEMA:
 * { kw, ui_cat: "money|sge|tail|llm", clash, aio_risk, x, y, mass, moat_type, tip }
 * 
 * @author SerpifAI Engineering
 * @version 2.0.0
 */

// ═══════════════════════════════════════════════════════════════════════════════
// PARSER CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const PARSER_CONFIG = {
  // Scalar Coordinate Ranges
  X_RANGE: { min: 0, max: 100 },      // Intent Velocity (Transactional → Informational)
  Y_RANGE: { min: 1, max: 10 },        // Authority Gap (Competitive → Uncontested)
  MASS_RANGE: { min: 1, max: 30 },     // Market Mass (% of total traffic)
  
  // Intent Weights for X-Coordinate
  INTENT_WEIGHTS: {
    transactional: 1.0,    // Highest X (rightmost)
    commercial: 0.5,       // Middle-right
    navigational: 0.0,     // Middle
    informational: -0.5    // Lowest X (leftmost)
  },
  
  // Module Categories
  MODULES: {
    money: { label: 'Money Moat', icon: '💰', color: '#22c55e', count: 15 },
    sge: { label: 'SGE/AIO Survival', icon: '🛡️', color: '#3b82f6', count: 30 },
    tail: { label: 'Long-Tail Velocity', icon: '🚀', color: '#f59e0b', count: 30 },
    llm: { label: 'LLM Citation Gaps', icon: '🤖', color: '#8b5cf6', count: 15 }
  },
  
  // Our baseline authority (configurable)
  OUR_DOMAIN_AUTHORITY: 35
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PARSER CLASS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * ForensicTrafficParser - Normalizes raw data into UI-ready format
 */
class ForensicTrafficParser {
  constructor(ourDA = PARSER_CONFIG.OUR_DOMAIN_AUTHORITY) {
    this.ourDA = ourDA;
    this.totalMarketTraffic = 0;
    this.coordinateMap = new Map(); // For collision detection
  }
  
  /**
   * Parse raw reservoir data into Master_Reservoir format
   * @param {Object} rawReservoir - Raw data from FT_Fetcher
   * @param {Array} competitors - Competitor metadata
   * @returns {Object} Normalized Master_Reservoir
   */
  parseReservoir(rawReservoir, competitors) {
    console.log('🔄 FT_Parser: Beginning data normalization...');
    
    // Ensure inputs are valid
    const safeReservoir = rawReservoir || { keywords: [] };
    const safeCompetitors = Array.isArray(competitors) && competitors.length > 0 
      ? competitors 
      : [{ domain: 'ahrefs.com' }, { domain: 'semrush.com' }, { domain: 'surferseo.com' }, { domain: 'jasper.com' }, { domain: 'moz.com' }];
    
    // Calculate total market traffic for Mass computation
    this.totalMarketTraffic = this._calculateTotalMarketTraffic(safeCompetitors);
    console.log(`   📊 Total Market Traffic: ${this.totalMarketTraffic.toLocaleString()}`);
    
    // Parse raw keywords
    const rawKeywords = safeReservoir.keywords || [];
    console.log(`   📝 Processing ${rawKeywords.length} raw keywords...`);
    
    // Normalize each keyword
    const normalizedKeywords = rawKeywords.map((kw, idx) => {
      return this._normalizeKeyword(kw, safeCompetitors, idx);
    });
    
    // Group by module
    const groupedByModule = this._groupByModule(normalizedKeywords);
    
    // Group by competitor
    const groupedByCompetitor = this._groupByCompetitor(normalizedKeywords);
    
    // Calculate aggregate KPIs (use safeCompetitors to prevent undefined errors)
    const kpis = this._calculateKPIs(normalizedKeywords, safeCompetitors);
    
    // Build Master Reservoir
    const masterReservoir = {
      version: '2.0.0',
      generatedAt: new Date().toISOString(),
      schema: 'ui_payload_v2',
      
      // Aggregate KPIs for Bento Cards
      kpis: kpis,
      
      // Complete keyword list (UI Payload format)
      ui_payload: normalizedKeywords,
      
      // Grouped views for tabbed navigation
      modules: groupedByModule,
      
      // Competitor-centric view
      competitors: groupedByCompetitor,
      
      // Statistics
      stats: {
        total: normalizedKeywords.length,
        byModule: {
          money: groupedByModule.money?.length || 0,
          sge: groupedByModule.sge?.length || 0,
          tail: groupedByModule.tail?.length || 0,
          llm: groupedByModule.llm?.length || 0
        },
        avgClash: this._calculateAverage(normalizedKeywords, 'clash'),
        avgAioRisk: this._calculateAverage(normalizedKeywords, 'aio_risk'),
        totalMass: normalizedKeywords.reduce((sum, kw) => sum + (kw.mass || 0), 0)
      }
    };
    
    console.log('   ✅ Master Reservoir generated successfully');
    console.log(`      - Total Keywords: ${masterReservoir.stats.total}`);
    console.log(`      - Money: ${masterReservoir.stats.byModule.money}, SGE: ${masterReservoir.stats.byModule.sge}`);
    console.log(`      - Tail: ${masterReservoir.stats.byModule.tail}, LLM: ${masterReservoir.stats.byModule.llm}`);
    
    return masterReservoir;
  }
  
  /**
   * Parse a single keyword into UI payload format
   * @param {Object} rawKw - Raw keyword object
   * @param {Array} competitors - Competitor metadata
   * @param {number} index - Index for coordinate displacement
   * @returns {Object} Normalized keyword
   */
  _normalizeKeyword(rawKw, competitors, index) {
    // Find competitor data
    const compData = this._findCompetitor(rawKw.competitor, competitors);
    
    // Calculate Scalar Coordinates
    const x = this._calculateX(rawKw, index);
    const y = this._calculateY(rawKw, compData);
    const mass = this._calculateMass(rawKw, compData);
    
    // Ensure no coordinate collision
    const adjustedCoords = this._adjustForCollision(x, y, index);
    
    // Calculate clash and AIO risk if not present
    const clash = rawKw.clash || this._calculateClash(rawKw, compData);
    const aioRisk = rawKw.aio_risk || this._calculateAioRisk(rawKw);
    
    // Generate tip if not present
    const moatType = rawKw.moat_type || compData.moat?.type || 'Content';
    const tip = rawKw.tip || this._generateTip(rawKw.kw, clash, aioRisk, moatType);
    
    return {
      // Core fields (UI Payload Schema)
      kw: rawKw.kw || rawKw.keyword || '',
      ui_cat: rawKw.ui_cat || 'money',
      clash: clash,
      aio_risk: aioRisk,
      x: adjustedCoords.x,
      y: adjustedCoords.y,
      mass: mass,
      moat_type: moatType,
      tip: tip,
      
      // Extended fields for detailed views
      meta: {
        competitor: rawKw.competitor,
        compIndex: rawKw.compIndex,
        volume: rawKw.volume || 0,
        difficulty: rawKw.difficulty || 50,
        cpc: rawKw.cpc || '0.00',
        trend: rawKw.trend || 'stable',
        intent: rawKw.intent || this._inferIntent(rawKw.ui_cat),
        source: rawKw.source || 'generated',
        fetchedAt: rawKw.fetchedAt,
        serpFeatures: rawKw.serp_features || []
      }
    };
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // SCALAR MATH FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Calculate X-Coordinate (Intent Velocity)
   * Formula: X = (Transactional * 1.0) + (Commercial * 0.5) - (Informational * 0.5)
   * Normalized to 0-100 range
   */
  _calculateX(kw, index) {
    const intent = kw.intent?.toLowerCase() || this._inferIntent(kw.ui_cat);
    const weights = PARSER_CONFIG.INTENT_WEIGHTS;
    
    // Base X from intent
    let baseX = 50; // Default middle
    if (intent === 'transactional') baseX = 80;
    else if (intent === 'commercial') baseX = 65;
    else if (intent === 'navigational') baseX = 50;
    else if (intent === 'informational') baseX = 30;
    
    // Module-based adjustment
    const moduleAdjust = {
      money: 15,   // Push right (high intent)
      sge: 0,      // Neutral
      tail: -10,   // Push left (informational)
      llm: 5       // Slightly right
    };
    
    baseX += moduleAdjust[kw.ui_cat] || 0;
    
    // Add variance for visual distribution
    const variance = (index % 20) - 10; // -10 to +10
    
    // Clamp to range
    return Math.max(
      PARSER_CONFIG.X_RANGE.min,
      Math.min(PARSER_CONFIG.X_RANGE.max, Math.round(baseX + variance))
    );
  }
  
  /**
   * Calculate Y-Coordinate (Authority Gap)
   * Formula: Y = (Competitor_Auth - Our_Auth) / 10
   * Higher Y = easier opportunity (less competition)
   */
  _calculateY(kw, compData) {
    const competitorDA = compData.da || compData.domainAuthority || 60;
    const ourDA = this.ourDA;
    
    // Authority gap: positive means competitor is stronger
    const authGap = (competitorDA - ourDA) / 10;
    
    // Invert for Y: higher Y = easier (less authority gap to overcome)
    // Gap of 0 = Y of 5 (middle)
    // Gap of +50 = Y of 1 (very hard)
    // Gap of -30 = Y of 8 (easy)
    let baseY = 5 - authGap;
    
    // Module-based adjustment
    const moduleAdjust = {
      money: -1,   // Money keywords are harder
      sge: 0,      // Neutral
      tail: 2,     // Long-tail easier
      llm: 1       // LLM slightly easier (new territory)
    };
    
    baseY += moduleAdjust[kw.ui_cat] || 0;
    
    // Difficulty-based adjustment
    const difficulty = kw.difficulty || 50;
    if (difficulty > 70) baseY -= 1;
    else if (difficulty < 30) baseY += 1;
    
    // Clamp to range
    return Math.max(
      PARSER_CONFIG.Y_RANGE.min,
      Math.min(PARSER_CONFIG.Y_RANGE.max, Math.round(baseY * 10) / 10)
    );
  }
  
  /**
   * Calculate Mass (Market Share Size)
   * Formula: Mass = (Competitor_Traffic / Total_Market_Traffic) * 100
   */
  _calculateMass(kw, compData) {
    const compTraffic = compData.traffic || compData.organicTraffic || 50000;
    
    // Base mass from traffic share
    let baseMass = (compTraffic / this.totalMarketTraffic) * 100;
    
    // Volume-based scaling
    const volume = kw.volume || 1000;
    const volumeScale = Math.log10(volume + 1) / 4; // 0.25 to 1.25
    baseMass *= volumeScale;
    
    // Module-based scaling
    const moduleScale = {
      money: 1.5,   // Money terms are bigger
      sge: 1.0,     // Normal
      tail: 0.6,    // Long-tail smaller
      llm: 0.8      // LLM medium
    };
    
    baseMass *= moduleScale[kw.ui_cat] || 1.0;
    
    // Clamp to range
    return Math.max(
      PARSER_CONFIG.MASS_RANGE.min,
      Math.min(PARSER_CONFIG.MASS_RANGE.max, Math.round(baseMass * 10) / 10)
    );
  }
  
  /**
   * Calculate Clash Score (Competition Intensity)
   * Range: 1-10
   */
  _calculateClash(kw, compData) {
    let base = 5;
    
    // Moat-based adjustment
    const moat = compData.moat?.type || 'Content';
    if (moat === 'Brand') base += 3;
    else if (moat === 'Authority') base += 2;
    else if (moat === 'Technical') base += 1;
    
    // Difficulty adjustment
    const difficulty = kw.difficulty || 50;
    base += (difficulty - 50) / 20;
    
    // Volume adjustment (higher volume = more competition)
    const volume = kw.volume || 1000;
    if (volume > 10000) base += 1;
    else if (volume < 500) base -= 1;
    
    return Math.max(1, Math.min(10, Math.round(base)));
  }
  
  /**
   * Calculate AIO Risk (AI Overview Cannibalization)
   * Range: 1-10
   */
  _calculateAioRisk(kw) {
    let base = 5;
    
    // Intent-based risk
    const intent = kw.intent?.toLowerCase() || this._inferIntent(kw.ui_cat);
    if (intent === 'informational') base += 3;
    else if (intent === 'navigational') base += 2;
    else if (intent === 'commercial') base += 0;
    else if (intent === 'transactional') base -= 2;
    
    // Question keywords have high AIO risk
    const kwText = kw.kw?.toLowerCase() || '';
    if (/^(what|how|why|when|where|who|is|can|does)/i.test(kwText)) {
      base += 2;
    }
    
    // Module adjustment
    if (kw.ui_cat === 'llm') base += 2; // LLM keywords intentionally target AIO
    else if (kw.ui_cat === 'sge') base -= 2; // SGE keywords are AIO-resistant
    
    return Math.max(1, Math.min(10, Math.round(base)));
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // COLLISION DETECTION & ADJUSTMENT
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Adjust coordinates to prevent visual overlap
   */
  _adjustForCollision(x, y, index) {
    const key = `${Math.round(x)},${Math.round(y * 10) / 10}`;
    
    if (this.coordinateMap.has(key)) {
      // Apply displacement
      const offset = (index % 4) - 2; // -2 to +2
      x += offset * 3;
      y += (index % 3 - 1) * 0.5;
      
      // Re-clamp
      x = Math.max(PARSER_CONFIG.X_RANGE.min, Math.min(PARSER_CONFIG.X_RANGE.max, x));
      y = Math.max(PARSER_CONFIG.Y_RANGE.min, Math.min(PARSER_CONFIG.Y_RANGE.max, y));
    }
    
    // Store this coordinate
    this.coordinateMap.set(`${Math.round(x)},${Math.round(y * 10) / 10}`, true);
    
    return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // KPI CALCULATIONS (For Bento Cards)
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Calculate aggregate KPIs for Bento-Grid top row
   */
  _calculateKPIs(keywords, competitors) {
    // Ensure competitors is a valid array
    const safeCompetitors = Array.isArray(competitors) && competitors.length > 0
      ? competitors
      : [{ domain: 'ahrefs.com', traffic: 50000 }, { domain: 'semrush.com', traffic: 50000 }];
    
    // 1. Market Mass - Total addressable traffic
    const totalTraffic = safeCompetitors.reduce((sum, c) => {
      return sum + (c.synthesized?.traffic?.organic || c.traffic || 50000);
    }, 0);
    const marketMassTrend = totalTraffic > 1000000 ? 'up' : 'stable';
    
    // 2. AIO Click-Risk - Average across all keywords
    const avgAioRisk = this._calculateAverage(keywords, 'aio_risk');
    const aioRiskLevel = avgAioRisk >= 7 ? 'HIGH' : avgAioRisk >= 4 ? 'MODERATE' : 'LOW';
    
    // 3. Topical Salience - Semantic cluster strength
    const uniqueIntents = new Set(keywords.map(k => k.meta?.intent || 'commercial'));
    const salience = Math.min(100, (uniqueIntents.size / 4) * 100 + keywords.length / 5);
    
    // 4. Volatility Index - SERP stability
    const avgDifficulty = this._calculateAverage(keywords.map(k => ({ diff: k.meta?.difficulty || 50 })), 'diff');
    const volatility = Math.round((100 - avgDifficulty) / 10);
    
    return {
      marketMass: {
        value: totalTraffic,
        formatted: this._formatNumber(totalTraffic),
        trend: marketMassTrend,
        tooltip: `Total addressable organic traffic across ${safeCompetitors.length} competitors`
      },
      aioClickRisk: {
        value: Math.round(avgAioRisk * 10) / 10,
        level: aioRiskLevel,
        color: aioRiskLevel === 'HIGH' ? '#ef4444' : aioRiskLevel === 'MODERATE' ? '#f59e0b' : '#22c55e',
        tooltip: 'Average AI Overview cannibalization risk (1-10 scale)'
      },
      topicalSalience: {
        value: Math.round(salience),
        formatted: `${Math.round(salience)}%`,
        tooltip: 'Semantic cluster strength and topical authority potential'
      },
      volatilityIndex: {
        value: volatility,
        formatted: `${volatility}/10`,
        level: volatility >= 7 ? 'HIGH' : volatility >= 4 ? 'MODERATE' : 'LOW',
        tooltip: 'SERP stability metric - higher = more volatile (opportunity)'
      }
    };
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // GROUPING FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Group keywords by module (Money, SGE, Tail, LLM)
   */
  _groupByModule(keywords) {
    const groups = {
      money: [],
      sge: [],
      tail: [],
      llm: []
    };
    
    keywords.forEach(kw => {
      const cat = kw.ui_cat || 'money';
      if (groups[cat]) {
        groups[cat].push(kw);
      } else {
        groups.money.push(kw); // Fallback
      }
    });
    
    // Sort each group by clash (descending)
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => b.clash - a.clash);
    });
    
    return groups;
  }
  
  /**
   * Group keywords by competitor
   */
  _groupByCompetitor(keywords) {
    const groups = {};
    
    keywords.forEach(kw => {
      const comp = kw.meta?.competitor || 'unknown';
      if (!groups[comp]) {
        groups[comp] = {
          domain: comp,
          keywords: [],
          stats: { money: 0, sge: 0, tail: 0, llm: 0 }
        };
      }
      groups[comp].keywords.push(kw);
      groups[comp].stats[kw.ui_cat]++;
    });
    
    return groups;
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // HELPER FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════════════
  
  _calculateTotalMarketTraffic(competitors) {
    if (!Array.isArray(competitors) || competitors.length === 0) {
      return 250000; // Default market traffic estimate
    }
    return competitors.reduce((sum, c) => {
      const traffic = c?.synthesized?.traffic?.organic || 
                     c?.traffic || 
                     c?.organicTraffic || 
                     50000;
      return sum + traffic;
    }, 0);
  }
  
  _findCompetitor(domain, competitors) {
    const comp = competitors.find(c => c.domain === domain) || {};
    return {
      domain: domain,
      da: comp.synthesized?.authority?.domainAuthority || comp.da || 50,
      traffic: comp.synthesized?.traffic?.organic || comp.traffic || 50000,
      moat: comp.moat || { type: 'Content' }
    };
  }
  
  _inferIntent(uiCat) {
    const mapping = {
      money: 'commercial',
      sge: 'transactional',
      tail: 'informational',
      llm: 'navigational'
    };
    return mapping[uiCat] || 'commercial';
  }
  
  _generateTip(kw, clash, aioRisk, moat) {
    if (clash >= 7 && aioRisk >= 7) {
      return `🔴 FORTRESS: High clash (${clash}/10) + AIO risk (${aioRisk}/10). ${moat} moat requires specialized breaker strategy.`;
    } else if (clash >= 7) {
      return `🟠 CONTESTED: Clash ${clash}/10. ${moat} moat present. Requires tactical approach.`;
    } else if (aioRisk >= 7) {
      return `⚠️ AIO RISK: ${aioRisk}/10. Optimize for Perplexity/ChatGPT citation.`;
    } else if (clash <= 3) {
      return `🟢 QUICK WIN: Low clash (${clash}/10). Deploy content rapidly.`;
    }
    return `🔵 BALANCED: Clash ${clash}/10, AIO ${aioRisk}/10. ${moat} moat.`;
  }
  
  _calculateAverage(items, field) {
    if (!items.length) return 0;
    const sum = items.reduce((acc, item) => acc + (item[field] || 0), 0);
    return Math.round((sum / items.length) * 10) / 10;
  }
  
  _formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// VIRTUALIZED GRID GENERATOR
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate virtualized grid data for 450-row rendering
 * Uses windowing technique for performance
 */
class VirtualizedGridGenerator {
  constructor(pageSize = 50) {
    this.pageSize = pageSize;
  }
  
  /**
   * Generate a page of grid data
   * @param {Array} keywords - Full keyword array
   * @param {number} page - Page number (0-indexed)
   * @param {string} filter - Module filter (money|sge|tail|llm|all)
   * @returns {Object} Page data with navigation info
   */
  getPage(keywords, page = 0, filter = 'all') {
    // Ensure keywords is a valid array
    const safeKeywords = Array.isArray(keywords) ? keywords : [];
    
    // Apply filter
    let filtered = safeKeywords;
    if (filter !== 'all') {
      filtered = safeKeywords.filter(kw => kw.ui_cat === filter);
    }
    
    const totalPages = Math.ceil(filtered.length / this.pageSize);
    const startIdx = page * this.pageSize;
    const endIdx = Math.min(startIdx + this.pageSize, filtered.length);
    const pageData = filtered.slice(startIdx, endIdx);
    
    return {
      data: pageData,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalItems: filtered.length,
        pageSize: this.pageSize,
        startIndex: startIdx,
        endIndex: endIdx,
        hasNext: page < totalPages - 1,
        hasPrev: page > 0
      },
      filter: filter
    };
  }
  
  /**
   * Get sticky header data for each module section
   */
  getStickyHeaders(keywords) {
    // Ensure keywords is a valid array
    const safeKeywords = Array.isArray(keywords) ? keywords : [];
    
    return Object.keys(PARSER_CONFIG.MODULES).map(key => {
      const module = PARSER_CONFIG.MODULES[key];
      const moduleKws = safeKeywords.filter(k => k.ui_cat === key);
      
      return {
        key: key,
        label: module.label,
        icon: module.icon,
        color: module.color,
        count: moduleKws.length,
        targetCount: module.count,
        avgClash: this._avg(moduleKws, 'clash'),
        avgAio: this._avg(moduleKws, 'aio_risk')
      };
    });
  }
  
  _avg(items, field) {
    if (!items.length) return 0;
    return Math.round((items.reduce((s, i) => s + (i[field] || 0), 0) / items.length) * 10) / 10;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// GLOBAL FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Parse the fetcher reservoir into Master_Reservoir format
 * @param {Object} rawReservoir - Raw data from FT_Fetcher
 * @param {Array} competitors - Competitor metadata
 * @param {number} ourDA - Our domain authority (optional, default 35)
 */
function FT_ParseReservoir(rawReservoir, competitors, ourDA = 35) {
  const parser = new ForensicTrafficParser(ourDA);
  return parser.parseReservoir(rawReservoir, competitors);
}

/**
 * Get a virtualized page of keywords
 * @param {Array} keywords - Full keyword array
 * @param {number} page - Page number
 * @param {string} filter - Module filter
 */
function FT_GetVirtualizedPage(keywords, page = 0, filter = 'all') {
  const grid = new VirtualizedGridGenerator();
  return grid.getPage(keywords, page, filter);
}

/**
 * Get sticky headers for the virtualized grid
 * @param {Array} keywords - Full keyword array
 */
function FT_GetStickyHeaders(keywords) {
  const grid = new VirtualizedGridGenerator();
  return grid.getStickyHeaders(keywords);
}

/**
 * Complete pipeline: Fetch + Parse + Format for UI
 * @param {Array} competitors - Competitor objects
 * @param {Object} geminiData - Gemini analysis
 * @param {number} ourDA - Our domain authority
 */
function FT_FullPipeline(competitors, geminiData, ourDA = 35) {
  console.log('🚀 Starting Full Forensic Traffic Pipeline...');
  
  // Step 1: Initialize and run fetcher
  const fetchResult = FT_StartFetch(competitors, geminiData);
  if (!fetchResult.success) {
    return { error: 'Fetcher initialization failed', details: fetchResult };
  }
  
  // Note: For async completion, use FT_GetStatus() to monitor
  // This returns immediately with the fetch started
  
  return {
    success: true,
    message: 'Forensic fetch pipeline initiated',
    batchId: fetchResult.batchId,
    totalKeywords: fetchResult.totalKeywords,
    monitorFunction: 'FT_GetStatus()',
    parseFunction: 'FT_ParseReservoir(reservoir, competitors, ourDA)'
  };
}

/**
 * Get parsed and formatted UI data (call after fetch complete)
 */
function FT_GetUIData(competitors, ourDA = 35) {
  // Get reservoir from fetcher
  const reservoir = FT_GetReservoir();
  
  // Ensure reservoir is valid
  if (!reservoir) {
    return { error: 'Reservoir is null. Run FT_StartFetch first.', keywords: [], stats: {} };
  }
  
  const keywords = reservoir.keywords || [];
  if (keywords.length === 0) {
    return { error: 'No keywords in reservoir. Fetch may still be in progress or not started.', keywords: [], stats: reservoir.stats || {} };
  }
  
  // Ensure competitors is valid
  const safeCompetitors = Array.isArray(competitors) && competitors.length > 0
    ? competitors
    : [{ domain: 'ahrefs.com' }, { domain: 'semrush.com' }, { domain: 'surferseo.com' }, { domain: 'jasper.com' }, { domain: 'moz.com' }];
  
  // Parse into Master_Reservoir
  const masterReservoir = FT_ParseReservoir(reservoir, safeCompetitors, ourDA);
  
  // Get virtualized grid data
  const gridPage = FT_GetVirtualizedPage(masterReservoir?.ui_payload || [], 0, 'all');
  const headers = FT_GetStickyHeaders(masterReservoir?.ui_payload || []);
  
  return {
    reservoir: masterReservoir,
    initialPage: gridPage,
    stickyHeaders: headers
  };
}
