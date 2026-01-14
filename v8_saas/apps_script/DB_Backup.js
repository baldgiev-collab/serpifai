/**
 * DB_Backup.gs - Database Backup Functions
 * SerpifAI V8 - Backup and restore functionality
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// DATABASE BACKUP
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Backup project data to Sheet
 */
function DB_backupProjectToSheet(params) {
  const projectId = params.projectId;
  const sheetName = params.sheetName || 'Backup_' + new Date().toISOString().split('T')[0];
  
  if (!projectId) {
    return { ok: false, error: 'Project ID required' };
  }
  
  try {
    // Get project data
    const projectData = DB_getProjectData({ projectId: projectId });
    if (!projectData.ok) return projectData;
    
    // Get or create sheet
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    } else {
      sheet.clear();
    }
    
    // Write project info
    sheet.getRange('A1').setValue('PROJECT BACKUP');
    sheet.getRange('A2').setValue('Project ID:');
    sheet.getRange('B2').setValue(projectId);
    sheet.getRange('A3').setValue('Backup Date:');
    sheet.getRange('B3').setValue(new Date().toISOString());
    
    // Write keywords
    let row = 5;
    sheet.getRange('A' + row).setValue('KEYWORDS');
    row++;
    
    if (projectData.keywords && projectData.keywords.length > 0) {
      const kwHeaders = ['ID', 'Keyword', 'Search Volume', 'Difficulty', 'Intent', 'Status'];
      sheet.getRange(row, 1, 1, kwHeaders.length).setValues([kwHeaders]);
      row++;
      
      const kwData = projectData.keywords.map(function(k) {
        return [k.id, k.keyword, k.searchVolume, k.difficulty, k.intent, k.status];
      });
      sheet.getRange(row, 1, kwData.length, kwHeaders.length).setValues(kwData);
      row += kwData.length + 2;
    }
    
    // Write rankings
    sheet.getRange('A' + row).setValue('RANKINGS');
    row++;
    
    if (projectData.rankings && projectData.rankings.length > 0) {
      const rkHeaders = ['Keyword', 'Position', 'URL', 'Date'];
      sheet.getRange(row, 1, 1, rkHeaders.length).setValues([rkHeaders]);
      row++;
      
      const rkData = projectData.rankings.map(function(r) {
        return [r.keyword, r.position, r.url, r.date];
      });
      sheet.getRange(row, 1, rkData.length, rkHeaders.length).setValues(rkData);
    }
    
    return {
      ok: true,
      sheetName: sheetName,
      keywordsCount: (projectData.keywords || []).length,
      rankingsCount: (projectData.rankings || []).length
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Get project data for backup
 */
function DB_getProjectData(params) {
  const projectId = params.projectId;
  
  try {
    const conn = getGatewayConnection();
    if (!conn.ok) return conn;
    
    const data = {
      projectId: projectId,
      keywords: [],
      rankings: []
    };
    
    // Get keywords
    const kwSql = 'SELECT * FROM keywords WHERE project_id = ?';
    const kwStmt = conn.prepareStatement(kwSql);
    kwStmt.setString(1, projectId);
    const kwRs = kwStmt.executeQuery();
    
    while (kwRs.next()) {
      data.keywords.push({
        id: kwRs.getString('id'),
        keyword: kwRs.getString('keyword'),
        searchVolume: kwRs.getInt('search_volume'),
        difficulty: kwRs.getInt('difficulty'),
        intent: kwRs.getString('intent'),
        status: kwRs.getString('status')
      });
    }
    kwRs.close();
    kwStmt.close();
    
    // Get rankings
    const rkSql = 'SELECT k.keyword, h.position, h.url, h.created_at ' +
      'FROM ranking_history h ' +
      'JOIN keywords k ON h.keyword_id = k.id ' +
      'WHERE h.project_id = ? ' +
      'ORDER BY h.created_at DESC LIMIT 1000';
    const rkStmt = conn.prepareStatement(rkSql);
    rkStmt.setString(1, projectId);
    const rkRs = rkStmt.executeQuery();
    
    while (rkRs.next()) {
      data.rankings.push({
        keyword: rkRs.getString('keyword'),
        position: rkRs.getInt('position'),
        url: rkRs.getString('url'),
        date: rkRs.getString('created_at')
      });
    }
    rkRs.close();
    rkStmt.close();
    
    conn.close();
    
    return { ok: true, ...data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Restore from backup sheet
 */
function DB_restoreFromSheet(params) {
  const sheetName = params.sheetName;
  const projectId = params.projectId;
  
  if (!sheetName || !projectId) {
    return { ok: false, error: 'Sheet name and Project ID required' };
  }
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      return { ok: false, error: 'Backup sheet not found' };
    }
    
    const data = sheet.getDataRange().getValues();
    let keywordsRestored = 0;
    
    // Find keywords section
    let inKeywords = false;
    let kwHeaders = null;
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      if (row[0] === 'KEYWORDS') {
        inKeywords = true;
        continue;
      }
      
      if (row[0] === 'RANKINGS') {
        inKeywords = false;
        break;
      }
      
      if (inKeywords) {
        if (!kwHeaders) {
          kwHeaders = row;
          continue;
        }
        
        // Restore keyword
        const keyword = {
          id: row[0],
          keyword: row[1],
          searchVolume: row[2],
          difficulty: row[3],
          intent: row[4],
          status: row[5]
        };
        
        if (keyword.keyword) {
          DB_saveKeyword({ projectId: projectId, ...keyword });
          keywordsRestored++;
        }
      }
    }
    
    return {
      ok: true,
      keywordsRestored: keywordsRestored
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Save keyword (for restore)
 */
function DB_saveKeyword(params) {
  try {
    const conn = getGatewayConnection();
    if (!conn.ok) return conn;
    
    const sql = 'INSERT INTO keywords (project_id, keyword, search_volume, difficulty, intent, status) ' +
      'VALUES (?, ?, ?, ?, ?, ?) ' +
      'ON DUPLICATE KEY UPDATE ' +
      'search_volume = VALUES(search_volume), difficulty = VALUES(difficulty)';
    
    const stmt = conn.prepareStatement(sql);
    stmt.setString(1, params.projectId);
    stmt.setString(2, params.keyword);
    stmt.setInt(3, params.searchVolume || 0);
    stmt.setInt(4, params.difficulty || 0);
    stmt.setString(5, params.intent || 'informational');
    stmt.setString(6, params.status || 'active');
    
    stmt.executeUpdate();
    stmt.close();
    conn.close();
    
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Export to JSON
 */
function DB_exportToJSON(params) {
  const projectId = params.projectId;
  
  if (!projectId) {
    return { ok: false, error: 'Project ID required' };
  }
  
  try {
    const data = DB_getProjectData({ projectId: projectId });
    if (!data.ok) return data;
    
    const json = JSON.stringify(data, null, 2);
    
    // Create file in Drive
    const fileName = 'serpifai_backup_' + projectId + '_' + Date.now() + '.json';
    const file = DriveApp.createFile(fileName, json, 'application/json');
    
    return {
      ok: true,
      fileId: file.getId(),
      fileName: fileName,
      url: file.getUrl()
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Import from JSON
 */
function DB_importFromJSON(params) {
  const fileId = params.fileId;
  const projectId = params.projectId;
  
  if (!fileId || !projectId) {
    return { ok: false, error: 'File ID and Project ID required' };
  }
  
  try {
    const file = DriveApp.getFileById(fileId);
    const content = file.getBlob().getDataAsString();
    const data = JSON.parse(content);
    
    let keywordsImported = 0;
    
    // Import keywords
    if (data.keywords && Array.isArray(data.keywords)) {
      data.keywords.forEach(function(kw) {
        DB_saveKeyword({
          projectId: projectId,
          keyword: kw.keyword,
          searchVolume: kw.searchVolume,
          difficulty: kw.difficulty,
          intent: kw.intent,
          status: kw.status
        });
        keywordsImported++;
      });
    }
    
    return {
      ok: true,
      keywordsImported: keywordsImported
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Create scheduled backup
 */
function DB_createScheduledBackup() {
  try {
    // Get all active projects
    const conn = getGatewayConnection();
    if (!conn.ok) return conn;
    
    const sql = 'SELECT id, name FROM projects WHERE status = "active"';
    const stmt = conn.prepareStatement(sql);
    const rs = stmt.executeQuery();
    
    const projects = [];
    while (rs.next()) {
      projects.push({
        id: rs.getString('id'),
        name: rs.getString('name')
      });
    }
    rs.close();
    stmt.close();
    conn.close();
    
    // Backup each project
    const results = [];
    projects.forEach(function(project) {
      const backupName = 'Backup_' + project.name + '_' + new Date().toISOString().split('T')[0];
      const result = DB_backupProjectToSheet({
        projectId: project.id,
        sheetName: backupName
      });
      results.push({ project: project.name, ...result });
    });
    
    return { ok: true, backups: results };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * List available backups
 */
function DB_listBackups() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheets = ss.getSheets();
    
    const backups = sheets
      .filter(function(s) { return s.getName().startsWith('Backup_'); })
      .map(function(s) {
        return {
          name: s.getName(),
          date: s.getName().split('_').pop()
        };
      })
      .sort(function(a, b) { return b.date.localeCompare(a.date); });
    
    return { ok: true, backups: backups };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
