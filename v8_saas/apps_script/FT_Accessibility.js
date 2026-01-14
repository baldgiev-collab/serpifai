/**
 * FT_Accessibility.gs - Accessibility Analysis
 * SerpifAI V8 - WCAG accessibility checks
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// ACCESSIBILITY ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Analyze page accessibility
 */
function FT_analyzeAccessibility(params) {
  const url = params.url;
  
  if (!url) {
    return { ok: false, error: 'URL required' };
  }
  
  try {
    const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    const html = response.getContentText();
    
    const issues = [];
    const passed = [];
    
    // Check for missing alt text
    const altCheck = checkAltText(html);
    if (altCheck.issues.length > 0) {
      issues.push(...altCheck.issues);
    } else {
      passed.push({ test: 'Image Alt Text', description: 'All images have alt attributes' });
    }
    
    // Check for form labels
    const labelCheck = checkFormLabels(html);
    if (labelCheck.issues.length > 0) {
      issues.push(...labelCheck.issues);
    } else {
      passed.push({ test: 'Form Labels', description: 'All form inputs have labels' });
    }
    
    // Check heading structure
    const headingCheck = checkHeadingStructure(html);
    if (headingCheck.issues.length > 0) {
      issues.push(...headingCheck.issues);
    } else {
      passed.push({ test: 'Heading Structure', description: 'Proper heading hierarchy' });
    }
    
    // Check for language attribute
    const langCheck = checkLanguage(html);
    if (langCheck.issue) {
      issues.push(langCheck.issue);
    } else {
      passed.push({ test: 'Language', description: 'Page has lang attribute' });
    }
    
    // Check for link text
    const linkCheck = checkLinkText(html);
    if (linkCheck.issues.length > 0) {
      issues.push(...linkCheck.issues);
    } else {
      passed.push({ test: 'Link Text', description: 'Links have descriptive text' });
    }
    
    // Check for ARIA landmarks
    const ariaCheck = checkAriaLandmarks(html);
    if (ariaCheck.issues.length > 0) {
      issues.push(...ariaCheck.issues);
    } else {
      passed.push({ test: 'ARIA Landmarks', description: 'Page has proper landmarks' });
    }
    
    // Check for color contrast hints
    const contrastCheck = checkColorContrast(html);
    if (contrastCheck.issues.length > 0) {
      issues.push(...contrastCheck.issues);
    }
    
    // Calculate score
    const totalTests = issues.length + passed.length;
    const score = totalTests > 0 ? Math.round((passed.length / totalTests) * 100) : 0;
    
    return {
      ok: true,
      url: url,
      score: score,
      issues: issues,
      passed: passed,
      summary: {
        critical: issues.filter(i => i.severity === 'critical').length,
        serious: issues.filter(i => i.severity === 'serious').length,
        moderate: issues.filter(i => i.severity === 'moderate').length,
        minor: issues.filter(i => i.severity === 'minor').length
      }
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Check alt text on images
 */
function checkAltText(html) {
  const issues = [];
  const imgRegex = /<img[^>]*>/gi;
  const images = html.match(imgRegex) || [];
  
  images.forEach(function(img, index) {
    if (!/alt\s*=/i.test(img)) {
      const src = img.match(/src\s*=\s*["']([^"']+)["']/i);
      issues.push({
        test: 'Image Missing Alt',
        severity: 'serious',
        element: img.substring(0, 100),
        description: 'Image missing alt attribute',
        wcag: '1.1.1',
        fix: 'Add alt="" for decorative images or descriptive alt text for informative images'
      });
    } else if (/alt\s*=\s*["']\s*["']/i.test(img) && !/role\s*=\s*["']presentation["']/i.test(img)) {
      // Empty alt without presentation role
      if (!/aria-hidden\s*=\s*["']true["']/i.test(img)) {
        // This might be ok for decorative images, check if it looks content-related
      }
    }
  });
  
  return { issues: issues.slice(0, 10) }; // Limit issues
}

/**
 * Check form labels
 */
function checkFormLabels(html) {
  const issues = [];
  const inputRegex = /<input[^>]*type\s*=\s*["'](text|email|password|tel|number|search)["'][^>]*>/gi;
  const inputs = html.match(inputRegex) || [];
  
  inputs.forEach(function(input) {
    const hasAriaLabel = /aria-label\s*=/i.test(input);
    const hasAriaLabelledby = /aria-labelledby\s*=/i.test(input);
    const hasTitle = /title\s*=/i.test(input);
    const id = input.match(/id\s*=\s*["']([^"']+)["']/i);
    
    if (!hasAriaLabel && !hasAriaLabelledby && !hasTitle) {
      if (id) {
        const labelRegex = new RegExp('for\\s*=\\s*["\']' + id[1] + '["\']', 'i');
        if (!labelRegex.test(html)) {
          issues.push({
            test: 'Form Input Missing Label',
            severity: 'serious',
            element: input.substring(0, 100),
            description: 'Form input missing associated label',
            wcag: '1.3.1',
            fix: 'Add a <label for="' + id[1] + '"> or aria-label attribute'
          });
        }
      } else {
        issues.push({
          test: 'Form Input Missing Label',
          severity: 'serious',
          element: input.substring(0, 100),
          description: 'Form input has no id and no accessible label',
          wcag: '1.3.1',
          fix: 'Add id and label, or aria-label attribute'
        });
      }
    }
  });
  
  return { issues: issues.slice(0, 5) };
}

/**
 * Check heading structure
 */
function checkHeadingStructure(html) {
  const issues = [];
  const headingRegex = /<h([1-6])[^>]*>/gi;
  const headings = [];
  let match;
  
  while ((match = headingRegex.exec(html)) !== null) {
    headings.push(parseInt(match[1]));
  }
  
  // Check for h1
  const h1Count = headings.filter(h => h === 1).length;
  if (h1Count === 0) {
    issues.push({
      test: 'Missing H1',
      severity: 'serious',
      description: 'Page is missing an H1 heading',
      wcag: '1.3.1',
      fix: 'Add a main H1 heading to the page'
    });
  } else if (h1Count > 1) {
    issues.push({
      test: 'Multiple H1',
      severity: 'moderate',
      description: 'Page has ' + h1Count + ' H1 headings',
      wcag: '1.3.1',
      fix: 'Use only one H1 heading per page'
    });
  }
  
  // Check for skipped levels
  for (let i = 1; i < headings.length; i++) {
    if (headings[i] > headings[i - 1] + 1) {
      issues.push({
        test: 'Skipped Heading Level',
        severity: 'moderate',
        description: 'Heading level skipped from H' + headings[i - 1] + ' to H' + headings[i],
        wcag: '1.3.1',
        fix: 'Use consecutive heading levels without skipping'
      });
      break;
    }
  }
  
  return { issues: issues };
}

/**
 * Check language attribute
 */
function checkLanguage(html) {
  const htmlTagMatch = html.match(/<html[^>]*>/i);
  
  if (!htmlTagMatch || !/lang\s*=/i.test(htmlTagMatch[0])) {
    return {
      issue: {
        test: 'Missing Language',
        severity: 'serious',
        description: 'Page missing lang attribute on html element',
        wcag: '3.1.1',
        fix: 'Add lang="en" (or appropriate language code) to the <html> tag'
      }
    };
  }
  
  return { issue: null };
}

/**
 * Check link text
 */
function checkLinkText(html) {
  const issues = [];
  const linkRegex = /<a[^>]*>([^<]*)<\/a>/gi;
  const badTexts = ['click here', 'here', 'read more', 'more', 'link', 'learn more'];
  let match;
  
  while ((match = linkRegex.exec(html)) !== null) {
    const text = match[1].trim().toLowerCase();
    if (badTexts.includes(text)) {
      issues.push({
        test: 'Non-descriptive Link Text',
        severity: 'moderate',
        element: match[0].substring(0, 100),
        description: 'Link text "' + text + '" is not descriptive',
        wcag: '2.4.4',
        fix: 'Use descriptive link text that indicates the destination'
      });
    }
  }
  
  return { issues: issues.slice(0, 5) };
}

/**
 * Check ARIA landmarks
 */
function checkAriaLandmarks(html) {
  const issues = [];
  
  const hasMain = /<main|role\s*=\s*["']main["']/i.test(html);
  const hasNav = /<nav|role\s*=\s*["']navigation["']/i.test(html);
  const hasBanner = /<header|role\s*=\s*["']banner["']/i.test(html);
  
  if (!hasMain) {
    issues.push({
      test: 'Missing Main Landmark',
      severity: 'moderate',
      description: 'Page missing main landmark',
      wcag: '1.3.1',
      fix: 'Add <main> element or role="main" to main content area'
    });
  }
  
  if (!hasNav) {
    issues.push({
      test: 'Missing Navigation Landmark',
      severity: 'minor',
      description: 'Page missing navigation landmark',
      wcag: '1.3.1',
      fix: 'Add <nav> element or role="navigation" to navigation'
    });
  }
  
  return { issues: issues };
}

/**
 * Check color contrast (basic)
 */
function checkColorContrast(html) {
  const issues = [];
  // Basic check for inline styles with potentially low contrast
  const styleRegex = /style\s*=\s*["'][^"']*color\s*:\s*#?([a-fA-F0-9]{3,6}|[a-z]+)[^"']*["']/gi;
  let match;
  
  while ((match = styleRegex.exec(html)) !== null) {
    const color = match[1].toLowerCase();
    if (color === 'gray' || color === 'grey' || color === 'lightgray' || color === 'silver') {
      issues.push({
        test: 'Potential Contrast Issue',
        severity: 'minor',
        description: 'Light color detected that may have contrast issues',
        wcag: '1.4.3',
        fix: 'Ensure text color has at least 4.5:1 contrast ratio with background'
      });
      break; // Just flag once
    }
  }
  
  return { issues: issues };
}
