import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Sidebar from './Sidebar';
import { CosmicBackground } from './CosmicBackground';
import { GlassCard, LoadingSpinner } from './CosmicUI';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Sun,
  Moon,
  Clock,
  AlertTriangle,
  Plus,
  Trash2,
  Download,
  Star,
  Flame,
  Check,
  X
} from 'lucide-react';
import AutoResizeTextarea from './AutoResizeTextarea';
import { useNavigate } from 'react-router-dom';
import {
  fetchCalendarEvents,
  createCustomCalendarEvent,
  deleteCustomCalendarEvent,
  getExportIcsUrl,
  fetchDailyInsight,
  apiFetch
} from '../api/client';
import { useAuth } from '../auth/AuthContext';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Synodic Lunar Constants for Client Moon Calculations
const LUNAR_CYCLE = 29.53058867;
const KNOWN_NEW_MOON_TIMESTAMP = Date.UTC(2024, 0, 11, 11, 57, 0);

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  category?: string;
  isSystem?: boolean;
  icon?: string;
}

interface DailyInsight {
  date: string;
  cosmic_summary?: string;
  guidance?: string;
  ruling_planet?: string;
  lucky_color?: string;
  lucky_number?: number;
}

const AstroCalendarPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string>(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  );

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dailyInsight, setDailyInsight] = useState<DailyInsight | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [questionInput, setQuestionInput] = useState('');

  // New custom event modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('personal');
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);

  useEffect(() => {
    loadMonthEvents(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  useEffect(() => {
    if (selectedDate) {
      loadDateInsight(selectedDate);
    }
  }, [selectedDate]);

  const calculateMoonCycleEvents = (year: number, month: number): CalendarEvent[] => {
    const moonEvents: CalendarEvent[] = [];
    const daysInMonth = new Date(year, month, 0).getDate();
    const monthStr = String(month).padStart(2, '0');

    const dayPositions: Array<{ day: number; cyclePos: number }> = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const targetDate = Date.UTC(year, month - 1, d, 12, 0, 0);
      const diffDays = (targetDate - KNOWN_NEW_MOON_TIMESTAMP) / (1000 * 60 * 60 * 24);
      const cyclePos = ((diffDays % LUNAR_CYCLE) + LUNAR_CYCLE) % LUNAR_CYCLE;
      dayPositions.push({ day: d, cyclePos });
    }

    const findExactDay = (targetVal: number) => {
      let minDay = 1;
      let minDiff = 999;
      dayPositions.forEach(p => {
        let diff = Math.abs(p.cyclePos - targetVal);
        if (targetVal === 0) diff = Math.min(p.cyclePos, LUNAR_CYCLE - p.cyclePos);
        if (diff < minDiff) {
          minDiff = diff;
          minDay = p.day;
        }
      });
      return minDay;
    };

    const amavasyaDay = findExactDay(0);
    const firstQuarterDay = findExactDay(7.3826);
    const purnimaDay = findExactDay(14.7653);
    const thirdQuarterDay = findExactDay(22.1479);

    const makeDateStr = (d: number) => `${year}-${monthStr}-${String(d).padStart(2, '0')}`;

    moonEvents.push({
      id: `moon-amavasya-${makeDateStr(amavasyaDay)}`,
      title: '🌑 New Moon (Amavasya)',
      description: 'Ideal for quiet meditation, spiritual cleansing & setting new intentions.',
      date: makeDateStr(amavasyaDay),
      category: 'astrological',
      isSystem: true,
      icon: '🌑'
    });

    moonEvents.push({
      id: `moon-1stqtr-${makeDateStr(firstQuarterDay)}`,
      title: '🌓 First Quarter Moon',
      description: 'Action and momentum phase in the waxing lunar cycle.',
      date: makeDateStr(firstQuarterDay),
      category: 'astrological',
      isSystem: true,
      icon: '🌓'
    });

    moonEvents.push({
      id: `moon-purnima-${makeDateStr(purnimaDay)}`,
      title: '🌕 Full Moon (Purnima)',
      description: 'Peak spiritual illumination, heightened clarity & energetic alignment.',
      date: makeDateStr(purnimaDay),
      category: 'purnima',
      isSystem: true,
      icon: '🌕'
    });

    moonEvents.push({
      id: `moon-3rdqtr-${makeDateStr(thirdQuarterDay)}`,
      title: '🌗 Third Quarter Moon',
      description: 'Releasing obstacles, introspection & internal rebalancing.',
      date: makeDateStr(thirdQuarterDay),
      category: 'astrological',
      isSystem: true,
      icon: '🌗'
    });

    return moonEvents;
  };

  const loadMonthEvents = async (year: number, month: number) => {
    setIsLoading(true);
    try {
      const moonEvents = calculateMoonCycleEvents(year, month);
      let backendEvents: CalendarEvent[] = [];

      try {
        const res = await fetchCalendarEvents(year, month);
        if (res?.success && Array.isArray(res.data)) {
          backendEvents = res.data.map((e: any) => ({
            id: e._id || e.id || String(Math.random()),
            title: e.title,
            description: e.description,
            date: e.date,
            category: e.category || 'general',
            isSystem: e.isSystem || false,
            icon: e.icon
          }));
        }
      } catch (e) {
        // Backend fallback
      }

      const combined = [...moonEvents, ...backendEvents];
      setEvents(combined);
    } catch (err: any) {
      console.error('Failed to load calendar events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDateInsight = async (dateStr: string) => {
    setIsLoadingInsight(true);
    try {
      const res = await fetchDailyInsight(dateStr);
      if (res?.success && res.data) {
        setDailyInsight(res.data);
      } else {
        const d = new Date(dateStr);
        const dayOfWeek = d.getDay();
        const planetNames = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
        const rulingPlanet = planetNames[dayOfWeek];
        const luckyColors = ['Gold/Yellow', 'Silver/Pearl', 'Coral Red', 'Emerald Green', 'Royal Yellow', 'Diamond White', 'Deep Blue'];
        
        setDailyInsight({
          date: dateStr,
          cosmic_summary: `Governed by ${rulingPlanet} energy, bringing focus to conscious intention, deliberate timing, and grounded alignment.`,
          guidance: `Favorable for steady actions aligned with ${rulingPlanet}. Ensure clear communication during planetary transit hours.`,
          ruling_planet: rulingPlanet,
          lucky_color: luckyColors[dayOfWeek],
          lucky_number: ((dayOfWeek * 3 + 1) % 9) + 1
        });
      }
    } catch (e) {
      // Fallback
    } finally {
      setIsLoadingInsight(false);
    }
  };

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth() + 1);
    setSelectedDate(
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    );
  };

  const handleCreateCustomEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error('Please enter an event title');
      return;
    }

    setIsSubmittingEvent(true);
    try {
      const res = await createCustomCalendarEvent({
        title: newTitle.trim(),
        description: newDesc.trim(),
        date: selectedDate,
        category: newCategory
      });

      if (res?.success) {
        toast.success('Custom event created!');
        setShowAddModal(false);
        setNewTitle('');
        setNewDesc('');
        loadMonthEvents(currentYear, currentMonth);
      } else {
        toast.error(res?.message || 'Failed to create event');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error creating event');
    } finally {
      setIsSubmittingEvent(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm('Delete this event?')) return;

    try {
      const res = await deleteCustomCalendarEvent(id);
      if (res?.success) {
        toast.success('Event deleted');
        setEvents(prev => prev.filter(e => e.id !== id));
      } else {
        toast.error(res?.message || 'Failed to delete event');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error deleting event');
    }
  };

  const getMuhurtaTimings = (dateStr: string) => {
    const d = new Date(dateStr);
    const dayOfWeek = d.getDay();

    const rahuKaalMap = [
      '16:30 - 18:00', // Sun
      '07:30 - 09:00', // Mon
      '15:00 - 16:30', // Tue
      '12:00 - 13:30', // Wed
      '13:30 - 15:00', // Thu
      '10:30 - 12:00', // Fri
      '09:00 - 10:30', // Sat
    ];

    const yamagandaMap = [
      '12:00 - 13:30', // Sun
      '10:30 - 12:00', // Mon
      '09:00 - 10:30', // Tue
      '07:30 - 09:00', // Wed
      '06:00 - 07:30', // Thu
      '15:00 - 16:30', // Fri
      '13:30 - 15:00', // Sat
    ];

    return {
      abhijit: '11:48 - 12:36',
      brahma: '04:32 - 05:20',
      rahuKaal: rahuKaalMap[dayOfWeek] || '12:00 - 13:30',
      yamaganda: yamagandaMap[dayOfWeek] || '09:00 - 10:30',
    };
  };

  const daysInCurrentMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth - 1, 1).getDay();

  const calendarDays = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    calendarDays.push(d);
  }

  const selectedDayEvents = events.filter(e => e.date === selectedDate);
  const muhurta = getMuhurtaTimings(selectedDate);

  const getEventBadgeColor = (cat?: string) => {
    switch (cat?.toLowerCase()) {
      case 'purnima':
        return 'bg-amber-400/20 text-amber-300 border-amber-400/30';
      case 'astrological':
        return 'bg-violet-500/20 text-violet-300 border-violet-500/30';
      case 'festival':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'muhurta':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30';
    }
  };

  return (
    <CosmicBackground>
      <div className="flex min-h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 lg:ml-64 transition-all duration-300 h-screen flex flex-col" id="main-content">
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8 lg:py-16">
              {/* Header */}
              <div className="flex flex-col items-center mb-10">
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 flex items-center gap-3 font-display">
                  <CalendarIcon className="w-8 h-8 md:w-12 md:h-12 text-fuchsia-400" />
                  Astro Calendar
                </h1>
                {user?.is_believer && (
                  <div className="mb-6 px-4 py-1.5 rounded-full bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 border border-violet-400/50 text-[11px] font-bold text-violet-300 flex items-center gap-2 animate-pulse shadow-[0_0_15px_rgba(139,92,246,0.4)]">
                    <Sparkles className="w-3.5 h-3.5 text-violet-300" />
                    Vedic Planetary Transits & Auspicious Muhurtas
                  </div>
                )}
                <p className="text-white/60 text-lg max-w-2xl text-center">
                  Track planetary shifts, lunar phases, favorable Muhurtas (*Abhijit, Brahma Muhurta*), and inauspicious windows (*Rahu Kaal*) to time your actions.
                </p>

                {/* Quick Action Buttons */}
                <div className="flex items-center gap-3 mt-6">
                  <button
                    onClick={handleToday}
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/10 transition"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] transition"
                  >
                    <Plus className="w-4 h-4" /> Add Event
                  </button>
                  <a
                    href={getExportIcsUrl()}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/15 text-white/90 border border-white/10 transition"
                    title="Export to iCal/Google Calendar"
                  >
                    <Download className="w-4 h-4 text-amber-400" /> Export ICS
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Calendar Grid */}
                <div className="lg:col-span-7 space-y-6">
                  <GlassCard className="p-6">
                    {/* Month Navigator Header */}
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-white">
                          {MONTH_NAMES[currentMonth - 1]} {currentYear}
                        </h3>
                        {isLoading && <LoadingSpinner size="sm" />}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={handlePrevMonth}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 transition"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleNextMonth}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 transition"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Weekdays */}
                    <div className="grid grid-cols-7 gap-1.5 mb-2 text-center">
                      {DAYS_OF_WEEK.map((day, idx) => (
                        <div
                          key={day}
                          className={`text-xs font-bold uppercase tracking-wider py-1 ${
                            idx === 0 || idx === 6 ? 'text-amber-400' : 'text-white/50'
                          }`}
                        >
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar Days */}
                    <div className="grid grid-cols-7 gap-1.5">
                      {calendarDays.map((day, index) => {
                        if (day === null) {
                          return <div key={`empty-${index}`} className="h-16 md:h-20 rounded-xl bg-white/[0.02]" />;
                        }

                        const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const isSelected = selectedDate === dateStr;
                        const isToday =
                          today.getFullYear() === currentYear &&
                          today.getMonth() + 1 === currentMonth &&
                          today.getDate() === day;

                        const dayEvents = events.filter(e => e.date === dateStr);
                        const hasMoon = dayEvents.some(e => e.icon);

                        return (
                          <div
                            key={dateStr}
                            onClick={() => setSelectedDate(dateStr)}
                            className={`h-16 md:h-20 p-1.5 rounded-xl cursor-pointer transition flex flex-col justify-between border ${
                              isSelected
                                ? 'bg-gradient-to-br from-violet-600/30 to-fuchsia-600/30 border-fuchsia-400 shadow-[0_0_15px_rgba(217,70,239,0.4)]'
                                : isToday
                                ? 'bg-amber-500/15 border-amber-500/60 hover:bg-white/10'
                                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full ${
                                  isToday
                                    ? 'bg-amber-400 text-black font-extrabold'
                                    : isSelected
                                    ? 'text-fuchsia-300 font-extrabold'
                                    : 'text-white/80'
                                }`}
                              >
                                {day}
                              </span>

                              {hasMoon && (
                                <span className="text-xs">
                                  {dayEvents.find(e => e.icon)?.icon}
                                </span>
                              )}
                            </div>

                            <div className="flex flex-col gap-0.5 overflow-hidden">
                              {dayEvents.slice(0, 1).map((ev, i) => (
                                <div
                                  key={i}
                                  className="text-[10px] truncate px-1 rounded bg-white/10 text-white/90 border border-white/10"
                                >
                                  {ev.title.replace(/^[^\w\s]+/, '').trim()}
                                </div>
                              ))}
                              {dayEvents.length > 1 && (
                                <span className="text-[9px] text-fuchsia-400 font-bold text-right">
                                  +{dayEvents.length - 1}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </GlassCard>

                  {/* Calendar Legend */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-white/50 px-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <span>Full Moon (Purnima)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                      <span>New Moon (Amavasya)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-violet-400" />
                      <span>Planetary Transits</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-fuchsia-400" />
                      <span>Custom Events</span>
                    </div>
                  </div>
                </div>

                {/* Right Details Panel */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Selected Day Cosmic Insights */}
                  <GlassCard className="p-6 border-fuchsia-500/30">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <div>
                        <span className="text-xs uppercase tracking-widest text-fuchsia-400 font-semibold">
                          Selected Day Weather
                        </span>
                        <h3 className="text-xl font-bold text-white mt-0.5">
                          {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </h3>
                      </div>

                      {dailyInsight?.ruling_planet && (
                        <div className="text-right">
                          <span className="text-[10px] text-white/50 uppercase">Ruling Planet</span>
                          <div className="text-sm font-bold text-amber-300 flex items-center gap-1 justify-end">
                            <Sun className="w-3.5 h-3.5 text-amber-400" />
                            {dailyInsight.ruling_planet}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Cosmic Forecast */}
                    <div className="mt-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-white/80 uppercase tracking-wide mb-2">
                        <Sparkles className="w-4 h-4 text-fuchsia-400" /> Daily Cosmic Forecast
                      </div>
                      {isLoadingInsight ? (
                        <div className="py-3 text-center text-xs text-white/40">Calculating cosmic weather...</div>
                      ) : (
                        <p className="text-sm text-white/85 leading-relaxed bg-white/5 p-3.5 rounded-xl border border-white/10">
                          {dailyInsight?.cosmic_summary || 'Positive planetary aspects aligning for steady progress.'}
                        </p>
                      )}
                    </div>

                    {/* Muhurta Windows */}
                    <div className="mt-5 space-y-3">
                      <div className="text-xs font-bold text-white/80 uppercase tracking-wide flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-400" /> Auspicious & Inauspicious Windows
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
                          <div className="font-semibold text-emerald-400 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Abhijit Muhurta
                          </div>
                          <div className="text-white font-bold text-sm mt-1">{muhurta.abhijit}</div>
                          <span className="text-[10px] text-white/50">Most auspicious start</span>
                        </div>

                        <div className="p-3 rounded-xl bg-sky-950/20 border border-sky-500/30">
                          <div className="font-semibold text-sky-400 flex items-center gap-1">
                            <Moon className="w-3 h-3" /> Brahma Muhurta
                          </div>
                          <div className="text-white font-bold text-sm mt-1">{muhurta.brahma}</div>
                          <span className="text-[10px] text-white/50">Meditation & study</span>
                        </div>

                        <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30">
                          <div className="font-semibold text-rose-400 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Rahu Kaal
                          </div>
                          <div className="text-white font-bold text-sm mt-1">{muhurta.rahuKaal}</div>
                          <span className="text-[10px] text-white/50">Avoid major investments</span>
                        </div>

                        <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30">
                          <div className="font-semibold text-amber-400 flex items-center gap-1">
                            <Flame className="w-3 h-3" /> Yamaganda
                          </div>
                          <div className="text-white font-bold text-sm mt-1">{muhurta.yamaganda}</div>
                          <span className="text-[10px] text-white/50">Caution in transit</span>
                        </div>
                      </div>
                    </div>
                  </GlassCard>

                  {/* Events List */}
                  <GlassCard className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-base font-bold text-white flex items-center gap-2">
                        <Star className="w-4 h-4 text-fuchsia-400" />
                        Events on This Day ({selectedDayEvents.length})
                      </h4>
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="text-xs text-fuchsia-400 hover:text-fuchsia-300 font-semibold flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add
                      </button>
                    </div>

                    {selectedDayEvents.length > 0 ? (
                      <div className="space-y-2.5">
                        {selectedDayEvents.map(event => (
                          <div
                            key={event.id}
                            className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-start justify-between gap-3"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-white">{event.title}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getEventBadgeColor(event.category)}`}>
                                  {event.category || 'General'}
                                </span>
                              </div>
                              {event.description && (
                                <p className="text-xs text-white/70 leading-relaxed">{event.description}</p>
                              )}
                            </div>

                            {!event.isSystem && (
                              <button
                                onClick={() => handleDeleteEvent(event.id)}
                                className="p-1 text-white/40 hover:text-rose-400 transition"
                                title="Delete event"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-xs text-white/40">
                        No planetary transits or custom events scheduled for this day.
                      </div>
                    )}
                  </GlassCard>
                </div>
              </div>

              {/* Add Custom Event Modal */}
              {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                  <div className="w-full max-w-md bg-slate-900 border border-white/15 rounded-2xl p-6 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-fuchsia-400" />
                        Add Calendar Event
                      </h3>
                      <button
                        onClick={() => setShowAddModal(false)}
                        className="p-1 rounded-lg text-white/50 hover:text-white"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleCreateCustomEvent} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-white/70 mb-1">Date</label>
                        <input
                          type="date"
                          value={selectedDate}
                          onChange={e => setSelectedDate(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-fuchsia-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-white/70 mb-1">Event Title</label>
                        <input
                          type="text"
                          placeholder="e.g., Birthday, Auspicious Launch, Vrat"
                          value={newTitle}
                          onChange={e => setNewTitle(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-fuchsia-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-white/70 mb-1">Category</label>
                        <select
                          value={newCategory}
                          onChange={e => setNewCategory(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-fuchsia-500"
                        >
                          <option value="personal">Personal / Life</option>
                          <option value="muhurta">Auspicious Activity</option>
                          <option value="fasting">Fasting / Vrat</option>
                          <option value="career">Career / Business</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-white/70 mb-1">Description (Optional)</label>
                        <textarea
                          rows={3}
                          placeholder="Add intentions or reminders..."
                          value={newDesc}
                          onChange={e => setNewDesc(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-fuchsia-500"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowAddModal(false)}
                          className="px-4 py-2 rounded-lg text-xs font-semibold text-white/60 hover:text-white bg-white/5"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmittingEvent}
                          className="px-5 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-lg"
                        >
                          {isSubmittingEvent ? 'Saving...' : 'Save Event'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* FLOATING CHAT INPUT - ChatGPT Style */}
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!questionInput.trim()) return;
              try {
                const res = await apiFetch('/api/ai-chat/create', {
                  method: 'POST',
                  body: JSON.stringify({ title: 'Astro Calendar Chat' })
                });
                if (res?.success && res?.data) {
                  navigate(`/ai-chat?chatId=${res.data._id}`, { state: { initialMessage: questionInput.trim() } });
                } else {
                  navigate('/ai-chat', { state: { initialMessage: questionInput.trim() } });
                }
              } catch {
                navigate('/ai-chat', { state: { initialMessage: questionInput.trim() } });
              }
            }}
            className="w-full px-4 py-4 md:py-6"
          >
            <div className="max-w-3xl mx-auto relative flex items-end">
              <AutoResizeTextarea
                value={questionInput}
                onChange={(e) => setQuestionInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (questionInput.trim()) {
                      (e.target as any).form?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                    }
                  }
                }}
                placeholder="Ask AstroAi4u about today's planetary transit, Muhurta, or calendar events..."
                maxRows={6}
                className="w-full bg-purple-900/95 hover:bg-purple-900 focus:bg-purple-900 backdrop-blur-xl border-2 border-white/70 hover:border-white focus:border-white rounded-2xl pl-4 pr-12 py-3.5 md:pl-5 md:pr-14 md:py-4 text-lg text-white placeholder-white/90 focus:outline-none focus:ring-4 focus:ring-purple-400/60 transition-all shadow-xl shadow-purple-500/20"
              />
              <button
                type="submit"
                disabled={!questionInput.trim()}
                className="absolute right-2 bottom-2 p-2 md:right-3 md:bottom-3 bg-white hover:bg-gray-100 disabled:bg-white/20 disabled:opacity-50 text-purple-900 rounded-xl transition-all disabled:cursor-not-allowed shadow-lg border-2 border-purple-300"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m-7 7l7-7 7 7" />
                </svg>
              </button>
            </div>
            <p className="text-center text-white/30 text-xs mt-2">AstroAi4u can make mistakes. Consider checking important information.</p>
          </form>
        </div>
      </div>
    </CosmicBackground>
  );
};

export default AstroCalendarPage;
