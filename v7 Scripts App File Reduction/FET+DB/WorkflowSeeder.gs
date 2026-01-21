/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * WORKFLOW SEEDER - ORACLE ELITE v35.0
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 
 * MISSION: Bridge job_results to workflow_log and project_data tables
 * TRIGGER: Fires when 6th competitor is saved to job_results
 * 
 * This is the SOURCE OF TRUTH for the "Project Plan" in Stage 1
 * 
 * SQL Flow:
 *   1. Monitor job_results for completion (6 competitors)
 *   2. Extract "Opportunity" rows from analysis data
 *   3. Copy to workflow_log table
 *   4. Copy to project_data table
 *   5. Mark workflow as ready for Stage 1
 * 
 * @module WorkflowSeeder
 * @version 35.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════════════
// MAIN SEEDER FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Check if job is ready for workflow seeding and execute
 * Called after each competitor persistence
 * 
 * @param {string} jobToken - Current job token
 * @param {number} [targetCount=6] - Number of competitors needed to trigger seeding
 * @returns {Object} Seeding result
 */
function WF_checkAndSeed(jobToken, targetCount = 6) {
  console.log('[WF_Seeder] ═══════════════════════════════════════════════════════════════');
  console.log('[WF_Seeder] 🌱 Checking if job is ready for workflow seeding');
  console.log('[WF_Seeder] Job Token:', jobToken);
  console.log('[WF_Seeder] Target Count:', targetCount);
  console.log('[WF_Seeder] ═══════════════════════════════════════════════════════════════');
  
  const result = {
    success: false,
    triggered: false,
    jobToken: jobToken,
    competitorsReady: 0,
    opportunitiesSeeded: 0,
    workflowLogEntries: 0,
    projectDataEntries: 0,
    timestamp: new Date().toISOString()
  };
  
  try {
    // Step 1: Count completed competitors in job_results
    const countResponse = callGateway('wf_count_completed_competitors', {
      job_token: jobToken
    });
    
    if (!countResponse?.success) {
      console.log('[WF_Seeder] Could not get competitor count');
      return result;
    }
    
    result.competitorsReady = countResponse.count || 0;
    console.log(`[WF_Seeder] Competitors ready: ${result.competitorsReady}/${targetCount}`);
    
    // Step 2: Check if we've reached the threshold
    if (result.competitorsReady < targetCount) {
      console.log('[WF_Seeder] Not enough competitors yet, skipping seeding');
      return result;
    }
    
    // Step 3: Check if already seeded (prevent duplicates)
    const seedCheckResponse = callGateway('wf_check_already_seeded', {
      job_token: jobToken
    });
    
    if (seedCheckResponse?.already_seeded) {
      console.log('[WF_Seeder] Job already seeded, skipping');
      result.success = true;
      result.alreadySeeded = true;
      return result;
    }
    
    // Step 4: Extract opportunities from job_results
    console.log('[WF_Seeder] 🚀 Threshold reached! Starting workflow seeding...');
    result.triggered = true;
    
    const opportunities = WF_extractOpportunities(jobToken);
    console.log(`[WF_Seeder] Extracted ${opportunities.length} opportunities`);
    
    // Step 5: Seed workflow_log table
    const workflowResult = WF_seedWorkflowLog(jobToken, opportunities);
    result.workflowLogEntries = workflowResult.inserted;
    
    // Step 6: Seed project_data table
    const projectResult = WF_seedProjectData(jobToken, opportunities);
    result.projectDataEntries = projectResult.inserted;
    
    // Step 7: Mark job as seeded
    WF_markAsSeeded(jobToken);
    
    result.success = true;
    result.opportunitiesSeeded = opportunities.length;
    
    console.log('[WF_Seeder] ═══════════════════════════════════════════════════════════════');
    console.log('[WF_Seeder] ✅ Workflow seeding complete!');
    console.log(`[WF_Seeder] workflow_log entries: ${result.workflowLogEntries}`);
    console.log(`[WF_Seeder] project_data entries: ${result.projectDataEntries}`);
    console.log('[WF_Seeder] ═══════════════════════════════════════════════════════════════');
    
  } catch (error) {
    console.error('[WF_Seeder] ❌ Seeding failed:', error.message);
    result.error = error.message;
  }
  
  return result;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// OPPORTUNITY EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Extract opportunity data from job_results
 * Looks for strategic audit, quick wins, and gaps
 * 
 * @param {string} jobToken - Job token
 * @returns {Array} Array of opportunity objects
 */
function WF_extractOpportunities(jobToken) {
  const opportunities = [];
  
  // Query job_results for FINAL and STRATEGIC_AUDIT types
  const response = callGateway('wf_get_job_results_for_seeding', {
    job_token: jobToken,
    result_types: ['FINAL', 'STRATEGIC_AUDIT']
  });
  
  if (!response?.success || !response.results) {
    console.log('[WF_Seeder] No results found for extraction');
    return opportunities;
  }
  
  response.results.forEach(result => {
    try {
      const data = typeof result.data === 'string' ? JSON.parse(result.data) : result.data;
      const domain = result.domain || data.domain || 'unknown';
      
      // Extract from strategicAudit
      if (data.strategicAudit) {
        // Programmatic Moat opportunities
        if (data.strategicAudit.programmaticMoat?.isProgrammatic) {
          opportunities.push({
            type: 'PROGRAMMATIC_MOAT',
            domain: domain,
            priority: 'HIGH',
            title: `${domain} uses programmatic SEO`,
            description: `Template similarity: ${data.strategicAudit.programmaticMoat.templateSimilarity}%`,
            confidence: data.strategicAudit.programmaticMoat.confidence || 75,
            actionItems: ['Analyze template patterns', 'Identify scalable content opportunities'],
            sourceTable: 'job_results',
            sourceResultId: result.result_id
          });
        }
        
        // Emotional Debt gaps
        if (data.strategicAudit.emotionalDebt?.gaps?.length > 0) {
          data.strategicAudit.emotionalDebt.gaps.forEach(gap => {
            opportunities.push({
              type: 'EMOTIONAL_GAP',
              domain: domain,
              priority: gap.priority || 'MEDIUM',
              title: gap.title || `Emotional gap in ${domain}`,
              description: gap.description || gap.text || '',
              confidence: 70,
              actionItems: [gap.recommendation || 'Address emotional friction'],
              sourceTable: 'job_results',
              sourceResultId: result.result_id
            });
          });
        }
        
        // Semantic triplet opportunities
        if (data.strategicAudit.semanticTriplets?.triplets?.length > 0) {
          const tripletCount = data.strategicAudit.semanticTriplets.triplets.length;
          opportunities.push({
            type: 'SEMANTIC_OPPORTUNITY',
            domain: domain,
            priority: tripletCount > 10 ? 'HIGH' : 'MEDIUM',
            title: `${tripletCount} semantic relationships identified`,
            description: `Topic clusters: ${data.strategicAudit.semanticTriplets.topicClusters?.length || 0}`,
            confidence: data.strategicAudit.semanticTriplets.confidence || 65,
            actionItems: ['Map entity relationships', 'Build topical authority content'],
            sourceTable: 'job_results',
            sourceResultId: result.result_id
          });
        }
      }
      
      // Extract from keyword data
      if (data.keywords?.quickWins?.length > 0) {
        data.keywords.quickWins.slice(0, 5).forEach(kw => {
          opportunities.push({
            type: 'KEYWORD_QUICK_WIN',
            domain: domain,
            priority: 'HIGH',
            title: kw.keyword || kw,
            description: `Position: ${kw.position || 'N/A'}, Volume: ${kw.volume || 'N/A'}`,
            confidence: 85,
            actionItems: ['Optimize existing content', 'Create targeted page'],
            sourceTable: 'job_results',
            sourceResultId: result.result_id
          });
        });
      }
      
      // Extract content gaps
      if (data.content?.gaps?.length > 0) {
        data.content.gaps.slice(0, 5).forEach(gap => {
          opportunities.push({
            type: 'CONTENT_GAP',
            domain: domain,
            priority: gap.priority || 'MEDIUM',
            title: gap.topic || gap.title || 'Content gap',
            description: gap.description || '',
            confidence: 75,
            actionItems: ['Create content to fill gap'],
            sourceTable: 'job_results',
            sourceResultId: result.result_id
          });
        });
      }
      
      // Extract backlink opportunities
      if (data.backlinks?.opportunities?.length > 0) {
        data.backlinks.opportunities.slice(0, 3).forEach(opp => {
          opportunities.push({
            type: 'BACKLINK_OPPORTUNITY',
            domain: domain,
            priority: opp.priority || 'MEDIUM',
            title: `Backlink opportunity: ${opp.source || opp.domain || 'Unknown'}`,
            description: opp.description || `DR: ${opp.dr || 'N/A'}`,
            confidence: 70,
            actionItems: ['Outreach for link building'],
            sourceTable: 'job_results',
            sourceResultId: result.result_id
          });
        });
      }
      
    } catch (e) {
      console.log(`[WF_Seeder] Error parsing result: ${e.message}`);
    }
  });
  
  return opportunities;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// TABLE SEEDING FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Seed workflow_log table with opportunities
 * 
 * @param {string} jobToken - Job token
 * @param {Array} opportunities - Extracted opportunities
 * @returns {Object} Seeding result
 */
function WF_seedWorkflowLog(jobToken, opportunities) {
  console.log(`[WF_Seeder] Seeding workflow_log with ${opportunities.length} entries`);
  
  const entries = opportunities.map((opp, index) => ({
    job_token: jobToken,
    step_number: index + 1,
    step_type: opp.type,
    step_status: 'PENDING',
    step_title: opp.title,
    step_description: opp.description,
    priority: opp.priority,
    confidence: opp.confidence,
    target_domain: opp.domain,
    action_items_json: JSON.stringify(opp.actionItems || []),
    metadata_json: JSON.stringify({
      sourceTable: opp.sourceTable,
      sourceResultId: opp.sourceResultId,
      createdAt: new Date().toISOString()
    })
  }));
  
  const response = callGateway('wf_seed_workflow_log', {
    job_token: jobToken,
    entries: entries
  });
  
  return {
    success: response?.success || false,
    inserted: response?.inserted_count || 0
  };
}

/**
 * Seed project_data table for Stage 1 "Project Plan"
 * 
 * @param {string} jobToken - Job token
 * @param {Array} opportunities - Extracted opportunities
 * @returns {Object} Seeding result
 */
function WF_seedProjectData(jobToken, opportunities) {
  console.log(`[WF_Seeder] Seeding project_data for Stage 1 Project Plan`);
  
  // Group opportunities by type
  const grouped = {};
  opportunities.forEach(opp => {
    if (!grouped[opp.type]) grouped[opp.type] = [];
    grouped[opp.type].push(opp);
  });
  
  // Build project plan structure
  const projectPlan = {
    jobToken: jobToken,
    generatedAt: new Date().toISOString(),
    totalOpportunities: opportunities.length,
    opportunitiesByType: grouped,
    highPriorityCount: opportunities.filter(o => o.priority === 'HIGH').length,
    mediumPriorityCount: opportunities.filter(o => o.priority === 'MEDIUM').length,
    lowPriorityCount: opportunities.filter(o => o.priority === 'LOW').length,
    
    // Stage 1 specific structure
    stage1: {
      phase: 'DISCOVERY',
      status: 'READY',
      tasks: opportunities.slice(0, 10).map((opp, i) => ({
        taskId: `task_${i + 1}`,
        title: opp.title,
        type: opp.type,
        priority: opp.priority,
        status: 'TODO',
        domain: opp.domain,
        actionItems: opp.actionItems
      }))
    },
    
    // Quick actions for UI
    quickActions: opportunities
      .filter(o => o.priority === 'HIGH')
      .slice(0, 5)
      .map(o => ({
        title: o.title,
        type: o.type,
        domain: o.domain
      }))
  };
  
  const response = callGateway('wf_seed_project_data', {
    job_token: jobToken,
    data_type: 'PROJECT_PLAN',
    data_json: JSON.stringify(projectPlan)
  });
  
  return {
    success: response?.success || false,
    inserted: response?.success ? 1 : 0
  };
}

/**
 * Mark job as seeded to prevent duplicate seeding
 */
function WF_markAsSeeded(jobToken) {
  callGateway('wf_mark_job_seeded', {
    job_token: jobToken,
    seeded_at: new Date().toISOString()
  });
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// v36.0: SEEDER IGNITE STAGE 1 - Kill Moves → Strategic Priorities
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Seeder_IgniteStage1 - Trigger Stage 1 workflow and populate strategic priorities
 * 
 * This function is called when job_results hits competitor_count.
 * It extracts kill_moves from ai_analysis and maps them to project_data.strategic_priorities
 * 
 * @param {string} jobToken - Job token
 * @param {string} projectId - Project ID (optional, will lookup if not provided)
 * @returns {Object} Ignition result
 */
function Seeder_IgniteStage1(jobToken, projectId) {
  console.log('[IGNITE] ═══════════════════════════════════════════════════════════════════');
  console.log('[IGNITE] 🔥 STAGE 1 IGNITION SEQUENCE INITIATED');
  console.log('[IGNITE] Job Token:', jobToken);
  console.log('[IGNITE] ═══════════════════════════════════════════════════════════════════');
  
  const result = {
    success: false,
    jobToken: jobToken,
    projectId: projectId || null,
    killMovesExtracted: 0,
    strategicPrioritiesSet: 0,
    workflowReady: false,
    timestamp: new Date().toISOString()
  };
  
  try {
    // Step 1: Get kill_moves from ai_analysis table
    console.log('[IGNITE] Step 1: Extracting kill moves from ai_analysis...');
    const killMovesResponse = callGateway('upp_query', {
      table: 'ai_analysis',
      conditions: { job_token: jobToken },
      columns: ['domain', 'competitor_id', 'kill_moves', 'content_gaps', 'recommendations', 'composite_score']
    });
    
    if (!killMovesResponse?.success || !killMovesResponse.results?.length) {
      console.log('[IGNITE] No ai_analysis data found, checking job_results...');
      // Fallback to job_results
      return WF_checkAndSeed(jobToken, 1);
    }
    
    // Step 2: Extract and rank kill moves
    const allKillMoves = [];
    killMovesResponse.results.forEach(row => {
      const killMoves = parseJsonSafe(row.kill_moves, []);
      const contentGaps = parseJsonSafe(row.content_gaps, []);
      const recommendations = parseJsonSafe(row.recommendations, []);
      
      // Kill moves are highest priority
      killMoves.forEach((move, index) => {
        allKillMoves.push({
          type: 'KILL_MOVE',
          priority: index === 0 ? 'CRITICAL' : 'HIGH',
          domain: row.domain,
          title: move.title || move.action || move,
          description: move.description || move.rationale || '',
          impact: move.impact || 'HIGH',
          effort: move.effort || 'MEDIUM',
          confidence: move.confidence || 90,
          sourceTable: 'ai_analysis',
          sourceId: row.competitor_id
        });
      });
      
      // Content gaps are high priority
      contentGaps.slice(0, 3).forEach(gap => {
        allKillMoves.push({
          type: 'CONTENT_GAP',
          priority: 'HIGH',
          domain: row.domain,
          title: gap.topic || gap.title || gap,
          description: gap.description || '',
          impact: 'MEDIUM',
          effort: 'MEDIUM',
          confidence: 75,
          sourceTable: 'ai_analysis',
          sourceId: row.competitor_id
        });
      });
      
      // Recommendations are medium priority
      recommendations.slice(0, 2).forEach(rec => {
        allKillMoves.push({
          type: 'RECOMMENDATION',
          priority: 'MEDIUM',
          domain: row.domain,
          title: rec.title || rec.action || rec,
          description: rec.description || rec.rationale || '',
          impact: 'MEDIUM',
          effort: rec.effort || 'LOW',
          confidence: 70,
          sourceTable: 'ai_analysis',
          sourceId: row.competitor_id
        });
      });
    });
    
    result.killMovesExtracted = allKillMoves.length;
    console.log(`[IGNITE] Extracted ${allKillMoves.length} kill moves and opportunities`);
    
    // Step 3: Build strategic priorities (ranked by priority + confidence)
    const strategicPriorities = allKillMoves
      .sort((a, b) => {
        const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        const pDiff = (priorityOrder[a.priority] || 9) - (priorityOrder[b.priority] || 9);
        if (pDiff !== 0) return pDiff;
        return (b.confidence || 0) - (a.confidence || 0);
      })
      .slice(0, 10); // Top 10 strategic priorities
    
    // Step 4: Commit to project_data.strategic_priorities via UPP
    console.log('[IGNITE] Step 4: Committing strategic priorities to project_data...');
    
    if (typeof UPP_commit === 'function') {
      UPP_commit({
        table: 'project_data',
        job_token: jobToken,
        project_id: projectId || jobToken,
        strategic_priorities: strategicPriorities,
        stage1_status: 'READY',
        stage1_ready_at: new Date().toISOString(),
        kill_moves_summary: {
          total: allKillMoves.length,
          critical: allKillMoves.filter(m => m.priority === 'CRITICAL').length,
          high: allKillMoves.filter(m => m.priority === 'HIGH').length,
          medium: allKillMoves.filter(m => m.priority === 'MEDIUM').length,
          byDomain: allKillMoves.reduce((acc, m) => {
            acc[m.domain] = (acc[m.domain] || 0) + 1;
            return acc;
          }, {})
        }
      });
      
      result.strategicPrioritiesSet = strategicPriorities.length;
      console.log(`[IGNITE] ✅ Strategic priorities committed: ${strategicPriorities.length}`);
    }
    
    // Step 5: Seed workflow_log for Stage 1 tasks
    console.log('[IGNITE] Step 5: Seeding workflow_log...');
    const workflowResult = WF_seedWorkflowLog(jobToken, strategicPriorities);
    
    // Step 6: Mark Stage 1 as ready
    callGateway('wf_update_stage_status', {
      job_token: jobToken,
      stage: 'STAGE_1',
      status: 'READY',
      ready_at: new Date().toISOString()
    });
    
    result.success = true;
    result.workflowReady = true;
    
    console.log('[IGNITE] ═══════════════════════════════════════════════════════════════════');
    console.log('[IGNITE] ✅ STAGE 1 IGNITION COMPLETE');
    console.log(`[IGNITE] Kill moves extracted: ${result.killMovesExtracted}`);
    console.log(`[IGNITE] Strategic priorities set: ${result.strategicPrioritiesSet}`);
    console.log(`[IGNITE] Workflow ready: ${result.workflowReady}`);
    console.log('[IGNITE] ═══════════════════════════════════════════════════════════════════');
    
  } catch (error) {
    console.error('[IGNITE] ❌ Ignition failed:', error.message);
    result.error = error.message;
  }
  
  return result;
}

/**
 * Helper: Parse JSON safely
 */
function parseJsonSafe(value, defaultValue) {
  if (!value) return defaultValue;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch (e) {
    return defaultValue;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// MANUAL TRIGGER FOR TESTING
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Force re-seed workflow data for a job
 * Useful for testing or recovery
 * 
 * @param {string} jobToken - Job token to re-seed
 * @returns {Object} Seeding result
 */
function WF_forceReseed(jobToken) {
  console.log('[WF_Seeder] Force re-seeding job:', jobToken);
  
  // Clear existing seeded flag
  callGateway('wf_clear_seeded_flag', {
    job_token: jobToken
  });
  
  // Clear existing workflow entries
  callGateway('wf_clear_workflow_entries', {
    job_token: jobToken
  });
  
  // Re-run seeding with forced count
  return WF_checkAndSeed(jobToken, 1); // Trigger with count of 1 to force
}

/**
 * Get workflow status for a job
 * 
 * @param {string} jobToken - Job token
 * @returns {Object} Workflow status
 */
function WF_getWorkflowStatus(jobToken) {
  const response = callGateway('wf_get_workflow_status', {
    job_token: jobToken
  });
  
  return {
    jobToken: jobToken,
    isSeeded: response?.is_seeded || false,
    seededAt: response?.seeded_at || null,
    workflowLogCount: response?.workflow_log_count || 0,
    projectDataExists: response?.project_data_exists || false,
    stage1Ready: response?.stage1_ready || false
  };
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════

if (typeof globalThis !== 'undefined') {
  globalThis.WF_checkAndSeed = WF_checkAndSeed;
  globalThis.WF_forceReseed = WF_forceReseed;
  globalThis.WF_getWorkflowStatus = WF_getWorkflowStatus;
  globalThis.Seeder_IgniteStage1 = Seeder_IgniteStage1;
}
