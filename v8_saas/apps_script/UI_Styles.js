/**
 * UI_Styles.gs - Shared UI Styles
 * SerpifAI V8 - Common CSS styles for all UIs
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// CSS STYLES
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Get common CSS styles
 */
function UI_getStyles() {
  return `
    <style>
      :root {
        --primary: #4285F4;
        --primary-dark: #3367D6;
        --success: #34A853;
        --warning: #FBBC05;
        --danger: #EA4335;
        --gray-50: #F8F9FA;
        --gray-100: #F1F3F4;
        --gray-200: #E8EAED;
        --gray-300: #DADCE0;
        --gray-500: #9AA0A6;
        --gray-700: #5F6368;
        --gray-900: #202124;
        --shadow-sm: 0 1px 2px rgba(0,0,0,0.1);
        --shadow: 0 2px 4px rgba(0,0,0,0.1);
        --shadow-lg: 0 4px 12px rgba(0,0,0,0.15);
        --radius: 8px;
        --radius-lg: 12px;
      }
      
      * { box-sizing: border-box; margin: 0; padding: 0; }
      
      body {
        font-family: 'Google Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 14px;
        color: var(--gray-900);
        background: var(--gray-50);
        line-height: 1.5;
      }
      
      .container { max-width: 1200px; margin: 0 auto; padding: 24px; }
      
      h1, h2, h3 { font-weight: 500; }
      h1 { font-size: 24px; margin-bottom: 24px; }
      h2 { font-size: 20px; margin-bottom: 16px; }
      h3 { font-size: 16px; margin-bottom: 12px; }
      
      .btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 20px;
        font-size: 14px;
        font-weight: 500;
        border-radius: var(--radius);
        border: none;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .btn-primary {
        background: var(--primary);
        color: white;
      }
      .btn-primary:hover { background: var(--primary-dark); }
      
      .btn-secondary {
        background: white;
        color: var(--gray-700);
        border: 1px solid var(--gray-300);
      }
      .btn-secondary:hover { background: var(--gray-100); }
      
      .btn-success { background: var(--success); color: white; }
      .btn-danger { background: var(--danger); color: white; }
      
      .btn-sm { padding: 6px 12px; font-size: 13px; }
      .btn-lg { padding: 14px 28px; font-size: 16px; }
      
      .card {
        background: white;
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow);
        padding: 20px;
        margin-bottom: 16px;
      }
      
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--gray-200);
        margin-bottom: 16px;
      }
      
      .input, .select, .textarea {
        width: 100%;
        padding: 10px 14px;
        font-size: 14px;
        border: 1px solid var(--gray-300);
        border-radius: var(--radius);
        transition: border-color 0.2s;
      }
      .input:focus, .select:focus, .textarea:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 3px rgba(66,133,244,0.15);
      }
      
      .form-group { margin-bottom: 16px; }
      .label {
        display: block;
        font-weight: 500;
        margin-bottom: 6px;
        color: var(--gray-700);
      }
      
      .table {
        width: 100%;
        border-collapse: collapse;
      }
      .table th, .table td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid var(--gray-200);
      }
      .table th { font-weight: 500; color: var(--gray-700); }
      .table tr:hover { background: var(--gray-50); }
      
      .badge {
        display: inline-block;
        padding: 4px 8px;
        font-size: 12px;
        font-weight: 500;
        border-radius: 4px;
      }
      .badge-success { background: #E6F4EA; color: #1E8E3E; }
      .badge-warning { background: #FEF7E0; color: #F9AB00; }
      .badge-danger { background: #FCE8E6; color: #D93025; }
      .badge-info { background: #E8F0FE; color: #1967D2; }
      
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
        margin-bottom: 24px;
      }
      
      .stat-card {
        background: white;
        border-radius: var(--radius-lg);
        padding: 20px;
        box-shadow: var(--shadow);
      }
      .stat-label { font-size: 13px; color: var(--gray-500); }
      .stat-value { font-size: 28px; font-weight: 500; margin-top: 8px; }
      .stat-change {
        font-size: 13px;
        margin-top: 8px;
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .stat-change.up { color: var(--success); }
      .stat-change.down { color: var(--danger); }
      
      .tabs {
        display: flex;
        gap: 4px;
        border-bottom: 1px solid var(--gray-200);
        margin-bottom: 24px;
      }
      .tab {
        padding: 12px 20px;
        cursor: pointer;
        border-bottom: 2px solid transparent;
        color: var(--gray-700);
        transition: all 0.2s;
      }
      .tab:hover { color: var(--primary); }
      .tab.active {
        color: var(--primary);
        border-bottom-color: var(--primary);
      }
      
      .tab-content { display: none; }
      .tab-content.active { display: block; }
      
      .alert {
        padding: 14px 20px;
        border-radius: var(--radius);
        margin-bottom: 16px;
        display: flex;
        align-items: flex-start;
        gap: 12px;
      }
      .alert-success { background: #E6F4EA; color: #1E8E3E; }
      .alert-warning { background: #FEF7E0; color: #F9AB00; }
      .alert-danger { background: #FCE8E6; color: #D93025; }
      .alert-info { background: #E8F0FE; color: #1967D2; }
      
      .progress-bar {
        height: 8px;
        background: var(--gray-200);
        border-radius: 4px;
        overflow: hidden;
      }
      .progress-bar-fill {
        height: 100%;
        background: var(--primary);
        transition: width 0.3s;
      }
      
      .loading {
        display: inline-block;
        width: 20px;
        height: 20px;
        border: 2px solid var(--gray-200);
        border-top-color: var(--primary);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
      @keyframes spin { to { transform: rotate(360deg); } }
      
      .empty-state {
        text-align: center;
        padding: 48px 24px;
        color: var(--gray-500);
      }
      .empty-state svg { width: 64px; height: 64px; margin-bottom: 16px; opacity: 0.5; }
      
      .flex { display: flex; }
      .flex-col { flex-direction: column; }
      .items-center { align-items: center; }
      .justify-between { justify-content: space-between; }
      .gap-2 { gap: 8px; }
      .gap-4 { gap: 16px; }
      .mt-2 { margin-top: 8px; }
      .mt-4 { margin-top: 16px; }
      .mb-4 { margin-bottom: 16px; }
      .p-4 { padding: 16px; }
      .text-center { text-align: center; }
      .text-right { text-align: right; }
      .text-muted { color: var(--gray-500); }
      .font-medium { font-weight: 500; }
      
      .tooltip {
        position: relative;
        cursor: help;
      }
      .tooltip::after {
        content: attr(data-tooltip);
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        padding: 6px 12px;
        background: var(--gray-900);
        color: white;
        font-size: 12px;
        border-radius: 4px;
        white-space: nowrap;
        opacity: 0;
        visibility: hidden;
        transition: all 0.2s;
      }
      .tooltip:hover::after { opacity: 1; visibility: visible; }
      
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }
      .modal-overlay.active { display: flex; }
      .modal {
        background: white;
        border-radius: var(--radius-lg);
        max-width: 500px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
      }
      .modal-header {
        padding: 20px;
        border-bottom: 1px solid var(--gray-200);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .modal-body { padding: 20px; }
      .modal-footer {
        padding: 16px 20px;
        border-top: 1px solid var(--gray-200);
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }
      
      @media (max-width: 768px) {
        .container { padding: 16px; }
        .stats-grid { grid-template-columns: repeat(2, 1fr); }
        .table { font-size: 13px; }
        .table th, .table td { padding: 8px; }
      }
    </style>
  `;
}

/**
 * Get icon SVG
 */
function UI_getIcon(name, size) {
  size = size || 20;
  
  const icons = {
    search: '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>',
    chart: '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/></svg>',
    settings: '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    plus: '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    download: '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    refresh: '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>',
    check: '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
    x: '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    alert: '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    info: '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
  };
  
  return icons[name] || '';
}
