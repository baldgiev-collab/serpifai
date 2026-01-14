/**
 * Extract Open Graph metadata from HTML
 * @param {string} html - HTML content
 * @return {object} Open Graph data
 */
function FET_extractOpenGraph(html) {
  if (!html || typeof html !== 'string') {
    return { ok: false, error: 'HTML content is required' };
  }
  
  var og = {};
  
  // Helper function to extract OG meta tags
  function extractOG(property) {
    var match = html.match(new RegExp('<meta[^>]*property=["\']\s*' + property + '\s*["\'][^>]*content=["\']\s*([^"\']+)\s*["\']/i')) ||
                html.match(new RegExp('<meta[^>]*content=["\']\s*([^"\']+)\s*["\'][^>]*property=["\']\s*' + property + '\s*["\']/i'));
    return match ? match[1].trim() : '';
  }
  
  // Basic OG tags
  og.title = extractOG('og:title');
  og.description = extractOG('og:description');
  og.image = extractOG('og:image');
  og.url = extractOG('og:url');
  og.type = extractOG('og:type');
  og.siteName = extractOG('og:site_name');
  og.locale = extractOG('og:locale');
  
  // Twitter Card tags
  og.twitterCard = extractOG('twitter:card');
  og.twitterSite = extractOG('twitter:site');
  og.twitterCreator = extractOG('twitter:creator');
  og.twitterTitle = extractOG('twitter:title');
  og.twitterDescription = extractOG('twitter:description');
  og.twitterImage = extractOG('twitter:image');
  
  // Article-specific tags
  og.articlePublishedTime = extractOG('article:published_time');
  og.articleModifiedTime = extractOG('article:modified_time');
  og.articleAuthor = extractOG('article:author');
  og.articleSection = extractOG('article:section');
  
  // Image details
  og.imageWidth = extractOG('og:image:width');
  og.imageHeight = extractOG('og:image:height');
  og.imageAlt = extractOG('og:image:alt');
  
  return {
    ok: true,
    ...og,
    validation: {
      hasOGTitle: og.title.length > 0,
      hasOGDescription: og.description.length > 0,
      hasOGImage: og.image.length > 0,
      hasOGUrl: og.url.length > 0,
      hasTwitterCard: og.twitterCard.length > 0,
      isArticle: og.type === 'article',
      ogComplete: og.title.length > 0 && og.description.length > 0 && og.image.length > 0 && og.url.length > 0
    }
  };
}
