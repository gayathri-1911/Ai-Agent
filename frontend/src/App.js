import React, { useState } from "react";
import "./App.css";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { 
  MessageSquare, 
  Code, 
  Palette, 
  Globe, 
  Zap,
  Download,
  Github,
  BookOpen
} from 'lucide-react';
import ChatWidget from "./components/ChatWidget/ChatWidget";

function App() {
  const [activeDemo, setActiveDemo] = useState('default');

  const demoThemes = {
    default: {
      primaryColor: '#3b82f6',
      userMessageBg: '#3b82f6',
      assistantMessageBg: '#f3f4f6'
    },
    travel: {
      primaryColor: '#10b981',
      userMessageBg: '#10b981',
      assistantMessageBg: '#ecfdf5'
    },
    premium: {
      primaryColor: '#8b5cf6',
      userMessageBg: '#8b5cf6',
      assistantMessageBg: '#faf5ff'
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Chat Agent Platform</h1>
                <p className="text-sm text-gray-600">AI-powered chat widgets for any domain</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Zap className="w-3 h-3 mr-1" />
                Live Demo
              </Badge>
              <Button variant="outline" size="sm">
                <Github className="w-4 h-4 mr-2" />
                View SDK
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left Column - Info */}
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Plug-and-Play Chat SDK
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Build domain-specific chatbots powered by multiple LLM providers. 
                Integrate with your content stack in minutes, not hours.
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-white rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-orange-500" />
                    <span className="font-semibold">Multi-Provider</span>
                  </div>
                  <p className="text-sm text-gray-600">Groq, OpenAI, Claude with one key</p>
                </div>
                
                <div className="p-4 bg-white rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-5 h-5 text-blue-500" />
                    <span className="font-semibold">Content Integration</span>
                  </div>
                  <p className="text-sm text-gray-600">Contentstack, CMS, or custom data</p>
                </div>
                
                <div className="p-4 bg-white rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Palette className="w-5 h-5 text-purple-500" />
                    <span className="font-semibold">Customizable</span>
                  </div>
                  <p className="text-sm text-gray-600">Themes, branding, and styling</p>
                </div>
                
                <div className="p-4 bg-white rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Code className="w-5 h-5 text-green-500" />
                    <span className="font-semibold">Easy Integration</span>
                  </div>
                  <p className="text-sm text-gray-600">React hook + widget components</p>
                </div>
              </div>
            </div>

            {/* Installation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Quick Start
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">1. Install the SDK:</p>
                  <div className="bg-gray-900 text-gray-100 p-3 rounded-lg font-mono text-sm">
                    npm install @chatagent/sdk
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-2">2. Use the hook:</p>
                  <div className="bg-gray-900 text-gray-100 p-3 rounded-lg font-mono text-sm">
                    {`import { useChatAgent } from '@chatagent/sdk';

const { messages, sendMessage } = useChatAgent({
  provider: 'groq',
  stack: 'travel'
});`}
                  </div>
                </div>

                <Button className="w-full">
                  <BookOpen className="w-4 h-4 mr-2" />
                  View Full Documentation
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Live Demo */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Live Demo</h3>
              <Tabs value={activeDemo} onValueChange={setActiveDemo} className="w-auto">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="default">Default</TabsTrigger>
                  <TabsTrigger value="travel">Travel</TabsTrigger>
                  <TabsTrigger value="premium">Premium</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <ChatWidget
                provider="groq"
                stack="travel"
                initialTheme={demoThemes[activeDemo]}
                className="border-0 shadow-none"
              />
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Try asking: "What tours are available for Italy?" or "Tell me about Rome tours"
              </p>
              <div className="flex justify-center gap-2">
                <Badge variant="secondary">Streaming Responses</Badge>
                <Badge variant="secondary">Provider Switching</Badge>
                <Badge variant="secondary">Theme Customization</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Lightning Fast</h3>
              <p className="text-sm text-gray-600">
                Groq-powered responses in milliseconds with intelligent caching
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Globe className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Content-Aware</h3>
              <p className="text-sm text-gray-600">
                Connects to your CMS or database for contextual responses
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Palette className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Fully Customizable</h3>
              <p className="text-sm text-gray-600">
                Match your brand with custom themes and styling options
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default App;