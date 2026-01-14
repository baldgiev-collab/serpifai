# V6 Forensic Engine - Complete Data Structure

## 📊 **What Data is Captured**

### **✅ NOW AVAILABLE IN V6**

#### **1. METADATA (All Meta Tags)**
```javascript
forensics.market_intel.meta_tags = {
  // Basic Meta
  title: "Ahrefs - SEO Tools & Resources",
  description: "Everything you need to rank higher & get more traffic",
  keywords: "seo, backlinks, keyword research",
  author: "Ahrefs Team",
  robots: "index, follow",
  canonical: "https://ahrefs.com",
  
  // Open Graph
  ogTitle: "Ahrefs - SEO Tools",
  ogDescription: "All-in-one SEO toolset",
  ogImage: "https://ahrefs.com/og-image.jpg",
  ogType: "website",
  
  // Twitter Card
  twitterCard: "summary_large_image",
  twitterTitle: "Ahrefs - SEO Tools",
  twitterDescription: "All-in-one SEO toolset",
  twitterImage: "https://ahrefs.com/twitter-image.jpg"
}
```

#### **2. INTRO PARAGRAPHS (First 3 Paragraphs)**
```javascript
forensics.market_intel.intro_paragraphs = [
  "Sign up Make your business discoverable—in search, AI, and beyond...",
  "See what people want, fix what holds you back, ship what wins...",
  "Marketers at 44% of the Fortune 500 use Ahrefs to stay ahead..."
]
```

#### **3. FULL HEADING HIERARCHY (All Headings with Text)**
```javascript
forensics.structure.headings = [
  { level: "h1", text: "SEO Tools & Software", position: 1 },
  { level: "h2", text: "Keyword Research", position: 2 },
  { level: "h3", text: "Find the right keywords", position: 3 },
  { level: "h3", text: "Analyze search volume", position: 4 },
  { level: "h2", text: "Backlink Analysis", position: 5 },
  { level: "h3", text: "Track your backlink profile", position: 6 }
  // ... all headings on page
]
```

#### **4. TOP KEYWORDS FROM HEADINGS**
```javascript
forensics.structure.top_keywords = [
  { keyword: "seo", count: 12 },
  { keyword: "keyword", count: 8 },
  { keyword: "backlink", count: 7 },
  { keyword: "research", count: 6 },
  { keyword: "analysis", count: 5 },
  { keyword: "traffic", count: 4 },
  { keyword: "tools", count: 4 },
  { keyword: "content", count: 3 },
  { keyword: "ranking", count: 3 },
  { keyword: "organic", count: 2 }
]
```

#### **5. HEADING COUNTS & HIERARCHY VALIDATION**
```javascript
forensics.structure = {
  h1_count: 1,
  h2_count: 15,
  h3_count: 32,
  total_headings: 54,
  hierarchy_valid: true, // true if 1 H1 and H2s present
  keyword_density: { seo: 12, keyword: 8, backlink: 7, ... }
}
```

#### **6. BRAND NARRATIVE TEXT (First 1500 chars)**
```javascript
forensics.market_intel.brand_text = "Sign upMake your business discoverable—in search, AI, and beyond See what people want, fix what holds you back, ship what wins, and track your growth—that's what a marketing platform should do..."
```

---

## 📦 **How to Access This Data**

### **Option 1: Direct from Storage (Full Data)**
```javascript
// Get complete raw data + AI insights
var fullData = STORAGE_readCompetitorJSON('ahrefs.com', 'project-id', spreadsheetId);

// Access metadata
var title = fullData.rawData.fetcher.market_intel.meta_tags.title;
var description = fullData.rawData.fetcher.market_intel.meta_tags.description;
var keywords = fullData.rawData.fetcher.market_intel.meta_tags.keywords;

// Access intro content
var introParagraphs = fullData.rawData.fetcher.market_intel.intro_paragraphs;
var firstParagraph = introParagraphs[0];

// Access headings
var allHeadings = fullData.rawData.fetcher.structure.headings;
var h1Text = allHeadings.find(h => h.level === 'h1').text;

// Access top keywords
var topKeywords = fullData.rawData.fetcher.structure.top_keywords;
var mostUsedKeyword = topKeywords[0].keyword; // "seo"
```

### **Option 2: From UI-Ready Data (Lightweight)**
```javascript
// Get filtered UI data (smaller payload)
var uiData = STORAGE_getUIReadyData('project-id', spreadsheetId);
var competitor = uiData.competitors[0];

// Access metadata
var title = competitor.metrics.title;
var description = competitor.metrics.description;
var keywords = competitor.metrics.keywords;

// Access Open Graph
var ogTitle = competitor.metrics.ogTitle;
var ogImage = competitor.metrics.ogImage;

// Access intro content
var introParagraphs = competitor.metrics.introParagraphs;

// Access headings
var allHeadings = competitor.metrics.headings;
var h1Count = competitor.metrics.h1Count;
var h2Count = competitor.metrics.h2Count;

// Access keywords
var topKeywords = competitor.metrics.topKeywords;
```

### **Option 3: Pass to Gemini AI (for Analysis)**
```javascript
// Gemini automatically receives this data in WORKFLOW_analyzeCompetitors()
// You can customize the prompt to focus on specific aspects:

var competitorsForAI = [
  {
    domain: "ahrefs.com",
    
    // Metadata
    title: metaTags.title,
    description: metaTags.description,
    keywords: metaTags.keywords,
    
    // Content
    introParagraphs: introParagraphs,
    headings: allHeadings,
    topKeywords: topKeywords,
    
    // Forensic Metrics
    humanityScore: 82,
    uniquenessScore: 78,
    cms: "WordPress"
  }
];

// Send to Gemini for analysis
var aiPrompt = buildCompetitorAnalysisPrompt_(competitorsForAI, projectContext);
var geminiResult = AI_geminiGenerate('gemini-2.0-flash', aiPrompt);
```

---

## 🎯 **Complete Data Flow**

```
1. COLLECTION (Fetcher)
   ↓
   forensics = {
     market_intel: { meta_tags, intro_paragraphs, brand_text },
     structure: { headings, top_keywords, h1_count, ... }
   }

2. STORAGE (Google Sheets - Column B)
   ↓
   RawDataJSON = JSON.stringify(forensics)

3. GEMINI ANALYSIS (AI Processing)
   ↓
   Extract forensics → Build prompt → Generate insights

4. UI RENDERING (Frontend)
   ↓
   Parse forensics.structure.headings
   Display forensics.market_intel.meta_tags.title
   Show forensics.structure.top_keywords
```

---

## 📋 **Available in UI Data Structure**

```javascript
{
  domain: "ahrefs.com",
  url: "https://ahrefs.com",
  lastUpdated: "2025-11-21T00:01:44Z",
  completeness: 72,
  
  metrics: {
    // Core KPIs
    authority: 67.6,
    performance: 65,
    
    // METADATA (FULL)
    title: "Ahrefs - SEO Tools & Resources",
    description: "Everything you need to rank higher & get more traffic",
    keywords: "seo, backlinks, keyword research",
    ogTitle: "Ahrefs - SEO Tools",
    ogDescription: "All-in-one SEO toolset",
    ogImage: "https://ahrefs.com/og-image.jpg",
    
    // INTRO CONTENT
    introParagraphs: [
      "Sign up Make your business discoverable...",
      "See what people want, fix what holds you back...",
      "Marketers at 44% of the Fortune 500..."
    ],
    
    // HEADINGS (FULL HIERARCHY)
    h1Count: 1,
    h2Count: 15,
    h3Count: 32,
    totalHeadings: 54,
    headings: [
      { level: "h1", text: "SEO Tools & Software", position: 1 },
      { level: "h2", text: "Keyword Research", position: 2 },
      { level: "h3", text: "Find the right keywords", position: 3 }
      // ... all headings
    ],
    
    // KEYWORDS (TOP 10)
    topKeywords: [
      { keyword: "seo", count: 12 },
      { keyword: "keyword", count: 8 },
      { keyword: "backlink", count: 7 }
      // ... top 10
    ],
    
    // FORENSIC METRICS
    cms: "WordPress",
    humanityScore: 82,
    uniquenessScore: 78,
    frictionLevel: "Medium"
  }
}
```

---

## 🚀 **Next Steps**

1. **Copy updated files to Apps Script**:
   - `fetcher/forensic_extractors.gs` (enhanced metadata + headings)
   - `fetcher/seo_snapshot.gs` (enhanced forensic mapping)
   - `databridge/storage/unified_competitor_storage.gs` (enhanced UI data)

2. **Deploy Fetcher as "New version"**

3. **Run test**: `RUN_ALL_TESTS()` in DataBridge

4. **Expected output**:
   ```
   ✅ Forensic scan complete
   🎯 Humanity Score: 82
   🏢 CMS Detected: WordPress
   📊 Headings: 54 total (1 H1, 15 H2, 32 H3)
   🔑 Top Keywords: seo (12), keyword (8), backlink (7)
   📝 Intro Paragraphs: 3
   📋 Metadata: Full (title, description, keywords, OG, Twitter)
   ```

5. **Use in UI**:
   ```javascript
   // Display competitor headings
   competitor.metrics.headings.forEach(h => {
     console.log(`${h.level.toUpperCase()}: ${h.text}`);
   });
   
   // Display top keywords
   competitor.metrics.topKeywords.forEach(kw => {
     console.log(`"${kw.keyword}" appears ${kw.count} times`);
   });
   
   // Display intro content
   competitor.metrics.introParagraphs.forEach((p, i) => {
     console.log(`Paragraph ${i + 1}: ${p}`);
   });
   ```

---

## ✅ **What's Enhanced**

| Data Type | Before V6 | After V6 Enhanced |
|-----------|-----------|-------------------|
| **Metadata** | Title + Description only | **ALL meta tags** (title, description, keywords, OG, Twitter) |
| **Intro** | First paragraph only | **First 3 paragraphs** |
| **Headings** | H1/H2/H3 counts only | **Full hierarchy** with text + keywords |
| **Keywords** | Keyword density object | **Top 10 keywords** with counts (sorted) |
| **Availability** | Raw JSON only | **Both raw + UI-optimized** |

**All data is JSON-ready and available for Gemini analysis + UI rendering!** 🎯
