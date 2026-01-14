/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DIAG_FT_DataInventory.gs - FT FETCHER DATA DIAGNOSTIC CENTER
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * SerpifAI v6 Elite - Complete Data Collection Inventory & Diagnostics
 * 
 * PURPOSE:
 * 1. Documents ALL data collected by FT_*.gs files
 * 2. Records actual data gathered during competitor analysis
 * 3. Provides diagnostic views of collected data
 * 4. Maps data availability to 15 UI tabs
 * 
 * @version 1.0.0
 * @author SerpifAI Elite System
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SECTION 1: COMPLETE FT FILE DATA INVENTORY
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Returns complete inventory of all data collected by FT_*.gs files
 * Use this to understand what data is available for each UI tab
 */
function DIAG_getCompleteDataInventory() {
  return {
    
    // ═══════════════════════════════════════════════════════════════════════
    // FT_Config.gs - Configuration System
    // ═══════════════════════════════════════════════════════════════════════
    FT_Config: {
      description: "Elite configuration management for the fetcher system",
      data: {
        circuitBreaker: {
          maxFailures: "Number - failures before circuit opens (default: 5)",
          cooldownMinutes: "Number - cooldown period (default: 30)",
          adaptiveThrottling: "Boolean - learn from server responses",
          exponentialBackoff: "Boolean - exponential retry delays",
          maxRetries: "Number - max retry attempts (default: 3)"
        },
        userAgents: "Array - rotating user agents for compliance",
        rateLimits: {
          defaultDelayMs: "Number - min delay between requests (100ms)",
          burstLimit: "Number - max requests in burst (10)",
          respectCrawlDelay: "Boolean - honor robots.txt crawl-delay",
          maxConcurrent: "Number - max parallel requests (5)"
        },
        timeouts: {
          fetchTimeoutSeconds: "Number - max fetch time (30s)",
          parseTimeoutSeconds: "Number - max parse time (15s)",
          totalTimeoutSeconds: "Number - total operation timeout (60s)"
        },
        cache: {
          enabled: "Boolean - caching enabled",
          ttlSeconds: "Number - cache time-to-live (3600s)",
          useEtag: "Boolean - ETag validation",
          useLastModified: "Boolean - Last-Modified header support"
        },
        security: {
          validateHttpsCertificates: "Boolean - HTTPS validation (true)",
          preventSSRF: "Boolean - prevent SSRF attacks (true)",
          blacklistedDomains: "Array - blocked domains (localhost, private IPs)"
        },
        compliance: {
          respectRobotsTxt: "Boolean - honor robots.txt",
          dataRetentionDays: "Number - GDPR data retention (90 days)"
        }
      },
      usedByTabs: ["All - Provides configuration for all fetching operations"]
    },
    
    // ═══════════════════════════════════════════════════════════════════════
    // FT_Compliance.gs - Legal & Compliance Engine
    // ═══════════════════════════════════════════════════════════════════════
    FT_Compliance: {
      description: "Robots.txt parsing, rate limiting, circuit breaker, GDPR compliance",
      data: {
        robotsCheck: {
          allowed: "Boolean - URL allowed by robots.txt",
          crawlDelay: "Number - crawl-delay value in seconds",
          reason: "String - explanation of allow/disallow",
          rules: {
            disallow: "Array - disallowed paths",
            allow: "Array - explicitly allowed paths"
          }
        },
        circuitBreaker: {
          isOpen: "Boolean - circuit breaker status",
          failures: "Number - current failure count",
          lastFailure: "ISO Date - last failure timestamp",
          cooldownRemaining: "Number - seconds until retry allowed"
        },
        rateLimit: {
          isLimited: "Boolean - currently rate-limited",
          retryAfter: "Number - seconds until retry",
          requestsInWindow: "Number - requests in current window"
        }
      },
      usedByTabs: ["Diagnostics Tab (if exists)", "Backend monitoring"]
    },
    
    // ═══════════════════════════════════════════════════════════════════════
    // FT_FetchSingle.gs - Single URL Fetcher
    // ═══════════════════════════════════════════════════════════════════════
    FT_FetchSingle: {
      description: "Elite single URL fetch with retry, caching, security validation",
      data: {
        fetchResult: {
          ok: "Boolean - fetch successful",
          url: "String - fetched URL",
          content: "String - full HTML content",
          contentType: "String - MIME type (text/html, etc.)",
          status: "Number - HTTP status code (200, 404, etc.)",
          headers: {
            contentType: "String - Content-Type header",
            server: "String - Server header",
            xRobotsTag: "String - X-Robots-Tag if present",
            strictTransportSecurity: "String - HSTS header",
            cacheControl: "String - Cache-Control header",
            etag: "String - ETag for caching",
            lastModified: "String - Last-Modified header"
          },
          contentLength: "Number - content size in bytes",
          executionTime: "Number - fetch time in ms",
          cached: "Boolean - served from cache",
          redirects: "Array - redirect chain if any",
          finalUrl: "String - final URL after redirects"
        }
      },
      usedByTabs: ["All tabs - Core fetcher for getting page content"]
    },
    
    // ═══════════════════════════════════════════════════════════════════════
    // FT_FetchMulti.gs - Multi-URL Batch Fetcher
    // ═══════════════════════════════════════════════════════════════════════
    FT_FetchMulti: {
      description: "Batch URL fetching with adaptive rate limiting and parallel processing",
      data: {
        batchResult: {
          ok: "Boolean - all fetches successful",
          total: "Number - total URLs requested",
          successful: "Number - successful fetches",
          failed: "Number - failed fetches",
          results: "Array - successful fetch results",
          errors: "Array - failed fetch details",
          skipped: "Array - URLs skipped due to timeout",
          domainStats: {
            perDomain: {
              total: "Number - requests to domain",
              successful: "Number - successful",
              failed: "Number - failed",
              avgResponseTime: "Number - average response time ms"
            }
          },
          executionTime: "Number - total batch time"
        }
      },
      usedByTabs: ["Competitor Analysis - fetching multiple competitor URLs"]
    },
    
    // ═══════════════════════════════════════════════════════════════════════
    // FT_ParallelFetcher.gs - Optimized Parallel Fetching
    // ═══════════════════════════════════════════════════════════════════════
    FT_ParallelFetcher: {
      description: "True parallel HTTP requests using UrlFetchApp.fetchAll()",
      performanceNote: "Reduces 4-6 min execution to ~90 seconds for 6 competitors",
      data: {
        parallelResult: {
          perCompetitor: {
            domain: "String - competitor domain",
            fetchSuccess: "Boolean - all data fetched",
            method: "String - 'parallel'",
            stages: {
              phpFetcher: {
                success: "Boolean",
                data: {
                  content: "String - full HTML",
                  metadata: "Object - extracted metadata",
                  links: "Object - link analysis",
                  images: "Object - image analysis",
                  schema: "Object - structured data",
                  forensics: "Object - forensic analysis"
                }
              },
              pageSpeed: {
                success: "Boolean",
                data: {
                  performanceScore: "Number - 0-100",
                  accessibilityScore: "Number - 0-100",
                  seoScore: "Number - 0-100",
                  bestPracticesScore: "Number - 0-100",
                  fcp: "Number - First Contentful Paint ms",
                  lcp: "Number - Largest Contentful Paint ms",
                  tbt: "Number - Total Blocking Time ms",
                  cls: "Number - Cumulative Layout Shift",
                  speedIndex: "Number - Speed Index ms"
                }
              },
              serper: {
                success: "Boolean",
                data: {
                  organic: "Array - organic search results",
                  answerBox: "Object - featured snippet if present",
                  knowledgeGraph: "Object - knowledge graph if present",
                  relatedSearches: "Array - related searches (keyword queries only)",
                  peopleAlsoAsk: "Array - PAA questions (keyword queries only)"
                }
              },
              openPageRank: {
                success: "Boolean",
                data: {
                  rank: "Number - OpenPageRank score",
                  domainAuthority: "Number - estimated DA"
                }
              }
            },
            synthesized: "Object - combined/processed data",
            fetchedAt: "ISO Date - timestamp"
          }
        }
      },
      usedByTabs: [
        "Competitor Intelligence Tab",
        "Technical SEO Tab (PageSpeed data)",
        "Authority Tab (OpenPageRank)",
        "SERP Analysis Tab (Serper data)"
      ]
    },
    
    // ═══════════════════════════════════════════════════════════════════════
    // FT_EliteCompetitorFetcher.gs - 5-Stage Hybrid Fetching
    // ═══════════════════════════════════════════════════════════════════════
    FT_EliteCompetitorFetcher: {
      description: "5-stage hybrid fetching strategy for comprehensive competitor data",
      stages: [
        "Stage 1: PHP Fetcher - Full HTML, Metadata, Links, Images, Schema, Forensics",
        "Stage 2: (Skipped - uses Serper instead of Custom Search)",
        "Stage 3: PageSpeed API - Core Web Vitals & Performance Scores",
        "Stage 4: Serper API - SERP Rankings & Organic Results",
        "Stage 5: OpenPageRank API - Domain Authority"
      ],
      data: {
        perCompetitor: {
          domain: "String - competitor domain",
          stage1_phpFetcher: {
            content: "String - full HTML content",
            contentLength: "Number - HTML size",
            metadata: "Object - SEO metadata",
            links: "Object - internal/external links",
            images: "Object - image analysis",
            schema: "Object - structured data",
            forensics: "Object - AI/EEAT/Conversion analysis"
          },
          stage3_pageSpeed: {
            performance: "Number - 0-100 score",
            accessibility: "Number - 0-100 score",
            seo: "Number - 0-100 score",
            bestPractices: "Number - 0-100 score",
            coreWebVitals: {
              FCP: "Number - First Contentful Paint",
              LCP: "Number - Largest Contentful Paint",
              TBT: "Number - Total Blocking Time",
              CLS: "Number - Cumulative Layout Shift",
              SI: "Number - Speed Index"
            }
          },
          stage4_serper: {
            organic: "Array - organic results for site:domain",
            organicCount: "Number - indexed pages found",
            estimatedTotalResults: "Number - total indexed pages"
          },
          stage5_openPageRank: {
            pageRank: "Number - OpenPageRank score",
            domainAuthority: "Number - estimated DA"
          }
        }
      },
      usedByTabs: [
        "Competitor Intelligence Tab",
        "Technical SEO Tab",
        "Authority & Backlinks Tab",
        "SERP Features Tab"
      ]
    },
    
    // ═══════════════════════════════════════════════════════════════════════
    // FT_CompetitorAPIFetcher.gs - API-Only Competitor Data
    // ═══════════════════════════════════════════════════════════════════════
    FT_CompetitorAPIFetcher: {
      description: "Legal API-only competitor data collection (no HTML scraping)",
      data: {
        apiData: {
          serperData: {
            organic: "Array - organic results",
            organicCount: "Number - result count",
            topPages: "Array - top ranking pages",
            titlePatterns: "Array - title structures found",
            metaDescriptionPatterns: "Array - meta patterns"
          },
          pageSpeedData: {
            scores: "Object - performance scores",
            diagnostics: "Array - improvement suggestions",
            opportunities: "Array - optimization opportunities"
          },
          openPageRankData: {
            rank: "Number - domain rank",
            rankChange: "Number - rank change"
          }
        }
      },
      usedByTabs: ["Competitor Intelligence Tab", "Technical SEO Tab"]
    },
    
    // ═══════════════════════════════════════════════════════════════════════
    // FT_ExtractMetadata.gs - Complete Metadata Extraction
    // ═══════════════════════════════════════════════════════════════════════
    FT_ExtractMetadata: {
      description: "Comprehensive metadata extraction including OG, Twitter, Dublin Core",
      data: {
        standard: {
          title: "String - page title",
          description: "String - meta description",
          keywords: "String - meta keywords (if present)",
          author: "String - author meta",
          robots: "String - robots meta (index, noindex, etc.)",
          viewport: "String - viewport meta",
          generator: "String - CMS generator",
          charset: "String - character encoding",
          language: "String - page language",
          canonical: "String - canonical URL"
        },
        openGraph: {
          title: "String - og:title",
          description: "String - og:description",
          image: "String - og:image URL",
          imageWidth: "Number - og:image:width",
          imageHeight: "Number - og:image:height",
          url: "String - og:url",
          type: "String - og:type (website, article, etc.)",
          siteName: "String - og:site_name",
          locale: "String - og:locale"
        },
        twitter: {
          card: "String - twitter:card (summary, summary_large_image)",
          site: "String - twitter:site (@handle)",
          creator: "String - twitter:creator (@author)",
          title: "String - twitter:title",
          description: "String - twitter:description",
          image: "String - twitter:image URL"
        },
        article: {
          publishedTime: "ISO Date - article:published_time",
          modifiedTime: "ISO Date - article:modified_time",
          author: "String - article:author",
          section: "String - article:section",
          tag: "Array - article:tag values"
        },
        dublinCore: {
          title: "String - DC.title",
          creator: "String - DC.creator",
          subject: "String - DC.subject",
          description: "String - DC.description",
          publisher: "String - DC.publisher",
          date: "String - DC.date"
        },
        scores: {
          metadataScore: "Number - 0-100 completeness score",
          socialReadiness: "Number - 0-100 social meta score",
          seoReadiness: "Number - 0-100 SEO meta score"
        }
      },
      usedByTabs: [
        "SEO Overview Tab (title, description, canonical)",
        "Social Media Tab (OG, Twitter)",
        "Content Strategy Tab (article metadata)",
        "Technical SEO Tab (robots, viewport, charset)"
      ]
    },
    
    // ═══════════════════════════════════════════════════════════════════════
    // FT_ExtractSchema.gs - Structured Data Analyzer
    // ═══════════════════════════════════════════════════════════════════════
    FT_ExtractSchema: {
      description: "Complete Schema.org extraction with validation and scoring",
      supportedTypes: [
        "Organization", "LocalBusiness", "Person",
        "Article", "BlogPosting", "NewsArticle",
        "Product", "Offer", "Review", "AggregateRating",
        "BreadcrumbList", "WebPage", "WebSite",
        "Event", "Recipe", "HowTo", "FAQ", "Q&A",
        "Video", "Image", "AudioObject",
        "JobPosting", "Course", "Book"
      ],
      data: {
        count: "Number - total schemas found",
        jsonLdCount: "Number - JSON-LD schemas",
        microdataCount: "Number - Microdata instances",
        rdfaCount: "Number - RDFa instances",
        schemas: "Array - full schema objects with data",
        types: "Array - unique schema types found",
        errors: "Array - parsing errors",
        validation: {
          isValid: "Boolean - all schemas valid",
          missingRequired: "Array - missing required properties",
          warnings: "Array - best practice warnings"
        },
        score: "Number - 0-100 schema completeness",
        grade: "String - A/B/C/D/F grade",
        breakdown: "Object - scoring breakdown",
        recommendations: "Array - improvement suggestions",
        richResultsEligible: {
          faq: "Boolean - eligible for FAQ rich results",
          howTo: "Boolean - eligible for HowTo rich results",
          product: "Boolean - eligible for Product rich results",
          review: "Boolean - eligible for Review rich results",
          article: "Boolean - eligible for Article rich results",
          breadcrumb: "Boolean - eligible for Breadcrumb rich results"
        }
      },
      usedByTabs: [
        "Schema & Structured Data Tab",
        "SERP Features Tab (rich results eligibility)",
        "Technical SEO Tab (schema validation)",
        "E-E-A-T Tab (Organization, Person schemas)"
      ]
    },
    
    // ═══════════════════════════════════════════════════════════════════════
    // FT_ExtractLinks.gs - Elite Link Analysis Engine
    // ═══════════════════════════════════════════════════════════════════════
    FT_ExtractLinks: {
      description: "Comprehensive link intelligence with anchor text analysis",
      data: {
        summary: {
          totalLinks: "Number - all links found",
          internalLinks: "Number - same-domain links",
          externalLinks: "Number - other-domain links",
          dofollowCount: "Number - dofollow links",
          nofollowCount: "Number - nofollow links",
          sponsoredCount: "Number - sponsored links",
          ugcCount: "Number - UGC links"
        },
        internalLinks: {
          perLink: {
            href: "String - link URL",
            anchor: "String - anchor text",
            anchorType: "String - branded/exact/partial/generic/naked/image/empty",
            isNofollow: "Boolean",
            isSponsored: "Boolean",
            isUGC: "Boolean",
            target: "String - _blank, _self, etc.",
            title: "String - link title attribute",
            position: "Number - position in document"
          }
        },
        externalLinks: {
          perLink: {
            href: "String - link URL",
            domain: "String - linked domain",
            anchor: "String - anchor text",
            isNofollow: "Boolean",
            isSponsored: "Boolean",
            position: "Number - position in document"
          }
        },
        anchorStats: {
          branded: "Number - brand name anchors",
          exact: "Number - exact match keyword anchors",
          partial: "Number - partial match anchors",
          generic: "Number - generic anchors (click here, etc.)",
          naked: "Number - naked URL anchors",
          image: "Number - image links (no text)",
          empty: "Number - empty anchor texts"
        },
        linkDensity: "Number - links per 1000 words",
        brokenLinkIndicators: "Array - potentially broken links",
        topLinkedDomains: "Array - most linked external domains"
      },
      usedByTabs: [
        "Internal Linking Tab",
        "External Links Tab",
        "Authority & Backlinks Tab",
        "Technical SEO Tab (link issues)"
      ]
    },
    
    // ═══════════════════════════════════════════════════════════════════════
    // FT_ExtractImages.gs - Elite Image Analysis Engine
    // ═══════════════════════════════════════════════════════════════════════
    FT_ExtractImages: {
      description: "Comprehensive image intelligence with accessibility scoring",
      data: {
        stats: {
          total: "Number - total images",
          withAlt: "Number - images with alt text",
          withoutAlt: "Number - images missing alt",
          emptyAlt: "Number - decorative images (alt='')",
          lazyLoaded: "Number - lazy-loaded images",
          responsive: "Number - images with srcset"
        },
        formats: {
          webp: "Number - WebP images (modern)",
          avif: "Number - AVIF images (modern)",
          jpeg: "Number - JPEG images",
          jpg: "Number - JPG images",
          png: "Number - PNG images",
          svg: "Number - SVG images",
          gif: "Number - GIF images"
        },
        images: {
          perImage: {
            position: "Number - position in document",
            src: "String - image URL",
            alt: "String - alt text (null if missing)",
            hasAlt: "Boolean - alt attribute present",
            altQuality: "String - good/fair/poor/missing",
            title: "String - title attribute",
            width: "Number - width in pixels",
            height: "Number - height in pixels",
            format: "String - image format",
            loading: "String - eager/lazy",
            isLazy: "Boolean - lazy loading enabled",
            hasResponsive: "Boolean - has srcset",
            srcset: "String - srcset values",
            sizes: "String - sizes attribute",
            isDecorative: "Boolean - decorative image (empty alt)",
            aspectRatio: "Number - width/height ratio"
          }
        },
        metrics: {
          altCoverage: "Number - % images with alt text",
          modernFormatUsage: "Number - % WebP/AVIF",
          lazyLoadingUsage: "Number - % lazy loaded",
          responsiveUsage: "Number - % responsive images"
        },
        accessibilityScore: "Number - 0-100 image accessibility"
      },
      usedByTabs: [
        "Images & Media Tab",
        "Accessibility Tab (alt text analysis)",
        "Technical SEO Tab (image optimization)",
        "Page Speed Tab (lazy loading, modern formats)"
      ]
    },
    
    // ═══════════════════════════════════════════════════════════════════════
    // FT_ForensicExtractors.gs - World-Class Forensic Analysis
    // ═══════════════════════════════════════════════════════════════════════
    FT_ForensicExtractors: {
      description: "Elite forensic analysis: AI detection, E-E-A-T, conversion intelligence",
      data: {
        narrative: {
          brandNarrative: "String - first 1500 chars of brand text",
          introText: "String - first 3 intro paragraphs",
          metaTags: "Object - title, description, keywords",
          aiToolsDetected: "Array - AI tools found in page",
          trustSignals: "Array - trust badges, certifications mentioned"
        },
        aiFootprint: {
          humanityScore: "Number - 0-100 (higher = more human)",
          isLikelyAI: "Boolean - AI-generated content suspected",
          confidence: "String - high/medium/low",
          indicators: {
            sentenceVarianceCV: "Number - sentence length variance (AI = low)",
            aiPhrases: "Array - common AI phrases detected",
            repetitivePatterns: "Boolean - repetitive structure detected",
            vocabularyDiversity: "Number - unique word ratio"
          },
          humanIndicators: "Array - signs of human writing"
        },
        eeat: {
          experienceSignals: {
            firstPersonUsage: "Number - first-person pronoun count",
            caseStudies: "Boolean - case studies present",
            examples: "Number - example count",
            screenshots: "Boolean - screenshots detected"
          },
          expertiseSignals: {
            authorPresent: "Boolean - author info found",
            authorName: "String - author name if found",
            authorBio: "Boolean - author bio present",
            credentials: "Array - credentials mentioned",
            organizationSchema: "Boolean - Organization schema present",
            personSchema: "Boolean - Person schema present"
          },
          authoritySignals: {
            reviewsSchema: "Boolean - Review schema present",
            aggregateRating: "Object - aggregate rating if found",
            testimonials: "Number - testimonial count",
            awards: "Array - awards/certifications mentioned",
            trustBadges: "Number - trust badge count"
          },
          trustSignals: {
            httpsSecure: "Boolean - HTTPS enabled",
            privacyPolicy: "Boolean - privacy policy linked",
            termsOfService: "Boolean - terms linked",
            contactInfo: "Boolean - contact information present",
            physicalAddress: "Boolean - address found",
            phoneNumber: "Boolean - phone number found"
          },
          overallEEATScore: "Number - 0-100 E-E-A-T score"
        },
        conversionIntel: {
          frictionScore: "Number - 0-100 (higher = more friction)",
          frictionLevel: "String - low/medium/high",
          formCount: "Number - forms on page",
          totalFields: "Number - total form fields",
          pricingDetected: "Boolean - pricing info found",
          bookingDetected: "Boolean - booking system found",
          trialDetected: "Boolean - free trial offered",
          purchaseDetected: "Boolean - purchase/buy CTAs",
          tripwireLinks: "Array - low-commitment offers found",
          ctaCount: "Number - call-to-action count",
          chatWidgetDetected: "Boolean - live chat present",
          conversionElements: {
            urgency: "Boolean - urgency language detected",
            scarcity: "Boolean - scarcity language detected",
            socialProof: "Number - social proof elements",
            guarantees: "Boolean - guarantees mentioned"
          }
        },
        techStack: {
          cms: "String - detected CMS (WordPress, Shopify, etc.)",
          detectedTools: "Array - analytics, pixels, tools",
          securityHeaders: {
            xFrameOptions: "Boolean - X-Frame-Options present",
            xContentTypeOptions: "Boolean - X-Content-Type-Options",
            strictTransportSecurity: "Boolean - HSTS header",
            xRobotsTag: "String - X-Robots-Tag value"
          },
          renderRisk: "Boolean - JS-heavy (React/Vue/Angular)",
          indexability: "Boolean - page can be indexed",
          robotsMeta: "String - robots meta content",
          canonicalPresent: "Boolean - canonical tag present",
          analyticsPresent: "Boolean - analytics detected"
        },
        headingStructure: {
          h1Count: "Number - H1 tags",
          h2Count: "Number - H2 tags", 
          h3Count: "Number - H3 tags",
          totalHeadings: "Number - all headings",
          hierarchyValid: "Boolean - proper H1 > H2 > H3 structure",
          headings: "Array - all headings with level and text"
        },
        keywords: {
          topKeywords: {
            perKeyword: {
              keyword: "String - the keyword",
              count: "Number - weighted frequency",
              sources: "Array - where found (headings, meta, body, etc.)"
            }
          },
          longTailPhrases: "Array - 2-4 word phrase keywords",
          keywordDensity: "Number - keyword density percentage"
        }
      },
      usedByTabs: [
        "AI Detection Tab (humanity score, AI indicators)",
        "E-E-A-T Tab (all EEAT signals)",
        "Conversion Tab (friction, CTAs, forms)",
        "Technical SEO Tab (tech stack, security)",
        "Keyword Strategy Tab (top keywords, long-tail)",
        "Content Strategy Tab (headings, narrative)"
      ]
    },
    
    // ═══════════════════════════════════════════════════════════════════════
    // FT_ExtractorsComprehensive.gs - Complete Data Extraction
    // ═══════════════════════════════════════════════════════════════════════
    FT_ExtractorsComprehensive: {
      description: "Comprehensive extractors for headings, keywords, links, metadata",
      data: {
        headingsHierarchy: {
          structure: "Array - nested heading structure",
          counts: {
            h1: "Number", h2: "Number", h3: "Number",
            h4: "Number", h5: "Number", h6: "Number"
          },
          issues: {
            missingH1: "Boolean",
            multipleH1: "Boolean",
            skippedLevels: "Boolean",
            emptyHeadings: "Number"
          },
          recommendations: "Array - heading improvements"
        },
        introCopy: {
          firstParagraphs: "Array - first 3-5 paragraphs",
          wordCount: "Number - intro word count",
          mainContent: "String - main content extract"
        },
        keywordsComprehensive: {
          primaryKeywords: "Array - top 10 single keywords",
          secondaryKeywords: "Array - supporting keywords",
          longTailKeywords: "Array - 3-4 word phrases",
          semanticKeywords: "Array - related/LSI keywords",
          keywordDensity: "Object - density by keyword",
          topicClusters: "Array - grouped related keywords"
        },
        metaDataComplete: {
          title: "Object - title with length, score",
          description: "Object - description with length, score",
          ogTags: "Object - all Open Graph tags",
          twitterTags: "Object - all Twitter Card tags",
          canonical: "String - canonical URL",
          hreflang: "Array - language alternatives"
        },
        linksComprehensive: {
          internalBySection: "Object - internal links by page section",
          externalByDomain: "Object - external links grouped by domain",
          anchorTextAnalysis: "Object - anchor text patterns",
          linkEquityFlow: "Object - link value distribution"
        },
        authorSignals: {
          authorName: "String - detected author",
          authorUrl: "String - author page URL",
          authorBio: "String - author biography",
          authorSchema: "Object - Person schema data",
          authorSocialProfiles: "Array - social media links"
        },
        trustSignals: {
          badges: "Array - trust badges found",
          certifications: "Array - certifications",
          reviews: "Object - review data",
          testimonials: "Array - testimonial quotes"
        },
        faqs: {
          faqSchema: "Array - FAQ schema questions",
          pageFAQs: "Array - FAQ sections on page",
          totalQuestions: "Number - all questions found"
        }
      },
      usedByTabs: [
        "Content Strategy Tab (headings, intro, keywords)",
        "Keyword Strategy Tab (all keyword data)",
        "Internal Linking Tab (link analysis)",
        "E-E-A-T Tab (author, trust signals)",
        "FAQ Tab (FAQ extraction)",
        "Metadata Tab (complete metadata)"
      ]
    },
    
    // ═══════════════════════════════════════════════════════════════════════
    // FT_FullSnapshot.gs - Orchestration of All Extractors
    // ═══════════════════════════════════════════════════════════════════════
    FT_FullSnapshot: {
      description: "Orchestrates all extractors into single comprehensive snapshot",
      orchestrates: [
        "FT_extractMetadata",
        "FT_extractSchema", 
        "FT_extractLinks",
        "FT_extractImages",
        "FT_extractHeadingsHierarchy",
        "FT_extractIntroCopy",
        "FT_extractKeywordsComprehensive",
        "FT_extractMetaDataComplete",
        "FT_extractLinksComprehensive",
        "FT_extractAuthorSignals",
        "FT_extractTrustSignals",
        "FT_extractFAQs",
        "FT_getBacklinks (optional)"
      ],
      data: {
        snapshot: {
          url: "String - analyzed URL",
          fetchedAt: "ISO Date - snapshot timestamp",
          metadata: "Object - from FT_extractMetadata",
          schema: "Object - from FT_extractSchema",
          links: "Object - from FT_extractLinks",
          images: "Object - from FT_extractImages",
          headings: "Object - from FT_extractHeadingsHierarchy",
          intro: "Object - from FT_extractIntroCopy",
          keywords: "Object - from FT_extractKeywordsComprehensive",
          fullMetadata: "Object - from FT_extractMetaDataComplete",
          fullLinks: "Object - from FT_extractLinksComprehensive",
          author: "Object - from FT_extractAuthorSignals",
          trust: "Object - from FT_extractTrustSignals",
          faqs: "Object - from FT_extractFAQs",
          backlinks: "Object - from FT_getBacklinks (if enabled)",
          
          // Computed metrics
          overallScore: "Number - 0-100 overall quality",
          scoreBreakdown: {
            seo: "Number - SEO score",
            content: "Number - content score",
            technical: "Number - technical score",
            authority: "Number - authority score"
          },
          recommendations: "Array - prioritized improvements",
          summary: "String - executive summary"
        }
      },
      usedByTabs: [
        "SEO Overview Tab (overall scores)",
        "All 15 Tabs - provides comprehensive data source"
      ]
    },
    
    // ═══════════════════════════════════════════════════════════════════════
    // FT_Router.gs - Action Router
    // ═══════════════════════════════════════════════════════════════════════
    FT_Router: {
      description: "Routes all fetcher actions with Gateway integration",
      supportedActions: [
        "fetch:single - Single URL fetch",
        "fetch:multi - Multi URL batch fetch",
        "extract:meta - Metadata extraction",
        "extract:schema - Schema extraction",
        "extract:links - Link extraction",
        "extract:images - Image extraction",
        "extract:forensics - Forensic analysis",
        "snapshot:full - Complete snapshot",
        "snapshot:quick - Lightweight snapshot",
        "benchmark - Competitor benchmark",
        "ping/health - System health check"
      ],
      data: {
        actionResult: "Object - result from routed action",
        metrics: {
          action: "String - action performed",
          timestamp: "ISO Date - execution time",
          requestSize: "Number - payload size",
          executionTime: "Number - time in ms"
        }
      },
      usedByTabs: ["All - central routing for all data requests"]
    }
  };
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SECTION 2: DATA TO TAB MAPPING
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Maps FT data to each of the 15 UI tabs
 * Shows which data sources should populate each tab
 */
function DIAG_getDataToTabMapping() {
  return {
    
    "1. SEO Overview Tab": {
      primarySources: ["FT_FullSnapshot", "FT_ExtractMetadata"],
      dataPoints: [
        "overallScore → Main score display",
        "metadata.title → Title analysis",
        "metadata.description → Description analysis",
        "metadata.canonical → Canonical URL",
        "scoreBreakdown → Score breakdown cards"
      ]
    },
    
    "2. Competitor Intelligence Tab": {
      primarySources: ["FT_ParallelFetcher", "FT_EliteCompetitorFetcher"],
      dataPoints: [
        "stages.phpFetcher.data → Full competitor HTML/data",
        "stages.pageSpeed.data → Performance comparison",
        "stages.serper.data → SERP visibility",
        "stages.openPageRank.data → Authority comparison",
        "synthesized → Processed competitor insights"
      ]
    },
    
    "3. Keyword Strategy Tab": {
      primarySources: ["FT_ForensicExtractors", "FT_ExtractorsComprehensive"],
      dataPoints: [
        "keywords.topKeywords → Primary keywords table",
        "keywords.longTailPhrases → Long-tail opportunities",
        "keywordsComprehensive.topicClusters → Topic clusters",
        "keywordsComprehensive.semanticKeywords → LSI keywords",
        "Gemini fallback → Estimated metrics when Serper empty"
      ]
    },
    
    "4. Content Strategy Tab": {
      primarySources: ["FT_ForensicExtractors", "FT_ExtractorsComprehensive"],
      dataPoints: [
        "headingsHierarchy → Heading structure analysis",
        "introCopy → Content introduction analysis",
        "narrative.brandNarrative → Brand messaging",
        "faqs → FAQ content opportunities"
      ]
    },
    
    "5. Technical SEO Tab": {
      primarySources: ["FT_ParallelFetcher", "FT_ForensicExtractors", "FT_ExtractMetadata"],
      dataPoints: [
        "pageSpeed scores → Core Web Vitals",
        "techStack → CMS, tools, security",
        "metadata.robots → Indexability",
        "metadata.viewport → Mobile readiness",
        "securityHeaders → Security analysis"
      ]
    },
    
    "6. E-E-A-T Tab": {
      primarySources: ["FT_ForensicExtractors", "FT_ExtractorsComprehensive"],
      dataPoints: [
        "eeat.experienceSignals → Experience indicators",
        "eeat.expertiseSignals → Expertise indicators",
        "eeat.authoritySignals → Authority indicators",
        "eeat.trustSignals → Trust indicators",
        "authorSignals → Author information",
        "trustSignals → Trust badges/certifications"
      ]
    },
    
    "7. AI Detection Tab": {
      primarySources: ["FT_ForensicExtractors"],
      dataPoints: [
        "aiFootprint.humanityScore → Main AI score",
        "aiFootprint.isLikelyAI → AI detection flag",
        "aiFootprint.indicators → Detailed AI indicators",
        "aiFootprint.humanIndicators → Human writing signs"
      ]
    },
    
    "8. Schema & Structured Data Tab": {
      primarySources: ["FT_ExtractSchema"],
      dataPoints: [
        "schemas → All structured data",
        "types → Schema types found",
        "validation → Schema validation results",
        "score/grade → Schema completeness",
        "richResultsEligible → Rich results eligibility",
        "recommendations → Schema improvements"
      ]
    },
    
    "9. Internal Linking Tab": {
      primarySources: ["FT_ExtractLinks", "FT_ExtractorsComprehensive"],
      dataPoints: [
        "internalLinks → All internal links",
        "anchorStats → Anchor text analysis",
        "linksComprehensive.internalBySection → Links by section",
        "linksComprehensive.linkEquityFlow → Link value flow"
      ]
    },
    
    "10. External Links Tab": {
      primarySources: ["FT_ExtractLinks"],
      dataPoints: [
        "externalLinks → All external links",
        "topLinkedDomains → Most linked domains",
        "nofollowCount/dofollowCount → Link types",
        "sponsoredCount/ugcCount → Special link types"
      ]
    },
    
    "11. Authority & Backlinks Tab": {
      primarySources: ["FT_ParallelFetcher", "FT_FullSnapshot"],
      dataPoints: [
        "openPageRank.rank → Domain rank",
        "openPageRank.domainAuthority → DA estimate",
        "backlinks → Backlink data (if enabled)",
        "eeat.authoritySignals → Authority indicators"
      ]
    },
    
    "12. Images & Media Tab": {
      primarySources: ["FT_ExtractImages"],
      dataPoints: [
        "images → All images with details",
        "stats → Image statistics",
        "formats → Image format breakdown",
        "metrics → Optimization metrics",
        "accessibilityScore → Image accessibility"
      ]
    },
    
    "13. SERP Features Tab": {
      primarySources: ["FT_ParallelFetcher", "FT_ExtractSchema"],
      dataPoints: [
        "serper.organic → Organic rankings",
        "serper.answerBox → Featured snippet data",
        "serper.knowledgeGraph → Knowledge graph",
        "richResultsEligible → Rich result eligibility"
      ]
    },
    
    "14. Conversion Tab": {
      primarySources: ["FT_ForensicExtractors"],
      dataPoints: [
        "conversionIntel.frictionScore → Friction analysis",
        "conversionIntel.formCount → Form analysis",
        "conversionIntel.ctaCount → CTA analysis",
        "conversionIntel.chatWidgetDetected → Live chat",
        "conversionIntel.conversionElements → Conversion tactics"
      ]
    },
    
    "15. Social & Metadata Tab": {
      primarySources: ["FT_ExtractMetadata"],
      dataPoints: [
        "openGraph → Open Graph tags",
        "twitter → Twitter Card tags",
        "socialReadiness → Social meta score",
        "article → Article metadata"
      ]
    }
  };
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SECTION 3: LIVE DATA DIAGNOSTICS
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Run diagnostic on actual fetched data
 * Call this after a competitor analysis to see what data was collected
 * @param {Object} analysisData - The data from a competitor analysis
 * @return {Object} Diagnostic report
 */
function DIAG_analyzeCollectedData(analysisData) {
  var report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalDataPoints: 0,
      populatedFields: 0,
      emptyFields: 0,
      coveragePercent: 0
    },
    byCategory: {},
    recommendations: []
  };
  
  if (!analysisData) {
    report.error = "No analysis data provided";
    return report;
  }
  
  // Analyze each major data category
  var categories = {
    'Metadata': ['title', 'description', 'canonical', 'openGraph', 'twitter'],
    'Schema': ['schemas', 'types', 'validation', 'score'],
    'Links': ['internalLinks', 'externalLinks', 'anchorStats'],
    'Images': ['images', 'stats', 'formats'],
    'Keywords': ['topKeywords', 'longTailPhrases', 'topicClusters'],
    'EEAT': ['experienceSignals', 'expertiseSignals', 'authoritySignals', 'trustSignals'],
    'AI Detection': ['humanityScore', 'isLikelyAI', 'indicators'],
    'Conversion': ['frictionScore', 'formCount', 'ctaCount'],
    'Technical': ['cms', 'techStack', 'securityHeaders', 'pageSpeed'],
    'Authority': ['openPageRank', 'backlinks', 'domainAuthority']
  };
  
  Object.keys(categories).forEach(function(category) {
    report.byCategory[category] = {
      fields: [],
      populated: 0,
      empty: 0
    };
    
    categories[category].forEach(function(field) {
      var value = findValueInObject(analysisData, field);
      var isPopulated = checkIfPopulated(value);
      
      report.byCategory[category].fields.push({
        field: field,
        populated: isPopulated,
        value: isPopulated ? 'Has data' : 'Empty/Missing',
        preview: getValuePreview(value)
      });
      
      report.summary.totalDataPoints++;
      
      if (isPopulated) {
        report.summary.populatedFields++;
        report.byCategory[category].populated++;
      } else {
        report.summary.emptyFields++;
        report.byCategory[category].empty++;
        
        // Add recommendation for empty critical fields
        if (['title', 'description', 'humanityScore', 'schemas'].indexOf(field) !== -1) {
          report.recommendations.push({
            category: category,
            field: field,
            action: 'This critical field is empty - check data source'
          });
        }
      }
    });
  });
  
  // Calculate overall coverage
  report.summary.coveragePercent = Math.round(
    (report.summary.populatedFields / report.summary.totalDataPoints) * 100
  );
  
  return report;
}

/**
 * Helper: Find value in nested object
 */
function findValueInObject(obj, key) {
  if (!obj || typeof obj !== 'object') return null;
  
  if (obj.hasOwnProperty(key)) return obj[key];
  
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop) && typeof obj[prop] === 'object') {
      var found = findValueInObject(obj[prop], key);
      if (found !== null) return found;
    }
  }
  
  return null;
}

/**
 * Helper: Check if value is populated
 */
function checkIfPopulated(value) {
  if (value === null || value === undefined) return false;
  if (value === '') return false;
  if (Array.isArray(value) && value.length === 0) return false;
  if (typeof value === 'object' && Object.keys(value).length === 0) return false;
  if (typeof value === 'number' && isNaN(value)) return false;
  return true;
}

/**
 * Helper: Get preview of value
 */
function getValuePreview(value) {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'string') return value.substring(0, 50) + (value.length > 50 ? '...' : '');
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return 'Array[' + value.length + ']';
  if (typeof value === 'object') return 'Object{' + Object.keys(value).length + ' keys}';
  return String(value).substring(0, 50);
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SECTION 4: DIAGNOSTIC LOGGER
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Log all data from a competitor analysis to a sheet
 * Creates/updates a "DIAG_DataLog" sheet with all collected data
 */
function DIAG_logToSheet(analysisData, sheetId) {
  try {
    var ss = sheetId ? 
      SpreadsheetApp.openById(sheetId) : 
      SpreadsheetApp.getActiveSpreadsheet();
    
    var sheetName = 'DIAG_DataLog';
    var sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      // Add headers
      sheet.getRange(1, 1, 1, 6).setValues([[
        'Timestamp', 'Category', 'Field', 'Has Data', 'Preview', 'Full Path'
      ]]);
      sheet.getRange(1, 1, 1, 6).setFontWeight('bold').setBackground('#4285f4').setFontColor('#fff');
    }
    
    // Get diagnostic report
    var report = DIAG_analyzeCollectedData(analysisData);
    
    // Build rows
    var rows = [];
    var timestamp = report.timestamp;
    
    Object.keys(report.byCategory).forEach(function(category) {
      var catData = report.byCategory[category];
      
      catData.fields.forEach(function(fieldData) {
        rows.push([
          timestamp,
          category,
          fieldData.field,
          fieldData.populated ? 'YES' : 'NO',
          fieldData.preview,
          category + '.' + fieldData.field
        ]);
      });
    });
    
    // Append rows
    if (rows.length > 0) {
      var lastRow = sheet.getLastRow();
      sheet.getRange(lastRow + 1, 1, rows.length, 6).setValues(rows);
    }
    
    // Summary row
    sheet.appendRow([
      timestamp,
      'SUMMARY',
      'Total Coverage',
      report.summary.coveragePercent + '%',
      report.summary.populatedFields + '/' + report.summary.totalDataPoints + ' fields',
      'Overall'
    ]);
    
    Logger.log('✅ Diagnostic data logged to sheet: ' + sheetName);
    return { ok: true, rowsAdded: rows.length + 1 };
    
  } catch (e) {
    Logger.log('❌ Error logging to sheet: ' + e);
    return { ok: false, error: String(e) };
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SECTION 5: QUICK DIAGNOSTIC FUNCTIONS
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Print complete data inventory to Logger
 */
function DIAG_printInventory() {
  var inventory = DIAG_getCompleteDataInventory();
  
  Logger.log('═══════════════════════════════════════════════════════════════════');
  Logger.log('           FT FETCHER COMPLETE DATA INVENTORY');
  Logger.log('═══════════════════════════════════════════════════════════════════');
  
  Object.keys(inventory).forEach(function(ftFile) {
    Logger.log('\n📁 ' + ftFile);
    Logger.log('   Description: ' + inventory[ftFile].description);
    Logger.log('   Used by Tabs: ' + (inventory[ftFile].usedByTabs || []).join(', '));
    
    if (inventory[ftFile].stages) {
      Logger.log('   Stages: ' + inventory[ftFile].stages.join('\n          '));
    }
  });
  
  Logger.log('\n═══════════════════════════════════════════════════════════════════');
  Logger.log('                    DATA TO TAB MAPPING');
  Logger.log('═══════════════════════════════════════════════════════════════════');
  
  var mapping = DIAG_getDataToTabMapping();
  Object.keys(mapping).forEach(function(tab) {
    Logger.log('\n📊 ' + tab);
    Logger.log('   Sources: ' + mapping[tab].primarySources.join(', '));
    mapping[tab].dataPoints.forEach(function(dp) {
      Logger.log('   • ' + dp);
    });
  });
}

/**
 * Print tab mapping only
 */
function DIAG_printTabMapping() {
  var mapping = DIAG_getDataToTabMapping();
  
  Logger.log('═══════════════════════════════════════════════════════════════════');
  Logger.log('           DATA TO TAB MAPPING');
  Logger.log('═══════════════════════════════════════════════════════════════════');
  
  Object.keys(mapping).forEach(function(tab) {
    Logger.log('\n📊 ' + tab);
    Logger.log('   Primary Sources: ' + mapping[tab].primarySources.join(', '));
    Logger.log('   Data Points:');
    mapping[tab].dataPoints.forEach(function(dp) {
      Logger.log('     → ' + dp);
    });
  });
}

/**
 * Test diagnostic with sample data
 */
function DIAG_runTest() {
  // Sample data structure to test diagnostics
  var sampleData = {
    metadata: {
      title: 'Test Page Title',
      description: 'Test description',
      canonical: 'https://example.com',
      openGraph: { title: 'OG Title', image: 'https://example.com/image.jpg' },
      twitter: {}  // Empty
    },
    schema: {
      schemas: [{ type: 'Organization' }],
      types: ['Organization'],
      score: 75
    },
    links: {
      internalLinks: [{ href: '/page1' }, { href: '/page2' }],
      externalLinks: [],
      anchorStats: { branded: 2, generic: 5 }
    },
    keywords: {
      topKeywords: [{ keyword: 'test', count: 10 }],
      longTailPhrases: [],  // Empty
      topicClusters: null   // Missing
    },
    eeat: {
      experienceSignals: { firstPersonUsage: 5 },
      expertiseSignals: { authorPresent: true },
      authoritySignals: {},  // Empty
      trustSignals: null     // Missing
    },
    aiFootprint: {
      humanityScore: 78,
      isLikelyAI: false
    }
  };
  
  Logger.log('Running diagnostic test with sample data...\n');
  
  var report = DIAG_analyzeCollectedData(sampleData);
  
  Logger.log('═══════════════════════════════════════════════════════════════════');
  Logger.log('           DIAGNOSTIC REPORT');
  Logger.log('═══════════════════════════════════════════════════════════════════');
  Logger.log('\nSUMMARY:');
  Logger.log('  Total Data Points: ' + report.summary.totalDataPoints);
  Logger.log('  Populated Fields: ' + report.summary.populatedFields);
  Logger.log('  Empty Fields: ' + report.summary.emptyFields);
  Logger.log('  Coverage: ' + report.summary.coveragePercent + '%');
  
  Logger.log('\nBY CATEGORY:');
  Object.keys(report.byCategory).forEach(function(cat) {
    var catData = report.byCategory[cat];
    Logger.log('  ' + cat + ': ' + catData.populated + '/' + 
               (catData.populated + catData.empty) + ' populated');
  });
  
  if (report.recommendations.length > 0) {
    Logger.log('\nRECOMMENDATIONS:');
    report.recommendations.forEach(function(rec) {
      Logger.log('  ⚠️ ' + rec.category + '.' + rec.field + ': ' + rec.action);
    });
  }
  
  return report;
}
