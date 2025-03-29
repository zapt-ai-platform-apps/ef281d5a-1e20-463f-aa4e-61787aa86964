import React, { createContext, useState, useEffect } from 'react';
import { saveToLocalStorage, getFromLocalStorage } from '../utils/storage';
import { sendNotification } from '../utils/notifications';
import * as Sentry from '@sentry/browser';

// Default postcode we're focusing on
const DEFAULT_POSTCODE = 'M33 5QU';

export const PostcodeContext = createContext();

export const PostcodeProvider = ({ children }) => {
  const [postcode, setPostcode] = useState(getFromLocalStorage('currentPostcode') || DEFAULT_POSTCODE);
  const [results, setResults] = useState(getFromLocalStorage('postcodeResults')?.[postcode] || null);
  const [loading, setLoading] = useState(false);
  const [subscribedPostcodes, setSubscribedPostcodes] = useState(
    getFromLocalStorage('subscribedPostcodes') || []
  );
  const [checkFrequency, setCheckFrequency] = useState(
    getFromLocalStorage('checkFrequency') || 30 * 60 * 1000 // 30 minutes default
  );

  // Save current postcode when it changes
  useEffect(() => {
    saveToLocalStorage('currentPostcode', postcode);
  }, [postcode]);

  // Save subscribed postcodes when they change
  useEffect(() => {
    saveToLocalStorage('subscribedPostcodes', subscribedPostcodes);
  }, [subscribedPostcodes]);

  // Periodically check results for subscribed postcodes
  useEffect(() => {
    if (subscribedPostcodes.length === 0) return;

    const checkSubscribedPostcodes = async () => {
      console.log('Checking subscribed postcodes:', subscribedPostcodes);
      
      for (const subscribedPostcode of subscribedPostcodes) {
        try {
          const oldResults = getFromLocalStorage('postcodeResults')?.[subscribedPostcode];
          const newResults = await fetchPostcodeResults(subscribedPostcode);
          
          // If we have old results and they've changed to a win, send notification
          if (oldResults && !oldResults.won && newResults.won) {
            sendNotification(
              'Postcode Lottery Winner!',
              `Great news! ${subscribedPostcode} has won!`,
              { postcode: subscribedPostcode }
            );
          }
        } catch (err) {
          console.error(`Error checking subscribed postcode ${subscribedPostcode}:`, err);
          Sentry.captureException(err);
        }
      }
    };

    // Initial check
    checkSubscribedPostcodes();
    
    // Set up interval
    const intervalId = setInterval(checkSubscribedPostcodes, checkFrequency);
    
    return () => clearInterval(intervalId);
  }, [subscribedPostcodes, checkFrequency]);

  // Function to fetch results from "API" 
  const fetchPostcodeResults = async (postcodeToCheck) => {
    // For demo purposes, we'll simulate an API call
    // In a real app, this would make an actual API request to a postcode lottery service
    console.log(`Fetching results for postcode: ${postcodeToCheck}`);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        // This is just a simulation - in reality you'd call an actual API
        // For demo purposes, M33 5QU sometimes wins
        const isWinner = postcodeToCheck.toUpperCase() === 'M33 5QU' && Math.random() > 0.7;
        
        const results = {
          postcode: postcodeToCheck.toUpperCase(),
          won: isWinner,
          lastChecked: new Date().toISOString(),
          message: isWinner 
            ? "Congratulations, you're a winner!" 
            : "No win this time, but keep checking!"
        };
        
        // Save the results
        const allResults = getFromLocalStorage('postcodeResults') || {};
        allResults[postcodeToCheck] = results;
        saveToLocalStorage('postcodeResults', allResults);
        
        resolve(results);
      }, 1500); // Simulate network delay
    });
  };

  // Check results for a given postcode
  const checkResults = async (postcodeToCheck = postcode) => {
    if (!postcodeToCheck) return;
    
    try {
      setLoading(true);
      const results = await fetchPostcodeResults(postcodeToCheck);
      setResults(results);
      return results;
    } catch (err) {
      console.error('Error fetching postcode results:', err);
      Sentry.captureException(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to a postcode
  const subscribeToPostcode = (postcodeToSubscribe) => {
    if (!postcodeToSubscribe) return;
    
    const formattedPostcode = postcodeToSubscribe.trim().toUpperCase();
    
    if (subscribedPostcodes.includes(formattedPostcode)) {
      return; // Already subscribed
    }
    
    setSubscribedPostcodes([...subscribedPostcodes, formattedPostcode]);
    console.log(`Subscribed to postcode: ${formattedPostcode}`);
  };

  // Unsubscribe from a postcode
  const unsubscribeFromPostcode = (postcodeToUnsubscribe) => {
    if (!postcodeToUnsubscribe) return;
    
    const formattedPostcode = postcodeToUnsubscribe.trim().toUpperCase();
    
    setSubscribedPostcodes(
      subscribedPostcodes.filter(p => p !== formattedPostcode)
    );
    console.log(`Unsubscribed from postcode: ${formattedPostcode}`);
  };

  // Update check frequency
  const updateCheckFrequency = (minutes) => {
    const milliseconds = minutes * 60 * 1000;
    setCheckFrequency(milliseconds);
    saveToLocalStorage('checkFrequency', milliseconds);
  };

  return (
    <PostcodeContext.Provider
      value={{
        postcode,
        setPostcode,
        results,
        loading,
        checkResults,
        subscribedPostcodes,
        subscribeToPostcode,
        unsubscribeFromPostcode,
        checkFrequency,
        updateCheckFrequency
      }}
    >
      {children}
    </PostcodeContext.Provider>
  );
};