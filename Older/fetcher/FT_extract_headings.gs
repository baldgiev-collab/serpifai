/**
 * Extract all heading tags (H1-H6) from HTML
 * @param {string} html - HTML content
 * @return {object} Headings object with arrays for each level
 */
function FET_extractHeadings(html) {
  if (!html || typeof html !== 'string') {
    return { ok: false, error: 'HTML content is required' };
  }
  
  var headings = { h1: [], h2: [], h3: [], h4: [], h5: [], h6: [] };
  
  // Remove script and style tags to avoid extracting code/css
  var cleanHtml = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Extract H1-H6
  for (var i = 1; i <= 6; i++) {
    var regex = new RegExp('<h' + i + '[^>]*>([\\s\\S]*?)<\\/h' + i + '>', 'gi');
    var matches;
    
    while ((matches = regex.exec(cleanHtml)) !== null) {
      // Strip HTML tags from heading content
      var text = matches[1].replace(/<[^>]+>/g, '').trim();
      if (text && text.length > 0) {
        headings['h' + i].push(text);
      }
    }
  }
  
  var totalHeadings = headings.h1.length + headings.h2.length + headings.h3.length + 
                      headings.h4.length + headings.h5.length + headings.h6.length;
  
  return {
    ok: true,
    h1: headings.h1,
    h2: headings.h2,
    h3: headings.h3,
    h4: headings.h4,
    h5: headings.h5,
    h6: headings.h6,
    structure: {
      h1_count: headings.h1.length,
      h2_count: headings.h2.length,
      h3_count: headings.h3.length,
      h4_count: headings.h4.length,
      h5_count: headings.h5.length,
      h6_count: headings.h6.length,
      total: totalHeadings
    },
    validation: {
      hasH1: headings.h1.length > 0,
      multipleH1: headings.h1.length > 1,
      hasH2: headings.h2.length > 0,
      hierarchyValid: headings.h1.length === 1 && headings.h2.length > 0,
      averageH2Length: headings.h2.length > 0 ? 
        Math.round(headings.h2.reduce(function(sum, h) { return sum + h.length; }, 0) / headings.h2.length) : 0
    }
  };
}
