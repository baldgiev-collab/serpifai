/**
 * DB_Oracle_Batch.gs - Oracle/JDBC Batch Operations
 * SerpifAI V8 - Batch insert/update operations for MySQL
 * 
 * Based on V7's Oracle_JDBC_Bridge.gs (Part 2)
 */

/**
 * Batch insert multiple rows
 * @param {string} table - Table name
 * @param {Array} rows - Array of row data objects
 * @param {object} options - Batch options
 * @return {object} Batch result
 */
function JDBC_batchInsert(table, rows, options) {
  options = options || {};
  const batchSize = options.batchSize || 100;
  
  if (!rows || rows.length === 0) {
    return { ok: true, inserted: 0 };
  }
  
  let conn, stmt;
  let totalInserted = 0;
  
  try {
    conn = JDBC_getConnection();
    conn.setAutoCommit(false);
    
    // Get columns from first row
    const columns = Object.keys(rows[0]);
    const placeholders = columns.map(() => '?').join(', ');
    const sql = 'INSERT INTO ' + table + ' (' + columns.join(', ') + ') VALUES (' + placeholders + ')';
    
    stmt = conn.prepareStatement(sql);
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      
      columns.forEach((col, idx) => {
        JDBC_bindParameter(stmt, idx + 1, row[col]);
      });
      
      stmt.addBatch();
      
      // Execute batch periodically
      if ((i + 1) % batchSize === 0) {
        const results = stmt.executeBatch();
        totalInserted += results.length;
        stmt.clearBatch();
      }
    }
    
    // Execute remaining
    const results = stmt.executeBatch();
    totalInserted += results.length;
    
    conn.commit();
    
    return {
      ok: true,
      inserted: totalInserted,
      totalRows: rows.length
    };
    
  } catch (err) {
    if (conn) {
      try { conn.rollback(); } catch (e) {}
    }
    LOG_error('JDBC batch insert failed', { error: err.message, table: table });
    return { ok: false, error: err.message };
    
  } finally {
    if (stmt) stmt.close();
    if (conn) conn.close();
  }
}

/**
 * Batch upsert multiple rows
 * @param {string} table - Table name
 * @param {Array} rows - Array of row data objects
 * @param {string} keyColumn - Primary key column for upsert
 * @param {object} options - Batch options
 * @return {object} Batch result
 */
function JDBC_batchUpsert(table, rows, keyColumn, options) {
  options = options || {};
  keyColumn = keyColumn || 'id';
  const batchSize = options.batchSize || 100;
  
  if (!rows || rows.length === 0) {
    return { ok: true, upserted: 0 };
  }
  
  let conn, stmt;
  let totalUpserted = 0;
  
  try {
    conn = JDBC_getConnection();
    conn.setAutoCommit(false);
    
    // Get columns from first row
    const columns = Object.keys(rows[0]);
    const placeholders = columns.map(() => '?').join(', ');
    const updateClauses = columns.filter(c => c !== keyColumn)
      .map(col => col + ' = VALUES(' + col + ')').join(', ');
    
    const sql = 'INSERT INTO ' + table + ' (' + columns.join(', ') + ') ' +
                'VALUES (' + placeholders + ') ' +
                'ON DUPLICATE KEY UPDATE ' + updateClauses;
    
    stmt = conn.prepareStatement(sql);
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      
      columns.forEach((col, idx) => {
        JDBC_bindParameter(stmt, idx + 1, row[col]);
      });
      
      stmt.addBatch();
      
      // Execute batch periodically
      if ((i + 1) % batchSize === 0) {
        const results = stmt.executeBatch();
        totalUpserted += results.length;
        stmt.clearBatch();
      }
    }
    
    // Execute remaining
    const results = stmt.executeBatch();
    totalUpserted += results.length;
    
    conn.commit();
    
    return {
      ok: true,
      upserted: totalUpserted,
      totalRows: rows.length
    };
    
  } catch (err) {
    if (conn) {
      try { conn.rollback(); } catch (e) {}
    }
    LOG_error('JDBC batch upsert failed', { error: err.message, table: table });
    return { ok: false, error: err.message };
    
  } finally {
    if (stmt) stmt.close();
    if (conn) conn.close();
  }
}

/**
 * Batch update multiple rows
 * @param {string} table - Table name
 * @param {Array} updates - Array of { data: {}, where: {} }
 * @param {object} options - Batch options
 * @return {object} Batch result
 */
function JDBC_batchUpdate(table, updates, options) {
  options = options || {};
  
  if (!updates || updates.length === 0) {
    return { ok: true, updated: 0 };
  }
  
  let totalUpdated = 0;
  const errors = [];
  
  updates.forEach((update, idx) => {
    const result = JDBC_update(table, update.data, update.where);
    if (result.ok) {
      totalUpdated += result.affectedRows;
    } else {
      errors.push({ index: idx, error: result.error });
    }
  });
  
  return {
    ok: errors.length === 0,
    updated: totalUpdated,
    errors: errors
  };
}

/**
 * Execute multiple SQL statements in a transaction
 * @param {Array} statements - Array of { sql: '', params: [] }
 * @return {object} Transaction result
 */
function JDBC_transaction(statements) {
  if (!statements || statements.length === 0) {
    return { ok: true, results: [] };
  }
  
  let conn;
  const results = [];
  
  try {
    conn = JDBC_getConnection();
    conn.setAutoCommit(false);
    
    statements.forEach((statement, idx) => {
      const stmt = conn.prepareStatement(statement.sql);
      
      (statement.params || []).forEach((param, pidx) => {
        JDBC_bindParameter(stmt, pidx + 1, param);
      });
      
      const affectedRows = stmt.executeUpdate();
      results.push({ index: idx, affectedRows: affectedRows });
      stmt.close();
    });
    
    conn.commit();
    
    return {
      ok: true,
      results: results
    };
    
  } catch (err) {
    if (conn) {
      try { conn.rollback(); } catch (e) {}
    }
    LOG_error('JDBC transaction failed', { error: err.message });
    return { ok: false, error: err.message, results: results };
    
  } finally {
    if (conn) conn.close();
  }
}

/**
 * Execute a stored procedure
 * @param {string} procedure - Procedure name
 * @param {Array} params - Procedure parameters
 * @return {object} Procedure result
 */
function JDBC_callProcedure(procedure, params) {
  params = params || [];
  let conn, stmt, rs;
  
  try {
    conn = JDBC_getConnection();
    
    const placeholders = params.map(() => '?').join(', ');
    const sql = 'CALL ' + procedure + '(' + placeholders + ')';
    
    stmt = conn.prepareCall(sql);
    
    params.forEach((param, idx) => {
      JDBC_bindParameter(stmt, idx + 1, param);
    });
    
    const hasResultSet = stmt.execute();
    
    if (hasResultSet) {
      rs = stmt.getResultSet();
      const meta = rs.getMetaData();
      const numCols = meta.getColumnCount();
      const columns = [];
      
      for (let i = 1; i <= numCols; i++) {
        columns.push(meta.getColumnName(i));
      }
      
      const rows = [];
      while (rs.next()) {
        const row = {};
        columns.forEach((col, idx) => {
          row[col] = rs.getObject(idx + 1);
        });
        rows.push(row);
      }
      
      return { ok: true, rows: rows, columns: columns };
    }
    
    return { ok: true, updateCount: stmt.getUpdateCount() };
    
  } catch (err) {
    LOG_error('JDBC procedure call failed', { error: err.message, procedure: procedure });
    return { ok: false, error: err.message };
    
  } finally {
    if (rs) rs.close();
    if (stmt) stmt.close();
    if (conn) conn.close();
  }
}

/**
 * Get table schema information
 * @param {string} table - Table name
 * @return {object} Schema info
 */
function JDBC_getTableSchema(table) {
  const sql = 'DESCRIBE ' + table;
  return JDBC_query(sql);
}

/**
 * Check if table exists
 * @param {string} table - Table name
 * @return {boolean} Exists
 */
function JDBC_tableExists(table) {
  const params = JDBC_getConnectionParams();
  const sql = "SELECT COUNT(*) as cnt FROM information_schema.tables " +
              "WHERE table_schema = ? AND table_name = ?";
  
  const result = JDBC_query(sql, [params.database, table]);
  
  return result.ok && result.rows[0]?.cnt > 0;
}

/**
 * Create table if not exists
 * @param {string} table - Table name
 * @param {object} schema - Column definitions
 * @return {object} Create result
 */
function JDBC_createTable(table, schema) {
  const columnDefs = Object.entries(schema).map(([col, def]) => {
    return col + ' ' + def;
  }).join(', ');
  
  const sql = 'CREATE TABLE IF NOT EXISTS ' + table + ' (' + columnDefs + ')';
  
  return JDBC_execute(sql);
}

/**
 * Count rows in a table
 * @param {string} table - Table name
 * @param {object} where - Optional where conditions
 * @return {object} Count result
 */
function JDBC_count(table, where) {
  let sql = 'SELECT COUNT(*) as count FROM ' + table;
  const params = [];
  
  if (where && Object.keys(where).length > 0) {
    const whereClauses = Object.keys(where).map(col => col + ' = ?');
    sql += ' WHERE ' + whereClauses.join(' AND ');
    params.push(...Object.values(where));
  }
  
  const result = JDBC_query(sql, params);
  
  if (result.ok && result.rows.length > 0) {
    return { ok: true, count: result.rows[0].count };
  }
  
  return result;
}
