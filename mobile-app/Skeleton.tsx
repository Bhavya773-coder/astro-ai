import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

export function Skeleton({ width, height, style }: { width: number | string; height: number; style?: any }) {
  const pulse = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return (
    <Animated.View
      style={[
        { width, height, backgroundColor: '#E8E7ED', borderRadius: 8, opacity: pulse },
        style,
      ]}
    />
  );
}
