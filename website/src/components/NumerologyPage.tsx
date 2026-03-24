import React, { useState, useEffect } from 'react';
import { getProfessionalSymbol } from '../utils/professionalSymbols';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client';
import AppNavbar from './AppNavbar';
import toast from 'react-hot-toast';
import { CosmicBackground } from './CosmicBackground';
import { GlassCard, GradientText, LoadingSpinner } from './CosmicUI';

interface NumerologyData {
  life_path: string;
  destiny: string;
  personal_year: string;
}

const NumerologyPage: React.FC = () => {
  const navigate = useNavigate();
  const [numerology, setNumerology] = useState<NumerologyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNumerology = async () => {
      try {
        console.log('Fetching numerology data...');
        const response = await apiFetch('/api/numerology');
        console.log('Numerology API response:', response);
        
        if (response.success && response.numerology) {
          console.log('Setting numerology data:', response.numerology);
          setNumerology(response.numerology);
          setError(null);
        } else if (response.success && !response.numerology) {
          console.log('No numerology data available');
          setNumerology(null);
          setError(null);
        } else {
          console.log('API returned error:', response.message);
          setError(response.message || 'Failed to load numerology data');
        }
      } catch (err: any) {
        console.error('Error fetching numerology:', err);
        setError(err.message || 'Failed to fetch numerology data');
        toast.error('Failed to load numerology insights');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNumerology();
  }, []);

  const handleGettingStarted = () => {
    navigate('/onboarding/step-1');
  };

  const handleRetry = () => {
    window.location.reload();
  };

  // Helper functions for detailed number analysis
  const getLifePathStrength = (lifePath: string) => {
    const strengths: { [key: string]: string } = {
      '1': 'Natural leadership and independence',
      '2': 'Diplomacy and cooperation skills',
      '3': 'Creativity and self-expression',
      '4': 'Organization and practical skills',
      '5': 'Adaptability and freedom-loving nature',
      '6': 'Nurturing and responsibility',
      '7': 'Analytical and spiritual wisdom',
      '8': 'Ambition and material success',
      '9': 'Compassion and humanitarian spirit',
      '11': 'Intuitive and spiritual insight',
      '22': 'Visionary and manifesting abilities',
      '33': 'Healing and teaching gifts'
    };
    return strengths[lifePath] || 'Unique personal strengths';
  };

  const getLifePathChallenge = (lifePath: string) => {
    const challenges: { [key: string]: string } = {
      '1': 'Overcoming ego and learning cooperation',
      '2': 'Building self-confidence and setting boundaries',
      '3': 'Focusing energy and avoiding scattered interests',
      '4': 'Embracing change and avoiding rigidity',
      '5': 'Commitment and avoiding restlessness',
      '6': 'Self-care and avoiding over-responsibility',
      '7': 'Connecting with others and avoiding isolation',
      '8': 'Balancing material and spiritual concerns',
      '9': 'Learning to let go and forgive',
      '11': 'Managing anxiety and trusting intuition',
      '22': 'Avoiding overwhelm and staying practical',
      '33': 'Setting boundaries and avoiding martyrdom'
    };
    return challenges[lifePath] || 'Personal growth opportunities';
  };

  const getLifePathCareer = (lifePath: string) => {
    const careers: { [key: string]: string } = {
      '1': 'Leadership roles, entrepreneurship, management',
      '2': 'Counseling, diplomacy, mediation, arts',
      '3': 'Creative fields, communication, entertainment',
      '4': 'Building, engineering, administration, finance',
      '5': 'Travel, sales, marketing, public relations',
      '6': 'Teaching, healthcare, social work, service',
      '7': 'Research, spirituality, analysis, writing',
      '8': 'Business, finance, management, law',
      '9': 'Humanitarian work, arts, philosophy, healing',
      '11': 'Spiritual teaching, healing, intuitive work',
      '22': 'Large-scale projects, architecture, systems',
      '33': 'Teaching, healing, creative arts, leadership'
    };
    return careers[lifePath] || 'Fields utilizing your unique talents';
  };

  const getDestinyPurpose = (destiny: string) => {
    const purposes: { [key: string]: string } = {
      '1': 'To pioneer and lead new initiatives',
      '2': 'To bring harmony and cooperation',
      '3': 'To inspire and uplift others',
      '4': 'To build solid foundations',
      '5': 'To bring freedom and change',
      '6': 'To nurture and serve humanity',
      '7': 'To seek truth and wisdom',
      '8': 'To achieve material and spiritual success',
      '9': 'To complete humanitarian service',
      '11': 'To illuminate spiritual truths',
      '22': 'To build lasting structures',
      '33': 'To teach and heal humanity'
    };
    return purposes[destiny] || 'To fulfill your unique potential';
  };

  const getDestinyTalent = (destiny: string) => {
    const talents: { [key: string]: string } = {
      '1': 'Innovation and leadership abilities',
      '2': 'Diplomacy and peacemaking skills',
      '3': 'Communication and creative expression',
      '4': 'Organization and building capabilities',
      '5': 'Versatility and adaptability',
      '6': 'Teaching and nurturing gifts',
      '7': 'Analysis and spiritual insight',
      '8': 'Management and resource development',
      '9': 'Compassion and creative vision',
      '11': 'Intuition and spiritual guidance',
      '22': 'Visionary thinking and practical application',
      '33': 'Healing and inspirational teaching'
    };
    return talents[destiny] || 'Unique natural abilities';
  };

  const getDestinyLegacy = (destiny: string) => {
    const legacies: { [key: string]: string } = {
      '1': 'A legacy of pioneering and leadership',
      '2': 'A legacy of peace and cooperation',
      '3': 'A legacy of inspiration and creativity',
      '4': 'A legacy of stability and achievement',
      '5': 'A legacy of freedom and adventure',
      '6': 'A legacy of service and compassion',
      '7': 'A legacy of wisdom and truth',
      '8': 'A legacy of success and abundance',
      '9': 'A legacy of humanitarian service',
      '11': 'A legacy of spiritual enlightenment',
      '22': 'A legacy of lasting achievements',
      '33': 'A legacy of healing and teaching'
    };
    return legacies[destiny] || 'A meaningful and lasting impact';
  };

  const getPersonalYearTheme = (personalYear: string) => {
    const themes: { [key: string]: string } = {
      '1': 'New beginnings and independence',
      '2': 'Partnerships and cooperation',
      '3': 'Creativity and self-expression',
      '4': 'Hard work and foundation building',
      '5': 'Change and freedom',
      '6': 'Responsibility and harmony',
      '7': 'Spirituality and introspection',
      '8': 'Success and material achievement',
      '9': 'Completion and humanitarian service',
      '11': 'Spiritual awakening and intuition',
      '22': 'Master building and achievement',
      '33': 'Universal love and service'
    };
    return themes[personalYear] || 'Personal growth and development';
  };

  const getPersonalYearFocus = (personalYear: string) => {
    const focuses: { [key: string]: string } = {
      '1': 'Starting new projects and asserting independence',
      '2': 'Building relationships and partnerships',
      '3': 'Creative expression and social activities',
      '4': 'Discipline and practical achievements',
      '5': 'Adventure and personal freedom',
      '6': 'Family, home, and community service',
      '7': 'Spiritual study and inner work',
      '8': 'Career advancement and financial growth',
      '9': 'Completion and letting go',
      '11': 'Developing intuition and spiritual gifts',
      '22': 'Major achievements and recognition',
      '33': 'Teaching, healing, and service'
    };
    return focuses[personalYear] || 'Personal development goals';
  };

  const getPersonalYearAdvice = (personalYear: string) => {
    const advice: { [key: string]: string } = {
      '1': 'Take initiative and be bold in your decisions',
      '2': 'Practice patience and seek cooperation',
      '3': 'Express yourself creatively and socially',
      '4': 'Stay disciplined and focus on long-term goals',
      '5': 'Embrace change and avoid routine',
      '6': 'Balance responsibility with self-care',
      '7': 'Trust your intuition and seek wisdom',
      '8': 'Be confident and pursue success',
      '9': 'Practice forgiveness and serve others',
      '11': 'Pay attention to dreams and inner guidance',
      '22': 'Think big but stay practical',
      '33': 'Focus on healing and uplifting others'
    };
    return advice[personalYear] || 'Stay true to your authentic self';
  };

  return (
    <CosmicBackground>
      <AppNavbar />

      <div className="pt-16"> {/* Add padding for sticky navbar */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl md:text-4xl font-bold font-display">Numerology</h1>
        <p className="mt-2 text-white/75 max-w-2xl">
          Discover the ancient wisdom of numbers and how they reveal your life's purpose, personality, and destiny.
        </p>

        {/* What is Numerology Section */}
        <div className="mt-12 bg-white/5 border border-white/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">What is Numerology?</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <p className="text-white/70 leading-relaxed mb-4">
                <strong>Numerology</strong> is an ancient mystical science that studies the hidden meaning of numbers and their influence on human life. It's based on the belief that numbers are not just mathematical quantities, but carry specific vibrations and energies that shape our destiny.
              </p>
              <p className="text-white/70 leading-relaxed mb-4">
                This sacred science has been practiced for thousands of years across various civilizations, including ancient Egypt, Greece, China, and India. Each number from 1 to 9 (along with master numbers 11, 22, and 33) carries unique characteristics and energies.
              </p>
              <p className="text-white/70 leading-relaxed">
                Through numerology, we can uncover our life's purpose, understand our personality traits, predict future trends, and make better life decisions by aligning with our numerical vibrations.
              </p>
            </div>
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-400/30 rounded-xl p-4">
                <h3 className="text-violet-300 font-semibold mb-2">{getProfessionalSymbol('🌟')} Core Principle</h3>
                <p className="text-white/60 text-sm">Everything in the universe vibrates at specific frequencies, and numbers are the language of these vibrations.</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/30 rounded-xl p-4">
                <h3 className="text-purple-300 font-semibold mb-2">{getProfessionalSymbol('📊')} Mathematical Foundation</h3>
                <p className="text-white/60 text-sm">Your birth date and name are reduced to single digits (except master numbers) to reveal your core numbers.</p>
              </div>
              <div className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-400/30 rounded-xl p-4">
                <h3 className="text-pink-300 font-semibold mb-2">{getProfessionalSymbol('🎯')} Life Application</h3>
                <p className="text-white/60 text-sm">Use your numbers to understand relationships, career paths, timing, and personal growth opportunities.</p>
              </div>
            </div>
          </div>
        </div>

        {/* History and Origins Section */}
        <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">The History of Numerology</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-amber-400 text-2xl">🔺</span>
              </div>
              <h3 className="text-amber-300 font-semibold mb-2">Ancient Egypt</h3>
              <p className="text-white/60 text-sm">Egyptian priests used numerology to understand divine messages and predict future events.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-400 text-2xl">{getProfessionalSymbol('🏛️')}</span>
              </div>
              <h3 className="text-blue-300 font-semibold mb-2">Greek Philosophy</h3>
              <p className="text-white/60 text-sm">Pythagoras, the "Father of Mathematics," developed the modern system of numerology we use today.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-emerald-400 text-2xl">{getProfessionalSymbol('🕉️')}</span>
              </div>
              <h3 className="text-emerald-300 font-semibold mb-2">Eastern Wisdom</h3>
              <p className="text-white/60 text-sm">Chinese numerology and Indian Vedic traditions have long recognized the power of numbers in daily life.</p>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">How Numerology Works</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">The Calculation Process</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-violet-400/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-violet-400 text-xs">1</span>
                  </div>
                  <div>
                    <h4 className="text-white/80 font-medium">Birth Date Analysis</h4>
                    <p className="text-white/60 text-sm">Your date of birth is reduced to single digits to reveal your Life Path Number and Personal Year.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-400/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-purple-400 text-xs">2</span>
                  </div>
                  <div>
                    <h4 className="text-white/80 font-medium">Name Numerology</h4>
                    <p className="text-white/60 text-sm">Each letter in your name corresponds to a number, revealing your Destiny Number and personality traits.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-pink-400/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-pink-400 text-xs">3</span>
                  </div>
                  <div>
                    <h4 className="text-white/80 font-medium">Master Numbers</h4>
                    <p className="text-white/60 text-sm">Numbers 11, 22, and 33 are not reduced and carry special spiritual significance and potential.</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Number Meanings</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { num: '1', meaning: 'Leadership', color: 'text-red-400' },
                  { num: '2', meaning: 'Cooperation', color: 'text-orange-400' },
                  { num: '3', meaning: 'Creativity', color: 'text-yellow-400' },
                  { num: '4', meaning: 'Stability', color: 'text-green-400' },
                  { num: '5', meaning: 'Freedom', color: 'text-blue-400' },
                  { num: '6', meaning: 'Harmony', color: 'text-indigo-400' },
                  { num: '7', meaning: 'Spirituality', color: 'text-purple-400' },
                  { num: '8', meaning: 'Success', color: 'text-pink-400' },
                  { num: '9', meaning: 'Humanity', color: 'text-rose-400' }
                ].map((item) => (
                  <div key={item.num} className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
                    <div className={`text-2xl font-bold ${item.color} mb-1`}>{item.num}</div>
                    <div className="text-white/60 text-xs">{item.meaning}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
        {isLoading ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-violet-400/20 rounded-full mb-6 animate-pulse">
              <span className="text-violet-400 text-2xl">{getProfessionalSymbol('✨')}</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Loading Your Numerology Insights</h3>
            <p className="text-white/60 max-w-md mx-auto">
              We're retrieving your personalized numerology data...
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-6">
              <span className="text-red-400 text-2xl">{getProfessionalSymbol('⚠️')}</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Unable to Load Insights</h3>
            <p className="text-white/60 mb-8 max-w-md mx-auto">
              {error}
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleRetry}
                className="bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 border border-white/20"
              >
                Try Again
              </button>
              <button
                onClick={handleGettingStarted}
                className="bg-violet-400 hover:bg-violet-300 text-gray-900 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Generate Insights
              </button>
            </div>
          </div>
        ) : numerology ? (
          <div>
            {/* Success Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-6">
                <span className="text-green-400 text-3xl">{getProfessionalSymbol('✨')}</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">Your Personal Numerology Blueprint</h3>
              <p className="text-white/60 max-w-3xl mx-auto text-lg">
                Your unique numbers reveal the cosmic blueprint of your life. Each number carries specific energies and lessons that guide your journey through life.
              </p>
            </div>

            {/* Numerology Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-400/30 p-8 hover:border-violet-400/50 transition-all duration-300 hover:shadow-xl hover:shadow-violet-400/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-violet-300 text-sm font-medium uppercase tracking-wider">Life Path</div>
                  <div className="w-8 h-8 bg-violet-400/20 rounded-full flex items-center justify-center">
                    <span className="text-violet-400 text-sm">{getProfessionalSymbol('🛤️')}</span>
                  </div>
                </div>
                <div className="text-5xl font-bold text-violet-300 mb-3">{numerology.life_path}</div>
                <div className="text-white/70 text-sm leading-relaxed mb-4">
                  <strong>Your Core Journey:</strong> This number represents the path you're destined to walk in this lifetime. It reveals your natural talents, the lessons you're here to learn, and the challenges you'll face.
                </div>
                <div className="text-white/60 text-xs">
                  <p>• Your innate abilities and strengths</p>
                  <p>• Life lessons and challenges</p>
                  <p>• Natural career inclinations</p>
                  <p>• Relationship patterns</p>
                </div>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/30 p-8 hover:border-purple-400/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-400/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-purple-300 text-sm font-medium uppercase tracking-wider">Destiny Number</div>
                  <div className="w-8 h-8 bg-purple-400/20 rounded-full flex items-center justify-center">
                    <span className="text-purple-400 text-sm">{getProfessionalSymbol('🎯')}</span>
                  </div>
                </div>
                <div className="text-5xl font-bold text-purple-300 mb-3">{numerology.destiny}</div>
                <div className="text-white/70 text-sm leading-relaxed mb-4">
                  <strong>Your Ultimate Purpose:</strong> Also known as the Expression Number, this reveals your life's purpose, your mission, and the opportunities that will come your way to fulfill your potential.
                </div>
                <div className="text-white/60 text-xs">
                  <p>• Your life's mission and purpose</p>
                  <p>• Career and success potential</p>
                  <p>• How others perceive you</p>
                  <p>• Your unique contribution to the world</p>
                </div>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-400/30 p-8 hover:border-pink-400/50 transition-all duration-300 hover:shadow-xl hover:shadow-pink-400/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-pink-300 text-sm font-medium uppercase tracking-wider">Personal Year</div>
                  <div className="w-8 h-8 bg-pink-400/20 rounded-full flex items-center justify-center">
                    <span className="text-pink-400 text-sm">📅</span>
                  </div>
                </div>
                <div className="text-5xl font-bold text-pink-300 mb-3">{numerology.personal_year}</div>
                <div className="text-white/70 text-sm leading-relaxed mb-4">
                  <strong>Current Year Energy:</strong> This number changes yearly and shows the themes, opportunities, and challenges you'll experience during this specific year cycle.
                </div>
                <div className="text-white/60 text-xs">
                  <p>• Best timing for important decisions</p>
                  <p>• Current year's main themes</p>
                  <p>• Opportunities to watch for</p>
                  <p>• Areas requiring focus</p>
                </div>
              </div>
            </div>

            {/* Detailed Number Analysis */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8">
              <h4 className="text-2xl font-semibold text-white mb-6">Understanding Your Numbers in Depth</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-violet-500/5 to-purple-500/5 border border-violet-400/20 rounded-xl p-6">
                  <h5 className="text-violet-300 font-bold text-lg mb-3">Life Path {numerology.life_path}</h5>
                  <p className="text-white/70 text-sm leading-relaxed mb-3">
                    Your Life Path Number {numerology.life_path} is the most important number in your numerology chart. It represents the journey your soul chose for this lifetime.
                  </p>
                  <div className="space-y-2">
                    <p className="text-white/60 text-xs">
                      <strong>Strength:</strong> {getLifePathStrength(numerology.life_path)}
                    </p>
                    <p className="text-white/60 text-xs">
                      <strong>Challenge:</strong> {getLifePathChallenge(numerology.life_path)}
                    </p>
                    <p className="text-white/60 text-xs">
                      <strong>Best Career:</strong> {getLifePathCareer(numerology.life_path)}
                    </p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 border border-purple-400/20 rounded-xl p-6">
                  <h5 className="text-purple-300 font-bold text-lg mb-3">Destiny {numerology.destiny}</h5>
                  <p className="text-white/70 text-sm leading-relaxed mb-3">
                    Your Destiny Number {numerology.destiny} reveals your ultimate purpose and the unique gifts you bring to the world.
                  </p>
                  <div className="space-y-2">
                    <p className="text-white/60 text-xs">
                      <strong>Purpose:</strong> {getDestinyPurpose(numerology.destiny)}
                    </p>
                    <p className="text-white/60 text-xs">
                      <strong>Talent:</strong> {getDestinyTalent(numerology.destiny)}
                    </p>
                    <p className="text-white/60 text-xs">
                      <strong>Legacy:</strong> {getDestinyLegacy(numerology.destiny)}
                    </p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-pink-500/5 to-rose-500/5 border border-pink-400/20 rounded-xl p-6">
                  <h5 className="text-pink-300 font-bold text-lg mb-3">Personal Year {numerology.personal_year}</h5>
                  <p className="text-white/70 text-sm leading-relaxed mb-3">
                    Your Personal Year {numerology.personal_year} energy influences your experiences and opportunities this year.
                  </p>
                  <div className="space-y-2">
                    <p className="text-white/60 text-xs">
                      <strong>Theme:</strong> {getPersonalYearTheme(numerology.personal_year)}
                    </p>
                    <p className="text-white/60 text-xs">
                      <strong>Focus:</strong> {getPersonalYearFocus(numerology.personal_year)}
                    </p>
                    <p className="text-white/60 text-xs">
                      <strong>Advice:</strong> {getPersonalYearAdvice(numerology.personal_year)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Practical Applications */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8">
              <h4 className="text-2xl font-semibold text-white mb-6">How to Apply Your Numbers</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h5 className="text-xl font-medium text-white mb-4">{getProfessionalSymbol('🎯')} Career & Success</h5>
                  <p className="text-white/70 text-sm leading-relaxed mb-3">
                    Use your Life Path {numerology.life_path} to choose a career that aligns with your natural abilities. Your Destiny {numerology.destiny} shows your ultimate potential for success.
                  </p>
                  <ul className="text-white/60 text-sm space-y-1">
                    <li>• Choose careers that match your Life Path vibration</li>
                    <li>• Time important decisions using your Personal Year</li>
                    <li>• Develop skills that support your Destiny</li>
                  </ul>
                </div>
                <div>
                  <h5 className="text-xl font-medium text-white mb-4">💝 Relationships & Love</h5>
                  <p className="text-white/70 text-sm leading-relaxed mb-3">
                    Understanding your numbers helps you choose compatible partners and navigate relationship challenges using your innate strengths.
                  </p>
                  <ul className="text-white/60 text-sm space-y-1">
                    <li>• Find partners with compatible Life Paths</li>
                    <li>• Use your Personal Year for relationship timing</li>
                    <li>• Honor your Destiny in relationship choices</li>
                  </ul>
                </div>
                <div>
                  <h5 className="text-xl font-medium text-white mb-4">🧘 Personal Growth</h5>
                  <p className="text-white/70 text-sm leading-relaxed mb-3">
                    Your numbers reveal your spiritual journey and the lessons you're here to master for personal evolution and fulfillment.
                  </p>
                  <ul className="text-white/60 text-sm space-y-1">
                    <li>• Focus on Life Path challenges for growth</li>
                    <li>• Develop your Destiny talents</li>
                    <li>• Flow with Personal Year energies</li>
                  </ul>
                </div>
                <div>
                  <h5 className="text-xl font-medium text-white mb-4">⏰ Timing & Planning</h5>
                  <p className="text-white/70 text-sm leading-relaxed mb-3">
                    Your Personal Year {numerology.personal_year} helps you understand the best timing for major life decisions and initiatives.
                  </p>
                  <ul className="text-white/60 text-sm space-y-1">
                    <li>• Start projects in favorable Personal Years</li>
                    <li>• Use challenging years for introspection</li>
                    <li>• Align major moves with your numbers</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Master Numbers Special Section */}
            {(numerology.life_path === '11' || numerology.life_path === '22' || numerology.life_path === '33' ||
              numerology.destiny === '11' || numerology.destiny === '22' || numerology.destiny === '33') && (
              <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-400/30 rounded-2xl p-8 mb-8">
                <h4 className="text-2xl font-semibold text-amber-300 mb-4">{getProfessionalSymbol('🌟')} Master Number Alert!</h4>
                <p className="text-white/70 leading-relaxed mb-4">
                  You have one or more Master Numbers in your chart! Master Numbers (11, 22, 33) carry higher spiritual potential and greater challenges. They indicate you're here to make a significant impact on the world.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/5 border border-amber-400/20 rounded-xl p-4">
                    <h5 className="text-amber-300 font-bold mb-2">Master Number 11</h5>
                    <p className="text-white/60 text-sm">The Illuminator - Spiritual messenger with intuitive gifts and healing abilities.</p>
                  </div>
                  <div className="bg-white/5 border border-amber-400/20 rounded-xl p-4">
                    <h5 className="text-amber-300 font-bold mb-2">Master Number 22</h5>
                    <p className="text-white/60 text-sm">The Master Builder - Visionary who can manifest dreams into reality on a large scale.</p>
                  </div>
                  <div className="bg-white/5 border border-amber-400/20 rounded-xl p-4">
                    <h5 className="text-amber-300 font-bold mb-2">Master Number 33</h5>
                    <p className="text-white/60 text-sm">The Master Teacher - Nurturer with profound healing and teaching abilities.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Next Steps */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-400/20 to-purple-400/20 rounded-full mb-6">
                <span className="text-violet-400 text-2xl">🔮</span>
              </div>
              <h4 className="text-2xl font-bold text-white mb-4">Continue Your Journey</h4>
              <p className="text-white/60 max-w-2xl mx-auto mb-6">
                Your numerology insights are just the beginning. Explore your birth chart to discover how the stars and numbers work together to create your unique cosmic blueprint.
              </p>
              <button
                onClick={() => navigate('/birth-chart')}
                className="bg-gradient-to-r from-violet-400 to-purple-400 hover:from-violet-300 hover:to-purple-300 text-gray-900 font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                Explore Birth Chart
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-violet-400/20 rounded-full mb-8">
              <span className="text-violet-400 text-3xl">🔮</span>
            </div>
            <h3 className="text-2xl font-semibold text-white mb-4">Generate Your Insights to Unlock Numerology</h3>
            <p className="text-white/60 mb-8 max-w-lg mx-auto text-lg">
              Complete your profile to discover your life path, destiny number, and personal year insights. Your personalized numerology reading awaits.
            </p>
            <button
              onClick={handleGettingStarted}
              className="bg-violet-400 hover:bg-violet-300 text-gray-900 font-semibold py-4 px-8 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              Generate Insights
            </button>
          </div>
        )}
        </div> {/* Close conditional content container */}
      </div> {/* Close main content container */}
      </div> {/* Close padding container */}
    </CosmicBackground>
  );
};

export default NumerologyPage;
