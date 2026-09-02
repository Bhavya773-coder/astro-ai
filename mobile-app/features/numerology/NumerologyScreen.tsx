import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Share2 } from 'lucide-react-native';
import { useTheme } from '../../theme';

const LIFE_PATH_DATA: Record<string, { title: string; desc: string }> = {
  '1': {
    title: "THE VIBRATION OF LEADERSHIP & INITIATIVE",
    desc: "A path of independence, pioneer spirit, and self-reliance. You are meant to create your own lane and lead others."
  },
  '2': {
    title: "THE VIBRATION OF HARMONY & COOPERATION",
    desc: "A path of diplomacy, balance, and partnership. Your strength lies in intuition, collaboration, and peace-making."
  },
  '3': {
    title: "THE VIBRATION OF EXPRESSION & CREATIVITY",
    desc: "A path of self-expression, communication, and joy. You are here to inspire, create art, and spread optimism."
  },
  '4': {
    title: "THE VIBRATION OF STRUCTURE & PRACTICALITY",
    desc: "A path of dedication, organization, and building foundations. Your strength lies in systematic execution."
  },
  '5': {
    title: "THE VIBRATION OF FREEDOM & ADVENTURE",
    desc: "A path of dynamic change, resourcefulness, and exploration. You thrive on adaptability and freedom."
  },
  '6': {
    title: "THE VIBRATION OF NURTURING & HARMONY",
    desc: "A path of deep responsibility, compassion, and home equilibrium. You bring healing and warmth to your community."
  },
  '7': {
    title: "THE VIBRATION OF WISDOM & CONTEMPLATION",
    desc: "A path of profound analytical insight, spiritual quest, and inner discovery. You seek universal truths."
  },
  '8': {
    title: "THE VIBRATION OF POWER & ABUNDANCE",
    desc: "A path of material mastery, executive judgment, and cosmic manifestation. You build lasting legacy."
  },
  '9': {
    title: "THE VIBRATION OF UNIVERSAL LOVE & SERVICE",
    desc: "A path of humanitarian service, wisdom completion, and artistic release. You inspire universal upliftment."
  },
  '11': {
    title: "MASTER TEACHER & SPIRITUAL ILLUMINATION",
    desc: "A master spiritual path of heightened intuition, mystical vision, and inspiring transformation."
  },
  '22': {
    title: "MASTER BUILDER & VISIONARY MANIFESTOR",
    desc: "A master architect path turning expansive spiritual ideals into practical, enduring global reality."
  },
  '33': {
    title: "MASTER HEALER & COSMIC BLESSING",
    desc: "A master path of altruistic love, universal healing, and uplifting the consciousness of humanity."
  }
};

interface NumerologyScreenProps {
  apiNumerology: any;
  lifePathNumber: number | string;
  destinyNumber: number | string;
  insets: { bottom: number; top: number; left: number; right: number };
  triggerShareCard: (data: any) => void;
}

export function NumerologyScreen({
  apiNumerology,
  lifePathNumber,
  destinyNumber,
  insets,
  triggerShareCard,
}: NumerologyScreenProps) {
  const { theme, isDark } = useTheme();
  const [selectedCoreNumType, setSelectedCoreNumType] = useState<'lifepath' | 'destiny' | 'soulurge'>('lifepath');

  // Animation values for mandala
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const orbitAnim = useRef(new Animated.Value(0)).current;
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;
  const floatAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Continuous slow rotation of mandala ring
    const rotateLoop = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 36000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    rotateLoop.start();

    // 2. Pulsing central celestial body
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 2600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    // 3. Orbiting Orbs
    const orbitLoop = Animated.loop(
      Animated.timing(orbitAnim, {
        toValue: 1,
        duration: 40000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    orbitLoop.start();

    // 4. Floating animations for each orb
    const createFloat = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 2200 + delay * 400,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 2200 + delay * 400,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );

    const f1 = createFloat(floatAnim1, 0);
    const f2 = createFloat(floatAnim2, 1);
    const f3 = createFloat(floatAnim3, 2);
    f1.start();
    f2.start();
    f3.start();

    return () => {
      rotateLoop.stop();
      pulseLoop.stop();
      orbitLoop.stop();
      f1.stop();
      f2.stop();
      f3.stop();
    };
  }, []);

  const getLifePathStrength = (lifePath: string) => {
    const strengths: Record<string, string> = {
      '1': 'Natural leadership and independence',
      '2': 'Diplomacy and cooperation skills',
      '3': 'Creativity and self-expression',
      '4': 'Organization and practical skills',
      '5': 'Adaptability and freedom-loving nature',
      '6': 'Nurturing and responsibility',
      '7': 'Analytical and spiritual wisdom',
      '8': 'Ambition and material success',
      '9': 'Compassion and humanitarian spirit',
      '11': 'Intuitive and spiritual insight',
      '22': 'Visionary and manifesting abilities',
      '33': 'Healing and teaching gifts'
    };
    return strengths[lifePath] || 'Unique personal strengths';
  };

  const getLifePathChallenge = (lifePath: string) => {
    const challenges: Record<string, string> = {
      '1': 'Overcoming ego and learning cooperation',
      '2': 'Building self-confidence and setting boundaries',
      '3': 'Focusing energy and avoiding scattered interests',
      '4': 'Embracing change and avoiding rigidity',
      '5': 'Commitment and avoiding restlessness',
      '6': 'Self-care and avoiding over-responsibility',
      '7': 'Connecting with others and avoiding isolation',
      '8': 'Balancing material and spiritual concerns',
      '9': 'Learning to let go and forgive',
      '11': 'Managing anxiety and trusting intuition',
      '22': 'Avoiding overwhelm and staying practical',
      '33': 'Setting boundaries and avoiding martyrdom'
    };
    return challenges[lifePath] || 'Personal growth opportunities';
  };

  const getDestinyPurpose = (destiny: string) => {
    const purposes: Record<string, string> = {
      '1': 'To pioneer and lead new initiatives',
      '2': 'To bring harmony and cooperation',
      '3': 'To inspire and uplift others',
      '4': 'To build solid foundations',
      '5': 'To bring freedom and change',
      '6': 'To nurture and serve humanity',
      '7': 'To seek truth and wisdom',
      '8': 'To achieve material and spiritual success',
      '9': 'To complete humanitarian service',
      '11': 'To illuminate spiritual truths',
      '22': 'To build lasting structures',
      '33': 'To teach and heal humanity'
    };
    return purposes[destiny] || 'To fulfill your potential';
  };

  const getDestinyTalent = (destiny: string) => {
    const talents: Record<string, string> = {
      '1': 'Innovation and leadership abilities',
      '2': 'Diplomacy and peacemaking skills',
      '3': 'Communication and creative expression',
      '4': 'Organization and building capabilities',
      '5': 'Versatility and adaptability',
      '6': 'Teaching and nurturing gifts',
      '7': 'Analysis and spiritual insight',
      '8': 'Management and resource development',
      '9': 'Compassion and creative vision',
      '11': 'Intuition and spiritual guidance',
      '22': 'Visionary thinking and practical application',
      '33': 'Healing and inspirational teaching'
    };
    return talents[destiny] || 'Unique natural abilities';
  };

  const getPersonalYearTheme = (personalYear: string) => {
    const themes: Record<string, string> = {
      '1': 'New beginnings and independence',
      '2': 'Partnerships and cooperation',
      '3': 'Creativity and self-expression',
      '4': 'Hard work and foundation building',
      '5': 'Change and freedom',
      '6': 'Responsibility and harmony',
      '7': 'Spirituality and introspection',
      '8': 'Success and material achievement',
      '9': 'Completion and humanitarian service',
      '11': 'Spiritual awakening and intuition',
      '22': 'Master building and achievement',
      '33': 'Universal love and service'
    };
    return themes[personalYear] || 'Personal growth';
  };

  const getPersonalYearAdvice = (personalYear: string) => {
    const advice: Record<string, string> = {
      '1': 'Take initiative and be bold in your decisions',
      '2': 'Practice patience and seek cooperation',
      '3': 'Express yourself creatively and socially',
      '4': 'Stay disciplined and focus on long-term goals',
      '5': 'Embrace change and avoid routine',
      '6': 'Balance responsibility with self-care',
      '7': 'Trust your intuition and seek wisdom',
      '8': 'Be confident and pursue success',
      '9': 'Practice forgiveness and serve others',
      '11': 'Pay attention to dreams and inner guidance',
      '22': 'Think big but stay practical',
      '33': 'Focus on healing and uplifting others'
    };
    return advice[personalYear] || 'Stay true to your authentic self';
  };

  const renderNumerologyDesc = (descText: string, extraText: string) => {
    const lines = extraText.split('\n').filter(Boolean);
    const elements: React.ReactNode[] = [];

    elements.push(
      <Text key="main-desc" style={styles.numerologyDetailText}>
        {descText}
      </Text>
    );

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (
        trimmed === 'Strategic Focus' ||
        trimmed === 'Core Strength' ||
        trimmed === 'Primary Challenge' ||
        trimmed === 'Life Purpose' ||
        trimmed === 'Hidden Talent' ||
        trimmed === 'Year Theme' ||
        trimmed === 'Best Advice'
      ) {
        elements.push(
          <Text key={`h-${idx}`} style={styles.numerologySectionHeading}>
            {trimmed}
          </Text>
        );
      } else if (trimmed.startsWith('•')) {
        elements.push(
          <Text key={`bullet-${idx}`} style={styles.numerologyBulletText}>
            {trimmed}
          </Text>
        );
      } else {
        elements.push(
          <Text key={`body-${idx}`} style={styles.numerologyDetailText}>
            {trimmed}
          </Text>
        );
      }
    });

    return elements;
  };

  // Real calculation from backend or profile calculations
  const numObj = apiNumerology?.numerology || apiNumerology?.data || apiNumerology || {};
  const apiLifePath = numObj.life_path ? String(numObj.life_path) : String(lifePathNumber || '7');
  const apiDestiny = numObj.destiny || numObj.destiny_number ? String(numObj.destiny || numObj.destiny_number) : String(destinyNumber || '3');
  const apiPersonalYear = numObj.personal_year ? String(numObj.personal_year) : '9';

  const currentHour = new Date().getHours();
  const isDayTime = currentHour >= 6 && currentHour < 18;

  let coreNumTitle = "Life Path Number";
  let coreNumVal = apiLifePath;
  let coreNumDesc = "This number represents the path you're destined to walk in this lifetime. It reveals your natural talents, the lessons you're here to learn, and the challenges you'll face.";
  let coreNumHeading = LIFE_PATH_DATA[apiLifePath]?.title || "COSMIC PATH & DESTINY";
  let coreNumPlanet = "Saturn";
  let extraText = `Strategic Focus\n• Your innate abilities and strengths\n• Life lessons and challenges\n• Natural career inclinations\n• Relationship patterns\nCore Strength\n${getLifePathStrength(apiLifePath)}\nPrimary Challenge\n${getLifePathChallenge(apiLifePath)}`;

  if (selectedCoreNumType === 'destiny') {
    coreNumTitle = "Destiny Number";
    coreNumVal = apiDestiny;
    coreNumHeading = "THE EXPRESSION OF YOUR POTENTIAL";
    coreNumDesc = "Also known as the Expression Number, this reveals your life's purpose, your mission, and the opportunities that will come your way to fulfill your potential.";
    coreNumPlanet = "Uranus";
    extraText = `Strategic Focus\n• Your life's mission and purpose\n• Career and success potential\n• How others perceive you\n• Your unique contribution to the world\nLife Purpose\n${getDestinyPurpose(apiDestiny)}\nHidden Talent\n${getDestinyTalent(apiDestiny)}`;
  } else if (selectedCoreNumType === 'soulurge') {
    coreNumTitle = "Personal Year Number";
    coreNumVal = apiPersonalYear;
    coreNumHeading = "YOUR CURRENT YEARLY CYCLES";
    coreNumDesc = "This number changes yearly and shows the themes, opportunities, and challenges you'll experience during this specific year cycle.";
    coreNumPlanet = "Neptune";
    extraText = `Strategic Focus\n• Best timing for important decisions\n• Current year's main themes\n• Opportunities to watch for\n• Areas requiring focus\nYear Theme\n${getPersonalYearTheme(apiPersonalYear)}\nBest Advice\n${getPersonalYearAdvice(apiPersonalYear)}`;
  }

  const orbData = [
    { key: 'lifepath' as const, label: 'Life Path', val: apiLifePath, floatAnim: floatAnim1, color: '#7209B7' },
    { key: 'destiny' as const, label: 'Destiny', val: apiDestiny, floatAnim: floatAnim2, color: '#F72585' },
    { key: 'soulurge' as const, label: 'Personal Year', val: apiPersonalYear, floatAnim: floatAnim3, color: '#B3A2E7' },
  ];

  const spinInterpolate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.tabScroll}>
      <Text style={[styles.tabViewTitle, isDark && { color: theme.text.primary }]}>Numerology</Text>

      {/* Share Numerology Card Button */}
      <TouchableOpacity
        style={styles.shareCardTrigger}
        onPress={() => {
          triggerShareCard({
            category: 'NUMEROLOGY',
            title: `${coreNumTitle}: Number ${coreNumVal}`,
            subtitle: coreNumHeading,
            readingText: coreNumDesc,
            highlights: [
              { label: 'Life Path', value: apiLifePath },
              { label: 'Destiny Number', value: apiDestiny },
              { label: 'Personal Year', value: apiPersonalYear },
              { label: 'Ruling Planet', value: coreNumPlanet },
            ],
          });
        }}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#8B5CF6', '#3B82F6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.shareCardTriggerGradient}
        >
          <Share2 size={16} color="#FFFFFF" />
          <Text style={styles.shareCardTriggerText}>Share Numerology Card</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* ══════ FLOATING TRINITY MANDALA ══════ */}
      <View style={styles.mandalaContainer}>
        {/* Decorative rotating outer ring */}
        <Animated.View style={[
          styles.mandalaOuterRing,
          { transform: [{ rotate: spinInterpolate }] }
        ]}>
          {Array.from({ length: 12 }).map((_, i) => (
            <View key={i} style={[
              styles.mandalaTick,
              { transform: [{ rotate: `${i * 30}deg` }, { translateY: -88 }] }
            ]} />
          ))}
        </Animated.View>

        {/* Central Pulsing Celestial Body — Sun by day, Moon by night */}
        {isDayTime ? (
          <Animated.View style={[
            styles.mandalaCenterSun,
            { transform: [{ scale: pulseAnim }] }
          ]}>
            <Animated.View style={[
              styles.sunRayLayer,
              { transform: [{ rotate: spinInterpolate }] }
            ]}>
              {Array.from({ length: 12 }).map((_, i) => (
                <View
                  key={`ray-${i}`}
                  style={[
                    styles.sunRay,
                    i % 2 === 1 && styles.sunRayShort,
                    { transform: [{ rotate: `${i * 30}deg` }, { translateY: -34 }] },
                  ]}
                />
              ))}
            </Animated.View>

            <LinearGradient
              colors={['#FFFDF5', '#FFE082', '#FFB300', '#FB8C00']}
              start={{ x: 0.3, y: 0.15 }}
              end={{ x: 0.85, y: 1 }}
              style={styles.sunGradient}
            >
              <View style={styles.sunCoreHighlight} />
            </LinearGradient>

            <View style={styles.sunHalo1} />
            <View style={styles.sunHalo2} />
          </Animated.View>
        ) : (
          <Animated.View style={[
            styles.mandalaCenterMoon,
            { transform: [{ scale: pulseAnim }] }
          ]}>
            <LinearGradient
              colors={['#FFFCEE', '#F7E7C4', '#D2B48C', '#8E79A5']}
              start={{ x: 0.15, y: 0.15 }}
              end={{ x: 0.9, y: 0.9 }}
              style={styles.moonGradient}
            >
              <View style={[styles.moonCrater, { width: 9, height: 9, borderRadius: 4.5, top: 10, left: 12 }]} />
              <View style={[styles.moonCrater, { width: 13, height: 13, borderRadius: 6.5, top: 25, left: 23 }]} />
              <View style={[styles.moonCrater, { width: 7, height: 7, borderRadius: 3.5, top: 13, left: 31 }]} />
              <View style={[styles.moonCrater, { width: 10, height: 10, borderRadius: 5, top: 31, left: 8 }]} />
              <View style={[styles.moonCrater, { width: 5, height: 5, borderRadius: 2.5, top: 21, left: 15 }]} />

              <LinearGradient
                colors={['rgba(28, 20, 48, 0)', 'rgba(28, 20, 48, 0.4)', 'rgba(15, 10, 30, 0.75)']}
                start={{ x: 0.2, y: 0.2 }}
                end={{ x: 1, y: 1 }}
                style={[StyleSheet.absoluteFillObject, { borderRadius: 26 }]}
              />
            </LinearGradient>

            <View style={styles.moonHalo1} />
            <View style={styles.moonHalo2} />
          </Animated.View>
        )}

        {/* Revolving Background Cosmic Numbers */}
        {[
          { val: '7', radius: 80, startAngle: 0, clockwise: true, size: 14, opacity: 0.4 },
          { val: '3', radius: 95, startAngle: 120, clockwise: false, size: 12, opacity: 0.35 },
          { val: '9', radius: 110, startAngle: 240, clockwise: true, size: 16, opacity: 0.5 },
          { val: '1', radius: 138, startAngle: 60, clockwise: false, size: 14, opacity: 0.4 },
          { val: '5', radius: 152, startAngle: 180, clockwise: true, size: 13, opacity: 0.35 },
          { val: '8', radius: 166, startAngle: 300, clockwise: false, size: 15, opacity: 0.45 },
        ].map((item, idx) => {
          const startAngle = item.startAngle;
          const rotateVal = orbitAnim.interpolate({
            inputRange: [0, 1],
            outputRange: item.clockwise
              ? [`${startAngle}deg`, `${startAngle + 360}deg`]
              : [`${startAngle}deg`, `${startAngle - 360}deg`],
          });
          const counterRotateVal = orbitAnim.interpolate({
            inputRange: [0, 1],
            outputRange: item.clockwise
              ? [`${-startAngle}deg`, `${-startAngle - 360}deg`]
              : [`${-startAngle}deg`, `${-startAngle + 360}deg`],
          });

          return (
            <Animated.View
              key={`bg-num-${idx}`}
              pointerEvents="none"
              style={[
                styles.mandalaBgNumberWrapper,
                {
                  transform: [
                    { rotate: rotateVal },
                    { translateX: item.radius },
                    { rotate: counterRotateVal },
                  ],
                },
              ]}
            >
              <Text style={[
                styles.mandalaBgNumberText,
                {
                  fontSize: item.size,
                  opacity: isDark ? 0.9 : item.opacity,
                  color: isDark ? '#FFFFFF' : '#7209B7',
                }
              ]}>
                {item.val}
              </Text>
            </Animated.View>
          );
        })}

        {/* Orbiting Planetary Orbs (Life Path, Destiny, Personal Year) */}
        {orbData.map((orb, index) => {
          const isActive = selectedCoreNumType === orb.key;
          const baseAngle = index * 120;
          const rotateVal = orbitAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [`${baseAngle}deg`, `${baseAngle + 360}deg`],
          });
          const counterRotateVal = orbitAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [`${-baseAngle}deg`, `${-baseAngle - 360}deg`],
          });
          const floatY = orb.floatAnim.interpolate({
            inputRange: [-1, 1],
            outputRange: [-6, 6],
          });

          return (
            <Animated.View
              key={orb.key}
              style={[
                styles.mandalaOrbWrapper,
                {
                  transform: [
                    { rotate: rotateVal },
                    { translateX: 120 },
                    { rotate: counterRotateVal },
                    { translateY: floatY },
                  ],
                },
              ]}
            >
              <TouchableOpacity
                onPress={() => setSelectedCoreNumType(orb.key)}
                activeOpacity={0.8}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                style={[
                  styles.mandalaOrb,
                  isDark && { backgroundColor: 'rgba(22, 19, 41, 0.75)', borderColor: 'rgba(168, 85, 247, 0.3)' },
                  isActive && { borderColor: orb.color, borderWidth: 2 },
                ]}
              >
                {isActive && (
                  <LinearGradient
                    colors={[orb.color, 'rgba(114, 9, 183, 0.6)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[StyleSheet.absoluteFillObject, { borderRadius: 32 }]}
                  />
                )}
                {orb.key === 'soulurge' ? (
                  <>
                    <Text style={[
                      styles.mandalaOrbNumber,
                      isDark && { color: '#F0EEFF' },
                      isActive && { color: '#FFFFFF' },
                    ]}>
                      {orb.val}
                    </Text>
                    <Text style={[
                      styles.mandalaOrbLabelCentered,
                      isDark && { color: '#9E9BB3' },
                      isActive && { color: 'rgba(255,255,255,0.85)' }
                    ]}>
                      Personal{"\n"}Year
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={[
                      styles.mandalaOrbNumber,
                      isDark && { color: '#F0EEFF' },
                      isActive && { color: '#FFFFFF' },
                    ]}>
                      {orb.val}
                    </Text>
                    <Text style={[
                      styles.mandalaOrbLabel,
                      isDark && { color: '#9E9BB3' },
                      isActive && { color: 'rgba(255,255,255,0.85)' },
                    ]}>
                      {orb.label}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
              {isActive && (
                <View style={styles.mandalaOrbSparkle}>
                  <Sparkles size={10} color={orb.color} />
                </View>
              )}
            </Animated.View>
          );
        })}

        <View style={[styles.mandalaHint, isDark && { backgroundColor: 'rgba(168, 85, 247, 0.15)' }]}>
          <Text style={[styles.mandalaHintText, isDark && { color: '#A855F7' }]}>Tap to explore ✨</Text>
        </View>
      </View>

      {/* Core Switcher Segment Bar */}
      <View style={[styles.chartsSegmentContainer, isDark && { backgroundColor: 'rgba(168, 85, 247, 0.15)' }]}>
        <TouchableOpacity
          style={[styles.chartsSegmentBtn, selectedCoreNumType === 'lifepath' && styles.chartsSegmentBtnActive]}
          onPress={() => setSelectedCoreNumType('lifepath')}
          activeOpacity={0.8}
        >
          <Text style={[styles.chartsSegmentText, isDark && { color: '#A855F7' }, selectedCoreNumType === 'lifepath' && styles.chartsSegmentTextActive]}>
            Life Path
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.chartsSegmentBtn, selectedCoreNumType === 'destiny' && styles.chartsSegmentBtnActive]}
          onPress={() => setSelectedCoreNumType('destiny')}
          activeOpacity={0.8}
        >
          <Text style={[styles.chartsSegmentText, isDark && { color: '#A855F7' }, selectedCoreNumType === 'destiny' && styles.chartsSegmentTextActive]}>
            Destiny
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.chartsSegmentBtn, selectedCoreNumType === 'soulurge' && styles.chartsSegmentBtnActive]}
          onPress={() => setSelectedCoreNumType('soulurge')}
          activeOpacity={0.8}
        >
          <Text style={[styles.chartsSegmentText, isDark && { color: '#A855F7' }, selectedCoreNumType === 'soulurge' && styles.chartsSegmentTextActive]}>
            Personal Year
          </Text>
        </TouchableOpacity>
      </View>

      {/* Selected Core Number Card */}
      <View style={styles.astralCard}>
        <LinearGradient
          colors={['#7209B7', '#F72585']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.astralCardGradient}
        >
          <Text style={styles.zodiacTitle}>{coreNumTitle}: {coreNumVal}</Text>
          <Text style={styles.zodiacSubtitle}>{coreNumHeading}</Text>
          <View style={styles.divider} />
          {renderNumerologyDesc(coreNumDesc, extraText)}
        </LinearGradient>
      </View>

      <View style={{ height: 100 + insets.bottom }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tabScroll: {
    flex: 1,
    paddingHorizontal: 20,
  },
  tabViewTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 24,
    color: '#2C2B3D',
    marginBottom: 16,
    marginTop: 8,
  },
  shareCardTrigger: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 16,
  },
  shareCardTriggerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    gap: 8,
  },
  shareCardTriggerText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 12,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  mandalaContainer: {
    width: 320,
    height: 320,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  mandalaOuterRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(114, 9, 183, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mandalaTick: {
    position: 'absolute',
    width: 2,
    height: 6,
    backgroundColor: '#B3A2E7',
    borderRadius: 1,
  },
  mandalaCenterSun: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sunRayLayer: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sunRay: {
    position: 'absolute',
    width: 2,
    height: 8,
    backgroundColor: '#FFB300',
    borderRadius: 1,
  },
  sunRayShort: {
    height: 5,
    backgroundColor: '#FFE082',
  },
  sunGradient: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sunCoreHighlight: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  sunHalo1: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: 'rgba(255, 179, 0, 0.25)',
  },
  sunHalo2: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1,
    borderColor: 'rgba(255, 179, 0, 0.12)',
  },
  mandalaCenterMoon: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moonGradient: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
  },
  moonCrater: {
    position: 'absolute',
    backgroundColor: 'rgba(90, 70, 110, 0.25)',
  },
  moonHalo1: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: 'rgba(179, 162, 231, 0.3)',
  },
  moonHalo2: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1,
    borderColor: 'rgba(179, 162, 231, 0.15)',
  },
  mandalaOrbWrapper: {
    position: 'absolute',
    width: 76,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mandalaOrb: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(114, 111, 141, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2C2B3D',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  mandalaOrbNumber: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 20,
    color: '#2C2B3D',
  },
  mandalaOrbLabel: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 8.5,
    color: '#726F8D',
    marginTop: 2,
  },
  mandalaOrbLabelCentered: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 7.5,
    color: '#726F8D',
    textAlign: 'center',
    lineHeight: 9,
    marginTop: 1,
  },
  mandalaOrbSparkle: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
  mandalaHint: {
    position: 'absolute',
    bottom: -8,
    backgroundColor: 'rgba(114, 9, 183, 0.06)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mandalaHintText: {
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 11,
    color: '#7209B7',
  },
  chartsSegmentContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(114, 9, 183, 0.08)',
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
  },
  chartsSegmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartsSegmentBtnActive: {
    backgroundColor: '#7209B7',
  },
  chartsSegmentText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 12,
    color: '#7209B7',
  },
  chartsSegmentTextActive: {
    color: '#FFFFFF',
  },
  astralCard: {
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#7209B7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 4,
  },
  astralCardGradient: {
    padding: 22,
  },
  zodiacTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 20,
    color: '#FFFFFF',
  },
  zodiacSubtitle: {
    fontFamily: 'SourceSerif4-Bold',
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 14,
  },
  numerologyDetailText: {
    fontFamily: 'SourceSerif4',
    fontSize: 14,
    color: 'rgba(255,255,255,0.95)',
    lineHeight: 21,
    marginBottom: 8,
  },
  numerologySectionHeading: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 13,
    color: '#FFD700',
    marginTop: 10,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  numerologyBulletText: {
    fontFamily: 'SourceSerif4',
    fontSize: 13.5,
    color: 'rgba(255,255,255,0.9)',
    marginLeft: 6,
    lineHeight: 20,
  },
  mandalaBgNumberWrapper: {
    position: 'absolute',
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mandalaBgNumberText: {
    fontFamily: 'Cinzel-Bold',
  },
});

export default NumerologyScreen;
