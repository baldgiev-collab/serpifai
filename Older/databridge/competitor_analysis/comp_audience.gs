/**
 * COMPETITOR ANALYSIS - CATEGORY IX: AUDIENCE & PSYCHOLOGICAL INTELLIGENCE
 * Persona deconstruction, JTBD, emotional triggers, feedback signals, community sentiment
 * APIs: Serper (reviews, sentiment), Fetcher (messaging analysis)
 */

/**
 * Main function: Analyze audience intelligence
 * @param {object} params - { domain, url }
 * @return {object} Audience intelligence analysis
 */
function COMP_analyzeAudienceIntel(params) {
  var domain = params.domain;
  var url = params.url;
  
  try {
    var result = {
      ok: true,
      domain: domain,
      url: url,
      personaDeconstruction: COMP_deconstructPersona(domain, url),
      jobsToBeDone: COMP_analyzeJTBD(url),
      emotionalTriggers: COMP_analyzeEmotionalTriggers(url),
      feedbackSignals: COMP_analyzeFeedbackSignals(domain),
      communitySentiment: COMP_analyzeCommunitySentiment(domain),
      engagementResonance: COMP_analyzeEngagementResonance(domain)
    };
    
    return result;
    
  } catch (e) {
    Logger.log('Error in COMP_analyzeAudienceIntel: ' + e);
    return { ok: false, error: String(e), domain: domain };
  }
}

/**
 * Deconstruct target persona
 */
function COMP_deconstructPersona(domain, url) {
  try {
    var persona = {
      psychographics: [],
      goals: [],
      personaDepthScore: 0
    };
    
    // Analyze homepage messaging
    var pageData = FET_handle({ action: 'fetchSingleUrl', url: url });
    
    if (pageData && pageData.ok && pageData.html) {
      var html = pageData.html.toLowerCase();
      
      // Detect psychographic signals
      if (html.indexOf('professional') !== -1 || html.indexOf('business') !== -1) {
        persona.psychographics.push('B2B Professional');
      }
      if (html.indexOf('entrepreneur') !== -1 || html.indexOf('startup') !== -1) {
        persona.psychographics.push('Entrepreneur/Founder');
      }
      if (html.indexOf('marketer') !== -1 || html.indexOf('agency') !== -1) {
        persona.psychographics.push('Marketing Professional');
      }
      
      // Detect goals from value propositions
      if (html.indexOf('grow') !== -1 || html.indexOf('scale') !== -1) {
        persona.goals.push('Business growth');
      }
      if (html.indexOf('save time') !== -1 || html.indexOf('automate') !== -1) {
        persona.goals.push('Efficiency & automation');
      }
      if (html.indexOf('increase revenue') !== -1 || html.indexOf('more sales') !== -1) {
        persona.goals.push('Revenue generation');
      }
      
      // Calculate depth score
      persona.personaDepthScore = Math.min(100, (persona.psychographics.length + persona.goals.length) * 15);
    }
    
    return persona;
    
  } catch (e) {
    Logger.log('Error in COMP_deconstructPersona: ' + e);
    return { psychographics: [], goals: [], personaDepthScore: 0 };
  }
}

/**
 * Analyze Jobs-To-Be-Done
 */
function COMP_analyzeJTBD(url) {
  try {
    var jtbd = {
      coreTasks: [],
      jtbdMatchPercent: 0
    };
    
    // Fetch page content
    var pageData = FET_handle({ action: 'fetchSingleUrl', url: url });
    
    if (pageData && pageData.ok && pageData.html) {
      var html = pageData.html.toLowerCase();
      
      // Detect core tasks (JTBD format: "When I..., I want to..., so that...")
      var taskPatterns = [
        { trigger: 'create', task: 'Create content/products' },
        { trigger: 'manage', task: 'Manage operations/workflow' },
        { trigger: 'analyze', task: 'Analyze data/performance' },
        { trigger: 'collaborate', task: 'Collaborate with team' },
        { trigger: 'optimize', task: 'Optimize processes' }
      ];
      
      for (var i = 0; i < taskPatterns.length; i++) {
        if (html.indexOf(taskPatterns[i].trigger) !== -1) {
          jtbd.coreTasks.push(taskPatterns[i].task);
        }
      }
      
      // Calculate JTBD match
      jtbd.jtbdMatchPercent = Math.min(100, jtbd.coreTasks.length * 20);
    }
    
    return jtbd;
    
  } catch (e) {
    Logger.log('Error in COMP_analyzeJTBD: ' + e);
    return { coreTasks: [], jtbdMatchPercent: 0 };
  }
}

/**
 * Analyze emotional triggers
 */
function COMP_analyzeEmotionalTriggers(url) {
  try {
    var emotional = {
      rational: 0,
      aspirational: 0,
      emotionalResonanceIndex: 0
    };
    
    // Fetch page content
    var pageData = FET_handle({ action: 'fetchSingleUrl', url: url });
    
    if (pageData && pageData.ok && pageData.html) {
      var html = pageData.html.toLowerCase();
      
      // Detect rational triggers (logic, data, ROI)
      var rationalKeywords = ['data', 'proven', 'results', 'metrics', 'roi', 'analytics', 'efficient'];
      var rationalCount = 0;
      for (var i = 0; i < rationalKeywords.length; i++) {
        if (html.indexOf(rationalKeywords[i]) !== -1) rationalCount++;
      }
      
      // Detect aspirational triggers (dreams, success, transformation)
      var aspirationalKeywords = ['transform', 'achieve', 'success', 'dream', 'elevate', 'empower', 'unlock'];
      var aspirationalCount = 0;
      for (var j = 0; j < aspirationalKeywords.length; j++) {
        if (html.indexOf(aspirationalKeywords[j]) !== -1) aspirationalCount++;
      }
      
      // Calculate percentages
      var total = rationalCount + aspirationalCount;
      if (total > 0) {
        emotional.rational = Math.round((rationalCount / total) * 100);
        emotional.aspirational = Math.round((aspirationalCount / total) * 100);
      }
      
      // Resonance index: balance of both = high resonance
      emotional.emotionalResonanceIndex = Math.round((Math.min(emotional.rational, emotional.aspirational) / 50) * 100);
    }
    
    return emotional;
    
  } catch (e) {
    Logger.log('Error in COMP_analyzeEmotionalTriggers: ' + e);
    return { rational: 0, aspirational: 0, emotionalResonanceIndex: 0 };
  }
}

/**
 * Analyze feedback signals (reviews, testimonials)
 */
function COMP_analyzeFeedbackSignals(domain) {
  try {
    var feedback = {
      reviews: [],
      testimonials: [],
      avgSentimentPercent: 0
    };
    
    // Search for reviews
    var reviewSearch = APIS_serperSearch({
      q: domain.split('.')[0] + ' review OR testimonial',
      num: 10
    });
    
    if (reviewSearch && reviewSearch.ok && reviewSearch.organic) {
      for (var i = 0; i < Math.min(5, reviewSearch.organic.length); i++) {
        var snippet = reviewSearch.organic[i].snippet || '';
        
        // Simple sentiment analysis
        var positive = snippet.indexOf('great') !== -1 || snippet.indexOf('excellent') !== -1 || snippet.indexOf('love') !== -1;
        var negative = snippet.indexOf('bad') !== -1 || snippet.indexOf('poor') !== -1 || snippet.indexOf('disappointing') !== -1;
        
        var sentiment = positive ? 'positive' : (negative ? 'negative' : 'neutral');
        var sentimentScore = positive ? 80 : (negative ? 30 : 50);
        
        feedback.reviews.push({
          snippet: snippet.substring(0, 100),
          sentiment: sentiment,
          score: sentimentScore
        });
      }
      
      // Calculate average sentiment
      var totalSentiment = 0;
      for (var j = 0; j < feedback.reviews.length; j++) {
        totalSentiment += feedback.reviews[j].score;
      }
      feedback.avgSentimentPercent = feedback.reviews.length > 0 
        ? Math.round(totalSentiment / feedback.reviews.length) 
        : 0;
    }
    
    return feedback;
    
  } catch (e) {
    Logger.log('Error in COMP_analyzeFeedbackSignals: ' + e);
    return { reviews: [], testimonials: [], avgSentimentPercent: 0 };
  }
}

/**
 * Analyze community sentiment
 */
function COMP_analyzeCommunitySentiment(domain) {
  try {
    var sentiment = {
      brandVsCompetitors: '',
      sentimentDelta: 0
    };
    
    // Search brand mentions in communities
    var brandMentions = APIS_serperSearch({
      q: domain.split('.')[0] + ' site:reddit.com OR site:quora.com',
      num: 10
    });
    
    if (brandMentions && brandMentions.ok && brandMentions.searchInformation) {
      var mentionCount = brandMentions.searchInformation.totalResults || 0;
      
      if (mentionCount > 10000) {
        sentiment.brandVsCompetitors = 'High community engagement - strong brand presence';
        sentiment.sentimentDelta = 20;
      } else if (mentionCount > 1000) {
        sentiment.brandVsCompetitors = 'Moderate community presence';
        sentiment.sentimentDelta = 10;
      } else {
        sentiment.brandVsCompetitors = 'Low community visibility';
        sentiment.sentimentDelta = -5;
      }
    }
    
    return sentiment;
    
  } catch (e) {
    Logger.log('Error in COMP_analyzeCommunitySentiment: ' + e);
    return { brandVsCompetitors: '', sentimentDelta: 0 };
  }
}

/**
 * Analyze engagement resonance
 */
function COMP_analyzeEngagementResonance(domain) {
  try {
    var resonance = {
      emotionInteractionVolume: 0,
      resonanceScore: 0
    };
    
    // Estimate interaction volume from social + community mentions
    var socialSearch = APIS_serperSearch({
      q: domain.split('.')[0] + ' site:twitter.com OR site:linkedin.com',
      num: 10
    });
    
    if (socialSearch && socialSearch.ok && socialSearch.searchInformation) {
      resonance.emotionInteractionVolume = socialSearch.searchInformation.totalResults || 0;
      
      // Resonance score: higher volume = higher resonance
      resonance.resonanceScore = Math.min(100, Math.round(resonance.emotionInteractionVolume / 1000));
    }
    
    return resonance;
    
  } catch (e) {
    Logger.log('Error in COMP_analyzeEngagementResonance: ' + e);
    return { emotionInteractionVolume: 0, resonanceScore: 0 };
  }
}
