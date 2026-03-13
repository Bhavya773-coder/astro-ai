import React, { useState, useEffect, useRef, useCallback } from 'react';
import { apiFetch, getBaseUrl } from '../api/client';
import AppNavbar from './AppNavbar';
import { CosmicBackground } from './CosmicBackground';
import { GlassCard, LoadingSpinner, GradientText } from './CosmicUI';

interface ChatMessage {
  _id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: Date | string;
}

interface Chat {
  _id: string;
  title: string;
  preview?: string;
  message_count?: number;
  created_at: string;
  updated_at: string;
}

interface ProfileSummary {
  full_name: string | null;
  date_of_birth: string | null;
  time_of_birth?: string | null;
  place_of_birth?: string | null;
  sun_sign: string | null;
  moon_sign?: string | null;
  ascendant?: string | null;
  has_profile: boolean;
}

const SUGGESTIONS = [
  'What does my chart say about my career?',
  'How is my love life looking?',
  'What should I focus on this month?',
  'Tell me about my strengths',
  'What challenges might I face?',
];

function formatBirthDate(dateStr: string | null): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

// ChatGPT-style Typing Indicator
const TypingIndicator: React.FC = () => (
  <div className="flex items-center gap-1 px-1">
    <span className="w-2 h-2 rounded-full bg-cosmic-cyan animate-bounce" style={{ animationDelay: '0ms' }} />
    <span className="w-2 h-2 rounded-full bg-cosmic-pink animate-bounce" style={{ animationDelay: '150ms' }} />
    <span className="w-2 h-2 rounded-full bg-cosmic-gold animate-bounce" style={{ animationDelay: '300ms' }} />
  </div>
);

// User Avatar
const UserAvatar: React.FC<{ name?: string | null }> = ({ name }) => (
  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cosmic-gold to-orange-500 flex items-center justify-center text-white text-sm font-medium shrink-0 shadow-lg shadow-cosmic-gold/20">
    {name ? name.charAt(0).toUpperCase() : 'U'}
  </div>
);

// AI Avatar
const AIAvatar: React.FC = () => (
  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cosmic-purple to-cosmic-pink flex items-center justify-center text-white shrink-0 shadow-lg shadow-cosmic-purple/20">
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  </div>
);

const GPTChatPage: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Chat editing state
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);
  
  const [profileSummary, setProfileSummary] = useState<ProfileSummary | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  // Focus edit input when editing starts
  useEffect(() => {
    if (editingChatId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingChatId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 200) + 'px';
    }
  }, [inputMessage]);

  // Load initial data
  useEffect(() => {
    loadProfile();
    loadChats();
  }, []);

  // Load messages when current chat changes
  useEffect(() => {
    if (currentChat?._id) {
      loadMessages(currentChat._id);
    } else {
      setMessages([]);
    }
  }, [currentChat?._id]);

  const loadProfile = async () => {
    try {
      const res = await apiFetch('/api/gpt/profile-summary');
      if (res?.success && res?.data) {
        setProfileSummary(res.data);
      }
    } catch {
      setProfileSummary(null);
    } finally {
      setProfileLoading(false);
    }
  };

  const loadChats = useCallback(async () => {
    try {
      const res = await apiFetch('/api/ai-chat/list');
      if (res?.success && Array.isArray(res?.data)) {
        setChats(res.data);
        if (res.data.length > 0 && !currentChat) {
          setCurrentChat(res.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load chats:', err);
    }
  }, []);

  const loadMessages = async (chatId: string) => {
    try {
      const res = await apiFetch(`/api/ai-chat/${chatId}/messages`);
      if (res?.success && Array.isArray(res?.data)) {
        setMessages(res.data.map((m: any) => ({
          _id: m._id,
          role: m.role,
          content: m.content,
          created_at: m.created_at
        })));
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
      setMessages([]);
    }
  };

  const createNewChat = async () => {
    try {
      const res = await apiFetch('/api/ai-chat/create', {
        method: 'POST',
        body: JSON.stringify({ title: 'New Chat' })
      });
      
      if (res?.success && res?.data) {
        const newChat = res.data;
        setChats(prev => [newChat, ...prev]);
        setCurrentChat(newChat);
        setMessages([]);
        setSidebarOpen(false);
      }
    } catch (err) {
      console.error('Failed to create chat:', err);
      alert('Failed to create new chat. Please try again.');
    }
  };

  const deleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete this chat?')) return;
    
    try {
      const res = await apiFetch(`/api/ai-chat/${chatId}`, {
        method: 'DELETE'
      });
      
      if (res?.success) {
        setChats(prev => prev.filter(c => c._id !== chatId));
        if (currentChat?._id === chatId) {
          const remaining = chats.filter(c => c._id !== chatId);
          setCurrentChat(remaining.length > 0 ? remaining[0] : null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error('Failed to delete chat:', err);
    }
  };

  const selectChat = (chat: Chat) => {
    setCurrentChat(chat);
    setSidebarOpen(false);
    setEditingChatId(null);
    setEditingTitle('');
  };

  const updateChatTitle = async (chatId: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    
    try {
      const res = await apiFetch(`/api/ai-chat/${chatId}`, {
        method: 'PUT',
        body: JSON.stringify({ title: newTitle.trim() })
      });
      
      if (res?.success) {
        setChats(prev => prev.map(chat => 
          chat._id === chatId 
            ? { ...chat, title: newTitle.trim() }
            : chat
        ));
        
        if (currentChat?._id === chatId) {
          setCurrentChat(prev => prev ? { ...prev, title: newTitle.trim() } : null);
        }
        
        setEditingChatId(null);
        setEditingTitle('');
      } else {
        console.error('Failed to update chat title:', res?.message);
        alert('Failed to update chat title. Please try again.');
      }
    } catch (err) {
      console.error('Failed to update chat title:', err);
      alert('Failed to update chat title. Please try again.');
    }
  };

  const startEditingChat = (chat: Chat, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(chat._id);
    setEditingTitle(chat.title || 'New Chat');
  };

  const cancelEditing = () => {
    setEditingChatId(null);
    setEditingTitle('');
  };

  const handleEditKeyDown = (e: React.KeyboardEvent, chatId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      updateChatTitle(chatId, editingTitle);
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  const sendMessage = async (text?: string) => {
    const toSend = (text || inputMessage).trim();
    if (!toSend || isLoading) return;
    if (!currentChat) {
      await createNewChat();
      setInputMessage(toSend);
      return;
    }

    const userMsg: ChatMessage = { 
      role: 'user', 
      content: toSend, 
      created_at: new Date() 
    };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    const aiPlaceholder: ChatMessage = { 
      role: 'assistant', 
      content: '', 
      created_at: new Date(),
      _id: 'streaming-' + Date.now()
    };
    setMessages(prev => [...prev, aiPlaceholder]);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(`${getBaseUrl()}/api/ai-chat/send-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({ 
          chatId: currentChat._id, 
          message: toSend 
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Response body is not readable');
      }

      let buffer = '';
      let streamCompleted = false;

      while (!streamCompleted) {
        const { done, value } = await reader.read();
        
        if (done) {
          streamCompleted = true;
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ') && line.trim() !== 'data: ') {
            try {
              const jsonStr = line.slice(6);
              const data = JSON.parse(jsonStr);
              
              if (data.type === 'token') {
                setMessages(prev => 
                  prev.map(msg => 
                    msg._id === aiPlaceholder._id 
                      ? { ...msg, content: (msg.content || '') + data.token }
                      : msg
                  )
                );
              } else if (data.type === 'complete') {
                setMessages(prev => 
                  prev.map(msg => 
                    msg._id === aiPlaceholder._id 
                      ? { ...msg, _id: data.messageId, content: data.content }
                      : msg
                  )
                );
                streamCompleted = true;
                setIsLoading(false);
                loadChats();
              } else if (data.type === 'error') {
                setMessages(prev => 
                  prev.map(msg => 
                    msg._id === aiPlaceholder._id 
                      ? { ...msg, content: "Sorry, I encountered an error. Please try again." }
                      : msg
                  )
                );
                streamCompleted = true;
                setIsLoading(false);
              }
            } catch (parseError) {
              console.error('Error parsing stream data:', parseError);
            }
          }
        }
      }

    } catch (err: any) {
      if (err.name === 'AbortError') {
        return;
      }
      
      console.error('Streaming failed, trying fallback:', err);
      
      try {
        const res = await apiFetch('/api/ai-chat/send', {
          method: 'POST',
          body: JSON.stringify({ 
            chatId: currentChat._id, 
            message: toSend 
          })
        });

        if (res?.success && res?.data?.aiMessage) {
          setMessages(prev => 
            prev.map(msg => 
              msg._id === aiPlaceholder._id 
                ? { 
                    ...msg, 
                    _id: res.data.aiMessage._id,
                    content: res.data.aiMessage.content 
                  }
                : msg
            )
          );
          loadChats();
        } else {
          throw new Error(res?.message || 'Failed to get response');
        }
      } catch (fallbackErr) {
        console.error('Fallback also failed:', fallbackErr);
        setMessages(prev => 
          prev.map(msg => 
            msg._id === aiPlaceholder._id 
              ? { 
                  ...msg, 
                  content: "Sorry, I couldn't generate a response. Please try again." 
                }
              : msg
          )
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const birthSummary = profileSummary?.has_profile && profileSummary?.date_of_birth
    ? `${formatBirthDate(profileSummary.date_of_birth)}${profileSummary.place_of_birth ? ` • ${profileSummary.place_of_birth}` : ''}`
    : null;

  return (
    <CosmicBackground className="min-h-screen">
      <AppNavbar />
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex h-[calc(100vh-4rem)] pt-16 overflow-hidden">
        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-50 w-72 
          bg-cosmic-deep-space/95 border-r border-cosmic-purple/30
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col h-full
        `}>
          {/* New Chat Button */}
          <div className="p-4">
            <button
              onClick={createNewChat}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-cosmic border border-cosmic-purple/50 text-white hover:bg-cosmic-purple/20 transition-all duration-300 hover:border-cosmic-cyan/50"
            >
              <svg className="w-5 h-5 text-cosmic-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>New chat</span>
            </button>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1 scrollbar-thin scrollbar-thumb-cosmic-purple/30 scrollbar-track-transparent">
            {chats.map(chat => (
              <div
                key={chat._id}
                onClick={() => editingChatId !== chat._id && selectChat(chat)}
                className={`
                  group flex items-center gap-3 px-3 py-2 rounded-cosmic cursor-pointer transition-all duration-200
                  ${currentChat?._id === chat._id 
                    ? 'bg-cosmic-purple/30 border border-cosmic-purple/50' 
                    : 'hover:bg-white/5 border border-transparent'
                  }
                `}
              >
                <svg className="w-4 h-4 text-cosmic-cyan/70 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                
                {editingChatId === chat._id ? (
                  <div className="flex-1 min-w-0 flex items-center gap-2">
                    <input
                      ref={editInputRef}
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => handleEditKeyDown(e, chat._id)}
                      onBlur={() => updateChatTitle(chat._id, editingTitle)}
                      className="flex-1 bg-cosmic-deep-space/80 text-white text-sm px-2 py-1 rounded border border-cosmic-cyan/50 focus:outline-none focus:border-cosmic-cyan"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateChatTitle(chat._id, editingTitle);
                      }}
                      className="p-1 rounded text-cosmic-cyan hover:bg-cosmic-cyan/20"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        cancelEditing();
                      }}
                      className="p-1 rounded text-white/50 hover:text-white hover:bg-white/10"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/90 truncate">
                        {chat.title || 'New Chat'}
                      </p>
                    </div>
                    
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => startEditingChat(chat, e)}
                        className="p-1.5 rounded hover:bg-cosmic-cyan/20 text-white/50 hover:text-cosmic-cyan transition-all"
                        title="Rename chat"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => deleteChat(chat._id, e)}
                        className="p-1.5 rounded hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-all ml-1"
                        title="Delete chat"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
            
            {chats.length === 0 && (
              <div className="text-center py-8 text-white/50 text-sm">
                <p>No chats yet</p>
                <p className="mt-1">Start a new conversation!</p>
              </div>
            )}
          </div>

          {/* Sidebar Footer - User Info */}
          <div className="p-3 border-t border-cosmic-purple/30">
            {!profileLoading && profileSummary?.has_profile && (
              <div className="flex items-center gap-3 px-3 py-2">
                <UserAvatar name={profileSummary.full_name} />
                <div className="flex-1 min-w-0">
                  {profileSummary.full_name && (
                    <p className="text-white/90 text-sm font-medium truncate">
                      {profileSummary.full_name}
                    </p>
                  )}
                  {profileSummary.sun_sign && (
                    <p className="text-cosmic-gold text-xs">
                      {profileSummary.sun_sign} Sun
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main Chat Area */}
        <main ref={mainRef} className="flex-1 flex flex-col min-w-0 bg-cosmic-deep-space/30 overflow-hidden">
          {/* Header */}
          <header className="flex items-center justify-between px-4 py-3 border-b border-cosmic-purple/30 bg-cosmic-deep-space/50 backdrop-blur-sm shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-white/10 text-white/70 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-white">
                  {currentChat?.title || 'AstroAI Chat'}
                </h1>
                {currentChat && (
                  <button
                    onClick={() => {
                      setEditingChatId(currentChat._id);
                      setEditingTitle(currentChat.title || 'New Chat');
                    }}
                    className="p-1 rounded hover:bg-cosmic-cyan/20 text-white/50 hover:text-cosmic-cyan transition-all"
                    title="Rename chat"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                )}
              </div>
                {birthSummary && (
                  <p className="text-xs text-cosmic-gold/80">{birthSummary}</p>
                )}
              </div>
            </div>
            
            {currentChat && (
              <button
                onClick={() => {
                  if (window.confirm('Delete this chat?')) {
                    apiFetch(`/api/ai-chat/${currentChat._id}`, { method: 'DELETE' })
                      .then(() => {
                        setChats(prev => prev.filter(c => c._id !== currentChat._id));
                        setCurrentChat(null);
                        setMessages([]);
                      });
                  }
                }}
                className="p-2 rounded-lg text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </header>

          {/* Messages Area - Fixed Scroll */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-cosmic-purple/30 scrollbar-track-transparent">
            {messages.length === 0 && !isLoading ? (
              <div className="h-full flex flex-col items-center justify-center px-4 py-12">
                <div className="text-center max-w-2xl">
                  <div className="mb-8">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-cosmic-purple to-cosmic-pink flex items-center justify-center text-white mb-6 shadow-neon-pink">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-3">
                      How can I <GradientText>help</GradientText> you today?
                    </h2>
                    <p className="text-white/60 mb-8 max-w-lg mx-auto">
                      Ask me anything about your astrology chart, career, relationships, or life path.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SUGGESTIONS.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(s)}
                        className="px-4 py-3 rounded-cosmic border border-cosmic-purple/40 text-white/80 text-sm hover:bg-cosmic-purple/20 hover:border-cosmic-cyan/50 transition-all text-left group"
                      >
                        <span className="group-hover:text-cosmic-cyan transition-colors">{s}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto py-4">
                {messages.map((msg, i) => (
                  <div
                    key={msg._id || i}
                    className={`
                      px-4 py-4 
                      ${msg.role === 'user' 
                        ? 'bg-cosmic-purple/10' 
                        : 'bg-transparent'
                      }
                    `}
                  >
                    <div className="max-w-3xl mx-auto flex gap-4">
                      {msg.role === 'user' ? (
                        <>
                          <div className="flex-1 text-right order-2">
                            <p className="text-white whitespace-pre-wrap">{msg.content}</p>
                          </div>
                          <div className="order-1">
                            <UserAvatar name={profileSummary?.full_name} />
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <AIAvatar />
                          </div>
                          <div className="flex-1">
                            <p className="text-white/90 whitespace-pre-wrap leading-relaxed">
                              {msg.content}
                              {isLoading && msg._id?.toString().startsWith('streaming-') && (
                                <span className="inline-block ml-1">
                                  <TypingIndicator />
                                </span>
                              )}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Loading state when no streaming placeholder yet */}
                {isLoading && !messages.some(m => m._id?.toString().startsWith('streaming-')) && (
                  <div className="px-4 py-4">
                    <div className="max-w-3xl mx-auto flex gap-4">
                      <AIAvatar />
                      <div className="flex-1">
                        <TypingIndicator />
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} className="h-4" />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-cosmic-purple/30 bg-cosmic-deep-space/50 backdrop-blur-sm px-4 py-4 shrink-0">
            <div className="max-w-3xl mx-auto">
              <div className="relative flex items-end gap-2 bg-white/5 rounded-2xl border border-cosmic-purple/30 shadow-lg focus-within:border-cosmic-cyan/50 focus-within:shadow-cosmic-cyan/20 transition-all">
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={currentChat ? "Message AstroAI..." : "Create a new chat to start..."}
                  disabled={isLoading || !currentChat}
                  rows={1}
                  className="flex-1 bg-transparent text-white placeholder-white/40 px-4 py-3.5 resize-none focus:outline-none max-h-[200px] min-h-[48px]"
                />
                <button
                  type="button"
                  onClick={() => sendMessage()}
                  disabled={!inputMessage.trim() || isLoading || !currentChat}
                  className="mb-2 mr-2 p-2 rounded-xl bg-cosmic-purple hover:bg-cosmic-pink disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all hover:scale-105"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-center text-white/40 text-xs mt-2">
                AI responses are based on your AstroAI profile. Say "explain in detail" for more depth.
              </p>
            </div>
          </div>
        </main>
      </div>
    </CosmicBackground>
  );
};

export default GPTChatPage;
