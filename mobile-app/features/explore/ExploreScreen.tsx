import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Sparkles } from 'lucide-react-native';
import { haptic } from '../../haptics';
import { useTheme } from '../../theme';

interface ExploreScreenProps {
  insets: { bottom: number; top: number; left: number; right: number };
  readingHistory: any[];
  setCurrentView: (view: string) => void;
  handleOpenStyleForecaster: () => void;
}

export function ExploreScreen({
  insets,
  readingHistory,
  setCurrentView,
  handleOpenStyleForecaster,
}: ExploreScreenProps) {
  const { theme, isDark } = useTheme();
  const { width } = Dimensions.get('window');
  const specials = ['vastu-consultant', 'astrology-8ball', 'tarot-reading', 'palm-reading', 'face-reading', 'coffee-reading', 'style-forecaster'];
  const todaySpecial = specials[new Date().getDate() % specials.length];

  const specialNames: Record<string, string> = {
    'tarot-reading': 'Tarot Arcana',
    'palm-reading': 'Palmistry Scan',
    'face-reading': 'Face Reading',
    'coffee-reading': 'Coffee Reading',
    'style-forecaster': 'StyleForecaster',
    'astrology-8ball': 'Astrology 8 Ball',
    'vastu-consultant': 'Vastu Consultant',
  };

  const specialDesc: Record<string, string> = {
    'tarot-reading': 'Draw three cards to decode your cosmic energies',
    'palm-reading': 'Map your destiny through palm lines',
    'face-reading': 'Analyze facial features for character insights',
    'coffee-reading': 'Interpret cup sediment patterns',
    'style-forecaster': 'Get outfit & color recommendations',
    'astrology-8ball': 'Ask a yes/no question and shake the cosmic ball',
    'vastu-consultant': 'Upload a 2D house plan for Vastu guidance',
  };

  const specialColors: Record<string, [string, string, ...string[]]> = {
    'tarot-reading': ['#D9730D', '#F72585'],
    'palm-reading': ['#7209B7', '#3A0CA3'],
    'face-reading': ['#F72585', '#7209B7'],
    'coffee-reading': ['#B3A2E7', '#7209B7'],
    'style-forecaster': ['#7209B7', '#F72585'],
    'astrology-8ball': ['#080614', '#7209B7'],
    'vastu-consultant': ['#7209B7', '#3A0CA3'],
  };

  const specialIcons: Record<string, any> = {
    'tarot-reading': 'cards-outline',
    'palm-reading': 'hand-back-left-outline',
    'face-reading': 'face-recognition',
    'coffee-reading': 'coffee-outline',
    'style-forecaster': 'hanger',
    'astrology-8ball': 'circle-slice-8',
    'vastu-consultant': 'home-city-outline',
  };

  const specialActions: Record<string, () => void> = {
    'tarot-reading': () => setCurrentView('tarot-reading'),
    'palm-reading': () => setCurrentView('palm-reading'),
    'face-reading': () => setCurrentView('face-reading'),
    'coffee-reading': () => setCurrentView('coffee-reading'),
    'style-forecaster': () => handleOpenStyleForecaster(),
    'astrology-8ball': () => setCurrentView('astrology-8ball'),
    'vastu-consultant': () => setCurrentView('vastu-consultant'),
  };

  const gridItems = [
    { key: 'palm-reading', label: 'Palmistry', icon: 'hand-back-left-outline', color: '#7209B7', action: () => setCurrentView('palm-reading') },
    { key: 'face-reading', label: 'Face Reading', icon: 'face-recognition', color: '#F72585', action: () => setCurrentView('face-reading') },
    { key: 'coffee-reading', label: 'Coffee', icon: 'coffee-outline', color: '#B3A2E7', action: () => setCurrentView('coffee-reading') },
    { key: 'tarot-reading', label: 'Tarot', icon: 'cards-outline', color: '#D9730D', action: () => setCurrentView('tarot-reading') },
    { key: 'vastu-consultant', label: 'Vastu', icon: 'home-city-outline', color: '#7209B7', action: () => setCurrentView('vastu-consultant') },
    { key: 'astrology-8ball', label: '8 Ball', icon: 'circle-slice-8', color: '#3A0CA3', action: () => setCurrentView('astrology-8ball') },
    { key: 'astro-calendar', label: 'Calendar', icon: 'calendar-month', color: '#3A0CA3', action: () => setCurrentView('astro-calendar') },
    { key: 'style-forecaster', label: 'Style', icon: 'hanger', color: '#F72585', action: () => handleOpenStyleForecaster() },
  ].filter(item => item.key !== todaySpecial);

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.tabScroll}>
      <Text style={[styles.tabViewTitle, isDark && { color: theme.text.primary }]}>Explore</Text>

      {/* Today's Special Hero Card */}
      <TouchableOpacity
        style={styles.heroCard}
        activeOpacity={0.85}
        onPress={() => { haptic.press(); specialActions[todaySpecial]?.(); }}
      >
        <LinearGradient
          colors={specialColors[todaySpecial] || ['#7209B7', '#F72585']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ padding: 22 }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <Sparkles size={14} color="#FFF" style={{ marginRight: 6 }} />
                <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 10, color: 'rgba(255,255,255,0.85)', letterSpacing: 1 }}>TODAY'S SPECIAL</Text>
              </View>
              <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 20, color: '#FFF', marginBottom: 4 }}>{specialNames[todaySpecial]}</Text>
              <Text style={{ fontFamily: 'SourceSerif4', fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 18 }}>{specialDesc[todaySpecial]}</Text>
            </View>
            <MaterialCommunityIcons name={specialIcons[todaySpecial] || 'star'} size={48} color="rgba(255,255,255,0.2)" />
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Bento Grid */}
      <Text style={[styles.sectionTitle, { marginBottom: 12 }, isDark && { color: theme.text.primary }]}>All Readings</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {gridItems.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={{
              width: (width - 56) / 2,
              backgroundColor: isDark ? 'rgba(22, 19, 41, 0.75)' : '#FFFFFF',
              borderRadius: 16,
              padding: 16,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: isDark ? 'rgba(168, 85, 247, 0.22)' : 'rgba(114, 111, 141, 0.08)',
              shadowColor: isDark ? '#000000' : '#726F8D',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isDark ? 0.2 : 0.04,
              shadowRadius: 8,
              elevation: 2,
              alignItems: 'center',
            }}
            activeOpacity={0.8}
            onPress={() => { haptic.press(); item.action(); }}
          >
            <View style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: item.color + '12',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 10,
            }}>
              <MaterialCommunityIcons name={item.icon as any} size={22} color={item.color} />
            </View>
            <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 12, color: isDark ? '#F0EEFF' : '#2C2B3D', textAlign: 'center' }}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Previous Readings History */}
      {readingHistory.length > 0 && (
        <View style={{ marginTop: 24 }}>
          <Text style={[styles.sectionTitle, { marginBottom: 12 }, isDark && { color: theme.text.primary }]}>Your Saved Readings & Scans</Text>
          {readingHistory.map((item: any, index: number) => (
            <View key={item._id || item.id || `history_${index}`} style={[styles.sensorCard, isDark && { backgroundColor: 'rgba(22, 19, 41, 0.75)', borderColor: 'rgba(168, 85, 247, 0.22)' }, { marginBottom: 12 }]}>
              <LinearGradient
                colors={isDark ? ['rgba(22, 19, 41, 0.85)', 'rgba(31, 27, 56, 0.80)'] : ['rgba(255, 255, 255, 0.95)', 'rgba(247, 245, 255, 0.9)']}
                style={[styles.sensorCardGradient, { padding: 14 }]}
              >
                <Sparkles size={20} color={isDark ? '#A855F7' : '#7209B7'} style={{ marginRight: 10 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 13, color: isDark ? '#F0EEFF' : '#2C2B3D' }}>
                    {item.category || 'Reading'} • {new Date(item.createdAt || item.created_at || Date.now()).toLocaleDateString()}
                  </Text>
                  <Text style={{ fontFamily: 'SourceSerif4', fontSize: 12, color: isDark ? '#9E9BB3' : '#726F8D', marginTop: 4 }} numberOfLines={2}>
                    {item.reading_data?.headline || item.headline || item.reading_data?.summary || item.summary || 'Scan analysis completed.'}
                  </Text>
                </View>
              </LinearGradient>
            </View>
          ))}
        </View>
      )}

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
  sectionTitle: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 16,
    color: '#2C2B3D',
  },
  heroCard: {
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#7209B7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },
  sensorCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(114, 111, 141, 0.1)',
    backgroundColor: '#FFFFFF',
    shadowColor: '#7209B7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sensorCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default ExploreScreen;
