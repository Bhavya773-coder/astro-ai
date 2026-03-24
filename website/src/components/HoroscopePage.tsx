import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppNavbar from './AppNavbar';
import HoroscopeWidget from './HoroscopeWidget';
import { useAppData } from '../state/AppDataContext';
import { CosmicBackground } from './CosmicBackground';
import { GlassCard, GradientText, LoadingSpinner } from './CosmicUI';
import { HoroscopeService } from '../services/horoscopeService';

const HoroscopePage: React.FC = () => {
  const navigate = useNavigate();
  const { insightStatus, isInsightLoading } = useAppData();
  const [selectedSign, setSelectedSign] = useState<string>('');
  const [compareMode, setCompareMode] = useState(false);
  const [compareSign, setCompareSign] = useState<string>('');

  const zodiacSigns = [
    { name: 'aries', symbol: '♈', dates: 'Mar 21 - Apr 19' },
    { name: 'taurus', symbol: '♉', dates: 'Apr 20 - May 20' },
    { name: 'gemini', symbol: '♊', dates: 'May 21 - Jun 20' },
    { name: 'cancer', symbol: '♋', dates: 'Jun 21 - Jul 22' },
    { name: 'leo', symbol: '♌', dates: 'Jul 23 - Aug 22' },
    { name: 'virgo', symbol: '♍', dates: 'Aug 23 - Sep 22' },
    { name: 'libra', symbol: '♎', dates: 'Sep 23 - Oct 22' },
    { name: 'scorpio', symbol: '♏', dates: 'Oct 23 - Nov 21' },
    { name: 'sagittarius', symbol: '♐', dates: 'Nov 22 - Dec 21' },
    { name: 'capricorn', symbol: '♑', dates: 'Dec 22 - Jan 19' },
    { name: 'aquarius', symbol: '♒', dates: 'Jan 20 - Feb 18' },
    { name: 'pisces', symbol: '♓', dates: 'Feb 19 - Mar 20' }
  ];

  // Get user's zodiac sign from birth date
  const userZodiacSign = React.useMemo(() => {
    if (insightStatus?.date_of_birth) {
      return HoroscopeService.getZodiacSignFromDate(insightStatus.date_of_birth);
    }
    return null;
  }, [insightStatus?.date_of_birth]);

  useEffect(() => {
    if (userZodiacSign && !selectedSign) {
      setSelectedSign(userZodiacSign);
    }
  }, [userZodiacSign, selectedSign]);

  const handleGettingStarted = () => {
    navigate('/onboarding/step-1');
  };

  if (isInsightLoading) {
    return (
      <CosmicBackground>
        <AppNavbar />
        
        <div className="pt-16">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <LoadingSpinner />
                <p className="text-white/60 mt-4">Loading your cosmic profile...</p>
              </div>
            </div>
          </div>
        </div>
      </CosmicBackground>
    );
  }

  if (!insightStatus?.date_of_birth) {
    return (
      <CosmicBackground>
        <AppNavbar />
        
        <div className="pt-16">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center max-w-2xl mx-auto">
              <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">
                Your <GradientText>Cosmic</GradientText> Horoscope
              </h1>
              <p className="text-xl text-white/70 mb-8">
                Discover what the stars have in store for you with personalized daily, weekly, and monthly horoscopes.
              </p>
              
              <GlassCard className="p-8 text-center">
                <div className="text-6xl mb-4">🔮</div>
                <h2 className="text-2xl font-bold text-white mb-4">Complete Your Profile</h2>
                <p className="text-white/70 mb-6">
                  Please complete your birth details to get your personalized horoscope based on your zodiac sign.
                </p>
                <button
                  onClick={handleGettingStarted}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-8 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
                >
                  Complete Profile
                </button>
              </GlassCard>
            </div>
          </div>
        </div>
      </CosmicBackground>
    );
  }

  return (
    <CosmicBackground>
      <AppNavbar />
      
      <div className="pt-16">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">
              Your <GradientText>Cosmic</GradientText> Horoscope
            </h1>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Explore personalized astrological insights and discover what the universe has planned for you
            </p>
          </div>

          {/* User's Personal Horoscope */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-3xl">{HoroscopeService.getZodiacSymbol(userZodiacSign || '')}</span>
                Your Personal Horoscope
              </h2>
              <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-full">
                {HoroscopeService.getZodiacDisplayName(userZodiacSign || '')}
              </span>
            </div>
            
            <HoroscopeWidget 
              zodiacSign={userZodiacSign || undefined}
              birthDate={insightStatus?.date_of_birth || undefined}
            />
          </div>

          {/* Zodiac Sign Selector */}
          <GlassCard className="p-6 mb-8">
            <h3 className="text-xl font-bold text-white mb-6">Explore Other Signs</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {zodiacSigns.map((sign) => (
                <button
                  key={sign.name}
                  onClick={() => setSelectedSign(sign.name)}
                  className={`p-4 rounded-lg border transition-all duration-300 text-center ${
                    selectedSign === sign.name
                      ? 'border-custom-yellow bg-custom-yellow/20 text-custom-yellow'
                      : 'border-white/20 bg-white/5 text-white/70 hover:border-white/40 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="text-2xl mb-2">{sign.symbol}</div>
                  <div className="font-medium text-sm mb-1">
                    {HoroscopeService.getZodiacDisplayName(sign.name)}
                  </div>
                  <div className="text-xs opacity-70">
                    {sign.dates}
                  </div>
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Selected Sign Horoscope */}
          {selectedSign && selectedSign !== userZodiacSign && (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">{HoroscopeService.getZodiacSymbol(selectedSign)}</span>
                <h2 className="text-2xl font-bold text-white">
                  {HoroscopeService.getZodiacDisplayName(selectedSign)} Horoscope
                </h2>
              </div>
              
              <HoroscopeWidget zodiacSign={selectedSign} />
            </div>
          )}

          {/* Compare Mode */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Compatibility Check</h3>
              <button
                onClick={() => setCompareMode(!compareMode)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  compareMode
                    ? 'bg-custom-yellow text-gray-900'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                }`}
              >
                {compareMode ? 'Hide' : 'Show'} Compare
              </button>
            </div>

            {compareMode && (
              <div className="space-y-6">
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    Compare with:
                  </label>
                  <select
                    value={compareSign}
                    onChange={(e) => setCompareSign(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-custom-yellow focus:outline-none"
                  >
                    <option value="">Select a sign to compare</option>
                    {zodiacSigns
                      .filter(sign => sign.name !== selectedSign)
                      .map(sign => (
                        <option key={sign.name} value={sign.name}>
                          {HoroscopeService.getZodiacDisplayName(sign.name)} {sign.symbol}
                        </option>
                      ))}
                  </select>
                </div>

                {compareSign && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                        <span>{HoroscopeService.getZodiacSymbol(selectedSign)}</span>
                        {HoroscopeService.getZodiacDisplayName(selectedSign)}
                      </h4>
                      <div className="bg-white/5 rounded-lg p-4">
                        <p className="text-white/70 text-sm">
                          Compare horoscopes to see how cosmic energies align between different zodiac signs.
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                        <span>{HoroscopeService.getZodiacSymbol(compareSign)}</span>
                        {HoroscopeService.getZodiacDisplayName(compareSign)}
                      </h4>
                      <div className="bg-white/5 rounded-lg p-4">
                        <p className="text-white/70 text-sm">
                          Understanding astrological compatibility can help improve relationships and communication.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </CosmicBackground>
  );
};

export default HoroscopePage;
