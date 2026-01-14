/**
 * FT_Robots.gs - Robots.txt Analysis
 * SerpifAI V8 - Analyze and validate robots.txt
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// ROBOTS.TXT ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Fetch and analyze robots.txt
 */
function FT_analyzeRobots(params) {
  const url = params.url;
  
  if (!url) {
    return { ok: false, error: 'URL required' };
  }
  
  try {
    // Extract domain
    const match = url.match(/^(https?:\/\/[^\/]+)/);
    if (!match) {
      return { ok: false, error: 'Invalid URL' };
    }
    
    const domain = match[1];
    const robotsUrl = domain + '/robots.txt';
    
    const response = UrlFetchApp.fetch(robotsUrl, {
      muteHttpExceptions: true,
      followRedirects: true
    });
    
    const statusCode = response.getResponseCode();
    
    if (statusCode !== 200) {
      return {
        ok: true,
        url: robotsUrl,
        exists: false,
        statusCode: statusCode,
        message: 'robots.txt not found or inaccessible'
      };
    }
    
    const content = response.getContentText();
    
    // Parse robots.txt
    const parsed = parseRobotsTxt(content);
    
    // Analyze for issues
    const issues = analyzeRobotsIssues(parsed);
    
    return {
      ok: true,
      url: robotsUrl,
      exists: true,
      statusCode: statusCode,
      raw: content,
      parsed: parsed,
      issues: issues,
      sitemaps: parsed.sitemaps
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Parse robots.txt content
 */
function parseRobotsTxt(content) {
  const lines = content.split('\n');
  const rules = [];
  const sitemaps = [];
  let currentAgent = '*';
  
  lines.forEach(function(line) {
    // Remove comments
    line = line.split('#')[0].trim();
    if (!line) return;
    
    const lower = line.toLowerCase();
    
    if (lower.startsWith('user-agent:')) {
      currentAgent = line.substring(11).trim();
    } else if (lower.startsWith('disallow:')) {
      const path = line.substring(9).trim();
      if (path) {
        rules.push({
          agent: currentAgent,
          type: 'disallow',
          path: path
        });
      }
    } else if (lower.startsWith('allow:')) {
      const path = line.substring(6).trim();
      if (path) {
        rules.push({
          agent: currentAgent,
          type: 'allow',
          path: path
        });
      }
    } else if (lower.startsWith('sitemap:')) {
      sitemaps.push(line.substring(8).trim());
    } else if (lower.startsWith('crawl-delay:')) {
      const delay = line.substring(12).trim();
      rules.push({
        agent: currentAgent,
        type: 'crawl-delay',
        value: delay
      });
    }
  });
  
  // Group by user agent
  const agents = {};
  rules.forEach(function(rule) {
    if (!agents[rule.agent]) {
      agents[rule.agent] = {
        disallow: [],
        allow: [],
        crawlDelay: null
      };
    }
    
    if (rule.type === 'disallow') {
      agents[rule.agent].disallow.push(rule.path);
    } else if (rule.type === 'allow') {
      agents[rule.agent].allow.push(rule.path);
    } else if (rule.type === 'crawl-delay') {
      agents[rule.agent].crawlDelay = rule.value;
    }
  });
  
  return {
    rules: rules,
    agents: agents,
    sitemaps: sitemaps
  };
}

/**
 * Analyze robots.txt for issues
 */
function analyzeRobotsIssues(parsed) {
  const issues = [];
  
  // Check for sitemap
  if (parsed.sitemaps.length === 0) {
    issues.push({
      severity: 'warning',
      message: 'No sitemap specified in robots.txt'
    });
  }
  
  // Check for blocking everything
  const starAgent = parsed.agents['*'];
  if (starAgent && starAgent.disallow.includes('/')) {
    issues.push({
      severity: 'critical',
      message: 'robots.txt blocks all crawling with Disallow: /'
    });
  }
  
  // Check for blocking important paths
  const importantPaths = ['/css', '/js', '/images', '/assets'];
  if (starAgent) {
    importantPaths.forEach(function(path) {
      if (starAgent.disallow.some(function(d) { return d === path || d === path + '/'; })) {
        issues.push({
          severity: 'warning',
          message: 'Blocking ' + path + ' may affect rendering'
        });
      }
    });
  }
  
  // Check for high crawl delay
  for (const agent in parsed.agents) {
    const delay = parsed.agents[agent].crawlDelay;
    if (delay && parseInt(delay) > 10) {
      issues.push({
        severity: 'warning',
        message: 'High crawl-delay (' + delay + ') for ' + agent
      });
    }
  }
  
  // Check for blocking Googlebot specifically
  if (parsed.agents['Googlebot']) {
    const gbRules = parsed.agents['Googlebot'];
    if (gbRules.disallow.includes('/')) {
      issues.push({
        severity: 'critical',
        message: 'Googlebot is completely blocked'
      });
    }
  }
  
  return issues;
}

/**
 * Check if URL is allowed by robots.txt
 */
function FT_isUrlAllowed(params) {
  const url = params.url;
  const userAgent = params.userAgent || 'Googlebot';
  
  if (!url) {
    return { ok: false, error: 'URL required' };
  }
  
  try {
    // Get robots.txt
    const robotsResult = FT_analyzeRobots({ url: url });
    
    if (!robotsResult.ok) {
      return robotsResult;
    }
    
    if (!robotsResult.exists) {
      return {
        ok: true,
        allowed: true,
        reason: 'No robots.txt found - all URLs allowed'
      };
    }
    
    // Extract path from URL
    const urlObj = url.match(/^https?:\/\/[^\/]+(\/.*)?$/);
    const path = urlObj && urlObj[1] ? urlObj[1] : '/';
    
    // Check rules
    const agents = robotsResult.parsed.agents;
    const rules = agents[userAgent] || agents['*'] || { disallow: [], allow: [] };
    
    // Check allow first (higher priority)
    for (let i = 0; i < rules.allow.length; i++) {
      if (pathMatches(path, rules.allow[i])) {
        return {
          ok: true,
          allowed: true,
          reason: 'Explicitly allowed by: Allow: ' + rules.allow[i]
        };
      }
    }
    
    // Check disallow
    for (let i = 0; i < rules.disallow.length; i++) {
      if (pathMatches(path, rules.disallow[i])) {
        return {
          ok: true,
          allowed: false,
          reason: 'Blocked by: Disallow: ' + rules.disallow[i]
        };
      }
    }
    
    return {
      ok: true,
      allowed: true,
      reason: 'No matching rules - allowed by default'
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Check if path matches robots.txt pattern
 */
function pathMatches(path, pattern) {
  // Handle wildcards
  if (pattern.indexOf('*') >= 0) {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*').replace(/\$/g, '$'));
    return regex.test(path);
  }
  
  // Handle end anchor
  if (pattern.endsWith('$')) {
    return path === pattern.slice(0, -1);
  }
  
  // Standard prefix match
  return path.startsWith(pattern);
}

/**
 * Generate robots.txt content
 */
function FT_generateRobots(params) {
  const sitemaps = params.sitemaps || [];
  const disallow = params.disallow || [];
  const allow = params.allow || [];
  const crawlDelay = params.crawlDelay;
  const additionalAgents = params.additionalAgents || [];
  
  const lines = [];
  
  // Default user agent
  lines.push('User-agent: *');
  
  // Allow rules (higher priority, list first)
  allow.forEach(function(path) {
    lines.push('Allow: ' + path);
  });
  
  // Disallow rules
  disallow.forEach(function(path) {
    lines.push('Disallow: ' + path);
  });
  
  // Crawl delay
  if (crawlDelay) {
    lines.push('Crawl-delay: ' + crawlDelay);
  }
  
  // Additional user agents
  additionalAgents.forEach(function(agent) {
    lines.push('');
    lines.push('User-agent: ' + agent.name);
    
    (agent.allow || []).forEach(function(path) {
      lines.push('Allow: ' + path);
    });
    
    (agent.disallow || []).forEach(function(path) {
      lines.push('Disallow: ' + path);
    });
  });
  
  // Sitemaps
  if (sitemaps.length > 0) {
    lines.push('');
    sitemaps.forEach(function(sitemap) {
      lines.push('Sitemap: ' + sitemap);
    });
  }
  
  return {
    ok: true,
    content: lines.join('\n')
  };
}

/**
 * Validate robots.txt syntax
 */
function FT_validateRobots(params) {
  const content = params.content;
  
  if (!content) {
    return { ok: false, error: 'Content required' };
  }
  
  const lines = content.split('\n');
  const errors = [];
  const warnings = [];
  
  let hasUserAgent = false;
  let lineNum = 0;
  
  lines.forEach(function(line) {
    lineNum++;
    const trimmed = line.split('#')[0].trim();
    
    if (!trimmed) return;
    
    const lower = trimmed.toLowerCase();
    
    // Check for valid directives
    const validDirectives = ['user-agent:', 'disallow:', 'allow:', 'sitemap:', 'crawl-delay:', 'host:'];
    const isValid = validDirectives.some(function(d) { return lower.startsWith(d); });
    
    if (!isValid) {
      warnings.push('Line ' + lineNum + ': Unknown directive "' + trimmed.split(':')[0] + '"');
    }
    
    // Check for user-agent before rules
    if ((lower.startsWith('disallow:') || lower.startsWith('allow:')) && !hasUserAgent) {
      errors.push('Line ' + lineNum + ': Rule before User-agent declaration');
    }
    
    if (lower.startsWith('user-agent:')) {
      hasUserAgent = true;
    }
    
    // Check for absolute paths in disallow/allow
    if (lower.startsWith('disallow:') || lower.startsWith('allow:')) {
      const path = trimmed.substring(trimmed.indexOf(':') + 1).trim();
      if (path && !path.startsWith('/') && path !== '*') {
        warnings.push('Line ' + lineNum + ': Path should start with /');
      }
    }
  });
  
  return {
    ok: true,
    isValid: errors.length === 0,
    errors: errors,
    warnings: warnings
  };
}

/**
 * Compare two robots.txt files
 */
function FT_compareRobots(params) {
  const url1 = params.url1;
  const url2 = params.url2;
  
  if (!url1 || !url2) {
    return { ok: false, error: 'Two URLs required' };
  }
  
  try {
    const robots1 = FT_analyzeRobots({ url: url1 });
    const robots2 = FT_analyzeRobots({ url: url2 });
    
    if (!robots1.ok || !robots2.ok) {
      return { ok: false, error: 'Failed to fetch one or both robots.txt files' };
    }
    
    const differences = [];
    
    // Compare sitemaps
    const sitemaps1 = robots1.sitemaps || [];
    const sitemaps2 = robots2.sitemaps || [];
    
    if (sitemaps1.length !== sitemaps2.length) {
      differences.push('Different number of sitemaps');
    }
    
    // Compare rules
    const rules1 = robots1.parsed ? robots1.parsed.rules : [];
    const rules2 = robots2.parsed ? robots2.parsed.rules : [];
    
    if (rules1.length !== rules2.length) {
      differences.push('Different number of rules');
    }
    
    return {
      ok: true,
      url1: url1,
      url2: url2,
      robots1: robots1,
      robots2: robots2,
      differences: differences,
      identical: differences.length === 0
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
