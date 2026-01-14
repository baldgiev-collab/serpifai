/**
 * ═══════════════════════════════════════════════════════════════════════════
 * USER PROJECTS TAB SETUP - 90-Column Structure
 * ═══════════════════════════════════════════════════════════════════════════
 * Creates the proper User_Projects tab with individual columns for all 81 fields
 * This is the CORRECT structure for auto-population and data management
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * STEP 1: Run this function FIRST to create the User_Projects tab
 * This sets up the proper 90-column structure
 */
function setupUserProjectsTab() {
  try {
    Logger.log('');
    Logger.log('═══════════════════════════════════════════════════════════');
    Logger.log('🚀 SETTING UP USER_PROJECTS TAB (90-Column Structure)');
    Logger.log('═══════════════════════════════════════════════════════════');
    
    // Get master spreadsheet
    const ss = getOrCreateMasterSpreadsheet();
    
    if (!ss) {
      Logger.log('❌ Master spreadsheet not found. Run setupMasterSpreadsheet() first.');
      return {
        success: false,
        error: 'Master spreadsheet not configured'
      };
    }
    
    Logger.log('✅ Master spreadsheet: ' + ss.getName());
    Logger.log('   URL: ' + ss.getUrl());
    
    // Get or create User_Projects tab
    let sheet = ss.getSheetByName('📝 User_Projects');
    
    if (sheet && sheet.getLastRow() > 0) {
      Logger.log('⚠️  User_Projects tab already exists with data');
      Logger.log('   Would you like to:');
      Logger.log('   1. Keep existing data (do nothing)');
      Logger.log('   2. Clear and recreate (run clearAndRecreateUserProjects())');
      return {
        success: true,
        message: 'Tab already exists',
        url: ss.getUrl()
      };
    }
    
    if (!sheet) {
      sheet = ss.insertSheet('📝 User_Projects');
      Logger.log('✅ Created new User_Projects tab');
    }
    
    // Define ALL 90 column headers
    const headers = [
      // Metadata columns (8)
      'Project Name', 
      'Created At', 
      'Last Updated', 
      'Workflow Stage', 
      'Completed Fields', 
      'Total Fields', 
      'Progress %', 
      'Status',
      
      // Stage 1: Market Research & Strategy (18 fields)
      'Brand Ideology', 
      'Brand Archetype', 
      'Quarterly Objective', 
      'Brand Name',
      'Core Topic', 
      'Target Audience', 
      'Audience Pains', 
      'Audience Desired',
      'Key Competitors', 
      'Offer Matrix', 
      'Primary Offer Name', 
      'Primary Offer Price',
      'Upsell Offer', 
      'Upsell Price', 
      'UVP', 
      'Primary Channels', 
      'North Star KPIs', 
      'Brand Lexicon',
      
      // Stage 2: Keyword Discovery (10 fields)
      'Core Strategic Question', 
      'Thesis', 
      'Antithesis', 
      'Key Market Data', 
      'Category Definition',
      'Core Market Problem', 
      'Future Vision', 
      'Primary Keyword', 
      'Secondary Keywords', 
      'Keywords Entities',
      
      // Stage 3: Clustering & Architecture (10 fields)
      'Asset Title', 
      'Foundational Pillars', 
      'Campaign Narrative', 
      'Pillar Context',
      'Parent Pillar URL', 
      'Child Spoke URLs', 
      'Internal Linking Strategy',
      'Funnel Stage', 
      'Timeframe Plan', 
      'Content Type',
      
      // Stage 4: Content Calendar (3 fields)
      'Calendar Horizon', 
      'Posts Per Week', 
      'Visual Hooks',
      
      // Stage 5: Content Generation & E-E-A-T (32 fields)
      'Content Format', 
      'Content Subcategory', 
      'Persuasion Framework', 
      'Unique Mechanism',
      'Readability Directives', 
      'Platform Context', 
      'Forbidden Terms', 
      'AI Persona Context',
      'Schema Article', 
      'Schema FAQ', 
      'Author Bio', 
      'Primary Source 1', 
      'Primary Source 2',
      'Expert Quote 1', 
      'Expert Quote 2', 
      'Proprietary Data', 
      'Case Study 1', 
      'Case Study 2', 
      'Case Study 3',
      'Trust Anchors', 
      'Social Proof', 
      'Testimonial 1', 
      'Testimonial 2', 
      'Lead Magnet Name',
      'Bundle 1 Name', 
      'Bundle 1 Value', 
      'Bundle 2 Name', 
      'Bundle 2 Value',
      'Bundle 3 Name', 
      'Bundle 3 Value', 
      'Bundle 4 Name', 
      'Bundle 4 Value',
      
      // Legacy/QA fields (15 fields)
      'Comp Market Intelligence', 
      'Comp Brand Positioning', 
      'Comp Technical SEO', 
      'Comp Organic Content',
      'Comp Keyword Entity', 
      'Comp Content Ops', 
      'Comp Conversion', 
      'Comp Distribution',
      'Comp Audience Psych', 
      'Comp GEO/AEO', 
      'Comp Authority', 
      'Comp Performance',
      'Comp Opportunity', 
      'Comp Scoring Engine', 
      'Comp Exec Deliverables',
      
      // Full JSON backup (1 field)
      'JSON Backup (Full Data)'
    ];
    
    Logger.log('📋 Creating ' + headers.length + ' columns...');
    
    // Set headers
    sheet.clear();
    sheet.appendRow(headers);
    
    // Format header row
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#1a73e8');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');
    headerRange.setFontSize(10);
    headerRange.setHorizontalAlignment('center');
    headerRange.setVerticalAlignment('middle');
    
    // Set column widths
    sheet.setColumnWidth(1, 150);  // Project Name
    sheet.setColumnWidth(2, 180);  // Created At
    sheet.setColumnWidth(3, 180);  // Last Updated
    sheet.setColumnWidth(4, 120);  // Workflow Stage
    sheet.setColumnWidth(5, 120);  // Completed Fields
    sheet.setColumnWidth(6, 100);  // Total Fields
    sheet.setColumnWidth(7, 100);  // Progress %
    sheet.setColumnWidth(8, 100);  // Status
    
    // Set default width for field columns
    for (let i = 9; i <= headers.length - 1; i++) {
      sheet.setColumnWidth(i, 200);
    }
    
    // JSON backup column (last)
    sheet.setColumnWidth(headers.length, 100);
    
    // Freeze header row and first column
    sheet.setFrozenRows(1);
    sheet.setFrozenColumns(1);
    
    // Add data validation for Status column (H)
    const statusRange = sheet.getRange(2, 8, 1000, 1);
    const statusRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['New', 'In Progress', 'Complete', 'Archived'], true)
      .setAllowInvalid(false)
      .build();
    statusRange.setDataValidation(statusRule);
    
    // Add data validation for Workflow Stage column (D)
    const stageRange = sheet.getRange(2, 4, 1000, 1);
    const stageRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['Setup', 'Stage 1', 'Stage 2', 'Stage 3', 'Stage 4', 'Stage 5'], true)
      .setAllowInvalid(false)
      .build();
    stageRange.setDataValidation(stageRule);
    
    // Add conditional formatting for Progress %
    const progressRange = sheet.getRange(2, 7, 1000, 1);
    const progressRules = [
      SpreadsheetApp.newConditionalFormatRule()
        .whenNumberGreaterThanOrEqualTo(80)
        .setBackground('#34a853')
        .setFontColor('#ffffff')
        .setRanges([progressRange])
        .build(),
      SpreadsheetApp.newConditionalFormatRule()
        .whenNumberBetween(50, 79)
        .setBackground('#fbbc04')
        .setFontColor('#000000')
        .setRanges([progressRange])
        .build(),
      SpreadsheetApp.newConditionalFormatRule()
        .whenNumberLessThan(50)
        .setBackground('#ea4335')
        .setFontColor('#ffffff')
        .setRanges([progressRange])
        .build()
    ];
    sheet.setConditionalFormatRules(progressRules);
    
    Logger.log('');
    Logger.log('✅ SUCCESS! User_Projects tab created');
    Logger.log('');
    Logger.log('📊 STRUCTURE:');
    Logger.log('   ├─ Metadata columns: 8');
    Logger.log('   ├─ Stage 1 (Market Research): 18 fields');
    Logger.log('   ├─ Stage 2 (Keywords): 10 fields');
    Logger.log('   ├─ Stage 3 (Architecture): 10 fields');
    Logger.log('   ├─ Stage 4 (Calendar): 3 fields');
    Logger.log('   ├─ Stage 5 (Generation): 32 fields');
    Logger.log('   ├─ QA/Competitor: 15 fields');
    Logger.log('   └─ JSON Backup: 1 field');
    Logger.log('   ═══════════════════════════');
    Logger.log('   TOTAL: ' + headers.length + ' columns');
    Logger.log('');
    Logger.log('🎯 NEXT STEPS:');
    Logger.log('   1. Run resaveExistingProjects() to migrate your 2 projects');
    Logger.log('   2. Test auto-population from dropdown');
    Logger.log('   3. Verify all 81 fields populate correctly');
    Logger.log('');
    Logger.log('═══════════════════════════════════════════════════════════');
    
    return {
      success: true,
      columns: headers.length,
      url: ss.getUrl(),
      sheetName: '📝 User_Projects'
    };
    
  } catch (e) {
    Logger.log('❌ ERROR: ' + e.toString());
    Logger.log('   Stack: ' + e.stack);
    return {
      success: false,
      error: e.toString()
    };
  }
}

/**
 * STEP 2: Run this to re-save your existing projects to the new structure
 * This will take your current project data and save it properly to User_Projects
 */
function resaveExistingProjects() {
  try {
    Logger.log('');
    Logger.log('═══════════════════════════════════════════════════════════');
    Logger.log('🔄 RE-SAVING EXISTING PROJECTS TO NEW STRUCTURE');
    Logger.log('═══════════════════════════════════════════════════════════');
    
    const ss = getOrCreateMasterSpreadsheet();
    const oldSheet = ss.getSheetByName('📊 Master_Projects');
    const newSheet = ss.getSheetByName('📝 User_Projects');
    
    if (!oldSheet) {
      Logger.log('⚠️  No Master_Projects tab found - nothing to migrate');
      return { success: false, error: 'No old data found' };
    }
    
    if (!newSheet) {
      Logger.log('❌ User_Projects tab not found. Run setupUserProjectsTab() first.');
      return { success: false, error: 'User_Projects tab not created' };
    }
    
    // Get old data
    const oldData = oldSheet.getDataRange().getValues();
    
    if (oldData.length <= 1) {
      Logger.log('⚠️  No projects found in Master_Projects');
      return { success: true, message: 'No projects to migrate' };
    }
    
    Logger.log('📊 Found ' + (oldData.length - 1) + ' projects in old structure');
    Logger.log('');
    
    let migratedCount = 0;
    let failedCount = 0;
    
    // Skip header row
    for (let i = 1; i < oldData.length; i++) {
      const row = oldData[i];
      const projectName = row[0]; // Column A: Project ID
      
      if (!projectName || projectName.trim() === '') {
        Logger.log(`⚠️  Row ${i+1}: Skipping - no project name`);
        failedCount++;
        continue;
      }
      
      Logger.log('');
      Logger.log(`[${i}/${oldData.length-1}] Processing: ${projectName}`);
      
      try {
        // Extract what we can from old format
        const projectData = {
          projectName: projectName,
          createdAt: row[1] || new Date().toISOString(),
          workflowStage: row[3] || 'Setup',
          
          // Try to extract fields from the text columns
          // Columns 9-24 seem to have some data
          brandIdeology: row[8] || '',
          brandArchetype: row[9] || '',
          quarterlyObjective: row[10] || '',
          brandName: row[11] || projectName,
          coreTopic: row[12] || '',
          targetAudience: row[13] || '',
          audiencePains: row[14] || '',
          audienceDesired: row[15] || '',
          keyCompetitors: row[16] || '',
          offerMatrix: row[17] || '',
          primaryOfferName: row[18] || '',
          primaryOfferPrice: row[19] || '',
          upsellOffer: row[20] || '',
          upsellPrice: row[21] || '',
          uvp: row[22] || '',
          primaryChannels: row[23] || '',
          northStarKpis: row[24] || '',
          brandLexicon: row[25] || ''
        };
        
        // Save using the Dual manager (which has correct structure)
        const result = saveProjectToMasterSheet(projectName, projectData);
        
        if (result.success) {
          migratedCount++;
          Logger.log(`   ✅ Migrated successfully`);
        } else {
          failedCount++;
          Logger.log(`   ❌ Failed: ${result.error}`);
        }
        
      } catch (e) {
        failedCount++;
        Logger.log(`   ❌ Error: ${e.toString()}`);
      }
    }
    
    Logger.log('');
    Logger.log('═══════════════════════════════════════════════════════════');
    Logger.log('📊 MIGRATION COMPLETE');
    Logger.log('═══════════════════════════════════════════════════════════');
    Logger.log(`   ✅ Migrated: ${migratedCount} projects`);
    Logger.log(`   ❌ Failed: ${failedCount} projects`);
    Logger.log('');
    Logger.log('🎯 NEXT: Test auto-population by selecting a project from dropdown');
    Logger.log('═══════════════════════════════════════════════════════════');
    
    return {
      success: true,
      migrated: migratedCount,
      failed: failedCount
    };
    
  } catch (e) {
    Logger.log('❌ MIGRATION ERROR: ' + e.toString());
    return {
      success: false,
      error: e.toString()
    };
  }
}

/**
 * OPTIONAL: Clear and recreate User_Projects tab (if you need to start fresh)
 */
function clearAndRecreateUserProjects() {
  try {
    const ss = getOrCreateMasterSpreadsheet();
    const sheet = ss.getSheetByName('📝 User_Projects');
    
    if (sheet) {
      ss.deleteSheet(sheet);
      Logger.log('🗑️  Deleted existing User_Projects tab');
    }
    
    // Now recreate it
    return setupUserProjectsTab();
    
  } catch (e) {
    Logger.log('❌ ERROR: ' + e.toString());
    return { success: false, error: e.toString() };
  }
}

/**
 * DIAGNOSTIC: Check current structure
 */
function checkCurrentStructure() {
  try {
    Logger.log('');
    Logger.log('═══════════════════════════════════════════════════════════');
    Logger.log('🔍 CHECKING CURRENT GSHEET STRUCTURE');
    Logger.log('═══════════════════════════════════════════════════════════');
    
    const ss = getOrCreateMasterSpreadsheet();
    
    if (!ss) {
      Logger.log('❌ Master spreadsheet not found');
      return;
    }
    
    Logger.log('✅ Master spreadsheet: ' + ss.getName());
    Logger.log('   URL: ' + ss.getUrl());
    Logger.log('');
    
    const sheets = ss.getSheets();
    Logger.log('📊 Found ' + sheets.length + ' tabs:');
    Logger.log('');
    
    sheets.forEach((sheet, index) => {
      const name = sheet.getName();
      const rows = sheet.getLastRow();
      const cols = sheet.getLastColumn();
      
      Logger.log(`${index + 1}. ${name}`);
      Logger.log(`   Rows: ${rows} | Columns: ${cols}`);
      
      if (rows > 0 && cols > 0) {
        const headers = sheet.getRange(1, 1, 1, Math.min(cols, 10)).getValues()[0];
        Logger.log(`   First 10 columns: ${headers.join(', ')}`);
      }
      
      Logger.log('');
    });
    
    // Check specific tabs
    const masterProjects = ss.getSheetByName('📊 Master_Projects');
    const userProjects = ss.getSheetByName('📝 User_Projects');
    
    Logger.log('═══════════════════════════════════════════════════════════');
    Logger.log('STATUS:');
    Logger.log('═══════════════════════════════════════════════════════════');
    
    if (masterProjects) {
      const rows = masterProjects.getLastRow() - 1;
      Logger.log('📊 Master_Projects (OLD structure):');
      Logger.log(`   ✅ Exists | ${masterProjects.getLastColumn()} columns | ${rows} projects`);
    } else {
      Logger.log('📊 Master_Projects: ❌ Not found');
    }
    
    if (userProjects) {
      const rows = userProjects.getLastRow() - 1;
      Logger.log('📝 User_Projects (NEW structure):');
      Logger.log(`   ✅ Exists | ${userProjects.getLastColumn()} columns | ${rows} projects`);
      
      if (userProjects.getLastColumn() === 90) {
        Logger.log('   ✅ CORRECT 90-column structure!');
      } else {
        Logger.log('   ⚠️  Expected 90 columns, found ' + userProjects.getLastColumn());
      }
    } else {
      Logger.log('📝 User_Projects: ❌ Not found');
      Logger.log('   ▶️  Run setupUserProjectsTab() to create it');
    }
    
    Logger.log('═══════════════════════════════════════════════════════════');
    
  } catch (e) {
    Logger.log('❌ ERROR: ' + e.toString());
  }
}
