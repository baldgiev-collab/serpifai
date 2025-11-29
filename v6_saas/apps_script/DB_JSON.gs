/**
 * DB_JSON.gs
 * Safe JSON parsing and stringifying utilities
 */

var DB_JSONX = (function() {
  /**
   * Safe JSON parse with default fallback
   * @param {string} s - JSON string to parse
   * @param {*} d - Default value if parse fails
   * @return {*} Parsed object or default
   */
  function parse(s, d) {
    try {
      return JSON.parse(s || '');
    } catch(e) {
      return d;
    }
  }
  
  /**
   * Safe JSON stringify
   * @param {*} o - Object to stringify
   * @return {string} JSON string or empty object string
   */
  function stringify(o) {
    try {
      return JSON.stringify(o);
    } catch(e) {
      return '{}';
    }
  }
  
  return {
    parse: parse,
    stringify: stringify
  };
})();

/**
 * Legacy JSONX object for backwards compatibility
 */
var JSONX = DB_JSONX;
