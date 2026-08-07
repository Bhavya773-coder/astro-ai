import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Animated,
  Easing,
  ActivityIndicator,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getAuthToken, getFaceReading, getReadingHistory } from './api';

import {
  ArrowLeft,
  Sparkles,
  Camera,
  Send,
  Sun,
  Eye,
  User,
  Heart,
  Briefcase,
  Globe,
  Share2,
} from 'lucide-react-native';
import { ShareCardModal } from './ShareCardModal';
import { ShareCardData } from './shareUtils';

const { width } = Dimensions.get('window');

const RASHIS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

interface FaceReadingScreenProps {
  answers: Record<string, string>;
  zodiacIndex: number;
  onBack: () => void;
  onSendToChat: (userMsg: { id: string; sender: 'user'; text: string }, aiMsg: { id: string; sender: 'ai'; text: string }) => void;
  onUpdateCredits?: (newBalance: number) => void;
}

export default function FaceReadingScreen({
  answers,
  zodiacIndex,
  onBack,
  onSendToChat,
  onUpdateCredits,
}: FaceReadingScreenProps) {
  const insets = useSafeAreaInsets();
  
  // State
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [questionInput, setQuestionInput] = useState('');
  const [loadingStatus, setLoadingStatus] = useState('Traced features...');
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [isSourceModalVisible, setIsSourceModalVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [shareModalData, setShareModalData] = useState<ShareCardData | null>(null);

  const faceHistory = [
    {
      date: "July 15, 2026",
      imageUri: "https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=300",
      result: {
        face_shape: "Oval Face (Balanced & Charismatic)",
        overall_summary: "Your face reading from July 15 indicated exceptional harmony between critical thinking and creative energy. The forehead mount is particularly strong, showing career success.",
        forehead: "Broad, smooth, and prominent, indicating high analytical skills and vocational growth.",
        forehead_score: 5,
        eyes: "Bright, deep-set, and showing strong spiritual awareness and dedication.",
        eyes_score: 4,
        nose: "Straight and strong, signaling highly structured wealth accumulation potential.",
        nose_score: 5,
        eyebrows: "Well-aligned, showing stable emotional reactions and loyal partnerships.",
        mouth_lips: "Balanced and clean contour, reflecting a noble communicational presence.",
        chin_jawline: "Defined and firm, denoting resilience and strong determination.",
        lucky_element: "Water",
        lucky_time: "Golden Hour",
        key_prediction: "A significant transition in a leadership role will arrive before your next birthday.",
      }
    },
    {
      date: "July 01, 2026",
      imageUri: "https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=300",
      result: {
        face_shape: "Round Face (Empathetic & Diplomatic)",
        overall_summary: "Your July 1 face reading highlighted your deep capacity for emotional empathy and diplomatic leadership. Stable eyes promise balanced relationship decisions.",
        forehead: "Rounded, indicating imaginative thinking and strong creative intuition.",
        forehead_score: 4,
        eyes: "Warm, soft, and deep, reflecting high empathy, loyalty, and deep intuition.",
        eyes_score: 5,
        nose: "Softly contoured, showing a generous approach to career and helper dynamics.",
        nose_score: 3,
        eyebrows: "Curved and soft, suggesting gentleness in friendships and familial support.",
        mouth_lips: "Full and expressive, highlighting outstanding storytelling and social skills.",
        chin_jawline: "Rounded, denoting peaceful resolution strategies and long life health.",
        lucky_element: "Air",
        lucky_time: "Sunrise",
        key_prediction: "A cooperative creative project will flourish, bringing deep emotional satisfaction.",
      }
    }
  ];

  // Animation values
  const scanAnim = useRef(new Animated.Value(0)).current;

  const [historyList, setHistoryList] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchHistory = async () => {
      setIsLoadingHistory(true);
      try {
        const res = await getReadingHistory('face');
        if (active && res.success && Array.isArray(res.data) && res.data.length > 0) {
          const mapped = res.data.map((item: any) => ({
            date: new Date(item.created_at || item.createdAt || Date.now()).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            }),
            imageUri: item.image_data
              ? (item.image_data.startsWith('data:')
                ? item.image_data
                : `data:${item.mime_type || 'image/jpeg'};base64,${item.image_data}`)
              : "https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=300",
            result: item.result
          }));
          setHistoryList(mapped);
        } else if (active) {
          setHistoryList(faceHistory);
        }
      } catch (err) {
        console.log('Error fetching face history:', err);
        if (active) setHistoryList(faceHistory);
      } finally {
        if (active) setIsLoadingHistory(false);
      }
    };

    fetchHistory();
    return () => {
      active = false;
    };
  }, []);

  // Scanning text rotation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnalyzing) {
      const statuses = [
        'Detecting face contour...',
        'Mapping forehead and eyebrows...',
        'Analyzing eyes and gaze energy...',
        'Measuring nose and cheekbones...',
        'Calculating jawline and chin alignment...'
      ];
      let index = 0;
      setLoadingStatus(statuses[0]);
      interval = setInterval(() => {
        index = (index + 1) % statuses.length;
        setLoadingStatus(statuses[index]);
      }, 800);
      
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scanAnim, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scanAnim.setValue(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAnalyzing]);

  // Image Picker Handlers
  const handleSelectImage = async (useCamera: boolean) => {
    try {
      let result;
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Camera Access Required',
            'Please allow camera access in your device settings to scan your face.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() }
            ]
          );
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          quality: 0.8,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Photo Library Access Required',
            'Please allow photo library access in your device settings to select your face photo.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() }
            ]
          );
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Image Selection Failed', 'We couldn\'t access the selected image. Please try again.');
    }
  };

  // Run Face Analysis
  const handleAnalyze = async () => {
    if (!imageUri) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const localResponse = await fetch(imageUri);
      const blob = await localResponse.blob();
      
      const base64Promise = new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            const parts = reader.result.split(';base64,');
            resolve(parts[1] || reader.result);
          } else {
            reject(new Error('Failed to read image as base64 string'));
          }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
      });
      
      const base64Data = await base64Promise;
      const mimeType = blob.type || 'image/jpeg';
      
      const res = await getFaceReading(base64Data, mimeType, true);
      if (res && typeof res.remaining_credits === 'number' && onUpdateCredits) {
        onUpdateCredits(res.remaining_credits);
      }
      const data = res?.data || res;
      if (data && (data.overall_summary || data.overall_aura || data.face_shape)) {
        const mapped = {
          face_shape: data.face_shape || data.overall_aura || '—',
          overall_summary: data.overall_summary || data.overall_aura || '—',
          forehead: data.forehead || data.forehead_reading || '—',
          forehead_score: data.forehead_score || data.personality_scores?.creativity || 0,
          eyes: data.eyes || data.eyes_reading || '—',
          eyes_score: data.eyes_score || data.personality_scores?.empathy || 0,
          nose: data.nose || data.nose_reading || '—',
          nose_score: data.nose_score || data.personality_scores?.ambition || 0,
          eyebrows: data.eyebrows || data.hidden_trait || '—',
          mouth_lips: data.mouth_lips || data.mouth_reading || '—',
          chin_jawline: data.chin_jawline || data.chin_reading || '—',
          lucky_element: data.lucky_element || data.element_type || '—',
          lucky_time: data.lucky_time || data.life_purpose_hint || '—',
          key_prediction: data.key_prediction || data.dominant_strength || '—',
        };
        setAnalysisResult(mapped);
        setIsAnalyzing(false);
        return;
      } else {
        throw new Error('Invalid response structure from server.');
      }
    } catch (e: any) {
      console.log('[Face Reading Screen] API failed:', e);
      Alert.alert(
        'Reading Unavailable',
        e?.message || 'We couldn\'t complete your face analysis right now. Please check your connection and try again.',
        [
          { text: 'OK' },
          { text: 'Retry', onPress: () => handleAnalyze() }
        ]
      );
      setIsAnalyzing(false);
    }
  };

  const handleQuestionSubmit = () => {
    if (!questionInput.trim() || !analysisResult) return;
    
    const userMsg = { id: `user_${Date.now()}`, sender: 'user' as const, text: questionInput };
    const aiMsg = {
      id: `ai_${Date.now()}`,
      sender: 'ai' as const,
      text: `Based on your Face Reading (${analysisResult.face_shape}):\n\nYour forehead shows exceptional focus, and your jawline indicates persistent leadership. Regarding your question: "${questionInput}" — the facial alignments suggest that you will find success by relying on your natural communication skills. Your lucky element is ${analysisResult.lucky_element}.`
    };
    
    onSendToChat(userMsg, aiMsg);
  };

  const handleBackPress = () => {
    if (analysisResult) {
      setAnalysisResult(null);
      setImageUri(null);
    } else {
      onBack();
    }
  };

  return (
    <LinearGradient
      colors={['#F3EFFF', '#E9F3FF', '#FFFDF2']}
      locations={[0, 0.5, 1]}
      style={styles.container}
    >
      {/* 1. Header Row */}
      <LinearGradient
        colors={['#3A86C8', '#8338EC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerContainer, { paddingTop: Math.max(16, insets.top) }]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <ArrowLeft size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>FACE READING</Text>
            <Text style={styles.headerSubtitle}>✦ Vedic Physiognomy (Samudrika) ✦</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      {/* 2. Scrollable Body */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 40 + insets.bottom }]}
      >
        {/* Step 1: Pre-Analysis selection */}
        {!analysisResult && !isAnalyzing && (<>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Scan Your Face</Text>
            <Text style={styles.cardDesc}>
              Face reading reveals your inner character, personality traits, and future prospects based on the physical features of your face.
            </Text>

            {imageUri ? (
              <View style={styles.previewBox}>
                <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
                <TouchableOpacity style={styles.removeImageButton} onPress={() => setImageUri(null)}>
                  <MaterialCommunityIcons name="trash-can-outline" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.dashedUploadBox}
                activeOpacity={0.7}
                onPress={() => setIsSourceModalVisible(true)}
              >
                <MaterialCommunityIcons name="face-recognition" size={48} color="#8338EC" style={styles.uploadIcon} />
                <Text style={styles.uploadText}>Tap to Upload Face Photo</Text>
                <Text style={styles.uploadSubtext}>Supports Camera or Gallery</Text>
              </TouchableOpacity>
            )}

            {/* Instruction list below the uploader */}
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsHeader}>Instructions for a Clear Reading:</Text>
              <Text style={styles.instructionLine}>✦ Capture photo looking directly forward at the camera.</Text>
              <Text style={styles.instructionLine}>✦ Maintain a neutral facial expression with your forehead clear.</Text>
              <Text style={styles.instructionLine}>✦ Ensure consistent lighting without strong shadows.</Text>
            </View>

            {imageUri && (
              <TouchableOpacity style={[styles.analyzeButton, { marginTop: 14 }]} onPress={handleAnalyze}>
                <Sparkles size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.analyzeButtonText}>ANALYZE MY FACE</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.historySection}>
            <Text style={[styles.historySectionTitle, { color: '#8338EC' }]}>
              <MaterialCommunityIcons name="history" size={16} color="#8338EC" /> Previous Face Readings
            </Text>
            {historyList.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.historyCard}
                activeOpacity={0.7}
                onPress={() => {
                  setImageUri(item.imageUri);
                  setAnalysisResult(item.result);
                }}
              >
                <View style={styles.historyCardHeader}>
                  <Text style={styles.historyCardDate}>{item.date}</Text>
                  <Text style={[styles.historyCardType, { color: '#8338EC' }]}>{item.result?.face_shape || 'Face Scan'}</Text>
                </View>
                <Text style={styles.historyCardSummary} numberOfLines={2}>
                  {item.result?.overall_summary || 'Analysis completed.'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
        )}

        {/* Step 2: Analyzer scanning animation */}
        {isAnalyzing && (
          <View style={styles.card}>
            <Text style={[styles.cardTitle, { textAlign: 'center' }]}>BIOMETRIC FACE SCAN</Text>
            <Text style={[styles.cardDesc, { textAlign: 'center', marginBottom: 16 }]}>
              Mapping facial symmetry and detecting feature lines...
            </Text>
            
            <View style={styles.scanBox}>
              {imageUri && <Image source={{ uri: imageUri }} style={styles.scanImage} resizeMode="cover" />}
              <Animated.View style={[
                styles.laserLine,
                {
                  transform: [{
                    translateY: scanAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 200]
                    })
                  }]
                }
              ]}>
                <LinearGradient
                  colors={['rgba(131, 56, 236, 0)', '#8338EC', 'rgba(131, 56, 236, 0)']}
                  style={{ width: '100%', height: '100%' }}
                />
              </Animated.View>
            </View>

            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#8338EC" />
              <Text style={styles.statusText}>{loadingStatus}</Text>
            </View>
          </View>
        )}

        {/* Step 3: Analysis Results display */}
        {analysisResult && !isAnalyzing && (
          <View style={{ gap: 16 }}>
            {imageUri && (
              <TouchableOpacity 
                style={styles.scannedImageContainer}
                activeOpacity={0.9}
                onPress={() => setIsImageModalVisible(true)}
              >
                <Image source={{ uri: imageUri }} style={styles.scannedImage} resizeMode="cover" />
                <View style={styles.scannedImageOverlay}>
                  <Text style={styles.scannedImageBadge}>✦ Scanned Face Image (Tap to Expand) ✦</Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Overall summary card */}
            <View style={styles.summaryCard}>
              <Text style={styles.resultLabel}>FACE TYPE & PROFILE SUMMARY</Text>
              <Text style={styles.resultText}>{analysisResult.overall_summary}</Text>
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeLabel}>Face Shape:</Text>
                <Text style={styles.badgeValue}>{analysisResult.face_shape}</Text>
              </View>
            </View>

            {/* Features List cards */}
            {[
              { title: 'Forehead', key: 'forehead', score: analysisResult.forehead_score, icon: <Sparkles size={16} color="#8338EC" /> },
              { title: 'Eyes', key: 'eyes', score: analysisResult.eyes_score, icon: <Eye size={16} color="#3A86C8" /> },
              { title: 'Nose', key: 'nose', score: analysisResult.nose_score, icon: <Briefcase size={16} color="#000000" /> },
              { title: 'Eyebrows', key: 'eyebrows', score: null, icon: <User size={16} color="#B3A2E7" /> },
              { title: 'Mouth & Lips', key: 'mouth_lips', score: null, icon: <Heart size={16} color="#F72585" /> },
              { title: 'Chin & Jawline', key: 'chin_jawline', score: null, icon: <Globe size={16} color="#90E0EF" /> },
            ].map((item) => (
              <View key={item.title} style={styles.lineCard}>
                <View style={styles.lineHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {item.icon}
                    <Text style={styles.lineTitle}>{item.title}</Text>
                  </View>
                  {item.score !== null && (
                    <View style={styles.starsRow}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <MaterialCommunityIcons
                          key={star}
                          name="star"
                          size={14}
                          color={star <= (item.score || 0) ? '#FFD700' : 'rgba(0,0,0,0.15)'}
                          style={{ marginRight: 2 }}
                        />
                      ))}
                    </View>
                  )}
                </View>
                <Text style={styles.lineBody}>{analysisResult[item.key]}</Text>
              </View>
            ))}

            {/* Lucky properties */}
            <View style={styles.luckyGrid}>
              <View style={styles.luckyCard}>
                <Text style={styles.luckyTitle}>LUCKY ELEMENT</Text>
                <Text style={styles.luckyValue}>{analysisResult.lucky_element}</Text>
              </View>
              <View style={styles.luckyCard}>
                <Text style={styles.luckyTitle}>LUCKY HOUR</Text>
                <Text style={styles.luckyValue}>{analysisResult.lucky_time}</Text>
              </View>
            </View>

            {/* Prediction block */}
            <View style={styles.palmPredictionCard}>
              <Text style={styles.palmPredictionTitle}>KEY INSIGHT</Text>
              <Text style={styles.palmPredictionBody}>{analysisResult.key_prediction}</Text>
            </View>

            {/* Share Face Reading Card Button */}
            <TouchableOpacity
              style={[styles.scanAnotherBtn, { backgroundColor: '#7209B7', marginVertical: 12 }]}
              activeOpacity={0.8}
              onPress={() => {
                setShareModalData({
                  category: 'FACE READING',
                  title: analysisResult.headline || 'Physiognomy Facial Analysis',
                  readingText: analysisResult.key_prediction || analysisResult.forehead || 'Facial geometry reveals key character traits, life luck, and cosmic expression.',
                  highlights: [
                    { label: 'Lucky Element', value: String(analysisResult.lucky_element || 'Fire') },
                    { label: 'Lucky Time', value: String(analysisResult.lucky_time || 'Morning') },
                  ],
                });
                setShareModalVisible(true);
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Share2 size={16} color="#FFFFFF" />
                <Text style={[styles.scanAnotherBtnText, { color: '#FFFFFF' }]}>SHARE FACE READING CARD</Text>
              </View>
            </TouchableOpacity>

            {/* Follow-up question container */}
            <View style={styles.questionCard}>
              <Text style={styles.questionPromptTitle}>Ask a follow-up question:</Text>
              <View style={styles.questionInputRow}>
                <TextInput
                  style={styles.questionTextInput}
                  placeholder="Ask about your forehead fortune or eyes..."
                  placeholderTextColor="rgba(0,0,0,0.4)"
                  value={questionInput}
                  onChangeText={setQuestionInput}
                  onSubmitEditing={handleQuestionSubmit}
                />
                <TouchableOpacity style={styles.questionSubmitBtn} onPress={handleQuestionSubmit}>
                  <Send size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Scan another face */}
            <TouchableOpacity
              style={styles.scanAnotherBtn}
              onPress={() => {
                setImageUri(null);
                setAnalysisResult(null);
              }}
            >
              <Text style={styles.scanAnotherBtnText}>SCAN ANOTHER FACE</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      {/* 3. Image Fullscreen Modal Overlay */}
      {isImageModalVisible && imageUri && (
        <TouchableOpacity 
          style={styles.fullscreenModalContainer}
          activeOpacity={1}
          onPress={() => setIsImageModalVisible(false)}
        >
          <Image source={{ uri: imageUri }} style={styles.fullscreenModalImage} resizeMode="contain" />
          <TouchableOpacity 
            style={[styles.closeModalButton, { top: Math.max(20, insets.top + 10) }]}
            onPress={() => setIsImageModalVisible(false)}
          >
            <MaterialCommunityIcons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </TouchableOpacity>
      )}

      {/* 4. Action Sheet Source Selection Modal */}
      {isSourceModalVisible && (
        <View style={styles.actionSheetContainer}>
          <TouchableOpacity 
            style={styles.actionSheetBackdrop}
            activeOpacity={1}
            onPress={() => setIsSourceModalVisible(false)}
          />
          <View style={[styles.actionSheetContent, { paddingBottom: Math.max(20, insets.bottom + 12) }]}>
            <Text style={styles.actionSheetTitle}>Upload Photo</Text>
            <Text style={styles.actionSheetDesc}>Choose a source to scan your face</Text>
            
            <TouchableOpacity 
              style={styles.actionSheetOption}
              onPress={() => {
                setIsSourceModalVisible(false);
                handleSelectImage(true);
              }}
            >
              <MaterialCommunityIcons name="camera" size={20} color="#8338EC" style={{ marginRight: 12 }} />
              <Text style={styles.actionSheetOptionText}>Take Photo (Camera)</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionSheetOption}
              onPress={() => {
                setIsSourceModalVisible(false);
                handleSelectImage(false);
              }}
            >
              <MaterialCommunityIcons name="image-multiple" size={20} color="#8338EC" style={{ marginRight: 12 }} />
              <Text style={styles.actionSheetOptionText}>Choose from Gallery</Text>
            </TouchableOpacity>

            <View style={styles.actionSheetDivider} />

            <TouchableOpacity 
              style={styles.actionSheetCancel}
              onPress={() => setIsSourceModalVisible(false)}
            >
              <Text style={styles.actionSheetCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Share Card Modal */}
      <ShareCardModal
        visible={shareModalVisible}
        data={shareModalData}
        onClose={() => setShareModalVisible(false)}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 18,
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  headerSubtitle: {
    fontFamily: 'Cinzel',
    fontSize: 9.5,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
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
  },
  cardTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 16,
    color: '#2C2B3D',
    marginBottom: 8,
  },
  cardDesc: {
    fontFamily: 'SourceSerif4',
    fontSize: 13,
    color: '#726F8D',
    lineHeight: 19,
    marginBottom: 20,
  },
  dashedUploadBox: {
    height: 180,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(131, 56, 236, 0.2)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(179, 162, 231, 0.02)',
    marginBottom: 20,
  },
  uploadIcon: {
    opacity: 0.3,
    marginBottom: 12,
  },
  uploadText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 11.5,
    color: 'rgba(131, 56, 236, 0.4)',
  },
  previewBox: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(114, 111, 141, 0.15)',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
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
  buttonGroupRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 14,
  },
  actionButton: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
  },
  actionButtonText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 11,
    color: '#FFFFFF',
  },
  analyzeButton: {
    height: 46,
    borderRadius: 12,
    backgroundColor: '#8338EC',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8338EC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  analyzeButtonText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 12.5,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  scanBox: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(114, 111, 141, 0.15)',
    marginBottom: 20,
  },
  scanImage: {
    width: '100%',
    height: '100%',
    opacity: 0.7,
  },
  laserLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 12,
    zIndex: 10,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 10,
  },
  statusText: {
    fontFamily: 'SourceSerif4',
    fontSize: 12.5,
    color: '#726F8D',
    fontStyle: 'italic',
  },
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(131, 56, 236, 0.15)',
  },
  resultLabel: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 13,
    color: '#8338EC',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  resultText: {
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
    backgroundColor: 'rgba(131, 56, 236, 0.08)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  badgeLabel: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 9.5,
    color: '#8338EC',
    marginRight: 4,
  },
  badgeValue: {
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 11,
    color: '#2C2B3D',
  },
  lineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(114, 111, 141, 0.06)',
  },
  lineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  lineTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 12.5,
    color: '#2C2B3D',
    marginLeft: 6,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lineBody: {
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
    flex: 1,
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
  questionCard: {
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
  scanAnotherBtn: {
    height: 46,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#7209B7',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  scanAnotherBtnText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 11.5,
    color: '#7209B7',
    letterSpacing: 0.5,
  },
  historySection: {
    marginTop: 20,
  },
  historySectionTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 12.5,
    color: '#8338EC',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(114, 111, 141, 0.08)',
    marginBottom: 10,
    shadowColor: '#726F8D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  historyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  historyCardDate: {
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 11,
    color: '#726F8D',
  },
  historyCardType: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 9.5,
    color: '#8338EC',
  },
  historyCardSummary: {
    fontFamily: 'SourceSerif4',
    fontSize: 12.5,
    color: '#2C2B3D',
    lineHeight: 17,
  },
  scannedImageContainer: {
    height: 160,
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(114, 111, 141, 0.12)',
    position: 'relative',
    shadowColor: '#726F8D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  scannedImage: {
    width: '100%',
    height: '100%',
  },
  scannedImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(44, 43, 61, 0.55)',
    paddingVertical: 5,
    alignItems: 'center',
  },
  scannedImageBadge: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 9.5,
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  fullscreenModalContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999,
  },
  fullscreenModalImage: {
    width: '100%',
    height: '80%',
  },
  closeModalButton: {
    position: 'absolute',
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadSubtext: {
    fontFamily: 'SourceSerif4',
    fontSize: 11,
    color: 'rgba(114, 111, 141, 0.5)',
    marginTop: 4,
  },
  instructionsContainer: {
    marginTop: 16,
    backgroundColor: 'rgba(114, 111, 141, 0.03)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(114, 111, 141, 0.05)',
  },
  instructionsHeader: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 10.5,
    color: '#2C2B3D',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  instructionLine: {
    fontFamily: 'SourceSerif4',
    fontSize: 11.5,
    color: '#726F8D',
    lineHeight: 16,
    marginBottom: 3,
  },
  actionSheetContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'flex-end',
    zIndex: 999999,
  },
  actionSheetBackdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  actionSheetContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  actionSheetTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 15,
    color: '#2C2B3D',
    textAlign: 'center',
  },
  actionSheetDesc: {
    fontFamily: 'SourceSerif4',
    fontSize: 12,
    color: '#726F8D',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 2,
  },
  actionSheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(114, 111, 141, 0.08)',
  },
  actionSheetOptionText: {
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 14,
    color: '#2C2B3D',
  },
  actionSheetDivider: {
    height: 8,
    backgroundColor: 'rgba(114, 111, 141, 0.05)',
    marginHorizontal: -20,
    marginVertical: 10,
  },
  actionSheetCancel: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  actionSheetCancelText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 14,
    color: '#E63946',
  },
});
