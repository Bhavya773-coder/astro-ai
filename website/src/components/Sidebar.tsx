import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { apiFetch } from '../api/client';

interface Chat {
  _id: string;
  title: string;
  created_at: string;
}

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAIChatExpanded, setIsAIChatExpanded] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // Load chats on component mount and when user changes
  useEffect(() => {
    if (user) {
      loadChats();
    }
  }, [user]);

  // Also reload when AI Chat section expands (to get latest)
  useEffect(() => {
    if (isAIChatExpanded && !isSidebarCollapsed && user) {
      loadChats();
    }
  }, [isAIChatExpanded, isSidebarCollapsed, user]);

  const loadChats = async () => {
    setLoadingChats(true);
    try {
      const res = await apiFetch('/api/ai-chat/list');
      if (res?.success && Array.isArray(res?.data)) {
        setChats(res.data);
      }
    } catch (err) {
      console.error('Failed to load chats:', err);
    } finally {
      setLoadingChats(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const linkClassName = ({ isActive }: { isActive: boolean }) =>
    `w-full px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center ${
      isActive 
        ? 'bg-gradient-to-r from-amber-400/20 to-orange-500/20 text-amber-400 border-l-4 border-amber-400' 
        : 'text-white/70 hover:text-white hover:bg-white/10'
    } ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`;

  const navigationItems = [
    { 
      to: '/dashboard', 
      label: 'Dashboard', 
      icon: (
        <svg className={`${isSidebarCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    { 
      to: '/numerology', 
      label: 'Numerology', 
      icon: (
        <svg className={`${isSidebarCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
        </svg>
      )
    },
    { 
      to: '/birth-chart', 
      label: 'Birth Chart', 
      icon: (
        <svg className={`${isSidebarCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      )
    },
    { 
      to: '/reports', 
      label: 'Reports', 
      icon: (
        <svg className={`${isSidebarCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    { 
      to: '/dressing-styler', 
      label: 'Dressing Styler', 
      icon: (
        <svg className={`${isSidebarCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
  ];

  const getUserInitials = () => {
    if (user?.email) {
      return user.email.split('@')[0].slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getUserName = () => {
    if (user?.email) {
      const emailName = user.email.split('@')[0];
      return emailName.replace('.', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
    }
    return 'User';
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

  const deleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this chat?')) return;
    
    try {
      const res = await apiFetch(`/api/ai-chat/${chatId}`, {
        method: 'DELETE'
      });
      
      if (res?.success) {
        setChats(prev => prev.filter(c => c._id !== chatId));
      } else {
        alert('Failed to delete chat. Please try again.');
      }
    } catch (err) {
      console.error('Failed to delete chat:', err);
      alert('Failed to delete chat. Please try again.');
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
        navigate(`/ai-chat?chatId=${newChat._id}`);
        setIsMobileMenuOpen(false);
      } else {
        alert('Failed to create new chat. Please try again.');
      }
    } catch (err) {
      console.error('Failed to create chat:', err);
      alert('Failed to create new chat. Please try again.');
    }
  };

  const startEditingChat = (chat: Chat, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(chat._id);
    setEditTitle(chat.title || 'New Chat');
  };

  const handleEditKeyDown = (e: React.KeyboardEvent, chatId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      updateChatTitle(chatId, editTitle);
    } else if (e.key === 'Escape') {
      setEditingChatId(null);
      setEditTitle('');
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all duration-200"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-screen bg-slate-950/90 backdrop-blur-xl border-r border-white/10 z-50
        transform transition-all duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:h-screen lg:z-auto lg:overflow-hidden
        ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}
      `}>
        <div className="h-full flex flex-col overflow-hidden">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between flex-shrink-0">
            {!isSidebarCollapsed && (
              <h2 className="text-xl font-bold text-white">Menu</h2>
            )}
            <div className="flex items-center gap-2">
              {/* Desktop Collapse Button */}
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="hidden lg:block p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <svg 
                  className={`w-5 h-5 transition-transform duration-200 ${isSidebarCollapsed ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              {/* Mobile Close Button */}
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="lg:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
           
            {navigationItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={linkClassName}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.icon}
                {!isSidebarCollapsed && <span>{item.label}</span>}
              </NavLink>
            ))}

            {/* AI Chat with Dropdown - only show dropdown if more than 1 chat */}
            <div className="space-y-1">
              <button
                onClick={() => {
                  navigate('/ai-chat');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center ${
                  window.location.pathname === '/ai-chat'
                    ? 'bg-gradient-to-r from-amber-400/20 to-orange-500/20 text-amber-400 border-l-4 border-amber-400' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                } ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}
              >
                <svg className={`${isSidebarCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {!isSidebarCollapsed && <span>AI Chat</span>}
              </button>

              {/* New Chat Button */}
              {!isSidebarCollapsed && (
                <button
                  onClick={createNewChat}
                  className="w-full ml-4 px-4 py-2 text-xs text-cosmic-cyan hover:text-cosmic-cyan/80 hover:bg-cosmic-cyan/10 flex items-center gap-2 rounded-lg transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>New Chat</span>
                </button>
              )}

              {/* Show single chat directly if only 1 chat */}
              {!isSidebarCollapsed && chats.length === 1 && !loadingChats && (
                <div className="ml-4 pl-4 border-l border-white/10">
                  <div className="group flex items-center gap-1 px-2 rounded-lg hover:bg-white/5 transition-all">
                    {editingChatId === chats[0]._id ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => handleEditKeyDown(e, chats[0]._id)}
                        onBlur={() => updateChatTitle(chats[0]._id, editTitle)}
                        autoFocus
                        className="flex-1 bg-white/10 border border-white/20 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-cosmic-cyan"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            navigate(`/ai-chat?chatId=${chats[0]._id}`);
                            setIsMobileMenuOpen(false);
                          }}
                          className="flex-1 text-left px-2 py-2 text-xs text-white/60 hover:text-white truncate"
                          title={chats[0].title || 'New Chat'}
                        >
                          {chats[0].title || 'New Chat'}
                        </button>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => startEditingChat(chats[0], e)}
                            className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-cosmic-cyan transition-colors"
                            title="Rename chat"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => deleteChat(chats[0]._id, e)}
                            className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-red-400 transition-colors"
                            title="Delete chat"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Show dropdown only if more than 1 chat */}
              {!isSidebarCollapsed && chats.length > 1 && (
                <>
                  <button
                    onClick={() => setIsAIChatExpanded(!isAIChatExpanded)}
                    className="w-full px-4 py-2 text-xs text-white/50 hover:text-white/70 flex items-center justify-between transition-colors"
                  >
                    <span>Previous Chats ({chats.length})</span>
                    <svg 
                      className={`w-4 h-4 transition-transform duration-200 ${isAIChatExpanded ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Chat List Dropdown */}
                  {isAIChatExpanded && (
                    <div className="ml-4 pl-4 border-l border-white/10 space-y-1">
                      {chats.slice(0, 5).map((chat) => (
                        <div
                          key={chat._id}
                          className="group flex items-center gap-1 px-2 rounded-lg hover:bg-white/5 transition-all"
                        >
                          {editingChatId === chat._id ? (
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              onKeyDown={(e) => handleEditKeyDown(e, chat._id)}
                              onBlur={() => updateChatTitle(chat._id, editTitle)}
                              autoFocus
                              className="flex-1 bg-white/10 border border-white/20 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-cosmic-cyan"
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  navigate(`/ai-chat?chatId=${chat._id}`);
                                  setIsMobileMenuOpen(false);
                                }}
                                className="flex-1 text-left px-2 py-2 text-xs text-white/60 hover:text-white truncate"
                                title={chat.title || 'New Chat'}
                              >
                                {chat.title || 'New Chat'}
                              </button>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => startEditingChat(chat, e)}
                                  className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-cosmic-cyan transition-colors"
                                  title="Rename chat"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={(e) => deleteChat(chat._id, e)}
                                  className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-red-400 transition-colors"
                                  title="Delete chat"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                      {chats.length > 5 && (
                        <button
                          onClick={() => navigate('/ai-chat')}
                          className="w-full text-left px-3 py-2 rounded-lg text-xs text-cosmic-cyan hover:text-cosmic-cyan/80 transition-all"
                        >
                          View all chats →
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Loading state */}
              {!isSidebarCollapsed && loadingChats && (
                <div className="ml-4 pl-4 border-l border-white/10">
                  <div className="py-2 text-white/40 text-xs flex items-center gap-2">
                    <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Loading...
                  </div>
                </div>
              )}

              {/* No chats message */}
              {!isSidebarCollapsed && !loadingChats && chats.length === 0 && (
                <div className="ml-4 pl-4 border-l border-white/10">
                  <p className="py-2 text-white/40 text-xs italic">No previous chats</p>
                </div>
              )}
            </div>
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-white/10 flex-shrink-0">
            {/* Get Pro Button */}
            {!isSidebarCollapsed ? (
              <button
                onClick={() => {
                  navigate('/pro');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full mb-4 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-semibold rounded-lg hover:from-amber-500 hover:to-orange-600 transition-all transform hover:scale-105"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>Get Pro</span>
              </button>
            ) : (
              <div className="mb-4 flex justify-center">
                <div className="p-2 bg-white/5 rounded-lg opacity-50 cursor-not-allowed">
                  <svg className={`${isSidebarCollapsed ? 'w-5 h-5' : 'w-4 h-4'} text-white/50`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              </div>
            )}

            {/* User Info */}
            <div className="flex items-center justify-between mb-4">
              <div className={`flex items-center gap-3 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-slate-900 font-semibold text-sm">{getUserInitials()}</span>
                </div>
                {!isSidebarCollapsed && (
                  <div>
                    <p className="text-white font-medium text-sm">{getUserName()}</p>
                    <p className="text-white/60 text-xs">Free Plan</p>
                  </div>
                )}
              </div>
            </div>

            {/* Logout Button */}
            {!isSidebarCollapsed ? (
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white rounded-lg transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            ) : (
              <div className="flex justify-center">
                <div className="p-2 bg-white/5 rounded-lg opacity-50 cursor-not-allowed">
                  <svg className={`${isSidebarCollapsed ? 'w-5 h-5' : 'w-4 h-4'} text-white/50`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
