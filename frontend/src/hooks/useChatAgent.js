import { useState, useCallback } from 'react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

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
      // Create assistant message placeholder for streaming
      const assistantMessage = {
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
        provider: currentProvider,
        relatedContent: []
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Make API call to streaming endpoint
      const response = await fetch(`${API_BASE}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          provider: currentProvider,
          sessionId,
          context: { stack }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              break;
            }

            try {
              const parsed = JSON.parse(data);
              
              if (parsed.type === 'start') {
                // Stream started
                continue;
              }

              if (parsed.content) {
                // Update the last message with streamed content
                setMessages(prev => 
                  prev.map((msg, index) => 
                    index === prev.length - 1 
                      ? { 
                          ...msg, 
                          content: parsed.content,
                          provider: parsed.provider,
                          error: parsed.error
                        }
                      : msg
                  )
                );
              }

              if (parsed.error) {
                console.error('Streaming error:', parsed.error);
              }

            } catch (e) {
              console.error('Error parsing chunk:', e);
            }
          }
        }
      }

    } catch (error) {
      console.error('Chat error:', error);
      
      // Fallback to non-streaming endpoint
      try {
        const fallbackResponse = await fetch(`${API_BASE}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query,
            provider: currentProvider,
            sessionId,
            context: { stack }
          })
        });

        if (fallbackResponse.ok) {
          const data = await fallbackResponse.json();
          setMessages(prev => 
            prev.map((msg, index) => 
              index === prev.length - 1 
                ? { 
                    ...msg, 
                    content: data.message.content,
                    provider: data.message.provider,
                    relatedContent: data.relatedContent || []
                  }
                : msg
            )
          );
        } else {
          throw new Error('Fallback API also failed');
        }
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
        setMessages(prev => 
          prev.map((msg, index) => 
            index === prev.length - 1 
              ? { 
                  ...msg, 
                  content: 'Sorry, I encountered an error. Please try again.',
                  error: true
                }
              : msg
          )
        );
      }
    } finally {
      setLoading(false);
    }
  }, [loading, currentProvider, sessionId, stack]);

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