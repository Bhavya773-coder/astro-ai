import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { apiFetch, getPaymentStatus } from '../api/client';
import ViewAllChatsModal from './ViewAllChatsModal';
import FeedbackModal from './FeedbackModal';
import { Coins } from 'lucide-react';

interface Chat {
  _id: string;
  title: string;
  created_at: string;
}

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAIChatExpanded, setIsAIChatExpanded] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [showAllChatsModal, setShowAllChatsModal] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | undefined>();
  const [credits, setCredits] = useState(0);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Load chats and credits on mount
  useEffect(() => {
    if (user) {
      loadChats();
      loadCredits();
    }
  }, [user]);

  const loadCredits = async () => {
    try {
      // Try getPaymentStatus first
      const data = await getPaymentStatus();
      if (data.success && data.credits) {
        // Handle both {current: 10} and direct number if API changes
        const balance = typeof data.credits === 'number' ? data.credits : data.credits.current;
        setCredits(balance || 0);
      } else {
        // Fallback to getCredits
        const { getCredits } = await import('../api/client');
        const res = await getCredits();
        if (res?.success) setCredits(res.credits || 0);
      }
    } catch (err) {
      console.error('Failed to load credits:', err);
    }
  };

  // Also reload when AI Chat section expands (to get latest)
  useEffect(() => {
    if (isAIChatExpanded && user) {
      loadChats();
    }
  }, [isAIChatExpanded, user]);

  // Listen for chat updates from other components (e.g., auto-title generation)
  useEffect(() => {
    const handleChatUpdated = () => {
      if (user) {
        loadChats();
      }
    };

    window.addEventListener('chatsUpdated', handleChatUpdated);
    return () => window.removeEventListener('chatsUpdated', handleChatUpdated);
  }, [user]);

  // Listen for credit updates from reading pages
  useEffect(() => {
    const handleCreditsUpdated = (event: CustomEvent) => {
      if (event.detail?.credits !== undefined) {
        setCredits(event.detail.credits);
      } else {
        loadCredits(); // Fallback: reload from server
      }
    };

    window.addEventListener('credits-updated', handleCreditsUpdated as EventListener);
    return () => window.removeEventListener('credits-updated', handleCreditsUpdated as EventListener);
  }, [user]);

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
        ? 'bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 text-fuchsia-400 border-l-4 border-fuchsia-400 shadow-[inset_4px_0_10px_rgba(217,70,239,0.2)]' 
        : 'text-white/70 hover:text-white hover:bg-white/10'
    } gap-3`;

  const navigationItems = [
    { 
      to: '/dashboard', 
      label: 'Dashboard', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    { 
      to: '/numerology', 
      label: 'Numerology', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
        </svg>
      )
    },
    { 
      to: '/birth-chart', 
      label: 'Birth Chart', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      )
    },
    { 
      to: '/reports', 
      label: 'Reports', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    { 
      to: '/style-forecaster', 
      label: 'StyleForecaster', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    { 
      to: '/palm-reading', 
      label: 'Palm Reading', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
        </svg>
      )
    },
    { 
      to: '/coffee-reading', 
      label: 'Coffee Reading', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 1v3M10 1v3M14 1v3" />
        </svg>
      )
    },
    { 
      to: '/face-reading', 
      label: 'Face Reading', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      to: '/previous-readings', 
      label: 'Previous Readings', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
  ];

  // Feedback item (not a route, opens modal)
  const handleFeedbackClick = () => {
    setShowFeedbackModal(true);
    setIsMobileMenuOpen(false);
  };

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
        alert('Failed to create chat. Please try again.');
      }
    } catch (err) {
      console.error('Failed to create chat:', err);
      alert('Failed to create chat. Please try again.');
    }
  };

  const startEditingChat = (chat: Chat, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(chat._id);
    setEditTitle(chat.title || 'New Chat');
  };

  const handleEditKeyDown = (e: React.KeyboardEvent, chatId: string) => {
    if (e.key === 'Enter') {
      updateChatTitle(chatId, editTitle);
    } else if (e.key === 'Escape') {
      setEditingChatId(null);
      setEditTitle('');
    }
  };

  const loadChats = async () => {
    if (!user) return;

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

  // Determine current chat ID from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const chatId = params.get('chatId');
    setCurrentChatId(chatId || undefined);
  }, [window.location.search]);

  return (
    <>
      {/* Mobile Menu Button - Top Right like WhatsApp/Facebook */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-6 right-4 z-50 lg:hidden p-2 bg-black/80 border border-white/20 rounded-lg text-white shadow-lg"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-screen w-64 bg-black/90 border-r border-white/10 backdrop-blur-xl z-40 transform transition-transform duration-300 lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Brand Name */}
          <div className="px-6 py-6 border-b border-white/5 bg-black/20">
            <Link to="/dashboard" className="flex items-center gap-3 group" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.4)] group-hover:scale-110 transition-transform duration-300">
                <img src="/favicon.png" alt="Logo" className="w-6 h-6 object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-white tracking-widest uppercase font-display leading-none">
                  AstroAi<span className="text-fuchsia-500">4u</span>
                </span>
                <span className="text-[8px] text-white/40 uppercase tracking-[0.3em] font-bold mt-1">Cosmic Intelligence</span>
              </div>
            </Link>
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
                <span>{item.label}</span>
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
                    ? 'bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 text-fuchsia-400 border-l-4 border-fuchsia-400 shadow-[inset_4px_0_10px_rgba(217,70,239,0.2)]' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                } gap-3`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>AI Chat</span>
              </button>

              {/* New Chat Button */}
              <button
                onClick={createNewChat}
                className="w-full ml-4 px-4 py-2 text-xs text-fuchsia-400 hover:text-fuchsia-300 hover:bg-fuchsia-400/10 flex items-center gap-2 rounded-lg transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>New Chat</span>
              </button>

              {/* Chat list */}
              {chats.length > 0 && (
                <div className="ml-4 pl-4 border-l border-white/10 space-y-1">
                  {chats.slice(0, 5).map((chat) => (
                    <div key={chat._id} className="group flex items-center gap-1 px-2 rounded-lg hover:bg-white/5 transition-all">
                      {editingChatId === chat._id ? (
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => handleEditKeyDown(e, chat._id)}
                          onBlur={() => updateChatTitle(chat._id, editTitle)}
                          autoFocus
                          className="flex-1 bg-white/10 border border-white/20 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-fuchsia-500"
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
                              className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-fuchsia-400 transition-colors"
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
                      onClick={() => setShowAllChatsModal(true)}
                      className="w-full text-left px-2 py-2 text-xs text-fuchsia-400 hover:text-fuchsia-300"
                    >
                      View all {chats.length} chats...
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Feedback Button (in sidebar) */}
            <button
              onClick={handleFeedbackClick}
              className="w-full px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-3 text-white/70 hover:text-white hover:bg-white/10 mt-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Feedback</span>
            </button>
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-white/10 flex-shrink-0">
            {/* Credits Display */}
            <div className="mb-4 p-3 bg-white/5 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-fuchsia-400" />
                  <span className="text-white/60 text-sm">Credits</span>
                </div>
                <span className="text-xl font-bold text-fuchsia-400">{credits}</span>
              </div>
            </div>

            {/* Buy Credits Button */}
            <button
              onClick={() => {
                navigate('/pro');
                setIsMobileMenuOpen(false);
              }}
              className="w-full mb-4 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.5)] transition-all transform hover:scale-105 hover:shadow-[0_0_25px_rgba(168,85,247,0.8)]"
            >
              <Coins className="w-4 h-4" />
              <span>Buy Credits</span>
            </button>

            {/* User Info */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                  <span className="text-white font-semibold text-sm">{getUserInitials()}</span>
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{getUserName()}</p>
                  <p className="text-white/60 text-xs">Free User</p>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white rounded-lg transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      <FeedbackModal isOpen={showFeedbackModal} onClose={() => setShowFeedbackModal(false)} />

      {/* View All Chats Modal */}
      <ViewAllChatsModal
        isOpen={showAllChatsModal}
        onClose={() => setShowAllChatsModal(false)}
        onSelectChat={(chatId) => {
          navigate(`/ai-chat?chatId=${chatId}`);
          setIsMobileMenuOpen(false);
        }}
        onDeleteChat={async (chatId) => {
          const res = await apiFetch(`/api/ai-chat/${chatId}`, {
            method: 'DELETE'
          });
          if (res?.success) {
            setChats(prev => prev.filter(c => c._id !== chatId));
            window.dispatchEvent(new Event('chatsUpdated'));
          }
        }}
        onUpdateChatTitle={async (chatId, newTitle) => {
          const res = await apiFetch(`/api/ai-chat/${chatId}`, {
            method: 'PUT',
            body: JSON.stringify({ title: newTitle })
          });
          if (res?.success) {
            setChats(prev => prev.map(chat => 
              chat._id === chatId ? { ...chat, title: newTitle } : chat
            ));
            window.dispatchEvent(new Event('chatsUpdated'));
          }
        }}
        currentChatId={currentChatId}
      />
    </>
  );
};

export default Sidebar;
