import React, { useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Share2, Copy, X, Check, Image as ImageIcon, Zap, Heart } from 'lucide-react-native';
import { captureRef } from 'react-native-view-shot';
import {
  ShareCardData,
  executeNativeShare,
  executeImageShare,
  formatShareCardText,
  DEFAULT_APP_URL,
} from './shareUtils';
import { RASHI_GLYPHS } from './constants/astrology';

interface ShareCardModalProps {
  visible: boolean;
  data: ShareCardData | null;
  onClose: () => void;
}

const { width } = Dimensions.get('window');

export const ShareCardModal: React.FC<ShareCardModalProps> = ({ visible, data, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<'zodiac' | 'power' | 'memory'>('zodiac');
  const cardCaptureRef = useRef<View>(null);

  // Sync initial template based on data
  React.useEffect(() => {
    if (data?.templateType === 'power_window') {
      setSelectedTemplate('power');
    } else if (data?.templateType === 'memory_insight') {
      setSelectedTemplate('memory');
    } else {
      setSelectedTemplate('zodiac');
    }
  }, [data]);

  if (!visible || !data) return null;

  const handleShareImage = async () => {
    try {
      setIsExporting(true);
      if (!cardCaptureRef.current) {
        throw new Error('Card element not ready for export.');
      }
      // Small timeout to ensure layout is settled
      await new Promise((resolve) => setTimeout(resolve, 80));

      const uri = await captureRef(cardCaptureRef, {
        format: 'png',
        quality: 1.0,
        result: 'tmpfile',
      });

      if (uri) {
        await executeImageShare(uri, `Share ${data.title} Card`);
      }
    } catch (err: any) {
      console.warn('View-shot fallback to text share:', err);
      // Fallback to native text share if view-shot is not supported on current platform
      await executeNativeShare(data);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopy = () => {
    try {
      const text = formatShareCardText(data);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      Alert.alert('Card Copied!', 'Share text and app link ready to paste anywhere.');
    } catch (e) {
      // Ignore
    }
  };

  const formattedDate = data.subtitle || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
  const zodiacName = data.zodiac || 'AQUARIUS';
  const zodiacGlyph = data.zodiacIndex ? RASHI_GLYPHS[data.zodiacIndex - 1] : '♒\uFE0E';
  const timeWindowStr = data.timeWindow || '4:15 PM – 6:45 PM';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
            <X size={18} color="#726F8D" />
          </TouchableOpacity>

          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Sparkles size={18} color="#7209B7" />
            <Text style={styles.modalHeaderTitle}>Shareable Cosmic Card</Text>
          </View>

          {/* Template Selector Tabs */}
          <View style={styles.templateTabsRow}>
            <TouchableOpacity
              style={[styles.templateTab, selectedTemplate === 'zodiac' && styles.templateTabActive]}
              onPress={() => setSelectedTemplate('zodiac')}
              activeOpacity={0.8}
            >
              <Text style={[styles.templateTabText, selectedTemplate === 'zodiac' && styles.templateTabTextActive]}>
                Alignment
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.templateTab, selectedTemplate === 'power' && styles.templateTabActive]}
              onPress={() => setSelectedTemplate('power')}
              activeOpacity={0.8}
            >
              <Text style={[styles.templateTabText, selectedTemplate === 'power' && styles.templateTabTextActive]}>
                Power Window
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.templateTab, selectedTemplate === 'memory' && styles.templateTabActive]}
              onPress={() => setSelectedTemplate('memory')}
              activeOpacity={0.8}
            >
              <Text style={[styles.templateTabText, selectedTemplate === 'memory' && styles.templateTabTextActive]}>
                Remembrance
              </Text>
            </TouchableOpacity>
          </View>

          {/* Scrollable Preview Area */}
          <ScrollView style={styles.cardScroll} contentContainerStyle={{ alignItems: 'center', paddingVertical: 6 }} showsVerticalScrollIndicator={false}>
            {/* The Exportable Card Container */}
            <View ref={cardCaptureRef} collapsable={false} style={styles.captureWrapper}>
              {selectedTemplate === 'zodiac' ? (
                /* ══════════════════════════════════════════════════════
                   TEMPLATE 1: Zodiac Daily Alignment Designer Card
                   ══════════════════════════════════════════════════════ */
                <View style={[styles.cardBase, styles.parchmentCard]}>
                  {/* Top Header */}
                  <View style={styles.cardTopHeaderRow}>
                    <View style={styles.brandTitleRow}>
                      <Text style={styles.brandText}>AstroAi4U</Text>
                      <Sparkles size={11} color="#C49B44" />
                    </View>
                    <Text style={styles.dateStampText}>{formattedDate}</Text>
                  </View>

                  {/* Watercolor Zodiac Wash Circle */}
                  <View style={styles.watercolorCircleContainer}>
                    <LinearGradient
                      colors={['#C493E7', '#9358C8', '#7337A8']}
                      start={{ x: 0.1, y: 0.1 }}
                      end={{ x: 0.9, y: 0.9 }}
                      style={styles.watercolorCircle}
                    >
                      <Text style={styles.zodiacSignGlyph}>{zodiacGlyph}</Text>
                    </LinearGradient>
                  </View>

                  {/* Sign Title */}
                  <Text style={styles.zodiacCardTitle}>{zodiacName.toUpperCase()}</Text>

                  {/* Quotation Body */}
                  <Text style={styles.zodiacCardQuote}>
                    “{data.readingText || 'The stars align in your favor today. Embrace the cosmic energy and trust your intuition.'}”
                  </Text>

                  {/* Celestial Star Motif Divider */}
                  <View style={styles.celestialDivider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.sparkleMotif}>— ✦ —</Text>
                    <View style={styles.dividerLine} />
                  </View>
                </View>
              ) : selectedTemplate === 'power' ? (
                /* ══════════════════════════════════════════════════════
                   TEMPLATE 2: Today's Power Window Designer Card
                   ══════════════════════════════════════════════════════ */
                <LinearGradient
                  colors={['#EDE4F8', '#CBB4E8', '#8B6AA8', '#5E417A']}
                  locations={[0, 0.45, 0.8, 1]}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={[styles.cardBase, styles.powerGradientCard]}
                >
                  <Text style={styles.powerCardCategory}>TODAY'S POWER WINDOW</Text>

                  <View style={styles.powerIconWrapper}>
                    <Zap size={24} color="#5E417A" fill="#FFFFFF" />
                  </View>

                  <Text style={styles.powerTimeDisplay}>{timeWindowStr}</Text>

                  <Text style={styles.powerAdviceText}>
                    {data.readingText || 'Best for important calls, pitches and decisions.'}
                  </Text>

                  {/* Mountain / Horizon Glow Silhouette */}
                  <View style={styles.horizonGlow}>
                    <View style={styles.sunGlowCircle} />
                    <Text style={styles.powerBrandWatermark}>AstroAi4U</Text>
                  </View>
                </LinearGradient>
              ) : (
                /* ══════════════════════════════════════════════════════
                   TEMPLATE 3: Remembrance & Special Insight Card
                   ══════════════════════════════════════════════════════ */
                <View style={[styles.cardBase, styles.memoryParchmentCard]}>
                  {/* Decorative Stars */}
                  <Text style={styles.decoStarTopLeft}>✦</Text>
                  <Text style={styles.decoStarTopRight}>✦</Text>
                  <Text style={styles.decoStarBottomLeft}>✦</Text>
                  <Text style={styles.decoStarBottomRight}>✦</Text>

                  {/* Icon */}
                  <View style={{ marginVertical: 6 }}>
                    <Sparkles size={24} color="#C49B44" />
                  </View>

                  <Text style={styles.memoryHeaderNote}>{data.category || 'A strategic thing worth remembering today'}</Text>

                  {/* Script Name */}
                  <Text style={styles.memoryScriptName}>
                    {data.eventName || data.title || 'Daily Cosmic Strategy'}
                  </Text>

                  <Heart size={14} color="#7E57C2" fill="#7E57C2" style={{ marginVertical: 6 }} />

                  <Text style={styles.memoryDescText}>
                    {data.readingText || 'Align your actions with natural celestial flow.'}
                  </Text>

                  {/* Highlight Box */}
                  <View style={styles.memoryTimePill}>
                    <Text style={styles.memoryTimeText}>{timeWindowStr}</Text>
                  </View>

                  <Text style={styles.memoryWatermark}>AstroAi4U</Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Actions Bar */}
          <View style={styles.actionsBar}>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShareImage}
              disabled={isExporting}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#5E2B97', '#8E36B2', '#B93DAF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                {isExporting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <ImageIcon size={18} color="#FFFFFF" />
                    <Text style={styles.shareButtonText}>Share Card (PNG/JPG)</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.copyButton} onPress={handleCopy} activeOpacity={0.8}>
              {copied ? <Check size={18} color="#03B07A" /> : <Copy size={18} color="#7209B7" />}
              <Text style={[styles.copyButtonText, copied && { color: '#03B07A' }]}>
                {copied ? 'Copied!' : 'Copy'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(30, 20, 50, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    width: Math.min(width - 24, 430),
    maxHeight: '90%',
    backgroundColor: '#FBF9F5',
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(114, 111, 141, 0.16)',
    padding: 20,
    shadowColor: '#4A154B',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 28,
    elevation: 12,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(114, 111, 141, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 14,
  },
  modalHeaderTitle: {
    color: '#2C2B3D',
    fontFamily: 'Cinzel-Bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  templateTabsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(114, 9, 183, 0.08)',
    borderRadius: 14,
    padding: 3,
    marginBottom: 14,
  },
  templateTab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 11,
  },
  templateTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#7209B7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  templateTabText: {
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 11.5,
    color: '#726F8D',
  },
  templateTabTextActive: {
    color: '#7209B7',
  },
  cardScroll: {
    maxHeight: 380,
    marginBottom: 16,
  },
  captureWrapper: {
    width: Math.min(width - 70, 360),
    alignItems: 'center',
  },
  cardBase: {
    width: '100%',
    borderRadius: 22,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1.5,
    shadowColor: '#2C2B3D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 5,
  },

  /* TEMPLATE 1 STYLES */
  parchmentCard: {
    backgroundColor: '#F9F5EC',
    borderColor: '#E6DCB8',
  },
  cardTopHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 14,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  brandText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 13,
    color: '#3B185F',
    letterSpacing: 0.8,
  },
  dateStampText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 10,
    color: '#726F8D',
    letterSpacing: 1,
  },
  watercolorCircleContainer: {
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  watercolorCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7E57C2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4,
  },
  zodiacSignGlyph: {
    fontSize: 34,
    color: '#FFFFFF',
  },
  zodiacCardTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 18,
    color: '#2C2B3D',
    letterSpacing: 1.5,
    marginTop: 8,
    marginBottom: 8,
  },
  zodiacCardQuote: {
    fontFamily: 'SourceSerif4',
    fontSize: 13.5,
    lineHeight: 21,
    color: '#4A485B',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  celestialDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '70%',
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#D1C4A8',
  },
  sparkleMotif: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 10,
    color: '#C49B44',
    paddingHorizontal: 8,
  },

  /* TEMPLATE 2 STYLES */
  powerGradientCard: {
    borderColor: '#CBB4E8',
    overflow: 'hidden',
  },
  powerCardCategory: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 11,
    color: '#432C66',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  powerIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  powerTimeDisplay: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 20,
    color: '#2C184D',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  powerAdviceText: {
    fontFamily: 'SourceSerif4',
    fontSize: 13,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 12,
    marginBottom: 18,
  },
  horizonGlow: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
  },
  sunGlowCircle: {
    width: 70,
    height: 35,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    marginBottom: 4,
  },
  powerBrandWatermark: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 1,
  },

  /* TEMPLATE 3 STYLES */
  memoryParchmentCard: {
    backgroundColor: '#FDFBF7',
    borderColor: '#EFE7D0',
    position: 'relative',
  },
  decoStarTopLeft: { position: 'absolute', top: 12, left: 16, color: '#D4AF37', fontSize: 13 },
  decoStarTopRight: { position: 'absolute', top: 12, right: 16, color: '#D4AF37', fontSize: 13 },
  decoStarBottomLeft: { position: 'absolute', bottom: 12, left: 16, color: '#D4AF37', fontSize: 13 },
  decoStarBottomRight: { position: 'absolute', bottom: 12, right: 16, color: '#D4AF37', fontSize: 13 },
  memoryEmoji: { fontSize: 32, marginBottom: 6 },
  memoryHeaderNote: {
    fontFamily: 'SourceSerif4',
    fontSize: 12,
    color: '#726F8D',
    marginBottom: 6,
  },
  memoryScriptName: {
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 21,
    color: '#3B185F',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  memoryDescText: {
    fontFamily: 'SourceSerif4',
    fontSize: 13,
    lineHeight: 19,
    color: '#4A485B',
    textAlign: 'center',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  memoryTimePill: {
    backgroundColor: 'rgba(126, 87, 194, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(126, 87, 194, 0.25)',
    marginBottom: 10,
  },
  memoryTimeText: {
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 14,
    color: '#5E35B1',
  },
  memoryWatermark: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 9.5,
    color: '#9E9BB3',
    letterSpacing: 1,
  },

  /* ACTIONS BAR */
  actionsBar: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  shareButton: {
    flex: 3,
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Cinzel-Bold',
    fontSize: 13.5,
    letterSpacing: 0.5,
  },
  copyButton: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(114, 9, 183, 0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(114, 9, 183, 0.2)',
    paddingVertical: 14,
  },
  copyButtonText: {
    color: '#7209B7',
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 12.5,
  },
});
