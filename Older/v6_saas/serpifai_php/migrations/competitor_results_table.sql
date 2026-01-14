-- ═══════════════════════════════════════════════════════════════════════════
-- SERPIFAI V6 - CENTRALIZED PROJECT DATA STORAGE
-- ═══════════════════════════════════════════════════════════════════════════
-- Strategic database architecture for storing all project-related data:
-- ✓ Workflow stages and results
-- ✓ Competitor analysis
-- ✓ QA Comprehensive (All quality metrics in one place)
-- ✓ GEO (Generative Engine Optimization - AI search engines)
-- ✓ Local SEO (Separate local search optimization)
-- ✓ API responses and analysis
-- ✓ Complete request/response mapping
-- ═══════════════════════════════════════════════════════════════════════════

-- Main Projects Registry Table
CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    project_id VARCHAR(100) NOT NULL UNIQUE,
    project_name VARCHAR(255),
    project_type ENUM('workflow', 'competitor_analysis', 'qa_audit', 'content_generation', 'other') DEFAULT 'other',
    status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    workflow_stage VARCHAR(100),
    spreadsheet_id VARCHAR(255) COMMENT 'Google Sheets ID for this project',
    input_data JSON COMMENT 'Initial project input/configuration',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_project_id (project_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Project Data Storage (Flexible JSON storage for all data types)
CREATE TABLE IF NOT EXISTS project_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id VARCHAR(100) NOT NULL,
    data_type VARCHAR(50) NOT NULL COMMENT 'competitor_analysis, qa_onpage, qa_geo, qa_aeo, qa_eeat, qa_technical, qa_content, workflow_stage, api_response',
    data_subtype VARCHAR(50) COMMENT 'Further categorization if needed',
    data_json LONGTEXT NOT NULL COMMENT 'Full JSON data payload',
    metadata JSON COMMENT 'Additional metadata (counts, scores, timestamps)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_project_id (project_id),
    INDEX idx_data_type (data_type),
    INDEX idx_created_at (created_at),
    INDEX idx_composite (project_id, data_type, created_at),
    
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Competitor Analysis Results (Specialized table for competitor data)
CREATE TABLE IF NOT EXISTS competitor_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id VARCHAR(100) NOT NULL,
    competitor_domain VARCHAR(255) NOT NULL,
    fetch_success BOOLEAN DEFAULT FALSE,
    page_rank DECIMAL(3,1),
    performance_score INT,
    accessibility_score INT,
    seo_score INT,
    snapshot_json JSON COMMENT 'Full snapshot data from fetcher',
    api_data_json JSON COMMENT 'Serper, PageSpeed, OpenPageRank data',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_project_id (project_id),
    INDEX idx_domain (competitor_domain),
    INDEX idx_created_at (created_at),
    
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- AI Analysis Results (Gemini and other AI outputs)
CREATE TABLE IF NOT EXISTS ai_analysis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id VARCHAR(100) NOT NULL,
    analysis_type VARCHAR(50) NOT NULL COMMENT 'competitor_intel, content_generation, qa_insights, etc',
    model_used VARCHAR(100),
    prompt_text LONGTEXT,
    analysis_text LONGTEXT,
    analysis_json JSON COMMENT 'Structured analysis data',
    tokens_used INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_project_id (project_id),
    INDEX idx_analysis_type (analysis_type),
    INDEX idx_created_at (created_at),
    
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- QA Audit Results (Comprehensive - All metrics in one place)
CREATE TABLE IF NOT EXISTS qa_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id VARCHAR(100) NOT NULL,
    url VARCHAR(1000),
    
    -- Comprehensive QA scores
    overall_qa_score DECIMAL(5,2),
    onpage_score DECIMAL(5,2),
    technical_score DECIMAL(5,2),
    aeo_score DECIMAL(5,2),
    eeat_score DECIMAL(5,2),
    content_score DECIMAL(5,2),
    
    -- All data in JSON
    onpage_data_json JSON COMMENT 'Title, meta, headings, keywords, etc',
    technical_data_json JSON COMMENT 'Speed, Core Web Vitals, mobile, HTTPS, etc',
    aeo_data_json JSON COMMENT 'Featured snippets, FAQ schema, voice search, etc',
    eeat_data_json JSON COMMENT 'Experience, Expertise, Authority, Trust signals',
    content_data_json JSON COMMENT 'Quality, readability, uniqueness, links, etc',
    schema_data_json JSON COMMENT 'All schema types and validation',
    
    issues_json JSON COMMENT 'All identified issues across categories',
    recommendations_json JSON COMMENT 'All actionable recommendations',
    raw_data_json JSON COMMENT 'Complete QA data dump',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_project_id (project_id),
    INDEX idx_url (url(255)),
    INDEX idx_created_at (created_at),
    
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- GEO (Generative Engine Optimization) Results
CREATE TABLE IF NOT EXISTS geo_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id VARCHAR(100) NOT NULL,
    url VARCHAR(1000),
    
    -- GEO-specific scores
    overall_geo_score DECIMAL(5,2),
    ai_visibility_index DECIMAL(5,2),
    generative_readiness DECIMAL(5,2),
    
    -- AI Engine Coverage
    chatgpt_visibility DECIMAL(5,2),
    perplexity_ranking DECIMAL(5,2),
    gemini_citation BOOLEAN,
    claude_reference BOOLEAN,
    
    -- GEO optimization data
    geo_data_json JSON COMMENT 'AI search engine optimization metrics',
    entity_data_json JSON COMMENT 'Entity recognition and knowledge graph',
    conversational_data_json JSON COMMENT 'NLP and conversational optimization',
    
    issues_json JSON COMMENT 'GEO-specific issues',
    recommendations_json JSON COMMENT 'GEO recommendations',
    raw_data_json JSON COMMENT 'Complete GEO data',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_project_id (project_id),
    INDEX idx_url (url(255)),
    INDEX idx_created_at (created_at),
    
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Local SEO Results
CREATE TABLE IF NOT EXISTS local_seo_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id VARCHAR(100) NOT NULL,
    business_name VARCHAR(255),
    
    -- Local SEO scores
    overall_local_score DECIMAL(5,2),
    gbp_score DECIMAL(5,2),
    nap_consistency_score DECIMAL(5,2),
    citation_score DECIMAL(5,2),
    review_score DECIMAL(5,2),
    
    -- Google Business Profile
    gbp_optimized BOOLEAN,
    gbp_verified BOOLEAN,
    gbp_rating DECIMAL(3,2),
    gbp_reviews_count INT,
    
    -- Local optimization data
    gbp_data_json JSON COMMENT 'Google Business Profile metrics',
    nap_data_json JSON COMMENT 'Name, Address, Phone consistency',
    citation_data_json JSON COMMENT 'Local citations and directories',
    review_data_json JSON COMMENT 'Reviews and reputation data',
    local_content_json JSON COMMENT 'Local content and keywords',
    
    issues_json JSON COMMENT 'Local SEO issues',
    recommendations_json JSON COMMENT 'Local SEO recommendations',
    raw_data_json JSON COMMENT 'Complete local SEO data',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_project_id (project_id),
    INDEX idx_business (business_name),
    INDEX idx_created_at (created_at),
    
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Workflow Execution Log
CREATE TABLE IF NOT EXISTS workflow_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id VARCHAR(100) NOT NULL,
    stage_name VARCHAR(100) NOT NULL,
    stage_number INT,
    status ENUM('pending', 'running', 'completed', 'failed') DEFAULT 'pending',
    input_json JSON,
    output_json JSON,
    credits_used INT DEFAULT 0,
    duration_ms INT,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    
    INDEX idx_project_id (project_id),
    INDEX idx_stage (stage_name),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add table comments
ALTER TABLE projects COMMENT = 'Master registry of all projects across all modules';
ALTER TABLE project_data COMMENT = 'Flexible JSON storage for all project-related data';
ALTER TABLE competitor_results COMMENT = 'Structured competitor analysis data';
ALTER TABLE ai_analysis COMMENT = 'AI-generated analysis and insights';
ALTER TABLE qa_results COMMENT = 'Comprehensive quality assurance - all metrics in one place';
ALTER TABLE geo_results COMMENT = 'Generative Engine Optimization - AI search engine visibility';
ALTER TABLE local_seo_results COMMENT = 'Local search optimization and Google Business Profile data';
ALTER TABLE workflow_log COMMENT = 'Execution tracking for multi-stage workflows';

