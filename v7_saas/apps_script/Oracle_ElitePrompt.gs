/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * SERPIFAI ORACLE v16.0 - ORACLE_ELITEPROMPT.GS
 * Elite Gemini API Intelligence Prompt Engine
 * ═══════════════════════════════════════════════════════════════════════════════════
 * 
 * ARCHITECTURE:
 * - Semantic Gap Analysis: Identify content topics competitors cover that you don't
 * - EEAT Weakness Identification: Pinpoint specific trust/authority gaps
 * - Internal Link Blindspot Detection: Find orphaned content & hub opportunities
 * - Keyword Cannibalization Detection: Identify pages competing for same terms
 * - Content Freshness Analysis: Detect stale content needing updates
 * 
 * @author SerpifAI Engineering
 * @version 16.0
 * @license Proprietary - serpifai.com
 * ═══════════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// ELITE PROMPT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════

var ORACLE_PROMPT_CONFIG = {
  // Gemini Settings
  MODEL: 'gemini-3-flash-preview',
  MAX_TOKENS: 16384,
  TEMPERATURE: 0.7,
  
  // API Key (from Script Properties)
  API_KEY_PROPERTY: 'GEMINI_API_KEY',
  
  // Analysis Settings
  MAX_COMPETITOR_PAGES: 50,     // Max pages to include per competitor
  MAX_KEYWORDS_IN_PROMPT: 200,  // Max keywords to analyze
  MAX_HEADINGS_IN_PROMPT: 100   // Max headings to analyze
};

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 1: ELITE PROMPT BUILDER CLASS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * OracleElitePromptBuilder - Constructs sophisticated analysis prompts
 */
class OracleElitePromptBuilder {
  
  constructor() {
    this.props = PropertiesService.getScriptProperties();
    this.apiKey = this.props.getProperty(ORACLE_PROMPT_CONFIG.API_KEY_PROPERTY);
  }
  
  /**
   * Build comprehensive competitor intelligence prompt
   * @param {Object} targetSite - Your site's data
   * @param {Array} competitors - Competitor intelligence data
   * @param {string} analysisType - Type of analysis to perform
   */
  buildPrompt(targetSite, competitors, analysisType = 'comprehensive') {
    const promptBuilders = {
      'comprehensive': this._buildComprehensivePrompt.bind(this),
      'semantic_gaps': this._buildSemanticGapPrompt.bind(this),
      'eeat_weakness': this._buildEEATWeaknessPrompt.bind(this),
      'internal_links': this._buildInternalLinkPrompt.bind(this),
      'content_calendar': this._buildContentCalendarPrompt.bind(this),
      'keyword_cannibalization': this._buildCannibalizationPrompt.bind(this)
    };
    
    const builder = promptBuilders[analysisType] || promptBuilders['comprehensive'];
    return builder(targetSite, competitors);
  }
  
  /**
   * Comprehensive competitor analysis prompt
   */
  _buildComprehensivePrompt(targetSite, competitors) {
    const systemPrompt = `You are an elite SEO strategist and competitive intelligence analyst. You have deep expertise in E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness), semantic SEO, content gap analysis, and technical SEO.

Your role is to analyze competitor intelligence data and provide actionable, data-driven recommendations to help the target site outperform competitors.

CRITICAL GUIDELINES:
- Be specific and actionable - no vague recommendations
- Prioritize by impact and effort (quick wins first)
- Reference specific competitor examples when possible
- Include estimated traffic/ranking potential where relevant
- Consider search intent for all recommendations`;

    const userPrompt = `# COMPETITOR INTELLIGENCE ANALYSIS REQUEST

## TARGET SITE PROFILE
${this._formatSiteProfile(targetSite)}

## COMPETITOR INTELLIGENCE DATA
${this._formatCompetitorData(competitors)}

## ANALYSIS REQUIREMENTS

Please provide a comprehensive competitive intelligence analysis with the following sections:

### 1. EXECUTIVE SUMMARY
- Key competitive position assessment
- Top 3 immediate opportunities
- Top 3 critical threats
- Overall competitive score (1-100)

### 2. SEMANTIC GAP ANALYSIS
Identify topics, subtopics, and semantic themes that competitors cover extensively but the target site is missing or underdeveloped:
- Topic clusters competitors dominate
- Specific content pieces to create
- Long-tail keyword opportunities
- FAQ/PAA opportunities

### 3. E-E-A-T COMPETITIVE GAPS
Compare E-E-A-T signals between target and competitors:
- Experience: Who demonstrates more first-hand experience?
- Expertise: Who has stronger author credentials and content depth?
- Authoritativeness: Who has better backlink profiles and citations?
- Trustworthiness: Who has stronger trust signals?
- Specific recommendations to close each gap

### 4. INTERNAL LINKING OPPORTUNITIES
Based on heading hierarchies and page structures:
- Content hub opportunities
- Orphaned content to connect
- Pillar page suggestions
- Topical cluster recommendations

### 5. CONTENT STRATEGY RECOMMENDATIONS
- Priority content pieces to create (with target keywords)
- Existing content to update/expand
- Content consolidation opportunities
- Content format recommendations (guides, comparisons, tools, etc.)

### 6. TECHNICAL SEO INSIGHTS
Based on the data:
- Schema markup opportunities
- Meta title/description patterns that work
- Heading structure best practices from top performers
- Word count benchmarks by content type

### 7. 90-DAY ACTION PLAN
Provide a prioritized roadmap:
- Week 1-2: Quick wins
- Week 3-4: Content creation priorities
- Month 2: Authority building
- Month 3: Optimization and expansion

Format your response with clear headers, bullet points, and specific examples. Include estimated impact (High/Medium/Low) for each recommendation.`;

    return {
      system: systemPrompt,
      user: userPrompt,
      type: 'comprehensive'
    };
  }
  
  /**
   * Semantic gap analysis prompt
   */
  _buildSemanticGapPrompt(targetSite, competitors) {
    const systemPrompt = `You are a semantic SEO expert specializing in content gap analysis and topical authority building. Your expertise lies in identifying the full semantic landscape of topics and finding opportunities where competitors have coverage that the target site lacks.`;

    const competitorKeywords = this._aggregateCompetitorKeywords(competitors);
    const competitorHeadings = this._aggregateCompetitorHeadings(competitors);
    
    const userPrompt = `# SEMANTIC GAP ANALYSIS REQUEST

## TARGET SITE
Domain: ${targetSite.domain}
Current Topics: ${(targetSite.topics || []).join(', ')}
Current Keywords: ${(targetSite.keywords || []).slice(0, 50).join(', ')}

## COMPETITOR KEYWORD LANDSCAPE
${this._formatKeywordData(competitorKeywords)}

## COMPETITOR HEADING/TOPIC COVERAGE
${this._formatHeadingData(competitorHeadings)}

## ANALYSIS REQUIREMENTS

Provide a detailed semantic gap analysis:

### 1. MISSING TOPIC CLUSTERS
Identify major topic clusters that competitors cover but target site doesn't:
- Cluster name
- Core topics within cluster
- Estimated search volume range
- Competitive difficulty
- Priority (High/Medium/Low)

### 2. KEYWORD GAPS BY INTENT
Group missing keywords by search intent:

**Informational Intent:**
- [List keywords competitors rank for, target doesn't]

**Commercial Investigation:**
- [List keywords]

**Transactional:**
- [List keywords]

**Navigational:**
- [List keywords]

### 3. LONG-TAIL OPPORTUNITIES
Identify specific long-tail queries from competitor headings and content:
- Exact query/question
- Competitor(s) ranking
- Recommended content format
- Target heading structure

### 4. PAA/FAQ COVERAGE GAPS
Questions competitors answer that target doesn't:
- Question text
- Where it appears (PAA, FAQ section, heading)
- Recommended placement

### 5. ENTITY & SEMANTIC RELATIONSHIPS
Topics and entities that need to be covered to build topical authority:
- Core entities to mention
- Related topics to cover
- Supporting topics for context
- Expert sources to cite

### 6. CONTENT CREATION PRIORITIES
Ranked list of content pieces to create:

| Priority | Content Title | Target Keywords | Format | Est. Traffic | Effort |
|----------|--------------|-----------------|--------|--------------|--------|
| 1 | ... | ... | ... | ... | ... |

Provide specific, actionable recommendations with clear next steps.`;

    return {
      system: systemPrompt,
      user: userPrompt,
      type: 'semantic_gaps'
    };
  }
  
  /**
   * EEAT weakness analysis prompt
   */
  _buildEEATWeaknessPrompt(targetSite, competitors) {
    const systemPrompt = `You are an E-E-A-T optimization specialist. You understand exactly what Google looks for in Experience, Expertise, Authoritativeness, and Trustworthiness signals. Your analysis helps sites build credibility and trust signals that improve rankings.`;

    const competitorEEAT = this._aggregateCompetitorEEAT(competitors);
    
    const userPrompt = `# E-E-A-T WEAKNESS ANALYSIS REQUEST

## TARGET SITE E-E-A-T PROFILE
Domain: ${targetSite.domain}
${this._formatEEATProfile(targetSite.eeat)}

## COMPETITOR E-E-A-T PROFILES
${this._formatCompetitorEEAT(competitorEEAT)}

## ANALYSIS REQUIREMENTS

Provide a detailed E-E-A-T weakness analysis:

### 1. EXPERIENCE GAPS
First-hand experience signals competitors have that target lacks:
- Case studies present on competitor sites
- Product reviews with hands-on testing
- "We tested" / "I tried" content
- Original photos/videos
- **Specific recommendations to close gap**

### 2. EXPERTISE GAPS
Expertise signals competitors demonstrate:
- Author credentials displayed
- Content depth and comprehensiveness
- Technical accuracy indicators
- Industry-specific terminology usage
- **Specific recommendations to close gap**

### 3. AUTHORITATIVENESS GAPS
Authority signals competitors have:
- High-quality backlink sources
- Media mentions and citations
- Industry awards/recognition
- Expert endorsements
- **Specific recommendations to close gap**

### 4. TRUSTWORTHINESS GAPS
Trust signals competitors display:
- SSL and security indicators
- Contact information visibility
- Privacy/Terms pages
- Reviews and testimonials
- Trust badges and certifications
- Editorial/disclosure policies
- **Specific recommendations to close gap**

### 5. AUTHOR PAGE STRATEGY
Based on competitor author presence:
- Author bio best practices to implement
- Credentials to highlight
- Author schema markup recommendations
- Author linking strategy

### 6. CITATION & SOURCE STRATEGY
How competitors build credibility:
- Types of sources they cite
- Citation format patterns
- .gov/.edu links frequency
- Expert quote usage

### 7. PRIORITY ACTION ITEMS
Ranked list of E-E-A-T improvements:

| Priority | Action Item | E-E-A-T Pillar | Effort | Impact |
|----------|-------------|----------------|--------|--------|
| 1 | ... | ... | ... | ... |

Focus on actionable, specific recommendations that can be implemented immediately.`;

    return {
      system: systemPrompt,
      user: userPrompt,
      type: 'eeat_weakness'
    };
  }
  
  /**
   * Internal link blindspot prompt
   */
  _buildInternalLinkPrompt(targetSite, competitors) {
    const systemPrompt = `You are an internal linking and site architecture expert. You understand how strategic internal linking builds topical authority, distributes PageRank, and improves user navigation. You can identify orphaned content, hub opportunities, and optimal linking patterns.`;

    const competitorLinks = this._aggregateCompetitorLinks(competitors);
    
    const userPrompt = `# INTERNAL LINK BLINDSPOT ANALYSIS

## TARGET SITE STRUCTURE
Domain: ${targetSite.domain}
Pages Analyzed: ${targetSite.pageCount || 0}
Current Internal Links: ${this._formatInternalLinks(targetSite.internalLinks)}

## COMPETITOR INTERNAL LINK PATTERNS
${this._formatCompetitorLinks(competitorLinks)}

## ANALYSIS REQUIREMENTS

Provide internal linking recommendations:

### 1. CONTENT HUB OPPORTUNITIES
Based on competitor structures, recommend content hubs:
- Hub topic
- Pillar page concept
- Supporting content pieces
- Recommended URL structure
- Estimated pages in cluster

### 2. ORPHANED CONTENT RISKS
Pages that may lack sufficient internal links:
- Indicators of orphaned content patterns
- Competitor solutions to similar issues
- Linking strategies to implement

### 3. TOPICAL SILO RECOMMENDATIONS
Organize content into topical silos:
- Silo theme
- Pages to include
- Internal linking pattern
- Breadcrumb structure

### 4. ANCHOR TEXT STRATEGY
Based on competitor patterns:
- Anchor text distribution guidelines
- Keyword-rich anchor opportunities
- Natural variation patterns

### 5. LINK PLACEMENT PATTERNS
Where competitors place internal links:
- Contextual links in body content
- Navigation/menu links
- Footer links
- Related post sections
- Author bio links

### 6. LINK VELOCITY RECOMMENDATIONS
For new content:
- Minimum internal links to include
- Optimal link targets
- Contextual placement guidelines

### 7. IMPLEMENTATION PRIORITY
| Priority | Page/Section | Links to Add | Target Pages | Anchor Text |
|----------|-------------|--------------|--------------|-------------|
| 1 | ... | ... | ... | ... |`;

    return {
      system: systemPrompt,
      user: userPrompt,
      type: 'internal_links'
    };
  }
  
  /**
   * Content calendar prompt
   */
  _buildContentCalendarPrompt(targetSite, competitors) {
    const systemPrompt = `You are a content strategist specializing in competitive content planning. You create data-driven content calendars that prioritize opportunities based on competitive gaps, search demand, and business impact.`;

    const competitorContent = this._aggregateCompetitorContent(competitors);
    
    const userPrompt = `# CONTENT CALENDAR GENERATION REQUEST

## TARGET SITE CONTEXT
Domain: ${targetSite.domain}
Industry: ${targetSite.industry || 'Not specified'}
Current Content Count: ${targetSite.pageCount || 0}

## COMPETITOR CONTENT LANDSCAPE
${this._formatContentLandscape(competitorContent)}

## ANALYSIS REQUIREMENTS

Generate a 90-day content calendar:

### MONTH 1: QUICK WINS & FOUNDATION

**Week 1-2: Content Refresh**
| Day | Content Type | Topic/Title | Target Keywords | Format | Est. Words |
|-----|-------------|-------------|-----------------|--------|------------|

**Week 3-4: Gap Filling**
| Day | Content Type | Topic/Title | Target Keywords | Format | Est. Words |
|-----|-------------|-------------|-----------------|--------|------------|

### MONTH 2: AUTHORITY BUILDING

**Week 5-6: Pillar Content**
| Day | Content Type | Topic/Title | Target Keywords | Format | Est. Words |
|-----|-------------|-------------|-----------------|--------|------------|

**Week 7-8: Supporting Content**
| Day | Content Type | Topic/Title | Target Keywords | Format | Est. Words |
|-----|-------------|-------------|-----------------|--------|------------|

### MONTH 3: EXPANSION & OPTIMIZATION

**Week 9-10: New Topics**
| Day | Content Type | Topic/Title | Target Keywords | Format | Est. Words |
|-----|-------------|-------------|-----------------|--------|------------|

**Week 11-12: Consolidation**
| Day | Content Type | Topic/Title | Target Keywords | Format | Est. Words |
|-----|-------------|-------------|-----------------|--------|------------|

### CONTENT MIX RECOMMENDATIONS
- Blog posts: X%
- Guides/tutorials: X%
- Comparison pages: X%
- Tool/calculator pages: X%
- Case studies: X%

### SEASONAL CONSIDERATIONS
- Upcoming events/holidays to target
- Industry-specific timing opportunities
- Trending topics to capitalize on`;

    return {
      system: systemPrompt,
      user: userPrompt,
      type: 'content_calendar'
    };
  }
  
  /**
   * Keyword cannibalization prompt
   */
  _buildCannibalizationPrompt(targetSite, competitors) {
    const systemPrompt = `You are an SEO specialist focused on keyword cannibalization detection and resolution. You can identify when multiple pages compete for the same keywords and provide consolidation strategies.`;

    const userPrompt = `# KEYWORD CANNIBALIZATION ANALYSIS

## TARGET SITE DATA
Domain: ${targetSite.domain}
${this._formatPageKeywordOverlap(targetSite)}

## ANALYSIS REQUIREMENTS

Identify and resolve keyword cannibalization:

### 1. CANNIBALIZATION DETECTION
Pages potentially competing for same keywords:
| Keyword/Topic | Competing Pages | Current Best Performer | Action Needed |
|---------------|-----------------|----------------------|---------------|

### 2. CONSOLIDATION RECOMMENDATIONS
For each cannibalization issue:
- Pages to merge
- Page to keep as canonical
- Content elements to preserve from each
- Redirect strategy

### 3. DIFFERENTIATION OPPORTUNITIES
When pages can be differentiated instead of merged:
- Page 1: New focus/angle
- Page 2: New focus/angle
- Internal linking between them

### 4. PREVENTION STRATEGY
Guidelines to prevent future cannibalization:
- Keyword mapping framework
- Content brief requirements
- Pre-publication checklist`;

    return {
      system: systemPrompt,
      user: userPrompt,
      type: 'keyword_cannibalization'
    };
  }
  
  // ═══════════════════════════════════════════════════════════════════════════════
  // FORMATTING HELPERS
  // ═══════════════════════════════════════════════════════════════════════════════
  
  _formatSiteProfile(site) {
    return `Domain: ${site.domain || 'Not specified'}
Pages Analyzed: ${site.pageCount || 0}
Average EEAT Score: ${site.avgEEAT || 'N/A'}
Top Keywords: ${(site.keywords || []).slice(0, 20).join(', ')}
Content Types: ${(site.contentTypes || []).join(', ')}`;
  }
  
  _formatCompetitorData(competitors) {
    let output = '';
    
    for (const comp of competitors.slice(0, 5)) {
      output += `\n### ${comp.domain}\n`;
      output += `Pages Analyzed: ${comp.pages?.length || 0}\n`;
      output += `Average EEAT: ${comp.avgEEAT || 'N/A'}\n`;
      
      // Top keywords
      output += `Top Keywords: ${(comp.topKeywords || []).slice(0, 15).map(k => k.keyword).join(', ')}\n`;
      
      // Heading topics
      output += `Main Topics (from H1/H2): ${(comp.topHeadings || []).slice(0, 10).map(h => h.text).join(' | ')}\n`;
      
      // Content types
      output += `Content Types: ${(comp.pageTypes || []).join(', ')}\n`;
    }
    
    return output;
  }
  
  _formatKeywordData(keywords) {
    if (!keywords || keywords.length === 0) return 'No keyword data available';
    
    // Group by type
    const byType = {
      primary: keywords.filter(k => k.type === 'primary').slice(0, 50),
      secondary: keywords.filter(k => k.type === 'secondary').slice(0, 50),
      longTail: keywords.filter(k => k.type === 'long_tail').slice(0, 50),
      semantic: keywords.filter(k => k.type === 'semantic').slice(0, 50)
    };
    
    let output = '';
    for (const [type, kws] of Object.entries(byType)) {
      if (kws.length > 0) {
        output += `\n**${type.toUpperCase()} KEYWORDS:**\n`;
        output += kws.map(k => `- ${k.keyword} (${k.competitorCount} competitors)`).join('\n');
      }
    }
    
    return output;
  }
  
  _formatHeadingData(headings) {
    if (!headings || headings.length === 0) return 'No heading data available';
    
    // Group by level
    const h1s = headings.filter(h => h.level === 1).slice(0, 20);
    const h2s = headings.filter(h => h.level === 2).slice(0, 40);
    const h3s = headings.filter(h => h.level === 3).slice(0, 40);
    
    let output = '\n**H1 HEADINGS (Page Titles):**\n';
    output += h1s.map(h => `- ${h.text} (${h.domain})`).join('\n');
    
    output += '\n\n**H2 HEADINGS (Main Sections):**\n';
    output += h2s.map(h => `- ${h.text}`).join('\n');
    
    output += '\n\n**H3 HEADINGS (Subsections):**\n';
    output += h3s.map(h => `- ${h.text}`).join('\n');
    
    return output;
  }
  
  _formatEEATProfile(eeat) {
    if (!eeat) return 'No EEAT data available';
    
    return `Overall Score: ${eeat.overall?.score || 0}/100 (${eeat.overall?.grade || 'Unknown'})
Experience: ${eeat.experience?.score || 0}/100
Expertise: ${eeat.expertise?.score || 0}/100  
Authoritativeness: ${eeat.authoritativeness?.score || 0}/100
Trustworthiness: ${eeat.trustworthiness?.score || 0}/100

Key Signals Detected:
${(eeat.experience?.signals || []).map(s => `- Experience: ${s.type}`).join('\n')}
${(eeat.expertise?.signals || []).map(s => `- Expertise: ${s.type}`).join('\n')}
${(eeat.authoritativeness?.signals || []).map(s => `- Authority: ${s.type}`).join('\n')}
${(eeat.trustworthiness?.signals || []).map(s => `- Trust: ${s.type}`).join('\n')}`;
  }
  
  _formatCompetitorEEAT(eeatData) {
    let output = '';
    
    for (const [domain, eeat] of Object.entries(eeatData)) {
      output += `\n### ${domain}\n`;
      output += `Overall: ${eeat.overall}/100\n`;
      output += `E: ${eeat.experience} | E: ${eeat.expertise} | A: ${eeat.authority} | T: ${eeat.trust}\n`;
      output += `Top Signals: ${(eeat.topSignals || []).join(', ')}\n`;
    }
    
    return output;
  }
  
  _formatInternalLinks(links) {
    if (!links || links.length === 0) return 'No internal link data';
    return links.slice(0, 20).map(l => `${l.url} (${l.count} links)`).join('\n');
  }
  
  _formatCompetitorLinks(links) {
    let output = '';
    
    for (const [domain, data] of Object.entries(links)) {
      output += `\n### ${domain}\n`;
      output += `Total Internal Links: ${data.totalLinks}\n`;
      output += `Avg Links Per Page: ${data.avgLinksPerPage}\n`;
      output += `Top Linked Pages: ${(data.topPages || []).slice(0, 5).join(', ')}\n`;
    }
    
    return output;
  }
  
  _formatContentLandscape(content) {
    let output = '';
    
    for (const [domain, data] of Object.entries(content)) {
      output += `\n### ${domain}\n`;
      output += `Total Pages: ${data.pageCount}\n`;
      output += `Content Types: ${Object.entries(data.types || {}).map(([t, c]) => `${t}: ${c}`).join(', ')}\n`;
      output += `Avg Word Count: ${data.avgWordCount}\n`;
      output += `Top Topics: ${(data.topics || []).slice(0, 10).join(', ')}\n`;
    }
    
    return output;
  }
  
  _formatPageKeywordOverlap(site) {
    if (!site.pages) return 'No page data available';
    
    let output = '\n**PAGE KEYWORD MAPPING:**\n';
    for (const page of (site.pages || []).slice(0, 30)) {
      output += `\n${page.url}\n`;
      output += `  Keywords: ${(page.keywords || []).slice(0, 10).join(', ')}\n`;
    }
    
    return output;
  }
  
  // ═══════════════════════════════════════════════════════════════════════════════
  // DATA AGGREGATION HELPERS
  // ═══════════════════════════════════════════════════════════════════════════════
  
  _aggregateCompetitorKeywords(competitors) {
    const keywordMap = new Map();
    
    for (const comp of competitors) {
      for (const page of (comp.pages || [])) {
        const keywords = page.keywordsJson || {};
        
        for (const type of ['primary', 'secondary', 'semantic', 'longTail']) {
          for (const kw of (keywords[type] || [])) {
            const key = kw.keyword?.toLowerCase();
            if (!key) continue;
            
            if (!keywordMap.has(key)) {
              keywordMap.set(key, {
                keyword: kw.keyword,
                type: type === 'longTail' ? 'long_tail' : type,
                competitorCount: 0,
                competitors: []
              });
            }
            
            const data = keywordMap.get(key);
            if (!data.competitors.includes(comp.domain)) {
              data.competitors.push(comp.domain);
              data.competitorCount++;
            }
          }
        }
      }
    }
    
    return Array.from(keywordMap.values())
      .sort((a, b) => b.competitorCount - a.competitorCount)
      .slice(0, ORACLE_PROMPT_CONFIG.MAX_KEYWORDS_IN_PROMPT);
  }
  
  _aggregateCompetitorHeadings(competitors) {
    const headings = [];
    
    for (const comp of competitors) {
      for (const page of (comp.pages || [])) {
        const pageHeadings = page.headingsJson?.hierarchy || [];
        
        for (const h of pageHeadings.slice(0, 10)) {
          headings.push({
            text: h.text,
            level: h.level,
            domain: comp.domain,
            url: page.url
          });
        }
      }
    }
    
    return headings.slice(0, ORACLE_PROMPT_CONFIG.MAX_HEADINGS_IN_PROMPT);
  }
  
  _aggregateCompetitorEEAT(competitors) {
    const eeatData = {};
    
    for (const comp of competitors) {
      let totalExp = 0, totalExpert = 0, totalAuth = 0, totalTrust = 0;
      let count = 0;
      const signals = [];
      
      for (const page of (comp.pages || [])) {
        const eeat = page.eeatJson || {};
        totalExp += eeat.experience?.score || 0;
        totalExpert += eeat.expertise?.score || 0;
        totalAuth += eeat.authoritativeness?.score || 0;
        totalTrust += eeat.trustworthiness?.score || 0;
        count++;
        
        // Collect signals
        for (const s of (eeat.experience?.signals || [])) signals.push(s.type);
        for (const s of (eeat.expertise?.signals || [])) signals.push(s.type);
        for (const s of (eeat.authoritativeness?.signals || [])) signals.push(s.type);
        for (const s of (eeat.trustworthiness?.signals || [])) signals.push(s.type);
      }
      
      if (count > 0) {
        eeatData[comp.domain] = {
          overall: Math.round((totalExp + totalExpert + totalAuth + totalTrust) / (4 * count)),
          experience: Math.round(totalExp / count),
          expertise: Math.round(totalExpert / count),
          authority: Math.round(totalAuth / count),
          trust: Math.round(totalTrust / count),
          topSignals: [...new Set(signals)].slice(0, 10)
        };
      }
    }
    
    return eeatData;
  }
  
  _aggregateCompetitorLinks(competitors) {
    const linkData = {};
    
    for (const comp of competitors) {
      let totalLinks = 0;
      const pageLinks = {};
      
      for (const page of (comp.pages || [])) {
        const links = page.linksJson?.internal?.links || [];
        totalLinks += links.length;
        
        for (const link of links) {
          pageLinks[link.url] = (pageLinks[link.url] || 0) + link.count;
        }
      }
      
      const pageCount = (comp.pages || []).length || 1;
      
      linkData[comp.domain] = {
        totalLinks: totalLinks,
        avgLinksPerPage: Math.round(totalLinks / pageCount),
        topPages: Object.entries(pageLinks)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([url]) => url)
      };
    }
    
    return linkData;
  }
  
  _aggregateCompetitorContent(competitors) {
    const contentData = {};
    
    for (const comp of competitors) {
      const types = {};
      let totalWordCount = 0;
      const topics = [];
      
      for (const page of (comp.pages || [])) {
        // Count page types
        const pageType = page.pageType || 'other';
        types[pageType] = (types[pageType] || 0) + 1;
        
        // Sum word counts
        totalWordCount += page.wordCount || 0;
        
        // Extract topics from H1/H2
        const headings = page.headingsJson?.hierarchy || [];
        for (const h of headings.filter(h => h.level <= 2)) {
          if (h.text) topics.push(h.text);
        }
      }
      
      const pageCount = (comp.pages || []).length || 1;
      
      contentData[comp.domain] = {
        pageCount: pageCount,
        types: types,
        avgWordCount: Math.round(totalWordCount / pageCount),
        topics: [...new Set(topics)].slice(0, 20)
      };
    }
    
    return contentData;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 2: GEMINI API CALLER CLASS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * OracleGeminiCaller - Handles Gemini API interactions
 */
class OracleGeminiCaller {
  
  constructor() {
    this.props = PropertiesService.getScriptProperties();
    this.apiKey = this.props.getProperty(ORACLE_PROMPT_CONFIG.API_KEY_PROPERTY);
    this.model = ORACLE_PROMPT_CONFIG.MODEL;
  }
  
  /**
   * Call Gemini API with prompt
   * @param {Object} prompt - Prompt object with system and user
   */
  callGemini(prompt) {
    if (!this.apiKey) {
      console.error('❌ Gemini API key not configured');
      return { error: 'API key missing', success: false };
    }
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    
    const payload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt.system + '\n\n' + prompt.user }]
        }
      ],
      generationConfig: {
        temperature: ORACLE_PROMPT_CONFIG.TEMPERATURE,
        maxOutputTokens: ORACLE_PROMPT_CONFIG.MAX_TOKENS
      }
    };
    
    try {
      console.log(`🤖 Calling Gemini API (${this.model})...`);
      
      const response = UrlFetchApp.fetch(url, {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      });
      
      const responseCode = response.getResponseCode();
      const responseText = response.getContentText();
      
      if (responseCode !== 200) {
        console.error(`❌ Gemini API error: ${responseCode}`);
        return { error: `API error: ${responseCode}`, success: false, details: responseText };
      }
      
      const data = JSON.parse(responseText);
      
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        console.log('✅ Gemini response received');
        return {
          success: true,
          text: data.candidates[0].content.parts[0].text,
          usage: data.usageMetadata,
          type: prompt.type
        };
      }
      
      return { error: 'No response content', success: false };
      
    } catch (e) {
      console.error('❌ Gemini API call failed: ' + e.message);
      return { error: e.message, success: false };
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// SECTION 3: GLOBAL FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Run comprehensive competitor intelligence analysis
 * @param {string} projectId - Project ID
 * @param {string} targetDomain - Your domain (optional, uses first in list if not specified)
 */
function ORACLE_RunIntelligenceAnalysis(projectId, targetDomain = null) {
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('🎯 ORACLE ELITE INTELLIGENCE ANALYSIS');
  Logger.log('═══════════════════════════════════════════════════════════');
  
  // Get intelligence data
  const persistence = new OraclePersistence();
  const allData = persistence.getIntelligence(projectId || 'default');
  persistence.disconnect();
  
  if (allData.length === 0) {
    Logger.log('⚠️ No intelligence data found. Run ORACLE_StartBatch first.');
    return { error: 'No data' };
  }
  
  // Group by domain
  const domainData = new Map();
  for (const item of allData) {
    if (!domainData.has(item.domain)) {
      domainData.set(item.domain, {
        domain: item.domain,
        pages: []
      });
    }
    domainData.get(item.domain).pages.push(item);
  }
  
  // Identify target and competitors
  const domains = Array.from(domainData.keys());
  const target = targetDomain || domains[0];
  
  const targetSite = {
    domain: target,
    pages: domainData.get(target)?.pages || [],
    pageCount: domainData.get(target)?.pages.length || 0,
    keywords: [],
    eeat: { overall: { score: 0 } }
  };
  
  // Aggregate target data
  for (const page of targetSite.pages) {
    const keywords = page.keywordsJson || {};
    for (const kw of (keywords.primary || [])) {
      targetSite.keywords.push(kw.keyword);
    }
    if (page.eeatJson?.overall?.score) {
      targetSite.eeat.overall.score += page.eeatJson.overall.score;
    }
  }
  if (targetSite.pages.length > 0) {
    targetSite.avgEEAT = Math.round(targetSite.eeat.overall.score / targetSite.pages.length);
  }
  
  // Format competitor data
  const competitors = [];
  for (const [domain, data] of domainData) {
    if (domain !== target) {
      let totalEEAT = 0;
      const topKeywords = [];
      const topHeadings = [];
      
      for (const page of data.pages) {
        totalEEAT += page.eeatJson?.overall?.score || 0;
        for (const kw of (page.keywordsJson?.primary || []).slice(0, 5)) {
          topKeywords.push(kw);
        }
        for (const h of (page.headingsJson?.hierarchy || []).slice(0, 3)) {
          topHeadings.push(h);
        }
      }
      
      competitors.push({
        domain: domain,
        pages: data.pages,
        avgEEAT: data.pages.length > 0 ? Math.round(totalEEAT / data.pages.length) : 0,
        topKeywords: topKeywords.slice(0, 20),
        topHeadings: topHeadings.slice(0, 15),
        pageTypes: [...new Set(data.pages.map(p => p.pageType))]
      });
    }
  }
  
  Logger.log(`Target: ${target} (${targetSite.pages.length} pages)`);
  Logger.log(`Competitors: ${competitors.map(c => c.domain).join(', ')}`);
  
  // Build and execute prompt
  const promptBuilder = new OracleElitePromptBuilder();
  const prompt = promptBuilder.buildPrompt(targetSite, competitors, 'comprehensive');
  
  const gemini = new OracleGeminiCaller();
  const result = gemini.callGemini(prompt);
  
  if (result.success) {
    Logger.log('───────────────────────────────────────────────────────────');
    Logger.log(result.text);
    Logger.log('═══════════════════════════════════════════════════════════');
    
    // Save result to properties for later retrieval
    PropertiesService.getScriptProperties().setProperty(
      'ORACLE_LAST_ANALYSIS',
      JSON.stringify({
        timestamp: new Date().toISOString(),
        projectId: projectId,
        target: target,
        competitors: competitors.map(c => c.domain),
        analysis: result.text
      })
    );
  }
  
  return result;
}

/**
 * Run specific analysis type
 * @param {string} projectId - Project ID
 * @param {string} analysisType - Type: semantic_gaps, eeat_weakness, internal_links, content_calendar
 */
function ORACLE_RunSpecificAnalysis(projectId, analysisType) {
  // Similar to above but with specific analysis type
  const persistence = new OraclePersistence();
  const allData = persistence.getIntelligence(projectId || 'default');
  persistence.disconnect();
  
  if (allData.length === 0) {
    return { error: 'No data' };
  }
  
  // Group by domain
  const domainData = new Map();
  for (const item of allData) {
    if (!domainData.has(item.domain)) {
      domainData.set(item.domain, { domain: item.domain, pages: [] });
    }
    domainData.get(item.domain).pages.push(item);
  }
  
  const domains = Array.from(domainData.keys());
  const targetSite = { domain: domains[0], pages: domainData.get(domains[0])?.pages || [] };
  
  const competitors = [];
  for (const [domain, data] of domainData) {
    if (domain !== domains[0]) {
      competitors.push({ domain: domain, pages: data.pages });
    }
  }
  
  const promptBuilder = new OracleElitePromptBuilder();
  const prompt = promptBuilder.buildPrompt(targetSite, competitors, analysisType);
  
  const gemini = new OracleGeminiCaller();
  return gemini.callGemini(prompt);
}

/**
 * Test Gemini API connection
 */
function ORACLE_TestGemini() {
  const gemini = new OracleGeminiCaller();
  
  const testPrompt = {
    system: 'You are a helpful assistant.',
    user: 'Say "Oracle Gemini connection successful!" and nothing else.',
    type: 'test'
  };
  
  const result = gemini.callGemini(testPrompt);
  
  Logger.log('═══════════════════════════════════════════════════════════');
  Logger.log('🧪 GEMINI API TEST');
  Logger.log('═══════════════════════════════════════════════════════════');
  
  if (result.success) {
    Logger.log('✅ ' + result.text);
  } else {
    Logger.log('❌ Error: ' + result.error);
  }
  
  return result;
}

/**
 * Get last analysis result
 */
function ORACLE_GetLastAnalysis() {
  const stored = PropertiesService.getScriptProperties().getProperty('ORACLE_LAST_ANALYSIS');
  return stored ? JSON.parse(stored) : null;
}
