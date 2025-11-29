/**
 * COMPETITOR ANALYSIS - BRAND POSITIONING MODULE
 * Brand archetype, value proposition, E-E-A-T signals
 * Uses: Fetcher, Serper, OpenPageRank
 */

/**
 * Analyze brand positioning for a competitor
 * @param {object} params - { domain, url }
 * @return {object} Brand positioning data
 */
function COMP_analyzeBrandPosition(params) {
  var startTime = new Date().getTime();
  
  try {
    var domain = params.domain || extractDomain(params.url || '');
    var url = params.url || ('https://' + domain);
    
    if (!domain) {
      return { ok: false, error: 'Domain or URL required' };
    }
    
    var positioning = {
      ok: true,
      domain: domain,
      brandArchetype: {},
      valueProposition: {},
      uniqueMechanism: {},
      eeatSignals: {},
      categoryOwnership: {},
      executionTime: 0
    };
    
    // Analyze brand archetype
    positioning.brandArchetype = COMP_analyzeBrandArchetype(domain, url);
    
    // Extract value proposition
    positioning.valueProposition = COMP_extractValueProp(domain, url);
    
    // Identify unique mechanisms
    positioning.uniqueMechanism = COMP_identifyUniqueMechanisms(domain, url);
    
    // Analyze E-E-A-T signals
    positioning.eeatSignals = COMP_analyzeEEAT(domain, url);
    
    // Calculate category ownership
    positioning.categoryOwnership = COMP_calculateCategoryOwnership(domain);
    
    positioning.executionTime = new Date().getTime() - startTime;
    return positioning;
    
  } catch (e) {
    Logger.log('Error in COMP_analyzeBrandPosition: ' + e);
    return {
      ok: false,
      error: String(e),
      executionTime: new Date().getTime() - startTime
    };
  }
}

/**
 * Analyze brand archetype
 */
function COMP_analyzeBrandArchetype(domain, url) {
  var archetype = {
    type: '',
    toneConsistency: 0,
    alignmentScore: 0,
    characteristics: []
  };
  
  try {
    // Fetch homepage content
    var fetchResult = FET_handle('fetchSingleUrl', { url: url });
    if (fetchResult.ok && fetchResult.html) {
      var text = fetchResult.html.toLowerCase();
      
      // Score each archetype
      var scores = {
        Hero: 0,
        Sage: 0,
        Explorer: 0,
        Caregiver: 0,
        Magician: 0,
        Rebel: 0,
        Lover: 0,
        Creator: 0,
        Ruler: 0,
        Jester: 0,
        Everyperson: 0,
        Innocent: 0
      };
      
      // Hero: achievement, courage, challenge
      if (text.indexOf('achieve') !== -1) scores.Hero += 2;
      if (text.indexOf('succeed') !== -1) scores.Hero += 2;
      if (text.indexOf('overcome') !== -1) scores.Hero += 2;
      if (text.indexOf('challenge') !== -1) scores.Hero += 1;
      if (text.indexOf('win') !== -1) scores.Hero += 1;
      
      // Sage: knowledge, wisdom, learning
      if (text.indexOf('learn') !== -1) scores.Sage += 2;
      if (text.indexOf('discover') !== -1) scores.Sage += 2;
      if (text.indexOf('understand') !== -1) scores.Sage += 2;
      if (text.indexOf('insight') !== -1) scores.Sage += 2;
      if (text.indexOf('knowledge') !== -1) scores.Sage += 2;
      if (text.indexOf('wisdom') !== -1) scores.Sage += 2;
      if (text.indexOf('expert') !== -1) scores.Sage += 1;
      
      // Magician: transformation, innovation, vision
      if (text.indexOf('transform') !== -1) scores.Magician += 2;
      if (text.indexOf('innovate') !== -1) scores.Magician += 2;
      if (text.indexOf('revolutionize') !== -1) scores.Magician += 2;
      if (text.indexOf('magic') !== -1) scores.Magician += 1;
      
      // Caregiver: help, support, nurture
      if (text.indexOf('help') !== -1) scores.Caregiver += 2;
      if (text.indexOf('support') !== -1) scores.Caregiver += 2;
      if (text.indexOf('care') !== -1) scores.Caregiver += 2;
      if (text.indexOf('protect') !== -1) scores.Caregiver += 1;
      
      // Creator: create, build, design
      if (text.indexOf('create') !== -1) scores.Creator += 2;
      if (text.indexOf('build') !== -1) scores.Creator += 2;
      if (text.indexOf('design') !== -1) scores.Creator += 2;
      if (text.indexOf('imagine') !== -1) scores.Creator += 1;
      
      // Find dominant archetype
      var maxScore = 0;
      var dominantType = '';
      for (var type in scores) {
        if (scores[type] > maxScore) {
          maxScore = scores[type];
          dominantType = type;
        }
      }
      
      archetype.type = dominantType || 'Unknown';
      archetype.alignmentScore = Math.min(100, maxScore * 10);
      
      // Calculate tone consistency (how focused on one archetype)
      var totalScore = 0;
      for (var type in scores) {
        totalScore += scores[type];
      }
      archetype.toneConsistency = totalScore > 0 ? Math.round((maxScore / totalScore) * 100) : 0;
      
      // List characteristics
      for (var type in scores) {
        if (scores[type] > 3) {
          archetype.characteristics.push(type);
        }
      }
    }
    
    return archetype;
    
  } catch (e) {
    Logger.log('Error analyzing brand archetype: ' + e);
    return archetype;
  }
}

/**
 * Extract value proposition
 */
function COMP_extractValueProp(domain, url) {
  var valueProp = {
    coreOffers: [],
    benefits: [],
    differentiation: [],
    uvpClarityScore: 0,
    headline: ''
  };
  
  try {
    // Fetch homepage content
    var fetchResult = FET_handle('fetchSingleUrl', { url: url });
    if (fetchResult.ok && fetchResult.html) {
      // Extract metadata for headline
      var metaResult = FET_handle('extractMetadata', { html: fetchResult.html });
      if (metaResult.ok && metaResult.data) {
        valueProp.headline = metaResult.data.title || '';
      }
      
      // Extract headings for value prop elements
      var headingResult = FET_handle('extractHeadings', { html: fetchResult.html });
      if (headingResult.ok && headingResult.data.headings) {
        var headings = headingResult.data.headings;
        
        // H1 typically contains main value prop
        for (var i = 0; i < headings.length; i++) {
          if (headings[i].level === 'h1') {
            valueProp.headline = headings[i].text;
          }
        }
        
        // H2/H3 contain benefits and offers
        for (var i = 0; i < headings.length; i++) {
          var heading = headings[i];
          if (heading.level === 'h2' || heading.level === 'h3') {
            var text = heading.text.toLowerCase();
            
            // Detect benefits (positive outcomes)
            if (text.indexOf('increase') !== -1 || text.indexOf('improve') !== -1 ||
                text.indexOf('boost') !== -1 || text.indexOf('grow') !== -1) {
              valueProp.benefits.push(heading.text);
            }
            
            // Detect differentiation
            if (text.indexOf('unlike') !== -1 || text.indexOf('better than') !== -1 ||
                text.indexOf('only') !== -1 || text.indexOf('first') !== -1) {
              valueProp.differentiation.push(heading.text);
            }
            
            // Detect offers
            if (text.indexOf('feature') !== -1 || text.indexOf('service') !== -1 ||
                text.indexOf('solution') !== -1) {
              valueProp.coreOffers.push(heading.text);
            }
          }
        }
      }
      
      // Calculate UVP clarity score
      var totalElements = valueProp.benefits.length + valueProp.differentiation.length + valueProp.coreOffers.length;
      valueProp.uvpClarityScore = Math.min(100, totalElements * 15);
      if (valueProp.headline) valueProp.uvpClarityScore += 20;
    }
    
    return valueProp;
    
  } catch (e) {
    Logger.log('Error extracting value prop: ' + e);
    return valueProp;
  }
}

/**
 * Identify unique mechanisms
 */
function COMP_identifyUniqueMechanisms(domain, url) {
  var mechanisms = {
    proprietaryFrameworks: [],
    formulas: [],
    methodologies: [],
    perceivedUniquenessIndex: 0
  };
  
  try {
    // Fetch homepage content
    var fetchResult = FET_handle('fetchSingleUrl', { url: url });
    if (fetchResult.ok && fetchResult.html) {
      var text = fetchResult.html;
      
      // Look for proprietary terms (trademarked, registered)
      var trademarkMatches = text.match(/\w+™|\w+®/g) || [];
      mechanisms.proprietaryFrameworks = trademarkMatches.slice(0, 5);
      
      // Look for formulas/methodologies
      var methodologyMatches = text.match(/\b(\w+)\s+(method|framework|system|formula|process|approach)\b/gi) || [];
      mechanisms.methodologies = methodologyMatches.slice(0, 5);
      
      // Calculate uniqueness index
      mechanisms.perceivedUniquenessIndex = Math.min(100, 
        (mechanisms.proprietaryFrameworks.length * 20) + 
        (mechanisms.methodologies.length * 10)
      );
    }
    
    return mechanisms;
    
  } catch (e) {
    Logger.log('Error identifying unique mechanisms: ' + e);
    return mechanisms;
  }
}

/**
 * Analyze E-E-A-T signals
 */
function COMP_analyzeEEAT(domain, url) {
  var eeat = {
    expertise: 0,
    experience: 0,
    authoritativeness: 0,
    trustworthiness: 0,
    overallScore: 0,
    credentials: [],
    schema: [],
    reviews: []
  };
  
  try {
    // Fetch homepage content
    var fetchResult = FET_handle('fetchSingleUrl', { url: url });
    if (fetchResult.ok && fetchResult.html) {
      var text = fetchResult.html.toLowerCase();
      
      // Expertise signals
      if (text.indexOf('expert') !== -1) eeat.expertise += 10;
      if (text.indexOf('certified') !== -1) eeat.expertise += 10;
      if (text.indexOf('qualified') !== -1) eeat.expertise += 10;
      if (text.indexOf('phd') !== -1 || text.indexOf('md') !== -1) eeat.expertise += 15;
      if (text.indexOf('years of experience') !== -1) eeat.expertise += 10;
      
      // Experience signals
      if (text.indexOf('founded') !== -1) eeat.experience += 10;
      if (text.indexOf('since') !== -1) eeat.experience += 5;
      if (text.indexOf('case study') !== -1 || text.indexOf('case studies') !== -1) eeat.experience += 15;
      if (text.indexOf('testimonial') !== -1) eeat.experience += 10;
      
      // Authoritativeness signals
      if (text.indexOf('award') !== -1) eeat.authoritativeness += 15;
      if (text.indexOf('recognized') !== -1) eeat.authoritativeness += 10;
      if (text.indexOf('featured in') !== -1) eeat.authoritativeness += 10;
      if (text.indexOf('published') !== -1) eeat.authoritativeness += 10;
      
      // Trustworthiness signals
      if (text.indexOf('secure') !== -1 || text.indexOf('ssl') !== -1) eeat.trustworthiness += 10;
      if (text.indexOf('privacy policy') !== -1) eeat.trustworthiness += 10;
      if (text.indexOf('terms') !== -1) eeat.trustworthiness += 5;
      if (text.indexOf('guarantee') !== -1) eeat.trustworthiness += 10;
      if (text.indexOf('verified') !== -1) eeat.trustworthiness += 15;
      
      // Extract schema for E-E-A-T
      var schemaResult = FET_handle('extractSchema', { html: fetchResult.html });
      if (schemaResult.ok && schemaResult.data) {
        eeat.schema = schemaResult.data.types || [];
        
        // Bonus for Organization schema (authority signal)
        if (eeat.schema.indexOf('Organization') !== -1) eeat.authoritativeness += 20;
        
        // Bonus for Person/Author schema (expertise signal)
        if (eeat.schema.indexOf('Person') !== -1) eeat.expertise += 15;
      }
      
      // Limit scores to 100
      eeat.expertise = Math.min(100, eeat.expertise);
      eeat.experience = Math.min(100, eeat.experience);
      eeat.authoritativeness = Math.min(100, eeat.authoritativeness);
      eeat.trustworthiness = Math.min(100, eeat.trustworthiness);
      
      // Calculate overall E-E-A-T score
      eeat.overallScore = Math.round(
        (eeat.expertise * 0.3) +
        (eeat.experience * 0.25) +
        (eeat.authoritativeness * 0.25) +
        (eeat.trustworthiness * 0.2)
      );
    }
    
    // Get backlink data for authority
    var oprResult = APIS_openPageRankFetch(domain);
    if (oprResult.ok) {
      var oprData = JSONX.parse(oprResult.body, {});
      if (oprData.response && oprData.response[0]) {
        var pageRank = oprData.response[0].page_rank_decimal || 0;
        eeat.authoritativeness = Math.max(eeat.authoritativeness, Math.round(pageRank * 10));
        
        // Recalculate overall with backlink data
        eeat.overallScore = Math.round(
          (eeat.expertise * 0.25) +
          (eeat.experience * 0.20) +
          (eeat.authoritativeness * 0.35) +
          (eeat.trustworthiness * 0.20)
        );
      }
    }
    
    return eeat;
    
  } catch (e) {
    Logger.log('Error analyzing E-E-A-T: ' + e);
    return eeat;
  }
}

/**
 * Calculate category ownership
 */
function COMP_calculateCategoryOwnership(domain) {
  var ownership = {
    conversationLeadership: 0,
    backlinks: 0,
    mentions: 0,
    ownershipPercent: 0
  };
  
  try {
    // Use Serper to check brand mentions
    var serperResult = APIS_serperSearch(domain);
    if (serperResult.ok) {
      var data = JSONX.parse(serperResult.body, {});
      
      if (data.searchInformation) {
        ownership.mentions = data.searchInformation.totalResults || 0;
      }
      
      // Calculate conversation leadership (presence in top results)
      if (data.organic) {
        var topResultCount = 0;
        for (var i = 0; i < Math.min(data.organic.length, 10); i++) {
          if (data.organic[i].link && data.organic[i].link.indexOf(domain) !== -1) {
            topResultCount++;
          }
        }
        ownership.conversationLeadership = topResultCount * 10; // 0-100 scale
      }
    }
    
    // Get backlink data
    var oprResult = APIS_openPageRankFetch(domain);
    if (oprResult.ok) {
      var oprData = JSONX.parse(oprResult.body, {});
      if (oprData.response && oprData.response[0]) {
        ownership.backlinks = oprData.response[0].rank || 0;
      }
    }
    
    // Calculate overall ownership (weighted)
    ownership.ownershipPercent = Math.min(100, Math.round(
      (ownership.conversationLeadership * 0.4) +
      (Math.min(ownership.mentions / 1000, 100) * 0.3) +
      (Math.min(ownership.backlinks, 100) * 0.3)
    ));
    
    return ownership;
    
  } catch (e) {
    Logger.log('Error calculating category ownership: ' + e);
    return ownership;
  }
}
