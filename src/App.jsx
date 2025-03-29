import React from 'react';
import PostcodeChecker from './components/PostcodeChecker';
import NotificationSettings from './components/NotificationSettings';
import { PostcodeProvider } from './context/PostcodeContext';
import ZaptBadge from './components/ZaptBadge';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-blue-700 mb-2">Postcode Lottery Checker</h1>
          <p className="text-slate-600">Check your postcode lottery results and get notifications</p>
        </header>
        
        <PostcodeProvider>
          <main className="max-w-lg mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <PostcodeChecker />
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <NotificationSettings />
            </div>
          </main>
        </PostcodeProvider>
        
        <ZaptBadge />
      </div>
    </div>
  );
}