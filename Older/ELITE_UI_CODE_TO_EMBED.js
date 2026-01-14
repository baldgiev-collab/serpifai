// ═══════════════════════════════════════════════════════════════════════════
// ELITE 15-CATEGORY UI RENDERING SYSTEM (Embedded to fix loading issues)
// This code was previously in UI_CompetitorCategories.html but wasn't loading
// Now embedded directly to ensure window.renderCompetitorCategories is defined
// ═══════════════════════════════════════════════════════════════════════════

const ELITE_CATEGORY_CONFIG = [
  { id: 1, name: 'Market Position Intelligence', icon: '🎯', desc: 'Market segmentation & competitive positioning' },
  { id: 2, name: 'Brand Strategy Analysis', icon: '🎨', desc: 'Brand voice, UVP & differentiation' },
  { id: 3, name: 'Technical SEO Excellence', icon: '⚡', desc: 'Core Web Vitals & technical performance' },
  { id: 4, name: 'Content Intelligence', icon: '📝', desc: 'Content strategy, gaps & opportunities' },
  { id: 5, name: 'Keyword Strategy', icon: '🔑', desc: 'Keyword portfolio & ranking analysis' },
  { id: 6, name: 'Authority & Trust', icon: '🛡️', desc: 'Backlinks, domain authority & trust signals' },
  { id: 7, name: 'User Experience', icon: '🎭', desc: 'UX quality, design & usability' },
  { id: 8, name: 'Conversion Optimization', icon: '🎯', desc: 'CRO strategy & conversion funnels' },
  { id: 9, name: 'Social Signals', icon: '📱', desc: 'Social media presence & engagement' },
  { id: 10, name: 'Paid Advertising', icon: '💰', desc: 'PPC strategy & ad performance' },
  { id: 11, name: 'Local SEO', icon: '📍', desc: 'Local presence & geo-targeting' },
  { id: 12, name: 'E-commerce Metrics', icon: '🛒', desc: 'Product strategy & e-commerce performance' },
  { id: 13, name: 'Mobile Optimization', icon: '📱', desc: 'Mobile-first design & performance' },
  { id: 14, name: 'Security & Compliance', icon: '🔒', desc: 'Security measures & compliance status' },
  { id: 15, name: 'Innovation & Technology', icon: '🚀', desc: 'Technology stack & innovation' }
];

/**
 * Main rendering function for 15-category tab system
 */
window.renderCompetitorCategories = function(analysisData, containerId) {
  console.log('🎨 Elite UI: Rendering 15-category analysis...');
  console.log('   Analysis data type:', typeof analysisData);
  console.log('   Container ID:', containerId);
  
  const container = document.getElementById(containerId);
  if (!container) {
    console.error('❌ Container not found:', containerId);
    return;
  }
  
  // Validate and extract categories
  let categories = [];
  if (!analysisData) {
    console.warn('⚠️ No analysis data provided');
    container.innerHTML = renderEmptyState('Analysis data not available. Run a new analysis to see insights.');
    return;
  }
  
  // Handle different data structures
  if (Array.isArray(analysisData)) {
    categories = analysisData;
  } else if (analysisData.categories && Array.isArray(analysisData.categories)) {
    categories = analysisData.categories;
  } else if (typeof analysisData === 'object') {
    // Convert object to array (Gemini returns object with numeric keys)
    categories = Object.keys(analysisData)
      .filter(key => !isNaN(parseInt(key))) // Only numeric keys
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(key => ({
        id: parseInt(key),
        ...analysisData[key]
      }));
  }
  
  console.log('   Categories extracted:', categories.length);
  console.log('   First category:', categories[0]);
  
  if (categories.length === 0) {
    container.innerHTML = renderEmptyState('No category data found in analysis');
    return;
  }
  
  // Build HTML with 50/50 layout (Text left, Chart right)
  let html = `
    <div style="background: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden; margin: 30px 0;">
      <!-- Tab Navigation -->
      <div style="display: flex; overflow-x: auto; background: linear-gradient(180deg, #f8f9fb 0%, #ffffff 100%); border-bottom: 2px solid #e0e0e0; padding: 12px 20px; gap: 8px; position: sticky; top: 0; z-index: 100;">
  `;
  
  // Render tabs
  categories.forEach((category, idx) => {
    const config = ELITE_CATEGORY_CONFIG[idx] || ELITE_CATEGORY_CONFIG[0];
    const isActive = idx === 0;
    const tabId = `elite-tab-${idx + 1}`;
    
    html += `
      <button 
        id="${tabId}"
        class="elite-category-tab ${isActive ? 'active' : ''}" 
        data-category-id="${idx + 1}"
        onclick="window.switchEliteCategoryTab(${idx + 1})"
        style="flex-shrink: 0; padding: 14px 22px; background: ${isActive ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent'}; color: ${isActive ? 'white' : '#64748b'}; border: none; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; white-space: nowrap; display: flex; align-items: center; gap: 8px; box-shadow: ${isActive ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none'};"
      >
        <span style="font-size: 16px;">${config.icon}</span>
        <span>${config.name}</span>
      </button>
    `;
  });
  
  html += `
      </div>
      <div class="elite-category-panels">
  `;
  
  // Render content panels
  categories.forEach((category, idx) => {
    const config = ELITE_CATEGORY_CONFIG[idx] || ELITE_CATEGORY_CONFIG[0];
    const isActive = idx === 0;
    html += renderEliteCategoryPanel(category, config, isActive, idx + 1);
  });
  
  html += `
      </div>
    </div>
  `;
  
  container.innerHTML = html;
  console.log('   ✅ Elite UI rendered successfully');
};

/**
 * Render individual category panel with 50/50 layout
 */
function renderEliteCategoryPanel(category, config, isActive, categoryId) {
  const insights = category.insights || [];
  const recommendations = category.recommendations || [];
  const metrics = category.metrics || {};
  const analysis = category.analysis || 'No analysis available for this category.';
  
  return `
    <div 
      class="elite-category-panel ${isActive ? 'active' : ''}" 
      id="elite-category-${categoryId}"
      style="display: ${isActive ? 'block' : 'none'}; padding: 40px; background: linear-gradient(180deg, #ffffff 0%, #f8f9fb 100%);"
    >
      <!-- 50/50 Grid: Text Left, Chart Right -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
        
        <!-- LEFT PANEL: AI Analysis & Insights -->
        <div style="background: white; border-radius: 16px; padding: 30px; box-shadow: 0 4px 16px rgba(0,0,0,0.06);">
          <!-- Category Header -->
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
            <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);">
              ${config.icon}
            </div>
            <div>
              <h3 style="margin: 0; font-size: 20px; font-weight: 700; color: #1e293b;">${config.name}</h3>
              <p style="margin: 4px 0 0; font-size: 13px; color: #64748b;">${config.desc}</p>
            </div>
          </div>
          
          <!-- AI Analysis Text -->
          <div style="font-size: 15px; line-height: 1.8; color: #475569; padding: 20px; background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%); border-radius: 12px; border-left: 4px solid #667eea; max-height: 400px; overflow-y: auto;">
            ${formatAnalysisText(analysis)}
          </div>
          
          <!-- Key Insights -->
          ${insights.length > 0 ? `
            <div style="margin-top: 24px;">
              <h4 style="font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                <span>💡</span> Key Insights
              </h4>
              <ul style="list-style: none; padding: 0; margin: 0;">
                ${insights.map(insight => `
                  <li style="padding: 12px 16px; margin-bottom: 8px; background: white; border-radius: 10px; border-left: 3px solid #10b981; box-shadow: 0 2px 8px rgba(0,0,0,0.04); font-size: 14px; color: #475569; display: flex; gap: 10px;">
                    <span style="color: #10b981; font-weight: 700;">✓</span>
                    <span>${insight}</span>
                  </li>
                `).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
        
        <!-- RIGHT PANEL: Chart Visualization -->
        <div style="background: white; border-radius: 16px; padding: 30px; box-shadow: 0 4px 16px rgba(0,0,0,0.06);">
          <h4 style="font-size: 16px; font-weight: 700; color: #1e293b; margin: 0 0 20px; display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 20px;">📊</span> Visual Analysis
          </h4>
          <div id="elite-chart-${categoryId}" style="width: 100%; height: 400px; background: linear-gradient(180deg, rgba(102, 126, 234, 0.02) 0%, transparent 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #94a3b8;">
            <div style="text-align: center;">
              <div style="font-size: 48px; margin-bottom: 12px;">📊</div>
              <div style="font-weight: 600; font-size: 16px;">Data Visualization</div>
              <div style="font-size: 13px; margin-top: 8px; opacity: 0.7;">Category ${categoryId} metrics</div>
            </div>
          </div>
          
          <!-- Metrics Summary -->
          ${Object.keys(metrics).length > 0 ? `
            <div style="margin-top: 20px; padding: 16px; background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%); border-radius: 12px;">
              <h5 style="margin: 0 0 12px; font-size: 14px; font-weight: 700; color: #1e293b;">📈 Key Metrics</h5>
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                ${Object.entries(metrics).slice(0, 4).map(([key, value]) => `
                  <div style="padding: 10px; background: white; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.04);">
                    <div style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">${formatMetricLabel(key)}</div>
                    <div style="font-size: 18px; font-weight: 700; color: #667eea;">${formatMetricValue(value)}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
      
      <!-- Recommendations Section (Full Width) -->
      ${recommendations.length > 0 ? `
        <div style="background: white; border-radius: 16px; padding: 30px; box-shadow: 0 4px 16px rgba(0,0,0,0.06);">
          <h4 style="font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
            <span>🎯</span> Strategic Recommendations
          </h4>
          <ul style="list-style: none; padding: 0; margin: 0;">
            ${recommendations.map(rec => {
              const recText = typeof rec === 'string' ? rec : rec.text || rec.recommendation || '';
              let priority = 'Low';
              let color = '#3b82f6';
              
              const lowerText = recText.toLowerCase();
              if (lowerText.includes('immediate') || lowerText.includes('critical') || lowerText.includes('priority 1') || lowerText.includes('high priority')) {
                priority = 'High';
                color = '#ef4444';
              } else if (lowerText.includes('important') || lowerText.includes('short-term') || lowerText.includes('priority 2') || lowerText.includes('medium priority')) {
                priority = 'Medium';
                color = '#f59e0b';
              }
              
              return `
                <li style="padding: 14px 18px; margin-bottom: 10px; background: white; border-radius: 10px; border-left: 4px solid ${color}; box-shadow: 0 2px 8px rgba(0,0,0,0.04); font-size: 14px; color: #475569; display: flex; gap: 12px; align-items: flex-start; position: relative; transition: all 0.3s ease;" onmouseover="this.style.transform='translateX(4px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.08)';" onmouseout="this.style.transform='translateX(0)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.04)';">
                  <span style="font-size: 16px; flex-shrink: 0;">🎯</span>
                  <span style="flex: 1;">${recText}</span>
                  <span style="padding: 3px 10px; border-radius: 12px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; background: linear-gradient(135deg, ${color} 0%, ${color}dd 100%); color: white; white-space: nowrap; flex-shrink: 0;">${priority}</span>
                </li>
              `;
            }).join('')}
          </ul>
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Format analysis text with paragraphs
 */
function formatAnalysisText(text) {
  if (!text) return '<p style="margin: 0; color: #94a3b8;">No analysis available for this category.</p>';
  
  // Handle both string and array formats
  if (Array.isArray(text)) {
    text = text.join('\n\n');
  }
  
  // Convert to string if object
  if (typeof text === 'object') {
    text = JSON.stringify(text, null, 2);
  }
  
  // Split into paragraphs and format
  return text
    .split('\n\n')
    .filter(p => p.trim())
    .map(p => `<p style="margin: 0 0 12px; line-height: 1.7;">${p.trim().replace(/\n/g, '<br>')}</p>`)
    .join('');
}

/**
 * Format metric labels (camelCase → Title Case)
 */
function formatMetricLabel(key) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

/**
 * Format metric values (numbers with K/M suffix)
 */
function formatMetricValue(value) {
  if (typeof value === 'number') {
    if (value > 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value > 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toLocaleString();
  }
  return value;
}

/**
 * Switch between category tabs
 */
window.switchEliteCategoryTab = function(categoryId) {
  console.log('🔄 Elite UI: Switching to category:', categoryId);
  
  // Update tab active states
  const tabs = document.querySelectorAll('.elite-category-tab');
  tabs.forEach(tab => {
    const tabId = parseInt(tab.dataset.categoryId);
    const isActive = tabId === categoryId;
    
    if (isActive) {
      tab.classList.add('active');
      tab.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      tab.style.color = 'white';
      tab.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
    } else {
      tab.classList.remove('active');
      tab.style.background = 'transparent';
      tab.style.color = '#64748b';
      tab.style.boxShadow = 'none';
    }
  });
  
  // Update panel display states
  const panels = document.querySelectorAll('.elite-category-panel');
  panels.forEach(panel => {
    const panelId = parseInt(panel.id.replace('elite-category-', ''));
    const isActive = panelId === categoryId;
    
    panel.classList.toggle('active', isActive);
    panel.style.display = isActive ? 'block' : 'none';
  });
  
  // Scroll active tab into view
  const activeTab = document.querySelector(`.elite-category-tab[data-category-id="${categoryId}"]`);
  if (activeTab) {
    activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }
  
  console.log('   ✅ Switched to category', categoryId);
};

/**
 * Render empty state
 */
function renderEmptyState(message) {
  return `
    <div style="text-align: center; padding: 80px 40px; color: #94a3b8; background: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); margin: 30px 0;">
      <div style="font-size: 64px; margin-bottom: 20px; opacity: 0.5;">📊</div>
      <h4 style="font-size: 20px; font-weight: 700; color: #475569; margin-bottom: 12px;">No Analysis Available</h4>
      <p style="font-size: 15px; color: #64748b; max-width: 400px; margin: 0 auto;">${message || 'Run a competitor analysis to see AI-generated insights here'}</p>
    </div>
  `;
}

console.log('✅ Elite 15-Category UI System loaded (embedded in main script)');
