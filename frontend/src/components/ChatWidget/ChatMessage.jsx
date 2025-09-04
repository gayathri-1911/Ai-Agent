import React from 'react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { User, Bot, Settings } from 'lucide-react';

const ChatMessage = ({ message, theme = {} }) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatContent = (content) => {
    // Simple markdown-like formatting for demo
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/✅/g, '<span style="color: #10b981;">✅</span>')
      .replace(/🏛️|🚤|🎨|🍷|🌸|☀️|🍂|❄️|🗺️|💰|📅/g, (match) => 
        `<span style="font-size: 1.1em;">${match}</span>`
      );
  };

  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <Badge variant="secondary" className="text-xs">
          <Settings className="w-3 h-3 mr-1" />
          {message.content}
        </Badge>
      </div>
    );
  }

  return (
    <div className={`flex gap-3 mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <Avatar className="w-8 h-8 mt-1">
          <AvatarFallback className="bg-blue-100 text-blue-600">
            <Bot className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`max-w-[80%] ${isUser ? 'order-first' : ''}`}>
        <div
          className={`rounded-lg px-4 py-2 ${
            isUser
              ? 'bg-blue-600 text-white ml-auto'
              : 'bg-gray-100 text-gray-900'
          }`}
          style={{
            backgroundColor: isUser ? theme.userMessageBg : theme.assistantMessageBg,
            color: isUser ? theme.userMessageText : theme.assistantMessageText,
          }}
        >
          <div 
            className="text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ 
              __html: formatContent(message.content) 
            }}
          />
          
          {message.provider && (
            <div className="mt-2 pt-2 border-t border-gray-200 border-opacity-20">
              <Badge variant="outline" className="text-xs">
                {message.provider.toUpperCase()}
              </Badge>
            </div>
          )}
        </div>
        
        <div className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {formatTime(message.timestamp)}
        </div>
      </div>

      {isUser && (
        <Avatar className="w-8 h-8 mt-1">
          <AvatarFallback className="bg-green-100 text-green-600">
            <User className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default ChatMessage;