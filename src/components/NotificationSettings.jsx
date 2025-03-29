import React, { useContext, useEffect, useState } from 'react';
import { PostcodeContext } from '../context/PostcodeContext';
import { checkNotificationPermission, requestNotificationPermission } from '../utils/notifications';
import * as Sentry from '@sentry/browser';

export default function NotificationSettings() {
  const { postcode, subscribedPostcodes, subscribeToPostcode, unsubscribeFromPostcode } = useContext(PostcodeContext);
  const [notificationsSupported, setNotificationsSupported] = useState(false);
  const [notificationsPermission, setNotificationsPermission] = useState('default');
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    const supported = 'Notification' in window;
    setNotificationsSupported(supported);
    
    if (supported) {
      // Check current permission status
      const permissionStatus = checkNotificationPermission();
      setNotificationsPermission(permissionStatus);
      
      // Check if current postcode is in subscribed list
      const currentPostcodeSubscribed = subscribedPostcodes.includes(postcode);
      setIsSubscribed(currentPostcodeSubscribed);
    }
  }, [postcode, subscribedPostcodes]);

  const handleSubscribeToggle = async () => {
    try {
      if (!notificationsSupported) {
        return;
      }
      
      if (notificationsPermission !== 'granted') {
        const permission = await requestNotificationPermission();
        setNotificationsPermission(permission);
        
        if (permission !== 'granted') {
          return;
        }
      }
      
      if (isSubscribed) {
        unsubscribeFromPostcode(postcode);
      } else {
        subscribeToPostcode(postcode);
      }
      
      setIsSubscribed(!isSubscribed);
    } catch (err) {
      console.error('Error toggling notification subscription:', err);
      Sentry.captureException(err);
    }
  };

  if (!notificationsSupported) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Notifications</h2>
        <p className="text-red-600">Your browser does not support notifications.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Notifications</h2>
      
      <div className="mb-6">
        <p className="mb-2">
          Want to be notified when there are updates for <strong>{postcode || 'M33 5QU'}</strong>?
        </p>
        
        {notificationsPermission === 'denied' ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <p className="text-red-700 text-sm">
              Notification permissions are blocked. Please update your browser settings to allow notifications for this site.
            </p>
          </div>
        ) : (
          <button
            onClick={handleSubscribeToggle}
            className={`w-full mt-2 font-medium py-2 px-4 rounded-md transition duration-200 cursor-pointer ${
              isSubscribed 
                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {isSubscribed ? 'Unsubscribe from Updates' : 'Subscribe to Updates'}
          </button>
        )}
      </div>
      
      {subscribedPostcodes.length > 0 && (
        <div className="mt-4">
          <h3 className="font-medium mb-2">Your Subscriptions</h3>
          <ul className="bg-gray-50 rounded-md p-2">
            {subscribedPostcodes.map(p => (
              <li key={p} className="py-1 px-2 flex justify-between items-center">
                <span>{p}</span>
                <button 
                  onClick={() => unsubscribeFromPostcode(p)}
                  className="text-red-600 hover:text-red-800 text-sm cursor-pointer"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}