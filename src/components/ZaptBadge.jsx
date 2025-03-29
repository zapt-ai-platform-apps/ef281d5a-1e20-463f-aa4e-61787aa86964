import React from 'react';

export default function ZaptBadge() {
  return (
    <div className="fixed bottom-4 right-4">
      <a 
        href="https://www.zapt.ai" 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-xs bg-black text-white px-2 py-1 rounded-md opacity-80 hover:opacity-100 transition-opacity"
      >
        Made on ZAPT
      </a>
    </div>
  );
}