/* =============================================================================
 * ChatBot Component (EcoBot UI)
 * =============================================================================
 * Purpose:
 *   Provide an on-page AI chat widget that communicates with the backend
 *   `/api/ai/chatbot` endpoint.
 *
 * Key Features:
 *   - Toggleable floating chat button
 *   - Maintains conversation history locally for context
 *   - Auto-scrolls on new messages
 *   - Handles backend errors by showing a friendly fallback message
 *
 Dependencies:
 *   - `frontend/src/api/services.js` -> `aiService.chatbot()`
 * ============================================================================= */
import React, { useState, useEffect, useRef } from 'react';
// 1. Import MessageSquare for consistency
import { Leaf, X, Send, MessageSquare } from 'lucide-react';
import { aiService } from '../api/services';

/**
 * @component ChatBot
 * A site-wide AI assistant component that connects to the backend 'aiService'.
 * Features auto-scrolling, loading indicators, and conversation history.
 */
const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm EcoBot 🌱 How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  
  // 2. Ref for auto-scrolling
  const messagesEndRef = useRef(null);

  // 3. Professional auto-scroll effect
  // This scrolls to the bottom every time the messages array is updated
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  // 4. Send message function (your logic is correct)
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await aiService.chatbot({
        message: input,
        conversationHistory: newMessages.slice(0, -1) // Send previous history
      });
      
      setMessages([
        ...newMessages,
        { role: 'assistant', content: response.data.reply }
      ]);
      
    } catch (error) {
      console.error("ChatBot error:", error);
      setMessages([
        ...newMessages,
        { role: 'assistant', content: "Sorry, I'm having trouble connecting to my brain right now." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          // 5. Modern Animation: Added pulse/bounce to draw attention
          className="fixed bottom-6 right-6 bg-gradient-to-r from-green-500 to-blue-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform z-50 animate-bounce"
          aria-label="Open AI Chat"
        >
          {/* 6. Replaced hardcoded SVG with Lucide icon */}
          <MessageSquare className="w-6 h-6" />
        </button>
      )}

      {isOpen && (
        // 7. Modern Animation: Added fade-in and slide-in
        // 8. Responsive: Changed w-96 to w-[calc(100%-2rem)] max-w-sm
        <div className="fixed bottom-6 right-6 w-[calc(100%-2rem)] max-w-sm h-[500px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200 dark:border-gray-700 animate-fadeIn animate-slideInUp" style={{animationDuration: '0.3s'}}>
          <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-4 rounded-t-2xl flex items-center justify-between flex-shrink-0">
            <div className="flex items-center">
              <Leaf className="w-6 h-6 mr-2" />
              <div>
                <h3 className="font-bold">EcoBot</h3>
                <p className="text-xs opacity-90">AI Assistant</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full" aria-label="Close chat">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 9. Message container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            
            {/* Loading indicator (your logic is correct) */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-2xl rounded-bl-none">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
            {/* 10. Empty div for auto-scrolling */}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-3 rounded-full hover:opacity-90 transition disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;