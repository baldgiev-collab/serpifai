/**
 * UI_Toast.gs - Toast Notification System
 * SerpifAI V8 - Toast and alert utilities for Google Sheets UI
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// TOAST NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Show success toast
 */
function Toast_success(message, title) {
  showToastNotification(message, title || '✅ Success', 5);
}

/**
 * Show error toast
 */
function Toast_error(message, title) {
  showToastNotification(message, title || '❌ Error', 10);
}

/**
 * Show warning toast
 */
function Toast_warning(message, title) {
  showToastNotification(message, title || '⚠️ Warning', 7);
}

/**
 * Show info toast
 */
function Toast_info(message, title) {
  showToastNotification(message, title || 'ℹ️ Info', 5);
}

/**
 * Show loading toast
 */
function Toast_loading(message) {
  showToastNotification(message || 'Loading...', '🔄 Please wait', -1);
}

/**
 * Core toast notification
 */
function showToastNotification(message, title, duration) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (ss) {
      ss.toast(message, title, duration);
    }
  } catch (e) {
    console.log('Toast: ' + (title || '') + ' - ' + message);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// ALERT DIALOGS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Show alert dialog
 */
function Alert_show(message, title) {
  try {
    const ui = SpreadsheetApp.getUi();
    ui.alert(title || 'Alert', message, ui.ButtonSet.OK);
  } catch (e) {
    console.log('Alert: ' + message);
  }
}

/**
 * Show confirmation dialog
 */
function Alert_confirm(message, title) {
  try {
    const ui = SpreadsheetApp.getUi();
    const response = ui.alert(
      title || 'Confirm',
      message,
      ui.ButtonSet.YES_NO
    );
    return response === ui.Button.YES;
  } catch (e) {
    console.log('Confirm: ' + message);
    return false;
  }
}

/**
 * Show prompt dialog
 */
function Alert_prompt(message, title, defaultValue) {
  try {
    const ui = SpreadsheetApp.getUi();
    const response = ui.prompt(
      title || 'Input',
      message,
      ui.ButtonSet.OK_CANCEL
    );
    
    if (response.getSelectedButton() === ui.Button.OK) {
      return { ok: true, value: response.getResponseText() };
    }
    return { ok: false, cancelled: true };
  } catch (e) {
    console.log('Prompt: ' + message);
    return { ok: false, error: e.message };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// PROGRESS INDICATORS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Show progress in toast
 */
function Progress_show(current, total, message) {
  const percent = Math.round((current / total) * 100);
  const bar = createProgressBar(percent);
  showToastNotification(bar + '\n' + (message || ''), 'Progress: ' + percent + '%', 2);
}

/**
 * Create ASCII progress bar
 */
function createProgressBar(percent) {
  const filled = Math.round(percent / 5);
  const empty = 20 - filled;
  return '▓'.repeat(filled) + '░'.repeat(empty);
}

// ═══════════════════════════════════════════════════════════════════════════════════
// OPERATION STATUS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Show operation started
 */
function Status_started(operation) {
  Toast_info('Started: ' + operation, '🚀 Starting');
  logStatus('STARTED', operation);
}

/**
 * Show operation completed
 */
function Status_completed(operation, details) {
  const message = details ? operation + '\n' + details : operation;
  Toast_success(message, '✅ Complete');
  logStatus('COMPLETED', operation);
}

/**
 * Show operation failed
 */
function Status_failed(operation, error) {
  const message = operation + (error ? '\n' + error : '');
  Toast_error(message, '❌ Failed');
  logStatus('FAILED', operation + ': ' + error);
}

/**
 * Log status to console
 */
function logStatus(level, message) {
  const timestamp = new Date().toISOString();
  console.log('[' + timestamp + '] [' + level + '] ' + message);
}

// ═══════════════════════════════════════════════════════════════════════════════════
// BULK OPERATION NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Create operation tracker
 */
function createOperationTracker(operationName, totalItems) {
  return {
    name: operationName,
    total: totalItems,
    current: 0,
    successful: 0,
    failed: 0,
    startTime: Date.now(),
    
    update: function(success) {
      this.current++;
      if (success) {
        this.successful++;
      } else {
        this.failed++;
      }
      
      // Show progress every 5 items
      if (this.current % 5 === 0 || this.current === this.total) {
        Progress_show(this.current, this.total, this.name);
      }
    },
    
    complete: function() {
      const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
      const message = this.successful + ' succeeded, ' + this.failed + ' failed (' + elapsed + 's)';
      
      if (this.failed === 0) {
        Status_completed(this.name, message);
      } else if (this.successful === 0) {
        Status_failed(this.name, message);
      } else {
        Toast_warning(message, '⚠️ Partial Success');
      }
      
      return {
        total: this.total,
        successful: this.successful,
        failed: this.failed,
        elapsed: parseFloat(elapsed)
      };
    }
  };
}

// ═══════════════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS FOR COMMON OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════════

function Notify_projectCreated(projectName) {
  Toast_success('Project "' + projectName + '" created successfully!');
}

function Notify_projectSaved(projectName) {
  Toast_success('Project "' + projectName + '" saved.');
}

function Notify_projectDeleted(projectName) {
  Toast_info('Project "' + projectName + '" deleted.');
}

function Notify_analysisStarted(type) {
  Toast_loading('Running ' + type + ' analysis...');
}

function Notify_analysisComplete(type, results) {
  const msg = results ? 'Found ' + results + ' items' : 'Analysis complete';
  Toast_success(msg, type + ' Complete');
}

function Notify_syncStarted() {
  Toast_loading('Syncing with server...');
}

function Notify_syncComplete() {
  Toast_success('All data synced successfully!');
}

function Notify_syncFailed(error) {
  Toast_error('Sync failed: ' + error);
}

function Notify_configSaved() {
  Toast_success('Configuration saved successfully!');
}

function Notify_cacheCleared() {
  Toast_info('Cache cleared.');
}
