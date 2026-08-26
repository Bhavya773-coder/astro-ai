import React, { useRef, useState, useEffect } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  Circle as SvgCircle,
  Defs as SvgDefs,
  G as SvgG,
  LinearGradient as SvgLinearGradient,
  Path as SvgPath,
  Stop as SvgStop,
  Text as SvgText,
} from 'react-native-svg';
import { ArrowLeft, RotateCcw, Sparkles } from 'lucide-react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { haptic } from './haptics';

const ANSWERS = [
  { verdict: 'YES', tone: '#12A594', title: 'Move with confidence', advice: 'Do it, but keep the first step small and reversible.' },
  { verdict: 'YES', tone: '#7209B7', title: 'The signal is supportive', advice: 'Proceed if your facts are checked and your intention is clean.' },
  { verdict: 'WAIT', tone: '#D9730D', title: 'Let the sky settle', advice: 'Do not force it yet. Sleep on it, then choose the next small step.' },
  { verdict: 'NO', tone: '#E5484D', title: 'Protect your energy', advice: 'Do not do it now. The cost is louder than the signal.' },
  { verdict: 'MAYBE', tone: '#3A0CA3', title: 'Ask for one sign', advice: 'Move only if you get a practical confirmation, not just excitement.' },
  { verdict: 'YES', tone: '#F72585', title: 'Heart first, plan second', advice: 'Say yes, then set a boundary so the choice does not drain you.' },
  { verdict: 'WAIT', tone: '#7209B7', title: 'Observe one more thing', advice: 'Gather one more real-world clue before acting.' },
  { verdict: 'NO', tone: '#2C2B3D', title: 'Not this version', advice: 'Decline this path. A cleaner option is likely nearby.' },
];

type Props = {
  answers: Record<string, string>;
  zodiacIndex: number;
  onBack: () => void;
};

export default function Astrology8BallScreen({ zodiacIndex, onBack }: Props) {
  const insets = useSafeAreaInsets();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<typeof ANSWERS[number] | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const shake = useRef(new Animated.Value(0)).current;
  const reveal = useRef(new Animated.Value(0)).current;

  const zodiacSeed = Number.isFinite(zodiacIndex) ? zodiacIndex : 0;

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }
    const showSubscription = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates?.height ?? 0);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const askBall = () => {
    const cleanQuestion = question.trim();
    if (cleanQuestion.length < 4) {
      haptic.error();
      Alert.alert('Ask the 8 Ball', 'Type a clear yes/no question first.');
      return;
    }

    haptic.press();
    setAnswer(null);
    reveal.setValue(0);
    shake.setValue(0);

    Animated.sequence([
      Animated.timing(shake, { toValue: 1, duration: 1000, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(reveal, { toValue: 1, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start(() => haptic.success());

    const seed = cleanQuestion.split('').reduce((sum, char) => sum + char.charCodeAt(0), zodiacSeed + new Date().getDate());
    setTimeout(() => setAnswer(ANSWERS[seed % ANSWERS.length]), 760);
  };

  const reset = () => {
    haptic.tap();
    setQuestion('');
    setAnswer(null);
    reveal.setValue(0);
    shake.setValue(0);
  };

  const ballRotate = shake.interpolate({ inputRange: [0, 0.2, 0.45, 0.7, 1], outputRange: ['0deg', '-16deg', '15deg', '-7deg', '0deg'] });
  const ballY = shake.interpolate({ inputRange: [0, 0.25, 0.5, 0.75, 1], outputRange: [0, -18, 7, -8, 0] });
  const ballScale = shake.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.05, 1] });

  return (
    <LinearGradient colors={['#F3EFFF', '#E9F3FF', '#FFFDF2']} style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { haptic.tap(); onBack(); }} style={styles.iconBtn} activeOpacity={0.75}>
            <ArrowLeft size={21} color="#7209B7" />
          </TouchableOpacity>
          <View style={styles.headerCopy}>
            <Text style={styles.headerKicker}>FREE READING</Text>
            <Text style={styles.headerTitle}>Astrology 8 Ball</Text>
          </View>
          <TouchableOpacity onPress={reset} style={styles.iconBtn} activeOpacity={0.75}>
            <RotateCcw size={18} color="#7209B7" />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[
            styles.flex,
            Platform.OS === 'android' && { paddingBottom: Math.max(keyboardHeight - insets.bottom, 0) + 12 },
          ]}
          keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
        >
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: 28 + insets.bottom + (Platform.OS === 'android' ? keyboardHeight : 0) }]}>
            <LinearGradient colors={['#3A0CA3', '#7209B7', '#B5179E']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroCard}>
              <MaterialCommunityIcons name="zodiac-sagittarius" size={126} color="rgba(255,255,255,0.08)" style={styles.heroWatermark} />
              <View style={styles.heroTopRow}>
                <View style={styles.heroIconCircle}>
                  <MaterialCommunityIcons name="circle-slice-8" size={28} color="#FFFFFF" />
                </View>
              </View>
              <Text style={styles.heroTitle}>Ask a yes/no question</Text>
              <Text style={styles.heroBody}>Shake the cosmic ball for a simple do / wait / no signal. It is playful guidance, not a serious decision engine.</Text>
            </LinearGradient>

            <Animated.View style={[styles.ballCard, { transform: [{ translateY: ballY }, { rotate: ballRotate }, { scale: ballScale }] }]}>
              <Svg width={214} height={214} viewBox="0 0 260 260">
                <SvgDefs>
                  <SvgLinearGradient id="ballGlow" x1="12%" y1="0%" x2="88%" y2="100%">
                    <SvgStop offset="0%" stopColor="#4C1D95" />
                    <SvgStop offset="48%" stopColor="#171225" />
                    <SvgStop offset="100%" stopColor="#05040A" />
                  </SvgLinearGradient>
                  <SvgLinearGradient id="answerGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <SvgStop offset="0%" stopColor="#F72585" />
                    <SvgStop offset="100%" stopColor="#7209B7" />
                  </SvgLinearGradient>
                </SvgDefs>
                <SvgCircle cx="130" cy="130" r="116" fill="url(#ballGlow)" />
                <SvgCircle cx="130" cy="130" r="70" fill="#0B1026" stroke="#FFFFFF" strokeOpacity="0.16" strokeWidth="2" />
                <SvgG opacity={answer ? 1 : 0.42}>
                  <SvgPath d="M130 74 L188 174 H72 Z" fill="url(#answerGlow)" stroke="#FFFFFF" strokeOpacity="0.22" strokeWidth="2" />
                  <SvgText x="130" y="132" fill="#FFFFFF" fontSize="22" fontWeight="700" textAnchor="middle">
                    {answer?.verdict || 'ASK'}
                  </SvgText>
                </SvgG>
              </Svg>
            </Animated.View>

            <View style={styles.questionCard}>
              <View style={styles.inputLabelRow}>
                <Sparkles size={15} color="#7209B7" />
                <Text style={styles.inputLabel}>Your question</Text>
              </View>
              <TextInput
                value={question}
                onChangeText={setQuestion}
                placeholder="Should I say yes to this opportunity?"
                placeholderTextColor="#9E9BB3"
                multiline
                style={styles.input}
                returnKeyType="done"
              />
              <TouchableOpacity onPress={askBall} activeOpacity={0.86} style={styles.askButton}>
                <LinearGradient colors={['#F72585', '#7209B7']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.askGradient}>
                  <MaterialCommunityIcons name="magic-staff" size={20} color="#FFFFFF" />
                  <Text style={styles.askText}>Shake the Ball</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {answer && (
              <Animated.View style={[styles.answerCard, { opacity: reveal, transform: [{ translateY: reveal.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }] }]}>
                <View style={[styles.verdictPill, { backgroundColor: `${answer.tone}14` }]}>
                  <Text style={[styles.verdict, { color: answer.tone }]}>{answer.verdict}</Text>
                </View>
                <Text style={styles.answerTitle}>{answer.title}</Text>
                <Text style={styles.answerAdvice}>{answer.advice}</Text>
                <Text style={styles.answerFinePrint}>For health, money, legal, or safety decisions, use real-world help.</Text>
              </Animated.View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 6, paddingBottom: 12 },
  iconBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: 'rgba(114, 111, 141, 0.10)' },
  headerCopy: { alignItems: 'center' },
  headerKicker: { fontFamily: 'Cinzel-Bold', color: '#D9730D', fontSize: 9, letterSpacing: 1.4 },
  headerTitle: { fontFamily: 'Cinzel-Bold', color: '#2C2B3D', fontSize: 20, marginTop: 2 },
  content: { paddingHorizontal: 20, alignItems: 'center' },
  heroCard: { width: '100%', borderRadius: 24, padding: 22, overflow: 'hidden', shadowColor: '#7209B7', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.20, shadowRadius: 18, elevation: 5 },
  heroWatermark: { position: 'absolute', right: -18, top: -18 },
  heroTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  heroIconCircle: { width: 54, height: 54, borderRadius: 27, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.20)' },
  heroTitle: { fontFamily: 'Cinzel-Bold', color: '#FFFFFF', fontSize: 23, lineHeight: 30, marginBottom: 8 },
  heroBody: { fontFamily: 'SourceSerif4', color: 'rgba(255,255,255,0.84)', fontSize: 14, lineHeight: 20 },
  ballCard: { width: 244, height: 244, borderRadius: 122, marginTop: 18, marginBottom: 4, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', shadowColor: '#7209B7', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.18, shadowRadius: 24, elevation: 8 },
  questionCard: { width: '100%', borderRadius: 22, padding: 16, marginTop: 8, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: 'rgba(114, 111, 141, 0.08)', shadowColor: '#726F8D', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 12, elevation: 3 },
  inputLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 10 },
  inputLabel: { fontFamily: 'Cinzel-Bold', color: '#2C2B3D', fontSize: 12, letterSpacing: 0.8 },
  input: { minHeight: 86, color: '#2C2B3D', fontFamily: 'SourceSerif4', fontSize: 15, lineHeight: 21, textAlignVertical: 'top', padding: 12, borderRadius: 16, backgroundColor: '#F8F5FF', borderWidth: 1, borderColor: 'rgba(114, 111, 141, 0.10)' },
  askButton: { borderRadius: 18, overflow: 'hidden', marginTop: 14 },
  askGradient: { height: 52, flexDirection: 'row', gap: 9, alignItems: 'center', justifyContent: 'center' },
  askText: { fontFamily: 'Cinzel-Bold', color: '#FFFFFF', fontSize: 13, letterSpacing: 0.8 },
  answerCard: { width: '100%', marginTop: 18, borderRadius: 22, padding: 18, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: 'rgba(114, 111, 141, 0.08)', shadowColor: '#726F8D', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3 },
  verdictPill: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, marginBottom: 10 },
  verdict: { fontFamily: 'Cinzel-Bold', fontSize: 11, letterSpacing: 1.6 },
  answerTitle: { fontFamily: 'Cinzel-Bold', color: '#2C2B3D', fontSize: 18, marginBottom: 6 },
  answerAdvice: { fontFamily: 'SourceSerif4', color: '#2C2B3D', fontSize: 15, lineHeight: 22 },
  answerFinePrint: { fontFamily: 'SourceSerif4', color: '#8A86A3', fontSize: 11, lineHeight: 16, marginTop: 12 },
});
