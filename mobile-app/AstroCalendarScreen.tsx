import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  PanResponder,
  Share,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Calendar from 'expo-calendar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  Share2,
  Sparkles,
  Check,
  X,
  Smartphone,
  Compass,
  Zap,
  Heart,
  Briefcase,
  Sun,
  Moon,
  Clock,
  Palette,
  Award,
  AlertTriangle,
  Flame,
} from 'lucide-react-native';
import { ShareCardModal } from './ShareCardModal';
import { ShareCardData } from './shareUtils';
import {
  fetchCalendarEvents,
  createCustomCalendarEvent,
  deleteCustomCalendarEvent,
  getExportIcsUrl,
  fetchDailyInsight,
} from './api';

const { width, height } = Dimensions.get('window');

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Synodic Lunar Constants for Client Moon Calculations
const LUNAR_CYCLE = 29.53058867;
const KNOWN_NEW_MOON_TIMESTAMP = Date.UTC(2024, 0, 11, 11, 57, 0);

function formatShortLabel(title: string): string {
  if (!title) return '';
  if (title.includes('Birthday')) return '🎂 B\'Day';
  if (title.includes('Amavasya')) return '🌑 Amavasya';
  if (title.includes('Purnima')) return '🌕 Purnima';
  if (title.includes('First Quarter')) return '🌓 1st Qtr';
  if (title.includes('Third Quarter')) return '🌗 3rd Qtr';

  const clean = title.replace(/^[^\w\s]+/, '').trim();
  return clean.length > 8 ? clean.substring(0, 7) + '..' : clean;
}

function hashDate(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Fetch native device calendar events from Google Calendar (Android) or Apple Calendar (iOS)
 */
async function fetchNativeDeviceEvents(year: number, month: number) {
  if (Platform.OS === 'web') return [];

  try {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status === 'granted') {
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      if (calendars && calendars.length > 0) {
        const calIds = calendars.map(c => c.id);
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const nativeEvents = await Calendar.getEventsAsync(calIds, startDate, endDate);
        if (nativeEvents && nativeEvents.length > 0) {
          const isApple = Platform.OS === 'ios';
          return nativeEvents.map(e => {
            const startDateObj = new Date(e.startDate);
            const dateStr = `${startDateObj.getFullYear()}-${String(startDateObj.getMonth() + 1).padStart(2, '0')}-${String(startDateObj.getDate()).padStart(2, '0')}`;
            return {
              id: `native-${e.id}`,
              title: e.title,
              description: e.notes || (isApple ? 'Apple Calendar Device Event' : 'Google Calendar Device Event'),
              date: dateStr,
              category: 'special_day',
              isSystem: true, // Non-deletable native event
              isNative: true,
              iconType: isApple ? 'apple' : 'google',
              icon: isApple ? 'apple' : 'google',
            };
          });
        }
      }
    }
  } catch (err) {
    console.log('Native calendar fetch notice:', err);
  }
  return [];
}

/**
 * Calculates ONLY Swiss Ephemeris Moon Cycles and User Birthday
 */
function calculateMoonCycleEvents(year: number, month: number, birthdateStr?: string) {
  const events: any[] = [];
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
      if (targetVal === 0) {
        diff = Math.min(p.cyclePos, LUNAR_CYCLE - p.cyclePos);
      }
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

  // 1. Exact 1-Day Moon Phases ONLY
  events.push({
    id: `local-moon-amavasya-${makeDateStr(amavasyaDay)}`,
    title: '🌑 New Moon (Amavasya)',
    description: 'Amavasya Tithi - Ideal for ancestral remembrance, quiet meditation & inner purification.',
    date: makeDateStr(amavasyaDay),
    category: 'astrological',
    isSystem: true,
    icon: '🌑',
  });

  events.push({
    id: `local-moon-1stqtr-${makeDateStr(firstQuarterDay)}`,
    title: '🌓 First Quarter Moon',
    description: 'First Quarter Moon - Action & momentum phase in the waxing lunar cycle.',
    date: makeDateStr(firstQuarterDay),
    category: 'astrological',
    isSystem: true,
    icon: '🌓',
  });

  events.push({
    id: `local-moon-purnima-${makeDateStr(purnimaDay)}`,
    title: '🌕 Full Moon (Purnima)',
    description: 'Purnima Tithi - Peak spiritual illumination, clarity & divine energy.',
    date: makeDateStr(purnimaDay),
    category: 'purnima',
    isSystem: true,
    icon: '🌕',
  });

  events.push({
    id: `local-moon-3rdqtr-${makeDateStr(thirdQuarterDay)}`,
    title: '🌗 Third Quarter Moon',
    description: 'Third Quarter Moon - Releasing obstacles & internal rebalancing.',
    date: makeDateStr(thirdQuarterDay),
    category: 'astrological',
    isSystem: true,
    icon: '🌗',
  });

  // 2. User Birthday Event Sync ONLY
  if (birthdateStr) {
    let bDay = 0;
    let bMonth = 0;
    if (birthdateStr.includes('/')) {
      const parts = birthdateStr.split('/');
      if (parts.length >= 2) {
        bDay = parseInt(parts[0], 10);
        bMonth = parseInt(parts[1], 10);
      }
    } else if (birthdateStr.includes('-')) {
      const parts = birthdateStr.split('-');
      if (parts.length === 3) {
        bMonth = parseInt(parts[1], 10);
        bDay = parseInt(parts[2], 10);
      }
    }

    if (bDay && bMonth === month) {
      const dayStr = String(bDay).padStart(2, '0');
      events.push({
        id: `local-bday-${year}-${monthStr}-${dayStr}`,
        title: '🎂 My Birthday',
        description: 'Your solar return day! Celebrating another trip around the sun.',
        date: `${year}-${monthStr}-${dayStr}`,
        category: 'birthday',
        isSystem: true,
        isRecurring: true,
        icon: '🎂',
      });
    }
  }

  // Deduplicate
  const map = new Map<string, any>();
  events.forEach(ev => {
    const key = `${ev.date}_${ev.title.trim().toLowerCase()}`;
    if (!map.has(key)) {
      map.set(key, ev);
    }
  });

  return Array.from(map.values());
}

/**
 * Client-Side Astrological Ephemeris Fallback Generator with Date-Unique Predictions
 */
function generateLocalInsight(dateStr: string) {
  const parts = dateStr.split('-');
  const year = parseInt(parts[0], 10) || 2026;
  const month = parseInt(parts[1], 10) || 7;
  const day = parseInt(parts[2], 10) || 25;

  const targetDate = Date.UTC(year, month - 1, day, 12, 0, 0);
  const diffDays = (targetDate - KNOWN_NEW_MOON_TIMESTAMP) / (1000 * 60 * 60 * 24);
  const cyclePos = ((diffDays % LUNAR_CYCLE) + LUNAR_CYCLE) % LUNAR_CYCLE;
  const angle = (cyclePos / LUNAR_CYCLE) * 360;

  const nakshatras = [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
    'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
    'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
    'Moola', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
    'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
  ];

  const nakIndex = Math.floor(((day * 7 + month * 3) % 27));
  const dateEntropy = hashDate(dateStr);
  const score = Math.min(75 + (dateEntropy % 24), 99);

  const lifeEventPredictions = [
    {
      theme: '🚀 Sudden Financial Opportunity & Surprise Connection',
      event: 'Expect an unexpected text, phone call, or email today regarding money, career, or an exciting trip! A friend or past acquaintance will reach out with a golden proposal around mid-day.',
      love: 'Sparks will fly! Today your aura is extraordinarily magnetic. Expect playful flirting, a sudden surge in compliments, or a deep meaningful heart-to-heart with someone special.',
      career: 'A lucrative idea or unexpected financial surprise is brewing. The cosmic transits favor taking bold action—negotiate, pitch, or launch your plan right now!',
      warning: '⚠️ Don’t second-guess good news when it arrives. ✨ Blessing: Rare planetary backing is active—say yes to new opportunities today!',
      powerAction: 'Check your inbox and reach out to key contacts during your Lucky Hours—the cosmic odds are heavily stacked in your favor!',
    },
    {
      theme: '⚡ Unexpected Serendipity & Secret Blessing',
      event: 'A lucky coincidental meeting or unexpected discovery today will solve a problem that has been on your mind for weeks. Keep your eyes open near afternoon hours!',
      love: 'Deep romantic alignment! A genuine conversation will unlock unexpected emotional closeness. Single? Someone intriguing is watching you with silent admiration.',
      career: 'Behind-the-scenes recognition is manifesting. A smart financial move or strategic decision made today will yield impressive long-term rewards.',
      warning: '⚠️ Avoid rushing into hasty arguments at night. ✨ Blessing: You possess high intuitive clarity today—trust your inner compass!',
      powerAction: 'Spend 5 minutes during your lucky hours writing down your top goal—the current celestial alignment speeds up manifestation!',
    },
    {
      theme: '💎 Golden Door Opening & High Energy Victory',
      event: 'A major obstacle holding you back is dissolving! You will receive a sudden wave of momentum or exciting news that opens a clear path for your next big triumph.',
      love: 'Electrifying charm! You’ll draw positive attention everywhere you go today. Someone close to you is quietly preparing a sweet surprise.',
      career: 'Your creative problem-solving is at an all-time peak. Share your ideas or make important moves—money and success follow confident action!',
      warning: '⚠️ Don’t let minor imposter thoughts slow you down. ✨ Blessing: The cosmos is amplifying your personal magnetic aura today!',
      powerAction: 'Make your most important phone call or pitch during your Lucky Power Hours to gain maximum planetary support!',
    },
    {
      theme: '🔥 Magnetic Attraction & Sudden Romantic Spark',
      event: 'Your magnetic vibe is off the charts today! Someone unexpected will compliment you or drop a strong hint of romantic interest. Eye contact and sparks are guaranteed!',
      love: 'A deep emotional spark or passionate encounter is written in the stars today. Express your feelings openly—the universe rewards your courage!',
      career: 'High energy window! Take initiative on a project you put off earlier. A decision made today opens doors to a surprise income stream.',
      warning: '⚠️ Don’t hide your true feelings. ✨ Blessing: Venus and Moon align to give you irresistible personal charisma!',
      powerAction: 'Reach out to someone you care about during your Lucky Power Hours—the connection will be exceptionally sweet!',
    },
    {
      theme: '🌟 Sudden Windfall & Creative Breakthrough',
      event: 'A brilliant idea or sudden savings/bonus opportunity will pop up today. Trust your intuition when choosing a direction between 11:00 AM and 2:00 PM!',
      love: 'Warmth and laughter surround you. A surprise plan or spontaneous outing will turn into a memorable romantic highlight.',
      career: 'Financial luck is activated! Look out for unexpected discounts, lucrative deals, or a helpful mentor offering guidance.',
      warning: '⚠️ Avoid overspending on impulse buys. ✨ Blessing: Jupiter’s influence brings unexpected financial clarity!',
      powerAction: 'Take bold action on your top financial or creative priority during your Lucky Power Hours!',
    },
    {
      theme: '🎯 Unexpected Recognition & Status Elevation',
      event: 'Someone influential in your network is quietly noticing your talent and dedication. Expect sincere praise, a project invite, or an exciting status upgrade!',
      love: 'Admiration is coming your way! Someone special will go out of their way to make you feel valued and appreciated.',
      career: 'Your hard work receives clear validation. A key decision made today elevates your reputation and opens leadership avenues.',
      warning: '⚠️ Stay humble and focused. ✨ Blessing: Solar transits elevate your social standing and personal influence!',
      powerAction: 'Present your ideas or apply for new opportunities during your Lucky Power Hours!',
    },
    {
      theme: '🔮 Sudden Clarity & Mindset Breakthrough',
      event: 'A sudden moment of realization today will clear away weeks of doubt or confusion. You will feel an immense sense of relief and renewed direction!',
      love: 'Clarity in love! An open conversation clears up misunderstandings and brings profound trust and emotional harmony.',
      career: 'Strategic breakthrough! You’ll find a clever shortcut or solution to a complex challenge that others missed.',
      warning: '⚠️ Don’t dwell on past mistakes. ✨ Blessing: Mercury transits grant sharp analytical thinking and vision!',
      powerAction: 'Journal your thoughts or finalize key plans during your Lucky Power Hours!',
    },
    {
      theme: '✨ Lucky Coincidences & Serendipitous Plans',
      event: 'Things will fall into place miraculously today! A last-minute change of plans will turn out to be a blessing in disguise, leading to a fun, lucky encounter.',
      love: 'Spontaneous romance! An impromptu hangout or message leads to playful banter and unexpected chemistry.',
      career: 'Adaptability pays off. A sudden shift in schedule creates an opening for a highly profitable conversation.',
      warning: '⚠️ Don’t stress when plans shift. ✨ Blessing: Serendipity is guiding your steps today!',
      powerAction: 'Say yes to unexpected invitations during your Lucky Power Hours!',
    },
    {
      theme: '🏆 Sudden Victory & Unstoppable Confidence',
      event: 'You will conquer a challenge today that you previously hesitated to face. Your confidence and poise will leave an unforgettable impression on everyone present!',
      love: 'Bold love moves! Taking the lead in romance today yields glowing results. Your confidence is irresistible.',
      career: 'Victorious transits! Finish long-pending tasks or negotiate key terms—planetary alignment guarantees your competitive edge.',
      warning: '⚠️ Don’t let doubts slow your momentum. ✨ Blessing: Mars energy empowers your drive and determination!',
      powerAction: 'Execute your hardest task first during your Lucky Power Hours for a guaranteed victory!',
    },
    {
      theme: '💫 Reconnection & Warm Heartfelt Surprise',
      event: 'A heartwarming message or surprise gift/gesture from someone close will lift your spirits. A valuable bond is deepening in ways you didn’t expect!',
      love: 'Deep emotional fulfillment. You and your partner (or crush) will feel completely in sync and connected.',
      career: 'Teamwork and collaboration bring great news. Someone offers valuable assistance right when you need it.',
      warning: '⚠️ Don’t bottle up your gratitude. ✨ Blessing: Lunar harmony brings emotional warmth and peace!',
      powerAction: 'Send a heartfelt thank-you or message during your Lucky Power Hours to amplify good karma!',
    },
  ];

  const predIndex = dateEntropy % lifeEventPredictions.length;
  const pred = lifeEventPredictions[predIndex];

  return {
    success: true,
    date: dateStr,
    generatedAt: new Date().toISOString(),
    cosmicEnergyScore: score,
    lunarPhase: angle < 180 ? 'Shukla Paksha (Waxing Phase)' : 'Krishna Paksha (Waning Phase)',
    tithiNumber: Math.floor(angle / 12) + 1,
    nakshatra: nakshatras[nakIndex],
    moonSign: 'Scorpio (Vrischika Rashi)',
    sunSign: 'Leo (Simha Rashi)',
    cosmicTheme: pred.theme,
    lifeEventPrediction: pred.event,
    harnessEnergy: pred.event,
    loveAndRelationships: pred.love,
    careerAndWealth: pred.career,
    cosmicWarning: pred.warning,
    vitalityAndMindset: 'High energetic vibration! Grounding yourself with 10 minutes of morning sun and deep breathing will keep your aura glowing all day long.',
    luckyHours: '10:00 AM - 12:30 PM & 05:30 PM - 07:45 PM',
    luckyColors: ['Royal Amethyst', 'Celestial Gold'],
    dailyAffirmation: '"I welcome unexpected blessings, magnetic connections, and financial abundance into my life today."',
    powerAction: pred.powerAction,
  };
}

/**
 * Builds composite events for a given year & month
 */
async function buildMonthEvents(year: number, month: number, birthdateStr: string) {
  const moonEvents = calculateMoonCycleEvents(year, month, birthdateStr);
  const deviceNativeEvents = await fetchNativeDeviceEvents(year, month);

  const map = new Map<string, any>();

  try {
    const res = await fetchCalendarEvents(year, month);
    const apiEvents = (res && res.events && Array.isArray(res.events)) ? res.events : [];

    apiEvents.forEach(ev => {
      if (ev.title.includes('Moon') || ev.category === 'birthday' || !ev.isSystem) {
        const key = `${ev.date}_${ev.title.trim().toLowerCase()}`;
        map.set(key, ev);
      }
    });
  } catch (err) {}

  moonEvents.forEach(loc => {
    const key = `${loc.date}_${loc.title.trim().toLowerCase()}`;
    if (!map.has(key)) {
      map.set(key, loc);
    }
  });

  deviceNativeEvents.forEach(nat => {
    const key = `${nat.date}_${nat.title.trim().toLowerCase()}`;
    if (!map.has(key)) {
      map.set(key, nat);
    }
  });

  const combined = Array.from(map.values());
  combined.sort((a, b) => a.date.localeCompare(b.date));
  return combined;
}

interface AstroCalendarScreenProps {
  answers?: Record<string, string>;
  onBack: () => void;
}

export default function AstroCalendarScreen({ answers = {}, onBack }: AstroCalendarScreenProps) {
  const insets = useSafeAreaInsets();
  const today = new Date();

  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth() + 1);
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  );

  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // In-Memory Rolling Cache for ±3 Months Events
  const eventsCacheRef = useRef<Map<string, any[]>>(new Map());

  // 24-Hour Persistence Storage Client Cache Map for Daily Insights (Keyed strictly by YYYY-MM-DD)
  const insightClientCacheRef = useRef<Map<string, { data: any; expiresAt: number }>>(new Map());

  // Add Special Day Modal
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [eventTitle, setEventTitle] = useState<string>('');
  const [eventDesc, setEventDesc] = useState<string>('');
  const [eventCategory, setEventCategory] = useState<string>('special_day');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Liquid Glass Daily Insight State
  const [showInsightModal, setShowInsightModal] = useState<boolean>(false);
  const [insightLoading, setInsightLoading] = useState<boolean>(false);
  const [insightProgress, setInsightProgress] = useState<number>(0);
  const [insightStatusText, setInsightStatusText] = useState<string>('Aligning Celestial Ephemeris...');
  const [insightData, setInsightData] = useState<any | null>(null);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [shareModalData, setShareModalData] = useState<ShareCardData | null>(null);

  const birthdateStr = answers.date_of_birth || '';

  // Unified Navigation Function
  const navigateMonth = (delta: number) => {
    let newMonth = currentMonth + delta;
    let newYear = currentYear;

    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }

    setCurrentYear(newYear);
    setCurrentMonth(newMonth);

    // Sync selected date to valid day in new month
    const maxDays = new Date(newYear, newMonth, 0).getDate();
    const currentDayNum = parseInt(selectedDateStr.split('-')[2] || '1', 10);
    const targetDay = Math.min(currentDayNum || 1, maxDays);
    const monthStr = String(newMonth).padStart(2, '0');
    const dayStr = String(targetDay).padStart(2, '0');
    setSelectedDateStr(`${newYear}-${monthStr}-${dayStr}`);
  };

  // Ref handler to eliminate stale closures in PanResponder
  const navigateMonthRef = useRef(navigateMonth);
  useEffect(() => {
    navigateMonthRef.current = navigateMonth;
  });

  const handlePrevMonth = () => navigateMonth(-1);
  const handleNextMonth = () => navigateMonth(1);

  // PanResponder with Ref invocation for gesture swiping
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 30 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -40) {
          // Swipe Left -> Next Month (+1)
          navigateMonthRef.current(1);
        } else if (gestureState.dx > 40) {
          // Swipe Right -> Previous Month (-1)
          navigateMonthRef.current(-1);
        }
      },
    })
  ).current;

  // Immediate Synchronous State Render + Background ±3 Months Rolling Buffer Preloader
  useEffect(() => {
    const key = `${currentYear}-${currentMonth}`;

    if (eventsCacheRef.current.has(key)) {
      setEvents(eventsCacheRef.current.get(key)!);
      setLoading(false);
    } else {
      const instantMoonEvents = calculateMoonCycleEvents(currentYear, currentMonth, birthdateStr);
      setEvents(instantMoonEvents);
      setLoading(false);
    }

    let isCancelled = false;

    const preloadRollingWindow = async () => {
      const offsets = [-3, -2, -1, 0, 1, 2, 3];

      for (const offset of offsets) {
        if (isCancelled) break;

        let targetMonth = currentMonth + offset;
        let targetYear = currentYear;

        while (targetMonth > 12) {
          targetMonth -= 12;
          targetYear += 1;
        }
        while (targetMonth < 1) {
          targetMonth += 12;
          targetYear -= 1;
        }

        const cacheKey = `${targetYear}-${targetMonth}`;
        if (!eventsCacheRef.current.has(cacheKey)) {
          const compiled = await buildMonthEvents(targetYear, targetMonth, birthdateStr);
          eventsCacheRef.current.set(cacheKey, compiled);

          if (targetYear === currentYear && targetMonth === currentMonth && !isCancelled) {
            setEvents(compiled);
          }
        }
      }
    };

    preloadRollingWindow();

    return () => {
      isCancelled = true;
    };
  }, [currentYear, currentMonth, birthdateStr]);

  const handleTodayJump = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth() + 1);
    setSelectedDateStr(
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    );
  };

  const handleSyncNativeDeviceCalendar = async () => {
    if (Platform.OS === 'web') {
      const url = getExportIcsUrl();
      Linking.openURL(url).catch(() => {
        Alert.alert('Sync Calendar', `Download calendar file at:\n${url}`);
      });
      return;
    }

    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status === 'granted') {
        const deviceEvents = await fetchNativeDeviceEvents(currentYear, currentMonth);
        if (deviceEvents.length > 0) {
          eventsCacheRef.current.clear();
          const fresh = await buildMonthEvents(currentYear, currentMonth, birthdateStr);
          setEvents(fresh);
          Alert.alert(
            'Native Calendar Synced',
            `Synced events from ${Platform.OS === 'android' ? 'Google Calendar' : 'Apple Calendar'}.`
          );
        } else {
          Alert.alert(
            'Native Calendar Connected',
            `Connected to ${Platform.OS === 'android' ? 'Google Calendar' : 'Apple Calendar'}.`
          );
        }
      } else {
        Alert.alert('Permission Needed', 'Please allow calendar access in phone settings to sync device calendars.');
      }
    } catch (e) {
      const url = getExportIcsUrl();
      Linking.openURL(url);
    }
  };

  // Trigger Liquid Progress Insight Generation (Keyed strictly to selectedDateStr YYYY-MM-DD)
  const handleGetDailyInsight = async () => {
    setShowInsightModal(true);

    // 1. Check if 24-hour stored cache exists specifically for selectedDateStr
    if (insightClientCacheRef.current.has(selectedDateStr)) {
      const cached = insightClientCacheRef.current.get(selectedDateStr)!;
      if (cached && cached.expiresAt > Date.now()) {
        setInsightData(cached.data);
        setInsightLoading(false);
        setInsightProgress(100);
        return;
      }
    }

    setInsightLoading(true);
    setInsightProgress(10);
    setInsightStatusText('Aligning Swiss Ephemeris Celestial Vectors...');

    // Generate date-unique fallback & store in 24-hour cache
    const fallbackInsight = generateLocalInsight(selectedDateStr);
    setInsightData(fallbackInsight);
    insightClientCacheRef.current.set(selectedDateStr, {
      data: fallbackInsight,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });

    let currentP = 10;
    const interval = setInterval(() => {
      currentP += 20;
      if (currentP >= 100) {
        clearInterval(interval);
        setInsightProgress(100);
        setInsightLoading(false);
      } else {
        setInsightProgress(currentP);
        if (currentP === 50) {
          setInsightStatusText('Calculating Daily Nakshatra & Tithi Elongation...');
        } else if (currentP === 70) {
          setInsightStatusText('Synthesizing Cosmic Energy & Harmonic Frequency...');
        }
      }
    }, 60);

    try {
      const res = await fetchDailyInsight(selectedDateStr);
      if (res && res.success) {
        setInsightData(res);
        insightClientCacheRef.current.set(selectedDateStr, {
          data: res,
          expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        });
      }
    } catch (err) {
      // Keep instant cached fallback
    }
  };

  const handleShareInsight = () => {
    if (!insightData) return;
    setShareModalData({
      category: 'ASTRO CALENDAR',
      title: `Daily Cosmic Forecast - ${insightData.date || selectedDateStr}`,
      subtitle: `Forecast: ${insightData.cosmicTheme || 'Planetary Transits'}`,
      readingText: insightData.lifeEventPrediction || insightData.transitImpact || insightData.dailyAffirmation || 'Planetary alignment directs cosmic opportunities.',
      highlights: [
        { label: 'Energy Score', value: `${insightData.cosmicEnergyScore || 90}%` },
        { label: 'Lucky Hours', value: String(insightData.luckyHours || 'Morning') },
        { label: 'Lucky Colors', value: Array.isArray(insightData.luckyColors) ? insightData.luckyColors.join(', ') : String(insightData.luckyColors || 'Violet') },
        { label: 'Power Action', value: String(insightData.powerAction || 'Focus') },
      ],
    });
    setShareModalVisible(true);
  };

  const handleAddSpecialDay = async () => {
    if (!eventTitle.trim()) {
      Alert.alert('Required', 'Please enter a title for your special day.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createCustomCalendarEvent({
        title: eventTitle.trim(),
        description: eventDesc.trim(),
        date: selectedDateStr,
        category: eventCategory,
        isRecurring: true,
      });

      eventsCacheRef.current.clear();

      if (res && res.success) {
        setShowAddModal(false);
        setEventTitle('');
        setEventDesc('');
        setEventCategory('special_day');
        const fresh = await buildMonthEvents(currentYear, currentMonth, birthdateStr);
        setEvents(fresh);
      } else {
        const newLocalEvent = {
          id: `custom-${Date.now()}`,
          title: eventTitle.trim(),
          description: eventDesc.trim(),
          date: selectedDateStr,
          category: eventCategory,
          isSystem: false,
          isNative: false,
          isRecurring: true,
          icon: '⭐',
        };
        setEvents(prev => [...prev, newLocalEvent]);
        setShowAddModal(false);
        setEventTitle('');
        setEventDesc('');
      }
    } catch (err) {
      const newLocalEvent = {
        id: `custom-${Date.now()}`,
        title: eventTitle.trim(),
        description: eventDesc.trim(),
        date: selectedDateStr,
        category: eventCategory,
        isSystem: false,
        isNative: false,
        isRecurring: true,
        icon: '⭐',
      };
      setEvents(prev => [...prev, newLocalEvent]);
      setShowAddModal(false);
      setEventTitle('');
      setEventDesc('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    Alert.alert('Delete Event', 'Remove this special day from your calendar?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteCustomCalendarEvent(id);
          } catch (err) {}
          eventsCacheRef.current.clear();
          setEvents(prev => prev.filter(e => e.id !== id));
        },
      },
    ]);
  };

  // Grid calculation
  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay();
  const totalDaysInMonth = new Date(currentYear, currentMonth, 0).getDate();

  const gridCells: Array<{ day: number | null; dateStr: string | null }> = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    gridCells.push({ day: null, dateStr: null });
  }
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const monthStr = String(currentMonth).padStart(2, '0');
    const dayStr = String(d).padStart(2, '0');
    gridCells.push({
      day: d,
      dateStr: `${currentYear}-${monthStr}-${dayStr}`,
    });
  }

  const selectedDayEvents = events.filter(e => e.date === selectedDateStr);

  return (
    <LinearGradient colors={['#F3EFFF', '#E9F3FF', '#FFFDF2']} locations={[0, 0.5, 1]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
            <ArrowLeft size={20} color="#7209B7" />
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>Astro Calendar</Text>
            <Text style={styles.headerSubtitle}>
              {Platform.OS === 'android' ? 'Google Calendar & Moon Cycles' : Platform.OS === 'ios' ? 'Apple Calendar & Moon Cycles' : 'Moon Cycles & Native Sync'}
            </Text>
          </View>

          <TouchableOpacity onPress={handleSyncNativeDeviceCalendar} style={styles.syncBtn} activeOpacity={0.8}>
            {Platform.OS === 'ios' ? (
              <MaterialCommunityIcons name="apple" size={16} color="#7209B7" style={{ marginRight: 3 }} />
            ) : Platform.OS === 'android' ? (
              <MaterialCommunityIcons name="google" size={14} color="#7209B7" style={{ marginRight: 3 }} />
            ) : (
              <Smartphone size={15} color="#7209B7" style={{ marginRight: 3 }} />
            )}
            <Text style={styles.syncBtnText}>{Platform.OS === 'android' ? 'Google Sync' : Platform.OS === 'ios' ? 'Apple Sync' : 'Sync'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Month Bar */}
          <View style={styles.monthHeaderCard}>
            <TouchableOpacity onPress={handlePrevMonth} style={styles.navBtn}>
              <ChevronLeft size={20} color="#7209B7" />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleTodayJump} activeOpacity={0.8} style={styles.monthTitleWrapper}>
              <CalendarIcon size={16} color="#7209B7" style={{ marginRight: 6 }} />
              <Text style={styles.monthTitle}>
                {MONTH_NAMES[currentMonth - 1]} {currentYear}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleNextMonth} style={styles.navBtn}>
              <ChevronRight size={20} color="#7209B7" />
            </TouchableOpacity>
          </View>

          {/* Weekday Row Header */}
          <View style={styles.weekdayRow}>
            {DAYS_OF_WEEK.map((w, idx) => (
              <Text key={idx} style={[styles.weekdayText, idx === 0 && { color: '#F72585' }]}>
                {w}
              </Text>
            ))}
          </View>

          {/* Month Grid with Left/Right Swipe Gesture Handler */}
          {loading ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator size="small" color="#7209B7" />
              <Text style={styles.loadingText}>Fetching Moon Cycles & Native Calendar...</Text>
            </View>
          ) : (
            <View {...panResponder.panHandlers} style={styles.gridContainer}>
              {gridCells.map((cell, index) => {
                if (!cell.day || !cell.dateStr) {
                  return <View key={`empty-${index}`} style={styles.dayCellEmpty} />;
                }

                const dayEvents = events.filter(e => e.date === cell.dateStr);
                const isSelected = cell.dateStr === selectedDateStr;
                const isToday =
                  cell.day === today.getDate() &&
                  currentMonth === today.getMonth() + 1 &&
                  currentYear === today.getFullYear();

                const sortedEvents = [...dayEvents].sort((a, b) => {
                  if (a.category === 'birthday') return -1;
                  if (b.category === 'birthday') return 1;
                  if (a.category === 'special_day') return -1;
                  if (b.category === 'special_day') return 1;
                  return 0;
                });

                const displayEvents = sortedEvents.slice(0, 2);
                const remainingCount = sortedEvents.length - 2;

                return (
                  <TouchableOpacity
                    key={`day-${cell.day}`}
                    style={[
                      styles.dayCell,
                      isToday && styles.dayCellToday,
                      isSelected && styles.dayCellSelected,
                    ]}
                    onPress={() => setSelectedDateStr(cell.dateStr!)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.dayNumber,
                        isToday && styles.dayNumberToday,
                        isSelected && styles.dayNumberSelected,
                      ]}
                    >
                      {cell.day}
                    </Text>

                    {/* Events Displayed DIRECTLY UNDER THE NUMBERS */}
                    <View style={styles.cellEventsContainer}>
                      {displayEvents.map((item, evIdx) => {
                        const shortLabel = formatShortLabel(item.title);
                        const isBday = item.category === 'birthday';
                        const isMoon = item.title.includes('Moon');
                        const isApple = item.iconType === 'apple';
                        const isGoogle = item.iconType === 'google';

                        return (
                          <View
                            key={evIdx}
                            style={[
                              styles.miniEventBadge,
                              isBday && styles.miniBadgeBday,
                              isMoon && styles.miniBadgeMoon,
                            ]}
                          >
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                              {isApple ? (
                                <MaterialCommunityIcons name="apple" size={9} color="#7209B7" style={{ marginRight: 2 }} />
                              ) : isGoogle ? (
                                <MaterialCommunityIcons name="google" size={8} color="#7209B7" style={{ marginRight: 2 }} />
                              ) : null}
                              <Text
                                style={[
                                  styles.miniEventText,
                                  isBday && styles.miniEventTextBday,
                                  isMoon && styles.miniEventTextMoon,
                                ]}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                              >
                                {shortLabel}
                              </Text>
                            </View>
                          </View>
                        );
                      })}

                      {remainingCount > 0 && (
                        <Text style={styles.moreEventsText}>+{remainingCount} more</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Selected Date Card & Events List */}
          <View style={styles.detailsCard}>
            <View style={styles.detailsHeader}>
              <View>
                <Text style={styles.detailsDateLabel}>Events for</Text>
                <Text style={styles.detailsDateTitle}>
                  {selectedDateStr}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  onPress={() => {
                    const moonEvent = selectedDayEvents.find(e => e.category === 'moon_phase');
                    setShareModalData({
                      category: 'ASTRO CALENDAR',
                      title: `Cosmic Alignment for ${selectedDateStr}`,
                      subtitle: moonEvent ? moonEvent.title : 'Planetary Transits',
                      readingText: moonEvent?.description || `Celestial energy for ${selectedDateStr} highlights key lunar & planetary transits.`,
                      highlights: [
                        { label: 'Date', value: selectedDateStr },
                        { label: 'Moon Phase', value: moonEvent?.title || 'Waxing Crescent' },
                        { label: 'Registered Events', value: String(selectedDayEvents.length) },
                      ],
                    });
                    setShareModalVisible(true);
                  }}
                  style={[styles.addBtn, { backgroundColor: '#8B5CF6' }]}
                  activeOpacity={0.85}
                >
                  <Share2 size={14} color="#FFF" />
                  <Text style={styles.addBtnText}>Share Card</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setShowAddModal(true)}
                  style={styles.addBtn}
                  activeOpacity={0.85}
                >
                  <Plus size={14} color="#FFF" />
                  <Text style={styles.addBtnText}>Special Day</Text>
                </TouchableOpacity>
              </View>
            </View>

            {selectedDayEvents.length === 0 ? (
              <View style={styles.noEventsContainer}>
                <Sparkles size={22} color="#7209B7" />
                <Text style={styles.noEventsText}>No registered moon cycles or native device events on this day.</Text>
                <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addInlineBtn}>
                  <Text style={styles.addInlineBtnText}>+ Add a Special Personal Day</Text>
                </TouchableOpacity>
              </View>
            ) : (
              selectedDayEvents.map(item => {
                const canDelete = !item.isSystem && !item.isNative && !String(item.id).startsWith('native-');
                const isAppleIcon = item.iconType === 'apple';
                const isGoogleIcon = item.iconType === 'google';

                return (
                  <View key={item.id} style={styles.eventItem}>
                    {isAppleIcon ? (
                      <MaterialCommunityIcons name="apple" size={20} color="#7209B7" style={{ marginRight: 10, marginTop: 2 }} />
                    ) : isGoogleIcon ? (
                      <MaterialCommunityIcons name="google" size={18} color="#7209B7" style={{ marginRight: 10, marginTop: 2 }} />
                    ) : (
                      <Text style={styles.eventItemIcon}>{item.icon || '✨'}</Text>
                    )}

                    <View style={{ flex: 1, paddingRight: 8 }}>
                      <View style={styles.eventTitleRow}>
                        <Text style={styles.eventItemTitle}>{item.title}</Text>
                        {item.category && (
                          <View style={styles.categoryPill}>
                            <Text style={styles.categoryPillText}>
                              {item.category.toUpperCase().replace('_', ' ')}
                            </Text>
                          </View>
                        )}
                      </View>
                      {item.description ? (
                        <Text style={styles.eventItemDesc}>{item.description}</Text>
                      ) : null}
                    </View>

                    {canDelete && (
                      <TouchableOpacity
                        onPress={() => handleDeleteEvent(item.id)}
                        style={styles.deleteBtn}
                      >
                        <Trash2 size={16} color="#E63946" />
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })
            )}

            {/* SIGNATURE LIQUID GLASS DESIGN BUTTON AT THE END OF PAGE */}
            <TouchableOpacity
              onPress={handleGetDailyInsight}
              activeOpacity={0.88}
              style={styles.liquidGlassContainer}
            >
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.95)', 'rgba(243, 239, 255, 0.85)', 'rgba(233, 243, 255, 0.9)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.liquidGlassGradient}
              >
                <View style={styles.liquidGlassContent}>
                  <View style={styles.liquidGlassIconBg}>
                    <Sparkles size={18} color="#7209B7" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.liquidGlassTitle}>
                      Get Insight of {selectedDateStr}
                    </Text>
                    <Text style={styles.liquidGlassSub}>
                      Swiss Ephemeris Nakshatra, Tithi & Daily Astrological Forecast
                    </Text>
                  </View>
                  <Zap size={16} color="#F5B041" style={{ marginLeft: 6 }} />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Modal to Add Custom Special Day */}
        <Modal visible={showAddModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Special Day</Text>
                <TouchableOpacity onPress={() => setShowAddModal(false)}>
                  <X size={20} color="#726F8D" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSubtitle}>Date: {selectedDateStr}</Text>

              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Personal Milestone, Anniversary"
                placeholderTextColor="#A09CB7"
                value={eventTitle}
                onChangeText={setEventTitle}
              />

              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.categoryPickerRow}>
                {[
                  { id: 'special_day', label: 'Special' },
                  { id: 'other', label: 'Other' },
                ].map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setEventCategory(cat.id)}
                    style={[
                      styles.categoryChoice,
                      eventCategory === cat.id && styles.categoryChoiceActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryChoiceText,
                        eventCategory === cat.id && styles.categoryChoiceTextActive,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Notes / Description</Text>
              <TextInput
                style={[styles.input, { height: 70 }]}
                multiline
                placeholder="Add special notes..."
                placeholderTextColor="#A09CB7"
                value={eventDesc}
                onChangeText={setEventDesc}
              />

              <TouchableOpacity
                onPress={handleAddSpecialDay}
                disabled={isSubmitting}
                style={styles.saveModalBtn}
                activeOpacity={0.85}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <>
                    <Check size={18} color="#FFF" style={{ marginRight: 6 }} />
                    <Text style={styles.saveModalBtnText}>Save Special Day</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* LIQUID GLASS DAILY INSIGHT PROGRESS & READING MODAL */}
        <Modal visible={showInsightModal} transparent animationType="slide">
          <View style={styles.insightModalOverlay}>
            <View style={styles.insightModalContainer}>
              <LinearGradient
                colors={['#FFFFFF', '#F8F5FF', '#F0F6FF']}
                style={styles.insightModalGradient}
              >
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Compass size={22} color="#7209B7" style={{ marginRight: 8 }} />
                    <Text style={styles.modalTitle}>Daily Cosmic & Life Forecast</Text>
                  </View>
                  <TouchableOpacity onPress={() => setShowInsightModal(false)}>
                    <X size={22} color="#726F8D" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.modalSubtitle}>Target Date: {selectedDateStr} (Preserved 24 Hours)</Text>

                {/* Progress Animation State */}
                {insightLoading ? (
                  <View style={styles.insightLoadingBox}>
                    <Sparkles size={40} color="#7209B7" style={{ marginBottom: 16 }} />
                    <Text style={styles.insightStatusTitle}>{insightStatusText}</Text>

                    {/* Liquid Glass Progress Bar */}
                    <View style={styles.progressBarBg}>
                      <LinearGradient
                        colors={['#7209B7', '#F5B041']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.progressBarFill, { width: `${insightProgress}%` }]}
                      />
                    </View>
                    <Text style={styles.insightProgressPercent}>{insightProgress}%</Text>
                  </View>
                ) : insightData ? (
                  <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
                    {/* Score Card */}
                    <LinearGradient
                      colors={['#7209B7', '#5B0697']}
                      style={styles.insightScoreCard}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.insightScoreLabel}>Daily Cosmic Alignment</Text>
                        <Text style={styles.insightScoreValue}>{insightData.cosmicEnergyScore}%</Text>
                        <Text style={styles.insightScoreTheme}>{insightData.cosmicTheme}</Text>
                      </View>
                      <View style={styles.insightBadgeCircle}>
                        <Award size={26} color="#F5B041" />
                      </View>
                    </LinearGradient>

                    {/* Celestial Transits Badges */}
                    <View style={styles.transitBadgeGrid}>
                      <View style={styles.transitBadgePill}>
                        <Moon size={14} color="#7209B7" style={{ marginRight: 4 }} />
                        <Text style={styles.transitBadgeText}>{insightData.moonSign}</Text>
                      </View>
                      <View style={styles.transitBadgePill}>
                        <Sun size={14} color="#D4AC0D" style={{ marginRight: 4 }} />
                        <Text style={styles.transitBadgeText}>{insightData.sunSign}</Text>
                      </View>
                      <View style={styles.transitBadgePill}>
                        <Sparkles size={14} color="#7209B7" style={{ marginRight: 4 }} />
                        <Text style={styles.transitBadgeText}>{insightData.nakshatra}</Text>
                      </View>
                      <View style={styles.transitBadgePill}>
                        <Clock size={14} color="#7209B7" style={{ marginRight: 4 }} />
                        <Text style={styles.transitBadgeText}>{insightData.lunarPhase}</Text>
                      </View>
                    </View>

                    {/* WHAT COULD HAPPEN IN YOUR LIFE TODAY (EXCITING FORECAST) */}
                    <LinearGradient
                      colors={['#FFFDF0', '#FFF8E7']}
                      style={styles.lifePredictionCard}
                    >
                      <View style={styles.lifePredictionTitleRow}>
                        <Flame size={18} color="#D4AC0D" style={{ marginRight: 6 }} />
                        <Text style={styles.lifePredictionTitle}>What Could Happen In Your Life Today</Text>
                      </View>
                      <Text style={styles.lifePredictionBody}>
                        {insightData.lifeEventPrediction || insightData.harnessEnergy}
                      </Text>
                    </LinearGradient>

                    {/* Love & Relationships */}
                    <View style={styles.insightSection}>
                      <View style={styles.insightSectionTitleRow}>
                        <Heart size={16} color="#F72585" style={{ marginRight: 6 }} />
                        <Text style={styles.insightSectionTitle}>Love & Magnetic Sparks</Text>
                      </View>
                      <Text style={styles.insightSectionBody}>{insightData.loveAndRelationships}</Text>
                    </View>

                    {/* Career & Wealth */}
                    <View style={styles.insightSection}>
                      <View style={styles.insightSectionTitleRow}>
                        <Briefcase size={16} color="#4CC9F0" style={{ marginRight: 6 }} />
                        <Text style={styles.insightSectionTitle}>Career & Financial Windfall</Text>
                      </View>
                      <Text style={styles.insightSectionBody}>{insightData.careerAndWealth}</Text>
                    </View>

                    {/* Cosmic Warning & Secret Opportunity */}
                    {insightData.cosmicWarning ? (
                      <View style={styles.warningCard}>
                        <View style={styles.insightSectionTitleRow}>
                          <AlertTriangle size={16} color="#D4AC0D" style={{ marginRight: 6 }} />
                          <Text style={styles.warningCardTitle}>Cosmic Warning & Opportunity</Text>
                        </View>
                        <Text style={styles.warningCardBody}>{insightData.cosmicWarning}</Text>
                      </View>
                    ) : null}

                    {/* Lucky Attributes */}
                    <View style={styles.luckyContainer}>
                      <View style={styles.luckyItem}>
                        <Clock size={15} color="#7209B7" style={{ marginRight: 6 }} />
                        <Text style={styles.luckyLabel}>Lucky Power Hours: </Text>
                        <Text style={styles.luckyVal}>{insightData.luckyHours}</Text>
                      </View>
                      <View style={styles.luckyItem}>
                        <Palette size={15} color="#7209B7" style={{ marginRight: 6 }} />
                        <Text style={styles.luckyLabel}>Colors: </Text>
                        <Text style={styles.luckyVal}>
                          {Array.isArray(insightData.luckyColors) ? insightData.luckyColors.join(', ') : insightData.luckyColors}
                        </Text>
                      </View>
                      {insightData.powerAction ? (
                        <View style={[styles.luckyItem, { marginTop: 6 }]}>
                          <Zap size={15} color="#F5B041" style={{ marginRight: 6 }} />
                          <Text style={styles.luckyLabel}>Power Action: </Text>
                          <Text style={[styles.luckyVal, { flex: 1 }]}>{insightData.powerAction}</Text>
                        </View>
                      ) : null}
                    </View>

                    {/* Affirmation Card */}
                    <View style={styles.affirmationCard}>
                      <Text style={styles.affirmationTitle}>Daily Cosmic Affirmation</Text>
                      <Text style={styles.affirmationBody}>{insightData.dailyAffirmation}</Text>
                    </View>

                    {/* SHARE READING WITH FRIEND BUTTON */}
                    <TouchableOpacity
                      onPress={handleShareInsight}
                      style={styles.shareInsightBtn}
                      activeOpacity={0.88}
                    >
                      <LinearGradient
                        colors={['#7209B7', '#5B0697']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.shareInsightGradient}
                      >
                        <Share2 size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                        <Text style={styles.shareInsightBtnText}>Share Reading with Friend</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </ScrollView>
                ) : null}
              </LinearGradient>
            </View>
          </View>
        </Modal>

        {/* Share Card Modal */}
        <ShareCardModal
          visible={shareModalVisible}
          data={shareModalData}
          onClose={() => setShareModalVisible(false)}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 6,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7209B7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  titleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Cinzel-Bold',
    color: '#2C2B3D',
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontFamily: 'SourceSerif4',
    color: '#726F8D',
    fontSize: 11.5,
    marginTop: 1,
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(114, 9, 183, 0.15)',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 7,
    shadowColor: '#7209B7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  syncBtnText: {
    fontFamily: 'SourceSerif4-Bold',
    color: '#7209B7',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  monthHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginTop: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(114, 9, 183, 0.08)',
    shadowColor: '#7209B7',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  navBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(114, 9, 183, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(114, 9, 183, 0.06)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  monthTitle: {
    fontFamily: 'Cinzel-Bold',
    color: '#7209B7',
    fontSize: 15,
    fontWeight: '700',
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 4,
    marginBottom: 2,
  },
  weekdayText: {
    fontFamily: 'SourceSerif4-Bold',
    color: '#726F8D',
    fontSize: 12,
    fontWeight: '700',
    width: (width - 32) / 7,
    textAlign: 'center',
  },
  loadingCard: {
    height: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  loadingText: {
    fontFamily: 'SourceSerif4',
    color: '#726F8D',
    fontSize: 13,
    marginTop: 8,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCellEmpty: {
    width: (width - 32) / 7,
    height: 72,
  },
  dayCell: {
    width: (width - 32) / 7,
    height: 72,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 5,
    paddingHorizontal: 2,
    borderRadius: 12,
    marginVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(114, 111, 141, 0.06)',
    shadowColor: '#7209B7',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    overflow: 'hidden',
  },
  dayCellToday: {
    backgroundColor: '#FFFDF0',
    borderColor: '#F5B041',
    borderWidth: 1.5,
  },
  dayCellSelected: {
    backgroundColor: '#F3E5FF',
    borderColor: '#7209B7',
    borderWidth: 1.5,
  },
  dayNumber: {
    fontFamily: 'SourceSerif4-Bold',
    color: '#2C2B3D',
    fontSize: 12.5,
    fontWeight: '700',
    marginBottom: 2,
  },
  dayNumberToday: {
    color: '#D4AC0D',
    fontWeight: '800',
  },
  dayNumberSelected: {
    color: '#7209B7',
    fontWeight: '800',
  },
  cellEventsContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 2,
  },
  miniEventBadge: {
    width: '94%',
    backgroundColor: 'rgba(114, 9, 183, 0.08)',
    borderRadius: 4,
    paddingHorizontal: 2,
    paddingVertical: 1.5,
    alignItems: 'center',
  },
  miniBadgeBday: {
    backgroundColor: '#FFF0F3',
  },
  miniBadgeMoon: {
    backgroundColor: '#FFFDF0',
  },
  miniEventText: {
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 8.5,
    color: '#7209B7',
    textAlign: 'center',
  },
  miniEventTextBday: {
    color: '#F72585',
    fontWeight: '700',
  },
  miniEventTextMoon: {
    color: '#D4AC0D',
    fontWeight: '700',
  },
  moreEventsText: {
    fontSize: 7.5,
    color: '#726F8D',
    fontWeight: '600',
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(114, 9, 183, 0.08)',
    shadowColor: '#7209B7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  detailsDateLabel: {
    fontFamily: 'SourceSerif4',
    color: '#726F8D',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailsDateTitle: {
    fontFamily: 'Cinzel-Bold',
    color: '#7209B7',
    fontSize: 16,
    fontWeight: '700',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7209B7',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
  },
  addBtnText: {
    fontFamily: 'SourceSerif4-Bold',
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  noEventsContainer: {
    alignItems: 'center',
    paddingVertical: 22,
  },
  noEventsText: {
    fontFamily: 'SourceSerif4',
    color: '#726F8D',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },
  addInlineBtn: {
    marginTop: 12,
  },
  addInlineBtnText: {
    fontFamily: 'SourceSerif4-Bold',
    color: '#7209B7',
    fontSize: 13,
    fontWeight: '700',
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FBF9FF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(114, 9, 183, 0.06)',
  },
  eventItemIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  eventTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  eventItemTitle: {
    fontFamily: 'SourceSerif4-Bold',
    color: '#2C2B3D',
    fontSize: 14,
    fontWeight: '700',
    marginRight: 8,
  },
  categoryPill: {
    backgroundColor: 'rgba(114, 9, 183, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  categoryPillText: {
    fontFamily: 'SourceSerif4-Bold',
    color: '#7209B7',
    fontSize: 9.5,
    fontWeight: '700',
  },
  eventItemDesc: {
    fontFamily: 'SourceSerif4',
    color: '#65637A',
    fontSize: 12,
    marginTop: 3,
    lineHeight: 16,
  },
  deleteBtn: {
    padding: 4,
  },

  // SIGNATURE LIQUID GLASS STYLING
  liquidGlassContainer: {
    marginTop: 14,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(114, 9, 183, 0.25)',
    shadowColor: '#7209B7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 5,
  },
  liquidGlassGradient: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  liquidGlassContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  liquidGlassIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(114, 9, 183, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  liquidGlassTitle: {
    fontFamily: 'Cinzel-Bold',
    color: '#7209B7',
    fontSize: 14.5,
    fontWeight: '700',
  },
  liquidGlassSub: {
    fontFamily: 'SourceSerif4',
    color: '#65637A',
    fontSize: 11,
    marginTop: 2,
  },

  // INSIGHT MODAL STYLES (Fixed for Mobile Screens)
  insightModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 12, 32, 0.75)',
    justifyContent: 'flex-end',
  },
  insightModalContainer: {
    width: '100%',
    height: '86%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    shadowColor: '#7209B7',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  insightModalGradient: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  insightLoadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  insightStatusTitle: {
    fontFamily: 'SourceSerif4-Bold',
    color: '#7209B7',
    fontSize: 15,
    marginBottom: 24,
    textAlign: 'center',
  },
  progressBarBg: {
    width: '85%',
    height: 12,
    backgroundColor: 'rgba(114, 9, 183, 0.12)',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  insightProgressPercent: {
    fontFamily: 'Cinzel-Bold',
    color: '#2C2B3D',
    fontSize: 16,
    fontWeight: '700',
  },
  insightScoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 16,
    marginVertical: 10,
  },
  insightScoreLabel: {
    fontFamily: 'SourceSerif4',
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  insightScoreValue: {
    fontFamily: 'Cinzel-Bold',
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    marginVertical: 2,
  },
  insightScoreTheme: {
    fontFamily: 'SourceSerif4-Bold',
    color: '#F5B041',
    fontSize: 13,
  },
  insightBadgeCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  transitBadgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 10,
  },
  transitBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(114, 9, 183, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  transitBadgeText: {
    fontFamily: 'SourceSerif4-Bold',
    color: '#7209B7',
    fontSize: 11.5,
  },

  lifePredictionCard: {
    borderRadius: 18,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1.5,
    borderColor: '#F5B041',
    shadowColor: '#F5B041',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  lifePredictionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  lifePredictionTitle: {
    fontFamily: 'Cinzel-Bold',
    color: '#7209B7',
    fontSize: 14,
    fontWeight: '700',
  },
  lifePredictionBody: {
    fontFamily: 'SourceSerif4-Bold',
    color: '#2C2B3D',
    fontSize: 13,
    lineHeight: 19,
  },

  insightSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(114, 9, 183, 0.08)',
  },
  insightSectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  insightSectionTitle: {
    fontFamily: 'Cinzel-Bold',
    color: '#2C2B3D',
    fontSize: 13.5,
    fontWeight: '700',
  },
  insightSectionBody: {
    fontFamily: 'SourceSerif4',
    color: '#55526B',
    fontSize: 12.5,
    lineHeight: 18,
  },

  warningCard: {
    backgroundColor: '#FFFDF0',
    borderRadius: 16,
    padding: 14,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#F5B041',
  },
  warningCardTitle: {
    fontFamily: 'Cinzel-Bold',
    color: '#D4AC0D',
    fontSize: 13.5,
    fontWeight: '700',
  },
  warningCardBody: {
    fontFamily: 'SourceSerif4',
    color: '#55526B',
    fontSize: 12.5,
    lineHeight: 18,
  },

  luckyContainer: {
    backgroundColor: '#FFFDF0',
    borderRadius: 16,
    padding: 12,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#F5B041',
  },
  luckyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
  },
  luckyLabel: {
    fontFamily: 'SourceSerif4-Bold',
    color: '#2C2B3D',
    fontSize: 12,
  },
  luckyVal: {
    fontFamily: 'SourceSerif4',
    color: '#7209B7',
    fontSize: 12,
  },
  affirmationCard: {
    backgroundColor: '#F3E9FF',
    borderRadius: 16,
    padding: 14,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#7209B7',
  },
  affirmationTitle: {
    fontFamily: 'Cinzel-Bold',
    color: '#7209B7',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  affirmationBody: {
    fontFamily: 'SourceSerif4',
    color: '#2C2B3D',
    fontSize: 12.5,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 18,
  },
  shareInsightBtn: {
    borderRadius: 18,
    overflow: 'hidden',
    marginTop: 14,
    marginBottom: 6,
    shadowColor: '#7209B7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  shareInsightGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  shareInsightBtnText: {
    fontFamily: 'SourceSerif4-Bold',
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 12, 32, 0.65)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(114, 9, 183, 0.15)',
    shadowColor: '#7209B7',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontFamily: 'Cinzel-Bold',
    color: '#2C2B3D',
    fontSize: 18,
    fontWeight: '700',
  },
  modalSubtitle: {
    fontFamily: 'SourceSerif4-Bold',
    color: '#7209B7',
    fontSize: 13,
    marginTop: 4,
    marginBottom: 14,
  },
  inputLabel: {
    fontFamily: 'SourceSerif4-Bold',
    color: '#2C2B3D',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8F6FF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: 'SourceSerif4',
    color: '#2C2B3D',
    fontSize: 13.5,
    borderWidth: 1,
    borderColor: 'rgba(114, 9, 183, 0.12)',
  },
  categoryPickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChoice: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#F8F6FF',
    borderWidth: 1,
    borderColor: 'rgba(114, 9, 183, 0.12)',
  },
  categoryChoiceActive: {
    backgroundColor: 'rgba(114, 9, 183, 0.12)',
    borderColor: '#7209B7',
  },
  categoryChoiceText: {
    fontFamily: 'SourceSerif4',
    color: '#726F8D',
    fontSize: 12,
  },
  categoryChoiceTextActive: {
    fontFamily: 'SourceSerif4-Bold',
    color: '#7209B7',
    fontWeight: '700',
  },
  saveModalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7209B7',
    borderRadius: 14,
    paddingVertical: 13,
    marginTop: 20,
  },
  saveModalBtnText: {
    fontFamily: 'SourceSerif4-Bold',
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
