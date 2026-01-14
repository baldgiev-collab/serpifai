-- ═══════════════════════════════════════════════════════════════════════════════════
-- SERPIFAI ORACLE v16.0 - MODULE 4.2: MySQL RELATIONAL SCHEMA
-- 0.1% Elite SaaS Data Warehouse Setup
-- ═══════════════════════════════════════════════════════════════════════════════════
-- 
-- This SQL script initializes the complete data warehouse:
--   - Table 1: domains (Domain-level authority and trust metrics)
--   - Table 2: pages (15 revenue pages per competitor with Gemini insights)
--   - Table 3: keyword_intelligence (450-KW cluster with intent & risk)
--   - Table 4: link_forensics (Anchor diversity and equity maps)
--   - Table 5: governance_logs (Permanent compliance audit trail)
--
-- @author SerpifAI Engineering
-- @version 16.0
-- @license Proprietary - serpifai.com
-- ═══════════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════════════
-- DATABASE SETUP
-- ═══════════════════════════════════════════════════════════════════════════════════

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS serpifai_oracle
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE serpifai_oracle;

-- ═══════════════════════════════════════════════════════════════════════════════════
-- TABLE 1: DOMAINS
-- Domain-level authority and trust metrics
-- ═══════════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS domains (
  -- Primary Key
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Domain Identification
  domain VARCHAR(255) NOT NULL UNIQUE,
  
  -- Authority Metrics (Synthetic - derived from forensic analysis)
  synthetic_da DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Synthetic Domain Authority (0-100)',
  trust_velocity DECIMAL(10,4) DEFAULT 0.0000 COMMENT 'Trust growth velocity',
  content_velocity DECIMAL(10,4) DEFAULT 0.0000 COMMENT 'Content publishing velocity',
  
  -- Backlink Metrics (To be populated from external data sources)
  total_rd INT DEFAULT 0 COMMENT 'Total referring domains',
  total_backlinks INT DEFAULT 0 COMMENT 'Total backlinks',
  dofollow_ratio DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Dofollow backlink ratio',
  
  -- Ranking & Visibility
  global_rank INT DEFAULT 0 COMMENT 'Global traffic rank estimate',
  niche_rank INT DEFAULT 0 COMMENT 'Niche-specific rank',
  visibility_score DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Search visibility score',
  
  -- Competitor Classification
  competitor_tier ENUM('tier1', 'tier2', 'tier3', 'emerging', 'unknown') DEFAULT 'unknown',
  is_direct_competitor BOOLEAN DEFAULT FALSE,
  
  -- Client Association
  client_id INT DEFAULT NULL COMMENT 'Associated serpifai.com client ID',
  
  -- Timestamps
  first_discovered TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_crawled TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes for performance
  INDEX idx_domain (domain),
  INDEX idx_synthetic_da (synthetic_da),
  INDEX idx_global_rank (global_rank),
  INDEX idx_competitor_tier (competitor_tier),
  INDEX idx_client_id (client_id),
  INDEX idx_last_crawled (last_crawled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Domain-level authority and trust metrics for competitor analysis';

-- ═══════════════════════════════════════════════════════════════════════════════════
-- TABLE 2: PAGES
-- 15 Revenue pages per competitor with Gemini AI insights
-- ═══════════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS pages (
  -- Primary Key
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Foreign Key to Domain
  domain_id INT NOT NULL,
  
  -- URL Identification
  url VARCHAR(2048) NOT NULL,
  url_hash VARCHAR(64) NOT NULL COMMENT 'SHA-256 hash for deduplication',
  
  -- Page Classification
  page_type ENUM('homepage', 'category', 'product', 'blog', 'landing', 'resource', 'other') DEFAULT 'other',
  revenue_tier ENUM('high', 'medium', 'low', 'unknown') DEFAULT 'unknown' COMMENT 'Revenue potential tier',
  is_revenue_page BOOLEAN DEFAULT FALSE COMMENT 'Top 15 revenue page flag',
  
  -- Traffic & Ranking Estimates
  page_rank_estimate DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Estimated page authority',
  monthly_traffic_estimate INT DEFAULT 0 COMMENT 'Estimated monthly organic traffic',
  traffic_value_estimate DECIMAL(12,2) DEFAULT 0.00 COMMENT 'Estimated traffic value in USD',
  
  -- Content Metrics
  word_count INT DEFAULT 0,
  heading_count INT DEFAULT 0 COMMENT 'Total headings (H1-H6)',
  image_count INT DEFAULT 0,
  video_count INT DEFAULT 0,
  
  -- Technical Metrics
  lcp_ms INT DEFAULT 0 COMMENT 'Largest Contentful Paint in milliseconds',
  fid_ms INT DEFAULT 0 COMMENT 'First Input Delay in milliseconds',
  cls_score DECIMAL(5,4) DEFAULT 0.0000 COMMENT 'Cumulative Layout Shift',
  
  -- Schema & Structure
  schema_detected VARCHAR(500) DEFAULT NULL COMMENT 'Detected schema.org types (comma-separated)',
  has_faq_schema BOOLEAN DEFAULT FALSE,
  has_article_schema BOOLEAN DEFAULT FALSE,
  has_product_schema BOOLEAN DEFAULT FALSE,
  
  -- E-E-A-T & Trust Scores
  eeat_score DECIMAL(5,2) DEFAULT 0.00 COMMENT 'E-E-A-T score (0-100)',
  experience_score DECIMAL(5,2) DEFAULT 0.00,
  expertise_score DECIMAL(5,2) DEFAULT 0.00,
  authority_score DECIMAL(5,2) DEFAULT 0.00,
  trust_score DECIMAL(5,2) DEFAULT 0.00,
  
  -- AEO/RAG Readiness
  aeo_score DECIMAL(5,2) DEFAULT 0.00 COMMENT 'AEO/RAG readiness score (0-100)',
  spo_triplet_count INT DEFAULT 0 COMMENT 'Extracted SPO triplets count',
  rag_suitability_score DECIMAL(5,2) DEFAULT 0.00,
  
  -- Synthetic KD
  synthetic_kd DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Synthetic Keyword Difficulty',
  
  -- Kill Move Classification
  kill_move_type ENUM('snipe', 'aeo_hijack', 'instant_takeover', 'vulnerable', 'none') DEFAULT 'none',
  vulnerability_score DECIMAL(5,2) DEFAULT 0.00,
  
  -- Content Freshness
  content_freshness_score DECIMAL(5,2) DEFAULT 0.00,
  last_content_update DATE DEFAULT NULL COMMENT 'Estimated last content update',
  
  -- Gemini AI Insights (LONGTEXT for full strategic analysis)
  gemini_insights LONGTEXT DEFAULT NULL COMMENT 'Gemini 1.5 Flash strategic analysis JSON',
  gemini_kill_move TEXT DEFAULT NULL COMMENT 'Primary kill move recommendation',
  gemini_moat TEXT DEFAULT NULL COMMENT 'Psychological moat analysis',
  gemini_revenue_score INT DEFAULT NULL COMMENT 'Gemini revenue opportunity score (1-100)',
  gemini_analyzed_at TIMESTAMP NULL DEFAULT NULL,
  
  -- Content Hash for Change Detection
  content_hash VARCHAR(64) DEFAULT NULL COMMENT 'SHA-256 hash of main content',
  
  -- Timestamps
  first_analyzed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_analyzed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign Key Constraint
  FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE,
  
  -- Unique Constraint
  UNIQUE KEY uk_url_hash (url_hash),
  
  -- Indexes for performance
  INDEX idx_domain_id (domain_id),
  INDEX idx_page_type (page_type),
  INDEX idx_revenue_tier (revenue_tier),
  INDEX idx_is_revenue_page (is_revenue_page),
  INDEX idx_aeo_score (aeo_score),
  INDEX idx_eeat_score (eeat_score),
  INDEX idx_synthetic_kd (synthetic_kd),
  INDEX idx_kill_move_type (kill_move_type),
  INDEX idx_vulnerability_score (vulnerability_score),
  INDEX idx_last_analyzed (last_analyzed),
  
  -- Full-text index for search
  FULLTEXT INDEX ft_gemini_insights (gemini_insights)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Page-level analysis with Gemini AI insights for top 15 revenue pages';

-- ═══════════════════════════════════════════════════════════════════════════════════
-- TABLE 3: KEYWORD_INTELLIGENCE
-- 450-KW cluster (90 per competitor) with clash detection and semantic intent
-- ═══════════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS keyword_intelligence (
  -- Primary Key
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Foreign Key to Page
  page_id INT NOT NULL,
  
  -- Keyword Data
  keyword VARCHAR(500) NOT NULL,
  keyword_hash VARCHAR(64) NOT NULL COMMENT 'SHA-256 hash for deduplication',
  
  -- Search Metrics
  volume INT DEFAULT 0 COMMENT 'Monthly search volume',
  volume_trend DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Volume trend (YoY change %)',
  kd DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Keyword Difficulty (0-100)',
  synthetic_kd DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Synthetic KD from content analysis',
  
  -- Monetization Metrics
  cpc DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Cost Per Click in USD',
  traffic_value DECIMAL(12,2) DEFAULT 0.00 COMMENT 'Keyword traffic value',
  
  -- Intent Classification
  intent ENUM('informational', 'commercial', 'transactional', 'navigational') DEFAULT 'informational',
  intent_confidence DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Intent classification confidence (0-100)',
  semantic_cluster VARCHAR(100) DEFAULT NULL COMMENT 'Semantic cluster/topic group',
  
  -- SERP Features
  serp_features VARCHAR(500) DEFAULT NULL COMMENT 'Detected SERP features (comma-separated)',
  has_featured_snippet BOOLEAN DEFAULT FALSE,
  has_paa BOOLEAN DEFAULT FALSE COMMENT 'Has People Also Ask',
  has_knowledge_panel BOOLEAN DEFAULT FALSE,
  has_local_pack BOOLEAN DEFAULT FALSE,
  
  -- Competition Analysis
  serp_difficulty DECIMAL(5,2) DEFAULT 0.00 COMMENT 'SERP competition difficulty',
  top10_avg_da DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Average DA of top 10 results',
  top10_avg_word_count INT DEFAULT 0 COMMENT 'Average word count of top 10',
  
  -- Position & Traffic
  position_estimate INT DEFAULT 0 COMMENT 'Estimated current position',
  traffic_potential INT DEFAULT 0 COMMENT 'Potential traffic if ranked #1',
  traffic_share DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Current traffic share %',
  
  -- Risk Analysis
  clash_risk DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Keyword cannibalization risk (0-100)',
  aio_risk DECIMAL(5,2) DEFAULT 0.00 COMMENT 'AI Overview risk (0-100)',
  volatility_score DECIMAL(5,2) DEFAULT 0.00 COMMENT 'SERP volatility score',
  
  -- Kill Move Targeting
  is_snipe_target BOOLEAN DEFAULT FALSE COMMENT 'Low KD + High CPC opportunity',
  is_aeo_target BOOLEAN DEFAULT FALSE COMMENT 'AI citation opportunity',
  kill_move_priority ENUM('critical', 'high', 'medium', 'low', 'none') DEFAULT 'none',
  
  -- Content Gap Analysis
  content_gap_score DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Content gap opportunity',
  recommended_content_type VARCHAR(100) DEFAULT NULL,
  
  -- Extraction Metadata
  source_location ENUM('title', 'h1', 'h2', 'h3', 'body', 'meta', 'anchor') DEFAULT 'body',
  frequency INT DEFAULT 1 COMMENT 'Occurrence frequency in content',
  word_count INT DEFAULT 1 COMMENT 'Number of words in keyword',
  
  -- Timestamps
  first_discovered TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign Key Constraint
  FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE,
  
  -- Indexes for performance
  INDEX idx_page_id (page_id),
  INDEX idx_keyword_hash (keyword_hash),
  INDEX idx_keyword (keyword(100)),
  INDEX idx_volume (volume),
  INDEX idx_kd (kd),
  INDEX idx_synthetic_kd (synthetic_kd),
  INDEX idx_cpc (cpc),
  INDEX idx_intent (intent),
  INDEX idx_is_snipe_target (is_snipe_target),
  INDEX idx_is_aeo_target (is_aeo_target),
  INDEX idx_kill_move_priority (kill_move_priority),
  INDEX idx_clash_risk (clash_risk),
  INDEX idx_aio_risk (aio_risk)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Keyword intelligence with 75-90 keywords per page, intent classification, and risk analysis';

-- ═══════════════════════════════════════════════════════════════════════════════════
-- TABLE 4: LINK_FORENSICS
-- Anchor diversity and internal equity maps
-- ═══════════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS link_forensics (
  -- Primary Key
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Foreign Key to Page
  page_id INT NOT NULL,
  
  -- Referring Domain Metrics
  ref_domains INT DEFAULT 0 COMMENT 'Total referring domains to this page',
  ref_domains_trend DECIMAL(5,2) DEFAULT 0.00 COMMENT 'RD growth trend (MoM %)',
  
  -- Backlink Counts
  backlinks INT DEFAULT 0 COMMENT 'Total backlinks to this page',
  dofollow_backlinks INT DEFAULT 0,
  nofollow_backlinks INT DEFAULT 0,
  ugc_backlinks INT DEFAULT 0 COMMENT 'User-generated content links',
  sponsored_backlinks INT DEFAULT 0,
  
  -- Link Efficiency
  link_efficiency_ratio DECIMAL(10,4) DEFAULT 0.0000 COMMENT 'Traffic / Backlinks ratio',
  link_velocity DECIMAL(10,4) DEFAULT 0.0000 COMMENT 'New links per month',
  
  -- Internal Link Structure
  internal_links INT DEFAULT 0 COMMENT 'Outbound internal links from page',
  internal_links_received INT DEFAULT 0 COMMENT 'Internal links pointing to page',
  internal_link_equity DECIMAL(10,4) DEFAULT 0.0000 COMMENT 'Internal PageRank distribution',
  
  -- External Links
  external_links INT DEFAULT 0 COMMENT 'Outbound external links',
  external_dofollow INT DEFAULT 0,
  external_nofollow INT DEFAULT 0,
  
  -- Link Ratios
  dofollow_ratio DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Dofollow % of total backlinks',
  internal_external_ratio DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Internal to external ratio',
  
  -- Anchor Text Diversity Analysis
  anchor_diversity_score DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Overall anchor diversity (0-100)',
  
  -- Anchor Distribution (percentages)
  anchor_exact_match_pct DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Exact match anchor %',
  anchor_partial_match_pct DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Partial match anchor %',
  anchor_branded_pct DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Branded anchor %',
  anchor_naked_url_pct DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Naked URL anchor %',
  anchor_generic_pct DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Generic anchor % (click here, etc.)',
  anchor_image_pct DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Image anchor %',
  
  -- Risk Flags
  over_optimization_risk BOOLEAN DEFAULT FALSE COMMENT 'Anchor over-optimization detected',
  link_spam_risk DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Link spam/toxicity risk (0-100)',
  pbn_detected BOOLEAN DEFAULT FALSE COMMENT 'Potential PBN links detected',
  
  -- Top Anchors (JSON array of top 10)
  top_anchors JSON DEFAULT NULL COMMENT 'Top 10 anchor texts with counts',
  
  -- Competitor Link Gap
  link_gap_opportunity DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Link building opportunity score',
  
  -- Timestamps
  first_analyzed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_analyzed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign Key Constraint
  FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE,
  
  -- Unique Constraint (one forensic record per page)
  UNIQUE KEY uk_page_id (page_id),
  
  -- Indexes for performance
  INDEX idx_ref_domains (ref_domains),
  INDEX idx_link_efficiency (link_efficiency_ratio),
  INDEX idx_anchor_diversity (anchor_diversity_score),
  INDEX idx_over_optimization (over_optimization_risk),
  INDEX idx_link_spam_risk (link_spam_risk)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Link forensics with anchor diversity and internal equity analysis';

-- ═══════════════════════════════════════════════════════════════════════════════════
-- TABLE 5: GOVERNANCE_LOGS
-- Permanent compliance audit trail for robots.txt and PII scrubbing
-- ═══════════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS governance_logs (
  -- Primary Key
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  
  -- URL Identification
  url VARCHAR(2048) NOT NULL,
  url_hash VARCHAR(64) NOT NULL COMMENT 'SHA-256 hash for querying',
  domain VARCHAR(255) DEFAULT NULL,
  
  -- Robots.txt Compliance
  robots_status ENUM('allowed', 'disallowed', 'error', 'not_found') NOT NULL DEFAULT 'allowed',
  robots_reason VARCHAR(255) DEFAULT NULL COMMENT 'Specific rule that applied',
  robots_txt_cached BOOLEAN DEFAULT FALSE COMMENT 'Was robots.txt from cache',
  crawl_delay_seconds INT DEFAULT 0 COMMENT 'Crawl-delay directive value',
  
  -- PII Scrubbing
  pii_scrubbed_flag BOOLEAN DEFAULT FALSE COMMENT 'Was PII scrubbing applied',
  pii_items_removed INT DEFAULT 0 COMMENT 'Count of PII items removed',
  pii_types_removed VARCHAR(255) DEFAULT NULL COMMENT 'Types of PII removed (email, phone, etc.)',
  
  -- Fetch Details
  fetch_status_code INT DEFAULT NULL COMMENT 'HTTP status code',
  fetch_latency_ms INT DEFAULT NULL COMMENT 'Fetch latency in milliseconds',
  fetch_content_type VARCHAR(100) DEFAULT NULL,
  fetch_content_length INT DEFAULT NULL,
  
  -- Rate Limiting
  rate_limit_applied BOOLEAN DEFAULT FALSE COMMENT 'Was rate limiting applied',
  rate_limit_delay_ms INT DEFAULT 0 COMMENT 'Delay applied in milliseconds',
  
  -- Bot Identity
  bot_identity VARCHAR(255) DEFAULT 'SerpifAI-OracleBot/1.0' COMMENT 'User-Agent used',
  
  -- Session & Request Tracking
  session_id VARCHAR(64) DEFAULT NULL COMMENT 'Crawl session identifier',
  request_id VARCHAR(64) DEFAULT NULL COMMENT 'Unique request identifier',
  
  -- Error Tracking
  error_occurred BOOLEAN DEFAULT FALSE,
  error_message TEXT DEFAULT NULL,
  error_type VARCHAR(100) DEFAULT NULL,
  
  -- Quota & Limits
  quota_remaining INT DEFAULT NULL COMMENT 'Remaining API quota',
  execution_time_ms INT DEFAULT NULL COMMENT 'Total execution time',
  
  -- Client Association
  client_id INT DEFAULT NULL COMMENT 'Associated client ID',
  
  -- Timestamp (immutable for audit trail)
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes for performance
  INDEX idx_url_hash (url_hash),
  INDEX idx_domain (domain),
  INDEX idx_robots_status (robots_status),
  INDEX idx_pii_scrubbed (pii_scrubbed_flag),
  INDEX idx_fetch_status (fetch_status_code),
  INDEX idx_error_occurred (error_occurred),
  INDEX idx_session_id (session_id),
  INDEX idx_client_id (client_id),
  INDEX idx_timestamp (timestamp),
  
  -- Composite index for common queries
  INDEX idx_domain_timestamp (domain, timestamp),
  INDEX idx_session_timestamp (session_id, timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Permanent governance audit trail for compliance verification';

-- ═══════════════════════════════════════════════════════════════════════════════════
-- ADDITIONAL TABLES FOR ENHANCED FUNCTIONALITY
-- ═══════════════════════════════════════════════════════════════════════════════════

-- Table 6: CRAWL_SESSIONS (Track crawl operations)
CREATE TABLE IF NOT EXISTS crawl_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id VARCHAR(64) NOT NULL UNIQUE,
  client_id INT DEFAULT NULL,
  
  -- Session Configuration
  target_domains TEXT COMMENT 'JSON array of target domains',
  pages_per_domain INT DEFAULT 15,
  keywords_per_page INT DEFAULT 75,
  
  -- Progress Tracking
  status ENUM('pending', 'running', 'paused', 'completed', 'failed') DEFAULT 'pending',
  pages_discovered INT DEFAULT 0,
  pages_analyzed INT DEFAULT 0,
  keywords_extracted INT DEFAULT 0,
  
  -- Timing
  started_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  duration_seconds INT DEFAULT 0,
  
  -- Results Summary
  kill_moves_found INT DEFAULT 0,
  vulnerable_pages INT DEFAULT 0,
  gemini_insights_generated INT DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_session_id (session_id),
  INDEX idx_client_id (client_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Crawl session tracking for batch operations';

-- Table 7: KILL_MOVE_ALERTS (Track strategic opportunities)
CREATE TABLE IF NOT EXISTS kill_move_alerts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  page_id INT NOT NULL,
  
  -- Alert Classification
  kill_move_type ENUM('snipe', 'aeo_hijack', 'instant_takeover', 'vulnerable') NOT NULL,
  priority ENUM('critical', 'high', 'medium', 'low') DEFAULT 'medium',
  
  -- Metrics at Alert Time
  synthetic_kd DECIMAL(5,2) DEFAULT 0.00,
  eeat_score DECIMAL(5,2) DEFAULT 0.00,
  aeo_score DECIMAL(5,2) DEFAULT 0.00,
  vulnerability_score DECIMAL(5,2) DEFAULT 0.00,
  
  -- Reasoning
  reason TEXT COMMENT 'Why this was flagged',
  recommended_action TEXT COMMENT 'Strategic recommendation',
  
  -- Status Tracking
  status ENUM('new', 'acknowledged', 'in_progress', 'completed', 'dismissed') DEFAULT 'new',
  acknowledged_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  
  -- Assignment
  assigned_to VARCHAR(100) DEFAULT NULL,
  client_id INT DEFAULT NULL,
  
  -- Notification Tracking
  email_sent BOOLEAN DEFAULT FALSE,
  slack_sent BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE,
  
  INDEX idx_page_id (page_id),
  INDEX idx_kill_move_type (kill_move_type),
  INDEX idx_priority (priority),
  INDEX idx_status (status),
  INDEX idx_client_id (client_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Kill Move opportunity alerts for strategic action';

-- ═══════════════════════════════════════════════════════════════════════════════════
-- VIEWS FOR COMMON QUERIES
-- ═══════════════════════════════════════════════════════════════════════════════════

-- View: Snipe Opportunities (Low KD + High CPC + Weak E-E-A-T)
CREATE OR REPLACE VIEW v_snipe_opportunities AS
SELECT 
  p.id AS page_id,
  d.domain,
  p.url,
  p.synthetic_kd,
  p.eeat_score,
  p.vulnerability_score,
  k.keyword,
  k.volume,
  k.cpc,
  k.intent,
  p.gemini_kill_move,
  p.last_analyzed
FROM pages p
JOIN domains d ON p.domain_id = d.id
JOIN keyword_intelligence k ON k.page_id = p.id
WHERE k.synthetic_kd < 35 
  AND k.cpc > 15 
  AND p.eeat_score < 50
ORDER BY k.cpc DESC, k.volume DESC;

-- View: AEO Hijack Targets (Low AEO + High Traffic Potential)
CREATE OR REPLACE VIEW v_aeo_hijack_targets AS
SELECT 
  p.id AS page_id,
  d.domain,
  p.url,
  p.aeo_score,
  p.rag_suitability_score,
  p.spo_triplet_count,
  p.page_rank_estimate,
  p.monthly_traffic_estimate,
  p.gemini_insights,
  p.last_analyzed
FROM pages p
JOIN domains d ON p.domain_id = d.id
WHERE p.aeo_score < 40
ORDER BY p.page_rank_estimate DESC, p.monthly_traffic_estimate DESC;

-- View: Top Revenue Pages with Kill Move Status
CREATE OR REPLACE VIEW v_revenue_pages AS
SELECT 
  d.domain,
  p.url,
  p.revenue_tier,
  p.monthly_traffic_estimate,
  p.traffic_value_estimate,
  p.synthetic_kd,
  p.eeat_score,
  p.aeo_score,
  p.kill_move_type,
  p.vulnerability_score,
  p.gemini_revenue_score,
  COUNT(k.id) AS keyword_count
FROM pages p
JOIN domains d ON p.domain_id = d.id
LEFT JOIN keyword_intelligence k ON k.page_id = p.id
WHERE p.is_revenue_page = TRUE
GROUP BY p.id
ORDER BY p.traffic_value_estimate DESC;

-- View: Governance Compliance Summary
CREATE OR REPLACE VIEW v_governance_summary AS
SELECT 
  domain,
  COUNT(*) AS total_requests,
  SUM(CASE WHEN robots_status = 'allowed' THEN 1 ELSE 0 END) AS allowed_count,
  SUM(CASE WHEN robots_status = 'disallowed' THEN 1 ELSE 0 END) AS disallowed_count,
  SUM(pii_items_removed) AS total_pii_removed,
  AVG(fetch_latency_ms) AS avg_latency_ms,
  SUM(CASE WHEN error_occurred THEN 1 ELSE 0 END) AS error_count,
  MAX(timestamp) AS last_activity
FROM governance_logs
GROUP BY domain
ORDER BY total_requests DESC;

-- ═══════════════════════════════════════════════════════════════════════════════════
-- STORED PROCEDURES
-- ═══════════════════════════════════════════════════════════════════════════════════

DELIMITER //

-- Procedure: Get Kill Move Opportunities
CREATE PROCEDURE sp_get_kill_move_opportunities(
  IN p_client_id INT,
  IN p_kill_move_type VARCHAR(50),
  IN p_limit INT
)
BEGIN
  SELECT 
    p.id,
    d.domain,
    p.url,
    p.kill_move_type,
    p.vulnerability_score,
    p.synthetic_kd,
    p.eeat_score,
    p.aeo_score,
    p.gemini_kill_move,
    p.last_analyzed
  FROM pages p
  JOIN domains d ON p.domain_id = d.id
  WHERE (p_client_id IS NULL OR d.client_id = p_client_id)
    AND (p_kill_move_type IS NULL OR p.kill_move_type = p_kill_move_type)
    AND p.kill_move_type != 'none'
  ORDER BY p.vulnerability_score DESC
  LIMIT p_limit;
END //

-- Procedure: Update Page with Gemini Insights
CREATE PROCEDURE sp_update_gemini_insights(
  IN p_page_id INT,
  IN p_gemini_insights LONGTEXT,
  IN p_kill_move TEXT,
  IN p_moat TEXT,
  IN p_revenue_score INT
)
BEGIN
  UPDATE pages
  SET 
    gemini_insights = p_gemini_insights,
    gemini_kill_move = p_kill_move,
    gemini_moat = p_moat,
    gemini_revenue_score = p_revenue_score,
    gemini_analyzed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_page_id;
END //

-- Procedure: Get Dashboard Metrics
CREATE PROCEDURE sp_get_dashboard_metrics(
  IN p_client_id INT
)
BEGIN
  -- Total domains analyzed
  SELECT 
    (SELECT COUNT(*) FROM domains WHERE client_id = p_client_id OR p_client_id IS NULL) AS total_domains,
    (SELECT COUNT(*) FROM pages p JOIN domains d ON p.domain_id = d.id 
     WHERE d.client_id = p_client_id OR p_client_id IS NULL) AS total_pages,
    (SELECT COUNT(*) FROM keyword_intelligence k JOIN pages p ON k.page_id = p.id 
     JOIN domains d ON p.domain_id = d.id 
     WHERE d.client_id = p_client_id OR p_client_id IS NULL) AS total_keywords,
    (SELECT COUNT(*) FROM pages p JOIN domains d ON p.domain_id = d.id 
     WHERE p.kill_move_type != 'none' 
     AND (d.client_id = p_client_id OR p_client_id IS NULL)) AS kill_move_opportunities,
    (SELECT AVG(eeat_score) FROM pages p JOIN domains d ON p.domain_id = d.id 
     WHERE d.client_id = p_client_id OR p_client_id IS NULL) AS avg_eeat_score,
    (SELECT AVG(aeo_score) FROM pages p JOIN domains d ON p.domain_id = d.id 
     WHERE d.client_id = p_client_id OR p_client_id IS NULL) AS avg_aeo_score;
END //

DELIMITER ;

-- ═══════════════════════════════════════════════════════════════════════════════════
-- INITIAL DATA / SEED VALUES
-- ═══════════════════════════════════════════════════════════════════════════════════

-- Insert system configuration (if needed)
-- INSERT INTO system_config (key, value) VALUES ('schema_version', '16.0');

-- ═══════════════════════════════════════════════════════════════════════════════════
-- GRANTS (Adjust as needed for your environment)
-- ═══════════════════════════════════════════════════════════════════════════════════

-- Example: Create application user
-- CREATE USER IF NOT EXISTS 'serpifai_app'@'%' IDENTIFIED BY 'your_secure_password';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON serpifai_oracle.* TO 'serpifai_app'@'%';
-- GRANT EXECUTE ON serpifai_oracle.* TO 'serpifai_app'@'%';
-- FLUSH PRIVILEGES;

-- ═══════════════════════════════════════════════════════════════════════════════════
-- SCHEMA COMPLETE
-- ═══════════════════════════════════════════════════════════════════════════════════

SELECT 'SerpifAI Oracle v16.0 Schema Initialized Successfully!' AS status;
SELECT 
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'serpifai_oracle') AS tables_created,
  (SELECT COUNT(*) FROM information_schema.views WHERE table_schema = 'serpifai_oracle') AS views_created,
  (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'serpifai_oracle') AS procedures_created;
