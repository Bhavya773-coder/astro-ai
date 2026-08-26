import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { interpretTarotCard, createChat, sendChatMessage, deductTarotCredit } from './api';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  ArrowLeft,
  Sparkles,
  Compass,
  Moon,
  Sun,
  Heart,
  Flame,
  Globe,
  Eye,
  Layers,
  TrendingUp,
  RotateCcw,
  Share2,
} from 'lucide-react-native';
import { ShareCardModal } from './ShareCardModal';
import { ShareCardData } from './shareUtils';
import Svg, {
  Circle as SvgCircle,
  Path as SvgPath,
  G as SvgG,
  Rect as SvgRect,
} from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// 12 Major Arcana tarot cards
interface TarotCard {
  id: number;
  name: string;
  name_short?: string;
  numeral: string;
  planet: string;
  element: string;
  keywords: string[];
  description: string;
  icon?: any;
  color: string;
  pastReading: string;
  presentReading: string;
  futureReading: string;
  is_reversed?: boolean;
  meaning_up?: string;
  meaning_rev?: string;
}

const BASE_IMG_URL = 'https://raw.githubusercontent.com/wicker/Rider-Waite-Reader/master/rider-waite-reader/public/img';

const TAROT_CARD_IMAGES: Record<string, string> = {
  ar00: `${BASE_IMG_URL}/tarot-0-fool.jpg`,
  ar01: `${BASE_IMG_URL}/tarot-1-magician.jpg`,
  ar02: `${BASE_IMG_URL}/tarot-2-high-priestess.jpg`,
  ar03: `${BASE_IMG_URL}/tarot-3-the-empress.jpg`,
  ar04: `${BASE_IMG_URL}/tarot-4-the-emperor.jpg`,
  ar05: `${BASE_IMG_URL}/tarot-5-the-hierophant.jpg`,
  ar06: `${BASE_IMG_URL}/tarot-6-the-lovers.jpg`,
  ar07: `${BASE_IMG_URL}/tarot-7-the-chariot.jpg`,
  ar08: `${BASE_IMG_URL}/tarot-8-strength.jpg`,
  ar09: `${BASE_IMG_URL}/tarot-9-hermit.jpg`,
  ar10: `${BASE_IMG_URL}/tarot-10-wheel-of-fortune.jpg`,
  ar11: `${BASE_IMG_URL}/tarot-11-justice.jpg`,
  ar12: `${BASE_IMG_URL}/tarot-12-the-hanged-man.jpg`,
  ar13: `${BASE_IMG_URL}/tarot-13-death.jpg`,
  ar14: `${BASE_IMG_URL}/tarot-14-temperance.jpg`,
  ar15: `${BASE_IMG_URL}/tarot-15-the-devil.jpg`,
  ar16: `${BASE_IMG_URL}/tarot-16-the-tower.jpg`,
  ar17: `${BASE_IMG_URL}/tarot-17-the-star.jpg`,
  ar18: `${BASE_IMG_URL}/tarot-18-the-moon.jpg`,
  ar19: `${BASE_IMG_URL}/tarot-19-the-sun.jpg`,
  ar20: `${BASE_IMG_URL}/tarot-20-judgement.jpg`,
  ar21: `${BASE_IMG_URL}/tarot-21-the-world.jpg`,

  // Minor Arcana - Wands
  waac: `${BASE_IMG_URL}/wands01.jpg`,
  wa02: `${BASE_IMG_URL}/wands02.jpg`,
  wa03: `${BASE_IMG_URL}/wands03.jpg`,
  wa04: `${BASE_IMG_URL}/wands04.jpg`,
  wa05: `${BASE_IMG_URL}/wands05.jpg`,
  wa06: `${BASE_IMG_URL}/wands06.jpg`,
  wa07: `${BASE_IMG_URL}/wands07.jpg`,
  wa08: `${BASE_IMG_URL}/wands08.jpg`,
  wa09: `${BASE_IMG_URL}/wands09.jpg`,
  wa10: `${BASE_IMG_URL}/wands10.jpg`,
  wapa: `${BASE_IMG_URL}/wands11.jpg`,
  wakn: `${BASE_IMG_URL}/wands12.jpg`,
  waqu: `${BASE_IMG_URL}/wands13.jpg`,
  waki: `${BASE_IMG_URL}/wands14.jpg`,

  // Minor Arcana - Cups
  cuac: `${BASE_IMG_URL}/cups01.jpg`,
  cu02: `${BASE_IMG_URL}/cups02.jpg`,
  cu03: `${BASE_IMG_URL}/cups03.jpg`,
  cu04: `${BASE_IMG_URL}/cups04.jpg`,
  cu05: `${BASE_IMG_URL}/cups05.jpg`,
  cu06: `${BASE_IMG_URL}/cups06.jpg`,
  cu07: `${BASE_IMG_URL}/cups07.jpg`,
  cu08: `${BASE_IMG_URL}/cups08.jpg`,
  cu09: `${BASE_IMG_URL}/cups09.jpg`,
  cu10: `${BASE_IMG_URL}/cups10.jpg`,
  cupa: `${BASE_IMG_URL}/cups11.jpg`,
  cukn: `${BASE_IMG_URL}/cups12.jpg`,
  cuqu: `${BASE_IMG_URL}/cups13.jpg`,
  cuki: `${BASE_IMG_URL}/cups14.jpg`,

  // Minor Arcana - Swords
  swac: `${BASE_IMG_URL}/swords01.jpg`,
  sw02: `${BASE_IMG_URL}/swords02.jpg`,
  sw03: `${BASE_IMG_URL}/swords03.jpg`,
  sw04: `${BASE_IMG_URL}/swords04.jpg`,
  sw05: `${BASE_IMG_URL}/swords05.jpg`,
  sw06: `${BASE_IMG_URL}/swords06.jpg`,
  sw07: `${BASE_IMG_URL}/swords07.jpg`,
  sw08: `${BASE_IMG_URL}/swords08.jpg`,
  sw09: `${BASE_IMG_URL}/swords09.jpg`,
  sw10: `${BASE_IMG_URL}/swords10.jpg`,
  swpa: `${BASE_IMG_URL}/swords11.jpg`,
  swkn: `${BASE_IMG_URL}/swords12.jpg`,
  swqu: `${BASE_IMG_URL}/swords13.jpg`,
  swki: `${BASE_IMG_URL}/swords14.jpg`,

  // Minor Arcana - Pentacles
  peac: `${BASE_IMG_URL}/pents01.jpg`,
  pe02: `${BASE_IMG_URL}/pents02.jpg`,
  pe03: `${BASE_IMG_URL}/pents03.jpg`,
  pe04: `${BASE_IMG_URL}/pents04.jpg`,
  pe05: `${BASE_IMG_URL}/pents05.jpg`,
  pe06: `${BASE_IMG_URL}/pents06.jpg`,
  pe07: `${BASE_IMG_URL}/pents07.jpg`,
  pe08: `${BASE_IMG_URL}/pents08.jpg`,
  pe09: `${BASE_IMG_URL}/pents09.jpg`,
  pe10: `${BASE_IMG_URL}/pents10.jpg`,
  pepa: `${BASE_IMG_URL}/pents11.jpg`,
  pekn: `${BASE_IMG_URL}/pents12.jpg`,
  pequ: `${BASE_IMG_URL}/pents13.jpg`,
  peki: `${BASE_IMG_URL}/pents14.jpg`
};

const getCardImage = (nameShort?: string): string | null => {
  if (!nameShort) return null;
  return TAROT_CARD_IMAGES[nameShort] || null;
};

const TAROT_DECK: TarotCard[] = [
  {
    id: 0,
    name: 'The Fool',
    numeral: '0',
    planet: 'Uranus',
    element: 'Air',
    keywords: ['Beginnings', 'Spontaneity', 'Faith', 'New Journeys'],
    description: 'The Fool represents pure potential, a fresh start, and stepping into the unknown with childlike faith. You are at the edge of a major spiritual leap.',
    icon: Compass,
    color: '#3B82F6',
    pastReading: 'You recently took a leap of faith, starting a new chapter without knowing where it would lead. This spontaneous decision broke old chains.',
    presentReading: 'You are standing at a threshold of infinite possibilities. Trust your heart, let go of fears, and take the risk that calls to your soul.',
    futureReading: 'A clean slate awaits you. The universe will offer a brand new start in your career or relationships. Be ready to explore without pre-conceptions.',
  },
  {
    id: 1,
    name: 'The Magician',
    numeral: 'I',
    planet: 'Mercury',
    element: 'Air',
    keywords: ['Manifestation', 'Willpower', 'Resourcefulness', 'Skill'],
    description: 'The Magician bridges the spiritual and physical worlds, holding the power to manifest desires through focused willpower and alignment with cosmic forces.',
    icon: Sparkles,
    color: '#D9730D',
    pastReading: 'You built a strong foundation of skills and tools. The power of manifestation you tapped into recently is what brought you to this point.',
    presentReading: 'You possess all the resources necessary to shape your reality. Focus your thoughts, align your actions, and bring your visions into physical form.',
    futureReading: 'You will gain absolute mastery over a challenging situation. Success will follow as you align your conscious mind with celestial intent.',
  },
  {
    id: 2,
    name: 'The High Priestess',
    numeral: 'II',
    planet: 'Moon',
    element: 'Water',
    keywords: ['Intuition', 'Subconscious', 'Sacred Knowledge', 'Mystery'],
    description: 'The High Priestess is the guardian of the subconscious mind. She represents deep intuition, secrets, dreams, and the divine feminine presence.',
    icon: Moon,
    color: '#7209B7',
    pastReading: 'You followed a quiet inner voice that helped you navigate a confusing mystery. Intuiting rather than thinking saved you from error.',
    presentReading: 'It is time to look beyond the surface. Trust your gut feelings and dreams. The answers you seek are already resting inside your subconscious.',
    futureReading: 'A hidden truth will be revealed to you. By remaining receptive and still, you will receive profound spiritual clarity.',
  },
  {
    id: 3,
    name: 'The Empress',
    numeral: 'III',
    planet: 'Venus',
    element: 'Earth',
    keywords: ['Abundance', 'Nurturing', 'Nature', 'Creativity'],
    description: 'The Empress is a symbol of mother nature, fertility, creation, and absolute abundance. She encourages connecting with your senses and nurturing your creations.',
    icon: Sun,
    color: '#EC4899',
    pastReading: 'A period of rich creativity or nurturing relationships has laid down a comfortable, emotionally abundant landscape for you.',
    presentReading: 'Abundance surrounds you. Focus on creation, self-care, and appreciating beauty. Your projects and relationships are ready to blossom.',
    futureReading: 'You will step into a phase of material and emotional security. Growth is guaranteed, and you will harvest the sweet fruits of your patience.',
  },
  {
    id: 4,
    name: 'The Emperor',
    numeral: 'IV',
    planet: 'Mars',
    element: 'Fire',
    keywords: ['Authority', 'Structure', 'Solid Foundation', 'Protection'],
    description: 'The Emperor represents structure, stability, authority, and protective leadership. He calls for discipline, order, and practical planning.',
    icon: Layers,
    color: '#EF4444',
    pastReading: 'You established discipline and set strong boundaries. This structured approach provided safety and order when things got chaotic.',
    presentReading: 'You need to take command of your situation. Apply logic, establish clear rules, and lead with steady, calm authority.',
    futureReading: 'A period of stability and organized success is arriving. You will secure a leadership position or build a solid, long-lasting project.',
  },
  {
    id: 5,
    name: 'The Lovers',
    numeral: 'VI',
    planet: 'Venus',
    element: 'Air',
    keywords: ['Harmony', 'Alignment', 'Relationships', 'Choices'],
    description: 'The Lovers represents deep connection, personal choices, and alignment with values. It is about understanding who you are and what you stand for.',
    icon: Heart,
    color: '#F72585',
    pastReading: 'A major choice based on personal values or a meaningful relationship set your course. This alignment brought inner harmony.',
    presentReading: 'You are facing a critical choice that requires complete honesty. Align your decisions with your true moral values and heart.',
    futureReading: 'Deep emotional harmony and mutual understanding are coming. A powerful union or a perfect choice will bring peace to your spirit.',
  },
  {
    id: 6,
    name: 'The Chariot',
    numeral: 'VII',
    planet: 'Moon',
    element: 'Water',
    keywords: ['Willpower', 'Determination', 'Triumph', 'Direction'],
    description: 'The Chariot signifies victory, self-assertion, and harnessing opposing forces. It indicates charging forward with discipline and clear focus.',
    icon: TrendingUp,
    color: '#2563EB',
    pastReading: 'You overcame obstacles through pure willpower. A time of conflict ended in your victory because you remained focused.',
    presentReading: 'Hold the reins tightly. You must stay focused and disciplined despite distractions. Victory is within reach if you push forward.',
    futureReading: 'You will achieve a major breakthrough in your career or personal goals. Travel or relocation might bring positive progress.',
  },
  {
    id: 7,
    name: 'Strength',
    numeral: 'VIII',
    planet: 'Sun',
    element: 'Fire',
    keywords: ['Inner Strength', 'Courage', 'Patience', 'Compassion'],
    description: 'Strength represents quiet fortitude, patience, and soft power. It is the ability to tame the wild beast of emotion through compassion and inner calm.',
    icon: Flame,
    color: '#EA580C',
    pastReading: 'You faced a difficult ordeal not with anger, but with quiet endurance. This inner resolve built a deep sense of self-respect.',
    presentReading: 'You are stronger than you think. Meet challenges with patience, gentle persuasion, and love rather than raw force.',
    futureReading: 'You will master your fears and anxieties completely. A quiet, unshakeable confidence will guide you through any storms.',
  },
  {
    id: 8,
    name: 'The Hermit',
    numeral: 'IX',
    planet: 'Mercury',
    element: 'Earth',
    keywords: ['Contemplation', 'Inner Guidance', 'Solitude', 'Wisdom'],
    description: 'The Hermit represents turning inward for answers. He carries a lantern, seeking spiritual truths and wisdom through quiet contemplation and solitude.',
    icon: Eye,
    color: '#4B5563',
    pastReading: 'A period of reflection and self-isolation allowed you to understand your deeper motives and re-evaluate your path.',
    presentReading: 'Step back from the noise of the external world. Spend time in quiet reflection; your inner lantern holds the light you seek.',
    futureReading: 'You will find a wise mentor or become one yourself. Spiritual clarity will emerge from deep, uninterrupted study and self-discovery.',
  },
  {
    id: 9,
    name: 'Wheel of Fortune',
    numeral: 'X',
    planet: 'Jupiter',
    element: 'Fire',
    keywords: ['Good Luck', 'Cycles', 'Destiny', 'Karmic Changes'],
    description: 'The Wheel of Fortune reminds us that life is in constant motion. Good times and bad times pass in cycles. Destiny is shifting in your favor.',
    icon: Globe,
    color: '#059669',
    pastReading: 'A sudden, unexpected turn of events shifted your life trajectory. You learned to adapt to changes beyond your control.',
    presentReading: 'A cycle is ending and a new one is beginning. Prepare for luck, unexpected opportunities, and a positive twist of fate.',
    futureReading: 'A karmic breakthrough is coming. The wheel will rotate to place you in a highly favorable position. Embrace the flow of destiny.',
  },
  {
    id: 10,
    name: 'The Star',
    numeral: 'XVII',
    planet: 'Uranus',
    element: 'Air',
    keywords: ['Hope', 'Faith', 'Rejuvenation', 'Serenity'],
    description: 'The Star is a beacon of hope, spiritual rejuvenation, and cosmic guidance. It indicates that you are entering a healing sanctuary of peace.',
    icon: Sparkles,
    color: '#0D9488',
    pastReading: 'After a storm of struggles, you found hope and renewed your faith. This healing energy restored your spiritual vitality.',
    presentReading: 'You are protected and guided. Open your heart to peace and allow yourself to heal. The universe is restoring your natural balance.',
    futureReading: 'A period of pure serenity and success lies ahead. Your dreams will align with reality, bringing public inspiration and joy.',
  },
  {
    id: 11,
    name: 'The Sun',
    numeral: 'XIX',
    planet: 'Sun',
    element: 'Fire',
    keywords: ['Joy', 'Success', 'Vitality', 'Enlightenment'],
    description: 'The Sun represents absolute joy, success, health, and cosmic blessing. It radiates warmth, abundance, and conscious clarity.',
    icon: Sun,
    color: '#CA8A04',
    pastReading: 'You enjoyed a highly successful and warm phase that filled your heart with joy and boosted your self-confidence.',
    presentReading: 'You are in full light. Your truth is visible, and your energy is magnetic. Enjoy the warmth, connection, and clarity surrounding you.',
    futureReading: 'A magnificent victory or accomplishment is guaranteed. Relationships will thrive under absolute transparency, joy, and warmth.',
  }
];

// Tarot Card Svg Graphics
function TarotCardSvg({ cardId, color, size = 120 }: { cardId: number; color: string; size?: number }) {
  const strokeW = 1.5;
  const drawSymbol = () => {
    switch (cardId) {
      case 0: // The Fool (Compass)
        return (
          <SvgG stroke={color} strokeWidth={strokeW} fill="none" strokeLinecap="round" strokeLinejoin="round">
            <SvgCircle cx="0" cy="0" r="18" strokeDasharray="3,3" />
            <SvgCircle cx="0" cy="0" r="14" />
            <SvgPath d="M0 -14 L0 14 M-14 0 L14 0" opacity={0.5} />
            <SvgPath d="M0 -10 L3 0 L0 10 L-3 0 Z" fill={color + '20'} />
            <SvgCircle cx="0" cy="0" r="2" fill={color} />
          </SvgG>
        );
      case 1: // The Magician (Sparkles)
        return (
          <SvgG stroke={color} strokeWidth={strokeW} fill="none" strokeLinecap="round" strokeLinejoin="round">
            <SvgPath d="M0 -15 C 0 -5, 5 0, 15 0 C 5 0, 0 5, 0 15 C 0 5, -5 0, -15 0 C -5 0, 0 -5, 0 -15 Z" fill={color + '15'} />
            <SvgPath d="M-10 -10 A 3 3 0 1 1 -6 -6" opacity={0.6} />
            <SvgPath d="M8 8 C 8 4, 10 2, 12 2 C 10 2, 8 0, 8 -4 C 8 0, 6 2, 4 2 C 6 2, 8 4, 8 8 Z" fill={color} />
            <SvgPath d="M 0 0 A 8 8 0 0 1 0 -8" opacity={0.8} />
          </SvgG>
        );
      case 2: // The High Priestess (Crescent Moon)
        return (
          <SvgG stroke={color} strokeWidth={strokeW} fill="none" strokeLinecap="round" strokeLinejoin="round">
            <SvgCircle cx="0" cy="0" r="16" strokeDasharray="2,2" opacity={0.7} />
            <SvgPath d="M-4 -12 A 12 12 0 0 1 -4 12 A 9 9 0 0 0 4 8 A 9 9 0 0 0 4 -8 A 12 12 0 0 1 -4 -12 Z" fill={color + '20'} />
            <SvgCircle cx="8" cy="-6" r="1.5" fill={color} />
            <SvgCircle cx="-8" cy="6" r="1.5" fill={color} />
          </SvgG>
        );
      case 3: // The Empress (Venus Crown & Stars)
        return (
          <SvgG stroke={color} strokeWidth={strokeW} fill="none" strokeLinecap="round" strokeLinejoin="round">
            <SvgPath d="M-12 6 L-8 -10 L0 -2 L8 -10 L12 6 Z" fill={color + '20'} />
            <SvgCircle cx="-8" cy="-12" r="2.5" fill={color} />
            <SvgCircle cx="0" cy="-5" r="2.5" fill={color} />
            <SvgCircle cx="8" cy="-12" r="2.5" fill={color} />
            <SvgCircle cx="0" cy="12" r="5" />
            <SvgPath d="M0 17 L0 7 M-3 14 L3 14" />
          </SvgG>
        );
      case 4: // The Emperor (Throne & Crown)
        return (
          <SvgG stroke={color} strokeWidth={strokeW} fill="none" strokeLinecap="round" strokeLinejoin="round">
            <SvgRect x="-12" y="-4" width="24" height="16" rx="2" fill={color + '15'} />
            <SvgPath d="M-12 12 L-16 12 L-16 -8 L-10 -8 L-10 -4" />
            <SvgPath d="M12 12 L16 12 L16 -8 L10 -8 L10 -4" />
            <SvgPath d="M-6 -6 L-4 -12 L0 -9 L4 -12 L6 -6 Z" fill={color + '25'} />
            <SvgCircle cx="0" cy="1" r="2.5" fill={color} />
          </SvgG>
        );
      case 5: // The Lovers (Hearts and Wings)
        return (
          <SvgG stroke={color} strokeWidth={strokeW} fill="none" strokeLinecap="round" strokeLinejoin="round">
            <SvgPath d="M12 -8 C 7 -14, 0 -10, 0 -4 C 0 -10, -7 -14, -12 -8 C -18 -2, -10 6, 0 15 C 10 6, 18 -2, 12 -8 Z" fill={color + '20'} />
            <SvgPath d="M-6 -2 C-14 -6, -16 2, -10 4" opacity={0.7} />
            <SvgPath d="M6 -2 C14 -6, 16 2, 10 4" opacity={0.7} />
          </SvgG>
        );
      case 6: // The Chariot (Shield and Stars)
        return (
          <SvgG stroke={color} strokeWidth={strokeW} fill="none" strokeLinecap="round" strokeLinejoin="round">
            <SvgPath d="M-12 -10 L12 -10 L12 0 C12 7, 0 15, 0 15 C0 15, -12 7, -12 0 Z" fill={color + '15'} />
            <SvgPath d="M0 -10 L0 15" opacity={0.5} strokeDasharray="3,2" />
            <SvgCircle cx="0" cy="0" r="5" fill={color} />
            <SvgPath d="M-5 -15 L0 -10 L5 -15" />
          </SvgG>
        );
      case 7: // Strength (Flame and Infinite)
        return (
          <SvgG stroke={color} strokeWidth={strokeW} fill="none" strokeLinecap="round" strokeLinejoin="round">
            <SvgPath d="M-8 4 C-12 0, -12 -6, -8 -6 C-4 -6, 0 2, 4 2 C8 2, 12 -2, 8 -6 C4 -10, -4 4, -8 4 Z" opacity={0.7} />
            <SvgPath d="M0 -3 C0 -3, -6 3, -6 8 C-6 12, -2 15, 0 15 C2 15, 6 12, 6 8 C6 3, 0 -3, 0 -3 Z" fill={color + '25'} />
            <SvgCircle cx="0" cy="5" r="2.5" fill={color} />
          </SvgG>
        );
      case 8: // The Hermit (Lantern and Eye)
        return (
          <SvgG stroke={color} strokeWidth={strokeW} fill="none" strokeLinecap="round" strokeLinejoin="round">
            <SvgPath d="M0 -15 L-6 -8 L-6 4 L6 4 L6 -8 Z" fill={color + '10'} />
            <SvgRect x="-4" y="4" width="8" height="6" fill={color + '20'} />
            <SvgCircle cx="0" cy="-2" r="3" fill={color} />
            <SvgPath d="M-12 -2 C-12 -2, -6 6, 0 6 C6 6, 12 -2, 12 -2 C12 -2, 6 -10, 0 -10 C-6 -10, -12 -2, -12 -2 Z" opacity={0.4} />
            <SvgCircle cx="0" cy="-2" r="6" opacity={0.5} />
          </SvgG>
        );
      case 9: // Wheel of Fortune (Zodiac Wheel)
        return (
          <SvgG stroke={color} strokeWidth={strokeW} fill="none" strokeLinecap="round" strokeLinejoin="round">
            <SvgCircle cx="0" cy="0" r="16" fill={color + '15'} />
            <SvgCircle cx="0" cy="0" r="10" />
            <SvgCircle cx="0" cy="0" r="3" fill={color} />
            {Array.from({ length: 8 }).map((_, idx) => {
              const angle = (idx * 45 * Math.PI) / 180;
              const x1 = 3 * Math.cos(angle);
              const y1 = 3 * Math.sin(angle);
              const x2 = 16 * Math.cos(angle);
              const y2 = 16 * Math.sin(angle);
              return <SvgPath key={idx} d={`M ${x1} ${y1} L ${x2} ${y2}`} opacity={0.7} />;
            })}
          </SvgG>
        );
      case 10: // The Star (Large Star and Small Stars)
        return (
          <SvgG stroke={color} strokeWidth={strokeW} fill="none" strokeLinecap="round" strokeLinejoin="round">
            <SvgPath d="M0 -18 L3 -5 L16 -5 L6 3 L10 15 L0 8 L-10 15 L-6 3 L-16 -5 L-3 -5 Z" fill={color + '20'} />
            <SvgCircle cx="0" cy="0" r="3.5" fill="#FFF" />
            <SvgCircle cx="12" cy="-12" r="1.5" fill={color} opacity={0.8} />
            <SvgCircle cx="-12" cy="12" r="1.5" fill={color} opacity={0.8} />
            <SvgCircle cx="-13" cy="-10" r="1" fill={color} opacity={0.6} />
            <SvgCircle cx="13" cy="10" r="1" fill={color} opacity={0.6} />
          </SvgG>
        );
      case 11: // The Sun (Glowing Sun)
        return (
          <SvgG stroke={color} strokeWidth={strokeW} fill="none" strokeLinecap="round" strokeLinejoin="round">
            <SvgCircle cx="0" cy="0" r="11" fill={color + '20'} />
            <SvgCircle cx="0" cy="0" r="7" />
            {Array.from({ length: 12 }).map((_, idx) => {
              const angle = (idx * 30 * Math.PI) / 180;
              const isLong = idx % 2 === 0;
              const rStart = 11;
              const rEnd = isLong ? 17 : 14;
              const x1 = rStart * Math.cos(angle);
              const y1 = rStart * Math.sin(angle);
              const x2 = rEnd * Math.cos(angle);
              const y2 = rEnd * Math.sin(angle);
              return <SvgPath key={idx} d={`M ${x1} ${y1} L ${x2} ${y2}`} />;
            })}
          </SvgG>
        );
      default:
        return null;
    }
  };

  return (
    <Svg width={size} height={size} viewBox="-22 -22 44 44">
      {drawSymbol()}
    </Svg>
  );
}

// Card Back Design (Gold Constellations & Deep Violet Border)
function CardBackGraphic({ size = 110 }) {
  const stroke = '#E2B13C'; // Gold
  return (
    <Svg width={size} height={size * 1.55} viewBox="0 0 100 155" style={StyleSheet.absoluteFillObject}>
      {/* Deep Violet background */}
      <SvgRect x="0" y="0" width="100" height="155" fill="#3C1B70" rx="10" />
      {/* Decorative Gold Borders */}
      <SvgRect x="4" y="4" width="92" height="147" rx="8" fill="none" stroke={stroke} strokeWidth="1.2" opacity="0.85" />
      <SvgRect x="7" y="7" width="86" height="141" rx="6" fill="none" stroke={stroke} strokeWidth="0.6" opacity="0.6" strokeDasharray="3,2" />

      {/* Central Mystical Circle */}
      <SvgCircle cx="50" cy="77.5" r="22" fill="none" stroke={stroke} strokeWidth="1.2" opacity="0.75" />
      <SvgCircle cx="50" cy="77.5" r="18" fill="none" stroke={stroke} strokeWidth="0.6" strokeDasharray="2,2" opacity="0.6" />

      {/* Celestial Lines */}
      <SvgPath d="M50 20 L50 135 M15 77.5 L85 77.5" stroke={stroke} strokeWidth="0.5" opacity="0.5" />
      <SvgPath d="M25 52.5 L75 102.5 M25 102.5 L75 52.5" stroke={stroke} strokeWidth="0.5" opacity="0.4" strokeDasharray="4,4" />

      {/* Little Gold stars in corners */}
      <SvgCircle cx="12" cy="12" r="1.5" fill={stroke} opacity="0.9" />
      <SvgCircle cx="88" cy="12" r="1.5" fill={stroke} opacity="0.9" />
      <SvgCircle cx="12" cy="143" r="1.5" fill={stroke} opacity="0.9" />
      <SvgCircle cx="88" cy="143" r="1.5" fill={stroke} opacity="0.9" />

      <SvgCircle cx="50" cy="77.5" r="3" fill={stroke} />
    </Svg>
  );
}

interface TarotReadingScreenProps {
  answers: Record<string, string>;
  zodiacIndex: number;
  onBack: () => void;
  onSendToChat: (
    userMsg: { id: string; sender: 'user'; text: string },
    aiMsg: { id: string; sender: 'ai'; text: string }
  ) => void;
  onUpdateCredits?: (credits: number) => void;
}

type TarotStep = 'intro' | 'shuffling' | 'spread' | 'reading';
type TarotSpreadId = 'past-present-future' | 'situation-action-outcome' | 'love-connection';

const TAROT_SPREADS: Record<TarotSpreadId, {
  id: TarotSpreadId;
  title: string;
  subtitle: string;
  icon: string;
  positions: [string, string, string];
  meanings: [string, string, string];
}> = {
  'past-present-future': {
    id: 'past-present-future',
    title: 'Past • Present • Future',
    subtitle: 'Classic timeline spread for where you came from, what is active now, and what is forming next.',
    icon: 'timeline-clock-outline',
    positions: ['Past', 'Present', 'Future'],
    meanings: ['Root pattern behind the situation', 'Current energy and lesson', 'Likely direction if the path continues'],
  },
  'situation-action-outcome': {
    id: 'situation-action-outcome',
    title: 'Situation • Action • Outcome',
    subtitle: 'Decision spread for a real choice: what is happening, what to do, and what follows.',
    icon: 'compass-outline',
    positions: ['Situation', 'Action', 'Outcome'],
    meanings: ['The true shape of the problem', 'The clean next move', 'The likely result of that move'],
  },
  'love-connection': {
    id: 'love-connection',
    title: 'You • Them • Connection',
    subtitle: 'Relationship spread for your energy, their energy, and the bond between you.',
    icon: 'heart-outline',
    positions: ['You', 'Them', 'Connection'],
    meanings: ['Your emotional pattern', 'Their visible/hidden energy', 'How the connection behaves right now'],
  },
};

export default function TarotReadingScreen({
  answers,
  zodiacIndex,
  onBack,
  onSendToChat,
  onUpdateCredits,
}: TarotReadingScreenProps) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<TarotStep>('intro');
  const [shuffledDeck, setShuffledDeck] = useState<TarotCard[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]); // Indices in the fanned deck
  const [selectedSpreadId, setSelectedSpreadId] = useState<TarotSpreadId>('past-present-future');
  const [activeDetailTab, setActiveDetailTab] = useState<number>(1); // 0: Past, 1: Present, 2: Future (default to Present)
  const [revealedCards, setRevealedCards] = useState<boolean[]>([false, false, false]); // Flips

  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [shareModalData, setShareModalData] = useState<ShareCardData | null>(null);

  // Animation References (5 cards for dynamic pentagonal shuffling)
  const shuffleAnims = useRef([
    new Animated.ValueXY({ x: 0, y: 0 }),
    new Animated.ValueXY({ x: 0, y: 0 }),
    new Animated.ValueXY({ x: 0, y: 0 }),
    new Animated.ValueXY({ x: 0, y: 0 }),
    new Animated.ValueXY({ x: 0, y: 0 })
  ]).current;
  const fanAnim = useRef(new Animated.Value(0)).current;

  // Card drawing animation positions (moving to Past, Present, Future slots)
  const drawAnims = useRef(
    Array.from({ length: 3 }).map(() => new Animated.ValueXY({ x: 0, y: 0 }))
  ).current;
  const drawScales = useRef(
    Array.from({ length: 3 }).map(() => new Animated.Value(1))
  ).current;

  // 3D Card Flip Animation Values
  const flipAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0)
  ]).current;

  const [shuffleStatus, setShuffleStatus] = useState('Concentrate on your query...');
  const selectedSpread = TAROT_SPREADS[selectedSpreadId];

  useEffect(() => {
    resetReading();
  }, []);

  const resetReading = () => {
    const tempDeck = [...TAROT_DECK].sort(() => Math.random() - 0.5);
    setShuffledDeck(tempDeck);
    setSelectedIndices([]);
    setRevealedCards([false, false, false]);
    setStep('intro');
    setActiveDetailTab(1);
    fanAnim.setValue(0);

    shuffleAnims.forEach(anim => anim.setValue({ x: 0, y: 0 }));
    drawAnims.forEach(anim => anim.setValue({ x: 0, y: 0 }));
    drawScales.forEach(anim => anim.setValue(1));
    flipAnims.forEach(anim => anim.setValue(0));
  };

  const startShuffling = async () => {
    setStep('shuffling');
    setShuffleStatus(`Aligning the ${selectedSpread.title} spread...`);

    // Start fetching cards in parallel with shuffle animation
    let fetchedCards: TarotCard[] | null = null;
    const fetchPromise = fetch('https://tarotapi.dev/api/v1/cards/random?n=9')
      .then(res => {
        if (!res.ok) throw new Error('API failed');
        return res.json();
      })
      .then(data => {
        if (data && Array.isArray(data.cards)) {
          fetchedCards = data.cards.map((c: any, idx: number) => {
            const isReversed = Math.random() < 0.3;
            let suitColor = '#7209B7';
            let suitElement = 'Ether';
            let suitPlanet = 'Jupiter';
            if (c.suit === 'wands') { suitColor = '#E5484D'; suitElement = 'Fire'; suitPlanet = 'Sun'; }
            else if (c.suit === 'cups') { suitColor = '#3B82F6'; suitElement = 'Water'; suitPlanet = 'Moon'; }
            else if (c.suit === 'swords') { suitColor = '#12A594'; suitElement = 'Air'; suitPlanet = 'Saturn'; }
            else if (c.suit === 'pentacles') { suitColor = '#CA8A04'; suitElement = 'Earth'; suitPlanet = 'Mercury'; }

            return {
              id: idx,
              name: c.name,
              name_short: c.name_short,
              numeral: c.value || String(c.value_int || idx),
              planet: suitPlanet,
              element: suitElement,
              keywords: [c.meaning_up?.split(',')[0] || 'Mystical', 'Clarity'],
              description: c.desc || 'A mystical tarot card.',
              color: suitColor,
              pastReading: isReversed ? c.meaning_rev || c.meaning_up : c.meaning_up,
              presentReading: isReversed ? c.meaning_rev || c.meaning_up : c.meaning_up,
              futureReading: isReversed ? c.meaning_rev || c.meaning_up : c.meaning_up,
              is_reversed: isReversed,
              meaning_up: c.meaning_up || '',
              meaning_rev: c.meaning_rev || ''
            };
          });
        }
      })
      .catch(err => {
        console.log('Error fetching tarot deck:', err);
      });

    const duration = 400;

    const makeShuffleSequence = (animXY: Animated.ValueXY, index: number) => {
      const angle = (index * 2.0 * Math.PI) / 5.0;
      const xOut = Math.cos(angle) * 110;
      const yOut = Math.sin(angle) * 70;

      return Animated.sequence([
        Animated.timing(animXY, {
          toValue: { x: xOut, y: yOut },
          duration: duration,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(animXY, {
          toValue: { x: -xOut * 0.8, y: -yOut * 0.8 },
          duration: duration,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(animXY, {
          toValue: { x: 0, y: 0 },
          duration: duration,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(animXY, {
          toValue: { x: xOut * 0.4, y: yOut * 0.3 },
          duration: duration - 100,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(animXY, {
          toValue: { x: 0, y: 0 },
          duration: duration - 100,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        })
      ]);
    };

    const animations = shuffleAnims.map((anim, idx) => makeShuffleSequence(anim, idx));

    Animated.parallel(animations).start(async () => {
      try {
        await fetchPromise;
        if (fetchedCards && fetchedCards.length === 9) {
          setShuffledDeck(fetchedCards);
          setStep('spread');
          Animated.timing(fanAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.out(Easing.back(1.15)),
            useNativeDriver: true,
          }).start();
        } else {
          throw new Error('Failed to retrieve full tarot deck from API');
        }
      } catch (err: any) {
        console.log('[Tarot Reading Screen] API failed:', err);
        Alert.alert(
          'Draw Interrupted',
          'We couldn\'t connect to the tarot server. Please check your connection and try again.',
          [
            { text: 'OK' },
            { text: 'Retry', onPress: () => startShuffling() }
          ]
        );
        setStep('intro');
      }
    });

    setTimeout(() => setShuffleStatus('Assigning meaning to each position...'), 650);
    setTimeout(() => setShuffleStatus('Spreading the Arcana deck...'), 1300);
  };


  // Deselect Card handler
  const deselectCard = (slotIdx: number) => {
    if (slotIdx >= selectedIndices.length) return;
    const newSelections = selectedIndices.filter((_, idx) => idx !== slotIdx);
    setSelectedIndices(newSelections);

    // Reset animation and flip values for now-empty slots
    for (let i = newSelections.length; i < 3; i++) {
      drawAnims[i].setValue({ x: 0, y: 0 });
      drawScales[i].setValue(1);
      flipAnims[i].setValue(0);
    }
  };

  // Reveal All Cards Handler
  const revealAllCards = async () => {
    setRevealedCards([true, true, true]);
    setActiveDetailTab(1); // Stay on Present Reading by default

    // Trigger 3D Card Flip Animations for all three cards
    const animations = flipAnims.map(anim =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 600,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      })
    );
    Animated.parallel(animations).start();

    // Deduct 1 credit for performing the Tarot reading
    try {
      const res = await deductTarotCredit();
      if (res && res.success && typeof res.remaining_credits === 'number') {
        if (onUpdateCredits) {
          onUpdateCredits(res.remaining_credits);
        }
      }
    } catch (e: any) {
      console.warn('[Tarot] Failed to deduct credit on reveal:', e.message);
      Alert.alert('Cosmic Warning ⚠️', 'You have insufficient credits for this Tarot reading. Balance may be negative.');
    }
  };

  // Draw Card handler
  const drawCard = (deckIndex: number) => {
    if (selectedIndices.includes(deckIndex) || selectedIndices.length >= 3) {
      return;
    }

    const newSelections = [...selectedIndices, deckIndex];
    const slotIdx = selectedIndices.length; // 0: Past, 1: Present, 2: Future
    setSelectedIndices(newSelections);

    // Calculate displacement based on fanned out positions
    const screenCenter = width / 2;
    const cardSpacing = (width - 40) / 8;
    const initialX = 20 + deckIndex * cardSpacing - screenCenter + 20;

    drawAnims[slotIdx].setValue({ x: initialX, y: -200 });
    drawScales[slotIdx].setValue(0.5);

    Animated.parallel([
      Animated.timing(drawAnims[slotIdx], {
        toValue: { x: 0, y: 0 },
        duration: 650,
        easing: Easing.out(Easing.back(1.0)),
        useNativeDriver: true,
      }),
      Animated.timing(drawScales[slotIdx], {
        toValue: 1,
        duration: 650,
        useNativeDriver: true,
      })
    ]).start(() => {
      if (newSelections.length === 3) {
        setTimeout(() => {
          setStep('reading');
          revealAllCards();
        }, 300);
      }
    });
  };

  // Flip/Reveal Card Handler
  const flipCard = (slotIdx: number) => {
    if (revealedCards[slotIdx]) {
      setActiveDetailTab(slotIdx);
      return;
    }

    const newRevealed = [...revealedCards];
    newRevealed[slotIdx] = true;
    setRevealedCards(newRevealed);
    setActiveDetailTab(slotIdx);

    // 3D Card Flip Animation (0 to 1)
    Animated.timing(flipAnims[slotIdx], {
      toValue: 1,
      duration: 600,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const handleSendToChat = async () => {
    const selectedCardsList = selectedIndices.map(idx => shuffledDeck[idx]);
    if (selectedCardsList.length < 3) return;

    const presentCard = selectedCardsList[1];
    const spreadLines = selectedCardsList.map((card, idx) =>
      `- ${positionLabels[idx]} (${positionMeanings[idx]}): ${card.name} (${card.numeral}) ${card.is_reversed ? '(Reversed)' : ''}`
    );

    const promptText = `I drew a ${selectedSpread.title} Tarot spread:\n` +
      spreadLines.join('\n') +
      `\nCan you give me a personalized celestial reading of this spread based on my zodiac profile?`;

    const initialResponseText = `✦ ${selectedSpread.title} Tarot Reading ✦\n\n` +
      `${selectedSpread.subtitle}\n\n` +
      selectedCardsList.map((card, idx) =>
        `${idx + 1}. ${positionLabels[idx].toUpperCase()}: ${card.name} (${card.numeral}) ${card.is_reversed ? '(Reversed)' : ''}\n` +
        `   *Position meaning:* ${positionMeanings[idx]}\n` +
        `   *Cosmic Energy:* ${card.keywords.join(', ')}\n` +
        `   *Influence:* ${getPositionReading(card, idx)}`
      ).join('\n\n');

    onSendToChat(
      { id: Date.now().toString(), sender: 'user', text: promptText },
      { id: (Date.now() + 1).toString(), sender: 'ai', text: initialResponseText }
    );

    // Call live API for deep AI interpretation
    try {
      const cardRes = await interpretTarotCard({
        card_name: presentCard.name,
        is_reversed: presentCard.is_reversed || false,
        meaning_up: presentCard.meaning_up || presentCard.keywords.join(', '),
        meaning_rev: presentCard.meaning_rev || '',
        desc: getPositionReading(presentCard, 1),
        spread_id: selectedSpread.id,
        spread_title: selectedSpread.title,
        position: positionLabels[1],
        all_cards: selectedCardsList.map((c, idx) => ({
          name: c.name,
          is_reversed: c.is_reversed || false,
          position: positionLabels[idx],
          position_meaning: positionMeanings[idx],
        })),
        skipDeduction: true
      });
      const aiText = cardRes?.interpretation || cardRes?.message || cardRes?.data?.interpretation;
      if (aiText) {
        onSendToChat(
          { id: Date.now().toString(), sender: 'user', text: promptText },
          { id: (Date.now() + 2).toString(), sender: 'ai', text: `✨ AI Deep Interpretation ✨\n\n${aiText}` }
        );
      }
    } catch (err: any) {
      console.log('Live Tarot AI API error:', err);
    }
  };

  const selectedCardsList = selectedIndices.map(idx => shuffledDeck[idx]);
  const activeDetailCard = selectedCardsList[activeDetailTab];
  const positionLabels = selectedSpread.positions;
  const positionMeanings = selectedSpread.meanings;
  const getPositionReading = (card: TarotCard | undefined, idx: number) => {
    if (!card) return '';
    if (idx === 0) return card.pastReading;
    if (idx === 1) return card.presentReading;
    return card.futureReading;
  };

  // Helper to render fanned out cards back face
  const renderFannedCards = () => {
    const totalCards = shuffledDeck.length || 8;
    const cardWidth = 64;
    const spacing = (width - 40 - cardWidth) / (totalCards - 1);

    return (
      <View style={styles.fanContainer}>
        {Array.from({ length: totalCards }).map((_, idx) => {
          const isSelected = selectedIndices.includes(idx);

          const midPoint = (totalCards - 1) / 2;
          const rotationAngle = (idx - midPoint) * 5.0; // degrees
          const translateYOffset = Math.abs(idx - midPoint) * 4.0;

          const cardRotation = fanAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', `${rotationAngle}deg`],
          });

          const cardTranslateY = fanAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, translateYOffset],
          });

          const cardOpacity = fanAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          });

          if (isSelected) {
            return <View key={idx} style={{ width: cardWidth, opacity: 0 }} />;
          }

          return (
            <Animated.View
              key={idx}
              style={[
                styles.fanCardWrapper,
                {
                  left: idx * spacing,
                  transform: [
                    { rotate: cardRotation },
                    { translateY: cardTranslateY },
                  ],
                  opacity: cardOpacity,
                },
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => drawCard(idx)}
                style={styles.fanCardTouch}
              >
                <CardBackGraphic size={64} />
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    );
  };

  // Helper to render 3D-flipping dealt cards
  const renderDrawnSlot = (slotIdx: number, title: string) => {
    const isSelected = selectedIndices.length > slotIdx;
    const cardObj = isSelected ? shuffledDeck[selectedIndices[slotIdx]] : null;
    const isRevealed = revealedCards[slotIdx];

    const drawX = drawAnims[slotIdx].x;
    const drawY = drawAnims[slotIdx].y;
    const drawScale = drawScales[slotIdx];
    const flipVal = flipAnims[slotIdx];

    const backInterpolate = flipVal.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg'],
    });

    const frontInterpolate = flipVal.interpolate({
      inputRange: [0, 1],
      outputRange: ['180deg', '360deg'],
    });

    const backOpacity = flipVal.interpolate({
      inputRange: [0, 0.5, 0.51, 1],
      outputRange: [1, 1, 0, 0],
    });

    const frontOpacity = flipVal.interpolate({
      inputRange: [0, 0.5, 0.51, 1],
      outputRange: [0, 0, 1, 1],
    });

    return (
      <View style={styles.slotContainer}>
        <Text style={styles.slotTitle}>{title}</Text>

        {isSelected ? (
          <Animated.View
            style={[
              styles.cardContainer,
              {
                transform: [
                  { translateX: drawX },
                  { translateY: drawY },
                  { scale: drawScale },
                ],
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => {
                if (step === 'spread') {
                  deselectCard(slotIdx);
                } else {
                  flipCard(slotIdx);
                }
              }}
              style={styles.cardTouchable}
            >
              {/* Back side of card */}
              <Animated.View
                style={[
                  styles.cardFace,
                  styles.cardBack,
                  {
                    transform: [{ rotateY: backInterpolate }],
                    opacity: backOpacity,
                  },
                ]}
              >
                <CardBackGraphic size={100} />
              </Animated.View>

               {/* Front side of card (Premium Light Theme Card front with Gold borders) */}
              <Animated.View
                style={[
                  styles.cardFace,
                  styles.cardFront,
                  {
                    borderColor: activeDetailTab === slotIdx ? '#E2B13C' : '#E8E7ED',
                    shadowColor: activeDetailTab === slotIdx ? '#E2B13C' : '#726F8D',
                    transform: [{ rotateY: frontInterpolate }],
                    opacity: frontOpacity,
                    overflow: 'hidden',
                    borderRadius: 10,
                  },
                ]}
              >
                {cardObj && (
                  getCardImage(cardObj.name_short) ? (
                    <View style={{ flex: 1, width: '100%', height: '100%' }}>
                      <Image
                        source={{ uri: getCardImage(cardObj.name_short)! }}
                        style={{ width: '100%', height: '100%', transform: cardObj.is_reversed ? [{ rotate: '180deg' }] : [] }}
                        resizeMode="cover"
                      />
                      <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.85)']}
                        style={{
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          bottom: 0,
                          padding: 4,
                          alignItems: 'center'
                        }}
                      >
                        <Text style={{ color: '#FFFFFF', fontSize: 9, fontFamily: 'Cinzel-Bold', textAlign: 'center' }} numberOfLines={1}>
                          {cardObj.name} {cardObj.is_reversed ? '(Rev)' : ''}
                        </Text>
                      </LinearGradient>
                    </View>
                  ) : (
                    <View style={[styles.cardFrontBg, cardObj?.is_reversed ? { transform: [{ rotate: '180deg' }] } : {}]}>
                      <Text style={[styles.cardFrontNumeral, { color: cardObj?.color }]}>
                        {cardObj?.numeral}
                      </Text>

                      <View style={styles.cardFrontArt}>
                        <TarotCardSvg cardId={cardObj.id} color={cardObj.color} size={60} />
                      </View>

                      <Text style={styles.cardFrontTitle} numberOfLines={1}>
                        {cardObj?.name} {cardObj?.is_reversed ? ' (Rev)' : ''}
                      </Text>
                    </View>
                  )
                )}
              </Animated.View>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <View style={styles.emptySlot}>
            <MaterialCommunityIcons name="cards-outline" size={24} color="#B3A2E7" />
            <Text style={styles.emptySlotText}>Draw Card</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Gradient Background matching the App palette */}
      <LinearGradient
        colors={['#F3EFFF', '#E9F3FF', '#FFFDF2']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header Row matching existing screen headers */}
      <LinearGradient
        colors={['#7209B7', '#F72585']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerContainer, { paddingTop: Math.max(16, insets.top) }]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ArrowLeft size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>TAROT ARCANA</Text>
            <Text style={styles.headerSubtitle}>✦ {selectedSpread.title} ✦</Text>
          </View>
          <TouchableOpacity onPress={resetReading} style={styles.resetBtn}>
            <RotateCcw size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* STEP 1: WELCOME & SHUFFLE */}
        {step === 'intro' && (
          <View style={styles.introContainer}>
            <View style={styles.card}>
              <View style={styles.introHeader}>
                <Sparkles size={28} color="#7209B7" style={styles.decorIcon} />
                <Text style={styles.introTitle}>Consult the Sacred Cards</Text>
                <Text style={styles.introDesc}>
                  Choose a spread first. Each spread gives the three cards a different job, so the same card can speak through a different meaning.
                </Text>
              </View>

              <View style={styles.spreadSelectorBlock}>
                <Text style={styles.blockTitle}>Choose your spread</Text>
                {Object.values(TAROT_SPREADS).map(spread => {
                  const isActive = spread.id === selectedSpreadId;
                  return (
                    <TouchableOpacity
                      key={spread.id}
                      activeOpacity={0.86}
                      onPress={() => setSelectedSpreadId(spread.id)}
                      style={[styles.spreadChoice, isActive && styles.spreadChoiceActive]}
                    >
                      <View style={[styles.spreadChoiceIcon, isActive && styles.spreadChoiceIconActive]}>
                        <MaterialCommunityIcons name={spread.icon as any} size={20} color={isActive ? '#FFFFFF' : '#7209B7'} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.spreadChoiceTitle, isActive && styles.spreadChoiceTitleActive]}>{spread.title}</Text>
                        <Text style={styles.spreadChoiceDesc}>{spread.subtitle}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Pile of Cards (stacked) */}
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={startShuffling}
                style={styles.deckPileContainer}
              >
                {Array.from({ length: 5 }).map((_, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.pileCard,
                      {
                        top: idx * 4,
                        left: idx * 3,
                        transform: [{ rotate: `${(idx - 2) * 1.5}deg` }],
                        zIndex: idx,
                      },
                    ]}
                  >
                    <CardBackGraphic size={120} />
                  </View>
                ))}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.primaryBtn}
                activeOpacity={0.9}
                onPress={startShuffling}
              >
                <LinearGradient
                  colors={['#7209B7', '#F72585']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradientBtn}
                >
                  <Text style={styles.primaryBtnText}>SHUFFLE THE DECK</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* STEP 2: SHUFFLING ANIMATION */}
        {step === 'shuffling' && (
          <View style={styles.shufflingContainer}>
            <Text style={styles.shufflingStatus}>{shuffleStatus}</Text>
            <View style={styles.shufflingDeckWrap}>
              {shuffleAnims.map((anim, idx) => (
                <Animated.View
                  key={idx}
                  style={[
                    styles.shufflingCard,
                    {
                      transform: [
                        { translateX: anim.x },
                        { translateY: anim.y },
                        { rotate: `${(idx - 2) * 4}deg` },
                      ],
                      zIndex: idx,
                    },
                  ]}
                >
                  <CardBackGraphic size={110} />
                </Animated.View>
              ))}
            </View>
          </View>
        )}

        {/* STEP 3: FAN SPREAD & DRAW */}
        {step === 'spread' && (
          <View style={styles.spreadContainer}>
            <View style={styles.drawStatusHeader}>
              <Text style={styles.drawHeading}>{selectedSpread.title}</Text>
              <Text style={styles.drawSubheading}>
                Select {3 - selectedIndices.length} cards. Positions: {positionLabels.join(' • ')}.
              </Text>
            </View>

            {renderFannedCards()}

            {/* Slots showing drawing progress */}
            <View style={styles.slotsRow}>
              {renderDrawnSlot(0, positionLabels[0])}
              {renderDrawnSlot(1, positionLabels[1])}
              {renderDrawnSlot(2, positionLabels[2])}
            </View>
          </View>
        )}

        {/* STEP 4: READING ANALYSIS */}
        {step === 'reading' && (
          <View style={styles.readingContainer}>
            <View style={styles.slotsRow}>
              {renderDrawnSlot(0, positionLabels[0])}
              {renderDrawnSlot(1, positionLabels[1])}
              {renderDrawnSlot(2, positionLabels[2])}
            </View>

            {/* All cards flipped */}
            {!revealedCards.includes(false) ? (
              <View style={styles.readingAnalysisBlock}>

                {/* Detail Tabs selector */}
                <View style={styles.detailTabsRow}>
                  {positionLabels.map((lbl, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.detailTabButton,
                        activeDetailTab === idx && styles.detailTabActiveButton,
                        activeDetailTab === idx && { backgroundColor: selectedCardsList[idx]?.color + '10' }
                      ]}
                      onPress={() => setActiveDetailTab(idx)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.detailTabLabel,
                          activeDetailTab === idx && styles.detailTabActiveLabel,
                          activeDetailTab === idx && { color: selectedCardsList[idx]?.color }
                        ]}
                      >
                        {lbl}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Active Card analysis */}
                {activeDetailCard && (
                  <View style={styles.card}>
                    <View style={styles.cardHeaderInfo}>
                      <Text style={[styles.cardNumeralTag, { color: activeDetailCard.color }]}>
                        Arcana {activeDetailCard.numeral}
                      </Text>
                      <Text style={styles.cardNameTitle}>
                        {activeDetailCard.name} {activeDetailCard.is_reversed ? ' (Reversed)' : ''}
                      </Text>

                      <View style={styles.astroTagsRow}>
                        <View style={styles.astroTag}>
                          <Globe size={11} color="#7209B7" style={{ marginRight: 4 }} />
                          <Text style={styles.astroTagText}>Planet: {activeDetailCard.planet}</Text>
                        </View>
                        <View style={styles.astroTag}>
                          <Sparkles size={11} color="#7209B7" style={{ marginRight: 4 }} />
                          <Text style={styles.astroTagText}>Element: {activeDetailCard.element}</Text>
                        </View>
                      </View>
                    </View>

                    <Text style={styles.cardDescText}>{activeDetailCard.description}</Text>

                    <View style={styles.keywordsBlock}>
                      <Text style={styles.blockTitle}>Core Vibration</Text>
                      <View style={styles.keywordPillsRow}>
                        {activeDetailCard.keywords.map((kw, i) => (
                          <View key={i} style={[styles.kwPill, { borderColor: activeDetailCard.color + '30' }]}>
                            <Text style={[styles.kwPillText, { color: activeDetailCard.color }]}>{kw}</Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    <View style={styles.timelineInterpretation}>
                      <Text style={styles.blockTitle}>
                        {positionLabels[activeDetailTab]} — {positionMeanings[activeDetailTab]}
                      </Text>
                      <Text style={styles.interpretationBodyText}>
                        {getPositionReading(activeDetailCard, activeDetailTab)}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Send to chat CTA */}
                <TouchableOpacity
                  style={styles.chatActionBtn}
                  activeOpacity={0.9}
                  onPress={handleSendToChat}
                >
                  <LinearGradient
                    colors={['#7209B7', '#F72585']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientBtn}
                  >
                    <Sparkles size={16} color="#FFF" style={{ marginRight: 8 }} />
                    <Text style={styles.primaryBtnText}>Ask AstroAi4u about this spread</Text>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Share Tarot Reading Card Button */}
                <TouchableOpacity
                  style={[styles.chatActionBtn, { marginTop: 10 }]}
                  activeOpacity={0.9}
                  onPress={() => {
                    const centerCard = selectedCardsList[1];
                    setShareModalData({
                      category: 'TAROT READING',
                      title: `${selectedSpread.title} Insight`,
                      subtitle: `${centerCard?.name || positionLabels[1]} (${centerCard?.numeral || 'Arcana'})`,
                      readingText: getPositionReading(centerCard, 1) || activeDetailCard?.description || selectedSpread.subtitle,
                      highlights: selectedCardsList.map((card, idx) => ({
                        label: `${positionLabels[idx]} Card`,
                        value: card?.name || 'Drawn',
                      })),
                    });
                    setShareModalVisible(true);
                  }}
                >
                  <LinearGradient
                    colors={['#D946EF', '#8B5CF6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradientBtn}
                  >
                    <Share2 size={16} color="#FFF" style={{ marginRight: 8 }} />
                    <Text style={styles.primaryBtnText}>Share Tarot Reading Card</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : (
              // Prompt to flip remaining cards
              <View style={styles.flipPromptCard}>
                <Sparkles size={20} color="#7209B7" style={{ marginBottom: 6 }} />
                <Text style={styles.flipPromptText}>
                  Reveal the drawn cards by tapping them to decode their celestial readings.
                </Text>
              </View>
            )}

          </View>
        )}

      </ScrollView>

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
  },
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
  },
  backButton: {
    padding: 6,
  },
  resetBtn: {
    padding: 6,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  headerSubtitle: {
    fontFamily: 'Cinzel',
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
    fontWeight: '600',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },

  // INTRO STEP
  introContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(114, 111, 141, 0.08)',
    shadowColor: '#726F8D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    alignItems: 'center',
  },
  introHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  decorIcon: {
    marginBottom: 8,
  },
  introTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 18,
    color: '#2C2B3D',
    textAlign: 'center',
    marginBottom: 8,
  },
  introDesc: {
    fontFamily: 'SourceSerif4',
    fontSize: 13,
    color: '#726F8D',
    textAlign: 'center',
    lineHeight: 19,
  },
  spreadSelectorBlock: {
    width: '100%',
    marginBottom: 22,
  },
  spreadChoice: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    padding: 13,
    marginTop: 10,
    backgroundColor: '#F8F5FF',
    borderWidth: 1,
    borderColor: 'rgba(114, 111, 141, 0.10)',
  },
  spreadChoiceActive: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(114, 9, 183, 0.28)',
    shadowColor: '#7209B7',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 2,
  },
  spreadChoiceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(114, 9, 183, 0.10)',
  },
  spreadChoiceIconActive: {
    backgroundColor: '#7209B7',
  },
  spreadChoiceTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 12,
    color: '#2C2B3D',
    marginBottom: 3,
  },
  spreadChoiceTitleActive: {
    color: '#7209B7',
  },
  spreadChoiceDesc: {
    fontFamily: 'SourceSerif4',
    fontSize: 11,
    lineHeight: 15,
    color: '#726F8D',
  },
  deckPileContainer: {
    width: 130,
    height: 195,
    marginBottom: 40,
    position: 'relative',
  },
  pileCard: {
    position: 'absolute',
    width: 120,
    height: 185,
    borderRadius: 10,
    shadowColor: '#726F8D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryBtn: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#7209B7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  gradientBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    width: '100%',
  },
  primaryBtnText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 12,
    color: '#FFFFFF',
    letterSpacing: 1.0,
  },

  // SHUFFLING STEP
  shufflingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  shufflingStatus: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 14,
    color: '#7209B7',
    textAlign: 'center',
    marginBottom: 50,
    letterSpacing: 0.5,
  },
  shufflingDeckWrap: {
    width: 120,
    height: 185,
    position: 'relative',
  },
  shufflingCard: {
    position: 'absolute',
    width: 110,
    height: 170,
    borderRadius: 10,
    shadowColor: '#726F8D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  // SPREAD STEP
  spreadContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    alignItems: 'center',
  },
  drawStatusHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  drawHeading: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 18,
    color: '#2C2B3D',
    marginBottom: 4,
  },
  drawSubheading: {
    fontFamily: 'SourceSerif4',
    fontSize: 13,
    color: '#726F8D',
    textAlign: 'center',
  },
  fanContainer: {
    width: '100%',
    height: 230,
    position: 'relative',
    marginBottom: 24,
  },
  fanCardWrapper: {
    position: 'absolute',
    width: 64,
    height: 100,
    borderRadius: 6,
    shadowColor: '#726F8D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  fanCardTouch: {
    width: '100%',
    height: '100%',
  },

  // SLOTS ROW
  slotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  slotContainer: {
    alignItems: 'center',
    width: (width - 60) / 3,
  },
  slotTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 10,
    color: '#7209B7',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  emptySlot: {
    width: '100%',
    height: 145,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(114, 9, 183, 0.18)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  emptySlotText: {
    fontFamily: 'Cinzel',
    fontSize: 9,
    color: '#726F8D',
    marginTop: 4,
  },
  cardContainer: {
    width: '100%',
    height: 145,
  },
  cardTouchable: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  cardFace: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    borderRadius: 10,
    backfaceVisibility: 'hidden',
  },
  cardBack: {
    zIndex: 1,
  },
  cardFront: {
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    zIndex: 0,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  cardFrontBg: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  cardFrontNumeral: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 11,
    opacity: 0.9,
  },
  cardFrontArt: {
    marginVertical: 2,
  },
  cardFrontTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 9,
    color: '#2C2B3D',
    textAlign: 'center',
  },

  // READING ANALYSIS STEP
  readingContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    alignItems: 'center',
  },
  flipPromptCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(114, 111, 141, 0.08)',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    width: '100%',
    marginTop: 6,
    shadowColor: '#726F8D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  flipPromptText: {
    fontFamily: 'SourceSerif4',
    fontSize: 13,
    color: '#726F8D',
    textAlign: 'center',
    lineHeight: 18,
  },
  readingAnalysisBlock: {
    width: '100%',
    marginTop: 6,
  },
  detailTabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: 'rgba(114, 111, 141, 0.04)',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(114, 111, 141, 0.08)',
  },
  detailTabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 9,
    marginHorizontal: 2,
  },
  detailTabActiveButton: {
    shadowColor: '#726F8D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  detailTabLabel: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 10,
    color: '#726F8D',
  },
  detailTabActiveLabel: {
    fontWeight: 'bold',
  },
  cardHeaderInfo: {
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(114, 111, 141, 0.08)',
    paddingBottom: 14,
    marginBottom: 14,
    width: '100%',
  },
  cardNumeralTag: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: 2,
  },
  cardNameTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 20,
    color: '#2C2B3D',
    marginBottom: 8,
    textAlign: 'center',
  },
  astroTagsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  astroTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(114, 9, 183, 0.04)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  astroTagText: {
    fontFamily: 'Cinzel',
    fontSize: 9,
    color: '#7209B7',
  },
  cardDescText: {
    fontFamily: 'SourceSerif4',
    fontSize: 13,
    color: '#726F8D',
    lineHeight: 19,
    marginBottom: 16,
  },
  keywordsBlock: {
    marginBottom: 16,
    width: '100%',
  },
  blockTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 11,
    color: '#D9730D',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  keywordPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  kwPill: {
    borderWidth: 1,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 6,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  kwPillText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 9,
  },
  timelineInterpretation: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(114, 111, 141, 0.08)',
    paddingTop: 14,
    width: '100%',
  },
  interpretationBodyText: {
    fontFamily: 'SourceSerif4',
    fontSize: 13.5,
    color: '#2C2B3D',
    lineHeight: 19.5,
  },
  chatActionBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 16,
    marginBottom: 10,
    shadowColor: '#F72585',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
    width: '100%',
  },
});
