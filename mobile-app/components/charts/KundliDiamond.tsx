import React from 'react';
import Svg, { Line as SvgLine, Rect as SvgRect, Circle as SvgCircle, Path as SvgPath, G as SvgG, Text as SvgTextEl } from 'react-native-svg';
import { RASHIS, RASHI_GLYPHS, PlanetMeta } from '../../constants/astrology';

interface KundliDiamondProps {
  size: number;
  ascIndex0: number;
  planets: PlanetMeta[];
  selectedKey: string | null;
  houses: any;
}

export function KundliDiamond({ size, ascIndex0, planets, selectedKey, houses }: KundliDiamondProps) {
  const S = size;
  const stroke = '#7209B7';
  const rashiToIndex: Record<string, number> = {
    Aries: 0, Taurus: 1, Gemini: 2, Cancer: 3, Leo: 4, Virgo: 5,
    Libra: 6, Scorpio: 7, Sagittarius: 8, Capricorn: 9, Aquarius: 10, Pisces: 11
  };

  const getHouseSign = (houseNum: number): string => {
    if (houses) {
      if (houses[houseNum.toString()]) return String(houses[houseNum.toString()]);
      if (houses[houseNum]) return String(houses[houseNum]);
    }
    const signIdx = (ascIndex0 + houseNum - 1) % 12;
    return RASHIS[signIdx];
  };

  const getHouseSignIndex = (houseNum: number): number => {
    const raw = getHouseSign(houseNum);
    if (!isNaN(Number(raw)) && Number(raw) >= 1 && Number(raw) <= 12) {
      return Number(raw) - 1;
    }
    return rashiToIndex[raw] !== undefined ? rashiToIndex[raw] : ((ascIndex0 + houseNum - 1) % 12);
  };

  const houseFrac: Record<number, [number, number]> = {
    1: [0.50, 0.25],   // House 1 (Lagna / Ascendant, Center-Top Diamond)
    2: [0.28, 0.12],   // House 2 (Top-Left Upper Triangle)
    3: [0.12, 0.28],   // House 3 (Top-Left Lower Triangle)
    4: [0.25, 0.50],   // House 4 (Center-Left Diamond)
    5: [0.12, 0.72],   // House 5 (Bottom-Left Upper Triangle)
    6: [0.28, 0.88],   // House 6 (Bottom-Left Lower Triangle)
    7: [0.50, 0.75],   // House 7 (Center-Bottom Diamond)
    8: [0.72, 0.88],   // House 8 (Bottom-Right Lower Triangle)
    9: [0.88, 0.72],   // House 9 (Bottom-Right Upper Triangle)
    10: [0.75, 0.50],  // House 10 (Center-Right Diamond)
    11: [0.88, 0.28],  // House 11 (Top-Right Lower Triangle)
    12: [0.72, 0.12],  // House 12 (Top-Right Upper Triangle)
  };

  const selHouse = selectedKey ? planets.find(p => p.key === selectedKey)?.house ?? null : null;

  return (
    <Svg width={S} height={S}>
      {/* Background & Outer Frame */}
      <SvgRect x={1} y={1} width={S - 2} height={S - 2} fill="#FFFFFF" stroke={stroke} strokeWidth={Math.max(1.8, S * 0.008)} rx={8} />
      
      {/* Main Diagonals */}
      <SvgLine x1={2} y1={2} x2={S - 2} y2={S - 2} stroke={stroke} strokeWidth={Math.max(1, S * 0.004)} />
      <SvgLine x1={S - 2} y1={2} x2={2} y2={S - 2} stroke={stroke} strokeWidth={Math.max(1, S * 0.004)} />
      
      {/* Central Inscribed Diamond */}
      <SvgPath d={`M ${S / 2} 2 L ${S - 2} ${S / 2} L ${S / 2} ${S - 2} L 2 ${S / 2} Z`} fill="none" stroke={stroke} strokeWidth={Math.max(1.2, S * 0.005)} />

      {/* House content rendering */}
      {Object.keys(houseFrac).map(hk => {
        const h = Number(hk);
        const [fx, fy] = houseFrac[h];
        const cx = fx * S, cy = fy * S;
        const signIdx = getHouseSignIndex(h);
        const signNumber = signIdx + 1;
        const signGlyph = RASHI_GLYPHS[signIdx] || '';
        const here = planets.filter(p => p.house === h);
        const isSel = selHouse === h;
        const isLagna = h === 1;

        return (
          <SvgG key={h}>
            {/* Highlight on selected house */}
            {isSel && (
              <SvgCircle cx={cx} cy={cy} r={S * 0.10} fill="rgba(247,37,133,0.14)" stroke="#F72585" strokeWidth={Math.max(1, S * 0.004)} />
            )}

            {/* Dynamic Sign Number and Glyph */}
            <SvgTextEl
              x={cx}
              y={cy - (S * 0.035)}
              fontSize={Math.max(9.5, S * 0.032)}
              fill={isLagna ? "#7209B7" : "#8B7AA8"}
              textAnchor="middle"
              fontFamily="Cinzel-Bold"
            >
              {signNumber} {signGlyph}
            </SvgTextEl>

            {/* Dynamic Planets occupying this house */}
            {here.length > 0 && (
              <SvgTextEl
                x={cx}
                y={cy + (S * 0.035)}
                fontSize={Math.max(10, S * 0.034)}
                fill="#2C2B3D"
                textAnchor="middle"
                fontFamily="Cinzel-Bold"
              >
                {here.map(p => p.abbr + (p.retro ? '℞' : '')).join(' ')}
              </SvgTextEl>
            )}
          </SvgG>
        );
      })}

      {/* Lagna / Ascendant Top Marker */}
      <SvgTextEl
        x={S / 2}
        y={S * 0.25 - (S * 0.075)}
        fontSize={Math.max(8, S * 0.026)}
        fill="#D9730D"
        textAnchor="middle"
        fontFamily="Cinzel-Bold"
      >
        ✦ LAGNA (H1)
      </SvgTextEl>
    </Svg>
  );
}

export default KundliDiamond;
