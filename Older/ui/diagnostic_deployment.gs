/**
 * 🔍 Deployment Verification Diagnostic
 * Tests BOTH deployment URLs to find which one has the router code
 */

function testBothDeployments() {
  Logger.log('========================================');
  Logger.log('🔍 DEPLOYMENT VERIFICATION');
  Logger.log('========================================');
  
  const deployments = {
    'OLD': 'https://script.google.com/macros/s/AKfycbxIikigH7EJpIaPvkMs38i1dwbHjF5s9cu1zqgZSLpJWK9zxg75jTPqiMCE_16qFXwR/exec',
  'NEW': 'https://script.google.com/macros/s/AKfycbxIikigH7EJpIaPvkMs38i1dwbHjF5s9cu1zqgZSLpJWK9zxg75jTPqiMCE_16qFXwR/exec'
  };
  
  for (let name in deployments) {
    Logger.log('\n📡 Testing ' + name + ' deployment:');
    Logger.log('   URL: ' + deployments[name]);
    
    const pingResult = testDeploymentURL(deployments[name], 'ping');
    const workflowResult = testDeploymentURL(deployments[name], 'workflow:stage1');
    
    Logger.log('   ping response: ' + pingResult.responseType);
    Logger.log('   workflow:stage1 response: ' + workflowResult.responseType);
    
    if (pingResult.hasRouter && workflowResult.hasRouter) {
      Logger.log('   ✅ THIS DEPLOYMENT HAS ROUTER CODE');
    } else {
      Logger.log('   ❌ This deployment DOES NOT have router code');
    }
  }
  
  Logger.log('\n========================================');
  Logger.log('📊 RECOMMENDATION');
  Logger.log('========================================');
  Logger.log('If BOTH deployments show "DOES NOT have router code",');
  Logger.log('you need to create a NEW deployment from your DataBridge');
  Logger.log('project where all tests pass.');
  Logger.log('\nSteps:');
  Logger.log('1. Open DataBridge Apps Script project');
  Logger.log('2. Run testEndToEnd() to confirm it works');
  Logger.log('3. Deploy → New deployment → Web app');
  Logger.log('4. Copy the NEW deployment URL');
  Logger.log('5. Update workflow_connector.gs with NEW URL');
}

function testDeploymentURL(url, action) {
  try {
    const payload = {
      action: action,
      data: { test: true },
      timestamp: new Date().toISOString()
    };
    
    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(url, options);
    const responseText = response.getContentText();
    
    try {
      const json = JSON.parse(responseText);
      
      // Check response format
      if (json.ok === false) {
        // OLD format: {"ok":false,"error":"Error: Unknown action: ping"}
        return {
          responseType: 'OLD FORMAT (ok:false)',
          hasRouter: false,
          json: json
        };
      } else if (json.success !== undefined) {
        // NEW format: {"success":true,"message":"..."}
        return {
          responseType: 'NEW FORMAT (success:' + json.success + ')',
          hasRouter: true,
          json: json
        };
      } else {
        return {
          responseType: 'UNKNOWN FORMAT',
          hasRouter: false,
          json: json
        };
      }
    } catch (e) {
      return {
        responseType: 'NOT JSON',
        hasRouter: false,
        raw: responseText
      };
    }
  } catch (error) {
    return {
      responseType: 'ERROR',
      hasRouter: false,
      error: error.toString()
    };
  }
}

/**
 * Check what URL is currently in the UI project
 */
function checkCurrentDeploymentURL() {
  Logger.log('========================================');
  Logger.log('🔍 CURRENT DEPLOYMENT URL CHECK');
  Logger.log('========================================');
  
  if (typeof DATABRIDGE_ENDPOINT === 'undefined') {
    Logger.log('❌ DATABRIDGE_ENDPOINT not defined');
    Logger.log('   workflow_connector.gs not found in this project');
    return;
  }
  
  Logger.log('Current URL in UI project:');
  Logger.log(DATABRIDGE_ENDPOINT);
  
  // Extract deployment ID
  const match = DATABRIDGE_ENDPOINT.match(/\/s\/([^\/]+)\//);
  if (match) {
    const deploymentId = match[1];
    Logger.log('\nDeployment ID: ' + deploymentId);
    
    if (deploymentId === 'AKfycbyG48a0L-KPd_0d7Rmw_PvbaTgyU4J5TpG-beImNVB8OcerQSOv2Vz2qRp7xiBjUaBE') {
      Logger.log('⚠️ This is the OLD deployment (confirmed broken)');
    } else if (deploymentId === 'AKfycby0zUFBjCGkZD36q49G031Vse7CPwvUYOqfX0dXuy33WRKQr4v_nGO06i7TPzLAam8f') {
      Logger.log('⚠️ This is the "NEW" deployment (but still returns old format)');
    } else {
      Logger.log('❓ This is an unknown deployment');
    }
  }
  
  Logger.log('\nTesting current URL...');
  const result = testDeploymentURL(DATABRIDGE_ENDPOINT, 'ping');
  Logger.log('Response type: ' + result.responseType);
  Logger.log('Has router: ' + result.hasRouter);
  
  if (!result.hasRouter) {
    Logger.log('\n❌ PROBLEM CONFIRMED:');
    Logger.log('   The deployment URL in your UI project does NOT');
    Logger.log('   point to code with router functionality.');
    Logger.log('\n💡 SOLUTION:');
    Logger.log('   Create a FRESH deployment from the DataBridge');
    Logger.log('   project where tests pass, then update this URL.');
  } else {
    Logger.log('\n✅ Deployment URL looks correct!');
  }
}
