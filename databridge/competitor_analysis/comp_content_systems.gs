/**
 * COMPETITOR ANALYSIS - CATEGORY VI: CONTENT SYSTEMS & OPERATIONS
 * Framework reverse engineering, AI workflow detection, prompt patterns, E-E-A-T integration
 * APIs: Fetcher (content structure), Serper (author info)
 */

/**
 * Main function: Analyze content systems
 * @param {object} params - { domain, url }
 * @return {object} Content systems analysis
 */
function COMP_analyzeContentSystems(params) {
  var domain = params.domain;
  var url = params.url;
  
  try {
    var result = {
      ok: true,
      domain: domain,
      url: url,
      frameworkReverseEngineering: COMP_reverseEngineerFramework(domain, url),
      aiWorkflowDetection: COMP_detectAIWorkflow(url),
      promptEngineering: COMP_analyzePromptPatterns(url),
      eeatIntegration: COMP_analyzeEEATIntegration(url),
      internalLinking: COMP_analyzeInternalLinking(url),
      editorialExpansion: COMP_analyzeEditorialExpansion(domain)
    };
    
    return result;
    
  } catch (e) {
    Logger.log('Error in COMP_analyzeContentSystems: ' + e);
    return { ok: false, error: String(e), domain: domain };
  }
}

/**
 * Reverse engineer content framework
 */
function COMP_reverseEngineerFramework(domain, url) {
  try {
    var framework = {
      briefToPublishPipeline: '',
      workflowMaturityScore: 0
    };
    
    // Analyze page structure to infer workflow
    var headingsData = FET_handle({ action: 'extractHeadings', url: url });
    
    if (headingsData && headingsData.ok && headingsData.headings) {
      var h2Count = 0, h3Count = 0;
      
      for (var i = 0; i < headingsData.headings.length; i++) {
        if (headingsData.headings[i].level === 'h2') h2Count++;
        if (headingsData.headings[i].level === 'h3') h3Count++;
      }
      
      // Infer pipeline from structure consistency
      if (h2Count >= 5 && h3Count >= 10) {
        framework.briefToPublishPipeline = 'Advanced: Structured outline → AI draft → Human edit → Publish';
        framework.workflowMaturityScore = 85;
      } else if (h2Count >= 3) {
        framework.briefToPublishPipeline = 'Intermediate: Basic outline → Draft → Publish';
        framework.workflowMaturityScore = 60;
      } else {
        framework.briefToPublishPipeline = 'Basic: Ad-hoc content creation';
        framework.workflowMaturityScore = 35;
      }
    }
    
    return framework;
    
  } catch (e) {
    Logger.log('Error in COMP_reverseEngineerFramework: ' + e);
    return { briefToPublishPipeline: '', workflowMaturityScore: 0 };
  }
}

/**
 * Detect AI workflow patterns
 */
function COMP_detectAIWorkflow(url) {
  try {
    var aiWorkflow = {
      templates: [],
      automationPatterns: [],
      automationRatioPercent: 0
    };
    
    // Fetch page content
    var pageData = FET_handle({ action: 'fetchSingleUrl', url: url });
    
    if (pageData && pageData.ok && pageData.html) {
      var html = pageData.html.toLowerCase();
      
      // Detect template patterns
      if (html.indexOf('table of contents') !== -1) {
        aiWorkflow.templates.push('Structured TOC template');
      }
      if (html.indexOf('what is') !== -1 && html.indexOf('how to') !== -1 && html.indexOf('benefits') !== -1) {
        aiWorkflow.templates.push('FAQ/Guide template');
      }
      if (html.indexOf('pros and cons') !== -1 || html.indexOf('advantages and disadvantages') !== -1) {
        aiWorkflow.templates.push('Comparison template');
      }
      
      // Detect automation patterns (repeated phrases)
      var automationPhrases = ['in this article', 'we will explore', 'let\'s dive in', 'it\'s important to'];
      for (var i = 0; i < automationPhrases.length; i++) {
        if (html.indexOf(automationPhrases[i]) !== -1) {
          aiWorkflow.automationPatterns.push(automationPhrases[i]);
        }
      }
      
      // Calculate automation ratio
      aiWorkflow.automationRatioPercent = Math.round((aiWorkflow.automationPatterns.length / automationPhrases.length) * 100);
    }
    
    return aiWorkflow;
    
  } catch (e) {
    Logger.log('Error in COMP_detectAIWorkflow: ' + e);
    return { templates: [], automationPatterns: [], automationRatioPercent: 0 };
  }
}

/**
 * Analyze prompt engineering patterns
 */
function COMP_analyzePromptPatterns(url) {
  try {
    var prompts = {
      recurringPromptStyles: [],
      promptPatternCount: 0
    };
    
    // Fetch content
    var pageData = FET_handle({ action: 'fetchSingleUrl', url: url });
    
    if (pageData && pageData.ok && pageData.html) {
      var html = pageData.html.toLowerCase();
      
      // Detect prompt signatures
      var promptSignatures = [
        { pattern: 'comprehensive guide', style: 'Comprehensive explainer prompt' },
        { pattern: 'step-by-step', style: 'Tutorial/how-to prompt' },
        { pattern: 'everything you need to know', style: 'Complete overview prompt' },
        { pattern: 'ultimate guide', style: 'Definitive resource prompt' },
        { pattern: 'beginner\'s guide', style: 'Beginner-focused prompt' }
      ];
      
      for (var i = 0; i < promptSignatures.length; i++) {
        if (html.indexOf(promptSignatures[i].pattern) !== -1) {
          prompts.recurringPromptStyles.push(promptSignatures[i].style);
        }
      }
      
      prompts.promptPatternCount = prompts.recurringPromptStyles.length;
    }
    
    return prompts;
    
  } catch (e) {
    Logger.log('Error in COMP_analyzePromptPatterns: ' + e);
    return { recurringPromptStyles: [], promptPatternCount: 0 };
  }
}

/**
 * Analyze E-E-A-T integration
 */
function COMP_analyzeEEATIntegration(url) {
  try {
    var eeat = {
      bioSchemas: [],
      expertQuotes: [],
      integrationScore: 0
    };
    
    // Check for Author schema
    var schemaData = FET_handle({ action: 'extractSchema', url: url });
    
    if (schemaData && schemaData.ok && schemaData.schemas) {
      for (var i = 0; i < schemaData.schemas.length; i++) {
        var schema = schemaData.schemas[i];
        if (schema['@type'] === 'Person' || schema['@type'] === 'Author') {
          eeat.bioSchemas.push(schema['@type']);
        }
      }
    }
    
    // Check for expert quotes
    var pageData = FET_handle({ action: 'fetchSingleUrl', url: url });
    
    if (pageData && pageData.ok && pageData.html) {
      var html = pageData.html.toLowerCase();
      
      if (html.indexOf('according to') !== -1 || html.indexOf('expert') !== -1 || html.indexOf('says') !== -1) {
        eeat.expertQuotes.push('Expert attribution detected');
      }
    }
    
    // Calculate integration score
    var score = 0;
    if (eeat.bioSchemas.length > 0) score += 50;
    if (eeat.expertQuotes.length > 0) score += 50;
    eeat.integrationScore = score;
    
    return eeat;
    
  } catch (e) {
    Logger.log('Error in COMP_analyzeEEATIntegration: ' + e);
    return { bioSchemas: [], expertQuotes: [], integrationScore: 0 };
  }
}

/**
 * Analyze internal linking strategy
 */
function COMP_analyzeInternalLinking(url) {
  try {
    var internalLinking = {
      tieredAuthorityDistribution: [],
      linkEquityFlowPercent: 0
    };
    
    // Fetch internal links
    var linksData = FET_handle({ action: 'extractInternalLinks', url: url });
    
    if (linksData && linksData.ok && linksData.links) {
      var totalLinks = linksData.links.length;
      
      // Categorize by depth (rough estimate)
      var tier1 = 0, tier2 = 0, tier3 = 0;
      
      for (var i = 0; i < linksData.links.length; i++) {
        var link = linksData.links[i];
        var segments = link.split('/').filter(function(s) { return s.length > 0; }).length;
        
        if (segments <= 1) {
          tier1++;
        } else if (segments === 2) {
          tier2++;
        } else {
          tier3++;
        }
      }
      
      internalLinking.tieredAuthorityDistribution = [
        { tier: 'Tier 1 (Root)', count: tier1, percent: Math.round((tier1 / totalLinks) * 100) },
        { tier: 'Tier 2 (Category)', count: tier2, percent: Math.round((tier2 / totalLinks) * 100) },
        { tier: 'Tier 3 (Deep)', count: tier3, percent: Math.round((tier3 / totalLinks) * 100) }
      ];
      
      // Link equity flow: higher tier1 links = better flow
      internalLinking.linkEquityFlowPercent = Math.round((tier1 / totalLinks) * 100);
    }
    
    return internalLinking;
    
  } catch (e) {
    Logger.log('Error in COMP_analyzeInternalLinking: ' + e);
    return { tieredAuthorityDistribution: [], linkEquityFlowPercent: 0 };
  }
}

/**
 * Analyze editorial expansion consistency
 */
function COMP_analyzeEditorialExpansion(domain) {
  try {
    var editorial = {
      topicCoherence: 0,
      consistencyIndex: 0
    };
    
    // Check blog/content section for consistency
    var blogData = APIS_serperSearch({
      q: 'site:' + domain + '/blog',
      num: 10
    });
    
    if (blogData && blogData.ok && blogData.organic) {
      // Topic coherence: do titles relate to each other?
      var titles = [];
      for (var i = 0; i < blogData.organic.length; i++) {
        titles.push(blogData.organic[i].title || '');
      }
      
      // Simple coherence: check for common words across titles
      var allWords = {};
      for (var j = 0; j < titles.length; j++) {
        var words = titles[j].toLowerCase().split(' ');
        for (var k = 0; k < words.length; k++) {
          var word = words[k].replace(/[^a-z]/g, '');
          if (word.length > 4) {
            allWords[word] = (allWords[word] || 0) + 1;
          }
        }
      }
      
      // Count words that appear multiple times
      var repeatedWords = 0;
      for (var word in allWords) {
        if (allWords[word] >= 2) repeatedWords++;
      }
      
      editorial.topicCoherence = Math.min(100, repeatedWords * 10);
      editorial.consistencyIndex = editorial.topicCoherence; // Same metric for now
    }
    
    return editorial;
    
  } catch (e) {
    Logger.log('Error in COMP_analyzeEditorialExpansion: ' + e);
    return { topicCoherence: 0, consistencyIndex: 0 };
  }
}
