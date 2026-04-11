import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RotateCcw, Brain, Eye, Heart, Compass, Stars } from 'lucide-react';

interface UserResponses {
  knowsAstrology: string | null;
  numberPatterns: string | null;
  beliefSystem: string | null;
  decisionStyle: string | null;
  curiosityLevel: string | null;
}

const STORAGE_KEY = 'astro-numerology-flow-responses';
const COMPLETED_KEY = 'astro-numerology-flow-completed';

const questions = [
  {
    id: 'knowsAstrology' as const,
    icon: Eye,
    question: "Before we begin… do you already know anything about astrology?",
    options: [
      { value: 'yes', label: "Yes, I do", response: "Wonderful! You already have a foundation to build upon ✨" },
      { value: 'no', label: "Not really", response: "Perfect — a fresh perspective often sees what others miss ✨" },
      { value: 'little', label: "I've heard a little", response: "That curiosity will serve you well on this journey ✨" },
    ],
  },
  {
    id: 'numberPatterns' as const,
    icon: Sparkles,
    question: "Do you feel certain numbers appear repeatedly in your life?",
    options: [
      { value: 'often', label: "Yes, very often", response: "Those aren't coincidences — the universe is whispering to you ✨" },
      { value: 'sometimes', label: "Sometimes I notice", response: "Your awareness is awakening… patterns are everywhere ✨" },
      { value: 'not_really', label: "Not really", response: "Sometimes we see only when we're ready to see ✨" },
      { value: 'never', label: "Never paid attention", response: "Prepare to notice things you never saw before ✨" },
    ],
  },
  {
    id: 'beliefSystem' as const,
    icon: Brain,
    question: "Do you believe your personality is influenced by unseen patterns?",
    options: [
      { value: 'absolutely', label: "Absolutely", response: "You already sense the invisible threads that connect all things ✨" },
      { value: 'maybe', label: "Maybe a little", response: "That openness is the door through which wisdom enters ✨" },
      { value: 'unsure', label: "I'm not sure", response: "Questioning is the first step toward understanding ✨" },
      { value: 'no', label: "I don't think so", response: "Skepticism has its own wisdom — let the numbers speak for themselves ✨" },
    ],
  },
  {
    id: 'decisionStyle' as const,
    icon: Compass,
    question: "When making important decisions, what do you rely on most?",
    options: [
      { value: 'logic', label: "Logic & facts", response: "A clear mind reveals patterns that chaos conceals ✨" },
      { value: 'intuition', label: "Intuition & gut feeling", response: "Your inner voice already knows the numbers' language ✨" },
      { value: 'advice', label: "Advice from others", response: "Seeking guidance shows wisdom beyond your years ✨" },
      { value: 'mix', label: "A mix of everything", response: "Balance is the key that unlocks all doors ✨" },
    ],
  },
  {
    id: 'curiosityLevel' as const,
    icon: Stars,
    question: "Would you like to discover what your numbers say about your future?",
    options: [
      { value: 'yes', label: "Yes, definitely", response: "The cosmos awaits your question…" },
      { value: 'interesting', label: "Sounds interesting", response: "Interest is the spark that ignites transformation…" },
      { value: 'later', label: "Maybe later", response: "The numbers will be here when you're ready…" },
      { value: 'no', label: "Not right now", response: "All things in their own time…" },
    ],
  },
];

const getFinalInsight = (responses: UserResponses): string => {
  const hasOpenMind = responses.beliefSystem === 'absolutely' || responses.beliefSystem === 'maybe';
  const isIntuitive = responses.decisionStyle === 'intuition' || responses.decisionStyle === 'mix';
  const noticesPatterns = responses.numberPatterns === 'often' || responses.numberPatterns === 'sometimes';
  const isCurious = responses.curiosityLevel === 'yes' || responses.curiosityLevel === 'interesting';

  if (hasOpenMind && isIntuitive && noticesPatterns) {
    return "Based on your responses ✨ it seems you're naturally attuned to the hidden frequencies of the universe. Your intuitive connection to patterns suggests you may be more sensitive to numerological influences than most. Your Life Path, Destiny, and Personal Year numbers could reveal profound insights about your soul's journey.";
  }
  
  if (responses.knowsAstrology === 'yes' && isCurious) {
    return "Your existing knowledge of astrology gives you a unique advantage ✨ Numerology and astrology are ancient sister sciences. Together, they weave a complete tapestry of your cosmic blueprint — revealing not just planetary influences, but the numerical vibrations that shape your very essence.";
  }

  if (responses.beliefSystem === 'no' || responses.curiosityLevel === 'later' || responses.curiosityLevel === 'no') {
    return "Even for the pragmatic mind, numerology offers something remarkable ✨ Whether you seek proof or simply curious patterns, your numbers provide an objective mirror — mathematical, ancient, and surprisingly accurate. Let the data speak for itself.";
  }

  return "Your responses reveal a beautiful curiosity about the unseen forces that shape our lives ✨ Numerology isn't about predicting the future — it's about understanding the energetic patterns that influence your personality, relationships, and life timing. Your unique numbers hold keys to deeper self-awareness.";
};

const FloatingParticle: React.FC<{ delay: number }> = ({ delay }) => (
  <motion.div
    className="absolute w-1 h-1 rounded-full bg-fuchsia-400/30"
    initial={{ opacity: 0, y: 0, x: 0 }}
    animate={{
      opacity: [0, 0.6, 0],
      y: [-20, -100],
      x: [0, Math.random() * 40 - 20],
    }}
    transition={{
      duration: 4 + Math.random() * 2,
      delay,
      repeat: Infinity,
      repeatDelay: Math.random() * 3,
    }}
    style={{
      left: `${Math.random() * 100}%`,
      bottom: '0%',
    }}
  />
);

const AstroNumerologyFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<UserResponses>({
    knowsAstrology: null,
    numberPatterns: null,
    beliefSystem: null,
    decisionStyle: null,
    curiosityLevel: null,
  });
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const [showReexplore, setShowReexplore] = useState(false);

  // Load saved state on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const completed = localStorage.getItem(COMPLETED_KEY);
    
    if (saved && completed === 'true') {
      try {
        const parsed = JSON.parse(saved);
        setResponses(parsed);
        setIsComplete(true);
        setIsReturning(true);
        setCurrentStep(questions.length);
      } catch (e) {
        console.error('Failed to load saved responses', e);
      }
    }
  }, []);

  // Save responses when complete
  useEffect(() => {
    if (isComplete) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(responses));
      localStorage.setItem(COMPLETED_KEY, 'true');
    }
  }, [isComplete, responses]);

  const handleAnswer = useCallback((value: string, responseText: string) => {
    const currentQ = questions[currentStep];
    setResponses(prev => ({ ...prev, [currentQ.id]: value }));
    setAiResponse(responseText);

    // Delay before moving to next
    setTimeout(() => {
      setAiResponse(null);
      if (currentStep < questions.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        setIsComplete(true);
      }
    }, 2000);
  }, [currentStep]);

  const handleReexplore = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(COMPLETED_KEY);
    setCurrentStep(0);
    setResponses({
      knowsAstrology: null,
      numberPatterns: null,
      beliefSystem: null,
      decisionStyle: null,
      curiosityLevel: null,
    });
    setIsComplete(false);
    setIsReturning(false);
    setShowReexplore(false);
    setAiResponse(null);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const questionVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.3 },
    },
  };

  const chipVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.8 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.4,
        ease: "easeOut" as const,
      },
    }),
  };

  const aiResponseVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const,
      },
    },
    exit: { opacity: 0, x: 20, transition: { duration: 0.3 } },
  };

  // Floating animation for depth
  const floatingAnimation = {
    y: [0, -8, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  };

  return (
    <div className="relative w-full py-12 overflow-hidden">
      {/* Subtle nebula background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/10 via-transparent to-fuchsia-900/5" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-violet-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-fuchsia-600/5 rounded-full blur-3xl" />
        
        {/* Floating particles */}
        {Array.from({ length: 8 }).map((_, i) => (
          <FloatingParticle key={i} delay={i * 0.8} />
        ))}
      </div>

      <div className="relative max-w-3xl mx-auto px-4">
        {/* AI Avatar / Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-center justify-center mb-12"
        >
          <div className="relative">
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 20px rgba(168,85,247,0.3)',
                  '0 0 40px rgba(168,85,247,0.5)',
                  '0 0 20px rgba(168,85,247,0.3)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 backdrop-blur-xl border border-violet-400/30 flex items-center justify-center"
            >
              <Sparkles className="w-7 h-7 text-violet-300" />
            </motion.div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400/80 rounded-full border-2 border-black" />
          </div>
          <div className="ml-4">
            <p className="text-white/50 text-xs uppercase tracking-wider">Your Numerology Guide</p>
            <p className="text-white font-medium">AI Oracle</p>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {!isComplete ? (
            <motion.div
              key={currentStep}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-8"
            >
              {/* Question Bubble - Floating */}
              <motion.div
                variants={questionVariants}
                animate={floatingAnimation}
                className="relative"
              >
                <div className="backdrop-blur-xl bg-black/40 border border-violet-500/20 rounded-2xl p-6 shadow-[0_0_30px_rgba(168,85,247,0.1)] hover:shadow-[0_0_40px_rgba(168,85,247,0.2)] transition-shadow duration-500">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 flex items-center justify-center flex-shrink-0">
                      {React.createElement(questions[currentStep].icon, { className: "w-5 h-5 text-violet-300" })}
                    </div>
                    <div>
                      <p className="text-white/60 text-sm mb-1">Question {currentStep + 1} of {questions.length}</p>
                      <p className="text-white text-lg leading-relaxed">
                        {questions[currentStep].question}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Answer Chips - Staggered Floating */}
              <motion.div
                className="flex flex-wrap gap-3 justify-center"
                variants={containerVariants}
              >
                {questions[currentStep].options.map((option, i) => (
                  <motion.button
                    key={option.value}
                    custom={i}
                    variants={chipVariants}
                    whileHover={{
                      scale: 1.05,
                      boxShadow: '0 0 25px rgba(168,85,247,0.4)',
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAnswer(option.value, option.response)}
                    className="relative px-5 py-2.5 rounded-full backdrop-blur-md bg-white/5 border border-violet-400/20 text-white/80 text-sm hover:text-white hover:border-violet-400/40 hover:bg-violet-500/10 transition-colors duration-300"
                  >
                    <motion.span
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500/0 via-fuchsia-500/20 to-violet-500/0 opacity-0 hover:opacity-100 transition-opacity"
                    />
                    {option.label}
                  </motion.button>
                ))}
              </motion.div>

              {/* AI Response */}
              <AnimatePresence>
                {aiResponse && (
                  <motion.div
                    variants={aiResponseVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="flex justify-start"
                  >
                    <div className="backdrop-blur-xl bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 border border-violet-400/30 rounded-2xl rounded-tl-sm px-5 py-3 max-w-xs">
                      <p className="text-white/90 text-sm italic">{aiResponse}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center space-y-8"
            >
              {/* Final Insight */}
              <motion.div
                animate={floatingAnimation}
                className="backdrop-blur-xl bg-black/50 border border-violet-500/30 rounded-3xl p-8 shadow-[0_0_60px_rgba(168,85,247,0.15)]"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 flex items-center justify-center"
                >
                  <Heart className="w-9 h-9 text-fuchsia-300" />
                </motion.div>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-white text-lg leading-relaxed mb-6"
                >
                  {getFinalInsight(responses)}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="flex items-center justify-center gap-2 text-violet-300 text-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Your numerology insights are ready above</span>
                  <Sparkles className="w-4 h-4" />
                </motion.div>
              </motion.div>

              {/* Re-explore option for returning users */}
              {isReturning && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={handleReexplore}
                  className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-full backdrop-blur-md bg-white/5 border border-white/10 text-white/60 text-sm hover:text-white hover:border-white/30 transition-all duration-300"
                >
                  <RotateCcw className="w-4 h-4" />
                  Re-explore your answers
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress indicator */}
        <div className="mt-12 flex justify-center gap-2">
          {questions.map((_, i) => (
            <motion.div
              key={i}
              className="h-1 rounded-full"
              initial={{ width: 8, backgroundColor: 'rgba(255,255,255,0.2)' }}
              animate={{
                width: i <= currentStep ? 24 : 8,
                backgroundColor: i <= currentStep ? 'rgba(168,85,247,0.8)' : 'rgba(255,255,255,0.2)',
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AstroNumerologyFlow;
