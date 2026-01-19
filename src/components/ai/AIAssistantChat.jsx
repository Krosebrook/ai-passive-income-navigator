import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, MessageSquare, Sparkles, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

export default function AIAssistantChat() {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const scrollRef = useRef(null);
  const unsubscribeRef = useRef(null);

  // Initialize conversation on mount
  useEffect(() => {
    const initConversation = async () => {
      try {
        const conv = await base44.agents.createConversation({
          agent_name: 'ai_assistant',
          metadata: {
            name: 'Financial Assistant Chat',
            description: 'AI-powered assistant for investment queries'
          }
        });
        setConversation(conv);
        setIsInitializing(false);
      } catch (error) {
        console.error('Error initializing conversation:', error);
        setIsInitializing(false);
      }
    };

    initConversation();

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  // Subscribe to conversation updates
  useEffect(() => {
    if (!conversation?.id) return;

    const unsubscribe = base44.agents.subscribeToConversation(conversation.id, (data) => {
      setMessages(data.messages || []);
      setIsLoading(false);
    });

    unsubscribeRef.current = unsubscribe;

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [conversation?.id]);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || !conversation || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      await base44.agents.addMessage(conversation, {
        role: 'user',
        content: userMessage
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestedQuestions = [
    "What's the risk score for my highest-value deal?",
    "Show me all deals in the tech industry",
    "How is my portfolio performing?",
    "What are current trends in SaaS?",
    "Which deal has the highest ROI potential?"
  ];

  if (isInitializing) {
    return (
      <Card className="bg-[#1a0f2e] border-[#2d1e50]">
        <CardContent className="p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#8b85f7]" />
          <p className="text-gray-400 mt-4">Initializing AI Assistant...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Chat Header */}
      <Card className="bg-[#1a0f2e] border-[#2d1e50]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Bot className="w-6 h-6 text-[#8b85f7]" />
            AI Financial Assistant
          </CardTitle>
          <p className="text-gray-400 text-sm">
            Ask me anything about your deals, portfolio, or market conditions
          </p>
        </CardHeader>
      </Card>

      {/* Messages */}
      <Card className="bg-[#1a0f2e] border-[#2d1e50]">
        <CardContent className="p-6">
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 mx-auto text-[#8b85f7] mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Start a Conversation
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Try asking one of these questions:
                  </p>
                  <div className="space-y-2">
                    {suggestedQuestions.map((question, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        className="w-full text-left justify-start text-sm border-[#2d1e50] hover:border-[#8b85f7] hover:bg-[#2d1e50]"
                        onClick={() => setInput(question)}
                      >
                        <Sparkles className="w-4 h-4 mr-2 text-[#8b85f7]" />
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <AnimatePresence>
                  {messages.map((message, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`flex gap-3 ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.role === 'assistant' && (
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8b85f7] to-[#00b7eb] flex items-center justify-center flex-shrink-0">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-[#8b85f7] to-[#00b7eb] text-white'
                            : 'bg-[#0f0618] border border-[#2d1e50] text-gray-200'
                        }`}
                      >
                        {message.role === 'assistant' ? (
                          <ReactMarkdown
                            className="prose prose-sm prose-invert max-w-none"
                            components={{
                              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                              ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                              li: ({ children }) => <li className="mb-1">{children}</li>,
                              strong: ({ children }) => <strong className="text-[#8b85f7]">{children}</strong>,
                              code: ({ children }) => (
                                <code className="bg-[#2d1e50] px-1 py-0.5 rounded text-xs">
                                  {children}
                                </code>
                              )
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        ) : (
                          <p className="text-sm leading-relaxed">{message.content}</p>
                        )}

                        {/* Show tool calls */}
                        {message.tool_calls && message.tool_calls.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {message.tool_calls.map((tool, toolIdx) => (
                              <div
                                key={toolIdx}
                                className="text-xs bg-[#2d1e50] rounded px-2 py-1 text-gray-400"
                              >
                                🔧 {tool.name}
                                {tool.status === 'running' && (
                                  <Loader2 className="inline w-3 h-3 ml-2 animate-spin" />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {message.role === 'user' && (
                        <div className="w-8 h-8 rounded-lg bg-[#2d1e50] flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8b85f7] to-[#00b7eb] flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div className="bg-[#0f0618] border border-[#2d1e50] rounded-2xl px-4 py-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-[#8b85f7] rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-[#8b85f7] rounded-full animate-bounce delay-100" />
                          <div className="w-2 h-2 bg-[#8b85f7] rounded-full animate-bounce delay-200" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Input */}
      <Card className="bg-[#1a0f2e] border-[#2d1e50]">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about your deals, portfolio, or market trends..."
              className="flex-1 bg-[#0f0618] border-[#2d1e50] text-white placeholder:text-gray-500"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-[#8b85f7] to-[#00b7eb] hover:from-[#9a95ff] hover:to-[#00d4ff]"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}