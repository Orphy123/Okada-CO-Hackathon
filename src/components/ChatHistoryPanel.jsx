import React, { useState, useEffect } from 'react';
import { 
  History, 
  MessageSquare, 
  Plus, 
  Edit2, 
  Trash2, 
  Search,
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { historyAPI } from '../services/api';

const ChatHistoryPanel = ({ 
  isOpen, 
  onToggle, 
  currentSessionId, 
  onSessionSelect, 
  onNewSession 
}) => {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [sessions, setSessions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    if (isOpen && user) {
      loadSessions();
    }
  }, [isOpen, user]);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      const userSessions = await historyAPI.getUserSessions(user.id);
      setSessions(userSessions);
    } catch (error) {
      console.error('Failed to load sessions:', error);
      addNotification('Failed to load chat history', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSessionClick = async (sessionId) => {
    try {
      const sessionData = await historyAPI.getSessionWithConversations(user.id, sessionId);
      onSessionSelect(sessionData);
    } catch (error) {
      console.error('Failed to load session:', error);
      addNotification('Failed to load conversation', 'error');
    }
  };

  const handleNewSession = async () => {
    try {
      const newSession = await historyAPI.createSession(user.id, 'New Chat');
      setSessions(prev => [newSession, ...prev]);
      onNewSession(newSession.id);
      addNotification('New chat session created', 'success');
    } catch (error) {
      console.error('Failed to create session:', error);
      addNotification('Failed to create new session', 'error');
    }
  };

  const handleUpdateTitle = async (sessionId) => {
    try {
      await historyAPI.updateSessionTitle(sessionId, newTitle);
      setSessions(prev => prev.map(session => 
        session.id === sessionId ? { ...session, title: newTitle } : session
      ));
      setEditingSession(null);
      setNewTitle('');
      addNotification('Session title updated', 'success');
    } catch (error) {
      console.error('Failed to update title:', error);
      addNotification('Failed to update session title', 'error');
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to delete this conversation?')) {
      return;
    }

    try {
      await historyAPI.deleteSession(sessionId);
      setSessions(prev => prev.filter(session => session.id !== sessionId));
      if (currentSessionId === sessionId) {
        onNewSession(null);
      }
      addNotification('Session deleted successfully', 'success');
    } catch (error) {
      console.error('Failed to delete session:', error);
      addNotification('Failed to delete session', 'error');
    }
  };

  const startEditing = (session) => {
    setEditingSession(session.id);
    setNewTitle(session.title);
  };

  const cancelEditing = () => {
    setEditingSession(null);
    setNewTitle('');
  };

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-50 ${
      isOpen ? 'w-80' : 'w-0'
    } overflow-hidden`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-gray-600" />
              <h2 className="font-semibold text-gray-800">Chat History</h2>
            </div>
            <button
              onClick={onToggle}
              className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* New Chat Button */}
          <button
            onClick={handleNewSession}
            className="w-full flex items-center gap-2 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No conversations yet</p>
              <p className="text-sm">Start a new chat to begin</p>
            </div>
          ) : (
            <div className="p-2">
              {filteredSessions.map((session) => (
                <div
                  key={session.id}
                  className={`group mb-2 p-3 rounded-lg cursor-pointer transition-all ${
                    currentSessionId === session.id
                      ? 'bg-primary-50 border border-primary-200'
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                  onClick={() => handleSessionClick(session.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {editingSession === session.id ? (
                        <div className="flex items-center gap-2 mb-2">
                          <input
                            type="text"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleUpdateTitle(session.id);
                              } else if (e.key === 'Escape') {
                                cancelEditing();
                              }
                            }}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                            autoFocus
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateTitle(session.id);
                            }}
                            className="text-green-600 hover:text-green-700"
                          >
                            ✓
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              cancelEditing();
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <h3 className="font-medium text-gray-800 truncate mb-1">
                          {session.title}
                        </h3>
                      )}
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(session.updated_at)}</span>
                        <span>•</span>
                        <span>{session.message_count} messages</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(session);
                        }}
                        className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700"
                        title="Edit title"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSession(session.id);
                        }}
                        className="p-1 hover:bg-red-100 rounded text-gray-500 hover:text-red-600"
                        title="Delete session"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatHistoryPanel; 