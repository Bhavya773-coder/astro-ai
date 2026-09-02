import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  Modal,
  TextInput,
  Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Rect } from 'react-native-svg';
import {
  Sparkles,
  Share2,
  Eye,
  Sun,
  Zap,
  Heart,
  MessageSquare,
  Phone,
  Clock,
  ChevronRight,
  Info,
  Calendar,
  X,
  Flame,
  Hash,
  Compass,
  Send,
  Briefcase,
  Shirt,
  CloudSun,
  Coins,
  Star,
} from 'lucide-react-native';
import {
  RASHI_GLYPHS,
  ZODIAC_MODALITY_TRAITS,
  DAILY_LUCKY_MATRIX,
} from '../../constants/astrology';
import { useTheme } from '../../theme';
import { ShareCardData } from '../../shareUtils';

const HOPE_AVATAR = require('../../assets/hope_avatar.jpg');

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
  triggerShareCard: (data: ShareCardData) => void;
  handleOpenStyleForecaster: () => void;
  setCurrentView: (view: string) => void;
  haptic: { press: () => void; success: () => void; light?: () => void };
  getGreeting: () => string;
  onAskOracle?: (question: string) => void;
}

const { width } = Dimensions.get('window');

/**
 * Deckled / Torn Paper Bottom Edge SVG Component
 */
const TornBottomEdge: React.FC<{ width: number; height?: number; color?: string; shadowColor?: string }> = ({
  width: w,
  height: h = 10,
  color = '#FDFBF7',
}) => {
  // Generate realistic jagged / torn paper path
  const d = `M 0 0 Q ${w * 0.05} ${h * 0.9} ${w * 0.1} ${h * 0.3} T ${w * 0.2} ${h * 0.8} T ${w * 0.3} ${h * 0.2} T ${w * 0.4} ${h * 0.95} T ${w * 0.5} ${h * 0.4} T ${w * 0.6} ${h * 0.85} T ${w * 0.7} ${h * 0.25} T ${w * 0.8} ${h * 0.9} T ${w * 0.9} ${h * 0.35} T ${w} ${h * 0.7} L ${w} 0 Z`;

  return (
    <View style={{ width: '100%', height: h, marginTop: -1, overflow: 'hidden' }}>
      <Svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <Path d={d} fill={color} />
      </Svg>
    </View>
  );
};

export default function TodayScreen({
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
  const [insightModalVisible, setInsightModalVisible] = useState(false);
  const [insightModalContent, setInsightModalContent] = useState<{ title: string; body: string }>({ title: '', body: '' });
  const [reminderSet, setReminderSet] = useState(false);
  const [customQuestion, setCustomQuestion] = useState('');

  // Zodiac specifics from real props
  const zodiacName = zodiac?.name || 'Aquarius';
  const zodiacIndex = zodiac?.index || 11;
  const traits = ZODIAC_MODALITY_TRAITS[zodiacName] || ZODIAC_MODALITY_TRAITS.Aquarius;
  const luckyData = DAILY_LUCKY_MATRIX[zodiacName] || DAILY_LUCKY_MATRIX.Aquarius;

  // Formatted real date
  const now = new Date();
  const dayNameUpper = now.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  const monthDayStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const fullDateSubtitle = `${monthDayStr.toUpperCase()}, ${now.getFullYear()}`;

  // Time-aware greeting
  const greeting = getGreeting();

  // Dynamic real data from app
  const powerWindow = activeData?.powerWindow || '10:00 AM – 12:30 PM';
  const avoidAfterTime = activeData?.avoidAfter || 'After 7:00 PM';
  const dailyHookQuote = dailyDecision?.hook || traits.quote;
  const predictionText = activeData?.prediction || `The stars align in your favor for ${activeFocus}. High intuition and productive clarity are highlighted today.`;
  const rationaleText = activeData?.rationale || `Planetary positions harmonize with your ${zodiacName} placements, supporting focused execution in ${activeFocus}.`;
  const mindfulAvoidance = activeData?.avoidList?.[0] ? `Avoid ${activeData.avoidList[0].toLowerCase()}` : "Don't let minor imposter thoughts slow you down.";
  const opportunityDo = activeData?.doList?.[0] ? activeData.doList[0] : (activeData?.moves?.[0] || "Your magnetic aura opens doors through conversation.");
  const moveTitle = activeData?.title || `Your Move in ${activeFocus}`;

  // Navigation bottom space
  const navBottomPad = (insets.bottom || 0) + 84;

  // Handle opening insight modal
  const openInsight = (title: string, body: string) => {
    haptic.press();
    setInsightModalContent({ title, body });
    setInsightModalVisible(true);
  };

  // Handle Reminders
  const handleSetReminder = () => {
    haptic.success();
    setReminderSet(true);
    Alert.alert('Power Window Reminder ✨', `Cosmic reminder set for ${powerWindow}. You'll be notified when your alignment peaks!`);
  };

  // Ask Oracle / Hope
  const handleAskQuickQuestion = (q: string) => {
    haptic.press();
    if (onAskOracle) {
      onAskOracle(q);
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

  // 1-Tap Share Triggers
  const handleShareZodiacCard = () => {
    haptic.press();
    triggerShareCard({
      category: 'DAILY COSMIC ALIGNMENT',
      title: `${zodiacName.toUpperCase()} Alignment`,
      subtitle: fullDateSubtitle,
      readingText: dailyHookQuote,
      zodiac: zodiacName,
      zodiacIndex,
      zodiacTraits: traits.subtitle,
      templateType: 'zodiac_alignment',
      highlights: [
        { label: 'Zodiac', value: zodiacName },
        { label: 'Element', value: traits.element },
        { label: 'Power Time', value: powerWindow },
        { label: 'Lucky Color', value: luckyData.color },
      ],
    });
  };

  const handleSharePowerWindowCard = () => {
    haptic.press();
    triggerShareCard({
      category: 'POWER WINDOW',
      title: "Today's Power Window",
      subtitle: fullDateSubtitle,
      readingText: `Peak astrological window for ${activeFocus}: ${powerWindow}. Best for key decisions and pitches. Caution after: ${avoidAfterTime}.`,
      timeWindow: powerWindow,
      templateType: 'power_window',
      highlights: [
        { label: 'Window', value: powerWindow },
        { label: 'Caution After', value: avoidAfterTime },
        { label: 'Focus', value: activeFocus },
      ],
    });
  };

  const handleShareMemoryCard = () => {
    haptic.press();
    triggerShareCard({
      category: 'STRATEGIC MOVE OF THE DAY',
      title: moveTitle,
      eventName: moveTitle,
      subtitle: `${zodiacName} · ${fullDateSubtitle}`,
      readingText: selectedMove || opportunityDo,
      timeWindow: powerWindow,
      templateType: 'memory_insight',
      highlights: [
        { label: 'Focus Area', value: activeFocus },
        { label: 'Strategy', value: selectedMove || opportunityDo },
        { label: 'Power Window', value: powerWindow },
      ],
    });
  };

  return (
    <View style={[styles.rootContainer, isDark && styles.rootContainerDark]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: 10,
            paddingBottom: navBottomPad,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ══════════════════════════════════════════════════════════
            1. GREETING & DATE ROW (With Streak Badge)
           ══════════════════════════════════════════════════════════ */}
        <View style={styles.greetingDateRow}>
          {/* Left Greeting & Script Name */}
          <View style={styles.greetingLeft}>
            <Text style={[styles.greetingLabel, isDark && { color: 'rgba(255,255,255,0.75)' }]}>
              {greeting}
            </Text>
            <View style={styles.nameUnderlineContainer}>
              <Text style={[styles.userNameScript, isDark && { color: '#FFFFFF' }]} numberOfLines={1}>
                {userName || 'Seeker'}
              </Text>
              <View style={styles.scriptUnderline} />
            </View>
          </View>

          {/* Right Date Stamp & Streak */}
          <View style={styles.dateRight}>
            {streak > 0 && (
              <View style={styles.streakBadge}>
                <Flame size={12} color="#D97706" />
                <Text style={styles.streakBadgeText}>{streak} Day Streak</Text>
              </View>
            )}
            <Text style={[styles.dateDayUpper, isDark && { color: 'rgba(255,255,255,0.6)' }]}>
              {dayNameUpper}
            </Text>
            <Text style={[styles.dateMonthDay, isDark && { color: '#FFFFFF' }]}>
              {monthDayStr}
            </Text>
          </View>
        </View>

        {/* ══════════════════════════════════════════════════════════
            2. SECTION 1: POLAROID ZODIAC CARD & QUOTE (Uneven/Torn Deckle)
           ══════════════════════════════════════════════════════════ */}
        <View style={[styles.parchmentSectionCard, isDark && styles.parchmentSectionCardDark]}>
          <View style={styles.polaroidQuoteRow}>
            {/* Left: Tilted & Taped Polaroid Card */}
            <TouchableOpacity
              style={[styles.polaroidBox, isDark && styles.polaroidBoxDark]}
              activeOpacity={0.9}
              onPress={handleShareZodiacCard}
            >
              {/* Washi Tape (tilted angle) */}
              <View style={styles.washiTape} />

              {/* Watercolor Zodiac Circle */}
              <LinearGradient
                colors={['#D8B4F8', '#9B51E0', '#6B21A8']}
                start={{ x: 0.1, y: 0.1 }}
                end={{ x: 0.9, y: 0.9 }}
                style={styles.polaroidWatercolorCircle}
              >
                <Text style={styles.polaroidGlyph}>{RASHI_GLYPHS[zodiacIndex - 1]}</Text>
              </LinearGradient>

              {/* Sign Name */}
              <Text style={[styles.polaroidTitle, isDark && { color: '#2C2B3D' }]}>
                {zodiacName.toUpperCase()}
              </Text>

              {/* Traits */}
              <Text style={styles.polaroidTraits} numberOfLines={1}>
                {traits.subtitle}
              </Text>
            </TouchableOpacity>

            {/* Right: Editorial Quote */}
            <View style={styles.quoteRightColumn}>
              <TouchableOpacity
                style={styles.sectionShareButton}
                onPress={handleShareZodiacCard}
                activeOpacity={0.7}
              >
                <Share2 size={15} color={isDark ? '#D8B4F8' : '#7209B7'} />
              </TouchableOpacity>

              <Text style={styles.bigQuoteMark}>“</Text>
              <Text style={[styles.dailyQuoteText, isDark && { color: 'rgba(255,255,255,0.92)' }]}>
                {dailyHookQuote}
              </Text>
              <View style={styles.quoteHeartRow}>
                <Sparkles size={14} color="#9B51E0" />
              </View>
            </View>
          </View>
        </View>

        {/* ══════════════════════════════════════════════════════════
            3. FOCUS QUADRANTS SELECTOR (Clean Vector Icons · No Emojis)
           ══════════════════════════════════════════════════════════ */}
        <View style={styles.focusPillsContainer}>
          <Text style={[styles.focusPillsHeader, isDark && { color: '#C084FC' }]}>
            TODAY'S FOCUS SECTOR
          </Text>
          <View style={styles.focusPillsRow}>
            {(['Work', 'Love', 'Mind', 'Money'] as const).map((focus) => {
              const isActive = activeFocus === focus;
              const color = focus === 'Work' ? '#7209B7' : focus === 'Love' ? '#F72585' : focus === 'Mind' ? '#03B07A' : '#D9730D';
              return (
                <TouchableOpacity
                  key={focus}
                  style={[
                    styles.focusPillItem,
                    isDark && styles.focusPillItemDark,
                    isActive && { backgroundColor: color, borderColor: color },
                  ]}
                  activeOpacity={0.8}
                  onPress={() => {
                    haptic.press();
                    setActiveFocus(focus);
                    setSelectedMove(null);
                  }}
                >
                  <View style={{ marginRight: 5 }}>
                    {focus === 'Work' ? (
                      <Briefcase size={12} color={isActive ? '#FFFFFF' : color} />
                    ) : focus === 'Love' ? (
                      <Heart size={12} color={isActive ? '#FFFFFF' : color} />
                    ) : focus === 'Mind' ? (
                      <Sparkles size={12} color={isActive ? '#FFFFFF' : color} />
                    ) : (
                      <Coins size={12} color={isActive ? '#FFFFFF' : color} />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.focusPillText,
                      isDark && { color: '#F4EFFC' },
                      isActive && { color: '#FFFFFF' },
                    ]}
                  >
                    {focus === 'Work' ? 'Career' : focus}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ══════════════════════════════════════════════════════════
            4. SECTION 2: TODAY AT A GLANCE ✨ (Uneven Edge 3-Column Grid)
           ══════════════════════════════════════════════════════════ */}
        <View style={styles.glanceContainer}>
          <View style={styles.glanceHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[styles.glanceHeaderTitle, isDark && { color: '#F4EFFC' }]}>
                Today at a Glance
              </Text>
              <Sparkles size={15} color="#C49B44" />
            </View>

            <TouchableOpacity
              style={styles.miniShareBtn}
              onPress={handleSharePowerWindowCard}
              activeOpacity={0.7}
            >
              <Share2 size={14} color={isDark ? '#D8B4F8' : '#7209B7'} />
            </TouchableOpacity>
          </View>

          {/* 3 Columns Row with Uneven Handcrafted Card Shapes */}
          <View style={styles.glanceColumnsRow}>
            {/* Col 1: Be Mindful */}
            <View style={[styles.glanceCard, styles.glanceCardUneven1, isDark && styles.glanceCardDark]}>
              <View style={styles.glanceCardHeader}>
                <Eye size={15} color="#6B21A8" />
                <Text style={[styles.glanceCardHeading, { color: '#6B21A8' }]}>Be Mindful</Text>
              </View>
              <Text style={[styles.glanceCardBody, isDark && { color: 'rgba(255,255,255,0.85)' }]}>
                {mindfulAvoidance}
              </Text>
              <TouchableOpacity
                style={styles.glanceActionLink}
                onPress={() => openInsight('Why Today?', `${rationaleText}\n\n• What to avoid today:\n${activeData?.avoidList?.map(a => `  - ${a}`).join('\n') || '  - Rushed commitments'}`)}
                activeOpacity={0.7}
              >
                <Text style={styles.glanceActionText}>Why today? →</Text>
              </TouchableOpacity>
            </View>

            {/* Col 2: Opportunity */}
            <View style={[styles.glanceCard, styles.glanceCardUneven2, isDark && styles.glanceCardDark]}>
              <View style={styles.glanceCardHeader}>
                <Sun size={15} color="#D97706" />
                <Text style={[styles.glanceCardHeading, { color: '#D97706' }]}>Opportunity</Text>
              </View>
              <Text style={[styles.glanceCardBody, isDark && { color: 'rgba(255,255,255,0.85)' }]}>
                {opportunityDo}
              </Text>
              <TouchableOpacity
                style={styles.glanceActionLink}
                onPress={() => openInsight('Opportunity Details', `${predictionText}\n\n• Recommended moves:\n${activeData?.doList?.map(d => `  - ${d}`).join('\n') || '  - Take confident initiative'}`)}
                activeOpacity={0.7}
              >
                <Text style={styles.glanceActionText}>Explore →</Text>
              </TouchableOpacity>
            </View>

            {/* Col 3: Power Window */}
            <View style={[styles.glanceCard, styles.glanceCardUneven3, isDark && styles.glanceCardDark]}>
              <View style={styles.glanceCardHeader}>
                <Zap size={15} color="#7E22CE" />
                <Text style={[styles.glanceCardHeading, { color: '#7E22CE' }]}>Power Window</Text>
              </View>
              <Text style={[styles.glanceTimeText, isDark && { color: '#C084FC' }]}>
                {powerWindow}
              </Text>
              <Text style={[styles.glanceCardSubtext, isDark && { color: 'rgba(255,255,255,0.7)' }]}>
                Best for important calls, pitches and decisions.
              </Text>
              <TouchableOpacity
                style={styles.glanceActionLink}
                onPress={handleSetReminder}
                activeOpacity={0.7}
              >
                <Text style={styles.glanceActionText}>
                  {reminderSet ? 'Reminder Set ✓' : 'Set Reminder →'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ══════════════════════════════════════════════════════════
            5. SECTION 3: TORN/DECKLED STRATEGIC NOTE (With SVG Torn Edge)
           ══════════════════════════════════════════════════════════ */}
        <View style={styles.tornCardContainer}>
          <View style={[styles.memorySectionCard, isDark && styles.memorySectionCardDark]}>
            <TouchableOpacity
              style={styles.memorySectionShare}
              onPress={handleShareMemoryCard}
              activeOpacity={0.7}
            >
              <Share2 size={15} color={isDark ? '#D8B4F8' : '#7209B7'} />
            </TouchableOpacity>

            {/* Note Header */}
            <Text style={[styles.memoryNoteHeader, isDark && { color: 'rgba(255,255,255,0.7)' }]}>
              • A strategic thing worth remembering today —
            </Text>

            {/* Strategic Move Title */}
            <View style={styles.memoryTitleRow}>
              <Star size={16} color="#C49B44" fill="#C49B44" style={{ marginRight: 6 }} />
              <Text style={[styles.memoryTitleScript, isDark && { color: '#FFFFFF' }]}>
                {moveTitle}
              </Text>
            </View>

            {/* Subtext: Main Prediction */}
            <Text style={[styles.memorySubtext, isDark && { color: 'rgba(255,255,255,0.85)' }]}>
              “{predictionText}”
            </Text>

            {/* Selectable Moves Options */}
            {activeData?.moves && activeData.moves.length > 0 && (
              <View style={styles.movesOptionsList}>
                {activeData.moves.map((move, idx) => {
                  const isSelected = selectedMove === move;
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.moveOptionRow,
                        isDark && styles.moveOptionRowDark,
                        isSelected && styles.moveOptionRowSelected,
                      ]}
                      onPress={() => {
                        haptic.press();
                        setSelectedMove(move);
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                        {isSelected && <View style={styles.radioInner} />}
                      </View>
                      <Text
                        style={[
                          styles.moveOptionText,
                          isDark && { color: '#F4EFFC' },
                          isSelected && { color: '#7209B7', fontFamily: 'SourceSerif4-Bold' },
                        ]}
                      >
                        {move}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Timing Window Pill */}
            <View style={styles.memoryTimePill}>
              <Clock size={13} color="#6B21A8" style={{ marginRight: 6 }} />
              <Text style={styles.memoryTimePillText}>{powerWindow}</Text>
            </View>

            {/* Actions Bar */}
            <View style={styles.memoryActionsRow}>
              <TouchableOpacity
                style={styles.memoryActionBtn}
                onPress={() => openInsight('Astrological Rationale', `${rationaleText}\n\n• Peak Momentum Window: ${powerWindow}\n• Caution After: ${avoidAfterTime}`)}
                activeOpacity={0.7}
              >
                <Text style={[styles.memoryActionBtnText, isDark && { color: '#C084FC' }]}>See insight</Text>
              </TouchableOpacity>

              <View style={styles.memoryActionDivider} />

              <TouchableOpacity
                style={styles.memoryActionBtn}
                onPress={() => handleAskQuickQuestion(`How can I best execute my ${activeFocus} move today as an ${zodiacName}?`)}
                activeOpacity={0.7}
              >
                <MessageSquare size={13} color={isDark ? '#C084FC' : '#7209B7'} style={{ marginRight: 4 }} />
                <Text style={[styles.memoryActionBtnText, isDark && { color: '#C084FC' }]}>Ask Hope</Text>
              </TouchableOpacity>

              <View style={styles.memoryActionDivider} />

              <TouchableOpacity
                style={styles.memoryActionBtn}
                onPress={handleSetReminder}
                activeOpacity={0.7}
              >
                <Zap size={13} color={isDark ? '#C084FC' : '#7209B7'} style={{ marginRight: 4 }} />
                <Text style={[styles.memoryActionBtnText, isDark && { color: '#C084FC' }]}>Best time</Text>
              </TouchableOpacity>
            </View>
          </View>
          {/* Jagged Deckled Paper Bottom Edge */}
          <TornBottomEdge width={width - 32} color={isDark ? '#1E162D' : '#FDFBF7'} />
        </View>

        {/* ══════════════════════════════════════════════════════════
            6. LUCKY METRICS ROW
           ══════════════════════════════════════════════════════════ */}
        <View style={styles.luckyMetricsContainer}>
          <View style={[styles.luckyMetricCard, isDark && styles.luckyMetricCardDark]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <View style={[styles.luckyColorDot, { backgroundColor: luckyData.colorCode }]} />
              <Text style={styles.luckyMetricLabel}>LUCKY COLOR</Text>
            </View>
            <Text style={[styles.luckyMetricVal, isDark && { color: '#FFFFFF' }]}>{luckyData.color}</Text>
          </View>

          <View style={[styles.luckyMetricCard, isDark && styles.luckyMetricCardDark]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Hash size={11} color="#D97706" />
              <Text style={styles.luckyMetricLabel}>LUCKY NUMBERS</Text>
            </View>
            <Text style={[styles.luckyMetricVal, isDark && { color: '#D97706' }]}>{luckyData.num}</Text>
          </View>

          <View style={[styles.luckyMetricCard, isDark && styles.luckyMetricCardDark]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Compass size={11} color="#03B07A" />
              <Text style={styles.luckyMetricLabel}>DIRECTION</Text>
            </View>
            <Text style={[styles.luckyMetricVal, isDark && { color: '#FFFFFF' }]}>{luckyData.dir}</Text>
          </View>
        </View>

        {/* ══════════════════════════════════════════════════════════
            7. SECTION 4: "HOPE SAYS," (Lilac Glass Card)
           ══════════════════════════════════════════════════════════ */}
        <LinearGradient
          colors={isDark ? ['#2D1B4E', '#1F1238'] : ['#EFE6FB', '#DFD0F7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hopeAdviceCard, isDark && styles.hopeAdviceCardDark]}
        >
          <View style={styles.hopeCardContentRow}>
            {/* Hope Portrait Avatar */}
            <Image source={HOPE_AVATAR} style={styles.hopeAvatarImage} resizeMode="cover" />

            {/* Hope Advice Text */}
            <View style={styles.hopeTextColumn}>
              <Text style={[styles.hopeSaysLabel, isDark && { color: 'rgba(255,255,255,0.75)' }]}>
                Hope says,
              </Text>
              <Text style={[styles.hopeQuoteText, isDark && { color: '#FFFFFF' }]}>
                {dailyDecision?.guidance || `Today is about confident expression in ${activeFocus}. One honest conversation can change the direction of the day.`}
              </Text>

              {/* Chat with Hope CTA Button */}
              <View style={styles.hopeCtaRow}>
                <TouchableOpacity
                  style={styles.chatWithHopeButton}
                  onPress={() => handleAskQuickQuestion(`What should I focus on for ${activeFocus} today?`)}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={['#5E2B97', '#8E36B2']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.chatWithHopeGradient}
                  >
                    <Text style={styles.chatWithHopeBtnText}>Chat with Hope</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <Text style={[styles.tapToChatDoodle, isDark && { color: 'rgba(255,255,255,0.6)' }]}>
                  ⤹ Tap to chat with Hope
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* ══════════════════════════════════════════════════════════
            8. PRESET QUESTIONS & INTERACTIVE ASKING BAR (No Emojis)
           ══════════════════════════════════════════════════════════ */}
        <View style={[styles.presetQuestionsContainer, isDark && styles.presetQuestionsContainerDark]}>
          <Text style={[styles.presetQuestionsTitle, isDark && { color: 'rgba(255,255,255,0.75)' }]}>
            ASK ORACLE / HOPE ABOUT TODAY
          </Text>

          {/* Preset Chips */}
          <View style={styles.presetChipsRow}>
            {[
              { label: 'Planetary Weather', q: `What is the planetary weather and cosmic energy for ${zodiacName} today?`, icon: CloudSun },
              { label: 'What to Wear', q: `Based on my astrology and lucky color (${luckyData.color}), what outfit should I wear today?`, icon: Shirt },
              { label: 'Career Move', q: `What is the single biggest career or financial opportunity for me today?`, icon: Briefcase },
              { label: 'Love & Chemistry', q: `What does my romantic and relationship horoscope look like today?`, icon: Heart },
            ].map((chip, idx) => {
              const IconComp = chip.icon;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.presetChip, isDark && styles.presetChipDark]}
                  activeOpacity={0.75}
                  onPress={() => handleAskQuickQuestion(chip.q)}
                >
                  <IconComp size={12} color={isDark ? '#D8B4F8' : '#7209B7'} style={{ marginRight: 5 }} />
                  <Text style={[styles.presetChipText, isDark && { color: '#F4EFFC' }]}>{chip.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Interactive Input Bar */}
          <View style={[styles.interactiveInputBar, isDark && styles.interactiveInputBarDark]}>
            <Sparkles size={14} color="#C49B44" style={{ marginRight: 6 }} />
            <TextInput
              style={[styles.interactiveInput, isDark && { color: '#FFFFFF' }]}
              placeholder="Ask Hope about your alignment today…"
              placeholderTextColor={isDark ? 'rgba(255,255,255,0.45)' : '#9E9BB3'}
              value={customQuestion}
              onChangeText={setCustomQuestion}
              onSubmitEditing={handleCustomQuestionSubmit}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[styles.sendQuestionBtn, !customQuestion.trim() && { opacity: 0.5 }]}
              onPress={handleCustomQuestionSubmit}
              disabled={!customQuestion.trim()}
              activeOpacity={0.8}
            >
              <Send size={13} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ══════════════════════════════════════════════════════════
            9. ASTRO TOOLS QUICK LAUNCHERS (Calendar & StyleForecaster)
           ══════════════════════════════════════════════════════════ */}
        <View style={styles.toolsLaunchersRow}>
          <TouchableOpacity
            style={[styles.toolCard, isDark && styles.toolCardDark]}
            activeOpacity={0.85}
            onPress={() => { haptic.press(); setCurrentView('astro-calendar'); }}
          >
            <Calendar size={18} color="#D97706" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[styles.toolCardTitle, isDark && { color: '#F4EFFC' }]}>Astro Calendar</Text>
              <Text style={[styles.toolCardSub, isDark && { color: 'rgba(255,255,255,0.65)' }]}>Planets, transits & notes</Text>
            </View>
            <ChevronRight size={16} color="#726F8D" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toolCard, isDark && styles.toolCardDark]}
            activeOpacity={0.85}
            onPress={handleOpenStyleForecaster}
          >
            <Sparkles size={18} color="#9B51E0" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[styles.toolCardTitle, isDark && { color: '#F4EFFC' }]}>Style Forecaster</Text>
              <Text style={[styles.toolCardSub, isDark && { color: 'rgba(255,255,255,0.65)' }]}>Cosmic daily attire</Text>
            </View>
            <ChevronRight size={16} color="#726F8D" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ══════════════════════════════════════════════════════════
          INSIGHT MODAL (Details & Explanations)
         ══════════════════════════════════════════════════════════ */}
      <Modal
        visible={insightModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setInsightModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, isDark && styles.modalCardDark]}>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setInsightModalVisible(false)}
              activeOpacity={0.7}
            >
              <X size={18} color="#726F8D" />
            </TouchableOpacity>

            <View style={styles.modalHeaderRow}>
              <Sparkles size={18} color="#9B51E0" />
              <Text style={[styles.modalTitle, isDark && { color: '#F4EFFC' }]}>
                {insightModalContent.title}
              </Text>
            </View>

            <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
              <Text style={[styles.modalBodyText, isDark && { color: 'rgba(255,255,255,0.85)' }]}>
                {insightModalContent.body}
              </Text>
            </ScrollView>

            <TouchableOpacity
              style={styles.modalDismissBtn}
              onPress={() => setInsightModalVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalDismissBtnText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  rootContainerDark: {
    backgroundColor: 'transparent',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },

  /* 1. GREETING & DATE */
  greetingDateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginVertical: 10,
  },
  greetingLeft: {
    flex: 1,
  },
  greetingLabel: {
    fontFamily: 'SourceSerif4',
    fontSize: 15,
    color: '#4A485B',
  },
  nameUnderlineContainer: {
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  userNameScript: {
    fontFamily: 'SourceSerif4-Bold',
    fontStyle: 'italic',
    fontSize: 25,
    color: '#22153B',
  },
  scriptUnderline: {
    height: 2,
    backgroundColor: '#8E36B2',
    borderRadius: 1,
    marginTop: 2,
    width: '100%',
  },
  dateRight: {
    alignItems: 'flex-end',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(217, 119, 6, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.3)',
    marginBottom: 4,
  },
  streakBadgeText: {
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 11,
    color: '#D97706',
    marginLeft: 3,
  },
  dateDayUpper: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 10,
    color: '#726F8D',
    letterSpacing: 1.2,
  },
  dateMonthDay: {
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 20,
    color: '#22153B',
    marginTop: 1,
  },

  /* 2. SECTION 1: POLAROID ZODIAC & QUOTE */
  parchmentSectionCard: {
    backgroundColor: '#FDFBF7',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#EFE6D5',
    padding: 16,
    shadowColor: '#2C2B3D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 14,
  },
  parchmentSectionCardDark: {
    backgroundColor: 'rgba(28, 20, 48, 0.82)',
    borderColor: 'rgba(168, 85, 247, 0.28)',
  },
  polaroidQuoteRow: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  polaroidBox: {
    width: 124,
    backgroundColor: '#FDFBF7',
    borderRadius: 12,
    padding: 8,
    paddingTop: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E1CE',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
    transform: [{ rotate: '-1.5deg' }], // Tactile polaroid angle
  },
  polaroidBoxDark: {
    backgroundColor: 'rgba(34, 24, 58, 0.92)',
    borderColor: 'rgba(168, 85, 247, 0.35)',
  },
  washiTape: {
    position: 'absolute',
    top: -8,
    width: 44,
    height: 14,
    backgroundColor: 'rgba(230, 220, 195, 0.85)',
    borderRadius: 2,
    borderWidth: 0.5,
    borderColor: 'rgba(200, 190, 160, 0.6)',
    transform: [{ rotate: '3deg' }], // Slight organic tape tilt
  },
  polaroidWatercolorCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    shadowColor: '#9B51E0',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  polaroidGlyph: {
    fontSize: 28,
    color: '#FFFFFF',
  },
  polaroidTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 12,
    color: '#22153B',
    letterSpacing: 1,
    marginTop: 8,
  },
  polaroidTraits: {
    fontFamily: 'SourceSerif4',
    fontSize: 9,
    color: '#726F8D',
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 4,
  },
  quoteRightColumn: {
    flex: 1,
    position: 'relative',
    paddingRight: 6,
  },
  sectionShareButton: {
    position: 'absolute',
    top: -4,
    right: -2,
    padding: 6,
    zIndex: 5,
  },
  bigQuoteMark: {
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 28,
    color: '#9B51E0',
    lineHeight: 24,
    marginBottom: -4,
  },
  dailyQuoteText: {
    fontFamily: 'SourceSerif4',
    fontSize: 13,
    lineHeight: 19,
    color: '#3B384E',
    fontStyle: 'italic',
  },
  quoteHeartRow: {
    alignItems: 'flex-end',
    marginTop: 6,
  },

  /* 3. FOCUS PILLS */
  focusPillsContainer: {
    marginBottom: 14,
  },
  focusPillsHeader: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 9.5,
    color: '#726F8D',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  focusPillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  focusPillItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FDFBF7',
    paddingVertical: 7,
    paddingHorizontal: 4,
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#ECE2CD',
  },
  focusPillItemDark: {
    backgroundColor: '#1E162D',
    borderColor: 'rgba(168, 85, 247, 0.25)',
  },
  focusPillText: {
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 11,
    color: '#4A485B',
  },

  /* 4. SECTION 2: TODAY AT A GLANCE (Uneven Shapes) */
  glanceContainer: {
    marginBottom: 14,
  },
  glanceHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  glanceHeaderTitle: {
    fontFamily: 'SourceSerif4-Bold',
    fontStyle: 'italic',
    fontSize: 17,
    color: '#2C2B3D',
  },
  miniShareBtn: {
    padding: 4,
  },
  glanceColumnsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  glanceCard: {
    flex: 1,
    backgroundColor: '#FDFBF7',
    padding: 10,
    borderWidth: 1.2,
    borderColor: '#ECE3D0',
    justifyContent: 'space-between',
    shadowColor: '#2C2B3D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    minHeight: 135,
  },
  glanceCardUneven1: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 14,
  },
  glanceCardUneven2: {
    borderTopLeftRadius: 13,
    borderTopRightRadius: 19,
    borderBottomRightRadius: 14,
    borderBottomLeftRadius: 21,
  },
  glanceCardUneven3: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 14,
    borderBottomRightRadius: 18,
    borderBottomLeftRadius: 12,
  },
  glanceCardDark: {
    backgroundColor: '#1E162D',
    borderColor: 'rgba(168, 85, 247, 0.25)',
  },
  glanceCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  glanceCardHeading: {
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 11,
  },
  glanceCardBody: {
    fontFamily: 'SourceSerif4',
    fontSize: 10.5,
    lineHeight: 14.5,
    color: '#4A485B',
    marginBottom: 6,
  },
  glanceTimeText: {
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 11.5,
    color: '#7E22CE',
    marginBottom: 2,
  },
  glanceCardSubtext: {
    fontFamily: 'SourceSerif4',
    fontSize: 9.5,
    lineHeight: 13,
    color: '#726F8D',
    marginBottom: 6,
  },
  glanceActionLink: {
    marginTop: 'auto',
    paddingTop: 4,
  },
  glanceActionText: {
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 10.5,
    color: '#7E22CE',
  },

  /* 5. TORN DECKLED CARD CONTAINER */
  tornCardContainer: {
    marginBottom: 14,
  },
  memorySectionCard: {
    backgroundColor: '#FDFBF7',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1.5,
    borderBottomWidth: 0,
    borderColor: '#ECE2CD',
    padding: 16,
    paddingBottom: 10,
    shadowColor: '#2C2B3D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    position: 'relative',
  },
  memorySectionCardDark: {
    backgroundColor: '#1E162D',
    borderColor: 'rgba(168, 85, 247, 0.25)',
  },
  memorySectionShare: {
    position: 'absolute',
    top: 14,
    right: 14,
    padding: 4,
    zIndex: 5,
  },
  memoryNoteHeader: {
    fontFamily: 'SourceSerif4',
    fontSize: 11.5,
    color: '#726F8D',
    marginBottom: 6,
  },
  memoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  memoryTitleScript: {
    fontFamily: 'SourceSerif4-Bold',
    fontStyle: 'italic',
    fontSize: 19,
    color: '#2C1B4D',
  },
  memorySubtext: {
    fontFamily: 'SourceSerif4',
    fontSize: 12.5,
    lineHeight: 18,
    color: '#4A485B',
    marginBottom: 10,
  },
  movesOptionsList: {
    gap: 6,
    marginBottom: 10,
  },
  moveOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4EFE6',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E6DCB8',
  },
  moveOptionRowDark: {
    backgroundColor: '#161122',
    borderColor: 'rgba(168, 85, 247, 0.2)',
  },
  moveOptionRowSelected: {
    borderColor: '#7209B7',
    backgroundColor: 'rgba(114, 9, 183, 0.08)',
  },
  radioCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#726F8D',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  radioCircleSelected: {
    borderColor: '#7209B7',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#7209B7',
  },
  moveOptionText: {
    flex: 1,
    fontFamily: 'SourceSerif4',
    fontSize: 11.5,
    color: '#2C2B3D',
  },
  memoryTimePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(126, 87, 194, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(126, 87, 194, 0.25)',
    marginBottom: 12,
  },
  memoryTimePillText: {
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 12.5,
    color: '#6B21A8',
  },
  memoryActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#ECE2CD',
    paddingTop: 10,
  },
  memoryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  memoryActionBtnText: {
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 11,
    color: '#6B21A8',
  },
  memoryActionDivider: {
    width: 1,
    height: 14,
    backgroundColor: '#ECE2CD',
  },

  /* 6. LUCKY METRICS */
  luckyMetricsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  luckyMetricCard: {
    flex: 1,
    backgroundColor: '#FDFBF7',
    borderRadius: 14,
    padding: 9,
    borderWidth: 1.2,
    borderColor: '#ECE2CD',
    alignItems: 'center',
  },
  luckyMetricCardDark: {
    backgroundColor: '#1E162D',
    borderColor: 'rgba(168, 85, 247, 0.25)',
  },
  luckyColorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  luckyMetricLabel: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 8.5,
    color: '#726F8D',
    letterSpacing: 0.8,
  },
  luckyMetricVal: {
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 11.5,
    color: '#2C2B3D',
    marginTop: 3,
  },

  /* 7. HOPE SAYS CARD */
  hopeAdviceCard: {
    borderRadius: 22,
    padding: 16,
    borderWidth: 1.2,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    marginBottom: 14,
    shadowColor: '#6B21A8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  hopeAdviceCardDark: {
    borderColor: 'rgba(168, 85, 247, 0.35)',
  },
  hopeCardContentRow: {
    flexDirection: 'row',
    gap: 12,
  },
  hopeAvatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  hopeTextColumn: {
    flex: 1,
  },
  hopeSaysLabel: {
    fontFamily: 'SourceSerif4',
    fontSize: 12,
    color: '#554A6E',
    marginBottom: 2,
  },
  hopeQuoteText: {
    fontFamily: 'SourceSerif4',
    fontStyle: 'italic',
    fontSize: 13,
    lineHeight: 19,
    color: '#2C1B4D',
    marginBottom: 10,
  },
  hopeCtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  chatWithHopeButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  chatWithHopeGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
  },
  chatWithHopeBtnText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 11.5,
    color: '#FFFFFF',
  },
  tapToChatDoodle: {
    fontFamily: 'SourceSerif4',
    fontStyle: 'italic',
    fontSize: 10.5,
    color: '#726F8D',
  },

  /* 8. PRESET QUESTIONS & INTERACTIVE BAR */
  presetQuestionsContainer: {
    backgroundColor: '#FDFBF7',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.2,
    borderColor: '#ECE2CD',
    marginBottom: 14,
  },
  presetQuestionsContainerDark: {
    backgroundColor: '#1E162D',
    borderColor: 'rgba(168, 85, 247, 0.25)',
  },
  presetQuestionsTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 9.5,
    color: '#726F8D',
    letterSpacing: 1,
    marginBottom: 10,
  },
  presetChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2ECE1',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E6DCB8',
  },
  presetChipDark: {
    backgroundColor: '#161122',
    borderColor: 'rgba(168, 85, 247, 0.2)',
  },
  presetChipText: {
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 11,
    color: '#2C2B3D',
  },
  interactiveInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E6DCB8',
  },
  interactiveInputBarDark: {
    backgroundColor: '#161122',
    borderColor: 'rgba(168, 85, 247, 0.2)',
  },
  interactiveInput: {
    flex: 1,
    fontFamily: 'SourceSerif4',
    fontSize: 12,
    color: '#2C2B3D',
    paddingVertical: 6,
  },
  sendQuestionBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#7209B7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* 9. TOOLS LAUNCHERS */
  toolsLaunchersRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  toolCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDFBF7',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.2,
    borderColor: '#ECE3D0',
    shadowColor: '#2C2B3D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  toolCardDark: {
    backgroundColor: '#1E162D',
    borderColor: 'rgba(168, 85, 247, 0.25)',
  },
  toolCardTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 11,
    color: '#2C2B3D',
  },
  toolCardSub: {
    fontFamily: 'SourceSerif4',
    fontSize: 9.5,
    color: '#726F8D',
    marginTop: 1,
  },

  /* MODAL */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(30, 20, 50, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FAF7F0',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#E6DCB8',
    position: 'relative',
    shadowColor: '#4A154B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  modalCardDark: {
    backgroundColor: '#1E162D',
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 5,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(114, 111, 141, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  modalTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 15,
    color: '#2C2B3D',
  },
  modalBodyText: {
    fontFamily: 'SourceSerif4',
    fontSize: 13.5,
    lineHeight: 21,
    color: '#4A485B',
    marginBottom: 16,
  },
  modalDismissBtn: {
    backgroundColor: '#7209B7',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  modalDismissBtnText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 13,
    color: '#FFFFFF',
  },
});
