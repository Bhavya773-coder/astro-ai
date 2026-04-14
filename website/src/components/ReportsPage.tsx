import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { reportsApi, KundliReport, BirthChartResponse } from '../api/reports';
import { apiFetch } from '../api/client';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { getProfessionalSymbol } from '../utils/professionalSymbols';
import { generateKundliPDF } from '../utils/kundliPDFGenerator';
import AutoResizeTextarea from './AutoResizeTextarea';
import { CosmicBackground } from './CosmicBackground';
import {
  Sparkles, User, Calendar, Clock, MapPin, Star, Moon, Sun, Hash,
  Brain, Zap, Target, Briefcase, Heart, Activity, Compass, Download,
  ChevronRight, BarChart2, Home
} from 'lucide-react';

const ReportsPage: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingBirthChart, setIsLoadingBirthChart] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [kundliReport, setKundliReport] = useState<KundliReport | null>(null);
  const [birthChartData, setBirthChartData] = useState<BirthChartResponse['data'] | null>(null);
  const [questionInput, setQuestionInput] = useState('');
  const navigate = useNavigate();

  // Create a dashboard chat and navigate
  const createDashboardChatAndNavigate = async (message: string) => {
    try {
      const res = await apiFetch('/api/ai-chat/list');
      let dashboardChatNumber = 1;

      if (res?.success && Array.isArray(res?.data)) {
        const dashboardChats = res.data.filter((chat: any) =>
          chat.title?.startsWith('Dashboard Chat')
        );
        dashboardChatNumber = dashboardChats.length + 1;
      }

      const createRes = await apiFetch('/api/ai-chat/create', {
        method: 'POST',
        body: JSON.stringify({ title: `Dashboard Chat ${dashboardChatNumber}` })
      });

      if (createRes?.success && createRes?.data) {
        const newChat = createRes.data;
        navigate(`/ai-chat?chatId=${newChat._id}`, {
          state: { initialMessage: message }
        });
      } else {
        navigate('/ai-chat', { state: { initialMessage: message } });
      }
    } catch (err) {
      console.error('Failed to create dashboard chat:', err);
      navigate('/ai-chat', { state: { initialMessage: message } });
    }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionInput.trim()) return;
    await createDashboardChatAndNavigate(questionInput.trim());
  };

  const handleGenerateKundli = async () => {
    setIsGenerating(true);
    try {
      const response = await reportsApi.generateKundli();
      if (response.success && response.data) {
        setKundliReport(response.data);
        toast.success(`Kundli ${response.source === 'cache' ? 'loaded from cache' : 'generated successfully'}!`);
      } else {
        if (response.redirectToOnboarding) {
          toast.error('Please complete your profile first');
          setTimeout(() => {
            navigate('/onboarding/step-1');
          }, 2000);
        } else {
          toast.error('Failed to generate Kundli');
        }
      }
    } catch (error) {
      console.error('Error generating Kundli:', error);
      toast.error('Failed to generate Kundli. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGetBirthChart = async () => {
    setIsLoadingBirthChart(true);
    try {
      const response = await reportsApi.getBirthChart();
      if (response.success && response.data) {
        setBirthChartData(response.data);
        toast.success(`Birth chart ${response.source === 'database' ? 'loaded from database' : 'generated successfully'}!`);
      } else {
        toast.error(response.message || 'Failed to load birth chart');
      }
    } catch (error) {
      console.error('Error loading birth chart:', error);
      toast.error('Failed to load birth chart. Please try again.');
    } finally {
      setIsLoadingBirthChart(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!kundliReport) {
      toast.error('Please generate a Kundli report first');
      return;
    }

    setIsGeneratingPDF(true);
    try {
      await generateKundliPDF(kundliReport);
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const KundliCard: React.FC<{ title: string; content: string; icon: React.ReactNode }> = ({ title, content, icon }) => (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white/80 shrink-0">{icon}</div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      <p className="text-white/80 leading-relaxed">{content}</p>
    </div>
  );

  return (
    <CosmicBackground>
      <div className="flex min-h-screen overflow-hidden text-white">
        <Sidebar />
        <div className="flex-1 lg:ml-64 transition-all duration-300 h-screen flex flex-col" id="main-content">
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8 lg:py-16">
              <h1 className="text-3xl md:text-4xl font-bold font-display">Reports</h1>
              <p className="mt-2 text-white/75 max-w-2xl">
                Generate compatibility reports and review your saved analyses.
              </p>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Kundli Generation Card */}
                <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
                  <div className="text-white/70 text-sm mb-2 font-medium uppercase tracking-wide">Kundli Report</div>
                  <div className="text-white/90 mb-4">
                    Get your personalized Vedic astrology birth chart analysis
                  </div>
                  <button
                    onClick={handleGenerateKundli}
                    disabled={isGenerating}
                    className="w-full bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Generating your Kundli...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Generate Kundli
                      </>
                    )}
                  </button>
                </div>

                {/* Birth Chart Card
          <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <div className="text-blue-400 text-sm mb-2">Birth Chart</div>
            <div className="text-white/90 mb-4">
              View your accurate birth chart data from database
            </div>
            <button
              onClick={handleGetBirthChart}
              disabled={isLoadingBirthChart}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isLoadingBirthChart ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Loading Birth Chart...
                </>
              ) : (
                <>
                  <span className="text-xl">📊</span>
                  Get Birth Chart
                </>
              )}
            </button>
          </div> */}

                {/* <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <div className="text-violet-200 text-sm">Compatibility Reports</div>
            <div className="mt-2 text-white/75">Coming soon</div>
          </div> */}


              </div>

              {/* Kundli Report Display */}
              {kundliReport && (
                <div className="mt-12">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-center">Your Kundli Report</h2>
                    <button
                      onClick={handleDownloadPDF}
                      disabled={isGeneratingPDF}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200 flex items-center gap-2"
                    >
                      {isGeneratingPDF ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Generating PDF...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Download PDF
                        </>
                      )}
                    </button>
                  </div>

                  {/* Birth Details Section */}
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-4 text-white/90">Birth Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <KundliCard title="Name" content={kundliReport.birth_details.full_name} icon={<User className="w-4 h-4" />} />
                      <KundliCard title="Date of Birth" content={kundliReport.birth_details.date_of_birth} icon={<Calendar className="w-4 h-4" />} />
                      <KundliCard title="Time of Birth" content={kundliReport.birth_details.time_of_birth} icon={<Clock className="w-4 h-4" />} />
                      <KundliCard title="Place of Birth" content={kundliReport.birth_details.place_of_birth} icon={<MapPin className="w-4 h-4" />} />
                    </div>
                  </div>

                  {/* Core Chart Section */}
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-4 text-white/90">Core Chart</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <KundliCard title="Ascendant" content={kundliReport.chart_data.ascendant} icon={<ChevronRight className="w-4 h-4" />} />
                      <KundliCard title="Moon Sign" content={kundliReport.chart_data.moon_sign} icon={<Moon className="w-4 h-4" />} />
                      <KundliCard title="Sun Sign" content={kundliReport.chart_data.sun_sign} icon={<Sun className="w-4 h-4" />} />
                      <KundliCard title="Nakshatra" content={kundliReport.chart_data.nakshatra} icon={<Star className="w-4 h-4" />} />
                    </div>
                  </div>

                  {/* Planets Table */}
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-4 text-white/90">Planetary Positions</h3>
                    <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {Object.entries(kundliReport.chart_data.planets).map(([planet, data]) => (
                          <div key={planet} className="text-center">
                            <div className="text-sm font-semibold text-white capitalize">{planet}</div>
                            <div className="text-white/80">{data.sign}</div>
                            <div className="text-white/60 text-sm">{data.degree}°</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Houses Grid */}
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-4 text-white/90">12 Houses</h3>
                    <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Object.entries(kundliReport.chart_data.houses).map(([house, sign]) => (
                          <div key={house} className="text-center">
                            <div className="text-base font-semibold text-white/90">House {house}</div>
                            <div className="text-white/80">{sign}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Interpretation Cards */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-white/90">AI Interpretation</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <KundliCard title="Personality" content={kundliReport.interpretation.personality} icon={<Brain className="w-4 h-4" />} />
                      <KundliCard title="Strengths" content={kundliReport.interpretation.strengths} icon={<Zap className="w-4 h-4" />} />
                      <KundliCard title="Challenges" content={kundliReport.interpretation.challenges} icon={<Target className="w-4 h-4" />} />
                      <KundliCard title="Career" content={kundliReport.interpretation.career} icon={<Briefcase className="w-4 h-4" />} />
                      <KundliCard title="Relationships" content={kundliReport.interpretation.relationships} icon={<Heart className="w-4 h-4" />} />
                      <KundliCard title="Health" content={kundliReport.interpretation.health} icon={<Activity className="w-4 h-4" />} />
                      <KundliCard title="Spiritual Path" content={kundliReport.interpretation.spiritual_path} icon={<Compass className="w-4 h-4" />} />
                    </div>
                  </div>

                  {/* Important Yogas Section */}
                  {kundliReport.interpretation.important_yogas && kundliReport.interpretation.important_yogas.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-xl font-semibold mb-4 text-white/90">Important Yogas</h3>
                      <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {kundliReport.interpretation.important_yogas.map((yoga, index) => (
                            <div key={index} className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"><Star className="w-4 h-4 text-white/70" /></div>
                              <div>
                                <div className="text-base font-semibold text-white/90">{yoga}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                        {kundliReport.interpretation.important_yogas.length === 0 && (
                          <div className="text-white/60 text-center">No major yogas detected in this chart</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Birth Chart Display */}
              {birthChartData && (
                <div className="mt-12">
                  <h2 className="text-2xl font-bold mb-6 text-center">Your Birth Chart</h2>

                  {/* Birth Details Section */}
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-4 text-blue-400">Birth Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <KundliCard title="Name" content={birthChartData.birth_details.full_name} icon={<User className="w-4 h-4" />} />
                      <KundliCard title="Date of Birth" content={birthChartData.birth_details.date_of_birth} icon={<Calendar className="w-4 h-4" />} />
                      <KundliCard title="Time of Birth" content={birthChartData.birth_details.time_of_birth} icon={<Clock className="w-4 h-4" />} />
                      <KundliCard title="Place of Birth" content={birthChartData.birth_details.place_of_birth} icon={<MapPin className="w-4 h-4" />} />
                    </div>
                  </div>

                  {/* Core Chart Section */}
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-4 text-blue-400">Core Chart</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <KundliCard title="Ascendant" content={birthChartData.chart_data.ascendant} icon={<ChevronRight className="w-4 h-4" />} />
                      <KundliCard title="Moon Sign" content={birthChartData.chart_data.moon_sign} icon={<Moon className="w-4 h-4" />} />
                      <KundliCard title="Sun Sign" content={birthChartData.chart_data.sun_sign} icon={<Sun className="w-4 h-4" />} />
                      <KundliCard title="Nakshatra" content={birthChartData.chart_data.nakshatra} icon={<Star className="w-4 h-4" />} />
                    </div>
                  </div>

                  {/* Planets Table */}
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-4 text-blue-400">Planetary Positions</h3>
                    <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {Object.entries(birthChartData.chart_data.planets).map(([planet, data]) => (
                          <div key={planet} className="text-center">
                            <div className="text-lg font-semibold text-blue-400 capitalize">{planet}</div>
                            <div className="text-white/80">{data.sign}</div>
                            <div className="text-white/60 text-sm">{data.degree}°</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Houses Grid */}
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-4 text-blue-400">12 Houses</h3>
                    <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Object.entries(birthChartData.chart_data.houses).map(([house, sign]) => (
                          <div key={house} className="text-center">
                            <div className="text-lg font-semibold text-blue-400">House {house}</div>
                            <div className="text-white/80">{sign}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* FLOATING CHAT INPUT - ChatGPT Style */}
          <form
            onSubmit={handleAskQuestion}
            className="w-full px-4 py-6 md:py-8"
          >
            <div className="max-w-3xl mx-auto relative flex items-end">
              <AutoResizeTextarea
                value={questionInput}
                onChange={(e) => setQuestionInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (questionInput.trim()) {
                      handleAskQuestion(e as any);
                    }
                  }
                }}
                placeholder="Ask AstroAI about your reports..."
                maxRows={6}
                className="w-full bg-purple-800/90 hover:bg-purple-800 focus:bg-purple-800 backdrop-blur-xl border border-purple-600/50 hover:border-purple-500 focus:border-purple-500 rounded-2xl pl-4 pr-12 py-3.5 md:pl-5 md:pr-14 md:py-4 text-white placeholder-black/60 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all shadow-lg"
              />
              <button
                type="submit"
                disabled={!questionInput.trim()}
                className="absolute right-2 bottom-2 p-2 md:right-3 md:bottom-3 bg-violet-600 hover:bg-violet-500 disabled:bg-white/10 disabled:opacity-40 text-white rounded-xl transition-all disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m-7 7l7-7 7 7" />
                </svg>
              </button>
            </div>
            <p className="text-center text-white/30 text-xs mt-2">AstroAI can make mistakes. Consider checking important information.</p>
          </form>
        </div>
      </div>
    </CosmicBackground>
  );
};

export default ReportsPage;