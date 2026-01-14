/**
 * DB_GeminiEliteAnalysis.gs
 * Sends competitor data to Gemini for elite comparative analysis
 * Generates data-driven insights for all 15 categories
 */

/**
 * Generate elite comparative analysis using Gemini
 * @param {object} competitorData - Raw competitor data from all APIs
 * @param {array} competitors - List of competitor domains
 * @param {string} yourDomain - Client's domain
 * @returns {object} Gemini analysis with insights for all 15 categories
 */
function generateEliteAnalysis(competitorData, competitors, yourDomain) {
  try {
    Logger.log('🤖 Generating Gemini elite comparative analysis...');
    
    // Build comprehensive prompt
    const prompt = buildEliteAnalysisPrompt(competitorData, competitors, yourDomain);
    
    // Call Gemini API
    const geminiResult = callGateway('gemini:generate', {
      model: 'gemini-1.5-pro',
      prompt: prompt,
      options: {
        temperature: 0.7,
        maxTokens: 8000,
        responseFormat: 'json'
      }
    });
    
    if (!geminiResult || !geminiResult.success) {
      throw new Error('Gemini API failed: ' + (geminiResult ? geminiResult.error : 'Unknown error'));
    }
    
    // Parse Gemini response
    const analysis = parseGeminiAnalysis(geminiResult.content);
    
    Logger.log('✅ Elite analysis complete: ' + Object.keys(analysis.categories || {}).length + ' categories');
    
    return {
      success: true,
      analysis: analysis,
      timestamp: new Date().toISOString(),
      model: 'gemini-1.5-pro'
    };
    
  } catch (error) {
    Logger.log('❌ Gemini analysis error: ' + error.toString());
    return {
      success: false,
      error: error.toString(),
      fallback: generateFallbackAnalysis(competitorData, competitors)
    };
  }
}

/**
 * Build comprehensive prompt for Gemini
 */
function buildEliteAnalysisPrompt(competitorData, competitors, yourDomain) {
  var prompt = '# Elite Competitor Intelligence Analysis\n\n';
  prompt += '## Client Domain: ' + yourDomain + '\n';
  prompt += '## Competitors Analyzed: ' + competitors.join(', ') + '\n\n';
  
  prompt += '## Raw Competitor Data:\n';
  prompt += JSON.stringify(competitorData, null, 2) + '\n\n';
  
  prompt += '## Analysis Requirements:\n\n';
  prompt += 'Provide comprehensive competitive intelligence analysis across 15 categories:\n\n';
  
  prompt += '1. **Market Intelligence** - Market positioning, share estimates, trends\n';
  prompt += '2. **Brand Positioning** - Brand strength, messaging, differentiation\n';
  prompt += '3. **Technical SEO** - Site health, performance, technical optimization\n';
  prompt += '4. **Content Intelligence** - Content strategy, quality, gaps\n';
  prompt += '5. **Keyword Strategy** - Target keywords, ranking, opportunities\n';
  prompt += '6. **Content Systems** - Publishing frequency, formats, distribution\n';
  prompt += '7. **Conversion Optimization** - CTAs, funnels, conversion tactics\n';
  prompt += '8. **Distribution Channels** - Traffic sources, channel mix\n';
  prompt += '9. **Audience Intelligence** - Demographics, behavior, preferences\n';
  prompt += '10. **Geographic & AEO** - Location targeting, answer engine optimization\n';
  prompt += '11. **Authority Metrics** - Domain authority, backlinks, trust\n';
  prompt += '12. **Performance Benchmarks** - Speed, UX, Core Web Vitals\n';
  prompt += '13. **Opportunity Analysis** - Gaps, weaknesses, opportunities\n';
  prompt += '14. **Competitive Scoring** - Numerical scores and rankings\n';
  prompt += '15. **Strategic Overview** - Executive summary and recommendations\n\n';
  
  prompt += '## Output Format (JSON):\n\n';
  prompt += '```json\n';
  prompt += '{\n';
  prompt += '  "executiveSummary": "Overall strategic assessment...",\n';
  prompt += '  "categories": {\n';
  prompt += '    "marketIntelligence": {\n';
  prompt += '      "insights": ["Key insight 1", "Key insight 2"],\n';
  prompt += '      "metrics": {"metric1": value, "metric2": value},\n';
  prompt += '      "recommendations": ["Action 1", "Action 2"],\n';
  prompt += '      "chartData": {}\n';
  prompt += '    },\n';
  prompt += '    // ... 14 more categories\n';
  prompt += '  },\n';
  prompt += '  "competitorRankings": {\n';
  prompt += '    "overall": [{"domain": "comp1.com", "score": 85}, ...],\n';
  prompt += '    "byCategory": {}\n';
  prompt += '  },\n';
  prompt += '  "actionPriorities": [\n';
  prompt += '    {"priority": "HIGH", "action": "...", "impact": "...", "effort": "..."}\n';
  prompt += '  ]\n';
  prompt += '}\n';
  prompt += '```\n\n';
  
  prompt += 'Analyze all available data and provide actionable, data-driven insights.';
  
  return prompt;
}

/**
 * Parse Gemini response into structured format
 */
function parseGeminiAnalysis(content) {
  try {
    // Try to extract JSON from response
    var jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback: return raw content
    return {
      executiveSummary: content,
      categories: {},
      rawContent: content
    };
    
  } catch (error) {
    Logger.log('Parse error: ' + error.toString());
    return {
      executiveSummary: content,
      categories: {},
      parseError: error.toString()
    };
  }
}

/**
 * Generate fallback analysis if Gemini fails
 */
function generateFallbackAnalysis(competitorData, competitors) {
  return {
    executiveSummary: 'Analysis generated from raw data (Gemini unavailable)',
    categories: {
      overview: {
        insights: [
          'Analyzed ' + competitors.length + ' competitors',
          'Data collected from multiple APIs',
          'Gemini analysis unavailable - showing raw metrics'
        ],
        metrics: {
          competitorsAnalyzed: competitors.length,
          dataPoints: Object.keys(competitorData).length
        }
      }
    },
    isFallback: true
  };
}
