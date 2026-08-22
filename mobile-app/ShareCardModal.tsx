import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Share2, Copy, X, Check } from 'lucide-react-native';
import { ShareCardData, executeNativeShare, formatShareCardText, DEFAULT_APP_URL } from './shareUtils';

interface ShareCardModalProps {
  visible: boolean;
  data: ShareCardData | null;
  onClose: () => void;
}

const { width } = Dimensions.get('window');

export const ShareCardModal: React.FC<ShareCardModalProps> = ({ visible, data, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!visible || !data) return null;

  const handleShare = async () => {
    await executeNativeShare(data);
  };

  const handleCopy = () => {
    try {
      const text = formatShareCardText(data);
      // Fallback copy message or clipboard
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      Alert.alert('Card Copied!', 'Share text and app link copied to clipboard. Ready to paste anywhere!');
    } catch (e) {
      // Ignore
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Modal Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
            <X size={18} color="#726F8D" />
          </TouchableOpacity>

          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Sparkles size={18} color="#7209B7" />
            <Text style={styles.modalHeaderTitle}>Cosmic Share Card</Text>
          </View>

          {/* The Cosmic Share Card Preview */}
          <ScrollView style={styles.cardScroll} showsVerticalScrollIndicator={false}>
            <LinearGradient
              colors={['#3A0CA3', '#7209B7', '#B5179E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.card}
            >
              {/* Top Card Badge */}
              <View style={styles.cardBadgeContainer}>
                <View style={styles.cardBadge}>
                  <Text style={styles.cardBadgeText}>{data.category.toUpperCase()}</Text>
                </View>
              </View>

              {/* Title & Subtitle */}
              <Text style={styles.cardTitle}>{data.title}</Text>
              {data.subtitle ? <Text style={styles.cardSubtitle}>{data.subtitle}</Text> : null}

              {/* Divider */}
              <View style={styles.divider} />

              {/* Reading Content */}
              <Text style={styles.readingText}>"{data.readingText.trim()}"</Text>

              {/* Key Highlights */}
              {data.highlights && data.highlights.length > 0 && (
                <View style={styles.highlightsContainer as any}>
                  {data.highlights.map((h, i) => (
                    <View key={`hl_${i}`} style={styles.highlightPill as any}>
                      <Text style={styles.highlightLabel}>{h.label}:</Text>
                      <Text style={styles.highlightValue}> {h.value}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Footer CTA */}
              <View style={styles.cardFooter}>
                <View style={styles.appBranding}>
                  <Sparkles size={13} color="#FFE08A" />
                  <Text style={styles.appBrandingText}>AstroAi4u Cosmic App</Text>
                </View>
                <Text style={styles.downloadCta}>📲 Download & get your daily readings at {data.shareUrl || DEFAULT_APP_URL}</Text>
              </View>
            </LinearGradient>
          </ScrollView>

          {/* Actions Bar */}
          <View style={styles.actionsBar}>
            <TouchableOpacity style={styles.shareButton} onPress={handleShare} activeOpacity={0.8}>
              <LinearGradient
                colors={['#7209B7', '#F72585']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                <Share2 size={18} color="#FFFFFF" />
                <Text style={styles.shareButtonText}>Share Card</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.copyButton} onPress={handleCopy} activeOpacity={0.8}>
              {copied ? <Check size={18} color="#03B07A" /> : <Copy size={18} color="#7209B7" />}
              <Text style={[styles.copyButtonText, copied && { color: '#03B07A' }]}>
                {copied ? 'Copied!' : 'Copy Link'}
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
    backgroundColor: 'rgba(44, 43, 61, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    width: Math.min(width - 32, 420),
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(114, 111, 141, 0.1)',
    padding: 20,
    shadowColor: '#7209B7',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(114, 111, 141, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  modalHeaderTitle: {
    color: '#2C2B3D',
    fontFamily: 'Cinzel-Bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  cardScroll: {
    marginBottom: 16,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
  },
  cardBadgeContainer: {
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  cardBadgeText: {
    color: '#FFFFFF',
    fontFamily: 'Cinzel-Bold',
    fontSize: 10,
    letterSpacing: 1,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontFamily: 'Cinzel-Bold',
    fontSize: 19,
    marginBottom: 4,
  },
  cardSubtitle: {
    color: 'rgba(255, 255, 255, 0.78)',
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 13,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    marginVertical: 12,
  },
  readingText: {
    color: '#FFFFFF',
    fontFamily: 'SourceSerif4',
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  highlightsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  highlightPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  highlightLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 11,
  },
  highlightValue: {
    color: '#FFE08A',
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 11,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.16)',
    paddingTop: 12,
    marginTop: 8,
  },
  appBranding: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  appBrandingText: {
    color: '#FFFFFF',
    fontFamily: 'Cinzel-Bold',
    fontSize: 12,
  },
  downloadCta: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'SourceSerif4',
    fontSize: 11,
  },
  actionsBar: {
    flexDirection: 'row',
    gap: 12,
  },
  shareButton: {
    flex: 2,
    borderRadius: 14,
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
    fontSize: 14,
  },
  copyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(114, 9, 183, 0.06)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(114, 9, 183, 0.2)',
    paddingVertical: 14,
  },
  copyButtonText: {
    color: '#7209B7',
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 13,
  },
});
