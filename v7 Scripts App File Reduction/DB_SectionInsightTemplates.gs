/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * DB_SectionInsightTemplates.gs
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * STRATEGIC INTELLIGENCE SUMMARY TEMPLATES FOR ALL 14 SECTIONS
 * 
 * Each section generates exactly 3 elite-tier strategic insights following the
 * format: Finding + Competitive Edge + Actionable Impact
 * 
 * @version 1.0.0
 * @author SerpifAI Elite Intelligence System
 */

/**
 * Returns the Strategic Intelligence Summary template for a specific section
 * @param {number} sectionNum - Section number (1-14)
 * @param {Object} data - Project data with all variables
 * @param {Object} compData - Competitor intelligence data
 * @returns {string} The section insight template
 */
function getSectionInsightTemplate(sectionNum, data, compData) {
  const templates = {
    1: getSection1Template,
    2: getSection2Template,
    3: getSection3Template,
    4: getSection4Template,
    5: getSection5Template,
    6: getSection6Template,
    7: getSection7Template,
    8: getSection8Template,
    9: getSection9Template,
    10: getSection10Template,
    11: getSection11Template,
    12: getSection12Template,
    13: getSection13Template,
    14: getSection14Template
  };
  
  const templateFn = templates[sectionNum];
  if (!templateFn) {
    Logger.log(`⚠️ No template found for section ${sectionNum}`);
    return '';
  }
  
  return templateFn(data, compData);
}

/**
 * Returns all 14 section templates concatenated
 * @param {Object} data - Project data
 * @param {Object} compData - Competitor intelligence data
 * @returns {string} All section templates
 */
function getAllSectionInsightTemplates(data, compData) {
  let allTemplates = '';
  for (let i = 1; i <= 14; i++) {
    allTemplates += getSectionInsightTemplate(i, data, compData) + '\n\n';
  }
  return allTemplates;
}

// ════════════════════════════════════════════════════════════════════════════════
// SECTION 1: CUSTOMER INTELLIGENCE
// ════════════════════════════════════════════════════════════════════════════════

function getSection1Template(data, compData) {
  const d = data || {};
  const c = compData || {};
  
  return `
### 1.5 STRATEGIC INTELLIGENCE SUMMARY — Customer Intelligence
**FORENSIC CUSTOMER ANALYSIS FOR ${d.brandName || '[Brand]'} — Generate exactly 3 elite-tier strategic insights:**

**CONTEXT FOR ANALYSIS:**
- Target Audience: ${d.targetAudience || 'Not provided'}
- Their Current Pains: ${d.audiencePains || 'Not provided'}
- Their Desired State: ${d.audienceDesired || 'Not provided'}
- Core Market Problem: ${d.coreMarketProblem || 'Not provided'}
- Key Competitors: ${d.keyCompetitors || 'Not provided'}

**COMPETITOR AUDIENCE INTELLIGENCE:**
\`\`\`json
${JSON.stringify(c.audienceProfiles || {}, null, 2)}
\`\`\`
\`\`\`json
${JSON.stringify(c.marketShare || {}, null, 2)}
\`\`\`

**🎯 INSIGHT #1: Pain Point Monetization Matrix**
- Finding: Analyze ${d.audiencePains || 'audience pains'} for ${d.targetAudience || 'target audience'}. Cross-reference with competitor audience profiles to identify gaps. Quantify: "[Specific frustration] affects [X%] of audience, costing them [Y hours/$ annually] in lost productivity/revenue"
- Competitive Edge: "While ${d.keyCompetitors || 'competitors'} targets '[their target]' with [their solution], ${d.brandName || 'your brand'}'s forensic analysis reveals the ROOT CAUSE is [deeper issue from ${d.coreMarketProblem || 'market problem'}] — addressable through ${d.uvp || 'your UVP'}"
- Actionable Impact: "First-mover advantage in [specific solution space] captures estimated [X%] of the $[Y]B underserved segment within [timeframe]"

**🎯 INSIGHT #2: Emotional Resonance Amplifier**
- Finding: Cross-reference ${d.audiencePains || 'pains'} with ${d.audienceDesired || 'desires'}. Compare to competitor messaging gaps. Identify: "The emotional driver '[specific emotion]' appears in [X%] of audience language patterns and correlates with [Y%] higher engagement when addressed directly"
- Competitive Edge: "${d.keyCompetitors || 'Competitors'} defaults to '[their claim]' messaging. ${d.brandName || 'Your brand'}'s emotion-led positioning around '[trigger phrase from ${d.brandLexicon || 'brand voice'}]' creates 3x stronger brand recall and [X%] higher intent-to-purchase"
- Actionable Impact: "Reframe value proposition to emphasize transformation from '[current pain]' to '[desired state]' for projected [X%] CTR improvement and [Y%] reduction in CAC"

**🎯 INSIGHT #3: Aspiration-Reality Gap Arbitrage**
- Finding: Map the delta between ${d.audiencePains || 'current state'} and ${d.audienceDesired || 'desired transformation'}. Cross-reference with competitor market share to identify underserved segments. "Gap analysis reveals audience aspires to '[desired state]' — a transformation journey worth $[X] in perceived value"
- Competitive Edge: "No competitor owns this transformation narrative. Their market share distribution shows focus on [segment]. Position ${d.brandName || 'your brand'} as the '${d.brandArchetype || 'brand archetype'}' that bridges this gap through ${d.uvp || 'your UVP'}"
- Actionable Impact: "Transformation positioning justifies [X%] premium pricing for ${d.primaryOfferName || 'primary offer'} and increases LTV by [Y%] through deeper emotional investment"

**SECTION 1 INSIGHT JSON:**
\`\`\`json
{
  "sectionInsights": {
    "sectionNum": 1,
    "sectionTitle": "Customer Intelligence",
    "insights": [
      {
        "id": 1,
        "type": "market_intelligence",
        "finding": "[Pain point monetization finding]",
        "competitiveEdge": "[Advantage description]",
        "impact": "[Quantified impact]",
        "priority": "critical",
        "timeframe": "30-day"
      },
      {
        "id": 2,
        "type": "strategic_opportunity",
        "finding": "[Emotional resonance finding]",
        "competitiveEdge": "[Advantage description]",
        "impact": "[Quantified impact]",
        "priority": "high",
        "timeframe": "30-day"
      },
      {
        "id": 3,
        "type": "risk_mitigation",
        "finding": "[Aspiration gap finding]",
        "competitiveEdge": "[Advantage description]",
        "impact": "[Quantified impact]",
        "priority": "high",
        "timeframe": "90-day"
      }
    ],
    "keyMetrics": {
      "opportunityScore": 0,
      "competitiveGap": 0,
      "executionComplexity": 0
    }
  }
}
\`\`\`
`;
}

// ════════════════════════════════════════════════════════════════════════════════
// SECTION 2: JOBS-TO-BE-DONE FRAMEWORK
// ════════════════════════════════════════════════════════════════════════════════

function getSection2Template(data, compData) {
  const d = data || {};
  const c = compData || {};
  
  return `
### 2.5 STRATEGIC INTELLIGENCE SUMMARY — Jobs-To-Be-Done
**FORENSIC JTBD ANALYSIS FOR ${d.brandName || '[Brand]'} — Generate exactly 3 elite-tier strategic insights:**

**CONTEXT FOR ANALYSIS:**
- Product/Service: ${d.productOrService || 'Not provided'}
- Target Audience: ${d.targetAudience || 'Not provided'}
- Their Pains (Jobs to Solve): ${d.audiencePains || 'Not provided'}
- Competitors: ${d.keyCompetitors || 'Not provided'}
- Your Advantages: ${d.competitiveAdvantages || 'Not provided'}

**COMPETITOR JOB INTELLIGENCE:**
\`\`\`json
${JSON.stringify(c.audienceProfiles || {}, null, 2)}
\`\`\`
\`\`\`json
${JSON.stringify(c.keywordGaps || {}, null, 2)}
\`\`\`
\`\`\`json
${JSON.stringify(c.conversionAnalysis || {}, null, 2)}
\`\`\`

**🎯 INSIGHT #1: Underserved Job Discovery**
- Finding: "Cross-reference audience pains with keyword gaps. The functional job '[specific JTBD derived from keyword gaps]' has [X]K monthly search demand but only [Y%] solution satisfaction rate. Forensic gap: [Z%] of audience abandon current solutions due to [specific friction point]"
- Competitive Edge: "${d.keyCompetitors || 'Competitors'} optimizes for '[their focus]', leaving the core job '[underserved job]' with zero dedicated solutions. ${d.brandName || 'Your'}'s ${d.productOrService || 'solution'} directly addresses this gap"
- Actionable Impact: "Owning '[underserved job]' as primary positioning = [X%] market share capture opportunity worth $[Y]M ARR in [timeframe]. Position ${d.primaryOfferName || 'primary offer'} as the definitive solution"

**🎯 INSIGHT #2: Job Chain Revenue Multiplier**
- Finding: "JTBD sequencing reveals: '[Primary Job]' triggers '[Secondary Job]' in [X%] of cases, then '[Tertiary Job]' in [Y%]. This job chain represents [Z]x revenue opportunity vs. single-job focus"
- Competitive Edge: "${d.keyCompetitors || 'Competitors'} sells point solutions for individual jobs. ${d.brandName || 'Your'}'s integrated ${d.productOrService || 'solution'} creates [X]x higher LTV and [Y%] lower churn through workflow lock-in via ${d.competitiveAdvantages || 'your advantages'}"
- Actionable Impact: "Bundle positioning around complete job chain increases ARPU by $[X]/month. Upsell path: ${d.primaryOfferName || 'primary'} → ${d.upsellOffer || 'upsell'} captures full job chain value"

**🎯 INSIGHT #3: Job Switching Cost Engineering**
- Finding: "Users switching from ${d.keyCompetitors || 'competitors'} to alternative solutions face [X hours] of workflow rebuilding, [Y] integration reconfigurations, and [$Z] in hidden migration costs"
- Competitive Edge: "${d.brandName || 'Your brand'} designs zero-friction migration path leveraging ${d.competitiveAdvantages || 'advantages'}: '[specific migration tool/process]' that delivers immediate value within [X minutes] vs. competitor's [Y-day] onboarding"
- Actionable Impact: "Capture [X%] of competitor's churning user base ([Y]K users/month) through friction-free switching + immediate ROI demonstration for ${d.productOrService || 'your product'}"

**SECTION 2 INSIGHT JSON:**
\`\`\`json
{
  "sectionInsights": {
    "sectionNum": 2,
    "sectionTitle": "Jobs-To-Be-Done Framework",
    "insights": [
      {
        "id": 1,
        "type": "strategic_opportunity",
        "finding": "[Underserved job finding]",
        "competitiveEdge": "[Advantage description]",
        "impact": "[Quantified impact]",
        "priority": "critical",
        "timeframe": "immediate"
      },
      {
        "id": 2,
        "type": "market_intelligence",
        "finding": "[Job chain finding]",
        "competitiveEdge": "[Advantage description]",
        "impact": "[Quantified impact]",
        "priority": "high",
        "timeframe": "30-day"
      },
      {
        "id": 3,
        "type": "strategic_opportunity",
        "finding": "[Switching cost finding]",
        "competitiveEdge": "[Advantage description]",
        "impact": "[Quantified impact]",
        "priority": "high",
        "timeframe": "30-day"
      }
    ],
    "keyMetrics": {
      "opportunityScore": 0,
      "competitiveGap": 0,
      "executionComplexity": 0
    }
  }
}
\`\`\`
`;
}

// ════════════════════════════════════════════════════════════════════════════════
// SECTION 3: COMPETITIVE WARFARE
// ════════════════════════════════════════════════════════════════════════════════

function getSection3Template(data, compData) {
  const d = data || {};
  const c = compData || {};
  
  return `
### 3.6 STRATEGIC INTELLIGENCE SUMMARY — Competitive Warfare
**FORENSIC COMPETITIVE INTELLIGENCE FOR ${d.brandName || '[Brand]'} vs ${d.keyCompetitors || '[Competitors]'} — Generate exactly 3 elite-tier strategic insights:**

**CONTEXT FOR ANALYSIS:**
- Your Brand: ${d.brandName || 'Not provided'}
- Key Competitors: ${d.keyCompetitors || 'Not provided'}
- Your Advantages: ${d.competitiveAdvantages || 'Not provided'}
- Core Topic: ${d.coreTopic || 'Not provided'}
- Industry: ${d.industryVertical || 'Not provided'}

**COMPETITOR WARFARE INTELLIGENCE:**
\`\`\`json
${JSON.stringify(c.competitorRankings || {}, null, 2)}
\`\`\`
\`\`\`json
${JSON.stringify(c.serpVisibility || {}, null, 2)}
\`\`\`
\`\`\`json
${JSON.stringify(c.overallScores || {}, null, 2)}
\`\`\`
\`\`\`json
${JSON.stringify(c.authorityRankings || {}, null, 2)}
\`\`\`
\`\`\`json
${JSON.stringify(c.contentGaps || {}, null, 2)}
\`\`\`

**🎯 INSIGHT #1: Competitor Blind Spot Exploitation**
- Finding: "SERP forensics reveal ${d.keyCompetitors || 'competitors'} ranks for [X] keywords in '${d.coreTopic || 'core topic'}' but has ZERO coverage of '[critical subtopic]' — a gap representing [Y]K monthly searches and $[Z]K OTV"
- Competitive Edge: "${d.brandName || 'Your brand'} creates definitive '[subtopic]' content hub with [X] interlinked assets leveraging ${d.competitiveAdvantages || 'advantages'} to capture 100% of this uncontested traffic within [Y] days of indexing"
- Actionable Impact: "$[X]K organic traffic value capture within 90 days. Permanent ranking displacement achievable before competitor response (estimated [Y]-month window). Directly supports ${d.contentGoals || 'content goals'}"

**🎯 INSIGHT #2: Kill Move Execution Window**
- Finding: "Analysis shows competitor vulnerability signals: [specific indicator — content decay/technical debt/thin content]. Their [specific weakness] creates [X]-day window for strategic strike"
- Competitive Edge: "${d.brandName || 'Your brand'} deploys '[specific content/campaign type matching ${d.contentFormats || 'content formats'}]' targeting their weakest rankings during this vulnerability window. Focus on [X] high-value keywords where their content is [Y] months outdated"
- Actionable Impact: "Permanent ranking displacement for [X] keywords worth $[Y]K/month OTV in ${d.industryVertical || 'your industry'}. Once displaced, competitor recovery requires [Z] months of effort"

**🎯 INSIGHT #3: Asymmetric Advantage Lock-In**
- Finding: "${d.brandName || 'Your brand'}'s unique asset '${d.competitiveAdvantages || 'advantages'}' is unreplicable by competitors within [X]-month timeframe. Their weakness in [specific area] creates barrier"
- Competitive Edge: "Double down on '${d.competitiveAdvantages || 'advantages'}' to widen moat: invest [X] resources to transform from competitive advantage to market-defining standard in ${d.industryVertical || 'industry'} before competitors can respond"
- Actionable Impact: "[X]-month first-mover advantage in '${d.coreTopic || 'core topic'}' translates to [Y%] market share lock-in and [Z]x customer acquisition cost advantage"

**SECTION 3 INSIGHT JSON:**
\`\`\`json
{
  "sectionInsights": {
    "sectionNum": 3,
    "sectionTitle": "Competitive Warfare",
    "insights": [
      {
        "id": 1,
        "type": "strategic_opportunity",
        "finding": "[Blind spot finding]",
        "competitiveEdge": "[Advantage description]",
        "impact": "[Quantified impact]",
        "priority": "critical",
        "timeframe": "immediate"
      },
      {
        "id": 2,
        "type": "market_intelligence",
        "finding": "[Kill move finding]",
        "competitiveEdge": "[Advantage description]",
        "impact": "[Quantified impact]",
        "priority": "critical",
        "timeframe": "30-day"
      },
      {
        "id": 3,
        "type": "risk_mitigation",
        "finding": "[Asymmetric advantage finding]",
        "competitiveEdge": "[Advantage description]",
        "impact": "[Quantified impact]",
        "priority": "high",
        "timeframe": "90-day"
      }
    ],
    "keyMetrics": {
      "opportunityScore": 0,
      "competitiveGap": 0,
      "executionComplexity": 0
    }
  }
}
\`\`\`
`;
}

// ════════════════════════════════════════════════════════════════════════════════
// SECTION 4: BLUE OCEAN STRATEGY
// ════════════════════════════════════════════════════════════════════════════════

function getSection4Template(data, compData) {
  const d = data || {};
  const c = compData || {};
  
  return `
### 4.5 STRATEGIC INTELLIGENCE SUMMARY — Blue Ocean Strategy
**FORENSIC MARKET CREATION FOR ${d.brandName || '[Brand]'} in ${d.industryVertical || '[Industry]'} — Generate exactly 3 elite-tier strategic insights:**

**CONTEXT FOR ANALYSIS:**
- Industry: ${d.industryVertical || 'Not provided'}
- Key Competitors: ${d.keyCompetitors || 'Not provided'}
- Target Audience: ${d.targetAudience || 'Not provided'}
- Secondary Audience: ${d.secondaryAudience || 'Not provided'}
- Core Market Problem: ${d.coreMarketProblem || 'Not provided'}
- Your UVP: ${d.uvp || 'Not provided'}
- Your Advantages: ${d.competitiveAdvantages || 'Not provided'}

**BLUE OCEAN INTELLIGENCE:**
\`\`\`json
${JSON.stringify(c.strategicOpportunities || {}, null, 2)}
\`\`\`
\`\`\`json
${JSON.stringify(c.underservedSpaces || {}, null, 2)}
\`\`\`
\`\`\`json
${JSON.stringify(c.trendForecasting || {}, null, 2)}
\`\`\`

**🎯 INSIGHT #1: Uncontested Market Space Discovery**
- Finding: "ERRC analysis reveals: '${d.industryVertical || 'industry'}' competes on [X factors] that ${d.targetAudience || 'audience'} values at only [Y/10]. Meanwhile, '[overlooked factor]' scores [Z/10] importance but receives [minimal] industry investment from ${d.keyCompetitors || 'competitors'}"
- Competitive Edge: "ELIMINATE '[low-value factor competitors obsess over]', REDUCE '[over-delivered factor]', RAISE '[underserved need from ${d.audiencePains || 'pains'}]', CREATE '[net-new value from ${d.uvp || 'UVP'}]' — this ERRC combination has ZERO market occupants"
- Actionable Impact: "Blue ocean positioning in '[new market space name]' addresses $[X]B TAM with [Y%] of competitive intensity. ${d.brandName || 'Your brand'} becomes category creator vs. category competitor"

**🎯 INSIGHT #2: Non-Customer Conversion Pathway**
- Finding: "Three tiers of non-customers: Tier 1 ([X]% of market) = '[description related to ${d.targetAudience || 'primary audience'}]', Tier 2 ([Y]%) = '[related to ${d.secondaryAudience || 'secondary audience'}]', Tier 3 ([Z]%) = '[adjacent market]'. Combined = [N]x larger than current competitor customer base"
- Competitive Edge: "Tier [X] non-customers reject current solutions from ${d.keyCompetitors || 'competitors'} due to '[specific barrier from ${d.coreMarketProblem || 'market problem'}]'. Remove this barrier through '${d.competitiveAdvantages || 'advantages'}' to unlock [Y]K new addressable users"
- Actionable Impact: "Non-customer conversion strategy expands ${d.brandName || 'your'}'s TAM by [X]x and reduces CAC by [Y%] (non-customers have no loyalty to competitors)"

**🎯 INSIGHT #3: Value Innovation Leap**
- Finding: "Forensic value curve shows ${d.keyCompetitors || 'competitors'} all cluster within [X%] variation on [Y] factors. Breakthrough opportunity: '${d.uvp || 'your UVP'}' redefines the value curve entirely for ${d.targetAudience || 'audience'}"
- Competitive Edge: "Value innovation = simultaneous differentiation AND cost leadership. Achieve through '${d.competitiveAdvantages || 'advantages'}' that competitors cannot replicate without [X]-year infrastructure investment"
- Actionable Impact: "Value leap positioning justifies [X%] price premium for ${d.primaryOfferName || 'primary offer'} while delivering [Y%] cost advantage = [Z%] margin expansion vs. industry average"

**SECTION 4 INSIGHT JSON:**
\`\`\`json
{
  "sectionInsights": {
    "sectionNum": 4,
    "sectionTitle": "Blue Ocean Strategy",
    "insights": [
      {
        "id": 1,
        "type": "strategic_opportunity",
        "finding": "[ERRC finding]",
        "competitiveEdge": "[Advantage description]",
        "impact": "[Quantified impact]",
        "priority": "critical",
        "timeframe": "90-day"
      },
      {
        "id": 2,
        "type": "market_intelligence",
        "finding": "[Non-customer finding]",
        "competitiveEdge": "[Advantage description]",
        "impact": "[Quantified impact]",
        "priority": "high",
        "timeframe": "90-day"
      },
      {
        "id": 3,
        "type": "strategic_opportunity",
        "finding": "[Value innovation finding]",
        "competitiveEdge": "[Advantage description]",
        "impact": "[Quantified impact]",
        "priority": "high",
        "timeframe": "90-day"
      }
    ],
    "keyMetrics": {
      "opportunityScore": 0,
      "competitiveGap": 0,
      "executionComplexity": 0
    }
  }
}
\`\`\`
`;
}

// ════════════════════════════════════════════════════════════════════════════════
// SECTION 5: BRAND POSITIONING
// ════════════════════════════════════════════════════════════════════════════════

function getSection5Template(data, compData) {
  const d = data || {};
  const c = compData || {};
  
  return `
### 5.5 STRATEGIC INTELLIGENCE SUMMARY — Brand Positioning
**FORENSIC BRAND WARFARE FOR ${d.brandName || '[Brand]'} — Generate exactly 3 elite-tier strategic insights:**

**CONTEXT FOR ANALYSIS:**
- Brand Name: ${d.brandName || 'Not provided'}
- Brand Ideology: ${d.brandIdeology || 'Not provided'}
- Brand Archetype: ${d.brandArchetype || 'Not provided'}
- Brand Voice/Lexicon: ${d.brandLexicon || 'Not provided'}
- UVP: ${d.uvp || 'Not provided'}
- Existing Messaging: ${d.existingMessaging || 'Not provided'}
- Competitors: ${d.keyCompetitors || 'Not provided'}
- Target Audience: ${d.targetAudience || 'Not provided'}
- Channels: ${d.primaryChannels || 'Not provided'}

**BRAND WARFARE INTELLIGENCE:**
\`\`\`json
${JSON.stringify(c.brandRankings || {}, null, 2)}
\`\`\`
\`\`\`json
${JSON.stringify(c.narrativeConflict || {}, null, 2)}
\`\`\`
\`\`\`json
${JSON.stringify(c.categoryLanguage || {}, null, 2)}
\`\`\`
\`\`\`json
${JSON.stringify(c.socialPresence || {}, null, 2)}
\`\`\`

**🎯 INSIGHT #1: Mental Availability Gap Capture**
- Finding: "Brand mental availability mapping reveals: '[Category Entry Point relevant to ${d.coreTopic || 'topic'}]' triggers [X]% recall for ${d.keyCompetitors || 'competitors'} but only [Y]% for ${d.brandName || 'your brand'}. Gap = [Z]K monthly 'consideration moments' lost in ${d.industryVertical || 'industry'}"
- Competitive Edge: "${d.brandName || 'Your brand'} owns '[specific Category Entry Point]' through strategic deployment of '${d.brandArchetype || 'archetype'}' messaging across ${d.primaryChannels || 'channels'}. Competitors have weak presence on [channel]. This CEP has lowest competitive density and highest purchase intent correlation"
- Actionable Impact: "Capturing '[CEP]' mental availability = [X]K additional consideration moments/month for ${d.targetAudience || 'audience'}, translating to [Y%] increase in organic brand searches"

**🎯 INSIGHT #2: Distinctive Asset Amplification**
- Finding: "Brand distinctiveness audit reveals: '${d.brandLexicon || 'brand vocabulary'}' terminology has [X%] unique recognition but [Y%] underutilization across ${d.primaryChannels || 'channels'}. Competitors own '[competitor phrase]' with [W%] consistency"
- Competitive Edge: "Amplify '${d.brandIdeology || 'ideology'}' messaging and '${d.brandLexicon || 'vocabulary'}' across ${d.primaryChannels || 'channels'} with [Y%] consistency to achieve automatic '${d.brandName || 'brand'}' = '${d.brandArchetype || 'archetype'}' association within [Z] months"
- Actionable Impact: "Distinctive asset consistency improves ${d.brandName || 'brand'} recall by [X%] and reduces advertising waste by [Y%] through faster recognition among ${d.targetAudience || 'audience'}"

**🎯 INSIGHT #3: Positioning Void Occupation**
- Finding: "Perceptual mapping shows ${d.keyCompetitors || 'competitors'} clusters in '[current positioning]'. Unoccupied positioning territory: '[position aligned with ${d.brandIdeology || 'ideology'}]' — valued by [X%] of ${d.targetAudience || 'audience'} but claimed by ZERO competitors"
- Competitive Edge: "${d.brandName || 'Your brand'} claims unoccupied '${d.brandArchetype || 'archetype'}' position with '${d.uvp || 'UVP'}' proof point. First-mover in this positioning space creates [X]-year ownership window in ${d.industryVertical || 'industry'}"
- Actionable Impact: "Uncontested positioning reduces share-of-voice requirements by [X%] (no positioning battles) while commanding [Y%] price premium for ${d.primaryOfferName || 'primary offer'}"

**SECTION 5 INSIGHT JSON:**
\`\`\`json
{
  "sectionInsights": {
    "sectionNum": 5,
    "sectionTitle": "Brand Positioning",
    "insights": [
      {
        "id": 1,
        "type": "market_intelligence",
        "finding": "[Mental availability finding]",
        "competitiveEdge": "[Advantage description]",
        "impact": "[Quantified impact]",
        "priority": "high",
        "timeframe": "30-day"
      },
      {
        "id": 2,
        "type": "strategic_opportunity",
        "finding": "[Distinctive asset finding]",
        "competitiveEdge": "[Advantage description]",
        "impact": "[Quantified impact]",
        "priority": "high",
        "timeframe": "30-day"
      },
      {
        "id": 3,
        "type": "strategic_opportunity",
        "finding": "[Positioning void finding]",
        "competitiveEdge": "[Advantage description]",
        "impact": "[Quantified impact]",
        "priority": "critical",
        "timeframe": "immediate"
      }
    ],
    "keyMetrics": {
      "opportunityScore": 0,
      "competitiveGap": 0,
      "executionComplexity": 0
    }
  }
}
\`\`\`
`;
}

// ════════════════════════════════════════════════════════════════════════════════
// SECTION 6: CONTENT STRATEGY
// ════════════════════════════════════════════════════════════════════════════════

function getSection6Template(data, compData) {
  const d = data || {};
  const c = compData || {};
  
  return `
### 6.5 STRATEGIC INTELLIGENCE SUMMARY — Content Strategy
**FORENSIC CONTENT ARCHITECTURE FOR ${d.brandName || '[Brand]'} — Generate exactly 3 elite-tier strategic insights:**

**CONTEXT FOR ANALYSIS:**
- Core Topic: ${d.coreTopic || 'Not provided'}
- Content Goals: ${d.contentGoals || 'Not provided'}
- Content Formats: ${d.contentFormats || 'Not provided'}
- Distribution Channels: ${d.primaryChannels || 'Not provided'}
- Quarterly Objective: ${d.quarterlyObjective || 'Not provided'}
- KPIs: ${d.northStarKpis || 'Not provided'}
- Competitors: ${d.keyCompetitors || 'Not provided'}

**CONTENT INTELLIGENCE:**
\`\`\`json
${JSON.stringify(c.contentAnalysis || {}, null, 2)}
\`\`\`
\`\`\`json
${JSON.stringify(c.contentGaps || {}, null, 2)}
\`\`\`
\`\`\`json
${JSON.stringify(c.contentArchitecture || {}, null, 2)}
\`\`\`
\`\`\`json
${JSON.stringify(c.primaryKeywords || {}, null, 2)}
\`\`\`
\`\`\`json
${JSON.stringify(c.keywordGaps || {}, null, 2)}
\`\`\`

**🎯 INSIGHT #1: Pillar Dominance Opportunity**
- Finding: "Content gap forensics reveal: '${d.coreTopic || 'core topic'}' has [X]K combined monthly search volume across [Y] clusters, but NO competitor from ${d.keyCompetitors || 'competitors'} owns comprehensive coverage. Current leader covers only [Z%] of semantic territory with [N] pillars"
- Competitive Edge: "${d.brandName || 'Your brand'} deploys [X]-piece content fortress around '${d.coreTopic || 'topic'}' using ${d.contentFormats || 'content formats'} with [Y] interlinked clusters. Topical authority signals + internal linking velocity = ranking dominance within [Z] months"
- Actionable Impact: "Pillar dominance for '${d.coreTopic || 'topic'}' = $[X]K monthly OTV + [Y]% of category's featured snippets + [Z] AI Overview citations. Directly achieves ${d.quarterlyObjective || 'quarterly objective'}"

**🎯 INSIGHT #2: Content Velocity Kill Zone**
- Finding: "Competitor content velocity: ${d.keyCompetitors || 'competitors'} publishes [X pieces/month] on '${d.coreTopic || 'topic'}'. Their content decay rate = [Y%]/quarter (average freshness: [score]). Opportunity: outpace at [Z]x velocity to trigger algorithmic preference shift"
- Competitive Edge: "${d.brandName || 'Your brand'} deploys content production system using ${d.contentFormats || 'formats'} to achieve [X]x competitor velocity while maintaining quality threshold above [score]. Distribute via ${d.primaryChannels || 'channels'} for velocity + freshness signals = [Z] months to ranking displacement"
- Actionable Impact: "Content velocity dominance in '${d.coreTopic || 'topic'}' yields: [X]K additional monthly visitors toward ${d.northStarKpis || 'KPIs'}, [Y] new backlinks/month, $[Z]K organic traffic value"

**🎯 INSIGHT #3: Semantic Moat Architecture**
- Finding: "NLP entity analysis reveals: '${d.coreTopic || 'topic'}' semantic map contains [X] entities. ${d.brandName || 'Your brand'} content covers [Y%], ${d.keyCompetitors || 'competitors'} covers [Z%]. Uncovered high-value entities: [list top 3]"
- Competitive Edge: "${d.brandName || 'Your brand'} creates 'semantic fortress' by covering [X] missing entities through ${d.contentFormats || 'formats'}. Entity coverage depth = Google's topical authority signal for AI-era rankings. Aligns with ${d.brandIdeology || 'brand ideology'}"
- Actionable Impact: "Complete semantic coverage triggers: [X%] improvement in topical authority score, [Y] additional ranking keywords, [Z%] increase in AI Overview source citations for ${d.brandName || 'brand'}"

**SECTION 6 INSIGHT JSON:**
\`\`\`json
{
  "sectionInsights": {
    "sectionNum": 6,
    "sectionTitle": "Content Strategy",
    "insights": [
      {
        "id": 1,
        "type": "strategic_opportunity",
        "finding": "[Pillar dominance finding]",
        "competitiveEdge": "[Advantage description]",
        "impact": "[Quantified impact]",
        "priority": "critical",
        "timeframe": "30-day"
      },
      {
        "id": 2,
        "type": "market_intelligence",
        "finding": "[Content velocity finding]",
        "competitiveEdge": "[Advantage description]",
        "impact": "[Quantified impact]",
        "priority": "high",
        "timeframe": "30-day"
      },
      {
        "id": 3,
        "type": "strategic_opportunity",
        "finding": "[Semantic moat finding]",
        "competitiveEdge": "[Advantage description]",
        "impact": "[Quantified impact]",
        "priority": "high",
        "timeframe": "90-day"
      }
    ],
    "keyMetrics": {
      "opportunityScore": 0,
      "competitiveGap": 0,
      "executionComplexity": 0
    }
  }
}
\`\`\`
`;
}

// ════════════════════════════════════════════════════════════════════════════════
// SECTION 7: STRATEGIC MOAT
// ════════════════════════════════════════════════════════════════════════════════

function getSection7Template(data, compData) {
  const d = data || {};
  const c = compData || {};
  
  return `
### 7.5 STRATEGIC INTELLIGENCE SUMMARY — Strategic Moat
**FORENSIC MOAT ENGINEERING FOR ${d.brandName || '[Brand]'} — Generate exactly 3 elite-tier strategic insights:**

**CONTEXT FOR ANALYSIS:**
- Brand: ${d.brandName || 'Not provided'}
- Current Advantages: ${d.competitiveAdvantages || 'Not provided'}
- Product/Service: ${d.productOrService || 'Not provided'}
- Competitors: ${d.keyCompetitors || 'Not provided'}
- Target Audience: ${d.targetAudience || 'Not provided'}
- Future Vision: ${d.futureVision || 'Not provided'}
- Industry: ${d.industryVertical || 'Not provided'}

**MOAT INTELLIGENCE:**
\`\`\`json
${JSON.stringify(c.authorityRankings || {}, null, 2)}
\`\`\`
\`\`\`json
${JSON.stringify(c.contentArchitecture || {}, null, 2)}
\`\`\`
\`\`\`json
${JSON.stringify(c.overallScores || {}, null, 2)}
\`\`\`
\`\`\`json
${JSON.stringify(c.momentum || {}, null, 2)}
\`\`\`

**🎯 INSIGHT #1: Moat Vulnerability Assessment**
- Finding: "Current moat strength analysis for ${d.brandName || 'brand'}: '${d.competitiveAdvantages || 'advantages'}' rated [X/10] durability. VULNERABILITY: '${d.keyCompetitors || 'competitor'} momentum' could erode [Y%] of moat advantage within [Z] months if [trigger event]"
- Competitive Edge: "Preemptive moat reinforcement: layer '[secondary moat type]' onto ${d.competitiveAdvantages || 'advantages'} through '[specific action aligned with ${d.futureVision || 'vision'}]'. Multi-layer moats require [X]x competitor investment to breach"
- Actionable Impact: "Moat reinforcement investment of $[X] yields [Y]-year competitive insulation worth $[Z] in prevented revenue erosion for ${d.brandName || 'brand'} in ${d.industryVertical || 'industry'}"

**🎯 INSIGHT #2: Network Effect Activation**
- Finding: "Network effect potential for ${d.productOrService || 'product'}: current user base of [X]K ${d.targetAudience || 'users'} has [Y%] user-to-user interaction rate. Competitors lack community features. Latent network effect value = $[Z] per user once activated (currently dormant)"
- Competitive Edge: "${d.brandName || 'Your brand'} activates network effects through '[specific feature/mechanism enhancing ${d.productOrService || 'product'}]'. Threshold for network effect flywheel = [X]K active users. Current trajectory reaches threshold in [Y] months before competitors can respond"
- Actionable Impact: "Network effect activation transforms CAC from $[X] to $[Y] (user-driven acquisition), increases LTV by [Z]x, creates exponential growth curve toward ${d.futureVision || 'vision'}"

**🎯 INSIGHT #3: Switching Cost Engineering**
- Finding: "Current switching cost profile for ${d.productOrService || 'product'}: Technical = [X/10], Data = [Y/10], Learning = [Z/10], Relationship = [W/10]. Competitors have lowest switching cost in '[dimension]' — primary churn vulnerability"
- Competitive Edge: "${d.brandName || 'Your brand'} engineers switching costs in '[weakest dimension]' through '[specific mechanism leveraging ${d.competitiveAdvantages || 'advantages'}]'. Target: increase '[dimension]' switching cost from [X] to [Y] within [Z] months"
- Actionable Impact: "Switching cost elevation reduces ${d.brandName || 'brand'} churn by [X%], increases customer LTV by $[Y], and creates [Z]-month minimum customer lifecycle floor against competitors"

**SECTION 7 INSIGHT JSON:**
\`\`\`json
{
  "sectionInsights": {
    "sectionNum": 7,
    "sectionTitle": "Strategic Moat",
    "insights": [
      {
        "id": 1,
        "type": "risk_mitigation",
        "finding": "[Vulnerability finding]",
        "competitiveEdge": "[Advantage description]",
        "impact": "[Quantified impact]",
        "priority": "critical",
        "timeframe": "immediate"
      },
      {
        "id": 2,
        "type": "strategic_opportunity",
        "finding": "[Network effect finding]",
        "competitiveEdge": "[Advantage description]",
        "impact": "[Quantified impact]",
        "priority": "high",
        "timeframe": "90-day"
      },
      {
        "id": 3,
        "type": "market_intelligence",
        "finding": "[Switching cost finding]",
        "competitiveEdge": "[Advantage description]",
        "impact": "[Quantified impact]",
        "priority": "high",
        "timeframe": "30-day"
      }
    ],
    "keyMetrics": {
      "opportunityScore": 0,
      "competitiveGap": 0,
      "executionComplexity": 0
    }
  }
}
\`\`\`
`;
}

// ════════════════════════════════════════════════════════════════════════════════
// SECTION 8: ACTION PLAN
// ════════════════════════════════════════════════════════════════════════════════

function getSection8Template(data, compData) {
  const d = data || {};
  const c = compData || {};
  
  return `
### 8.5 STRATEGIC INTELLIGENCE SUMMARY — Action Plan
**FORENSIC EXECUTION ROADMAP FOR ${d.brandName || '[Brand]'} — Generate exactly 3 elite-tier strategic insights:**

**CONTEXT FOR ANALYSIS:**
- Quarterly Objective: ${d.quarterlyObjective || 'Not provided'}
- North Star KPIs: ${d.northStarKpis || 'Not provided'}
- Content Goals: ${d.contentGoals || 'Not provided'}
- Distribution Channels: ${d.primaryChannels || 'Not provided'}
- Primary Offer: ${d.primaryOfferName || 'Not provided'} @ ${d.primaryOfferPrice || 'Not provided'}
- Upsell Offer: ${d.upsellOffer || 'Not provided'}
- Seasonality: ${d.seasonality || 'Not provided'}

**ACTION PLAN INTELLIGENCE:**
\`\`\`json
${JSON.stringify(c.prioritizedActions || {}, null, 2)}
\`\`\`
\`\`\`json
${JSON.stringify(c.conversionAnalysis || {}, null, 2)}
\`\`\`
\`\`\`json
${JSON.stringify(c.distributionChannels || {}, null, 2)}
\`\`\`

**🎯 INSIGHT #1: Quick Win Cascade**
- Finding: "ROI-weighted prioritization for ${d.brandName || 'brand'} reveals: '[Specific quick win action aligned with ${d.contentGoals || 'goals'}]' requires [X hours] investment but yields [Y%] of total strategy value toward ${d.quarterlyObjective || 'objective'}. Execution sequence: [action] → [action] → [action] creates momentum cascade"
- Competitive Edge: "Quick wins in Week 1-2 generate '[specific early result toward ${d.northStarKpis || 'KPIs'}]' that validates larger initiatives. Leverage ${d.seasonality || 'seasonality'} timing for maximum impact. Competitors' 'planning paralysis' creates [X]-week execution advantage"
- Actionable Impact: "Quick win cascade delivers: $[X] value in 30 days, [Y] proof points for ${d.primaryOfferName || 'primary offer'} promotion, [Z%] team momentum increase toward ${d.quarterlyObjective || 'objective'}"

**🎯 INSIGHT #2: Resource Allocation Optimization**
- Finding: "Resource forensics for ${d.brandName || 'brand'}: current allocation spends [X%] on '[low-impact activity]' yielding [Y%] toward ${d.northStarKpis || 'KPIs'}. Reallocation opportunity: shift [Z%] resources to '[high-impact activity via ${d.primaryChannels || 'channels'}]' for [W]x ROI improvement"
- Competitive Edge: "Asymmetric resource deployment: concentrate [X%] of resources on [Y] highest-impact initiatives aligned with ${d.contentGoals || 'goals'} vs. competitors' spread-thin approach across [Z] initiatives"
- Actionable Impact: "Optimized resource allocation yields: [X%] improvement in ${d.northStarKpis || 'KPIs'}, [Y] fewer wasted initiatives, [Z]-month acceleration toward ${d.quarterlyObjective || 'objective'}"

**🎯 INSIGHT #3: Execution Risk Mitigation**
- Finding: "Execution risk matrix for ${d.brandName || 'brand'} identifies: '[Specific risk to ${d.quarterlyObjective || 'objective'}]' has [X%] probability and $[Y] impact. Current mitigation = [none/weak]. Risk-adjusted strategy value drops [Z%] without mitigation"
- Competitive Edge: "Implement '[specific contingency protecting ${d.primaryOfferName || 'offer'} launch and ${d.contentGoals || 'goals'}]' to reduce '[risk]' probability to [X%]. Factor in ${d.seasonality || 'seasonality'} timing considerations"
- Actionable Impact: "Risk mitigation preserves $[X] in strategy value, ensures [Y%] execution confidence for ${d.quarterlyObjective || 'objective'}, maintains [Z]-month timeline integrity for ${d.upsellOffer || 'upsell'} rollout"

**SECTION 8 INSIGHT JSON:**
\`\`\`json
{
  "sectionInsights": {
    "sectionNum": 8,
    "sectionTitle": "Action Plan",
    "insights": [
      {
        "id": 1,
        "type": "strategic_opportunity",
        "finding": "[Quick win finding]",
        "competitiveEdge": "[Advantage description]",
        "impact": "[Quantified impact]",
        "priority": "critical",
        "timeframe": "immediate"
      },
      {
        "id": 2,
        "type": "market_intelligence",
        "finding": "[Resource finding]",
        "competitiveEdge": "[Advantage description]",
        "impact": "[Quantified impact]",
        "priority": "high",
        "timeframe": "30-day"
      },
      {
        "id": 3,
        "type": "risk_mitigation",
        "finding": "[Risk finding]",
        "competitiveEdge": "[Advantage description]",
        "impact": "[Quantified impact]",
        "priority": "high",
        "timeframe": "30-day"
      }
    ],
    "keyMetrics": {
      "opportunityScore": 0,
      "competitiveGap": 0,
      "executionComplexity": 0
    }
  }
}
\`\`\`
`;
}

// ════════════════════════════════════════════════════════════════════════════════
// SECTION 9: AEO CITATION
// ════════════════════════════════════════════════════════════════════════════════

function getSection9Template(data, compData) {
  const d = data || {};
  const c = compData || {};
  
  return `
### 9.5 STRATEGIC INTELLIGENCE SUMMARY — AEO Citation Matrix
**FORENSIC AI OPTIMIZATION FOR ${d.brandName || '[Brand]'} — Generate exactly 3 elite-tier strategic insights:**

**CONTEXT FOR ANALYSIS:**
- Brand: ${d.brandName || 'Not provided'}
- Core Topic: ${d.coreTopic || 'Not provided'}
- Industry: ${d.industryVertical || 'Not provided'}
- Target Audience: ${d.targetAudience || 'Not provided'}
- Content Formats: ${d.contentFormats || 'Not provided'}
- Competitors: ${d.keyCompetitors || 'Not provided'}

**AEO/GEO INTELLIGENCE:**
\`\`\`json
${JSON.stringify(c.geoAnalysis || {}, null, 2)}
\`\`\`
\`\`\`json
${JSON.stringify(c.aioRisk || {}, null, 2)}
\`\`\`
\`\`\`json
${JSON.stringify(c.zeroClickSurvival || {}, null, 2)}
\`\`\`
\`\`\`json
${JSON.stringify(c.ragReadiness || {}, null, 2)}
\`\`\`

**🎯 INSIGHT #1: Citation Source Pattern Exploitation**
- Finding: "AI Overview citation forensics for '${d.coreTopic || 'topic'}' reveal: [X%] of citations come from content with '[specific attribute: list format/tables/FAQ schema/expert quotes]'. ${d.brandName || 'Your brand'} current citation rate: [Y]% vs. competitors at [Z]%"
- Competitive Edge: "${d.brandName || 'Your brand'} restructures '[X] existing assets' in ${d.contentFormats || 'formats'} with '[citation-optimized format]' to match AI citation preference patterns for ${d.industryVertical || 'industry'}. Implementation: [specific structural changes]"
- Actionable Impact: "Citation-optimized content structure yields: [X] additional AI Overview citations/month for ${d.brandName || 'brand'}, [Y]K incremental impressions among ${d.targetAudience || 'audience'}, [Z%] increase in zero-click brand visibility"

**🎯 INSIGHT #2: Query Intent Alignment Gap**
- Finding: "AEO query analysis for '${d.coreTopic || 'topic'}': '[High-value query cluster]' triggers AI Overview [X]% of time. ${d.brandName || 'Your brand'}'s current content addresses [Y%] of query intent dimensions. Missing intent dimensions for ${d.targetAudience || 'audience'}: [list]"
- Competitive Edge: "${d.brandName || 'Your brand'} creates 'intent-complete' content using ${d.contentFormats || 'formats'} that addresses ALL [X] query intent dimensions in single asset. Competitors provide partial answers requiring [Y] clicks to complete"
- Actionable Impact: "Intent-complete positioning captures: [X%] of AI Overview citations for query cluster, [Y] featured snippet positions in ${d.industryVertical || 'industry'}, [Z%] reduction in search-to-competitor leakage"

**🎯 INSIGHT #3: AI Training Data Dominance**
- Finding: "LLM training corpus analysis: '${d.coreTopic || 'topic'}' knowledge primarily sourced from [leader] in ${d.industryVertical || 'industry'}. ${d.brandName || 'Your brand'} presence in training-worthy content: [Y%]. Gap to category leader: [Z%]"
- Competitive Edge: "${d.brandName || 'Your brand'} deploys '[AI-training-worthy content type from ${d.contentFormats || 'formats'}]' with '[citation-worthy attributes]' to establish ${d.brandName || 'brand'} as primary source for '${d.coreTopic || 'topic'}' in future LLM training cycles"
- Actionable Impact: "AI training data dominance = [X]-year compounding advantage as LLMs increasingly cite ${d.brandName || 'brand'} as authoritative source for '${d.coreTopic || 'topic'}' among ${d.targetAudience || 'audience'}"

**SECTION 9 INSIGHT JSON:**
\`\`\`json
{
  "sectionInsights": {
    "sectionNum": 9,
    "sectionTitle": "AEO Citation Matrix",
    "insights": [
      {
        "id": 1,
        "type": "strategic_opportunity",
        "finding": "[Citation pattern finding]",
        "competitiveEdge": "[Advantage description]",
        "impact": "[Quantified impact]",
        "priority": "high",
        "timeframe": "30-day"
      },
      {
        "id": 2,
        "type": "market_intelligence",
        "finding": "[Query intent finding]",
        "competitiveEdge": "[Advantage description]",
        "impact": "[Quantified impact]",
        "priority": "high",
        "timeframe": "30-day"
      },
      {
        "id": 3,
        "type": "strategic_opportunity",
        "finding": "[AI training finding]",
        "competitiveEdge": "[Advantage description]",
        "impact": "[Quantified impact]",
        "priority": "critical",
        "timeframe": "90-day"
      }
    ],
    "keyMetrics": {
      "opportunityScore": 0,
      "competitiveGap": 0,
      "executionComplexity": 0
    }
  }
}
\`\`\`
`;
}

// ════════════════════════════════════════════════════════════════════════════════
// SECTION 10: DIGITAL ASSET VALUATION
// ════════════════════════════════════════════════════════════════════════════════

function getSection10Template(data, compData) {
  const d = data || {};
  const c = compData || {};
  
  return `
### 10.5 STRATEGIC INTELLIGENCE SUMMARY — Digital Asset Valuation
**FORENSIC ASSET ANALYSIS FOR ${d.brandName || '[Brand]'} — Generate exactly 3 elite-tier strategic insights:**

**CONTEXT FOR ANALYSIS:**
- Brand: ${d.brandName || 'Not provided'}
- Core Topic: ${d.coreTopic || 'Not provided'}
- Content Formats: ${d.contentFormats || 'Not provided'}
- Content Goals: ${d.contentGoals || 'Not provided'}
- KPIs: ${d.northStarKpis || 'Not provided'}
- Industry: ${d.industryVertical || 'Not provided'}

**ASSET VALUATION INTELLIGENCE:**
\`\`\`json
${JSON.stringify(c.authorityRankings || {}, null, 2)}
\`\`\`
\`\`\`json
${JSON.stringify(c.contentAnalysis || {}, null, 2)}
\`\`\`
\`\`\`json
${JSON.stringify(c.performanceMetrics || {}, null, 2)}
\`\`\`
\`\`\`json
${JSON.stringify(c.conversionAnalysis || {}, null, 2)}
\`\`\`

**🎯 INSIGHT #1: Undervalued Asset Discovery**
- Finding: "Asset forensics for ${d.brandName || 'brand'} reveal: '[Specific asset type from ${d.contentFormats || 'formats'}]' generates [X] organic visits/month but receives [Y%] of content investment. ROI ratio: [Z]x higher than average asset class in ${d.industryVertical || 'industry'}"
- Competitive Edge: "${d.brandName || 'Your brand'} increases '[undervalued asset type]' investment yields disproportionate [Y]x return vs. competitors' investment in '[overvalued asset type]'. Aligns with ${d.contentGoals || 'goals'}"
- Actionable Impact: "Asset reallocation from '[overinvested area]' to '[undervalued asset]' improves portfolio ROI by [X%] toward ${d.northStarKpis || 'KPIs'} and adds $[Y]K monthly organic value"

**🎯 INSIGHT #2: Asset Compound Growth Potential**
- Finding: "Asset aging analysis for ${d.brandName || 'brand'}: '[Specific asset on ${d.coreTopic || 'topic'}]' created [X] months ago shows [Y%] month-over-month traffic growth (compound). Projected 12-month value: $[Z]K if growth sustained"
- Competitive Edge: "${d.brandName || 'Your brand'} identifies and nurtures '[X] high-compound assets' with strategic updates/promotion vs. competitors' 'publish and forget' approach"
- Actionable Impact: "Compound asset nurturing yields: [X%] higher portfolio growth rate toward ${d.northStarKpis || 'KPIs'}, [Y] evergreen ranking positions, $[Z]K incremental annual value in ${d.industryVertical || 'industry'}"

**🎯 INSIGHT #3: Asset Liability Elimination**
- Finding: "Asset liability audit for ${d.brandName || 'brand'}: [X] assets ([Y%] of portfolio) generate negative ROI due to '[reason: cannibalization/thin content/outdated info]'. Total liability: $[Z]K in wasted crawl budget + opportunity cost"
- Competitive Edge: "${d.brandName || 'Your brand'} executes '[consolidation/pruning/redirect strategy]' to eliminate liabilities and concentrate authority on high-performers for ${d.coreTopic || 'topic'}"
- Actionable Impact: "Liability elimination improves: crawl efficiency by [X%], domain authority concentration by [Y%], and recovers $[Z]K in misallocated value toward ${d.contentGoals || 'goals'}"

**SECTION 10 INSIGHT JSON:**
\`\`\`json
{
  "sectionInsights": {
    "sectionNum": 10,
    "sectionTitle": "Digital Asset Valuation",
    "insights": [
      {
        "id": 1,
        "type": "market_intelligence",
        "finding": "[Undervalued asset finding]",
        "competitiveEdge": "[Advantage description]",
        "impact": "[Quantified impact]",
        "priority": "high",
        "timeframe": "30-day"
      },
      {
        "id": 2,
        "type": "strategic_opportunity",
        "finding": "[Compound growth finding]",
        "competitiveEdge": "[Advantage description]",
        "impact": "[Quantified impact]",
        "priority": "high",
        "timeframe": "90-day"
      },
      {
        "id": 3,
        "type": "risk_mitigation",
        "finding": "[Liability finding]",
        "competitiveEdge": "[Advantage description]",
        "impact": "[Quantified impact]",
        "priority": "high",
        "timeframe": "30-day"
      }
    ],
    "keyMetrics": {
      "opportunityScore": 0,
      "competitiveGap": 0,
      "executionComplexity": 0
    }
  }
}
\`\`\`
`;
}

// ════════════════════════════════════════════════════════════════════════════════
// SECTION 11: ALGORITHMIC RISK (BRITTLENESS)
// ════════════════════════════════════════════════════════════════════════════════

function getSection11Template(data, compData) {
  const d = data || {};
  const c = compData || {};
  
  return `
### 11.5 STRATEGIC INTELLIGENCE SUMMARY — Algorithmic Risk Assessment
**FORENSIC RISK INTELLIGENCE FOR ${d.brandName || '[Brand]'} — Generate exactly 3 elite-tier strategic insights:**

**CONTEXT FOR ANALYSIS:**
- Brand: ${d.brandName || 'Not provided'}
- Core Topic: ${d.coreTopic || 'Not provided'}
- Industry: ${d.industryVertical || 'Not provided'}
- KPIs: ${d.northStarKpis || 'Not provided'}
- Content Goals: ${d.contentGoals || 'Not provided'}
- Competitors: ${d.keyCompetitors || 'Not provided'}

**RISK INTELLIGENCE:**
\`\`\`json
${JSON.stringify(c.healthRankings || {}, null, 2)}
\`\`\`
\`\`\`json
${JSON.stringify(c.eeatSignals || {}, null, 2)}
\`\`\`
\`\`\`json
${JSON.stringify(c.performanceMetrics || {}, null, 2)}
\`\`\`
\`\`\`json
${JSON.stringify(c.aioRisk || {}, null, 2)}
\`\`\`

**🎯 INSIGHT #1: Algorithm Vulnerability Exposure**
- Finding: "Risk forensics for ${d.brandName || 'brand'} reveal: [X%] of organic traffic depends on '[specific ranking factor]' vulnerable to '[predicted algorithm shift]'. AI Overview exposure shows [Y]% with [Z%] click reduction estimate. Exposure timeline: [W] months based on Google's update patterns in ${d.industryVertical || 'industry'}"
- Competitive Edge: "${d.brandName || 'Your brand'}'s pre-emptive diversification: reduce '[vulnerable factor]' dependency from [X%] to [Y%] before algorithm shift. Competitors with [health score]% health score face [W%] traffic loss"
- Actionable Impact: "Proactive risk mitigation preserves $[X]K monthly OTV toward ${d.northStarKpis || 'KPIs'} while competitors face [Y%] traffic decline post-update"

**🎯 INSIGHT #2: E-E-A-T Gap Remediation**
- Finding: "E-E-A-T audit for ${d.brandName || 'brand'} on '${d.coreTopic || 'topic'}' reveals: Experience = [X/10], Expertise = [Y/10], Authority = [Z/10], Trust = [W/10]. Critical gap: '[lowest dimension]' exposes [V%] of content to ranking volatility in ${d.industryVertical || 'industry'}"
- Competitive Edge: "${d.brandName || 'Your brand'} closes '[E-E-A-T gap]' through '[specific remediation: author bios/credentials/citations/reviews]'. Target: raise '[dimension]' from [X/10] to [Y/10] within [Z] months. Supports ${d.contentGoals || 'goals'}"
- Actionable Impact: "E-E-A-T remediation stabilizes rankings for [X] vulnerable pages worth $[Y]K/month and future-proofs ${d.brandName || 'brand'} against quality updates"

**🎯 INSIGHT #3: Traffic Concentration Risk**
- Finding: "Traffic concentration analysis for ${d.brandName || 'brand'}: [X%] of organic value concentrated in [Y] pages. Single-page dependency risk: '[Top page on ${d.coreTopic || 'topic'}]' loss = $[Z]K monthly impact on ${d.northStarKpis || 'KPIs'}"
- Competitive Edge: "${d.brandName || 'Your brand'} deploys 'traffic fortress' strategy: create [X] supporting pages per high-value page to distribute ranking risk and capture long-tail for '${d.coreTopic || 'topic'}'"
- Actionable Impact: "Traffic distribution reduces concentration risk by [X%], captures [Y]K additional long-tail visits, and insulates ${d.brandName || 'brand'} against single-page ranking volatility"

**SECTION 11 INSIGHT JSON:**
\`\`\`json
{
  "sectionInsights": {
    "sectionNum": 11,
    "sectionTitle": "Algorithmic Risk Assessment",
    "insights": [
      {
        "id": 1,
        "type": "risk_mitigation",
        "finding": "[Algorithm vulnerability finding]",
        "competitiveEdge": "[Advantage description]",
        "impact": "[Quantified impact]",
        "priority": "critical",
        "timeframe": "immediate"
      },
      {
        "id": 2,
        "type": "risk_mitigation",
        "finding": "[E-E-A-T gap finding]",
        "competitiveEdge": "[Advantage description]",
        "impact": "[Quantified impact]",
        "priority": "high",
        "timeframe": "30-day"
      },
      {
        "id": 3,
        "type": "risk_mitigation",
        "finding": "[Concentration risk finding]",
        "competitiveEdge": "[Advantage description]",
        "impact": "[Quantified impact]",
        "priority": "high",
        "timeframe": "30-day"
      }
    ],
    "keyMetrics": {
      "opportunityScore": 0,
      "competitiveGap": 0,
      "executionComplexity": 0
    }
  }
}
\`\`\`
`;
}

// ════════════════════════════════════════════════════════════════════════════════
// SECTION 12: SEMANTIC DNA (INFORMATION BLACK HOLES)
// ════════════════════════════════════════════════════════════════════════════════

function getSection12Template(data, compData) {
  const d = data || {};
  const c = compData || {};
  
  return `
### 12.5 STRATEGIC INTELLIGENCE SUMMARY — Semantic DNA Analysis
**FORENSIC SEMANTIC INTELLIGENCE FOR ${d.brandName || '[Brand]'} — Generate exactly 3 elite-tier strategic insights:**

**CONTEXT FOR ANALYSIS:**
- Brand: ${d.brandName || 'Not provided'}
- Core Topic: ${d.coreTopic || 'Not provided'}
- Industry: ${d.industryVertical || 'Not provided'}
- Content Formats: ${d.contentFormats || 'Not provided'}
- Content Goals: ${d.contentGoals || 'Not provided'}
- Competitors: ${d.keyCompetitors || 'Not provided'}

**SEMANTIC INTELLIGENCE:**
\`\`\`json
${JSON.stringify(c.contentAnalysis || {}, null, 2)}
\`\`\`
\`\`\`json
${JSON.stringify(c.primaryKeywords || {}, null, 2)}
\`\`\`
\`\`\`json
${JSON.stringify(c.secondaryKeywords || {}, null, 2)}
\`\`\`
\`\`\`json
${JSON.stringify(c.schemaAnalysis || {}, null, 2)}
\`\`\`

**🎯 INSIGHT #1: Entity Gap Exploitation**
- Finding: "NLP entity extraction for '${d.coreTopic || 'topic'}' reveals: semantic graph contains [X] entities. ${d.brandName || 'Your brand'} content covers [Y%] ([Z] entities), ${d.keyCompetitors || 'competitors'} covers [W%]. UNCOVERED high-value entities in ${d.industryVertical || 'industry'}: [list top 5]"
- Competitive Edge: "${d.brandName || 'Your brand'} creates entity-targeted content using ${d.contentFormats || 'formats'} for '[uncovered entities]' to complete semantic graph. Full entity coverage signals comprehensive topical authority to Google's NLU for ${d.coreTopic || 'topic'}"
- Actionable Impact: "Entity gap closure yields: [X%] improvement in topic relevance scores, [Y] additional semantic keyword rankings, [Z%] increase in featured snippet eligibility supporting ${d.contentGoals || 'goals'}"

**🎯 INSIGHT #2: Semantic Relationship Mapping**
- Finding: "Knowledge graph analysis for '${d.coreTopic || 'topic'}': '[Primary entity]' has [X] semantic relationships. ${d.brandName || 'Your brand'} content establishes [Y] relationships vs. competitors' [Z]. Missing relationships in ${d.industryVertical || 'industry'}: [list]"
- Competitive Edge: "${d.brandName || 'Your brand'} engineers semantic relationships through '${d.contentFormats || 'formats'}: comparisons/integrations/workflows' that explicitly connect '[entity A]' to '[entity B]' for ${d.targetAudience || 'audience'}"
- Actionable Impact: "Semantic relationship building improves: Knowledge Panel eligibility by [X%], entity salience scores by [Y%], and cross-topic ranking potential in ${d.industryVertical || 'industry'}"

**🎯 INSIGHT #3: Topic Authority Consolidation**
- Finding: "Topic authority fragmentation: ${d.brandName || 'brand'} has [X] pieces on '${d.coreTopic || 'topic'}' but authority diluted across [Y] URL patterns. Competitors consolidate authority in [Z] hub pages"
- Competitive Edge: "${d.brandName || 'Your brand'} consolidates '${d.coreTopic || 'topic'}' authority through 'hub-and-spoke/pillar/silo' architecture. Redirect [X] fragmented pages to [Y] authoritative hubs"
- Actionable Impact: "Authority consolidation yields: [X%] ranking improvement for hub pages, [Y] additional featured snippets, $[Z]K monthly OTV increase toward ${d.contentGoals || 'goals'}"

**SECTION 12 INSIGHT JSON:**
\`\`\`json
{
  "sectionInsights": {
    "sectionNum": 12,
    "sectionTitle": "Semantic DNA Analysis",
    "insights": [
      {
        "id": 1,
        "type": "strategic_opportunity",
        "finding": "[Entity gap finding]",
        "competitiveEdge": "[Advantage description]",
        "impact": "[Quantified impact]",
        "priority": "high",
        "timeframe": "30-day"
      },
      {
        "id": 2,
        "type": "market_intelligence",
        "finding": "[Relationship finding]",
        "competitiveEdge": "[Advantage description]",
        "impact": "[Quantified impact]",
        "priority": "high",
        "timeframe": "90-day"
      },
      {
        "id": 3,
        "type": "strategic_opportunity",
        "finding": "[Consolidation finding]",
        "competitiveEdge": "[Advantage description]",
        "impact": "[Quantified impact]",
        "priority": "high",
        "timeframe": "30-day"
      }
    ],
    "keyMetrics": {
      "opportunityScore": 0,
      "competitiveGap": 0,
      "executionComplexity": 0
    }
  }
}
\`\`\`
`;
}

// ════════════════════════════════════════════════════════════════════════════════
// SECTION 13: STRATEGIC IMPERATIVES
// ════════════════════════════════════════════════════════════════════════════════

function getSection13Template(data, compData) {
  const d = data || {};
  const c = compData || {};
  
  return `
### 13.5 STRATEGIC INTELLIGENCE SUMMARY — Strategic Imperatives
**FORENSIC PRIORITY MATRIX FOR ${d.brandName || '[Brand]'} — Generate exactly 3 elite-tier strategic insights:**

**CONTEXT FOR ANALYSIS:**
- Brand: ${d.brandName || 'Not provided'}
- Quarterly Objective: ${d.quarterlyObjective || 'Not provided'}
- North Star KPIs: ${d.northStarKpis || 'Not provided'}
- Content Goals: ${d.contentGoals || 'Not provided'}
- Primary Offer: ${d.primaryOfferName || 'Not provided'}
- Upsell Offer: ${d.upsellOffer || 'Not provided'}
- Seasonality: ${d.seasonality || 'Not provided'}
- Future Vision: ${d.futureVision || 'Not provided'}

**STRATEGIC PRIORITY INTELLIGENCE:**
\`\`\`json
${JSON.stringify(c.prioritizedActions || {}, null, 2)}
\`\`\`
\`\`\`json
${JSON.stringify(c.strategicOpportunities || {}, null, 2)}
\`\`\`
\`\`\`json
${JSON.stringify(c.momentum || {}, null, 2)}
\`\`\`
\`\`\`json
${JSON.stringify(c.categoryScores || {}, null, 2)}
\`\`\`

**🎯 INSIGHT #1: Critical Path Identification**
- Finding: "Dependency analysis for ${d.brandName || 'brand'} reveals: '[Strategic initiative aligned with ${d.quarterlyObjective || 'objective'}]' is the critical path blocker for [X] downstream initiatives. Delay in '[initiative]' cascades to [Y]-month overall strategy delay"
- Competitive Edge: "${d.brandName || 'Your brand'} allocates [X%] of immediate resources to unblock '[critical path initiative]' supporting ${d.contentGoals || 'goals'}. Competitors' parallel execution approach creates [Y]-month window while they wait for dependencies"
- Actionable Impact: "Critical path acceleration delivers: [X]-month faster time-to-value for ${d.primaryOfferName || 'offer'}, [Y] initiatives unblocked, $[Z]K in accelerated revenue toward ${d.quarterlyObjective || 'objective'}"

**🎯 INSIGHT #2: Resource-Impact Optimization**
- Finding: "Pareto analysis for ${d.brandName || 'brand'}: [X%] of strategic initiatives deliver [Y%] of projected value toward ${d.northStarKpis || 'KPIs'}. Top 3 high-impact initiatives: 1) [initiative for ${d.contentGoals || 'goals'}], 2) [initiative], 3) [initiative for ${d.futureVision || 'vision'}]"
- Competitive Edge: "${d.brandName || 'Your brand'}'s ruthless prioritization: execute top [X] initiatives at 100% resourcing vs. [Y] initiatives at [Z%] resourcing. Depth beats breadth. Align with ${d.seasonality || 'seasonality'} timing"
- Actionable Impact: "Focused execution yields: [X%] higher completion rate for ${d.quarterlyObjective || 'objective'}, [Y]x faster results, [Z%] reduction in resource waste"

**🎯 INSIGHT #3: Sequencing Optimization**
- Finding: "Initiative sequencing for ${d.brandName || 'brand'}: executing '[Initiative A for ${d.primaryOfferName || 'offer'}]' before '[Initiative B for ${d.upsellOffer || 'upsell'}]' reduces B's cost by [X%] and improves B's success probability by [Y%]. Current plan has suboptimal sequencing"
- Competitive Edge: "${d.brandName || 'Your brand'} resequences to: [Optimized order aligned with ${d.seasonality || 'seasonality'}]. This sequencing creates '[specific synergy]' that competitors executing in parallel cannot achieve toward ${d.futureVision || 'vision'}"
- Actionable Impact: "Optimized sequencing saves: $[X] in total execution cost, [Y] months in timeline toward ${d.quarterlyObjective || 'objective'}, [Z%] improvement in success probability"

**SECTION 13 INSIGHT JSON:**
\`\`\`json
{
  "sectionInsights": {
    "sectionNum": 13,
    "sectionTitle": "Strategic Imperatives",
    "insights": [
      {
        "id": 1,
        "type": "strategic_opportunity",
        "finding": "[Critical path finding]",
        "competitiveEdge": "[Advantage description]",
        "impact": "[Quantified impact]",
        "priority": "critical",
        "timeframe": "immediate"
      },
      {
        "id": 2,
        "type": "market_intelligence",
        "finding": "[Resource-impact finding]",
        "competitiveEdge": "[Advantage description]",
        "impact": "[Quantified impact]",
        "priority": "critical",
        "timeframe": "immediate"
      },
      {
        "id": 3,
        "type": "strategic_opportunity",
        "finding": "[Sequencing finding]",
        "competitiveEdge": "[Advantage description]",
        "impact": "[Quantified impact]",
        "priority": "high",
        "timeframe": "30-day"
      }
    ],
    "keyMetrics": {
      "opportunityScore": 0,
      "competitiveGap": 0,
      "executionComplexity": 0
    }
  }
}
\`\`\`
`;
}

// ════════════════════════════════════════════════════════════════════════════════
// SECTION 14: CROSS-STAGE SYNTHESIS
// ════════════════════════════════════════════════════════════════════════════════

function getSection14Template(data, compData) {
  const d = data || {};
  const c = compData || {};
  
  return `
### 14.5 STRATEGIC INTELLIGENCE SUMMARY — Cross-Stage Intelligence
**FORENSIC SYNTHESIS ANALYSIS FOR ${d.brandName || '[Brand]'} — Generate exactly 3 elite-tier strategic insights:**

**CONTEXT FOR ANALYSIS:**
- Brand: ${d.brandName || 'Not provided'}
- Core Topic: ${d.coreTopic || 'Not provided'}
- Industry: ${d.industryVertical || 'Not provided'}
- Brand Ideology: ${d.brandIdeology || 'Not provided'}
- Unique Value Proposition: ${d.uvp || 'Not provided'}
- Quarterly Objective: ${d.quarterlyObjective || 'Not provided'}
- North Star KPIs: ${d.northStarKpis || 'Not provided'}
- Future Vision: ${d.futureVision || 'Not provided'}
- Competitive Advantages: ${d.competitiveAdvantages || 'Not provided'}

**CROSS-STAGE SYNTHESIS INTELLIGENCE:**
\`\`\`json
${JSON.stringify(c.executiveSummary || {}, null, 2)}
\`\`\`
\`\`\`json
${JSON.stringify(c.overallScores || {}, null, 2)}
\`\`\`
\`\`\`json
${JSON.stringify(c.categoryScores || {}, null, 2)}
\`\`\`
\`\`\`json
${JSON.stringify(c.strategicOpportunities || {}, null, 2)}
\`\`\`

**🎯 INSIGHT #1: Cross-Section Pattern Discovery**
- Finding: "Multi-stage analysis for ${d.brandName || 'brand'} reveals: '[Pattern/theme related to ${d.coreTopic || 'topic'}]' appears in [X] of 13 sections, indicating systemic opportunity/threat in ${d.industryVertical || 'industry'}. Convergence points: [list sections where pattern strongest for ${d.uvp || 'UVP'}]"
- Competitive Edge: "${d.brandName || 'Your brand'} addresses '[cross-cutting theme]' holistically through '[integrated solution aligned with ${d.brandIdeology || 'ideology'}]' vs. competitors' siloed approach that misses the systemic nature"
- Actionable Impact: "Systemic solution yields: [X]x higher impact than point solutions toward ${d.quarterlyObjective || 'objective'}, [Y%] efficiency gain from consolidated execution, [Z] interconnected improvements supporting ${d.northStarKpis || 'KPIs'}"

**🎯 INSIGHT #2: Stage Dependency Leverage**
- Finding: "Inter-stage dependency map for ${d.brandName || 'brand'} reveals: Stage 1 (Customer) insights directly amplify Stage 6 (Content about ${d.coreTopic || 'topic'}) effectiveness by [X%]. Currently, only [Y%] of cross-stage synergies for ${d.uvp || 'UVP'} are being captured"
- Competitive Edge: "${d.brandName || 'Your brand'} implements cross-stage feedback loops: '[Specific integration mechanism for ${d.competitiveAdvantages || 'advantages'}]' ensures insights from '[Stage A]' automatically inform '[Stage B]' decisions toward ${d.futureVision || 'vision'}"
- Actionable Impact: "Cross-stage integration yields: [X%] improvement in overall strategy coherence for ${d.brandIdeology || 'ideology'}, [Y%] reduction in strategic conflicts, [Z]x amplification of individual stage impact toward ${d.quarterlyObjective || 'objective'}"

**🎯 INSIGHT #3: Unified Execution Acceleration**
- Finding: "Execution velocity analysis shows: current siloed execution takes [X] weeks per strategic initiative. Cross-stage coordination opportunity: '[shared resource/process/insight]' reduces execution time by [Y%] toward ${d.futureVision || 'vision'}"
- Competitive Edge: "${d.brandName || 'Your brand'} implements '[unified execution framework leveraging ${d.competitiveAdvantages || 'advantages'}]' that eliminates [X] redundant processes and accelerates time-to-impact for ${d.northStarKpis || 'KPIs'}"
- Actionable Impact: "Unified execution delivers: [X]-week faster strategic cycle time, [Y%] resource efficiency gain, [Z] additional strategic initiatives executable within same timeframe toward ${d.quarterlyObjective || 'objective'}"

**SECTION 14 INSIGHT JSON:**
\`\`\`json
{
  "sectionInsights": {
    "sectionNum": 14,
    "sectionTitle": "Cross-Stage Intelligence",
    "insights": [
      {
        "id": 1,
        "type": "market_intelligence",
        "finding": "[Pattern discovery finding]",
        "competitiveEdge": "[Advantage description]",
        "impact": "[Quantified impact]",
        "priority": "critical",
        "timeframe": "90-day"
      },
      {
        "id": 2,
        "type": "strategic_opportunity",
        "finding": "[Dependency leverage finding]",
        "competitiveEdge": "[Advantage description]",
        "impact": "[Quantified impact]",
        "priority": "high",
        "timeframe": "90-day"
      },
      {
        "id": 3,
        "type": "strategic_opportunity",
        "finding": "[Execution acceleration finding]",
        "competitiveEdge": "[Advantage description]",
        "impact": "[Quantified impact]",
        "priority": "high",
        "timeframe": "30-day"
      }
    ],
    "keyMetrics": {
      "opportunityScore": 0,
      "competitiveGap": 0,
      "executionComplexity": 0
    }
  }
}
\`\`\`
`;
}
