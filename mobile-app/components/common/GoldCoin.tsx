import React from 'react';
import Svg, { Circle as SvgCircle, Path as SvgPath, Defs as SvgDefs, LinearGradient as SvgLinearGradient, Stop as SvgStop } from 'react-native-svg';

export const GoldCoin = ({ size = 18, style }: { size?: number; style?: any }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <SvgDefs>
      <SvgLinearGradient id="goldCoinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <SvgStop offset="0%" stopColor="#FFE066" />
        <SvgStop offset="50%" stopColor="#F5B041" />
        <SvgStop offset="100%" stopColor="#D4AC0D" />
      </SvgLinearGradient>
      <SvgLinearGradient id="goldCoinBorder" x1="0%" y1="0%" x2="100%" y2="100%">
        <SvgStop offset="0%" stopColor="#FFF59D" />
        <SvgStop offset="100%" stopColor="#B7950B" />
      </SvgLinearGradient>
    </SvgDefs>
    <SvgCircle cx="12" cy="12" r="10.5" fill="url(#goldCoinGrad)" stroke="url(#goldCoinBorder)" strokeWidth={1.2} />
    <SvgCircle cx="12" cy="12" r="8" fill="none" stroke="#FFFFFF" strokeOpacity="0.45" strokeWidth={0.8} />
    <SvgPath d="M12 6.8l1.5 3.2 3.5.5-2.5 2.5.6 3.5-3.1-1.6-3.1 1.6.6-3.5-2.5-2.5 3.5-.5z" fill="#6B4B00" opacity="0.9" />
  </Svg>
);

export default GoldCoin;
