import * as Sentry from '@sentry/browser';

/**
 * Check if browser supports notifications and get current permission status
 * @returns {string} Permission status: 'granted', 'denied', or 'default'
 */
export function checkNotificationPermission() {
  if (!('Notification' in window)) {
    return 'denied';
  }
  
  return Notification.permission;
}

/**
 * Request permission to show notifications
 * @returns {Promise<string>} Promise resolving to permission status
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    return 'denied';
  }
  
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    Sentry.captureException(error);
    return 'denied';
  }
}

/**
 * Send a browser notification
 * @param {string} title - Notification title
 * @param {string} body - Notification message body
 * @param {Object} data - Additional data to include with notification
 * @returns {Notification|null} The notification object or null if unsuccessful
 */
export function sendNotification(title, body, data = {}) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    console.log('Cannot send notification: permission not granted');
    return null;
  }
  
  try {
    const options = {
      body,
      icon: 'https://supabase.zapt.ai/storage/v1/render/image/public/icons/c7bd5333-787f-461f-ae9b-22acbc0ed4b0/55145115-0624-472f-96b9-d5d88aae355f.png?width=128&height=128',
      badge: 'https://supabase.zapt.ai/storage/v1/render/image/public/icons/c7bd5333-787f-461f-ae9b-22acbc0ed4b0/55145115-0624-472f-96b9-d5d88aae355f.png?width=128&height=128',
      data,
      requireInteraction: true
    };
    
    const notification = new Notification(title, options);
    
    notification.onclick = function() {
      window.focus();
      notification.close();
    };
    
    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
    Sentry.captureException(error);
    return null;
  }
}