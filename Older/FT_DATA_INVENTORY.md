# FT Fetcher System - Complete Data Inventory

## Overview

The FT (Fetcher) system consists of **15 files** that work together to collect comprehensive data about your website and competitors. This document details ALL data points collected and how they map to the **15 UI tabs**.

---

## 📁 FT File Inventory

| File | Purpose | Lines |
|------|---------|-------|
| `FT_Config.gs` | Configuration system (rate limits, caching, security) | 329 |
| `FT_Compliance.gs` | Robots.txt, rate limiting, circuit breaker, GDPR | 621 |
| `FT_FetchSingle.gs` | Single URL fetcher with retry & caching | 630 |
| `FT_FetchMulti.gs` | Batch URL fetching with adaptive rate limiting | 521 |
| `FT_ParallelFetcher.gs` | True parallel fetching (90s vs 6 min) | 1386 |
| `FT_EliteCompetitorFetcher.gs` | 5-stage hybrid competitor fetching | 470 |
| `FT_CompetitorAPIFetcher.gs` | API-only competitor data (legal) | 422 |
| `FT_ExtractMetadata.gs` | Complete metadata extraction | 434 |
| `FT_ExtractSchema.gs` | Structured data analyzer | 472 |
| `FT_ExtractLinks.gs` | Link intelligence engine | 460 |
| `FT_ExtractImages.gs` | Image analysis engine | 446 |
| `FT_ForensicExtractors.gs` | AI detection, E-E-A-T, conversion | 783 |
| `FT_ExtractorsComprehensive.gs` | Headings, keywords, FAQs | 782 |
| `FT_FullSnapshot.gs` | Orchestrates all extractors | 558 |
| `FT_Router.gs` | Action router for all operations | 302 |

---

## 🔄 Data Collection Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FT_Router.gs                                       │
│                    (Routes all actions)                                      │
└────────────────────────────┬────────────────────────────────────────────────┘
                             │
        ┌────────────────────┴────────────────────┐
        │                                          │
        ▼                                          ▼
┌───────────────────┐                    ┌───────────────────┐
│ FT_ParallelFetcher│                    │ FT_FullSnapshot   │
│ (Competitors)     │                    │ (Your Site)       │
└────────┬──────────┘                    └────────┬──────────┘
         │                                        │
         ▼                                        ▼
┌────────────────────────────────────────────────────────────┐
│                    EXTERNAL APIs                           │
├────────────────┬─────────────────┬────────────────────────┤
│ PHP Gateway    │ PageSpeed API   │ Serper API            │
│ (HTML Content) │ (Performance)   │ (SERP Data)           │
├────────────────┼─────────────────┼────────────────────────┤
│ OpenPageRank   │ Gemini AI       │ (Future: More APIs)   │
│ (Authority)    │ (Fallback Data) │                       │
└────────────────┴─────────────────┴────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────┐
│                      EXTRACTORS                            │
├──────────────────┬──────────────────┬─────────────────────┤
│ FT_ExtractMeta   │ FT_ExtractSchema │ FT_ExtractLinks     │
│ FT_ExtractImages │ FT_Forensics     │ FT_Comprehensive    │
└──────────────────┴──────────────────┴─────────────────────┘
```

---

## 📊 Complete Data Points by Category

### 1. METADATA (FT_ExtractMetadata.gs)

| Data Point | Type | Description |
|------------|------|-------------|
| `title` | String | Page title |
| `description` | String | Meta description |
| `keywords` | String | Meta keywords |
| `author` | String | Author meta |
| `robots` | String | Robots meta (index, noindex, etc.) |
| `viewport` | String | Viewport meta |
| `generator` | String | CMS generator |
| `charset` | String | Character encoding |
| `language` | String | Page language |
| `canonical` | String | Canonical URL |

**Open Graph:**
| Data Point | Type | Description |
|------------|------|-------------|
| `og:title` | String | OG title |
| `og:description` | String | OG description |
| `og:image` | String | OG image URL |
| `og:image:width` | Number | Image width |
| `og:image:height` | Number | Image height |
| `og:url` | String | OG URL |
| `og:type` | String | Type (website, article) |
| `og:site_name` | String | Site name |
| `og:locale` | String | Locale |

**Twitter Cards:**
| Data Point | Type | Description |
|------------|------|-------------|
| `twitter:card` | String | Card type |
| `twitter:site` | String | @handle |
| `twitter:creator` | String | Author @handle |
| `twitter:title` | String | Title |
| `twitter:description` | String | Description |
| `twitter:image` | String | Image URL |

**Article Meta:**
| Data Point | Type | Description |
|------------|------|-------------|
| `article:published_time` | ISO Date | Publish date |
| `article:modified_time` | ISO Date | Modified date |
| `article:author` | String | Author |
| `article:section` | String | Section |
| `article:tag` | Array | Tags |

**Dublin Core:**
| Data Point | Type | Description |
|------------|------|-------------|
| `DC.title` | String | Title |
| `DC.creator` | String | Creator |
| `DC.subject` | String | Subject |
| `DC.description` | String | Description |
| `DC.publisher` | String | Publisher |
| `DC.date` | String | Date |

---

### 2. SCHEMA/STRUCTURED DATA (FT_ExtractSchema.gs)

| Data Point | Type | Description |
|------------|------|-------------|
| `count` | Number | Total schemas found |
| `jsonLdCount` | Number | JSON-LD schemas |
| `microdataCount` | Number | Microdata instances |
| `rdfaCount` | Number | RDFa instances |
| `schemas` | Array | Full schema objects |
| `types` | Array | Unique schema types |
| `errors` | Array | Parsing errors |
| `score` | Number | 0-100 completeness |
| `grade` | String | A/B/C/D/F grade |
| `recommendations` | Array | Improvements |

**Supported Schema Types:**
- Organization, LocalBusiness, Person
- Article, BlogPosting, NewsArticle
- Product, Offer, Review, AggregateRating
- BreadcrumbList, WebPage, WebSite
- Event, Recipe, HowTo, FAQ, Q&A
- Video, Image, AudioObject
- JobPosting, Course, Book

**Rich Results Eligibility:**
| Data Point | Type | Description |
|------------|------|-------------|
| `richResultsEligible.faq` | Boolean | FAQ rich results |
| `richResultsEligible.howTo` | Boolean | HowTo rich results |
| `richResultsEligible.product` | Boolean | Product rich results |
| `richResultsEligible.review` | Boolean | Review rich results |
| `richResultsEligible.article` | Boolean | Article rich results |
| `richResultsEligible.breadcrumb` | Boolean | Breadcrumb rich results |

---

### 3. LINKS (FT_ExtractLinks.gs)

**Summary:**
| Data Point | Type | Description |
|------------|------|-------------|
| `totalLinks` | Number | All links |
| `internalLinks` | Number | Same-domain links |
| `externalLinks` | Number | Other-domain links |
| `dofollowCount` | Number | Dofollow links |
| `nofollowCount` | Number | Nofollow links |
| `sponsoredCount` | Number | Sponsored links |
| `ugcCount` | Number | UGC links |
| `linkDensity` | Number | Links per 1000 words |

**Per Link:**
| Data Point | Type | Description |
|------------|------|-------------|
| `href` | String | Link URL |
| `anchor` | String | Anchor text |
| `anchorType` | String | branded/exact/partial/generic/naked/image/empty |
| `isNofollow` | Boolean | Nofollow? |
| `isSponsored` | Boolean | Sponsored? |
| `isUGC` | Boolean | UGC? |
| `target` | String | _blank, _self, etc. |
| `title` | String | Title attribute |
| `position` | Number | Position in document |

**Anchor Stats:**
| Data Point | Type | Description |
|------------|------|-------------|
| `branded` | Number | Brand name anchors |
| `exact` | Number | Exact match keyword |
| `partial` | Number | Partial match |
| `generic` | Number | Generic (click here) |
| `naked` | Number | Naked URL anchors |
| `image` | Number | Image links |
| `empty` | Number | Empty anchor texts |

---

### 4. IMAGES (FT_ExtractImages.gs)

**Stats:**
| Data Point | Type | Description |
|------------|------|-------------|
| `total` | Number | Total images |
| `withAlt` | Number | Has alt text |
| `withoutAlt` | Number | Missing alt |
| `emptyAlt` | Number | Decorative (alt='') |
| `lazyLoaded` | Number | Lazy-loaded |
| `responsive` | Number | Has srcset |

**Formats:**
| Data Point | Type | Description |
|------------|------|-------------|
| `webp` | Number | WebP (modern) |
| `avif` | Number | AVIF (modern) |
| `jpeg/jpg` | Number | JPEG images |
| `png` | Number | PNG images |
| `svg` | Number | SVG images |
| `gif` | Number | GIF images |

**Per Image:**
| Data Point | Type | Description |
|------------|------|-------------|
| `src` | String | Image URL |
| `alt` | String | Alt text |
| `altQuality` | String | good/fair/poor/missing |
| `width` | Number | Width in px |
| `height` | Number | Height in px |
| `format` | String | Image format |
| `loading` | String | eager/lazy |
| `isLazy` | Boolean | Lazy loading? |
| `hasResponsive` | Boolean | Has srcset? |
| `srcset` | String | Srcset values |
| `isDecorative` | Boolean | Empty alt? |
| `aspectRatio` | Number | Width/height |

**Metrics:**
| Data Point | Type | Description |
|------------|------|-------------|
| `altCoverage` | Number | % with alt text |
| `modernFormatUsage` | Number | % WebP/AVIF |
| `lazyLoadingUsage` | Number | % lazy loaded |
| `accessibilityScore` | Number | 0-100 score |

---

### 5. FORENSIC ANALYSIS (FT_ForensicExtractors.gs)

#### AI Detection

| Data Point | Type | Description |
|------------|------|-------------|
| `humanityScore` | Number | 0-100 (higher = more human) |
| `isLikelyAI` | Boolean | AI content suspected |
| `confidence` | String | high/medium/low |
| `sentenceVarianceCV` | Number | Sentence length variance |
| `aiPhrases` | Array | Common AI phrases found |
| `repetitivePatterns` | Boolean | Repetitive structure |
| `vocabularyDiversity` | Number | Unique word ratio |
| `humanIndicators` | Array | Signs of human writing |

#### E-E-A-T Signals

**Experience:**
| Data Point | Type | Description |
|------------|------|-------------|
| `firstPersonUsage` | Number | First-person pronoun count |
| `caseStudies` | Boolean | Case studies present |
| `examples` | Number | Example count |
| `screenshots` | Boolean | Screenshots detected |

**Expertise:**
| Data Point | Type | Description |
|------------|------|-------------|
| `authorPresent` | Boolean | Author info found |
| `authorName` | String | Author name |
| `authorBio` | Boolean | Bio present |
| `credentials` | Array | Credentials mentioned |
| `organizationSchema` | Boolean | Organization schema |
| `personSchema` | Boolean | Person schema |

**Authority:**
| Data Point | Type | Description |
|------------|------|-------------|
| `reviewsSchema` | Boolean | Review schema |
| `aggregateRating` | Object | Rating data |
| `testimonials` | Number | Testimonial count |
| `awards` | Array | Awards/certs |
| `trustBadges` | Number | Trust badge count |

**Trust:**
| Data Point | Type | Description |
|------------|------|-------------|
| `httpsSecure` | Boolean | HTTPS enabled |
| `privacyPolicy` | Boolean | Privacy policy linked |
| `termsOfService` | Boolean | Terms linked |
| `contactInfo` | Boolean | Contact present |
| `physicalAddress` | Boolean | Address found |
| `phoneNumber` | Boolean | Phone found |

#### Conversion Intelligence

| Data Point | Type | Description |
|------------|------|-------------|
| `frictionScore` | Number | 0-100 (higher = more friction) |
| `frictionLevel` | String | low/medium/high |
| `formCount` | Number | Forms on page |
| `totalFields` | Number | Total form fields |
| `pricingDetected` | Boolean | Pricing info found |
| `bookingDetected` | Boolean | Booking system |
| `trialDetected` | Boolean | Free trial offered |
| `purchaseDetected` | Boolean | Purchase/buy CTAs |
| `tripwireLinks` | Array | Low-commitment offers |
| `ctaCount` | Number | CTA count |
| `chatWidgetDetected` | Boolean | Live chat present |

#### Tech Stack

| Data Point | Type | Description |
|------------|------|-------------|
| `cms` | String | Detected CMS |
| `detectedTools` | Array | Analytics, pixels, tools |
| `xFrameOptions` | Boolean | X-Frame-Options |
| `xContentTypeOptions` | Boolean | X-Content-Type |
| `strictTransportSecurity` | Boolean | HSTS |
| `renderRisk` | Boolean | JS-heavy (React/Vue) |
| `indexability` | Boolean | Can be indexed |
| `robotsMeta` | String | Robots meta content |
| `canonicalPresent` | Boolean | Canonical tag |

---

### 6. KEYWORDS (FT_ForensicExtractors.gs + FT_ExtractorsComprehensive.gs)

| Data Point | Type | Description |
|------------|------|-------------|
| `topKeywords` | Array | Top 50 weighted keywords |
| `primaryKeywords` | Array | Top 10 single keywords |
| `secondaryKeywords` | Array | Supporting keywords |
| `longTailKeywords` | Array | 2-4 word phrases |
| `semanticKeywords` | Array | Related/LSI keywords |
| `keywordDensity` | Object | Density by keyword |
| `topicClusters` | Array | Grouped related keywords |

**Per Keyword:**
| Data Point | Type | Description |
|------------|------|-------------|
| `keyword` | String | The keyword |
| `count` | Number | Weighted frequency |
| `sources` | Array | Where found (headings, meta, body, links, images) |

---

### 7. COMPETITOR DATA (FT_ParallelFetcher.gs + FT_EliteCompetitorFetcher.gs)

**5-Stage Data Collection:**

| Stage | API | Data Collected |
|-------|-----|----------------|
| 1 | PHP Fetcher | Full HTML, Metadata, Links, Images, Schema, Forensics |
| 2 | (Skipped) | Uses Serper instead of Custom Search |
| 3 | PageSpeed | Performance, Accessibility, SEO, Best Practices scores |
| 4 | Serper | SERP rankings, organic results |
| 5 | OpenPageRank | Domain authority, page rank |

**PageSpeed Metrics:**
| Data Point | Type | Description |
|------------|------|-------------|
| `performanceScore` | Number | 0-100 |
| `accessibilityScore` | Number | 0-100 |
| `seoScore` | Number | 0-100 |
| `bestPracticesScore` | Number | 0-100 |
| `fcp` | Number | First Contentful Paint (ms) |
| `lcp` | Number | Largest Contentful Paint (ms) |
| `tbt` | Number | Total Blocking Time (ms) |
| `cls` | Number | Cumulative Layout Shift |
| `speedIndex` | Number | Speed Index (ms) |

**Serper Results:**
| Data Point | Type | Description |
|------------|------|-------------|
| `organic` | Array | Organic search results |
| `organicCount` | Number | Indexed pages found |
| `answerBox` | Object | Featured snippet |
| `knowledgeGraph` | Object | Knowledge graph |
| `relatedSearches` | Array | Related searches* |
| `peopleAlsoAsk` | Array | PAA questions* |

> *Note: Related Searches and PAA only returned for keyword queries, NOT for `site:domain` queries

**OpenPageRank:**
| Data Point | Type | Description |
|------------|------|-------------|
| `rank` | Number | OpenPageRank score |
| `domainAuthority` | Number | Estimated DA |

---

## 🎯 Data to Tab Mapping

### Tab 1: SEO Overview
**Sources:** `FT_FullSnapshot`, `FT_ExtractMetadata`
- `overallScore` → Main score display
- `metadata.title` → Title analysis
- `metadata.description` → Description analysis
- `metadata.canonical` → Canonical URL
- `scoreBreakdown` → Score breakdown cards

### Tab 2: Competitor Intelligence
**Sources:** `FT_ParallelFetcher`, `FT_EliteCompetitorFetcher`
- `stages.phpFetcher` → Full competitor data
- `stages.pageSpeed` → Performance comparison
- `stages.serper` → SERP visibility
- `stages.openPageRank` → Authority comparison

### Tab 3: Keyword Strategy
**Sources:** `FT_ForensicExtractors`, `FT_ExtractorsComprehensive`, `Gemini AI`
- `topKeywords` → Primary keywords table
- `longTailPhrases` → Long-tail opportunities
- `topicClusters` → Topic clusters
- `semanticKeywords` → LSI keywords
- `Gemini fallback` → Estimated metrics when Serper empty

### Tab 4: Content Strategy
**Sources:** `FT_ForensicExtractors`, `FT_ExtractorsComprehensive`
- `headingsHierarchy` → Heading structure
- `introCopy` → Content introduction
- `narrative.brandNarrative` → Brand messaging
- `faqs` → FAQ content opportunities

### Tab 5: Technical SEO
**Sources:** `FT_ParallelFetcher`, `FT_ForensicExtractors`, `FT_ExtractMetadata`
- `pageSpeed` → Core Web Vitals
- `techStack` → CMS, tools, security
- `metadata.robots` → Indexability
- `securityHeaders` → Security analysis

### Tab 6: E-E-A-T
**Sources:** `FT_ForensicExtractors`, `FT_ExtractorsComprehensive`
- `eeat.experienceSignals` → Experience indicators
- `eeat.expertiseSignals` → Expertise indicators
- `eeat.authoritySignals` → Authority indicators
- `eeat.trustSignals` → Trust indicators

### Tab 7: AI Detection
**Sources:** `FT_ForensicExtractors`
- `aiFootprint.humanityScore` → Main AI score
- `aiFootprint.isLikelyAI` → AI detection flag
- `aiFootprint.indicators` → Detailed AI indicators

### Tab 8: Schema & Structured Data
**Sources:** `FT_ExtractSchema`
- `schemas` → All structured data
- `types` → Schema types found
- `validation` → Validation results
- `richResultsEligible` → Rich results eligibility

### Tab 9: Internal Linking
**Sources:** `FT_ExtractLinks`, `FT_ExtractorsComprehensive`
- `internalLinks` → All internal links
- `anchorStats` → Anchor text analysis
- `linkEquityFlow` → Link value distribution

### Tab 10: External Links
**Sources:** `FT_ExtractLinks`
- `externalLinks` → All external links
- `topLinkedDomains` → Most linked domains
- `nofollowCount/dofollowCount` → Link types

### Tab 11: Authority & Backlinks
**Sources:** `FT_ParallelFetcher`, `FT_FullSnapshot`
- `openPageRank.rank` → Domain rank
- `domainAuthority` → DA estimate
- `backlinks` → Backlink data

### Tab 12: Images & Media
**Sources:** `FT_ExtractImages`
- `images` → All images with details
- `stats` → Image statistics
- `formats` → Format breakdown
- `accessibilityScore` → Accessibility

### Tab 13: SERP Features
**Sources:** `FT_ParallelFetcher`, `FT_ExtractSchema`
- `serper.organic` → Organic rankings
- `serper.answerBox` → Featured snippet
- `richResultsEligible` → Rich result eligibility

### Tab 14: Conversion
**Sources:** `FT_ForensicExtractors`
- `conversionIntel.frictionScore` → Friction analysis
- `conversionIntel.formCount` → Form analysis
- `conversionIntel.ctaCount` → CTA analysis

### Tab 15: Social & Metadata
**Sources:** `FT_ExtractMetadata`
- `openGraph` → Open Graph tags
- `twitter` → Twitter Card tags
- `socialReadiness` → Social meta score

---

## 🔧 Using the Diagnostic System

### Run Diagnostics

```javascript
// Print complete inventory to Logger
DIAG_printInventory();

// Print tab mapping only
DIAG_printTabMapping();

// Test diagnostics with sample data
DIAG_runTest();

// Analyze actual collected data
var report = DIAG_analyzeCollectedData(analysisData);

// Log diagnostics to a sheet
DIAG_logToSheet(analysisData);
```

### Understanding the Report

The diagnostic report shows:
- **Total Data Points**: All fields checked
- **Populated Fields**: Fields with actual data
- **Empty Fields**: Missing or empty fields
- **Coverage Percent**: Overall data completeness

### Recommendations

The system provides recommendations for:
- Empty critical fields (title, description, humanityScore, schemas)
- Data sources that need checking
- Fields that should be populated but aren't

---

## 🚀 Performance Notes

| Operation | Before Parallel | After Parallel |
|-----------|-----------------|----------------|
| 6 Competitors | 4-6 minutes | ~90 seconds |
| API Calls | Sequential | All at once |
| Efficiency | 20-30% | 80-90% |

The `FT_ParallelFetcher.gs` uses `UrlFetchApp.fetchAll()` to make ALL API requests simultaneously, dramatically reducing execution time.

---

## 📝 Important Notes

1. **Serper API Limitation**: When called with `site:domain.com`, Serper only returns organic results, NOT People Also Ask or Related Searches. Those require keyword-based queries.

2. **Gemini Fallback**: The Keyword Strategy Tab uses Gemini AI to generate estimated data when Serper returns empty for certain fields.

3. **Data Caching**: Results are cached to improve performance and reduce API calls. Default TTL is 1 hour.

4. **Rate Limiting**: The system respects rate limits and implements circuit breakers to prevent API abuse.

5. **Compliance**: All fetching respects robots.txt, GDPR, and Google TOS.
