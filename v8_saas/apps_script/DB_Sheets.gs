/**
 * DB_Sheets.gs - Google Sheets Operations
 * SerpifAI v8.0.0 - Low-level Sheets read/write operations
 */

/** Read all rows from a sheet */
function DB_Sheets_readAll(sheetName, options) {
  LOG_enter('DB_Sheets_readAll', { sheetName });
  
  try {
    const sheet = DB_getSheet(sheetName);
    if (!sheet) {
      return CORE_createError(ERROR_CATEGORY.DATA, `Sheet not found: ${sheetName}`);
    }
    
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    
    if (lastRow < 2 || lastCol < 1) {
      return CORE_success({ headers: [], rows: [], total: 0 });
    }
    
    options = options || {};
    const includeHeaders = options.includeHeaders !== false;
    const startRow = includeHeaders ? 1 : 2;
    
    const data = sheet.getRange(startRow, 1, lastRow - startRow + 1, lastCol).getValues();
    
    const headers = includeHeaders ? data[0] : sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    const rows = includeHeaders ? data.slice(1) : data;
    
    // Convert to objects if requested
    if (options.asObjects) {
      const objects = rows.map(row => _rowToObject(headers, row));
      return CORE_success({ headers, rows: objects, total: objects.length });
    }
    
    return CORE_success({ headers, rows, total: rows.length });
    
  } catch (error) {
    return CORE_handleError('DB_Sheets', 'readAll', error);
  }
}

/**
 * Read rows matching criteria
 * @param {string} sheetName - Sheet name
 * @param {string} column - Column to search
 * @param {*} value - Value to match
 * @return {Object} Matching rows
 */
function DB_Sheets_findRows(sheetName, column, value) {
  const result = DB_Sheets_readAll(sheetName, { asObjects: true });
  
  if (CORE_isError(result)) return result;
  
  const matches = result.data.rows.filter(row => row[column] === value);
  return CORE_success(matches);
}

/**
 * Read a single row by ID
 * @param {string} sheetName - Sheet name
 * @param {string} id - Row ID
 * @return {Object} Row data
 */
function DB_Sheets_getById(sheetName, id) {
  const result = DB_Sheets_readAll(sheetName, { asObjects: true });
  
  if (CORE_isError(result)) return result;
  
  const row = result.data.rows.find(r => r.ID === id || r.id === id);
  if (!row) {
    return CORE_createError(ERROR_CATEGORY.DATA, `Row not found: ${id}`);
  }
  
  return CORE_success(row);
}

/**
 * Append a row to a sheet
 * @param {string} sheetName - Sheet name
 * @param {Object|Array} data - Row data
 * @return {Object} Append result
 */
function DB_Sheets_appendRow(sheetName, data) {
  LOG_enter('DB_Sheets_appendRow', { sheetName });
  
  try {
    const sheet = DB_getSheet(sheetName);
    if (!sheet) {
      return CORE_createError(ERROR_CATEGORY.DATA, `Sheet not found: ${sheetName}`);
    }
    
    let rowData;
    if (Array.isArray(data)) {
      rowData = data;
    } else {
      // Convert object to array using header order
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      rowData = headers.map(h => data[h] !== undefined ? data[h] : '');
    }
    
    sheet.appendRow(rowData);
    
    return CORE_success({ row: sheet.getLastRow() });
    
  } catch (error) {
    return CORE_handleError('DB_Sheets', 'appendRow', error);
  }
}

/**
 * Append multiple rows
 * @param {string} sheetName - Sheet name
 * @param {Array} rows - Array of row data
 * @return {Object} Append result
 */
function DB_Sheets_appendRows(sheetName, rows) {
  LOG_enter('DB_Sheets_appendRows', { sheetName, count: rows.length });
  
  try {
    const sheet = DB_getSheet(sheetName);
    if (!sheet) {
      return CORE_createError(ERROR_CATEGORY.DATA, `Sheet not found: ${sheetName}`);
    }
    
    if (!rows || rows.length === 0) {
      return CORE_success({ added: 0 });
    }
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const lastRow = sheet.getLastRow();
    
    const rowData = rows.map(row => {
      if (Array.isArray(row)) return row;
      return headers.map(h => row[h] !== undefined ? row[h] : '');
    });
    
    sheet.getRange(lastRow + 1, 1, rowData.length, headers.length).setValues(rowData);
    
    return CORE_success({ added: rowData.length, startRow: lastRow + 1 });
    
  } catch (error) {
    return CORE_handleError('DB_Sheets', 'appendRows', error);
  }
}

/**
 * Update a row by ID
 * @param {string} sheetName - Sheet name
 * @param {string} id - Row ID
 * @param {Object} updates - Fields to update
 * @return {Object} Update result
 */
function DB_Sheets_updateById(sheetName, id, updates) {
  LOG_enter('DB_Sheets_updateById', { sheetName, id });
  
  try {
    const sheet = DB_getSheet(sheetName);
    if (!sheet) {
      return CORE_createError(ERROR_CATEGORY.DATA, `Sheet not found: ${sheetName}`);
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const idColIndex = headers.findIndex(h => h === 'ID' || h === 'id');
    
    if (idColIndex === -1) {
      return CORE_createError(ERROR_CATEGORY.DATA, 'No ID column found');
    }
    
    // Find the row
    let rowIndex = -1;
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][idColIndex]) === String(id)) {
        rowIndex = i;
        break;
      }
    }
    
    if (rowIndex === -1) {
      return CORE_createError(ERROR_CATEGORY.DATA, `Row not found: ${id}`);
    }
    
    // Update the row
    headers.forEach((header, colIndex) => {
      if (updates[header] !== undefined) {
        sheet.getRange(rowIndex + 1, colIndex + 1).setValue(updates[header]);
      }
    });
    
    return CORE_success({ updated: true, row: rowIndex + 1 });
    
  } catch (error) {
    return CORE_handleError('DB_Sheets', 'updateById', error);
  }
}

/**
 * Delete a row by ID
 * @param {string} sheetName - Sheet name
 * @param {string} id - Row ID
 * @return {Object} Delete result
 */
function DB_Sheets_deleteById(sheetName, id) {
  LOG_enter('DB_Sheets_deleteById', { sheetName, id });
  
  try {
    const sheet = DB_getSheet(sheetName);
    if (!sheet) {
      return CORE_createError(ERROR_CATEGORY.DATA, `Sheet not found: ${sheetName}`);
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const idColIndex = headers.findIndex(h => h === 'ID' || h === 'id');
    
    if (idColIndex === -1) {
      return CORE_createError(ERROR_CATEGORY.DATA, 'No ID column found');
    }
    
    // Find and delete the row
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][idColIndex]) === String(id)) {
        sheet.deleteRow(i + 1);
        return CORE_success({ deleted: true, row: i + 1 });
      }
    }
    
    return CORE_createError(ERROR_CATEGORY.DATA, `Row not found: ${id}`);
    
  } catch (error) {
    return CORE_handleError('DB_Sheets', 'deleteById', error);
  }
}

/**
 * Clear all data from a sheet (keep headers)
 * @param {string} sheetName - Sheet name
 * @return {Object} Clear result
 */
function DB_Sheets_clear(sheetName) {
  LOG_enter('DB_Sheets_clear', { sheetName });
  
  try {
    const sheet = DB_getSheet(sheetName);
    if (!sheet) {
      return CORE_createError(ERROR_CATEGORY.DATA, `Sheet not found: ${sheetName}`);
    }
    
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.deleteRows(2, lastRow - 1);
    }
    
    return CORE_success({ cleared: true });
    
  } catch (error) {
    return CORE_handleError('DB_Sheets', 'clear', error);
  }
}

/**
 * Convert row array to object using headers
 * @param {Array} headers - Header row
 * @param {Array} row - Data row
 * @return {Object} Row object
 */
function _rowToObject(headers, row) {
  const obj = {};
  headers.forEach((header, idx) => {
    obj[header] = row[idx] !== undefined ? row[idx] : null;
  });
  return obj;
}

/**
 * Get column index by header name
 * @param {string} sheetName - Sheet name
 * @param {string} columnName - Column header name
 * @return {number} Column index (1-based) or -1
 */
function DB_Sheets_getColumnIndex(sheetName, columnName) {
  const sheet = DB_getSheet(sheetName);
  if (!sheet) return -1;
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const idx = headers.findIndex(h => h === columnName);
  return idx >= 0 ? idx + 1 : -1;
}
