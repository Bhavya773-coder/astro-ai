import React from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client';

interface ChatButtonProps {
  context?: string;
  initialMessage?: string;
  className?: string;
}

const ChatButton: React.FC<ChatButtonProps> = ({ 
  context = 'general', 
  initialMessage,
  className = '' 
}) => {
  const navigate = useNavigate();

  const handleClick = async () => {
    try {
      // Get existing chats
      const res = await apiFetch('/api/ai-chat/list');
      let chatNumber = 1;
      
      if (res?.success && Array.isArray(res?.data)) {
        const contextChats = res.data.filter((chat: any) => 
          chat.title?.startsWith(`${context.charAt(0).toUpperCase() + context.slice(1)} Chat`)
        );
        chatNumber = contextChats.length + 1;
      }
      
      // Create new chat
      const createRes = await apiFetch('/api/ai-chat/create', {
        method: 'POST',
        body: JSON.stringify({ 
          title: `${context.charAt(0).toUpperCase() + context.slice(1)} Chat ${chatNumber}` 
        })
      });
      
      if (createRes?.success && createRes?.data) {
        const newChat = createRes.data;
        const message = initialMessage || getDefaultMessage(context);
        
        navigate(`/ai-chat?chatId=${newChat._id}`, { 
          state: { initialMessage: message }
        });
      } else {
        navigate('/ai-chat', { 
          state: { initialMessage: initialMessage || getDefaultMessage(context) }
        });
      }
    } catch (err) {
      console.error('Failed to create chat:', err);
      navigate('/ai-chat', { 
        state: { initialMessage: initialMessage || getDefaultMessage(context) }
      });
    }
  };

  const getDefaultMessage = (ctx: string): string => {
    const messages: Record<string, string> = {
      numerology: 'Tell me about my numerology chart and what my numbers mean.',
      birthchart: 'Explain my birth chart and how the planets influence my life.',
      reports: 'Help me understand my compatibility report.',
      styler: 'What colors should I wear today based on my astrology?',
      general: 'I have a question about my astrological profile.',
    };
    return messages[ctx] || messages.general;
  };

  const getIcon = () => {
    switch (context) {
      case 'numerology':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
          </svg>
        );
      case 'birthchart':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        );
      case 'reports':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'styler':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
    }
  };

  const getLabel = () => {
    switch (context) {
      case 'numerology':
        return 'Ask about Numerology';
      case 'birthchart':
        return 'Ask about Birth Chart';
      case 'reports':
        return 'Discuss Your Report';
      case 'styler':
        return 'Get Style Advice';
      default:
        return 'Ask AI Astrologer';
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`
        fixed bottom-6 right-6 z-50
        flex items-center gap-2 px-5 py-3
        bg-gradient-to-r from-violet-600 to-fuchsia-600
        text-white font-medium text-sm
        rounded-full shadow-[0_0_20px_rgba(168,85,247,0.5)]
        hover:shadow-[0_0_30px_rgba(168,85,247,0.8)]
        hover:scale-105
        transition-all duration-300
        ${className}
      `}
    >
      {getIcon()}
      <span className="hidden sm:inline">{getLabel()}</span>
      <span className="sm:hidden">Ask AI</span>
    </button>
  );
};

export default ChatButton;
