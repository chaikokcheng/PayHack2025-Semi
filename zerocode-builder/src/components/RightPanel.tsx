'use client';
import React from 'react';
import { Colors } from '../constants/colors';

export const RightPanel: React.FC = () => {
  return (
    <aside className="h-full flex flex-col bg-white border-l" style={{ borderColor: Colors.border, width: '100%' }}>
      <div className="p-4 border-b" style={{ borderColor: Colors.border }}>
        <h2 className="text-lg font-semibold" style={{ color: Colors.text }}>Chat Assistant</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        <div className="self-start bg-gray-200 text-gray-800 px-3 py-2 rounded-lg max-w-xs">Hi! Need help building your store?</div>
        <div className="self-end bg-pink-500 text-white px-3 py-2 rounded-lg max-w-xs">How do I add a product card?</div>
      </div>
      <form className="p-3 border-t flex items-center gap-2" style={{ borderColor: Colors.border }} onSubmit={e => e.preventDefault()}>
        <input
          type="text"
          className="flex-1 px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-pink-300"
          placeholder="Type your message..."
          style={{ borderColor: Colors.border }}
        />
        <button type="submit" className="bg-pink-500 text-white px-4 py-2 rounded font-medium" style={{ background: Colors.primary }}>Send</button>
      </form>
    </aside>
  );
}; 