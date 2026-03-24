// Professional Symbols and Icons Mapping
// Replaces emojis with professional Unicode symbols

export const professionalSymbols = {
  // Astrology Symbols (keep these - they're professional Unicode symbols)
  '♈': '♈', // Aries
  '♉': '♉', // Taurus
  '♊': '♊', // Gemini
  '♋': '♋', // Cancer
  '♌': '♌', // Leo
  '♍': '♍', // Virgo
  '♎': '♎', // Libra
  '♏': '♏', // Scorpio
  '♐': '♐', // Sagittarius
  '♑': '♑', // Capricorn
  '♒': '♒', // Aquarius
  '♓': '♓', // Pisces
  '☉': '☉', // Sun
  '☽': '☽', // Moon
  '☾': '☾', // Moon (alternative)
  
  // Planetary Symbols
  '☿': '☿', // Mercury
  '♀': '♀', // Venus
  '♂': '♂', // Mars
  '♃': '♃', // Jupiter
  '♄': '♄', // Saturn
  '♅': '♅', // Uranus
  '♆': '♆', // Neptune
  '♇': '♇', // Pluto
  
  // Replace Emojis with Professional Alternatives
  '🌟': '✦', // Star -> Professional star
  '✨': '✦', // Sparkles -> Professional star
  '💫': '✦', // Dizzy -> Professional star
  '⚠️': '⚠', // Warning -> Keep warning symbol
  '🔄': '↻', // Refresh -> Professional refresh
  '❤️': '♥', // Heart -> Professional heart
  '💼': '◆', // Briefcase -> Diamond/professional
  '🏥': '✚', // Hospital -> Medical cross
  '💰': '¤', // Money bag -> Currency symbol
  '🎯': '◎', // Target -> Professional target
  '⚡': '⚡', // Lightning -> Keep (professional)
  '🍀': '♣', // Clover -> Club symbol
  '🛤️': '═', // Road -> Professional line
  '🏛️': 'Π', // Temple -> Greek letter
  '🕉️': 'ॐ', // Om symbol -> Keep (professional)
  
  // Additional professional symbols
  '📊': '▓', // Chart -> Professional chart symbol
  '📈': '▲', // Up chart -> Up arrow
  '📉': '▼', // Down chart -> Down arrow
  '🔮': '◈', // Crystal ball -> Professional mystical symbol
  '🔢': '#', // Numbers -> Hash symbol
  '🌈': '≈', // Rainbow -> Wave symbol
  '🌍': '⊕', // Earth -> Professional earth symbol
  '🎨': '◉', // Palette -> Professional circle
  '🎭': '◯', // Masks -> Professional circle
};

// SVG Icon Components as string templates (to be used in React components)
export const svgIconStrings = {
  refresh: '<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>',
  heart: '<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>',
  career: '<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>',
  health: '<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>',
  finance: '<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>',
  target: '<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>',
  energy: '<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>',
  luck: '<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>',
  warning: '<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>',
  loading: '<svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>',
};

// Helper function to replace emojis with professional symbols
export const replaceEmojis = (text: string): string => {
  let result = text;
  Object.entries(professionalSymbols).forEach(([emoji, symbol]) => {
    result = result.replace(new RegExp(emoji.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), symbol);
  });
  return result;
};

// Helper function to clean advice text and remove unwanted symbols
export const cleanAdviceText = (text: string): string => {
  if (!text) return text;
  // Remove warning symbols and clean up the text
  return text.replace(/^⚠\s*/i, '').trim();
};

// Helper function to get professional symbol for emoji
export const getProfessionalSymbol = (emoji: string): string => {
  return (professionalSymbols as any)[emoji] || emoji;
};
