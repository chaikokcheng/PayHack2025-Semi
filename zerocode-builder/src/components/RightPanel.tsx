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
  'I need a sample template',
  'How do I publish?',
];

const BOT_RESPONSES: Record<string, string> = {
  'How do I add a product card?': 'To add a product card, drag the "Product Card" element from the left panel into your store preview.',
  'How do I change the theme?': 'Theme options will be available soon! For now, you can customize elements individually.',
  'Can I preview my store?': 'The center panel shows a live preview as you build. You can also click the preview button (coming soon).',
  'How do I publish?': 'Publishing will be available in the next release. Stay tuned!',
};

// Gemini API utility
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY; // <-- Replace with your real key or use env
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
console.log('GEMINI_API_KEY:', GEMINI_API_KEY);

const GEMINI_SYSTEM_PROMPT = `You are an assistant for a codeless app builder. When a user sends a message, analyze their intent:\n\n- If the user wants to create an app, reply with a JSON object in this format:\n{\n  \"intent\": \"create_app\",\n  \"TextHeader\": \"The main title or header for the app (if specified)\",\n  \"TextDescription\": \"A short, creative, and engaging description that fits the user's business or persona and attracts customers.\",\n  \"ImageBanner\": \"A single word or phrase describing the business category for the image banner. Use one of: food, painting, handicraft, gadget, gardening, tailoring. If you cannot identify the business type, use 'default'.\",\n  \"reply\": \"A friendly, helpful, conversational response to the user's app creation request.\",\n  \"summary\": \"Short summary of what the user wants\"\n}\n- If the user wants to add a single element, reply with:\n{\n  \"intent\": \"add_element\",\n  \"elementType\": \"text-header\" | \"text-description\" | \"image-banner\" | ... ,\n  \"initialValue\": \"The initial value for the element, if specified, otherwise empty or default\",\n  \"reply\": \"Conversational response confirming the addition\"\n}\n- If the user does not want to create an app or add an element, reply with:\n{\n  \"intent\": \"other\",\n  \"reply\": \"A friendly, helpful, conversational response to the user's question.\"\n}\n- Only return a valid JSON object, never plain text or code blocks.\n\nExamples:\n- User: \"I want to build a tailoring business website.\"\n  - Response:\n    {\n      \"intent\": \"create_app\",\n      \"TextHeader\": \"Welcome to My Tailoring Shop\",\n      \"TextDescription\": \"Expert tailoring services for all your needs.\",\n      \"ImageBanner\": \"tailoring\",\n      \"reply\": \"Great! I'm setting up your tailoring business website with a custom banner.\",\n      \"summary\": \"User wants a tailoring business website.\"\n    }\n- User: \"I want to build a gadget store.\"\n  - Response:\n    {\n      \"intent\": \"create_app\",\n      \"TextHeader\": \"Gadget World\",\n      \"TextDescription\": \"Latest gadgets and electronics at your fingertips.\",\n      \"ImageBanner\": \"gadget\",\n      \"reply\": \"Setting up your gadget store now!\",\n      \"summary\": \"User wants a gadget store.\"\n    }\n- User: \"I want to build a business but don't specify the type.\"\n  - Response:\n    {\n      \"intent\": \"create_app\",\n      \"TextHeader\": \"Welcome\",\n      \"TextDescription\": \"Start your business journey.\",\n      \"ImageBanner\": \"default\",\n      \"reply\": \"Let's get started with your business website!\",\n      \"summary\": \"User wants to build a business but didn't specify the type.\"\n    }\n- User: \"Add a text header that says Welcome to My Store\"\n  - Response:\n    {\n      \"intent\": \"add_element\",\n      \"elementType\": \"text-header\",\n      \"initialValue\": \"Welcome to My Store\",\n      \"reply\": \"I've added a text header with your message: 'Welcome to My Store'. You can click to change it anytime!\"\n    }\n- User: \"Add a divider\"\n  - Response:\n    {\n      \"intent\": \"add_element\",\n      \"elementType\": \"divider\",\n      \"reply\": \"I've added a divider to your app. You can move or remove it as you like!\"\n    }\n- User: \"How do I add a button?\"\n  - Response:\n    {\n      \"intent\": \"other\",\n      \"reply\": \"Sure! To add a button, just drag the 'Button' element from the left panel into your store preview. Let me know if you need more help!\"\n    }\n`;

async function callGemini(userMessage: string) {
  const body = {
    contents: [
      { role: 'user', parts: [{ text: `${GEMINI_SYSTEM_PROMPT}\nUser: ${userMessage}` }] },
    ],
  };
  console.log('[Gemini] Request body:', body);
  const res = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  console.log('[Gemini] Raw response:', data);
  let text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  console.log('[Gemini] Raw text before cleanup:', text);
  // Remove code block markers if present
  text = text.replace(/^```json|```$/g, '').trim();
  console.log('[Gemini] Cleaned text for JSON.parse:', text);
  // Extract only the first JSON object
  const firstJsonMatch = text.match(/{[\s\S]*}/);
  if (firstJsonMatch) {
    text = firstJsonMatch[0];
    try {
      const parsed = JSON.parse(text);
      console.log('[Gemini] Parsed JSON:', parsed);
      return parsed;
    } catch (err) {
      console.error('[Gemini] JSON.parse error:', err, 'Text:', text);
      return { intent: 'other', summary: 'Sorry, I could not understand the response.' };
    }
  } else {
    console.error('[Gemini] No JSON object found in text:', text);
    return { intent: 'other', summary: 'Sorry, I could not understand the response.' };
  }
}

interface RightPanelProps {
  onDeploy?: (data?: { TextHeader?: string; TextDescription?: string; ImageBanner?: string }) => void;
  onAddElement?: (type: string, initialValue?: string) => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({ onDeploy, onAddElement }) => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! Need help building your store?' },
  ]);
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom on new message
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (msg?: string) => {
    const userMsg = msg || input.trim();
    if (!userMsg) return;
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');
    setShowSuggestions(true);
    setSuggestions(PRESET_REPLIES);
    setLoading(true);
    // Call Gemini
    try {
      const geminiResp = await callGemini(userMsg);
      if (geminiResp.intent === 'create_app') {
        onDeploy?.({
          TextHeader: geminiResp.TextHeader,
          TextDescription: geminiResp.TextDescription,
          ImageBanner: geminiResp.ImageBanner,
        });
      } else if (geminiResp.intent === 'add_element') {
        onAddElement?.(geminiResp.elementType, geminiResp.initialValue);
      }
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: geminiResp.reply },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'Sorry, something went wrong with Gemini.' },
      ]);
    }
    setLoading(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setShowSuggestions(false);
    if (suggestion === 'I need a sample template') {
      onDeploy?.();
    }
    if (suggestion === 'Add a text header') {
      onAddElement?.('text-header');
    } else if (suggestion === 'Add a button') {
      onAddElement?.('button');
    } else if (suggestion === 'Add a tab') {
      onAddElement?.('tabs');
    } else if (suggestion === 'Add an image banner') {
      onAddElement?.('image-banner');
    }
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
              {idx === messages.length - 1 && msg.sender === 'bot' && !loading && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {PRESET_REPLIES.map((s, i) => (
                    <button
                      key={i}
                      className="px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-sm font-medium hover:bg-pink-200 transition border border-pink-200 shadow-sm"
                      onClick={() => handleSend(s)}
                      type="button"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </React.Fragment>
          ))}
          {loading && (
            <div className="flex justify-start">
              {BOT_AVATAR}
              <div className="rounded-2xl px-4 py-2 shadow-sm max-w-xs text-base font-normal bg-white text-gray-800 border mr-2" style={{ borderColor: Colors.border }}>
                <span className="animate-pulse">Thinking...</span>
              </div>
            </div>
          )}
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
          disabled={loading}
        />
        <button
          type="submit"
          className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-full font-medium flex items-center gap-1 shadow-md transition"
          style={{ background: Colors.primary }}
          disabled={loading}
        >
          <PaperAirplaneIcon className="h-5 w-5" />
        </button>
      </form>
    </aside>
  );
}; 