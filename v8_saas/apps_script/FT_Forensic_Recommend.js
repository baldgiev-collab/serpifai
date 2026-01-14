/**
 * FT_Forensic_Recommend.gs - Recommendations & Competitor Analysis
 * SerpifAI V8 - Modular Architecture
 * 
 * Generates prioritized recommendations and competitor gap analysis.
 */

/**
 * Generate prioritized recommendations
 * @param {object} report - Full forensic report
 * @return {Array} Prioritized recommendations
 */
function FT_generateRecommendations(report) {
  const recommendations = [];
  const scores = report.scores || {};
  const categories = report.categories || {};
  
  // Metadata recommendations
  if (scores.metadata < 60) {
    if (!categories.metadata || !categories.metadata.title) {
      recommendations.push({
        priority: 'high',
        category: 'Metadata',
        issue: 'Missing or empty title tag',
        fix: 'Add a unique, descriptive title (30-60 characters)',
        impact: '+15 SEO score'
      });
    }
    if (!categories.metadata || !categories.metadata.description) {
      recommendations.push({
        priority: 'high',
        category: 'Metadata',
        issue: 'Missing meta description',
        fix: 'Add compelling meta description (120-160 characters)',
        impact: '+10 CTR improvement'
      });
    }
  }
  
  // Headings recommendations
  if (categories.headings) {
    if (categories.headings.stats.h1Count === 0) {
      recommendations.push({
        priority: 'high',
        category: 'Headings',
        issue: 'Missing H1 tag',
        fix: 'Add a single, keyword-rich H1 heading',
        impact: '+20 SEO score'
      });
    }
    if (categories.headings.stats.multipleH1) {
      recommendations.push({
        priority: 'medium',
        category: 'Headings',
        issue: 'Multiple H1 tags detected',
        fix: 'Use only one H1 per page',
        impact: 'Improved content hierarchy'
      });
    }
  }
  
  // Schema recommendations
  if (scores.schema < 30) {
    recommendations.push({
      priority: 'high',
      category: 'Schema',
      issue: 'No structured data found',
      fix: 'Add JSON-LD schema (Organization, Article, or relevant type)',
      impact: 'Rich snippets eligibility'
    });
  }
  
  // Author/E-E-A-T recommendations
  if (scores.author < 40) {
    recommendations.push({
      priority: 'medium',
      category: 'E-E-A-T',
      issue: 'Weak author signals',
      fix: 'Add author byline, bio, and social links',
      impact: 'Improved trust signals'
    });
  }
  
  // Trust recommendations
  if (scores.trust < 50) {
    FT_addTrustRecommendations(recommendations, categories);
  }
  
  // Images recommendations
  if (categories.images && categories.images.stats) {
    const altPct = categories.images.stats.altPercentage || 0;
    if (altPct < 80) {
      recommendations.push({
        priority: 'medium',
        category: 'Images',
        issue: altPct + '% images have alt text',
        fix: 'Add descriptive alt text to all images',
        impact: 'Accessibility + image SEO'
      });
    }
  }
  
  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  
  return recommendations.slice(0, 10);
}

/**
 * Add trust-related recommendations
 * @param {Array} recommendations - Recommendations array
 * @param {object} categories - Report categories
 */
function FT_addTrustRecommendations(recommendations, categories) {
  if (!categories.trust || !categories.trust.hasPrivacyPolicy) {
    recommendations.push({
      priority: 'medium',
      category: 'Trust',
      issue: 'No privacy policy link',
      fix: 'Add visible privacy policy link in footer',
      impact: 'Legal compliance + trust'
    });
  }
  if (!categories.trust || !categories.trust.hasContact) {
    recommendations.push({
      priority: 'medium',
      category: 'Trust',
      issue: 'No contact information',
      fix: 'Add contact page link and address',
      impact: 'Local SEO + trust signals'
    });
  }
  if (!categories.trust || !categories.trust.hasAbout) {
    recommendations.push({
      priority: 'low',
      category: 'Trust',
      issue: 'No about page link',
      fix: 'Add visible about page with company info',
      impact: 'Brand trust + E-E-A-T'
    });
  }
}

/**
 * Find keyword gaps vs competitors
 * @param {object} primary - Primary site report
 * @param {Array} competitors - Competitor reports
 * @return {Array} Keyword gaps
 */
function FT_Forensic_findKeywordGaps(primary, competitors) {
  const gaps = [];
  const primaryWords = new Set();
  
  if (primary.categories && primary.categories.keywords) {
    (primary.categories.keywords.topWords || []).forEach(w => {
      primaryWords.add(w.word);
    });
  }
  
  competitors.forEach(comp => {
    if (comp.keywords && comp.keywords.topWords) {
      comp.keywords.topWords.forEach(w => {
        if (!primaryWords.has(w.word) && w.count >= 3) {
          gaps.push({
            keyword: w.word,
            competitor: comp.url,
            frequency: w.count
          });
        }
      });
    }
  });
  
  // Sort by frequency and dedupe
  gaps.sort((a, b) => b.frequency - a.frequency);
  const seen = new Set();
  return gaps.filter(g => {
    if (seen.has(g.keyword)) return false;
    seen.add(g.keyword);
    return true;
  }).slice(0, 20);
}

/**
 * Find competitive strengths
 * @param {object} primary - Primary site report
 * @param {Array} competitors - Competitor reports
 * @return {Array} Strengths
 */
function FT_findStrengths(primary, competitors) {
  const strengths = [];
  
  if (!primary.scores || competitors.length === 0) return strengths;
  
  const avgCompScores = {};
  
  competitors.forEach(comp => {
    if (comp.score) {
      Object.keys(comp.score).forEach(key => {
        avgCompScores[key] = (avgCompScores[key] || 0) + comp.score[key];
      });
    }
  });
  
  Object.keys(avgCompScores).forEach(key => {
    avgCompScores[key] = avgCompScores[key] / competitors.length;
  });
  
  Object.keys(primary.scores).forEach(category => {
    const diff = primary.scores[category] - (avgCompScores[category] || 0);
    if (diff > 10) {
      strengths.push({
        category: category,
        yourScore: primary.scores[category],
        avgCompetitor: Math.round(avgCompScores[category] || 0),
        advantage: Math.round(diff)
      });
    }
  });
  
  strengths.sort((a, b) => b.advantage - a.advantage);
  return strengths;
}

/**
 * Find competitive weaknesses
 * @param {object} primary - Primary site report
 * @param {Array} competitors - Competitor reports
 * @return {Array} Weaknesses
 */
function FT_findWeaknesses(primary, competitors) {
  const weaknesses = [];
  
  if (!primary.scores || competitors.length === 0) return weaknesses;
  
  const avgCompScores = {};
  
  competitors.forEach(comp => {
    if (comp.score) {
      Object.keys(comp.score).forEach(key => {
        avgCompScores[key] = (avgCompScores[key] || 0) + comp.score[key];
      });
    }
  });
  
  Object.keys(avgCompScores).forEach(key => {
    avgCompScores[key] = avgCompScores[key] / competitors.length;
  });
  
  Object.keys(primary.scores).forEach(category => {
    const diff = (avgCompScores[category] || 0) - primary.scores[category];
    if (diff > 10) {
      weaknesses.push({
        category: category,
        yourScore: primary.scores[category],
        avgCompetitor: Math.round(avgCompScores[category] || 0),
        gap: Math.round(diff)
      });
    }
  });
  
  weaknesses.sort((a, b) => b.gap - a.gap);
  return weaknesses;
}

// Executive summary functions in FT_Forensic_Summary.gs
