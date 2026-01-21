/**
 * ═══════════════════════════════════════════════════════════════
 *  DIAG_TabLoading.gs - V43 Tab Loading Diagnostic
 * ═══════════════════════════════════════════════════════════════
 *  Purpose: Diagnose why UI_Tab_Conversion, UI_Tab_Audience, 
 *           and UI_Tab_AuthPerf are not loading properly
 * ═══════════════════════════════════════════════════════════════
 */

/**
 * Main diagnostic function - run this in Apps Script Editor
 */
function DIAG_V43_TabLoading() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('    TAB LOADING DIAGNOSTIC v43.0');
  console.log('═══════════════════════════════════════════════════════════════');
  
  const problemFiles = [
    'UI/UI_Tab_Conversion.html',
    'UI/UI_Tab_Audience.html',
    'UI/UI_Tab_AuthPerf.html'
  ];
  
  const controlFiles = [
    'UI/UI_Tab_Test_V42.html',
    'UI/UI_Tab_Overview.html',
    'UI/UI_Tab_Brand.html'
  ];
  
  console.log('\n📋 TEST 1: INCLUDE() FUNCTION - PROBLEM FILES');
  console.log('────────────────────────────────────────────────');
  
  problemFiles.forEach(file => {
    testIncludeFile(file);
  });
  
  console.log('\n📋 TEST 2: INCLUDE() FUNCTION - CONTROL FILES (should work)');
  console.log('────────────────────────────────────────────────');
  
  controlFiles.forEach(file => {
    testIncludeFile(file);
  });
  
  console.log('\n📋 TEST 3: TEMPLATE EVALUATION DETAILS');
  console.log('────────────────────────────────────────────────');
  
  problemFiles.forEach(file => {
    testTemplateEvaluation(file);
  });
  
  console.log('\n📋 TEST 4: CHECK FOR FUNCTION DEFINITIONS');
  console.log('────────────────────────────────────────────────');
  
  checkFunctionDefinitions();
  
  console.log('\n📋 TEST 5: FILE CONTENT ANALYSIS');
  console.log('────────────────────────────────────────────────');
  
  problemFiles.forEach(file => {
    analyzeFileContent(file);
  });
  
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('    DIAGNOSTIC COMPLETE');
  console.log('═══════════════════════════════════════════════════════════════');
}

/**
 * Test include() on a specific file
 */
function testIncludeFile(filePath) {
  try {
    const startTime = Date.now();
    const template = HtmlService.createTemplateFromFile(filePath);
    const evaluated = template.evaluate();
    const content = evaluated.getContent();
    const elapsed = Date.now() - startTime;
    
    console.log(`  ✅ ${filePath}`);
    console.log(`     Size: ${content.length} chars | Time: ${elapsed}ms`);
    
    // Check if content has script tags
    const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
    if (scriptMatch) {
      console.log(`     Script blocks: ${scriptMatch.length}`);
      
      // Check first 100 chars of first script
      const firstScript = scriptMatch[0].substring(0, 150).replace(/\n/g, '\\n');
      console.log(`     First script preview: ${firstScript}...`);
    } else {
      console.log(`     ⚠️ NO SCRIPT BLOCKS FOUND!`);
    }
    
    return { success: true, size: content.length, content: content };
  } catch (e) {
    console.log(`  ❌ ${filePath}`);
    console.log(`     ERROR: ${e.message}`);
    return { success: false, error: e.message };
  }
}

/**
 * Test template evaluation in detail
 */
function testTemplateEvaluation(filePath) {
  try {
    console.log(`\n  📄 ${filePath}`);
    
    // Step 1: Create template
    const template = HtmlService.createTemplateFromFile(filePath);
    console.log(`     Step 1: Template created ✓`);
    
    // Step 2: Check template properties
    const code = template.getCode();
    console.log(`     Step 2: Template code size: ${code.length} chars`);
    
    // Check for any scriptlets
    const scriptletMatch = code.match(/<\?[\s\S]*?\?>/g);
    if (scriptletMatch) {
      console.log(`     ⚠️ Found ${scriptletMatch.length} scriptlets in template`);
      scriptletMatch.slice(0, 3).forEach((s, i) => {
        console.log(`        Scriptlet ${i+1}: ${s.substring(0, 50)}...`);
      });
    } else {
      console.log(`     No scriptlets found (pure HTML/JS)`);
    }
    
    // Step 3: Evaluate
    const startEval = Date.now();
    const evaluated = template.evaluate();
    const evalTime = Date.now() - startEval;
    console.log(`     Step 3: Evaluation time: ${evalTime}ms ✓`);
    
    // Step 4: Get content
    const content = evaluated.getContent();
    console.log(`     Step 4: Final content: ${content.length} chars ✓`);
    
  } catch (e) {
    console.log(`     ❌ FAILED: ${e.message}`);
    console.log(`     Stack: ${e.stack}`);
  }
}

/**
 * Check if expected functions exist in evaluated content
 */
function checkFunctionDefinitions() {
  const functionChecks = [
    { file: 'UI/UI_Tab_Conversion.html', functions: ['populateConversionDataTab', 'populateDistributionDataTab'] },
    { file: 'UI/UI_Tab_Audience.html', functions: ['populateAudienceIntelligenceTab', 'populateGeoAeoIntelligenceTab'] },
    { file: 'UI/UI_Tab_AuthPerf.html', functions: ['populateAuthorityInfluenceTab', 'populatePerformancePredictiveTab', 'populateStrategicOpportunitiesTab'] },
    { file: 'UI/UI_Tab_Overview.html', functions: ['populateOverviewTab', 'safeAttrEncode'] }
  ];
  
  functionChecks.forEach(check => {
    console.log(`\n  📄 ${check.file}`);
    
    try {
      const content = HtmlService.createTemplateFromFile(check.file).evaluate().getContent();
      
      check.functions.forEach(fn => {
        const regex = new RegExp(`function\\s+${fn}\\s*\\(`);
        const found = regex.test(content);
        console.log(`     ${found ? '✅' : '❌'} ${fn}()`);
        
        if (found) {
          // Find the line where it's defined
          const match = content.match(new RegExp(`function\\s+${fn}\\s*\\([^)]*\\)\\s*\\{`));
          if (match) {
            console.log(`        Definition: ${match[0].substring(0, 60)}...`);
          }
        }
      });
    } catch (e) {
      console.log(`     ❌ Error reading file: ${e.message}`);
    }
  });
}

/**
 * Analyze file content for potential issues
 */
function analyzeFileContent(filePath) {
  try {
    const content = HtmlService.createTemplateFromFile(filePath).evaluate().getContent();
    console.log(`\n  📄 ${filePath}`);
    
    // Check for common issues
    const issues = [];
    
    // Issue 1: Unmatched script tags
    const openScripts = (content.match(/<script/gi) || []).length;
    const closeScripts = (content.match(/<\/script>/gi) || []).length;
    if (openScripts !== closeScripts) {
      issues.push(`Unmatched script tags: ${openScripts} open, ${closeScripts} close`);
    }
    
    // Issue 2: Check for syntax errors in JS (basic check)
    const scriptBlocks = content.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) || [];
    scriptBlocks.forEach((block, i) => {
      const js = block.replace(/<\/?script[^>]*>/gi, '');
      
      // Check for common syntax issues
      const unclosedBraces = (js.match(/{/g) || []).length - (js.match(/}/g) || []).length;
      const unclosedParens = (js.match(/\(/g) || []).length - (js.match(/\)/g) || []).length;
      const unclosedBrackets = (js.match(/\[/g) || []).length - (js.match(/]/g) || []).length;
      
      if (unclosedBraces !== 0) {
        issues.push(`Script ${i+1}: Unbalanced braces ({}) diff: ${unclosedBraces}`);
      }
      if (unclosedParens !== 0) {
        issues.push(`Script ${i+1}: Unbalanced parentheses (()) diff: ${unclosedParens}`);
      }
      if (unclosedBrackets !== 0) {
        issues.push(`Script ${i+1}: Unbalanced brackets ([]) diff: ${unclosedBrackets}`);
      }
    });
    
    // Issue 3: Check for window exports
    const hasWindowExports = content.includes('window.populateConversionTab') || 
                             content.includes('window.populateAudienceTab') ||
                             content.includes('window.populateAuthorityPerformanceTab');
    if (!hasWindowExports && filePath.includes('Conversion')) {
      issues.push('No window.populateConversionTab export found');
    }
    
    // Report issues
    if (issues.length === 0) {
      console.log(`     ✅ No obvious issues detected`);
    } else {
      issues.forEach(issue => {
        console.log(`     ⚠️ ${issue}`);
      });
    }
    
    // Show export section
    const exportMatch = content.match(/\/\/\s*(?:Export|Exports?)[\s\S]{0,500}/i);
    if (exportMatch) {
      console.log(`     Export section found: ${exportMatch[0].substring(0, 200).replace(/\n/g, '\\n')}...`);
    }
    
  } catch (e) {
    console.log(`\n  📄 ${filePath}`);
    console.log(`     ❌ Error: ${e.message}`);
  }
}

/**
 * Quick test - run just the include on problem files
 */
function DIAG_V43_QuickIncludeTest() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('    QUICK INCLUDE TEST v43.0');
  console.log('═══════════════════════════════════════════════════════════════');
  
  const files = [
    'UI/UI_Tab_Conversion.html',
    'UI/UI_Tab_Audience.html', 
    'UI/UI_Tab_AuthPerf.html',
    'UI/UI_Tab_Test_V42.html',
    'UI/UI_Tab_Overview.html'
  ];
  
  files.forEach(file => {
    try {
      const content = HtmlService.createTemplateFromFile(file).evaluate().getContent();
      const hasScript = content.includes('<script');
      const size = content.length;
      console.log(`✅ ${file} - ${size} chars - hasScript: ${hasScript}`);
    } catch (e) {
      console.log(`❌ ${file} - ERROR: ${e.message}`);
    }
  });
}

/**
 * Test to simulate what happens in the browser
 */
function DIAG_V43_SimulateBrowserLoad() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('    SIMULATE BROWSER LOAD v43.0');
  console.log('═══════════════════════════════════════════════════════════════');
  
  // This simulates what the browser sees when the sidebar loads
  
  const mainHtml = HtmlService.createTemplateFromFile('UI/UI_Dashboard');
  
  console.log('\n📋 STEP 1: Main template created');
  console.log(`   Template code size: ${mainHtml.getCode().length} chars`);
  
  // Check for includes in the template
  const templateCode = mainHtml.getCode();
  const includeMatches = templateCode.match(/include\(['"](.*?)['"]\)/g) || [];
  console.log(`   Found ${includeMatches.length} include() calls`);
  
  // List the includes
  includeMatches.slice(0, 20).forEach(inc => {
    console.log(`     - ${inc}`);
  });
  
  console.log('\n📋 STEP 2: Evaluating main template...');
  
  try {
    const startTime = Date.now();
    const evaluated = mainHtml.evaluate();
    const content = evaluated.getContent();
    const elapsed = Date.now() - startTime;
    
    console.log(`   ✅ Evaluation complete in ${elapsed}ms`);
    console.log(`   Final HTML size: ${content.length} chars`);
    
    // Check if problem tab content is in the final HTML
    const hasConversion = content.includes('populateConversionTab');
    const hasAudience = content.includes('populateAudienceTab');
    const hasAuthPerf = content.includes('populateAuthorityPerformanceTab');
    const hasOverview = content.includes('populateOverviewTab');
    
    console.log('\n📋 STEP 3: Function presence in final HTML:');
    console.log(`   ${hasOverview ? '✅' : '❌'} populateOverviewTab`);
    console.log(`   ${hasConversion ? '✅' : '❌'} populateConversionTab`);
    console.log(`   ${hasAudience ? '✅' : '❌'} populateAudienceTab`);
    console.log(`   ${hasAuthPerf ? '✅' : '❌'} populateAuthorityPerformanceTab`);
    
    // Check V41 load flags
    const hasV41Conversion = content.includes('_v41_conversion_loaded');
    const hasV41Audience = content.includes('_v41_audience_loaded');
    const hasV41AuthPerf = content.includes('_v41_authperf_loaded');
    const hasV42Test = content.includes('_v42_test_loaded');
    
    console.log('\n📋 STEP 4: V41/V42 load flags in final HTML:');
    console.log(`   ${hasV42Test ? '✅' : '❌'} _v42_test_loaded flag (TEST FILE)`);
    console.log(`   ${hasV41Conversion ? '✅' : '❌'} _v41_conversion_loaded flag`);
    console.log(`   ${hasV41Audience ? '✅' : '❌'} _v41_audience_loaded flag`);
    console.log(`   ${hasV41AuthPerf ? '✅' : '❌'} _v41_authperf_loaded flag`);
    
    // Check for actual function definitions
    const hasFnConversion = content.includes('function populateConversionDataTab');
    const hasFnAudience = content.includes('function populateAudienceIntelligenceTab');
    const hasFnAuthPerf = content.includes('function populateAuthorityInfluenceTab');
    
    console.log('\n📋 STEP 5: Function definitions in final HTML:');
    console.log(`   ${hasFnConversion ? '✅' : '❌'} populateConversionDataTab()`);
    console.log(`   ${hasFnAudience ? '✅' : '❌'} populateAudienceIntelligenceTab()`);
    console.log(`   ${hasFnAuthPerf ? '✅' : '❌'} populateAuthorityInfluenceTab()`);
    
    // Check total script tags count
    const scriptTagCount = (content.match(/<script/gi) || []).length;
    console.log(`\n📋 STEP 6: Total <script> tags in final HTML: ${scriptTagCount}`);
    
    // Check if there's an unclosed script tag that might break things
    const openScripts = (content.match(/<script/gi) || []).length;
    const closeScripts = (content.match(/<\/script>/gi) || []).length;
    if (openScripts !== closeScripts) {
      console.log(`   ⚠️ MISMATCH: ${openScripts} opens vs ${closeScripts} closes`);
    } else {
      console.log(`   ✅ Balanced: ${openScripts} script tags`);
    }
    
  } catch (e) {
    console.log(`   ❌ Evaluation failed: ${e.message}`);
    console.log(`   Stack: ${e.stack}`);
  }
}

/**
 * Find where the includes are in UI_Dashboard
 */
function DIAG_V43_FindIncludes() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('    FIND INCLUDES IN DASHBOARD v43.0');
  console.log('═══════════════════════════════════════════════════════════════');
  
  try {
    const template = HtmlService.createTemplateFromFile('UI/UI_Dashboard');
    const code = template.getCode();
    
    // Find all include statements
    const regex = /include\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    let match;
    const includes = [];
    
    while ((match = regex.exec(code)) !== null) {
      includes.push(match[1]);
    }
    
    console.log(`\nFound ${includes.length} include() calls:\n`);
    
    includes.forEach((inc, i) => {
      const isConversion = inc.includes('Conversion');
      const isAudience = inc.includes('Audience');
      const isAuthPerf = inc.includes('AuthPerf');
      const marker = (isConversion || isAudience || isAuthPerf) ? '🔴 PROBLEM: ' : '   ';
      console.log(`${marker}${i+1}. ${inc}`);
    });
    
    // Check if problem files are included
    const hasConversion = includes.some(i => i.includes('UI_Tab_Conversion'));
    const hasAudience = includes.some(i => i.includes('UI_Tab_Audience'));
    const hasAuthPerf = includes.some(i => i.includes('UI_Tab_AuthPerf'));
    
    console.log('\n📋 PROBLEM FILES INCLUDED IN DASHBOARD?');
    console.log(`   ${hasConversion ? '✅' : '❌'} UI_Tab_Conversion.html`);
    console.log(`   ${hasAudience ? '✅' : '❌'} UI_Tab_Audience.html`);
    console.log(`   ${hasAuthPerf ? '✅' : '❌'} UI_Tab_AuthPerf.html`);
    
    if (!hasConversion || !hasAudience || !hasAuthPerf) {
      console.log('\n⚠️ ISSUE FOUND: Problem files are NOT included in UI_Dashboard!');
      console.log('   These files need to be added with <?!= include("UI/UI_Tab_xxx.html") ?>');
    }
    
  } catch (e) {
    console.log(`❌ Error: ${e.message}`);
  }
}

/**
 * V44 - Test the actual HTML content of the problem files
 * This simulates what the browser sees
 */
function DIAG_V44_TestProblemFileContent() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('    V44 PROBLEM FILE CONTENT TEST');
  console.log('═══════════════════════════════════════════════════════════════');
  
  const testFiles = [
    'UI/UI_Tab_Test_V42.html',  // Should work
    'UI/UI_Tab_ContentSystems.html', // Should work
    'UI/UI_Tab_Conversion.html',     // Problem
    'UI/UI_Tab_Audience.html',       // Problem
    'UI/UI_Tab_AuthPerf.html'        // Problem
  ];
  
  testFiles.forEach(file => {
    console.log(`\n📄 ${file}`);
    console.log('─'.repeat(60));
    
    try {
      const content = HtmlService.createTemplateFromFile(file).evaluate().getContent();
      console.log(`   Total size: ${content.length} chars`);
      
      // Check for script opening
      const scriptStart = content.indexOf('<script');
      console.log(`   <script starts at: char ${scriptStart}`);
      
      // Check for window export
      const windowExportMatch = content.match(/window\._v41_\w+_loaded\s*=\s*true/);
      if (windowExportMatch) {
        console.log(`   ✅ V41 load flag found: ${windowExportMatch[0]}`);
      } else {
        console.log(`   ⚠️ No V41 load flag found`);
      }
      
      // Check for console.log at start
      const consoleLogMatch = content.match(/console\.log\('\[V4[12]\].*?LOADED'\)/);
      if (consoleLogMatch) {
        console.log(`   ✅ Load log found: ${consoleLogMatch[0]}`);
      }
      
      // Check first 300 chars of script content
      if (scriptStart >= 0) {
        const scriptContent = content.substring(scriptStart, scriptStart + 400);
        console.log(`   First 400 chars of script:`);
        console.log(`   ${scriptContent.replace(/\n/g, '\\n').substring(0, 400)}`);
      }
      
      // Check for closing </script>
      const lastScriptClose = content.lastIndexOf('</script>');
      console.log(`   Last </script> at: char ${lastScriptClose} (of ${content.length})`);
      
      // Show last 200 chars
      console.log(`   Last 200 chars:`);
      console.log(`   ${content.substring(content.length - 200).replace(/\n/g, '\\n')}`);
      
    } catch (e) {
      console.log(`   ❌ ERROR: ${e.message}`);
    }
  });
}

/**
 * V44 - Check the include order and look for issues between files
 */
function DIAG_V44_CheckIncludeOrder() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('    V44 INCLUDE ORDER ANALYSIS');
  console.log('═══════════════════════════════════════════════════════════════');
  
  try {
    const scriptsApp = HtmlService.createTemplateFromFile('UI/UI_Scripts_App.html').getCode();
    
    // Find all includes
    const includeRegex = /include\(['"]([^'"]+)['"]\)/g;
    let match;
    const includes = [];
    
    while ((match = includeRegex.exec(scriptsApp)) !== null) {
      includes.push(match[1]);
    }
    
    console.log(`\n📋 INCLUDE ORDER (${includes.length} total):\n`);
    
    // Find where our problem files are
    let testV42Index = -1;
    let conversionIndex = -1;
    let audienceIndex = -1;
    let authPerfIndex = -1;
    
    includes.forEach((inc, i) => {
      if (inc.includes('UI_Tab_Test_V42')) testV42Index = i;
      if (inc.includes('UI_Tab_Conversion')) conversionIndex = i;
      if (inc.includes('UI_Tab_Audience')) audienceIndex = i;
      if (inc.includes('UI_Tab_AuthPerf')) authPerfIndex = i;
    });
    
    console.log('🔍 KEY FILE POSITIONS:');
    console.log(`   UI_Tab_Test_V42:   #${testV42Index + 1} (should work)`);
    console.log(`   UI_Tab_Conversion: #${conversionIndex + 1} (problem)`);
    console.log(`   UI_Tab_Audience:   #${audienceIndex + 1} (problem)`);
    console.log(`   UI_Tab_AuthPerf:   #${authPerfIndex + 1} (problem)`);
    
    // Show files around the problem area
    const startIdx = Math.max(0, testV42Index - 2);
    const endIdx = Math.min(includes.length, authPerfIndex + 3);
    
    console.log(`\n📋 FILES ${startIdx + 1} to ${endIdx} (around problem area):\n`);
    
    for (let i = startIdx; i < endIdx; i++) {
      const isProb = [conversionIndex, audienceIndex, authPerfIndex].includes(i);
      const isControl = (i === testV42Index);
      const marker = isProb ? '🔴' : isControl ? '🟢' : '  ';
      console.log(`   ${marker} ${i + 1}. ${includes[i]}`);
    }
    
    // Now test each file in the problem area
    console.log('\n📋 TESTING EACH FILE IN ORDER:\n');
    
    for (let i = startIdx; i < endIdx; i++) {
      const fileName = includes[i].startsWith('UI/') ? includes[i] : 'UI/' + includes[i];
      
      try {
        const content = HtmlService.createTemplateFromFile(fileName + '.html').evaluate().getContent();
        const scriptTags = (content.match(/<script[^>]*>/gi) || []).length;
        const closeTags = (content.match(/<\/script>/gi) || []).length;
        const balanced = scriptTags === closeTags;
        
        console.log(`   ${i + 1}. ${includes[i]}: ${content.length} chars | <script>:${scriptTags} </script>:${closeTags} ${balanced ? '✅' : '❌ UNBALANCED!'}`);
        
        if (!balanced) {
          console.log(`      ⚠️ THIS FILE HAS UNBALANCED SCRIPT TAGS - LIKELY CAUSE OF ISSUE!`);
        }
      } catch (e) {
        console.log(`   ${i + 1}. ${includes[i]}: ❌ ERROR - ${e.message}`);
      }
    }
    
  } catch (e) {
    console.log(`❌ Error: ${e.message}`);
    console.log(`Stack: ${e.stack}`);
  }
}
