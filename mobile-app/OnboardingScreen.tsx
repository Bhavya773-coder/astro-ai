import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  FlatList,
  ScrollView,
  Dimensions,
  Animated,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Send, Sparkles, MapPin } from 'lucide-react-native';
import { searchPlaces, PlaceItem } from './services/placesService';
import PlacesAutocompleteModal from './components/common/PlacesAutocompleteModal';

const { width } = Dimensions.get('window');

// Static mapping for the 12 custom logos in React Native
const ZODIAC_ICONS: Record<number, any> = {
  1: require('./assets/icons/astro_icon_1.png'),
  2: require('./assets/icons/astro_icon_2.png'),
  3: require('./assets/icons/astro_icon_3.png'),
  4: require('./assets/icons/astro_icon_4.png'),
  5: require('./assets/icons/astro_icon_5.png'),
  6: require('./assets/icons/astro_icon_6.png'),
  7: require('./assets/icons/astro_icon_7.png'),
  8: require('./assets/icons/astro_icon_8.png'),
  9: require('./assets/icons/astro_icon_9.png'),
  10: require('./assets/icons/astro_icon_10.png'),
  11: require('./assets/icons/astro_icon_11.png'),
  12: require('./assets/icons/astro_icon_12.png'),
};

interface OnboardingQuestion {
  id: string;
  field: string;
  question: string;
  type: 'text' | 'date' | 'time' | 'select' | 'textarea' | 'place';
  options?: { value: string; label: string }[];
}

const QUESTIONS: OnboardingQuestion[] = [
  { id: '1', field: 'full_name', question: "I'm delighted to help you discover your cosmic path. May I ask your full name to address you personally?", type: 'text' },
  { id: '2', field: 'date_of_birth', question: "Wonderful. The stars' positions at the moment of your arrival are key. When was that special day? (DD/MM/YYYY)", type: 'date' },
  { id: '3', field: 'time_of_birth', question: "Precision matters in the cosmic dance. Do you happen to know your birth time? (It's okay to guess if you don't know)", type: 'time' },
  { id: '4', field: 'place_of_birth', question: "For an accurate celestial reading, kindly select your birthplace — where your destiny first took form.", type: 'place' },
  {
    id: '5', field: 'gender', question: "To better understand your energy, how do you identify yourself?", type: 'select', options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'other', label: 'Other' },
      { value: 'prefer_not_to_say', label: 'Prefer not to say' }
    ]
  },
  { id: '6', field: 'current_location', question: "Where are you based right now? Search & select your current city or location.", type: 'place' },
  {
    id: '7', field: 'career_stage', question: "Let's look at your current life chapter. What best describes your professional stage right now?", type: 'select', options: [
      { value: 'student', label: 'Student' },
      { value: 'early-career', label: 'Early Career' },
      { value: 'mid-career', label: 'Mid Career' },
      { value: 'entrepreneur', label: 'Entrepreneur' }
    ]
  },
  {
    id: '8', field: 'relationship_status', question: "And in the realm of connection, what is your current relationship status?", type: 'select', options: [
      { value: 'single', label: 'Single' },
      { value: 'relationship', label: 'In a Relationship' },
      { value: 'married', label: 'Married' }
    ]
  },
  {
    id: '9', field: 'main_life_focus', question: "What part of your life path feels most important to you at this moment?", type: 'select', options: [
      { value: 'career', label: 'Career' },
      { value: 'relationships', label: 'Relationships' },
      { value: 'finance', label: 'Finance' },
      { value: 'health', label: 'Health' },
      { value: 'spirituality', label: 'Spirituality' }
    ]
  },
  {
    id: '10', field: 'personality_style', question: "How would you describe your natural way of being—your personality style?", type: 'select', options: [
      { value: 'analytical', label: 'Analytical' },
      { value: 'emotional', label: 'Emotional' },
      { value: 'practical', label: 'Practical' },
      { value: 'spiritual', label: 'Spiritual' }
    ]
  },
  { id: '11', field: 'primary_life_problem', question: "Finally, is there a specific challenge or goal you'd like the stars to guide you through?", type: 'textarea' }
];

function parseDayAndMonth(dob: string): { day: number; month: number } | null {
  if (!dob || typeof dob !== 'string') return null;
  const trimmed = dob.trim();
  if (!trimmed) return null;

  // 1. Check ISO / YYYY-MM-DD / YYYY/MM/DD
  const ymdMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (ymdMatch) {
    const month = parseInt(ymdMatch[2], 10);
    const day = parseInt(ymdMatch[3], 10);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return { day, month };
    }
  }

  // 2. Check DD/MM/YYYY or DD-MM-YYYY or MM/DD/YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmyMatch) {
    let day = parseInt(dmyMatch[1], 10);
    let month = parseInt(dmyMatch[2], 10);
    if (day > 12 && month <= 12) {
      return { day, month };
    }
    if (month > 12 && day <= 12) {
      return { day: month, month: day };
    }
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return { day, month };
    }
  }

  // 3. Fallback to standard Date parsing
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    return { day: parsed.getUTCDate(), month: parsed.getUTCMonth() + 1 };
  }

  return null;
}

function getZodiacInfo(day: number, month: number): { name: string; index: number; description: string } {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
    return { name: "Aries", index: 1, description: "Your spirit is pioneering, courageous, and full of vital fire energy." };
  } else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) {
    return { name: "Taurus", index: 2, description: "Your energy is grounded, patient, and deeply connected to beauty and nature." };
  } else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) {
    return { name: "Gemini", index: 3, description: "Your mind is versatile, curious, and expressive, like a gentle summer breeze." };
  } else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) {
    return { name: "Cancer", index: 4, description: "Your heart is intuitive, protective, and deeply nurturing, guided by the moon." };
  } else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
    return { name: "Leo", index: 5, description: "Your soul is radiant, expressive, and warm, shining like the sun at its peak." };
  } else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
    return { name: "Virgo", index: 6, description: "Your presence is thoughtful, analytical, and dedicated to bringing order and healing." };
  } else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) {
    return { name: "Libra", index: 7, description: "Your spirit is harmonious, artistic, and seeks balance and deep connection." };
  } else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) {
    return { name: "Scorpio", index: 8, description: "Your power is intense, passionate, and transformative, holding deep mystery." };
  } else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) {
    return { name: "Sagittarius", index: 9, description: "Your path is adventurous, philosophical, and guided by a quest for truth." };
  } else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
    return { name: "Capricorn", index: 10, description: "Your character is structured, ambitious, and possesses the resilience of the mountaintop." };
  } else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
    return { name: "Aquarius", index: 11, description: "Your vision is unique, progressive, and deeply dedicated to the collective human spirit." };
  } else {
    return { name: "Pisces", index: 12, description: "Your soul is dream-like, compassionate, and connected to the infinite ocean of spirit." };
  }
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  zodiacReveal?: {
    name: string;
    index: number;
    description: string;
  };
}

interface OnboardingScreenProps {
  onBack: () => void;
  onComplete: (answers: Record<string, string>) => void;
}

export default function OnboardingScreen({ onBack, onComplete }: OnboardingScreenProps) {
  const insets = useSafeAreaInsets();
  const [currentIdx, setCurrentIdx] = useState(0);
  const currentQuestion = QUESTIONS[currentIdx] || QUESTIONS[0];
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAiTyping, setIsAiTyping] = useState(false);

  // Input states
  const [textInputVal, setTextInputVal] = useState('');
  const [isPlacesModalOpen, setIsPlacesModalOpen] = useState(false);
  const [placeSuggestions, setPlaceSuggestions] = useState<PlaceItem[]>([]);
  const placeDebounce = useRef<any>(null);

  const handlePlaceInputChange = (text: string) => {
    setTextInputVal(text);
    if (placeDebounce.current) clearTimeout(placeDebounce.current);
    if (text.trim().length >= 2) {
      placeDebounce.current = setTimeout(async () => {
        try {
          const res = await searchPlaces(text);
          setPlaceSuggestions(res);
        } catch (e) {
          setPlaceSuggestions([]);
        }
      }, 250);
    } else {
      setPlaceSuggestions([]);
    }
  };

  // Date states
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  // Time states
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');
  const [ampm, setAmpm] = useState<'AM' | 'PM'>('AM');

  // Input refs
  const dayRef = useRef<TextInput>(null);
  const monthRef = useRef<TextInput>(null);
  const yearRef = useRef<TextInput>(null);
  const hourRef = useRef<TextInput>(null);
  const minuteRef = useRef<TextInput>(null);

  const flatListRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Android keyboard handling: edge-to-edge Android (Expo SDK 54) ignores
  // adjustResize, so we manually lift the input by the keyboard height.
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates?.height ?? 0);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Initial welcome message
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        sender: 'ai',
        text: "Welcome to AstroAi4u. I am your celestial guide, ready to map your astrological destiny.",
      },
    ]);
    triggerNextQuestion(0, 800);
  }, []);

  useEffect(() => {
    // Fade in animation when new message arrives
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [messages, isAiTyping]);

  const triggerNextQuestion = (index: number, delayMs = 1200) => {
    if (index >= QUESTIONS.length) {
      return;
    }
    setIsAiTyping(true);
    setTimeout(() => {
      setIsAiTyping(false);
      const nextQ = QUESTIONS[index];
      setMessages(prev => [
        ...prev,
        {
          id: `ai_${nextQ.id}`,
          sender: 'ai',
          text: nextQ.question,
        },
      ]);
      setCurrentIdx(index);
    }, delayMs);
  };

  const handleAnswerSubmit = (displayVal: string, rawVal: string) => {
    if (!rawVal.trim()) return;

    const currentQuestion = QUESTIONS[currentIdx];
    const newAnswers = { ...answers, [currentQuestion.field]: rawVal };
    setAnswers(newAnswers);

    // Append user answer message
    const userMsgId = `user_${currentQuestion.id}`;

    // Check if this was the date of birth, so we can calculate and attach zodiac reveal
    let zodiacInfo: { name: string; index: number; description: string } | undefined = undefined;
    if (currentQuestion.type === 'date') {
      const parsedDm = parseDayAndMonth(rawVal);
      if (parsedDm) {
        zodiacInfo = getZodiacInfo(parsedDm.day, parsedDm.month);
      }
    }

    setMessages(prev => [
      ...prev,
      {
        id: userMsgId,
        sender: 'user',
        text: displayVal,
      },
    ]);

    // Reset inputs
    setTextInputVal('');
    setDay('');
    setMonth('');
    setYear('');
    setHour('');
    setMinute('');
    setAmpm('AM');

    // Go to next question or complete
    const nextIndex = currentIdx + 1;
    if (nextIndex < QUESTIONS.length) {
      if (zodiacInfo) {
        setIsAiTyping(true);
        setTimeout(() => {
          setIsAiTyping(false);
          setMessages(prev => [
            ...prev,
            {
              id: `zodiac_reveal_${userMsgId}`,
              sender: 'ai',
              text: "", // No text bubble
              zodiacReveal: zodiacInfo,
            },
          ]);
          triggerNextQuestion(nextIndex, 2200);
        }, 1000);
      } else {
        triggerNextQuestion(nextIndex, 1200);
      }
    } else {
      // Completed!
      setTimeout(() => {
        setIsAiTyping(true);
        setTimeout(() => {
          setIsAiTyping(false);
          setMessages(prev => [
            ...prev,
            {
              id: 'completion',
              sender: 'ai',
              text: "✨ Thank you! Your cosmic alignment is complete. We are ready to unveil your customized celestial charts.",
            },
          ]);
        }, 1000);
      }, 1000);
    }
  };

  const handleTextSend = () => {
    if (textInputVal.trim() === '') return;
    handleAnswerSubmit(textInputVal, textInputVal);
  };

  const handleDateSend = () => {
    const dVal = parseInt(day, 10);
    const mVal = parseInt(month, 10);
    const yVal = parseInt(year, 10);

    if (isNaN(dVal) || dVal < 1 || dVal > 31) {
      Alert.alert('Invalid Date', 'Please enter a valid day (1-31).');
      return;
    }
    if (isNaN(mVal) || mVal < 1 || mVal > 12) {
      Alert.alert('Invalid Date', 'Please enter a valid month (1-12).');
      return;
    }
    if (isNaN(yVal) || yVal < 1900 || yVal > new Date().getFullYear()) {
      Alert.alert('Invalid Date', 'Please enter a valid year.');
      return;
    }

    const formattedDay = day.padStart(2, '0');
    const formattedMonth = month.padStart(2, '0');
    const dateStr = `${formattedDay}/${formattedMonth}/${year}`;
    handleAnswerSubmit(dateStr, dateStr);
  };

  const handleTimeSend = () => {
    const hVal = parseInt(hour, 10);
    const minVal = parseInt(minute, 10);

    if (isNaN(hVal) || hVal < 1 || hVal > 12) {
      Alert.alert('Invalid Time', 'Please enter a valid hour (1-12).');
      return;
    }
    if (isNaN(minVal) || minVal < 0 || minVal > 59) {
      Alert.alert('Invalid Time', 'Please enter a valid minute (0-59).');
      return;
    }

    const formattedHour = hour.padStart(2, '0');
    const formattedMinute = minute.padStart(2, '0');
    const timeStr = `${formattedHour}:${formattedMinute} ${ampm}`;
    handleAnswerSubmit(timeStr, timeStr);
  };

  const handleSelectSend = (option: { value: string; label: string }) => {
    handleAnswerSubmit(option.label, option.value);
  };

  const isCompleted = currentIdx === QUESTIONS.length - 1 && answers[QUESTIONS[QUESTIONS.length - 1].field] !== undefined;

  const renderMessageItem = ({ item }: { item: Message }) => {
    const isAi = item.sender === 'ai';
    return (
      <View style={[styles.msgRow, isAi ? styles.msgRowAi : styles.msgRowUser]}>
        {isAi && (
          <View style={styles.avatarContainer}>
            <Image
              source={require('./assets/icons/astro_icon_9.png')}
              style={styles.avatarImage}
            />
          </View>
        )}
        <View style={[styles.bubbleWrapper, { alignItems: isAi ? 'flex-start' : 'flex-end' }]}>
          {item.text ? (
            <View style={[styles.bubble, isAi ? styles.bubbleAi : styles.bubbleUser]}>
              <Text style={[styles.msgText, isAi ? styles.msgTextAi : styles.msgTextUser]}>
                {item.text}
              </Text>
            </View>
          ) : null}

          {/* Custom Zodiac Reveal Card */}
          {item.zodiacReveal && (
            <View style={styles.zodiacCard}>
              <LinearGradient
                colors={['#7209B7', '#F72585']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.zodiacCardGradient}
              >
                <Image source={item.zodiacReveal ? ZODIAC_ICONS[item.zodiacReveal.index] : undefined} style={styles.zodiacCardIconBg} />
                <View style={styles.zodiacCardTextContainer}>
                  <Text style={styles.zodiacCardTitle}>✦ {item.zodiacReveal?.name?.toUpperCase() ?? ''} ✦</Text>
                  <Text style={styles.zodiacCardDescription}>{item.zodiacReveal?.description}</Text>
                </View>
              </LinearGradient>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderInputArea = () => {
    if (isCompleted) {
      return (
        <TouchableOpacity
          style={styles.finishBtnContainer}
          activeOpacity={0.9}
          onPress={() => onComplete(answers)}
        >
          <LinearGradient
            colors={['#B3A2E7', '#A0C9E9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.finishBtnGradient}
          >
            <Sparkles size={18} color="#FFFFFF" style={styles.finishBtnIcon} />
            <Text style={styles.finishBtnText}>Reveal My Horoscope Chart</Text>
          </LinearGradient>
        </TouchableOpacity>
      );
    }

    if (isAiTyping) {
      return (
        <View style={styles.typingContainer}>
          <Text style={styles.typingText}>Guide is channeling stars...</Text>
        </View>
      );
    }

    const currentQuestion = QUESTIONS[currentIdx];
    if (!currentQuestion) return null;

    switch (currentQuestion.type) {
      case 'text':
      case 'textarea':
        return (
          <View style={styles.textInputWrapper}>
            <TextInput
              style={styles.chatTextInput}
              placeholder="Type your answer here..."
              placeholderTextColor="#9E9BB3"
              value={textInputVal}
              onChangeText={setTextInputVal}
              multiline={currentQuestion.type === 'textarea'}
              onSubmitEditing={handleTextSend}
            />
            <TouchableOpacity
              style={[styles.sendBtn, !textInputVal.trim() && styles.sendBtnDisabled]}
              onPress={handleTextSend}
              disabled={!textInputVal.trim()}
            >
              <Send size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        );

      case 'date':
        return (
          <View style={styles.dateInputWrapper}>
            <View style={styles.dateInputsRow}>
              <TextInput
                ref={dayRef}
                style={styles.numericField}
                placeholder="DD"
                placeholderTextColor="#9E9BB3"
                keyboardType="numeric"
                maxLength={2}
                value={day}
                onChangeText={(text) => {
                  setDay(text);
                  if (text.length === 2) monthRef.current?.focus();
                }}
              />
              <Text style={styles.dateSlash}>/</Text>
              <TextInput
                ref={monthRef}
                style={styles.numericField}
                placeholder="MM"
                placeholderTextColor="#9E9BB3"
                keyboardType="numeric"
                maxLength={2}
                value={month}
                onChangeText={(text) => {
                  setMonth(text);
                  if (text.length === 2) yearRef.current?.focus();
                  if (text.length === 0) dayRef.current?.focus();
                }}
              />
              <Text style={styles.dateSlash}>/</Text>
              <TextInput
                ref={yearRef}
                style={[styles.numericField, { width: 70 }]}
                placeholder="YYYY"
                placeholderTextColor="#9E9BB3"
                keyboardType="numeric"
                maxLength={4}
                value={year}
                onChangeText={(text) => {
                  setYear(text);
                  if (text.length === 0) monthRef.current?.focus();
                }}
              />
            </View>
            <TouchableOpacity
              style={[styles.sendBtn, (!day || !month || year.length < 4) && styles.sendBtnDisabled]}
              onPress={handleDateSend}
              disabled={!day || !month || year.length < 4}
            >
              <Send size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        );

      case 'time':
        return (
          <View style={styles.dateInputWrapper}>
            <View style={styles.timeInputsRow}>
              <TextInput
                ref={hourRef}
                style={styles.numericField}
                placeholder="HH"
                placeholderTextColor="#9E9BB3"
                keyboardType="numeric"
                maxLength={2}
                value={hour}
                onChangeText={(text) => {
                  setHour(text);
                  if (text.length === 2) minuteRef.current?.focus();
                }}
              />
              <Text style={styles.dateSlash}>:</Text>
              <TextInput
                ref={minuteRef}
                style={styles.numericField}
                placeholder="MM"
                placeholderTextColor="#9E9BB3"
                keyboardType="numeric"
                maxLength={2}
                value={minute}
                onChangeText={(text) => {
                  setMinute(text);
                  if (text.length === 0) hourRef.current?.focus();
                }}
              />
              <View style={styles.ampmToggle}>
                <TouchableOpacity
                  style={[styles.ampmBtn, ampm === 'AM' && styles.ampmBtnActive]}
                  onPress={() => setAmpm('AM')}
                >
                  <Text style={[styles.ampmText, ampm === 'AM' && styles.ampmTextActive]}>AM</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.ampmBtn, ampm === 'PM' && styles.ampmBtnActive]}
                  onPress={() => setAmpm('PM')}
                >
                  <Text style={[styles.ampmText, ampm === 'PM' && styles.ampmTextActive]}>PM</Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.sendBtn, (!hour || !minute) && styles.sendBtnDisabled]}
              onPress={handleTimeSend}
              disabled={!hour || !minute}
            >
              <Send size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        );

      case 'place':
        return (
          <View style={{ width: '100%' }}>
            {placeSuggestions.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 8, maxHeight: 40 }}
                contentContainerStyle={{ gap: 8, paddingHorizontal: 4 }}
              >
                {placeSuggestions.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    onPress={() => {
                      setPlaceSuggestions([]);
                      handleAnswerSubmit(p.displayName, p.displayName);
                    }}
                    activeOpacity={0.8}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: '#FFFFFF',
                      paddingHorizontal: 12,
                      paddingVertical: 7,
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: 'rgba(114, 9, 183, 0.2)',
                      shadowColor: '#7209B7',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.08,
                      shadowRadius: 3,
                      elevation: 2,
                      gap: 6,
                    }}
                  >
                    <MapPin size={12} color="#7209B7" />
                    <Text style={{ fontFamily: 'SourceSerif4-Bold', fontSize: 12, color: '#2C2B3D' }}>
                      {p.displayName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <View style={styles.textInputWrapper}>
              <TouchableOpacity
                onPress={() => setIsPlacesModalOpen(true)}
                style={{ paddingHorizontal: 6, justifyContent: 'center' }}
                activeOpacity={0.7}
              >
                <MapPin size={18} color="#7209B7" />
              </TouchableOpacity>
              <TextInput
                style={styles.chatTextInput}
                placeholder="Search city, state, country..."
                placeholderTextColor="#9E9BB3"
                value={textInputVal}
                onChangeText={handlePlaceInputChange}
                onSubmitEditing={handleTextSend}
              />
              <TouchableOpacity
                style={[styles.sendBtn, !textInputVal.trim() && styles.sendBtnDisabled]}
                onPress={handleTextSend}
                disabled={!textInputVal.trim()}
              >
                <Send size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'select':
        return (
          <View style={styles.selectOptionsContainer}>
            {currentQuestion.options?.map((option, oIdx) => (
              <TouchableOpacity
                key={oIdx}
                style={styles.optionChip}
                onPress={() => handleSelectSend(option)}
                activeOpacity={0.8}
              >
                <Text style={styles.optionChipText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      default:
        return null;
    }
  };

  const progressPercent = ((currentIdx + (isCompleted ? 1 : 0)) / QUESTIONS.length) * 100;

  return (
    <SafeAreaView
      style={styles.container}
      edges={Platform.OS === 'ios' ? ['top', 'left', 'right'] : ['top', 'bottom', 'left', 'right']}
    >
      <PlacesAutocompleteModal
        visible={isPlacesModalOpen}
        title={currentQuestion?.field === 'place_of_birth' ? 'Select Birthplace' : 'Select Living Location'}
        placeholder="Type city or country..."
        initialValue={textInputVal}
        onClose={() => setIsPlacesModalOpen(false)}
        onSelect={(place) => {
          setPlaceSuggestions([]);
          handleAnswerSubmit(place.displayName, place.displayName);
        }}
      />
      <LinearGradient
        colors={['#F3EFFF', '#E9F3FF', '#FFFDF2']}
        locations={[0, 0.5, 1]}
        style={styles.gradientBg}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[
            styles.keyboardAvoidingContainer,
            Platform.OS === 'android' && { paddingBottom: Math.max(keyboardHeight - insets.bottom, 0) + 12 },
          ]}
          keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
        >
          {/* Onboarding Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
              <ArrowLeft size={20} color="#2C2B3D" />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Celestial Alignment</Text>
              <Text style={styles.headerSubtitle}>Mapping your energetic frequencies</Text>
            </View>
            <View style={styles.headerCounterContainer}>
              <Text style={styles.headerCounterText}>{currentIdx + 1}/{QUESTIONS.length}</Text>
            </View>
          </View>

          {/* Custom Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
          </View>

          {/* Message flatlist */}
          <FlatList
            ref={flatListRef}
            data={messages}
            style={styles.chatList}
            keyExtractor={(item) => item.id}
            renderItem={renderMessageItem}
            contentContainerStyle={styles.chatListContent}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
            showsVerticalScrollIndicator={false}
          />

          {/* Input Controls Footer */}
          <View
            style={[
              styles.inputAreaContainer,
              Platform.OS === 'ios' && { paddingBottom: insets.bottom + 12 },
            ]}
          >
            {renderInputArea()}
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
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
  keyboardAvoidingContainer: {
    flex: 1,
  },
  chatList: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(114, 111, 141, 0.08)',
  },
  backBtn: {
    padding: 6,
    marginRight: 10,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 16,
    color: '#2C2B3D',
  },
  headerSubtitle: {
    fontFamily: 'SourceSerif4',
    fontSize: 11,
    color: '#726F8D',
    marginTop: 1,
  },
  headerCounterContainer: {
    backgroundColor: 'rgba(179, 162, 231, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCounterText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 12,
    color: '#B3A2E7',
  },
  progressContainer: {
    height: 3,
    backgroundColor: 'rgba(114, 111, 141, 0.08)',
    width: '100%',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#B3A2E7',
  },
  chatListContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  msgRow: {
    flexDirection: 'row',
    marginBottom: 20,
    width: '100%',
  },
  msgRowAi: {
    justifyContent: 'flex-start',
  },
  msgRowUser: {
    justifyContent: 'flex-end',
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    alignSelf: 'flex-end',
    borderWidth: 1,
    borderColor: '#E8E7ED',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#726F8D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  avatarImage: {
    width: 18,
    height: 18,
  },
  bubbleWrapper: {
    maxWidth: width * 0.72,
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#726F8D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  bubbleAi: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 4,
    borderColor: '#E8E7ED',
    borderWidth: 1,
  },
  bubbleUser: {
    backgroundColor: '#B3A2E7',
    borderTopRightRadius: 18,
    borderBottomRightRadius: 4,
  },
  msgText: {
    fontSize: 14,
    lineHeight: 20,
  },
  msgTextAi: {
    fontFamily: 'SourceSerif4',
    color: '#2C2B3D',
  },
  msgTextUser: {
    fontFamily: 'SourceSerif4-Bold',
    color: '#FFFFFF',
  },
  zodiacCard: {
    marginTop: 10,
    borderRadius: 16,
    overflow: 'hidden',
    width: width * 0.74,
    shadowColor: '#7209B7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  zodiacCardGradient: {
    padding: 16,
    position: 'relative',
    minHeight: 90,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  zodiacCardIconBg: {
    position: 'absolute',
    right: -10,
    bottom: -10,
    width: 100,
    height: 100,
    opacity: 0.22,
    resizeMode: 'contain',
  },
  zodiacCardTextContainer: {
    flex: 1,
    zIndex: 1,
  },
  zodiacCardTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 15,
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: 1,
  },
  zodiacCardDescription: {
    fontFamily: 'SourceSerif4',
    fontSize: 11,
    color: '#F8F9FA',
    lineHeight: 16,
  },
  typingContainer: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  typingText: {
    fontFamily: 'SourceSerif4',
    fontSize: 12,
    color: '#9E9BB3',
    fontStyle: 'italic',
  },
  inputAreaContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8E7ED',
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingBottom: Platform.OS === 'ios' ? 24 : 14,
  },
  textInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatTextInput: {
    flex: 1,
    backgroundColor: 'rgba(114, 111, 141, 0.05)',
    borderWidth: 1,
    borderColor: '#E8E7ED',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#2C2B3D',
    fontFamily: 'SourceSerif4',
    maxHeight: 100,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#B3A2E7',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sendBtnDisabled: {
    backgroundColor: '#E8E7ED',
  },
  dateInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateInputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeInputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  numericField: {
    width: 50,
    height: 40,
    backgroundColor: 'rgba(114, 111, 141, 0.05)',
    borderWidth: 1.5,
    borderColor: '#E8E7ED',
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 15,
    color: '#2C2B3D',
    fontFamily: 'SourceSerif4-Bold',
  },
  dateSlash: {
    fontSize: 18,
    color: '#9E9BB3',
    marginHorizontal: 6,
  },
  ampmToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(114, 111, 141, 0.05)',
    borderRadius: 10,
    padding: 2,
    marginLeft: 12,
  },
  ampmBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  ampmBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#726F8D',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  ampmText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 11,
    color: '#9E9BB3',
  },
  ampmTextActive: {
    color: '#B3A2E7',
  },
  selectOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  optionChip: {
    backgroundColor: 'rgba(179, 162, 231, 0.08)',
    borderWidth: 1,
    borderColor: '#B3A2E7',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    margin: 4,
  },
  optionChipText: {
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 13,
    color: '#B3A2E7',
  },
  finishBtnContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#B3A2E7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  finishBtnGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
  },
  finishBtnIcon: {
    marginRight: 8,
  },
  finishBtnText: {
    fontFamily: 'Cinzel-Bold',
    color: '#FFFFFF',
    fontSize: 14,
    letterSpacing: 0.5,
  },
});
