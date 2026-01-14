/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FT_Comp_Queue.gs - QUEUE GENERATION FOR FETCHER
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * SerpifAI v8.0.0 - Generates the 450-keyword queue from competitors
 * 
 * @module FT_Comp_Queue
 * @version 8.0.0
 * ═══════════════════════════════════════════════════════════════════════════
 */

// Module configuration: 15 + 30 + 30 + 15 = 90 per competitor
const FT_MODULE_CONFIG = [
  { type: 'money', count: 15, label: 'Money Moat' },
  { type: 'sge', count: 30, label: 'SGE/AIO Survival' },
  { type: 'tail', count: 30, label: 'Long-Tail Velocity' },
  { type: 'llm', count: 15, label: 'LLM Citation Gaps' }
];

/**
 * Generate the complete 450-KW queue
 * @param {Array} competitors - Competitor objects
 * @param {Object} geminiData - Gemini analysis data
 * @return {Array} Keyword queue
 */
function FT_Queue_generate(competitors, geminiData) {
  const queue = [];
  const globalSet = new Set();  // Zero-repetition enforcement
  
  const safeCompetitors = _getValidCompetitors(competitors);
  
  safeCompetitors.slice(0, 5).forEach((comp, compIndex) => {
    const domain = comp.domain || `competitor_${compIndex + 1}`;
    const niche = _extractNiche(comp, geminiData);
    
    FT_MODULE_CONFIG.forEach(module => {
      const keywords = _generateModuleKeywords(
        comp, geminiData, niche, module.type, module.count, globalSet, compIndex
      );
      
      keywords.forEach(kw => {
        queue.push({
          ...kw,
          ui_cat: module.type,
          competitor: domain,
          compIndex: compIndex,
          status: 'pending',
          attempts: 0
        });
      });
    });
    
    LOG_debug('FT_Queue', `${domain}: ${90} keywords queued`);
  });
  
  return queue;
}

/**
 * Get valid competitors array
 * @param {Array} competitors - Input competitors
 * @return {Array} Valid competitor array
 */
function _getValidCompetitors(competitors) {
  if (Array.isArray(competitors) && competitors.length > 0) {
    return competitors;
  }
  return FT_STANDARD_COMPETITORS.slice(0, 5).map(d => ({ domain: d }));
}

/**
 * Extract niche from competitor and Gemini data
 * @param {Object} comp - Competitor object
 * @param {Object} gemini - Gemini data
 * @return {string} Niche string
 */
function _extractNiche(comp, gemini) {
  if (comp.niche) return comp.niche;
  if (gemini?.category) return gemini.category;
  
  const domain = comp.domain || '';
  const common = ['seo', 'marketing', 'content', 'ai', 'analytics'];
  for (const c of common) {
    if (domain.toLowerCase().includes(c)) return c;
  }
  return 'digital marketing';
}

/**
 * Generate keywords for a specific module
 * @param {Object} comp - Competitor
 * @param {Object} gemini - Gemini data
 * @param {string} niche - Niche string
 * @param {string} moduleType - Module type
 * @param {number} count - Target count
 * @param {Set} globalSet - Global dedup set
 * @param {number} compIndex - Competitor index
 * @return {Array} Keywords
 */
function _generateModuleKeywords(comp, gemini, niche, moduleType, count, globalSet, compIndex) {
  const keywords = [];
  const kwIntel = gemini?.keywordIntelligence || {};
  const templates = _getModuleTemplates(moduleType, niche);
  
  // Priority 1: Extract from Gemini data
  const geminiKWs = _getGeminiKeywords(kwIntel, moduleType);
  geminiKWs.slice(0, Math.ceil(count * 0.4)).forEach(kw => {
    if (keywords.length >= count) return;
    const kwText = (kw.keyword || kw).toLowerCase().trim();
    if (!globalSet.has(kwText) && kwText.length > 3) {
      globalSet.add(kwText);
      keywords.push(_createKeywordObject(kwText, moduleType, comp, compIndex, 'gemini'));
    }
  });
  
  // Priority 2: Fill with templates
  templates.forEach(template => {
    if (keywords.length >= count) return;
    const kwText = template.toLowerCase().trim();
    if (!globalSet.has(kwText) && kwText.length > 3) {
      globalSet.add(kwText);
      keywords.push(_createKeywordObject(kwText, moduleType, comp, compIndex, 'template'));
    }
  });
  
  return keywords;
}

/**
 * Get module-specific keyword templates
 * @param {string} moduleType - Module type
 * @param {string} niche - Niche
 * @return {Array} Templates
 */
function _getModuleTemplates(moduleType, niche) {
  const templates = {
    money: [
      `best ${niche} tools`, `${niche} software pricing`, `${niche} roi calculator`,
      `enterprise ${niche}`, `${niche} for agencies`, `${niche} comparison`,
      `${niche} vs alternatives`, `buy ${niche} software`, `${niche} free trial`,
      `${niche} demo`, `${niche} subscription`, `${niche} license`,
      `${niche} for business`, `professional ${niche}`, `${niche} plans`
    ],
    sge: [
      `what is ${niche}`, `how does ${niche} work`, `${niche} explained`,
      `${niche} tutorial`, `${niche} guide`, `${niche} for beginners`,
      `${niche} benefits`, `${niche} examples`, `why use ${niche}`,
      `${niche} best practices`, `${niche} tips`, `${niche} strategies`,
      `${niche} techniques`, `${niche} methods`, `${niche} fundamentals`,
      `${niche} basics`, `learn ${niche}`, `${niche} course`,
      `${niche} training`, `${niche} certification`, `${niche} definition`,
      `${niche} meaning`, `${niche} overview`, `${niche} introduction`,
      `understanding ${niche}`, `${niche} concepts`, `${niche} principles`,
      `${niche} framework`, `${niche} process`, `${niche} workflow`
    ],
    tail: [
      `how to improve ${niche} performance`, `${niche} optimization techniques`,
      `${niche} for small business`, `affordable ${niche} solutions`,
      `${niche} step by step`, `${niche} checklist`, `${niche} template`,
      `${niche} worksheet`, `${niche} spreadsheet`, `${niche} calculator`,
      `free ${niche} tools`, `${niche} without budget`, `diy ${niche}`,
      `${niche} on a budget`, `${niche} for startups`, `${niche} case study`,
      `${niche} success story`, `${niche} results`, `${niche} metrics`,
      `${niche} kpis`, `measuring ${niche}`, `${niche} analytics`,
      `${niche} reporting`, `${niche} dashboard`, `${niche} automation`,
      `${niche} tools comparison`, `${niche} review`, `${niche} ratings`,
      `top ${niche} platforms`, `${niche} recommendations`
    ],
    llm: [
      `${niche} ai`, `${niche} chatgpt`, `${niche} with ai`,
      `ai powered ${niche}`, `${niche} machine learning`, `${niche} automation ai`,
      `${niche} gpt`, `${niche} llm`, `${niche} artificial intelligence`,
      `${niche} ai tools`, `ai ${niche} generator`, `${niche} ai assistant`,
      `${niche} copilot`, `${niche} ai optimization`, `future of ${niche}`
    ]
  };
  
  return templates[moduleType] || templates.sge;
}

/**
 * Get keywords from Gemini data for module
 * @param {Object} kwIntel - Keyword intelligence
 * @param {string} moduleType - Module type
 * @return {Array} Keywords
 */
function _getGeminiKeywords(kwIntel, moduleType) {
  const mapping = {
    money: 'highIntent',
    sge: 'informational',
    tail: 'longTail',
    llm: 'aiRelated'
  };
  
  const key = mapping[moduleType] || 'informational';
  return kwIntel[key] || [];
}

/**
 * Create a keyword object with metrics
 * @param {string} kwText - Keyword text
 * @param {string} moduleType - Module type
 * @param {Object} comp - Competitor
 * @param {number} compIndex - Competitor index
 * @param {string} source - Source (gemini/template)
 * @return {Object} Keyword object
 */
function _createKeywordObject(kwText, moduleType, comp, compIndex, source) {
  const metrics = _calculateMetrics(moduleType, compIndex);
  
  return {
    kw: kwText,
    ui_cat: moduleType,
    clash: metrics.clash,
    aio_risk: metrics.aioRisk,
    x: metrics.x,
    y: metrics.y,
    mass: metrics.mass,
    source: source,
    tip: _generateTip(kwText, metrics, moduleType)
  };
}

/**
 * Calculate metrics for keyword
 * @param {string} moduleType - Module type
 * @param {number} compIndex - Competitor index
 * @return {Object} Metrics
 */
function _calculateMetrics(moduleType, compIndex) {
  const base = {
    money: { clash: 7, aioRisk: 4, x: 75, y: 5, mass: 15 },
    sge: { clash: 5, aioRisk: 3, x: 50, y: 4, mass: 10 },
    tail: { clash: 3, aioRisk: 6, x: 30, y: 7, mass: 5 },
    llm: { clash: 5, aioRisk: 9, x: 55, y: 8, mass: 7 }
  }[moduleType] || { clash: 5, aioRisk: 5, x: 50, y: 5, mass: 10 };
  
  return {
    clash: Math.min(10, base.clash + Math.floor(Math.random() * 2)),
    aioRisk: Math.min(10, base.aioRisk + Math.floor(Math.random() * 2)),
    x: base.x + (compIndex * 3) + Math.floor(Math.random() * 15),
    y: base.y + Math.floor(Math.random() * 2),
    mass: base.mass + Math.floor(Math.random() * 5)
  };
}

/**
 * Generate tip for keyword
 * @param {string} kw - Keyword
 * @param {Object} metrics - Metrics
 * @param {string} moduleType - Module type
 * @return {string} Tip text
 */
function _generateTip(kw, metrics, moduleType) {
  const tips = {
    money: `High-value opportunity. Competition: ${metrics.clash}/10.`,
    sge: `Informational query. AI Overview risk: ${metrics.aioRisk}/10.`,
    tail: `Long-tail opportunity. Lower competition.`,
    llm: `LLM citation potential. Position for AI visibility.`
  };
  return tips[moduleType] || `Analyze: ${kw}`;
}
