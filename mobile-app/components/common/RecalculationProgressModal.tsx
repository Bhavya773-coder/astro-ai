import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, CheckCircle2 } from 'lucide-react-native';

interface RecalculationProgressModalProps {
  visible: boolean;
  progress: number; // 0 to 100
  stepText: string;
  isComplete: boolean;
}

export function RecalculationProgressModal({
  visible,
  progress,
  stepText,
  isComplete,
}: RecalculationProgressModalProps) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <LinearGradient
            colors={['#7209B7', '#F72585']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <View style={styles.iconCircle}>
              {isComplete ? (
                <CheckCircle2 size={26} color="#00FFC2" />
              ) : (
                <Sparkles size={24} color="#FFD700" />
              )}
            </View>
            <Text style={styles.title}>
              {isComplete ? 'Cosmic Alignment Synced!' : 'Recalculating Alignment'}
            </Text>
            <Text style={styles.subtitle}>
              {isComplete ? 'All birth charts and planetary positions updated' : 'Updating your astrological profile'}
            </Text>
          </LinearGradient>

          <View style={styles.body}>
            {/* Progress Bar Container */}
            <View style={styles.progressTrack}>
              <View style={[styles.progressBar, { width: `${Math.min(progress, 100)}%` }]} />
            </View>

            <View style={styles.progressInfoRow}>
              <Text style={styles.stepText}>{stepText}</Text>
              <Text style={styles.percentText}>{Math.round(progress)}%</Text>
            </View>

            {!isComplete && (
              <View style={styles.loadingIndicatorRow}>
                <ActivityIndicator size="small" color="#7209B7" />
                <Text style={styles.calculatingNote}>Please keep the app open...</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#7209B7',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  headerGradient: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  title: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'SourceSerif4',
    fontSize: 12.5,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    marginTop: 4,
  },
  body: {
    padding: 20,
  },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(114, 9, 183, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#7209B7',
    borderRadius: 4,
  },
  progressInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepText: {
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 13,
    color: '#2C2B3D',
    flex: 1,
    marginRight: 8,
  },
  percentText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 14,
    color: '#7209B7',
  },
  loadingIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 18,
  },
  calculatingNote: {
    fontFamily: 'SourceSerif4',
    fontSize: 12,
    color: '#726F8D',
  },
});

export default RecalculationProgressModal;
