/**
 * COMPETITOR ANALYSIS - CATEGORY X: GEO + AEO INTELLIGENCE
 * AI citation density, prompt visibility, factual integrity, LLM affinity, answer authority
 * APIs: Serper (AI search patterns, knowledge graph), Fetcher (content analysis)
 */

/**
 * Main function: Analyze GEO + AEO intelligence
 * @param {object} params - { domain, url }
 * @return {object} GEO/AEO analysis
 */
function COMP_analyzeGeoAeo(params) {
  var domain = params.domain;
  var url = params.url;
  
  try {
    var result = {
      ok: true,
      domain: domain,
      url: url,
      aiCitationDensity: COMP_analyzeAICitationDensity(domain),
      promptVisibility: COMP_analyzePromptVisibility(domain),
      factualIntegrity: COMP_analyzeFactualIntegrity(url),
      conversationalAnswers: COMP_analyzeConversationalAnswers(domain),
      zeroClickFootprint: COMP_analyzeZeroClickFootprint(domain),
      llmAffinity: COMP_analyzeLLMAffinity(url),
      answerAuthority: COMP_analyzeAnswerAuthority(domain)
    };
    
    return result;
    
  } catch (e) {
    Logger.log('Error in COMP_analyzeGeoAeo: ' + e);
    return { ok: false, error: String(e), domain: domain };
  }
}

/**
 * Analyze AI citation density
 */
function COMP_analyzeAICitationDensity(domain) {
  try {
    var citations = {
      gemini: 0,
      perplexity: 0,
      chatGPT: 0,
      citationCount: 0
    };
    
    // Search for AI platform mentions
    var aiSearch = APIS_serperSearch({
      q: domain + ' AI OR ChatGPT OR Gemini OR Perplexity',
      num: 10
    });
    
    if (aiSearch && aiSearch.ok && aiSearch.searchInformation) {
      // Estimate citations based on search volume
      citations.citationCount = Math.min(1000, Math.round((aiSearch.searchInformation.totalResults || 0) / 100));
      
      // Distribute across platforms (rough estimate)
      citations.chatGPT = Math.round(citations.citationCount * 0.5);
      citations.gemini = Math.round(citations.citationCount * 0.3);
      citations.perplexity = Math.round(citations.citationCount * 0.2);
    }
    
    return citations;
    
  } catch (e) {
    Logger.log('Error in COMP_analyzeAICitationDensity: ' + e);
    return { gemini: 0, perplexity: 0, chatGPT: 0, citationCount: 0 };
  }
}

/**
 * Analyze prompt visibility
 */
function COMP_analyzePromptVisibility(domain) {
  try {
    var promptVisibility = {
      queriesTriggeringMention: [],
      promptTriggerPercent: 0
    };
    
    // Search for common prompts that mention domain
    var queryTypes = [
      'what is ' + domain.split('.')[0],
      'how to use ' + domain.split('.')[0],
      'best ' + domain.split('.')[0] + ' alternative',
      domain.split('.')[0] + ' vs',
      domain.split('.')[0] + ' review'
    ];
    
    var triggeredCount = 0;
    
    for (var i = 0; i < queryTypes.length; i++) {
      var query = queryTypes[i];
      var searchData = APIS_serperSearch({ q: query, num: 5 });
      
      if (searchData && searchData.ok && searchData.organic) {
        // Check if domain appears in top 5
        for (var j = 0; j < searchData.organic.length; j++) {
          var link = searchData.organic[j].link || '';
          if (link.indexOf(domain) !== -1) {
            promptVisibility.queriesTriggeringMention.push(query);
            triggeredCount++;
            break;
          }
        }
      }
    }
    
    promptVisibility.promptTriggerPercent = Math.round((triggeredCount / queryTypes.length) * 100);
    
    return promptVisibility;
    
  } catch (e) {
    Logger.log('Error in COMP_analyzePromptVisibility: ' + e);
    return { queriesTriggeringMention: [], promptTriggerPercent: 0 };
  }
}

/**
 * Analyze factual integrity
 */
function COMP_analyzeFactualIntegrity(url) {
  try {
    var integrity = {
      accuracyScore: 0,
      trustSignals: [],
      factReliabilityPercent: 0
    };
    
    // Fetch page content
    var pageData = FET_handle({ action: 'fetchSingleUrl', url: url });
    
    if (pageData && pageData.ok && pageData.html) {
      var html = pageData.html.toLowerCase();
      
      // Check for trust signals
      var trustSignals = [
        { signal: 'sources cited', pattern: 'source' },
        { signal: 'references', pattern: 'reference' },
        { signal: 'citations', pattern: 'citation' },
        { signal: 'peer-reviewed', pattern: 'peer' },
        { signal: 'verified', pattern: 'verified' },
        { signal: 'certified', pattern: 'certified' }
      ];
      
      var signalsFound = 0;
      for (var i = 0; i < trustSignals.length; i++) {
        if (html.indexOf(trustSignals[i].pattern) !== -1) {
          integrity.trustSignals.push(trustSignals[i].signal);
          signalsFound++;
        }
      }
      
      // Calculate scores
      integrity.accuracyScore = Math.min(100, signalsFound * 20);
      integrity.factReliabilityPercent = integrity.accuracyScore;
    }
    
    return integrity;
    
  } catch (e) {
    Logger.log('Error in COMP_analyzeFactualIntegrity: ' + e);
    return { accuracyScore: 0, trustSignals: [], factReliabilityPercent: 0 };
  }
}

/**
 * Analyze conversational answers (voice assistant readiness)
 */
function COMP_analyzeConversationalAnswers(domain) {
  try {
    var conversational = {
      voiceAssistantInterpretation: [],
      answerAccuracyPercent: 0
    };
    
    // Search for FAQ/question-based content
    var faqSearch = APIS_serperSearch({
      q: 'site:' + domain + ' FAQ OR "frequently asked" OR "common questions"',
      num: 10
    });
    
    if (faqSearch && faqSearch.ok && faqSearch.organic) {
      conversational.voiceAssistantInterpretation.push('FAQ section detected - voice-ready');
      conversational.answerAccuracyPercent = 75;
    }
    
    // Check for structured Q&A format
    var qaSearch = APIS_serperSearch({
      q: 'site:' + domain + ' "what is" OR "how to"',
      num: 10
    });
    
    if (qaSearch && qaSearch.ok && qaSearch.searchInformation) {
      var qaCount = qaSearch.searchInformation.totalResults || 0;
      if (qaCount > 10) {
        conversational.voiceAssistantInterpretation.push('Q&A content format');
        conversational.answerAccuracyPercent = Math.min(100, conversational.answerAccuracyPercent + 25);
      }
    }
    
    return conversational;
    
  } catch (e) {
    Logger.log('Error in COMP_analyzeConversationalAnswers: ' + e);
    return { voiceAssistantInterpretation: [], answerAccuracyPercent: 0 };
  }
}

/**
 * Analyze zero-click footprint
 */
function COMP_analyzeZeroClickFootprint(domain) {
  try {
    var zeroClick = {
      knowledgeGraphPresence: false,
      instantAnswers: [],
      zeroClickRatePercent: 0
    };
    
    // Search for brand
    var brandSearch = APIS_serperSearch({
      q: domain.split('.')[0],
      num: 10
    });
    
    if (brandSearch && brandSearch.ok) {
      // Check for knowledge graph
      if (brandSearch.knowledgeGraph) {
        zeroClick.knowledgeGraphPresence = true;
        zeroClick.zeroClickRatePercent += 40;
      }
      
      // Check for featured snippets
      if (brandSearch.answerBox) {
        zeroClick.instantAnswers.push('Featured snippet');
        zeroClick.zeroClickRatePercent += 30;
      }
      
      // Check for People Also Ask
      if (brandSearch.relatedQuestions && brandSearch.relatedQuestions.length > 0) {
        zeroClick.instantAnswers.push('People Also Ask');
        zeroClick.zeroClickRatePercent += 30;
      }
    }
    
    return zeroClick;
    
  } catch (e) {
    Logger.log('Error in COMP_analyzeZeroClickFootprint: ' + e);
    return { knowledgeGraphPresence: false, instantAnswers: [], zeroClickRatePercent: 0 };
  }
}

/**
 * Analyze LLM affinity
 */
function COMP_analyzeLLMAffinity(url) {
  try {
    var llmAffinity = {
      vectorSimilarity: 0,
      embeddingScore: 0
    };
    
    // Fetch content for analysis
    var pageData = FET_handle({ action: 'fetchSingleUrl', url: url });
    
    if (pageData && pageData.ok && pageData.html) {
      var html = pageData.html.toLowerCase();
      
      // Check for LLM-friendly content patterns
      var llmPatterns = [
        'clear definitions',
        'structured format',
        'bullet points',
        'numbered lists',
        'concise explanations',
        'factual content'
      ];
      
      var patternScore = 0;
      
      // Check for definition-style content
      if (html.indexOf('is a') !== -1 || html.indexOf('refers to') !== -1) patternScore += 20;
      
      // Check for lists
      if (html.indexOf('<ul>') !== -1 || html.indexOf('<ol>') !== -1) patternScore += 20;
      
      // Check for headings (structure)
      if (html.indexOf('<h2>') !== -1 && html.indexOf('<h3>') !== -1) patternScore += 20;
      
      // Check for concise paragraphs
      var paragraphs = html.split('</p>').length - 1;
      if (paragraphs > 5) patternScore += 20;
      
      // Check for factual tone (no promotional language)
      if (html.indexOf('buy now') === -1 && html.indexOf('limited time') === -1) patternScore += 20;
      
      llmAffinity.vectorSimilarity = Math.min(100, patternScore);
      llmAffinity.embeddingScore = llmAffinity.vectorSimilarity;
    }
    
    return llmAffinity;
    
  } catch (e) {
    Logger.log('Error in COMP_analyzeLLMAffinity: ' + e);
    return { vectorSimilarity: 0, embeddingScore: 0 };
  }
}

/**
 * Analyze answer authority
 */
function COMP_analyzeAnswerAuthority(domain) {
  try {
    var answerAuthority = {
      aiSummariesSourced: 0,
      authorityPercent: 0
    };
    
    // Search for citations
    var citationSearch = APIS_serperSearch({
      q: domain + ' cited OR referenced OR source',
      num: 10
    });
    
    if (citationSearch && citationSearch.ok && citationSearch.searchInformation) {
      answerAuthority.aiSummariesSourced = Math.min(100, Math.round((citationSearch.searchInformation.totalResults || 0) / 100));
      answerAuthority.authorityPercent = answerAuthority.aiSummariesSourced;
    }
    
    return answerAuthority;
    
  } catch (e) {
    Logger.log('Error in COMP_analyzeAnswerAuthority: ' + e);
    return { aiSummariesSourced: 0, authorityPercent: 0 };
  }
}
