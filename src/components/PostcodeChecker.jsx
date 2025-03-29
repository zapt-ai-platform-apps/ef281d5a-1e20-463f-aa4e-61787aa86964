import React, { useState, useContext } from 'react';
import { PostcodeContext } from '../context/PostcodeContext';
import * as Sentry from '@sentry/browser';

export default function PostcodeChecker() {
  const { postcode, setPostcode, checkResults, results, loading } = useContext(PostcodeContext);
  const [inputPostcode, setInputPostcode] = useState(postcode || 'M33 5QU');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    const formattedPostcode = inputPostcode.trim().toUpperCase();
    const postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;
    
    if (!postcodeRegex.test(formattedPostcode)) {
      setError('Please enter a valid UK postcode');
      return;
    }
    
    setError('');
    
    try {
      setPostcode(formattedPostcode);
      await checkResults(formattedPostcode);
    } catch (err) {
      console.error('Error checking postcode:', err);
      Sentry.captureException(err);
      setError('There was an error checking your postcode. Please try again.');
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Check Your Postcode</h2>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label htmlFor="postcode" className="block text-sm font-medium text-gray-700 mb-1">
            Enter Postcode
          </label>
          <input
            id="postcode"
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 box-border"
            value={inputPostcode}
            onChange={(e) => setInputPostcode(e.target.value)}
            placeholder="e.g. M33 5QU"
          />
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 cursor-pointer disabled:bg-blue-400 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Checking...
            </span>
          ) : (
            'Check Results'
          )}
        </button>
      </form>
      
      {results && (
        <div className="border-t pt-4">
          <h3 className="font-medium text-lg mb-2">Results for {results.postcode}</h3>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="mb-2">
              <span className="font-medium">Status:</span>{' '}
              {results.won ? (
                <span className="text-green-600 font-bold">Winner!</span>
              ) : (
                <span className="text-gray-600">No win this time</span>
              )}
            </p>
            <p className="mb-2">
              <span className="font-medium">Last checked:</span>{' '}
              {new Date(results.lastChecked).toLocaleString()}
            </p>
            {results.message && (
              <p className="text-sm mt-2 italic">{results.message}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}