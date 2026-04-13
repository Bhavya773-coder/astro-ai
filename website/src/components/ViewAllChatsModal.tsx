import React, { useState, useEffect, useRef } from 'react';
import { apiFetch } from '../api/client';

interface Chat {
  _id: string;
  title: string;
  preview?: string;
  message_count?: number;
  created_at: string;
  updated_at: string;
}

interface ViewAllChatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onUpdateChatTitle: (chatId: string, newTitle: string) => void;
  currentChatId?: string;
}

const ViewAllChatsModal: React.FC<ViewAllChatsModalProps> = ({
  isOpen,
  onClose,
  onSelectChat,
  onDeleteChat,
  onUpdateChatTitle,
  currentChatId
}) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Load chats when modal opens
  useEffect(() => {
    if (isOpen) {
      loadChats();
      // Focus search input after modal opens
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Focus edit input when editing starts
  useEffect(() => {
    if (editingChatId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingChatId]);

  const loadChats = async (query?: string) => {
    setLoading(true);
    try {
      const endpoint = query?.trim() 
        ? `/api/ai-chat/search?query=${encodeURIComponent(query)}`
        : '/api/ai-chat/list';
      const res = await apiFetch(endpoint);
      if (res?.success && Array.isArray(res?.data)) {
        setChats(res.data);
      }
    } catch (err) {
      console.error('Failed to load chats:', err);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== undefined) {
        loadChats(searchQuery);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectChat = (chatId: string) => {
    onSelectChat(chatId);
    onClose();
  };

  const handleDeleteChat = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this chat?')) return;
    
    try {
      await onDeleteChat(chatId);
      // Remove from local state
      setChats(prev => prev.filter(c => c._id !== chatId));
    } catch (err) {
      console.error('Failed to delete chat:', err);
    }
  };

  const startEditing = (e: React.MouseEvent, chat: Chat) => {
    e.stopPropagation();
    setEditingChatId(chat._id);
    setEditTitle(chat.title || 'New Chat');
  };

  const saveEdit = async (chatId: string) => {
    if (!editTitle.trim()) {
      setEditingChatId(null);
      return;
    }
    
    try {
      await onUpdateChatTitle(chatId, editTitle.trim());
      // Update local state
      setChats(prev => prev.map(chat => 
        chat._id === chatId 
          ? { ...chat, title: editTitle.trim() }
          : chat
      ));
      setEditingChatId(null);
    } catch (err) {
      console.error('Failed to update title:', err);
    }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent, chatId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEdit(chatId);
    } else if (e.key === 'Escape') {
      setEditingChatId(null);
    }
  };

  // Format date nicely
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-2xl max-h-[80vh] bg-[#0a0a0c] border border-white/10 rounded-2xl shadow-[0_0_60px_rgba(168,85,247,0.25)] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
          <h2 className="text-xl font-semibold text-white">All Chats</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-white/10 flex-shrink-0">
          <div className="relative">
            <svg 
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  loadChats();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 min-h-[300px]">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-400"></div>
            </div>
          ) : chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-white/40">
              <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p>{searchQuery ? 'No chats found matching your search' : 'No chats yet'}</p>
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat._id}
                onClick={() => handleSelectChat(chat._id)}
                className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                  currentChatId === chat._id
                    ? 'bg-violet-500/20 border border-violet-500/30'
                    : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                {/* Chat Icon */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  currentChatId === chat._id
                    ? 'bg-violet-500/30 text-violet-300'
                    : 'bg-white/5 text-white/50 group-hover:bg-white/10 group-hover:text-white/70'
                }`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>

                {/* Chat Info */}
                <div className="flex-1 min-w-0">
                  {editingChatId === chat._id ? (
                    <input
                      ref={editInputRef}
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => handleEditKeyDown(e, chat._id)}
                      onBlur={() => saveEdit(chat._id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full bg-white/10 border border-violet-500/50 rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                    />
                  ) : (
                    <>
                      <h3 className={`text-sm font-medium truncate ${
                        currentChatId === chat._id ? 'text-violet-300' : 'text-white'
                      }`}>
                        {chat.title || 'New Chat'}
                      </h3>
                      <p className="text-xs text-white/40 truncate mt-0.5">
                        {chat.preview || `${chat.message_count || 0} messages`}
                      </p>
                    </>
                  )}
                </div>

                {/* Date and Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-white/30">
                    {formatDate(chat.updated_at)}
                  </span>
                  
                  {/* Action Buttons - Show on hover */}
                  {editingChatId !== chat._id && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => startEditing(e, chat)}
                        className="p-1.5 rounded hover:bg-white/10 text-white/40 hover:text-fuchsia-400 transition-colors"
                        title="Rename chat"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => handleDeleteChat(e, chat._id)}
                        className="p-1.5 rounded hover:bg-white/10 text-white/40 hover:text-red-400 transition-colors"
                        title="Delete chat"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex-shrink-0">
          <p className="text-xs text-center text-white/30">
            {chats.length} chat{chats.length !== 1 ? 's' : ''} total
          </p>
        </div>
      </div>
    </div>
  );
};

export default ViewAllChatsModal;
