/**
 * Build elite CSO-level competitor analysis prompt
 * Uses all collected data: metadata, headings, keywords, intro, forensics, APIs
 */
function AI_buildCompetitorAnalysisPrompt(competitorData) {
  var prompt = `You are the **Chief Strategy Officer (CSO)** for a Fortune 500 Digital Agency.
Your task is to perform a deep, **Forensic, Predictive, and Strategic Evaluation** of a competitor based on the provided JSON dataset.

**CRITICAL INSTRUCTIONS:**
1. Do NOT just describe the data. **SYNTHESIZE** it.
2. Connect technical signals (e.g., "High Form Field Count") to business outcomes (e.g., "Low Conversion Efficiency").
3. Analyze EVERYTHING: metadata, headings, keywords, intro paragraphs, forensics, performance metrics.
4. Generate predictions, vulnerabilities, and strategic "kill shots".
5. Return ONLY valid JSON. No markdown. No conversational text.

---

### **THE 15-CATEGORY FRAMEWORK**

**I. MARKET + CATEGORY INTELLIGENCE**
- **Gap Analysis:** Analyze their heading hierarchy (${competitorData.totalHeadings || 0} headings) vs. their target keywords.
- Where are they shallow? Which topics have minimal H2/H3 depth?
- **Narrative Audit:** Read their intro paragraphs and brand text. Define their "Story":
  * "The Cheap Alternative" vs "The Premium Enterprise Solution"
  * "The Educational Authority" vs "The Aggressive Disruptor"
- **Content Velocity:** Analyze ${competitorData.velocity30d || 0} new pages in 30 days.
- **Prediction:** Based on velocity + humanity score, where will they be in 6 months?

**II. BRAND & STRATEGIC POSITIONING**
- **Archetype:** Analyze tone from intro paragraphs. Are they:
  * "Sage" (Educational, authoritative)
  * "Hero" (Aggressive, performance-focused)
  * "Everyman" (Relatable, accessible)
- **E-E-A-T Score:** Check schema types: ${JSON.stringify(competitorData.schemaTypes || [])}.
  * Do they have 'Person' entities? 'Review' schema? 'Organization' markup?
- **Title & Description Analysis:**
  * Title: "${competitorData.metaTitle || 'N/A'}"
  * Description: "${competitorData.metaDescription || 'N/A'}"
  * Are these optimized? Generic? Compelling?
- **Strategy:** If they lack E-E-A-T, recommend a "Trust-Based Attack" strategy.

**III. TECHNICAL SEO & PERFORMANCE**
- **Site Health:** Performance score ${competitorData.performance || 0}/100, LCP ${competitorData.lcp || 0}s, CLS ${competitorData.cls || 0}.
- **UX Friction:** Friction level: ${competitorData.frictionLevel || 'Unknown'} (${competitorData.frictionScore || 0} form fields).
  * High input count = High friction = Poor conversion.
- **CMS:** ${competitorData.cms || 'Unknown'}. Infer technical sophistication.
- **Heading Structure:** H1: ${competitorData.h1Count || 0}, H2: ${competitorData.h2Count || 0}, H3: ${competitorData.h3Count || 0}.
  * Is hierarchy valid? Multiple H1s? Missing structure?

**IV. ORGANIC TRAFFIC & CONTENT INTELLIGENCE**
- **AI Fingerprint:** Humanity Score: ${competitorData.humanityScore || 0}/100.
  * Score < 40: "Robotic/Mass-Generated". Strategy: Attack with High-Quality Human Content.
  * Score 40-70: "Hybrid AI-Human". Strategy: Match velocity + quality.
  * Score > 80: "Artisanal/Human". Strategy: Attack with Velocity + Automation.
- **Uniqueness Score:** ${competitorData.uniquenessScore || 0}/100. High uniqueness = strong moat.
- **Velocity:** ${competitorData.velocity30d || 0} new pages/30d. Are they dormant or aggressive?

**V. KEYWORD & ENTITY STRATEGY (DEEP ANALYSIS)**

**COMPREHENSIVE KEYWORD DATA AVAILABLE:**
- **Single Keywords:** ${competitorData.topKeywords ? competitorData.topKeywords.length : 0} keywords extracted from headings, meta tags, body content, links, and images
- **Long-tail Phrases:** ${competitorData.longTailKeywords ? competitorData.longTailKeywords.length : 0} multi-word phrases (2-4 words)
- **Semantic Clusters:** ${Object.keys(competitorData.semanticClusters || {}).length} topic clusters identified
- **Total Unique:** ${competitorData.totalUniqueKeywords || 0} unique keywords, ${competitorData.totalUniquePhrases || 0} unique phrases

**TOP KEYWORDS WITH SOURCES:**
${JSON.stringify(competitorData.topKeywords || [], null, 2)}

**LONG-TAIL KEYWORDS (Multi-word phrases):**
${JSON.stringify(competitorData.longTailKeywords || [], null, 2)}

**SEMANTIC CLUSTERS (Keywords grouped by topic):**
${JSON.stringify(competitorData.semanticClusters || {}, null, 2)}

**DEEP ANALYSIS REQUIRED:**

1. **Intent Distribution Analysis:**
   - Break down keywords into: Informational (how to, what is, guide, tutorial)
   - Commercial Investigation (best, top, vs, review, comparison)
   - Transactional (buy, price, cost, discount, deal)
   - Navigational (brand names, product names)
   - Provide exact percentages: "45% Informational, 30% Commercial, 15% Transactional, 10% Navigational"

2. **Semantic Depth Scoring:**
   - How many topic clusters do they cover? (SEO, Content, Technical, Analytics, etc.)
   - Which clusters are strongest (most keywords)?
   - Which clusters are weakest (1-2 keywords only)?
   - Are they generalists (many topics, shallow) or specialists (few topics, deep)?

3. **Keyword Sophistication Analysis:**
   - Ratio of single keywords vs long-tail phrases
   - Average phrase length (indicates content depth)
   - Presence of industry jargon vs layman terms
   - Technical keywords vs marketing buzzwords

4. **Vulnerable Keyword Opportunities:**
   - Find keywords appearing 1-3 times (present but not dominant)
   - Identify long-tail phrases with low repetition (easy to outrank)
   - Look for commercial intent keywords they're using but not emphasizing
   - Find semantic clusters with only 1-2 keywords (weak coverage)

5. **Missing Keyword Gaps:**
   - Based on their semantic clusters, what related keywords are MISSING?
   - If they have "seo" cluster, do they cover: seo audit, seo tools, seo checklist, seo strategy?
   - Find keyword variations they're not using (singular/plural, synonyms)
   - Identify question-based keywords they're missing (how, what, why, when)

6. **Keyword Cannibalization Risk:**
   - Are the same keywords repeated across many sources? (indicates focus or cannibalization)
   - High repetition = either authority topic OR internal competition

7. **Long-tail Strategy Assessment:**
   - Ratio of long-tail to head terms (should be 70:30 for mature sites)
   - Are they targeting specific, answerable queries?
   - Do long-tail phrases indicate they're answering user questions?

8. **Competitive Keyword Insights:**
   - Which of their keywords are most "valuable" (commercial intent + high repetition)?
   - Which keywords appear in BOTH headings AND meta tags? (indicates strategic focus)
   - Which keywords only appear in body content? (missed optimization opportunities)

**ANALYSIS OUTPUT REQUIREMENTS:**
- Provide TOP 15-20 vulnerable keywords with:
  * Keyword phrase
  * Current usage intensity (low/medium/high based on count)
  * Sources where found (headings, meta, body, links)
  * Intent type (informational/commercial/transactional)
  * Attack strategy (why this is vulnerable)
  * Estimated search volume (educated guess based on keyword type)
  * Keyword difficulty estimate (0-100)

- Provide TOP 10 missing keywords with:
  * Exact keyword phrase
  * Why it's missing (semantic gap, related cluster, competitor coverage)
  * Estimated search volume
  * Suggested content type (article, guide, comparison, tool)
  * Expected ranking potential (easy/medium/hard)

**VI. CONTENT SYSTEMS & OPERATIONS**
- **Workflow Detection:**
  * High Velocity (${competitorData.velocity30d}+) + Low Humanity (<50) = **"AI Automation Pipeline Detected"**.
  * Low Velocity (<10) + High Humanity (>80) = **"Editorial/Boutique Approach"**.
- **Tech Stack:** ${JSON.stringify(competitorData.techStack || [])}.
  * If "HubSpot"/"Marketo" present = Mature Lead Ops.
  * If "WordPress" = Manual/Semi-automated.

**VII. CONVERSION & MONETIZATION**
- **Funnel Forensics:**
  * Friction Level: ${competitorData.frictionLevel} (${competitorData.frictionScore} fields).
  * High friction = High-touch sales model.
  * Low friction = Self-serve PLG (Product Led Growth).
- **Pricing Detection:** ${competitorData.pricingDetected ? 'Detected' : 'Not detected'}.
- **Trial/Demo:** Trial: ${competitorData.trialDetected ? 'Yes' : 'No'}, Booking: ${competitorData.bookingDetected ? 'Yes' : 'No'}.

**VIII. DISTRIBUTION & VISIBILITY**
- **Organic Authority:** OpenPageRank ${competitorData.authority || 0}/100.
- **Traffic Estimates:** ${competitorData.organicTraffic || 0} organic visits, ${competitorData.organicKeywords || 0} ranking keywords.
- **Social Proof:** Analyze intro paragraphs for social signals ("10,000+ customers", "Fortune 500", etc.).

**IX. AUDIENCE & PSYCHOLOGY**
- **Persona:** Based on intro paragraphs and brand text, who are they targeting?
  * CTOs? Marketing Managers? Small Business Owners?
- **Emotional Triggers:** Analyze copy for:
  * Fear-based ("Don't lose money", "Avoid mistakes")
  * Greed-based ("10x your ROI", "Get more traffic")
  * Authority-based ("Industry leader", "Trusted by Fortune 500")

**X. GEO + AEO (AI ENGINE OPTIMIZATION)**
- **AEO Readiness:** Check schema types for FAQ, HowTo, QAPage.
- **Zero-Click Potential:** Do they answer questions directly in H2/H3 headings?
- **Voice Search:** Are headings natural language ("How do I...") or keyword-stuffed?

**XI. AUTHORITY & INFLUENCE**
- **Trust Tier:** Authority ${competitorData.authority || 0} + Schema presence = Trust Level.
- **Brand Signals:** Analyze intro for trust markers:
  * Customer counts, years in business, awards, certifications.

**XII. PERFORMANCE PREDICTION**
- **6-Month Forecast:** Based on:
  * Current velocity (${competitorData.velocity30d} pages/30d)
  * Humanity score (${competitorData.humanityScore})
  * Authority (${competitorData.authority})
  * Performance (${competitorData.performance})
- **Growth Trajectory:** Will they grow, plateau, or decline?
- **Revenue at Risk:** Estimate traffic value (${competitorData.organicTraffic} visits × industry CPC).

**XIII. STRATEGIC OPPORTUNITY MATRIX**
- **Blue Ocean Topics:** Analyze heading keywords. What topics are they completely ignoring?
- **Weak Signals:** What topics have only 1-2 headings? (Early stage, vulnerable).
- **Overinvested Topics:** What topics have 10+ headings? (Saturated, hard to compete).
- **Content Gaps:** Missing heading patterns (no "vs", no "best", no "how to").

**XIV. SCORING ENGINE**
- **Threat Level (0-100):** How dangerous is this competitor?
  * Factors: Authority, velocity, traffic, technical health, content quality.
- **Vulnerability Score (0-100):** Where can we attack?
  * Factors: Content gaps, weak headings, low humanity, poor performance.
- **Overall Competitive Score (0-100):** Weighted composite.

**XV. EXECUTIVE DELIVERABLES**
- **The "Kill Shot":** ONE specific, high-impact action to take market share:
  * Example: "Target their 15 'Position 11-20' keywords with superior content."
  * Example: "Attack their weak heading structure by building comprehensive pillar pages."
- **90-Day Roadmap:** 3 specific tactical steps with expected outcomes.
- **Resource Requirements:** Content team size, budget estimate, timeline.

---

### **CRITICAL: BE ULTRA-SPECIFIC IN ALL RECOMMENDATIONS**

**For Keyword Strategy:**
- Include 10-15 specific "vulnerable keywords" with:
  * Exact keyword phrase
  * Current estimated position (1-100)
  * Estimated monthly search volume
  * Keyword difficulty score (0-100)
  * Specific page URL where found (or "NEW" if creating new content)
  * Exact action to take
  * Expected outcome with metrics

**For Blue Ocean Topics:**
- Include estimated search volume for each topic
- Provide specific article titles (not just topics)
- Include suggested H2/H3 structure (at least 5-7 headings)
- Include target word count and expected ranking position

**For Quick Wins:**
- Include specific page URLs to optimize
- Include exact changes (e.g., "Add H2: 'How to Use X' after current H2 'Getting Started'")
- Include estimated impact with metrics (e.g., "+15% CTR", "+200 visits/month")
- Include implementation time estimate

**For 90-Day Roadmap:**
- Include specific article titles for each phase
- Include target keywords with search volumes
- Include word count targets and expected rankings
- Include specific deliverables with timelines

**Example of SPECIFIC vs GENERIC:**
❌ Generic: "Create content about SEO tools"
✅ Specific: "Create article 'Best SEO Tools for Small Businesses 2024' targeting keyword 'seo tools for small business' (1,200 searches/mo, difficulty 28), with H2 'Top 10 SEO Tools', H2 'How to Choose', H2 'Pricing Comparison'. Expected Position 3-5, 400 visits/month, 2,500 words, 8 hours."

---

### **OUTPUT FORMAT (STRICT JSON)**
Return **ONLY** valid JSON. No markdown. No conversational text.

{
  "domain": "${competitorData.domain || 'Unknown'}",
  "summary": "1-2 sentence strategic summary",
  "scores": {
    "threat": 0-100,
    "vulnerability": 0-100,
    "overall": 0-100,
    "methodology": "Explain how scores were calculated"
  },
  "categories": {
    "market_intel": {
      "narrative": "Their brand story/archetype",
      "gap_analysis": "Topics they're thin on",
      "velocity_analysis": "Publishing cadence insights",
      "prediction": "Where they'll be in 6 months"
    },
    "brand_pos": {
      "archetype": "Sage/Hero/Everyman/etc",
      "tone": "Educational/Aggressive/Relatable",
      "eeat_analysis": "Schema + trust signals analysis",
      "title_description_quality": "Meta optimization assessment"
    },
    "technical": {
      "health_score": 0-100,
      "friction_analysis": "UX friction assessment",
      "render_risk": "JS/SPA indexing risks",
      "heading_structure_quality": "H1/H2/H3 hierarchy analysis"
    },
    "content_intel": {
      "ai_fingerprint": "Human/Hybrid/AI-generated analysis",
      "velocity_analysis": "Publishing pace insights",
      "uniqueness_analysis": "Content differentiation",
      "intro_quality": "First 3 paragraphs effectiveness"
    },
    "keyword_strat": {
      "intent_mix": "Info vs Commercial intent breakdown",
      "top_keywords_analysis": "Analysis of their heading keywords",
      "vulnerable_keywords": [
        {
          "keyword": "exact keyword phrase",
          "position": 14,
          "search_volume": 1200,
          "difficulty": 32,
          "url": "/page/url or null",
          "action": "Specific action with details",
          "expected_position": "3-5",
          "expected_monthly_traffic": 450
        }
      ],
      "missing_keywords": [
        {
          "keyword": "exact keyword phrase",
          "search_volume": 2100,
          "difficulty": 25,
          "reason": "Why this is an opportunity",
          "suggested_title": "Exact article title",
          "suggested_structure": ["H2: First heading", "H2: Second heading"]
        }
      ]
    },
    "systems": {
      "workflow_detected": "AI Pipeline/Editorial/Hybrid",
      "tech_maturity": "Assessment of their tech stack",
      "cms_analysis": "CMS sophistication"
    },
    "conversion": {
      "funnel_type": "High-touch/Self-serve/Hybrid",
      "friction_level": "Low/Medium/High",
      "psychology": "Emotional triggers used",
      "monetization_model": "Freemium/Trial/Demo/Direct"
    },
    "distribution": {
      "omnichannel_score": 0-100,
      "traffic_sources": "Organic/Direct/Social mix",
      "social_presence": "Social proof analysis"
    },
    "audience": {
      "persona": "Who they're targeting",
      "emotional_trigger": "Fear/Greed/Authority",
      "messaging_effectiveness": "Copy quality assessment"
    },
    "geo_aeo": {
      "aeo_readiness": "Voice/AI search optimization",
      "zero_click_potential": "Direct answer capability",
      "schema_completeness": "Structured data coverage"
    },
    "authority": {
      "trust_tier": "Low/Medium/High/Elite",
      "brand_strength": "Brand signal analysis",
      "authority_sources": "Where authority comes from"
    },
    "performance": {
      "six_month_forecast": "Growth/Plateau/Decline",
      "revenue_risk": "Estimated traffic value",
      "trajectory": "Detailed growth prediction"
    },
    "opportunities": {
      "blue_ocean": [
        {
          "topic": "Specific topic name",
          "estimated_search_volume": 3200,
          "competitor_coverage": 0,
          "suggested_title": "Exact article title",
          "suggested_structure": ["H2: heading 1", "H2: heading 2", "H2: heading 3"],
          "target_word_count": 4500,
          "expected_ranking": "1-3",
          "expected_monthly_traffic": 1800,
          "implementation_time": "12 hours"
        }
      ],
      "weak_signals": [
        {
          "topic": "Emerging trend name",
          "current_coverage": "1 article with 3 H2s",
          "search_volume": 1500,
          "vulnerability": "Why weak",
          "attack_strategy": "Specific action",
          "expected_outcome": "Measurable result"
        }
      ],
      "content_gaps": [
        {
          "gap": "Type of missing content",
          "evidence": "What you observed",
          "search_demand": 18500,
          "suggested_articles": [
            {
              "title": "Exact title",
              "keyword": "target keyword",
              "search_volume": 4800,
              "difficulty": 38,
              "word_count": 3500,
              "expected_traffic": 1600
            }
          ]
        }
      ],
      "quick_wins": [
        {
          "action": "Specific action to take",
          "pages": ["/page1", "/page2"],
          "implementation_time": "8 hours",
          "expected_impact": "+23% CTR",
          "estimated_additional_traffic": 3500,
          "specific_changes": ["Change 1", "Change 2"]
        }
      ]
    },
    "scoring": {
      "threat_factors": ["Factor 1", "Factor 2"],
      "vulnerability_factors": ["Factor 1", "Factor 2"],
      "key_metrics": {"metric1": "value1"}
    },
    "executive": {
      "kill_shot": "The single most effective strategic move with SPECIFIC keywords, search volumes, and expected impact. Must include at least 3-5 exact keywords with metrics.",
      "ninety_day_roadmap": [
        {
          "phase": "Days 1-30",
          "action": "High-level action",
          "specific_articles": [
            {
              "title": "Exact article title",
              "keyword": "target keyword",
              "word_count": 2800,
              "structure": ["H2: heading 1", "H2: heading 2"],
              "implementation_time": "8 hours",
              "expected_position": "3-5",
              "expected_monthly_traffic": 450
            }
          ],
          "expected_outcome": "Measurable results with specific numbers"
        },
        {
          "phase": "Days 31-60",
          "action": "High-level action",
          "specific_articles": [],
          "expected_outcome": "Measurable results"
        },
        {
          "phase": "Days 61-90",
          "action": "High-level action",
          "specific_articles": [],
          "expected_outcome": "Measurable results"
        }
      ],
      "resource_requirements": {
        "content_team_size": 3,
        "team_composition": "Role breakdown",
        "budget_estimate": "$18,500",
        "budget_breakdown": {
          "content_creation": "$12,000",
          "video_production": "$3,000",
          "design": "$2,000"
        },
        "timeline": "90 days",
        "roi_projection": {
          "traffic_increase": "25,000+ monthly visits",
          "lead_generation": "800+ leads",
          "potential_annual_revenue": "$960,000"
        }
      }
    }
  },
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "weaknesses": ["Weakness 1", "Weakness 2", "Weakness 3"],
  "threats": ["Threat 1", "Threat 2"],
  "timestamp": "${new Date().toISOString()}"
}

**REMEMBER:**
1. Analyze ALL data: metadata, headings, keywords, intro, forensics.
2. Connect technical signals to business outcomes.
3. Be specific with predictions and recommendations.
4. Return ONLY valid JSON.
`;

  return prompt;
}

/**
 * Legacy content generation prompt (keep for backward compatibility)
 */
function AI_buildPrompt(ctx){
  var p=ctx||{}, i=p.inputs||{}, pr=p.project||{};
  var formats=String(p.format||'Content'), subtype=String(p.subtype||'General'), platform=String(p.platform||'platform');
  var tone=i.style_tone||'Expert, direct, modern, human — no fluff.';
  var archetype=i.brand_archetype||'Sage with a hint of Hero'; var depth=i.outline_depth||3;
  var sys=['STYLE: Hybrid CMO + Creator. Strategic and punchy.','BRAND ARCHETYPE: '+archetype,'VOICE: '+tone,'AUDIENCE: '+(i.primary_persona||'Founders/CMOs'),'EEAT: Cite credible sources.'];
  var facts=['PROJECT: '+(pr.name||i.brand_name||'Brand'),'DOMAIN: '+(pr.domain||i.website_url||''),'USP: '+(i.usp||''),'PRIMARY KW: '+(i.primary_keywords||''),'SECONDARY KW: '+(i.secondary_keywords||''),'INTENT: '+(i.search_intent||'MECE informational/commercial'),'REGIONS: '+(i.target_countries||i.geo_focus||'Global'),'CONSTRAINTS: forbidden='+(i.forbidden_phrases||'')+' | required='+(i.required_terms||'')];
  var tasks=['1) Create a '+formats+' ('+subtype+') for '+platform+'.','2) Align to intent/persona; avoid fluff.','3) Outline depth: '+depth+'; include FAQ if helpful.','4) Provide meta title/description + one strong CTA.','5) Return JSON: {title, outline[], body, meta:{title,description}, faq[]}'];
  var rubric=['RUBRIC:','- Relevance (25)','- Semantic coverage (25)','- EEAT + citations (20)','- Clarity/readability (15)','- On-page SEO (10)','- CTA (5)'];
  return ['=== SYSTEM ===',sys.join('\n'),'\n=== FACTS ===',facts.join('\n'),'\n=== TASK ===',tasks.join('\n'),'\n=== RUBRIC ===',rubric.join('\n')].join('\n');
}
