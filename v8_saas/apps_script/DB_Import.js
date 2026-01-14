/**
 * DB_Import.gs - Data Import Functions
 * SerpifAI V8 - Import data from various sources
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// IMPORT FROM SHEETS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Import data from a sheet
 */
function IMPORT_fromSheet(sheetName, options) {
  options = options || {};
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      return { ok: false, error: 'Sheet not found: ' + sheetName };
    }
    
    const data = sheet.getDataRange().getValues();
    
    if (data.length === 0) {
      return { ok: false, error: 'Sheet is empty' };
    }
    
    // Convert to objects if first row is headers
    let result;
    
    if (options.hasHeaders !== false) {
      const headers = data[0];
      result = data.slice(1).map(function(row) {
        const obj = {};
        headers.forEach(function(h, i) {
          obj[h] = row[i];
        });
        return obj;
      });
    } else {
      result = data;
    }
    
    return { ok: true, data: result, rows: result.length };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Import keywords from sheet
 */
function IMPORT_keywords(sheetName, projectId) {
  const importResult = IMPORT_fromSheet(sheetName);
  
  if (!importResult.ok) {
    return importResult;
  }
  
  const keywords = importResult.data;
  let imported = 0;
  let failed = 0;
  
  keywords.forEach(function(kw) {
    try {
      const keyword = kw.keyword || kw.Keyword || kw.term || kw.Term;
      
      if (keyword) {
        DB_KW_add({
          projectId: projectId,
          keyword: keyword,
          volume: parseInt(kw.volume || kw.Volume || 0),
          difficulty: parseInt(kw.difficulty || kw.Difficulty || 0),
          cpc: parseFloat(kw.cpc || kw.CPC || 0),
          intent: kw.intent || kw.Intent || '',
          priority: kw.priority || kw.Priority || 'medium'
        });
        imported++;
      }
    } catch (e) {
      failed++;
    }
  });
  
  return { ok: true, imported: imported, failed: failed };
}

/**
 * Import competitors from sheet
 */
function IMPORT_competitors(sheetName, projectId) {
  const importResult = IMPORT_fromSheet(sheetName);
  
  if (!importResult.ok) {
    return importResult;
  }
  
  const competitors = importResult.data;
  let imported = 0;
  let failed = 0;
  
  competitors.forEach(function(comp) {
    try {
      const domain = comp.domain || comp.Domain || comp.url || comp.URL;
      
      if (domain) {
        DB_COMP_add({
          projectId: projectId,
          domain: domain,
          name: comp.name || comp.Name || extractDomainName(domain)
        });
        imported++;
      }
    } catch (e) {
      failed++;
    }
  });
  
  return { ok: true, imported: imported, failed: failed };
}

// ═══════════════════════════════════════════════════════════════════════════════════
// IMPORT FROM CSV
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Parse CSV content
 */
function IMPORT_parseCSV(csvContent, options) {
  options = options || {};
  const delimiter = options.delimiter || ',';
  const hasHeaders = options.hasHeaders !== false;
  
  const lines = csvContent.split(/\r?\n/);
  const result = [];
  let headers = null;
  
  lines.forEach(function(line, index) {
    if (!line.trim()) return;
    
    const values = parseCSVLine(line, delimiter);
    
    if (index === 0 && hasHeaders) {
      headers = values;
    } else if (headers) {
      const obj = {};
      headers.forEach(function(h, i) {
        obj[h.trim()] = values[i] || '';
      });
      result.push(obj);
    } else {
      result.push(values);
    }
  });
  
  return { ok: true, data: result, rows: result.length };
}

/**
 * Parse a single CSV line
 */
function parseCSVLine(line, delimiter) {
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  values.push(current.trim());
  return values;
}

/**
 * Import CSV from Drive file
 */
function IMPORT_csvFromDrive(fileId, options) {
  try {
    const file = DriveApp.getFileById(fileId);
    const content = file.getBlob().getDataAsString();
    return IMPORT_parseCSV(content, options);
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// IMPORT FROM JSON
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Parse JSON content
 */
function IMPORT_parseJSON(jsonContent) {
  try {
    const data = JSON.parse(jsonContent);
    return { ok: true, data: data };
  } catch (err) {
    return { ok: false, error: 'Invalid JSON: ' + err.message };
  }
}

/**
 * Import JSON from Drive file
 */
function IMPORT_jsonFromDrive(fileId) {
  try {
    const file = DriveApp.getFileById(fileId);
    const content = file.getBlob().getDataAsString();
    return IMPORT_parseJSON(content);
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Import project from JSON
 */
function IMPORT_project(jsonData) {
  try {
    const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
    
    // Create project
    const project = data.project || {};
    project.name = project.name + ' (Imported)';
    const newProject = DB_PM_createProject(project);
    
    if (!newProject.ok) {
      return newProject;
    }
    
    const projectId = newProject.projectId;
    let keywordsImported = 0;
    let competitorsImported = 0;
    
    // Import keywords
    if (data.keywords && Array.isArray(data.keywords)) {
      data.keywords.forEach(function(kw) {
        kw.projectId = projectId;
        DB_KW_add(kw);
        keywordsImported++;
      });
    }
    
    // Import competitors
    if (data.competitors && Array.isArray(data.competitors)) {
      data.competitors.forEach(function(comp) {
        comp.projectId = projectId;
        DB_COMP_add(comp);
        competitorsImported++;
      });
    }
    
    return {
      ok: true,
      projectId: projectId,
      keywordsImported: keywordsImported,
      competitorsImported: competitorsImported
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Extract domain name from URL
 */
function extractDomainName(url) {
  try {
    const domain = url.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    return domain.replace(/^www\./, '').split('.')[0];
  } catch (e) {
    return url;
  }
}

/**
 * Validate import data structure
 */
function IMPORT_validate(data, requiredFields) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return { ok: false, error: 'No data to import' };
  }
  
  const firstRow = data[0];
  const missingFields = [];
  
  requiredFields.forEach(function(field) {
    if (!(field in firstRow)) {
      missingFields.push(field);
    }
  });
  
  if (missingFields.length > 0) {
    return {
      ok: false,
      error: 'Missing required fields: ' + missingFields.join(', ')
    };
  }
  
  return { ok: true };
}

/**
 * List available sheets for import
 */
function IMPORT_listSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  
  return sheets.map(function(sheet) {
    return {
      name: sheet.getName(),
      rows: sheet.getLastRow(),
      columns: sheet.getLastColumn()
    };
  });
}
