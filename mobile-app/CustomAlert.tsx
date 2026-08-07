import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Alert as RNAlert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { AlertTriangle, CheckCircle2, Sparkles, X } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export interface AlertButton {
  text?: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export interface AlertConfig {
  title: string;
  message?: string;
  buttons?: AlertButton[];
}

type AlertListener = (config: AlertConfig | null) => void;

const alertListeners = new Set<AlertListener>();

const originalAlert = RNAlert.alert.bind(RNAlert);

export const CustomAlert = {
  alert: (title: string, message?: string, buttons?: AlertButton[]) => {
    const config: AlertConfig = { title, message, buttons };
    if (alertListeners.size > 0) {
      alertListeners.forEach((listener) => listener(config));
    } else {
      originalAlert(title, message || '', buttons as any);
    }
  },
};

// Global override for Alert.alert
(RNAlert as any).alert = (title: string, message?: string, buttons?: AlertButton[]) => {
  CustomAlert.alert(title, message, buttons);
};

export function CustomAlertContainer() {
  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    const handleAlert: AlertListener = (config) => {
      setAlertConfig(config);
      if (config) {
        fadeAnim.setValue(0);
        scaleAnim.setValue(0.92);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 8,
            tension: 65,
            useNativeDriver: true,
          }),
        ]).start();
      }
    };

    alertListeners.add(handleAlert);
    return () => {
      alertListeners.delete(handleAlert);
    };
  }, [fadeAnim, scaleAnim]);

  if (!alertConfig) return null;

  const handleClose = (onPress?: () => void) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.92,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setAlertConfig(null);
      if (onPress) {
        onPress();
      }
    });
  };

  const { title, message, buttons } = alertConfig;
  const activeButtons =
    buttons && buttons.length > 0
      ? buttons
      : [{ text: 'OK', style: 'default' as const }];

  const fullText = `${title} ${message || ''}`.toLowerCase();
  const isError =
    fullText.includes('error') ||
    fullText.includes('failed') ||
    fullText.includes('invalid') ||
    fullText.includes('oops') ||
    fullText.includes('declined') ||
    fullText.includes('expired') ||
    fullText.includes('required');
  const isSuccess =
    fullText.includes('success') ||
    fullText.includes('verified') ||
    fullText.includes('resent') ||
    fullText.includes('complete') ||
    fullText.includes('added');

  return (
    <Modal
      transparent
      visible={!!alertConfig}
      animationType="none"
      onRequestClose={() => handleClose()}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View
          style={[
            styles.cardContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Liquid Glass Container with exact App Design Language */}
          <View style={styles.glassCardInner}>
            {/* Liquid Glass Backdrop Blur */}
            <BlurView intensity={Platform.OS === 'web' ? 45 : 30} tint="light" style={StyleSheet.absoluteFillObject} />

            {/* Whitish Line of Shade (Top Edge Highlight Reflection) */}
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.4)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.topShadeLine}
            />

            {/* Card Content Body */}
            <View style={styles.cardBody}>
              {/* Header Icon Badge */}
              <View style={styles.iconContainer}>
                <LinearGradient
                  colors={
                    isError
                      ? ['#FFF2F3', '#FFE5E7']
                      : isSuccess
                      ? ['#E8F8F3', '#D1F2E8']
                      : ['#F3EFFF', '#E9E0FF']
                  }
                  style={styles.iconGradient}
                >
                  {isError ? (
                    <AlertTriangle size={24} color="#E63946" />
                  ) : isSuccess ? (
                    <CheckCircle2 size={24} color="#03B07A" />
                  ) : (
                    <Sparkles size={24} color="#B3A2E7" />
                  )}
                </LinearGradient>
              </View>

              {/* Close Button */}
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => handleClose()}
                activeOpacity={0.7}
              >
                <X size={18} color="#726F8D" />
              </TouchableOpacity>

              {/* Title using App Font */}
              <Text style={styles.titleText}>{title}</Text>

              {/* Message */}
              {!!message && <Text style={styles.messageText}>{message}</Text>}

              {/* Buttons matching exact App Sign In / Create Account Button Theme */}
              <View
                style={[
                  styles.buttonsRow,
                  activeButtons.length > 2 && { flexDirection: 'column' },
                ]}
              >
                {activeButtons.map((btn, idx) => {
                  const isCancel = btn.style === 'cancel';
                  const isDestructive = btn.style === 'destructive';

                  if (isCancel) {
                    return (
                      <TouchableOpacity
                        key={idx}
                        style={[styles.btn, styles.cancelBtn]}
                        onPress={() => handleClose(btn.onPress)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.cancelBtnText}>{btn.text || 'Cancel'}</Text>
                      </TouchableOpacity>
                    );
                  }

                  if (isDestructive) {
                    return (
                      <TouchableOpacity
                        key={idx}
                        style={[styles.btn, { overflow: 'hidden' }]}
                        onPress={() => handleClose(btn.onPress)}
                        activeOpacity={0.8}
                      >
                        <LinearGradient
                          colors={['#E63946', '#C1272D']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.gradientBtn}
                        >
                          <Text style={styles.primaryBtnText}>{btn.text || 'Delete'}</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    );
                  }

                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.btn, styles.buttonShadow]}
                      onPress={() => handleClose(btn.onPress)}
                      activeOpacity={0.9}
                    >
                      <LinearGradient
                        colors={['#B3A2E7', '#A0C9E9']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.gradientBtn}
                      >
                        <Text style={styles.primaryBtnText}>{btn.text || 'OK'}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Whitish Line of Shade (Bottom Edge Highlight Reflection) */}
            <LinearGradient
              colors={['transparent', 'rgba(255, 255, 255, 0.4)', 'rgba(255, 255, 255, 0.95)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.bottomShadeLine}
            />
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(44, 43, 61, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  cardContainer: {
    width: Math.min(width - 48, 380),
    borderRadius: 24,
    shadowColor: '#B3A2E7',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 10,
  },
  glassCardInner: {
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.52)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.75)',
    overflow: 'hidden',
    position: 'relative',
  },
  topShadeLine: {
    height: 2.5,
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10,
  },
  bottomShadeLine: {
    height: 2.5,
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    zIndex: 10,
  },
  cardBody: {
    padding: 24,
    alignItems: 'center',
    position: 'relative',
    zIndex: 5,
  },
  iconContainer: {
    marginBottom: 14,
  },
  iconGradient: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    padding: 6,
  },
  titleText: {
    fontFamily: 'Cinzel-Bold',
    color: '#2C2B3D',
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 0.3,
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  messageText: {
    fontSize: 13.5,
    color: '#555171',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  buttonsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    marginTop: 4,
  },
  btn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonShadow: {
    shadowColor: '#B3A2E7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  cancelBtn: {
    backgroundColor: 'rgba(179, 162, 231, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(179, 162, 231, 0.25)',
  },
  cancelBtnText: {
    fontFamily: 'Cinzel-Bold',
    color: '#726F8D',
    fontSize: 14,
  },
  gradientBtn: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtnText: {
    fontFamily: 'Cinzel-Bold',
    color: '#FFFFFF',
    fontSize: 14,
    letterSpacing: 0.4,
  },
});
