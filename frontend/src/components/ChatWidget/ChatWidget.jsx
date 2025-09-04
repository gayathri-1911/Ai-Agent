import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { 
  Send, 
  Loader2, 
  Settings, 
  Palette, 
  History, 
  Trash2,
  Zap,
  Brain,
  Sparkles 
} from 'lucide-react';
import { useChatAgent } from '../../hooks/useChatAgent';
import ChatMessage from './ChatMessage';

const ChatWidget = ({ 
  provider = 'groq', 
  stack = 'travel',
  initialTheme = {},
  className = '' 
}) => {
  const [input, setInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [customTheme, setCustomTheme] = useState({
    primaryColor: '#3b82f6',
    userMessageBg: '#3b82f6',
    assistantMessageBg: '#f3f4f6',
    userMessageText: '#ffffff',
    assistantMessageText: '#111827',
    ...initialTheme
  });

  const scrollAreaRef = useRef(null);
  const inputRef = useRef(null);

  const {
    messages,
    sendMessage,
    loading,
    currentProvider,
    switchProvider,
    clearHistory,
    sessionId
  } = useChatAgent({ provider, stack, theme: customTheme });

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    
    await sendMessage(input);
    setInput('');
    inputRef.current?.focus();
  };

  const getProviderInfo = (providerName) => {
    const providers = {
      groq: { icon: Zap, color: 'text-orange-600', label: 'Groq (Fast)' },
      openai: { icon: Brain, color: 'text-green-600', label: 'OpenAI GPT-4' },
      claude: { icon: Sparkles, color: 'text-purple-600', label: 'Claude' }
    };
    return providers[providerName] || providers.groq;
  };

  const ProviderIcon = getProviderInfo(currentProvider).icon;

  return (
    <Card className={`w-full max-w-2xl mx-auto h-[600px] flex flex-col ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ProviderIcon className={`w-5 h-5 ${getProviderInfo(currentProvider).color}`} />
            Travel Assistant
            <Badge variant="outline" className="text-xs">
              {getProviderInfo(currentProvider).label}
            </Badge>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {showSettings && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">LLM Provider</Label>
                <Select value={currentProvider} onValueChange={switchProvider}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="groq">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-orange-600" />
                        Groq (Fast)
                      </div>
                    </SelectItem>
                    <SelectItem value="openai">
                      <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-green-600" />
                        OpenAI GPT-4
                      </div>
                    </SelectItem>
                    <SelectItem value="claude">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        Claude
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Theme Color</Label>
                <div className="flex gap-2 mt-1">
                  {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'].map(color => (
                    <button
                      key={color}
                      className="w-6 h-6 rounded-full border-2 border-gray-300"
                      style={{ backgroundColor: color }}
                      onClick={() => setCustomTheme(prev => ({ 
                        ...prev, 
                        primaryColor: color,
                        userMessageBg: color 
                      }))}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  checked={showHistory}
                  onCheckedChange={setShowHistory}
                  id="show-history"
                />
                <Label htmlFor="show-history" className="text-sm">
                  Show chat history
                </Label>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={clearHistory}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Clear History
              </Button>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col min-h-0">
        <ScrollArea ref={scrollAreaRef} className="flex-1 pr-4">
          <div className="space-y-1">
            {(showHistory ? messages : messages.slice(-2)).map((message, index) => (
              <ChatMessage 
                key={`${message.timestamp}-${index}`}
                message={message} 
                theme={customTheme}
              />
            ))}
            
            {loading && (
              <div className="flex justify-start mb-4">
                <div className="bg-gray-100 rounded-lg px-4 py-2 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-gray-600">
                    {currentProvider === 'groq' ? 'Thinking fast...' : 'Processing...'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about tours, destinations, prices..."
            disabled={loading}
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={loading || !input.trim()}
            style={{ backgroundColor: customTheme.primaryColor }}
            className="text-white hover:opacity-90"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>

        <div className="mt-2 text-xs text-gray-500 text-center">
          Session: {sessionId} • Powered by {getProviderInfo(currentProvider).label}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatWidget;