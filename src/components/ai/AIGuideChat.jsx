import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Send, Sparkles, Bot, User, Loader2, 
  Lightbulb, X
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { base44 } from '@/api/base44Client';

const QUICK_PROMPTS = [
  "Suggest passive income ideas for beginners",
  "What's the fastest way to earn $1000/month?",
  "Ideas that need minimal investment",
  "Best AI tools for passive income"
];

export default function AIGuideChat({ isOpen, onClose, userPreferences: _userPreferences }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && !conversationId) {
      initConversation();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initConversation = async () => {
    const conversation = await base44.agents.createConversation({
      agent_name: 'ai_guide',
      metadata: { name: 'Idea Discovery Session' }
    });
    setConversationId(conversation.id);
    
    // Subscribe to updates
    base44.agents.subscribeToConversation(conversation.id, (data) => {
      setMessages(data.messages || []);
    });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || !conversationId) return;

    const message = input.trim();
    setInput('');
    setIsLoading(true);

    const conversation = await base44.agents.getConversation(conversationId);
    await base44.agents.addMessage(conversation, {
      role: 'user',
      content: message
    });

    setIsLoading(false);
  };

  const handleQuickPrompt = (prompt) => {
    setInput(prompt);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-4 right-4 w-full max-w-md h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold">AI Guide</h3>
            <p className="text-xs text-violet-200">Your passive income advisor</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          className="text-white hover:bg-white/20"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-violet-100 flex items-center justify-center">
              <Lightbulb className="w-8 h-8 text-violet-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">How can I help you today?</h4>
            <p className="text-sm text-gray-500 mb-6">
              Ask me anything about passive income opportunities!
            </p>
            <div className="space-y-2">
              {QUICK_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickPrompt(prompt)}
                  className="block w-full text-left px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-sm text-gray-700 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence>
          {messages.map((message, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                message.role === 'user' 
                  ? 'bg-violet-600 text-white' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === 'user' 
                  ? 'bg-violet-600 text-white' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {message.role === 'user' ? (
                  <p className="text-sm">{message.content}</p>
                ) : (
                  <ReactMarkdown className="text-sm prose prose-sm max-w-none">
                    {message.content}
                  </ReactMarkdown>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <Bot className="w-4 h-4 text-gray-600" />
            </div>
            <div className="bg-gray-100 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about passive income ideas..."
            className="min-h-[44px] max-h-32 resize-none rounded-xl"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="h-11 w-11 p-0 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}