import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  useWindowDimensions,
  Modal,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
  Keyboard,
  ActivityIndicator,
  BackHandler,
  ToastAndroid,
  Alert,
  Linking,
  PanResponder,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
let RNIap: any = null;
try {
  RNIap = require('react-native-iap');
} catch (e) {
  // Silent fallback for Expo Go to keep the console clean
}
import { 
  setAuthToken, 
  saveBasicProfile, 
  apiFetch,
  fetchBirthChart,
  getNumerologyData,
  generateInsights,
  getReadingHistory,
  fetchChatList,
  createChat,
  fetchChatMessages,
  sendChatMessage,
  fetchReportList,
  fetchCredits,
  verifyIAPPayment,
  deleteAccount,
} from './api';
import Svg, { Line as SvgLine, Rect as SvgRect, Circle as SvgCircle, Path as SvgPath, G as SvgG, Text as SvgTextEl, Defs as SvgDefs, Polygon as SvgPolygon, RadialGradient as SvgRadialGradient, LinearGradient as SvgLinearGradient, Stop as SvgStop } from 'react-native-svg';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

// Consistent Cross-Platform 3D Gold Coin Vector Icon (iOS & Android)
const GoldCoin = ({ size = 18, style }: { size?: number; style?: any }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <SvgDefs>
      <SvgLinearGradient id="goldCoinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <SvgStop offset="0%" stopColor="#FFE066" />
        <SvgStop offset="50%" stopColor="#F5B041" />
        <SvgStop offset="100%" stopColor="#D4AC0D" />
      </SvgLinearGradient>
      <SvgLinearGradient id="goldCoinBorder" x1="0%" y1="0%" x2="100%" y2="100%">
        <SvgStop offset="0%" stopColor="#FFF59D" />
        <SvgStop offset="100%" stopColor="#B7950B" />
      </SvgLinearGradient>
    </SvgDefs>
    <SvgCircle cx="12" cy="12" r="10.5" fill="url(#goldCoinGrad)" stroke="url(#goldCoinBorder)" strokeWidth="1.2" />
    <SvgCircle cx="12" cy="12" r="8" fill="none" stroke="#FFFFFF" strokeOpacity="0.45" strokeWidth="0.8" />
    <SvgPath d="M12 6.8l1.5 3.2 3.5.5-2.5 2.5.6 3.5-3.1-1.6-3.1 1.6.6-3.5-2.5-2.5 3.5-.5z" fill="#6B4B00" opacity="0.9" />
  </Svg>
);
import {
  ArrowLeft,
  Sparkles,
  ChevronUp,
  Compass,
  Calendar,
  LogOut,
  Moon,
  Sun,
  Flame,
  Droplet,
  Wind,
  Globe,
  Briefcase,
  Heart,
  Smile,
  CircleDollarSign,
  TrendingUp,
  X,
  PlusCircle,
  AlertTriangle,
  Clock,
  Shirt,
  Info,
  CheckCircle,
  Eye,
  Palette,
  Camera,
  Layers,
  History,
  MessageSquare,
  Send,
  User,
  Hash,
  Grid,
  Brain,
  Bell,
  Share2,
  Lock,
  FileText,
  Trash2,
  HelpCircle,
} from 'lucide-react-native';
import type PalmReadingScreenComp from './PalmReadingScreen';
import type FaceReadingScreenComp from './FaceReadingScreen';
import type CoffeeReadingScreenComp from './CoffeeReadingScreen';
import type StyleForecasterScreenComp from './StyleForecasterScreen';
import type TarotReadingScreenComp from './TarotReadingScreen';
import type AstroCalendarScreenComp from './AstroCalendarScreen';
import { ShareCardModal } from './ShareCardModal';
import { ShareCardData } from './shareUtils';
import { haptic } from './haptics';
import { useTheme } from './theme';

// Lazily load sub-screens to improve startup time and memory footprint on older devices
const PalmReadingScreen = (props: React.ComponentProps<typeof PalmReadingScreenComp>) => {
  const Screen = require('./PalmReadingScreen').default;
  return <Screen {...props} />;
};
const FaceReadingScreen = (props: React.ComponentProps<typeof FaceReadingScreenComp>) => {
  const Screen = require('./FaceReadingScreen').default;
  return <Screen {...props} />;
};
const CoffeeReadingScreen = (props: React.ComponentProps<typeof CoffeeReadingScreenComp>) => {
  const Screen = require('./CoffeeReadingScreen').default;
  return <Screen {...props} />;
};
const StyleForecasterScreen = (props: React.ComponentProps<typeof StyleForecasterScreenComp>) => {
  const Screen = require('./StyleForecasterScreen').default;
  return <Screen {...props} />;
};
const TarotReadingScreen = (props: React.ComponentProps<typeof TarotReadingScreenComp>) => {
  const Screen = require('./TarotReadingScreen').default;
  return <Screen {...props} />;
};
const AstroCalendarScreen = (props: React.ComponentProps<typeof AstroCalendarScreenComp>) => {
  const Screen = require('./AstroCalendarScreen').default;
  return <Screen {...props} />;
};

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const MONTHS = [
  { value: 1, label: 'Jan' },
  { value: 2, label: 'Feb' },
  { value: 3, label: 'Mar' },
  { value: 4, label: 'Apr' },
  { value: 5, label: 'May' },
  { value: 6, label: 'Jun' },
  { value: 7, label: 'Jul' },
  { value: 8, label: 'Aug' },
  { value: 9, label: 'Sep' },
  { value: 10, label: 'Oct' },
  { value: 11, label: 'Nov' },
  { value: 12, label: 'Dec' },
];
const YEARS = Array.from({ length: 100 }, (_, i) => 2026 - i); // 2026 down to 1927

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

const { width, height } = Dimensions.get('window');

// 12 Zodiac icons mapping
const ZODIAC_ICONS: Record<number, any> = {
  1: require('./assets/icons/astro_icon_1.png'), // Aries
  2: require('./assets/icons/astro_icon_2.png'), // Taurus
  3: require('./assets/icons/astro_icon_3.png'), // Gemini
  4: require('./assets/icons/astro_icon_4.png'), // Cancer
  5: require('./assets/icons/astro_icon_5.png'), // Leo
  6: require('./assets/icons/astro_icon_6.png'), // Virgo
  7: require('./assets/icons/astro_icon_7.png'), // Libra
  8: require('./assets/icons/astro_icon_8.png'), // Scorpio
  9: require('./assets/icons/astro_icon_9.png'), // Sagittarius
  10: require('./assets/icons/astro_icon_10.png'), // Capricorn
  11: require('./assets/icons/astro_icon_11.png'), // Aquarius
  12: require('./assets/icons/astro_icon_12.png'), // Pisces
};

function getZodiacInfo(day: number, month: number): { name: string; index: number; element: string; elementIcon: any; planet: string } {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
    return { name: "Aries", index: 1, element: "Fire", elementIcon: Flame, planet: "Mars" };
  } else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) {
    return { name: "Taurus", index: 2, element: "Earth", elementIcon: Globe, planet: "Venus" };
  } else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) {
    return { name: "Gemini", index: 3, element: "Air", elementIcon: Wind, planet: "Mercury" };
  } else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) {
    return { name: "Cancer", index: 4, element: "Water", elementIcon: Droplet, planet: "Moon" };
  } else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
    return { name: "Leo", index: 5, element: "Fire", elementIcon: Flame, planet: "Sun" };
  } else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
    return { name: "Virgo", index: 6, element: "Earth", elementIcon: Globe, planet: "Mercury" };
  } else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) {
    return { name: "Libra", index: 7, element: "Air", elementIcon: Wind, planet: "Venus" };
  } else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) {
    return { name: "Scorpio", index: 8, element: "Water", elementIcon: Droplet, planet: "Pluto" };
  } else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) {
    return { name: "Sagittarius", index: 9, element: "Fire", elementIcon: Flame, planet: "Jupiter" };
  } else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
    return { name: "Capricorn", index: 10, element: "Earth", elementIcon: Globe, planet: "Saturn" };
  } else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
    return { name: "Aquarius", index: 11, element: "Air", elementIcon: Wind, planet: "Uranus" };
  } else {
    return { name: "Pisces", index: 12, element: "Water", elementIcon: Droplet, planet: "Neptune" };
  }
}

// ─────────────────── Astro Map (Birth Chart + Kundli) reference data ───────────────────
const RASHIS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const RASHI_GLYPHS = ['♈\uFE0E', '♉\uFE0E', '♊\uFE0E', '♋\uFE0E', '♌\uFE0E', '♍\uFE0E', '♎\uFE0E', '♏\uFE0E', '♐\uFE0E', '♑\uFE0E', '♒\uFE0E', '♓\uFE0E'];
const NAKSHATRAS = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'];
// Element per 0-based sign index (Aries=0)
const SIGN_ELEMENT = ['Fire', 'Earth', 'Air', 'Water', 'Fire', 'Earth', 'Air', 'Water', 'Fire', 'Earth', 'Air', 'Water'];
const HOUSE_THEMES = ['', 'Self & Personality', 'Wealth & Speech', 'Courage & Siblings', 'Home & Mother', 'Creativity & Children', 'Health & Service', 'Partnership & Marriage', 'Transformation & Depth', 'Fortune & Dharma', 'Career & Status', 'Gains & Aspirations', 'Release & Spirituality'];
const ORD = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];

interface PlanetMeta {
  key: string; name: string; san: string; glyph: string; abbr: string; color: string; theme: string;
  house: number; degree: number; retro: boolean;
}

const PLANET_BASE: Omit<PlanetMeta, 'house' | 'degree' | 'retro'>[] = [
  { key: 'sun', name: 'Sun', san: 'Surya', glyph: '☉', abbr: 'Su', color: '#E8A200', theme: 'soul, vitality & ego' },
  { key: 'moon', name: 'Moon', san: 'Chandra', glyph: '☽', abbr: 'Mo', color: '#5B8DEF', theme: 'mind, emotions & instincts' },
  { key: 'mars', name: 'Mars', san: 'Mangal', glyph: '♂', abbr: 'Ma', color: '#E5484D', theme: 'energy, drive & courage' },
  { key: 'mercury', name: 'Mercury', san: 'Budh', glyph: '☿', abbr: 'Me', color: '#12A594', theme: 'intellect & communication' },
  { key: 'jupiter', name: 'Jupiter', san: 'Guru', glyph: '♃', abbr: 'Ju', color: '#D9730D', theme: 'wisdom, growth & fortune' },
  { key: 'venus', name: 'Venus', san: 'Shukra', glyph: '♀', abbr: 'Ve', color: '#E5439E', theme: 'love, beauty & comfort' },
  { key: 'saturn', name: 'Saturn', san: 'Shani', glyph: '♄', abbr: 'Sa', color: '#6E56CF', theme: 'discipline, karma & patience' },
  { key: 'rahu', name: 'Rahu', san: 'Rahu', glyph: '☊', abbr: 'Ra', color: '#8B8B8B', theme: 'ambition & worldly desire' },
  { key: 'ketu', name: 'Ketu', san: 'Ketu', glyph: '☋', abbr: 'Ke', color: '#8B8B8B', theme: 'detachment & liberation' },
];

function renderPlanet2DShapes(planetKey: string, color: string) {
  const strokeW = 1.6;
  switch (planetKey) {
    case 'sun':
      return (
        <SvgG>
          <SvgCircle cx={0} cy={0} r={4.2} stroke={color} strokeWidth={strokeW} fill="none" />
          <SvgCircle cx={0} cy={0} r={1.2} fill={color} />
        </SvgG>
      );
    case 'moon':
      return (
        <SvgPath d="M 1.8 -4 C -2.2 -4 -2.2 4 1.8 4 C 0.3 2.5 0.3 -2.5 1.8 -4 Z" fill={color} />
      );
    case 'mars':
      return (
        <SvgG>
          <SvgCircle cx={-1.2} cy={1.2} r={3.2} stroke={color} strokeWidth={strokeW} fill="none" />
          <SvgPath d="M 1 -1 L 3.8 -3.8 M 1.8 -3.8 L 3.8 -3.8 L 3.8 -1.8" stroke={color} strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </SvgG>
      );
    case 'mercury':
      return (
        <SvgG>
          <SvgCircle cx={0} cy={0.5} r={2.8} stroke={color} strokeWidth={strokeW} fill="none" />
          <SvgLine x1={0} y1={3.3} x2={0} y2={5.8} stroke={color} strokeWidth={strokeW} strokeLinecap="round" />
          <SvgLine x1={-1.8} y1={4.5} x2={1.8} y2={4.5} stroke={color} strokeWidth={strokeW} strokeLinecap="round" />
          <SvgPath d="M -2.8 -3.2 C -2.8 -1.5 2.8 -1.5 2.8 -3.2" stroke={color} strokeWidth={strokeW} strokeLinecap="round" fill="none" />
        </SvgG>
      );
    case 'jupiter':
      return (
        <SvgPath d="M -2.5 -2.2 C -2.5 -3.7 -1 -4.5 0.5 -4.5 C 2 -4.5 2 -2.5 1 -1.5 L -3.2 3 L 3.2 3 M 0.8 -3 L 0.8 4.5" stroke={color} strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      );
    case 'venus':
      return (
        <SvgG>
          <SvgCircle cx={0} cy={-1.5} r={3.0} stroke={color} strokeWidth={strokeW} fill="none" />
          <SvgLine x1={0} y1={1.5} x2={0} y2={5.0} stroke={color} strokeWidth={strokeW} strokeLinecap="round" />
          <SvgLine x1={-2} y1={3.2} x2={2} y2={3.2} stroke={color} strokeWidth={strokeW} strokeLinecap="round" />
        </SvgG>
      );
    case 'saturn':
      return (
        <SvgPath d="M -1.8 -4.5 L -1.8 1.5 C -1.8 3.5 -3.2 3.5 -3.6 3.5 M -3.2 -2.2 L 0.5 -2.2 M -1.8 0.5 C 0.5 0.5 1.8 2 1.8 3.5 C 1.8 5 0.2 5 -0.8 5" stroke={color} strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      );
    case 'rahu':
      return (
        <SvgG>
          <SvgCircle cx={-2.5} cy={2.5} r={1.5} stroke={color} strokeWidth={strokeW} fill="none" />
          <SvgCircle cx={2.5} cy={2.5} r={1.5} stroke={color} strokeWidth={strokeW} fill="none" />
          <SvgPath d="M -2.5 1 C -2.5 -2.2 2.5 -2.2 2.5 1" stroke={color} strokeWidth={strokeW} strokeLinecap="round" fill="none" />
        </SvgG>
      );
    case 'ketu':
      return (
        <SvgG>
          <SvgCircle cx={-2.5} cy={-2.5} r={1.5} stroke={color} strokeWidth={strokeW} fill="none" />
          <SvgCircle cx={2.5} cy={-2.5} r={1.5} stroke={color} strokeWidth={strokeW} fill="none" />
          <SvgPath d="M -2.5 -1 C -2.5 2.2 2.5 2.2 2.5 -1" stroke={color} strokeWidth={strokeW} strokeLinecap="round" fill="none" />
        </SvgG>
      );
    default:
      return null;
  }
}

function PlanetIcon2D({ planetKey, color, size = 16 }: { planetKey: string; color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="-6 -6 12 12" style={{ marginRight: size * 0.2 }}>
      {renderPlanet2DShapes(planetKey, color)}
    </Svg>
  );
}

// Demo placements — house is fixed; the actual sign is derived from the user's ascendant
// so each user sees a personalized (but consistent) chart. Rahu/Ketu are kept 180° apart.
const DEMO_PLACEMENT: Record<string, { house: number; degree: number; retro: boolean }> = {
  sun: { house: 1, degree: 23.4, retro: false },
  mercury: { house: 1, degree: 9.8, retro: false },
  venus: { house: 2, degree: 5.2, retro: false },
  moon: { house: 4, degree: 12.1, retro: false },
  mars: { house: 5, degree: 18.7, retro: false },
  rahu: { house: 6, degree: 14.0, retro: true },
  jupiter: { house: 11, degree: 2.9, retro: false },
  saturn: { house: 12, degree: 27.3, retro: true },
  ketu: { house: 12, degree: 14.0, retro: true },
};

// 0-based rashi (sign) index occupying a given house for a given ascendant (whole-sign houses)
function signForHouse(ascIndex0: number, house: number): number {
  return (ascIndex0 + house - 1) % 12;
}

function buildDemoChart(): PlanetMeta[] {
  return PLANET_BASE.map(p => ({ ...p, ...DEMO_PLACEMENT[p.key] }));
}

// ── North Indian diamond kundli (SVG) ──
function KundliDiamond({ size, ascIndex0, planets, selectedKey, houses }: {
  size: number; ascIndex0: number; planets: PlanetMeta[]; selectedKey: string | null; houses: any;
}) {
  const S = size;
  const stroke = '#7209B7';
  const houseFrac: Record<number, [number, number]> = {
    1: [0.5, 0.25], 2: [0.25, 0.12], 3: [0.12, 0.25], 4: [0.25, 0.5], 5: [0.12, 0.75], 6: [0.25, 0.88],
    7: [0.5, 0.75], 8: [0.75, 0.88], 9: [0.88, 0.75], 10: [0.75, 0.5], 11: [0.88, 0.25], 12: [0.75, 0.12],
  };
  const rashiToIndex: Record<string, number> = {
    Aries: 0, Taurus: 1, Gemini: 2, Cancer: 3, Leo: 4, Virgo: 5,
    Libra: 6, Scorpio: 7, Sagittarius: 8, Capricorn: 9, Aquarius: 10, Pisces: 11
  };
  const getHouseSign = (houseNum: number) => {
    if (houses && houses[houseNum.toString()]) {
      return houses[houseNum.toString()];
    }
    if (houses && houses[houseNum]) {
      return houses[houseNum];
    }
    const signIdx = (ascIndex0 + houseNum - 1) % 12;
    return RASHIS[signIdx];
  };
  const getHouseSignIndex = (houseNum: number) => {
    const signName = getHouseSign(houseNum);
    return rashiToIndex[signName] ?? 0;
  };
  const selHouse = selectedKey ? planets.find(p => p.key === selectedKey)?.house ?? null : null;
  return (
    <Svg width={S} height={S}>
      <SvgRect x={1} y={1} width={S - 2} height={S - 2} fill="#FFFFFF" stroke={stroke} strokeWidth={Math.max(1.5, S * 0.007)} rx={6} />
      <SvgLine x1={2} y1={2} x2={S - 2} y2={S - 2} stroke={stroke} strokeWidth={Math.max(0.75, S * 0.0035)} />
      <SvgLine x1={S - 2} y1={2} x2={2} y2={S - 2} stroke={stroke} strokeWidth={Math.max(0.75, S * 0.0035)} />
      <SvgPath d={`M ${S / 2} 2 L ${S - 2} ${S / 2} L ${S / 2} ${S - 2} L 2 ${S / 2} Z`} fill="none" stroke={stroke} strokeWidth={Math.max(0.75, S * 0.0035)} />
      {Object.keys(houseFrac).map(hk => {
        const h = Number(hk);
        const [fx, fy] = houseFrac[h];
        const cx = fx * S, cy = fy * S;
        const signIdx = getHouseSignIndex(h);
        const here = planets.filter(p => p.house === h);
        const isSel = selHouse === h;
        return (
          <SvgG key={h}>
            {isSel && <SvgCircle cx={cx} cy={cy} r={S * 0.09} fill="rgba(247,37,133,0.12)" stroke="#F72585" strokeWidth={Math.max(1, S * 0.0035)} />}
            <SvgTextEl x={cx} y={cy - (S * 0.03)} fontSize={Math.max(9, S * 0.03)} fill="#B3A2E7" textAnchor="middle" fontFamily="Cinzel-Bold">{signIdx + 1}</SvgTextEl>
            {here.length > 0 && (
              <SvgTextEl x={cx} y={cy + (S * 0.03)} fontSize={Math.max(11, S * 0.037)} fill="#2C2B3D" textAnchor="middle" fontFamily="Cinzel-Bold">
                {here.map(p => p.abbr + (p.retro ? '↺' : '')).join('  ')}
              </SvgTextEl>
            )}
          </SvgG>
        );
      })}
      <SvgTextEl x={S / 2} y={S * 0.25 - (S * 0.07)} fontSize={Math.max(7.5, S * 0.025)} fill="#7209B7" textAnchor="middle" fontFamily="Cinzel-Bold">ASC</SvgTextEl>
    </Svg>
  );
}

// ── Professional Western circular birth-chart wheel (SVG) ──
// Inspired by Co-Star / Astro Gold: element-colored zodiac segments,
// degree ticks, aspect lines, precise planet degree positioning.
const ELEMENT_BAND_COLORS: Record<string, string> = {
  Fire: '#E5484D', Earth: '#12A594', Air: '#5B8DEF', Water: '#6E56CF',
};
// Aspect definitions: angle tolerance ±8°
const ASPECT_DEFS = [
  { name: 'conjunction', angle: 0, orb: 8, color: '#E8A200', dash: '' },
  { name: 'sextile', angle: 60, orb: 6, color: '#12A594', dash: '4,3' },
  { name: 'square', angle: 90, orb: 8, color: '#E5484D', dash: '' },
  { name: 'trine', angle: 120, orb: 8, color: '#5B8DEF', dash: '' },
  { name: 'opposition', angle: 180, orb: 8, color: '#E5484D', dash: '6,3' },
];

function BirthChartWheel({ size, ascIndex0, planets, selectedKey }: {
  size: number; ascIndex0: number; planets: PlanetMeta[]; selectedKey: string | null;
}) {
  const cx = size / 2, cy = size / 2;
  const pad = 4;
  // Ring radii (outermost → innermost) - dynamically proportional to size
  const rOuter = size / 2 - pad;                      // outermost edge
  const rZodiacInner = rOuter * 0.80;                 // inner edge of zodiac band (Zodiac band is 20% of R)
  const rHouseBand = rZodiacInner - 2;                // house ring outer
  const rHouseInner = rHouseBand - (rOuter * 0.15);    // house ring inner (House band is 15% of R)
  const rPlanetRing = rHouseInner - (rOuter * 0.08);   // planet placement ring
  const rAspectArea = rPlanetRing - (rOuter * 0.13);   // aspect line endpoints
  const rHub = rOuter * 0.115;                         // center hub

  // Ascendant rotation: sign 0 (Aries) starts at ascIndex0 * 30°
  // In a natal chart, the ascendant is placed at the 9 o'clock position (270° or left).
  // Offset = 270 - (ascIndex0 * 30) to rotate the entire chart so the ascendant
  // sign sits at the left horizon.
  const ascOffset = -15;

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toXY = (angleDeg: number, r: number) => {
    const rad = toRad(angleDeg);
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  // Describe an SVG arc path from angle a1 to a2 at radius r
  const arcPath = (a1: number, a2: number, rIn: number, rOut: number) => {
    const p1o = toXY(a1, rOut);
    const p2o = toXY(a2, rOut);
    const p1i = toXY(a1, rIn);
    const p2i = toXY(a2, rIn);
    const large = (a2 - a1) > 180 ? 1 : 0;
    return `M ${p1o.x} ${p1o.y} A ${rOut} ${rOut} 0 ${large} 1 ${p2o.x} ${p2o.y} L ${p2i.x} ${p2i.y} A ${rIn} ${rIn} 0 ${large} 0 ${p1i.x} ${p1i.y} Z`;
  };

  // Compute absolute ecliptic longitude for each planet
  const planetLongitudes = planets.map(p => {
    const signIdx = signForHouse(ascIndex0, p.house);
    return { ...p, longitude: signIdx * 30 + p.degree };
  });

  // Convert ecliptic longitude to chart angle (respecting ascendant rotation)
  const lonToAngle = (lon: number) => (lon + ascOffset) % 360;

  // Compute aspects between planets
  const aspects: { p1: string; p2: string; a1: number; a2: number; color: string; dash: string }[] = [];
  for (let i = 0; i < planetLongitudes.length; i++) {
    for (let j = i + 1; j < planetLongitudes.length; j++) {
      const diff = Math.abs(planetLongitudes[i].longitude - planetLongitudes[j].longitude);
      const normalDiff = diff > 180 ? 360 - diff : diff;
      for (const asp of ASPECT_DEFS) {
        if (Math.abs(normalDiff - asp.angle) <= asp.orb) {
          aspects.push({
            p1: planetLongitudes[i].key,
            p2: planetLongitudes[j].key,
            a1: lonToAngle(planetLongitudes[i].longitude),
            a2: lonToAngle(planetLongitudes[j].longitude),
            color: asp.color,
            dash: asp.dash,
          });
          break;
        }
      }
    }
  }

  return (
    <Svg width={size} height={size}>
      <SvgDefs>
        <SvgRadialGradient id="cosmicBg" cx="50%" cy="50%" rx="50%" ry="50%">
          <SvgStop offset="0%" stopColor="#FFFFFF" stopOpacity={1} />
          <SvgStop offset="65%" stopColor="#F6F4FF" stopOpacity={1} />
          <SvgStop offset="100%" stopColor="#ECE8FF" stopOpacity={0.85} />
        </SvgRadialGradient>
        <SvgLinearGradient id="hubGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <SvgStop offset="0%" stopColor="#7209B7" />
          <SvgStop offset="100%" stopColor="#F72585" />
        </SvgLinearGradient>
      </SvgDefs>

      {/* Backgrounds */}
      <SvgCircle cx={cx} cy={cy} r={rOuter} fill="#FAFAFE" stroke="none" />
      <SvgCircle cx={cx} cy={cy} r={rZodiacInner} fill="url(#cosmicBg)" stroke="none" />

      {/* ── 1. Element-colored Zodiac Band Segments ── */}
      {Array.from({ length: 12 }).map((_, i) => {
        const startAngle = i * 30 + ascOffset;
        const endAngle = startAngle + 30;
        const element = SIGN_ELEMENT[i];
        const fillColor = ELEMENT_BAND_COLORS[element] + '18'; // 18 = ~10% opacity hex
        const strokeColor = ELEMENT_BAND_COLORS[element] + '40';
        return (
          <SvgPath
            key={`zband-${i}`}
            d={arcPath(startAngle, endAngle, rZodiacInner, rOuter)}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={0.5}
          />
        );
      })}

      {/* Outer border ring */}
      <SvgCircle cx={cx} cy={cy} r={rOuter} fill="none" stroke="#7209B7" strokeWidth={1.5} />
      {/* Inner border of zodiac band */}
      <SvgCircle cx={cx} cy={cy} r={rZodiacInner} fill="none" stroke="rgba(114,9,183,0.3)" strokeWidth={1} />

      {/* ── 2. Degree Tick Marks ── */}
      {Array.from({ length: 360 / 5 }).map((_, i) => {
        const angle = i * 5 + ascOffset;
        const isMajor = i % 6 === 0; // every 30° = sign boundary
        const rTickOuter = rOuter;
        const rTickInner = isMajor ? rZodiacInner : rOuter - (i % 2 === 0 ? Math.max(4, rOuter * 0.04) : Math.max(2, rOuter * 0.02));
        const p1 = toXY(angle, rTickOuter);
        const p2 = toXY(angle, rTickInner);
        return (
          <SvgLine
            key={`tick-${i}`}
            x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
            stroke={isMajor ? '#7209B7' : 'rgba(114,9,183,0.2)'}
            strokeWidth={isMajor ? 1 : 0.5}
          />
        );
      })}

      {/* ── 3. Zodiac Sign Glyphs in the band ── */}
      {Array.from({ length: 12 }).map((_, i) => {
        const center = i * 30 + 15 + ascOffset;
        const pos = toXY(center, (rOuter + rZodiacInner) / 2);
        const isAsc = i === ascIndex0;
        return (
          <SvgTextEl
            key={`sign-${i}`}
            x={pos.x}
            y={pos.y + (rOuter * 0.035)}
            fontSize={Math.max(16, rOuter * 0.115)}
            fill={isAsc ? '#7209B7' : ELEMENT_BAND_COLORS[SIGN_ELEMENT[i]]}
            textAnchor="middle"
            fontWeight={isAsc ? 'bold' : 'normal'}
          >
            {RASHI_GLYPHS[i]}
          </SvgTextEl>
        );
      })}

      {/* ── 4. House Ring ── */}
      <SvgCircle cx={cx} cy={cy} r={rHouseInner} fill="none" stroke="rgba(114,9,183,0.12)" strokeWidth={0.5} />

      {/* Astronomical Concentric Orbit Rings */}
      <SvgCircle cx={cx} cy={cy} r={rHub * 1.6} fill="none" stroke="rgba(114,9,183,0.06)" strokeWidth={0.6} />
      <SvgCircle cx={cx} cy={cy} r={rHub * 2.3} fill="none" stroke="rgba(114,9,183,0.05)" strokeWidth={0.6} strokeDasharray="3,3" />
      <SvgCircle cx={cx} cy={cy} r={rHub * 3.1} fill="none" stroke="rgba(114,9,183,0.06)" strokeWidth={0.6} />

      {/* House cusp lines from inner to zodiac band */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = i * 30 + ascOffset;
        const p1 = toXY(angle, rZodiacInner);
        const p2 = toXY(angle, rHouseInner);
        return (
          <SvgLine
            key={`cusp-${i}`}
            x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
            stroke="rgba(114,9,183,0.15)"
            strokeWidth={0.75}
          />
        );
      })}

      {/* House numbers */}
      {Array.from({ length: 12 }).map((_, i) => {
        const houseNum = i + 1;
        const signIdx = signForHouse(ascIndex0, houseNum);
        const center = signIdx * 30 + 15 + ascOffset;
        const pos = toXY(center, (rHouseBand + rHouseInner) / 2);
        return (
          <SvgTextEl
            key={`hnum-${i}`}
            x={pos.x}
            y={pos.y + (rOuter * 0.02)}
            fontSize={Math.max(8, rOuter * 0.055)}
            fill="#B3A2E7"
            textAnchor="middle"
            fontWeight="bold"
          >
            {houseNum}
          </SvgTextEl>
        );
      })}

      {/* ── 5. Aspect Lines (center area) ── */}
      {aspects.map((asp, idx) => {
        const p1 = toXY(asp.a1, rAspectArea);
        const p2 = toXY(asp.a2, rAspectArea);
        const isHighlighted = selectedKey && (asp.p1 === selectedKey || asp.p2 === selectedKey);
        return (
          <SvgLine
            key={`asp-${idx}`}
            x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
            stroke={asp.color}
            strokeWidth={isHighlighted ? Math.max(2.5, rOuter * 0.018) : Math.max(1.2, rOuter * 0.009)}
            strokeDasharray={asp.dash || undefined}
            opacity={isHighlighted ? 0.95 : 0.45}
          />
        );
      })}

      {/* ── 6. Planet Glyphs (positioned by actual degree) ── */}
      {planetLongitudes.map((p, _idx) => {
        const angle = lonToAngle(p.longitude);
        const pos = toXY(angle, rPlanetRing);
        const sel = selectedKey === p.key;
        const radiusBg = Math.max(8, rOuter * 0.055);
        const radiusSel = Math.max(12, rOuter * 0.08);
        return (
          <SvgG key={`pl-${p.key}`}>
            {sel && (
              <SvgCircle
                cx={pos.x} cy={pos.y} r={radiusSel}
                fill="rgba(247,37,133,0.12)"
                stroke="#F72585"
                strokeWidth={Math.max(1, rOuter * 0.008)}
              />
            )}
            {/* Outer transparent constellation halo */}
            <SvgCircle
              cx={pos.x} cy={pos.y} r={radiusBg * 1.35}
              fill="none"
              stroke={p.color + '22'}
              strokeWidth={0.75}
            />
            {/* Core pedestal circle */}
            <SvgCircle
              cx={pos.x} cy={pos.y} r={radiusBg}
              fill="#FFFFFF"
              stroke={sel ? '#F72585' : p.color}
              strokeWidth={sel ? Math.max(1.5, rOuter * 0.01) : Math.max(1, rOuter * 0.006)}
            />
            <SvgG transform={`translate(${pos.x} ${pos.y}) scale(${radiusBg / 7.5})`}>
              {renderPlanet2DShapes(p.key, p.color)}
            </SvgG>
          </SvgG>
        );
      })}

      {/* ── 7. ASC / DSC axis marker ── */}
      {(() => {
        const ascAngle = ascIndex0 * 30 + 15 + ascOffset;
        const arrowOffset = rOuter * 0.015;
        const arrowTipLen = rOuter * 0.04;
        const ascOuter = toXY(ascAngle, rZodiacInner + arrowOffset);
        const ascTip = toXY(ascAngle, rZodiacInner - arrowTipLen);
        // Small arrow pointing inward
        const aLeft = toXY(ascAngle - 3, rZodiacInner + arrowOffset);
        const aRight = toXY(ascAngle + 3, rZodiacInner + arrowOffset);
        const labelOffset = rOuter * 0.08;
        return (
          <SvgG>
            <SvgPolygon
              points={`${ascTip.x},${ascTip.y} ${aLeft.x},${aLeft.y} ${aRight.x},${aRight.y}`}
              fill="#F72585"
            />
            <SvgTextEl
              x={toXY(ascAngle, rZodiacInner - labelOffset).x}
              y={toXY(ascAngle, rZodiacInner - labelOffset).y + (rOuter * 0.02)}
              fontSize={Math.max(7, rOuter * 0.05)}
              fill="#F72585"
              textAnchor="middle"
              fontWeight="bold"
            >
              ASC
            </SvgTextEl>
          </SvgG>
        );
      })()}

      {/* ── 8. Central Hub Medallion ── */}
      {(() => {
        const hubR = rOuter * 0.135;
        return (
          <SvgG>
            {/* Outer soft glow ring */}
            <SvgCircle cx={cx} cy={cy} r={hubR * 1.3} fill="rgba(114,9,183,0.04)" stroke="rgba(114,9,183,0.12)" strokeWidth={1} />
            {/* Core gradient circle */}
            <SvgCircle cx={cx} cy={cy} r={hubR} fill="url(#hubGradient)" stroke="#FFFFFF" strokeWidth={1.5} />
            {/* Inner details accent line */}
            <SvgCircle cx={cx} cy={cy} r={hubR - 2.5} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={0.75} />
            {/* White Ascendant Zodiac Sign Glyph */}
            <SvgTextEl x={cx} y={cy + (hubR * 0.35)} fontSize={Math.max(16, rOuter * 0.11)} fill="#FFFFFF" textAnchor="middle" fontWeight="bold">
              {RASHI_GLYPHS[ascIndex0]}
            </SvgTextEl>
          </SvgG>
        );
      })()}
    </Svg>
  );
}

const LIFE_PATH_DATA: Record<number, { title: string; desc: string }> = {
  1: {
    title: "THE VIBRATION OF LEADERSHIP & INITIATIVE",
    desc: "A path of independence, pioneer spirit, and self-reliance. You are meant to create your own lane and lead others."
  },
  2: {
    title: "THE VIBRATION OF HARMONY & COOPERATION",
    desc: "A path of diplomacy, balance, and partnership. Your strength lies in intuition, collaboration, and peace-making."
  },
  3: {
    title: "THE VIBRATION OF EXPRESSION & CREATIVITY",
    desc: "A path of self-expression, communication, and joy. You are here to inspire, create art, and spread optimism."
  },
  4: {
    title: "THE VIBRATION OF STRUCTURE & PRACTICALITY",
    desc: "A path of dedication, organization, and building foundations. Your strength lies in systematic execution."
  },
  5: {
    title: "THE VIBRATION OF FREEDOM & ADVENTURE",
    desc: "A path of dynamic change, resourcefulness, and exploration. You thrive on adaptability and freedom."
  },
  6: {
    title: "THE VIBRATION OF NURTURING & RESPONSIBILITY",
    desc: "A path of service, healing, and domestic harmony. Your focus is on loving support, counseling, and home."
  },
  7: {
    title: "THE VIBRATION OF WISDOM & INNER ANALYSIS",
    desc: "A path of spiritual seeking, investigation, and analysis. Your journey is to seek truth and master your mind."
  },
  8: {
    title: "THE VIBRATION OF POWER & MATERIAL FLOW",
    desc: "A path of balance, manifest strength, and material success. You are here to master the flow of wealth and authority."
  },
  9: {
    title: "THE VIBRATION OF HUMANITARIANISM & INTEGRATION",
    desc: "A path of universal love, completion, and spiritual tolerance. You are meant to serve the greater good."
  }
};

const PYTHAGOREAN_GRID_INFO: Record<number, { title: string; meaning: string; element: string }> = {
  1: {
    title: "Ego & Self-Expression",
    meaning: "The center of communication, self-will, and individuality. Dictates how you project your personality to the world.",
    element: "Metal"
  },
  2: {
    title: "Intuition & Dualism",
    meaning: "Represents sensitivity, dual relationships, and balance. Highlights emotional depth and cooperative diplomacy.",
    element: "Earth"
  },
  3: {
    title: "Mental Spark & Creativity",
    meaning: "The plane of intellect, imagination, memory, and artistic expression. Drives your conceptual planning and ideas.",
    element: "Wood"
  },
  4: {
    title: "Practicality & Foundation",
    meaning: "Governs manual dexterity, physical actions, organization, and systematic work. Defines grounding in details.",
    element: "Wood"
  },
  5: {
    title: "Emotional Core & Freedom",
    meaning: "The heart center of the grid. Governs emotional control, freedom, adventure, and the link between planes.",
    element: "Earth"
  },
  6: {
    title: "Domesticity & Creation",
    meaning: "Represents love, counseling, domestic duties, responsibility, and the creative side of the brain.",
    element: "Metal"
  },
  7: {
    title: "Sacrifice & Experience",
    meaning: "Represents learning through lessons, spiritual development, and philosophical growth. Often connected to sacrifice.",
    element: "Water"
  },
  8: {
    title: "Wisdom & Material success",
    meaning: "Represents financial stability, organization, independence, and cosmic wisdom applied to physical gains.",
    element: "Earth"
  },
  9: {
    title: "Humanitarian Idealism",
    meaning: "The plane of human service, idealistic thinking, completions, and universal love. High count points to leadership.",
    element: "Fire"
  }
};

function getPythagoreanGridCounts(name: string, dob: string): Record<number, number> {
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
  const dobDigits = dob.replace(/\D/g, '');
  for (let i = 0; i < dobDigits.length; i++) {
    const digit = parseInt(dobDigits[i], 10);
    if (digit >= 1 && digit <= 9) {
      counts[digit] = (counts[digit] || 0) + 1;
    }
  }
  const mapping: Record<string, number> = {
    a: 1, j: 1, s: 1,
    b: 2, k: 2, t: 2,
    c: 3, l: 3, u: 3,
    d: 4, m: 4, v: 4,
    e: 5, n: 5, w: 5,
    f: 6, o: 6, x: 6,
    g: 7, p: 7, y: 7,
    h: 8, q: 8, z: 8,
    i: 9, r: 9
  };
  const cleanName = name.toLowerCase().replace(/[^a-z]/g, '');
  for (let i = 0; i < cleanName.length; i++) {
    const val = mapping[cleanName[i]];
    if (val) {
      counts[val] = (counts[val] || 0) + 1;
    }
  }
  return counts;
}

function calculateLifePathNumber(dob: string): number {
  const digits = dob.replace(/\D/g, '');
  if (!digits) return 8;
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    sum += parseInt(digits[i], 10);
  }
  while (sum > 9) {
    let temp = 0;
    const sumStr = sum.toString();
    for (let i = 0; i < sumStr.length; i++) {
      temp += parseInt(sumStr[i], 10);
    }
    sum = temp;
  }
  return sum;
}

function calculateDestinyNumber(name: string): number {
  const mapping: Record<string, number> = {
    a: 1, j: 1, s: 1,
    b: 2, k: 2, t: 2,
    c: 3, l: 3, u: 3,
    d: 4, m: 4, v: 4,
    e: 5, n: 5, w: 5,
    f: 6, o: 6, x: 6,
    g: 7, p: 7, y: 7,
    h: 8, q: 8, z: 8,
    i: 9, r: 9
  };
  let sum = 0;
  const cleanName = name.toLowerCase().replace(/[^a-z]/g, '');
  for (let i = 0; i < cleanName.length; i++) {
    sum += mapping[cleanName[i]] || 0;
  }
  while (sum > 9) {
    let temp = 0;
    const sumStr = sum.toString();
    for (let i = 0; i < sumStr.length; i++) {
      temp += parseInt(sumStr[i], 10);
    }
    sum = temp;
  }
  return sum === 0 ? 4 : sum;
}

function calculateSoulUrgeNumber(name: string): number {
  const mapping: Record<string, number> = {
    a: 1, e: 5, i: 9, o: 6, u: 3
  };
  let sum = 0;
  const cleanName = name.toLowerCase().replace(/[^a-z]/g, '');
  for (let i = 0; i < cleanName.length; i++) {
    if ('aeiou'.includes(cleanName[i])) {
      sum += mapping[cleanName[i]] || 0;
    }
  }
  while (sum > 9) {
    let temp = 0;
    const sumStr = sum.toString();
    for (let i = 0; i < sumStr.length; i++) {
      temp += parseInt(sumStr[i], 10);
    }
    sum = temp;
  }
  return sum === 0 ? 7 : sum;
}

function getTabBlobColors(tab: string): readonly [string, string] {
  return ['#7209B7', '#F72585'];
}

interface FocusContent {
  title: string;
  moves: string[];
  doList: string[];
  avoidList: string[];
  powerWindow: string;
  avoidAfter: string;
  prediction: string;
  rationale: string;
}

const FOCUS_DATA: Record<'Work' | 'Love' | 'Mind' | 'Money', FocusContent> = {
  Work: {
    title: "Your Move in work",
    moves: [
      "Propose an innovative project at work",
      "Collaborate with a rival team to accelerate progress"
    ],
    doList: [
      "Pursue new certifications",
      "Attend industry-leading conferences"
    ],
    avoidList: [
      "Put off important reports",
      "Procrastinate on deadlines"
    ],
    powerWindow: "9:00 - 11:00 AM",
    avoidAfter: "2:00 - 4:00 PM",
    prediction: "Unexpected opportunity arises from a chance encounter",
    rationale: "Your bold moves will be met with curiosity and respect; seize the momentum."
  },
  Love: {
    title: "Your Move in love",
    moves: [
      "Initiate a deep conversation about future alignment",
      "Plan a surprise stargazing date night"
    ],
    doList: [
      "Listen actively without preparing replies",
      "Express vulnerability openly"
    ],
    avoidList: [
      "Bring up past arguments",
      "Make assumptions about feelings"
    ],
    powerWindow: "7:00 - 9:00 PM",
    avoidAfter: "1:00 - 3:00 PM",
    prediction: "A heartfelt text message will spark cosmic connections",
    rationale: "Emotional resonance is highlighted; open your heart blockages to receive."
  },
  Mind: {
    title: "Your Move in mind",
    moves: [
      "Practice 15 minutes of transcendental meditation",
      "Write down 3 subconscious dreams from last night"
    ],
    doList: [
      "Unplug from devices after 8 PM",
      "Drink herbal chamomile infusion"
    ],
    avoidList: [
      "Engage in doomscrolling",
      "Overcommit to social obligations"
    ],
    powerWindow: "6:00 - 8:00 AM",
    avoidAfter: "9:00 - 11:00 PM",
    prediction: "A sudden wave of mental clarity will resolve a creative block",
    rationale: "The Moon's placement urges you to dive deep into spiritual journaling."
  },
  Money: {
    title: "Your Move in money",
    moves: [
      "Reallocate 10% of budget into high-yield cosmic assets",
      "Avoid signing major contracts today"
    ],
    doList: [
      "Review weekly subscription costs",
      "Research sustainable energy assets"
    ],
    avoidList: [
      "Make impulsive online purchases",
      "Lend money to acquaintances"
    ],
    powerWindow: "11:00 AM - 1:00 PM",
    avoidAfter: "4:00 - 6:00 PM",
    prediction: "A minor financial synchronic occurrence will validate your strategy",
    rationale: "Vedic charts indicate cautious wealth-building, avoiding proud spending."
  }
};

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
}

interface ChatTabProps {
  answers: Record<string, string>;
  zodiacIndex: number;
  insets: any;
  chatMessages: ChatMessage[];
  isAiTyping: boolean;
  chatInput: string;
  setChatInput: (text: string) => void;
  handleChatSend: () => void;
  chatListRef: React.RefObject<FlatList | null>;
  onShareMessage?: (text: string) => void;
}

function ChatTab({
  answers,
  zodiacIndex,
  insets,
  chatMessages,
  isAiTyping,
  chatInput,
  setChatInput,
  handleChatSend,
  chatListRef,
  onShareMessage,
}: ChatTabProps) {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  // On edge-to-edge Android (Expo SDK 54) adjustResize is ignored, so we
  // manually lift the input by the keyboard height. iOS keeps padding behavior.
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardVisible(true);
        setKeyboardHeight(e.endCoordinates?.height ?? 0);
      }
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        setKeyboardHeight(0);
      }
    );
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const bottomPadding = isKeyboardVisible 
    ? 8 
    : (Platform.OS === 'ios' ? (insets.bottom > 0 ? insets.bottom + 8 : 16) : 12);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 76 : 0}
      style={[
        styles.tabContainer,
        Platform.OS === 'android' && { paddingBottom: keyboardHeight + 12 },
      ]}
    >
      {/* Chat Feed */}
      <View style={styles.chatArea}>
        <FlatList
          ref={chatListRef}
          data={chatMessages}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.chatListContent}
          renderItem={({ item }) => {
            const isAi = item.sender === 'ai';
            return (
              <View style={[styles.msgRow, isAi ? styles.msgRowAi : styles.msgRowUser]}>
                {isAi && (
                  <View style={styles.avatarContainer}>
                    <Image
                      source={ZODIAC_ICONS[zodiacIndex + 1]}
                      style={styles.avatarImage}
                    />
                  </View>
                )}
                <View style={[styles.bubble, isAi ? styles.bubbleAi : styles.bubbleUser]}>
                  <Text style={[styles.msgText, isAi ? styles.msgTextAi : styles.msgTextUser]}>
                    {item.text}
                  </Text>
                  {isAi && onShareMessage && (
                    <TouchableOpacity
                      style={{ marginTop: 6, alignSelf: 'flex-end', opacity: 0.85, padding: 4 }}
                      onPress={() => onShareMessage(item.text)}
                      activeOpacity={0.7}
                    >
                      <Share2 size={14} color="#D946EF" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          }}
        />
        {isAiTyping && (
          <View style={[styles.msgRow, styles.msgRowAi, { paddingLeft: 36, marginBottom: 12 }]}>
            <Text style={styles.typingText}>✦ Celestial Guide is tuning alignment...</Text>
          </View>
        )}
      </View>

      {/* Quick Action Chips */}
      {!isKeyboardVisible && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }} contentContainerStyle={{ paddingHorizontal: 12, gap: 10 }}>
          {['🔮 Today\'s vibe?', '💼 Career move?', '❤️ Love forecast', '⚡ Lucky color', '🌙 Moon phase'].map((chip) => (
            <TouchableOpacity
              key={chip}
              onPress={() => { haptic.tap(); setChatInput(chip); handleChatSend(); }}
              activeOpacity={0.8}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderWidth: 1,
                borderColor: 'rgba(114, 9, 183, 0.14)',
                marginRight: 10,
                shadowColor: '#7209B7',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.06,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <Text style={{ fontFamily: 'SourceSerif4', fontSize: 13, color: '#2C2B3D' }}>{chip}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Input Bar */}
      <View style={[styles.chatInputContainer, { paddingBottom: bottomPadding }]}>
        <TextInput
          style={styles.chatTextInput}
          placeholder="Ask anything about your alignment..."
          placeholderTextColor="#9E9BB3"
          value={chatInput}
          onChangeText={setChatInput}
          onSubmitEditing={handleChatSend}
        />
        <TouchableOpacity 
          style={[styles.chatSendBtn, !chatInput.trim() && styles.chatSendBtnDisabled]}
          onPress={handleChatSend}
          disabled={!chatInput.trim()}
        >
          <Send size={16} color="#FFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const globalMemoryStorage: Record<string, string> = {};
const styleStorage = {
  getItem: (key: string) => {
    try {
      if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
        return localStorage.getItem(key);
      }
    } catch (e) {}
    return globalMemoryStorage[key] || null;
  },
  setItem: (key: string, value: string) => {
    try {
      if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
        return;
      }
    } catch (e) {}
    globalMemoryStorage[key] = value;
  }
};

interface DashboardScreenProps {
  answers?: Record<string, string>;
  token?: string | null;
  onLogout: () => void;
}

export default function DashboardScreen({ answers = {}, token = null, onLogout }: DashboardScreenProps) {
  const { width, height } = useWindowDimensions();
  const { theme, isDark, setMode } = useTheme();
  const lastBackPressRef = useRef<number>(0);
  const [isExitToastVisible, setIsExitToastVisible] = useState(false);
  const exitToastAnim = useRef(new Animated.Value(0)).current;

  const showExitToast = () => {
    setIsExitToastVisible(true);
    exitToastAnim.setValue(0);
    Animated.sequence([
      Animated.timing(exitToastAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.delay(1500),
      Animated.timing(exitToastAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      })
    ]).start(() => {
      setIsExitToastVisible(false);
    });
  };

  // Navigation active tab: today (dashboard) | readings | numerology | chat (main center) | charts | profile
  const [activeTab, setActiveTab] = useState<'today' | 'readings' | 'numerology' | 'chat' | 'charts' | 'profile'>('today');
  const [credits, setCredits] = useState<number>(0);
  const insets = useSafeAreaInsets();

  const [profileAnswers, setProfileAnswers] = useState<Record<string, string>>(answers);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editBirthdate, setEditBirthdate] = useState('');
  const [editBirthtime, setEditBirthtime] = useState('');
  const [editBirthplace, setEditBirthplace] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Daily streak state
  const [streak, setStreak] = useState(0);
  // Today card-deck swiper: measured page height + current card index
  const [todayDeckH, setTodayDeckH] = useState(0);
  const [todayCard, setTodayCard] = useState(0);
  const todayScrollX = useRef(new Animated.Value(0)).current; // drives the coverflow arc

  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackLoved, setFeedbackLoved] = useState('');
  const [feedbackImprove, setFeedbackImprove] = useState('');
  const [feedbackFavFeature, setFeedbackFavFeature] = useState('AI Chat');

  // Date and time picker selection states
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState(16);
  const [selectedMonth, setSelectedMonth] = useState(8);
  const [selectedYear, setSelectedYear] = useState(2005);
  const [selectedHour, setSelectedHour] = useState(12);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>('PM');

  const [currentProfileSubView, setCurrentProfileSubView] = useState<'profile' | 'help' | 'privacy' | 'credits' | 'terms'>('profile');
  const [previousProfileSubView, setPreviousProfileSubView] = useState<'profile' | 'credits'>('profile');
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState(false);
  const [libraryPermissionGranted, setLibraryPermissionGranted] = useState(false);

  const [isPurchasingCredit, setIsPurchasingCredit] = useState(false);

  const [dailyDecision, setDailyDecision] = useState<any>(null);
  const [isTodayLoading, setIsTodayLoading] = useState(false);
  const [todayLoadError, setTodayLoadError] = useState(false);

  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [shareModalData, setShareModalData] = useState<ShareCardData | null>(null);

  const triggerShareCard = (cardData: ShareCardData) => {
    setShareModalData(cardData);
    setShareModalVisible(true);
  };

  // Parse birthdate to calculate zodiac info
  const userName = profileAnswers.full_name || 'User';
  const birthdate = profileAnswers.date_of_birth || '';
  let zodiacIndex = 0; // Default to Aries if no birthdate
  
  const dateParts = birthdate.split('/');
  if (dateParts.length === 3) {
    const d = parseInt(dateParts[0], 10);
    const m = parseInt(dateParts[1], 10);
    if (!isNaN(d) && !isNaN(m)) {
      const zInfo = getZodiacInfo(d, m);
      zodiacIndex = zInfo.index - 1; // Convert 1-based index to 0-based
    }
  }
  
  const zodiac = getZodiacInfo(
    dateParts.length === 3 ? parseInt(dateParts[0], 10) : 16,
    dateParts.length === 3 ? parseInt(dateParts[1], 10) : 8
  );

  useEffect(() => {
    if (token) {
      setAuthToken(token);
    }
  }, [token]);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account permanently? ⚠️',
      'This will immediately and permanently delete your user profile, purchase records, chats, and all astrological reports. This action CANNOT be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Permanently Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await deleteAccount();
              if (res && res.success) {
                Alert.alert('Account Deleted 🗑️', res.message || 'Your account has been deleted.');
                onLogout();
              } else {
                Alert.alert('Error', res?.message || 'Unable to delete account at this time.');
              }
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to communicate with the server.');
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    let active = true;
    const loadCredits = async () => {
      try {
        const res = await fetchCredits();
        if (active && res.success && typeof res.credits === 'number') {
          setCredits(res.credits);
        }
      } catch (err) {
        // Silent catch credits load error
      }
    };
    loadCredits();
    return () => {
      active = false;
    };
  }, [token, currentView, activeTab]);

  // Streak tracking: load from storage and update on app open
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const stored = globalMemoryStorage['astroai_streak'];
    const storedDate = globalMemoryStorage['astroai_streak_date'];
    if (storedDate === today) {
      setStreak(parseInt(stored || '0', 10));
    } else {
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
      const isConsecutive = storedDate === yesterday.toISOString().split('T')[0];
      const newStreak = isConsecutive ? (parseInt(stored || '0', 10) + 1) : 1;
      setStreak(newStreak);
      globalMemoryStorage['astroai_streak'] = String(newStreak);
      globalMemoryStorage['astroai_streak_date'] = today;
    }
  }, []);

  // In-App Purchases (IAP) listener hook
  useEffect(() => {
    if (!RNIap || !RNIap.initConnection) {
      return;
    }

    let purchaseUpdateSubscription: any;
    let purchaseErrorSubscription: any;

    const initIAP = async () => {
      try {
        await RNIap.initConnection();
        
        purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(async (purchase: any) => {
          const receipt = purchase.transactionReceipt;
          if (receipt) {
            try {
              const verifyRes = await verifyIAPPayment({
                platform: Platform.OS,
                productId: purchase.productId,
                transactionId: purchase.transactionId,
                receipt: receipt,
                purchaseToken: Platform.OS === 'android' ? purchase.purchaseToken : undefined,
              });

              if (verifyRes && verifyRes.success) {
                await RNIap.finishTransaction({ purchase, isConsumable: false });
                
                // Add credits immediately based on product
                const added = verifyRes.credits_added || 0;
                setCredits(prev => prev + added);
                
                Alert.alert('Payment Successful! 🪙', verifyRes.message || 'Celestial Credits added successfully!');
              } else {
                Alert.alert('Verification Failed', verifyRes?.message || 'Unable to verify purchase with server.');
              }
            } catch (err: any) {
              Alert.alert('Verification Error', err.message || 'An error occurred while verifying the purchase receipt.');
            }
          }
        });

        purchaseErrorSubscription = RNIap.purchaseErrorListener((error: any) => {
          console.warn('IAP purchaseErrorListener error:', error);
          if (error && error.code !== 'E_USER_CANCELLED') {
            Alert.alert('Purchase Error', error.message || 'Payment failed or was cancelled.');
          }
        });
      } catch (e) {
        console.warn('Failed to initialize In-App Purchases connection:', e);
      }
    };

    initIAP();

    return () => {
      if (purchaseUpdateSubscription) {
        purchaseUpdateSubscription.remove();
      }
      if (purchaseErrorSubscription) {
        purchaseErrorSubscription.remove();
      }
      try {
        RNIap.endConnection();
      } catch (e) {}
    };
  }, []);

  useEffect(() => {
    let active = true;
    const loadDailyDecision = async () => {
      setIsTodayLoading(true);
      try {
        const res = await apiFetch('/api/horoscope/daily-decision-engine', {
          method: 'POST',
          body: JSON.stringify({ zodiac: zodiac?.name }),
        });
        if (active && res.success && res.data) {
          setDailyDecision(res.data);
          setTodayLoadError(false);
        }
      } catch (err) {
        if (active) setTodayLoadError(true);
      } finally {
        if (active) setIsTodayLoading(false);
      }
    };
    loadDailyDecision();
    return () => {
      active = false;
    };
  }, [zodiac?.name]);

  const swipeBackPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => {
        // Trigger only if the swipe starts near the left edge of the screen (first 60 pixels)
        return gestureState.x0 < 60;
      },
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Trigger on horizontal swipe to the right, ignoring vertical drag
        return gestureState.x0 < 60 && gestureState.dx > 10 && Math.abs(gestureState.dy) < 30;
      },
      onPanResponderRelease: (evt, gestureState) => {
        // Complete the go-back if distance or speed meets threshold
        if (gestureState.dx > 80 || gestureState.vx > 0.3) {
          setCurrentProfileSubView('profile');
        }
      },
    })
  ).current;

  useEffect(() => {
    if (activeTab !== 'profile') {
      setCurrentProfileSubView('profile');
    }
  }, [activeTab]);

  const checkPermissions = async () => {
    try {
      const cameraStatus = await ImagePicker.getCameraPermissionsAsync();
      setCameraPermissionGranted(cameraStatus.granted);

      const libraryStatus = await ImagePicker.getMediaLibraryPermissionsAsync();
      setLibraryPermissionGranted(libraryStatus.granted);
    } catch (e) {
      console.log('Error checking permissions:', e);
    }
  };

  const toggleCameraPermission = async () => {
    if (!cameraPermissionGranted) {
      const res = await ImagePicker.requestCameraPermissionsAsync();
      setCameraPermissionGranted(res.granted);
    } else {
      Alert.alert(
        'Revoke Permission',
        'To disable Camera access, please turn it off in your device System Settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() }
        ]
      );
    }
  };

  const toggleLibraryPermission = async () => {
    if (!libraryPermissionGranted) {
      const res = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setLibraryPermissionGranted(res.granted);
    } else {
      Alert.alert(
        'Revoke Permission',
        'To disable Photo Library access, please turn it off in your device System Settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() }
        ]
      );
    }
  };

  const startEditing = () => {
    const curName = profileAnswers.full_name || '';
    const curDate = profileAnswers.date_of_birth || '';
    const curTime = profileAnswers.birthtime || '';
    const curPlace = profileAnswers.birthplace || '';

    setEditFullName(curName);
    setEditBirthdate(curDate);
    setEditBirthtime(curTime);
    setEditBirthplace(curPlace);

    // Parse date
    const dParts = curDate.split('/');
    if (dParts.length === 3) {
      setSelectedDay(parseInt(dParts[0], 10) || 16);
      setSelectedMonth(parseInt(dParts[1], 10) || 8);
      setSelectedYear(parseInt(dParts[2], 10) || 2005);
    }

    // Parse time
    const timeMatch = curTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (timeMatch) {
      setSelectedHour(parseInt(timeMatch[1], 10));
      setSelectedMinute(parseInt(timeMatch[2], 10));
      setSelectedPeriod(timeMatch[3].toUpperCase() as any);
    }

    setIsEditingProfile(true);
  };

  const confirmDatePicker = () => {
    const dStr = String(selectedDay).padStart(2, '0');
    const mStr = String(selectedMonth).padStart(2, '0');
    setEditBirthdate(`${dStr}/${mStr}/${selectedYear}`);
    setIsDatePickerVisible(false);
  };

  const confirmTimePicker = () => {
    const hStr = String(selectedHour).padStart(2, '0');
    const minStr = String(selectedMinute).padStart(2, '0');
    setEditBirthtime(`${hStr}:${minStr} ${selectedPeriod}`);
    setIsTimePickerVisible(false);
  };

  const saveProfileDetails = () => {
    if (!editFullName.trim()) {
      Alert.alert('Validation Error', 'Please enter your full name.');
      return;
    }
    const datePattern = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!datePattern.test(editBirthdate)) {
      Alert.alert('Validation Error', 'Please enter birthdate in DD/MM/YYYY format.');
      return;
    }
    const [dStr, mStr, yStr] = editBirthdate.split('/');
    const dVal = parseInt(dStr, 10);
    const mVal = parseInt(mStr, 10);
    const yVal = parseInt(yStr, 10);
    if (isNaN(dVal) || dVal < 1 || dVal > 31) {
      Alert.alert('Validation Error', 'Please enter a valid day (1-31).');
      return;
    }
    if (isNaN(mVal) || mVal < 1 || mVal > 12) {
      Alert.alert('Validation Error', 'Please enter a valid month (1-12).');
      return;
    }
    if (isNaN(yVal) || yVal < 1900 || yVal > 2100) {
      Alert.alert('Validation Error', 'Please enter a valid year (1900-2100).');
      return;
    }
    const timePattern = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i;
    if (!timePattern.test(editBirthtime)) {
      Alert.alert('Validation Error', 'Please enter birth time in HH:MM AM/PM format (e.g., 12:00 PM).');
      return;
    }
    if (!editBirthplace.trim()) {
      Alert.alert('Validation Error', 'Please enter your birthplace.');
      return;
    }

    setProfileAnswers({
      ...profileAnswers,
      full_name: editFullName.trim(),
      date_of_birth: editBirthdate,
      birthtime: editBirthtime.trim(),
      birthplace: editBirthplace.trim(),
    });
    
    // Persist changes to database
    saveBasicProfile({
      full_name: editFullName.trim(),
      date_of_birth: editBirthdate,
      time_of_birth: editBirthtime.trim(),
      place_of_birth: editBirthplace.trim(),
    }).catch(err => {
      Alert.alert('Sync Failed', 'Your profile was updated locally but we couldn\'t save it to the server. Changes will sync when your connection is restored.');
    });

    setIsEditingProfile(false);
    if (Platform.OS === 'android') {
      ToastAndroid.show('Profile updated successfully!', ToastAndroid.SHORT);
    } else {
      Alert.alert('Success', 'Profile updated successfully!');
    }
  };

  const submitFeedback = () => {
    if (feedbackRating === 0) {
      Alert.alert('Rating Required', 'Please select a star rating.');
      return;
    }
    if (!feedbackLoved.trim()) {
      Alert.alert('Input Required', 'Please share what you loved about AstroAi4u.');
      return;
    }

    Alert.alert(
      'Thank You!',
      'Your feedback and reviews have been submitted successfully. We appreciate your response!'
    );
    setFeedbackRating(0);
    setFeedbackLoved('');
    setFeedbackImprove('');
    setFeedbackFavFeature('AI Chat');
    setIsFeedbackModalOpen(false);
  };

  const renderStarRating = () => {
    return (
      <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity 
            key={star} 
            activeOpacity={0.7} 
            onPress={() => setFeedbackRating(star)}
            style={styles.starBtn}
          >
            <MaterialCommunityIcons 
              name={star <= feedbackRating ? "star" : "star-outline"} 
              size={32} 
              color={star <= feedbackRating ? "#FFD700" : "#B3A2E7"} 
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  
  // Liquid tab bar spring scales
  const tabTodayScale = useRef(new Animated.Value(1)).current;
  const tabReadingsScale = useRef(new Animated.Value(0)).current;
  const tabNumerologyScale = useRef(new Animated.Value(0)).current;
  const tabChartsScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const springTo = (val: Animated.Value, target: number) => {
      Animated.spring(val, {
        toValue: target,
        tension: 80,
        friction: 6.5,
        useNativeDriver: true,
      }).start();
    };
    springTo(tabTodayScale, activeTab === 'today' ? 1 : 0);
    springTo(tabReadingsScale, activeTab === 'readings' ? 1 : 0);
    springTo(tabNumerologyScale, activeTab === 'numerology' ? 1 : 0);
    springTo(tabChartsScale, activeTab === 'charts' ? 1 : 0);
  }, [activeTab]);
  const pagerRef = useRef<ScrollView>(null);
  
  const TABS = ['today', 'readings', 'chat', 'numerology', 'charts', 'profile'] as const;
  type TabType = typeof TABS[number];

  const changeTab = (tab: TabType, animated = true) => {
    haptic.tab();
    setActiveTab(tab);
    const index = TABS.indexOf(tab);
    if (index !== -1) {
      pagerRef.current?.scrollTo({ x: index * width, animated });
    }
  };

  const handleScrollEnd = (e: any) => {
    const contentOffset = e.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / width);
    if (index >= 0 && index < TABS.length) {
      setActiveTab(TABS[index]);
    }
  };
  
  // Dashboard Focus state
  const [activeFocus, setActiveFocus] = useState<'Work' | 'Love' | 'Mind' | 'Money'>('Work');
  const [selectedMove, setSelectedMove] = useState<string | null>(null);
  const [outcomeFeedback, setOutcomeFeedback] = useState<Record<'Work' | 'Love' | 'Mind' | 'Money', 'Happened' | 'Didnt' | null>>({
    Work: null,
    Love: null,
    Mind: null,
    Money: null,
  });

  const [styleForecasterOpen, setStyleForecasterOpen] = useState(false);
  const [styleForecasterIntroOpen, setStyleForecasterIntroOpen] = useState(false);
  const [dontShowIntroChecked, setDontShowIntroChecked] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'palm-reading' | 'face-reading' | 'coffee-reading' | 'style-forecaster' | 'tarot-reading'>('dashboard');

  const handleOpenStyleForecaster = () => {
    const seen = styleStorage.getItem('dontShowStyleIntro');
    if (seen === 'true') {
      setCurrentView('style-forecaster');
    } else {
      setStyleForecasterIntroOpen(true);
    }
  };

  useEffect(() => {
    if (currentView === 'dashboard') {
      const index = TABS.indexOf(activeTab);
      if (index !== -1) {
        pagerRef.current?.scrollTo({ x: index * width, animated: false });
        const timer = setTimeout(() => {
          pagerRef.current?.scrollTo({ x: index * width, animated: false });
        }, 60);
        return () => clearTimeout(timer);
      }
    }
  }, [currentView]);
  useEffect(() => {
    const handleBackButton = () => {
      if (currentView !== 'dashboard') {
        setCurrentView('dashboard');
        return true;
      }
      if (styleForecasterIntroOpen) {
        setStyleForecasterIntroOpen(false);
        return true;
      }
      if (styleForecasterOpen) {
        setStyleForecasterOpen(false);
        return true;
      }
      if (activeTab !== 'today') {
        changeTab('today');
        return true;
      }
      const now = Date.now();
      if (now - lastBackPressRef.current < 2000) {
        BackHandler.exitApp();
        return false;
      }
      lastBackPressRef.current = now;
      showExitToast();
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackButton);
    return () => {
      subscription.remove();
    };
  }, [currentView, styleForecasterOpen, activeTab]);

  const [chartsSubTab, setChartsSubTab] = useState<'birthChart' | 'kundli'>('birthChart');
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [selectedInterpretationTab, setSelectedInterpretationTab] = useState<string>('personality');
  const [selectedGridNum, setSelectedGridNum] = useState<number>(1);
  const [selectedCoreNumType, setSelectedCoreNumType] = useState<'lifepath' | 'destiny' | 'soulurge'>('lifepath');

  // Day/Night phase for numerology center body: Sun (6am–6pm) vs Moon (night).
  // Numbers revolve around the Sun by day and the Moon by night.
  const [isDayTime, setIsDayTime] = useState<boolean>(() => {
    const h = new Date().getHours();
    return h >= 6 && h < 18;
  });
  useEffect(() => {
    const check = () => {
      const h = new Date().getHours();
      setIsDayTime(h >= 6 && h < 18);
    };
    check();
    const id = setInterval(check, 60000); // re-check each minute so it flips at dawn/dusk
    return () => clearInterval(id);
  }, []);

  // Floating animation values for trinity orbs
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;
  const floatAnim3 = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const orbitAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let float1: Animated.CompositeAnimation | null = null;
    let float2: Animated.CompositeAnimation | null = null;
    let float3: Animated.CompositeAnimation | null = null;
    let pulse: Animated.CompositeAnimation | null = null;
    let rotate: Animated.CompositeAnimation | null = null;
    let orbit: Animated.CompositeAnimation | null = null;

    if (activeTab === 'numerology') {
      // Reset animation values to their initial states
      floatAnim1.setValue(0);
      floatAnim2.setValue(0);
      floatAnim3.setValue(0);
      pulseAnim.setValue(1);
      rotateAnim.setValue(0);
      orbitAnim.setValue(0);

      // NOTE: float + orbit drive the TAPPABLE core orbs. They must use the JS
      // driver (useNativeDriver:false) so Android updates the touch hit-area as
      // the orb moves — with the native driver the hit-area lags the visual and
      // taps miss (needing 2-3 tries). Pulse/rotate below stay native (not tappable).
      const createFloat = (anim: Animated.Value, delay: number) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(anim, { toValue: 1, duration: 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
            Animated.timing(anim, { toValue: 0, duration: 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
          ])
        );

      float1 = createFloat(floatAnim1, 0);
      float2 = createFloat(floatAnim2, 400);
      float3 = createFloat(floatAnim3, 800);
      float1.start();
      float2.start();
      float3.start();

      pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      );
      pulse.start();

      rotate = Animated.loop(
        Animated.timing(rotateAnim, { toValue: 1, duration: 60000, easing: Easing.linear, useNativeDriver: true })
      );
      rotate.start();

      orbit = Animated.loop(
        Animated.timing(orbitAnim, { toValue: 1, duration: 24000, easing: Easing.linear, useNativeDriver: false })
      );
      orbit.start();
    }

    return () => {
      // Clean up running loops to free memory and prevent native driver de-sync
      float1?.stop();
      float2?.stop();
      float3?.stop();
      pulse?.stop();
      rotate?.stop();
      orbit?.stop();

      floatAnim1.stopAnimation();
      floatAnim2.stopAnimation();
      floatAnim3.stopAnimation();
      pulseAnim.stopAnimation();
      rotateAnim.stopAnimation();
      orbitAnim.stopAnimation();
    };
  }, [activeTab]);

  // Chat Tab states
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Greetings, ${profileAnswers.full_name || 'Seeker'}. I am your cosmic guide. How can I help you explore your celestial chart, transits, or readings today?`
    }
  ]);
  const [isAiTyping, setIsAiTyping] = useState(false);


  const chatListRef = useRef<FlatList>(null);

  // Parse birthdate to calculate zodiac info
  const lifePathNumber = calculateLifePathNumber(birthdate);
  const destinyNumber = calculateDestinyNumber(userName);
  const soulUrgeNumber = calculateSoulUrgeNumber(userName);
  const gridCounts = getPythagoreanGridCounts(userName, birthdate);

  const activeFocusLower = activeFocus.toLowerCase();
  const apiQuadrant = dailyDecision?.quadrants?.[activeFocusLower];
  const activeData: FocusContent = apiQuadrant ? {
    title: `Your Move in ${activeFocusLower}`,
    moves: [apiQuadrant.moves?.optionA || '', apiQuadrant.moves?.optionB || ''].filter(Boolean),
    doList: apiQuadrant.actions?.do || [],
    avoidList: apiQuadrant.actions?.avoid || [],
    powerWindow: apiQuadrant.timing?.powerWindow || 'N/A',
    avoidAfter: apiQuadrant.timing?.cautionWindow || 'N/A',
    prediction: apiQuadrant.predictions?.[0] || 'A quiet, introspective period is expected.',
    rationale: apiQuadrant.insight || 'Cosmic transits alignment.',
  } : (isTodayLoading ? {
    title: `Your Move in ${activeFocusLower}`,
    moves: [],
    doList: [],
    avoidList: [],
    powerWindow: '—',
    avoidAfter: '—',
    prediction: 'Loading your cosmic guidance…',
    rationale: 'Consulting the stars…',
  } : {
    title: `Your Move in ${activeFocusLower}`,
    moves: ['Unable to load — tap to retry'],
    doList: ['Check your internet connection'],
    avoidList: ['—'],
    powerWindow: '—',
    avoidAfter: '—',
    prediction: 'We couldn\'t reach the cosmic server.',
    rationale: 'Please check your connection and try again.',
  });

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr >= 5 && hr < 12) return 'Good morning,';
    if (hr >= 12 && hr < 17) return 'Good afternoon,';
    if (hr >= 17 && hr < 22) return 'Good evening,';
    return 'Good night,';
  };

  // Real API states
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [apiBirthChart, setApiBirthChart] = useState<any>(null);
  const [apiNumerology, setApiNumerology] = useState<any>(null);
  const [readingHistory, setReadingHistory] = useState<any[]>([]);

  // Fetch real Birth Chart & Kundli data
  useEffect(() => {
    fetchBirthChart()
      .then(res => {
        if (res?.data) setApiBirthChart(res.data);
      })
      .catch(err => { /* Silent catch BirthChart error */ });
  }, []);

  // Fetch real Numerology data
  useEffect(() => {
    getNumerologyData()
      .then(res => {
        if (res?.numerology) {
          setApiNumerology(res.numerology);
        } else {
          generateInsights()
            .then(() => getNumerologyData().then(r => r?.numerology && setApiNumerology(r.numerology)))
            .catch(e => { /* Silent catch generate insights error */ });
        }
      })
      .catch(err => { /* Silent catch Numerology error */ });
  }, []);

  // Fetch previous readings history for Explore tab
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const [palmRes, coffeeRes, faceRes] = await Promise.allSettled([
          getReadingHistory('palm'),
          getReadingHistory('coffee'),
          getReadingHistory('face'),
        ]);
        const list: any[] = [];
        if (palmRes.status === 'fulfilled' && palmRes.value?.readings) {
          list.push(...palmRes.value.readings.map((r: any) => ({ ...r, category: 'Palmistry Scan' })));
        }
        if (coffeeRes.status === 'fulfilled' && coffeeRes.value?.readings) {
          list.push(...coffeeRes.value.readings.map((r: any) => ({ ...r, category: 'Tasseography Cup' })));
        }
        if (faceRes.status === 'fulfilled' && faceRes.value?.readings) {
          list.push(...faceRes.value.readings.map((r: any) => ({ ...r, category: 'Face Reading' })));
        }
        setReadingHistory(list);
      } catch (err) {
        // Silent catch reading history error
      }
    };
    loadHistory();
  }, []);

  // Initialize active AI Chat session from live API
  useEffect(() => {
    const initChat = async () => {
      try {
        const listRes = await fetchChatList();
        const chats = listRes?.data || listRes?.chats || [];
        if (chats.length > 0) {
          const latestChat = chats[0];
          const cId = latestChat.id || latestChat._id;
          setActiveChatId(cId);
          const msgsRes = await fetchChatMessages(cId);
          const rawMsgs = Array.isArray(msgsRes?.data) ? msgsRes.data : (msgsRes?.messages || []);
          if (rawMsgs.length > 0) {
            setChatMessages(rawMsgs.map((m: any, idx: number) => ({
              id: m.id || m._id || `msg_${idx}`,
              sender: m.role === 'user' || m.sender === 'user' ? 'user' : 'ai',
              text: m.content || m.text || ''
            })));
          }
        }
      } catch (e) {
        // Silent catch chat init error
      }
    };
    initChat();
  }, []);

  // Real AI Chat Send Handler
  const handleChatSend = async () => {
    if (!chatInput.trim()) return;
    const userMsgId = `user_${Date.now()}`;
    const userText = chatInput;
    
    setChatMessages(prev => [...prev, { id: userMsgId, sender: 'user', text: userText }]);
    setChatInput('');
    setIsAiTyping(true);

    try {
      let chatId = activeChatId;
      if (!chatId) {
        const newChat = await createChat('general', 'Celestial Consultation', userText);
        chatId = newChat?.data?._id || newChat?.data?.id || newChat?.chat?.id || newChat?.chat?._id || newChat?.id || newChat?._id;
        if (chatId) setActiveChatId(chatId);
      }

      if (chatId) {
        const response = await sendChatMessage(chatId, userText);
        if (response && typeof response.remaining_credits === 'number') {
          setCredits(response.remaining_credits);
        }
        const aiMessageText = response?.data?.aiMessage?.content || response?.data?.content || response?.message || response?.reply || response?.content || response?.data?.message || "Cosmic guidance received.";
        setChatMessages(prev => [
          ...prev,
          {
            id: `ai_${Date.now()}`,
            sender: 'ai',
            text: aiMessageText
          }
        ]);
      }
    } catch (err: any) {
      console.log('Real Chat API send error:', err);
      setChatMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'ai',
          text: "⚠️ Connection issue — we couldn't reach the server. Please check your internet and try sending your message again."
        }
      ]);
    } finally {
      setIsAiTyping(false);
    }
  };



  useEffect(() => {
    if (activeTab === 'chat') {
      setTimeout(() => chatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [chatMessages, activeTab]);

  // Sub-View Renderers

  // 1. Restored Today (Dashboard) View
  const renderTodayView = () => {
    const focusMeta: Record<string, { icon: string; color: string; label: string; emoji: string }> = {
      Work:  { icon: 'briefcase-outline', color: '#7209B7', label: 'Career', emoji: '💼' },
      Love:  { icon: 'heart-outline',     color: '#F72585', label: 'Love',   emoji: '❤️' },
      Mind:  { icon: 'brain',             color: '#03B07A', label: 'Mind',   emoji: '🧠' },
      Money: { icon: 'cash-multiple',     color: '#D9730D', label: 'Money',  emoji: '💰' },
    };
    const accent = focusMeta[activeFocus].color;
    const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    const CARD_COUNT = 4;
    // Horizontal peek carousel: active card centered, ~30% of the previous card
    // showing on the left and the next on the right. Reserve room for the nav.
    const NAV_SPACE = 84 + insets.bottom;
    const usableH = Math.max(todayDeckH - NAV_SPACE, 320);
    const GAP = 12;
    const CW = Math.round(width * 0.74);            // card width → ~18% neighbor peek each side
    const SNAP = CW + GAP;
    const sidePad = Math.round((width - CW) / 2);   // centers the active card
    const pageStyle = { width: CW, height: usableH, marginRight: GAP } as const;
    const sheetStyle = { flex: 1, borderRadius: 28, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: 'rgba(114,111,141,0.10)', shadowColor: '#726F8D', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 14, elevation: 2 } as const;
    // Coverflow arc: side cards tilt + drop + shrink + dim so they sit on a
    // circle behind the active card. Extra midpoints keep the curve smooth.
    const cardArc = (i: number) => {
      const c = i * SNAP;
      const inputRange = [c - SNAP, c - SNAP / 2, c, c + SNAP / 2, c + SNAP];
      const opts = { extrapolate: 'clamp' as const };
      return {
        opacity: todayScrollX.interpolate({ inputRange, outputRange: [0.55, 0.82, 1, 0.82, 0.55], ...opts }),
        transform: [
          { perspective: 1000 },
          { scale: todayScrollX.interpolate({ inputRange, outputRange: [0.88, 0.95, 1, 0.95, 0.88], ...opts }) },
          { rotate: todayScrollX.interpolate({ inputRange, outputRange: ['10deg', '5deg', '0deg', '-5deg', '-10deg'], ...opts }) },
          { translateY: todayScrollX.interpolate({ inputRange, outputRange: [30, 9, 0, 9, 30], ...opts }) },
        ],
      };
    };

    return (
      <View style={{ flex: 1, paddingTop: 8 }} onLayout={e => { const h = e.nativeEvent.layout.height; if (h && Math.abs(h - todayDeckH) > 1) setTodayDeckH(h); }}>
        {todayDeckH > 0 && (
        <Animated.ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={SNAP}
          snapToAlignment="start"
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: sidePad, alignItems: 'center' }}
          scrollEventThrottle={16}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: todayScrollX } } }], { useNativeDriver: true })}
          onMomentumScrollEnd={e => setTodayCard(Math.round(e.nativeEvent.contentOffset.x / SNAP))}
        >
          {/* ══════ CARD 1 · Cover ══════ */}
          <Animated.View style={[pageStyle, cardArc(0)]}>
            <LinearGradient
              colors={['#3A0CA3', '#7209B7', '#B5179E']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={{ flex: 1, borderRadius: 28, overflow: 'hidden', padding: 24, justifyContent: 'space-between' }}
            >
              <Image source={ZODIAC_ICONS[zodiacIndex]} style={{ position: 'absolute', width: 300, height: 300, right: -80, top: -50, opacity: 0.08, tintColor: '#FFFFFF' }} resizeMode="contain" />

              {/* Top: greeting + streak + share */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: 'SourceSerif4', fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>{getGreeting()}</Text>
                  <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 24, color: '#FFFFFF', marginTop: 2 }} numberOfLines={1}>{userName}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 8 }}>
                  {streak > 0 && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)' }}>
                      <Flame size={14} color="#FFD27A" />
                      <Text style={{ fontFamily: 'SourceSerif4-Bold', fontSize: 12, color: '#FFFFFF', marginLeft: 4 }}>{streak}</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={{ backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 12, padding: 9, borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)' }}
                    onPress={() => triggerShareCard({
                      category: 'DAILY HOROSCOPE',
                      title: `${zodiac?.name || 'Cosmic'} Daily Horoscope`,
                      subtitle: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                      readingText: dailyDecision?.rationale || dailyDecision?.hook || `Cosmic alignment is active for ${activeFocus}. Harness your inner potential today!`,
                      highlights: [
                        { label: 'Zodiac', value: zodiac?.name || 'Scorpio' },
                        { label: 'Focus Area', value: activeFocus },
                        { label: 'Power Window', value: activeData?.powerWindow || 'Morning' },
                        { label: 'Mood Signal', value: dailyDecision?.signals?.emotion || 'Balanced' },
                      ],
                    })}
                    activeOpacity={0.8}
                  >
                    <Share2 size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Center: zodiac identity */}
              <View style={{ alignItems: 'center' }}>
                <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(255,255,255,0.16)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 52, color: '#FFFFFF' }}>{RASHI_GLYPHS[(zodiac?.index || 1) - 1]}</Text>
                </View>
                <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 26, color: '#FFFFFF', marginTop: 16 }}>{zodiac?.name || 'Cosmic'} Daily</Text>
                <Text style={{ fontFamily: 'SourceSerif4', fontSize: 13, color: 'rgba(255,255,255,0.78)', marginTop: 4 }}>
                  {zodiac?.element ? `${zodiac.element} • ` : ''}{dateStr}
                </Text>
                <Text style={{ fontFamily: 'SourceSerif4', fontSize: 14.5, color: 'rgba(255,255,255,0.92)', marginTop: 18, textAlign: 'center', lineHeight: 22 }}>
                  {dailyDecision?.hook || 'The stars align in your favor today. Embrace the cosmic energy and trust your intuition.'}
                </Text>
              </View>

              {/* Bottom: fanned deck motif + swipe hint */}
              <View style={{ alignItems: 'center' }}>
                <View style={{ height: 66, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                  {[-24, -8, 8, 24].map((deg, i) => (
                    <View key={i} style={{ position: 'absolute', width: 48, height: 66, borderRadius: 9, backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)', transform: [{ rotate: `${deg}deg` }, { translateX: deg * 2.4 }] }} />
                  ))}
                  <View style={{ width: 48, height: 66, borderRadius: 9, backgroundColor: 'rgba(255,255,255,0.22)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)', alignItems: 'center', justifyContent: 'center' }}>
                    <Sparkles size={20} color="#FFFFFF" />
                  </View>
                </View>
                <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 11, color: '#FFFFFF', letterSpacing: 1.5, marginTop: 12 }}>SWIPE UP TO REVEAL ✦</Text>
                <ChevronUp size={20} color="rgba(255,255,255,0.85)" style={{ marginTop: 2 }} />
              </View>
            </LinearGradient>
          </Animated.View>

          {/* ══════ CARD 2 · What Will Happen Today ══════ */}
          <Animated.View style={[pageStyle, cardArc(1)]}>
            <View style={[sheetStyle, { padding: 26, justifyContent: 'center' }]}>
              <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 10, color: accent, letterSpacing: 2 }}>YOUR COSMIC FORECAST</Text>
              <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 25, color: '#2C2B3D', marginTop: 8, lineHeight: 33 }}>What Will Happen In Your Life Today</Text>
              <View style={{ height: 3, width: 48, backgroundColor: accent, borderRadius: 2, marginVertical: 20 }} />
              <Text style={{ fontFamily: 'SourceSerif4', fontSize: 18, color: '#2C2B3D', lineHeight: 27, fontStyle: 'italic' }}>“{activeData.prediction}”</Text>
              <Text style={{ fontFamily: 'SourceSerif4', fontSize: 14, color: '#726F8D', lineHeight: 22, marginTop: 16 }}>{activeData.rationale}</Text>

              <View style={[styles.feedbackButtonsRow, { marginTop: 26 }]}>
                <TouchableOpacity
                  style={[styles.feedbackBtn, outcomeFeedback[activeFocus] === 'Happened' && styles.feedbackBtnHappenedActive]}
                  onPress={() => setOutcomeFeedback(prev => ({ ...prev, [activeFocus]: 'Happened' }))}
                  activeOpacity={0.8}
                >
                  <CheckCircle size={12} color={outcomeFeedback[activeFocus] === 'Happened' ? '#FFF' : '#03B07A'} />
                  <Text style={[styles.feedbackBtnText, { color: outcomeFeedback[activeFocus] === 'Happened' ? '#FFF' : '#03B07A' }]}>Happened</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.feedbackBtn, outcomeFeedback[activeFocus] === 'Didnt' && styles.feedbackBtnDidntActive]}
                  onPress={() => setOutcomeFeedback(prev => ({ ...prev, [activeFocus]: 'Didnt' }))}
                  activeOpacity={0.8}
                >
                  <X size={12} color={outcomeFeedback[activeFocus] === 'Didnt' ? '#FFF' : '#E63946'} />
                  <Text style={[styles.feedbackBtnText, { color: outcomeFeedback[activeFocus] === 'Didnt' ? '#FFF' : '#E63946' }]}>Didn't</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

          {/* ══════ CARD 3 · Your Focus ══════ */}
          <Animated.View style={[pageStyle, cardArc(2)]}>
            <View style={[sheetStyle, { padding: 20 }]}>
              <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
                <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 16, color: '#2C2B3D', marginBottom: 14 }}>Where's your focus today?</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                  {(['Work', 'Love', 'Mind', 'Money'] as const).map((focus) => {
                    const meta = focusMeta[focus];
                    const isActive = activeFocus === focus;
                    return (
                      <TouchableOpacity
                        key={focus}
                        style={{ width: '47%', marginBottom: 10 }}
                        activeOpacity={0.85}
                        onPress={() => { haptic.press(); setActiveFocus(focus); setSelectedMove(null); }}
                      >
                        <View style={{
                          width: '100%', borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center',
                          backgroundColor: isActive ? meta.color : '#FFFFFF',
                          borderWidth: 1.5, borderColor: isActive ? meta.color : 'rgba(114, 111, 141, 0.10)',
                          shadowColor: meta.color, shadowOffset: { width: 0, height: isActive ? 5 : 2 }, shadowOpacity: isActive ? 0.28 : 0.05, shadowRadius: isActive ? 10 : 5, elevation: isActive ? 4 : 1,
                        }}>
                          <View style={{ width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : `${meta.color}14` }}>
                            <MaterialCommunityIcons name={meta.icon} size={22} color={isActive ? '#FFFFFF' : meta.color} />
                          </View>
                          <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 13, color: isActive ? '#FFFFFF' : '#2C2B3D', marginLeft: 10 }}>{meta.label}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Themed banner */}
                <LinearGradient
                  colors={[accent, `${accent}CC`]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={{ borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center', overflow: 'hidden', marginTop: 16 }}
                >
                  <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 22 }}>{focusMeta[activeFocus].emoji}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 14 }}>
                    <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 9.5, color: 'rgba(255,255,255,0.85)', letterSpacing: 1.5 }}>{focusMeta[activeFocus].label.toUpperCase()} · TODAY</Text>
                    <Text style={{ fontFamily: 'SourceSerif4-Bold', fontSize: 15, color: '#FFFFFF', marginTop: 3 }}>Your {focusMeta[activeFocus].label.toLowerCase()} energy is active ✦</Text>
                  </View>
                </LinearGradient>

                {/* Moves */}
                <View style={[styles.movesCard, { marginTop: 16, borderTopWidth: 3, borderTopColor: accent }]}>
                  <Text style={[styles.movesCardTitle, { color: accent }]}>{activeData.title}</Text>
                  {activeData.moves.length === 0 && isTodayLoading ? (
                    <Text style={{ fontFamily: 'SourceSerif4', fontSize: 13, color: '#726F8D', paddingVertical: 12 }}>Consulting the stars…</Text>
                  ) : (
                    activeData.moves.map((move, index) => {
                      const isSelected = selectedMove === move;
                      return (
                        <TouchableOpacity key={index} style={[styles.moveOption, isSelected && styles.moveOptionActive]} onPress={() => setSelectedMove(move)} activeOpacity={0.7}>
                          <View style={[styles.radioButton, isSelected && styles.radioButtonActive]}>
                            {isSelected && <View style={styles.radioButtonInner} />}
                          </View>
                          <Text style={[styles.moveOptionText, isSelected && styles.moveOptionTextActive]}>{move}</Text>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </View>
              </ScrollView>
            </View>
          </Animated.View>

          {/* ══════ CARD 4 · Cosmic Guidance ══════ */}
          <Animated.View style={[pageStyle, cardArc(3)]}>
            <View style={[sheetStyle, { padding: 20 }]}>
              <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
                <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 16, color: '#2C2B3D', marginBottom: 14 }}>Cosmic Guidance</Text>

                {/* Do / Avoid */}
                <View style={styles.splitListsRow}>
                  <View style={[styles.listCard, styles.doCard]}>
                    <Text style={[styles.listHeader, { color: '#03B07A' }]}>✦ Do This</Text>
                    {activeData.doList.map((item, idx) => (
                      <View key={idx} style={styles.listItemRow}>
                        <PlusCircle size={10} color="#03B07A" style={styles.listItemIcon} />
                        <Text style={styles.listItemText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={[styles.listCard, styles.avoidCard]}>
                    <Text style={[styles.listHeader, { color: '#E63946' }]}>✧ Avoid This</Text>
                    {activeData.avoidList.map((item, idx) => (
                      <View key={idx} style={styles.listItemRow}>
                        <AlertTriangle size={10} color="#E63946" style={styles.listItemIcon} />
                        <Text style={styles.listItemText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Time Windows */}
                <View style={[styles.timeWindowsCard, { marginTop: 16 }]}>
                  <View style={styles.timeWindowItem}>
                    <View style={styles.timeHeaderRow}>
                      <Clock size={14} color="#03B07A" />
                      <Text style={styles.timeLabel}>Power Window</Text>
                    </View>
                    <Text style={[styles.timeValue, { color: '#03B07A' }]}>{activeData.powerWindow}</Text>
                  </View>
                  <View style={[styles.timeWindowItem, styles.avoidTimeItem]}>
                    <View style={styles.timeHeaderRow}>
                      <Clock size={14} color="#E63946" />
                      <Text style={styles.timeLabel}>Avoid After</Text>
                    </View>
                    <Text style={[styles.timeValue, { color: '#E63946' }]}>{activeData.avoidAfter}</Text>
                  </View>
                </View>

                {/* Insight */}
                <View style={[styles.insightCard, { marginTop: 16 }]}>
                  <View style={styles.insightHeaderRow}>
                    <Info size={14} color="#7209B7" />
                    <Text style={styles.insightTitle}>Cosmic Insight</Text>
                  </View>
                  <Text style={styles.insightText}>{activeData.rationale}</Text>
                </View>

                {/* Quick Links */}
                <View style={[styles.widgetsGrid, { marginTop: 16 }]}>
                  <TouchableOpacity style={styles.widgetBox} activeOpacity={0.8} onPress={() => setCurrentView('astro-calendar')}>
                    <Calendar size={18} color="#FFD700" style={{ marginBottom: 4 }} />
                    <Text style={styles.widgetLabel}>Astro Calendar</Text>
                    <Text style={[styles.widgetValueText, { color: '#FFD700', fontWeight: '700' }]}>View Events & Phases ✦</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.widgetBox} activeOpacity={0.8} onPress={handleOpenStyleForecaster}>
                    <Shirt size={18} color="#F72585" style={{ marginBottom: 4 }} />
                    <Text style={styles.widgetLabel}>StyleForecaster</Text>
                    <Text style={[styles.widgetValueText, { color: '#F72585', fontFamily: 'SourceSerif4-Bold' }]}>Get outfit tips ✦</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </Animated.View>
        </Animated.ScrollView>
        )}

        {/* Pagination dots */}
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: NAV_SPACE - 22, flexDirection: 'row', justifyContent: 'center', gap: 6 }} pointerEvents="none">
          {Array.from({ length: CARD_COUNT }).map((_, i) => (
            <View key={i} style={{ width: i === todayCard ? 20 : 6, height: 6, borderRadius: 3, backgroundColor: i === todayCard ? accent : 'rgba(114,111,141,0.22)' }} />
          ))}
        </View>
      </View>
    );
  };


  // 2. Chat View (Main / Center Circle)
  const renderChatView = () => {
    return (
      <ChatTab
        answers={profileAnswers}
        zodiacIndex={zodiacIndex}
        insets={insets}
        chatMessages={chatMessages}
        isAiTyping={isAiTyping}
        chatInput={chatInput}
        setChatInput={setChatInput}
        handleChatSend={handleChatSend}
        chatListRef={chatListRef}
      />
    );
  };

  // 3. Explore View (StyleForecaster, Palm, Face, Coffee, and History)
  const renderExploreView = () => {
    const specials = ['tarot-reading', 'palm-reading', 'face-reading', 'coffee-reading', 'style-forecaster'];
    const todaySpecial = specials[new Date().getDate() % specials.length];
    const specialNames: Record<string, string> = {
      'tarot-reading': 'Tarot Arcana',
      'palm-reading': 'Palmistry Scan',
      'face-reading': 'Face Reading',
      'coffee-reading': 'Coffee Reading',
      'style-forecaster': 'StyleForecaster',
    };
    const specialDesc: Record<string, string> = {
      'tarot-reading': 'Draw three cards to decode your cosmic energies',
      'palm-reading': 'Map your destiny through palm lines',
      'face-reading': 'Analyze facial features for character insights',
      'coffee-reading': 'Interpret cup sediment patterns',
      'style-forecaster': 'Get outfit & color recommendations',
    };
    const specialColors: Record<string, string[]> = {
      'tarot-reading': ['#D9730D', '#F72585'],
      'palm-reading': ['#7209B7', '#3A0CA3'],
      'face-reading': ['#F72585', '#7209B7'],
      'coffee-reading': ['#B3A2E7', '#7209B7'],
      'style-forecaster': ['#7209B7', '#F72585'],
    };
    const specialIcons: Record<string, any> = {
      'tarot-reading': 'cards-outline',
      'palm-reading': 'hand-back-left-outline',
      'face-reading': 'face-recognition',
      'coffee-reading': 'coffee-outline',
      'style-forecaster': 'hanger',
    };
    const specialActions: Record<string, () => void> = {
      'tarot-reading': () => setCurrentView('tarot-reading'),
      'palm-reading': () => setCurrentView('palm-reading'),
      'face-reading': () => setCurrentView('face-reading'),
      'coffee-reading': () => setCurrentView('coffee-reading'),
      'style-forecaster': () => handleOpenStyleForecaster(),
    };

    const gridItems = [
      { key: 'palm-reading', label: 'Palmistry', icon: 'hand-back-left-outline', color: '#7209B7', action: () => setCurrentView('palm-reading') },
      { key: 'face-reading', label: 'Face Reading', icon: 'face-recognition', color: '#F72585', action: () => setCurrentView('face-reading') },
      { key: 'coffee-reading', label: 'Coffee', icon: 'coffee-outline', color: '#B3A2E7', action: () => setCurrentView('coffee-reading') },
      { key: 'tarot-reading', label: 'Tarot', icon: 'cards-outline', color: '#D9730D', action: () => setCurrentView('tarot-reading') },
      { key: 'astro-calendar', label: 'Calendar', icon: 'calendar-month', color: '#3A0CA3', action: () => setCurrentView('astro-calendar') },
      { key: 'style-forecaster', label: 'Style', icon: 'hanger', color: '#F72585', action: () => handleOpenStyleForecaster() },
    ].filter(item => item.key !== todaySpecial);

    return (
      <ScrollView showsVerticalScrollIndicator={false} style={styles.tabScroll}>
        <Text style={styles.tabViewTitle}>Explore</Text>

        {/* Today's Special Hero Card */}
        <TouchableOpacity
          style={{ borderRadius: 20, marginBottom: 20, overflow: 'hidden', shadowColor: '#7209B7', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 4 }}
          activeOpacity={0.85}
          onPress={() => { haptic.press(); specialActions[todaySpecial](); }}
        >
          <LinearGradient
            colors={specialColors[todaySpecial]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 22 }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                  <Sparkles size={14} color="#FFF" style={{ marginRight: 6 }} />
                  <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 10, color: 'rgba(255,255,255,0.85)', letterSpacing: 1 }}>TODAY'S SPECIAL</Text>
                </View>
                <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 20, color: '#FFF', marginBottom: 4 }}>{specialNames[todaySpecial]}</Text>
                <Text style={{ fontFamily: 'SourceSerif4', fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 18 }}>{specialDesc[todaySpecial]}</Text>
              </View>
              <MaterialCommunityIcons name={specialIcons[todaySpecial]} size={48} color="rgba(255,255,255,0.2)" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Bento Grid */}
        <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>All Readings</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {gridItems.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={{
                width: (width - 56) / 2,
                backgroundColor: '#FFFFFF',
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: 'rgba(114, 111, 141, 0.08)',
                shadowColor: '#726F8D',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 8,
                elevation: 2,
                alignItems: 'center',
              }}
              activeOpacity={0.8}
              onPress={() => { haptic.press(); item.action(); }}
            >
              <View style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: item.color + '12',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 10,
              }}>
                <MaterialCommunityIcons name={item.icon as any} size={22} color={item.color} />
              </View>
              <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 12, color: '#2C2B3D', textAlign: 'center' }}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Previous Readings History */}
        {readingHistory.length > 0 && (
          <View style={{ marginTop: 24 }}>
            <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>Your Saved Readings & Scans</Text>
            {readingHistory.map((item: any, index: number) => (
              <View key={item._id || item.id || `history_${index}`} style={[styles.sensorCard, { marginBottom: 12 }]}>
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.95)', 'rgba(247, 245, 255, 0.9)']}
                  style={[styles.sensorCardGradient, { padding: 14 }]}
                >
                  <Sparkles size={20} color="#7209B7" style={{ marginRight: 10 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 13, color: '#2C2B3D' }}>
                      {item.category || 'Reading'} • {new Date(item.createdAt || item.created_at || Date.now()).toLocaleDateString()}
                    </Text>
                    <Text style={{ fontFamily: 'SourceSerif4', fontSize: 12, color: '#726F8D', marginTop: 4 }} numberOfLines={2}>
                      {item.reading_data?.headline || item.headline || item.reading_data?.summary || item.summary || 'Scan analysis completed.'}
                    </Text>
                  </View>
                </LinearGradient>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 100 + insets.bottom }} />
      </ScrollView>
    );
  };

  // 4. Numerology View (Tab 3)
  const renderNumerologyView = () => {
    const getLifePathStrength = (lifePath: string) => {
      const strengths: Record<string, string> = {
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
      const challenges: Record<string, string> = {
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

    const getDestinyPurpose = (destiny: string) => {
      const purposes: Record<string, string> = {
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
      return purposes[destiny] || 'To fulfill your potential';
    };

    const getDestinyTalent = (destiny: string) => {
      const talents: Record<string, string> = {
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

    const getPersonalYearTheme = (personalYear: string) => {
      const themes: Record<string, string> = {
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
      return themes[personalYear] || 'Personal growth';
    };

    const getPersonalYearAdvice = (personalYear: string) => {
      const advice: Record<string, string> = {
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

    const renderNumerologyDesc = (descText: string, extraText: string) => {
      const lines = extraText.split('\n').filter(Boolean);
      const elements: React.ReactNode[] = [];

      elements.push(
        <Text key="main-desc" style={styles.numerologyDetailText}>
          {descText}
        </Text>
      );

      lines.forEach((line, idx) => {
        const trimmed = line.trim();
        if (trimmed === 'Strategic Focus' || trimmed === 'Core Strength' || trimmed === 'Primary Challenge' || trimmed === 'Life Purpose' || trimmed === 'Hidden Talent' || trimmed === 'Year Theme' || trimmed === 'Best Advice') {
          elements.push(
            <Text key={`h-${idx}`} style={styles.numerologySectionHeading}>
              {trimmed}
            </Text>
          );
        } else if (trimmed.startsWith('•')) {
          elements.push(
            <Text key={`bullet-${idx}`} style={styles.numerologyBulletText}>
              {trimmed}
            </Text>
          );
        } else {
          elements.push(
            <Text key={`body-${idx}`} style={styles.numerologyDetailText}>
              {trimmed}
            </Text>
          );
        }
      });

      return elements;
    };

    const apiLifePath = apiNumerology?.life_path ? String(apiNumerology.life_path) : String(lifePathNumber);
    const apiDestiny = apiNumerology?.destiny ? String(apiNumerology.destiny) : String(destinyNumber);
    const apiPersonalYear = apiNumerology?.personal_year ? String(apiNumerology.personal_year) : '—';

    let coreNumTitle = "Life Path Number";
    let coreNumVal = apiLifePath;
    let coreNumDesc = "This number represents the path you're destined to walk in this lifetime. It reveals your natural talents, the lessons you're here to learn, and the challenges you'll face.";
    let coreNumHeading = (LIFE_PATH_DATA as any)[apiLifePath]?.title || "COSMIC PATH & DESTINY";
    let coreNumPlanet = "Saturn";
    let coreNumColor = "Royal Violet";
    let coreNumDay = "Saturday";
    let extraText = `Strategic Focus\n• Your innate abilities and strengths\n• Life lessons and challenges\n• Natural career inclinations\n• Relationship patterns\nCore Strength\n${getLifePathStrength(apiLifePath)}\nPrimary Challenge\n${getLifePathChallenge(apiLifePath)}`;

    if (selectedCoreNumType === 'destiny') {
      coreNumTitle = "Destiny Number";
      coreNumVal = apiDestiny;
      coreNumHeading = "THE EXPRESSION OF YOUR POTENTIAL";
      coreNumDesc = "Also known as the Expression Number, this reveals your life's purpose, your mission, and the opportunities that will come your way to fulfill your potential.";
      coreNumPlanet = "Uranus";
      coreNumColor = "Cobalt Blue";
      coreNumDay = "Wednesday";
      extraText = `Strategic Focus\n• Your life's mission and purpose\n• Career and success potential\n• How others perceive you\n• Your unique contribution to the world\nLife Purpose\n${getDestinyPurpose(apiDestiny)}\nHidden Talent\n${getDestinyTalent(apiDestiny)}`;
    } else if (selectedCoreNumType === 'soulurge') {
      coreNumTitle = "Personal Year Number";
      coreNumVal = apiPersonalYear;
      coreNumHeading = "YOUR CURRENT YEARLY CYCLES";
      coreNumDesc = "This number changes yearly and shows the themes, opportunities, and challenges you'll experience during this specific year cycle.";
      coreNumPlanet = "Neptune";
      coreNumColor = "Rose Gold";
      coreNumDay = "Monday";
      extraText = `Strategic Focus\n• Best timing for important decisions\n• Current year's main themes\n• Opportunities to watch for\n• Areas requiring focus\nYear Theme\n${getPersonalYearTheme(apiPersonalYear)}\nBest Advice\n${getPersonalYearAdvice(apiPersonalYear)}`;
    }

    const orbData = [
      { key: 'lifepath' as const, label: 'Life Path', val: apiLifePath, floatAnim: floatAnim1, color: '#7209B7' },
      { key: 'destiny' as const, label: 'Destiny', val: apiDestiny, floatAnim: floatAnim2, color: '#F72585' },
      { key: 'soulurge' as const, label: 'Personal Year', val: apiPersonalYear, floatAnim: floatAnim3, color: '#B3A2E7' },
    ];

    const spinInterpolate = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <ScrollView showsVerticalScrollIndicator={false} style={styles.tabScroll}>
        <Text style={styles.tabViewTitle}>Numerology Explorer</Text>

        {/* Share Numerology Card Button */}
        <TouchableOpacity
          style={styles.shareCardTrigger}
          onPress={() => {
            triggerShareCard({
              category: 'NUMEROLOGY',
              title: `${coreNumTitle}: Number ${coreNumVal}`,
              subtitle: coreNumHeading,
              readingText: coreNumDesc,
              highlights: [
                { label: 'Life Path', value: apiLifePath },
                { label: 'Destiny Number', value: apiDestiny },
                { label: 'Personal Year', value: apiPersonalYear },
                { label: 'Ruling Planet', value: coreNumPlanet },
              ],
            });
          }}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#8B5CF6', '#3B82F6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.shareCardTriggerGradient}
          >
            <Share2 size={16} color="#FFFFFF" />
            <Text style={styles.shareCardTriggerText}>Share Numerology Card</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* ══════ FLOATING TRINITY MANDALA ══════ */}
        <View style={styles.mandalaContainer}>
          {/* Decorative rotating outer ring */}
          <Animated.View style={[
            styles.mandalaOuterRing,
            { transform: [{ rotate: spinInterpolate }] }
          ]}>
            {/* Tick marks around the ring */}
            {Array.from({ length: 12 }).map((_, i) => (
              <View key={i} style={[
                styles.mandalaTick,
                { transform: [{ rotate: `${i * 30}deg` }, { translateY: -88 }] }
              ]} />
            ))}
          </Animated.View>

          {/* Central Pulsing Celestial Body — Sun by day, Moon by night */}
          {isDayTime ? (
            <Animated.View style={[
              styles.mandalaCenterSun,
              { transform: [{ scale: pulseAnim }] }
            ]}>
              {/* Rotating radiant sun rays */}
              <Animated.View style={[
                styles.sunRayLayer,
                { transform: [{ rotate: spinInterpolate }] }
              ]}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <View
                    key={`ray-${i}`}
                    style={[
                      styles.sunRay,
                      i % 2 === 1 && styles.sunRayShort,
                      { transform: [{ rotate: `${i * 30}deg` }, { translateY: -34 }] },
                    ]}
                  />
                ))}
              </Animated.View>

              {/* Solar disc */}
              <LinearGradient
                colors={['#FFFDF5', '#FFE082', '#FFB300', '#FB8C00']}
                start={{ x: 0.3, y: 0.15 }}
                end={{ x: 0.85, y: 1 }}
                style={styles.sunGradient}
              >
                {/* Bright core highlight */}
                <View style={styles.sunCoreHighlight} />
              </LinearGradient>

              {/* Golden halo glow rings */}
              <View style={styles.sunHalo1} />
              <View style={styles.sunHalo2} />
            </Animated.View>
          ) : (
            <Animated.View style={[
              styles.mandalaCenterMoon,
              { transform: [{ scale: pulseAnim }] }
            ]}>
              <LinearGradient
                colors={['#FFFCEE', '#F7E7C4', '#D2B48C', '#8E79A5']}
                start={{ x: 0.15, y: 0.15 }}
                end={{ x: 0.9, y: 0.9 }}
                style={styles.moonGradient}
              >
                {/* Lunar Craters */}
                <View style={[styles.moonCrater, { width: 9, height: 9, borderRadius: 4.5, top: 10, left: 12 }]} />
                <View style={[styles.moonCrater, { width: 13, height: 13, borderRadius: 6.5, top: 25, left: 23 }]} />
                <View style={[styles.moonCrater, { width: 7, height: 7, borderRadius: 3.5, top: 13, left: 31 }]} />
                <View style={[styles.moonCrater, { width: 10, height: 10, borderRadius: 5, top: 31, left: 8 }]} />
                <View style={[styles.moonCrater, { width: 5, height: 5, borderRadius: 2.5, top: 21, left: 15 }]} />

                {/* Lunar terminator crescent overlay shadow */}
                <LinearGradient
                  colors={['rgba(28, 20, 48, 0)', 'rgba(28, 20, 48, 0.4)', 'rgba(15, 10, 30, 0.75)']}
                  start={{ x: 0.2, y: 0.2 }}
                  end={{ x: 1, y: 1 }}
                  style={[StyleSheet.absoluteFillObject, { borderRadius: 26 }]}
                />
              </LinearGradient>

              {/* Outer halo glow rings */}
              <View style={styles.moonHalo1} />
              <View style={styles.moonHalo2} />
            </Animated.View>
          )}

          {/* Revolving Background Cosmic Numbers */}
          {[
            { val: '7', radius: 80, startAngle: 0, clockwise: true, size: 14, opacity: 0.4 },
            { val: '3', radius: 95, startAngle: 120, clockwise: false, size: 12, opacity: 0.35 },
            { val: '9', radius: 110, startAngle: 240, clockwise: true, size: 16, opacity: 0.5 },
            { val: '1', radius: 138, startAngle: 60, clockwise: false, size: 14, opacity: 0.4 },
            { val: '5', radius: 152, startAngle: 180, clockwise: true, size: 13, opacity: 0.35 },
            { val: '8', radius: 166, startAngle: 300, clockwise: false, size: 15, opacity: 0.45 },
          ].map((item, idx) => {
            const startAngle = item.startAngle;
            const rotateVal = orbitAnim.interpolate({
              inputRange: [0, 1],
              outputRange: item.clockwise 
                ? [`${startAngle}deg`, `${startAngle + 360}deg`] 
                : [`${startAngle}deg`, `${startAngle - 360}deg`],
            });
            const counterRotateVal = orbitAnim.interpolate({
              inputRange: [0, 1],
              outputRange: item.clockwise 
                ? [`${-startAngle}deg`, `${-startAngle - 360}deg`] 
                : [`${-startAngle}deg`, `${-startAngle + 360}deg`],
            });

            return (
              <Animated.View
                key={`bg-num-${idx}`}
                style={{
                  position: 'absolute',
                  left: 160 - item.size / 2,
                  top: 160 - item.size / 2,
                  width: item.size,
                  height: item.size,
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: [
                    { rotate: rotateVal },
                    { translateX: item.radius },
                    { rotate: counterRotateVal }
                  ]
                }}
              >
                <Text style={{
                  fontFamily: 'Cinzel-Bold',
                  fontSize: item.size,
                  color: isDayTime ? '#F5A623' : '#B3A2E7',
                  opacity: item.opacity,
                }}>
                  {item.val}
                </Text>
              </Animated.View>
            );
          })}

          {/* Three Orbiting Core Orbs */}
          {orbData.map((orb, idx) => {
            const angles = [-90, 30, 150];
            const angleStart = angles[idx];
            const isActive = selectedCoreNumType === orb.key;

            const floatY = orb.floatAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -6],
            });

            const rotateVal = orbitAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [`${angleStart}deg`, `${angleStart + 360}deg`],
            });

            const counterRotateVal = orbitAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [`${-angleStart}deg`, `${-angleStart - 360}deg`],
            });

            return (
              <Animated.View
                key={orb.key}
                style={[
                  styles.mandalaOrbWrapper,
                  {
                    left: 160 - 38, // Start centered in 320px
                    top: 160 - 38,
                    transform: [
                      { rotate: rotateVal },
                      { translateX: 120 }, // Orbit radius around center
                      { rotate: counterRotateVal }, // Keep content upright
                      { translateY: floatY },
                    ],
                  },
                ]}
              >
                <TouchableOpacity
                  onPress={() => setSelectedCoreNumType(orb.key)}
                  activeOpacity={0.8}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  style={[
                    styles.mandalaOrb,
                    isActive && { borderColor: orb.color, borderWidth: 2 },
                  ]}
                >
                  {isActive && (
                    <LinearGradient
                      colors={[orb.color, 'rgba(114, 9, 183, 0.6)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[StyleSheet.absoluteFillObject, { borderRadius: 32 }]}
                    />
                  )}
                  {orb.key === 'soulurge' ? (
                    <>
                      <Text style={[
                        styles.mandalaOrbNumber,
                        isActive && { color: '#FFFFFF' },
                      ]}>
                        {orb.val}
                      </Text>
                      <Text style={[
                        styles.mandalaOrbLabelCentered,
                        isActive && { color: 'rgba(255,255,255,0.85)' }
                      ]}>
                        Personal{"\n"}Year
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={[
                        styles.mandalaOrbNumber,
                        isActive && { color: '#FFFFFF' },
                      ]}>
                        {orb.val}
                      </Text>
                      <Text style={[
                        styles.mandalaOrbLabel,
                        isActive && { color: 'rgba(255,255,255,0.85)' },
                      ]}>
                        {orb.label}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
                {/* Active sparkle indicators */}
                {isActive && (
                  <View style={styles.mandalaOrbSparkle}>
                    <Sparkles size={10} color={orb.color} />
                  </View>
                )}
              </Animated.View>
            );
          })}

          {/* Floating hint */}
          <View style={styles.mandalaHint}>
            <Text style={styles.mandalaHintText}>Tap to explore ✨</Text>
          </View>
        </View>

        {/* Core Switcher Segment Bar */}
        <View style={styles.chartsSegmentContainer}>
          <TouchableOpacity
            style={[styles.chartsSegmentBtn, selectedCoreNumType === 'lifepath' && styles.chartsSegmentBtnActive]}
            onPress={() => setSelectedCoreNumType('lifepath')}
            activeOpacity={0.8}
          >
            <Text style={[styles.chartsSegmentText, selectedCoreNumType === 'lifepath' && styles.chartsSegmentTextActive]}>
              Life Path
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chartsSegmentBtn, selectedCoreNumType === 'destiny' && styles.chartsSegmentBtnActive]}
            onPress={() => setSelectedCoreNumType('destiny')}
            activeOpacity={0.8}
          >
            <Text style={[styles.chartsSegmentText, selectedCoreNumType === 'destiny' && styles.chartsSegmentTextActive]}>
              Destiny
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chartsSegmentBtn, selectedCoreNumType === 'soulurge' && styles.chartsSegmentBtnActive]}
            onPress={() => setSelectedCoreNumType('soulurge')}
            activeOpacity={0.8}
          >
            <Text style={[styles.chartsSegmentText, selectedCoreNumType === 'soulurge' && styles.chartsSegmentTextActive]}>
              Personal Year
            </Text>
          </TouchableOpacity>
        </View>

        {/* Selected Core Number Card */}
        <View style={styles.astralCard}>
          <LinearGradient
            colors={['#7209B7', '#F72585']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.astralCardGradient}
          >
            <Text style={styles.zodiacTitle}>{coreNumTitle}: {coreNumVal}</Text>
            <Text style={styles.zodiacSubtitle}>{coreNumHeading}</Text>
            <View style={styles.divider} />
            {renderNumerologyDesc(coreNumDesc, extraText)}

          </LinearGradient>
        </View>
        <View style={{ height: 100 + insets.bottom }} />
      </ScrollView>
    );
  };

  // 5. Charts & Kundli View (Tab 4)
  const renderChartsView = () => {
    const rashiToIndex: Record<string, number> = {
      Aries: 0, Taurus: 1, Gemini: 2, Cancer: 3, Leo: 4, Virgo: 5,
      Libra: 6, Scorpio: 7, Sagittarius: 8, Capricorn: 9, Aquarius: 10, Pisces: 11
    };

    const apiAscendantStr = apiBirthChart?.data?.chart_data?.ascendant || apiBirthChart?.chart_data?.ascendant;
    const ascIndex0 = apiAscendantStr && rashiToIndex[apiAscendantStr] !== undefined ? rashiToIndex[apiAscendantStr] : zodiacIndex;

    // Pull data directly from API — no hardcoded fallbacks
    const birthDetails = apiBirthChart?.data?.birth_details || apiBirthChart?.birth_details || null;
    const chartData = apiBirthChart?.data?.chart_data || apiBirthChart?.chart_data || null;
    const interpretation = apiBirthChart?.data?.interpretation || apiBirthChart?.interpretation || null;
    const planetsObj: Record<string, any> = chartData?.planets || {};
    const housesObj: Record<string, string> = chartData?.houses || {};

    // Convert API planets to array for SVG chart rendering
    const svgPlanets = (() => {
      if (Object.keys(planetsObj).length === 0) {
        // Show demo chart only as placeholder while API loads, never as final data
        return buildDemoChart();
      }
      const PLANET_META: Record<string, { label: string; abbr: string; color: string }> = {
        sun: { label: 'Sun', abbr: 'SU', color: '#E8A200' },
        moon: { label: 'Moon', abbr: 'MO', color: '#B3A2E7' },
        mercury: { label: 'Mercury', abbr: 'ME', color: '#12A594' },
        venus: { label: 'Venus', abbr: 'VE', color: '#F72585' },
        mars: { label: 'Mars', abbr: 'MA', color: '#E5484D' },
        jupiter: { label: 'Jupiter', abbr: 'JU', color: '#7209B7' },
        saturn: { label: 'Saturn', abbr: 'SA', color: '#5B8DEF' },
        rahu: { label: 'Rahu', abbr: 'RA', color: '#A0A0A0' },
        ketu: { label: 'Ketu', abbr: 'KE', color: '#6E56CF' }
      };
      return Object.entries(planetsObj).map(([pKey, pVal]: [string, any]) => {
        const k = pKey.toLowerCase();
        const meta = PLANET_META[k] || { label: pKey, abbr: pKey.substring(0, 2).toUpperCase(), color: '#7209B7' };
        const signName = pVal?.sign || 'Aries';
        const signIdx = rashiToIndex[signName] ?? 0;
        let houseNum = ((signIdx - ascIndex0 + 12) % 12) + 1;
        if (Object.keys(housesObj).length > 0) {
          const found = Object.entries(housesObj).find(([_, s]) => s === signName);
          if (found) houseNum = Number(found[0]);
        }
        return {
          key: k, name: meta.label, san: meta.label, glyph: '', abbr: meta.abbr,
          theme: signName, house: houseNum,
          degree: pVal?.degree !== undefined ? pVal.degree % 30 : 15,
          retro: Boolean(pVal?.retro), color: meta.color
        };
      });
    })();

    const chartSize = width < 340 ? Math.min(width - 24, 400) : Math.min(width - 48, 400);
    const scrollPadding = width < 340 ? 12 : 20;
    const cardMargin = width < 340 ? 6 : 16;

    return (
      <ScrollView showsVerticalScrollIndicator={false} style={[styles.tabScroll, { paddingHorizontal: scrollPadding }]}>
        <Text style={styles.tabViewTitle}>Astro Map</Text>

        {/* Segmented Control */}
        <View style={[styles.chartsSegmentContainer, { marginHorizontal: cardMargin }]}>
          <TouchableOpacity
            style={[styles.chartsSegmentBtn, chartsSubTab === 'birthChart' && styles.chartsSegmentBtnActive]}
            onPress={() => { setChartsSubTab('birthChart'); setSelectedPlanet(null); }}
            activeOpacity={0.8}
          >
            <Text style={[styles.chartsSegmentText, chartsSubTab === 'birthChart' && styles.chartsSegmentTextActive]}>
              ☉ Birth Chart
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chartsSegmentBtn, chartsSubTab === 'kundli' && styles.chartsSegmentBtnActive]}
            onPress={() => { setChartsSubTab('kundli'); setSelectedPlanet(null); }}
            activeOpacity={0.8}
          >
            <Text style={[styles.chartsSegmentText, chartsSubTab === 'kundli' && styles.chartsSegmentTextActive]}>
              ◇ Kundli
            </Text>
          </TouchableOpacity>
        </View>

        {/* Share Birth Chart / Kundli Card Button */}
        <View style={{ marginHorizontal: cardMargin, marginBottom: 12 }}>
          <TouchableOpacity
            style={styles.shareCardTrigger}
            onPress={() => {
              triggerShareCard({
                category: chartsSubTab === 'birthChart' ? 'BIRTH CHART' : 'KUNDLI CHART',
                title: `${userName}'s ${chartsSubTab === 'birthChart' ? 'Natal Chart' : 'Lagna Kundli'}`,
                subtitle: `Ascendant: ${chartData?.ascendant || RASHIS[ascIndex0]} ${RASHI_GLYPHS[ascIndex0]}`,
                readingText: interpretation?.summary || `Natal alignment indicates strong influence from ${chartData?.ascendant || 'Ascendant'}. Explore deep house positions and planetary placements.`,
                highlights: [
                  { label: 'Ascendant', value: chartData?.ascendant || RASHIS[ascIndex0] },
                  { label: 'Sun Sign', value: zodiac?.name || 'Scorpio' },
                  { label: 'Moon Sign', value: chartData?.planets?.Moon?.sign || 'Vedic' },
                  { label: 'Nakshatra', value: birthDetails?.nakshatra || 'Magha' },
                ],
              });
            }}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#D946EF', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.shareCardTriggerGradient}
            >
              <Share2 size={16} color="#FFFFFF" />
              <Text style={styles.shareCardTriggerText}>Share {chartsSubTab === 'birthChart' ? 'Birth Chart' : 'Kundli'} Card</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Chart Label */}
        <View style={[styles.amChartLabelRow, { marginHorizontal: cardMargin }]}>
          <Text style={styles.amChartLabel}>
            {chartsSubTab === 'birthChart' ? 'Western Natal Wheel' : 'North Indian (Lagna) Chart'}
          </Text>
          <Text style={styles.amAscLabel}>ASC: {chartData?.ascendant || RASHIS[ascIndex0]} {RASHI_GLYPHS[ascIndex0]}</Text>
        </View>

        {/* Chart / Kundli SVG */}
        <View style={styles.amChartContainer}>
          {chartsSubTab === 'birthChart' ? (
            <BirthChartWheel size={chartSize} ascIndex0={ascIndex0} planets={svgPlanets} selectedKey={selectedPlanet} />
          ) : (
            <KundliDiamond size={chartSize} ascIndex0={ascIndex0} planets={svgPlanets} selectedKey={selectedPlanet} houses={housesObj} />
          )}
        </View>

        {/* ── Birth Details (same as website) ── */}
        <Text style={styles.sectionTitle}>Birth Details</Text>
        {birthDetails ? (
          <View style={[styles.astroGridCard, { marginHorizontal: cardMargin }]}>
            <View style={styles.astroGridRow}>
              <View style={styles.astroGridCol}>
                <Text style={styles.astroGridLabel}>NAME</Text>
                <Text style={styles.astroGridValue} numberOfLines={1}>{birthDetails.full_name}</Text>
              </View>
              <View style={styles.astroGridCol}>
                <Text style={styles.astroGridLabel}>DATE OF BIRTH</Text>
                <Text style={styles.astroGridValue}>{birthDetails.date_of_birth}</Text>
              </View>
            </View>
            <View style={[styles.astroGridRow, { borderTopWidth: 1, borderTopColor: 'rgba(114, 9, 183, 0.05)', marginTop: 12, paddingTop: 12 }]}>
              <View style={styles.astroGridCol}>
                <Text style={styles.astroGridLabel}>TIME OF BIRTH</Text>
                <Text style={styles.astroGridValue}>{birthDetails.time_of_birth}</Text>
              </View>
              <View style={styles.astroGridCol}>
                <Text style={styles.astroGridLabel}>PLACE OF BIRTH</Text>
                <Text style={styles.astroGridValue} numberOfLines={1}>{birthDetails.place_of_birth}</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={[styles.astroGridCard, { marginHorizontal: cardMargin, alignItems: 'center', paddingVertical: 24 }]}>
            <Text style={{ color: '#999', fontSize: 14 }}>Loading birth details...</Text>
          </View>
        )}

        {/* ── Core Chart (same as website) ── */}
        <Text style={styles.sectionTitle}>Core Chart</Text>
        {chartData ? (
          <View style={[styles.astroGridCard, { marginHorizontal: cardMargin }]}>
            <View style={styles.astroGridRow}>
              <View style={styles.astroGridCol}>
                <Text style={styles.astroGridLabel}>ASCENDANT</Text>
                <Text style={styles.astroGridValue}>{chartData.ascendant}</Text>
              </View>
              <View style={styles.astroGridCol}>
                <Text style={styles.astroGridLabel}>MOON SIGN</Text>
                <Text style={styles.astroGridValue}>{chartData.moon_sign}</Text>
              </View>
            </View>
            <View style={[styles.astroGridRow, { borderTopWidth: 1, borderTopColor: 'rgba(114, 9, 183, 0.05)', marginTop: 12, paddingTop: 12 }]}>
              <View style={styles.astroGridCol}>
                <Text style={styles.astroGridLabel}>SUN SIGN</Text>
                <Text style={styles.astroGridValue}>{chartData.sun_sign}</Text>
              </View>
              <View style={styles.astroGridCol}>
                <Text style={styles.astroGridLabel}>NAKSHATRA</Text>
                <Text style={styles.astroGridValue}>{chartData.nakshatra}</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={[styles.astroGridCard, { marginHorizontal: cardMargin, alignItems: 'center', paddingVertical: 24 }]}>
            <Text style={{ color: '#999', fontSize: 14 }}>Loading chart data...</Text>
          </View>
        )}

        {/* ── Planetary Positions (same as website: planet name, sign, degree) ── */}
        <Text style={styles.sectionTitle}>Planetary Positions</Text>
        <View style={[styles.chartDetailsCard, { marginHorizontal: cardMargin }]}>
          {Object.keys(planetsObj).length > 0 ? (
            Object.entries(planetsObj).map(([planet, data]: [string, any], idx: number) => (
              <View key={planet} style={[styles.blueprintRow, idx === Object.keys(planetsObj).length - 1 && { borderBottomWidth: 0 }]}>
                <Text style={[styles.blueprintLabel, { textTransform: 'capitalize' }]}>{planet}</Text>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.blueprintValue}>{data.sign}</Text>
                  <Text style={styles.amTableNak}>{data.degree}°</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: 24 }}>
              <Text style={{ color: '#999', fontSize: 14 }}>Loading planetary data...</Text>
            </View>
          )}
        </View>

        {/* ── 12 Houses (same as website: House N → sign name) ── */}
        <Text style={styles.sectionTitle}>12 Houses</Text>
        <View style={[styles.amHouseGrid, { marginHorizontal: cardMargin }]}>
          {Object.keys(housesObj).length > 0 ? (
            Object.entries(housesObj).map(([house, sign]) => (
              <View key={house} style={styles.amHouseCell}>
                <Text style={styles.amHouseCellNum}>House {house}</Text>
                <Text style={styles.amHouseCellTheme}>{sign}</Text>
              </View>
            ))
          ) : (
            Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
              <View key={h} style={styles.amHouseCell}>
                <Text style={styles.amHouseCellNum}>House {h}</Text>
                <Text style={styles.amHouseCellTheme}>{RASHIS[(ascIndex0 + h - 1) % 12]}</Text>
              </View>
            ))
          )}
        </View>

        {/* ── AI Interpretation (same as website: 7 sections) ── */}
        {interpretation && (
          <>
            <Text style={styles.sectionTitle}>AI Interpretation</Text>
            <View style={[styles.amInterpretationsCard, { marginHorizontal: cardMargin }]}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.amInterpretationsTabsScroll}>
                {[
                  { key: 'personality', label: 'Personality' },
                  { key: 'strengths', label: 'Strengths' },
                  { key: 'challenges', label: 'Challenges' },
                  { key: 'career', label: 'Career' },
                  { key: 'relationships', label: 'Relationships' },
                  { key: 'health', label: 'Health' },
                  { key: 'spiritual_path', label: 'Spiritual Path' },
                ].map(tab => {
                  const isTabSelected = selectedInterpretationTab === tab.key;
                  return (
                    <TouchableOpacity
                      key={tab.key}
                      onPress={() => setSelectedInterpretationTab(tab.key)}
                      style={[styles.amInterpretationsTabBtn, isTabSelected && styles.amInterpretationsTabBtnActive]}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.amInterpretationsTabText, isTabSelected && styles.amInterpretationsTabTextActive]}>
                        {tab.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              <View style={styles.amInterpretationsContent}>
                <Text style={styles.amInterpretationsText}>
                  {interpretation[selectedInterpretationTab] || "No data available for this section."}
                </Text>
              </View>
            </View>
          </>
        )}

        {/* ── Important Yogas (same as website) ── */}
        {interpretation?.important_yogas && interpretation.important_yogas.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Important Yogas</Text>
            <View style={[styles.amYogasCard, { marginHorizontal: cardMargin }]}>
              {interpretation.important_yogas.map((yoga: any, idx: number) => (
                <View key={idx} style={styles.amYogaItem}>
                  <Text style={styles.amYogaName}>✦ {typeof yoga === 'string' ? yoga : (yoga.name || yoga.title || 'Yoga')}</Text>
                  {typeof yoga !== 'string' && (yoga.description || yoga.desc) && (
                    <Text style={styles.amYogaDesc}>{yoga.description || yoga.desc}</Text>
                  )}
                </View>
              ))}
            </View>
          </>
        )}

        <View style={{ height: 100 + insets.bottom }} />
      </ScrollView>
    );
  };

  // Help & Support view
  const renderHelpView = () => {
    return (
      <View style={styles.subViewContainer} {...swipeBackPanResponder.panHandlers}>
        {/* Sub Header */}
        <View style={styles.subHeader}>
          <TouchableOpacity onPress={() => setCurrentProfileSubView('profile')} style={styles.subHeaderBackBtn}>
            <ArrowLeft size={18} color="#7209B7" />
          </TouchableOpacity>
          <Text style={styles.subHeaderTitle}>Help & Support</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.subScroll}>
          {/* FAQ Card */}
          <View style={styles.helpHeaderCard}>
            <Text style={styles.helpHeaderTitle}>How can we guide you?</Text>
            <Text style={styles.helpHeaderDesc}>
              Explore our frequently asked celestial queries or get in touch for custom readings support.
            </Text>
          </View>

          <Text style={styles.helpSectionTitle}>Frequently Asked Questions</Text>

          {/* FAQ Item 1 */}
          <View style={styles.faqCard}>
            <Text style={styles.faqQuestion}>How do I get more credits?</Text>
            <Text style={styles.faqAnswer}>
              AstroAi4u provides daily credits. If you need more, you can explore numerology calculations, view tarot spreads, or engage with daily chart reflections.
            </Text>
          </View>

          {/* FAQ Item 2 */}
          <View style={styles.faqCard}>
            <Text style={styles.faqQuestion}>How accurate are the readings?</Text>
            <Text style={styles.faqAnswer}>
              Our charts are based on ancient Vedic Astrology principles. Calculations depend on your exact birth time and location coordinates, providing high precision transits mapping.
            </Text>
          </View>

          {/* FAQ Item 3 */}
          <View style={styles.faqCard}>
            <Text style={styles.faqQuestion}>Is my face/palm scan photo saved?</Text>
            <Text style={styles.faqAnswer}>
              Never. All face and palm images are processed locally on your device in real-time. We do not store, upload, or share any of your private biometric pictures.
            </Text>
          </View>

          {/* Contact Support */}
          <TouchableOpacity 
            style={styles.contactSupportBtn}
            onPress={() => {
              Linking.openURL('mailto:arcadian@arcddia.co.in').catch(() => {
                Alert.alert('Email Us', 'Please email us directly at: arcadian@arcddia.co.in');
              });
            }}
          >
            <LinearGradient
              colors={['#7209B7', '#F72585']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.contactSupportGradient}
            >
              <Text style={styles.contactSupportText}>EMAIL SUPPORT</Text>
              <Text style={styles.contactSupportSub}>arcadian@arcddia.co.in</Text>
            </LinearGradient>
          </TouchableOpacity>
          <View style={{ height: 60 }} />
        </ScrollView>
      </View>
    );
  };


  // Credit Purchase view
  const renderCreditsPurchaseView = () => {
    const isIOS = Platform.OS === 'ios';

    const bundles = [
      {
        id: 'cosmic_starter',
        name: 'Cosmic Starter',
        count: 50,
        price: isIOS ? '₹499/mo' : '₹399/mo',
        priceUSD: isIOS ? '$5.99/mo' : '$4.99/mo',
        color: ['#4A00E0', '#8E2DE2'],
        features: [
          '50 Monthly Credits (No Rollover)',
          'Free Birth Chart & Daily Forecast',
          'Unlimited Text Chat with Hope',
          'Basic Calendar (Up to 10 events/mo)',
          'Basic Chart Overlay & Event Guidance',
          'Standard Processing Speed',
          '1 CR StyleForecaster | 10 CR Picture Readings'
        ]
      },
      {
        id: 'cosmic_explorer',
        name: 'Cosmic Explorer',
        count: 180,
        price: isIOS ? '₹1,499/mo' : '₹1,199/mo',
        priceUSD: isIOS ? '$17.99/mo' : '$14.99/mo',
        color: ['#7209B7', '#F72585'],
        popular: true,
        features: [
          '180 Monthly Credits (No Rollover)',
          'Free Birth Chart & Daily Forecast',
          'Unlimited Text Chat with Hope',
          'Premium Calendar (Unlimited Events)',
          'Detailed Chart Overlay & Reminders',
          'Limited Forecast Reports Included',
          '1 CR StyleForecaster | 10 CR Picture Readings'
        ]
      },
      {
        id: 'cosmic_sage',
        name: 'Cosmic Sage',
        count: 450,
        price: isIOS ? '₹2,999/mo' : '₹2,399/mo',
        priceUSD: isIOS ? '$34.99/mo' : '$29.99/mo',
        color: ['#F3904F', '#3B4371'],
        features: [
          '450 Monthly Credits (No Rollover)',
          'Free Birth Chart & Daily Forecast',
          'Unlimited Text Chat with Hope',
          'Master Calendar (Unlimited Events)',
          'Deep Analysis Overlay & Guidance',
          'Full Comprehensive Forecast Reports',
          'VIP Priority Processing Speed',
          '1 CR StyleForecaster | 10 CR Picture Readings'
        ]
      },
    ];

    const handlePurchase = async (bundleId: string, bundleName: string, addCount: number) => {
      try {
        setIsPurchasingCredit(true);

        // Mock billing fallback for Expo Go (which does not support native JSI NitroModules)
        if (!RNIap || !RNIap.requestSubscription) {
          Alert.alert(
            'Expo Go Mock Billing 🪙',
            `You are running in Expo Go. Would you like to simulate a successful purchase of ${bundleName} (${addCount} Cosmic Credits)?`,
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Simulate Success',
                onPress: async () => {
                  try {
                    const verifyRes = await verifyIAPPayment({
                      platform: Platform.OS,
                      productId: bundleId,
                      transactionId: `mock_${Platform.OS}_${Date.now()}`,
                      receipt: 'mock_development_receipt_token'
                    });

                    if (verifyRes && verifyRes.success) {
                      setCredits(prev => prev + addCount);
                      Alert.alert('Mock Purchase Success!', `Successfully added ${addCount} Cosmic Credits to your account (Simulated).`);
                    } else {
                      Alert.alert('Mock Verification Failed', verifyRes?.message || 'Verification rejected by backend.');
                    }
                  } catch (err: any) {
                    Alert.alert('Mock Verification Error', err.message || 'Error communicating with backend.');
                  }
                }
              }
            ]
          );
          return;
        }

        if (Platform.OS === 'ios' || Platform.OS === 'android') {
          try {
            console.log(`[IAP] Requesting subscription for SKU: ${bundleId}`);
            await RNIap.requestSubscription({
              sku: bundleId,
              ...(Platform.OS === 'android' && {
                subscriptionOffers: [{ sku: bundleId, offerToken: '' }]
              })
            });
          } catch (subscriptionErr: any) {
            console.warn('[IAP] Subscription request failed, trying fallback standard purchase:', subscriptionErr.message);
            try {
              await RNIap.requestPurchase({ sku: bundleId });
            } catch (purchaseErr: any) {
              if (purchaseErr.code !== 'E_USER_CANCELLED') {
                Alert.alert('Purchase Failed', purchaseErr.message || 'Unable to complete in-app purchase.');
              }
            }
          }
        } else {
          Alert.alert('Not Supported', 'In-app purchases are only supported on iOS and Android devices.');
        }
      } catch (err: any) {
        if (err.code !== 'E_USER_CANCELLED') {
          Alert.alert('Payment Error', err?.message || 'Failed to initialize payment gateway.');
        }
      } finally {
        setIsPurchasingCredit(false);
      }
    };

    return (
      <View style={styles.subViewContainer}>
        {/* Sub Header */}
        <View style={styles.subHeader}>
          <TouchableOpacity onPress={() => setCurrentProfileSubView('profile')} style={styles.subHeaderBackBtn}>
            <ArrowLeft size={18} color="#7209B7" />
          </TouchableOpacity>
          <Text style={styles.subHeaderTitle}>Cosmic Membership Plans</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.subScroll} nestedScrollEnabled={true} keyboardShouldPersistTaps="handled">
          {/* Balance card */}
          <View style={styles.balanceHeaderCard}>
            <Sparkles size={28} color="#FFD700" style={{ marginBottom: 8 }} />
            <Text style={styles.balanceHeaderTitle}>Current Balance</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 2 }}>
              <GoldCoin size={22} style={{ marginRight: 6 }} />
              <Text style={styles.balanceHeaderValue}>{credits} Credits</Text>
            </View>
            <Text style={styles.balanceHeaderDesc}>
              Choose a monthly plan to get credits, unlock daily forecasts, personalized charts, and AI consultations.
            </Text>
          </View>

          <Text style={styles.helpSectionTitle}>Select Membership Plan</Text>

          {/* Vertical Plan Cards List for smooth, natural mobile scrolling */}
          {bundles.map((bundle) => (
            <View
              key={bundle.id}
              style={{
                marginHorizontal: 20,
                marginBottom: 20,
                borderRadius: 20,
                overflow: 'hidden',
                borderWidth: bundle.popular ? 2 : 1,
                borderColor: bundle.popular ? '#F72585' : 'rgba(255, 255, 255, 0.15)',
                elevation: 6,
                shadowColor: bundle.popular ? '#F72585' : '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
              }}
            >
              <LinearGradient
                colors={bundle.color as [string, string, ...string[]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ padding: 20 }}
              >
                {bundle.popular && (
                  <View style={{
                    alignSelf: 'flex-start',
                    backgroundColor: '#F72585',
                    paddingHorizontal: 12,
                    paddingVertical: 3,
                    borderRadius: 12,
                    marginBottom: 10
                  }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 }}>MOST POPULAR</Text>
                  </View>
                )}

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: 'bold' }}>{bundle.name}</Text>
                  <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: 'extrabold' }}>{bundle.price}</Text>
                </View>

                <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 12, marginBottom: 12 }}>Equivalent to {bundle.priceUSD}</Text>

                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  alignSelf: 'flex-start',
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 12,
                  marginBottom: 16
                }}>
                  <GoldCoin size={16} style={{ marginRight: 6 }} />
                  <Text style={{ color: '#FFD700', fontWeight: 'bold', fontSize: 13 }}>{bundle.count} Monthly Credits</Text>
                </View>

                {/* Features list (Each feature on a NEW line) */}
                <View style={{ borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.2)', paddingTop: 12, marginBottom: 16 }}>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 10, fontWeight: 'bold', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Included Features</Text>
                  {bundle.features.map((feat, i) => (
                    <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                      <Text style={{ color: '#00FFC2', marginRight: 8, fontSize: 13, fontWeight: 'bold' }}>✓</Text>
                      <Text style={{ color: 'rgba(255, 255, 255, 0.95)', fontSize: 12, fontWeight: '500', flex: 1 }}>
                        {feat}
                      </Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  disabled={isPurchasingCredit}
                  onPress={() => handlePurchase(bundle.id, bundle.name, bundle.count)}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                    paddingVertical: 12,
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1.5,
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    marginTop: 6
                  }}
                >
                  {isPurchasingCredit ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 14, letterSpacing: 0.5 }}>SUBSCRIBE NOW</Text>
                  )}
                </TouchableOpacity>
              </LinearGradient>
            </View>
          ))}

          {/* App Store & Play Store Compliant Privacy Policy & Subscription Terms Notice Card */}
          <View style={{
            marginHorizontal: 20,
            marginTop: 14,
            marginBottom: 30,
            padding: 18,
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            borderWidth: 1,
            borderColor: 'rgba(114, 9, 183, 0.15)',
            shadowColor: '#7209B7',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 6,
            elevation: 2,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
              <Lock size={15} color="#7209B7" style={{ marginRight: 6 }} />
              <Text style={{ color: '#2C2B3D', fontSize: 13, fontFamily: 'Cinzel-Bold' }}>
                Subscription Terms & Privacy Notice
              </Text>
            </View>

            <Text style={{ color: '#726F8D', fontSize: 11, fontFamily: 'SourceSerif4', textAlign: 'center', lineHeight: 16, marginBottom: 14 }}>
              Subscriptions auto-renew monthly unless canceled at least 24 hours before renewal in Account Settings. Unused monthly credits expire at the end of each billing cycle.
            </Text>
            
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10 }}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => { setPreviousProfileSubView('credits'); setCurrentProfileSubView('terms'); }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: 'rgba(247, 37, 133, 0.08)',
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: 'rgba(247, 37, 133, 0.25)'
                }}
              >
                <FileText size={13} color="#F72585" style={{ marginRight: 5 }} />
                <Text style={{ color: '#F72585', fontSize: 11.5, fontFamily: 'Cinzel-Bold' }}>Terms of Service</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => { setPreviousProfileSubView('credits'); setCurrentProfileSubView('privacy'); }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: 'rgba(114, 9, 183, 0.08)',
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: 'rgba(114, 9, 183, 0.25)'
                }}
              >
                <Lock size={13} color="#7209B7" style={{ marginRight: 5 }} />
                <Text style={{ color: '#7209B7', fontSize: 11.5, fontFamily: 'Cinzel-Bold' }}>Privacy Policy</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ height: 60 }} />
        </ScrollView>


      </View>
    );
  };

  // Terms of Service view (App Store & Play Store Compliant)
  const renderTermsOfServiceView = () => {
    return (
      <View style={styles.subViewContainer}>
        {/* Sub Header */}
        <View style={styles.subHeader}>
          <TouchableOpacity onPress={() => setCurrentProfileSubView(previousProfileSubView || 'profile')} style={styles.subHeaderBackBtn}>
            <ArrowLeft size={18} color="#7209B7" />
          </TouchableOpacity>
          <Text style={styles.subHeaderTitle}>Terms of Service</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.subScroll} nestedScrollEnabled={true}>
          <View style={styles.helpHeaderCard}>
            <Text style={styles.helpHeaderTitle}>Terms of Service</Text>
            <Text style={styles.helpHeaderDesc}>
              AstroAi4u Services & Subscriptions Policy (App Store & Play Store Compliant). Last updated: July 2026.
            </Text>
          </View>

          {/* Section 1 */}
          <View style={styles.faqCard}>
            <Text style={styles.faqQuestion}>1. Agreement to Terms</Text>
            <Text style={styles.faqAnswer}>
              By downloading, creating an account, or using AstroAi4u, you agree to comply with and be bound by these Terms of Service. If you do not agree, please do not use the application.
            </Text>
          </View>

          {/* Section 2 */}
          <View style={styles.faqCard}>
            <Text style={styles.faqQuestion}>2. In-App Subscriptions & Payments</Text>
            <Text style={styles.faqAnswer}>
              AstroAi4u offers 3 monthly auto-renewable subscription tiers:{'\n'}
              • Cosmic Starter: {Platform.OS === 'ios' ? '$5.99 / ₹499' : '$4.99 / ₹399'} per month (50 Monthly Credits){'\n'}
              • Cosmic Explorer: {Platform.OS === 'ios' ? '$17.99 / ₹1,499' : '$14.99 / ₹1,199'} per month (180 Monthly Credits){'\n'}
              • Cosmic Sage: {Platform.OS === 'ios' ? '$34.99 / ₹2,999' : '$29.99 / ₹2,399'} per month (450 Monthly Credits){'\n\n'}
              Credit Reset Rule: Monthly credit allowances refresh every billing cycle. Unused monthly credits expire at the end of each billing cycle and do not roll over.{'\n\n'}
              Billing: Payment is charged to your App Store, Google Play, or Razorpay payment account at confirmation of purchase. Subscriptions automatically renew monthly unless auto-renew is disabled at least 24 hours prior to the current period ending.
            </Text>
          </View>

          {/* Section 3 */}
          <View style={styles.faqCard}>
            <Text style={styles.faqQuestion}>3. Credit Costs & Feature Access</Text>
            <Text style={styles.faqAnswer}>
              • Birth Chart & Personal Daily Forecast: FREE{'\n'}
              • AI Chat with Hope: Unlimited Text Chat{'\n'}
              • StyleForecaster Reading: 1 credit per use{'\n'}
              • Palm, Face & Coffee Readings: 10 credits per use{'\n'}
              • Picture-based Analysis: 10 credits per use
            </Text>
          </View>

          {/* Section 4 */}
          <View style={styles.faqCard}>
            <Text style={styles.faqQuestion}>4. Subscriptions Cancellation</Text>
            <Text style={styles.faqAnswer}>
              You can manage or cancel your active subscription anytime through your Apple ID / Google Play Account Settings. Cancellation takes effect at the end of the current paid billing cycle.
            </Text>
          </View>

          {/* Section 5 */}
          <View style={styles.faqCard}>
            <Text style={styles.faqQuestion}>5. Disclaimer & Entertainment Purpose</Text>
            <Text style={styles.faqAnswer}>
              All astrological calculations, Kundli, and AI forecasts are derived using ancient Vedic Astrology algorithms and are provided for personal reflection, guidance, and entertainment purposes only. They do not constitute financial, legal, or medical advice.
            </Text>
          </View>

          {/* Section 6 */}
          <View style={styles.faqCard}>
            <Text style={styles.faqQuestion}>6. Contact Support</Text>
            <Text style={styles.faqAnswer}>
              For subscription support or billing questions, reach us at: arcadian@arcddia.co.in
            </Text>
          </View>
          <View style={{ height: 60 }} />
        </ScrollView>
      </View>
    );
  };

  // Privacy & Permissions view (App Store & Play Store Compliant)
  const renderPrivacyView = () => {
    return (
      <View style={styles.subViewContainer}>
        {/* Sub Header */}
        <View style={styles.subHeader}>
          <TouchableOpacity onPress={() => setCurrentProfileSubView(previousProfileSubView || 'profile')} style={styles.subHeaderBackBtn}>
            <ArrowLeft size={18} color="#7209B7" />
          </TouchableOpacity>
          <Text style={styles.subHeaderTitle}>Privacy Policy</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.subScroll} nestedScrollEnabled={true}>
          <View style={styles.helpHeaderCard}>
            <Text style={styles.helpHeaderTitle}>Privacy Policy & Data Security</Text>
            <Text style={styles.helpHeaderDesc}>
              AstroAi4u is built on Privacy by Design. We respect your personal data and adhere strictly to App Store & Google Play privacy guidelines.
            </Text>
          </View>

          {/* Policy Card 1 */}
          <View style={styles.faqCard}>
            <Text style={styles.faqQuestion}>1. Zero Biometric Storage (Palm & Face Scans)</Text>
            <Text style={styles.faqAnswer}>
              All palm, face, and coffee reading photos captured via your device camera or uploaded from your library are processed locally in real-time. We NEVER store, upload, sell, or share your biometric image data on any external server.
            </Text>
          </View>

          {/* Policy Card 2 */}
          <View style={styles.faqCard}>
            <Text style={styles.faqQuestion}>2. Birth Information Usage</Text>
            <Text style={styles.faqAnswer}>
              Your full name, birthdate, birth time, and birth location coordinates are used exclusively to compute accurate Vedic horoscope charts, planet transits, and customized daily forecasts.
            </Text>
          </View>

          {/* Policy Card 3 */}
          <View style={styles.faqCard}>
            <Text style={styles.faqQuestion}>3. Third-Party Data Selling Policy</Text>
            <Text style={styles.faqAnswer}>
              We do NOT sell, rent, trade, or share your personal details with third-party ad brokers or data aggregators.
            </Text>
          </View>

          {/* Policy Card 4 */}
          <View style={styles.faqCard}>
            <Text style={styles.faqQuestion}>4. Payment Security</Text>
            <Text style={styles.faqAnswer}>
              In-app subscription transactions are processed securely through PCI-DSS certified gateways (Apple App Store / Google Play / Razorpay). We never store or view raw credit card or banking numbers.
            </Text>
          </View>

          <Text style={styles.helpSectionTitle}>Device App Permissions</Text>

          {/* Camera Permission Switch Bar */}
          <View style={styles.permissionBar}>
            <View style={styles.permissionInfo}>
              <Text style={styles.permissionTitle}>Camera Access</Text>
              <Text style={styles.permissionDesc}>
                Used to capture live photos for real-time palm or face scans.
              </Text>
            </View>
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={toggleCameraPermission}
              style={[
                styles.switchTrack,
                cameraPermissionGranted ? styles.switchTrackOn : styles.switchTrackOff
              ]}
            >
              <View style={[
                styles.switchThumb,
                cameraPermissionGranted ? styles.switchThumbOn : styles.switchThumbOff
              ]} />
            </TouchableOpacity>
          </View>

          {/* Library Permission Switch Bar */}
          <View style={styles.permissionBar}>
            <View style={styles.permissionInfo}>
              <Text style={styles.permissionTitle}>Photo Gallery Uploads</Text>
              <Text style={styles.permissionDesc}>
                Used to select saved pictures from your photo library.
              </Text>
            </View>
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={toggleLibraryPermission}
              style={[
                styles.switchTrack,
                libraryPermissionGranted ? styles.switchTrackOn : styles.switchTrackOff
              ]}
            >
              <View style={[
                styles.switchThumb,
                libraryPermissionGranted ? styles.switchThumbOn : styles.switchThumbOff
              ]} />
            </TouchableOpacity>
          </View>

          {/* System Settings Button */}
          <TouchableOpacity 
            style={styles.systemSettingsBtn}
            onPress={() => Linking.openSettings()}
          >
            <Text style={styles.systemSettingsBtnText}>Open Device System Settings</Text>
          </TouchableOpacity>
          <View style={{ height: 60 }} />
        </ScrollView>
      </View>
    );
  };

  // 6. Profile View (Tab 5)
  const renderProfileView = () => {
    if (currentProfileSubView === 'help') {
      return renderHelpView();
    }
    if (currentProfileSubView === 'privacy') {
      return renderPrivacyView();
    }
    if (currentProfileSubView === 'terms') {
      return renderTermsOfServiceView();
    }
    if (currentProfileSubView === 'credits') {
      return renderCreditsPurchaseView();
    }

    return (
      <ScrollView showsVerticalScrollIndicator={false} style={styles.tabScroll}>
        <Text style={styles.tabViewTitle}>Celestial Profile</Text>
        
        {/* User Card */}
        {!isEditingProfile ? (
          <View style={styles.profileDetailsCard}>
            <View style={styles.profileAvatarLarge}>
              <Text style={styles.profileInitials}>{userName.substring(0, 2).toUpperCase()}</Text>
            </View>
            <Text style={styles.profileName}>{userName}</Text>
            <Text style={styles.profileSubText}>Zodiac Sign: {zodiac.name}</Text>
            
            <View style={styles.profileGrid}>
              <View style={styles.profileGridItem}>
                <Text style={styles.profileGridLabel}>BIRTHDATE</Text>
                <Text style={styles.profileGridValue}>{birthdate}</Text>
              </View>
              <View style={styles.profileGridItem}>
                <Text style={styles.profileGridLabel}>BIRTH TIME</Text>
                <Text style={styles.profileGridValue}>{profileAnswers.birthtime || 'Not set'}</Text>
              </View>
              <View style={styles.profileGridItem}>
                <Text style={styles.profileGridLabel}>BIRTHPLACE</Text>
                <Text style={styles.profileGridValue}>{profileAnswers.birthplace || 'Not set'}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.editProfileBtn} onPress={startEditing}>
              <Sparkles size={12} color="#7209B7" style={{ marginRight: 6 }} />
              <Text style={styles.editProfileBtnText}>Edit Birth Details</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.profileDetailsCard}>
            <View style={styles.profileAvatarLarge}>
              <Text style={styles.profileInitials}>
                {(editFullName || userName).substring(0, 2).toUpperCase()}
              </Text>
            </View>
            
            <TextInput
              style={styles.profileNameInput}
              value={editFullName}
              onChangeText={setEditFullName}
              placeholder="Full Name"
              placeholderTextColor="#9E9BB3"
            />
            <Text style={styles.profileSubText}>Zodiac Sign: {zodiac.name}</Text>
            
            <View style={styles.profileGrid}>
              <View style={styles.profileGridItem}>
                <Text style={styles.profileGridLabel}>BIRTHDATE</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setIsDatePickerVisible(true)}
                  style={styles.pickerTriggerBtn}
                >
                  <Text style={styles.pickerTriggerBtnText}>{editBirthdate}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.profileGridItem}>
                <Text style={styles.profileGridLabel}>BIRTH TIME</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setIsTimePickerVisible(true)}
                  style={styles.pickerTriggerBtn}
                >
                  <Text style={styles.pickerTriggerBtnText}>{editBirthtime}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.profileGridItem}>
                <Text style={styles.profileGridLabel}>BIRTHPLACE</Text>
                <TextInput
                  style={styles.profileInput}
                  value={editBirthplace}
                  onChangeText={setEditBirthplace}
                  placeholder="City, Country"
                  placeholderTextColor="#9E9BB3"
                />
              </View>
            </View>

            <View style={styles.editActionsRow}>
              <TouchableOpacity style={[styles.editActionBtn, styles.editCancelBtn]} onPress={() => setIsEditingProfile(false)}>
                <Text style={styles.editCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.editActionBtn, styles.editSaveBtn]} onPress={saveProfileDetails}>
                <Text style={styles.editSaveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Credits Card */}
        <View style={styles.profileCreditsCard}>
          <View style={styles.profileCreditsLeft}>
            <GoldCoin size={24} style={{ marginRight: 10 }} />
            <View>
              <Text style={styles.profileCreditsTitle}>Cosmic Credits</Text>
              <Text style={styles.profileCreditsBalance}>Balance: {credits} CR</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.profileCreditsBuyBtn} 
            activeOpacity={0.8}
            onPress={() => setCurrentProfileSubView('credits')}
          >
            <Text style={styles.profileCreditsBuyBtnText}>Membership Plans</Text>
          </TouchableOpacity>
        </View>

        {/* Daily Notifications Bar */}
        <View style={styles.profileBar}>
          <View style={styles.profileBarLeft}>
            <View style={[styles.barIconBg, { backgroundColor: 'rgba(114, 9, 183, 0.08)' }]}>
              <Bell size={18} color="#7209B7" />
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.barTitle}>Daily Horoscope Alerts</Text>
              <Text style={styles.barSubtitle}>Receive updates on your vibe chart</Text>
            </View>
          </View>
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={() => setNotificationsEnabled(!notificationsEnabled)}
            style={[
              styles.switchTrack,
              notificationsEnabled ? styles.switchTrackOn : styles.switchTrackOff
            ]}
          >
            <View style={[
              styles.switchThumb,
              notificationsEnabled ? styles.switchThumbOn : styles.switchThumbOff
            ]} />
          </TouchableOpacity>
        </View>

        {/* Theme Toggle */}
        <TouchableOpacity 
          style={styles.profileBar} 
          activeOpacity={0.7}
          onPress={() => { haptic.tap(); setMode(isDark ? 'light' : 'dark'); }}
        >
          <View style={styles.profileBarLeft}>
            <View style={[styles.barIconBg, { backgroundColor: isDark ? 'rgba(251, 191, 36, 0.12)' : 'rgba(114, 9, 183, 0.08)' }]}>
              {isDark ? <Sun size={18} color="#FBBF24" /> : <Moon size={18} color="#7209B7" />}
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.barTitle}>{isDark ? 'Light Mode' : 'Dark Mode'}</Text>
              <Text style={styles.barSubtitle}>Toggle cosmic ambiance</Text>
            </View>
          </View>
          <Info size={16} color="#B3A2E7" />
        </TouchableOpacity>

        {/* Feedback & Reviews (Replaced Invite Friends) */}
        <TouchableOpacity style={styles.profileBar} activeOpacity={0.7} onPress={() => setIsFeedbackModalOpen(true)}>
          <View style={styles.profileBarLeft}>
            <View style={[styles.barIconBg, { backgroundColor: 'rgba(247, 37, 133, 0.08)' }]}>
              <Smile size={18} color="#F72585" />
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.barTitle}>Feedback & Reviews</Text>
              <Text style={styles.barSubtitle}>Share your reviews and suggestions</Text>
            </View>
          </View>
          <Info size={16} color="#B3A2E7" />
        </TouchableOpacity>

        {/* Help & Support (Configured with custom email & mailto) */}
        <TouchableOpacity 
          style={styles.profileBar} 
          activeOpacity={0.7} 
          onPress={() => setCurrentProfileSubView('help')}
        >
          <View style={styles.profileBarLeft}>
            <View style={[styles.barIconBg, { backgroundColor: 'rgba(59, 130, 246, 0.08)' }]}>
              <HelpCircle size={18} color="#3B82F6" />
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.barTitle}>Help & Support</Text>
              <Text style={styles.barSubtitle}>arcadian@arcddia.co.in</Text>
            </View>
          </View>
          <Info size={16} color="#B3A2E7" />
        </TouchableOpacity>

        {/* Privacy & Security (Configured with Cameras and Photos permissions explanation) */}
        <TouchableOpacity 
          style={styles.profileBar} 
          activeOpacity={0.7} 
          onPress={() => {
            setPreviousProfileSubView('profile');
            setCurrentProfileSubView('privacy');
            checkPermissions();
          }}
        >
          <View style={styles.profileBarLeft}>
            <View style={[styles.barIconBg, { backgroundColor: 'rgba(16, 185, 129, 0.08)' }]}>
              <Lock size={18} color="#10B981" />
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.barTitle}>Privacy & Security</Text>
              <Text style={styles.barSubtitle}>Camera, Photos, and Data Permissions</Text>
            </View>
          </View>
          <Info size={16} color="#B3A2E7" />
        </TouchableOpacity>

        {/* Logout Option */}
        <TouchableOpacity style={styles.logoutProfileBtn} onPress={onLogout}>
          <LogOut size={16} color="#E63946" style={{ marginRight: 8 }} />
          <Text style={styles.logoutProfileText}>Sign Out from AstroAi4u</Text>
        </TouchableOpacity>

        {/* Delete Account Option */}
        <TouchableOpacity 
          style={[styles.logoutProfileBtn, { marginTop: 12, backgroundColor: 'rgba(230, 57, 70, 0.08)', borderColor: 'rgba(230, 57, 70, 0.2)' }]} 
          onPress={handleDeleteAccount}
        >
          <MaterialCommunityIcons name="delete-forever" size={18} color="#E63946" style={{ marginRight: 8 }} />
          <Text style={[styles.logoutProfileText, { color: '#E63946' }]}>Permanently Delete Account</Text>
        </TouchableOpacity>
        <View style={{ height: 100 + insets.bottom }} />
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {currentView === 'palm-reading' ?
        <PalmReadingScreen
          answers={profileAnswers}
          zodiacIndex={zodiacIndex}
          onBack={() => setCurrentView('dashboard')}
          onSendToChat={(userMsg, aiMsg) => {
            setChatMessages(prev => [...prev, userMsg, aiMsg]);
            setCurrentView('dashboard');
            changeTab('chat');
          }}
          onUpdateCredits={(newBalance) => setCredits(newBalance)}
        />
      : currentView === 'face-reading' ?
        <FaceReadingScreen
          answers={profileAnswers}
          zodiacIndex={zodiacIndex}
          onBack={() => setCurrentView('dashboard')}
          onSendToChat={(userMsg, aiMsg) => {
            setChatMessages(prev => [...prev, userMsg, aiMsg]);
            setCurrentView('dashboard');
            changeTab('chat');
          }}
          onUpdateCredits={(newBalance) => setCredits(newBalance)}
        />
      : currentView === 'coffee-reading' ?
        <CoffeeReadingScreen
          answers={profileAnswers}
          zodiacIndex={zodiacIndex}
          onBack={() => setCurrentView('dashboard')}
          onSendToChat={(userMsg, aiMsg) => {
            setChatMessages(prev => [...prev, userMsg, aiMsg]);
            setCurrentView('dashboard');
            changeTab('chat');
          }}
          onUpdateCredits={(newBalance) => setCredits(newBalance)}
        />
      : currentView === 'style-forecaster' ?
        <StyleForecasterScreen
          answers={profileAnswers}
          zodiacIndex={zodiacIndex}
          onBack={() => setCurrentView('dashboard')}
          onSendToChat={(userMsg, aiMsg) => {
            setChatMessages(prev => [...prev, userMsg, aiMsg]);
            setCurrentView('dashboard');
            changeTab('chat');
          }}
          onUpdateCredits={(newBalance) => setCredits(newBalance)}
        />
      : currentView === 'tarot-reading' ?
        <TarotReadingScreen
          answers={profileAnswers}
          zodiacIndex={zodiacIndex}
          onBack={() => setCurrentView('dashboard')}
          onSendToChat={(userMsg, aiMsg) => {
            setChatMessages(prev => [...prev, userMsg, aiMsg]);
            setCurrentView('dashboard');
            changeTab('chat');
          }}
          onUpdateCredits={(newBalance) => setCredits(newBalance)}
        />
      : currentView === 'astro-calendar' ?
        <AstroCalendarScreen
          answers={profileAnswers}
          onBack={() => setCurrentView('dashboard')}
        />
      :
        <LinearGradient
          colors={theme.gradient as any}
          locations={[0, 0.5, 1]}
          style={styles.gradientBg}
        >
        <StatusBar style={isDark ? 'light' : 'dark'} />

        {/* Dynamic Watermark Background */}
        <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
          <Image
            source={ZODIAC_ICONS[zodiacIndex + 1]}
            style={styles.bgWatermark}
            resizeMode="contain"
          />
        </View>

        {/* Top Header */}
        <View style={[styles.header, { paddingTop: insets.top > 0 ? insets.top + 6 : 14 }]}>
          <View style={styles.headerLeftSlot}>
            {activeTab !== 'today' ? (
              <TouchableOpacity onPress={() => changeTab('today')} style={styles.logoutBtn} activeOpacity={0.7}>
                <ArrowLeft size={20} color="#726F8D" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                activeOpacity={0.7} 
                onPress={() => {
                  setCurrentProfileSubView('credits');
                  changeTab('profile');
                }} 
                style={styles.creditsPill}
              >
                <GoldCoin size={18} style={{ marginRight: 6 }} />
                <Text style={styles.creditsText}>{credits}</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>
              {activeTab === 'today' ? 'TODAY' :
               activeTab === 'readings' ? 'EXPLORE' :
               activeTab === 'numerology' ? 'NUMEROLOGY PROFILE' :
               activeTab === 'chat' ? 'ASTROAI4U CHAT' :
               activeTab === 'charts' ? 'ASTRO MAP' :
               activeTab === 'profile' ? 'PROFILE' : 'CELESTIAL HUB'}
            </Text>
            <Text style={styles.headerSubtitle}>Based on Vedic Astrology</Text>
          </View>
          <View style={styles.headerRightSlot}>
            <TouchableOpacity 
              onPress={() => changeTab('profile')} 
              style={[styles.headerProfileBtn, activeTab === 'profile' && styles.headerProfileBtnActive]}
              activeOpacity={0.7}
            >
              <Text style={[styles.headerProfileBtnText, activeTab === 'profile' && styles.headerProfileBtnTextActive]}>
                {userName.charAt(0).toUpperCase()}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.mainContent}>
          {/* Welcome card removed on Today — the redesigned hero in renderTodayView
              already shows greeting + name + streak (was duplicated here). */}

          {/* Horizontal Paging ScrollView for Instagram-like swipe navigation */}
          <ScrollView
            ref={pagerRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            bounces={false}
            onMomentumScrollEnd={handleScrollEnd}
            style={styles.pagerScrollView}
          >
            <View style={{ width, flex: 1 }}>
              {renderTodayView()}
            </View>
            <View style={{ width, flex: 1 }}>
              {renderExploreView()}
            </View>
            <View style={{ width, flex: 1 }}>
              {renderChatView()}
            </View>
            <View style={{ width, flex: 1 }}>
              {renderNumerologyView()}
            </View>
            <View style={{ width, flex: 1 }}>
              {renderChartsView()}
            </View>
            <View style={{ width, flex: 1 }}>
              {renderProfileView()}
            </View>
          </ScrollView>
        </View>

        {/* Custom Bottom Tab Bar with Elevated Center Circle */}
        {activeTab !== 'chat' && (
          <View style={[styles.bottomNavContainer, { bottom: insets.bottom > 0 ? insets.bottom + 4 : 16 }]}>
            <View style={styles.bottomNavBlurWrapper}>
              <BlurView intensity={95} tint="light" style={StyleSheet.absoluteFillObject} />
              <LinearGradient
                colors={['rgba(114, 9, 183, 0.08)', 'rgba(247, 37, 133, 0.05)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFillObject}
              />
            </View>
            {/* Left Navigation Actions (Today, Explore) */}
            <View style={styles.navGroupLeft}>
              <TouchableOpacity
                style={[styles.navTab, activeTab === 'today' && styles.navTabActive]}
                onPress={() => changeTab('today')}
                activeOpacity={0.8}
              >
                <Animated.View style={[styles.activeTabBlob, { opacity: tabTodayScale, transform: [{ scale: tabTodayScale }] }]}>
                  <LinearGradient
                    colors={getTabBlobColors('today')}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFillObject}
                  />
                </Animated.View>
                <Calendar size={18} color={activeTab === 'today' ? '#FFFFFF' : '#000000'} />
                <Text style={[styles.navText, activeTab === 'today' && styles.navTextActive]}>Today</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.navTab, activeTab === 'readings' && styles.navTabActive]}
                onPress={() => changeTab('readings')}
                activeOpacity={0.8}
              >
                <Animated.View style={[styles.activeTabBlob, { opacity: tabReadingsScale, transform: [{ scale: tabReadingsScale }] }]}>
                  <LinearGradient
                    colors={getTabBlobColors('readings')}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFillObject}
                  />
                </Animated.View>
                <Compass size={18} color={activeTab === 'readings' ? '#FFFFFF' : '#000000'} />
                <Text style={[styles.navText, activeTab === 'readings' && styles.navTextActive]}>Explore</Text>
              </TouchableOpacity>
            </View>

            {/* Elevated Center Chat Button */}
            <View style={styles.centerBtnContainer}>
              <TouchableOpacity
                style={styles.centerBtn}
                onPress={() => changeTab('chat')}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#7209B7', '#F72585']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.centerBtnGradient}
                >
                  <MessageSquare size={20} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Right Navigation Actions (Numbers, Astro Map) */}
            <View style={styles.navGroupRight}>
              <TouchableOpacity
                style={[styles.navTab, activeTab === 'numerology' && styles.navTabActive]}
                onPress={() => changeTab('numerology')}
                activeOpacity={0.8}
              >
                <Animated.View style={[styles.activeTabBlob, { opacity: tabNumerologyScale, transform: [{ scale: tabNumerologyScale }] }]}>
                  <LinearGradient
                    colors={getTabBlobColors('numerology')}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFillObject}
                  />
                </Animated.View>
                <View style={[
                  styles.navDigitIcon, 
                  activeTab === 'numerology' && styles.navDigitIconActive
                ]}>
                  <Text style={[
                    styles.navDigitText,
                    activeTab === 'numerology' && styles.navDigitTextActive
                  ]}>
                    {lifePathNumber}
                  </Text>
                </View>
                <Text style={[styles.navText, activeTab === 'numerology' && styles.navTextActive]}>Numbers</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.navTab, activeTab === 'charts' && styles.navTabActive]}
                onPress={() => changeTab('charts')}
                activeOpacity={0.8}
              >
                <Animated.View style={[styles.activeTabBlob, { opacity: tabChartsScale, transform: [{ scale: tabChartsScale }] }]}>
                  <LinearGradient
                    colors={getTabBlobColors('charts')}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFillObject}
                  />
                </Animated.View>
                <Grid size={18} color={activeTab === 'charts' ? '#FFFFFF' : '#000000'} />
                <Text style={[styles.navText, activeTab === 'charts' && styles.navTextActive]}>Astro Map</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* StyleForecaster Drawer / Modal Sheet */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={styleForecasterOpen}
          onRequestClose={() => setStyleForecasterOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <LinearGradient
                colors={['#7209B7', '#F72585']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.modalHeaderBg}
              >
                <View style={styles.modalHeaderRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Shirt size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.modalTitle}>STYLE FORECASTER</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.closeModalBtn}
                    onPress={() => setStyleForecasterOpen(false)}
                  >
                    <X size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.modalSubtitle}>Vedic Color Alignments</Text>
              </LinearGradient>

              <View style={styles.modalBody}>
                <View style={styles.suggestionRow}>
                  <Text style={styles.suggestionNumber}>01</Text>
                  <View style={styles.suggestionInfo}>
                    <Text style={styles.suggestionLabel}>COS-COLOR</Text>
                    <Text style={styles.suggestionVal}>Emerald Green & Solar Gold</Text>
                    <Text style={styles.suggestionDesc}>Amplifies Mercury's focused intelligence and Leo's creative radiance.</Text>
                  </View>
                </View>

                <View style={styles.suggestionRow}>
                  <Text style={styles.suggestionNumber}>02</Text>
                  <View style={styles.suggestionInfo}>
                    <Text style={styles.suggestionLabel}>FABRIC WEAVE</Text>
                    <Text style={styles.suggestionVal}>Natural Silk or Organic Linen</Text>
                    <Text style={styles.suggestionDesc}>Protects your aura, maintaining smooth spiritual alignment today.</Text>
                  </View>
                </View>

                <View style={styles.suggestionRow}>
                  <Text style={styles.suggestionNumber}>03</Text>
                  <View style={styles.suggestionInfo}>
                    <Text style={styles.suggestionLabel}>NUMEROLOGY RES</Text>
                    <Text style={styles.suggestionVal}>Number 8 (Infinite Flow)</Text>
                    <Text style={styles.suggestionDesc}>Invites financial security, structural order, and balanced cosmic returns.</Text>
                  </View>
                </View>

                <TouchableOpacity 
                  style={styles.dismissBtn}
                  onPress={() => setStyleForecasterOpen(false)}
                >
                  <Text style={styles.dismissBtnText}>ALIGN MY LOOK</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* StyleForecaster Intro Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={styleForecasterIntroOpen}
          onRequestClose={() => setStyleForecasterIntroOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { maxHeight: '85%' }]}>
              <LinearGradient
                colors={['#7209B7', '#F72585']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.modalHeaderBg}
              >
                <View style={styles.modalHeaderRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Shirt size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.modalTitle}>HOW IT WORKS</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.closeModalBtn}
                    onPress={() => setStyleForecasterIntroOpen(false)}
                  >
                    <X size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.modalSubtitle}>Daily Cosmic Styling Guide</Text>
              </LinearGradient>

              <ScrollView contentContainerStyle={{ padding: 20, alignItems: 'center' }} showsVerticalScrollIndicator={false}>
                {/* Preview Image */}
                <View style={styles.mobilePreviewImageContainer}>
                  <Image 
                    source={require('./assets/style_forecaster_preview.png')}
                    style={styles.mobilePreviewImage}
                    resizeMode="cover"
                  />
                </View>

                {/* Explanation */}
                <Text style={styles.mobileIntroHeading}>Personalized Styling Logic</Text>
                
                <View style={styles.mobileIntroBullet}>
                  <Palette size={20} color="#F72585" style={{ marginRight: 12, marginTop: 2 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.mobileBulletTitle}>Vedic Color Alignment</Text>
                    <Text style={styles.mobileBulletDesc}>Analyzes your daily planetary transits and zodiac energies to show the exact 4 colors you should wear.</Text>
                  </View>
                </View>

                <View style={styles.mobileIntroBullet}>
                  <Sparkles size={20} color="#7209B7" style={{ marginRight: 12, marginTop: 2 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.mobileBulletTitle}>Vedic Resonance</Text>
                    <Text style={styles.mobileBulletDesc}>Integrates cosmic fabric recommendations and numerology rules to align your personal aura.</Text>
                  </View>
                </View>

                {/* Checkbox */}
                <TouchableOpacity 
                  style={styles.mobileCheckboxContainer}
                  activeOpacity={0.8}
                  onPress={() => setDontShowIntroChecked(!dontShowIntroChecked)}
                >
                  <View style={{
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    borderWidth: 2,
                    borderColor: dontShowIntroChecked ? "#F72585" : "rgba(44, 43, 61, 0.4)",
                    backgroundColor: dontShowIntroChecked ? "#F72585" : "transparent",
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 8,
                  }}>
                    {dontShowIntroChecked && (
                      <View style={{
                        width: 8,
                        height: 8,
                        backgroundColor: '#FFFFFF',
                        borderRadius: 1.5,
                      }} />
                    )}
                  </View>
                  <Text style={styles.mobileCheckboxText}>Do not display this popup again</Text>
                </TouchableOpacity>

                {/* CTA Button */}
                <TouchableOpacity 
                  style={[styles.dismissBtn, { width: '100%', marginTop: 20 }]}
                  onPress={() => {
                    if (dontShowIntroChecked) {
                      styleStorage.setItem('dontShowStyleIntro', 'true');
                    }
                    setStyleForecasterIntroOpen(false);
                    setCurrentView('style-forecaster');
                  }}
                >
                  <Text style={styles.dismissBtnText}>PROCEED TO FORECAST</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>



      </LinearGradient>
      }
      {/* Custom Floating Toast Alert */}
      {isExitToastVisible && (
        <Animated.View style={[
          styles.customToastContainer,
          { opacity: exitToastAnim }
        ]}>
          <Text style={styles.customToastText}>Press back again to exit</Text>
        </Animated.View>
      )}

      {/* Feedback Modal */}
      <Modal
        visible={isFeedbackModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsFeedbackModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Share Your Feedback</Text>
                <TouchableOpacity onPress={() => setIsFeedbackModalOpen(false)} style={styles.closeBtn}>
                  <X size={20} color="#726F8D" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalDesc}>
                Help us improve your celestial experience! Share your ratings and suggestions.
              </Text>

              {/* Stars */}
              <Text style={styles.fieldLabel}>Overall Experience *</Text>
              {renderStarRating()}

              {/* Fav Feature Select */}
              <Text style={styles.fieldLabel}>Favorite Feature</Text>
              <View style={styles.featureSelectRow}>
                {['Horoscope', 'Numerology', 'AI Chat', 'Astro Map', 'Readings'].map((feature) => (
                  <TouchableOpacity
                    key={feature}
                    onPress={() => setFeedbackFavFeature(feature)}
                    style={[
                      styles.featureSelectBtn,
                      feedbackFavFeature === feature && styles.featureSelectBtnActive
                    ]}
                  >
                    <Text
                      style={[
                        styles.featureSelectText,
                        feedbackFavFeature === feature && styles.featureSelectTextActive
                      ]}
                    >
                      {feature}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* What you loved */}
              <Text style={styles.fieldLabel}>What did you love about AstroAi4u? *</Text>
              <TextInput
                style={styles.modalInputLarge}
                multiline={true}
                numberOfLines={3}
                value={feedbackLoved}
                onChangeText={setFeedbackLoved}
                placeholder="Share your experience or what stands out to you..."
                placeholderTextColor="#9E9BB3"
              />

              {/* What to improve */}
              <Text style={styles.fieldLabel}>What can we improve?</Text>
              <TextInput
                style={styles.modalInputLarge}
                multiline={true}
                numberOfLines={3}
                value={feedbackImprove}
                onChangeText={setFeedbackImprove}
                placeholder="Let us know what can be better..."
                placeholderTextColor="#9E9BB3"
              />

              {/* Actions */}
              <TouchableOpacity style={styles.submitBtn} onPress={submitFeedback} activeOpacity={0.9}>
                <LinearGradient
                  colors={['#7209B7', '#F72585']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.submitBtnGradient}
                >
                  <Text style={styles.submitBtnText}>SUBMIT FEEDBACK</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Date Picker Modal */}
      <Modal
        visible={isDatePickerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsDatePickerVisible(false)}
      >
        <View style={styles.pickerModalOverlay}>
          <View style={styles.pickerModalContainer}>
            <Text style={styles.pickerModalTitle}>Select Birth Date</Text>
            
            <View style={styles.pickerColumnsRow}>
              {/* Day Column */}
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerColumnHeader}>Day</Text>
                <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                  {DAYS.map((d) => (
                    <TouchableOpacity
                      key={d}
                      onPress={() => setSelectedDay(d)}
                      style={[styles.pickerItemBtn, selectedDay === d && styles.pickerItemBtnActive]}
                    >
                      <Text style={[styles.pickerItemText, selectedDay === d && styles.pickerItemTextActive]}>
                        {d}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Month Column */}
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerColumnHeader}>Month</Text>
                <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                  {MONTHS.map((m) => (
                    <TouchableOpacity
                      key={m.value}
                      onPress={() => setSelectedMonth(m.value)}
                      style={[styles.pickerItemBtn, selectedMonth === m.value && styles.pickerItemBtnActive]}
                    >
                      <Text style={[styles.pickerItemText, selectedMonth === m.value && styles.pickerItemTextActive]}>
                        {m.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Year Column */}
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerColumnHeader}>Year</Text>
                <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                  {YEARS.map((y) => (
                    <TouchableOpacity
                      key={y}
                      onPress={() => setSelectedYear(y)}
                      style={[styles.pickerItemBtn, selectedYear === y && styles.pickerItemBtnActive]}
                    >
                      <Text style={[styles.pickerItemText, selectedYear === y && styles.pickerItemTextActive]}>
                        {y}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.pickerActions}>
              <TouchableOpacity style={[styles.pickerActionBtn, styles.pickerCancelBtn]} onPress={() => setIsDatePickerVisible(false)}>
                <Text style={styles.pickerCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.pickerActionBtn, styles.pickerSaveBtn]} onPress={confirmDatePicker}>
                <Text style={styles.pickerSaveText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Time Picker Modal */}
      <Modal
        visible={isTimePickerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsTimePickerVisible(false)}
      >
        <View style={styles.pickerModalOverlay}>
          <View style={styles.pickerModalContainer}>
            <Text style={styles.pickerModalTitle}>Select Birth Time</Text>
            
            <View style={styles.pickerColumnsRow}>
              {/* Hour Column */}
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerColumnHeader}>Hour</Text>
                <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                  {HOURS.map((h) => (
                    <TouchableOpacity
                      key={h}
                      onPress={() => setSelectedHour(h)}
                      style={[styles.pickerItemBtn, selectedHour === h && styles.pickerItemBtnActive]}
                    >
                      <Text style={[styles.pickerItemText, selectedHour === h && styles.pickerItemTextActive]}>
                        {h}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Minute Column */}
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerColumnHeader}>Min</Text>
                <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                  {MINUTES.map((m) => (
                    <TouchableOpacity
                      key={m}
                      onPress={() => setSelectedMinute(m)}
                      style={[styles.pickerItemBtn, selectedMinute === m && styles.pickerItemBtnActive]}
                    >
                      <Text style={[styles.pickerItemText, selectedMinute === m && styles.pickerItemTextActive]}>
                        {String(m).padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Period Column */}
              <View style={[styles.pickerColumn, { flex: 0.8 }]}>
                <Text style={styles.pickerColumnHeader}>AM/PM</Text>
                <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                  {['AM', 'PM'].map((p) => (
                    <TouchableOpacity
                      key={p}
                      onPress={() => setSelectedPeriod(p as any)}
                      style={[styles.pickerItemBtn, selectedPeriod === p && styles.pickerItemBtnActive]}
                    >
                      <Text style={[styles.pickerItemText, selectedPeriod === p && styles.pickerItemTextActive]}>
                        {p}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.pickerActions}>
              <TouchableOpacity style={[styles.pickerActionBtn, styles.pickerCancelBtn]} onPress={() => setIsTimePickerVisible(false)}>
                <Text style={styles.pickerCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.pickerActionBtn, styles.pickerSaveBtn]} onPress={confirmTimePicker}>
                <Text style={styles.pickerSaveText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Share Card Modal */}
      <ShareCardModal
        visible={shareModalVisible}
        data={shareModalData}
        onClose={() => setShareModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3EFFF',
  },
  gradientBg: {
    flex: 1,
  },
  bgWatermark: {
    position: 'absolute',
    bottom: -height * 0.1,
    right: -width * 0.1,
    width: width * 1.1,
    height: width * 1.1,
    opacity: 0.05,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(114, 111, 141, 0.08)',
  },
  logoutBtn: {
    padding: 6,
  },
  creditsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(217, 115, 13, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(217, 115, 13, 0.25)',
  },
  creditsText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 13,
    color: '#D9730D',
    letterSpacing: 0.5,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLeftSlot: {
    width: 70,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerRightSlot: {
    width: 70,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 16,
    color: '#2C2B3D',
    letterSpacing: 1.5,
  },
  headerSubtitle: {
    fontFamily: 'SourceSerif4',
    fontSize: 10,
    color: '#726F8D',
    marginTop: 2,
  },
  headerProfileBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(179, 162, 231, 0.12)',
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(179, 162, 231, 0.2)',
  },
  headerProfileBtnActive: {
    backgroundColor: 'rgba(114, 9, 183, 0.12)',
    borderColor: '#7209B7',
  },
  headerProfileBtnText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 14,
    color: '#726F8D',
  },
  headerProfileBtnTextActive: {
    color: '#7209B7',
  },
  mainContent: {
    flex: 1,
  },
  welcomeHeaderContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    marginBottom: 4,
  },
  welcomeSub: {
    fontFamily: 'SourceSerif4',
    fontSize: 13,
    color: '#726F8D',
  },
  welcomeName: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 22,
    color: '#2C2B3D',
    marginTop: 2,
  },
  tabScroll: {
    paddingHorizontal: 20,
    paddingTop: 14,
    flex: 1,
  },
  astroGridCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(114, 9, 183, 0.08)',
    shadowColor: '#7209B7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 16,
  },
  astroGridRow: {
    flexDirection: 'row',
  },
  astroGridCol: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  astroGridLabel: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 9,
    color: '#F72585',
    letterSpacing: 0.5,
  },
  astroGridValue: {
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 13,
    color: '#2C2B3D',
    marginTop: 4,
    textAlign: 'center',
  },
  tabContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  tabViewTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 18,
    color: '#2C2B3D',
    marginBottom: 16,
  },
  quoteCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(179, 162, 231, 0.15)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    position: 'relative',
    marginBottom: 14,
    alignItems: 'center',
  },
  quoteMark: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 22,
    color: '#B3A2E7',
    position: 'absolute',
    left: 8,
    top: 2,
  },
  quoteMarkEnd: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 22,
    color: '#B3A2E7',
    position: 'absolute',
    right: 8,
    bottom: -6,
  },
  quoteText: {
    fontFamily: 'SourceSerif4-Bold',
    fontStyle: 'italic',
    fontSize: 12,
    color: '#4C4A63',
    textAlign: 'center',
    lineHeight: 18,
  },
  gaugesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  gaugeCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E7ED',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#726F8D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  gaugeLabel: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 8,
    color: '#9E9BB3',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  gaugeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(179, 162, 231, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  gaugeValue: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 10,
    marginLeft: 4,
  },
  chatArea: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(114, 111, 141, 0.08)',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  chatListContent: {
    padding: 12,
    paddingBottom: 24,
  },
  msgRow: {
    flexDirection: 'row',
    marginBottom: 14,
    width: '100%',
  },
  msgRowAi: {
    justifyContent: 'flex-start',
  },
  msgRowUser: {
    justifyContent: 'flex-end',
  },
  avatarContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E8E7ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 4,
    shadowColor: '#7209B7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
  },
  avatarImage: {
    width: 14,
    height: 14,
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: width * 0.7,
  },
  bubbleAi: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: '#B3A2E7',
    borderTopRightRadius: 16,
    borderBottomRightRadius: 4,
  },
  msgText: {
    fontSize: 13,
    lineHeight: 18,
  },
  msgTextAi: {
    fontFamily: 'SourceSerif4',
    color: '#2C2B3D',
  },
  msgTextUser: {
    fontFamily: 'SourceSerif4-Bold',
    color: '#FFFFFF',
  },
  typingText: {
    fontFamily: 'SourceSerif4',
    fontStyle: 'italic',
    fontSize: 11,
    color: '#726F8D',
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatTextInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 13,
    color: '#2C2B3D',
    fontFamily: 'SourceSerif4',
    maxHeight: 80,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  chatSendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#7209B7',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  chatSendBtnDisabled: {
    backgroundColor: '#E8E7ED',
  },
  sensorCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(114, 111, 141, 0.08)',
  },
  sensorCardGradient: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
  },
  sensorIcon: {
    marginRight: 14,
    marginTop: 2,
  },
  sensorInfo: {
    flex: 1,
  },
  sensorTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 14,
    color: '#2C2B3D',
  },
  sensorDesc: {
    fontFamily: 'SourceSerif4',
    fontSize: 11,
    color: '#726F8D',
    lineHeight: 16,
    marginTop: 4,
    marginBottom: 10,
  },
  sensorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7209B7',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  sensorBtnText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 9,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  historyList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E8E7ED',
    marginBottom: 20,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(114, 111, 141, 0.06)',
  },
  historyTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 12,
    color: '#2C2B3D',
  },
  historyDate: {
    fontFamily: 'SourceSerif4',
    fontSize: 9,
    color: '#9E9BB3',
    marginTop: 2,
  },
  historyResult: {
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 10,
    color: '#726F8D',
  },
  astralCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#7209B7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  astralCardGradient: {
    padding: 18,
  },
  zodiacTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 18,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  zodiacSubtitle: {
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginVertical: 12,
  },
  numerologyDetailText: {
    fontFamily: 'SourceSerif4',
    fontSize: 12,
    color: '#FFF',
    lineHeight: 18,
  },
  numerologySectionHeading: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 10,
    color: '#FFD700',
    letterSpacing: 1,
    marginTop: 8,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  numerologyBulletText: {
    fontFamily: 'Outfit-Regular',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 16,
    marginLeft: 8,
    marginBottom: 2,
  },
  widgetsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  widgetBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E7ED',
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  widgetLabel: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 8,
    color: '#9E9BB3',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  widgetValueText: {
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 12,
    color: '#2C2B3D',
    textAlign: 'center',
  },
  widgetDesc: {
    fontFamily: 'SourceSerif4',
    fontSize: 10,
    color: '#726F8D',
    lineHeight: 14,
    marginTop: 2,
  },
  sectionTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 14,
    color: '#2C2B3D',
    marginBottom: 10,
  },
  insightCard: {
    backgroundColor: 'rgba(179, 162, 231, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(179, 162, 231, 0.15)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 24,
  },
  insightTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 12,
  },
  insightText: {
    fontFamily: 'SourceSerif4',
    fontSize: 12,
    color: '#726F8D',
    lineHeight: 18,
  },
  kundliContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  kundliGrid: {
    width: 220,
    height: 220,
    borderWidth: 2,
    borderColor: '#7209B7',
    position: 'relative',
    backgroundColor: '#FFFFFF',
  },
  kundliBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: '#7209B7',
    margin: 4,
  },
  diagonalLine1: {
    position: 'absolute',
    width: '141.4%',
    height: 1,
    backgroundColor: '#7209B7',
    top: '50%',
    left: '-20.7%',
    transform: [{ rotate: '45deg' }],
  },
  diagonalLine2: {
    position: 'absolute',
    width: '141.4%',
    height: 1,
    backgroundColor: '#7209B7',
    top: '50%',
    left: '-20.7%',
    transform: [{ rotate: '-45deg' }],
  },
  innerDiamond: {
    position: 'absolute',
    width: '70.7%',
    height: '70.7%',
    borderWidth: 1,
    borderColor: '#7209B7',
    top: '14.65%',
    left: '14.65%',
    transform: [{ rotate: '45deg' }],
  },
  houseLabel: {
    position: 'absolute',
    fontFamily: 'Cinzel-Bold',
    fontSize: 9,
    color: '#2C2B3D',
  },
  house1: { top: '38%', left: '42%' },
  house2: { top: '15%', left: '46%' },
  house3: { top: '8%', left: '20%' },
  house4: { top: '38%', left: '12%' },
  house5: { top: '68%', left: '20%' },
  house6: { top: '78%', left: '46%' },
  house7: { top: '56%', left: '42%' },
  house8: { top: '78%', left: '72%' },
  house9: { top: '68%', left: '80%' },
  house10: { top: '38%', left: '74%' },
  house11: { top: '8%', left: '80%' },
  house12: { top: '15%', left: '72%' },
  chartDetailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E7ED',
    marginBottom: 24,
  },
  blueprintRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(114, 111, 141, 0.06)',
  },
  blueprintLabel: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 12,
    color: '#2C2B3D',
  },
  blueprintValue: {
    fontFamily: 'SourceSerif4',
    fontSize: 12,
    color: '#726F8D',
  },
  // ── Astro Map Page Styles ──
  amChartLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  amChartLabel: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 12,
    color: '#2C2B3D',
    letterSpacing: 0.5,
  },
  amAscLabel: {
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 11,
    color: '#7209B7',
  },
  amChartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginBottom: 8,
  },
  amAspectLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
  },
  amAspectLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 4,
  },
  amAspectLegendLine: {
    width: 20,
    height: 3,
    marginRight: 6,
    borderRadius: 1.5,
  },
  amAspectLegendDash: {
    borderStyle: 'dashed',
    borderWidth: 1,
    height: 0,
    backgroundColor: 'transparent',
  },
  amAspectLegendText: {
    fontFamily: 'SourceSerif4',
    fontSize: 10,
    color: '#726F8D',
  },
  amPillScroll: {
    marginBottom: 16,
  },
  amPlanetPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(114, 111, 141, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(114, 111, 141, 0.1)',
    marginRight: 8,
  },
  amPillGlyph: {
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 16,
    marginRight: 5,
  },
  amPillLabel: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 11,
    color: '#2C2B3D',
    letterSpacing: 0.3,
  },
  amDetailCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(114, 111, 141, 0.08)',
    padding: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#7209B7',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: { elevation: 3 },
    }),
  },
  amDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  amDetailGlyph: {
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 28,
  },
  amDetailName: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 16,
    color: '#2C2B3D',
  },
  amDetailSan: {
    fontFamily: 'SourceSerif4',
    fontSize: 12,
    color: '#726F8D',
  },
  amDetailTheme: {
    fontFamily: 'SourceSerif4',
    fontSize: 11,
    color: '#726F8D',
    marginTop: 2,
    fontStyle: 'italic',
  },
  amRetroBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: 'rgba(229, 72, 77, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(229, 72, 77, 0.2)',
  },
  amRetroText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 9,
    color: '#E5484D',
    letterSpacing: 0.3,
  },
  amDetailGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(114, 111, 141, 0.08)',
    paddingTop: 12,
  },
  amDetailGridItem: {
    flex: 1,
    alignItems: 'center',
  },
  amDetailGridLabel: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 8,
    color: '#726F8D',
    letterSpacing: 1,
    marginBottom: 4,
  },
  amDetailGridValue: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 13,
    color: '#2C2B3D',
    textAlign: 'center',
  },
  amDetailGridSub: {
    fontFamily: 'SourceSerif4',
    fontSize: 9,
    color: '#726F8D',
    marginTop: 2,
    textAlign: 'center',
  },
  // Cosmic Harmony Score
  // Astrological Interpretations Tabbed Card
  amInterpretationsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8E7ED',
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#7209B7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  amInterpretationsTabsScroll: {
    borderBottomWidth: 1,
    borderColor: '#F0EFF5',
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: '#FAFAFC',
  },
  amInterpretationsTabBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 6,
  },
  amInterpretationsTabBtnActive: {
    backgroundColor: 'rgba(114, 9, 183, 0.08)',
  },
  amInterpretationsTabText: {
    fontFamily: 'Outfit-Bold',
    fontSize: 12,
    color: '#726F8D',
  },
  amInterpretationsTabTextActive: {
    color: '#7209B7',
  },
  amInterpretationsContent: {
    padding: 16,
    minHeight: 120,
  },
  amInterpretationsText: {
    fontFamily: 'SourceSerif4',
    fontSize: 13.5,
    color: '#2C2B3D',
    lineHeight: 20,
  },
  // Yogas Card
  amYogasCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8E7ED',
    padding: 16,
    marginBottom: 20,
  },
  amYogaItem: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#F0EFF5',
    paddingBottom: 10,
  },
  amYogaName: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 12,
    color: '#7209B7',
    marginBottom: 4,
  },
  amYogaDesc: {
    fontFamily: 'SourceSerif4',
    fontSize: 12.5,
    color: '#555469',
    lineHeight: 18,
  },
  // House Grid
  amHouseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 16,
    marginBottom: 20,
  },
  amHouseCell: {
    width: '25%',
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: 'center',
    borderRadius: 12,
  },
  amHouseCellActive: {
    backgroundColor: 'rgba(114, 9, 183, 0.04)',
  },
  amHouseCellNum: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 13,
    color: '#2C2B3D',
  },
  amHouseCellSign: {
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 14,
    color: '#726F8D',
    marginTop: 1,
  },
  amHouseCellTheme: {
    fontFamily: 'SourceSerif4',
    fontSize: 8,
    color: '#726F8D',
    marginTop: 1,
  },
  amHousePlanetRow: {
    flexDirection: 'row',
    marginTop: 3,
  },
  amHousePlanetGlyph: {
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 12,
    marginHorizontal: 1,
  },
  // Planetary Table extras
  amTableGlyph: {
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 20,
    marginRight: 10,
  },
  amTableSan: {
    fontFamily: 'SourceSerif4',
    fontSize: 10,
    color: '#726F8D',
    fontStyle: 'italic',
  },
  amTableNak: {
    fontFamily: 'SourceSerif4',
    fontSize: 10,
    color: '#726F8D',
    marginTop: 1,
  },
  profileDetailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8E7ED',
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  profileAvatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(179, 162, 231, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderColor: '#B3A2E7',
    borderWidth: 1,
  },
  profileInitials: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 22,
    color: '#7209B7',
  },
  profileName: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 18,
    color: '#2C2B3D',
  },
  profileSubText: {
    fontFamily: 'SourceSerif4',
    fontSize: 12,
    color: '#726F8D',
    marginTop: 4,
    marginBottom: 16,
  },
  profileGrid: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(114, 111, 141, 0.06)',
    paddingTop: 16,
    width: '100%',
  },
  profileGridItem: {
    flex: 1,
    alignItems: 'center',
  },
  profileGridLabel: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 8,
    color: '#9E9BB3',
    letterSpacing: 0.5,
  },
  profileGridValue: {
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 11,
    color: '#2C2B3D',
    marginTop: 4,
    textAlign: 'center',
  },
  styleForecasterCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  styleForecasterGradient: {
    padding: 18,
    position: 'relative',
  },
  styleForecasterTextWrap: {
    zIndex: 1,
  },
  styleForecasterTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  styleForecasterDesc: {
    fontFamily: 'SourceSerif4',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 16,
    marginTop: 6,
  },
  styleForecasterOverlayIcon: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    shadowColor: '#2C2B3D',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
  modalScroll: {
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  modalTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 16,
    color: '#2C2B3D',
    letterSpacing: 0.5,
  },
  closeBtn: {
    padding: 4,
  },
  modalDesc: {
    fontFamily: 'SourceSerif4',
    fontSize: 13,
    color: '#726F8D',
    lineHeight: 18,
    marginBottom: 20,
  },
  fieldLabel: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 10.5,
    color: '#7209B7',
    marginTop: 16,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  starContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  starBtn: {
    paddingRight: 8,
  },
  featureSelectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  featureSelectBtn: {
    backgroundColor: 'rgba(114, 111, 141, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(114, 111, 141, 0.08)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  featureSelectBtnActive: {
    backgroundColor: 'rgba(114, 9, 183, 0.08)',
    borderColor: '#7209B7',
  },
  featureSelectText: {
    fontFamily: 'SourceSerif4',
    fontSize: 12,
    color: '#726F8D',
  },
  featureSelectTextActive: {
    fontFamily: 'SourceSerif4-Bold',
    color: '#7209B7',
  },
  modalInputLarge: {
    borderWidth: 1,
    borderColor: 'rgba(114, 9, 183, 0.18)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FAFAFF',
    fontFamily: 'SourceSerif4',
    fontSize: 12.5,
    color: '#2C2B3D',
    minHeight: 65,
    textAlignVertical: 'top',
    marginBottom: 4,
  },
  submitBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 24,
    shadowColor: '#7209B7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  submitBtnGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subViewContainer: {
    flex: 1,
    backgroundColor: '#F8F6FF',
  },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: 'rgba(114, 9, 183, 0.08)',
  },
  subHeaderBackBtn: {
    padding: 4,
    marginRight: 10,
  },
  subHeaderTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 14,
    color: '#2C2B3D',
  },
  subScroll: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  helpHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(114, 9, 183, 0.08)',
    marginBottom: 20,
  },
  helpHeaderTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 13,
    color: '#7209B7',
    marginBottom: 6,
  },
  helpHeaderDesc: {
    fontFamily: 'SourceSerif4',
    fontSize: 11,
    color: '#726F8D',
    lineHeight: 16,
  },
  helpSectionTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 11,
    color: '#726F8D',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(114, 111, 141, 0.06)',
  },
  faqQuestion: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 11.5,
    color: '#2C2B3D',
    marginBottom: 4,
  },
  faqAnswer: {
    fontFamily: 'SourceSerif4',
    fontSize: 10.5,
    color: '#726F8D',
    lineHeight: 15,
  },
  contactSupportBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 20,
    marginBottom: 20,
  },
  contactSupportGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactSupportText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 12,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  contactSupportSub: {
    fontFamily: 'SourceSerif4',
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  permissionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(114, 111, 141, 0.06)',
  },
  permissionInfo: {
    flex: 1,
    marginRight: 12,
  },
  permissionTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 11.5,
    color: '#2C2B3D',
    marginBottom: 2,
  },
  permissionDesc: {
    fontFamily: 'SourceSerif4',
    fontSize: 10,
    color: '#726F8D',
    lineHeight: 14,
  },
  systemSettingsBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#7209B7',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginTop: 10,
  },
  systemSettingsBtnText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 11,
    color: '#7209B7',
  },
  submitBtnText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 12,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  profileCreditsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFDF2',
    borderWidth: 1,
    borderColor: '#F3DCA2',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#D9730D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  profileCreditsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileCreditsTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 12,
    color: '#D9730D',
  },
  profileCreditsBalance: {
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 14,
    color: '#2C2B3D',
    marginTop: 2,
  },
  profileCreditsBuyBtn: {
    backgroundColor: '#D9730D',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  profileCreditsBuyBtnText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 10,
    color: '#FFFFFF',
  },
  balanceHeaderCard: {
    backgroundColor: '#FFFDF2',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3DCA2',
    marginBottom: 20,
  },
  balanceHeaderTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 11,
    color: '#D9730D',
    marginTop: 4,
  },
  balanceHeaderValue: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 24,
    color: '#2C2B3D',
    marginVertical: 6,
  },
  balanceHeaderDesc: {
    fontFamily: 'SourceSerif4',
    fontSize: 11,
    color: '#726F8D',
    textAlign: 'center',
    lineHeight: 16,
  },
  bundleCard: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    width: '100%',
  },
  bundleCardPopular: {
    borderWidth: 1.5,
    borderColor: '#FFD700',
  },
  bundleGradient: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bundleLeft: {
    flex: 1,
  },
  bundleRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  popularBadge: {
    backgroundColor: '#FFD700',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  popularBadgeText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 7.5,
    color: '#2C2B3D',
    letterSpacing: 0.5,
  },
  bundleNameText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  bundleCreditsText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 18,
    color: '#FFFFFF',
    marginVertical: 2,
  },
  bundleDescText: {
    fontFamily: 'SourceSerif4',
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  bundlePriceText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 6,
  },
  bundleBuyBtn: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  bundleBuyBtnText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 9.5,
    color: '#7209B7',
  },
  pickerTriggerBtn: {
    borderWidth: 1,
    borderColor: 'rgba(114, 9, 183, 0.18)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 4,
    backgroundColor: '#FAFAFF',
    marginTop: 4,
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerTriggerBtnText: {
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 11,
    color: '#2C2B3D',
  },
  pickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(44, 43, 61, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  pickerModalContainer: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
  },
  pickerModalTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 14,
    color: '#7209B7',
    marginBottom: 16,
  },
  pickerColumnsRow: {
    flexDirection: 'row',
    height: 160,
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  pickerColumnHeader: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 10,
    color: '#726F8D',
    marginBottom: 6,
  },
  pickerScroll: {
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(114, 111, 141, 0.08)',
    borderRadius: 8,
    backgroundColor: '#FAFAFF',
  },
  pickerItemBtn: {
    paddingVertical: 8,
    alignItems: 'center',
    width: '100%',
  },
  pickerItemBtnActive: {
    backgroundColor: 'rgba(114, 9, 183, 0.08)',
  },
  pickerItemText: {
    fontFamily: 'SourceSerif4',
    fontSize: 12,
    color: '#726F8D',
  },
  pickerItemTextActive: {
    fontFamily: 'SourceSerif4-Bold',
    color: '#7209B7',
  },
  pickerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  pickerActionBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    marginHorizontal: 5,
    borderWidth: 1,
  },
  pickerCancelBtn: {
    borderColor: '#E8E7ED',
    backgroundColor: '#FFFFFF',
  },
  pickerSaveBtn: {
    borderColor: '#7209B7',
    backgroundColor: '#7209B7',
  },
  pickerCancelText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 11,
    color: '#726F8D',
  },
  pickerSaveText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 11,
    color: '#FFFFFF',
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(114, 9, 183, 0.18)',
    marginTop: 16,
    backgroundColor: '#FAFAFF',
  },
  editProfileBtnText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 10,
    color: '#7209B7',
    letterSpacing: 0.5,
  },
  profileInput: {
    fontFamily: 'SourceSerif4',
    fontSize: 11,
    color: '#2C2B3D',
    borderWidth: 1,
    borderColor: 'rgba(114, 9, 183, 0.18)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#FAFAFF',
    marginTop: 4,
    width: '100%',
    textAlign: 'center',
  },
  profileNameInput: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 15,
    color: '#2C2B3D',
    borderWidth: 1,
    borderColor: 'rgba(114, 9, 183, 0.18)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FAFAFF',
    marginTop: 8,
    marginBottom: 4,
    width: '80%',
    textAlign: 'center',
  },
  editActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
  },
  editActionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
    borderWidth: 1,
  },
  editCancelBtn: {
    borderColor: '#E8E7ED',
    backgroundColor: '#FFFFFF',
  },
  editSaveBtn: {
    borderColor: '#7209B7',
    backgroundColor: '#7209B7',
  },
  editCancelBtnText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 11,
    color: '#726F8D',
  },
  editSaveBtnText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 11,
    color: '#FFFFFF',
  },
  profileBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(114, 111, 141, 0.06)',
    shadowColor: '#726F8D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
    width: '100%',
  },
  profileBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  barIconBg: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 11.5,
    color: '#2C2B3D',
  },
  barSubtitle: {
    fontFamily: 'SourceSerif4',
    fontSize: 10,
    color: '#726F8D',
    marginTop: 1,
  },
  switchTrack: {
    width: 38,
    height: 22,
    borderRadius: 11,
    padding: 2,
    justifyContent: 'center',
  },
  switchTrackOn: {
    backgroundColor: '#7209B7',
  },
  switchTrackOff: {
    backgroundColor: 'rgba(114, 111, 141, 0.16)',
  },
  switchThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  switchThumbOn: {
    alignSelf: 'flex-end',
  },
  switchThumbOff: {
    alignSelf: 'flex-start',
  },
  logoutProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: '#E8E7ED',
    borderRadius: 16,
    marginBottom: 30,
    backgroundColor: '#FFFFFF',
  },
  logoutProfileText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 11,
    color: '#E63946',
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 24,
    left: 15,
    right: 15,
    height: 64,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  bottomNavBlurWrapper: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.65)',
  },
  navGroupLeft: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navGroupRight: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  centerBtnContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#7209B7',
    top: -18,
    shadowColor: '#7209B7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.45)',
  },
  centerBtnGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navTab: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 20,
    minWidth: 64,
    position: 'relative',
    overflow: 'hidden',
  },
  navTabActive: {},
  activeTabBlob: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  navText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 7.5,
    color: '#000000',
    marginTop: 2,
  },
  navTextActive: {
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(44, 43, 61, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    maxHeight: height * 0.75,
  },
  modalHeaderBg: {
    padding: 20,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalHeaderTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 15,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  modalSubtitle: {
    fontFamily: 'SourceSerif4',
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  closeModalBtn: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  suggestionRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  suggestionNumber: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 18,
    color: '#B3A2E7',
    width: 30,
    marginTop: 2,
  },
  suggestionInfo: {
    flex: 1,
  },
  suggestionLabel: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 10,
    color: '#9E9BB3',
    letterSpacing: 0.5,
  },
  suggestionVal: {
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 14,
    color: '#2C2B3D',
    marginTop: 2,
  },
  suggestionDesc: {
    fontFamily: 'SourceSerif4',
    fontSize: 12,
    color: '#726F8D',
    lineHeight: 16,
    marginTop: 2,
  },
  dismissBtn: {
    backgroundColor: '#7209B7',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  dismissBtnText: {
    fontFamily: 'Cinzel-Bold',
    color: '#FFFFFF',
    fontSize: 12,
    letterSpacing: 1,
  },
  focusTabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  focusTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E7ED',
    paddingVertical: 8,
    borderRadius: 10,
    marginHorizontal: 3,
    shadowColor: '#726F8D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  focusTabActive: {
    backgroundColor: '#7209B7',
    borderColor: '#7209B7',
  },
  focusTabText: {
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 10,
    color: '#726F8D',
    marginLeft: 6,
  },
  focusTabTextActive: {
    color: '#FFFFFF',
  },
  movesCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E7ED',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#726F8D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  movesCardTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 13,
    color: '#2C2B3D',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  moveOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(114, 111, 141, 0.03)',
    borderWidth: 1.5,
    borderColor: '#E8E7ED',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  moveOptionActive: {
    borderColor: '#B3A2E7',
    backgroundColor: 'rgba(179, 162, 231, 0.05)',
  },
  radioButton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#9E9BB3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioButtonActive: {
    borderColor: '#7209B7',
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#7209B7',
  },
  moveOptionText: {
    flex: 1,
    fontFamily: 'SourceSerif4',
    fontSize: 13,
    color: '#4C4A63',
    lineHeight: 18,
  },
  moveOptionTextActive: {
    fontFamily: 'SourceSerif4-Bold',
    color: '#2C2B3D',
  },
  splitListsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  listCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E7ED',
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 4,
    shadowColor: '#726F8D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  doCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#03B07A',
  },
  avoidCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#E63946',
  },
  listHeader: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 11,
    marginBottom: 10,
  },
  listItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  listItemIcon: {
    marginRight: 6,
    marginTop: 3,
  },
  listItemText: {
    flex: 1,
    fontFamily: 'SourceSerif4',
    fontSize: 11,
    color: '#4C4A63',
    lineHeight: 16,
  },
  timeWindowsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E7ED',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#726F8D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  timeWindowItem: {
    flex: 1,
    alignItems: 'center',
  },
  avoidTimeItem: {
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(114, 111, 141, 0.1)',
  },
  timeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  timeLabel: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 10,
    color: '#2C2B3D',
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  timeValue: {
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 14,
  },
  insightHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  predictionCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E7ED',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#726F8D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  predictionLabel: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 11,
    color: '#9E9BB3',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  predictionText: {
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 14,
    color: '#2C2B3D',
    lineHeight: 20,
    marginBottom: 14,
  },
  feedbackButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  feedbackBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderColor: '#E8E7ED',
  },
  feedbackBtnHappenedActive: {
    backgroundColor: '#03B07A',
    borderColor: '#03B07A',
  },
  feedbackBtnDidntActive: {
    backgroundColor: '#E63946',
    borderColor: '#E63946',
  },
  feedbackBtnText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 11,
    marginLeft: 6,
  },
  alignmentFeedbackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(179, 162, 231, 0.08)',
    borderRadius: 10,
    padding: 10,
    marginTop: 12,
  },
  alignmentFeedbackText: {
    flex: 1,
    fontFamily: 'SourceSerif4',
    fontSize: 10,
    color: '#7209B7',
    marginLeft: 8,
    lineHeight: 14,
  },
  navDigitIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  navDigitIconActive: {
    borderColor: '#FFFFFF',
    backgroundColor: 'transparent',
  },
  navDigitText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 9.5,
    color: '#000000',
    lineHeight: 11,
  },
  navDigitTextActive: {
    color: '#FFFFFF',
  },
  headerZodiacIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(114, 9, 183, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(114, 9, 183, 0.15)',
  },
  chartsSegmentContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(114, 111, 141, 0.06)',
    borderRadius: 14,
    padding: 3,
    marginBottom: 20,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(114, 111, 141, 0.08)',
  },
  chartsSegmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  chartsSegmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#7209B7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chartsSegmentText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 11,
    color: '#726F8D',
    letterSpacing: 0.5,
  },
  chartsSegmentTextActive: {
    color: '#7209B7',
  },
  birthChartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  chartInstructionText: {
    fontFamily: 'SourceSerif4',
    fontSize: 10.5,
    color: '#7209B7',
    marginTop: 16,
    fontStyle: 'italic',
  },
  chartWheelOuter: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1.5,
    borderColor: '#7209B7',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(179, 162, 231, 0.05)',
  },
  chartWheelInner: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1,
    borderColor: 'rgba(114, 9, 183, 0.25)',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartWheelLineVertical: {
    position: 'absolute',
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(114, 9, 183, 0.15)',
  },
  chartWheelLineHorizontal: {
    position: 'absolute',
    height: 1,
    width: '100%',
    backgroundColor: 'rgba(114, 9, 183, 0.15)',
  },
  chartWheelLineDiagonal: {
    position: 'absolute',
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(114, 9, 183, 0.08)',
  },
  wheelZodiacSign: {
    position: 'absolute',
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 11,
    color: '#726F8D',
  },
  wheelCenterHub: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(114, 9, 183, 0.25)',
    shadowColor: '#7209B7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 2,
  },
  luckyAssocGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  luckyAssocCol: {
    alignItems: 'center',
    flex: 1,
  },
  luckyAssocLabel: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.65)',
    letterSpacing: 0.5,
  },
  luckyAssocVal: {
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 11,
    color: '#FFFFFF',
    marginTop: 3,
  },
  sectionSubDesc: {
    fontFamily: 'SourceSerif4',
    fontSize: 11,
    color: '#726F8D',
    marginHorizontal: 16,
    marginBottom: 16,
    lineHeight: 15,
  },
  pythagoreanGridWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  pythagoreanGrid: {
    width: 220,
    height: 220,
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderWidth: 1.5,
    borderColor: '#7209B7',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(179, 162, 231, 0.03)',
  },
  gridCell: {
    width: '33.33%',
    height: '33.33%',
    borderWidth: 0.5,
    borderColor: 'rgba(114, 9, 183, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  gridCellPopulated: {
    backgroundColor: 'rgba(179, 162, 231, 0.08)',
  },
  gridCellSelected: {
    borderColor: '#7209B7',
    borderWidth: 1.5,
    zIndex: 10,
  },
  gridCellNumber: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 16,
    color: 'rgba(114, 9, 183, 0.25)',
  },
  gridCellTextPopulated: {
    color: '#7209B7',
  },
  gridCellTextActive: {
    color: '#FFFFFF',
  },
  gridDotRow: {
    flexDirection: 'row',
    marginTop: 2,
    alignItems: 'center',
  },
  gridDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(114, 9, 183, 0.2)',
    marginHorizontal: 1,
  },
  gridDotPopulated: {
    backgroundColor: '#7209B7',
  },
  gridDotActive: {
    backgroundColor: '#FFFFFF',
  },
  gridDotPlus: {
    fontSize: 8,
    fontFamily: 'Cinzel-Bold',
    color: '#7209B7',
    marginLeft: 1,
  },
  gridDetailElement: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 9.5,
    color: '#F72585',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  gridCountIndicator: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(114, 111, 141, 0.06)',
  },
  gridCountIndicatorText: {
    fontFamily: 'SourceSerif4',
    fontSize: 10.5,
    color: '#726F8D',
  },
  mandalaContainer: {
    width: 320,
    height: 320,
    alignSelf: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  mandalaOuterRing: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 0.5,
    borderColor: 'rgba(114, 9, 183, 0.15)',
    left: 30,
    top: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mandalaTick: {
    position: 'absolute',
    width: 1,
    height: 6,
    backgroundColor: 'rgba(114, 9, 183, 0.2)',
    left: '50%',
    top: '50%',
  },
  mandalaCenterMoon: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    left: 124, // centered in 320px container (160 - 36)
    top: 124,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
    ...Platform.select({
      ios: {
        shadowColor: '#FFF5D6',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 15,
      },
      android: {},
    }),
  },
  mandalaCenterSun: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    left: 124,
    top: 124,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
    ...Platform.select({
      ios: {
        shadowColor: '#FFC107',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.75,
        shadowRadius: 16,
      },
      android: {},
    }),
  },
  sunGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 200, 80, 0.5)',
    overflow: 'hidden',
  },
  sunCoreHighlight: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    top: 12,
    left: 16,
    backgroundColor: 'rgba(255, 253, 240, 0.7)',
  },
  sunRayLayer: {
    position: 'absolute',
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sunRay: {
    position: 'absolute',
    width: 3.5,
    height: 16,
    borderRadius: 2.5,
    backgroundColor: '#FFCA45',
  },
  sunRayShort: {
    height: 10,
    backgroundColor: '#FFB300',
  },
  sunHalo1: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.2)',
    zIndex: 1,
  },
  sunHalo2: {
    position: 'absolute',
    width: 136,
    height: 136,
    borderRadius: 68,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 193, 7, 0.1)',
    zIndex: 1,
  },
  moonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 245, 214, 0.4)',
    overflow: 'hidden',
  },
  moonHalo1: {
    position: 'absolute',
    width: 98,
    height: 98,
    borderRadius: 49,
    borderWidth: 1,
    borderColor: 'rgba(255, 245, 214, 0.15)',
    zIndex: 1,
  },
  moonHalo2: {
    position: 'absolute',
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 245, 214, 0.08)',
    zIndex: 1,
  },
  moonCrater: {
    position: 'absolute',
    backgroundColor: 'rgba(114, 95, 140, 0.18)',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.12)',
    borderRightWidth: 0.5,
    borderRightColor: 'rgba(255, 255, 255, 0.12)',
  },
  mandalaOrbWrapper: {
    position: 'absolute',
    width: 76,
    height: 76,
    zIndex: 10,
  },
  mandalaOrb: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(114, 111, 141, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7209B7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
    overflow: 'hidden',
  },
  mandalaOrbNumber: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 24,
    color: '#7209B7',
    lineHeight: 26,
  },
  mandalaOrbLabel: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 8,
    color: '#726F8D',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 1,
  },
  mandalaOrbLabelCentered: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 9,
    color: '#726F8D',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    textAlign: 'center',
    lineHeight: 12,
  },
  mandalaOrbSparkle: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  mandalaHint: {
    position: 'absolute',
    bottom: -4,
    alignSelf: 'center',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  mandalaHintText: {
    fontFamily: 'SourceSerif4',
    fontSize: 10.5,
    color: '#B3A2E7',
    fontStyle: 'italic',
  },
  pagerScrollView: {
    flex: 1,
  },
  modalBodyScroll: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  palmCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(114, 111, 141, 0.08)',
    shadowColor: '#726F8D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 16,
  },
  palmSectionTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 16,
    color: '#2C2B3D',
    marginBottom: 6,
  },
  palmSectionDesc: {
    fontFamily: 'SourceSerif4',
    fontSize: 12.5,
    color: '#726F8D',
    lineHeight: 18,
    marginBottom: 16,
  },
  dashedUploadContainer: {
    height: 180,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(114, 9, 183, 0.2)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(179, 162, 231, 0.02)',
    marginBottom: 16,
  },
  uploadPromptText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 12,
    color: 'rgba(114, 9, 183, 0.4)',
  },
  imagePreviewContainer: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(114, 111, 141, 0.15)',
  },
  palmImagePreview: {
    width: '100%',
    height: '100%',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(230, 57, 70, 0.9)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  palmActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  palmActionButton: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  palmActionText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 11,
    color: '#FFFFFF',
  },
  primaryScanBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#7209B7',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7209B7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryScanBtnText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 12,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  imageScanWrapper: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(114, 111, 141, 0.15)',
    marginBottom: 16,
  },
  palmImageScanning: {
    width: '100%',
    height: '100%',
    opacity: 0.7,
  },
  scannerLaserLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 12,
    zIndex: 10,
  },
  loadingSpinnerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 10,
  },
  loadingStatusText: {
    fontFamily: 'SourceSerif4',
    fontSize: 12,
    color: '#726F8D',
    fontStyle: 'italic',
  },
  resultCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(247, 37, 133, 0.15)',
    marginBottom: 12,
  },
  resultCardTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 13,
    color: '#F72585',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  resultCardBody: {
    fontFamily: 'SourceSerif4',
    fontSize: 13.5,
    color: '#2C2B3D',
    lineHeight: 20,
    marginBottom: 12,
  },
  badgeContainer: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(247, 37, 133, 0.08)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  badgeLabel: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 9.5,
    color: '#F72585',
    marginRight: 4,
  },
  badgeValue: {
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 11,
    color: '#2C2B3D',
  },
  lineDetailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(114, 111, 141, 0.06)',
  },
  lineDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  lineDetailTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 12.5,
    color: '#2C2B3D',
    marginLeft: 6,
  },
  starScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lineDetailBody: {
    fontFamily: 'SourceSerif4',
    fontSize: 13,
    color: '#726F8D',
    lineHeight: 18,
  },
  luckyGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  luckyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(114, 111, 141, 0.06)',
    alignItems: 'center',
  },
  luckyTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 9,
    color: '#726F8D',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  luckyValue: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 16,
    color: '#7209B7',
  },
  palmPredictionCard: {
    backgroundColor: 'rgba(114, 9, 183, 0.04)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(114, 9, 183, 0.08)',
  },
  palmPredictionTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 11,
    color: '#7209B7',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  palmPredictionBody: {
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 13,
    color: '#2C2B3D',
    lineHeight: 19,
  },
  questionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(114, 9, 183, 0.1)',
  },
  questionPromptTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 11,
    color: '#726F8D',
    marginBottom: 8,
  },
  questionInputRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(114, 111, 141, 0.05)',
    borderRadius: 14,
    paddingLeft: 12,
    paddingRight: 6,
    height: 44,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(114, 111, 141, 0.08)',
  },
  questionTextInput: {
    flex: 1,
    fontFamily: 'SourceSerif4',
    fontSize: 12.5,
    color: '#2C2B3D',
    paddingVertical: 4,
  },
  questionSubmitBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#7209B7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetScanBtn: {
    height: 46,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#7209B7',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  resetScanBtnText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 11.5,
    color: '#7209B7',
    letterSpacing: 0.5,
  },
  customToastContainer: {
    position: 'absolute',
    bottom: 100, // floating nicely above the navigation bar
    left: '15%',
    right: '15%',
    backgroundColor: 'rgba(44, 43, 61, 0.95)',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 999999,
  },
  customToastText: {
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 13,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  mobilePreviewImageContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(44, 43, 61, 0.1)',
    marginBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  mobilePreviewImage: {
    width: '100%',
    height: '100%',
  },
  mobileIntroHeading: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 15,
    color: '#2C2B3D',
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  mobileIntroBullet: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    width: '100%',
  },
  mobileBulletTitle: {
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 13,
    color: '#2C2B3D',
  },
  mobileBulletDesc: {
    fontFamily: 'SourceSerif4',
    fontSize: 11,
    color: '#6e6b82',
    lineHeight: 15,
    marginTop: 2,
  },
  mobileCheckboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 4,
    alignSelf: 'center',
    padding: 8,
  },
  mobileCheckboxText: {
    fontFamily: 'SourceSerif4',
    fontSize: 12,
    color: '#6e6b82',
    marginLeft: 8,
  },
  shareCardTrigger: {
    marginVertical: 10,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#D946EF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  shareCardTriggerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  shareCardTriggerText: {
    color: '#FFFFFF',
    fontFamily: 'Cinzel-Bold',
    fontSize: 13,
    letterSpacing: 0.5,
  },
});
