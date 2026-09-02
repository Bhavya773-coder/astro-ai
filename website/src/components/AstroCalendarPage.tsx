import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Sidebar from './Sidebar';
import { CosmicBackground } from './CosmicBackground';
import { GlassCard, GradientText, LoadingSpinner } from './CosmicUI';
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
  Share2,
  Flame,
  Star,
  Zap,
  Heart,
  Compass,
  Check,
  X
} from 'lucide-react';
import {
  fetchCalendarEvents,
  createCustomCalendarEvent,
  deleteCustomCalendarEvent,
  getExportIcsUrl,
  fetchDailyInsight
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
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1); // 1-12
  const [selectedDate, setSelectedDate] = useState<string>(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  );

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dailyInsight, setDailyInsight] = useState<DailyInsight | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

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

      // Combine & deduplicate
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
        // Compute client deterministic day insight
        const d = new Date(dateStr);
        const dayOfWeek = d.getDay();
        const planetNames = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
        const rulingPlanet = planetNames[dayOfWeek];
        const luckyColors = ['Gold/Yellow', 'Pearl White/Silver', 'Coral Red', 'Emerald Green', 'Royal Yellow', 'Diamond White/Pink', 'Deep Blue/Black'];
        
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
      // Fallback client insight
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

  // Muhurta Calculation Helpers for Selected Date
  const getMuhurtaTimings = (dateStr: string) => {
    const d = new Date(dateStr);
    const dayOfWeek = d.getDay(); // 0 = Sun, 1 = Mon, etc.

    // Traditional Rahu Kaal windows (based on standard 12-hour sunrise 06:00 to sunset 18:00)
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

    const gulikaMap = [
      '15:00 - 16:30', // Sun
      '13:30 - 15:00', // Mon
      '12:00 - 13:30', // Tue
      '10:30 - 12:00', // Wed
      '09:00 - 10:30', // Thu
      '07:30 - 09:00', // Fri
      '06:00 - 07:30', // Sat
    ];

    return {
      abhijit: '11:48 - 12:36',
      brahma: '04:32 - 05:20',
      rahuKaal: rahuKaalMap[dayOfWeek] || '12:00 - 13:30',
      yamaganda: yamagandaMap[dayOfWeek] || '09:00 - 10:30',
      gulika: gulikaMap[dayOfWeek] || '07:30 - 09:00'
    };
  };

  // Calendar Grid generation
  const daysInCurrentMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth - 1, 1).getDay(); // 0 for Sun

  const calendarDays = [];
  // Empty padding cells for first week
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null);
  }
  // Days 1..N
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
        return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-white selection:bg-fuchsia-500 selection:text-white">
      <CosmicBackground />
      <Sidebar />

      <main className="flex-1 p-4 md:p-8 lg:p-10 ml-0 md:ml-64 overflow-y-auto max-w-7xl mx-auto">
        {/* Header Title & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-violet-500/20 to-fuchsia-600/20 border border-violet-500/30 rounded-2xl">
                <CalendarIcon className="w-8 h-8 text-fuchsia-400" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                  <GradientText>Cosmic & Astro Calendar</GradientText>
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  Planetary transits, lunar phases, auspicious Muhurtas & personal synchronicity
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleToday}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              Today
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-lg shadow-violet-600/20 transition"
            >
              <Plus className="w-4 h-4" /> Add Event
            </button>
            <a
              href={getExportIcsUrl()}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="Download iCal (.ics) to sync with Google or Apple Calendar"
            >
              <Download className="w-4 h-4 text-amber-400" /> Export ICS
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Grid: Month Calendar */}
          <div className="lg:col-span-7 space-y-6">
            <GlassCard className="border-slate-800/90">
              {/* Month Navigator Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-slate-100">
                    {MONTH_NAMES[currentMonth - 1]} {currentYear}
                  </span>
                  {isLoading && <LoadingSpinner className="w-4 h-4 text-fuchsia-400 ml-2" />}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handlePrevMonth}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Weekday Labels */}
              <div className="grid grid-cols-7 gap-1.5 mb-2 text-center">
                {DAYS_OF_WEEK.map((day, idx) => (
                  <div
                    key={day}
                    className={`text-xs font-bold uppercase tracking-wider py-1 ${
                      idx === 0 || idx === 6 ? 'text-amber-400/80' : 'text-slate-400'
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1.5">
                {calendarDays.map((day, index) => {
                  if (day === null) {
                    return <div key={`empty-${index}`} className="h-16 md:h-20 rounded-xl bg-slate-950/30" />;
                  }

                  const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const isSelected = selectedDate === dateStr;
                  const isToday =
                    today.getFullYear() === currentYear &&
                    today.getMonth() + 1 === currentMonth &&
                    today.getDate() === day;

                  const dayEvents = events.filter(e => e.date === dateStr);
                  const hasMoon = dayEvents.some(e => e.icon);
                  const hasCustom = dayEvents.some(e => !e.isSystem);

                  return (
                    <div
                      key={dateStr}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`h-16 md:h-20 p-1.5 rounded-xl cursor-pointer transition flex flex-col justify-between border ${
                        isSelected
                          ? 'bg-gradient-to-br from-violet-600/30 to-fuchsia-600/30 border-fuchsia-400 shadow-[0_0_15px_rgba(217,70,239,0.3)]'
                          : isToday
                          ? 'bg-amber-500/10 border-amber-500/50 hover:bg-slate-800/80'
                          : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full ${
                            isToday
                              ? 'bg-amber-400 text-slate-950 font-black'
                              : isSelected
                              ? 'text-fuchsia-300 font-extrabold'
                              : 'text-slate-300'
                          }`}
                        >
                          {day}
                        </span>

                        {hasMoon && (
                          <span className="text-[11px]">
                            {dayEvents.find(e => e.icon)?.icon}
                          </span>
                        )}
                      </div>

                      {/* Event Indicator Pills */}
                      <div className="flex flex-col gap-0.5 overflow-hidden">
                        {dayEvents.slice(0, 1).map((ev, i) => (
                          <div
                            key={i}
                            className="text-[10px] truncate px-1 rounded bg-slate-800/90 text-slate-300 border border-slate-700/60"
                          >
                            {ev.title.replace(/^[^\w\s]+/, '').trim()}
                          </div>
                        ))}
                        {dayEvents.length > 1 && (
                          <span className="text-[9px] text-fuchsia-400 font-semibold text-right">
                            +{dayEvents.length - 1} more
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>

            {/* Monthly Legend */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 px-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span>Purnima (Full Moon)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <span>Amavasya (New Moon)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-400" />
                <span>Planetary Transit / Vedic Muhurta</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-fuchsia-400" />
                <span>Personal Custom Events</span>
              </div>
            </div>
          </div>

          {/* Right Panel: Selected Date Detail View */}
          <div className="lg:col-span-5 space-y-6">
            {/* Date Summary Card */}
            <GlassCard className="border-violet-500/30 bg-gradient-to-br from-violet-950/20 via-slate-900 to-slate-950">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <div className="text-xs uppercase tracking-widest text-violet-400 font-bold">
                    Selected Day Overview
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-100 mt-0.5">
                    {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </h2>
                </div>

                {dailyInsight?.ruling_planet && (
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase">Ruling Energy</span>
                    <div className="text-sm font-bold text-amber-300 flex items-center gap-1 justify-end">
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      {dailyInsight.ruling_planet}
                    </div>
                  </div>
                )}
              </div>

              {/* Cosmic Insight */}
              <div className="mt-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" /> Daily Cosmic Forecast
                </div>
                {isLoadingInsight ? (
                  <div className="py-4 text-center text-xs text-slate-500">Calculating cosmic weather...</div>
                ) : (
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800">
                    {dailyInsight?.cosmic_summary || 'Synchronized astrological influences active for this day.'}
                  </p>
                )}
              </div>

              {/* Auspicious & Inauspicious Muhurta Timing Windows */}
              <div className="mt-5 space-y-3">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" /> Traditional Muhurta Windows
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  {/* Abhijit */}
                  <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/30">
                    <div className="font-semibold text-emerald-400 text-[11px] flex items-center gap-1">
                      <Check className="w-3 h-3" /> Abhijit Muhurta
                    </div>
                    <div className="text-slate-200 font-bold mt-0.5">{muhurta.abhijit}</div>
                    <span className="text-[10px] text-slate-400">Prime auspicious time</span>
                  </div>

                  {/* Brahma */}
                  <div className="p-2.5 rounded-lg bg-sky-950/20 border border-sky-500/30">
                    <div className="font-semibold text-sky-400 text-[11px] flex items-center gap-1">
                      <Moon className="w-3 h-3" /> Brahma Muhurta
                    </div>
                    <div className="text-slate-200 font-bold mt-0.5">{muhurta.brahma}</div>
                    <span className="text-[10px] text-slate-400">Meditation & clarity</span>
                  </div>

                  {/* Rahu Kaal */}
                  <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-500/30">
                    <div className="font-semibold text-rose-400 text-[11px] flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Rahu Kaal
                    </div>
                    <div className="text-slate-200 font-bold mt-0.5">{muhurta.rahuKaal}</div>
                    <span className="text-[10px] text-slate-400">Avoid new beginnings</span>
                  </div>

                  {/* Yamaganda */}
                  <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/30">
                    <div className="font-semibold text-amber-400 text-[11px] flex items-center gap-1">
                      <Flame className="w-3 h-3" /> Yamaganda
                    </div>
                    <div className="text-slate-200 font-bold mt-0.5">{muhurta.yamaganda}</div>
                    <span className="text-[10px] text-slate-400">Caution in travel</span>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Events for this specific date */}
            <GlassCard className="border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Star className="w-4 h-4 text-fuchsia-400" />
                  Events on This Day ({selectedDayEvents.length})
                </h3>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="text-xs text-fuchsia-400 hover:text-fuchsia-300 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>

              {selectedDayEvents.length > 0 ? (
                <div className="space-y-2.5">
                  {selectedDayEvents.map(event => (
                    <div
                      key={event.id}
                      className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-100">{event.title}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getEventBadgeColor(event.category)}`}>
                            {event.category || 'General'}
                          </span>
                        </div>
                        {event.description && (
                          <p className="text-xs text-slate-400 leading-relaxed">{event.description}</p>
                        )}
                      </div>

                      {!event.isSystem && (
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition"
                          title="Delete event"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-slate-500">
                  No specific planetary transits or custom events scheduled for this day.
                </div>
              )}
            </GlassCard>
          </div>
        </div>

        {/* Modal: Add Custom Event */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-fuchsia-400" />
                  Add Calendar Event
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateCustomEvent} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Event Title</label>
                  <input
                    type="text"
                    placeholder="e.g., Birthday, Project Launch, Fasting"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
                  >
                    <option value="personal">Personal / Life</option>
                    <option value="muhurta">Auspicious Activity</option>
                    <option value="fasting">Fasting / Vrat</option>
                    <option value="career">Career / Business</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Notes / Description (Optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Add details, intentions or reminders..."
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingEvent}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-lg shadow-violet-600/20"
                  >
                    {isSubmittingEvent ? 'Saving...' : 'Save Event'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AstroCalendarPage;
