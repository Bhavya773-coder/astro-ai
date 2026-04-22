import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch, getBaseUrl } from '../api/client';
import { CosmicBackground } from './CosmicBackground';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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

// AI Avatar
const AIAvatar: React.FC = () => (
  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-white shrink-0 shadow-[0_0_10px_rgba(168,85,247,0.5)]">
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  </div>
);

// User Avatar
const UserAvatar: React.FC = () => (
  <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white text-sm font-medium shrink-0">
    U
  </div>
);

const SharedChatPage: React.FC = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const navigate = useNavigate();
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (shareId) {
      loadSharedChat();
    }
  }, [shareId]);

  const loadSharedChat = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${getBaseUrl()}/api/ai-chat/shared/${shareId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await res.json();
      
      if (data?.success && data?.data) {
        setChat(data.data.chat);
        setMessages(data.data.messages);
      } else {
        setError(data?.message || 'Shared chat not found or is private');
      }
    } catch (err) {
      console.error('Failed to load shared chat:', err);
      setError('Failed to load shared chat');
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
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

  if (loading) {
    return (
      <CosmicBackground className="h-screen overflow-hidden">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-400"></div>
        </div>
      </CosmicBackground>
    );
  }

  if (error) {
    return (
      <CosmicBackground className="h-screen overflow-hidden">
        <div className="flex flex-col items-center justify-center h-full p-4">
          <div className="w-16 h-16 bg-red-400/10 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15h.01M12 12a4 4 0 100-8 4 4 0 000 8zm0 0v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Chat Not Available</h2>
          <p className="text-white/60 text-center mb-6">{error}</p>
          <button
            onClick={() => navigate('/ai-chat')}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors"
          >
            Go to AstroAi4u Chat
          </button>
        </div>
      </CosmicBackground>
    );
  }

  return (
    <CosmicBackground className="h-screen overflow-hidden">
      <div className="flex min-h-screen overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 h-screen flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-950/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <AIAvatar />
              <div>
                <h1 className="text-lg font-semibold text-white">
                  {chat?.title || 'Shared Chat'}
                </h1>
                <p className="text-xs text-white/40">
                  Shared by AstroAi4u User • {chat?.created_at && formatDate(chat.created_at)}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => navigate('/ai-chat')}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors text-sm"
            >
              Start Your Own Chat
            </button>
          </div>

          {/* Read-only Badge */}
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2">
            <div className="flex items-center gap-2 text-amber-400 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>This is a read-only shared chat</span>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-white/40">
                <p>No messages in this chat</p>
              </div>
            ) : (
              messages.map((message) => {
                const isUser = message.role === 'user';
                
                return (
                  <div
                    key={message._id}
                    className={`group flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && <AIAvatar />}
                    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[80%]`}>
                      <div
                        className={`rounded-2xl px-4 py-3 ${
                          isUser
                            ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium shadow-[0_4px_15px_rgba(168,85,247,0.3)]'
                            : 'bg-black/40 backdrop-blur-md text-white border border-white/10 shadow-[0_4px_15px_rgba(0,0,0,0.3)] prose prose-invert prose-sm max-w-none'
                        }`}
                      >
                        {isUser ? (
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {message.content}
                          </p>
                        ) : (
                          <div className="text-sm leading-relaxed">
                            <ReactMarkdown 
                              remarkPlugins={[remarkGfm]}
                              components={{
                                p: ({ children }: { children?: React.ReactNode }) => <p className="mb-2 last:mb-0">{children}</p>,
                                ul: ({ children }: { children?: React.ReactNode }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                                ol: ({ children }: { children?: React.ReactNode }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                                li: ({ children }: { children?: React.ReactNode }) => <li className="mb-1">{children}</li>,
                                code: ({ inline, children }: { inline?: boolean; children?: React.ReactNode }) => (
                                  inline ? (
                                    <code className="bg-white/20 px-1.5 py-0.5 rounded text-sm font-mono">
                                      {children}
                                    </code>
                                  ) : (
                                    <pre className="bg-black/60 p-3 rounded-lg overflow-x-auto my-2 border border-white/10">
                                      <code className="text-sm font-mono block">{children}</code>
                                    </pre>
                                  )
                                ),
                                h1: ({ children }: { children?: React.ReactNode }) => <h1 className="text-lg font-bold mb-2 mt-3">{children}</h1>,
                                h2: ({ children }: { children?: React.ReactNode }) => <h2 className="text-base font-bold mb-2 mt-3">{children}</h2>,
                                h3: ({ children }: { children?: React.ReactNode }) => <h3 className="text-sm font-bold mb-1 mt-2">{children}</h3>,
                                strong: ({ children }: { children?: React.ReactNode }) => <strong className="font-bold text-fuchsia-300">{children}</strong>,
                                em: ({ children }: { children?: React.ReactNode }) => <em className="italic text-white/80">{children}</em>,
                                blockquote: ({ children }: { children?: React.ReactNode }) => (
                                  <blockquote className="border-l-4 border-violet-500 pl-3 my-2 italic text-white/70">
                                    {children}
                                  </blockquote>
                                ),
                                a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
                                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">
                                    {children}
                                  </a>
                                ),
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>
                    </div>
                    {isUser && <UserAvatar />}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10">
            <p className="text-center text-white/30 text-xs">
              Want to have your own cosmic conversation?{' '}
              <button
                onClick={() => navigate('/ai-chat')}
                className="text-violet-400 hover:underline"
              >
                Start chatting with AstroAi4u
              </button>
            </p>
          </div>
        </div>
      </div>
    </CosmicBackground>
  );
};

export default SharedChatPage;
