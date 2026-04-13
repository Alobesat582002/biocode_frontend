// src/pages/patient/AIChatbot.jsx

import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, User, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../../api/axiosInstance';

// ─── Typing Indicator ─────────────────────────────────────────────────────────
const TypingIndicator = () => (
  <div className="flex items-end gap-2 mb-4">
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 shadow-sm">
      <Bot className="h-4 w-4" />
    </div>
    <div className="bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
      <div className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]"></span>
        <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]"></span>
        <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"></span>
      </div>
    </div>
  </div>
);

// ─── Message Bubble ──────────────────────────────────────────────────────────
const MessageBubble = ({ message }) => {
  const isBot = message.sender === 'bot';
  return (
    <div className={`flex items-end gap-2 mb-4 ${isBot ? '' : 'flex-row-reverse'}`}>
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-sm ${
        isBot ? 'bg-indigo-100 text-indigo-600' : 'bg-blue-600 text-white'
      }`}>
        {isBot ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
      </div>
      <div className={`max-w-[75%] px-4 py-3 text-sm leading-relaxed shadow-sm ${
        isBot
          ? 'bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-2xl rounded-bl-none text-gray-800 dark:text-slate-100'
          : 'bg-blue-600 rounded-2xl rounded-br-none text-white'
      }`}>
        {message.text}
      </div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
const AIChatbot = () => {
  const { t } = useTranslation();

  const WELCOME_MESSAGE = {
    sender: 'bot',
    text: "Hello! I'm your BioCode Medical AI Assistant 🩺. I can help answer general medical questions, explain symptoms, or provide health guidance. How can I help you today?\n\n⚠️ Note: I am an AI assistant and am not a substitute for professional medical advice."
  };

  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (e) => {
    e?.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;

    setError('');
    const userMessage = { sender: 'user', text: trimmed };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const { data } = await axiosInstance.post('/api/ai/chatbot/', { message: trimmed });
      const botReply = data.bot_response || data.response || 'Sorry, I could not generate a response.';
      setMessages(prev => [...prev, { sender: 'bot', text: botReply }]);
    } catch (err) {
      const errMsg = err?.response?.data?.error || err?.response?.data?.detail || 'Failed to reach the AI.';
      setError(errMsg);
      setMessages(prev => [...prev, { sender: 'bot', text: '⚠️ ' + errMsg }]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 flex flex-col" style={{ height: 'calc(100vh - 6rem)' }}>
      <div className="flex flex-col flex-1 overflow-hidden rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 shadow-lg">

        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 rounded-t-2xl shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-sm">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 dark:text-white">{t('chatbot.title')}</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-medium text-gray-500 dark:text-slate-400">{t('chatbot.subtitle')} · Always Online</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-1 scroll-smooth">
          {messages.map((msg, idx) => <MessageBubble key={idx} message={msg} />)}
          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="shrink-0 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-b-2xl px-4 py-4">
          {error && (
            <div className="mb-3 flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 px-3 py-2 text-xs text-red-700 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
          <form onSubmit={handleSend} className="flex items-center gap-3">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend(e)}
              disabled={isLoading}
              placeholder={t('chatbot.placeholder')}
              className="flex-1 rounded-xl border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 transition focus:border-blue-500 focus:bg-white dark:focus:bg-slate-600 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
            />
            <button type="submit" disabled={!inputValue.trim() || isLoading}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm hover:bg-blue-500 transition disabled:opacity-40">
              <Send className="h-5 w-5" />
            </button>
          </form>
          <p className="mt-2 text-center text-xs text-gray-400 dark:text-slate-500">{t('chatbot.disclaimer')}</p>
        </div>
      </div>
    </div>
  );
};

export default AIChatbot;
