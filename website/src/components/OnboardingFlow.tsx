import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { CosmicBackground } from './CosmicBackground';
import { GlassCard } from './CosmicUI';
import AutoResizeTextarea from './AutoResizeTextarea';
import { Send, User, Bot, Telescope } from 'lucide-react';
import toast from 'react-hot-toast';
import FeatureTour from './FeatureTour';

interface OnboardingQuestion {
  id: string;
  field: string;
  question: string;
  type: 'text' | 'date' | 'time' | 'select' | 'textarea';
  options?: { value: string; label: string }[];
  category: 'basic' | 'context';
}

const QUESTIONS: OnboardingQuestion[] = [
  { id: '1', field: 'full_name', question: "I'm delighted to help you discover your cosmic path. May I ask your full name to address you personally?", type: 'text', category: 'basic' },
  { id: '2', field: 'date_of_birth', question: "Wonderful. The stars' positions at the moment of your arrival are key. When was that special day?", type: 'date', category: 'basic' },
  { id: '3', field: 'time_of_birth', question: "Precision matters in the cosmic dance. Do you happen to know your exact birth time? (It's okay to skip if not)", type: 'time', category: 'basic' },
  { id: '4', field: 'place_of_birth', question: "For an accurate celestial reading, kindly share your birthplace — where your destiny first took form. (City, Country)", type: 'text', category: 'basic' },
  {
    id: '5', field: 'gender', question: "To better understand your energy, how do you identify yourself?", type: 'select', options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'other', label: 'Other' },
      { value: 'prefer_not_to_say', label: 'Prefer not to say' }
    ], category: 'basic'
  },
  { id: '6', field: 'current_location', question: "Where are you based right now? (City, Country)", type: 'text', category: 'basic' },
  {
    id: '7', field: 'career_stage', question: "Let's look at your current life chapter. What best describes your professional stage right now?", type: 'select', options: [
      { value: 'student', label: 'Student' },
      { value: 'early-career', label: 'Early Career' },
      { value: 'mid-career', label: 'Mid Career' },
      { value: 'entrepreneur', label: 'Entrepreneur' }
    ], category: 'context'
  },
  {
    id: '8', field: 'relationship_status', question: "And in the realm of connection, what is your current relationship status?", type: 'select', options: [
      { value: 'single', label: 'Single' },
      { value: 'relationship', label: 'In a Relationship' },
      { value: 'married', label: 'Married' }
    ], category: 'context'
  },
  {
    id: '9', field: 'main_life_focus', question: "What part of your life path feels most important to you at this moment?", type: 'select', options: [
      { value: 'career', label: 'Career' },
      { value: 'relationships', label: 'Relationships' },
      { value: 'finance', label: 'Finance' },
      { value: 'health', label: 'Health' },
      { value: 'spirituality', label: 'Spirituality' }
    ], category: 'context'
  },
  {
    id: '10', field: 'personality_style', question: "How would you describe your natural way of being—your personality style?", type: 'select', options: [
      { value: 'analytical', label: 'Analytical' },
      { value: 'emotional', label: 'Emotional' },
      { value: 'practical', label: 'Practical' },
      { value: 'spiritual', label: 'Spiritual' }
    ], category: 'context'
  },
  { id: '11', field: 'primary_life_problem', question: "Finally, is there a specific challenge or goal you'd like the stars to guide you through?", type: 'textarea', category: 'context' }
];

const OnboardingFlow: React.FC = () => {
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [chatHistory, setChatHistory] = useState<{ type: 'ai' | 'user'; text: string; field?: string }[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState('');
  const [showTour, setShowTour] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isTyping]);

  // Load existing data on mount to resume where left off
  useEffect(() => {
    const fetchExistingData = async () => {
      try {
        const response = await apiFetch('/api/profile');
        if (response && response.user) {
          const profile = response.user;
          const newAnswers: Record<string, string> = {};
          let lastCompletedIndex = -1;

          QUESTIONS.forEach((q, index) => {
            if (profile[q.field]) {
              newAnswers[q.field] = profile[q.field];
              lastCompletedIndex = index;
            }
          });

          setAnswers(newAnswers);
          // Start from the next question after the last completed one
          const nextIndex = lastCompletedIndex + 1;
          if (nextIndex < QUESTIONS.length) {
            setCurrentQuestionIndex(nextIndex);
            // Add initial history if we are resuming
            if (nextIndex > 0) {
              setChatHistory([{ type: 'ai', text: `Welcome back! I've saved your progress. Let's continue from where we left off.` }]);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching profile for resumption:', err);
      }
    };
    fetchExistingData();
  }, []);

  // Handle AI typing out the current question
  useEffect(() => {
    if (chatHistory.length === 0 || (chatHistory[chatHistory.length - 1].type === 'user' && currentQuestionIndex < QUESTIONS.length)) {
      const question = QUESTIONS[currentQuestionIndex];
      if (!question) return;

      setIsTyping(true);
      const delay = chatHistory.length === 0 ? 500 : 1000;

      const timer = setTimeout(() => {
        // Privacy Injections
        const privacyMessages: Record<number, string> = {
          1: "Just so you know, I only use your name to make our conversation feel more natural.",
          4: "Your birth details are encrypted and used solely to calculate your unique cosmic chart. Your privacy is paramount.",
          9: "Every piece of context you share helps me tailor your daily insights so they feel truly yours."
        };

        if (privacyMessages[currentQuestionIndex]) {
          setChatHistory(prev => [...prev, { type: 'ai', text: privacyMessages[currentQuestionIndex] }]);
          // Give a small extra delay before showing the actual question
          setTimeout(() => {
            setChatHistory(prev => [...prev, { type: 'ai', text: question.question, field: question.field }]);
            setIsTyping(false);
          }, 1200);
        } else {
          setChatHistory(prev => [...prev, { type: 'ai', text: question.question, field: question.field }]);
          setIsTyping(false);
        }
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [currentQuestionIndex, chatHistory.length]);

  const handleSend = async (explicitValue?: string, explicitDisplay?: string) => {
    const currentQuestion = QUESTIONS[currentQuestionIndex];
    let answer = explicitValue !== undefined ? explicitValue : inputValue.trim();
    const display = explicitDisplay !== undefined ? explicitDisplay : answer;

    if (!answer && currentQuestion.type !== 'select') return;

    // Date from native input is already YYYY-MM-DD, keep as is
    if (currentQuestion.field === 'date_of_birth') {
      // Native date input returns YYYY-MM-DD format already
      // Just validate it's a proper date
      if (answer && !isNaN(Date.parse(answer))) {
        // Keep the format as is (YYYY-MM-DD)
        answer = answer;
      }
    }

    // Time from native input is already HH:MM (24-hour), keep as is
    if (currentQuestion.field === 'time_of_birth') {
      // Native time input returns HH:MM format already
      // Just ensure proper formatting
      const timeMatch = answer.match(/^(\d{2}):(\d{2})$/);
      if (timeMatch) {
        answer = `${timeMatch[1]}:${timeMatch[2]}`;
      }
    }

    // Add user message to chat
    setChatHistory(prev => [...prev, { type: 'user', text: display || 'Selected an option' }]);

    // Update local answers state with normalized value
    const updatedAnswers = { ...answers, [currentQuestion.field]: answer };
    setAnswers(updatedAnswers);
    setInputValue('');

    // Special handling for Age display after DOB
    if (currentQuestion.field === 'date_of_birth') {
      const birthDate = new Date(answer);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      if (!isNaN(age) && age > 0) {
        setIsTyping(true);
        setTimeout(() => {
          setChatHistory(prev => [...prev, {
            type: 'ai',
            text: `So you have completed ${age} celestial cycles around the Sun. A wonderful age of wisdom and growth.`
          }]);
          setIsTyping(false);
        }, 800);
      }
    }

    // Save to database incrementally
    try {
      if (currentQuestion.category === 'basic') {
        const basicFields = QUESTIONS.filter(q => q.category === 'basic').map(q => q.field);
        const basicData = Object.fromEntries(
          Object.entries(updatedAnswers).filter(([key]) => basicFields.includes(key))
        );
        // Only trigger API if we have at least these essential fields or at specific points
        if (currentQuestion.field === 'place_of_birth' || currentQuestion.field === 'current_location') {
          await apiFetch('/api/profile/basic', { method: 'POST', body: JSON.stringify(basicData) });
        }
      } else {
        const contextFields = QUESTIONS.filter(q => q.category === 'context').map(q => q.field);
        const contextData = Object.fromEntries(
          Object.entries(updatedAnswers).filter(([key]) => contextFields.includes(key))
        );
        if (currentQuestionIndex === QUESTIONS.length - 1) {
          // Final question, save all context
          await apiFetch('/api/profile/context', { method: 'POST', body: JSON.stringify(contextData) });
        } else if (currentQuestion.field === 'main_life_focus') {
          await apiFetch('/api/profile/context', { method: 'POST', body: JSON.stringify(contextData) });
        }
      }
    } catch (err: any) {
      console.error('Error saving progress:', err);
      toast.error(err?.message || 'Failed to save progress. Please try again.');
    }

    // Move to next question or finish
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    setIsFinishing(true);
    const progressSteps = [
      'Analyzing birth details...',
      'Calculating planetary positions...',
      'Generating birth chart insights...',
      'Computing numerology patterns...',
      'Creating personalized recommendations...',
      'Finalizing your cosmic profile...'
    ];

    try {
      let stepIndex = 0;
      const progressInterval = setInterval(() => {
        if (stepIndex < progressSteps.length) {
          setLoadingStep(progressSteps[stepIndex]);
          stepIndex++;
        }
        setProgress(prev => Math.min(prev + (100 / progressSteps.length), 95));
      }, 1000);

      await apiFetch('/api/profile/generate-insights', {
        method: 'POST',
        body: JSON.stringify({})
      });

      clearInterval(progressInterval);
      setProgress(100);
      setLoadingStep('Complete!');

      toast.success('Your cosmic insights are ready!');

      // Show Feature Tour instead of immediate navigation
      setTimeout(() => setShowTour(true), 800);
    } catch (err: any) {
      toast.error('Failed to generate insights. Please try again from settings.');
      setTimeout(() => navigate('/dashboard'), 2000);
    }
  };

  if (isFinishing) {
    return (
      <CosmicBackground className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md animate-slide-up">
          <GlassCard className="p-8 text-center bg-black/60 border border-violet-500/30 backdrop-blur-xl shadow-[0_0_30px_rgba(168,85,247,0.2)]">
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full border-4 border-violet-500/20 animate-pulse" />
              <div
                className="absolute inset-0 rounded-full border-4 border-t-fuchsia-500 border-r-fuchsia-500 border-b-transparent border-l-transparent animate-spin"
                style={{ transform: `rotate(${progress * 3.6}deg)` }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Telescope className="w-10 h-10 text-violet-300" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">{progress < 100 ? 'Writing Your Destiny...' : 'Success!'}</h1>
            <p className="text-white/60 text-sm mb-6">{loadingStep}</p>
            <div className="w-full bg-white/5 rounded-full h-2 mb-4">
              <div
                className="h-full bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </GlassCard>

          {/* Feature Tour Overlay - triggered after 100% progress */}
          <FeatureTour
            isOpen={showTour}
            onClose={() => {
              setShowTour(false);
              navigate('/dashboard');
            }}
          />
        </div>
      </CosmicBackground>
    );
  }

  return (
    <CosmicBackground className="h-screen flex flex-col">
      {/* Header bar */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-white/5 bg-black/40 backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fuchsia-500 to-violet-600 flex items-center justify-center overflow-hidden">
            <img src="/favicon.png" alt="AstroAI" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide">AstroAI Onboarding</h1>
            <p className="text-[10px] text-fuchsia-400 font-bold uppercase tracking-widest">Digital Consciousness 1.0</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-white/60 font-medium">Step {currentQuestionIndex + 1} of {QUESTIONS.length}</span>
        </div>
      </div>

      {/* Chat History Area */}
      <div className="flex-1 overflow-y-auto px-4 py-8 space-y-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {chatHistory.map((msg, idx) => (
            <div key={idx} className={`flex items-start gap-3 ${msg.type === 'user' ? 'flex-row-reverse' : ''} animate-fade-in`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.type === 'user' ? 'bg-violet-600 shadow-[0_0_10px_rgba(139,92,246,0.3)]' : 'bg-fuchsia-600/20 border border-fuchsia-500/20'}`}>
                {msg.type === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-fuchsia-400" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl p-4 text-sm sm:text-base ${msg.type === 'user'
                ? 'bg-violet-600 text-white rounded-tr-sm'
                : 'bg-white/5 border border-white/10 text-white/90 rounded-tl-sm backdrop-blur-md'
                }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex items-start gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-fuchsia-600/20 border border-fuchsia-500/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-fuchsia-400" />
              </div>
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-sm backdrop-blur-md">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 animate-bounce delay-100" />
                  <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* FLOATING CHAT INPUT - ChatGPT Style */}
      <div className="w-full px-4 py-6 md:py-8">
        <div className="max-w-3xl mx-auto">
          {/* Select Options - shown when question type is select */}
          {QUESTIONS[currentQuestionIndex]?.type === 'select' && (
            <div className="flex flex-wrap gap-2 mb-4">
              {QUESTIONS[currentQuestionIndex]?.options?.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleSend(opt.value, opt.label)}
                  className="px-4 py-2 bg-violet-600/20 hover:bg-violet-600/40 border border-violet-500/30 rounded-xl text-sm font-medium text-white transition-all whitespace-nowrap"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
          
          {/* Date Input */}
          {(QUESTIONS[currentQuestionIndex]?.field === 'date_of_birth') && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (inputValue.trim()) {
                  handleSend();
                }
              }}
            >
              <div className="relative flex items-end">
                <input
                  type="date"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full bg-purple-900/95 hover:bg-purple-900 focus:bg-purple-900 backdrop-blur-xl border-2 border-white/70 hover:border-white focus:border-white rounded-2xl pl-4 pr-12 py-3.5 md:pl-5 md:pr-14 md:py-4 text-lg text-white placeholder-white/90 focus:outline-none focus:ring-4 focus:ring-purple-400/60 transition-all shadow-xl shadow-purple-500/20 [color-scheme:dark]"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="absolute right-2 bottom-2 p-2 md:right-3 md:bottom-3 bg-white hover:bg-gray-100 disabled:bg-white/20 disabled:opacity-50 text-purple-900 rounded-xl transition-all disabled:cursor-not-allowed shadow-lg border-2 border-purple-300"
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m-7 7l7-7 7 7" />
                  </svg>
                </button>
              </div>
            </form>
          )}

          {/* Time Input */}
          {(QUESTIONS[currentQuestionIndex]?.field === 'time_of_birth') && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (inputValue.trim()) {
                  handleSend();
                }
              }}
            >
              <div className="relative flex items-end">
                <input
                  type="time"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full bg-purple-900/95 hover:bg-purple-900 focus:bg-purple-900 backdrop-blur-xl border-2 border-white/70 hover:border-white focus:border-white rounded-2xl pl-4 pr-12 py-3.5 md:pl-5 md:pr-14 md:py-4 text-lg text-white placeholder-white/90 focus:outline-none focus:ring-4 focus:ring-purple-400/60 transition-all shadow-xl shadow-purple-500/20 [color-scheme:dark]"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="absolute right-2 bottom-2 p-2 md:right-3 md:bottom-3 bg-white hover:bg-gray-100 disabled:bg-white/20 disabled:opacity-50 text-purple-900 rounded-xl transition-all disabled:cursor-not-allowed shadow-lg border-2 border-purple-300"
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m-7 7l7-7 7 7" />
                  </svg>
                </button>
              </div>
            </form>
          )}

          {/* Text/Textarea Input - for all other non-select types */}
          {QUESTIONS[currentQuestionIndex]?.type !== 'select' && 
           QUESTIONS[currentQuestionIndex]?.field !== 'date_of_birth' && 
           QUESTIONS[currentQuestionIndex]?.field !== 'time_of_birth' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (inputValue.trim()) {
                  handleSend();
                }
              }}
            >
              <div className="relative flex items-end">
                <AutoResizeTextarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (inputValue.trim()) {
                        handleSend();
                      }
                    }
                  }}
                  placeholder={
                    QUESTIONS[currentQuestionIndex]?.type === 'textarea'
                      ? "Tell me more..."
                      : `Enter your ${QUESTIONS[currentQuestionIndex]?.field?.replace(/_/g, ' ') || 'answer'}...`
                  }
                  maxRows={6}
                  className="w-full bg-purple-900/95 hover:bg-purple-900 focus:bg-purple-900 backdrop-blur-xl border-2 border-white/70 hover:border-white focus:border-white rounded-2xl pl-4 pr-12 py-3.5 md:pl-5 md:pr-14 md:py-4 text-lg text-white placeholder-white/90 focus:outline-none focus:ring-4 focus:ring-purple-400/60 transition-all shadow-xl shadow-purple-500/20"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="absolute right-2 bottom-2 p-2 md:right-3 md:bottom-3 bg-white hover:bg-gray-100 disabled:bg-white/20 disabled:opacity-50 text-purple-900 rounded-xl transition-all disabled:cursor-not-allowed shadow-lg border-2 border-purple-300"
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m-7 7l7-7 7 7" />
                  </svg>
                </button>
              </div>
            </form>
          )}
        </div>
        <p className="text-center text-white/50 text-xs mt-2">
          {QUESTIONS[currentQuestionIndex]?.type === 'select' ? 'Select an option above' : 'Press Enter to submit your answer'}
        </p>
      </div>
    </CosmicBackground>
  );
};

export default OnboardingFlow;
