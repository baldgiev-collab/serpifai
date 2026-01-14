/**
 * UI_Router.gs - UI Action Router
 * SerpifAI V8 - Routes UI-related actions and serves HTML
 * 
 * Based on V7's UI action handling
 */

/**
 * UI route configuration
 */
var UI_ROUTES = {
  'dashboard': 'UI_Dashboard.html',
  'analysis': 'UI_Analysis.html',
  'keywords': 'UI_KeywordReport.html',
  'competitors': 'UI_CompetitorReport.html',
  'config': 'UI_ApiConfig.html',
  'license': 'UI_License.html',
  'help': 'UI_Help.html',
  'project': 'UI_ProjectManager.html',
  'workflow': 'UI_Workflow.html',
  'settings': 'UI_Settings.html'
};

/**
 * Handle UI-related actions
 * @param {string} action - UI action
 * @param {object} payload - Action payload
 * @return {object} Action result
 */
function UI_handleRoute(action, payload) {
  payload = payload || {};
  
  LOG_debug('UI_handleRoute', { action: action });
  
  // Extract action type
  const actionType = action.replace('ui:', '').replace('UI_', '');
  
  switch (actionType) {
    case 'getPage':
    case 'loadPage':
      return UI_loadPage(payload);
      
    case 'getConfig':
    case 'config':
      return UI_getPublicConfig();
      
    case 'getTheme':
    case 'theme':
      return UI_getTheme(payload);
      
    case 'setTheme':
      return UI_setTheme(payload);
      
    case 'getMenu':
    case 'menu':
      return UI_getMenuItems();
      
    case 'getDashboardData':
    case 'dashboardData':
      return UI_getDashboardData(payload);
      
    case 'getProjectList':
    case 'projects':
      return UI_getProjectList(payload);
      
    case 'showSidebar':
      return UI_showSidebar(payload);
      
    case 'showDialog':
      return UI_showDialog(payload);
      
    case 'toast':
    case 'showToast':
      return UI_showToast(payload);
      
    default:
      return { ok: false, error: 'Unknown UI action: ' + action };
  }
}

/**
 * Load a UI page by name
 * @param {object} payload - Contains page name
 * @return {object} Page content or result
 */
function UI_loadPage(payload) {
  try {
    const pageName = payload.page || payload.name || 'dashboard';
    const templateFile = UI_ROUTES[pageName] || UI_ROUTES['dashboard'];
    
    if (!templateFile) {
      return { ok: false, error: 'Unknown page: ' + pageName };
    }
    
    // Create HTML output from template
    const template = HtmlService.createTemplateFromFile(templateFile);
    
    // Pass data to template
    template.pageName = pageName;
    template.config = UI_getPublicConfig();
    template.projectId = payload.projectId || '';
    
    const htmlOutput = template.evaluate()
      .setTitle('SerpifAI - ' + pageName.charAt(0).toUpperCase() + pageName.slice(1))
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    
    return {
      ok: true,
      page: pageName,
      html: htmlOutput.getContent()
    };
    
  } catch (err) {
    return CORE_handleError(err, 'UI_loadPage');
  }
}

/**
 * Get public configuration for UI
 * @return {object} Public config
 */
function UI_getPublicConfig() {
  const props = PropertiesService.getScriptProperties();
  
  return {
    version: props.getProperty('VERSION') || 'V8.0.0',
    appName: 'SerpifAI',
    theme: props.getProperty('UI_THEME') || 'dark',
    environment: props.getProperty('ENVIRONMENT') || 'production',
    features: {
      competitorAnalysis: true,
      workflowStages: true,
      eliteAnalysis: true,
      forensicAnalysis: true
    }
  };
}

/**
 * Get current theme
 * @param {object} payload - Optional
 * @return {object} Theme configuration
 */
function UI_getTheme(payload) {
  const props = PropertiesService.getScriptProperties();
  const theme = props.getProperty('UI_THEME') || 'dark';
  
  const themes = {
    dark: {
      name: 'dark',
      background: '#1a1a2e',
      surface: '#16213e',
      primary: '#0f3460',
      accent: '#e94560',
      text: '#eaeaea',
      textSecondary: '#a0a0a0'
    },
    light: {
      name: 'light',
      background: '#f5f5f5',
      surface: '#ffffff',
      primary: '#1976d2',
      accent: '#ff5722',
      text: '#212121',
      textSecondary: '#757575'
    },
    serpifai: {
      name: 'serpifai',
      background: '#0d1117',
      surface: '#161b22',
      primary: '#238636',
      accent: '#58a6ff',
      text: '#c9d1d9',
      textSecondary: '#8b949e'
    }
  };
  
  return {
    ok: true,
    currentTheme: theme,
    theme: themes[theme] || themes.dark,
    availableThemes: Object.keys(themes)
  };
}

/**
 * Set theme preference
 * @param {object} payload - Contains theme name
 * @return {object} Result
 */
function UI_setTheme(payload) {
  const theme = payload.theme || 'dark';
  const props = PropertiesService.getScriptProperties();
  props.setProperty('UI_THEME', theme);
  
  return { ok: true, theme: theme };
}

/**
 * Get menu items for navigation
 * @return {object} Menu configuration
 */
function UI_getMenuItems() {
  return {
    ok: true,
    menu: [
      { id: 'dashboard', label: 'Dashboard', icon: 'home' },
      { id: 'project', label: 'Projects', icon: 'folder' },
      { id: 'workflow', label: 'Workflow', icon: 'workflow' },
      { id: 'keywords', label: 'Keywords', icon: 'search' },
      { id: 'competitors', label: 'Competitors', icon: 'users' },
      { id: 'analysis', label: 'Analysis', icon: 'chart' },
      { id: 'config', label: 'Settings', icon: 'settings' },
      { id: 'help', label: 'Help', icon: 'help' }
    ]
  };
}

/**
 * Get dashboard data
 * @param {object} payload - Contains projectId (optional)
 * @return {object} Dashboard data
 */
function UI_Router_getDashboardData(payload) {
  try {
    const projectId = payload.projectId;
    
    const data = {
      stats: {
        totalProjects: 0,
        activeWorkflows: 0,
        competitorsAnalyzed: 0,
        keywordsTracked: 0
      },
      recentProjects: [],
      quickActions: [
        { id: 'new_project', label: 'New Project', action: 'project:create' },
        { id: 'run_analysis', label: 'Run Analysis', action: 'comp:analyzeAll' },
        { id: 'view_reports', label: 'View Reports', action: 'ui:loadPage', page: 'analysis' }
      ]
    };
    
    // Get project stats
    const projectsResult = DB_PM_listProjects({});
    if (projectsResult.ok) {
      data.stats.totalProjects = projectsResult.count || 0;
      data.recentProjects = (projectsResult.projects || []).slice(0, 5);
    }
    
    // If projectId provided, get project-specific data
    if (projectId) {
      const projectResult = DB_PM_loadProject({ projectId: projectId });
      if (projectResult.ok) {
        data.currentProject = projectResult.project;
        data.stats.competitorsAnalyzed = (projectResult.project.competitors || []).length;
        data.stats.keywordsTracked = (projectResult.project.keywords || []).length;
      }
      
      const workflowStatus = DB_WF_getStatus({ projectId: projectId });
      if (workflowStatus.ok) {
        data.workflowStatus = workflowStatus;
      }
    }
    
    return { ok: true, dashboard: data };
    
  } catch (err) {
    return CORE_handleError(err, 'UI_getDashboardData');
  }
}

/**
 * Get project list for UI
 * @param {object} payload - Filter options
 * @return {object} Project list
 */
function UI_getProjectList(payload) {
  return DB_PM_listProjects(payload);
}

/**
 * Show sidebar with HTML content
 * @param {object} payload - Contains html or page
 * @return {object} Result
 */
function UI_showSidebar(payload) {
  try {
    let html;
    
    if (payload.html) {
      html = HtmlService.createHtmlOutput(payload.html);
    } else if (payload.page) {
      html = HtmlService.createHtmlOutputFromFile(UI_ROUTES[payload.page] || 'UI_Dashboard.html');
    } else {
      return { ok: false, error: 'No content specified' };
    }
    
    html.setTitle(payload.title || 'SerpifAI')
        .setWidth(payload.width || 400);
    
    SpreadsheetApp.getUi().showSidebar(html);
    
    return { ok: true };
    
  } catch (err) {
    return CORE_handleError(err, 'UI_showSidebar');
  }
}

/**
 * Show dialog with HTML content
 * @param {object} payload - Contains html or page
 * @return {object} Result
 */
function UI_showDialog(payload) {
  try {
    let html;
    
    if (payload.html) {
      html = HtmlService.createHtmlOutput(payload.html);
    } else if (payload.page) {
      html = HtmlService.createHtmlOutputFromFile(UI_ROUTES[payload.page] || 'UI_Dashboard.html');
    } else {
      return { ok: false, error: 'No content specified' };
    }
    
    html.setWidth(payload.width || 600)
        .setHeight(payload.height || 400);
    
    SpreadsheetApp.getUi().showModalDialog(html, payload.title || 'SerpifAI');
    
    return { ok: true };
    
  } catch (err) {
    return CORE_handleError(err, 'UI_showDialog');
  }
}

/**
 * Show toast notification
 * @param {object} payload - Contains message and title
 * @return {object} Result
 */
function UI_showToast(payload) {
  try {
    const message = payload.message || '';
    const title = payload.title || 'SerpifAI';
    const duration = payload.duration || 5;
    
    SpreadsheetApp.getActiveSpreadsheet().toast(message, title, duration);
    
    return { ok: true };
    
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Get user settings for Settings tab (V7 compatibility)
 * @return {object} Settings data for UI
 */
function getUserSettings() {
  try {
    const props = PropertiesService.getUserProperties();
    const scriptProps = PropertiesService.getScriptProperties();
    
    // Get API keys status
    const hasSerperKey = !!scriptProps.getProperty('SERPER_API_KEY');
    const hasGeminiKey = !!scriptProps.getProperty('GEMINI_API_KEY');
    const hasLicenseKey = !!props.getProperty('LICENSE_KEY');
    const licenseKey = props.getProperty('LICENSE_KEY') || '';
    
    return {
      status: hasLicenseKey ? 'active' : 'inactive',
      email: props.getProperty('USER_EMAIL') || '',
      credits: parseInt(props.getProperty('CREDITS') || '100'),
      apiStatus: hasSerperKey && hasGeminiKey ? 'Configured' : 'Missing keys',
      hasLicenseKey: hasLicenseKey,
      licenseKeyMasked: licenseKey ? 'SERP-****-' + licenseKey.slice(-4) : '',
      version: SERPIFAI_VERSION || 'v8.0.0',
      dataSource: 'SerpifAI Cloud',
      theme: props.getProperty('setting_theme') || 'light',
      serperConfigured: hasSerperKey,
      geminiConfigured: hasGeminiKey
    };
  } catch (err) {
    LOG_error('getUserSettings', { error: err.message });
    return {
      status: 'error',
      email: '',
      credits: 0,
      apiStatus: 'Error loading',
      hasLicenseKey: false,
      version: 'v8.0.0',
      error: err.message
    };
  }
}

/**
 * Include HTML file content (for templates)
 * @param {string} filename - File to include
 * @return {string} HTML content
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
