import React, { useState } from 'react';
import toast from 'react-hot-toast';
import Sidebar from './Sidebar';
import { CosmicBackground } from './CosmicBackground';
import { GlassCard, GradientText, LoadingSpinner } from './CosmicUI';
import { Hand, Coffee, User, ChevronLeft, Sparkles, Calendar, Eye, Heart, Brain, Star, Target, Zap } from 'lucide-react';
import { getReadingHistory } from '../api/client';

interface Reading {
  _id: string;
  reading_type: 'palm' | 'coffee' | 'face';
  image_data?: string;
  mime_type?: string;
  result: any;
  created_at: string;
}

type ReadingType = 'palm' | 'coffee' | 'face';

const PreviousReadingsPage: React.FC = () => {
  const [selectedType, setSelectedType] = useState<ReadingType | null>(null);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReading, setSelectedReading] = useState<Reading | null>(null);

  const readingTypes = [
    {
      id: 'palm' as ReadingType,
      name: 'Palm Readings',
      icon: <Hand className="w-8 h-8" />,
      color: 'from-amber-500 to-orange-500',
      description: 'View your past palm line analyses'
    },
    {
      id: 'coffee' as ReadingType,
      name: 'Coffee Readings',
      icon: <Coffee className="w-8 h-8" />,
      color: 'from-amber-700 to-amber-900',
      description: 'View your past coffee cup fortune readings'
    },
    {
      id: 'face' as ReadingType,
      name: 'Face Readings',
      icon: <User className="w-8 h-8" />,
      color: 'from-rose-500 to-pink-500',
      description: 'View your past face physiognomy analyses'
    }
  ];

  const loadReadings = async (type: ReadingType) => {
    setLoading(true);
    try {
      const response = await getReadingHistory(type);
      if (response.success) {
        setReadings(response.data);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load readings');
    } finally {
      setLoading(false);
    }
  };

  const handleTypeSelect = (type: ReadingType) => {
    setSelectedType(type);
    setSelectedReading(null);
    loadReadings(type);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStarRating = (value: number, max = 5) => {
    return (
      <div className="flex gap-1">
        {[...Array(max)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < value ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}`}
          />
        ))}
      </div>
    );
  };

  const renderReadingDetails = () => {
    if (!selectedReading) return null;

    const result = selectedReading.result;
    const hasImage = selectedReading.image_data;

    return (
      <GlassCard className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedReading(null)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-fuchsia-400" />
                Reading Details
              </h2>
              <p className="text-white/60 text-sm flex items-center gap-2 mt-1">
                <Calendar className="w-4 h-4" />
                {formatDate(selectedReading.created_at)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image Section */}
          {hasImage && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-fuchsia-400" />
                Your Photo
              </h3>
              <div className="relative rounded-xl overflow-hidden border-2 border-white/20 shadow-lg">
                <img
                  src={`data:${selectedReading.mime_type || 'image/jpeg'};base64,${selectedReading.image_data}`}
                  alt="Reading"
                  className="w-full h-auto max-h-96 object-contain bg-black/50"
                />
              </div>
            </div>
          )}

          {/* Results Section */}
          <div className="space-y-4">
            {selectedReading.reading_type === 'face' && (
              <>
                <div className="p-4 bg-gradient-to-r from-fuchsia-600/20 to-violet-600/20 rounded-xl border border-fuchsia-500/30">
                  <h4 className="text-lg font-bold text-white mb-2">{result.face_shape} Face</h4>
                  <p className="text-white/80">{result.overall_aura}</p>
                  <span className="inline-block mt-2 px-3 py-1 bg-white/10 rounded-full text-sm text-fuchsia-300">
                    Element: {result.element_type}
                  </span>
                </div>

                {result.personality_scores && (
                  <div className="p-4 bg-white/5 rounded-xl">
                    <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <Brain className="w-5 h-5 text-violet-400" />
                      Personality Profile
                    </h4>
                    <div className="space-y-3">
                      {Object.entries(result.personality_scores).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-white/70 capitalize">{key}</span>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">{renderStarRating(Number(value))}</div>
                            <span className="text-white font-medium w-8 text-right">{Number(value)}/5</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white/5 rounded-lg">
                    <p className="text-white/60 text-sm">Dominant Strength</p>
                    <p className="text-fuchsia-400 font-medium">{result.dominant_strength}</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg">
                    <p className="text-white/60 text-sm">Hidden Trait</p>
                    <p className="text-violet-400 font-medium">{result.hidden_trait}</p>
                  </div>
                </div>
              </>
            )}

            {selectedReading.reading_type === 'palm' && (
              <>
                <div className="p-4 bg-gradient-to-r from-amber-600/20 to-orange-600/20 rounded-xl border border-amber-500/30">
                  <h4 className="text-lg font-bold text-white mb-2">{result.hand_type} Hand</h4>
                  <p className="text-white/80">{result.overall_summary}</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-green-500/10 rounded-xl text-center border border-green-500/30">
                    <Heart className="w-5 h-5 text-green-400 mx-auto mb-1" />
                    <p className="text-xs text-white/60">Vitality</p>
                    <p className="text-xl font-bold text-green-400">{result.vitality_score}/5</p>
                  </div>
                  <div className="p-3 bg-rose-500/10 rounded-xl text-center border border-rose-500/30">
                    <Heart className="w-5 h-5 text-rose-400 mx-auto mb-1" />
                    <p className="text-xs text-white/60">Love</p>
                    <p className="text-xl font-bold text-rose-400">{result.love_score}/5</p>
                  </div>
                  <div className="p-3 bg-blue-500/10 rounded-xl text-center border border-blue-500/30">
                    <Target className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                    <p className="text-xs text-white/60">Career</p>
                    <p className="text-xl font-bold text-blue-400">{result.career_score}/5</p>
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-xl">
                  <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    Key Prediction
                  </h4>
                  <p className="text-fuchsia-400 font-medium">{result.key_prediction}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white/5 rounded-lg">
                    <p className="text-white/60 text-sm">Lucky Color</p>
                    <p className="text-white font-medium">{result.lucky_color}</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg">
                    <p className="text-white/60 text-sm">Lucky Number</p>
                    <p className="text-white font-medium">{result.lucky_number}</p>
                  </div>
                </div>
              </>
            )}

            {selectedReading.reading_type === 'coffee' && (
              <>
                <div className="p-4 bg-gradient-to-r from-amber-700/20 to-amber-900/20 rounded-xl border border-amber-600/30">
                  <h4 className="text-lg font-bold text-white mb-2">Cup Reading</h4>
                  <p className="text-white/80">{result.cup_overview}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-rose-500/10 rounded-lg border border-rose-500/20">
                    <Heart className="w-5 h-5 text-rose-400 mb-1" />
                    <p className="text-white/60 text-xs">Love</p>
                    <p className="text-white text-sm">{result.love_fortune}</p>
                  </div>
                  <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <Target className="w-5 h-5 text-blue-400 mb-1" />
                    <p className="text-white/60 text-xs">Career</p>
                    <p className="text-white text-sm">{result.career_fortune}</p>
                  </div>
                  <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <Zap className="w-5 h-5 text-green-400 mb-1" />
                    <p className="text-white/60 text-xs">Health</p>
                    <p className="text-white text-sm">{result.health_fortune}</p>
                  </div>
                  <div className="p-3 bg-violet-500/10 rounded-lg border border-violet-500/20">
                    <Sparkles className="w-5 h-5 text-violet-400 mb-1" />
                    <p className="text-white/60 text-xs">Travel</p>
                    <p className="text-white text-sm">{result.travel_fortune}</p>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-fuchsia-600/20 to-violet-600/20 rounded-xl border border-fuchsia-500/30">
                  <h4 className="text-white font-semibold mb-2">Overall Fortune</h4>
                  <p className="text-fuchsia-300">{result.overall_fortune}</p>
                  {result.lucky_number && (
                    <p className="text-white/60 text-sm mt-2">Lucky Number: {result.lucky_number}</p>
                  )}
                </div>

                {result.warning && (
                  <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                    <p className="text-red-400 text-sm font-medium">⚠️ {result.warning}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </GlassCard>
    );
  };

  return (
    <CosmicBackground>
      <div className="flex min-h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 lg:ml-64 transition-all duration-300 h-screen flex flex-col" id="main-content">
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8 lg:py-16">
              <h1 className="text-3xl md:text-4xl font-bold font-display">Previous Readings</h1>
              <p className="mt-2 text-white/75 max-w-2xl">
                View your past readings and fortunes
              </p>

              {!selectedType ? (
                /* Type Selection Cards */
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  {readingTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => handleTypeSelect(type.id)}
                      className="group"
                    >
                      <GlassCard className="p-8 h-full text-center transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] border-white/10 hover:border-fuchsia-500/50">
                        <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${type.color} rounded-full mb-4 text-white shadow-lg group-hover:shadow-xl transition-shadow`}>
                          {type.icon}
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">{type.name}</h3>
                        <p className="text-white/60 text-sm">{type.description}</p>
                        <div className="mt-4 flex items-center justify-center gap-2 text-fuchsia-400 text-sm font-medium">
                          <Sparkles className="w-4 h-4" />
                          View History
                        </div>
                      </GlassCard>
                    </button>
                  ))}
                </div>
              ) : (
                /* Reading List or Details */
                <div className="mt-8">
                  {!selectedReading && (
                    <button
                      onClick={() => {
                        setSelectedType(null);
                        setReadings([]);
                      }}
                      className="mb-6 flex items-center gap-2 text-white/60 hover:text-white transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                      Back to categories
                    </button>
                  )}

                  {selectedReading ? (
                    renderReadingDetails()
                  ) : (
                    <>
                      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        {readingTypes.find(t => t.id === selectedType)?.icon}
                        {readingTypes.find(t => t.id === selectedType)?.name}
                      </h2>

                      {loading ? (
                        <div className="flex justify-center py-12">
                          <LoadingSpinner size="lg" />
                        </div>
                      ) : readings.length === 0 ? (
                        <GlassCard className="p-12 text-center">
                          <Sparkles className="w-16 h-16 text-white/20 mx-auto mb-4" />
                          <p className="text-white/60 text-lg">No previous readings found</p>
                          <p className="text-white/40 text-sm mt-2">
                            Try generating a new {selectedType} reading!
                          </p>
                        </GlassCard>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {readings.map((reading) => (
                            <button
                              key={reading._id}
                              onClick={() => setSelectedReading(reading)}
                              className="text-left"
                            >
                              <GlassCard className="p-4 transition-all hover:scale-105 hover:border-fuchsia-500/50 overflow-hidden">
                                {reading.image_data ? (
                                  <div className="relative h-40 mb-4 rounded-lg overflow-hidden">
                                    <img
                                      src={`data:${reading.mime_type || 'image/jpeg'};base64,${reading.image_data}`}
                                      alt="Reading thumbnail"
                                      className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <div className="absolute bottom-2 left-2 right-2">
                                      <p className="text-white font-medium text-sm truncate">
                                        {readingTypes.find(t => t.id === selectedType)?.name}
                                      </p>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="h-40 mb-4 rounded-lg bg-white/5 flex items-center justify-center">
                                    {readingTypes.find(t => t.id === selectedType)?.icon}
                                  </div>
                                )}
                                <p className="text-white/60 text-sm flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  {formatDate(reading.created_at)}
                                </p>
                                <div className="mt-3 text-fuchsia-400 text-sm font-medium">
                                  Click to view details →
                                </div>
                              </GlassCard>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </CosmicBackground>
  );
};

export default PreviousReadingsPage;

