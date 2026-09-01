import React from 'react';
import Svg, {
  Line as SvgLine, Circle as SvgCircle, Path as SvgPath, G as SvgG, Text as SvgTextEl,
  Defs as SvgDefs, Polygon as SvgPolygon, RadialGradient as SvgRadialGradient, LinearGradient as SvgLinearGradient, Stop as SvgStop
} from 'react-native-svg';
import { RASHI_GLYPHS, SIGN_ELEMENT, signForHouse, PlanetMeta } from '../../constants/astrology';
import { useTheme } from '../../theme';

const ELEMENT_BAND_COLORS: Record<string, string> = {
  Fire: '#E5484D', Earth: '#12A594', Air: '#5B8DEF', Water: '#6E56CF',
};

const ASPECT_DEFS = [
  { name: 'conjunction', angle: 0, orb: 8, color: '#E8A200', dash: '' },
  { name: 'sextile', angle: 60, orb: 6, color: '#12A594', dash: '4,3' },
  { name: 'square', angle: 90, orb: 8, color: '#E5484D', dash: '' },
  { name: 'trine', angle: 120, orb: 8, color: '#5B8DEF', dash: '' },
  { name: 'opposition', angle: 180, orb: 8, color: '#E5484D', dash: '6,3' },
];

function renderPlanet2DShapes(planetKey: string, color: string) {
  const strokeW = 1.6;
  switch (planetKey) {
    case 'sun':
      return (
        <SvgG>
          <SvgCircle cx={0} cy={0} r={4.2} stroke={color} strokeWidth={strokeW} fill="none" />
          <SvgCircle cx={0} cy={0} r={1.2} fill={color} />
        </SvgG>
      );
    case 'moon':
      return (
        <SvgPath d="M 1.8 -4 C -2.2 -4 -2.2 4 1.8 4 C 0.3 2.5 0.3 -2.5 1.8 -4 Z" fill={color} />
      );
    case 'mars':
      return (
        <SvgG>
          <SvgCircle cx={-1.2} cy={1.2} r={3.2} stroke={color} strokeWidth={strokeW} fill="none" />
          <SvgPath d="M 1 -1 L 3.8 -3.8 M 1.8 -3.8 L 3.8 -3.8 L 3.8 -1.8" stroke={color} strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </SvgG>
      );
    case 'mercury':
      return (
        <SvgG>
          <SvgCircle cx={0} cy={0.5} r={2.8} stroke={color} strokeWidth={strokeW} fill="none" />
          <SvgLine x1={0} y1={3.3} x2={0} y2={5.8} stroke={color} strokeWidth={strokeW} strokeLinecap="round" />
          <SvgLine x1={-1.8} y1={4.5} x2={1.8} y2={4.5} stroke={color} strokeWidth={strokeW} strokeLinecap="round" />
          <SvgPath d="M -2.8 -3.2 C -2.8 -1.5 2.8 -1.5 2.8 -3.2" stroke={color} strokeWidth={strokeW} strokeLinecap="round" fill="none" />
        </SvgG>
      );
    case 'jupiter':
      return (
        <SvgPath d="M -2.5 -2.2 C -2.5 -3.7 -1 -4.5 0.5 -4.5 C 2 -4.5 2 -2.5 1 -1.5 L -3.2 3 L 3.2 3 M 0.8 -3 L 0.8 4.5" stroke={color} strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      );
    case 'venus':
      return (
        <SvgG>
          <SvgCircle cx={0} cy={-1.5} r={3.0} stroke={color} strokeWidth={strokeW} fill="none" />
          <SvgLine x1={0} y1={1.5} x2={0} y2={5.0} stroke={color} strokeWidth={strokeW} strokeLinecap="round" />
          <SvgLine x1={-2} y1={3.2} x2={2} y2={3.2} stroke={color} strokeWidth={strokeW} strokeLinecap="round" />
        </SvgG>
      );
    case 'saturn':
      return (
        <SvgPath d="M -1.8 -4.5 L -1.8 1.5 C -1.8 3.5 -3.2 3.5 -3.6 3.5 M -3.2 -2.2 L 0.5 -2.2 M -1.8 0.5 C 0.5 0.5 1.8 2 1.8 3.5 C 1.8 5 0.2 5 -0.8 5" stroke={color} strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      );
    case 'rahu':
      return (
        <SvgG>
          <SvgCircle cx={-2.5} cy={2.5} r={1.5} stroke={color} strokeWidth={strokeW} fill="none" />
          <SvgCircle cx={2.5} cy={2.5} r={1.5} stroke={color} strokeWidth={strokeW} fill="none" />
          <SvgPath d="M -2.5 1 C -2.5 -2.2 2.5 -2.2 2.5 1" stroke={color} strokeWidth={strokeW} strokeLinecap="round" fill="none" />
        </SvgG>
      );
    case 'ketu':
      return (
        <SvgG>
          <SvgCircle cx={-2.5} cy={-2.5} r={1.5} stroke={color} strokeWidth={strokeW} fill="none" />
          <SvgCircle cx={2.5} cy={-2.5} r={1.5} stroke={color} strokeWidth={strokeW} fill="none" />
          <SvgPath d="M -2.5 -1 C -2.5 2.2 2.5 2.2 2.5 -1" stroke={color} strokeWidth={strokeW} strokeLinecap="round" fill="none" />
        </SvgG>
      );
    default:
      return null;
  }
}

export function BirthChartWheel({ size, ascIndex0, planets, selectedKey, isDark: propIsDark }: {
  size: number; ascIndex0: number; planets: PlanetMeta[]; selectedKey: string | null; isDark?: boolean;
}) {
  const { isDark: contextIsDark } = useTheme();
  const isDark = propIsDark !== undefined ? propIsDark : contextIsDark;
  const cx = size / 2, cy = size / 2;
  const pad = 4;
  const rOuter = size / 2 - pad;
  const rZodiacInner = rOuter * 0.80;
  const rHouseBand = rZodiacInner - 2;
  const rHouseInner = rHouseBand - (rOuter * 0.15);
  const rPlanetRing = rHouseInner - (rOuter * 0.08);
  const rAspectArea = rPlanetRing - (rOuter * 0.13);
  const rHub = rOuter * 0.115;
  const ascOffset = -15;

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toXY = (angleDeg: number, r: number) => {
    const rad = toRad(angleDeg);
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const arcPath = (a1: number, a2: number, rIn: number, rOut: number) => {
    const p1o = toXY(a1, rOut);
    const p2o = toXY(a2, rOut);
    const p1i = toXY(a1, rIn);
    const p2i = toXY(a2, rIn);
    const large = (a2 - a1) > 180 ? 1 : 0;
    return `M ${p1o.x} ${p1o.y} A ${rOut} ${rOut} 0 ${large} 1 ${p2o.x} ${p2o.y} L ${p2i.x} ${p2i.y} A ${rIn} ${rIn} 0 ${large} 0 ${p1i.x} ${p1i.y} Z`;
  };

  const rashiToIndex: Record<string, number> = {
    Aries: 0, Taurus: 1, Gemini: 2, Cancer: 3, Leo: 4, Virgo: 5,
    Libra: 6, Scorpio: 7, Sagittarius: 8, Capricorn: 9, Aquarius: 10, Pisces: 11
  };

  const planetLongitudes = planets.map(p => {
    const signIdx = p.theme && rashiToIndex[p.theme] !== undefined ? rashiToIndex[p.theme] : signForHouse(ascIndex0, p.house);
    return { ...p, longitude: signIdx * 30 + (p.degree !== undefined ? p.degree : 15) };
  });

  const lonToAngle = (lon: number) => (lon + ascOffset) % 360;

  const aspects: { p1: string; p2: string; a1: number; a2: number; color: string; dash: string }[] = [];
  for (let i = 0; i < planetLongitudes.length; i++) {
    for (let j = i + 1; j < planetLongitudes.length; j++) {
      const diff = Math.abs(planetLongitudes[i].longitude - planetLongitudes[j].longitude);
      const normalDiff = diff > 180 ? 360 - diff : diff;
      for (const asp of ASPECT_DEFS) {
        if (Math.abs(normalDiff - asp.angle) <= asp.orb) {
          aspects.push({
            p1: planetLongitudes[i].key,
            p2: planetLongitudes[j].key,
            a1: lonToAngle(planetLongitudes[i].longitude),
            a2: lonToAngle(planetLongitudes[j].longitude),
            color: asp.color,
            dash: asp.dash,
          });
          break;
        }
      }
    }
  }

  return (
    <Svg width={size} height={size}>
      <SvgDefs>
        <SvgRadialGradient id="cosmicBg" cx="50%" cy="50%" rx="50%" ry="50%">
          <SvgStop offset="0%" stopColor={isDark ? "#161329" : "#FFFFFF"} stopOpacity={1} />
          <SvgStop offset="65%" stopColor={isDark ? "#120E24" : "#F6F4FF"} stopOpacity={1} />
          <SvgStop offset="100%" stopColor={isDark ? "#090714" : "#ECE8FF"} stopOpacity={isDark ? 0.95 : 0.85} />
        </SvgRadialGradient>
        <SvgLinearGradient id="hubGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <SvgStop offset="0%" stopColor="#7209B7" />
          <SvgStop offset="100%" stopColor="#F72585" />
        </SvgLinearGradient>
      </SvgDefs>

      <SvgCircle cx={cx} cy={cy} r={rOuter} fill={isDark ? "#120E24" : "#FAFAFE"} stroke="none" />
      <SvgCircle cx={cx} cy={cy} r={rZodiacInner} fill="url(#cosmicBg)" stroke="none" />

      {Array.from({ length: 12 }).map((_, i) => {
        const startAngle = i * 30 + ascOffset;
        const endAngle = startAngle + 30;
        const element = SIGN_ELEMENT[i];
        const fillColor = ELEMENT_BAND_COLORS[element] + '18';
        const strokeColor = ELEMENT_BAND_COLORS[element] + '40';
        return (
          <SvgPath
            key={`zband-${i}`}
            d={arcPath(startAngle, endAngle, rZodiacInner, rOuter)}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={0.5}
          />
        );
      })}

      <SvgCircle cx={cx} cy={cy} r={rOuter} fill="none" stroke={isDark ? "#A855F7" : "#7209B7"} strokeWidth={1.5} />
      <SvgCircle cx={cx} cy={cy} r={rZodiacInner} fill="none" stroke={isDark ? "rgba(168, 85, 247, 0.4)" : "rgba(114,9,183,0.3)"} strokeWidth={1} />

      {Array.from({ length: 360 / 5 }).map((_, i) => {
        const angle = i * 5 + ascOffset;
        const isMajor = i % 6 === 0;
        const rTickOuter = rOuter;
        const rTickInner = isMajor ? rZodiacInner : rOuter - (i % 2 === 0 ? Math.max(4, rOuter * 0.04) : Math.max(2, rOuter * 0.02));
        const p1 = toXY(angle, rTickOuter);
        const p2 = toXY(angle, rTickInner);
        return (
          <SvgLine
            key={`tick-${i}`}
            x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
            stroke={isMajor ? (isDark ? '#A855F7' : '#7209B7') : (isDark ? 'rgba(168, 85, 247, 0.25)' : 'rgba(114,9,183,0.2)')}
            strokeWidth={isMajor ? 1 : 0.5}
          />
        );
      })}

      {Array.from({ length: 12 }).map((_, i) => {
        const center = i * 30 + 15 + ascOffset;
        const pos = toXY(center, (rOuter + rZodiacInner) / 2);
        const isAsc = i === ascIndex0;
        return (
          <SvgTextEl
            key={`sign-${i}`}
            x={pos.x}
            y={pos.y + (rOuter * 0.035)}
            fontSize={Math.max(16, rOuter * 0.115)}
            fill={isAsc ? (isDark ? '#FBBF24' : '#7209B7') : ELEMENT_BAND_COLORS[SIGN_ELEMENT[i]]}
            textAnchor="middle"
            fontWeight={isAsc ? 'bold' : 'normal'}
          >
            {RASHI_GLYPHS[i]}
          </SvgTextEl>
        );
      })}

      <SvgCircle cx={cx} cy={cy} r={rHouseInner} fill="none" stroke={isDark ? "rgba(168, 85, 247, 0.2)" : "rgba(114,9,183,0.12)"} strokeWidth={0.5} />
      <SvgCircle cx={cx} cy={cy} r={rHub * 1.6} fill="none" stroke={isDark ? "rgba(168, 85, 247, 0.1)" : "rgba(114,9,183,0.06)"} strokeWidth={0.6} />
      <SvgCircle cx={cx} cy={cy} r={rHub * 2.3} fill="none" stroke={isDark ? "rgba(168, 85, 247, 0.08)" : "rgba(114,9,183,0.05)"} strokeWidth={0.6} strokeDasharray="3,3" />
      <SvgCircle cx={cx} cy={cy} r={rHub * 3.1} fill="none" stroke={isDark ? "rgba(168, 85, 247, 0.1)" : "rgba(114,9,183,0.06)"} strokeWidth={0.6} />

      {Array.from({ length: 12 }).map((_, i) => {
        const angle = i * 30 + ascOffset;
        const p1 = toXY(angle, rZodiacInner);
        const p2 = toXY(angle, rHouseInner);
        return (
          <SvgLine
            key={`cusp-${i}`}
            x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
            stroke={isDark ? "rgba(168, 85, 247, 0.25)" : "rgba(114,9,183,0.15)"}
            strokeWidth={0.75}
          />
        );
      })}

      {Array.from({ length: 12 }).map((_, i) => {
        const houseNum = i + 1;
        const signIdx = signForHouse(ascIndex0, houseNum);
        const center = signIdx * 30 + 15 + ascOffset;
        const pos = toXY(center, (rHouseBand + rHouseInner) / 2);
        return (
          <SvgTextEl
            key={`hnum-${i}`}
            x={pos.x}
            y={pos.y + (rOuter * 0.02)}
            fontSize={Math.max(8, rOuter * 0.055)}
            fill={isDark ? "#D1CEE2" : "#B3A2E7"}
            textAnchor="middle"
            fontWeight="bold"
          >
            {houseNum}
          </SvgTextEl>
        );
      })}

      {aspects.map((asp, idx) => {
        const p1 = toXY(asp.a1, rAspectArea);
        const p2 = toXY(asp.a2, rAspectArea);
        const isHighlighted = selectedKey && (asp.p1 === selectedKey || asp.p2 === selectedKey);
        return (
          <SvgLine
            key={`asp-${idx}`}
            x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
            stroke={asp.color}
            strokeWidth={isHighlighted ? Math.max(2.5, rOuter * 0.018) : Math.max(1.2, rOuter * 0.009)}
            strokeDasharray={asp.dash || undefined}
            opacity={isHighlighted ? 0.95 : (isDark ? 0.65 : 0.45)}
          />
        );
      })}

      {planetLongitudes.map((p) => {
        const angle = lonToAngle(p.longitude);
        const pos = toXY(angle, rPlanetRing);
        const sel = selectedKey === p.key;
        const radiusBg = Math.max(8, rOuter * 0.055);
        const radiusSel = Math.max(12, rOuter * 0.08);
        return (
          <SvgG key={`pl-${p.key}`}>
            {sel && (
              <SvgCircle
                cx={pos.x} cy={pos.y} r={radiusSel}
                fill="rgba(247,37,133,0.18)"
                stroke="#F72585"
                strokeWidth={Math.max(1, rOuter * 0.008)}
              />
            )}
            <SvgCircle
              cx={pos.x} cy={pos.y} r={radiusBg * 1.35}
              fill="none"
              stroke={p.color + '33'}
              strokeWidth={0.75}
            />
            <SvgCircle
              cx={pos.x} cy={pos.y} r={radiusBg}
              fill={isDark ? "#1F1B38" : "#FFFFFF"}
              stroke={sel ? '#F72585' : p.color}
              strokeWidth={sel ? Math.max(1.5, rOuter * 0.01) : Math.max(1, rOuter * 0.006)}
            />
            <SvgG transform={`translate(${pos.x} ${pos.y}) scale(${radiusBg / 7.5})`}>
              {renderPlanet2DShapes(p.key, p.color)}
            </SvgG>
          </SvgG>
        );
      })}

      {(() => {
        const ascAngle = ascIndex0 * 30 + 15 + ascOffset;
        const arrowOffset = rOuter * 0.015;
        const arrowTipLen = rOuter * 0.04;
        const ascTip = toXY(ascAngle, rZodiacInner - arrowTipLen);
        const aLeft = toXY(ascAngle - 3, rZodiacInner + arrowOffset);
        const aRight = toXY(ascAngle + 3, rZodiacInner + arrowOffset);
        const labelOffset = rOuter * 0.08;
        return (
          <SvgG>
            <SvgPolygon
              points={`${ascTip.x},${ascTip.y} ${aLeft.x},${aLeft.y} ${aRight.x},${aRight.y}`}
              fill="#F72585"
            />
            <SvgTextEl
              x={toXY(ascAngle, rZodiacInner - labelOffset).x}
              y={toXY(ascAngle, rZodiacInner - labelOffset).y + (rOuter * 0.02)}
              fontSize={Math.max(7, rOuter * 0.05)}
              fill="#F72585"
              textAnchor="middle"
              fontWeight="bold"
            >
              ASC
            </SvgTextEl>
          </SvgG>
        );
      })()}

      {(() => {
        const hubR = rOuter * 0.135;
        return (
          <SvgG>
            <SvgCircle cx={cx} cy={cy} r={hubR * 1.3} fill={isDark ? "rgba(168,85,247,0.08)" : "rgba(114,9,183,0.04)"} stroke={isDark ? "rgba(168,85,247,0.25)" : "rgba(114,9,183,0.12)"} strokeWidth={1} />
            <SvgCircle cx={cx} cy={cy} r={hubR} fill="url(#hubGradient)" stroke={isDark ? "#A855F7" : "#FFFFFF"} strokeWidth={1.5} />
            <SvgCircle cx={cx} cy={cy} r={hubR - 2.5} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={0.75} />
            <SvgTextEl x={cx} y={cy + (hubR * 0.35)} fontSize={Math.max(16, rOuter * 0.11)} fill="#FFFFFF" textAnchor="middle" fontWeight="bold">
              {RASHI_GLYPHS[ascIndex0]}
            </SvgTextEl>
          </SvgG>
        );
      })()}
    </Svg>
  );
}

export default BirthChartWheel;
