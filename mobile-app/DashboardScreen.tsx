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
  Platform,
  Animated,
  Easing,
  Alert,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
let RNIap: any = null;
try {
  RNIap = require('react-native-iap');
} catch (e) {
  // Silent fallback for Expo Go
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
  getOracleDisclosure,
  fetchCredits,
  verifyIAPPayment,
  deleteAccount,
} from './api';
import HopeDisclosureModal from './HopeDisclosureModal';
import RecalculationProgressModal from './components/common/RecalculationProgressModal';
import { CosmicDatePickerModal, CosmicTimePickerModal } from './components/common/CosmicDateTimePickerModal';
import CosmicStarField from './components/common/CosmicStarField';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import GoldCoin from './components/common/GoldCoin';
import {
  ArrowLeft,
  Sparkles,
  Compass,
  Calendar,
  Grid,
  MessageSquare,
  X,
  Lock,
  Smile,
  Shirt,
  Info,
} from 'lucide-react-native';

import type PalmReadingScreenComp from './PalmReadingScreen';
import type FaceReadingScreenComp from './FaceReadingScreen';
import type CoffeeReadingScreenComp from './CoffeeReadingScreen';
import type StyleForecasterScreenComp from './StyleForecasterScreen';
import type TarotReadingScreenComp from './TarotReadingScreen';
import type AstroCalendarScreenComp from './AstroCalendarScreen';
import type Astrology8BallScreenComp from './Astrology8BallScreen';
import type VastuConsultantScreenComp from './VastuConsultantScreen';
import { ShareCardModal } from './ShareCardModal';
import { ShareCardData } from './shareUtils';
import { haptic } from './haptics';
import { useTheme } from './theme';

import {
  DAYS,
  MONTHS,
  YEARS,
  HOURS,
  MINUTES,
  ZODIAC_ICONS,
  parseDayAndMonth,
  getZodiacInfo,
  DAILY_LUCKY_MATRIX,
} from './constants/astrology';

// Modular Feature Screens
import TodayScreen from './features/today/TodayScreen';
import BirthChartScreen from './features/charts/BirthChartScreen';
import NumerologyScreen from './features/numerology/NumerologyScreen';
import ExploreScreen from './features/explore/ExploreScreen';
import HopeChatScreen, { ChatMessage } from './features/chat/HopeChatScreen';
import ProfileScreen from './features/profile/ProfileScreen';

// Lazily load sub-screens
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
const Astrology8BallScreen = (props: React.ComponentProps<typeof Astrology8BallScreenComp>) => {
  const Screen = require('./Astrology8BallScreen').default;
  return <Screen {...props} />;
};
const VastuConsultantScreen = (props: React.ComponentProps<typeof VastuConsultantScreenComp>) => {
  const Screen = require('./VastuConsultantScreen').default;
  return <Screen {...props} />;
};

interface DashboardScreenProps {
  answers?: Record<string, string>;
  token?: string | null;
  onLogout: () => void;
}

export default function DashboardScreen({ answers = {}, token = null, onLogout }: DashboardScreenProps) {
  const { width, height } = useWindowDimensions();
  const { theme, isDark, setMode } = useTheme();
  const insets = useSafeAreaInsets();

  // Navigation active tab: today | readings | numerology | chat | charts | profile
  const [activeTab, setActiveTab] = useState<'today' | 'readings' | 'numerology' | 'chat' | 'charts' | 'profile'>('today');
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [credits, setCredits] = useState<number>(0);

  const [profileAnswers, setProfileAnswers] = useState<Record<string, string>>(answers);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editBirthdate, setEditBirthdate] = useState('');
  const [editBirthtime, setEditBirthtime] = useState('');
  const [editBirthplace, setEditBirthplace] = useState('');
  const [editCurrentLocation, setEditCurrentLocation] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Daily streak
  const [streak, setStreak] = useState(0);

  // Focus & moves state for Today
  const [activeFocus, setActiveFocus] = useState<'Work' | 'Love' | 'Mind' | 'Money'>('Work');
  const [selectedMove, setSelectedMove] = useState<string | null>(null);
  const [outcomeFeedback, setOutcomeFeedback] = useState<Record<string, 'Happened' | 'Didnt' | null>>({
    Work: null,
    Love: null,
    Mind: null,
    Money: null,
  });

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

  const [styleForecasterOpen, setStyleForecasterOpen] = useState(false);

  // Recalculation Progress state
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [recalcProgress, setRecalcProgress] = useState(0);
  const [recalcStepText, setRecalcStepText] = useState('Updating profile...');
  const [recalcComplete, setRecalcComplete] = useState(false);

  // Chat Tab states
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello ${profileAnswers.full_name || 'there'}! I'm Hope, your personal astrologer and cosmic guide. Ask me anything about your horoscope, love life, career, or daily alignment.`
    }
  ]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [oracleDisclosure, setOracleDisclosure] = useState<{ loaded: boolean; accepted: boolean; text?: string; version?: string }>({ loaded: false, accepted: false });
  const [oracleFeed, setOracleFeed] = useState<any>(null);
  const chatListRef = useRef<FlatList>(null);

  // Real API states
  const [apiBirthChart, setApiBirthChart] = useState<any>(null);
  const [apiNumerology, setApiNumerology] = useState<any>(null);
  const [readingHistory, setReadingHistory] = useState<any[]>([]);

  // Navigation tab animation scales
  const tabTodayScale = useRef(new Animated.Value(1)).current;
  const tabReadingsScale = useRef(new Animated.Value(0)).current;
  const tabNumerologyScale = useRef(new Animated.Value(0)).current;
  const tabChartsScale = useRef(new Animated.Value(0)).current;

  const triggerShareCard = (cardData: ShareCardData) => {
    setShareModalData(cardData);
    setShareModalVisible(true);
  };

  const userName = profileAnswers.full_name || profileAnswers.name || 'User';
  const birthdate = profileAnswers.date_of_birth || profileAnswers.birthdate || '';
  const parsedDm = parseDayAndMonth(birthdate);
  const zodiac = parsedDm ? getZodiacInfo(parsedDm.day, parsedDm.month) : getZodiacInfo(21, 3);
  const zodiacIndex = Math.max(0, (zodiac?.index || 1) - 1);

  // Deterministic calculation helpers
  const calculateLifePathNumber = (dateStr: string): number => {
    if (!dateStr) return 7;
    const digits = dateStr.replace(/\D/g, '');
    if (!digits) return 7;
    let sum = digits.split('').reduce((acc, d) => acc + parseInt(d, 10), 0);
    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
      sum = String(sum).split('').reduce((acc, d) => acc + parseInt(d, 10), 0);
    }
    return sum;
  };

  const calculateDestinyNumber = (nameStr: string): number => {
    if (!nameStr || !nameStr.trim()) return 3;
    const pythagoreanMap: Record<string, number> = {
      a: 1, j: 1, s: 1,
      b: 2, k: 2, t: 2,
      c: 3, l: 3, u: 3,
      d: 4, m: 4, v: 4,
      e: 5, n: 5, w: 5,
      f: 6, o: 6, x: 6,
      g: 7, p: 7, y: 7,
      h: 8, q: 8, z: 8,
      i: 9, r: 9,
    };
    let sum = 0;
    for (const char of nameStr.toLowerCase()) {
      if (pythagoreanMap[char]) sum += pythagoreanMap[char];
    }
    if (sum === 0) return 3;
    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
      sum = String(sum).split('').reduce((acc, d) => acc + parseInt(d, 10), 0);
    }
    return sum;
  };

  const numObj = apiNumerology?.data || apiNumerology || {};
  const lifePathNumber = numObj.life_path || calculateLifePathNumber(birthdate);
  const destinyNumber = numObj.destiny_number || numObj.destiny || calculateDestinyNumber(userName);

  useEffect(() => {
    if (token) {
      setAuthToken(token);
    }
  }, [token]);

  // Initial data loading
  useEffect(() => {
    fetchBirthChart()
      .then(res => { if (res?.data) setApiBirthChart(res.data); })
      .catch(() => {});

    getNumerologyData()
      .then(res => {
        if (res?.numerology) setApiNumerology(res.numerology);
        else generateInsights().then(() => getNumerologyData().then(r => r?.numerology && setApiNumerology(r.numerology))).catch(() => {});
      })
      .catch(() => {});

    fetchCredits()
      .then(res => { if (typeof res?.credits === 'number') setCredits(res.credits); })
      .catch(() => {});

    getReadingHistory('palm')
      .then(r => { if (r?.readings) setReadingHistory(prev => [...prev, ...r.readings.map((x: any) => ({ ...x, category: 'Palmistry Scan' }))]); })
      .catch(() => {});

    getOracleDisclosure()
      .then(response => setOracleDisclosure({ loaded: true, ...(response?.data || { accepted: false }) }))
      .catch(() => setOracleDisclosure(current => ({ ...current, loaded: true, accepted: false })));

    fetchChatList()
      .then(async listRes => {
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
              text: m.content || m.text || '',
              oracleMetadata: m.oracle_metadata
            })));
          }
        }
      })
      .catch(() => {});
  }, []);

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr >= 5 && hr < 12) return 'Good morning,';
    if (hr >= 12 && hr < 17) return 'Good afternoon,';
    if (hr >= 17 && hr < 22) return 'Good evening,';
    return 'Good night,';
  };

  const activeFocusLower = activeFocus.toLowerCase();
  const apiQuadrant = dailyDecision?.quadrants?.[activeFocusLower];
  const activeData = apiQuadrant ? {
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
    moves: ['Embrace today\'s natural flow with mindfulness'],
    doList: ['Stay grounded in your authentic intentions', 'Take mindful pauses between tasks'],
    avoidList: ['Overcommitting to urgent requests'],
    powerWindow: '9:00 - 11:30 AM',
    avoidAfter: '8:00 PM',
    prediction: 'Cosmic transits suggest high intuition and productive clarity.',
    rationale: 'Align your efforts with natural celestial flow for steady progress.',
  });

  const handleChatSend = async (method = 'astrology', explicitText?: string) => {
    const pendingText = (explicitText || chatInput).trim();
    if (!pendingText) return;
    const userMsgId = `user_${Date.now()}`;
    const userText = pendingText;

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
        const response = await sendChatMessage(chatId, userText, method);
        if (response && typeof response.remaining_credits === 'number') {
          setCredits(response.remaining_credits);
        }
        const aiMessageText = response?.data?.aiMessage?.content || response?.data?.content || response?.message || response?.reply || response?.content || response?.data?.message;
        if (!aiMessageText) throw new Error('Empty AI response');
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
      setChatMessages(prev => [
        ...prev,
        {
          id: `ai_err_${Date.now()}`,
          sender: 'ai',
          text: "I'm having trouble connecting with the stars right now. Please try again in a moment."
        }
      ]);
    } finally {
      setIsAiTyping(false);
    }
  };

  const changeTab = (tab: 'today' | 'readings' | 'numerology' | 'chat' | 'charts' | 'profile') => {
    haptic.press();
    setActiveTab(tab);
    Animated.parallel([
      Animated.timing(tabTodayScale, { toValue: tab === 'today' ? 1 : 0, duration: 250, easing: Easing.bezier(0.4, 0, 0.2, 1), useNativeDriver: true }),
      Animated.timing(tabReadingsScale, { toValue: tab === 'readings' ? 1 : 0, duration: 250, easing: Easing.bezier(0.4, 0, 0.2, 1), useNativeDriver: true }),
      Animated.timing(tabNumerologyScale, { toValue: tab === 'numerology' ? 1 : 0, duration: 250, easing: Easing.bezier(0.4, 0, 0.2, 1), useNativeDriver: true }),
      Animated.timing(tabChartsScale, { toValue: tab === 'charts' ? 1 : 0, duration: 250, easing: Easing.bezier(0.4, 0, 0.2, 1), useNativeDriver: true }),
    ]).start();
  };

  const startEditing = () => {
    setEditFullName(userName);
    setEditBirthdate(birthdate);
    setEditBirthtime(profileAnswers.birthtime || profileAnswers.time_of_birth || '');
    setEditBirthplace(profileAnswers.birthplace || profileAnswers.place_of_birth || '');
    setEditCurrentLocation(profileAnswers.current_location || '');
    setIsEditingProfile(true);
  };

  const saveProfileDetails = async (isBirthRecalc = false) => {
    try {
      const updated = {
        ...profileAnswers,
        full_name: editFullName,
        name: editFullName,
        date_of_birth: editBirthdate,
        birthdate: editBirthdate,
        birthtime: editBirthtime,
        time_of_birth: editBirthtime,
        birthplace: editBirthplace,
        place_of_birth: editBirthplace,
        current_location: editCurrentLocation,
      };
      setProfileAnswers(updated);
      setIsEditingProfile(false);

      if (isBirthRecalc) {
        setIsRecalculating(true);
        setRecalcProgress(15);
        setRecalcStepText('Saving updated birth details...');
        setRecalcComplete(false);

        await saveBasicProfile({
          full_name: editFullName,
          date_of_birth: editBirthdate,
          time_of_birth: editBirthtime,
          place_of_birth: editBirthplace,
          current_location: editCurrentLocation,
        });

        setRecalcProgress(45);
        setRecalcStepText('Aligning planetary coordinates & ephemeris...');

        try {
          await generateInsights(true);
        } catch (e) {}

        setRecalcProgress(75);
        setRecalcStepText('Computing 12 Houses, Kundli & Western charts...');

        // Refresh birth chart and numerology
        const [bcRes, numRes] = await Promise.allSettled([
          fetchBirthChart(),
          getNumerologyData(),
        ]);

        if (bcRes.status === 'fulfilled' && bcRes.value?.data) {
          setApiBirthChart(bcRes.value.data);
        }
        if (numRes.status === 'fulfilled' && numRes.value?.numerology) {
          setApiNumerology(numRes.value.numerology);
        }

        setRecalcProgress(100);
        setRecalcComplete(true);
        setRecalcStepText('Cosmic alignment successfully updated!');
        haptic.success();

        setTimeout(() => {
          setIsRecalculating(false);
        }, 1100);
      } else {
        // Direct save for Full Name / Current Location without heavy recalculations
        await saveBasicProfile({
          full_name: editFullName,
          date_of_birth: editBirthdate,
          time_of_birth: editBirthtime,
          place_of_birth: editBirthplace,
          current_location: editCurrentLocation,
        });
        haptic.success();
      }
    } catch (e) {
      setIsRecalculating(false);
      Alert.alert('Save Error', 'Failed to save updated profile details.');
    }
  };

  const checkPermissions = async () => {
    try {
      const cam = await ImagePicker.getCameraPermissionsAsync();
      const lib = await ImagePicker.getMediaLibraryPermissionsAsync();
      setCameraPermissionGranted(cam.status === 'granted');
      setLibraryPermissionGranted(lib.status === 'granted');
    } catch (e) {}
  };

  const toggleCameraPermission = async () => {
    try {
      const cam = await ImagePicker.requestCameraPermissionsAsync();
      setCameraPermissionGranted(cam.status === 'granted');
    } catch (e) {}
  };

  const toggleLibraryPermission = async () => {
    try {
      const lib = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setLibraryPermissionGranted(lib.status === 'granted');
    } catch (e) {}
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account permanently? ⚠️',
      'This will immediately and permanently delete your user profile, purchase records, chats, and reports. This action CANNOT be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Permanently Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
              onLogout();
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Failed to delete account.');
            }
          }
        }
      ]
    );
  };

  const handlePurchase = async (bundleId: string, bundleName: string, addCount: number) => {
    try {
      setIsPurchasingCredit(true);
      if (!RNIap || !RNIap.requestSubscription) {
        Alert.alert(
          'Expo Go Mock Billing 🪙',
          `Simulate successful purchase of ${bundleName} (${addCount} Cosmic Credits)?`,
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
                    Alert.alert('Purchase Success!', `Added ${addCount} Cosmic Credits.`);
                  }
                } catch (err: any) {
                  Alert.alert('Verification Error', err.message || 'Error communicating with backend.');
                }
              }
            }
          ]
        );
        return;
      }
      await RNIap.requestPurchase({ sku: bundleId });
    } catch (err: any) {
      if (err.code !== 'E_USER_CANCELLED') {
        Alert.alert('Payment Error', err?.message || 'Failed to initialize payment.');
      }
    } finally {
      setIsPurchasingCredit(false);
    }
  };

  const handleOpenStyleForecaster = () => {
    setCurrentView('style-forecaster');
  };

  return (
    <View style={styles.container}>
      <HopeDisclosureModal
        visible={oracleDisclosure.loaded && !oracleDisclosure.accepted}
        text={oracleDisclosure.text}
        version={oracleDisclosure.version}
        onAccepted={() => setOracleDisclosure(current => ({ ...current, accepted: true }))}
      />

      {currentView === 'palm-reading' ? (
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
      ) : currentView === 'face-reading' ? (
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
      ) : currentView === 'coffee-reading' ? (
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
      ) : currentView === 'style-forecaster' ? (
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
      ) : currentView === 'tarot-reading' ? (
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
      ) : currentView === 'astro-calendar' ? (
        <AstroCalendarScreen
          answers={profileAnswers}
          onBack={() => setCurrentView('dashboard')}
        />
      ) : currentView === 'astrology-8ball' ? (
        <Astrology8BallScreen
          answers={profileAnswers}
          zodiacIndex={zodiacIndex}
          onBack={() => setCurrentView('dashboard')}
        />
      ) : currentView === 'vastu-consultant' ? (
        <VastuConsultantScreen
          answers={profileAnswers}
          zodiacIndex={zodiacIndex}
          onBack={() => setCurrentView('dashboard')}
          onUpdateCredits={(newBalance) => setCredits(newBalance)}
        />
      ) : (
        <LinearGradient
          colors={theme.gradient as any}
          locations={[0, 0.5, 1]}
          style={styles.gradientBg}
        >
          <StatusBar style={isDark ? 'light' : 'dark'} />
          {isDark && <CosmicStarField />}

          {/* Top Header */}
          <View style={[styles.header, { paddingTop: insets.top > 0 ? insets.top + 6 : 14 }]}>
            <View style={styles.headerLeftSlot}>
              {activeTab !== 'today' ? (
                <TouchableOpacity onPress={() => changeTab('today')} style={styles.logoutBtn} activeOpacity={0.7}>
                  <ArrowLeft size={20} color={isDark ? '#F0EEFF' : '#726F8D'} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    setCurrentProfileSubView('credits');
                    changeTab('profile');
                  }}
                  style={[styles.creditsPill, isDark && { backgroundColor: theme.bg.card, borderColor: theme.border }]}
                >
                  <GoldCoin size={18} style={{ marginRight: 6 }} />
                  <Text style={[styles.creditsText, isDark && { color: theme.text.primary }]}>{credits}</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.headerCenter}>
              <Text style={[styles.headerTitle, isDark && { color: theme.text.primary }]}>
                {activeTab === 'today' ? 'TODAY' :
                 activeTab === 'readings' ? 'EXPLORE' :
                 activeTab === 'numerology' ? 'NUMEROLOGY' :
                 activeTab === 'chat' ? 'HOPE' :
                 activeTab === 'charts' ? 'ASTRO MAP' : 'PROFILE'}
              </Text>
              <Text style={[styles.headerSubtitle, isDark && { color: theme.text.secondary }]}>Based on Vedic Astrology</Text>
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

          {/* Main Content Area */}
          <View style={styles.mainContent}>
            {activeTab === 'today' ? (
              <TodayScreen
                userName={userName}
                streak={streak}
                zodiac={zodiac}
                activeFocus={activeFocus}
                setActiveFocus={setActiveFocus}
                selectedMove={selectedMove}
                setSelectedMove={setSelectedMove}
                outcomeFeedback={outcomeFeedback}
                setOutcomeFeedback={setOutcomeFeedback}
                dailyDecision={dailyDecision}
                activeData={activeData}
                isTodayLoading={isTodayLoading}
                insets={insets}
                triggerShareCard={triggerShareCard}
                handleOpenStyleForecaster={handleOpenStyleForecaster}
                setCurrentView={setCurrentView}
                haptic={haptic}
                getGreeting={getGreeting}
              />
            ) : activeTab === 'readings' ? (
              <ExploreScreen
                insets={insets}
                readingHistory={readingHistory}
                setCurrentView={setCurrentView}
                handleOpenStyleForecaster={handleOpenStyleForecaster}
              />
            ) : activeTab === 'chat' ? (
              <HopeChatScreen
                answers={profileAnswers}
                zodiacIndex={zodiacIndex}
                insets={insets}
                chatMessages={chatMessages}
                isAiTyping={isAiTyping}
                chatInput={chatInput}
                setChatInput={setChatInput}
                handleChatSend={handleChatSend}
                chatListRef={chatListRef}
                onShareMessage={(msgText) => triggerShareCard({
                  category: 'HOPE ASTROLOGER GUIDANCE',
                  title: `Consultation with Hope`,
                  subtitle: `${zodiac?.name || 'Cosmic'} Alignment`,
                  readingText: msgText,
                  highlights: [
                    { label: 'Zodiac', value: zodiac?.name || 'Unavailable' },
                    { label: 'Consultant', value: 'Hope AI' },
                  ],
                })}
              />
            ) : activeTab === 'numerology' ? (
              <NumerologyScreen
                apiNumerology={apiNumerology}
                lifePathNumber={lifePathNumber}
                destinyNumber={destinyNumber}
                insets={insets}
                triggerShareCard={triggerShareCard}
              />
            ) : activeTab === 'charts' ? (
              <BirthChartScreen
                userName={userName}
                zodiac={zodiac}
                zodiacIndex={zodiacIndex}
                apiBirthChart={apiBirthChart}
                insets={insets}
                triggerShareCard={triggerShareCard}
              />
            ) : (
              <ProfileScreen
                userName={userName}
                birthdate={birthdate}
                profileAnswers={profileAnswers}
                zodiac={zodiac}
                credits={credits}
                setCredits={setCredits}
                insets={insets}
                isDark={isDark}
                setMode={setMode}
                isEditingProfile={isEditingProfile}
                setIsEditingProfile={setIsEditingProfile}
                editFullName={editFullName}
                setEditFullName={setEditFullName}
                editBirthdate={editBirthdate}
                setEditBirthdate={setEditBirthdate}
                editBirthtime={editBirthtime}
                setEditBirthtime={setEditBirthtime}
                editBirthplace={editBirthplace}
                setEditBirthplace={setEditBirthplace}
                editCurrentLocation={editCurrentLocation}
                setEditCurrentLocation={setEditCurrentLocation}
                notificationsEnabled={notificationsEnabled}
                setNotificationsEnabled={setNotificationsEnabled}
                startEditing={startEditing}
                saveProfileDetails={saveProfileDetails}
                currentProfileSubView={currentProfileSubView}
                setCurrentProfileSubView={setCurrentProfileSubView}
                previousProfileSubView={previousProfileSubView}
                setPreviousProfileSubView={setPreviousProfileSubView}
                setIsDatePickerVisible={setIsDatePickerVisible}
                setIsTimePickerVisible={setIsTimePickerVisible}
                setIsFeedbackModalOpen={setIsFeedbackModalOpen}
                cameraPermissionGranted={cameraPermissionGranted}
                libraryPermissionGranted={libraryPermissionGranted}
                toggleCameraPermission={toggleCameraPermission}
                toggleLibraryPermission={toggleLibraryPermission}
                checkPermissions={checkPermissions}
                handleDeleteAccount={handleDeleteAccount}
                onLogout={onLogout}
                isPurchasingCredit={isPurchasingCredit}
                handlePurchase={handlePurchase}
              />
            )}
          </View>

          {/* Custom Bottom Tab Bar */}
          {activeTab !== 'chat' && (
            <View style={[styles.bottomNavContainer, { bottom: insets.bottom > 0 ? insets.bottom + 4 : 16 }]}>
              <View style={[styles.bottomNavBlurWrapper, isDark && { borderColor: 'rgba(168, 85, 247, 0.3)', backgroundColor: 'rgba(22, 19, 41, 0.92)' }]}>
                <BlurView intensity={95} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFillObject} />
                <LinearGradient
                  colors={isDark ? ['rgba(168, 85, 247, 0.15)', 'rgba(247, 37, 133, 0.10)'] : ['rgba(114, 9, 183, 0.08)', 'rgba(247, 37, 133, 0.05)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFillObject}
                />
              </View>

              {/* Left Tabs (Today, Explore) */}
              <View style={styles.navGroupLeft}>
                <TouchableOpacity
                  style={[styles.navTab, activeTab === 'today' && (isDark ? { backgroundColor: 'rgba(168, 85, 247, 0.15)' } : styles.navTabActive)]}
                  onPress={() => changeTab('today')}
                  activeOpacity={0.8}
                >
                  <Calendar size={18} color={activeTab === 'today' ? (isDark ? '#A855F7' : '#7209B7') : (isDark ? '#9E9BB3' : '#2C2B3D')} />
                  <Text style={[styles.navText, { color: activeTab === 'today' ? (isDark ? '#A855F7' : '#7209B7') : (isDark ? '#9E9BB3' : '#726F8D') }]}>Today</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.navTab, activeTab === 'readings' && (isDark ? { backgroundColor: 'rgba(168, 85, 247, 0.15)' } : styles.navTabActive)]}
                  onPress={() => changeTab('readings')}
                  activeOpacity={0.8}
                >
                  <Compass size={18} color={activeTab === 'readings' ? (isDark ? '#A855F7' : '#7209B7') : (isDark ? '#9E9BB3' : '#2C2B3D')} />
                  <Text style={[styles.navText, { color: activeTab === 'readings' ? (isDark ? '#A855F7' : '#7209B7') : (isDark ? '#9E9BB3' : '#726F8D') }]}>Explore</Text>
                </TouchableOpacity>
              </View>

              {/* Center Hope Chat Action */}
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

              {/* Right Tabs (Numbers, Astro Map) */}
              <View style={styles.navGroupRight}>
                <TouchableOpacity
                  style={[styles.navTab, activeTab === 'numerology' && (isDark ? { backgroundColor: 'rgba(168, 85, 247, 0.15)' } : styles.navTabActive)]}
                  onPress={() => changeTab('numerology')}
                  activeOpacity={0.8}
                >
                  <View style={[
                    styles.navDestinyBadge,
                    isDark && { backgroundColor: 'rgba(168, 85, 247, 0.15)', borderColor: 'rgba(168, 85, 247, 0.35)' },
                    activeTab === 'numerology' && styles.navDestinyBadgeActive
                  ]}>
                    <Text style={[
                      styles.navDestinyDigit,
                      isDark && { color: '#A855F7' },
                      activeTab === 'numerology' && styles.navDestinyDigitActive
                    ]}>
                      {destinyNumber}
                    </Text>
                  </View>
                  <Text style={[styles.navText, { color: activeTab === 'numerology' ? (isDark ? '#A855F7' : '#7209B7') : (isDark ? '#9E9BB3' : '#726F8D') }]}>Numbers</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.navTab, activeTab === 'charts' && (isDark ? { backgroundColor: 'rgba(168, 85, 247, 0.15)' } : styles.navTabActive)]}
                  onPress={() => changeTab('charts')}
                  activeOpacity={0.8}
                >
                  <Grid size={18} color={activeTab === 'charts' ? (isDark ? '#A855F7' : '#7209B7') : (isDark ? '#9E9BB3' : '#2C2B3D')} />
                  <Text style={[styles.navText, { color: activeTab === 'charts' ? (isDark ? '#A855F7' : '#7209B7') : (isDark ? '#9E9BB3' : '#726F8D') }]}>Astro Map</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Share Card Modal */}
          {shareModalData && (
            <ShareCardModal
              visible={shareModalVisible}
              onClose={() => setShareModalVisible(false)}
              data={shareModalData}
            />
          )}

          {/* Astrological Recalculation Progress Modal */}
          <RecalculationProgressModal
            visible={isRecalculating}
            progress={recalcProgress}
            stepText={recalcStepText}
            isComplete={recalcComplete}
          />

          {/* Cosmic Date Picker Modal */}
          <CosmicDatePickerModal
            visible={isDatePickerVisible}
            selectedDay={selectedDay}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onSelectDay={setSelectedDay}
            onSelectMonth={setSelectedMonth}
            onSelectYear={setSelectedYear}
            onConfirm={() => {
              setEditBirthdate(`${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`);
              setIsDatePickerVisible(false);
            }}
            onCancel={() => setIsDatePickerVisible(false)}
          />

          {/* Cosmic Time Picker Modal */}
          <CosmicTimePickerModal
            visible={isTimePickerVisible}
            selectedHour={selectedHour}
            selectedMinute={selectedMinute}
            selectedPeriod={selectedPeriod}
            onSelectHour={setSelectedHour}
            onSelectMinute={setSelectedMinute}
            onSelectPeriod={setSelectedPeriod}
            onConfirm={() => {
              setEditBirthtime(`${selectedHour}:${String(selectedMinute).padStart(2, '0')} ${selectedPeriod}`);
              setIsTimePickerVisible(false);
            }}
            onCancel={() => setIsTimePickerVisible(false)}
          />
        </LinearGradient>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9FE',
  },
  gradientBg: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  headerLeftSlot: {
    width: 90,
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRightSlot: {
    width: 90,
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 16,
    color: '#2C2B3D',
    letterSpacing: 1.2,
  },
  headerSubtitle: {
    fontFamily: 'SourceSerif4',
    fontSize: 10,
    color: '#726F8D',
  },
  creditsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(114, 111, 141, 0.12)',
    shadowColor: '#7209B7',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  creditsText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 12,
    color: '#2C2B3D',
  },
  headerProfileBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#7209B7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerProfileBtnActive: {
    backgroundColor: '#F72585',
  },
  headerProfileBtnText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  headerProfileBtnTextActive: {
    color: '#FFFFFF',
  },
  logoutBtn: {
    padding: 6,
  },
  mainContent: {
    flex: 1,
  },
  bottomNavContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    zIndex: 100,
  },
  bottomNavBlurWrapper: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.65)',
    shadowColor: '#7209B7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  navGroupLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
    justifyContent: 'space-around',
  },
  navGroupRight: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
    justifyContent: 'space-around',
  },
  navTab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  navTabActive: {
    backgroundColor: 'rgba(114, 9, 183, 0.08)',
  },
  navText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 10,
    color: '#726F8D',
    marginTop: 2,
  },
  navTextActive: {
    color: '#7209B7',
  },
  navDestinyBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(114, 9, 183, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(114, 9, 183, 0.25)',
  },
  navDestinyBadgeActive: {
    backgroundColor: '#7209B7',
    borderColor: '#7209B7',
  },
  navDestinyDigit: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 11,
    color: '#7209B7',
  },
  navDestinyDigitActive: {
    color: '#FFFFFF',
  },
  centerBtnContainer: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
  },
  centerBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    shadowColor: '#F72585',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  centerBtnGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pickerModalContent: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
  },
  pickerModalTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 17,
    color: '#2C2B3D',
    marginBottom: 16,
  },
  pickerWheelsRow: {
    flexDirection: 'row',
    height: 180,
    width: '100%',
    marginBottom: 16,
    gap: 8,
  },
  pickerCol: {
    flex: 1,
    backgroundColor: '#FAF9FE',
    borderRadius: 12,
  },
  pickerItem: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  pickerItemActive: {
    backgroundColor: '#7209B7',
    borderRadius: 8,
  },
  pickerItemText: {
    fontFamily: 'SourceSerif4',
    fontSize: 14,
    color: '#2C2B3D',
  },
  pickerItemTextActive: {
    fontFamily: 'SourceSerif4-Bold',
    color: '#FFFFFF',
  },
  pickerConfirmBtn: {
    backgroundColor: '#7209B7',
    width: '100%',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  pickerConfirmBtnText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 13,
    color: '#FFFFFF',
  },
});
