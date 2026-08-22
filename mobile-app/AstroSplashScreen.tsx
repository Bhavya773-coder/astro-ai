import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

type Props = {
  onFinish?: () => void;
  backgroundColor?: string;
  size?: number;
};

export default function AstroSplashScreen({
  onFinish,
  backgroundColor = '#070816',
  size = 260,
}: Props) {
  // Animation values
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const orbitRotation = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0.3)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(15)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const fadeOutAnim = useRef(new Animated.Value(1)).current;

  // Staggered star twinkling values
  const star1 = useRef(new Animated.Value(0)).current;
  const star2 = useRef(new Animated.Value(0)).current;
  const star3 = useRef(new Animated.Value(0)).current;
  const star4 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Continuous slow rotation for celestial orbit ring
    Animated.loop(
      Animated.timing(orbitRotation, {
        toValue: 1,
        duration: 12000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // 2. Gentle glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 0.8,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(glowPulse, {
          toValue: 0.3,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 3. Main entrance animation sequence
    Animated.sequence([
      // Logo Entrance (Scale + Fade)
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),

      // Twinkling stars stagger
      Animated.stagger(150, [
        Animated.spring(star1, { toValue: 1, friction: 5, useNativeDriver: true }),
        Animated.spring(star2, { toValue: 1, friction: 5, useNativeDriver: true }),
        Animated.spring(star3, { toValue: 1, friction: 5, useNativeDriver: true }),
        Animated.spring(star4, { toValue: 1, friction: 5, useNativeDriver: true }),
      ]),

      // Title & Subtitle Rise
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(titleTranslateY, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),

      // Hold complete screen before finishing
      Animated.delay(1000),

      // Smooth fade out
      Animated.timing(fadeOutAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) onFinish?.();
    });

  }, [
    fadeOutAnim,
    glowPulse,
    logoOpacity,
    logoScale,
    onFinish,
    orbitRotation,
    star1,
    star2,
    star3,
    star4,
    subtitleOpacity,
    titleOpacity,
    titleTranslateY,
  ]);

  const spin = orbitRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const reverseSpin = orbitRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeOutAnim }]}>
      <LinearGradient
        colors={['#070816', '#120E2E', '#0A081D']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Pulsing Ambient Background Glow */}
      <Animated.View
        style={[
          styles.ambientGlow,
          {
            opacity: glowPulse,
            transform: [{ scale: glowPulse.interpolate({ inputRange: [0.3, 0.8], outputRange: [0.9, 1.25] }) }],
          },
        ]}
      />

      {/* Rotating Outer Celestial Ring */}
      <Animated.View
        style={[
          styles.orbitRingContainer,
          { transform: [{ rotate: spin }] },
        ]}
      >
        <View style={styles.orbitRingOuter} />
        <View style={styles.orbitDotTop} />
        <View style={styles.orbitDotBottom} />
      </Animated.View>

      {/* Counter-Rotating Inner Ring */}
      <Animated.View
        style={[
          styles.innerOrbitContainer,
          { transform: [{ rotate: reverseSpin }] },
        ]}
      >
        <View style={styles.orbitRingInner} />
        <View style={styles.orbitDotRight} />
      </Animated.View>

      {/* Central Logo & Twinkling Celestial Elements */}
      <View style={styles.logoWrapper}>
        {/* Twinkling Star 1 (Top Left) */}
        <Animated.Text
          style={[
            styles.starText,
            { top: -20, left: 10 },
            { opacity: star1, transform: [{ scale: star1 }] },
          ]}
        >
          ✦
        </Animated.Text>

        {/* Twinkling Star 2 (Top Right) */}
        <Animated.Text
          style={[
            styles.starText,
            { top: 10, right: -15, fontSize: 24, color: '#FFD700' },
            { opacity: star2, transform: [{ scale: star2 }] },
          ]}
        >
          ★
        </Animated.Text>

        {/* Twinkling Star 3 (Bottom Left) */}
        <Animated.Text
          style={[
            styles.starText,
            { bottom: 10, left: -15, fontSize: 20, color: '#E0AAFF' },
            { opacity: star3, transform: [{ scale: star3 }] },
          ]}
        >
          ✧
        </Animated.Text>

        {/* Twinkling Star 4 (Bottom Right) */}
        <Animated.Text
          style={[
            styles.starText,
            { bottom: -15, right: 20, fontSize: 18 },
            { opacity: star4, transform: [{ scale: star4 }] },
          ]}
        >
          ✦
        </Animated.Text>

        {/* Main Logo Image with Scale + Opacity */}
        <Animated.Image
          source={require('./assets/astroai4u-logo.png')}
          style={{
            width: size,
            height: size,
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          }}
          resizeMode="contain"
        />
      </View>

      {/* Brand Title & Subtitle */}
      <Animated.View
        style={[
          styles.textContainer,
          {
            opacity: titleOpacity,
            transform: [{ translateY: titleTranslateY }],
          },
        ]}
      >
        <Text style={styles.brandTitle}>ASTROAI4U</Text>
        <Animated.Text style={[styles.brandSubtitle, { opacity: subtitleOpacity }]}>
          YOUR CELESTIAL GUIDE
        </Animated.Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#070816',
    zIndex: 999999,
  },
  ambientGlow: {
    position: 'absolute',
    width: width * 0.85,
    height: width * 0.85,
    borderRadius: width * 0.425,
    backgroundColor: 'rgba(179, 162, 231, 0.18)',
    filter: 'blur(30px)',
  },
  orbitRingContainer: {
    position: 'absolute',
    width: 320,
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitRingOuter: {
    width: 310,
    height: 310,
    borderRadius: 155,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.25)',
    borderStyle: 'dashed',
  },
  orbitDotTop: {
    position: 'absolute',
    top: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowRadius: 6,
    shadowOpacity: 0.9,
  },
  orbitDotBottom: {
    position: 'absolute',
    bottom: 0,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#B3A2E7',
  },
  innerOrbitContainer: {
    position: 'absolute',
    width: 270,
    height: 270,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitRingInner: {
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 1,
    borderColor: 'rgba(179, 162, 231, 0.2)',
  },
  orbitDotRight: {
    position: 'absolute',
    right: 0,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#E0AAFF',
  },
  logoWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  starText: {
    position: 'absolute',
    fontSize: 22,
    color: '#FFFFFF',
    textShadowColor: 'rgba(255, 215, 0, 0.8)',
    textShadowRadius: 8,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  brandTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 30,
    color: '#FFFFFF',
    letterSpacing: 4,
    textAlign: 'center',
    textShadowColor: 'rgba(179, 162, 231, 0.6)',
    textShadowRadius: 10,
  },
  brandSubtitle: {
    fontFamily: 'Cinzel',
    fontSize: 12,
    color: 'rgba(255, 215, 0, 0.85)',
    letterSpacing: 3,
    marginTop: 6,
    textAlign: 'center',
  },
});
