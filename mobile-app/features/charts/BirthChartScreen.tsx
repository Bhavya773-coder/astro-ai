import React, { useState } from 'react';
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
import { Share2, Sparkles } from 'lucide-react-native';
import {
  RASHIS,
  RASHI_GLYPHS,
  PlanetMeta,
  VEDIC_BHAVAS,
  PLANET_VEDIC_META,
  getPlanetDignityBadge,
  getPlanetHouseInsight,
} from '../../constants/astrology';
import KundliDiamond from '../../components/charts/KundliDiamond';
import BirthChartWheel from '../../components/charts/BirthChartWheel';
import { useTheme } from '../../theme';

interface BirthChartScreenProps {
  userName: string;
  zodiac: any;
  zodiacIndex: number;
  apiBirthChart: any;
  insets: { bottom: number; top: number; left: number; right: number };
  triggerShareCard: (data: any) => void;
}

export function BirthChartScreen({
  userName,
  zodiac,
  zodiacIndex,
  apiBirthChart,
  insets,
  triggerShareCard,
}: BirthChartScreenProps) {
  const { theme, isDark } = useTheme();
  const { width } = Dimensions.get('window');
  const [chartsSubTab, setChartsSubTab] = useState<'birthChart' | 'kundli'>('birthChart');
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [selectedInterpretationTab, setSelectedInterpretationTab] = useState<string>('personality');

  const rashiToIndex: Record<string, number> = {
    Aries: 0, Taurus: 1, Gemini: 2, Cancer: 3, Leo: 4, Virgo: 5,
    Libra: 6, Scorpio: 7, Sagittarius: 8, Capricorn: 9, Aquarius: 10, Pisces: 11
  };

  const apiAscendantStr = apiBirthChart?.data?.chart_data?.ascendant || apiBirthChart?.chart_data?.ascendant;
  const ascIndex0 = apiAscendantStr && rashiToIndex[apiAscendantStr] !== undefined ? rashiToIndex[apiAscendantStr] : zodiacIndex;

  const birthDetails = apiBirthChart?.data?.birth_details || apiBirthChart?.birth_details || null;
  const chartData = apiBirthChart?.data?.chart_data || apiBirthChart?.chart_data || null;
  const interpretation = apiBirthChart?.data?.interpretation || apiBirthChart?.interpretation || null;
  const planetsObj: Record<string, any> = chartData?.planets || {};
  const housesObj: Record<string, string> = chartData?.houses || {};

  const getPlanetHouseNum = (pVal: any, signName: string): number => {
    if (pVal?.house !== undefined && !isNaN(Number(pVal.house))) {
      const h = Number(pVal.house);
      if (h >= 1 && h <= 12) return h;
    }
    const signIdx = rashiToIndex[signName] ?? 0;
    if (housesObj && Object.keys(housesObj).length > 0) {
      for (let h = 1; h <= 12; h++) {
        const hVal = housesObj[h.toString()] || housesObj[h];
        if (hVal === signName || (rashiToIndex[hVal] !== undefined && rashiToIndex[hVal] === signIdx)) {
          return h;
        }
      }
    }
    return ((signIdx - ascIndex0 + 12) % 12) + 1;
  };

  const svgPlanets = (() => {
    if (Object.keys(planetsObj).length === 0) {
      return [] as PlanetMeta[];
    }
    const PLANET_META: Record<string, { label: string; abbr: string; color: string }> = {
      sun: { label: 'Sun', abbr: 'SU', color: '#E8A200' },
      moon: { label: 'Moon', abbr: 'MO', color: '#5B8DEF' },
      mercury: { label: 'Mercury', abbr: 'ME', color: '#12A594' },
      venus: { label: 'Venus', abbr: 'VE', color: '#F72585' },
      mars: { label: 'Mars', abbr: 'MA', color: '#E5484D' },
      jupiter: { label: 'Jupiter', abbr: 'JU', color: '#D9730D' },
      saturn: { label: 'Saturn', abbr: 'SA', color: '#6E56CF' },
      rahu: { label: 'Rahu', abbr: 'RA', color: '#8B8B8B' },
      ketu: { label: 'Ketu', abbr: 'KE', color: '#8B8B8B' }
    };
    return Object.entries(planetsObj).map(([pKey, pVal]: [string, any]) => {
      const k = pKey.toLowerCase();
      const meta = PLANET_META[k] || { label: pKey, abbr: pKey.substring(0, 2).toUpperCase(), color: '#7209B7' };
      const signName = pVal?.sign || 'Aries';
      const houseNum = getPlanetHouseNum(pVal, signName);
      return {
        key: k, name: meta.label, san: meta.label, glyph: '', abbr: meta.abbr,
        theme: signName, house: houseNum,
        degree: pVal?.degree !== undefined ? pVal.degree % 30 : 15,
        retro: Boolean(pVal?.retro), color: meta.color
      };
    });
  })();

  const chartSize = width < 340 ? Math.min(width - 24, 400) : Math.min(width - 48, 400);
  const scrollPadding = width < 340 ? 12 : 20;
  const cardMargin = width < 340 ? 6 : 16;
  const carouselCardW = Math.round(width * 0.78);

  const houseOccupants: Record<number, Array<{ name: string; glyph: string; color: string }>> = {};
  for (let h = 1; h <= 12; h++) houseOccupants[h] = [];
  svgPlanets.forEach(p => {
    const meta = PLANET_VEDIC_META[p.key] || { glyph: '✦', color: '#7209B7' };
    if (houseOccupants[p.house]) {
      houseOccupants[p.house].push({ name: p.name, glyph: meta.glyph, color: meta.color });
    }
  });

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={[styles.tabScroll, { paddingHorizontal: scrollPadding }]}>
      <Text style={[styles.tabViewTitle, isDark && { color: '#F0EEFF' }]}>Astro Map</Text>

      {/* Segmented Control */}
      <View style={[styles.chartsSegmentContainer, isDark && { backgroundColor: 'rgba(22, 19, 41, 0.75)', borderColor: 'rgba(168, 85, 247, 0.25)' }, { marginHorizontal: cardMargin }]}>
        <TouchableOpacity
          style={[styles.chartsSegmentBtn, chartsSubTab === 'birthChart' && styles.chartsSegmentBtnActive]}
          onPress={() => { setChartsSubTab('birthChart'); setSelectedPlanet(null); }}
          activeOpacity={0.8}
        >
          <Text style={[styles.chartsSegmentText, isDark && { color: '#9E9BB3' }, chartsSubTab === 'birthChart' && styles.chartsSegmentTextActive]}>
            ☉ Birth Chart Wheel
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.chartsSegmentBtn, chartsSubTab === 'kundli' && styles.chartsSegmentBtnActive]}
          onPress={() => { setChartsSubTab('kundli'); setSelectedPlanet(null); }}
          activeOpacity={0.8}
        >
          <Text style={[styles.chartsSegmentText, isDark && { color: '#9E9BB3' }, chartsSubTab === 'kundli' && styles.chartsSegmentTextActive]}>
            ◇ Lagna Kundli
          </Text>
        </TouchableOpacity>
      </View>

      {/* Share Button */}
      <View style={{ marginHorizontal: cardMargin, marginBottom: 12 }}>
        <TouchableOpacity
          style={styles.shareCardTrigger}
          onPress={() => {
            triggerShareCard({
              category: chartsSubTab === 'birthChart' ? 'NATAL BIRTH CHART' : 'VEDIC LAGNA KUNDLI',
              title: `${userName}'s ${chartsSubTab === 'birthChart' ? 'Natal Chart' : 'Lagna Kundli'}`,
              subtitle: `Ascendant: ${chartData?.ascendant || 'Unavailable'} ${chartData?.ascendant ? RASHI_GLYPHS[ascIndex0] : ''}`,
              readingText: interpretation?.personality || interpretation?.summary || `Natal alignment indicates strong cosmic influence from ${chartData?.ascendant || 'Unavailable'} Ascendant and ${chartData?.nakshatra || 'Nakshatra'}.`,
              highlights: [
                { label: 'Ascendant', value: chartData?.ascendant || 'Unavailable' },
                { label: 'Sun Sign', value: chartData?.sun_sign || zodiac?.name || 'Unavailable' },
                { label: 'Moon Sign', value: chartData?.moon_sign || 'Unavailable' },
                { label: 'Nakshatra', value: chartData?.nakshatra || birthDetails?.nakshatra || 'Unavailable' },
              ],
            });
          }}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#D946EF', '#8B5CF6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.shareCardTriggerGradient}
          >
            <Share2 size={16} color="#FFFFFF" />
            <Text style={styles.shareCardTriggerText}>Share {chartsSubTab === 'birthChart' ? 'Birth Chart' : 'Kundli'} Card</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Chart Label */}
      <View style={[styles.amChartLabelRow, { marginHorizontal: cardMargin }]}>
        <Text style={[styles.amChartLabel, isDark && { color: '#F0EEFF' }]}>
          {chartsSubTab === 'birthChart' ? 'Western Natal Wheel' : 'North Indian (Lagna) Chart'}
        </Text>
        <Text style={[styles.amAscLabel, isDark && { color: '#A855F7' }]}>ASC: {chartData?.ascendant || RASHIS[ascIndex0]} {RASHI_GLYPHS[ascIndex0]}</Text>
      </View>

      {/* Chart / Kundli SVG */}
      <View style={[styles.amChartContainer, isDark && { backgroundColor: 'rgba(22, 19, 41, 0.75)', borderColor: 'rgba(168, 85, 247, 0.25)' }]}>
        {chartData ? (
          chartsSubTab === 'birthChart' ? (
            <BirthChartWheel size={chartSize} ascIndex0={ascIndex0} planets={svgPlanets} selectedKey={selectedPlanet} isDark={isDark} />
          ) : (
            <View style={{ alignItems: 'center' }}>
              <KundliDiamond size={chartSize} ascIndex0={ascIndex0} planets={svgPlanets} selectedKey={selectedPlanet} houses={housesObj} isDark={isDark} />
              <Text style={{ fontFamily: 'SourceSerif4', fontSize: 11, color: isDark ? '#9E9BB3' : '#726F8D', textAlign: 'center', marginTop: 8, marginHorizontal: 12 }}>
                ✦ <Text style={{ fontFamily: 'Cinzel-Bold', color: isDark ? '#A855F7' : '#7209B7' }}>H1–H12</Text> are fixed Vedic Houses. Numbers represent Zodiac Signs (1=Aries, 7=Libra).
              </Text>
            </View>
          )
        ) : (
          <View style={{ alignItems: 'center', justifyContent: 'center', minHeight: chartSize }}>
            <Text style={{ color: isDark ? '#9E9BB3' : '#726F8D', fontFamily: 'SourceSerif4', fontSize: 14 }}>Chart data unavailable</Text>
          </View>
        )}
      </View>

      {/* ── 1. Executive Dynamic AI Astrological Interpretation ── */}
      {interpretation && (
        <View style={{ marginBottom: 20 }}>
          <Text style={[styles.sectionTitle, isDark && { color: '#F0EEFF' }]}>AI Astrological Interpretation</Text>
          <View style={[styles.amInterpretationsCard, isDark && { backgroundColor: 'rgba(22, 19, 41, 0.75)', borderColor: 'rgba(168, 85, 247, 0.22)' }, { marginHorizontal: cardMargin }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.amInterpretationsTabsScroll}>
              {[
                { key: 'personality', label: 'Personality' },
                { key: 'career', label: 'Career & Wealth' },
                { key: 'relationships', label: 'Love & Karma' },
                { key: 'strengths', label: 'Superpowers' },
                { key: 'challenges', label: 'Growth Edges' },
                { key: 'health', label: 'Vitality' },
                { key: 'spiritual_path', label: 'Soul Dharma' },
              ].map(tab => {
                const isTabSelected = selectedInterpretationTab === tab.key;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    onPress={() => setSelectedInterpretationTab(tab.key)}
                    style={[styles.amInterpretationsTabBtn, isDark && { backgroundColor: 'rgba(168, 85, 247, 0.12)' }, isTabSelected && styles.amInterpretationsTabBtnActive]}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.amInterpretationsTabText, isDark && { color: '#9E9BB3' }, isTabSelected && styles.amInterpretationsTabTextActive]}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <View style={styles.amInterpretationsContent}>
              <Text style={[styles.amInterpretationsText, isDark && { color: '#F0EEFF' }]}>
                {interpretation[selectedInterpretationTab] || "Detailed insight available for this section."}
              </Text>

              <View style={{ backgroundColor: isDark ? 'rgba(168, 85, 247, 0.14)' : 'rgba(114, 9, 183, 0.05)', borderRadius: 12, padding: 12, marginTop: 14, borderWidth: 1, borderColor: isDark ? 'rgba(168, 85, 247, 0.25)' : 'rgba(114, 9, 183, 0.1)' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Sparkles size={13} color="#A855F7" style={{ marginRight: 5 }} />
                  <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 10, color: '#A855F7', letterSpacing: 0.5 }}>COSMIC TAKEAWAY</Text>
                </View>
                <Text style={{ fontFamily: 'SourceSerif4', fontSize: 12, color: isDark ? '#D1CEE2' : '#2C2B3D', fontStyle: 'italic', lineHeight: 18 }}>
                  Align your actions with your {chartData?.ascendant || 'Lagna'} Ascendant strengths while honoring the intuitive guidance of your {chartData?.moon_sign || 'Moon'} Moon.
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* ── 2. Planetary Positions & Dignity Deck ── */}
      <View style={{ marginBottom: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: cardMargin, marginBottom: 8 }}>
          <Text style={[styles.sectionTitle, isDark && { color: '#F0EEFF' }, { marginHorizontal: 0, marginBottom: 0 }]}>Planetary Positions</Text>
          <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 10, color: isDark ? '#A855F7' : '#726F8D', letterSpacing: 1 }}>SWIPE →</Text>
        </View>
        {Object.keys(planetsObj).length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={carouselCardW + 12}
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: cardMargin, paddingVertical: 4 }}
          >
            {Object.entries(planetsObj).map(([pName, pVal]: [string, any], pIdx: number) => {
              const k = pName.toLowerCase();
              const meta = PLANET_VEDIC_META[k] || { san: pName, deity: 'Celestial Body', nature: 'Planetary Force', color: '#7209B7', glyph: '✦' };
              const signName = pVal.sign || 'Aries';
              const signGlyph = RASHI_GLYPHS[rashiToIndex[signName] ?? 0] || '';
              const dignity = getPlanetDignityBadge(pName, signName);
              const houseNum = getPlanetHouseNum(pVal, signName);
              const houseInsight = getPlanetHouseInsight(pName, houseNum, signName);

              return (
                <View
                  key={pName}
                  style={{
                    width: carouselCardW,
                    backgroundColor: isDark ? 'rgba(22, 19, 41, 0.75)' : '#FFFFFF',
                    borderRadius: 20,
                    padding: 16,
                    marginRight: 12,
                    borderWidth: 1,
                    borderColor: isDark ? 'rgba(168, 85, 247, 0.22)' : 'rgba(114, 111, 141, 0.10)',
                    shadowColor: meta.color,
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: isDark ? 0.2 : 0.08,
                    shadowRadius: 8,
                    elevation: 2,
                    justifyContent: 'space-between'
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: `${meta.color}18`, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                        <Text style={{ fontSize: 20, color: meta.color }}>{meta.glyph}</Text>
                      </View>
                      <View>
                        <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 15, color: isDark ? '#F0EEFF' : '#2C2B3D' }}>
                          {pName.charAt(0).toUpperCase() + pName.slice(1)} • <Text style={{ color: isDark ? '#D1CEE2' : '#726F8D', fontFamily: 'SourceSerif4' }}>{meta.san}</Text>
                        </Text>
                        <Text style={{ fontFamily: 'SourceSerif4', fontSize: 11, color: isDark ? '#9E9BB3' : '#726F8D' }}>{meta.nature}</Text>
                      </View>
                    </View>

                    <View style={{ backgroundColor: dignity.bg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                      <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 10, color: dignity.color }}>{dignity.label}</Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: isDark ? 'rgba(168, 85, 247, 0.12)' : 'rgba(114, 9, 183, 0.03)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, marginBottom: 10 }}>
                    <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 12, color: isDark ? '#F0EEFF' : '#2C2B3D' }}>
                      {signName} {signGlyph} <Text style={{ fontFamily: 'SourceSerif4-Bold', color: isDark ? '#A855F7' : '#7209B7' }}>{pVal.degree}°</Text>
                    </Text>
                    <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 11, color: isDark ? '#A855F7' : '#7209B7' }}>
                      House {houseNum}
                    </Text>
                  </View>

                  <Text style={{ fontFamily: 'SourceSerif4', fontSize: 12.5, color: isDark ? '#F0EEFF' : '#555469', lineHeight: 18 }}>
                    {houseInsight}
                  </Text>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: isDark ? 'rgba(168, 85, 247, 0.15)' : 'rgba(114, 111, 141, 0.06)' }}>
                    <Text style={{ fontFamily: 'SourceSerif4', fontSize: 10, color: isDark ? '#9E9BB3' : '#726F8D' }}>Planet {pIdx + 1} of {Object.keys(planetsObj).length}</Text>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: meta.color }} />
                  </View>
                </View>
              );
            })}
          </ScrollView>
        ) : (
          <View style={[styles.astroGridCard, isDark && { backgroundColor: 'rgba(22, 19, 41, 0.75)', borderColor: 'rgba(168, 85, 247, 0.2)' }, { marginHorizontal: cardMargin, alignItems: 'center', paddingVertical: 24 }]}>
            <Text style={{ color: isDark ? '#9E9BB3' : '#999', fontSize: 14 }}>Loading planetary positions...</Text>
          </View>
        )}
      </View>

      {/* ── 3. 12 Bhavas (House Matrix) ── */}
      <View style={{ marginBottom: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: cardMargin, marginBottom: 8 }}>
          <Text style={[styles.sectionTitle, isDark && { color: theme.text.primary }, { marginHorizontal: 0, marginBottom: 0 }]}>12 Bhavas (Houses)</Text>
          <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 10, color: isDark ? '#9E9BB3' : '#726F8D', letterSpacing: 1 }}>SWIPE →</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={carouselCardW + 12}
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: cardMargin, paddingVertical: 4 }}
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => {
            const bhava = VEDIC_BHAVAS[h];
            const sign = housesObj[h.toString()] || housesObj[h] || RASHIS[(ascIndex0 + h - 1) % 12];
            const signIdx = rashiToIndex[sign] ?? ((ascIndex0 + h - 1) % 12);
            const occupants = houseOccupants[h] || [];

            return (
              <View
                key={h}
                style={{
                  width: carouselCardW,
                  backgroundColor: isDark ? 'rgba(22, 19, 41, 0.75)' : '#FFFFFF',
                  borderRadius: 20,
                  padding: 16,
                  marginRight: 12,
                  borderWidth: 1,
                  borderColor: isDark ? 'rgba(168, 85, 247, 0.22)' : 'rgba(114, 111, 141, 0.08)',
                  shadowColor: isDark ? '#000000' : '#7209B7',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isDark ? 0.25 : 0.05,
                  shadowRadius: 6,
                  elevation: 2,
                  justifyContent: 'space-between'
                }}
              >
                <View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: isDark ? 'rgba(168, 85, 247, 0.18)' : 'rgba(114, 9, 183, 0.08)', alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                        <MaterialCommunityIcons name={bhava.icon as any} size={18} color={isDark ? '#A855F7' : '#7209B7'} />
                      </View>
                      <View>
                        <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 14, color: isDark ? '#F0EEFF' : '#2C2B3D' }}>
                          House {h}: {bhava.sanskrit}
                        </Text>
                        <Text style={{ fontFamily: 'SourceSerif4-Bold', fontSize: 11, color: isDark ? '#A855F7' : '#7209B7' }}>{bhava.title}</Text>
                      </View>
                    </View>
                    <View style={{ backgroundColor: isDark ? 'rgba(168, 85, 247, 0.15)' : 'rgba(114, 9, 183, 0.06)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                      <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 11, color: isDark ? '#F0EEFF' : '#2C2B3D' }}>
                        {sign} {RASHI_GLYPHS[signIdx]}
                      </Text>
                    </View>
                  </View>

                  <Text style={{ fontFamily: 'SourceSerif4', fontSize: 12, color: isDark ? '#9E9BB3' : '#726F8D', lineHeight: 17 }}>
                    {bhava.domain}
                  </Text>
                </View>

                <View style={{ marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: isDark ? 'rgba(168, 85, 247, 0.12)' : 'rgba(114, 9, 183, 0.05)' }}>
                  {occupants.length > 0 ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 9.5, color: isDark ? '#A855F7' : '#7209B7' }}>OCCUPANTS:</Text>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                        {occupants.map((occ, oIdx) => (
                          <View key={oIdx} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: `${occ.color}18`, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                            <Text style={{ fontSize: 10, color: occ.color, marginRight: 2 }}>{occ.glyph}</Text>
                            <Text style={{ fontFamily: 'SourceSerif4-Bold', fontSize: 10, color: occ.color }}>{occ.name}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  ) : (
                    <Text style={{ fontFamily: 'SourceSerif4', fontSize: 10.5, color: isDark ? '#726F8D' : '#A09FB1', fontStyle: 'italic' }}>
                      No direct planetary occupants
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* ── 4. Important Yogas ── */}
      {interpretation?.important_yogas && interpretation.important_yogas.length > 0 && (
        <View style={{ marginBottom: 20 }}>
          <Text style={[styles.sectionTitle, isDark && { color: theme.text.primary }]}>Auspicious Yogas</Text>
          <View style={[styles.amYogasCard, isDark && { backgroundColor: 'rgba(22, 19, 41, 0.75)', borderColor: 'rgba(168, 85, 247, 0.22)' }, { marginHorizontal: cardMargin }]}>
            {interpretation.important_yogas.map((yoga: any, idx: number) => (
              <View key={idx} style={[styles.amYogaItem, isDark && { borderBottomColor: 'rgba(168, 85, 247, 0.12)' }, idx === interpretation.important_yogas.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Sparkles size={14} color={isDark ? '#A855F7' : '#7209B7'} style={{ marginRight: 6 }} />
                  <Text style={[styles.amYogaName, isDark && { color: '#A855F7' }]}>{typeof yoga === 'string' ? yoga : (yoga.name || yoga.title || 'Yoga')}</Text>
                </View>
                {typeof yoga !== 'string' && (yoga.description || yoga.desc) && (
                  <Text style={[styles.amYogaDesc, isDark && { color: '#D1CEE2' }]}>{yoga.description || yoga.desc}</Text>
                )}
              </View>
            ))}
          </View>
        </View>
      )}

      {/* ── 5. Celestial Trinity & Coordinates ── */}
      <Text style={[styles.sectionTitle, isDark && { color: theme.text.primary }]}>Celestial Trinity & Coordinates</Text>
      <View style={[styles.astroGridCard, isDark && { backgroundColor: 'rgba(22, 19, 41, 0.75)', borderColor: 'rgba(168, 85, 247, 0.22)' }, { marginHorizontal: cardMargin, padding: 18, marginBottom: 20 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: isDark ? 'rgba(168, 85, 247, 0.15)' : 'rgba(114, 9, 183, 0.08)', paddingBottom: 12, marginBottom: 14 }}>
          <View>
            <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 15, color: isDark ? '#F0EEFF' : '#2C2B3D' }}>{birthDetails?.full_name || userName}</Text>
            <Text style={{ fontFamily: 'SourceSerif4', fontSize: 12, color: isDark ? '#9E9BB3' : '#726F8D', marginTop: 2 }}>
              {birthDetails?.date_of_birth} • {birthDetails?.time_of_birth || 'Birth Time Verified'}
            </Text>
          </View>
          <View style={{ backgroundColor: isDark ? 'rgba(168, 85, 247, 0.18)' : 'rgba(114, 9, 183, 0.08)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 }}>
            <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 10.5, color: isDark ? '#A855F7' : '#7209B7' }}>{birthDetails?.place_of_birth || 'Earth'}</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <View style={{ width: '48%', backgroundColor: isDark ? 'rgba(31, 27, 56, 0.80)' : 'rgba(114, 9, 183, 0.04)', borderRadius: 14, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: isDark ? 'rgba(168, 85, 247, 0.18)' : 'transparent' }}>
            <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 9, color: isDark ? '#A855F7' : '#7209B7', letterSpacing: 1 }}>ASCENDANT (LAGNA)</Text>
            <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 15, color: isDark ? '#F0EEFF' : '#2C2B3D', marginTop: 4 }}>
              {chartData?.ascendant || 'Aries'} {chartData?.ascendant ? RASHI_GLYPHS[rashiToIndex[chartData.ascendant] ?? 0] : '♈'}
            </Text>
            <Text style={{ fontFamily: 'SourceSerif4', fontSize: 11, color: isDark ? '#9E9BB3' : '#726F8D', marginTop: 2 }}>Core Soul Mask & Aura</Text>
          </View>

          <View style={{ width: '48%', backgroundColor: isDark ? 'rgba(31, 27, 56, 0.80)' : 'rgba(232, 162, 0, 0.06)', borderRadius: 14, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: isDark ? 'rgba(217, 115, 13, 0.25)' : 'transparent' }}>
            <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 9, color: '#FBBF24', letterSpacing: 1 }}>SUN SIGN (SURYA)</Text>
            <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 15, color: isDark ? '#F0EEFF' : '#2C2B3D', marginTop: 4 }}>
              {chartData?.sun_sign || zodiac?.name || 'Leo'} {chartData?.sun_sign ? RASHI_GLYPHS[rashiToIndex[chartData.sun_sign] ?? 0] : '♌'}
            </Text>
            <Text style={{ fontFamily: 'SourceSerif4', fontSize: 11, color: isDark ? '#9E9BB3' : '#726F8D', marginTop: 2 }}>Vitality & Soul Mission</Text>
          </View>

          <View style={{ width: '48%', backgroundColor: isDark ? 'rgba(31, 27, 56, 0.80)' : 'rgba(91, 141, 239, 0.06)', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: isDark ? 'rgba(96, 165, 250, 0.25)' : 'transparent' }}>
            <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 9, color: '#60A5FA', letterSpacing: 1 }}>MOON SIGN (CHANDRA)</Text>
            <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 15, color: isDark ? '#F0EEFF' : '#2C2B3D', marginTop: 4 }}>
              {chartData?.moon_sign || 'Taurus'} {chartData?.moon_sign ? RASHI_GLYPHS[rashiToIndex[chartData.moon_sign] ?? 0] : '♉'}
            </Text>
            <Text style={{ fontFamily: 'SourceSerif4', fontSize: 11, color: isDark ? '#9E9BB3' : '#726F8D', marginTop: 2 }}>Inner Mind & Emotions</Text>
          </View>

          <View style={{ width: '48%', backgroundColor: isDark ? 'rgba(31, 27, 56, 0.80)' : 'rgba(247, 37, 133, 0.06)', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: isDark ? 'rgba(247, 37, 133, 0.25)' : 'transparent' }}>
            <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 9, color: '#F72585', letterSpacing: 1 }}>NAKSHATRA & PADA</Text>
            <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 14, color: isDark ? '#F0EEFF' : '#2C2B3D', marginTop: 4 }} numberOfLines={1}>
              {chartData?.nakshatra || 'Ashwini'} {chartData?.nakshatra_pada ? `(Pada ${chartData.nakshatra_pada})` : ''}
            </Text>
            <Text style={{ fontFamily: 'SourceSerif4', fontSize: 11, color: isDark ? '#9E9BB3' : '#726F8D', marginTop: 2 }}>Lunar Mansion & Quarter</Text>
          </View>
        </View>

        {/* ── Vimshottari Dasha Timeline Banner ── */}
        {chartData?.vimshottari_dasha && (
          <View style={{ marginTop: 12, backgroundColor: isDark ? 'rgba(31, 27, 56, 0.80)' : 'rgba(114, 9, 183, 0.06)', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: isDark ? 'rgba(168, 85, 247, 0.25)' : 'rgba(114, 9, 183, 0.12)' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Sparkles size={14} color={isDark ? '#A855F7' : '#7209B7'} style={{ marginRight: 6 }} />
                <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 11, color: isDark ? '#A855F7' : '#7209B7', letterSpacing: 0.8 }}>
                  ACTIVE VIMSHOTTARI DASHA
                </Text>
              </View>
              <View style={{ backgroundColor: isDark ? '#A855F7' : '#7209B7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 9, color: '#FFFFFF' }}>120-YR CYCLE</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 6 }}>
              <Text style={{ fontFamily: 'Cinzel-Bold', fontSize: 15, color: isDark ? '#F0EEFF' : '#2C2B3D' }}>
                {chartData.vimshottari_dasha.current_mahadasha} Mahadasha
              </Text>
              <Text style={{ fontFamily: 'SourceSerif4-Bold', fontSize: 12, color: isDark ? '#A855F7' : '#7209B7' }}>
                {chartData.vimshottari_dasha.current_mahadasha_period}
              </Text>
            </View>
            <Text style={{ fontFamily: 'SourceSerif4', fontSize: 11, color: isDark ? '#9E9BB3' : '#555469', marginTop: 4 }}>
              Birth Balance: {chartData.vimshottari_dasha.balance_years_at_birth} yrs of {chartData.vimshottari_dasha.starting_mahadasha}
            </Text>
          </View>
        )}
      </View>

      <View style={{ height: 100 + insets.bottom }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tabScroll: {
    flex: 1,
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
    fontSize: 17,
    color: '#2C2B3D',
    marginBottom: 12,
    marginTop: 6,
  },
  chartsSegmentContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(114, 9, 183, 0.08)',
    borderRadius: 16,
    padding: 4,
    marginBottom: 14,
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
    shadowColor: '#7209B7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  chartsSegmentText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 12,
    color: '#7209B7',
  },
  chartsSegmentTextActive: {
    color: '#FFFFFF',
  },
  shareCardTrigger: {
    borderRadius: 14,
    overflow: 'hidden',
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
  amChartLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  amChartLabel: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 13,
    color: '#2C2B3D',
  },
  amAscLabel: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 12,
    color: '#7209B7',
  },
  amChartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  amInterpretationsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(114, 111, 141, 0.10)',
    overflow: 'hidden',
    shadowColor: '#7209B7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  amInterpretationsTabsScroll: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(114, 111, 141, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  amInterpretationsTabBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 6,
  },
  amInterpretationsTabBtnActive: {
    backgroundColor: '#7209B7',
  },
  amInterpretationsTabText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 11.5,
    color: '#726F8D',
  },
  amInterpretationsTabTextActive: {
    color: '#FFFFFF',
  },
  amInterpretationsContent: {
    padding: 16,
  },
  amInterpretationsText: {
    fontFamily: 'SourceSerif4',
    fontSize: 13.5,
    color: '#2C2B3D',
    lineHeight: 21,
  },
  astroGridCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(114, 111, 141, 0.10)',
    shadowColor: '#2C2B3D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  amYogasCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(114, 111, 141, 0.10)',
    shadowColor: '#7209B7',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  amYogaItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(114, 9, 183, 0.06)',
  },
  amYogaName: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 13,
    color: '#7209B7',
  },
  amYogaDesc: {
    fontFamily: 'SourceSerif4',
    fontSize: 12,
    color: '#555469',
    lineHeight: 17,
    marginTop: 2,
  },
});

export default BirthChartScreen;
