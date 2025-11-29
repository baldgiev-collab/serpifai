/**
 * Extract metadata from HTML
 * @param {string} html - HTML content
 * @return {object} Metadata object with title, description, keywords, etc.
 */
function FET_extractMetadata(html) {
  if (!html || typeof html !== 'string') {
    return { ok: false, error: 'HTML content is required' };
  }
  
  var meta = {};
  
  // Title
  var titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  meta.title = titleMatch ? titleMatch[1].trim() : '';
  
  // Meta description
  var descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
                  html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
  meta.description = descMatch ? descMatch[1].trim() : '';
  
  // Meta keywords
  var keywordsMatch = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']+)["']/i) ||
                      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']keywords["']/i);
  meta.keywords = keywordsMatch ? keywordsMatch[1].trim() : '';
  
  // Canonical URL
  var canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i) ||
                       html.match(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["']/i);
  meta.canonical = canonicalMatch ? canonicalMatch[1].trim() : '';
  
  // Robots meta
  var robotsMatch = html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']+)["']/i) ||
                    html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']robots["']/i);
  meta.robots = robotsMatch ? robotsMatch[1].trim() : 'index, follow';
  
  // Language
  var langMatch = html.match(/<html[^>]*lang=["']([^"']+)["']/i);
  meta.lang = langMatch ? langMatch[1].trim() : '';
  
  // Charset
  var charsetMatch = html.match(/<meta[^>]*charset=["']?([^"'\s>]+)/i);
  meta.charset = charsetMatch ? charsetMatch[1].trim() : 'UTF-8';
  
  // Author
  var authorMatch = html.match(/<meta[^>]*name=["']author["'][^>]*content=["']([^"']+)["']/i);
  meta.author = authorMatch ? authorMatch[1].trim() : '';
  
  // Viewport
  var viewportMatch = html.match(/<meta[^>]*name=["']viewport["'][^>]*content=["']([^"']+)["']/i);
  meta.viewport = viewportMatch ? viewportMatch[1].trim() : '';
  
  // Generator
  var generatorMatch = html.match(/<meta[^>]*name=["']generator["'][^>]*content=["']([^"']+)["']/i);
  meta.generator = generatorMatch ? generatorMatch[1].trim() : '';
  
  return {
    ok: true,
    ...meta,
    validation: {
      hasTitle: meta.title.length > 0,
      hasDescription: meta.description.length > 0,
      hasCanonical: meta.canonical.length > 0,
      titleLength: meta.title.length,
      descriptionLength: meta.description.length,
      titleOptimal: meta.title.length >= 30 && meta.title.length <= 60,
      descriptionOptimal: meta.description.length >= 120 && meta.description.length <= 160
    }
  };
}

