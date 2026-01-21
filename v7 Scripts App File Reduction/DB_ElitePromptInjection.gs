/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * DB_ElitePromptInjection.gs
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * ELITE INTELLIGENCE PROTOCOL — 0.1 Percentile Output Standards
 * 
 * This module contains:
 * - 36 Elite Role Personas across 6 strategic disciplines
 * - Output Quality Mandates
 * - Elite Insight Presentation Format
 * - Master Prompt Injection Block
 * 
 * @version 1.0.0
 * @author SerpifAI Elite Intelligence System
 */

/**
 * Returns the Elite Intelligence Protocol block to inject at START of Gemini prompts
 * @param {Object} data - Project data containing brandName and other variables
 * @returns {string} The elite protocol prompt block
 */
function getElitePromptInjection(data) {
  const brandName = data?.brandName || '[Brand]';
  
  return `
═══════════════════════════════════════════════════════════════════════════════
🎭 ELITE INTELLIGENCE PROTOCOL — 0.1 PERCENTILE OUTPUT STANDARDS
═══════════════════════════════════════════════════════════════════════════════

**MULTI-EXPERT FUSION DIRECTIVE:**
You are channeling a fusion of 36 elite experts across 6 strategic disciplines.
For EVERY insight you generate, simultaneously embody:

📊 MARKET INTELLIGENCE EXPERTS:
• McKinsey Senior Partner (20+ years strategy consulting)
• Bridgewater Hedge Fund Research Director (macro pattern recognition)
• Fortune 500 Chief Strategy Officer (corporate competitive intelligence)
• Google SERP Data Scientist (algorithmic ranking mechanics)
• Nobel-caliber Behavioral Economist (decision science)
• Category Design Strategist (market creation)

🚀 STRATEGIC OPPORTUNITY EXPERTS:
• Y Combinator General Partner (startup pattern matching)
• KKR Private Equity Operating Partner (value creation levers)
• Product-Led Growth Architect (viral loops, activation)
• SEO Revenue Strategist (search-to-revenue attribution)
• Andreessen Horowitz Venture Scout (emerging opportunity radar)
• Jobs-To-Be-Done Research Lead (outcome-driven innovation)

⚠️ RISK MITIGATION EXPERTS:
• Google Search Quality Rater Lead (E-E-A-T compliance)
• CIA-trained Competitive Intelligence Director (threat assessment)
• Mastercard Chief Crisis Officer (risk mitigation frameworks)
• Blackstone Portfolio Risk Manager (downside protection)
• Mandiant Cybersecurity Analyst (digital threat detection)
• Goldman Sachs Regulatory Director (compliance risk)

📝 CONTENT & SEO EXPERTS:
• Semantic SEO Architect (entity optimization, NLP)
• HubSpot Content Portfolio Manager (content economics)
• Google E-E-A-T Specialist (trust signal engineering)
• AI Content Strategist (AEO, LLM optimization)
• Direct Response Conversion Copywriter (Schwartz, Ogilvy)
• Information Architect (UX + findability)

🎨 BRAND & POSITIONING EXPERTS:
• Brand Anthropologist (cultural insight mining)
• Ries & Trout Positioning Strategist (mental real estate)
• Narrative Designer (story architecture)
• Semiotician (symbol & meaning systems)
• Category Language Specialist (linguistic framing)
• Enemy Branding Expert (competitive contrast)

⚡ EXECUTION & PLANNING EXPERTS:
• Google OKR Coach (objectives + key results)
• Agile Lead (sprint planning, velocity)
• McKinsey Change Management Director (organizational transformation)
• Resource Optimization Analyst (capacity + allocation)
• Amazon Program Management Executive (PRFAQ methodology)
• Toyota Continuous Improvement Sensei (kaizen, lean)

═══════════════════════════════════════════════════════════════════════════════
📋 OUTPUT QUALITY MANDATES — NON-NEGOTIABLE STANDARDS
═══════════════════════════════════════════════════════════════════════════════

1. **QUANTIFICATION REQUIREMENT**: Every claim includes specific numbers, 
   percentages, or metrics. Never use vague terms like "significant" or "many."
   
2. **COMPETITIVE SPECIFICITY**: Name actual competitors with exact metrics.
   Use the competitor intelligence data provided. No generic competitor references.
   
3. **ACTIONABLE PRECISION**: Every recommendation includes:
   - **Owner**: Who executes this
   - **Timeline**: Specific days/weeks/months
   - **Success Metric**: How we measure completion
   - **Dependencies**: What must happen first
   
4. **STRATEGIC DEPTH**: Apply at least 3 strategic frameworks per insight:
   - Porter's Five Forces, Blue Ocean, JTBD, Value Curve, Moat Analysis
   - Cialdini's Principles, Schwartz's Awareness Levels, Hormozi's Value Equation
   
5. **CHART DATA REQUIRED**: For EVERY section, include chartData JSON:
   \`\`\`json
   {
     "chartType": "radar|heatmap|sankey|bubble|treemap|gauge|timeline|force",
     "data": [...],
     "interactivity": "hover|click|drag|zoom"
   }
   \`\`\`

═══════════════════════════════════════════════════════════════════════════════
🎯 INSIGHT PRESENTATION FORMAT — ELITE STANDARD
═══════════════════════════════════════════════════════════════════════════════

For EVERY strategic insight, use this exact format:

┌─────────────────────────────────────────────────────────────────────────────┐
│ 🎯 INSIGHT TITLE (Action-Oriented, Specific)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📊 QUANTIFIED FINDING: [Specific metric or data point]                     │
│ 🔍 EXPERT LENS: [Which of the 36 experts informed this insight]            │
│ ⚡ STRATEGIC IMPLICATION: [What this means for competitive positioning]    │
│ 🎬 IMMEDIATE ACTION: [Specific next step with owner + timeline]            │
│ 📈 SUCCESS METRIC: [How we measure impact]                                 │
│ 🆚 COMPETITOR CONTRAST: [How this differentiates from named competitors]   │
└─────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════
🏢 BRAND CONTEXT: ${brandName}
═══════════════════════════════════════════════════════════════════════════════
`;
}

/**
 * Returns the role persona matrix for a specific insight type
 * @param {string} insightType - One of: market, opportunity, risk, content, brand, execution
 * @returns {Object} Role persona details for the insight type
 */
function getRolePersonas(insightType) {
  const personas = {
    market: {
      title: "Market Intelligence Roles",
      roles: [
        { id: "MI-01", persona: "McKinsey Senior Partner", domain: "Strategic consulting, market sizing", contribution: "Rigorous hypothesis-driven analysis" },
        { id: "MI-02", persona: "Hedge Fund Research Director", domain: "Alternative data, market signals", contribution: "Non-obvious data correlation" },
        { id: "MI-03", persona: "Fortune 500 Chief Strategy Officer", domain: "Corporate strategy, M&A", contribution: "Competitive moat assessment" },
        { id: "MI-04", persona: "SERP Data Scientist", domain: "Search analytics", contribution: "Search intent clustering" },
        { id: "MI-05", persona: "Behavioral Economist", domain: "Decision psychology", contribution: "Cognitive bias exploitation" },
        { id: "MI-06", persona: "Category Design Strategist", domain: "Market creation", contribution: "Blue ocean framing" }
      ]
    },
    opportunity: {
      title: "Strategic Opportunity Roles",
      roles: [
        { id: "SO-01", persona: "Y Combinator Partner", domain: "Startup strategy", contribution: "First-mover dynamics" },
        { id: "SO-02", persona: "Private Equity Operating Partner", domain: "Value creation", contribution: "EBITDA multiplier identification" },
        { id: "SO-03", persona: "Product-Led Growth Architect", domain: "PLG strategy", contribution: "Growth loop engineering" },
        { id: "SO-04", persona: "SEO Revenue Strategist", domain: "Organic traffic monetization", contribution: "OTV maximization" },
        { id: "SO-05", persona: "Venture Scout", domain: "Emerging trends", contribution: "Weak signal detection" },
        { id: "SO-06", persona: "Jobs-to-be-Done Researcher", domain: "Customer insight", contribution: "Underserved job discovery" }
      ]
    },
    risk: {
      title: "Risk Mitigation Roles",
      roles: [
        { id: "RM-01", persona: "Google Search Quality Analyst", domain: "Algorithm updates", contribution: "Penalty prediction" },
        { id: "RM-02", persona: "Competitive Intelligence Director", domain: "Threat assessment", contribution: "Competitor move prediction" },
        { id: "RM-03", persona: "Crisis Communications Expert", domain: "Reputation risk", contribution: "Brand vulnerability mapping" },
        { id: "RM-04", persona: "Portfolio Risk Manager", domain: "Risk quantification", contribution: "Risk-adjusted returns" },
        { id: "RM-05", persona: "Cybersecurity Threat Analyst", domain: "Technical vulnerabilities", contribution: "Attack surface mapping" },
        { id: "RM-06", persona: "Regulatory Affairs Director", domain: "Compliance risk", contribution: "Regulatory horizon scanning" }
      ]
    },
    content: {
      title: "Content & SEO Strategy Roles",
      roles: [
        { id: "CS-01", persona: "Semantic SEO Architect", domain: "Entity optimization", contribution: "Topical authority engineering" },
        { id: "CS-02", persona: "Content Portfolio Manager", domain: "Content ROI", contribution: "Content investment prioritization" },
        { id: "CS-03", persona: "E-E-A-T Specialist", domain: "Trust signals", contribution: "Expertise demonstration" },
        { id: "CS-04", persona: "AI Content Strategist", domain: "LLM optimization", contribution: "RAG readiness" },
        { id: "CS-05", persona: "Conversion Copywriter", domain: "Persuasion architecture", contribution: "CTA optimization" },
        { id: "CS-06", persona: "Information Architect", domain: "Content structure", contribution: "Navigation optimization" }
      ]
    },
    brand: {
      title: "Brand & Positioning Roles",
      roles: [
        { id: "BP-01", persona: "Brand Anthropologist", domain: "Cultural insight", contribution: "Brand mythology" },
        { id: "BP-02", persona: "Positioning Strategist", domain: "Perceptual mapping", contribution: "Mental availability engineering" },
        { id: "BP-03", persona: "Narrative Designer", domain: "Storytelling", contribution: "Origin story design" },
        { id: "BP-04", persona: "Semiotician", domain: "Sign systems", contribution: "Visual language optimization" },
        { id: "BP-05", persona: "Category Language Specialist", domain: "Terminology ownership", contribution: "Phrase coining" },
        { id: "BP-06", persona: "Enemy Branding Expert", domain: "Opposition positioning", contribution: "Contrast strategy" }
      ]
    },
    execution: {
      title: "Execution & Action Planning Roles",
      roles: [
        { id: "EX-01", persona: "OKR Implementation Coach", domain: "Goal cascading", contribution: "Key result definition" },
        { id: "EX-02", persona: "Agile Transformation Lead", domain: "Sprint planning", contribution: "Backlog prioritization" },
        { id: "EX-03", persona: "Change Management Director", domain: "Adoption", contribution: "Stakeholder alignment" },
        { id: "EX-04", persona: "Resource Optimization Analyst", domain: "Capacity planning", contribution: "Bottleneck removal" },
        { id: "EX-05", persona: "Program Management Executive", domain: "Cross-functional coordination", contribution: "Dependency mapping" },
        { id: "EX-06", persona: "Continuous Improvement Sensei", domain: "Process optimization", contribution: "Waste elimination" }
      ]
    }
  };
  
  return personas[insightType] || personas.market;
}

/**
 * Returns all 36 role personas as a formatted string
 * @returns {string} Formatted role persona matrix
 */
function getAllRolePersonasFormatted() {
  const types = ['market', 'opportunity', 'risk', 'content', 'brand', 'execution'];
  let output = '## 36 ELITE ROLE PERSONAS\n\n';
  
  types.forEach(type => {
    const data = getRolePersonas(type);
    output += `### ${data.title}\n`;
    output += '| Role ID | Persona | Expertise Domain | Unique Contribution |\n';
    output += '|---------|---------|------------------|---------------------|\n';
    data.roles.forEach(role => {
      output += `| ${role.id} | ${role.persona} | ${role.domain} | ${role.contribution} |\n`;
    });
    output += '\n';
  });
  
  return output;
}

/**
 * Returns the output quality mandates as structured data
 * @returns {Object} Quality mandates configuration
 */
function getOutputQualityMandates() {
  return {
    mandates: [
      {
        id: 1,
        name: "QUANTIFICATION",
        description: "Every claim includes specific numbers, percentages, or metrics",
        antiPattern: "Never use vague terms like 'significant' or 'many'",
        example: "73% of enterprise SEO teams vs 'most teams'"
      },
      {
        id: 2,
        name: "COMPETITIVE_SPECIFICITY",
        description: "Name actual competitors with exact metrics",
        antiPattern: "No generic competitor references",
        example: "Ahrefs (DA 92) vs 'leading competitor'"
      },
      {
        id: 3,
        name: "ACTIONABLE_PRECISION",
        description: "Every recommendation includes Owner + Timeline + Success Metric + Dependencies",
        antiPattern: "No vague 'should consider' statements",
        example: "Content Lead publishes pillar page by March 15, targeting 500 organic visits/month"
      },
      {
        id: 4,
        name: "STRATEGIC_DEPTH",
        description: "Apply at least 3 strategic frameworks per insight",
        frameworks: ["Porter's Five Forces", "Blue Ocean", "JTBD", "Value Curve", "Moat Analysis", "Cialdini's Principles", "Schwartz's Awareness Levels", "Hormozi's Value Equation"],
        example: "Analysis through Blue Ocean (ERRC) + JTBD + Moat Theory"
      },
      {
        id: 5,
        name: "CHART_DATA_REQUIRED",
        description: "For EVERY section, include chartData JSON for frontend rendering",
        chartTypes: ["radar", "heatmap", "sankey", "bubble", "treemap", "gauge", "timeline", "force"],
        interactivity: ["hover", "click", "drag", "zoom"]
      }
    ]
  };
}

/**
 * Returns the insight box format template
 * @param {Object} insight - Insight data to format
 * @returns {string} Formatted insight box
 */
function formatInsightBox(insight) {
  return `
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🎯 ${insight.title || 'INSIGHT TITLE'}                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📊 QUANTIFIED FINDING: ${insight.finding || '[Specific metric or data point]'}
│ 🔍 EXPERT LENS: ${insight.expertLens || '[Which of the 36 experts informed this insight]'}
│ ⚡ STRATEGIC IMPLICATION: ${insight.implication || '[What this means for competitive positioning]'}
│ 🎬 IMMEDIATE ACTION: ${insight.action || '[Specific next step with owner + timeline]'}
│ 📈 SUCCESS METRIC: ${insight.metric || '[How we measure impact]'}
│ 🆚 COMPETITOR CONTRAST: ${insight.contrast || '[How this differentiates from named competitors]'}
└─────────────────────────────────────────────────────────────────────────────┘`;
}

/**
 * Validates that an insight meets elite quality standards
 * @param {Object} insight - Insight object to validate
 * @returns {Object} Validation result with isValid and issues array
 */
function validateInsightQuality(insight) {
  const issues = [];
  
  // Check for quantification
  const hasNumbers = /\d+/.test(insight.finding);
  if (!hasNumbers) {
    issues.push('QUANTIFICATION: Finding lacks specific numbers or percentages');
  }
  
  // Check for competitive specificity
  const vagueTerms = ['competitor', 'leading', 'top', 'major'];
  const hasVagueCompetitor = vagueTerms.some(term => 
    insight.contrast?.toLowerCase().includes(term) && !insight.contrast?.match(/[A-Z][a-zA-Z]+/g)
  );
  if (hasVagueCompetitor) {
    issues.push('COMPETITIVE_SPECIFICITY: Use actual competitor names, not generic terms');
  }
  
  // Check for actionable precision
  const hasTimeline = /\d+\s*(day|week|month|hour)/i.test(insight.action);
  if (!hasTimeline) {
    issues.push('ACTIONABLE_PRECISION: Action lacks specific timeline');
  }
  
  // Check for success metric
  const hasMetric = insight.metric && insight.metric.length > 10;
  if (!hasMetric) {
    issues.push('SUCCESS_METRIC: Missing or insufficient success metric');
  }
  
  return {
    isValid: issues.length === 0,
    issues: issues,
    score: Math.max(0, 10 - (issues.length * 2.5))
  };
}
