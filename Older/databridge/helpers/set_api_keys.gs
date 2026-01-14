/**
 * ONE-CLICK API KEY SETUP
 * Run this function to configure all API keys at once
 */

function SETUP_configureAllApiKeys() {
  Logger.log('🔑 Setting up all API keys...\n');
  
  var props = PropertiesService.getScriptProperties();
  
  // Your API keys
  var keys = {
    'GEMINI_API_KEY': 'AIzaSyClWii1Vktx1izC0WnYRlyFwbi9pFgk_1E',
    'PAGE_SPEED_KEY': 'AIzaSyCqYuEgWHKVxL3EtaY1MhLmEm-eGFLF2Cc',
    'OPEN_PAGERANK_KEY': 'w00ckwcko4g8c0so4wcc040owwwswck8sgsg4sc4',
    'SERPER_KEY': 'f7dc4d3ac3252f2cdb8281c4cf57200223e1d1d2'
  };
  
  // Set each property
  Logger.log('Setting Script Properties...');
  props.setProperty('GEMINI_API_KEY', 'AIzaSyClWii1Vktx1izC0WnYRlyFwbi9pFgk_1E');
  Logger.log('✅ GEMINI_API_KEY set');
  
  props.setProperty('PAGE_SPEED_KEY', 'AIzaSyCqYuEgWHKVxL3EtaY1MhLmEm-eGFLF2Cc');
  Logger.log('✅ PAGE_SPEED_KEY set');
  
  props.setProperty('OPEN_PAGERANK_KEY', 'w00ckwcko4g8c0so4wcc040owwwswck8sgsg4sc4');
  Logger.log('✅ OPEN_PAGERANK_KEY set');
  
  props.setProperty('SERPER_KEY', 'f7dc4d3ac3252f2cdb8281c4cf57200223e1d1d2');
  Logger.log('✅ SERPER_KEY set');
  
  // Verify
  Logger.log('\n🔍 Verification:');
  Object.keys(keys).forEach(function(key) {
    var value = props.getProperty(key);
    if (value) {
      var masked = value.substring(0, 10) + '...' + value.substring(value.length - 4);
      Logger.log('  ✅ ' + key + ': ' + masked);
    } else {
      Logger.log('  ❌ ' + key + ': FAILED TO SET');
    }
  });
  
  Logger.log('\n✅ All API keys configured!');
  Logger.log('\n📖 Next: Run SETUP_initializeSystem() to complete setup');
  
  return { ok: true, message: 'All API keys set successfully' };
}
