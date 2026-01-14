/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * SERPIFAI ORACLE ELITE v21.0 - JSON TRANSFORMER
 * High-Density Data Transformation for D3.js Mind Maps & Bento-Grid UI
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * PURPOSE: Convert raw fetcher outputs into the exact format needed for:
 *          1. D3.js Radial Mind Map visualizations
 *          2. Bento-Grid card modules
 *          3. Entity relationship graphs
 *          4. Proof trace UI elements
 * 
 * ARCHITECTURE:
 * ┌────────────────────────────────────────────────────────────────────────┐
 * │  RAW DATA (from Elite Fetcher → Serper Bridge → Inference)            │
 * │     ↓                                                                  │
 * │  JSON_Transformer.gs (this module)                                    │
 * │     ├── Entity Relationship Mapper                                    │
 * │     ├── D3.js Node Generator                                          │
 * │     ├── Bento-Grid Card Formatter                                     │
 * │     └── Proof Trace Linker                                            │
 * │     ↓                                                                  │
 * │  UI-READY PAYLOADS (High-Density JSON Schema)                         │
 * └────────────────────────────────────────────────────────────────────────┘
 * 
 * OUTPUT SCHEMA:
 * Every metric includes:
 *   - value: The actual metric value
 *   - source_integrity: 'api' | 'estimated' | 'inferred'
 *   - proof_id: Link to raw JSON snippet
 *   - confidence: 0-100 score
 * 
 * @author SerpifAI Engineering
 * @version 21.0.0
 * @license Proprietary - serpifai.com
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// TRANSFORMER CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════

const JSON_TRANSFORMER_CONFIG = {
  // Source Integrity Tags
  SOURCE_INTEGRITY: {
    API: 'api',
    ESTIMATED: 'estimated',
    INFERRED: 'inferred',
    CACHED: 'cached'
  },
  
  // D3.js Configuration
  D3: {
    MIN_NODE_SIZE: 8,
    MAX_NODE_SIZE: 50,
    DEFAULT_COLOR_SCHEME: ['#667eea', '#764ba2', '#f56565', '#48bb78', '#ed8936'],
    ENTITY_COLORS: {
      keyword: '#667eea',
      competitor: '#f56565',
      page: '#48bb78',
      topic: '#ed8936',
      brand: '#9f7aea'
    }
  },
  
  // Bento-Grid Configuration
  BENTO: {
    CARD_SIZES: ['small', 'medium', 'large', 'full'],
    METRIC_CATEGORIES: {
      traffic: { icon: '📈', color: '#48bb78' },
      authority: { icon: '🏆', color: '#667eea' },
      keywords: { icon: '🔑', color: '#ed8936' },
      content: { icon: '📄', color: '#9f7aea' },
      technical: { icon: '⚙️', color: '#718096' },
      competitors: { icon: '🎯', color: '#f56565' }
    }
  }
};

// ═══════════════════════════════════════════════════════════════════════════════════
// JSON TRANSFORMER CLASS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * JSONTransformer - Converts raw data to UI-ready payloads
 */
class JSONTransformer {
  
  constructor(rawData) {
    this.raw = rawData || {};
    this.domain = rawData.domain || '';
    this.proofStore = new Map();
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // MAIN TRANSFORMATION METHODS
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Transform raw data into complete UI-ready payload
   * @returns {Object} Full UI payload with all formats
   */
  transformAll() {
    return {
      domain: this.domain,
      timestamp: new Date().toISOString(),
      
      // D3.js Mind Map Data
      mindMap: this.toMindMapFormat(),
      
      // Bento-Grid Card Data
      bentoCards: this.toBentoGridFormat(),
      
      // Entity Relationships
      entities: this.toEntityRelationships(),
      
      // Proof Traces
      proofTraces: this.getProofTraces(),
      
      // Raw Data Reference
      _rawDataHash: this._hashRawData()
    };
  }
  
  /**
   * Transform to D3.js Radial Mind Map format
   * @returns {Object} D3-compatible hierarchical data
   */
  toMindMapFormat() {
    const root = {
      name: this.domain,
      type: 'root',
      children: []
    };
    
    // Add keyword clusters
    if (this.raw.keywords && this.raw.keywords.length > 0) {
      const keywordNode = this._createKeywordMindMapBranch(this.raw.keywords);
      root.children.push(keywordNode);
    }
    
    // Add top pages
    if (this.raw.topPages && this.raw.topPages.length > 0) {
      const pagesNode = this._createPagesMindMapBranch(this.raw.topPages);
      root.children.push(pagesNode);
    }
    
    // Add competitors
    if (this.raw.competitors && this.raw.competitors.length > 0) {
      const competitorNode = this._createCompetitorMindMapBranch(this.raw.competitors);
      root.children.push(competitorNode);
    }
    
    // Add topics/entities
    if (this.raw.content && this.raw.content.topics) {
      const topicNode = this._createTopicMindMapBranch(this.raw.content.topics);
      root.children.push(topicNode);
    }
    
    return {
      data: root,
      config: {
        colorScheme: JSON_TRANSFORMER_CONFIG.D3.DEFAULT_COLOR_SCHEME,
        minNodeSize: JSON_TRANSFORMER_CONFIG.D3.MIN_NODE_SIZE,
        maxNodeSize: JSON_TRANSFORMER_CONFIG.D3.MAX_NODE_SIZE
      },
      nodeCount: this._countNodes(root)
    };
  }
  
  /**
   * Transform to Bento-Grid format
   * @returns {Array} Array of bento card objects
   */
  toBentoGridFormat() {
    const cards = [];
    
    // Traffic Overview Card
    cards.push(this._createBentoCard({
      id: 'traffic_overview',
      title: 'Traffic Overview',
      category: 'traffic',
      size: 'large',
      metrics: this._extractTrafficMetrics()
    }));
    
    // Authority Score Card
    cards.push(this._createBentoCard({
      id: 'authority_score',
      title: 'Authority Score',
      category: 'authority',
      size: 'medium',
      metrics: this._extractAuthorityMetrics()
    }));
    
    // Keyword Intelligence Card
    cards.push(this._createBentoCard({
      id: 'keyword_intel',
      title: 'Keyword Intelligence',
      category: 'keywords',
      size: 'large',
      metrics: this._extractKeywordMetrics()
    }));
    
    // Content Analysis Card
    cards.push(this._createBentoCard({
      id: 'content_analysis',
      title: 'Content Analysis',
      category: 'content',
      size: 'medium',
      metrics: this._extractContentMetrics()
    }));
    
    // Technical Health Card
    cards.push(this._createBentoCard({
      id: 'technical_health',
      title: 'Technical Health',
      category: 'technical',
      size: 'medium',
      metrics: this._extractTechnicalMetrics()
    }));
    
    // Competitor Overview Card
    cards.push(this._createBentoCard({
      id: 'competitor_overview',
      title: 'Competitor Landscape',
      category: 'competitors',
      size: 'large',
      metrics: this._extractCompetitorMetrics()
    }));
    
    return cards;
  }
  
  /**
   * Transform to Entity Relationships format
   * @returns {Object} Entity graph with relationships
   */
  toEntityRelationships() {
    const entities = [];
    const relationships = [];
    
    // Root entity (domain)
    entities.push({
      id: 'root',
      type: 'domain',
      name: this.domain,
      attributes: {
        traffic: this.raw.traffic?.organic || 0,
        authority: this.raw.authority?.score || 0
      }
    });
    
    // Keyword entities
    if (this.raw.keywords) {
      this.raw.keywords.slice(0, 50).forEach((kw, idx) => {
        const entityId = `kw_${idx}`;
        entities.push({
          id: entityId,
          type: 'keyword',
          name: kw.keyword,
          attributes: {
            volume: kw.volume || 0,
            difficulty: kw.difficulty || 0,
            source: kw.source || kw._source || 'unknown'
          }
        });
        
        relationships.push({
          source: 'root',
          target: entityId,
          type: 'ranks_for',
          strength: kw.position ? (11 - Math.min(kw.position, 10)) / 10 : 0.5
        });
      });
    }
    
    // Competitor entities
    if (this.raw.competitors) {
      this.raw.competitors.slice(0, 10).forEach((comp, idx) => {
        const entityId = `comp_${idx}`;
        entities.push({
          id: entityId,
          type: 'competitor',
          name: comp.domain || comp.name,
          attributes: {
            overlap: comp.overlap || 0,
            threat: comp.threat || 'medium'
          }
        });
        
        relationships.push({
          source: 'root',
          target: entityId,
          type: 'competes_with',
          strength: (comp.overlap || 50) / 100
        });
      });
    }
    
    // Topic entities
    if (this.raw.content && this.raw.content.topics) {
      this.raw.content.topics.slice(0, 20).forEach((topic, idx) => {
        const entityId = `topic_${idx}`;
        entities.push({
          id: entityId,
          type: 'topic',
          name: typeof topic === 'string' ? topic : topic.name,
          attributes: {
            coverage: typeof topic === 'object' ? topic.coverage : 0
          }
        });
        
        relationships.push({
          source: 'root',
          target: entityId,
          type: 'covers_topic',
          strength: 0.7
        });
      });
    }
    
    return {
      entities: entities,
      relationships: relationships,
      stats: {
        entityCount: entities.length,
        relationshipCount: relationships.length,
        types: [...new Set(entities.map(e => e.type))]
      }
    };
  }
  
  /**
   * Get all proof traces for data transparency
   * @returns {Array} Proof trace objects
   */
  getProofTraces() {
    const traces = [];
    
    // Collect from raw data
    if (this.raw.proofTraces) {
      traces.push(...this.raw.proofTraces);
    }
    
    // Collect from bridge data
    if (this.raw._bridgeData && this.raw._bridgeData.proofTraces) {
      traces.push(...this.raw._bridgeData.proofTraces);
    }
    
    // Collect from sources
    if (this.raw.sources) {
      Object.keys(this.raw.sources).forEach(source => {
        if (this.raw.sources[source].proofId) {
          traces.push({
            source: source,
            proofId: this.raw.sources[source].proofId,
            timestamp: this.raw.sources[source].timestamp || this.raw.fetchedAt
          });
        }
      });
    }
    
    return traces;
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // MIND MAP BRANCH CREATORS
  // ═══════════════════════════════════════════════════════════════════════════
  
  _createKeywordMindMapBranch(keywords) {
    // Cluster keywords by type/category
    const clusters = {};
    
    keywords.forEach(kw => {
      const type = kw.type || kw.category || 'general';
      if (!clusters[type]) {
        clusters[type] = [];
      }
      clusters[type].push(kw);
    });
    
    return {
      name: 'Keywords',
      type: 'category',
      color: JSON_TRANSFORMER_CONFIG.D3.ENTITY_COLORS.keyword,
      count: keywords.length,
      children: Object.keys(clusters).slice(0, 8).map(type => ({
        name: type.charAt(0).toUpperCase() + type.slice(1),
        type: 'cluster',
        count: clusters[type].length,
        children: clusters[type].slice(0, 10).map(kw => ({
          name: kw.keyword,
          type: 'keyword',
          value: kw.volume || 0,
          size: this._calculateNodeSize(kw.volume || 0, 0, 10000),
          metrics: {
            volume: this._wrapMetric(kw.volume, kw._source || kw.source),
            difficulty: this._wrapMetric(kw.difficulty, kw._source || kw.source),
            cpc: this._wrapMetric(kw.cpc, kw._source || kw.source)
          }
        }))
      }))
    };
  }
  
  _createPagesMindMapBranch(pages) {
    return {
      name: 'Top Pages',
      type: 'category',
      color: JSON_TRANSFORMER_CONFIG.D3.ENTITY_COLORS.page,
      count: pages.length,
      children: pages.slice(0, 15).map(page => ({
        name: page.title || page.url,
        type: 'page',
        url: page.url,
        value: page.traffic || page.estimatedTraffic || 0,
        size: this._calculateNodeSize(page.traffic || 0, 0, 50000),
        metrics: {
          traffic: this._wrapMetric(page.traffic, page._source || 'direct'),
          keywords: this._wrapMetric(page.keywords || page.keywordCount, page._source || 'direct')
        }
      }))
    };
  }
  
  _createCompetitorMindMapBranch(competitors) {
    return {
      name: 'Competitors',
      type: 'category',
      color: JSON_TRANSFORMER_CONFIG.D3.ENTITY_COLORS.competitor,
      count: competitors.length,
      children: competitors.slice(0, 10).map(comp => ({
        name: comp.domain || comp.name,
        type: 'competitor',
        value: comp.traffic || comp.estimatedTraffic || 0,
        size: this._calculateNodeSize(comp.overlap || 50, 0, 100),
        threat: comp.threat || 'medium',
        metrics: {
          overlap: this._wrapMetric(comp.overlap, comp._source || 'estimated'),
          traffic: this._wrapMetric(comp.traffic, comp._source || 'estimated')
        }
      }))
    };
  }
  
  _createTopicMindMapBranch(topics) {
    return {
      name: 'Topics',
      type: 'category',
      color: JSON_TRANSFORMER_CONFIG.D3.ENTITY_COLORS.topic,
      count: topics.length,
      children: topics.slice(0, 15).map(topic => ({
        name: typeof topic === 'string' ? topic : topic.name,
        type: 'topic',
        value: typeof topic === 'object' ? (topic.coverage || 50) : 50,
        size: this._calculateNodeSize(
          typeof topic === 'object' ? (topic.coverage || 50) : 50,
          0, 100
        )
      }))
    };
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // BENTO CARD HELPERS
  // ═══════════════════════════════════════════════════════════════════════════
  
  _createBentoCard(config) {
    const category = JSON_TRANSFORMER_CONFIG.BENTO.METRIC_CATEGORIES[config.category] || {};
    
    return {
      id: config.id,
      title: config.title,
      category: config.category,
      size: config.size,
      icon: category.icon || '📊',
      color: category.color || '#718096',
      metrics: config.metrics,
      _lastUpdated: new Date().toISOString()
    };
  }
  
  _extractTrafficMetrics() {
    const traffic = this.raw.traffic || {};
    return [
      this._createMetricObject('Organic Traffic', traffic.organic || 0, 'monthly', traffic._source),
      this._createMetricObject('Traffic Value', traffic.value || 0, 'usd', traffic._source),
      this._createMetricObject('Growth Rate', traffic.growthRate || 0, 'percent', traffic._source),
      this._createMetricObject('Avg. Position', traffic.avgPosition || 0, 'position', traffic._source)
    ];
  }
  
  _extractAuthorityMetrics() {
    const authority = this.raw.authority || {};
    return [
      this._createMetricObject('Domain Authority', authority.score || authority.da || 0, 'score', authority._source),
      this._createMetricObject('Page Rank', authority.pageRank || 0, 'score', authority._source),
      this._createMetricObject('Trust Score', authority.trust || 0, 'score', authority._source),
      this._createMetricObject('Backlinks', this.raw.backlinks?.total || 0, 'count', authority._source)
    ];
  }
  
  _extractKeywordMetrics() {
    const keywords = this.raw.keywords || [];
    const avgVolume = keywords.length > 0 
      ? Math.round(keywords.reduce((sum, k) => sum + (k.volume || 0), 0) / keywords.length)
      : 0;
    const avgDifficulty = keywords.length > 0
      ? Math.round(keywords.reduce((sum, k) => sum + (k.difficulty || 0), 0) / keywords.length)
      : 0;
    
    return [
      this._createMetricObject('Total Keywords', keywords.length, 'count', 'direct'),
      this._createMetricObject('Avg. Volume', avgVolume, 'monthly', 'estimated'),
      this._createMetricObject('Avg. Difficulty', avgDifficulty, 'score', 'estimated'),
      this._createMetricObject('Clusters', this.raw.keywordClusters?.length || 0, 'count', 'direct')
    ];
  }
  
  _extractContentMetrics() {
    const website = this.raw.website || {};
    const content = this.raw.content || {};
    return [
      this._createMetricObject('Content Score', website.contentQuality || 0, 'score', 'direct'),
      this._createMetricObject('Topics Covered', content.topics?.length || 0, 'count', 'direct'),
      this._createMetricObject('Schema Types', website.schemaTypes?.length || 0, 'count', 'direct'),
      this._createMetricObject('Readability', content.readability || 0, 'score', 'estimated')
    ];
  }
  
  _extractTechnicalMetrics() {
    const technical = this.raw.technical || {};
    return [
      this._createMetricObject('Core Web Vitals', technical.cwvScore || 0, 'score', technical._source),
      this._createMetricObject('Mobile Score', technical.mobileScore || 0, 'score', technical._source),
      this._createMetricObject('Security', technical.httpsEnabled ? 100 : 0, 'score', 'direct'),
      this._createMetricObject('Indexed Pages', this.raw.indexedPages || 0, 'count', technical._source)
    ];
  }
  
  _extractCompetitorMetrics() {
    const competitors = this.raw.competitors || [];
    return [
      this._createMetricObject('Competitors Found', competitors.length, 'count', 'api'),
      this._createMetricObject('Avg. Overlap', 
        competitors.length > 0 
          ? Math.round(competitors.reduce((s, c) => s + (c.overlap || 0), 0) / competitors.length)
          : 0,
        'percent', 'estimated'
      ),
      this._createMetricObject('Top Threat', competitors[0]?.domain || 'N/A', 'text', 'api'),
      this._createMetricObject('Keyword Gap', this.raw.keywordGap || 0, 'count', 'estimated')
    ];
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITY METHODS
  // ═══════════════════════════════════════════════════════════════════════════
  
  _createMetricObject(label, value, format, source) {
    const integrity = this._determineIntegrity(source);
    const proofId = this._generateProofId(label, value);
    
    return {
      label: label,
      value: value,
      format: format,
      source_integrity: integrity,
      confidence: this._calculateConfidence(integrity, value),
      proof_id: proofId,
      _raw: {
        source: source,
        timestamp: new Date().toISOString()
      }
    };
  }
  
  _wrapMetric(value, source) {
    return {
      value: value || 0,
      source_integrity: this._determineIntegrity(source),
      confidence: this._calculateConfidence(this._determineIntegrity(source), value)
    };
  }
  
  _determineIntegrity(source) {
    if (!source) return JSON_TRANSFORMER_CONFIG.SOURCE_INTEGRITY.INFERRED;
    
    const sourceStr = String(source).toLowerCase();
    
    if (sourceStr.includes('api') || sourceStr.includes('serper') || sourceStr.includes('opr')) {
      return JSON_TRANSFORMER_CONFIG.SOURCE_INTEGRITY.API;
    }
    if (sourceStr.includes('direct') || sourceStr.includes('scrape')) {
      return JSON_TRANSFORMER_CONFIG.SOURCE_INTEGRITY.API;
    }
    if (sourceStr.includes('cache')) {
      return JSON_TRANSFORMER_CONFIG.SOURCE_INTEGRITY.CACHED;
    }
    if (sourceStr.includes('estimated') || sourceStr.includes('benchmark')) {
      return JSON_TRANSFORMER_CONFIG.SOURCE_INTEGRITY.ESTIMATED;
    }
    
    return JSON_TRANSFORMER_CONFIG.SOURCE_INTEGRITY.INFERRED;
  }
  
  _calculateConfidence(integrity, value) {
    // No value = low confidence
    if (value === null || value === undefined || value === 0) {
      return 20;
    }
    
    switch (integrity) {
      case JSON_TRANSFORMER_CONFIG.SOURCE_INTEGRITY.API:
        return 95;
      case JSON_TRANSFORMER_CONFIG.SOURCE_INTEGRITY.CACHED:
        return 85;
      case JSON_TRANSFORMER_CONFIG.SOURCE_INTEGRITY.ESTIMATED:
        return 60;
      case JSON_TRANSFORMER_CONFIG.SOURCE_INTEGRITY.INFERRED:
      default:
        return 35;
    }
  }
  
  _calculateNodeSize(value, min, max) {
    const config = JSON_TRANSFORMER_CONFIG.D3;
    const normalized = Math.min(1, Math.max(0, (value - min) / (max - min || 1)));
    return config.MIN_NODE_SIZE + (normalized * (config.MAX_NODE_SIZE - config.MIN_NODE_SIZE));
  }
  
  _countNodes(node) {
    let count = 1;
    if (node.children) {
      node.children.forEach(child => {
        count += this._countNodes(child);
      });
    }
    return count;
  }
  
  _generateProofId(label, value) {
    const hash = String(label + value + this.domain).split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return `proof_${Math.abs(hash).toString(36)}`;
  }
  
  _hashRawData() {
    const str = JSON.stringify(this.raw);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// PUBLIC API FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Transform raw fetcher data to complete UI payload
 * @param {Object} rawData - Raw data from Oracle Elite Fetcher
 * @returns {Object} UI-ready payload
 */
function JSON_TRANSFORM_toUIPayload(rawData) {
  const transformer = new JSONTransformer(rawData);
  return transformer.transformAll();
}

/**
 * Transform to D3.js Mind Map format only
 * @param {Object} rawData - Raw data from fetcher
 * @returns {Object} D3-compatible hierarchical data
 */
function JSON_TRANSFORM_toMindMap(rawData) {
  const transformer = new JSONTransformer(rawData);
  return transformer.toMindMapFormat();
}

/**
 * Transform to Bento-Grid format only
 * @param {Object} rawData - Raw data from fetcher
 * @returns {Array} Bento card objects
 */
function JSON_TRANSFORM_toBentoCards(rawData) {
  const transformer = new JSONTransformer(rawData);
  return transformer.toBentoGridFormat();
}

/**
 * Transform to Entity Relationships format
 * @param {Object} rawData - Raw data from fetcher
 * @returns {Object} Entity graph
 */
function JSON_TRANSFORM_toEntityGraph(rawData) {
  const transformer = new JSONTransformer(rawData);
  return transformer.toEntityRelationships();
}

/**
 * Extract proof traces from raw data
 * @param {Object} rawData - Raw data from fetcher
 * @returns {Array} Proof trace objects
 */
function JSON_TRANSFORM_getProofTraces(rawData) {
  const transformer = new JSONTransformer(rawData);
  return transformer.getProofTraces();
}

/**
 * Create a single metric object with integrity scoring
 * @param {string} label - Metric label
 * @param {*} value - Metric value
 * @param {string} format - Value format (count, percent, usd, score, text)
 * @param {string} source - Data source
 * @returns {Object} Metric object with integrity
 */
function JSON_TRANSFORM_createMetric(label, value, format, source) {
  const transformer = new JSONTransformer({});
  return transformer._createMetricObject(label, value, format, source);
}
