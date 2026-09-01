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
  Modal,
  Share,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { getAuthToken, generateStyleLook, getTodayStyleLook, updateStyleInteraction } from './api';

import {
  ArrowLeft,
  Sparkles,
  Send,
  Palette,
  Flame,
  Droplet,
  Compass,
  Wind,
  Briefcase,
  Heart,
  Smile,
  Info,
  Share2,
  Camera,
  Image as ImageIcon,
  Award,
  CheckCircle2,
  PlusCircle,
  X,
  Eye,
  Download,
  Maximize2,
} from 'lucide-react-native';
import { ShareCardModal } from './ShareCardModal';
import { ShareCardData } from './shareUtils';

const { width, height } = Dimensions.get('window');

interface StyleResult {
  headline: string;
  outfit_description: string;
  alternative_outfit_description?: string;
  colors: string[];
  color_names: string[];
  astrological_reason: string;
  date: string;
  image_base64?: string | null;
  user_photo_base64?: string | null;
  current_outfit_rating?: number | null;
  plus_points?: string[];
  current_outfit_summary?: string;
  occasion?: string;
  interactive_state?: {
    selected_context?: string;
    selected_modifier?: string;
    vibe_selection?: string;
  };
}

interface StyleForecasterScreenProps {
  answers: Record<string, string>;
  zodiacIndex: number;
  onBack: () => void;
  onSendToChat: (userMsg: { id: string; sender: 'user'; text: string }, aiMsg: { id: string; sender: 'ai'; text: string }) => void;
  onUpdateCredits?: (newBalance: number) => void;
}

export default function StyleForecasterScreen({
  answers,
  zodiacIndex,
  onBack,
  onSendToChat,
  onUpdateCredits,
}: StyleForecasterScreenProps) {
  const insets = useSafeAreaInsets();

  // Customizer States
  const [selectedModifier, setSelectedModifier] = useState('Bolder');
  const [selectedContext, setSelectedContext] = useState('Casual');
  const [selectedVibe, setSelectedVibe] = useState('Fluid');
  const [selectedOccasion, setSelectedOccasion] = useState('Date Night');

  // Image Upload States
  const [userImageUri, setUserImageUri] = useState<string | null>(null);
  const [userImageBase64, setUserImageBase64] = useState<string | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [styleResult, setStyleResult] = useState<StyleResult | null>(null);
  const [questionInput, setQuestionInput] = useState('');
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [shareModalData, setShareModalData] = useState<ShareCardData | null>(null);

  // Loading Progress Bar & Skeleton Animation States
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const skeletonOpacity = useRef(new Animated.Value(0.4)).current;

  const LOADING_STEPS = [
    '📸 Scanning uploaded outfit & facial structure...',
    '🪐 Evaluating astrological transits & charm rating...',
    '✨ AI Virtual Try-On: Tailoring alternative look...',
    '🎨 Rendering side-by-side comparison & final forecast...',
  ];

  // Skeleton opacity pulse loop
  useEffect(() => {
    let pulseAnim: Animated.CompositeAnimation | null = null;
    if (isGenerating) {
      pulseAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(skeletonOpacity, {
            toValue: 1.0,
            duration: 850,
            useNativeDriver: true,
          }),
          Animated.timing(skeletonOpacity, {
            toValue: 0.4,
            duration: 850,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnim.start();
    } else {
      skeletonOpacity.setValue(0.4);
    }
    return () => {
      if (pulseAnim) pulseAnim.stop();
    };
  }, [isGenerating]);

  // Smooth progress bar counter (0% -> 95% over ~22s)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isGenerating) {
      setLoadingProgress(5);
      setLoadingStepIndex(0);
      const startTime = Date.now();
      interval = setInterval(() => {
        const elapsedSec = (Date.now() - startTime) / 1000;
        let currentProgress = Math.min(95, 5 + (elapsedSec / 22) * 90);
        setLoadingProgress(currentProgress);

        if (elapsedSec < 5) {
          setLoadingStepIndex(0);
        } else if (elapsedSec < 10) {
          setLoadingStepIndex(1);
        } else if (elapsedSec < 16) {
          setLoadingStepIndex(2);
        } else {
          setLoadingStepIndex(3);
        }
      }, 150);
    } else {
      setLoadingProgress(0);
      setLoadingStepIndex(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGenerating]);

  // Full Screen Image Preview Modal State
  const [previewModal, setPreviewModal] = useState<{ visible: boolean; imageUri: string; title: string }>({
    visible: false,
    imageUri: '',
    title: '',
  });

  // Download / Save Helper
  const handleDownloadImage = async (imageUriOrBase64: string, filename = 'astro_style_photo.png') => {
    try {
      if (!imageUriOrBase64) return;
      let uri = imageUriOrBase64;
      if (!uri.startsWith('http') && !uri.startsWith('data:') && !uri.startsWith('file:')) {
        uri = `data:image/png;base64,${uri}`;
      }

      if (Platform.OS === 'web') {
        const link = document.createElement('a');
        link.href = uri;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        Alert.alert('Photo Saved!', 'Your style photo has been downloaded to your device.');
      } else {
        await Share.share(
          {
            title: 'AstroAI Style Photo',
            url: uri,
            message: 'My AstroAI Style Forecast Photo',
          },
          { dialogTitle: 'Download / Save Style Photo' }
        );
      }
    } catch (e: any) {
      console.error('Download error:', e);
      Alert.alert('Download Failed', 'Could not download the photo. Please try again.');
    }
  };

  // 1. Fetch suggestions or fallback to simulation
  const fetchStyleForecast = async (modifier: string, context: string, vibe: string, force = false) => {
    setIsGenerating(true);
    try {
      const res = await generateStyleLook(
        force,
        modifier,
        context,
        vibe,
        userImageBase64 || undefined,
        selectedOccasion,
        'image/jpeg'
      );
      const rem = res?.credits_remaining ?? res?.remaining_credits;
      if (typeof rem === 'number' && onUpdateCredits) {
        onUpdateCredits(rem);
      }
      const data = res?.data || res;
      if (data && (data.outfit_description || data.recommended_outfit || data.outfit || data.headline)) {
        const normalized: StyleResult = {
          ...data,
          outfit_description: data.outfit_description || data.recommended_outfit || data.outfit || '',
          alternative_outfit_description: data.alternative_outfit_description || data.outfit_description || '',
          plus_points: data.plus_points || [],
        };
        setStyleResult(normalized);
        setIsGenerating(false);
        return;
      } else {
        throw new Error('Invalid style forecast data structure from API.');
      }
    } catch (e: any) {
      console.log('[StyleForecaster Screen] API failed:', e);
      Alert.alert(
        'Forecast Unavailable',
        e?.message || 'We couldn\'t generate your style forecast right now. Please check your connection and try again.',
        [
          { text: 'OK' },
          { text: 'Retry', onPress: () => fetchStyleForecast(modifier, context, vibe, force) }
        ]
      );
      setIsGenerating(false);
    }
  };

  // Fetch initial look if already generated today
  useEffect(() => {
    const checkTodayStyle = async () => {
      try {
        const res = await getTodayStyleLook();
        const data = res?.data || res;
        if (data && (data.outfit_description || data.recommended_outfit || data.outfit || data.headline)) {
          const normalized: StyleResult = {
            ...data,
            outfit_description: data.outfit_description || data.recommended_outfit || data.outfit || '',
            alternative_outfit_description: data.alternative_outfit_description || data.outfit_description || '',
            plus_points: data.plus_points || [],
          };
          setStyleResult(normalized);
          if (data.occasion) setSelectedOccasion(data.occasion);
          if (data.user_photo_base64) setUserImageBase64(data.user_photo_base64);
          if (data.interactive_state) {
            setSelectedModifier(data.interactive_state.selected_modifier === 'Standard' ? 'Bolder' : (data.interactive_state.selected_modifier || 'Bolder'));
            setSelectedContext(data.interactive_state.selected_context || 'Casual');
            setSelectedVibe(data.interactive_state.vibe_selection || 'Fluid');
          }
        }
      } catch (e) {
        console.log('[StyleForecaster Screen] No style suggestion exists for today yet:', e);
      }
    };
    checkTodayStyle();
  }, []);

  // Image Selection Handler
  const handleSelectImage = async (useCamera: boolean) => {
    try {
      let result;
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Camera Access Required',
            'Please allow camera access in your device settings to take a photo of your outfit.',
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
          base64: true,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Photo Library Access Required',
            'Please allow photo library access in your device settings to select an outfit photo.',
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
          base64: true,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setUserImageUri(asset.uri);
        if (asset.base64) {
          setUserImageBase64(asset.base64);
        }
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Image Selection Failed', 'We couldn\'t access the selected image. Please try again.');
    }
  };

  // Update logic on customizer interaction
  const handleInteraction = async (type: 'modifier' | 'context' | 'vibe', value: string) => {
    if (type === 'modifier') setSelectedModifier(value);
    else if (type === 'context') setSelectedContext(value);
    else if (type === 'vibe') setSelectedVibe(value);

    if (styleResult) {
      try {
        await updateStyleInteraction({
          selected_modifier: type === 'modifier' ? value : undefined,
          selected_context: type === 'context' ? value : undefined,
          vibe_selection: type === 'vibe' ? value : undefined,
        });
      } catch (e) {
        console.log('[StyleForecaster Screen] Failed to sync interaction:', e);
      }
    }
  };

  // Submit to Chat
  const handleQuestionSubmit = () => {
    if (!questionInput.trim() || !styleResult) return;

    const userMsg = { id: `user_${Date.now()}`, sender: 'user' as const, text: questionInput };
    const aiMsg = {
      id: `ai_${Date.now()}`,
      sender: 'ai' as const,
      text: `Regarding your Style Forecast (${styleResult.headline}):\n\nYour suggested color palette features: ${styleResult.color_names.join(', ')}.\n\nTo answer your question: "${questionInput}" — I suggest focusing on wearing ${styleResult.color_names[0]} near your throat chakra to support planetary alignment, and using natural organic materials to maintain your flow today.`
    };

    onSendToChat(userMsg, aiMsg);
    setQuestionInput('');
  };

  // Helper icons
  const modifierIcons: Record<string, any> = {
    Standard: Sparkles,
    Bolder: Flame,
    Minimal: Droplet,
    Sharper: Compass,
    Relaxed: Wind,
  };

  const contextIcons: Record<string, any> = {
    Casual: Smile,
    Office: Briefcase,
    Dinner: Heart,
    Event: Sparkles,
  };

  const occasionOptions = ['Date Night', 'Special Event', 'Casual Outing', 'Office', 'Party'];

  // Render Photo Upload & Event Selection Section
  const renderPhotoAndOccasionPicker = () => {
    const currentPhotoUri = userImageUri || (userImageBase64 ? `data:image/jpeg;base64,${userImageBase64}` : null);

    return (
      <View style={styles.cardContainer}>
        <Text style={styles.sectionTitle}>YOUR CURRENT OUTFIT & FACE PHOTO</Text>
        <Text style={styles.subtleTipText}>
          Upload a photo showing your face and current clothes. You can check & download your uploaded photo or the generated alternative outfit photo anytime!
        </Text>

        {/* Photo Container */}
        {currentPhotoUri ? (
          <View style={styles.photoPreviewContainer}>
            <Image
              source={{ uri: currentPhotoUri }}
              style={styles.photoPreview}
              resizeMode="cover"
            />

            {/* Photo Inspection & Download Overlay Actions */}
            <View style={styles.photoOverlayActions}>
              <TouchableOpacity
                style={styles.photoActionBadge}
                onPress={() =>
                  setPreviewModal({
                    visible: true,
                    imageUri: currentPhotoUri,
                    title: 'Your Uploaded Outfit Photo',
                  })
                }
              >
                <Eye size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.photoActionText}>FULL VIEW</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.photoActionBadge, { backgroundColor: '#7209B7' }]}
                onPress={() => handleDownloadImage(currentPhotoUri, 'uploaded_outfit_photo.png')}
              >
                <Download size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.photoActionText}>DOWNLOAD</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.removePhotoBtn}
              onPress={() => {
                setUserImageUri(null);
                setUserImageBase64(null);
              }}
            >
              <X size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.photoUploadRow}>
            <TouchableOpacity style={styles.photoBtn} onPress={() => handleSelectImage(true)}>
              <LinearGradient colors={['#7209B7', '#9D4EDD']} style={styles.photoBtnGradient}>
                <Camera size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.photoBtnText}>TAKE PHOTO</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.photoBtn} onPress={() => handleSelectImage(false)}>
              <View style={styles.photoBtnOutline}>
                <ImageIcon size={18} color="#7209B7" style={{ marginRight: 6 }} />
                <Text style={styles.photoBtnTextOutline}>CHOOSE GALLERY</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Occasion / Event Picker */}
        <View style={{ marginTop: 16 }}>
          <Text style={styles.customizerLabel}>Select Event / Target Occasion</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {occasionOptions.map(occ => {
              const isActive = selectedOccasion === occ;
              return (
                <TouchableOpacity
                  key={occ}
                  onPress={() => setSelectedOccasion(occ)}
                  style={[styles.customizerBtn, isActive && styles.customizerBtnActive]}
                >
                  <Heart size={14} color={isActive ? '#FFFFFF' : '#7209B7'} style={{ marginRight: 6 }} />
                  <Text style={[styles.customizerBtnText, isActive && styles.customizerBtnTextActive]}>{occ}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    );
  };

  // Render Customizer group reusable JSX
  const renderCustomizerOptions = () => {
    return (
      <View>
        {/* Modifiers */}
        <View style={styles.customizerGroup}>
          <Text style={styles.customizerLabel}>Style Modifier</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {['Bolder', 'Minimal', 'Sharper', 'Relaxed'].map(mod => {
              const Icon = modifierIcons[mod] || Sparkles;
              const isActive = selectedModifier === mod;
              return (
                <TouchableOpacity
                  key={mod}
                  onPress={() => handleInteraction('modifier', mod)}
                  style={[styles.customizerBtn, isActive && styles.customizerBtnActive]}
                >
                  <Icon size={14} color={isActive ? '#FFFFFF' : '#7209B7'} style={{ marginRight: 6 }} />
                  <Text style={[styles.customizerBtnText, isActive && styles.customizerBtnTextActive]}>{mod}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <Text style={styles.modifierSubtext}>
            {selectedModifier === 'Bolder' && "Emphasizing contrast and statement accessories..."}
            {selectedModifier === 'Minimal' && "Stripping down to essentials and tonal harmony..."}
            {selectedModifier === 'Sharper' && "Refining lines and fit for a professional edge..."}
            {selectedModifier === 'Relaxed' && "Softening textures and loosening the silhouette..."}
          </Text>
        </View>

        {/* Vibe Selection */}
        <View style={styles.customizerGroup}>
          <Text style={styles.customizerLabel}>Vibe Balance</Text>
          <View style={styles.vibeRow}>
            {['Fluid', 'Formal'].map(v => {
              const isActive = selectedVibe === v;
              return (
                <TouchableOpacity
                  key={v}
                  onPress={() => handleInteraction('vibe', v)}
                  style={[styles.vibeBtn, isActive && styles.vibeBtnActive, { flex: 1 }]}
                >
                  <Text style={[styles.vibeBtnText, isActive && styles.vibeBtnTextActive]}>{v.toUpperCase()}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  const [cachedAlternativeUri, setCachedAlternativeUri] = useState<string | null>(null);
  const [cachedUserUri, setCachedUserUri] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const cacheImage = async () => {
      if (styleResult?.image_base64) {
        try {
          const raw = styleResult.image_base64.replace(/^data:image\/\w+;base64,/, '').replace(/[\r\n\s]+/g, '');
          if (!raw) return;
          const fileUri = `${FileSystem.cacheDirectory}alternative_outfit_${Date.now()}.png`;
          await FileSystem.writeAsStringAsync(fileUri, raw, { encoding: FileSystem.EncodingType.Base64 });
          if (isMounted) setCachedAlternativeUri(fileUri);
        } catch (e) {
          console.warn('[StyleForecaster] Cache failed, fallback to data URI:', e);
          const raw = styleResult.image_base64.replace(/^data:image\/\w+;base64,/, '').replace(/[\r\n\s]+/g, '');
          if (isMounted) setCachedAlternativeUri(`data:image/png;base64,${raw}`);
        }
      } else {
        if (isMounted) setCachedAlternativeUri(null);
      }
    };
    cacheImage();
    return () => { isMounted = false; };
  }, [styleResult?.image_base64]);

  useEffect(() => {
    let isMounted = true;
    const cacheUserImage = async () => {
      if (userImageBase64) {
        try {
          const raw = userImageBase64.replace(/^data:image\/\w+;base64,/, '').replace(/[\r\n\s]+/g, '');
          if (!raw) return;
          const fileUri = `${FileSystem.cacheDirectory}user_outfit_${Date.now()}.png`;
          await FileSystem.writeAsStringAsync(fileUri, raw, { encoding: FileSystem.EncodingType.Base64 });
          if (isMounted) setCachedUserUri(fileUri);
        } catch (e) {
          const raw = userImageBase64.replace(/^data:image\/\w+;base64,/, '').replace(/[\r\n\s]+/g, '');
          if (isMounted) setCachedUserUri(`data:image/png;base64,${raw}`);
        }
      } else {
        if (isMounted) setCachedUserUri(null);
      }
    };
    cacheUserImage();
    return () => { isMounted = false; };
  }, [userImageBase64]);

  const cleanBase64Uri = (str?: string | null) => {
    if (!str) return null;
    if (str.startsWith('http') || str.startsWith('file:')) return str;
    const raw = str.replace(/^data:image\/\w+;base64,/, '').replace(/[\r\n\s]+/g, '');
    return raw ? `data:image/png;base64,${raw}` : null;
  };

  const alternativePhotoUri = cachedAlternativeUri || cleanBase64Uri(styleResult?.image_base64);
  const userPhotoUri = cachedUserUri || userImageUri || cleanBase64Uri(userImageBase64);

  return (
    <LinearGradient
      colors={['#F3EFFF', '#E9F3FF', '#FFFDF2']}
      locations={[0, 0.5, 1]}
      style={styles.container}
    >
      {/* 1. Header */}
      <LinearGradient
        colors={['#7209B7', '#F72585']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.headerContainer, { paddingTop: Math.max(14, insets.top + 6) }]}
      >
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>STYLE FORECASTER</Text>
          <Text style={styles.headerSubtitle}>Charm Rating & Alternative Virtual Try-On</Text>
        </View>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isGenerating ? (
          <View style={styles.skeletonContainer}>
            {/* Dynamic Progress Bar Card */}
            <View style={styles.progressCardContainer}>
              <View style={styles.progressHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Sparkles size={16} color="#F72585" style={{ marginRight: 6 }} />
                  <Text style={styles.progressTitle}>GENERATING STYLE FORECAST</Text>
                </View>
                <Text style={styles.progressPercent}>{Math.round(loadingProgress)}%</Text>
              </View>

              {/* Glowing Progress Track */}
              <View style={styles.progressTrack}>
                <LinearGradient
                  colors={['#7209B7', '#F72585']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressFill, { width: `${loadingProgress}%` }]}
                />
              </View>

              {/* Dynamic Animated Status Subtext */}
              <Text style={styles.loadingStatusText}>
                {LOADING_STEPS[loadingStepIndex] || 'Synthesizing cosmic style look...'}
              </Text>
            </View>

            {/* Pulsing Skeleton Screen */}
            <Animated.View style={[styles.skeletonBody, { opacity: skeletonOpacity }]}>
              <View style={[styles.headlineCard, styles.skeletonBox, { height: 70, marginBottom: 12 }]} />

              {/* Side-by-Side Photo Skeleton */}
              <View style={styles.sideBySideRow}>
                {/* Left Column Skeleton */}
                <View style={styles.sideBySideCol}>
                  <View style={[styles.sideBySideBadge, { backgroundColor: '#333333' }]}>
                    <Text style={styles.sideBySideBadgeText}>YOUR CURRENT LOOK</Text>
                  </View>
                  <View style={[styles.sideBySideImageWrapper, styles.skeletonBox]} />
                  <View style={styles.skeletonFooterBar} />
                </View>

                {/* Right Column Skeleton */}
                <View style={styles.sideBySideCol}>
                  <View style={[styles.sideBySideBadge, { backgroundColor: '#F72585' }]}>
                    <Text style={styles.sideBySideBadgeText}>RECOMMENDED LOOK</Text>
                  </View>
                  <View style={[styles.sideBySideImageWrapper, styles.skeletonBox]} />
                  <View style={styles.skeletonFooterBar} />
                </View>
              </View>

              {/* Rating Card Skeleton */}
              <View style={[styles.cardContainer, styles.skeletonBox, { height: 95, marginTop: 12 }]} />

              {/* Details Card Skeleton */}
              <View style={[styles.cardContainer, styles.skeletonBox, { height: 130, marginTop: 12 }]} />
            </Animated.View>
          </View>
        ) : !styleResult ? (
          <View style={styles.body}>
            <View style={styles.headlineCard}>
              <Text style={styles.dateLabel}>TODAY'S STYLE FORECAST & RATING</Text>
              <Text style={styles.headlineText}>Upload Photo for Charm Rating & Try-On</Text>
            </View>

            {renderPhotoAndOccasionPicker()}
            {renderCustomizerOptions()}

            <TouchableOpacity
              style={styles.revealBtn}
              onPress={() => fetchStyleForecast(selectedModifier, selectedContext, selectedVibe, false)}
            >
              <LinearGradient
                colors={['#7209B7', '#F72585']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.revealBtnGradient}
              >
                <Sparkles size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.revealBtnText}>RATE & FORECAST MY LOOK</Text>
              </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.creditCostLabel}>Uses 1 credit per Daily Reflection</Text>
          </View>
        ) : (
          <View style={styles.body}>
            {/* 2. Headline and Date */}
            <View style={styles.headlineCard}>
              <Text style={styles.dateLabel}>{(styleResult.date || 'TODAY').toUpperCase()} • FOR {selectedOccasion.toUpperCase()}</Text>
              <Text style={styles.headlineText}>{styleResult.headline}</Text>
            </View>

            {/* SIDE-BY-SIDE PHOTO COMPARISON: CURRENT OUTFIT vs RECOMMENDED OUTFIT */}
            <View style={styles.cardContainer}>
              <View style={styles.insightHeader}>
                <Sparkles size={18} color="#F72585" style={{ marginRight: 6 }} />
                <Text style={[styles.insightSectionTitle, { color: '#7209B7' }]}>BEFORE & AFTER OUTFIT COMPARISON</Text>
              </View>

              <View style={styles.sideBySideRow}>
                {/* Left Column: Old Image (Current Outfit) */}
                <View style={styles.sideBySideCol}>
                  <View style={[styles.sideBySideBadge, { backgroundColor: '#333333' }]}>
                    <Text style={styles.sideBySideBadgeText}>YOUR CURRENT LOOK</Text>
                  </View>

                  <View style={styles.sideBySideImageWrapper}>
                    {userPhotoUri ? (
                      <Image
                        source={{ uri: userPhotoUri }}
                        style={styles.sideBySideImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.noImagePlaceholder}>
                        <ImageIcon size={28} color="#7209B7" />
                        <Text style={styles.noImageText}>No Photo Uploaded</Text>
                      </View>
                    )}
                  </View>

                  {userPhotoUri ? (
                    <View style={styles.sideBySideFooterBar}>
                      <TouchableOpacity
                        style={styles.sideBySideFooterBtn}
                        onPress={() =>
                          setPreviewModal({
                            visible: true,
                            imageUri: userPhotoUri,
                            title: 'Your Current Outfit Photo',
                          })
                        }
                      >
                        <Eye size={11} color="#FFFFFF" style={{ marginRight: 4 }} />
                        <Text style={styles.sideBySideFooterBtnText}>FULL VIEW</Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}
                </View>

                {/* Right Column: New Image (Recommended Outfit) */}
                <View style={styles.sideBySideCol}>
                  <View style={[styles.sideBySideBadge, { backgroundColor: '#F72585' }]}>
                    <Text style={styles.sideBySideBadgeText}>RECOMMENDED LOOK</Text>
                  </View>

                  <View style={styles.sideBySideImageWrapper}>
                    {alternativePhotoUri ? (
                      <Image
                        source={{ uri: alternativePhotoUri }}
                        style={styles.sideBySideImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.noImagePlaceholder}>
                        <Sparkles size={28} color="#F72585" />
                        <Text style={styles.noImageText}>Image Generation Error</Text>
                      </View>
                    )}
                  </View>

                  {alternativePhotoUri ? (
                    <View style={styles.sideBySideFooterBar}>
                      <TouchableOpacity
                        style={[styles.sideBySideFooterBtn, { backgroundColor: '#7209B7' }]}
                        onPress={() =>
                          setPreviewModal({
                            visible: true,
                            imageUri: alternativePhotoUri,
                            title: `Alternative Outfit for ${selectedOccasion}`,
                          })
                        }
                      >
                        <Eye size={11} color="#FFFFFF" style={{ marginRight: 4 }} />
                        <Text style={styles.sideBySideFooterBtnText}>FULL VIEW</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.sideBySideFooterBtn, { backgroundColor: '#F72585', flex: 0, paddingHorizontal: 8 }]}
                        onPress={() =>
                          handleDownloadImage(
                            alternativePhotoUri,
                            `alternative_outfit_${selectedOccasion.toLowerCase().replace(/\s+/g, '_')}.png`
                          )
                        }
                      >
                        <Download size={12} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  ) : null}
                </View>
              </View>
            </View>

            {/* 3. CURRENT OUTFIT RATING CARD (If Available) */}
            {styleResult.current_outfit_rating != null && (
              <View style={styles.ratingCardContainer}>
                <LinearGradient
                  colors={['rgba(114, 9, 183, 0.08)', 'rgba(247, 37, 133, 0.05)']}
                  style={styles.ratingGradientContainer}
                >
                  <View style={styles.ratingHeaderRow}>
                    <Award size={24} color="#7209B7" />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.ratingCardTitle}>CURRENT OUTFIT CHARM RATING</Text>
                      <Text style={styles.ratingCardSubtitle}>Evaluated against today's astrological planetary transits</Text>
                    </View>
                    <View style={styles.scoreCircle}>
                      <Text style={styles.scoreNumber}>{styleResult.current_outfit_rating}</Text>
                      <Text style={styles.scoreMax}>/100</Text>
                    </View>
                  </View>

                  {/* Plus Points Badges */}
                  {styleResult.plus_points && styleResult.plus_points.length > 0 && (
                    <View style={styles.plusPointsWrapper}>
                      <Text style={styles.plusPointsTitle}>KEY CHARM PLUS POINTS:</Text>
                      <View style={styles.plusPointsGrid}>
                        {styleResult.plus_points.map((pt, idx) => (
                          <View key={`pt_${idx}`} style={styles.plusPointBadge}>
                            <CheckCircle2 size={13} color="#F72585" style={{ marginRight: 5 }} />
                            <Text style={styles.plusPointText}>{pt}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Concise Current Outfit Summary */}
                  {styleResult.current_outfit_summary ? (
                    <View style={styles.conciseVerdictBox}>
                      <Text style={styles.verdictLabel}>VERDICT:</Text>
                      <Text style={styles.verdictText}>{styleResult.current_outfit_summary}</Text>
                    </View>
                  ) : null}
                </LinearGradient>
              </View>
            )}

            {/* 4. ALTERNATIVE OUTFIT SUGGESTION & VIRTUAL TRY-ON IMAGE */}
            <View style={styles.cardContainer}>
              <View style={styles.insightHeader}>
                <Sparkles size={18} color="#F72585" style={{ marginRight: 6 }} />
                <Text style={[styles.insightSectionTitle, { color: '#F72585' }]}>ALTERNATIVE RECOMMENDED OUTFIT FOR {selectedOccasion.toUpperCase()}</Text>
              </View>

              {/* Graphic Card showing user's face with alternative outfit */}
              <View style={styles.graphicCard}>
                <Image
                  source={
                    alternativePhotoUri
                      ? { uri: alternativePhotoUri }
                      : require('./assets/style_forecaster_preview.png')
                  }
                  style={styles.graphicImage}
                  resizeMode="cover"
                />
                <View style={styles.graphicOverlay}>
                  <View style={styles.badgeRow}>
                    <Text style={styles.badgeText}>{selectedOccasion.toUpperCase()}</Text>
                    <Text style={[styles.badgeText, { backgroundColor: '#7209B7' }]}>FACE PRESERVED</Text>
                  </View>

                  {/* Check / Download buttons on generated outfit photo */}
                  <View style={styles.photoCardActionsRow}>
                    <TouchableOpacity
                      style={styles.cardActionBtn}
                      onPress={() =>
                        setPreviewModal({
                          visible: true,
                          imageUri: alternativePhotoUri || Image.resolveAssetSource(require('./assets/style_forecaster_preview.png')).uri,
                          title: `Alternative Outfit for ${selectedOccasion}`,
                        })
                      }
                    >
                      <Eye size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
                      <Text style={styles.cardActionBtnText}>CHECK PHOTO</Text>
                    </TouchableOpacity>

                    {alternativePhotoUri ? (
                      <TouchableOpacity
                        style={[styles.cardActionBtn, { backgroundColor: '#F72585' }]}
                        onPress={() =>
                          handleDownloadImage(
                            alternativePhotoUri,
                            `alternative_outfit_${selectedOccasion.toLowerCase().replace(/\s+/g, '_')}.png`
                          )
                        }
                      >
                        <Download size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
                        <Text style={styles.cardActionBtnText}>DOWNLOAD PHOTO</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </View>
              </View>

              <Text style={styles.outfitTitle}>WHAT TO WEAR INSTEAD</Text>
              <Text style={styles.outfitDescriptionText}>{styleResult.alternative_outfit_description || styleResult.outfit_description}</Text>
            </View>

            {/* 5. Color Palette Tiles */}
            <View style={styles.cardContainer}>
              <Text style={styles.sectionTitle}>DAILY RECOMMENDED PALETTE</Text>
              <View style={styles.colorPaletteRow}>
                {styleResult.colors.map((color, idx) => (
                  <View key={`clr_${idx}`} style={styles.colorItem}>
                    <View
                      style={[
                        styles.colorCircle,
                        { backgroundColor: color, shadowColor: color },
                      ]}
                    />
                    <Text style={styles.colorCircleLabel} numberOfLines={1}>{styleResult.color_names[idx]}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* 6. Why it Works & Descriptions */}
            <View style={styles.cardContainer}>
              <View style={styles.insightHeader}>
                <Info size={16} color="#7209B7" style={{ marginRight: 6 }} />
                <Text style={styles.insightSectionTitle}>WHY THIS ALIGNMENT WORKS</Text>
              </View>
              <Text style={styles.astrologicalReasonText}>{styleResult.astrological_reason}</Text>
            </View>

            {/* 7. Change Photo & Customizer */}
            {renderPhotoAndOccasionPicker()}
            {renderCustomizerOptions()}

            {/* Regenerate Button */}
            <TouchableOpacity
              style={styles.regenerateBtn}
              onPress={() => fetchStyleForecast(selectedModifier, selectedContext, selectedVibe, true)}
            >
              <Text style={styles.regenerateBtnText}>RE-GENERATE NEW LOOK & TRY-ON</Text>
            </TouchableOpacity>

            {/* Share Style Forecast Card Button */}
            <TouchableOpacity
              style={[styles.regenerateBtn, { backgroundColor: '#7209B7', marginTop: 10 }]}
              activeOpacity={0.8}
              onPress={() => {
                if (styleResult) {
                  setShareModalData({
                    category: 'COSMIC STYLE',
                    title: styleResult.headline || 'Daily Astro Outfit Ensemble',
                    subtitle: `Occasion: ${selectedOccasion} • Charm Rating: ${styleResult.current_outfit_rating || 88}/100`,
                    readingText: styleResult.alternative_outfit_description || styleResult.outfit_description || 'Cosmic planetary alignment directs your personal fashion energy today.',
                    highlights: [
                      { label: 'Primary Palette', value: (styleResult.color_names || []).join(', ') || 'Royal Violet' },
                      { label: 'Plus Points', value: (styleResult.plus_points || []).join(' | ') || 'Venusian Charm' },
                    ],
                  });
                  setShareModalVisible(true);
                }
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Share2 size={16} color="#FFFFFF" />
                <Text style={styles.regenerateBtnText}>SHARE STYLE FORECAST CARD</Text>
              </View>
            </TouchableOpacity>

            {/* 8. Chat box */}
            <View style={[styles.cardContainer, { marginBottom: 30 }]}>
              <Text style={styles.sectionTitle}>ASK CELESTIAL STYLIST</Text>
              <View style={styles.chatInputRow}>
                <TextInput
                  style={styles.chatTextInput}
                  placeholder="Ask how to match shoes, layer, or style accessories..."
                  placeholderTextColor="rgba(0,0,0,0.4)"
                  value={questionInput}
                  onChangeText={setQuestionInput}
                  onSubmitEditing={handleQuestionSubmit}
                />
                <TouchableOpacity style={styles.chatSubmitBtn} onPress={handleQuestionSubmit}>
                  <Send size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Share Card Modal */}
      <ShareCardModal
        visible={shareModalVisible}
        data={shareModalData}
        onClose={() => setShareModalVisible(false)}
      />

      {/* Full-Screen Photo Inspection & Download Modal */}
      <Modal
        visible={previewModal.visible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setPreviewModal({ visible: false, imageUri: '', title: '' })}
      >
        <View style={styles.imageModalOverlay}>
          <SafeAreaView style={styles.imageModalSafeArea}>
            {/* Modal Header with explicit top inset padding */}
            <View style={[styles.imageModalHeader, { paddingTop: Math.max(insets.top + 10, 24) }]}>
              <Text style={styles.imageModalTitle}>{previewModal.title}</Text>
              <TouchableOpacity
                style={styles.imageModalCloseBtn}
                activeOpacity={0.7}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                onPress={() => setPreviewModal({ visible: false, imageUri: '', title: '' })}
              >
                <X size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Image Content */}
            <View style={styles.imageModalContent}>
              {previewModal.imageUri ? (
                <Image
                  source={{ uri: previewModal.imageUri }}
                  style={styles.fullScreenImage}
                  resizeMode="contain"
                />
              ) : null}
            </View>

            {/* Modal Footer Actions */}
            <View style={styles.imageModalFooter}>
              <TouchableOpacity
                style={styles.modalDownloadBtn}
                onPress={() => handleDownloadImage(previewModal.imageUri, 'astro_style_photo.png')}
              >
                <LinearGradient colors={['#7209B7', '#F72585']} style={styles.modalDownloadBtnGradient}>
                  <Download size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.modalDownloadBtnText}>DOWNLOAD & SAVE PHOTO</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skeletonContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  progressCardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(114, 9, 183, 0.2)',
    shadowColor: '#7209B7',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 14,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  progressTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 11,
    color: '#7209B7',
    letterSpacing: 0.5,
  },
  progressPercent: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 14,
    color: '#F72585',
  },
  progressTrack: {
    width: '100%',
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(114, 9, 183, 0.1)',
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  loadingStatusText: {
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 11,
    color: '#4B0082',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  skeletonBody: {
    width: '100%',
  },
  skeletonBox: {
    backgroundColor: 'rgba(114, 9, 183, 0.08)',
    borderRadius: 14,
  },
  skeletonFooterBar: {
    height: 32,
    backgroundColor: 'rgba(114, 9, 183, 0.05)',
  },
  sideBySideRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 10,
    marginTop: 8,
  },
  sideBySideCol: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(114, 9, 183, 0.15)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  sideBySideBadge: {
    backgroundColor: '#7209B7',
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  sideBySideBadgeText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 9,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  sideBySideImageWrapper: {
    width: '100%',
    height: 220,
    position: 'relative',
    backgroundColor: '#F3EFFF',
  },
  sideBySideImage: {
    width: '100%',
    height: '100%',
  },
  sideBySideFooterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    backgroundColor: '#FAFAFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    gap: 4,
  },
  sideBySideFooterBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7209B7',
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  sideBySideFooterBtnText: {
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 9,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  noImagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(114, 9, 183, 0.05)',
    padding: 10,
  },
  noImageText: {
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 10,
    color: '#7209B7',
    marginTop: 6,
    textAlign: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontFamily: 'SourceSerif4',
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 2,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  loadingContainer: {
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 14,
    color: '#7209B7',
    marginTop: 16,
  },
  body: {
    padding: 16,
  },
  headlineCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(114, 9, 183, 0.1)',
    marginBottom: 16,
    alignItems: 'center',
  },
  dateLabel: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 10,
    color: '#F72585',
    letterSpacing: 1,
    marginBottom: 4,
  },
  headlineText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 16,
    color: '#2C2B3D',
    textAlign: 'center',
  },
  photoUploadRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  photoBtn: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  photoBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  photoBtnText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 11,
    color: '#FFFFFF',
  },
  photoBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: '#7209B7',
    borderRadius: 14,
    backgroundColor: 'rgba(114, 9, 183, 0.05)',
  },
  photoBtnTextOutline: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 11,
    color: '#7209B7',
  },
  subtleTipText: {
    fontFamily: 'SourceSerif4',
    fontSize: 11.5,
    color: '#6E6B82',
    lineHeight: 16,
    marginTop: 4,
  },
  photoPreviewContainer: {
    position: 'relative',
    marginTop: 12,
    borderRadius: 16,
    overflow: 'hidden',
    height: 180,
    borderWidth: 1,
    borderColor: 'rgba(114, 9, 183, 0.2)',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  photoOverlayActions: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    gap: 8,
  },
  photoActionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  photoActionText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 9,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  removePhotoBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingCardContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(114, 9, 183, 0.2)',
    backgroundColor: '#FFFFFF',
  },
  ratingGradientContainer: {
    padding: 16,
  },
  ratingHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingCardTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 12,
    color: '#7209B7',
    letterSpacing: 0.5,
  },
  ratingCardSubtitle: {
    fontFamily: 'SourceSerif4',
    fontSize: 10,
    color: '#6E6B82',
    marginTop: 2,
  },
  scoreCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#7209B7',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7209B7',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  scoreNumber: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 18,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  scoreMax: {
    fontFamily: 'SourceSerif4',
    fontSize: 8,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  plusPointsWrapper: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(114, 9, 183, 0.08)',
  },
  plusPointsTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 10,
    color: '#F72585',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  plusPointsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  plusPointBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(247, 37, 133, 0.08)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(247, 37, 133, 0.15)',
  },
  plusPointText: {
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 11,
    color: '#2C2B3D',
  },
  conciseVerdictBox: {
    marginTop: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#7209B7',
  },
  verdictLabel: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 9,
    color: '#7209B7',
    letterSpacing: 0.5,
  },
  verdictText: {
    fontFamily: 'SourceSerif4',
    fontSize: 11.5,
    color: '#2C2B3D',
    marginTop: 2,
  },
  graphicCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(114, 9, 183, 0.2)',
    marginVertical: 12,
    backgroundColor: '#FFFFFF',
    aspectRatio: 16 / 9,
    position: 'relative',
    shadowColor: '#7209B7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  graphicImage: {
    width: '100%',
    height: '100%',
  },
  graphicOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.35)',
    flexDirection: 'column',
    gap: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badgeText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 8,
    color: '#FFFFFF',
    backgroundColor: '#F72585',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    letterSpacing: 0.5,
    overflow: 'hidden',
  },
  photoCardActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  cardActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(114, 9, 183, 0.85)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  cardActionBtnText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 9,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(114, 9, 183, 0.1)',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 10,
    color: '#726F8D',
    letterSpacing: 1,
    marginBottom: 12,
  },
  colorPaletteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  colorItem: {
    alignItems: 'center',
    width: '22%',
  },
  colorCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 5,
  },
  colorCircleLabel: {
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 10,
    color: '#2C2B3D',
    marginTop: 8,
    textAlign: 'center',
  },
  customizerGroup: {
    marginBottom: 16,
  },
  customizerLabel: {
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 12,
    color: '#726F8D',
    marginBottom: 8,
  },
  horizontalScroll: {
    gap: 8,
    paddingRight: 16,
  },
  customizerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(114, 9, 183, 0.2)',
    backgroundColor: '#FFFFFF',
  },
  customizerBtnActive: {
    backgroundColor: '#7209B7',
    borderColor: '#7209B7',
  },
  customizerBtnText: {
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 12,
    color: '#7209B7',
  },
  customizerBtnTextActive: {
    color: '#FFFFFF',
  },
  vibeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  vibeBtn: {
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(114, 9, 183, 0.2)',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  vibeBtnActive: {
    backgroundColor: '#F72585',
    borderColor: '#F72585',
  },
  vibeBtnText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 11,
    color: '#7209B7',
    letterSpacing: 0.5,
  },
  vibeBtnTextActive: {
    color: '#FFFFFF',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightSectionTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 11,
    color: '#2C2B3D',
    letterSpacing: 0.5,
  },
  astrologicalReasonText: {
    fontFamily: 'SourceSerif4',
    fontSize: 12,
    color: '#6E6B82',
    lineHeight: 18,
    fontStyle: 'italic',
    paddingLeft: 4,
  },
  outfitTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 10,
    color: '#F72585',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  outfitDescriptionText: {
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 13,
    color: '#2C2B3D',
    lineHeight: 18,
  },
  chatInputRow: {
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
  chatTextInput: {
    flex: 1,
    fontFamily: 'SourceSerif4',
    fontSize: 12.5,
    color: '#2C2B3D',
    paddingVertical: 4,
  },
  chatSubmitBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#7209B7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  revealBtn: {
    marginTop: 20,
    marginHorizontal: 16,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#7209B7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  revealBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  revealBtnText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  creditCostLabel: {
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'SourceSerif4',
    fontSize: 11,
    color: '#7209B7',
    opacity: 0.7,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  regenerateBtn: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#7209B7',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(114, 9, 183, 0.05)',
  },
  regenerateBtnText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 12.5,
    color: '#7209B7',
    letterSpacing: 0.5,
  },
  modifierSubtext: {
    fontFamily: 'SourceSerif4',
    fontStyle: 'italic',
    fontSize: 12,
    color: '#7209B7',
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.8,
  },
  // Full-Screen Image Inspection Modal Styles
  imageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 16, 38, 0.95)',
  },
  imageModalSafeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  imageModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  imageModalTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 14,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  imageModalCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  imageModalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  fullScreenImage: {
    width: width - 32,
    height: height * 0.65,
    borderRadius: 16,
  },
  imageModalFooter: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  modalDownloadBtn: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalDownloadBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  modalDownloadBtnText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 13,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
