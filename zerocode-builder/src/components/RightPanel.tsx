'use client';
import React, { useRef, useState, useEffect } from 'react';
import { Colors } from '../constants/colors';
import { PaperAirplaneIcon, UserCircleIcon, ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/solid';

const BOT_AVATAR = (
  <span className="bg-pink-100 rounded-full p-1 mr-2 flex items-center justify-center">
    <ChatBubbleLeftEllipsisIcon className="h-6 w-6 text-pink-500" />
  </span>
);
const USER_AVATAR = (
  <span className="bg-gray-200 rounded-full p-1 ml-2 flex items-center justify-center">
    <UserCircleIcon className="h-6 w-6 text-gray-500" />
  </span>
);

const PRESET_REPLIES = [
  'How do I add a product card?',
  'How do I change the theme?',
  'Can I preview my store?',
  'How do I publish?',
];

const BOT_RESPONSES: Record<string, string> = {
  'How do I add a product card?': 'To add a product card, drag the "Product Card" element from the left panel into your store preview.',
  'How do I change the theme?': 'Theme options will be available soon! For now, you can customize elements individually.',
  'Can I preview my store?': 'The center panel shows a live preview as you build. You can also click the preview button (coming soon).',
  'How do I publish?': 'Publishing will be available in the next release. Stay tuned!',
};

export const RightPanel: React.FC = () => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! Need help building your store?' },
  ]);
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom on new message
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (msg?: string) => {
    const userMsg = msg || input.trim();
    if (!userMsg) return;
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');
    setShowSuggestions(true);
    setSuggestions(PRESET_REPLIES);
    // Simulate bot reply if preset
    setTimeout(() => {
      if (BOT_RESPONSES[userMsg]) {
        setMessages((prev) => [
          ...prev,
          { sender: 'bot', text: BOT_RESPONSES[userMsg] },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: 'bot', text: "I'm here to help! Try one of the suggestions below." },
        ]);
      }
    }, 600);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setShowSuggestions(false);
    handleSend(suggestion);
  };

  return (
    <aside
      className="h-full flex flex-col bg-white border-l shadow-lg"
      style={{ borderColor: Colors.border, width: '100%' }}
    >
      <div className="p-4 border-b bg-gradient-to-r from-pink-50 to-white" style={{ borderColor: Colors.border }}>
        <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: Colors.text }}>
          <ChatBubbleLeftEllipsisIcon className="h-6 w-6 text-pink-400" /> Chat Assistant
        </h2>
      </div>
      <div className="flex-1 min-h-0 flex flex-col">
        <div
          ref={chatRef}
          className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-gray-50 scrollbar-thin scrollbar-thumb-pink-200 scrollbar-track-gray-100"
          style={{ scrollBehavior: 'smooth' }}
        >
          {messages.map((msg, idx) => (
            <React.Fragment key={idx}>
              <div
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && BOT_AVATAR}
                <div
                  className={`rounded-2xl px-4 py-2 shadow-sm max-w-xs text-base font-normal ${
                    msg.sender === 'user'
                      ? 'bg-pink-500 text-white ml-2'
                      : 'bg-white text-gray-800 border mr-2'
                  }`}
                  style={
                    msg.sender === 'user'
                      ? { background: Colors.primary }
                      : { borderColor: Colors.border }
                  }
                >
                  {msg.text}
                </div>
                {msg.sender === 'user' && USER_AVATAR}
              </div>
              {/* If this is the last message and it's from the bot, show suggestions */}
              {idx === messages.length - 1 && msg.sender === 'bot' && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {PRESET_REPLIES.map((s, i) => (
                    <button
                      key={i}
                      className="px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-sm font-medium hover:bg-pink-200 transition border border-pink-200 shadow-sm"
                      onClick={() => handleSuggestionClick(s)}
                      type="button"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
      <form
        className="p-3 border-t flex items-center gap-2 bg-white shadow-inner"
        style={{ borderColor: Colors.border }}
        onSubmit={e => {
          e.preventDefault();
          handleSend();
        }}
      >
        <input
          type="text"
          className="flex-1 px-3 py-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-pink-200 bg-gray-50 shadow-sm"
          placeholder="Type your message..."
          style={{ borderColor: Colors.border, color: Colors.text }}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleInputKeyDown}
        />
        <button
          type="submit"
          className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-full font-medium flex items-center gap-1 shadow-md transition"
          style={{ background: Colors.primary }}
        >
          <PaperAirplaneIcon className="h-5 w-5" />
        </button>
      </form>
    </aside>
  );
}; 