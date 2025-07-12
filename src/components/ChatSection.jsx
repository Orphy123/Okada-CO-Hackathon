import React, { useState, useRef, useEffect } from 'react';
import { Send, Trash2, Download, Settings, Bot, User, Building, DollarSign, TrendingUp, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { chatAPI } from '../services/api';

const ChatSection = () => {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'ai',
      content: `Hello! I'm your AI Commercial Real Estate Assistant. I can help you:

• Analyze property portfolios
• Find investment opportunities  
• Answer questions about market data
• Process and search through documents

What would you like to explore today?`,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickActions = [
    {
      icon: Building,
      label: 'Large Properties',
      message: 'Show me properties above 15,000 SF with rent below $90/SF'
    },
    {
      icon: DollarSign,
      label: 'Average Rent',
      message: 'What is the average rent per square foot in my portfolio?'
    },
    {
      icon: TrendingUp,
      label: 'High GCI',
      message: 'Find properties with high GCI potential'
    },
    {
      icon: MapPin,
      label: 'Location Search',
      message: 'Show me Broadway properties'
    }
  ];

  const sendMessage = async (message = inputValue) => {
    if (!message.trim() || isTyping) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await chatAPI.sendMessage(
        user?.id || 'anonymous',
        message
      );

      const aiMessage = {
        id: Date.now() + 1,
        role: 'ai',
        content: response.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        role: 'ai',
        content: 'Sorry, I encountered an error. Please try again later.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      addNotification('Chat error occurred. Please check your connection.', 'error');
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: 1,
      role: 'ai',
      content: `Hello! I'm your AI Commercial Real Estate Assistant. I can help you:

• Analyze property portfolios
• Find investment opportunities
• Answer questions about market data
• Process and search through documents

What would you like to explore today?`,
      timestamp: new Date()
    }]);
  };

  const exportChat = () => {
    const chatText = messages.map(msg => 
      `${msg.role === 'user' ? 'User' : 'AI Assistant'}: ${msg.content}`
    ).join('\n\n');
    
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cre-chat-export-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    addNotification('Chat exported successfully!', 'success');
  };

  return (
    <section id="chat" className="py-20 bg-gray-50">
      <div className="container">
        <div className="section-header">
          <h2>AI Chat Assistant</h2>
          <p>Ask questions about properties, markets, and investments in natural language</p>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="flex items-center justify-between p-5 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse-slow" />
              <span className="font-medium text-gray-700">AI Assistant Online</span>
              <div className="ml-4 text-sm text-gray-500">
                {user ? `${user.name} (${user.company || 'Individual'})` : 'Guest User'}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={clearChat}
                className="btn btn-sm btn-outline"
                title="Clear Chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={exportChat}
                className="btn btn-sm btn-outline"
                title="Export Chat"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                className="btn btn-sm btn-outline"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="h-96 overflow-y-auto p-6 bg-white">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 mb-5 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user' 
                    ? 'bg-gray-600' 
                    : 'bg-primary-600'
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <div className={`rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-primary-600 text-white ml-8'
                      : 'bg-gray-100 text-gray-700 mr-8'
                  }`}>
                    <p className="whitespace-pre-line">{message.content}</p>
                  </div>
                  <span className="text-xs text-gray-400 mt-1 block">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-3 mb-5">
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="bg-gray-100 rounded-lg p-3 mr-8">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-typing-dot" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-typing-dot" style={{ animationDelay: '0.16s' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-typing-dot" style={{ animationDelay: '0.32s' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-wrap gap-2 mb-4">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => sendMessage(action.message)}
                  className="flex items-center gap-2 px-3 py-2 bg-white text-gray-600 border border-gray-300 rounded-lg text-xs hover:bg-primary-600 hover:text-white hover:border-primary-600 transition-colors"
                >
                  <action.icon className="w-3 h-3" />
                  {action.label}
                </button>
              ))}
            </div>
            
            <div className="flex gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about commercial real estate..."
                className="flex-1 px-5 py-4 border border-gray-300 rounded-lg text-base outline-none transition-colors focus:border-primary-600 focus:ring-2 focus:ring-primary-100"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!inputValue.trim() || isTyping}
                className="px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-w-12"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChatSection;