import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Animated,
  Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Flame,
  Share2,
  Sparkles,
  CheckCircle,
  X,
  PlusCircle,
  AlertTriangle,
  Clock,
  Info,
  Calendar,
  Shirt,
  Send,
  Compass,
  Palette,
  Hash,
  CloudSun,
  Heart,
  Briefcase,
  HelpCircle,
  ChevronRight
} from 'lucide-react-native';
import { RASHI_GLYPHS } from '../../constants/astrology';
import { useTheme } from '../../theme';

interface TodayScreenProps {
  userName: string;
  streak: number;
  zodiac: { name: string; index: number; element: string; elementIcon: any; planet: string } | null;
  activeFocus: 'Work' | 'Love' | 'Mind' | 'Money';
  setActiveFocus: (focus: 'Work' | 'Love' | 'Mind' | 'Money') => void;
  selectedMove: string | null;
  setSelectedMove: (move: string | null) => void;
  outcomeFeedback: Record<string, 'Happened' | 'Didnt' | null>;
  setOutcomeFeedback: React.Dispatch<React.SetStateAction<Record<string, 'Happened' | 'Didnt' | null>>>;
  dailyDecision: any;
  activeData: {
    prediction: string;
    rationale: string;
    title: string;
    moves: string[];
    doList: string[];
    avoidList: string[];
    powerWindow: string;
    avoidAfter: string;
  };
  isTodayLoading: boolean;
  insets: { bottom: number; top: number; left: number; right: number };
  triggerShareCard: (data: any) => void;
  handleOpenStyleForecaster: () => void;
  setCurrentView: (view: string) => void;
  haptic: { press: () => void; success: () => void; light?: () => void };
  getGreeting: () => string;
  onAskOracle?: (question: string) => void;
}

// Zodiac attributes dictionary for lucky metrics & planetary weather
const ZODIAC_ATTRIBUTES: Record<string, {
  luckyColor: string;
  luckyColorHex: string;
  luckyNumbers: string;
  luckyDirection: string;
  rulingPlanet: string;
  weatherVibe: string;
}> = {
  Aries:       { luckyColor: 'Coral Red',    luckyColorHex: '#EF4444', luckyNumbers: '9, 18, 27', luckyDirection: 'East',       rulingPlanet: 'Mars',    weatherVibe: 'High Energy & Spark' },
  Taurus:      { luckyColor: 'Emerald Green',luckyColorHex: '#10B981', luckyNumbers: '6, 15, 24', luckyDirection: 'South',      rulingPlanet: 'Venus',   weatherVibe: 'Grounded & Sensual' },
  Gemini:      { luckyColor: 'Golden Yellow',luckyColorHex: '#F59E0B', luckyNumbers: '5, 14, 23', luckyDirection: 'North',      rulingPlanet: 'Mercury', weatherVibe: 'Brisk & Communicative' },
  Cancer:      { luckyColor: 'Pearl Silver', luckyColorHex: '#CBD5E1', luckyNumbers: '2, 7, 11',  luckyDirection: 'North-West', rulingPlanet: 'Moon',    weatherVibe: 'Deeply Intuitive' },
  Leo:         { luckyColor: 'Royal Gold',   luckyColorHex: '#EAB308', luckyNumbers: '1, 10, 19', luckyDirection: 'East',       rulingPlanet: 'Sun',     weatherVibe: 'Radiant & Sovereign' },
  Virgo:       { luckyColor: 'Pastel Mint',  luckyColorHex: '#14B8A6', luckyNumbers: '5, 14, 23', luckyDirection: 'North',      rulingPlanet: 'Mercury', weatherVibe: 'Clear & Methodical' },
  Libra:       { luckyColor: 'Rose Lavender',luckyColorHex: '#EC4899', luckyNumbers: '6, 15, 24', luckyDirection: 'West',       rulingPlanet: 'Venus',   weatherVibe: 'Harmonious & Magnetic' },
  Scorpio:     { luckyColor: 'Deep Crimson', luckyColorHex: '#991B1B', luckyNumbers: '9, 18, 27', luckyDirection: 'North-East', rulingPlanet: 'Pluto',   weatherVibe: 'Transformative & Keen' },
  Sagittarius: { luckyColor: 'Royal Purple', luckyColorHex: '#8B5CF6', luckyNumbers: '3, 12, 21', luckyDirection: 'East',       rulingPlanet: 'Jupiter', weatherVibe: 'Expansive & Optimistic' },
  Capricorn:   { luckyColor: 'Forest Green', luckyColorHex: '#065F46', luckyNumbers: '8, 17, 26', luckyDirection: 'South',      rulingPlanet: 'Saturn',  weatherVibe: 'Disciplined & Resolute' },
  Aquarius:    { luckyColor: 'Electric Cyan',luckyColorHex: '#06B6D4', luckyNumbers: '4, 11, 22', luckyDirection: 'West',       rulingPlanet: 'Uranus',  weatherVibe: 'Visionary & Electric' },
  Pisces:      { luckyColor: 'Aquamarine',   luckyColorHex: '#38BDF8', luckyNumbers: '7, 16, 25', luckyDirection: 'North-East', rulingPlanet: 'Neptune', weatherVibe: 'Mystical & Dreamy' },
};

export function TodayScreen({
  userName,
  streak,
  zodiac,
  activeFocus,
  setActiveFocus,
  selectedMove,
  setSelectedMove,
  outcomeFeedback,
  setOutcomeFeedback,
  dailyDecision,
  activeData,
  isTodayLoading,
  insets,
  triggerShareCard,
  handleOpenStyleForecaster,
  setCurrentView,
  haptic,
  getGreeting,
  onAskOracle,
}: TodayScreenProps) {
  const { isDark } = useTheme();
  const { width, height } = Dimensions.get('window');
  const [todayDeckH, setTodayDeckH] = useState(0);
  const [todayCard, setTodayCard] = useState(0);
  const [customQuestion, setCustomQuestion] = useState('');
  const todayScrollX = useRef(new Animated.Value(0)).current;
  const todayScrollRef = useRef<any>(null);

  const zodiacName = zodiac?.name || 'Aries';
  const zodiacAttrs = ZODIAC_ATTRIBUTES[zodiacName] || ZODIAC_ATTRIBUTES.Aries;

  const focusMeta: Record<string, { icon: any; color: string; label: string }> = {
    Work:  { icon: 'briefcase-outline', color: '#7209B7', label: 'Career' },
    Love:  { icon: 'heart-outline',     color: '#F72585', label: 'Love' },
    Mind:  { icon: 'brain',             color: '#03B07A', label: 'Mind' },
    Money: { icon: 'cash-multiple',     color: '#D9730D', label: 'Money' },
  };

  const accent = focusMeta[activeFocus]?.color || '#7209B7';
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  const CARD_COUNT = 4;
  const NAV_SPACE = 84 + insets.bottom;
  const usableH = Math.max((todayDeckH || (height - NAV_SPACE - 24)), 400);
  const GAP = 14;
  const CW = Math.round(width * 0.88);
  const SNAP = CW + GAP;
  const sidePad = Math.round((width - CW) / 2);
  const pageStyle = { width: CW, height: usableH, marginRight: GAP } as const;

  const sheetStyle = {
    flex: 1,
    borderRadius: 28,
    backgroundColor: isDark ? 'rgba(22, 19, 41, 0.85)' : '#FFFFFF',
    borderWidth: 1.5,
    borderColor: isDark ? 'rgba(168, 85, 247, 0.22)' : 'rgba(114, 111, 141, 0.12)',
    shadowColor: isDark ? '#000000' : '#2C2B3D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: isDark ? 0.35 : 0.08,
    shadowRadius: 18,
    elevation: 4,
    overflow: 'hidden'
  } as const;

  const cardArc = (i: number) => {
    const c = i * SNAP;
    const inputRange = [c - SNAP, c - SNAP / 2, c, c + SNAP / 2, c + SNAP];
    const opts = { extrapolate: 'clamp' as const };
    return {
      opacity: todayScrollX.interpolate({ inputRange, outputRange: [0.60, 0.88, 1, 0.88, 0.60], ...opts }),
      transform: [
        { scale: todayScrollX.interpolate({ inputRange, outputRange: [0.93, 0.97, 1, 0.97, 0.93], ...opts }) },
        { translateY: todayScrollX.interpolate({ inputRange, outputRange: [12, 3, 0, 3, 12], ...opts }) },
      ],
    };
  };

  const handleAskQuickQuestion = (question: string) => {
    haptic.press();
    if (onAskOracle) {
      onAskOracle(question);
    }
  };

  const handleCustomQuestionSubmit = () => {
    const q = customQuestion.trim();
    if (!q) return;
    Keyboard.dismiss();
    setCustomQuestion('');
    if (onAskOracle) {
      onAskOracle(q);
    }
  };

  const shareCurrentStory = (cardIndex: number) => {
    haptic.press();
    if (cardIndex === 0) {
      triggerShareCard({
        category: 'DAILY HOROSCOPE STORY',
        title: `${zodiacName} Daily Cosmic Story`,
        subtitle: dateStr,
        readingText: dailyDecision?.hook || `The cosmos aligns with power for ${zodiacName}. Lucky Color: ${zodiacAttrs.luckyColor}, Lucky Number: ${zodiacAttrs.luckyNumbers}.`,
        highlights: [
          { label: 'Zodiac', value: zodiacName },
          { label: 'Lucky Color', value: zodiacAttrs.luckyColor },
          { label: 'Lucky Numbers', value: zodiacAttrs.luckyNumbers },
          { label: 'Power Time', value: activeData?.powerWindow || 'Morning' },
        ],
      });
    } else if (cardIndex === 1) {
      triggerShareCard({
        category: 'TODAY\'S LIFE PREDICTION',
        title: `What Will Happen In My Life Today`,
        subtitle: `${zodiacName} · ${activeFocus} Focus`,
        readingText: activeData.prediction,
        highlights: [
          { label: 'Zodiac', value: zodiacName },
          { label: 'Focus', value: activeFocus },
          { label: 'Transit Insight', value: activeData.rationale },
          { label: 'Mood Signal', value: dailyDecision?.signals?.emotion || 'Balanced' },
        ],
      });
    } else if (cardIndex === 2) {
      triggerShareCard({
        category: 'STRATEGIC MOVE OF THE DAY',
        title: `My Cosmic Strategy for ${activeFocus}`,
        subtitle: dateStr,
        readingText: selectedMove || activeData.moves[0] || 'Align your actions with natural celestial flow.',
        highlights: [
          { label: 'Zodiac', value: zodiacName },
          { label: 'Focus Area', value: activeFocus },
          { label: 'Strategy', value: 'High Momentum' },
          { label: 'Power Window', value: activeData.powerWindow },
        ],
      });
    } else {
      triggerShareCard({
        category: 'DAILY GUIDANCE & TIMING',
        title: `Cosmic Guidance & Timing`,
        subtitle: `${zodiacName} · ${dateStr}`,
        readingText: `Power Window: ${activeData.powerWindow} | Do: ${activeData.doList[0] || 'Stay grounded'} | Avoid: ${activeData.avoidList[0] || 'Overcommitting'}`,
        highlights: [
          { label: 'Power Window', value: activeData.powerWindow },
          { label: 'Caution After', value: activeData.avoidAfter },
          { label: 'Top Priority', value: activeData.doList[0] || 'Focus' },
          { label: 'Avoid', value: activeData.avoidList[0] || 'Distractions' },
        ],
      });
    }
  };

  return (
    <View style={{ flex: 1, paddingTop: 4 }} onLayout={e => { const h = e.nativeEvent.layout.height; if (h && Math.abs(h - todayDeckH) > 1) setTodayDeckH(h); }}>
      <Animated.ScrollView
        ref={todayScrollRef}
        horizontal
        pagingEnabled={false}
        snapToInterval={SNAP}
        snapToAlignment="start"
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: sidePad, alignItems: 'center' }}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: todayScrollX } } }], { useNativeDriver: true })}
        onMomentumScrollEnd={e => setTodayCard(Math.round(e.nativeEvent.contentOffset.x / SNAP))}
      >
        {/* ══════════════════════════════════════════════════════════
            CARD 1 · Complete Daily Horoscope, Lucky Metrics & Oracle
           ══════════════════════════════════════════════════════════ */}
        <Animated.View style={[pageStyle, cardArc(0)]}>
          <LinearGradient
            colors={isDark ? ['#1A0B2E', '#2D124D', '#4A154B'] : ['#1E0D3A', '#381463', '#681375']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={{ flex: 1, borderRadius: 28, overflow: 'hidden', padding: 18, justifyContent: 'space-between', borderWidth: 1.5, borderColor: isDark ? 'rgba(168, 85, 247, 0.35)' : 'rgba(255,255,255,0.2)' }}
          >
            <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled contentContainerStyle={{ paddingBottom: 10 }}>
              {/* Top Header: Greeting, Streak & Story Share */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: 'SourceSerif4', fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>{getGreeting()}</Text>
                  <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 20, color: '#FFFFFF', marginTop: 1 }} numberOfLines={1}>{userName}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  {streak > 0 && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: 12, paddingHorizontal: 9, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)' }}>
                      <Flame size={13} color="#FFD27A" />
                      <Text style={{ fontFamily: 'SourceSerif4-Bold', fontSize: 12, color: '#FFFFFF', marginLeft: 4 }}>{streak}</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={{ backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 12, padding: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' }}
                    onPress={() => shareCurrentStory(0)}
                    activeOpacity={0.8}
                  >
                    <Share2 size={15} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Zodiac Sigil & Daily Hook */}
              <View style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 20, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)', shadowColor: '#FFD700', shadowOpacity: 0.3, shadowRadius: 10 }}>
                    <Text style={{ fontSize: 26, color: '#FFFFFF' }}>{RASHI_GLYPHS[(zodiac?.index || 1) - 1]}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 17, color: '#FFFFFF' }}>{zodiacName} Daily</Text>
                      <View style={{ backgroundColor: 'rgba(255,215,0,0.25)', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8, borderWidth: 0.5, borderColor: '#FFD700' }}>
                        <Text style={{ fontFamily: 'SourceSerif4-Bold', fontSize: 9.5, color: '#FFD700' }}>{zodiacAttrs.rulingPlanet}</Text>
                      </View>
                    </View>
                    <Text style={{ fontFamily: 'SourceSerif4', fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>{dateStr} • {zodiacAttrs.weatherVibe}</Text>
                  </View>
                </View>
                <Text style={{ fontFamily: 'SourceSerif4', fontSize: 13, color: 'rgba(255,255,255,0.95)', marginTop: 10, lineHeight: 19, fontStyle: 'italic' }}>
                  “{dailyDecision?.hook || `The stars ignite exceptional personal magnetism and clear strategic direction for ${zodiacName} today.`}”
                </Text>
              </View>

              {/* Lucky Metrics Grid */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                <View style={{ flex: 1, minWidth: '47%', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: zodiacAttrs.luckyColorHex, borderWidth: 1.5, borderColor: '#FFFFFF' }} />
                    <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 9.5, color: 'rgba(255,255,255,0.7)' }}>LUCKY COLOR</Text>
                  </View>
                  <Text style={{ fontFamily: 'SourceSerif4-Bold', fontSize: 12.5, color: '#FFFFFF', marginTop: 4 }}>{zodiacAttrs.luckyColor}</Text>
                </View>

                <View style={{ flex: 1, minWidth: '47%', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <Hash size={12} color="#FFD700" />
                    <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 9.5, color: 'rgba(255,255,255,0.7)' }}>LUCKY NUMBERS</Text>
                  </View>
                  <Text style={{ fontFamily: 'SourceSerif4-Bold', fontSize: 12.5, color: '#FFD700', marginTop: 4 }}>{zodiacAttrs.luckyNumbers}</Text>
                </View>

                <View style={{ flex: 1, minWidth: '47%', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <Compass size={12} color="#38BDF8" />
                    <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 9.5, color: 'rgba(255,255,255,0.7)' }}>LUCKY DIRECTION</Text>
                  </View>
                  <Text style={{ fontFamily: 'SourceSerif4-Bold', fontSize: 12.5, color: '#FFFFFF', marginTop: 4 }}>{zodiacAttrs.luckyDirection}</Text>
                </View>

                <View style={{ flex: 1, minWidth: '47%', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <Clock size={12} color="#03B07A" />
                    <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 9.5, color: 'rgba(255,255,255,0.7)' }}>PEAK WINDOW</Text>
                  </View>
                  <Text style={{ fontFamily: 'SourceSerif4-Bold', fontSize: 12, color: '#03B07A', marginTop: 4 }}>{activeData.powerWindow}</Text>
                </View>
              </View>

              {/* 1. Astro Calendar Quick Link Button */}
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,215,0,0.15)', borderRadius: 16, paddingVertical: 11, paddingHorizontal: 14, borderWidth: 1.2, borderColor: 'rgba(255,215,0,0.4)', marginBottom: 12 }}
                activeOpacity={0.8}
                onPress={() => { haptic.press(); setCurrentView('astro-calendar'); }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: '#FFD700', alignItems: 'center', justifyContent: 'center' }}>
                    <Calendar size={16} color="#1F0C3B" />
                  </View>
                  <View>
                    <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 12, color: '#FFD700' }}>Astro Calendar & Phases</Text>
                    <Text style={{ fontFamily: 'SourceSerif4', fontSize: 10.5, color: 'rgba(255,255,255,0.8)' }}>View planetary transits, add & edit day notes</Text>
                  </View>
                </View>
                <ChevronRight size={16} color="#FFD700" />
              </TouchableOpacity>

              {/* 2. Preset Quick Questions */}
              <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 10, color: 'rgba(255,255,255,0.75)', letterSpacing: 1, marginBottom: 8 }}>PRESET QUESTIONS FOR TODAY</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                {[
                  { label: '🌦️ Planetary Weather', q: `What is the planetary weather and cosmic energy for ${zodiacName} today?` },
                  { label: '👗 What to Wear', q: `Based on my astrology and lucky colors (${zodiacAttrs.luckyColor}), what outfit should I wear today?` },
                  { label: '💼 Career Move', q: `What is the single biggest career or financial opportunity for me today?` },
                  { label: '💖 Love & Chemistry', q: `What does my romantic and relationship horoscope look like today?` },
                ].map((chip, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={{ backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 18, paddingVertical: 6, paddingHorizontal: 11, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}
                    activeOpacity={0.75}
                    onPress={() => handleAskQuickQuestion(chip.q)}
                  >
                    <Text style={{ fontFamily: 'SourceSerif4-Bold', fontSize: 11, color: '#FFFFFF' }}>{chip.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* 3. Interactive Asking Bar for Oracle / Hope */}
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' }}>
                <Sparkles size={15} color="#FFD27A" style={{ marginRight: 8 }} />
                <TextInput
                  style={{ flex: 1, fontFamily: 'SourceSerif4', fontSize: 12.5, color: '#FFFFFF', paddingVertical: 8 }}
                  placeholder="Ask Oracle / Hope about your day…"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={customQuestion}
                  onChangeText={setCustomQuestion}
                  onSubmitEditing={handleCustomQuestionSubmit}
                  returnKeyType="send"
                />
                <TouchableOpacity
                  style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#A855F7', alignItems: 'center', justifyContent: 'center', opacity: customQuestion.trim() ? 1 : 0.5 }}
                  onPress={handleCustomQuestionSubmit}
                  disabled={!customQuestion.trim()}
                  activeOpacity={0.8}
                >
                  <Send size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </ScrollView>
          </LinearGradient>
        </Animated.View>

        {/* ══════════════════════════════════════════════════════════
            CARD 2 · Forecast & Prediction Story Card
           ══════════════════════════════════════════════════════════ */}
        <Animated.View style={[pageStyle, cardArc(1)]}>
          <View style={[sheetStyle, { padding: 20, justifyContent: 'space-between' }]}>
            <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled>
              {/* Header with Focus Badge & Share */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <View style={{ backgroundColor: `${accent}18`, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1, borderColor: `${accent}40` }}>
                  <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 10.5, color: accent }}>{activeFocus.toUpperCase()} FORECAST</Text>
                </View>
                <TouchableOpacity
                  style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(114,111,141,0.08)', borderRadius: 10, padding: 7 }}
                  onPress={() => shareCurrentStory(1)}
                  activeOpacity={0.8}
                >
                  <Share2 size={15} color={isDark ? '#FFFFFF' : '#2C2B3D'} />
                </TouchableOpacity>
              </View>

              <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 20, color: isDark ? '#F0EEFF' : '#2C2B3D', lineHeight: 26 }}>What Will Happen Today</Text>
              <View style={{ height: 3, width: 36, backgroundColor: accent, borderRadius: 2, marginVertical: 12 }} />

              {/* Main Prediction Quote Box */}
              <View style={{ backgroundColor: isDark ? 'rgba(168, 85, 247, 0.12)' : 'rgba(114, 9, 183, 0.05)', borderRadius: 18, padding: 16, borderLeftWidth: 3.5, borderLeftColor: accent, marginBottom: 14 }}>
                <Text style={{ fontFamily: 'SourceSerif4', fontSize: 15, color: isDark ? '#F0EEFF' : '#2C2B3D', lineHeight: 22, fontStyle: 'italic' }}>
                  “{activeData.prediction}”
                </Text>
              </View>

              {/* Rationale Insight */}
              <View style={{ backgroundColor: isDark ? '#1F1B38' : '#F8F7FC', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: isDark ? 'rgba(168, 85, 247, 0.15)' : 'rgba(114, 111, 141, 0.08)', marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <Sparkles size={13} color={accent} />
                  <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 11, color: accent }}>ASTROLOGICAL RATIONALE</Text>
                </View>
                <Text style={{ fontFamily: 'SourceSerif4', fontSize: 12.5, color: isDark ? '#9E9BB3' : '#726F8D', lineHeight: 18 }}>
                  {activeData.rationale}
                </Text>
              </View>

              {/* Resonance Feedback */}
              <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 10, color: isDark ? '#9E9BB3' : '#726F8D', textAlign: 'center', marginBottom: 8, letterSpacing: 1 }}>DID THIS PREDICTION RESONATE?</Text>
              <View style={styles.feedbackButtonsRow}>
                <TouchableOpacity
                  style={[styles.feedbackBtn, isDark && { backgroundColor: '#1F1B38', borderColor: 'rgba(168, 85, 247, 0.2)' }, outcomeFeedback[activeFocus] === 'Happened' && styles.feedbackBtnHappenedActive]}
                  onPress={() => {
                    haptic.success();
                    setOutcomeFeedback(prev => ({ ...prev, [activeFocus]: 'Happened' }));
                  }}
                  activeOpacity={0.8}
                >
                  <CheckCircle size={13} color={outcomeFeedback[activeFocus] === 'Happened' ? '#FFF' : '#03B07A'} />
                  <Text style={[styles.feedbackBtnText, { color: outcomeFeedback[activeFocus] === 'Happened' ? '#FFF' : '#03B07A' }]}>Happened</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.feedbackBtn, isDark && { backgroundColor: '#1F1B38', borderColor: 'rgba(168, 85, 247, 0.2)' }, outcomeFeedback[activeFocus] === 'Didnt' && styles.feedbackBtnDidntActive]}
                  onPress={() => {
                    haptic.press();
                    setOutcomeFeedback(prev => ({ ...prev, [activeFocus]: 'Didnt' }));
                  }}
                  activeOpacity={0.8}
                >
                  <X size={13} color={outcomeFeedback[activeFocus] === 'Didnt' ? '#FFF' : '#E63946'} />
                  <Text style={[styles.feedbackBtnText, { color: outcomeFeedback[activeFocus] === 'Didnt' ? '#FFF' : '#E63946' }]}>Didn't</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </Animated.View>

        {/* ══════════════════════════════════════════════════════════
            CARD 3 · Focus Quadrants & Strategic Moves
           ══════════════════════════════════════════════════════════ */}
        <Animated.View style={[pageStyle, cardArc(2)]}>
          <View style={[sheetStyle, { padding: 18 }]}>
            <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled contentContainerStyle={{ paddingBottom: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 16, color: isDark ? '#F0EEFF' : '#2C2B3D' }}>Strategic Focus</Text>
                <TouchableOpacity
                  style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(114,111,141,0.08)', borderRadius: 10, padding: 6 }}
                  onPress={() => shareCurrentStory(2)}
                  activeOpacity={0.8}
                >
                  <Share2 size={14} color={isDark ? '#FFFFFF' : '#2C2B3D'} />
                </TouchableOpacity>
              </View>

              {/* 4 Quadrants Pill Selectors */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 12 }}>
                {(['Work', 'Love', 'Mind', 'Money'] as const).map((focus) => {
                  const meta = focusMeta[focus];
                  const isActive = activeFocus === focus;
                  return (
                    <TouchableOpacity
                      key={focus}
                      style={{ width: '48%', marginBottom: 8 }}
                      activeOpacity={0.85}
                      onPress={() => { haptic.press(); setActiveFocus(focus); setSelectedMove(null); }}
                    >
                      <View style={{
                        width: '100%', borderRadius: 14, padding: 10, flexDirection: 'row', alignItems: 'center',
                        backgroundColor: isActive ? meta.color : (isDark ? '#1F1B38' : '#F9F8FD'),
                        borderWidth: 1.5, borderColor: isActive ? meta.color : (isDark ? 'rgba(168, 85, 247, 0.2)' : 'rgba(114, 111, 141, 0.10)'),
                      }}>
                        <View style={{ width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : `${meta.color}14` }}>
                          <MaterialCommunityIcons name={meta.icon} size={16} color={isActive ? '#FFFFFF' : meta.color} />
                        </View>
                        <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 11.5, color: isActive ? '#FFFFFF' : (isDark ? '#F0EEFF' : '#2C2B3D'), marginLeft: 8 }}>{meta.label}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Momentum Card */}
              <LinearGradient
                colors={[accent, `${accent}CC`]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={{ borderRadius: 16, padding: 12, flexDirection: 'row', alignItems: 'center', overflow: 'hidden', marginBottom: 12 }}
              >
                <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
                  <MaterialCommunityIcons name={focusMeta[activeFocus].icon} size={18} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 8.5, color: 'rgba(255,255,255,0.85)', letterSpacing: 1.2 }}>{focusMeta[activeFocus].label.toUpperCase()} · HIGH MOMENTUM</Text>
                  <Text style={{ fontFamily: 'SourceSerif4-Bold', fontSize: 12.5, color: '#FFFFFF', marginTop: 1 }}>Your {focusMeta[activeFocus].label.toLowerCase()} alignment is active</Text>
                </View>
              </LinearGradient>

              {/* Moves Selector Card */}
              <View style={[styles.movesCard, isDark && { backgroundColor: '#1F1B38', borderColor: 'rgba(168, 85, 247, 0.2)' }, { borderTopWidth: 3, borderTopColor: accent }]}>
                <Text style={[styles.movesCardTitle, { color: accent, fontSize: 12.5 }]}>{activeData.title}</Text>
                {activeData.moves.map((move, index) => {
                  const isSelected = selectedMove === move;
                  return (
                    <TouchableOpacity key={index} style={[styles.moveOption, isDark && { backgroundColor: '#161329', borderColor: 'rgba(168, 85, 247, 0.15)' }, isSelected && styles.moveOptionActive]} onPress={() => setSelectedMove(move)} activeOpacity={0.7}>
                      <View style={[styles.radioButton, isSelected && styles.radioButtonActive]}>
                        {isSelected && <View style={styles.radioButtonInner} />}
                      </View>
                      <Text style={[styles.moveOptionText, isDark && { color: '#F0EEFF' }, isSelected && styles.moveOptionTextActive, { fontSize: 12 }]}>{move}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </Animated.View>

        {/* ══════════════════════════════════════════════════════════
            CARD 4 · Cosmic Guidance, Dos & Avoids + Tool Launchers
           ══════════════════════════════════════════════════════════ */}
        <Animated.View style={[pageStyle, cardArc(3)]}>
          <View style={[sheetStyle, { padding: 18 }]}>
            <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled contentContainerStyle={{ paddingBottom: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 16, color: isDark ? '#F0EEFF' : '#2C2B3D' }}>Cosmic Guidance</Text>
                <TouchableOpacity
                  style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(114,111,141,0.08)', borderRadius: 10, padding: 6 }}
                  onPress={() => shareCurrentStory(3)}
                  activeOpacity={0.8}
                >
                  <Share2 size={14} color={isDark ? '#FFFFFF' : '#2C2B3D'} />
                </TouchableOpacity>
              </View>

              {/* Do This vs. Avoid This */}
              <View style={styles.splitListsRow}>
                <View style={[styles.listCard, styles.doCard, isDark && { backgroundColor: 'rgba(3, 176, 122, 0.12)', borderColor: 'rgba(3, 176, 122, 0.3)' }]}>
                  <Text style={[styles.listHeader, { color: '#03B07A' }]}>Do This</Text>
                  {activeData.doList.map((item, idx) => (
                    <View key={idx} style={styles.listItemRow}>
                      <PlusCircle size={10} color="#03B07A" style={styles.listItemIcon} />
                      <Text style={[styles.listItemText, isDark && { color: '#F0EEFF' }]}>{item}</Text>
                    </View>
                  ))}
                </View>
                <View style={[styles.listCard, styles.avoidCard, isDark && { backgroundColor: 'rgba(230, 57, 70, 0.12)', borderColor: 'rgba(230, 57, 70, 0.3)' }]}>
                  <Text style={[styles.listHeader, { color: '#E63946' }]}>Avoid This</Text>
                  {activeData.avoidList.map((item, idx) => (
                    <View key={idx} style={styles.listItemRow}>
                      <AlertTriangle size={10} color="#E63946" style={styles.listItemIcon} />
                      <Text style={[styles.listItemText, isDark && { color: '#F0EEFF' }]}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Timing Windows */}
              <View style={[styles.timeWindowsCard, { marginTop: 12 }]}>
                <View style={[styles.timeWindowItem, isDark && { backgroundColor: 'rgba(3, 176, 122, 0.12)', borderColor: 'rgba(3, 176, 122, 0.3)' }]}>
                  <View style={styles.timeHeaderRow}>
                    <Clock size={12} color="#03B07A" />
                    <Text style={[styles.timeLabel, isDark && { color: '#9E9BB3' }]}>Power Window</Text>
                  </View>
                  <Text style={[styles.timeValue, { color: '#03B07A', fontSize: 11.5 }]}>{activeData.powerWindow}</Text>
                </View>
                <View style={[styles.timeWindowItem, styles.avoidTimeItem, isDark && { backgroundColor: 'rgba(230, 57, 70, 0.12)', borderColor: 'rgba(230, 57, 70, 0.3)' }]}>
                  <View style={styles.timeHeaderRow}>
                    <Clock size={12} color="#E63946" />
                    <Text style={[styles.timeLabel, isDark && { color: '#9E9BB3' }]}>Avoid After</Text>
                  </View>
                  <Text style={[styles.timeValue, { color: '#E63946', fontSize: 11.5 }]}>{activeData.avoidAfter}</Text>
                </View>
              </View>

              {/* Transit Insight Box */}
              <View style={[styles.insightCard, isDark && { backgroundColor: 'rgba(168, 85, 247, 0.1)', borderColor: 'rgba(168, 85, 247, 0.25)' }, { marginTop: 12 }]}>
                <View style={styles.insightHeaderRow}>
                  <Info size={13} color={isDark ? '#A855F7' : '#7209B7'} />
                  <Text style={[styles.insightTitle, isDark && { color: '#A855F7' }]}>Cosmic Transit Insight</Text>
                </View>
                <Text style={[styles.insightText, isDark && { color: '#F0EEFF' }, { fontSize: 12, lineHeight: 17 }]}>{activeData.rationale}</Text>
              </View>

              {/* Quick Launchers */}
              <View style={[styles.widgetsGrid, { marginTop: 12 }]}>
                <TouchableOpacity style={[styles.widgetBox, isDark && { backgroundColor: '#1F1B38', borderColor: 'rgba(168, 85, 247, 0.2)' }]} activeOpacity={0.8} onPress={() => setCurrentView('astro-calendar')}>
                  <Calendar size={18} color="#FFD700" style={{ marginBottom: 4 }} />
                  <Text style={[styles.widgetLabel, isDark && { color: '#9E9BB3' }]}>Astro Calendar</Text>
                  <Text style={[styles.widgetValueText, { color: '#FFD700', fontFamily: 'SourceSerif4-Bold', fontSize: 11 }]}>Events & Phases →</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.widgetBox, isDark && { backgroundColor: '#1F1B38', borderColor: 'rgba(168, 85, 247, 0.2)' }]} activeOpacity={0.8} onPress={handleOpenStyleForecaster}>
                  <Shirt size={18} color="#F72585" style={{ marginBottom: 4 }} />
                  <Text style={[styles.widgetLabel, isDark && { color: '#9E9BB3' }]}>StyleForecaster</Text>
                  <Text style={[styles.widgetValueText, { color: '#F72585', fontFamily: 'SourceSerif4-Bold', fontSize: 11 }]}>What to wear →</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </Animated.View>
      </Animated.ScrollView>

      {/* Pagination Dots */}
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: NAV_SPACE - 22, flexDirection: 'row', justifyContent: 'center', gap: 6 }} pointerEvents="none">
        {Array.from({ length: CARD_COUNT }).map((_, i) => (
          <View key={i} style={{ width: i === todayCard ? 20 : 6, height: 6, borderRadius: 3, backgroundColor: i === todayCard ? accent : 'rgba(114,111,141,0.25)' }} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  feedbackButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  feedbackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(114, 111, 141, 0.15)',
    backgroundColor: '#FFFFFF',
    gap: 6,
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
    fontSize: 12,
  },
  movesCard: {
    backgroundColor: '#FDFCFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(114, 111, 141, 0.10)',
  },
  movesCardTitle: {
    fontFamily: 'Cinzel-Bold',
    marginBottom: 8,
  },
  moveOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(114, 111, 141, 0.08)',
  },
  moveOptionActive: {
    backgroundColor: 'rgba(114, 9, 183, 0.05)',
    borderColor: '#7209B7',
  },
  radioButton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#726F8D',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
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
    fontFamily: 'SourceSerif4',
    color: '#2C2B3D',
    flex: 1,
  },
  moveOptionTextActive: {
    fontFamily: 'SourceSerif4-Bold',
    color: '#7209B7',
  },
  splitListsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  listCard: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
  },
  doCard: {
    backgroundColor: 'rgba(3, 176, 122, 0.04)',
    borderColor: 'rgba(3, 176, 122, 0.18)',
  },
  avoidCard: {
    backgroundColor: 'rgba(230, 57, 70, 0.04)',
    borderColor: 'rgba(230, 57, 70, 0.18)',
  },
  listHeader: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 12,
    marginBottom: 8,
  },
  listItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  listItemIcon: {
    marginTop: 3,
    marginRight: 6,
  },
  listItemText: {
    fontFamily: 'SourceSerif4',
    fontSize: 11,
    color: '#2C2B3D',
    flex: 1,
    lineHeight: 15,
  },
  timeWindowsCard: {
    flexDirection: 'row',
    gap: 10,
  },
  timeWindowItem: {
    flex: 1,
    backgroundColor: 'rgba(3, 176, 122, 0.04)',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(3, 176, 122, 0.16)',
  },
  avoidTimeItem: {
    backgroundColor: 'rgba(230, 57, 70, 0.04)',
    borderColor: 'rgba(230, 57, 70, 0.16)',
  },
  timeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  timeLabel: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 10,
    color: '#726F8D',
  },
  timeValue: {
    fontFamily: 'SourceSerif4-Bold',
  },
  insightCard: {
    backgroundColor: 'rgba(114, 9, 183, 0.04)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(114, 9, 183, 0.15)',
  },
  insightHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  insightTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 12,
    color: '#7209B7',
  },
  insightText: {
    fontFamily: 'SourceSerif4',
    color: '#2C2B3D',
  },
  widgetsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  widgetBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(114, 111, 141, 0.12)',
    shadowColor: '#2C2B3D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  widgetLabel: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 10,
    color: '#726F8D',
  },
  widgetValueText: {
    marginTop: 2,
  },
});

export default TodayScreen;
