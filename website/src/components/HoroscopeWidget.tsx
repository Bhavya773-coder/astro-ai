import React, { useState, useEffect } from 'react';
import { HoroscopeService, HoroscopeData } from '../services/horoscopeService';
import { GlassCard, GradientText, LoadingSpinner } from './CosmicUI';

interface HoroscopeWidgetProps {
  zodiacSign?: string;
  birthDate?: string;
  className?: string;
}

type HoroscopeType = 'daily' | 'weekly' | 'monthly';

const HoroscopeWidget: React.FC<HoroscopeWidgetProps> = ({ 
  zodiacSign, 
  birthDate, 
  className = '' 
}) => {
  const [horoscopeType, setHoroscopeType] = useState<HoroscopeType>('daily');
  const [horoscope, setHoroscope] = useState<HoroscopeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get zodiac sign from props
  const userZodiacSign = React.useMemo(() => {
    if (zodiacSign) return zodiacSign.toLowerCase();
    if (birthDate) return HoroscopeService.getZodiacSignFromDate(birthDate);
    return null;
  }, [zodiacSign, birthDate]);

  useEffect(() => {
    if (userZodiacSign) {
      fetchHoroscope();
    }
  }, [userZodiacSign, horoscopeType]);

  const fetchHoroscope = async () => {
    if (!userZodiacSign) return;

    setLoading(true);
    setError(null);

    try {
      let response;
      switch (horoscopeType) {
        case 'daily':
          response = await HoroscopeService.getDailyHoroscope(userZodiacSign);
          break;
        case 'weekly':
          response = await HoroscopeService.getWeeklyHoroscope(userZodiacSign);
          break;
        case 'monthly':
          response = await HoroscopeService.getMonthlyHoroscope(userZodiacSign);
          break;
        default:
          response = await HoroscopeService.getDailyHoroscope(userZodiacSign);
      }

      if (response.success && response.data) {
        setHoroscope(response.data);
      } else {
        setError(response.error || 'Failed to fetch horoscope');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!userZodiacSign) {
    return (
      <GlassCard className={`p-6 ${className}`}>
        <div className="text-center text-white/60">
          <div className="text-4xl mb-3">🔮</div>
          <p>No zodiac sign available</p>
          <p className="text-sm mt-2">Please complete your birth details to see your horoscope</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className={`p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">{HoroscopeService.getZodiacSymbol(userZodiacSign)}</span>
          <div>
            <h3 className="text-xl font-bold text-white">
              {HoroscopeService.getZodiacDisplayName(userZodiacSign)} Horoscope
            </h3>
            <p className="text-white/60 text-sm">
              {horoscopeType === 'daily' && 'Today'}
              {horoscopeType === 'weekly' && 'This Week'}
              {horoscopeType === 'monthly' && 'This Month'}
            </p>
          </div>
        </div>
        
        {/* Type Selector */}
        <div className="flex bg-white/10 rounded-lg p-1">
          {(['daily', 'weekly', 'monthly'] as HoroscopeType[]).map((type) => (
            <button
              key={type}
              onClick={() => setHoroscopeType(type)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                horoscopeType === type
                  ? 'bg-custom-yellow text-gray-900'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[200px]">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-400 text-3xl mb-3">⚠️</div>
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchHoroscope}
              className="px-4 py-2 bg-custom-yellow text-gray-900 rounded-lg font-medium hover:bg-yellow-400 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : horoscope ? (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg p-4 border border-purple-400/20">
              <p className="text-white/90 leading-relaxed text-sm">
                {horoscope.horoscope}
              </p>
            </div>
            
            <div className="flex items-center justify-between text-xs text-white/50">
              <div className="flex items-center space-x-2">
                <span>Source: {horoscope.horoscope.includes('Today is a day for') ? 'Mock Data' : 'Free Horoscope API'}</span>
                {horoscope.horoscope.includes('Today is a day for') && (
                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                    Fallback
                  </span>
                )}
              </div>
              <span>{horoscope.date}</span>
            </div>
          </div>
        ) : null}
      </div>

      {/* Refresh Button */}
      {!loading && !error && (
        <div className="mt-4 text-center">
          <button
            onClick={fetchHoroscope}
            className="text-custom-yellow hover:text-yellow-400 text-sm font-medium transition-colors flex items-center space-x-1 mx-auto"
          >
            <span>🔄</span>
            <span>Refresh</span>
          </button>
        </div>
      )}
    </GlassCard>
  );
};

export default HoroscopeWidget;
