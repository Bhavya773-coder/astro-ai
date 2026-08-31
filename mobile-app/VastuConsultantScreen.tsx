import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, Home, Sparkles, UploadCloud } from 'lucide-react-native';
import { getReadingHistory, getVastuConsultation } from './api';
import { haptic } from './haptics';

const { width } = Dimensions.get('window');

type Props = {
  answers: Record<string, string>;
  zodiacIndex: number;
  onBack: () => void;
  onUpdateCredits?: (newBalance: number) => void;
};

const toDataUri = (imageData?: string, mimeType = 'image/jpeg') => {
  if (!imageData) return null;
  return imageData.startsWith('data:') ? imageData : `data:${mimeType};base64,${imageData}`;
};

export default function VastuConsultantScreen({ onBack, onUpdateCredits }: Props) {
  const insets = useSafeAreaInsets();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let active = true;
    getReadingHistory('vastu')
      .then((res: any) => {
        if (!active || !Array.isArray(res?.data)) return;
        setHistoryList(res.data.map((item: any) => ({
          date: new Date(item.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          imageUri: toDataUri(item.image_data, item.mime_type),
          result: item.result,
        })));
      })
      .catch(err => console.log('[Vastu] history failed:', err));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!isAnalyzing) return;
    scanAnim.setValue(0);
    const loop = Animated.loop(Animated.timing(scanAnim, { toValue: 1, duration: 1500, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [isAnalyzing, scanAnim]);

  const pickImage = async () => {
    haptic.tap();
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Photo Access Required', 'Please allow gallery access to upload your 2D house plan.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.82,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setImageUri(result.assets[0].uri);
      setAnalysisResult(null);
    }
  };

  const imageToBase64 = async (uri: string) => {
    const localResponse = await fetch(uri);
    const blob = await localResponse.blob();
    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result !== 'string') return reject(new Error('Failed to read image'));
        resolve(reader.result.split(';base64,')[1] || reader.result);
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
    return { base64Data, mimeType: blob.type || 'image/jpeg' };
  };

  const handleAnalyze = async () => {
    if (!imageUri) return;
    haptic.press();
    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
      const { base64Data, mimeType } = await imageToBase64(imageUri);
      const res = await getVastuConsultation(base64Data, mimeType);
      if (typeof res?.remaining_credits === 'number') onUpdateCredits?.(res.remaining_credits);
      const data = res?.data || res;
      if (!data?.summary || !Array.isArray(data?.positives) || !Array.isArray(data?.negatives)) {
        throw new Error('Invalid Vastu report from server. No credits were deducted.');
      }
      setAnalysisResult(data);
      setHistoryList(prev => [{ date: new Date().toLocaleDateString(), imageUri, result: data }, ...prev]);
      haptic.success();
    } catch (e: any) {
      haptic.error();
      Alert.alert('Vastu Analysis Failed', e?.message || 'Gemini could not complete the report. No credits were deducted.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const openHistory = (item: any) => {
    setImageUri(item.imageUri);
    setAnalysisResult(item.result);
  };

  const handleBack = () => {
    if (analysisResult) {
      setAnalysisResult(null);
      setImageUri(null);
    } else {
      onBack();
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#F3EFFF', '#E9F3FF', '#FFFDF2']} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFillObject} />
      <LinearGradient colors={['#7209B7', '#F72585']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.headerContainer, { paddingTop: Math.max(16, insets.top) }]}> 
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={handleBack} style={styles.iconBtn}><ArrowLeft size={22} color="#FFFFFF" /></TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>VASTU CONSULTANT</Text>
            <Text style={styles.headerSubtitle}>✦ 2D Floor Plan Analysis • 50 Credits ✦</Text>
          </View>
          <View style={styles.iconBtn} />
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingBottom: 44 + insets.bottom }]}> 
        {!analysisResult && !isAnalyzing && (
          <>
            <View style={styles.card}>
              <View style={styles.heroIcon}><Home size={28} color="#7209B7" /></View>
              <Text style={styles.cardTitle}>Upload your 2D house plan</Text>
              <Text style={styles.cardDesc}>Gemini will review the visible rooms, entrance, direction labels, and layout against Vastu principles. You are charged only after a successful report.</Text>

              {imageUri ? (
                <View style={styles.previewBox}>
                  <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
                  <TouchableOpacity style={styles.removeBtn} onPress={() => setImageUri(null)}><MaterialCommunityIcons name="trash-can-outline" size={18} color="#FFF" /></TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.uploadBox} activeOpacity={0.8} onPress={pickImage}>
                  <UploadCloud size={46} color="#7209B7" />
                  <Text style={styles.uploadText}>Tap to upload floor plan</Text>
                  <Text style={styles.uploadSubtext}>2D JPG / PNG drawing with room labels works best</Text>
                </TouchableOpacity>
              )}

              <View style={styles.instructionsBox}>
                <Text style={styles.instructionsTitle}>For best accuracy</Text>
                <Text style={styles.instructionLine}>✦ Include north arrow or direction labels.</Text>
                <Text style={styles.instructionLine}>✦ Room names should be readable.</Text>
                <Text style={styles.instructionLine}>✦ Entrance, kitchen, toilets, bedrooms, and puja area should be visible.</Text>
              </View>

              {imageUri && (
                <TouchableOpacity style={styles.primaryBtn} onPress={handleAnalyze} activeOpacity={0.9}>
                  <LinearGradient colors={['#7209B7', '#F72585']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primaryGradient}>
                    <Sparkles size={16} color="#FFF" style={{ marginRight: 8 }} />
                    <Text style={styles.primaryBtnText}>ANALYZE FOR 50 CREDITS</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.historySection}>
              <Text style={styles.sectionTitle}>Previous Vastu Reports</Text>
              {historyList.length === 0 ? <Text style={styles.emptyText}>No saved Vastu reports yet.</Text> : historyList.map((item, idx) => (
                <TouchableOpacity key={`${item.date}_${idx}`} style={styles.historyCard} activeOpacity={0.8} onPress={() => openHistory(item)}>
                  <View style={styles.historyTop}><Text style={styles.historyDate}>{item.date}</Text><Text style={styles.verdictPill}>{String(item.result?.verdict || 'report').toUpperCase()}</Text></View>
                  <Text style={styles.historySummary} numberOfLines={2}>{item.result?.summary || 'Vastu consultation completed.'}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {isAnalyzing && (
          <View style={styles.card}>
            <Text style={[styles.cardTitle, { textAlign: 'center' }]}>ANALYSIS ACTIVE</Text>
            <Text style={[styles.cardDesc, { textAlign: 'center' }]}>Gemini is reading the 2D plan through the Vastu consultant skill...</Text>
            <View style={styles.scanBox}>
              {imageUri && <Image source={{ uri: imageUri }} style={styles.scanImage} resizeMode="cover" />}
              <Animated.View style={[styles.laserLine, { transform: [{ translateY: scanAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 220] }) }] }]} />
            </View>
            <ActivityIndicator size="large" color="#7209B7" />
            <Text style={styles.statusText}>No credits deducted unless this report completes.</Text>
          </View>
        )}

        {analysisResult && !isAnalyzing && (
          <View style={{ gap: 14 }}>
            {imageUri && <TouchableOpacity style={styles.scannedImageContainer} activeOpacity={0.9} onPress={() => setIsImageModalVisible(true)}><Image source={{ uri: imageUri }} style={styles.scannedImage} resizeMode="cover" /><Text style={styles.imageBadge}>Tap to expand floor plan</Text></TouchableOpacity>}
            <View style={styles.summaryCard}>
              <Text style={styles.resultLabel}>VASTU VERDICT</Text>
              <Text style={styles.resultTitle}>{String(analysisResult.verdict || 'unclear').toUpperCase()} • {analysisResult.score ?? '—'}/100</Text>
              <Text style={styles.resultText}>{analysisResult.summary}</Text>
            </View>
            <ResultList title="Positives" items={analysisResult.positives} icon="check-circle-outline" color="#12A594" />
            <ResultList title="Negatives" items={analysisResult.negatives} icon="alert-circle-outline" color="#F72585" />
            <View style={styles.cardLeft}>
              <Text style={styles.blockTitle}>Room-by-room view</Text>
              {(analysisResult.room_analysis || []).map((room: any, idx: number) => <View key={idx} style={styles.roomCard}><Text style={styles.roomTitle}>{room.area} • {room.severity}</Text><Text style={styles.roomText}>{room.observed}</Text><Text style={styles.roomText}>{room.vastu_view}</Text></View>)}
            </View>
            <ResultList title="Recommendations" items={analysisResult.recommendations} icon="lightbulb-on-outline" color="#D9730D" />
            {Array.isArray(analysisResult.missing_info) && analysisResult.missing_info.length > 0 && <ResultList title="Missing info" items={analysisResult.missing_info} icon="help-circle-outline" color="#726F8D" />}
            <Text style={styles.disclaimer}>{analysisResult.disclaimer || 'Educational Vastu guidance only; not architectural, engineering, legal, or safety advice.'}</Text>
            <TouchableOpacity style={styles.scanAgainBtn} onPress={() => { setAnalysisResult(null); setImageUri(null); }}><Text style={styles.scanAgainText}>Scan another plan</Text></TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Modal visible={isImageModalVisible} transparent animationType="fade" onRequestClose={() => setIsImageModalVisible(false)}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setIsImageModalVisible(false)}>
          {imageUri && <Image source={{ uri: imageUri }} style={styles.modalImage} resizeMode="contain" />}
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

function ResultList({ title, items, icon, color }: { title: string; items?: string[]; icon: any; color: string }) {
  if (!Array.isArray(items) || items.length === 0) return null;
  return <View style={styles.cardLeft}><Text style={styles.blockTitle}>{title}</Text>{items.map((item, idx) => <View key={idx} style={styles.bulletRow}><MaterialCommunityIcons name={icon} size={18} color={color} /><Text style={styles.bulletText}>{item}</Text></View>)}</View>;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerContainer: { paddingHorizontal: 20, paddingBottom: 16, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerRow: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitleWrap: { alignItems: 'center', flex: 1 },
  headerTitle: { fontFamily: 'Cinzel-Bold', fontSize: 15, color: '#FFF', letterSpacing: 1.2 },
  headerSubtitle: { fontFamily: 'Cinzel', fontSize: 9, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  scrollContent: { padding: 20 },
  card: { backgroundColor: '#FFF', borderRadius: 22, padding: 20, borderWidth: 1, borderColor: 'rgba(114,111,141,0.08)', shadowColor: '#726F8D', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2, alignItems: 'center' },
  cardLeft: { backgroundColor: '#FFF', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: 'rgba(114,111,141,0.08)' },
  heroIcon: { width: 58, height: 58, borderRadius: 29, backgroundColor: 'rgba(114,9,183,0.10)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  cardTitle: { fontFamily: 'Cinzel-Bold', fontSize: 18, color: '#2C2B3D', marginBottom: 8, textAlign: 'center' },
  cardDesc: { fontFamily: 'SourceSerif4', fontSize: 13, color: '#726F8D', lineHeight: 19, textAlign: 'center', marginBottom: 18 },
  uploadBox: { width: '100%', minHeight: 190, borderRadius: 18, borderWidth: 1.5, borderStyle: 'dashed', borderColor: 'rgba(114,9,183,0.25)', backgroundColor: 'rgba(114,9,183,0.04)', alignItems: 'center', justifyContent: 'center', padding: 18 },
  uploadText: { fontFamily: 'Cinzel-Bold', fontSize: 14, color: '#7209B7', marginTop: 10 },
  uploadSubtext: { fontFamily: 'SourceSerif4', fontSize: 12, color: '#726F8D', marginTop: 4, textAlign: 'center' },
  previewBox: { width: '100%', height: 230, borderRadius: 18, overflow: 'hidden', marginBottom: 14 },
  previewImage: { width: '100%', height: '100%' },
  removeBtn: { position: 'absolute', top: 10, right: 10, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' },
  instructionsBox: { width: '100%', backgroundColor: '#F8F5FF', borderRadius: 16, padding: 14, marginTop: 16 },
  instructionsTitle: { fontFamily: 'Cinzel-Bold', fontSize: 12, color: '#2C2B3D', marginBottom: 6 },
  instructionLine: { fontFamily: 'SourceSerif4', fontSize: 12, color: '#726F8D', lineHeight: 18 },
  primaryBtn: { width: '100%', borderRadius: 14, overflow: 'hidden', marginTop: 16 },
  primaryGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14 },
  primaryBtnText: { fontFamily: 'Cinzel-Bold', color: '#FFF', fontSize: 12, letterSpacing: 0.8 },
  historySection: { marginTop: 22 },
  sectionTitle: { fontFamily: 'Cinzel-Bold', fontSize: 15, color: '#2C2B3D', marginBottom: 10 },
  emptyText: { fontFamily: 'SourceSerif4', color: '#726F8D', fontSize: 13 },
  historyCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(114,111,141,0.08)' },
  historyTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  historyDate: { fontFamily: 'Cinzel-Bold', fontSize: 11, color: '#726F8D' },
  verdictPill: { fontFamily: 'Cinzel-Bold', fontSize: 10, color: '#7209B7' },
  historySummary: { fontFamily: 'SourceSerif4', fontSize: 12, color: '#2C2B3D', lineHeight: 17 },
  scanBox: { width: '100%', height: 230, borderRadius: 18, overflow: 'hidden', marginBottom: 18, backgroundColor: '#F8F5FF' },
  scanImage: { width: '100%', height: '100%', opacity: 0.72 },
  laserLine: { position: 'absolute', left: 0, right: 0, top: 0, height: 3, backgroundColor: '#F72585' },
  statusText: { fontFamily: 'SourceSerif4', color: '#726F8D', fontSize: 12, marginTop: 12, textAlign: 'center' },
  scannedImageContainer: { height: 220, borderRadius: 18, overflow: 'hidden' },
  scannedImage: { width: '100%', height: '100%' },
  imageBadge: { position: 'absolute', bottom: 10, left: 10, right: 10, textAlign: 'center', color: '#FFF', fontFamily: 'Cinzel-Bold', fontSize: 11, backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 14, paddingVertical: 6 },
  summaryCard: { borderRadius: 20, padding: 18, backgroundColor: '#FFF', borderWidth: 1, borderColor: 'rgba(114,111,141,0.08)' },
  resultLabel: { fontFamily: 'Cinzel-Bold', fontSize: 10, color: '#7209B7', letterSpacing: 1.1, marginBottom: 5 },
  resultTitle: { fontFamily: 'Cinzel-Bold', fontSize: 18, color: '#2C2B3D', marginBottom: 8 },
  resultText: { fontFamily: 'SourceSerif4', fontSize: 14, color: '#4B4455', lineHeight: 21 },
  blockTitle: { fontFamily: 'Cinzel-Bold', fontSize: 14, color: '#2C2B3D', marginBottom: 10 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 9 },
  bulletText: { flex: 1, fontFamily: 'SourceSerif4', fontSize: 13, color: '#4B4455', lineHeight: 19, marginLeft: 8 },
  roomCard: { backgroundColor: '#F8F5FF', borderRadius: 14, padding: 12, marginBottom: 10 },
  roomTitle: { fontFamily: 'Cinzel-Bold', fontSize: 12, color: '#7209B7', marginBottom: 5 },
  roomText: { fontFamily: 'SourceSerif4', fontSize: 12, color: '#4B4455', lineHeight: 18, marginBottom: 4 },
  disclaimer: { fontFamily: 'SourceSerif4', fontSize: 11, color: '#726F8D', lineHeight: 16, textAlign: 'center', paddingHorizontal: 10 },
  scanAgainBtn: { borderRadius: 14, borderWidth: 1, borderColor: 'rgba(114,9,183,0.18)', paddingVertical: 13, alignItems: 'center', backgroundColor: '#FFF' },
  scanAgainText: { fontFamily: 'Cinzel-Bold', color: '#7209B7', fontSize: 12 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', alignItems: 'center', justifyContent: 'center' },
  modalImage: { width: width, height: '82%' },
});
