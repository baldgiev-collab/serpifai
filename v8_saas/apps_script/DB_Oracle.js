/**
 * DB_Oracle.gs - Oracle/JDBC Database Connector
 * SerpifAI V8 - MySQL database connectivity via JDBC
 * 
 * Based on V7's Oracle_JDBC_Bridge.gs (Part 1)
 */

/**
 * JDBC Configuration
 */
var JDBC_CONFIG = {
  CONNECTION_TIMEOUT: 30,
  MAX_RETRIES: 3,
  DEFAULT_POOL_SIZE: 5
};

/**
 * Get JDBC connection parameters
 * @return {object} Connection params
 */
function JDBC_getConnectionParams() {
  const props = PropertiesService.getScriptProperties();
  
  return {
    host: props.getProperty('MYSQL_HOST') || 'localhost',
    port: props.getProperty('MYSQL_PORT') || '3306',
    database: props.getProperty('MYSQL_DATABASE') || 'serpifai',
    user: props.getProperty('MYSQL_USER') || '',
    password: props.getProperty('MYSQL_PASSWORD') || '',
    useSSL: props.getProperty('MYSQL_USE_SSL') === 'true'
  };
}

/**
 * Get JDBC connection
 * @param {object} params - Optional connection params
 * @return {JdbcConnection} Database connection
 */
function JDBC_getConnection(params) {
  params = params || JDBC_getConnectionParams();
  
  const url = 'jdbc:mysql://' + params.host + ':' + params.port + '/' + params.database;
  
  try {
    const conn = Jdbc.getConnection(url, params.user, params.password);
    return conn;
  } catch (err) {
    LOG_error('JDBC connection failed', { error: err.message, host: params.host });
    throw new Error('Database connection failed: ' + err.message);
  }
}

/**
 * Test database connection
 * @return {object} Test result
 */
function JDBC_testConnection() {
  try {
    const conn = JDBC_getConnection();
    const stmt = conn.createStatement();
    const rs = stmt.executeQuery('SELECT 1 as test');
    
    let result = null;
    if (rs.next()) {
      result = rs.getInt('test');
    }
    
    rs.close();
    stmt.close();
    conn.close();
    
    return {
      ok: result === 1,
      message: result === 1 ? 'Connection successful' : 'Connection test failed'
    };
    
  } catch (err) {
    return {
      ok: false,
      error: err.message
    };
  }
}

/**
 * Execute a SELECT query
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @return {object} Query result
 */
function JDBC_query(sql, params) {
  params = params || [];
  let conn, stmt, rs;
  
  try {
    conn = JDBC_getConnection();
    stmt = conn.prepareStatement(sql);
    
    // Bind parameters
    params.forEach((param, idx) => {
      JDBC_bindParameter(stmt, idx + 1, param);
    });
    
    rs = stmt.executeQuery();
    
    // Get column metadata
    const meta = rs.getMetaData();
    const numCols = meta.getColumnCount();
    const columns = [];
    
    for (let i = 1; i <= numCols; i++) {
      columns.push(meta.getColumnName(i));
    }
    
    // Fetch rows
    const rows = [];
    while (rs.next()) {
      const row = {};
      columns.forEach((col, idx) => {
        row[col] = rs.getObject(idx + 1);
      });
      rows.push(row);
    }
    
    return {
      ok: true,
      rows: rows,
      columns: columns,
      rowCount: rows.length
    };
    
  } catch (err) {
    LOG_error('JDBC query failed', { error: err.message, sql: sql.substring(0, 100) });
    return { ok: false, error: err.message };
    
  } finally {
    if (rs) rs.close();
    if (stmt) stmt.close();
    if (conn) conn.close();
  }
}

/**
 * Execute an INSERT/UPDATE/DELETE statement
 * @param {string} sql - SQL statement
 * @param {Array} params - Statement parameters
 * @return {object} Execution result
 */
function JDBC_execute(sql, params) {
  params = params || [];
  let conn, stmt;
  
  try {
    conn = JDBC_getConnection();
    stmt = conn.prepareStatement(sql);
    
    // Bind parameters
    params.forEach((param, idx) => {
      JDBC_bindParameter(stmt, idx + 1, param);
    });
    
    const affectedRows = stmt.executeUpdate();
    
    return {
      ok: true,
      affectedRows: affectedRows
    };
    
  } catch (err) {
    LOG_error('JDBC execute failed', { error: err.message, sql: sql.substring(0, 100) });
    return { ok: false, error: err.message };
    
  } finally {
    if (stmt) stmt.close();
    if (conn) conn.close();
  }
}

/**
 * Bind parameter to prepared statement
 * @param {JdbcPreparedStatement} stmt - Prepared statement
 * @param {number} index - Parameter index (1-based)
 * @param {any} value - Parameter value
 */
function JDBC_bindParameter(stmt, index, value) {
  if (value === null || value === undefined) {
    stmt.setNull(index, 0);
  } else if (typeof value === 'number') {
    if (Number.isInteger(value)) {
      stmt.setInt(index, value);
    } else {
      stmt.setDouble(index, value);
    }
  } else if (typeof value === 'boolean') {
    stmt.setBoolean(index, value);
  } else if (value instanceof Date) {
    stmt.setTimestamp(index, Jdbc.newTimestamp(value));
  } else {
    stmt.setString(index, String(value));
  }
}

/**
 * Insert a row into a table
 * @param {string} table - Table name
 * @param {object} data - Data to insert
 * @return {object} Insert result
 */
function JDBC_insert(table, data) {
  const columns = Object.keys(data);
  const placeholders = columns.map(() => '?').join(', ');
  const values = columns.map(col => data[col]);
  
  const sql = 'INSERT INTO ' + table + ' (' + columns.join(', ') + ') VALUES (' + placeholders + ')';
  
  return JDBC_execute(sql, values);
}

/**
 * Update rows in a table
 * @param {string} table - Table name
 * @param {object} data - Data to update
 * @param {object} where - Where conditions
 * @return {object} Update result
 */
function JDBC_update(table, data, where) {
  const setClauses = Object.keys(data).map(col => col + ' = ?');
  const whereClauses = Object.keys(where).map(col => col + ' = ?');
  
  const values = [
    ...Object.values(data),
    ...Object.values(where)
  ];
  
  const sql = 'UPDATE ' + table + ' SET ' + setClauses.join(', ') + 
              ' WHERE ' + whereClauses.join(' AND ');
  
  return JDBC_execute(sql, values);
}

/**
 * Upsert (insert or update on duplicate key)
 * @param {string} table - Table name
 * @param {object} data - Data to upsert
 * @param {string} keyColumn - Primary key column
 * @return {object} Upsert result
 */
function JDBC_upsert(table, data, keyColumn) {
  keyColumn = keyColumn || 'id';
  
  const columns = Object.keys(data);
  const placeholders = columns.map(() => '?').join(', ');
  const updateClauses = columns.filter(c => c !== keyColumn)
    .map(col => col + ' = VALUES(' + col + ')').join(', ');
  
  const values = columns.map(col => data[col]);
  
  const sql = 'INSERT INTO ' + table + ' (' + columns.join(', ') + ') ' +
              'VALUES (' + placeholders + ') ' +
              'ON DUPLICATE KEY UPDATE ' + updateClauses;
  
  return JDBC_execute(sql, values);
}

/**
 * Delete rows from a table
 * @param {string} table - Table name
 * @param {object} where - Where conditions
 * @return {object} Delete result
 */
function JDBC_delete(table, where) {
  const whereClauses = Object.keys(where).map(col => col + ' = ?');
  const values = Object.values(where);
  
  const sql = 'DELETE FROM ' + table + ' WHERE ' + whereClauses.join(' AND ');
  
  return JDBC_execute(sql, values);
}

/**
 * Configure MySQL connection
 * @param {object} config - Connection configuration
 * @return {object} Configuration result
 */
function JDBC_configure(config) {
  const props = PropertiesService.getScriptProperties();
  
  if (config.host) props.setProperty('MYSQL_HOST', config.host);
  if (config.port) props.setProperty('MYSQL_PORT', config.port);
  if (config.database) props.setProperty('MYSQL_DATABASE', config.database);
  if (config.user) props.setProperty('MYSQL_USER', config.user);
  if (config.password) props.setProperty('MYSQL_PASSWORD', config.password);
  if (config.useSSL !== undefined) props.setProperty('MYSQL_USE_SSL', String(config.useSSL));
  
  // Test the connection
  const testResult = JDBC_testConnection();
  
  return {
    ok: testResult.ok,
    message: testResult.ok ? 'MySQL configured and connected' : 'MySQL configured but connection failed',
    testResult: testResult
  };
}
