/**
 * DB_Export.gs - Data Export Functions
 * SerpifAI V8 - Export data to various formats
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// EXPORT TO SHEETS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Export data to a new sheet
 */
function EXPORT_toSheet(data, sheetName, options) {
  options = options || {};
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(sheetName);
    
    // Create or clear sheet
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    } else if (options.clearExisting !== false) {
      sheet.clear();
    }
    
    if (!data || data.length === 0) {
      sheet.getRange('A1').setValue('No data to export');
      return { ok: true, sheetName: sheetName, rows: 0 };
    }
    
    // Get headers from first row if array of objects
    let headers = options.headers;
    let rows = data;
    
    if (typeof data[0] === 'object' && !Array.isArray(data[0])) {
      headers = headers || Object.keys(data[0]);
      rows = data.map(function(row) {
        return headers.map(function(h) { return row[h] || ''; });
      });
    }
    
    // Write headers
    if (headers) {
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setValues([headers]);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#21262d');
      headerRange.setFontColor('#c9d1d9');
    }
    
    // Write data
    const startRow = headers ? 2 : 1;
    if (rows.length > 0) {
      const dataRange = sheet.getRange(startRow, 1, rows.length, rows[0].length);
      dataRange.setValues(rows);
    }
    
    // Auto-resize columns
    if (options.autoResize !== false) {
      for (let i = 1; i <= (headers || rows[0]).length; i++) {
        sheet.autoResizeColumn(i);
      }
    }
    
    return { ok: true, sheetName: sheetName, rows: rows.length };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Export keywords to sheet
 */
function EXPORT_keywords(projectId) {
  const keywords = DB_KW_getByProject(projectId);
  
  if (!keywords || keywords.length === 0) {
    return { ok: false, error: 'No keywords to export' };
  }
  
  const headers = ['Keyword', 'Volume', 'Difficulty', 'CPC', 'Intent', 'Priority', 'Status'];
  
  return EXPORT_toSheet(keywords, 'Keywords Export', { headers: headers });
}

/**
 * Export competitors to sheet
 */
function EXPORT_competitors(projectId) {
  const competitors = DB_COMP_getByProject(projectId);
  
  if (!competitors || competitors.length === 0) {
    return { ok: false, error: 'No competitors to export' };
  }
  
  const headers = ['Domain', 'Authority', 'Traffic', 'Keywords', 'Backlinks', 'Score'];
  
  return EXPORT_toSheet(competitors, 'Competitors Export', { headers: headers });
}

// ═══════════════════════════════════════════════════════════════════════════════════
// EXPORT TO CSV
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Generate CSV content from data
 */
function EXPORT_toCSV(data, headers) {
  if (!data || data.length === 0) {
    return '';
  }
  
  const rows = [];
  
  // Add headers
  if (headers) {
    rows.push(headers.map(escapeCSV).join(','));
  } else if (typeof data[0] === 'object' && !Array.isArray(data[0])) {
    const objHeaders = Object.keys(data[0]);
    rows.push(objHeaders.map(escapeCSV).join(','));
  }
  
  // Add data rows
  data.forEach(function(row) {
    let values;
    if (Array.isArray(row)) {
      values = row;
    } else {
      values = headers ? headers.map(function(h) { return row[h]; }) : Object.values(row);
    }
    rows.push(values.map(escapeCSV).join(','));
  });
  
  return rows.join('\n');
}

/**
 * Escape CSV value
 */
function escapeCSV(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.indexOf(',') >= 0 || str.indexOf('"') >= 0 || str.indexOf('\n') >= 0) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

/**
 * Create downloadable CSV file
 */
function EXPORT_createCSVFile(data, filename, headers) {
  const csv = EXPORT_toCSV(data, headers);
  const blob = Utilities.newBlob(csv, 'text/csv', filename + '.csv');
  
  // Save to Drive
  const file = DriveApp.createFile(blob);
  
  return {
    ok: true,
    fileId: file.getId(),
    fileName: file.getName(),
    url: file.getUrl()
  };
}

// ═══════════════════════════════════════════════════════════════════════════════════
// EXPORT TO JSON
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Export data to JSON file
 */
function EXPORT_toJSON(data, filename) {
  try {
    const json = JSON.stringify(data, null, 2);
    const blob = Utilities.newBlob(json, 'application/json', filename + '.json');
    const file = DriveApp.createFile(blob);
    
    return {
      ok: true,
      fileId: file.getId(),
      fileName: file.getName(),
      url: file.getUrl()
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// PROJECT EXPORT
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Export entire project
 */
function EXPORT_project(projectId, format) {
  format = format || 'json';
  
  try {
    // Gather all project data
    const project = DB_PM_loadProject(projectId);
    const keywords = DB_KW_getByProject(projectId);
    const competitors = DB_COMP_getByProject ? DB_COMP_getByProject(projectId) : [];
    
    const exportData = {
      project: project,
      keywords: keywords,
      competitors: competitors,
      exportedAt: new Date().toISOString()
    };
    
    const filename = 'SerpifAI_' + (project.name || projectId) + '_export';
    
    if (format === 'json') {
      return EXPORT_toJSON(exportData, filename);
    } else if (format === 'csv') {
      // Export each section to separate sheets
      EXPORT_toSheet([project], 'Project Info');
      EXPORT_keywords(projectId);
      EXPORT_competitors(projectId);
      
      return { ok: true, format: 'sheets', message: 'Exported to sheets' };
    }
    
    return { ok: false, error: 'Unknown format: ' + format };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// REPORT GENERATION
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Generate project report
 */
function EXPORT_generateReport(projectId) {
  try {
    const project = DB_PM_loadProject(projectId);
    const keywords = DB_KW_getByProject(projectId);
    const competitors = DB_COMP_getByProject ? DB_COMP_getByProject(projectId) : [];
    
    // Create report sheet
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const reportName = 'Report - ' + new Date().toLocaleDateString();
    let sheet = ss.getSheetByName(reportName);
    
    if (!sheet) {
      sheet = ss.insertSheet(reportName);
    } else {
      sheet.clear();
    }
    
    // Write report header
    let row = 1;
    sheet.getRange(row, 1).setValue('SerpifAI Project Report');
    sheet.getRange(row, 1).setFontSize(18).setFontWeight('bold');
    row += 2;
    
    // Project summary
    sheet.getRange(row, 1).setValue('Project: ' + (project.name || 'Untitled'));
    row++;
    sheet.getRange(row, 1).setValue('Generated: ' + new Date().toLocaleString());
    row += 2;
    
    // Statistics
    sheet.getRange(row, 1).setValue('Statistics');
    sheet.getRange(row, 1).setFontWeight('bold');
    row++;
    sheet.getRange(row, 1, 1, 2).setValues([['Total Keywords', keywords.length]]);
    row++;
    sheet.getRange(row, 1, 1, 2).setValues([['Total Competitors', competitors.length]]);
    row += 2;
    
    // Top keywords
    if (keywords.length > 0) {
      sheet.getRange(row, 1).setValue('Top Keywords');
      sheet.getRange(row, 1).setFontWeight('bold');
      row++;
      
      const topKW = keywords.slice(0, 10);
      const kwHeaders = ['Keyword', 'Volume', 'Difficulty'];
      sheet.getRange(row, 1, 1, 3).setValues([kwHeaders]).setFontWeight('bold');
      row++;
      
      topKW.forEach(function(kw) {
        sheet.getRange(row, 1, 1, 3).setValues([[kw.keyword, kw.volume || 0, kw.difficulty || 0]]);
        row++;
      });
      row++;
    }
    
    // Auto-resize
    sheet.autoResizeColumns(1, 3);
    
    return { ok: true, sheetName: reportName };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
