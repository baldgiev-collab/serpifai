/**
 * DB_Notifications.gs - Notification Management
 * SerpifAI V8 - Email and in-app notifications
 */

// ═══════════════════════════════════════════════════════════════════════════════════
// NOTIFICATION MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Send email notification
 */
function DB_sendEmailNotification(params) {
  const to = params.to || Session.getActiveUser().getEmail();
  const subject = params.subject;
  const body = params.body;
  const htmlBody = params.htmlBody;
  
  if (!subject || !body) {
    return { ok: false, error: 'Subject and body required' };
  }
  
  try {
    const options = {
      to: to,
      subject: '[SerpifAI] ' + subject,
      body: body
    };
    
    if (htmlBody) {
      options.htmlBody = htmlBody;
    }
    
    MailApp.sendEmail(options);
    
    // Log notification
    logNotification({
      type: 'email',
      recipient: to,
      subject: subject,
      status: 'sent'
    });
    
    return { ok: true, recipient: to };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Log notification to database
 */
function logNotification(data) {
  try {
    const props = PropertiesService.getUserProperties();
    let notifications = JSON.parse(props.getProperty('notifications') || '[]');
    
    notifications.unshift({
      ...data,
      timestamp: new Date().toISOString()
    });
    
    // Keep only last 100
    notifications = notifications.slice(0, 100);
    
    props.setProperty('notifications', JSON.stringify(notifications));
  } catch (e) {
    console.error('Failed to log notification:', e);
  }
}

/**
 * Get notification history
 */
function DB_getNotificationHistory(params) {
  const limit = params.limit || 50;
  
  try {
    const props = PropertiesService.getUserProperties();
    const notifications = JSON.parse(props.getProperty('notifications') || '[]');
    
    return {
      ok: true,
      notifications: notifications.slice(0, limit)
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Send rank change notification
 */
function DB_notifyRankChange(params) {
  const keyword = params.keyword;
  const oldPosition = params.oldPosition;
  const newPosition = params.newPosition;
  const url = params.url;
  
  const change = oldPosition - newPosition;
  const direction = change > 0 ? 'improved' : 'dropped';
  const emoji = change > 0 ? '📈' : '📉';
  
  const subject = emoji + ' Ranking ' + direction + ' for "' + keyword + '"';
  const body = 'Your ranking for "' + keyword + '" has ' + direction + '.\n\n' +
    'Previous Position: ' + oldPosition + '\n' +
    'New Position: ' + newPosition + '\n' +
    'Change: ' + (change > 0 ? '+' : '') + change + ' positions\n\n' +
    'URL: ' + (url || 'N/A');
  
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: ${change > 0 ? '#34A853' : '#EA4335'};">
        ${emoji} Ranking ${direction} for "${keyword}"
      </h2>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Previous Position:</strong> ${oldPosition}</p>
        <p style="margin: 8px 0;"><strong>New Position:</strong> ${newPosition}</p>
        <p style="margin: 0; font-size: 24px; color: ${change > 0 ? '#34A853' : '#EA4335'};">
          ${change > 0 ? '+' : ''}${change} positions
        </p>
      </div>
      ${url ? `<p><strong>URL:</strong> <a href="${url}">${url}</a></p>` : ''}
    </div>
  `;
  
  return DB_sendEmailNotification({
    subject: subject,
    body: body,
    htmlBody: htmlBody
  });
}

/**
 * Send weekly report notification
 */
function DB_notifyWeeklyReport(params) {
  const projectName = params.projectName;
  const stats = params.stats || {};
  
  const subject = '📊 Weekly SEO Report: ' + projectName;
  
  const body = 'Your weekly SEO report for ' + projectName + ':\n\n' +
    'Keywords Tracked: ' + (stats.keywordCount || 0) + '\n' +
    'Average Position: ' + (stats.avgPosition || 'N/A') + '\n' +
    'Top 10 Keywords: ' + (stats.top10 || 0) + '\n' +
    'Position Improvements: ' + (stats.improvements || 0) + '\n' +
    'Position Declines: ' + (stats.declines || 0);
  
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>📊 Weekly SEO Report: ${projectName}</h2>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr style="background: #f5f5f5;">
          <td style="padding: 12px; border: 1px solid #ddd;">Keywords Tracked</td>
          <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">${stats.keywordCount || 0}</td>
        </tr>
        <tr>
          <td style="padding: 12px; border: 1px solid #ddd;">Average Position</td>
          <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">${stats.avgPosition || 'N/A'}</td>
        </tr>
        <tr style="background: #f5f5f5;">
          <td style="padding: 12px; border: 1px solid #ddd;">Top 10 Keywords</td>
          <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">${stats.top10 || 0}</td>
        </tr>
        <tr>
          <td style="padding: 12px; border: 1px solid #ddd;">Position Improvements</td>
          <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; color: #34A853;">+${stats.improvements || 0}</td>
        </tr>
        <tr style="background: #f5f5f5;">
          <td style="padding: 12px; border: 1px solid #ddd;">Position Declines</td>
          <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; color: #EA4335;">-${stats.declines || 0}</td>
        </tr>
      </table>
    </div>
  `;
  
  return DB_sendEmailNotification({
    subject: subject,
    body: body,
    htmlBody: htmlBody
  });
}

/**
 * Send alert notification
 */
function DB_notifyAlert(params) {
  const alertType = params.alertType;
  const message = params.message;
  const details = params.details || {};
  
  const alertEmojis = {
    ranking: '📊',
    error: '❌',
    warning: '⚠️',
    success: '✅',
    info: 'ℹ️'
  };
  
  const emoji = alertEmojis[alertType] || 'ℹ️';
  const subject = emoji + ' Alert: ' + message;
  
  let body = message + '\n\n';
  Object.keys(details).forEach(function(key) {
    body += key + ': ' + details[key] + '\n';
  });
  
  return DB_sendEmailNotification({
    subject: subject,
    body: body
  });
}

/**
 * Create in-app notification
 */
function DB_createInAppNotification(params) {
  const type = params.type || 'info';
  const title = params.title;
  const message = params.message;
  const actionUrl = params.actionUrl;
  
  if (!title) {
    return { ok: false, error: 'Title required' };
  }
  
  try {
    const props = PropertiesService.getUserProperties();
    let inAppNotifs = JSON.parse(props.getProperty('inAppNotifications') || '[]');
    
    const notification = {
      id: Date.now().toString(),
      type: type,
      title: title,
      message: message || '',
      actionUrl: actionUrl,
      read: false,
      createdAt: new Date().toISOString()
    };
    
    inAppNotifs.unshift(notification);
    
    // Keep only last 50
    inAppNotifs = inAppNotifs.slice(0, 50);
    
    props.setProperty('inAppNotifications', JSON.stringify(inAppNotifs));
    
    return { ok: true, notification: notification };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Get in-app notifications
 */
function DB_getInAppNotifications(params) {
  const unreadOnly = params.unreadOnly || false;
  
  try {
    const props = PropertiesService.getUserProperties();
    let notifications = JSON.parse(props.getProperty('inAppNotifications') || '[]');
    
    if (unreadOnly) {
      notifications = notifications.filter(function(n) { return !n.read; });
    }
    
    return {
      ok: true,
      notifications: notifications,
      unreadCount: notifications.filter(function(n) { return !n.read; }).length
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Mark notification as read
 */
function DB_markNotificationRead(params) {
  const notificationId = params.id;
  
  try {
    const props = PropertiesService.getUserProperties();
    let notifications = JSON.parse(props.getProperty('inAppNotifications') || '[]');
    
    notifications = notifications.map(function(n) {
      if (n.id === notificationId) {
        n.read = true;
      }
      return n;
    });
    
    props.setProperty('inAppNotifications', JSON.stringify(notifications));
    
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Mark all notifications as read
 */
function DB_markAllNotificationsRead() {
  try {
    const props = PropertiesService.getUserProperties();
    let notifications = JSON.parse(props.getProperty('inAppNotifications') || '[]');
    
    notifications = notifications.map(function(n) {
      n.read = true;
      return n;
    });
    
    props.setProperty('inAppNotifications', JSON.stringify(notifications));
    
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Clear old notifications
 */
function DB_clearOldNotifications(params) {
  const daysOld = params.daysOld || 30;
  
  try {
    const props = PropertiesService.getUserProperties();
    let notifications = JSON.parse(props.getProperty('inAppNotifications') || '[]');
    
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysOld);
    
    const before = notifications.length;
    notifications = notifications.filter(function(n) {
      return new Date(n.createdAt) > cutoff;
    });
    
    props.setProperty('inAppNotifications', JSON.stringify(notifications));
    
    return {
      ok: true,
      removed: before - notifications.length,
      remaining: notifications.length
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
