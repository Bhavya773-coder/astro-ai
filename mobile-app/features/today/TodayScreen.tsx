import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
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
} from 'lucide-react-native';
import { ZODIAC_ICONS, RASHI_GLYPHS } from '../../constants/astrology';
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
}

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
}: TodayScreenProps) {
  const { theme, isDark } = useTheme();
  const { width, height } = Dimensions.get('window');
  const [todayDeckH, setTodayDeckH] = useState(0);
  const [todayCard, setTodayCard] = useState(0);
  const todayScrollX = useRef(new Animated.Value(0)).current;
  const todayScrollRef = useRef<any>(null);

  const focusMeta: Record<string, { icon: any; color: string; label: string }> = {
    Work:  { icon: 'briefcase-outline', color: '#7209B7', label: 'Career' },
    Love:  { icon: 'heart-outline',     color: '#F72585', label: 'Love' },
    Mind:  { icon: 'brain',             color: '#03B07A', label: 'Mind' },
    Money: { icon: 'cash-multiple',     color: '#D9730D', label: 'Money' },
  };

  const accent = focusMeta[activeFocus].color;
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  const CARD_COUNT = 4;
  const NAV_SPACE = 84 + insets.bottom;
  const usableH = Math.max((todayDeckH || (height - NAV_SPACE - 24)), 320);
  const GAP = 14;
  const CW = Math.round(width * 0.78);
  const SNAP = CW + GAP;
  const sidePad = Math.round((width - CW) / 2);
  const pageStyle = { width: CW, height: usableH, marginRight: GAP } as const;
  const sheetStyle = {
    flex: 1,
    borderRadius: 30,
    backgroundColor: isDark ? 'rgba(22, 19, 41, 0.75)' : '#FFFFFF',
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
      opacity: todayScrollX.interpolate({ inputRange, outputRange: [0.60, 0.85, 1, 0.85, 0.60], ...opts }),
      transform: [
        { scale: todayScrollX.interpolate({ inputRange, outputRange: [0.91, 0.96, 1, 0.96, 0.91], ...opts }) },
        { translateY: todayScrollX.interpolate({ inputRange, outputRange: [14, 4, 0, 4, 14], ...opts }) },
      ],
    };
  };

  return (
    <View style={{ flex: 1, paddingTop: 6 }} onLayout={e => { const h = e.nativeEvent.layout.height; if (h && Math.abs(h - todayDeckH) > 1) setTodayDeckH(h); }}>
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
        {/* ══════ CARD 1 · Cosmic Cover ══════ */}
        <Animated.View style={[pageStyle, cardArc(0)]}>
          <LinearGradient
            colors={isDark ? ['rgba(31, 12, 59, 0.85)', 'rgba(59, 18, 97, 0.80)', 'rgba(114, 9, 183, 0.75)'] : ['#1F0C3B', '#3B1261', '#7209B7']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={{ flex: 1, borderRadius: 30, overflow: 'hidden', padding: 22, justifyContent: 'space-between', borderWidth: 1, borderColor: isDark ? 'rgba(168, 85, 247, 0.25)' : 'transparent' }}
          >
            {/* Top: greeting + streak + share */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'SourceSerif4', fontSize: 13, color: 'rgba(255,255,255,0.72)' }}>{getGreeting()}</Text>
                <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 23, color: '#FFFFFF', marginTop: 2 }} numberOfLines={1}>{userName}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 8 }}>
                {streak > 0 && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
                    <Flame size={14} color="#FFD27A" />
                    <Text style={{ fontFamily: 'SourceSerif4-Bold', fontSize: 12, color: '#FFFFFF', marginLeft: 4 }}>{streak}</Text>
                  </View>
                )}
                <TouchableOpacity
                  style={{ backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: 14, padding: 9, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}
                  onPress={() => triggerShareCard({
                    category: 'DAILY HOROSCOPE',
                    title: `${zodiac?.name || 'Cosmic'} Daily Horoscope`,
                    subtitle: dateStr,
                    readingText: dailyDecision?.rationale || dailyDecision?.hook || `Cosmic alignment is active for ${activeFocus}. Harness your inner potential today.`,
                    highlights: [
                      { label: 'Zodiac', value: zodiac?.name || 'Unavailable' },
                      { label: 'Focus Area', value: activeFocus },
                      { label: 'Power Window', value: activeData?.powerWindow || 'Morning' },
                      { label: 'Mood Signal', value: dailyDecision?.signals?.emotion || 'Balanced' },
                    ],
                  })}
                  activeOpacity={0.8}
                >
                  <Share2 size={15} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Center: Glowing Zodiac Sigil */}
            <View style={{ alignItems: 'center' }}>
              <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(255,255,255,0.14)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center', shadowColor: '#F72585', shadowOpacity: 0.3, shadowRadius: 16 }}>
                <Text style={{ fontSize: 50, color: '#FFFFFF' }}>{RASHI_GLYPHS[(zodiac?.index || 1) - 1]}</Text>
              </View>
              <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 24, color: '#FFFFFF', marginTop: 14 }}>{zodiac?.name || 'Cosmic'} Daily</Text>
              
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5, backgroundColor: 'rgba(255,255,255,0.14)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' }}>
                <Text style={{ fontFamily: 'SourceSerif4-Bold', fontSize: 12, color: '#FFFFFF' }}>
                  {zodiac?.element ? `${zodiac.element} • ` : ''}{dateStr}
                </Text>
              </View>

              <Text style={{ fontFamily: 'SourceSerif4', fontSize: 13.5, color: 'rgba(255,255,255,0.92)', marginTop: 14, textAlign: 'center', lineHeight: 20 }}>
                {dailyDecision?.hook || 'The stars align in your favor today. Embrace the cosmic energy and trust your intuition.'}
              </Text>
            </View>

            {/* Bottom: Swipe indicator */}
            <View style={{ alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 18 }}>
                <Sparkles size={12} color="#FFD27A" />
                <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 10, color: '#FFFFFF', letterSpacing: 1.2 }}>SWIPE FOR FORECAST & MOVES →</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ══════ CARD 2 · Forecast & Prediction ══════ */}
        <Animated.View style={[pageStyle, cardArc(1)]}>
          <View style={[sheetStyle, { padding: 22, justifyContent: 'space-between' }]}>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 9.5, color: accent, letterSpacing: 1.5 }}>YOUR DAILY FORECAST</Text>
                <View style={{ backgroundColor: `${accent}14`, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                  <Text style={{ fontFamily: 'SourceSerif4-Bold', fontSize: 10, color: accent }}>{activeFocus} Focus</Text>
                </View>
              </View>
              <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 21, color: isDark ? '#F0EEFF' : '#2C2B3D', marginTop: 8, lineHeight: 28 }}>What Will Happen Today</Text>
              <View style={{ height: 2.5, width: 40, backgroundColor: accent, borderRadius: 2, marginVertical: 14 }} />

              <View style={{ backgroundColor: isDark ? 'rgba(168, 85, 247, 0.1)' : 'rgba(114, 9, 183, 0.04)', borderRadius: 16, padding: 14, borderLeftWidth: 3, borderLeftColor: accent }}>
                <Text style={{ fontFamily: 'SourceSerif4', fontSize: 15.5, color: isDark ? '#F0EEFF' : '#2C2B3D', lineHeight: 23, fontStyle: 'italic' }}>
                  “{activeData.prediction}”
                </Text>
              </View>

              <Text style={{ fontFamily: 'SourceSerif4', fontSize: 12.5, color: isDark ? '#9E9BB3' : '#726F8D', lineHeight: 19, marginTop: 12 }}>
                {activeData.rationale}
              </Text>
            </View>

            <View style={{ marginTop: 12 }}>
              <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 9.5, color: isDark ? '#9E9BB3' : '#726F8D', textAlign: 'center', marginBottom: 8 }}>DID THIS PREDICTION RESONATE?</Text>
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
            </View>
          </View>
        </Animated.View>

        {/* ══════ CARD 3 · Focus & Strategic Moves ══════ */}
        <Animated.View style={[pageStyle, cardArc(2)]}>
          <View style={[sheetStyle, { padding: 18 }]}>
            <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
              <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 15, color: isDark ? '#F0EEFF' : '#2C2B3D', marginBottom: 10 }}>Where's your focus today?</Text>
              
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
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
                        width: '100%', borderRadius: 16, padding: 12, flexDirection: 'row', alignItems: 'center',
                        backgroundColor: isActive ? meta.color : (isDark ? '#1F1B38' : '#FFFFFF'),
                        borderWidth: 1.5, borderColor: isActive ? meta.color : (isDark ? 'rgba(168, 85, 247, 0.2)' : 'rgba(114, 111, 141, 0.10)'),
                        shadowColor: meta.color, shadowOffset: { width: 0, height: isActive ? 4 : 1 }, shadowOpacity: isActive ? 0.25 : 0.04, shadowRadius: isActive ? 8 : 4, elevation: isActive ? 3 : 1,
                      }}>
                        <View style={{ width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : `${meta.color}14` }}>
                          <MaterialCommunityIcons name={meta.icon} size={18} color={isActive ? '#FFFFFF' : meta.color} />
                        </View>
                        <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 12, color: isActive ? '#FFFFFF' : (isDark ? '#F0EEFF' : '#2C2B3D'), marginLeft: 8 }}>{meta.label}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <LinearGradient
                colors={[accent, `${accent}CC`]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={{ borderRadius: 16, padding: 12, flexDirection: 'row', alignItems: 'center', overflow: 'hidden', marginTop: 8 }}
              >
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
                  <MaterialCommunityIcons name={focusMeta[activeFocus].icon} size={20} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 8.5, color: 'rgba(255,255,255,0.85)', letterSpacing: 1.2 }}>{focusMeta[activeFocus].label.toUpperCase()} · TODAY</Text>
                  <Text style={{ fontFamily: 'SourceSerif4-Bold', fontSize: 13, color: '#FFFFFF', marginTop: 1 }}>Your {focusMeta[activeFocus].label.toLowerCase()} momentum is active</Text>
                </View>
              </LinearGradient>

              <View style={[styles.movesCard, isDark && { backgroundColor: '#1F1B38', borderColor: 'rgba(168, 85, 247, 0.2)' }, { marginTop: 10, borderTopWidth: 3, borderTopColor: accent }]}>
                <Text style={[styles.movesCardTitle, { color: accent, fontSize: 13 }]}>{activeData.title}</Text>
                {activeData.moves.length === 0 && isTodayLoading ? (
                  <Text style={{ fontFamily: 'SourceSerif4', fontSize: 12, color: isDark ? '#9E9BB3' : '#726F8D', paddingVertical: 8 }}>Consulting the stars…</Text>
                ) : (
                  activeData.moves.map((move, index) => {
                    const isSelected = selectedMove === move;
                    return (
                      <TouchableOpacity key={index} style={[styles.moveOption, isDark && { backgroundColor: '#161329', borderColor: 'rgba(168, 85, 247, 0.15)' }, isSelected && styles.moveOptionActive]} onPress={() => setSelectedMove(move)} activeOpacity={0.7}>
                        <View style={[styles.radioButton, isSelected && styles.radioButtonActive]}>
                          {isSelected && <View style={styles.radioButtonInner} />}
                        </View>
                        <Text style={[styles.moveOptionText, isDark && { color: '#F0EEFF' }, isSelected && styles.moveOptionTextActive, { fontSize: 12 }]}>{move}</Text>
                      </TouchableOpacity>
                    );
                  })
                )}
              </View>
            </ScrollView>
          </View>
        </Animated.View>

        {/* ══════ CARD 4 · Cosmic Guidance & Time Windows ══════ */}
        <Animated.View style={[pageStyle, cardArc(3)]}>
          <View style={[sheetStyle, { padding: 18 }]}>
            <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
              <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 15, color: isDark ? '#F0EEFF' : '#2C2B3D', marginBottom: 10 }}>Cosmic Guidance</Text>

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

              <View style={[styles.insightCard, isDark && { backgroundColor: 'rgba(168, 85, 247, 0.1)', borderColor: 'rgba(168, 85, 247, 0.25)' }, { marginTop: 12 }]}>
                <View style={styles.insightHeaderRow}>
                  <Info size={13} color={isDark ? '#A855F7' : '#7209B7'} />
                  <Text style={[styles.insightTitle, isDark && { color: '#A855F7' }]}>Cosmic Insight</Text>
                </View>
                <Text style={[styles.insightText, isDark && { color: '#F0EEFF' }, { fontSize: 12, lineHeight: 17 }]}>{activeData.rationale}</Text>
              </View>

              <View style={[styles.widgetsGrid, { marginTop: 12 }]}>
                <TouchableOpacity style={[styles.widgetBox, isDark && { backgroundColor: '#1F1B38', borderColor: 'rgba(168, 85, 247, 0.2)' }]} activeOpacity={0.8} onPress={() => setCurrentView('astro-calendar')}>
                  <Calendar size={16} color="#FFD700" style={{ marginBottom: 2 }} />
                  <Text style={[styles.widgetLabel, isDark && { color: '#9E9BB3' }]}>Astro Calendar</Text>
                  <Text style={[styles.widgetValueText, { color: '#FFD700', fontWeight: '700', fontSize: 11 }]}>Events & Phases</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.widgetBox, isDark && { backgroundColor: '#1F1B38', borderColor: 'rgba(168, 85, 247, 0.2)' }]} activeOpacity={0.8} onPress={handleOpenStyleForecaster}>
                  <Shirt size={16} color="#F72585" style={{ marginBottom: 2 }} />
                  <Text style={[styles.widgetLabel, isDark && { color: '#9E9BB3' }]}>StyleForecaster</Text>
                  <Text style={[styles.widgetValueText, { color: '#F72585', fontFamily: 'SourceSerif4-Bold', fontSize: 11 }]}>Outfit tips</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </Animated.View>
      </Animated.ScrollView>

      {/* Pagination dots */}
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: NAV_SPACE - 22, flexDirection: 'row', justifyContent: 'center', gap: 6 }} pointerEvents="none">
        {Array.from({ length: CARD_COUNT }).map((_, i) => (
          <View key={i} style={{ width: i === todayCard ? 20 : 6, height: 6, borderRadius: 3, backgroundColor: i === todayCard ? accent : 'rgba(114,111,141,0.22)' }} />
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
