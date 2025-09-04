import { useState, useCallback } from 'react';
import { findRelevantContent } from '../data/mockTravelData';

export const useChatAgent = ({ provider = 'groq', stack = 'travel', theme = {} } = {}) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 Welcome to your Travel Assistant! I can help you discover amazing tours and destinations. What would you like to explore today?',
      timestamp: new Date().toISOString()
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [currentProvider, setCurrentProvider] = useState(provider);
  const [sessionId] = useState(() => `session_${Date.now()}`);

  // Simulate streaming response
  const simulateStreaming = useCallback(async (content, onChunk) => {
    const words = content.split(' ');
    let accumulatedContent = '';
    
    for (let i = 0; i < words.length; i++) {
      accumulatedContent += (i > 0 ? ' ' : '') + words[i];
      onChunk(accumulatedContent);
      
      // Simulate different provider speeds
      const delay = currentProvider === 'groq' ? 50 : currentProvider === 'openai' ? 80 : 100;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }, [currentProvider]);

  const sendMessage = useCallback(async (query) => {
    if (!query.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: query,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200));

      // Find relevant content based on query
      const response = findRelevantContent(query);
      
      // Create assistant message with streaming placeholder
      const assistantMessage = {
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
        provider: currentProvider,
        relatedTours: response.relatedTours || []
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Simulate streaming
      await simulateStreaming(response.content, (streamedContent) => {
        setMessages(prev => 
          prev.map((msg, index) => 
            index === prev.length - 1 
              ? { ...msg, content: streamedContent }
              : msg
          )
        );
      });

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
        error: true
      }]);
    } finally {
      setLoading(false);
    }
  }, [loading, currentProvider, simulateStreaming]);

  const switchProvider = useCallback((newProvider) => {
    setCurrentProvider(newProvider);
    setMessages(prev => [...prev, {
      role: 'system',
      content: `Switched to ${newProvider.toUpperCase()} provider`,
      timestamp: new Date().toISOString()
    }]);
  }, []);

  const clearHistory = useCallback(() => {
    setMessages([{
      role: 'assistant', 
      content: '👋 Chat history cleared! How can I help you today?',
      timestamp: new Date().toISOString()
    }]);
  }, []);

  return {
    messages,
    sendMessage,
    loading,
    currentProvider,
    switchProvider,
    clearHistory,
    sessionId,
    // SDK metadata
    version: '1.0.0',
    stack,
    theme
  };
};