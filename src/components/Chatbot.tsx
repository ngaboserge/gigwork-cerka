import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Input, Button } from '@/components/ui';
import { X, Send, MessageCircle } from '@/lib/icons';
import { useAuthStore } from '@/store';
import {
  findBestMatch,
  isGreeting,
  getFallbackResponse,
  extractCategory,
  getRoleSuggestions,
  formatResponse,
  getWelcomeMessage
} from '@/lib/chatbotEngine';
import { getQuickActions } from '@/lib/chatbotKnowledge';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  suggestions?: string[];
  confidence?: number;
}

export function Chatbot() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationContext, setConversationContext] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Enhanced welcome message
      const welcomeMsg = getWelcomeMessage(t, user?.name, user?.role);
      const suggestions = getRoleSuggestions(t, user?.role);
      addBotMessage(welcomeMsg, suggestions);
    }
  }, [isOpen]);

  const addBotMessage = (text: string, suggestions?: string[], confidence?: number) => {
    const message: Message = {
      id: Date.now().toString(),
      text,
      isBot: true,
      timestamp: new Date(),
      suggestions,
      confidence
    };
    setMessages(prev => [...prev, message]);
  };

  const addUserMessage = (text: string) => {
    const message: Message = {
      id: Date.now().toString(),
      text,
      isBot: false,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  const handleSend = (text?: string) => {
    const query = text || inputValue.trim();
    if (!query) return;

    addUserMessage(query);
    setInputValue('');
    setIsTyping(true);

    // Simulate typing delay for better UX
    setTimeout(() => {
      // Check if greeting
      if (isGreeting(query, t)) {
        const greetingResponse = t('chatbot.greeting');
        const suggestions = getRoleSuggestions(t, user?.role);
        addBotMessage(greetingResponse, suggestions);
        setIsTyping(false);
        return;
      }

      // Enhanced matching with context
      const { faq, confidence, relatedFAQs } = findBestMatch(query, t, conversationContext);

      if (faq && confidence > 0.3) {
        // Found a match!
        const response = formatResponse(faq, confidence, t);
        const suggestions = relatedFAQs.map(f => f.question);
        
        // Update context
        const category = extractCategory(faq);
        if (category) {
          setConversationContext(prev => [...prev.slice(-2), category]);
        }
        
        addBotMessage(response, suggestions.length > 0 ? suggestions : undefined, confidence);
      } else {
        // No match found
        const fallback = getFallbackResponse(t);
        const quickActions = getQuickActions(t);
        const suggestions = quickActions.map(a => a.text);
        addBotMessage(fallback, suggestions, 0);
      }

      setIsTyping(false);
    }, 600 + Math.random() * 400); // Variable delay for natural feel
  };

  const handleSuggestionClick = (suggestion: string) => {
    const quickActions = getQuickActions(t);
    const action = quickActions.find(a => a.text === suggestion);
    handleSend(action ? action.query : suggestion);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-4 sm:left-6 z-[60] w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 group"
        aria-label={t('chatbot.openChat')}
      >
        <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-auto z-[60] w-auto sm:w-96 h-[85vh] sm:h-[600px] max-h-[calc(100vh-80px)] flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 sm:p-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center relative">
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-blue-700"></span>
          </div>
          <div>
            <h3 className="font-semibold text-sm sm:text-base">{t('chatbot.title')}</h3>
            <p className="text-xs text-blue-100">{t('chatbot.subtitle')}</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          aria-label={t('chatbot.closeChat')}
          title={t('chatbot.closeChat')}
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
        {messages.map((message) => (
          <div key={message.id}>
            <div className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  message.isBot
                    ? 'bg-white text-gray-800 shadow-sm border border-gray-200'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                }`}
              >
                <p className="text-sm whitespace-pre-line leading-relaxed">{message.text}</p>
                {message.confidence !== undefined && message.confidence < 0.6 && message.confidence > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
                    Confidence: {Math.round(message.confidence * 100)}%
                  </div>
                )}
              </div>
            </div>

            {/* Suggestions */}
            {message.suggestions && message.suggestions.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {message.suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-xs px-3 py-2 bg-white border border-blue-200 text-blue-600 rounded-full hover:bg-blue-50 hover:border-blue-300 transition-all hover:shadow-sm"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-200">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t('chatbot.placeholder')}
            className="flex-1"
            disabled={isTyping}
          />
          <Button
            onClick={() => handleSend()}
            disabled={!inputValue.trim() || isTyping}
            className="px-4"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-500">
            {t('chatbot.instantAnswers')}
          </p>
          <p className="text-xs text-gray-400">
            {messages.length} {messages.length === 1 ? t('chatbot.messageCount') : t('chatbot.messageCountPlural')}
          </p>
        </div>
      </div>
    </div>
  );
}
