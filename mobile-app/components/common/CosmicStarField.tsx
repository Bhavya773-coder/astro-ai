import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Star {
  x: number;
  y: number;
  r: number;
  opacity: number;
  color: string;
  isSparkle?: boolean;
}

export function CosmicStarField({ count = 65 }: { count?: number }) {
  const stars = useMemo(() => {
    const starList: Star[] = [];

    // Deterministic pseudo-random distribution for stable render
    for (let i = 0; i < count; i++) {
      const seed1 = Math.sin(i * 997.1) * 10000;
      const seed2 = Math.cos(i * 331.7) * 10000;
      const seed3 = Math.sin(i * 557.3) * 10000;
      const x = Math.abs(seed1 - Math.floor(seed1)) * SCREEN_WIDTH;
      const y = Math.abs(seed2 - Math.floor(seed2)) * SCREEN_HEIGHT;
      const r = (Math.abs(seed3 - Math.floor(seed3)) * 1.5) + 0.6;
      const opacity = (Math.abs(Math.sin(i * 43.1)) * 0.6) + 0.3;
      const isSparkle = i % 12 === 0;

      starList.push({ x, y, r, opacity, color: '#FFFFFF', isSparkle });
    }
    return starList;
  }, [count]);

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <Svg width={SCREEN_WIDTH} height={SCREEN_HEIGHT} style={StyleSheet.absoluteFillObject}>
        {stars.map((st, idx) => (
          st.isSparkle ? (
            <SvgText
              key={idx}
              x={st.x}
              y={st.y}
              fontSize={st.r * 5 + 4}
              fill={st.color}
              opacity={st.opacity + 0.2}
              textAnchor="middle"
            >
              ✦
            </SvgText>
          ) : (
            <Circle
              key={idx}
              cx={st.x}
              cy={st.y}
              r={st.r}
              fill={st.color}
              opacity={st.opacity}
            />
          )
        ))}
      </Svg>
    </View>
  );
}

export default CosmicStarField;
