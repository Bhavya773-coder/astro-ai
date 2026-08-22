import React, { useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
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
  { verdict: 'YES', tone: '#52B788', title: 'Move with confidence', advice: 'Do it, but keep the first step small and reversible.' },
  { verdict: 'YES', tone: '#7209B7', title: 'The stars support it', advice: 'Proceed today if your intention is clean and your facts are checked.' },
  { verdict: 'WAIT', tone: '#D9730D', title: 'Let the sky settle', advice: 'Do not force it yet. Sleep on it, then ask again with one clear next step.' },
  { verdict: 'NO', tone: '#E63946', title: 'Protect your energy', advice: 'Do not do it now. The cost is louder than the signal.' },
  { verdict: 'MAYBE', tone: '#3A0CA3', title: 'Ask for one sign', advice: 'Move only if you get a practical confirmation, not just excitement.' },
  { verdict: 'YES', tone: '#F72585', title: 'Heart first, plan second', advice: 'Say yes, then set a boundary so the choice does not drain you.' },
  { verdict: 'WAIT', tone: '#B3A2E7', title: 'Moon says observe', advice: 'Gather one more piece of real-world evidence before acting.' },
  { verdict: 'NO', tone: '#2C2B3D', title: 'Not this path', advice: 'Decline this version. A cleaner option is likely nearby.' },
];

type Props = {
  answers: Record<string, string>;
  zodiacIndex: number;
  onBack: () => void;
};

export default function Astrology8BallScreen({ answers, zodiacIndex, onBack }: Props) {
  const insets = useSafeAreaInsets();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<typeof ANSWERS[number] | null>(null);
  const shake = useRef(new Animated.Value(0)).current;
  const reveal = useRef(new Animated.Value(0)).current;

  const name = answers.full_name || 'Seeker';
  const zodiacSeed = Number.isFinite(zodiacIndex) ? zodiacIndex : 0;

  const askBall = () => {
    const cleanQuestion = question.trim();
    if (cleanQuestion.length < 4) {
      Alert.alert('Ask the cosmic ball', 'Type a clear yes/no question first.');
      return;
    }

    haptic.press();
    setAnswer(null);
    reveal.setValue(0);
    shake.setValue(0);

    Animated.sequence([
      Animated.timing(shake, { toValue: 1, duration: 1100, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(reveal, { toValue: 1, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start(() => haptic.success());

    const seed = cleanQuestion.split('').reduce((sum, char) => sum + char.charCodeAt(0), zodiacSeed + new Date().getDate());
    setTimeout(() => setAnswer(ANSWERS[seed % ANSWERS.length]), 850);
  };

  const reset = () => {
    haptic.tap();
    setQuestion('');
    setAnswer(null);
    reveal.setValue(0);
    shake.setValue(0);
  };

  const ballRotate = shake.interpolate({ inputRange: [0, 0.2, 0.45, 0.7, 1], outputRange: ['0deg', '-18deg', '16deg', '-8deg', '0deg'] });
  const ballY = shake.interpolate({ inputRange: [0, 0.25, 0.5, 0.75, 1], outputRange: [0, -20, 8, -10, 0] });
  const ballScale = shake.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.08, 1] });

  return (
    <LinearGradient colors={['#080614', '#160B2D', '#2B0B45']} style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { haptic.tap(); onBack(); }} style={styles.backBtn} activeOpacity={0.75}>
            <ArrowLeft size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerKicker}>FREE READING</Text>
            <Text style={styles.headerTitle}>Astrology 8 Ball</Text>
          </View>
          <TouchableOpacity onPress={reset} style={styles.backBtn} activeOpacity={0.75}>
            <RotateCcw size={19} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: 28 + insets.bottom }]}>
            <Text style={styles.intro}>Ask a yes/no question. The cosmic die rises with a simple do / do-not-do signal.</Text>

            <Animated.View style={[styles.ballWrap, { transform: [{ translateY: ballY }, { rotate: ballRotate }, { scale: ballScale }] }]}>
              <Svg width={260} height={260} viewBox="0 0 260 260">
                <SvgDefs>
                  <SvgLinearGradient id="ballGlow" x1="15%" y1="0%" x2="90%" y2="100%">
                    <SvgStop offset="0%" stopColor="#5D2AFF" />
                    <SvgStop offset="52%" stopColor="#080812" />
                    <SvgStop offset="100%" stopColor="#000000" />
                  </SvgLinearGradient>
                  <SvgLinearGradient id="answerGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <SvgStop offset="0%" stopColor="#9D4EDD" />
                    <SvgStop offset="100%" stopColor="#3A0CA3" />
                  </SvgLinearGradient>
                </SvgDefs>
                <SvgCircle cx="130" cy="130" r="116" fill="url(#ballGlow)" />
                <SvgCircle cx="92" cy="70" r="30" fill="#FFFFFF" opacity="0.14" />
                <SvgCircle cx="130" cy="130" r="70" fill="#0B1026" stroke="#FFFFFF" strokeOpacity="0.12" strokeWidth="2" />
                <SvgG opacity={answer ? 1 : 0.34}>
                  <SvgPath d="M130 74 L188 174 H72 Z" fill="url(#answerGlow)" stroke="#FFFFFF" strokeOpacity="0.22" strokeWidth="2" />
                  <SvgText x="130" y="132" fill="#FFFFFF" fontSize="22" fontWeight="700" textAnchor="middle">
                    {answer?.verdict || 'ASK'}
                  </SvgText>
                  <SvgText x="130" y="154" fill="#EDE7FF" fontSize="10" textAnchor="middle">
                    COSMIC DIE
                  </SvgText>
                </SvgG>
              </Svg>
            </Animated.View>

            <View style={styles.questionCard}>
              <View style={styles.inputLabelRow}>
                <Sparkles size={15} color="#FBBF24" />
                <Text style={styles.inputLabel}>Your question</Text>
              </View>
              <TextInput
                value={question}
                onChangeText={setQuestion}
                placeholder="Should I say yes to this opportunity?"
                placeholderTextColor="rgba(255,255,255,0.45)"
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
              <Animated.View style={[styles.answerCard, { opacity: reveal, transform: [{ translateY: reveal.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
                <Text style={[styles.verdict, { color: answer.tone }]}>{answer.verdict}</Text>
                <Text style={styles.answerTitle}>{answer.title}</Text>
                <Text style={styles.answerAdvice}>{answer.advice}</Text>
                <Text style={styles.answerFinePrint}>Entertainment guidance only. For serious health, money, or safety decisions, use real-world advice.</Text>
              </Animated.View>
            )}

            <Text style={styles.personalLine}>Tuned for {name} • free astrology toy • no credits used</Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 6, paddingBottom: 12 },
  backBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.10)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' },
  headerKicker: { fontFamily: 'Cinzel-Bold', color: '#FBBF24', fontSize: 9, letterSpacing: 1.4, textAlign: 'center' },
  headerTitle: { fontFamily: 'Cinzel-Bold', color: '#FFFFFF', fontSize: 20, textAlign: 'center', marginTop: 2 },
  content: { paddingHorizontal: 20, alignItems: 'center' },
  intro: { fontFamily: 'SourceSerif4', fontSize: 14, lineHeight: 20, textAlign: 'center', color: 'rgba(255,255,255,0.74)', marginTop: 8, marginBottom: 18 },
  ballWrap: { width: 280, height: 280, alignItems: 'center', justifyContent: 'center', shadowColor: '#9D4EDD', shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.42, shadowRadius: 28, elevation: 9 },
  questionCard: { width: '100%', borderRadius: 24, padding: 16, marginTop: 8, backgroundColor: 'rgba(255,255,255,0.09)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' },
  inputLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 10 },
  inputLabel: { fontFamily: 'Cinzel-Bold', color: '#FFFFFF', fontSize: 12, letterSpacing: 0.8 },
  input: { minHeight: 88, color: '#FFFFFF', fontFamily: 'SourceSerif4', fontSize: 15, lineHeight: 21, textAlignVertical: 'top', padding: 12, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.22)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)' },
  askButton: { borderRadius: 18, overflow: 'hidden', marginTop: 14 },
  askGradient: { height: 52, flexDirection: 'row', gap: 9, alignItems: 'center', justifyContent: 'center' },
  askText: { fontFamily: 'Cinzel-Bold', color: '#FFFFFF', fontSize: 13, letterSpacing: 0.8 },
  answerCard: { width: '100%', marginTop: 18, borderRadius: 22, padding: 18, backgroundColor: '#FFFFFF', shadowColor: '#000000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.16, shadowRadius: 18, elevation: 7 },
  verdict: { fontFamily: 'Cinzel-Bold', fontSize: 12, letterSpacing: 1.8, marginBottom: 6 },
  answerTitle: { fontFamily: 'Cinzel-Bold', color: '#2C2B3D', fontSize: 18, marginBottom: 6 },
  answerAdvice: { fontFamily: 'SourceSerif4', color: '#2C2B3D', fontSize: 15, lineHeight: 22 },
  answerFinePrint: { fontFamily: 'SourceSerif4', color: '#8A86A3', fontSize: 11, lineHeight: 16, marginTop: 12 },
  personalLine: { fontFamily: 'SourceSerif4', color: 'rgba(255,255,255,0.52)', fontSize: 11, textAlign: 'center', marginTop: 16 },
});
