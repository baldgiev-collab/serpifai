/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * SERPIFAI ORACLE v16.0 - MODULE 3.3: AI & AEO AUDITOR
 * SPO Triplet Extraction, RAG Readiness, Schema Validation, PII Integration
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * This sub-module implements the AIReadinessAuditor:
 *   - SPO Triplet Extraction for AI Knowledge Graphs
 *   - RAG-Readiness Scoring (Perplexity/Gemini/OpenAI citability)
 *   - JSON-LD Schema.org Validation
 *   - PII Scrubber Integration (Governance compliance)
 * 
 * @author SerpifAI Engineering
 * @version 16.0
 * @license Proprietary - serpifai.com
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 3.3A: AI/AEO CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════

var AEO_CONFIG = AEO_CONFIG || {
  // SPO Triplet extraction patterns
  SPO: {
    // Subject-Predicate-Object patterns
    PATTERNS: [
      // "[Subject] is [Object]" pattern
      { pattern: /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:is|are|was|were)\s+([^.!?,;:]+)/g, type: 'definition' },
      
      // "[Subject] [verb] [Object]" patterns
      { pattern: /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(provides?|offers?|includes?|contains?|requires?|means?|refers?\s+to)\s+([^.!?,;:]+)/g, type: 'description' },
      
      // "The [Subject] [verb] [Object]" pattern
      { pattern: /\bThe\s+([a-z]+(?:\s+[a-z]+)*)\s+(?:is|are|was|were)\s+([^.!?,;:]+)/gi, type: 'definition' },
      
      // "[Subject] can [verb] [Object]"
      { pattern: /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+can\s+(\w+)\s+([^.!?,;:]+)/g, type: 'capability' },
      
      // Number-based facts
      { pattern: /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:has|have|had)\s+(\d+(?:,\d{3})*(?:\.\d+)?)\s+([^.!?,;:]+)/g, type: 'quantity' }
    ],
    MAX_TRIPLETS: 50,
    MIN_SUBJECT_LENGTH: 2,
    MAX_OBJECT_LENGTH: 100
  },
  
  // RAG scoring weights
  RAG: {
    WEIGHTS: {
      FACTUAL_DENSITY: 0.25,
      STRUCTURAL_CLARITY: 0.20,
      SPO_EXTRACTABILITY: 0.20,
      SCHEMA_RICHNESS: 0.15,
      CITATION_READINESS: 0.10,
      ANSWER_BOX_POTENTIAL: 0.10
    },
    THRESHOLDS: {
      HIGH: 75,
      MEDIUM: 50,
      LOW: 25
    }
  },
  
  // Schema.org types to detect
  SCHEMA: {
    PRIORITY_TYPES: [
      'Article', 'NewsArticle', 'BlogPosting', 'HowTo', 'FAQ', 'FAQPage',
      'Question', 'Answer', 'Review', 'Product', 'Organization', 'Person',
      'LocalBusiness', 'WebPage', 'BreadcrumbList', 'ItemList', 'Event',
      'Recipe', 'Course', 'VideoObject', 'ImageObject', 'SoftwareApplication'
    ],
    REQUIRED_FIELDS: {
      'Article': ['headline', 'author', 'datePublished'],
      'FAQ': ['mainEntity'],
      'FAQPage': ['mainEntity'],
      'Product': ['name', 'description'],
      'Organization': ['name', 'url'],
      'Review': ['itemReviewed', 'reviewRating'],
      'HowTo': ['name', 'step']
    }
  },
  
  // Answer box patterns
  ANSWER_BOX: {
    IDEAL_ANSWER_LENGTH: { min: 40, max: 300 },
    TRIGGER_PATTERNS: [
      /^what\s+is\s+/i,
      /^how\s+(?:do|does|to|can)\s+/i,
      /^why\s+(?:is|are|do|does)\s+/i,
      /^when\s+(?:is|was|should)\s+/i,
      /^where\s+(?:is|are|can)\s+/i,
      /^who\s+(?:is|are|was)\s+/i
    ]
  }
};

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 3.3B: SPO TRIPLET EXTRACTOR
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * SPOExtractor - Extracts Subject-Predicate-Object triplets for AI Knowledge Graphs
 */
class SPOExtractor {
  
  /**
   * Extract SPO triplets from text
   * @param {string} text - Clean text content
   * @returns {Object} SPO extraction result
   */
  static extract(text) {
    if (!text) {
      return { triplets: [], count: 0, extractability: 0 };
    }
    
    const triplets = [];
    const seenTriplets = new Set();
    
    // Process each pattern
    for (const { pattern, type } of AEO_CONFIG.SPO.PATTERNS) {
      // Reset regex lastIndex
      pattern.lastIndex = 0;
      
      let match;
      while ((match = pattern.exec(text)) !== null) {
        if (triplets.length >= AEO_CONFIG.SPO.MAX_TRIPLETS) break;
        
        const triplet = SPOExtractor._parseTriplet(match, type);
        if (triplet) {
          const key = `${triplet.subject}|${triplet.predicate}|${triplet.object}`;
          if (!seenTriplets.has(key)) {
            seenTriplets.add(key);
            triplets.push(triplet);
          }
        }
      }
    }
    
    // Also extract definition-style triplets from sentences
    const sentenceTriplets = SPOExtractor._extractFromSentences(text);
    for (const triplet of sentenceTriplets) {
      if (triplets.length >= AEO_CONFIG.SPO.MAX_TRIPLETS) break;
      
      const key = `${triplet.subject}|${triplet.predicate}|${triplet.object}`;
      if (!seenTriplets.has(key)) {
        seenTriplets.add(key);
        triplets.push(triplet);
      }
    }
    
    // Calculate extractability score
    const extractability = SPOExtractor._calculateExtractability(triplets, text);
    
    return {
      triplets: triplets,
      count: triplets.length,
      extractability: extractability,
      byType: SPOExtractor._groupByType(triplets)
    };
  }
  
  /**
   * Parse a regex match into a triplet
   * @param {Array} match - Regex match
   * @param {string} type - Triplet type
   * @returns {Object|null} Parsed triplet or null
   */
  static _parseTriplet(match, type) {
    let subject, predicate, object;
    
    if (match.length >= 4) {
      subject = match[1];
      predicate = match[2];
      object = match[3];
    } else if (match.length === 3) {
      subject = match[1];
      predicate = type === 'definition' ? 'is' : 'relates to';
      object = match[2];
    } else {
      return null;
    }
    
    // Clean and validate
    subject = (subject || '').trim();
    predicate = (predicate || '').trim().toLowerCase();
    object = (object || '').trim();
    
    // Validation
    if (subject.length < AEO_CONFIG.SPO.MIN_SUBJECT_LENGTH) return null;
    if (object.length < 3 || object.length > AEO_CONFIG.SPO.MAX_OBJECT_LENGTH) return null;
    
    // Remove trailing punctuation from object
    object = object.replace(/[.!?,;:]+$/, '').trim();
    
    return {
      subject: subject,
      predicate: predicate,
      object: object,
      type: type,
      confidence: SPOExtractor._calculateConfidence(subject, predicate, object)
    };
  }
  
  /**
   * Extract triplets from sentence structures
   * @param {string} text - Text content
   * @returns {Array} Additional triplets
   */
  static _extractFromSentences(text) {
    const triplets = [];
    
    // Split into sentences
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    for (const sentence of sentences.slice(0, 50)) { // Limit processing
      const trimmed = sentence.trim();
      
      // Look for "X is Y" patterns
      const isMatch = trimmed.match(/^([A-Z][^,]+?)\s+(?:is|are)\s+(.+)$/i);
      if (isMatch) {
        const subject = isMatch[1].trim();
        const object = isMatch[2].trim();
        
        if (subject.length >= 2 && object.length >= 3 && object.length <= 100) {
          triplets.push({
            subject: subject,
            predicate: 'is',
            object: object.replace(/[.!?,;:]+$/, ''),
            type: 'definition',
            confidence: 0.7
          });
        }
      }
      
      // Look for "X means Y" patterns
      const meansMatch = trimmed.match(/^([A-Z][^,]+?)\s+means?\s+(.+)$/i);
      if (meansMatch) {
        triplets.push({
          subject: meansMatch[1].trim(),
          predicate: 'means',
          object: meansMatch[2].trim().replace(/[.!?,;:]+$/, ''),
          type: 'definition',
          confidence: 0.8
        });
      }
    }
    
    return triplets;
  }
  
  /**
   * Calculate triplet confidence
   * @param {string} subject - Subject
   * @param {string} predicate - Predicate
   * @param {string} object - Object
   * @returns {number} Confidence score
   */
  static _calculateConfidence(subject, predicate, object) {
    let confidence = 0.5;
    
    // Boost for capitalized subjects (likely proper nouns/entities)
    if (/^[A-Z]/.test(subject)) confidence += 0.1;
    
    // Boost for clear predicates
    if (['is', 'are', 'means', 'provides', 'offers'].includes(predicate)) {
      confidence += 0.15;
    }
    
    // Boost for medium-length objects
    if (object.length >= 10 && object.length <= 50) confidence += 0.1;
    
    // Penalty for very short subjects
    if (subject.length < 5) confidence -= 0.1;
    
    return Math.max(0, Math.min(1, confidence));
  }
  
  /**
   * Calculate extractability score
   * @param {Array} triplets - Extracted triplets
   * @param {string} text - Original text
   * @returns {number} Extractability score (0-100)
   */
  static _calculateExtractability(triplets, text) {
    const wordCount = text.split(/\s+/).length;
    
    // Triplet density
    const density = triplets.length / Math.max(1, wordCount / 100);
    const densityScore = Math.min(40, density * 10);
    
    // Average confidence
    const avgConfidence = triplets.length > 0
      ? triplets.reduce((sum, t) => sum + t.confidence, 0) / triplets.length
      : 0;
    const confidenceScore = avgConfidence * 30;
    
    // Type diversity
    const types = new Set(triplets.map(t => t.type));
    const diversityScore = Math.min(30, types.size * 10);
    
    return Math.round(densityScore + confidenceScore + diversityScore);
  }
  
  /**
   * Group triplets by type
   * @param {Array} triplets - Triplets array
   * @returns {Object} Grouped triplets
   */
  static _groupByType(triplets) {
    const grouped = {};
    for (const triplet of triplets) {
      if (!grouped[triplet.type]) {
        grouped[triplet.type] = [];
      }
      grouped[triplet.type].push(triplet);
    }
    return grouped;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 3.3C: RAG READINESS SCORER
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * RAGReadinessScorer - Scores content for AI search visibility
 */
class RAGReadinessScorer {
  
  /**
   * Calculate RAG readiness score
   * @param {Object} analysisData - Compiled analysis data
   * @returns {Object} RAG readiness result
   */
  static score(analysisData) {
    const {
      text = '',
      html = '',
      spoResult = {},
      schemaResult = {},
      headingAnalysis = {}
    } = analysisData;
    
    const components = {
      factualDensity: RAGReadinessScorer._scoreFactualDensity(text),
      structuralClarity: RAGReadinessScorer._scoreStructuralClarity(text, headingAnalysis),
      spoExtractability: spoResult.extractability || 0,
      schemaRichness: schemaResult.richness || 0,
      citationReadiness: RAGReadinessScorer._scoreCitationReadiness(text),
      answerBoxPotential: RAGReadinessScorer._scoreAnswerBoxPotential(text, html)
    };
    
    // Calculate weighted score
    const weights = AEO_CONFIG.RAG.WEIGHTS;
    const totalScore = (
      components.factualDensity * weights.FACTUAL_DENSITY +
      components.structuralClarity * weights.STRUCTURAL_CLARITY +
      components.spoExtractability * weights.SPO_EXTRACTABILITY +
      components.schemaRichness * weights.SCHEMA_RICHNESS +
      components.citationReadiness * weights.CITATION_READINESS +
      components.answerBoxPotential * weights.ANSWER_BOX_POTENTIAL
    );
    
    const score = Math.round(totalScore);
    
    return {
      score: score,
      level: RAGReadinessScorer._getLevel(score),
      components: components,
      aiVisibility: RAGReadinessScorer._getAIVisibility(score),
      recommendations: RAGReadinessScorer._getRecommendations(components)
    };
  }
  
  /**
   * Score factual density
   * @param {string} text - Text content
   * @returns {number} Score (0-100)
   */
  static _scoreFactualDensity(text) {
    if (!text) return 0;
    
    let score = 30; // Base score
    
    // Check for numbers (factual data)
    const numbers = text.match(/\d+(?:,\d{3})*(?:\.\d+)?%?/g) || [];
    score += Math.min(20, numbers.length * 2);
    
    // Check for dates
    const dates = text.match(/\b(?:19|20)\d{2}\b|\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:,\s*\d{4})?/gi) || [];
    score += Math.min(15, dates.length * 5);
    
    // Check for proper nouns (entities)
    const properNouns = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/g) || [];
    score += Math.min(15, properNouns.length);
    
    // Check for comparative data
    if (/\b(more|less|higher|lower|better|worse|faster|slower)\s+than\b/gi.test(text)) {
      score += 10;
    }
    
    // Check for lists/enumeration
    if (/\b(first|second|third|1\.|2\.|3\.|\d+\))\b/gi.test(text)) {
      score += 10;
    }
    
    return Math.min(100, score);
  }
  
  /**
   * Score structural clarity
   * @param {string} text - Text content
   * @param {Object} headingAnalysis - Heading analysis result
   * @returns {number} Score (0-100)
   */
  static _scoreStructuralClarity(text, headingAnalysis) {
    if (!text) return 0;
    
    let score = 20; // Base score
    
    // Heading structure bonus
    if (headingAnalysis.isValid) {
      score += 25;
    }
    
    // Multiple headings bonus
    const headingCount = headingAnalysis.counts?.total || 0;
    score += Math.min(20, headingCount * 3);
    
    // Paragraph structure
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const avgSentenceLength = text.length / Math.max(1, sentences.length);
    
    // Good sentence length (15-25 words avg)
    if (avgSentenceLength >= 60 && avgSentenceLength <= 150) {
      score += 15;
    }
    
    // Check for bullet points/lists in original HTML
    if (/<[uo]l[^>]*>[\s\S]*?<\/[uo]l>/i.test(text)) {
      score += 10;
    }
    
    // Check for clear sections
    if (/\n{2,}/.test(text)) {
      score += 10;
    }
    
    return Math.min(100, score);
  }
  
  /**
   * Score citation readiness
   * @param {string} text - Text content
   * @returns {number} Score (0-100)
   */
  static _scoreCitationReadiness(text) {
    if (!text) return 0;
    
    let score = 20;
    
    // Check for source mentions
    if (/\b(according to|source:|study\s+(by|from)|research\s+(by|from|shows?))\b/gi.test(text)) {
      score += 25;
    }
    
    // Check for quotations
    const quotes = text.match(/"[^"]{20,}"/g) || [];
    score += Math.min(15, quotes.length * 5);
    
    // Check for attributions
    if (/\b(said|stated|reported|found|concluded)\s+(?:that|by)\b/gi.test(text)) {
      score += 15;
    }
    
    // Check for statistics with context
    if (/\d+(?:\.\d+)?%\s+(?:of|more|less|increase|decrease)/gi.test(text)) {
      score += 15;
    }
    
    // Check for expert references
    if (/\b(expert|analyst|professor|doctor|specialist|researcher)\b/gi.test(text)) {
      score += 10;
    }
    
    return Math.min(100, score);
  }
  
  /**
   * Score answer box potential
   * @param {string} text - Text content
   * @param {string} html - HTML content
   * @returns {number} Score (0-100)
   */
  static _scoreAnswerBoxPotential(text, html) {
    if (!text) return 0;
    
    let score = 20;
    
    // Check for question-answer patterns in content
    const questions = text.match(/\?/g) || [];
    score += Math.min(15, questions.length * 3);
    
    // Check for FAQ schema
    if (html && /FAQPage|itemtype.*Question/i.test(html)) {
      score += 25;
    }
    
    // Check for direct answer patterns
    if (/\b(the answer is|in short|to summarize|in summary|simply put)\b/gi.test(text)) {
      score += 15;
    }
    
    // Check for definition patterns
    if (/\b\w+\s+(?:is|are|means|refers to)\s+(?:a|an|the)\s+/gi.test(text)) {
      score += 10;
    }
    
    // Check for step-by-step content
    if (/\b(step\s+\d+|first,|second,|finally,|lastly,)\b/gi.test(text)) {
      score += 15;
    }
    
    return Math.min(100, score);
  }
  
  /**
   * Get level based on score
   * @param {number} score - RAG score
   * @returns {string} Level
   */
  static _getLevel(score) {
    if (score >= AEO_CONFIG.RAG.THRESHOLDS.HIGH) return 'High';
    if (score >= AEO_CONFIG.RAG.THRESHOLDS.MEDIUM) return 'Medium';
    if (score >= AEO_CONFIG.RAG.THRESHOLDS.LOW) return 'Low';
    return 'Very Low';
  }
  
  /**
   * Get AI visibility assessment
   * @param {number} score - RAG score
   * @returns {Object} AI visibility assessment
   */
  static _getAIVisibility(score) {
    if (score >= 75) {
      return {
        status: 'Excellent',
        message: 'Content is highly extractable by AI systems (Perplexity, Gemini, ChatGPT)',
        citationLikelihood: 'High'
      };
    }
    if (score >= 50) {
      return {
        status: 'Good',
        message: 'Content has moderate AI visibility - can be cited with enhancements',
        citationLikelihood: 'Medium'
      };
    }
    if (score >= 25) {
      return {
        status: 'Fair',
        message: 'Content needs significant improvements for AI citation',
        citationLikelihood: 'Low'
      };
    }
    return {
      status: 'Poor',
      message: 'Content is not structured for AI extraction',
      citationLikelihood: 'Very Low'
    };
  }
  
  /**
   * Get recommendations
   * @param {Object} components - Score components
   * @returns {Array} Recommendations
   */
  static _getRecommendations(components) {
    const recommendations = [];
    
    if (components.factualDensity < 50) {
      recommendations.push('Add more factual data: numbers, dates, statistics');
    }
    
    if (components.structuralClarity < 50) {
      recommendations.push('Improve content structure with clear headings and bullet points');
    }
    
    if (components.spoExtractability < 50) {
      recommendations.push('Use clearer "X is Y" definition patterns for AI extraction');
    }
    
    if (components.schemaRichness < 50) {
      recommendations.push('Add FAQ, HowTo, or Article schema markup');
    }
    
    if (components.citationReadiness < 50) {
      recommendations.push('Include source citations and expert attributions');
    }
    
    if (components.answerBoxPotential < 50) {
      recommendations.push('Structure content as Q&A with direct, concise answers');
    }
    
    return recommendations;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 3.3D: SCHEMA.ORG VALIDATOR
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * SchemaValidator - Validates and analyzes JSON-LD Schema.org markup
 */
class SchemaValidator {
  
  /**
   * Validate and analyze schema markup
   * @param {string} html - HTML content
   * @returns {Object} Schema validation result
   */
  static validate(html) {
    if (!html) {
      return SchemaValidator._emptyResult();
    }
    
    // Extract JSON-LD blocks
    const jsonldBlocks = SchemaValidator._extractJsonLD(html);
    
    // Parse and validate each block
    const schemas = [];
    const errors = [];
    
    for (const block of jsonldBlocks) {
      try {
        const parsed = JSON.parse(block);
        const validation = SchemaValidator._validateSchema(parsed);
        schemas.push({
          ...validation,
          raw: block.substring(0, 500) // Truncate for storage
        });
      } catch (e) {
        errors.push({
          message: 'Invalid JSON-LD syntax',
          snippet: block.substring(0, 100)
        });
      }
    }
    
    // Also check for microdata
    const microdataTypes = SchemaValidator._detectMicrodata(html);
    
    // Calculate richness score
    const richness = SchemaValidator._calculateRichness(schemas, microdataTypes);
    
    return {
      hasSchema: schemas.length > 0 || microdataTypes.length > 0,
      jsonLD: {
        count: schemas.length,
        schemas: schemas
      },
      microdata: {
        count: microdataTypes.length,
        types: microdataTypes
      },
      errors: errors,
      richness: richness,
      recommendations: SchemaValidator._getRecommendations(schemas, microdataTypes)
    };
  }
  
  /**
   * Extract JSON-LD script blocks
   * @param {string} html - HTML content
   * @returns {Array} JSON-LD content strings
   */
  static _extractJsonLD(html) {
    const regex = /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    const blocks = [];
    
    let match;
    while ((match = regex.exec(html)) !== null) {
      const content = match[1].trim();
      if (content) {
        blocks.push(content);
      }
    }
    
    return blocks;
  }
  
  /**
   * Validate a parsed schema object
   * @param {Object} schema - Parsed schema
   * @returns {Object} Validation result
   */
  static _validateSchema(schema) {
    // Handle @graph arrays
    const items = schema['@graph'] ? schema['@graph'] : [schema];
    const types = [];
    const issues = [];
    
    for (const item of items) {
      const type = item['@type'];
      if (!type) continue;
      
      const typeNames = Array.isArray(type) ? type : [type];
      
      for (const typeName of typeNames) {
        types.push(typeName);
        
        // Check required fields
        const requiredFields = AEO_CONFIG.SCHEMA.REQUIRED_FIELDS[typeName] || [];
        for (const field of requiredFields) {
          if (!item[field]) {
            issues.push({
              type: typeName,
              field: field,
              severity: 'warning',
              message: `Missing recommended field: ${field}`
            });
          }
        }
        
        // Check for priority types
        if (AEO_CONFIG.SCHEMA.PRIORITY_TYPES.includes(typeName)) {
          types.push({ name: typeName, priority: true });
        }
      }
    }
    
    return {
      types: [...new Set(types.filter(t => typeof t === 'string'))],
      isValid: issues.filter(i => i.severity === 'error').length === 0,
      issues: issues,
      hasPriorityType: types.some(t => 
        typeof t === 'string' && AEO_CONFIG.SCHEMA.PRIORITY_TYPES.includes(t)
      )
    };
  }
  
  /**
   * Detect microdata schema types
   * @param {string} html - HTML content
   * @returns {Array} Detected types
   */
  static _detectMicrodata(html) {
    const types = [];
    const typeRegex = /itemtype=["']https?:\/\/schema\.org\/([^"']+)["']/gi;
    
    let match;
    while ((match = typeRegex.exec(html)) !== null) {
      types.push(match[1]);
    }
    
    return [...new Set(types)];
  }
  
  /**
   * Calculate schema richness score
   * @param {Array} schemas - Validated schemas
   * @param {Array} microdataTypes - Microdata types
   * @returns {number} Richness score (0-100)
   */
  static _calculateRichness(schemas, microdataTypes) {
    let score = 0;
    
    // Base score for having any schema
    if (schemas.length > 0 || microdataTypes.length > 0) {
      score += 25;
    }
    
    // Bonus for JSON-LD (preferred format)
    if (schemas.length > 0) {
      score += 15;
    }
    
    // Collect all types
    const allTypes = new Set();
    for (const schema of schemas) {
      for (const type of schema.types) {
        allTypes.add(type);
      }
    }
    for (const type of microdataTypes) {
      allTypes.add(type);
    }
    
    // Bonus for priority types
    const priorityCount = [...allTypes].filter(t => 
      AEO_CONFIG.SCHEMA.PRIORITY_TYPES.includes(t)
    ).length;
    score += Math.min(30, priorityCount * 10);
    
    // Bonus for type diversity
    score += Math.min(20, allTypes.size * 5);
    
    // Bonus for valid schemas
    const validSchemas = schemas.filter(s => s.isValid).length;
    score += Math.min(10, validSchemas * 5);
    
    return Math.min(100, score);
  }
  
  /**
   * Get schema recommendations
   * @param {Array} schemas - Validated schemas
   * @param {Array} microdataTypes - Microdata types
   * @returns {Array} Recommendations
   */
  static _getRecommendations(schemas, microdataTypes) {
    const recommendations = [];
    const allTypes = new Set();
    
    for (const schema of schemas) {
      for (const type of schema.types) {
        allTypes.add(type);
      }
    }
    for (const type of microdataTypes) {
      allTypes.add(type);
    }
    
    if (allTypes.size === 0) {
      recommendations.push('Add JSON-LD schema markup (Article, FAQ, or Organization recommended)');
    }
    
    if (!allTypes.has('Article') && !allTypes.has('NewsArticle') && !allTypes.has('BlogPosting')) {
      recommendations.push('Consider adding Article schema for content pages');
    }
    
    if (!allTypes.has('FAQ') && !allTypes.has('FAQPage')) {
      recommendations.push('Add FAQPage schema for question-based content');
    }
    
    if (!allTypes.has('Organization') && !allTypes.has('LocalBusiness')) {
      recommendations.push('Add Organization schema for brand authority');
    }
    
    if (!allTypes.has('BreadcrumbList')) {
      recommendations.push('Add BreadcrumbList schema for navigation context');
    }
    
    return recommendations;
  }
  
  /**
   * Empty result structure
   */
  static _emptyResult() {
    return {
      hasSchema: false,
      jsonLD: { count: 0, schemas: [] },
      microdata: { count: 0, types: [] },
      errors: [],
      richness: 0,
      recommendations: ['Add JSON-LD schema markup for AI visibility']
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 3.3E: PII SCRUBBER INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * PIIIntegration - Integrates with Governance module's PII scrubber
 */
class PIIIntegration {
  
  /**
   * Scrub PII from text using Governance module
   * @param {string} text - Text to scrub
   * @returns {Object} Scrub result
   */
  static scrub(text) {
    if (!text) {
      return { scrubbed: '', piiRemoved: 0, types: [] };
    }
    
    // Try to use Governance module's PIIScrubber if available
    try {
      if (typeof PIIScrubber !== 'undefined') {
        const scrubber = new PIIScrubber();
        return scrubber.scrub(text);
      }
    } catch (e) {
      console.warn('⚠️ Governance PIIScrubber not available, using fallback');
    }
    
    // Fallback PII scrubber
    return PIIIntegration._fallbackScrub(text);
  }
  
  /**
   * Fallback PII scrubber
   * @param {string} text - Text to scrub
   * @returns {Object} Scrub result
   */
  static _fallbackScrub(text) {
    const patterns = [
      { type: 'email', regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, replacement: '[EMAIL]' },
      { type: 'phone', regex: /\b(?:\+?1[-.]?)?\(?[0-9]{3}\)?[-.]?[0-9]{3}[-.]?[0-9]{4}\b/g, replacement: '[PHONE]' },
      { type: 'ssn', regex: /\b\d{3}[-]?\d{2}[-]?\d{4}\b/g, replacement: '[SSN]' },
      { type: 'credit_card', regex: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g, replacement: '[CARD]' },
      { type: 'ip_address', regex: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g, replacement: '[IP]' }
    ];
    
    let scrubbed = text;
    let totalRemoved = 0;
    const typesRemoved = [];
    
    for (const { type, regex, replacement } of patterns) {
      const matches = scrubbed.match(regex);
      if (matches) {
        totalRemoved += matches.length;
        typesRemoved.push({ type, count: matches.length });
        scrubbed = scrubbed.replace(regex, replacement);
      }
    }
    
    return {
      scrubbed: scrubbed,
      piiRemoved: totalRemoved,
      types: typesRemoved
    };
  }
  
  /**
   * Scrub PII from SPO triplets
   * @param {Array} triplets - SPO triplets
   * @returns {Object} Scrubbed triplets with stats
   */
  static scrubTriplets(triplets) {
    if (!triplets || triplets.length === 0) {
      return { triplets: [], piiRemoved: 0 };
    }
    
    let totalRemoved = 0;
    const scrubbedTriplets = [];
    
    for (const triplet of triplets) {
      const subjectResult = PIIIntegration.scrub(triplet.subject);
      const objectResult = PIIIntegration.scrub(triplet.object);
      
      totalRemoved += subjectResult.piiRemoved + objectResult.piiRemoved;
      
      scrubbedTriplets.push({
        ...triplet,
        subject: subjectResult.scrubbed,
        object: objectResult.scrubbed,
        piiScrubbed: subjectResult.piiRemoved + objectResult.piiRemoved > 0
      });
    }
    
    return {
      triplets: scrubbedTriplets,
      piiRemoved: totalRemoved
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 3.3F: AI READINESS ENGINE (MAIN CLASS)
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * AIReadinessAuditor - Main orchestrator for AI/AEO analysis
 */
class AIReadinessAuditor {
  
  /**
   * Perform complete AI readiness audit
   * @param {string} html - Raw HTML content
   * @param {string} url - Page URL
   * @param {Object} options - Analysis options
   * @returns {Object} Complete AI readiness analysis
   */
  analyze(html, url = '', options = {}) {
    console.log(`🤖 AI Auditor: Analyzing AI/AEO readiness...`);
    const startTime = Date.now();
    
    if (!html) {
      return this._emptyResult('No HTML content provided');
    }
    
    try {
      // Extract clean text
      const text = this._extractCleanText(html);
      
      // Get heading analysis if available from semantic engine
      let headingAnalysis = options.headingAnalysis || {};
      if (!headingAnalysis.counts && typeof HeadingAuditor !== 'undefined') {
        headingAnalysis = HeadingAuditor.analyze(html);
      }
      
      // 1. Extract SPO triplets
      const spoResult = SPOExtractor.extract(text);
      
      // 2. Scrub PII from triplets
      const scrubbedTriplets = PIIIntegration.scrubTriplets(spoResult.triplets);
      
      // 3. Validate schema
      const schemaResult = SchemaValidator.validate(html);
      
      // 4. Calculate RAG readiness
      const ragResult = RAGReadinessScorer.score({
        text: text,
        html: html,
        spoResult: { ...spoResult, extractability: spoResult.extractability },
        schemaResult: { richness: schemaResult.richness },
        headingAnalysis: headingAnalysis
      });
      
      // 5. Calculate overall AEO score
      const aeoScore = this._calculateAEOScore(spoResult, schemaResult, ragResult);
      
      const duration = Date.now() - startTime;
      console.log(`✅ AI Auditor: Analysis complete (AEO Score: ${aeoScore.score}) in ${duration}ms`);
      
      return {
        success: true,
        url: url,
        aeoScore: aeoScore,
        spo: {
          triplets: scrubbedTriplets.triplets,
          count: scrubbedTriplets.triplets.length,
          extractability: spoResult.extractability,
          byType: spoResult.byType,
          piiRemoved: scrubbedTriplets.piiRemoved
        },
        schema: schemaResult,
        ragReadiness: ragResult,
        aiVisibility: ragResult.aiVisibility,
        processingTime: duration
      };
      
    } catch (e) {
      console.error(`❌ AI Auditor: Analysis failed: ${e.message}`);
      return this._emptyResult(e.message);
    }
  }
  
  /**
   * Extract clean text from HTML
   * @param {string} html - HTML content
   * @returns {string} Clean text
   */
  _extractCleanText(html) {
    let text = html;
    
    // Remove scripts and styles
    text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ');
    text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ');
    text = text.replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, ' ');
    
    // Remove HTML tags
    text = text.replace(/<[^>]+>/g, ' ');
    
    // Decode entities
    text = text.replace(/&nbsp;/g, ' ')
               .replace(/&amp;/g, '&')
               .replace(/&lt;/g, '<')
               .replace(/&gt;/g, '>')
               .replace(/&quot;/g, '"')
               .replace(/&#39;/g, "'");
    
    // Normalize whitespace
    text = text.replace(/\s+/g, ' ').trim();
    
    return text;
  }
  
  /**
   * Calculate overall AEO score
   * @param {Object} spoResult - SPO extraction result
   * @param {Object} schemaResult - Schema validation result
   * @param {Object} ragResult - RAG readiness result
   * @returns {Object} AEO score
   */
  _calculateAEOScore(spoResult, schemaResult, ragResult) {
    const weights = {
      rag: 0.40,
      schema: 0.30,
      spo: 0.30
    };
    
    const score = Math.round(
      ragResult.score * weights.rag +
      schemaResult.richness * weights.schema +
      spoResult.extractability * weights.spo
    );
    
    return {
      score: score,
      grade: this._getGrade(score),
      level: ragResult.level,
      breakdown: {
        ragReadiness: ragResult.score,
        schemaRichness: schemaResult.richness,
        spoExtractability: spoResult.extractability
      }
    };
  }
  
  /**
   * Get letter grade
   * @param {number} score - AEO score
   * @returns {string} Letter grade
   */
  _getGrade(score) {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  }
  
  /**
   * Empty result structure
   * @param {string} error - Error message
   */
  _emptyResult(error) {
    return {
      success: false,
      error: error,
      aeoScore: { score: 0, grade: 'F', level: 'Very Low' },
      spo: { triplets: [], count: 0, extractability: 0 },
      schema: SchemaValidator._emptyResult(),
      ragReadiness: { score: 0, level: 'Very Low' },
      aiVisibility: { status: 'Unknown', citationLikelihood: 'Unknown' }
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 3.3G: GLOBAL AI AUDITOR FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Get AI auditor instance
 * @returns {AIReadinessAuditor}
 */
function getAIAuditor() {
  return new AIReadinessAuditor();
}

/**
 * Analyze page AI/AEO readiness
 * @param {string} html - HTML content
 * @param {string} url - Page URL
 * @param {Object} options - Analysis options
 * @returns {Object} AI readiness analysis
 */
function analyzeAIReadiness(html, url, options) {
  const auditor = getAIAuditor();
  return auditor.analyze(html, url, options);
}

/**
 * Extract SPO triplets from text
 * @param {string} text - Text content
 * @returns {Object} SPO extraction result
 */
function extractSPOTriplets(text) {
  return SPOExtractor.extract(text);
}

/**
 * Validate schema markup
 * @param {string} html - HTML content
 * @returns {Object} Schema validation result
 */
function validateSchema(html) {
  return SchemaValidator.validate(html);
}

/**
 * Calculate RAG readiness score
 * @param {Object} analysisData - Analysis data
 * @returns {Object} RAG readiness result
 */
function calculateRAGReadiness(analysisData) {
  return RAGReadinessScorer.score(analysisData);
}

/**
 * Scrub PII from text
 * @param {string} text - Text to scrub
 * @returns {Object} Scrub result
 */
function scrubPII(text) {
  return PIIIntegration.scrub(text);
}

/**
 * Test AI auditor with sample content
 */
function testAIAuditor() {
  const sampleHtml = `
    <html>
    <head>
      <title>What is a Casino Bonus? Complete Guide 2024</title>
      <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [{
          "@type": "Question",
          "name": "What is a casino bonus?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "A casino bonus is free money or spins given by online casinos to attract new players."
          }
        }]
      }
      </script>
    </head>
    <body>
      <h1>What is a Casino Bonus?</h1>
      <p>A casino bonus is a promotional offer provided by online gambling sites. According to industry research, 95% of online casinos offer welcome bonuses.</p>
      <h2>Types of Casino Bonuses</h2>
      <p>The most common types include welcome bonuses, free spins, and reload bonuses. In 2024, the average welcome bonus is $500.</p>
      <h3>How do casino bonuses work?</h3>
      <p>Casino bonuses require wagering requirements before withdrawal. The standard wagering requirement is 35x the bonus amount.</p>
    </body>
    </html>
  `;
  
  const result = analyzeAIReadiness(sampleHtml, 'https://example.com/casino-bonus-guide');
  console.log('AI Readiness Analysis Result:', JSON.stringify(result, null, 2));
  return result;
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 3.3H: COMBINED FORENSIC PARSER ORCHESTRATOR
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * ForensicParserOrchestrator - Combines all parser sub-modules
 * Integrates: Semantic (3.1) + Trust (3.2) + AI (3.3)
 */
class ForensicParserOrchestrator {
  
  constructor() {
    this.semanticEngine = typeof SemanticIntelligenceEngine !== 'undefined' 
      ? new SemanticIntelligenceEngine() 
      : null;
    this.trustEngine = typeof TrustAuthorityEngine !== 'undefined'
      ? new TrustAuthorityEngine()
      : null;
    this.aiAuditor = new AIReadinessAuditor();
  }
  
  /**
   * Perform complete forensic analysis
   * @param {string} html - Raw HTML content
   * @param {string} url - Page URL
   * @param {Object} options - Analysis options
   * @returns {Object} Complete forensic analysis
   */
  analyze(html, url = '', options = {}) {
    console.log(`🔬 Forensic Parser: Starting comprehensive analysis of ${url}...`);
    const startTime = Date.now();
    
    if (!html) {
      return { success: false, error: 'No HTML content provided' };
    }
    
    const results = {
      url: url,
      timestamp: new Date().toISOString(),
      semantic: null,
      trust: null,
      ai: null
    };
    
    try {
      // 1. Semantic Analysis
      if (this.semanticEngine) {
        results.semantic = this.semanticEngine.analyze(html, url);
      } else {
        console.warn('⚠️ Semantic Engine not available');
      }
      
      // 2. Trust Analysis
      if (this.trustEngine) {
        results.trust = this.trustEngine.analyze(html, url, {
          targetKeyword: options.targetKeyword || '',
          brandName: options.brandName || ''
        });
      } else {
        console.warn('⚠️ Trust Engine not available');
      }
      
      // 3. AI/AEO Analysis
      results.ai = this.aiAuditor.analyze(html, url, {
        headingAnalysis: results.semantic?.headingAnalysis
      });
      
      // 4. Compile unified metrics
      const unifiedMetrics = this._compileUnifiedMetrics(results);
      
      // 5. Scrub any remaining PII
      const piiResult = PIIIntegration.scrub(JSON.stringify(unifiedMetrics));
      
      const duration = Date.now() - startTime;
      console.log(`✅ Forensic Parser: Analysis complete in ${duration}ms`);
      
      return {
        success: true,
        url: url,
        timestamp: results.timestamp,
        processingTime: duration,
        metrics: unifiedMetrics,
        semantic: results.semantic,
        trust: results.trust,
        ai: results.ai,
        compliance: {
          piiScrubbed: piiResult.piiRemoved > 0,
          piiItemsRemoved: piiResult.piiRemoved
        }
      };
      
    } catch (e) {
      console.error(`❌ Forensic Parser: Analysis failed: ${e.message}`);
      return {
        success: false,
        error: e.message,
        url: url
      };
    }
  }
  
  /**
   * Compile unified metrics from all analyses
   * @param {Object} results - Individual analysis results
   * @returns {Object} Unified metrics
   */
  _compileUnifiedMetrics(results) {
    return {
      // Core scores
      syntheticKD: results.trust?.syntheticKD?.syntheticKD || 0,
      eeatScore: results.trust?.eeat?.overall?.score || 0,
      aeoScore: results.ai?.aeoScore?.score || 0,
      ragReadiness: results.ai?.ragReadiness?.score || 0,
      
      // Content metrics
      wordCount: results.semantic?.wordCount || 0,
      keywordCount: results.semantic?.keywordCount || 0,
      headingScore: results.semantic?.headingAnalysis?.scores?.overall || 0,
      
      // Trust metrics
      trustScore: results.trust?.overallTrust?.score || 0,
      linkHealth: results.trust?.linkForensics?.health?.score || 0,
      anchorDiversity: results.trust?.anchorDiversity?.diversityScore || 0,
      
      // AI metrics
      spoCount: results.ai?.spo?.count || 0,
      spoExtractability: results.ai?.spo?.extractability || 0,
      schemaRichness: results.ai?.schema?.richness || 0,
      
      // Grades
      grades: {
        eeat: results.trust?.eeat?.grade || 'N/A',
        trust: results.trust?.overallTrust?.grade || 'N/A',
        aeo: results.ai?.aeoScore?.grade || 'N/A'
      },
      
      // Intent distribution
      intentDistribution: results.semantic?.intentDistribution || {},
      
      // Top keywords (first 10 for summary)
      topKeywords: (results.semantic?.keywords || []).slice(0, 10).map(k => ({
        keyword: k.keyword,
        intent: k.intent,
        volume: k.estimatedVolume
      }))
    };
  }
}

/**
 * Get forensic parser orchestrator instance
 * @returns {ForensicParserOrchestrator}
 */
function getForensicParser() {
  return new ForensicParserOrchestrator();
}

/**
 * Perform complete forensic analysis
 * @param {string} html - HTML content
 * @param {string} url - Page URL
 * @param {Object} options - Options
 * @returns {Object} Complete analysis
 */
function analyzePageForensics(html, url, options) {
  const parser = getForensicParser();
  return parser.analyze(html, url, options);
}

/**
 * Test complete forensic parser
 */
function testForensicParser() {
  const sampleHtml = `
    <html>
    <head>
      <title>Best Online Casinos 2024 - Expert Reviews</title>
      <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "Best Online Casinos 2024",
        "author": {"@type": "Person", "name": "John Expert"},
        "datePublished": "2024-01-15"
      }
      </script>
    </head>
    <body>
      <h1>Best Online Casinos for Real Money in 2024</h1>
      <div class="author">Written by John Expert, 15 years experience</div>
      <p>I've personally tested over 100 online casinos to bring you this comprehensive guide.</p>
      <h2>How We Review Online Casinos</h2>
      <p>Our review process is rigorous. According to our research, only 5% of casinos meet our standards.</p>
      <h2>Top 10 Casino Bonuses</h2>
      <p>The best casino bonus is a welcome offer that matches your first deposit. The average bonus is $500.</p>
      <h3>What is a no deposit bonus?</h3>
      <p>A no deposit bonus is free money given without requiring a deposit. MGA licensed casinos are recommended.</p>
      <a href="/reviews">Casino Reviews</a>
      <a href="/bonuses">Bonus Guide</a>
      <footer>
        <p>123 Gaming Street, Las Vegas, NV 89101</p>
        <a href="/privacy">Privacy Policy</a>
      </footer>
    </body>
    </html>
  `;
  
  const result = analyzePageForensics(
    sampleHtml,
    'https://example.com/best-casinos',
    { targetKeyword: 'best online casinos', brandName: 'example' }
  );
  
  console.log('Complete Forensic Analysis:', JSON.stringify(result, null, 2));
  return result;
}
