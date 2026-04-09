import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiFetch, getBaseUrl } from '../api/client';
import Sidebar from './Sidebar';
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
  <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white text-sm font-medium shrink-0">
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
  const navigate = useNavigate();
  const location = useLocation();
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profileSummary, setProfileSummary] = useState<ProfileSummary | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editMsgContent, setEditMsgContent] = useState('');

  // Handle initial message from navigation (when coming from MainPage dashboard)
  useEffect(() => {
    const initialMessage = (location.state as any)?.initialMessage;
    if (initialMessage && !isLoading) {
      // Clear the location state to prevent re-triggering
      navigate(location.pathname, { replace: true, state: {} });
      
      // Wait for chats to load, then send the message
      const sendInitialMessage = async () => {
        // Create new chat if none exists
        if (!currentChat) {
          await createNewChat();
        }
        // Send the message after a short delay to ensure chat is ready
        setTimeout(() => {
          sendMessage(initialMessage);
        }, 300);
      };
      
      sendInitialMessage();
    }
  }, [location.state, currentChat, isLoading]);
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

  // Handle scroll detection for showing scroll-to-bottom button
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 50;
      setShowScrollButton(!isAtBottom && messages.length > 0);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [messages.length]);

  // Scroll to bottom function
  const scrollToBottom = () => {
    const container = chatContainerRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

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

  // Handle URL query parameter for chatId
  useEffect(() => {
    const handleUrlChatId = async () => {
      const params = new URLSearchParams(location.search);
      const chatIdFromUrl = params.get('chatId');
      
      if (chatIdFromUrl) {
        // First try to find in current chats
        let chat = chats.find(c => c._id === chatIdFromUrl);
        
        // If not found, reload chats and try again
        if (!chat) {
          const freshChats = await loadChats();
          chat = freshChats.find((c: Chat) => c._id === chatIdFromUrl);
        }
        
        if (chat) {
          setCurrentChat(chat);
        } else {
          // Chat not found even after reload, create new chat
          console.log('Chat not found, creating new chat');
          await createNewChat();
        }
      } else if (chats.length > 0 && !currentChat) {
        // No chatId in URL and no current chat, select first
        setCurrentChat(chats[0]);
        navigate(`/ai-chat?chatId=${chats[0]._id}`, { replace: true });
      }
    };
    
    handleUrlChatId();
  }, [location.search]);

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
        return res.data; // Return fresh data
      }
    } catch (err) {
      console.error('Failed to load chats:', err);
    }
    return [];
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
        // Update URL with new chat ID
        navigate(`/ai-chat?chatId=${newChat._id}`, { replace: true });
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
          // Create new chat instead of going to another chat
          await createNewChat();
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
    setEditTitle('');
    // Update URL with selected chat ID
    navigate(`/ai-chat?chatId=${chat._id}`, { replace: true });
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
        setEditTitle('');
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
    setEditTitle(chat.title || 'New Chat');
  };

  const cancelEditing = () => {
    setEditingChatId(null);
    setEditTitle('');
  };

  const handleEditKeyDown = (e: React.KeyboardEvent, chatId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      updateChatTitle(chatId, editTitle);
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
                
                // Auto-scroll to bottom as content streams in
                setTimeout(() => {
                  const chatContainer = document.getElementById('chat-messages-container');
                  if (chatContainer) {
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                  }
                }, 10);
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
                
                // Final scroll to ensure we're at the bottom
                setTimeout(() => {
                  const chatContainer = document.getElementById('chat-messages-container');
                  if (chatContainer) {
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                  }
                }, 100);
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

  // Helper function to format birth date
  const formatBirthDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  const birthSummary = profileSummary?.has_profile && profileSummary?.date_of_birth
    ? `${formatBirthDate(profileSummary.date_of_birth)}${profileSummary.place_of_birth ? ` • ${profileSummary.place_of_birth}` : ''}`
    : null;

  return (
    <CosmicBackground className="h-screen overflow-hidden">
      <div className="flex min-h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <div className="flex-1 lg:ml-20 transition-all duration-300 overflow-y-auto h-screen" id="main-content">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-950/50 backdrop-blur-sm">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-white/10 text-white/70 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              {/* Chat Title with inline editing */}
              <div className="flex items-center gap-2">
                {editingChatId === currentChat?._id ? (
                  <input
                    ref={editInputRef}
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => handleEditKeyDown(e, currentChat._id)}
                    onBlur={() => updateChatTitle(currentChat._id, editTitle)}
                    autoFocus
                    className="text-lg font-semibold text-white bg-transparent border-b border-cosmic-cyan focus:outline-none px-1"
                  />
                ) : (
                  <>
                    <h1 className="text-lg font-semibold text-white">
                      {currentChat?.title || 'AstroAI Chat'}
                    </h1>
                    {currentChat && (
                      <button
                        onClick={() => {
                          setEditingChatId(currentChat._id);
                          setEditTitle(currentChat.title || 'New Chat');
                        }}
                        className="p-1 rounded hover:text-cosmic-cyan text-white/50 transition-all"
                        title="Rename chat"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    )}
                  </>
                )}
              </div>
              
              {/* Profile Info */}
              {profileSummary && (
                <div className="hidden sm:flex items-center gap-4 text-sm text-white/60">
                  {profileSummary.full_name && (
                    <span>{profileSummary.full_name}</span>
                  )}
                  {birthSummary && (
                    <span>{birthSummary}</span>
                  )}
                </div>
              )}
            </div>

            {/* Chat Messages Container */}
            <div 
              id="chat-messages-container"
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {messages.map((message) => {
                // Skip rendering placeholder messages with empty content (streaming placeholder)
                if (message._id?.toString().startsWith('streaming-') && !message.content) {
                  return null;
                }

                const isUser = message.role === 'user';
                const msgId = message._id || '';
                const isEditingThis = editingMsgId === msgId;

                const handleCopy = () => {
                  navigator.clipboard.writeText(message.content).then(() => {
                    setCopiedMsgId(msgId);
                    setTimeout(() => setCopiedMsgId(null), 2000);
                  });
                };

                const handleStartEditMsg = () => {
                  setEditingMsgId(msgId);
                  setEditMsgContent(message.content);
                };

                const handleSaveEditMsg = () => {
                  if (!editMsgContent.trim()) return;
                  // Update message locally then resend
                  setMessages(prev => prev.filter(m => {
                    const idx = prev.findIndex(x => x._id === msgId);
                    return prev.indexOf(m) <= idx;
                  }).map(m => m._id === msgId ? { ...m, content: editMsgContent } : m));
                  setEditingMsgId(null);
                  // The edited msg replaces content, then we send from that point
                  sendMessage(editMsgContent);
                };

                return (
                  <div
                    key={message._id}
                    className={`group flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && <AIAvatar />}
                    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[70%]`}>
                      {isEditingThis ? (
                        <div className="w-full">
                          <textarea
                            value={editMsgContent}
                            onChange={e => setEditMsgContent(e.target.value)}
                            className="w-full bg-white/10 border border-white/30 rounded-2xl px-4 py-3 text-white text-sm resize-none focus:outline-none focus:border-white/60"
                            rows={3}
                            autoFocus
                          />
                          <div className="flex gap-2 mt-2 justify-end">
                            <button
                              onClick={() => setEditingMsgId(null)}
                              className="px-3 py-1 text-xs text-white/60 hover:text-white border border-white/20 rounded-lg transition-colors"
                            >Cancel</button>
                            <button
                              onClick={handleSaveEditMsg}
                              className="px-3 py-1 text-xs bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium"
                            >Send</button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`rounded-2xl px-4 py-3 ${
                            isUser
                              ? 'bg-white text-gray-900 font-medium'
                              : 'bg-white/10 backdrop-blur-sm text-white border border-white/20'
                          }`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {message.content}
                          </p>
                        </div>
                      )}

                      {/* Action buttons — ChatGPT style, show on group hover */}
                      {!isEditingThis && (
                        <div className={`flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                          {/* Copy button */}
                          <button
                            onClick={handleCopy}
                            title="Copy message"
                            className="p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/10 transition-all"
                          >
                            {copiedMsgId === msgId ? (
                              <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            )}
                          </button>

                          {/* Edit button — only for user messages */}
                          {isUser && (
                            <button
                              onClick={handleStartEditMsg}
                              title="Edit message"
                              className="p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/10 transition-all"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    {isUser && <UserAvatar name={profileSummary?.full_name} />}
                  </div>
                );
              })}
              
              {/* Typing Indicator */}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <AIAvatar />
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3">
                    <TypingIndicator />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 md:p-6 w-full">
              {/* Suggestions */}
              {messages.length === 0 && !isLoading && (
                <div className="mb-6 max-w-3xl mx-auto w-full">
                  <p className="text-white/60 text-sm mb-3">Try asking:</p>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTIONS.map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setInputMessage(suggestion)}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-full text-sm transition-colors border border-white/10"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Floating Pill Input */}
              <div className="w-full relative max-w-3xl mx-auto bg-transparent pb-4 md:pb-6">
                <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="w-full relative flex items-end">
                  <textarea
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask AstroAI anything..."
                    className={`w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-[32px] pl-6 pr-14 py-5 text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/40 transition-all shadow-2xl shadow-black/50 resize-none scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent ${
                      inputMessage.split('\n').length > 3 || inputMessage.length > 120 
                        ? 'overflow-y-auto' 
                        : 'overflow-hidden'
                    }`}
                    rows={1}
                    style={{ 
                      minHeight: '64px',
                      maxHeight: '160px',
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isLoading}
                    className="absolute right-3 bottom-3.5 p-2 bg-white text-black rounded-full hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-white transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center shrink-0"
                  >
                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
                    </svg>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CosmicBackground>
  );
};

export default GPTChatPage;
