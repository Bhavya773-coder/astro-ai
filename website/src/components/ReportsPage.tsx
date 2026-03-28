import React, { useState } from 'react';
import AppNavbar from './AppNavbar';
import { reportsApi, KundliReport, BirthChartResponse } from '../api/reports';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { generateKundliPDF } from '../utils/kundliPDFGenerator';

const ReportsPage: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingBirthChart, setIsLoadingBirthChart] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [kundliReport, setKundliReport] = useState<KundliReport | null>(null);
  const [birthChartData, setBirthChartData] = useState<BirthChartResponse['data'] | null>(null);
  const navigate = useNavigate();

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

  const KundliCard: React.FC<{ title: string; content: string; icon: string }> = ({ title, content, icon }) => (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="text-2xl">{icon}</div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      <p className="text-white/80 leading-relaxed">{content}</p>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white">
      <div className="absolute inset-0 opacity-25 pointer-events-none">
        <svg className="h-full w-full" viewBox="0 0 1200 800" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="rep_g1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(520 360) rotate(90) scale(420 640)">
              <stop stopColor="#FDE047" stopOpacity="0.22" />
              <stop offset="1" stopColor="#0B1026" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="rep_g2" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(880 240) rotate(90) scale(260 380)">
              <stop stopColor="#A78BFA" stopOpacity="0.28" />
              <stop offset="1" stopColor="#0B1026" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="1200" height="800" fill="url(#rep_g1)" />
          <rect width="1200" height="800" fill="url(#rep_g2)" />
        </svg>
      </div>

      <AppNavbar />

      <div className="pt-16"> {/* Add padding for sticky navbar */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl md:text-4xl font-bold font-display">Reports</h1>
        <p className="mt-2 text-white/75 max-w-2xl">
          Generate compatibility reports and review your saved analyses.
        </p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Kundli Generation Card */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <div className="text-custom-yellow text-sm mb-2">Kundli Report</div>
            <div className="text-white/90 mb-4">
              Get your personalized Vedic astrology birth chart analysis
            </div>
            <button
              onClick={handleGenerateKundli}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Generating your Kundli...
                </>
              ) : (
                <>
                  <span className="text-xl">🔮</span>
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
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download PDF
                  </>
                )}
              </button>
            </div>
            
            {/* Birth Details Section */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-yellow-400">Birth Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KundliCard
                  title="Name"
                  content={kundliReport.birth_details.full_name}
                  icon="👤"
                />
                <KundliCard
                  title="Date of Birth"
                  content={kundliReport.birth_details.date_of_birth}
                  icon="📅"
                />
                <KundliCard
                  title="Time of Birth"
                  content={kundliReport.birth_details.time_of_birth}
                  icon="🕐"
                />
                <KundliCard
                  title="Place of Birth"
                  content={kundliReport.birth_details.place_of_birth}
                  icon="📍"
                />
              </div>
            </div>

            {/* Core Chart Section */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-yellow-400">Core Chart</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KundliCard
                  title="Ascendant"
                  content={kundliReport.chart_data.ascendant}
                  icon="⭐"
                />
                <KundliCard
                  title="Moon Sign"
                  content={kundliReport.chart_data.moon_sign}
                  icon="🌙"
                />
                <KundliCard
                  title="Sun Sign"
                  content={kundliReport.chart_data.sun_sign}
                  icon="☀️"
                />
                <KundliCard
                  title="Nakshatra"
                  content={kundliReport.chart_data.nakshatra}
                  icon="🌟"
                />
              </div>
            </div>

            {/* Planets Table */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-yellow-400">Planetary Positions</h3>
              <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {Object.entries(kundliReport.chart_data.planets).map(([planet, data]) => (
                    <div key={planet} className="text-center">
                      <div className="text-lg font-semibold text-yellow-400 capitalize">{planet}</div>
                      <div className="text-white/80">{data.sign}</div>
                      <div className="text-white/60 text-sm">{data.degree}°</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Houses Grid */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-yellow-400">12 Houses</h3>
              <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Object.entries(kundliReport.chart_data.houses).map(([house, sign]) => (
                    <div key={house} className="text-center">
                      <div className="text-lg font-semibold text-yellow-400">House {house}</div>
                      <div className="text-white/80">{sign}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Interpretation Cards */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-yellow-400">AI Interpretation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <KundliCard
                  title="Personality"
                  content={kundliReport.interpretation.personality}
                  icon="🧠"
                />
                <KundliCard
                  title="Strengths"
                  content={kundliReport.interpretation.strengths}
                  icon="💪"
                />
                <KundliCard
                  title="Challenges"
                  content={kundliReport.interpretation.challenges}
                  icon="🎯"
                />
                <KundliCard
                  title="Career"
                  content={kundliReport.interpretation.career}
                  icon="💼"
                />
                <KundliCard
                  title="Relationships"
                  content={kundliReport.interpretation.relationships}
                  icon="❤️"
                />
                <KundliCard
                  title="Health"
                  content={kundliReport.interpretation.health}
                  icon="🏥"
                />
                <KundliCard
                  title="Spiritual Path"
                  content={kundliReport.interpretation.spiritual_path}
                  icon="🧭"
                />
              </div>
            </div>

            {/* Important Yogas Section */}
            {kundliReport.interpretation.important_yogas && kundliReport.interpretation.important_yogas.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4 text-yellow-400">Important Yogas</h3>
                <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {kundliReport.interpretation.important_yogas.map((yoga, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="text-2xl">✨</div>
                        <div>
                          <div className="text-lg font-semibold text-yellow-400">{yoga}</div>
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
                <KundliCard
                  title="Name"
                  content={birthChartData.birth_details.full_name}
                  icon="👤"
                />
                <KundliCard
                  title="Date of Birth"
                  content={birthChartData.birth_details.date_of_birth}
                  icon="📅"
                />
                <KundliCard
                  title="Time of Birth"
                  content={birthChartData.birth_details.time_of_birth}
                  icon="🕐"
                />
                <KundliCard
                  title="Place of Birth"
                  content={birthChartData.birth_details.place_of_birth}
                  icon="📍"
                />
              </div>
            </div>

            {/* Core Chart Section */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-blue-400">Core Chart</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KundliCard
                  title="Ascendant"
                  content={birthChartData.chart_data.ascendant}
                  icon="⭐"
                />
                <KundliCard
                  title="Moon Sign"
                  content={birthChartData.chart_data.moon_sign}
                  icon="🌙"
                />
                <KundliCard
                  title="Sun Sign"
                  content={birthChartData.chart_data.sun_sign}
                  icon="☀️"
                />
                <KundliCard
                  title="Nakshatra"
                  content={birthChartData.chart_data.nakshatra}
                  icon="🌟"
                />
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
      </div> {/* Close padding container */}
    </div>
  );
};

export default ReportsPage;
