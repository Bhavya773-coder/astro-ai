import React, { useState } from 'react';
import FeedbackModal from './FeedbackModal';

const FeedbackButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Feedback Button - Desktop: bottom right, Mobile: top right */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed z-40 flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs sm:text-sm rounded-full shadow-[0_0_20px_rgba(245,158,11,0.5)] border-2 border-white/30 hover:shadow-[0_0_30px_rgba(245,158,11,0.7)] hover:border-white/60 hover:scale-105 transition-all duration-300
          top-4 right-4 sm:bottom-24 sm:right-6 sm:top-auto"
        title="Give Feedback"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Feedback</span>
      </button>

      {/* Feedback Modal */}
      <FeedbackModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default FeedbackButton;
