/**
 * COMPETITOR ANALYSIS - CATEGORY VII: CONVERSION & MONETIZATION
 * Funnel architecture, landing hierarchy, pricing psychology, retention systems
 * APIs: Fetcher (page structure, CTAs, pricing analysis)
 */

/**
 * Main function: Analyze conversion & monetization
 * @param {object} params - { domain, url }
 * @return {object} Conversion analysis
 */
function COMP_analyzeConversion(params) {
  var domain = params.domain;
  var url = params.url;
  
  try {
    var result = {
      ok: true,
      domain: domain,
      url: url,
      funnelArchitecture: COMP_analyzeFunnelArchitecture(url),
      landingHierarchy: COMP_analyzeLandingHierarchy(url),
      pricingPsychology: COMP_analyzePricingPsychology(url),
      retentionSystems: COMP_analyzeRetentionSystems(domain),
      revenueModel: COMP_analyzeRevenueModel(url),
      frictionHeatmap: COMP_analyzeFrictionHeatmap(url)
    };
    
    return result;
    
  } catch (e) {
    Logger.log('Error in COMP_analyzeConversion: ' + e);
    return { ok: false, error: String(e), domain: domain };
  }
}

/**
 * Analyze funnel architecture
 */
function COMP_analyzeFunnelArchitecture(url) {
  try {
    var funnel = {
      ctas: [],
      tripwires: [],
      offers: [],
      conversionFlowScore: 0
    };
    
    // Fetch page content
    var pageData = FET_handle({ action: 'fetchSingleUrl', url: url });
    
    if (pageData && pageData.ok && pageData.html) {
      var html = pageData.html.toLowerCase();
      
      // Detect CTAs
      var ctaPatterns = ['get started', 'sign up', 'try free', 'buy now', 'start trial', 'book demo', 'contact sales'];
      for (var i = 0; i < ctaPatterns.length; i++) {
        if (html.indexOf(ctaPatterns[i]) !== -1) {
          funnel.ctas.push(ctaPatterns[i]);
        }
      }
      
      // Detect tripwires (low-cost offers)
      if (html.indexOf('$1') !== -1 || html.indexOf('$9') !== -1 || html.indexOf('free trial') !== -1) {
        funnel.tripwires.push('Low-cost entry offer detected');
      }
      
      // Detect offers
      if (html.indexOf('discount') !== -1 || html.indexOf('limited time') !== -1 || html.indexOf('% off') !== -1) {
        funnel.offers.push('Promotional offer detected');
      }
      
      // Calculate conversion flow score
      var score = 0;
      if (funnel.ctas.length > 0) score += 40;
      if (funnel.tripwires.length > 0) score += 30;
      if (funnel.offers.length > 0) score += 30;
      funnel.conversionFlowScore = score;
    }
    
    return funnel;
    
  } catch (e) {
    Logger.log('Error in COMP_analyzeFunnelArchitecture: ' + e);
    return { ctas: [], tripwires: [], offers: [], conversionFlowScore: 0 };
  }
}

/**
 * Analyze landing page hierarchy
 */
function COMP_analyzeLandingHierarchy(url) {
  try {
    var landing = {
      messaging: '',
      proof: [],
      objections: [],
      persuasionScore: 0
    };
    
    // Fetch metadata for messaging
    var pageData = FET_handle({ action: 'fetchSingleUrl', url: url });
    
    if (pageData && pageData.ok && pageData.html) {
      var metaData = FET_handle({ action: 'extractMetadata', html: pageData.html });
      
      if (metaData && metaData.ok) {
        landing.messaging = metaData.description || '';
      }
      
      var html = pageData.html.toLowerCase();
      
      // Detect proof elements
      var proofPatterns = ['customer', 'testimonial', 'review', 'rating', 'trusted by', 'used by', 'case study'];
      for (var i = 0; i < proofPatterns.length; i++) {
        if (html.indexOf(proofPatterns[i]) !== -1) {
          landing.proof.push(proofPatterns[i]);
        }
      }
      
      // Detect objection handling
      var objectionPatterns = ['money-back', 'guarantee', 'no credit card', 'cancel anytime', 'risk-free'];
      for (var j = 0; j < objectionPatterns.length; j++) {
        if (html.indexOf(objectionPatterns[j]) !== -1) {
          landing.objections.push(objectionPatterns[j]);
        }
      }
      
      // Calculate persuasion score
      var score = 0;
      if (landing.messaging.length > 50) score += 30;
      if (landing.proof.length >= 2) score += 40;
      if (landing.objections.length >= 1) score += 30;
      landing.persuasionScore = score;
    }
    
    return landing;
    
  } catch (e) {
    Logger.log('Error in COMP_analyzeLandingHierarchy: ' + e);
    return { messaging: '', proof: [], objections: [], persuasionScore: 0 };
  }
}

/**
 * Analyze pricing psychology
 */
function COMP_analyzePricingPsychology(url) {
  try {
    var pricing = {
      anchoring: false,
      urgency: false,
      framing: '',
      psychologicalImpactPercent: 0
    };
    
    // Check for pricing page
    var pricingUrl = url.indexOf('/pricing') !== -1 ? url : url + '/pricing';
    var pageData = FET_handle({ action: 'fetchSingleUrl', url: pricingUrl });
    
    if (pageData && pageData.ok && pageData.html) {
      var html = pageData.html.toLowerCase();
      
      // Detect anchoring (highest price shown first)
      if (html.indexOf('enterprise') !== -1 || html.indexOf('premium') !== -1) {
        pricing.anchoring = true;
      }
      
      // Detect urgency
      if (html.indexOf('limited time') !== -1 || html.indexOf('expires') !== -1 || html.indexOf('hurry') !== -1) {
        pricing.urgency = true;
      }
      
      // Detect framing
      if (html.indexOf('per month') !== -1 || html.indexOf('/month') !== -1) {
        pricing.framing = 'Monthly breakdown';
      } else if (html.indexOf('per year') !== -1 || html.indexOf('/year') !== -1) {
        pricing.framing = 'Annual pricing';
      }
      
      // Calculate psychological impact
      var score = 0;
      if (pricing.anchoring) score += 35;
      if (pricing.urgency) score += 35;
      if (pricing.framing.length > 0) score += 30;
      pricing.psychologicalImpactPercent = score;
    }
    
    return pricing;
    
  } catch (e) {
    Logger.log('Error in COMP_analyzePricingPsychology: ' + e);
    return { anchoring: false, urgency: false, framing: '', psychologicalImpactPercent: 0 };
  }
}

/**
 * Analyze retention systems
 */
function COMP_analyzeRetentionSystems(domain) {
  try {
    var retention = {
      emailNurture: false,
      ads: false,
      community: false,
      retentionRatePercent: 0
    };
    
    // Check for email signup
    var homeData = FET_handle({ action: 'fetchSingleUrl', url: 'https://' + domain });
    
    if (homeData && homeData.ok && homeData.html) {
      var html = homeData.html.toLowerCase();
      
      if (html.indexOf('subscribe') !== -1 || html.indexOf('newsletter') !== -1 || html.indexOf('email') !== -1) {
        retention.emailNurture = true;
      }
      
      if (html.indexOf('community') !== -1 || html.indexOf('forum') !== -1 || html.indexOf('discord') !== -1) {
        retention.community = true;
      }
    }
    
    // Check for retargeting (pixel presence)
    if (homeData && homeData.html && (homeData.html.indexOf('facebook pixel') !== -1 || homeData.html.indexOf('google-analytics') !== -1)) {
      retention.ads = true;
    }
    
    // Estimate retention rate
    var systemCount = 0;
    if (retention.emailNurture) systemCount++;
    if (retention.ads) systemCount++;
    if (retention.community) systemCount++;
    
    retention.retentionRatePercent = Math.round((systemCount / 3) * 100);
    
    return retention;
    
  } catch (e) {
    Logger.log('Error in COMP_analyzeRetentionSystems: ' + e);
    return { emailNurture: false, ads: false, community: false, retentionRatePercent: 0 };
  }
}

/**
 * Analyze revenue model
 */
function COMP_analyzeRevenueModel(url) {
  try {
    var revenueModel = {
      type: '',
      details: []
    };
    
    // Fetch homepage/pricing
    var pageData = FET_handle({ action: 'fetchSingleUrl', url: url });
    
    if (pageData && pageData.ok && pageData.html) {
      var html = pageData.html.toLowerCase();
      
      // Detect model type
      if (html.indexOf('subscription') !== -1 || html.indexOf('per month') !== -1 || html.indexOf('saas') !== -1) {
        revenueModel.type = 'SaaS Subscription';
        revenueModel.details.push('Recurring revenue model');
      } else if (html.indexOf('affiliate') !== -1 || html.indexOf('partner') !== -1) {
        revenueModel.type = 'Affiliate/Partnership';
        revenueModel.details.push('Commission-based revenue');
      } else if (html.indexOf('buy') !== -1 || html.indexOf('purchase') !== -1) {
        revenueModel.type = 'Transactional';
        revenueModel.details.push('One-time purchase model');
      } else {
        revenueModel.type = 'Hybrid';
        revenueModel.details.push('Multiple revenue streams');
      }
    }
    
    return revenueModel;
    
  } catch (e) {
    Logger.log('Error in COMP_analyzeRevenueModel: ' + e);
    return { type: '', details: [] };
  }
}

/**
 * Analyze friction heatmap
 */
function COMP_analyzeFrictionHeatmap(url) {
  try {
    var frictionHeatmap = {
      obstacles: [],
      scrollDrops: [],
      frictionZonesCount: 0
    };
    
    // Fetch page
    var pageData = FET_handle({ action: 'fetchSingleUrl', url: url });
    
    if (pageData && pageData.ok && pageData.html) {
      var html = pageData.html.toLowerCase();
      
      // Detect common friction points
      if (html.indexOf('form') !== -1 && html.indexOf('required') !== -1) {
        frictionHeatmap.obstacles.push('Long form detected');
        frictionHeatmap.frictionZonesCount++;
      }
      
      if (html.indexOf('captcha') !== -1) {
        frictionHeatmap.obstacles.push('CAPTCHA verification');
        frictionHeatmap.frictionZonesCount++;
      }
      
      if (html.indexOf('credit card') !== -1 && html.indexOf('trial') !== -1) {
        frictionHeatmap.obstacles.push('Credit card required for trial');
        frictionHeatmap.frictionZonesCount++;
      }
      
      // Scroll drops (approximate based on page length)
      var pageLength = html.length;
      if (pageLength > 100000) {
        frictionHeatmap.scrollDrops.push('Long page - potential scroll abandonment');
        frictionHeatmap.frictionZonesCount++;
      }
    }
    
    return frictionHeatmap;
    
  } catch (e) {
    Logger.log('Error in COMP_analyzeFrictionHeatmap: ' + e);
    return { obstacles: [], scrollDrops: [], frictionZonesCount: 0 };
  }
}
