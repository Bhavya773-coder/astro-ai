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
import { getAuthToken, getPalmReading, getReadingHistory } from './api';

import {
  ArrowLeft,
  Sparkles,
  Camera,
  Send,
  Sun,
  Heart,
  Brain,
  Briefcase,
  Globe,
  Share2,
} from 'lucide-react-native';
import { ShareCardModal } from './ShareCardModal';
import { ShareCardData } from './shareUtils';

const { width } = Dimensions.get('window');

const RASHIS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

interface PalmReadingScreenProps {
  answers: Record<string, string>;
  zodiacIndex: number;
  onBack: () => void;
  onSendToChat: (userMsg: { id: string; sender: 'user'; text: string }, aiMsg: { id: string; sender: 'ai'; text: string }) => void;
  onUpdateCredits?: (newBalance: number) => void;
}

export default function PalmReadingScreen({
  answers,
  zodiacIndex,
  onBack,
  onSendToChat,
  onUpdateCredits,
}: PalmReadingScreenProps) {
  const insets = useSafeAreaInsets();
  
  // State
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [questionInput, setQuestionInput] = useState('');
  const [loadingStatus, setLoadingStatus] = useState('Traced lines...');
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [isSourceModalVisible, setIsSourceModalVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [shareModalData, setShareModalData] = useState<ShareCardData | null>(null);

  const palmHistory = [
    {
      date: "July 12, 2026",
      imageUri: "https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=300",
      result: {
        hand_type: "Fire Hand (Intuitive & Creative)",
        overall_summary: "Your hand from July 12 shows a high level of creative drive, coupled with a deep capacity for leadership. An active mount of Jupiter promises strong achievements.",
        life_line: "Strong, long, and continuous. Vitality remains balanced and resilient.",
        vitality_score: 5,
        heart_line: "Curving towards Jupiter, highlighting a loyal and warmhearted nature in close partnerships.",
        love_score: 5,
        head_line: "Clear and straight, showing analytical approach to creative project management.",
        fate_line: "Ascending from the center, indicating self-made career growth and determination.",
        career_score: 4,
        sun_line: "Faint but active under the ring finger, promising steady community appreciation.",
        mount_of_venus: "Warm and prominent, showing a deep love for fine arts, luxury, and beauty.",
        lucky_color: "Sunset Orange",
        lucky_number: 3,
        key_prediction: "A significant positive opportunity around creative self-expression will open up in late summer.",
      }
    },
    {
      date: "June 28, 2026",
      imageUri: "https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=300",
      result: {
        hand_type: "Earth Hand (Practical & Grounded)",
        overall_summary: "Your June 28 reading pointed towards a very structured, stable phase. Resilient mounts of Saturn ensure financial security and steady professional steps.",
        life_line: "Very deep, curving closely to the thumb mount. Resilient energy levels.",
        vitality_score: 4,
        heart_line: "Straight and ending under Saturn, showing realistic and structured emotional needs.",
        love_score: 3,
        head_line: "Straight and practical, indicating clear decision-making skills and logic.",
        fate_line: "Strongly defined, showing steady professional commitment and discipline.",
        career_score: 5,
        sun_line: "Faint, indicating recognition is building gradually through consistent efforts.",
        mount_of_venus: "Stable and moderately raised, indicating appreciation of simple pleasures and nature.",
        lucky_color: "Emerald Green",
        lucky_number: 8,
        key_prediction: "Financial stability will see steady improvement due to structured long-term investments.",
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
        const res = await getReadingHistory('palm');
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
          setHistoryList(palmHistory);
        }
      } catch (err) {
        console.log('Error fetching palm history:', err);
        if (active) setHistoryList(palmHistory);
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
        'Initializing scanner...',
        'Mapping palm contours...',
        'Tracing Life, Heart & Head lines...',
        'Analyzing Mount of Venus...',
        'Consulting celestial charts...'
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
            'Please allow camera access in your device settings to scan your palm.',
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
            'Please allow photo library access in your device settings to select your palm photo.',
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




  // Run Palm Analysis
  const handleAnalyze = async () => {
    if (!imageUri) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      // 1. Try to read local URI as base64 using native fetch/blob
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
      
      const res = await getPalmReading(base64Data, mimeType, true);
      if (res && typeof res.remaining_credits === 'number' && onUpdateCredits) {
        onUpdateCredits(res.remaining_credits);
      }
      const data = res?.data || res;
      if (data && (data.overall_summary || data.life_line || data.hand_type)) {
        setAnalysisResult(data);
        setIsAnalyzing(false);
        return;
      } else {
        throw new Error('Invalid response structure from server.');
      }
    } catch (e: any) {
      console.log('[Palm Reading Screen] API failed:', e);
      Alert.alert(
        'Reading Unavailable',
        e?.message || 'We couldn\'t complete your palm analysis right now. Please check your connection and try again.',
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
      text: `Based on your Palm Analysis (${analysisResult.hand_type}):\n\nYour Head Line indicates strong analytical thinking, while your Fate Line shows self-made career growth. Regarding your question: "${questionInput}" — the cosmic mounts suggest that you should trust your logical impulses over emotional pressure at this time. Focus on sunset hues and the number ${analysisResult.lucky_number} to align with your luck flow.`
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
        colors={['#7209B7', '#F72585']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerContainer, { paddingTop: Math.max(16, insets.top) }]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <ArrowLeft size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>PALM READING</Text>
            <Text style={styles.headerSubtitle}>✦ Vedic Astrological Palmistry ✦</Text>
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
            <Text style={styles.cardTitle}>Scan Your Palm</Text>
            <Text style={styles.cardDesc}>
              Our AI will analyze the unique patterns, mounds, and lines of your dominant hand to predict your future destiny.
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
                <MaterialCommunityIcons name="hand-back-left-outline" size={48} color="#7209B7" style={styles.uploadIcon} />
                <Text style={styles.uploadText}>Tap to Upload Palm Photo</Text>
                <Text style={styles.uploadSubtext}>Supports Camera or Gallery</Text>
              </TouchableOpacity>
            )}

            {/* Instruction list below the uploader */}
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsHeader}>Instructions for a Clear Reading:</Text>
              <Text style={styles.instructionLine}>✦ Align your hand clearly under bright, natural lighting.</Text>
              <Text style={styles.instructionLine}>✦ Keep your fingers relaxed and slightly separated.</Text>
              <Text style={styles.instructionLine}>✦ Ensure the major lines (heart, head, life) are in sharp focus.</Text>
            </View>

            {imageUri && (
              <TouchableOpacity style={[styles.analyzeButton, { marginTop: 14 }]} onPress={handleAnalyze}>
                <Sparkles size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.analyzeButtonText}>ANALYZE MY PALM</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.historySection}>
            <Text style={styles.historySectionTitle}>
              <MaterialCommunityIcons name="history" size={16} color="#7209B7" /> Previous Palm Readings
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
                  <Text style={styles.historyCardType}>{item.result?.hand_type || 'Palm Scan'}</Text>
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
            <Text style={[styles.cardTitle, { textAlign: 'center' }]}>SCANNING ACTIVE</Text>
            <Text style={[styles.cardDesc, { textAlign: 'center', marginBottom: 16 }]}>
              Reading line coordinates and measuring planetary mounds...
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
                  colors={['rgba(247, 37, 133, 0)', '#F72585', 'rgba(247, 37, 133, 0)']}
                  style={{ width: '100%', height: '100%' }}
                />
              </Animated.View>
            </View>

            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#7209B7" />
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
                  <Text style={styles.scannedImageBadge}>✦ Scanned Hand Image (Tap to Expand) ✦</Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Overall summary card */}
            <View style={styles.summaryCard}>
              <Text style={styles.resultLabel}>OVERALL SUMMARY</Text>
              <Text style={styles.resultText}>{analysisResult.overall_summary}</Text>
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeLabel}>Hand Type:</Text>
                <Text style={styles.badgeValue}>{analysisResult.hand_type}</Text>
              </View>
            </View>

            {/* Lines List cards */}
            {[
              { title: 'Life Line', key: 'life_line', score: analysisResult.vitality_score, icon: <Sun size={16} color="#F72585" /> },
              { title: 'Heart Line', key: 'heart_line', score: analysisResult.love_score, icon: <Heart size={16} color="#7209B7" /> },
              { title: 'Head Line', key: 'head_line', score: null, icon: <Brain size={16} color="#00F0FF" /> },
              { title: 'Fate Line', key: 'fate_line', score: analysisResult.career_score, icon: <Briefcase size={16} color="#000000" /> },
              { title: 'Sun Line', key: 'sun_line', score: null, icon: <Sparkles size={16} color="#F72585" /> },
              { title: 'Mount of Venus', key: 'mount_of_venus', score: null, icon: <Globe size={16} color="#B3A2E7" /> },
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
                <Text style={styles.luckyTitle}>LUCKY COLOR</Text>
                <Text style={styles.luckyValue}>{analysisResult.lucky_color}</Text>
              </View>
              <View style={styles.luckyCard}>
                <Text style={styles.luckyTitle}>LUCKY NUMBER</Text>
                <Text style={styles.luckyValue}>{analysisResult.lucky_number}</Text>
              </View>
            </View>

            {/* Prediction block */}
            <View style={styles.palmPredictionCard}>
              <Text style={styles.palmPredictionTitle}>KEY PREDICTION</Text>
              <Text style={styles.palmPredictionBody}>{analysisResult.key_prediction}</Text>
            </View>

            {/* Share Palm Reading Card Button */}
            <TouchableOpacity
              style={[styles.scanAnotherBtn, { backgroundColor: '#7209B7', marginVertical: 12 }]}
              activeOpacity={0.8}
              onPress={() => {
                setShareModalData({
                  category: 'PALM READING',
                  title: analysisResult.headline || 'Palmistry Lines Scan',
                  readingText: analysisResult.key_prediction || analysisResult.life_line || 'Hand lines reveal unique life path patterns and cosmic energy potentials.',
                  highlights: [
                    { label: 'Lucky Color', value: String(analysisResult.lucky_color || 'Violet') },
                    { label: 'Lucky Number', value: String(analysisResult.lucky_number || '7') },
                    { label: 'Heart Line', value: analysisResult.heart_line ? 'Scanned' : 'Analyzed' },
                  ],
                });
                setShareModalVisible(true);
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Share2 size={16} color="#FFFFFF" />
                <Text style={[styles.scanAnotherBtnText, { color: '#FFFFFF' }]}>SHARE PALM READING CARD</Text>
              </View>
            </TouchableOpacity>

            {/* Follow-up question container */}
            <View style={styles.questionCard}>
              <Text style={styles.questionPromptTitle}>Ask a follow-up question:</Text>
              <View style={styles.questionInputRow}>
                <TextInput
                  style={styles.questionTextInput}
                  placeholder="Ask about your love line or career..."
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

            {/* Scan another hand */}
            <TouchableOpacity
              style={styles.scanAnotherBtn}
              onPress={() => {
                setImageUri(null);
                setAnalysisResult(null);
              }}
            >
              <Text style={styles.scanAnotherBtnText}>SCAN ANOTHER PALM</Text>
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
            <Text style={styles.actionSheetDesc}>Choose a source to scan your palm</Text>
            
            <TouchableOpacity 
              style={styles.actionSheetOption}
              onPress={() => {
                setIsSourceModalVisible(false);
                handleSelectImage(true);
              }}
            >
              <MaterialCommunityIcons name="camera" size={20} color="#7209B7" style={{ marginRight: 12 }} />
              <Text style={styles.actionSheetOptionText}>Take Photo (Camera)</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionSheetOption}
              onPress={() => {
                setIsSourceModalVisible(false);
                handleSelectImage(false);
              }}
            >
              <MaterialCommunityIcons name="image-multiple" size={20} color="#7209B7" style={{ marginRight: 12 }} />
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
    borderColor: 'rgba(114, 9, 183, 0.2)',
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
    color: 'rgba(114, 9, 183, 0.4)',
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
    borderColor: 'rgba(247, 37, 133, 0.15)',
  },
  resultLabel: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 13,
    color: '#F72585',
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
    color: '#7209B7',
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
    color: '#7209B7',
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
