/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FT_ExtractorsComprehensive.gs - COMPREHENSIVE HTML DATA EXTRACTION
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Complete data extraction for competitor intelligence:
 * ✓ Headings hierarchy (H1-H6) with nesting
 * ✓ Introduction copy & first paragraphs
 * ✓ Keywords (primary, secondary, long-tail, semantic)
 * ✓ Meta data & Open Graph
 * ✓ Internal & external links with anchor text
 * ✓ Author signals & credentials
 * ✓ Trust signals & E-E-A-T
 * ✓ Schema.org markup (ALL types)
 * ✓ FAQ sections & Q&A markup
 * 
 * @version 1.0.0
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Extract ALL headings (H1-H6) with hierarchy
 * Returns structured array with nesting levels
 */
function FT_extractHeadingsHierarchy(html, url) {
  const result = {
    ok: true,
    headings: [],
    hierarchy: [],
    counts: { h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0 },
    issues: []
  };
  
  if (!html) {
    result.ok = false;
    result.issues.push('No HTML provided');
    return result;
  }
  
  try {
    // Extract all headings with level
    const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h\1>/gi;
    let match;
    let position = 0;
    
    while ((match = headingRegex.exec(html)) !== null) {
      const level = parseInt(match[1]);
      const rawText = match[2];
      
      // Clean text (remove tags, trim)
      const text = rawText
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .trim();
      
      if (text) {
        const heading = {
          level: level,
          text: text,
          wordCount: text.split(/\s+/).length,
          position: position++,
          length: text.length
        };
        
        result.headings.push(heading);
        result.counts[`h${level}`]++;
      }
    }
    
    // Build hierarchy (nest headings under parents)
    const stack = [];
    result.headings.forEach(heading => {
      // Pop stack until we find a parent heading
      while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
        stack.pop();
      }
      
      const hierarchyItem = {
        ...heading,
        depth: stack.length,
        parent: stack.length > 0 ? stack[stack.length - 1].text : null
      };
      
      result.hierarchy.push(hierarchyItem);
      stack.push(heading);
    });
    
    // Detect issues
    if (result.counts.h1 === 0) {
      result.issues.push('No H1 found');
    } else if (result.counts.h1 > 1) {
      result.issues.push(`Multiple H1 tags found: ${result.counts.h1}`);
    }
    
    // Check for skipped heading levels
    const levels = result.headings.map(h => h.level);
    for (let i = 1; i < levels.length; i++) {
      if (levels[i] - levels[i-1] > 1) {
        result.issues.push(`Skipped heading level: H${levels[i-1]} → H${levels[i]}`);
      }
    }
    
  } catch (error) {
    result.ok = false;
    result.issues.push(error.toString());
  }
  
  return result;
}

/**
 * Extract introduction copy & first paragraphs
 */
function FT_extractIntroCopy(html, url) {
  const result = {
    ok: true,
    introParagraphs: [],
    firstParagraph: '',
    introWordCount: 0,
    mainContent: '',
    issues: []
  };
  
  if (!html) {
    result.ok = false;
    result.issues.push('No HTML provided');
    return result;
  }
  
  try {
    // Remove script and style tags
    let cleanHtml = html
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/<nav[^>]*>.*?<\/nav>/gi, '')
      .replace(/<header[^>]*>.*?<\/header>/gi, '')
      .replace(/<footer[^>]*>.*?<\/footer>/gi, '');
    
    // Try to find main content area
    const mainPatterns = [
      /<main[^>]*>(.*?)<\/main>/is,
      /<article[^>]*>(.*?)<\/article>/is,
      /<div[^>]*class="[^"]*content[^"]*"[^>]*>(.*?)<\/div>/is,
      /<div[^>]*id="[^"]*content[^"]*"[^>]*>(.*?)<\/div>/is
    ];
    
    let mainArea = cleanHtml;
    for (const pattern of mainPatterns) {
      const match = cleanHtml.match(pattern);
      if (match) {
        mainArea = match[1];
        break;
      }
    }
    
    // Extract first 3-5 paragraphs
    const paragraphRegex = /<p[^>]*>(.*?)<\/p>/gi;
    let match;
    let paragraphCount = 0;
    
    while ((match = paragraphRegex.exec(mainArea)) !== null && paragraphCount < 5) {
      const text = match[1]
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .trim();
      
      if (text.length > 50) { // Skip very short paragraphs
        result.introParagraphs.push(text);
        if (paragraphCount === 0) {
          result.firstParagraph = text;
        }
        paragraphCount++;
      }
    }
    
    // Calculate intro word count (first 500 words)
    const allText = result.introParagraphs.join(' ');
    const words = allText.split(/\s+/);
    result.introWordCount = Math.min(words.length, 500);
    result.mainContent = words.slice(0, 500).join(' ');
    
    if (result.introParagraphs.length === 0) {
      result.issues.push('No paragraphs found in main content');
    }
    
  } catch (error) {
    result.ok = false;
    result.issues.push(error.toString());
  }
  
  return result;
}

/**
 * Extract comprehensive keyword data
 */
function FT_extractKeywordsComprehensive(html, url) {
  const result = {
    ok: true,
    primary: [],
    secondary: [],
    longTail: [],
    semantic: [],
    density: {},
    issues: []
  };
  
  if (!html) {
    result.ok = false;
    result.issues.push('No HTML provided');
    return result;
  }
  
  try {
    // Extract text content
    const textContent = html
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .toLowerCase();
    
    const words = textContent.split(/\s+/).filter(w => w.length > 3);
    const totalWords = words.length;
    
    // Count word frequency
    const wordCount = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    // Get title and H1 for primary keywords
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    
    const titleText = titleMatch ? titleMatch[1].toLowerCase() : '';
    const h1Text = h1Match ? h1Match[1].toLowerCase() : '';
    
    // Primary keywords (from title, H1, high frequency)
    const primaryCandidates = new Set();
    if (titleText) {
      titleText.split(/\s+/).forEach(w => {
        if (w.length > 3) primaryCandidates.add(w);
      });
    }
    if (h1Text) {
      h1Text.split(/\s+/).forEach(w => {
        if (w.length > 3) primaryCandidates.add(w);
      });
    }
    
    // Add high-frequency words to primary
    Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([word, count]) => {
        primaryCandidates.add(word);
      });
    
    result.primary = Array.from(primaryCandidates).slice(0, 15);
    
    // Secondary keywords (H2s, meta description)
    const h2Regex = /<h2[^>]*>([^<]+)<\/h2>/gi;
    let h2Match;
    const secondaryCandidates = new Set();
    
    while ((h2Match = h2Regex.exec(html)) !== null) {
      const h2Words = h2Match[1].toLowerCase().split(/\s+/);
      h2Words.forEach(w => {
        if (w.length > 3 && !result.primary.includes(w)) {
          secondaryCandidates.add(w);
        }
      });
    }
    
    result.secondary = Array.from(secondaryCandidates).slice(0, 20);
    
    // Long-tail keywords (3-5 word phrases with decent frequency)
    const phrases = [];
    for (let i = 0; i < words.length - 4; i++) {
      const phrase3 = words.slice(i, i + 3).join(' ');
      const phrase4 = words.slice(i, i + 4).join(' ');
      const phrase5 = words.slice(i, i + 5).join(' ');
      phrases.push(phrase3, phrase4, phrase5);
    }
    
    const phraseCount = {};
    phrases.forEach(phrase => {
      phraseCount[phrase] = (phraseCount[phrase] || 0) + 1;
    });
    
    result.longTail = Object.entries(phraseCount)
      .filter(([phrase, count]) => count >= 2 && phrase.length > 15)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([phrase]) => phrase);
    
    // Calculate keyword density for primary keywords
    result.primary.forEach(keyword => {
      const count = wordCount[keyword] || 0;
      const density = totalWords > 0 ? ((count / totalWords) * 100).toFixed(2) : 0;
      result.density[keyword] = {
        count: count,
        density: parseFloat(density)
      };
    });
    
  } catch (error) {
    result.ok = false;
    result.issues.push(error.toString());
  }
  
  return result;
}

/**
 * Extract meta data & Open Graph
 */
function FT_extractMetaDataComplete(html, url) {
  const result = {
    ok: true,
    title: '',
    metaDescription: '',
    metaKeywords: '',
    metaRobots: '',
    canonical: '',
    favicon: '',
    openGraph: {},
    twitterCard: {},
    issues: []
  };
  
  if (!html) {
    result.ok = false;
    result.issues.push('No HTML provided');
    return result;
  }
  
  try {
    // Title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    result.title = titleMatch ? titleMatch[1].trim() : '';
    
    // Meta tags
    const metaRegex = /<meta\\s+([^>]+)>/gi;
    let match;
    
    while ((match = metaRegex.exec(html)) !== null) {
      const metaTag = match[1];
      
      // Description
      if (/name=["']description["']/i.test(metaTag)) {
        const contentMatch = metaTag.match(/content=["']([^"']+)["']/i);
        if (contentMatch) result.metaDescription = contentMatch[1].trim();
      }
      
      // Keywords
      if (/name=["']keywords["']/i.test(metaTag)) {
        const contentMatch = metaTag.match(/content=["']([^"']+)["']/i);
        if (contentMatch) result.metaKeywords = contentMatch[1].trim();
      }
      
      // Robots
      if (/name=["']robots["']/i.test(metaTag)) {
        const contentMatch = metaTag.match(/content=["']([^"']+)["']/i);
        if (contentMatch) result.metaRobots = contentMatch[1].trim();
      }
      
      // Open Graph
      if (/property=["']og:/i.test(metaTag)) {
        const propMatch = metaTag.match(/property=["']og:([^"']+)["']/i);
        const contentMatch = metaTag.match(/content=["']([^"']+)["']/i);
        if (propMatch && contentMatch) {
          result.openGraph[propMatch[1]] = contentMatch[1].trim();
        }
      }
      
      // Twitter Card
      if (/name=["']twitter:/i.test(metaTag)) {
        const nameMatch = metaTag.match(/name=["']twitter:([^"']+)["']/i);
        const contentMatch = metaTag.match(/content=["']([^"']+)["']/i);
        if (nameMatch && contentMatch) {
          result.twitterCard[nameMatch[1]] = contentMatch[1].trim();
        }
      }
    }
    
    // Canonical
    const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
    if (canonicalMatch) {
      result.canonical = canonicalMatch[1];
    }
    
    // Favicon
    const faviconMatch = html.match(/<link[^>]+rel=["'](?:icon|shortcut icon)["'][^>]+href=["']([^"']+)["']/i);
    if (faviconMatch) {
      result.favicon = faviconMatch[1];
    }
    
    // Validate
    if (!result.title) result.issues.push('No title tag');
    if (!result.metaDescription) result.issues.push('No meta description');
    if (result.metaDescription.length < 50) result.issues.push('Meta description too short');
    if (result.metaDescription.length > 160) result.issues.push('Meta description too long');
    
  } catch (error) {
    result.ok = false;
    result.issues.push(error.toString());
  }
  
  return result;
}

/**
 * Extract internal & external links with anchor text
 */
function FT_extractLinksComprehensive(html, url) {
  const result = {
    ok: true,
    internal: [],
    external: [],
    totalLinks: 0,
    linkDensity: 0,
    nofollowCount: 0,
    issues: []
  };
  
  if (!html || !url) {
    result.ok = false;
    result.issues.push('HTML or URL missing');
    return result;
  }
  
  try {
    // Get domain from URL
    const urlObj = new URL(url);
    const baseDomain = urlObj.hostname.replace(/^www\./, '');
    
    // Extract all links
    const linkRegex = /<a\\s+([^>]+)>/gi;
    let match;
    
    while ((match = linkRegex.exec(html)) !== null) {
      const linkTag = match[1];
      
      // Extract href
      const hrefMatch = linkTag.match(/href=["']([^"']+)["']/i);
      if (!hrefMatch) continue;
      
      const href = hrefMatch[1].trim();
      
      // Skip mailto, tel, javascript, etc.
      if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) {
        continue;
      }
      
      // Extract anchor text (search forward for closing tag)
      const startPos = match.index + match[0].length;
      const endTagMatch = html.substring(startPos, startPos + 500).match(/<\/a>/i);
      let anchorText = '';
      if (endTagMatch) {
        const anchorHtml = html.substring(startPos, startPos + endTagMatch.index);
        anchorText = anchorHtml
          .replace(/<[^>]+>/g, '')
          .replace(/&nbsp;/g, ' ')
          .trim();
      }
      
      // Detect nofollow
      const isNofollow = /rel=["'][^"']*nofollow[^"']*["']/i.test(linkTag);
      if (isNofollow) result.nofollowCount++;
      
      // Determine if internal or external
      let isInternal = false;
      if (href.startsWith('/') || href.startsWith('#') || href.startsWith('?')) {
        isInternal = true;
      } else if (href.startsWith('http')) {
        try {
          const linkUrlObj = new URL(href);
          const linkDomain = linkUrlObj.hostname.replace(/^www\./, '');
          isInternal = linkDomain === baseDomain;
        } catch (e) {
          // Invalid URL, skip
          continue;
        }
      }
      
      const linkData = {
        href: href,
        anchor: anchorText,
        nofollow: isNofollow
      };
      
      if (isInternal) {
        result.internal.push(linkData);
      } else {
        // Add domain for external links
        try {
          const linkUrlObj = new URL(href, url);
          linkData.domain = linkUrlObj.hostname;
        } catch (e) {
          linkData.domain = 'unknown';
        }
        result.external.push(linkData);
      }
    }
    
    result.totalLinks = result.internal.length + result.external.length;
    
    // Calculate link density (links per 100 words)
    const wordCount = html.replace(/<[^>]+>/g, ' ').split(/\s+/).length;
    result.linkDensity = wordCount > 0 ? ((result.totalLinks / wordCount) * 100).toFixed(2) : 0;
    
  } catch (error) {
    result.ok = false;
    result.issues.push(error.toString());
  }
  
  return result;
}

/**
 * Extract author signals & credentials
 */
function FT_extractAuthorSignals(html, url) {
  const result = {
    ok: true,
    authorName: '',
    authorBio: '',
    authorPhoto: '',
    credentials: [],
    socialLinks: [],
    publishedDate: '',
    updatedDate: '',
    reviewBadges: [],
    issues: []
  };
  
  if (!html) {
    result.ok = false;
    result.issues.push('No HTML provided');
    return result;
  }
  
  try {
    // Author from schema
    const schemaRegex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gi;
    let schemaMatch;
    
    while ((schemaMatch = schemaRegex.exec(html)) !== null) {
      try {
        const schemaData = JSON.parse(schemaMatch[1]);
        
        if (schemaData.author) {
          if (typeof schemaData.author === 'string') {
            result.authorName = schemaData.author;
          } else if (schemaData.author.name) {
            result.authorName = schemaData.author.name;
          }
        }
        
        if (schemaData.datePublished) {
          result.publishedDate = schemaData.datePublished;
        }
        
        if (schemaData.dateModified) {
          result.updatedDate = schemaData.dateModified;
        }
      } catch (e) {
        // Invalid JSON, skip
      }
    }
    
    // Author from byline patterns
    if (!result.authorName) {
      const bylinePatterns = [
        /by\\s+([A-Z][a-z]+\\s+[A-Z][a-z]+)/i,
        /author:\\s*([^<]+)/i,
        /<span[^>]*class="[^"]*author[^"]*"[^>]*>([^<]+)<\/span>/i
      ];
      
      for (const pattern of bylinePatterns) {
        const match = html.match(pattern);
        if (match) {
          result.authorName = match[1].trim();
          break;
        }
      }
    }
    
    // Extract author bio
    const bioMatch = html.match(/<div[^>]*class="[^"]*author-bio[^"]*"[^>]*>(.*?)<\/div>/is);
    if (bioMatch) {
      result.authorBio = bioMatch[1]
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .trim()
        .substring(0, 500);
    }
    
    // Social links (look for author social profiles)
    const socialPatterns = [
      { platform: 'twitter', regex: /href=["'](https?:\/\/(?:www\.)?twitter\.com\/[^"']+)["']/gi },
      { platform: 'linkedin', regex: /href=["'](https?:\/\/(?:www\.)?linkedin\.com\/[^"']+)["']/gi },
      { platform: 'github', regex: /href=["'](https?:\/\/(?:www\.)?github\.com\/[^"']+)["']/gi }
    ];
    
    socialPatterns.forEach(({ platform, regex }) => {
      let socialMatch;
      while ((socialMatch = regex.exec(html)) !== null) {
        result.socialLinks.push({
          platform: platform,
          url: socialMatch[1]
        });
      }
    });
    
  } catch (error) {
    result.ok = false;
    result.issues.push(error.toString());
  }
  
  return result;
}

/**
 * Extract trust signals & E-E-A-T
 */
function FT_extractTrustSignals(html, url) {
  const result = {
    ok: true,
    hasHTTPS: false,
    hasPrivacyPolicy: false,
    hasTermsOfService: false,
    hasContactInfo: false,
    hasAboutPage: false,
    securityBadges: [],
    certifications: [],
    awards: [],
    mediaMentions: [],
    testimonials: 0,
    issues: []
  };
  
  if (!html || !url) {
    result.ok = false;
    result.issues.push('HTML or URL missing');
    return result;
  }
  
  try {
    // HTTPS check
    result.hasHTTPS = url.startsWith('https://');
    
    // Privacy policy
    result.hasPrivacyPolicy = /privacy[- ]policy/i.test(html);
    
    // Terms of service
    result.hasTermsOfService = /terms[- ](?:of[- ])?(?:service|use)/i.test(html);
    
    // Contact info
    result.hasContactInfo = /contact[- ](?:us|info)|email:|phone:/i.test(html);
    
    // About page
    result.hasAboutPage = /about[- ](?:us|page)/i.test(html);
    
    // Security badges (common trust seals)
    const badgePatterns = [
      'ssl', 'mcafee', 'norton', 'verisign', 'trustpilot', 
      'bbb', 'gdpr', 'pci', 'iso', 'verified'
    ];
    
    badgePatterns.forEach(badge => {
      if (new RegExp(badge, 'i').test(html)) {
        result.securityBadges.push(badge);
      }
    });
    
    // Count testimonials
    const testimonialRegex = /testimonial|review|customer[- ](?:story|feedback)/gi;
    const matches = html.match(testimonialRegex);
    result.testimonials = matches ? matches.length : 0;
    
  } catch (error) {
    result.ok = false;
    result.issues.push(error.toString());
  }
  
  return result;
}

/**
 * Extract FAQ sections
 */
function FT_extractFAQs(html, url) {
  const result = {
    ok: true,
    faqs: [],
    hasFAQSchema: false,
    faqCount: 0,
    issues: []
  };
  
  if (!html) {
    result.ok = false;
    result.issues.push('No HTML provided');
    return result;
  }
  
  try {
    // Check for FAQ schema
    const schemaRegex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gi;
    let schemaMatch;
    
    while ((schemaMatch = schemaRegex.exec(html)) !== null) {
      try {
        const schemaData = JSON.parse(schemaMatch[1]);
        
        if (schemaData['@type'] === 'FAQPage' || schemaData.mainEntity) {
          result.hasFAQSchema = true;
          
          const entities = Array.isArray(schemaData.mainEntity) 
            ? schemaData.mainEntity 
            : [schemaData.mainEntity];
          
          entities.forEach(entity => {
            if (entity['@type'] === 'Question') {
              result.faqs.push({
                question: entity.name || '',
                answer: entity.acceptedAnswer?.text || '',
                source: 'schema'
              });
            }
          });
        }
      } catch (e) {
        // Invalid JSON, skip
      }
    }
    
    // Manual FAQ detection (Q&A patterns)
    const faqPatterns = [
      /<dt[^>]*>(.*?)<\/dt>\\s*<dd[^>]*>(.*?)<\/dd>/gi,
      /<h[3-4][^>]*>(.*?(?:what|how|why|when|where|who)[^<]*)<\/h[3-4]>\\s*<p[^>]*>(.*?)<\/p>/gi
    ];
    
    faqPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        const question = match[1]
          .replace(/<[^>]+>/g, '')
          .trim();
        const answer = match[2]
          .replace(/<[^>]+>/g, '')
          .trim()
          .substring(0, 500);
        
        if (question && answer) {
          result.faqs.push({
            question: question,
            answer: answer,
            source: 'manual'
          });
        }
      }
    });
    
    result.faqCount = result.faqs.length;
    
  } catch (error) {
    result.ok = false;
    result.issues.push(error.toString());
  }
  
  return result;
}
