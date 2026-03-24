import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client';
import * as d3 from 'd3';
import AppNavbar from './AppNavbar';
import { CosmicBackground } from './CosmicBackground';
import { GlassCard, GradientText } from './CosmicUI';
import { reportsApi, BirthChartResponse } from '../api/reports';

// Helper functions for zodiac characteristics
const getSunSignTraits = (sign: string): string => {
  const traits: { [key: string]: string } = {
    'Aries': 'Natural leader with boundless energy and courage. You pioneer new ideas and inspire others with your enthusiasm.',
    'Taurus': 'Reliable and patient with strong determination. You value security and build lasting foundations.',
    'Gemini': 'Versatile and curious with excellent communication skills. You adapt quickly and love learning.',
    'Cancer': 'Nurturing and intuitive with deep emotional intelligence. You protect and care for others.',
    'Leo': 'Confident and charismatic with natural leadership qualities. You shine brightly and inspire loyalty.',
    'Virgo': 'Analytical and practical with attention to detail. You serve others through your precision.',
    'Libra': 'Diplomatic and fair-minded with strong aesthetic sense. You create harmony and balance.',
    'Scorpio': 'Intense and transformative with deep perception. You uncover truths and embrace change.',
    'Sagittarius': 'Adventurous and optimistic with philosophical outlook. You seek truth and expand horizons.',
    'Capricorn': 'Ambitious and disciplined with strong work ethic. You build lasting success.',
    'Aquarius': 'Innovative and humanitarian with progressive thinking. You envision better futures.',
    'Pisces': 'Compassionate and artistic with deep intuition. You bridge the material and spiritual worlds.'
  };
  return traits[sign] || 'Unique individual with special qualities.';
};

const getMoonSignTraits = (sign: string): string => {
  const traits: { [key: string]: string } = {
    'Aries': 'Emotional reactions are quick and passionate. You express feelings directly and courageously.',
    'Taurus': 'Emotions are stable and deeply felt. You seek comfort and security in relationships.',
    'Gemini': 'Emotions are expressed through communication. You need mental stimulation and variety.',
    'Cancer': 'Highly sensitive and nurturing emotionally. You protect loved ones fiercely.',
    'Leo': 'Emotions are dramatic and expressive. You need recognition and affection.',
    'Virgo': 'Emotions are practical and service-oriented. You show care through helpful actions.',
    'Libra': 'Emotions seek harmony and balance. You need peace and fair treatment.',
    'Scorpio': 'Emotions are intense and transformative. You feel deeply and seek profound connections.',
    'Sagittarius': 'Emotions are optimistic and freedom-loving. You need adventure and philosophical understanding.',
    'Capricorn': 'Emotions are controlled and responsible. You show care through stability.',
    'Aquarius': 'Emotions are intellectual and detached. You need friendship and humanitarian causes.',
    'Pisces': 'Emotions are empathic and intuitive. You absorb others\' feelings and need compassion.'
  };
  return traits[sign] || 'Emotionally intuitive and responsive.';
};

const getAscendantTraits = (sign: string): string => {
  const traits: { [key: string]: string } = {
    'Aries': 'Others see you as energetic and confident. You make a strong first impression.',
    'Taurus': 'Others see you as reliable and calm. You project stability and dependability.',
    'Gemini': 'Others see you as witty and adaptable. You appear curious and communicative.',
    'Cancer': 'Others see you as nurturing and protective. You appear caring and approachable.',
    'Leo': 'Others see you as charismatic and confident. You command attention naturally.',
    'Virgo': 'Others see you as helpful and precise. You appear organized and competent.',
    'Libra': 'Others see you as charming and diplomatic. You appear fair and socially graceful.',
    'Scorpio': 'Others see you as intense and mysterious. You project depth and magnetism.',
    'Sagittarius': 'Others see you as optimistic and adventurous. You appear enthusiastic and philosophical.',
    'Capricorn': 'Others see you as serious and capable. You project responsibility and authority.',
    'Aquarius': 'Others see you as unique and intellectual. You appear innovative and friendly.',
    'Pisces': 'Others see you as gentle and intuitive. You appear compassionate and artistic.'
  };
  return traits[sign] || 'Others see you as unique and memorable.';
};

const getOverallCharacteristics = (sun: string, moon: string, asc: string): string => {
  const combinations: { [key: string]: string } = {
    'Leo-Leo-Leo': 'Triple Leo energy makes you a natural superstar with immense charisma and leadership presence.',
    'Taurus-Taurus-Taurus': 'Triple Taurus gives you incredible stability, determination, and appreciation for beauty.',
    'Gemini-Gemini-Gemini': 'Triple Gemini makes you exceptionally versatile, communicative, and intellectually curious.',
    // Add more combinations as needed
  };
  
  const key = `${sun}-${moon}-${asc}`;
  if (combinations[key]) {
    return combinations[key];
  }
  
  // Default combination analysis
  return `Your ${sun} core drives you to ${getSunSignTraits(sun).split('.')[0].toLowerCase()}, 
  while your ${moon} moon means you ${getMoonSignTraits(moon).split('.')[0].toLowerCase()}. 
  Others see you as ${getAscendantTraits(asc).split('.')[0].toLowerCase()}, 
  creating a fascinating blend of energies that makes you uniquely you.`;
};

const getElementCount = (sun: string, moon: string, asc: string, element: string): number => {
  const elements: { [key: string]: string } = {
    'Aries': 'Fire', 'Leo': 'Fire', 'Sagittarius': 'Fire',
    'Taurus': 'Earth', 'Virgo': 'Earth', 'Capricorn': 'Earth',
    'Gemini': 'Air', 'Libra': 'Air', 'Aquarius': 'Air',
    'Cancer': 'Water', 'Scorpio': 'Water', 'Pisces': 'Water'
  };
  
  let count = 0;
  if (elements[sun] === element) count++;
  if (elements[moon] === element) count++;
  if (elements[asc] === element) count++;
  return count;
};

interface BirthChartData {
  sun_sign: string;
  moon_sign: string;
  ascendant: string;
  dominant_planet: string;
  enhanced_birth_chart_data?: {
    sun_sign: { sign: string; element: string; quality: string; ruler: string; description: string };
    moon_sign: { sign: string; element: string; quality: string; ruler: string; description: string };
    ascendant: { sign: string; element: string; quality: string; ruler: string; description: string };
    dominant_planet: { planet: string; sign: string; element: string; description: string };
  };
  detailed_analysis?: any;
  planetary_positions?: any;
  aspects?: any;
  houses?: any;
}

interface ZodiacSign {
  sign: string;
  element: string;
  quality: string;
  ruler: string;
  symbol: string;
  color: string;
  angle: number;
  description: string;
  traits: string[];
  compatibility: string[];
}

const zodiacIcons: { [key: string]: string } = {
  Aries: "♈",
  Taurus: "♉",
  Gemini: "♊",
  Cancer: "♋",
  Leo: "♌",
  Virgo: "♍",
  Libra: "♎",
  Scorpio: "♏",
  Sagittarius: "♐",
  Capricorn: "♑",
  Aquarius: "♒",
  Pisces: "♓"
};

const zodiacSignsData: ZodiacSign[] = [
  {
    sign: "Aries",
    element: "Fire",
    quality: "Cardinal",
    ruler: "Mars",
    symbol: "♈",
    color: "#EF4444",
    angle: 0,
    description: "The first sign of zodiac, representing new beginnings, courage, and pioneering spirit.",
    traits: ["Courageous", "Energetic", "Independent", "Impulsive", "Competitive"],
    strengths: ["Leadership", "Courage", "Determination", "Confidence"],
    challenges: ["Impatience", "Aggression", "Selfishness", "Impulsiveness"],
    compatibility: ["Leo", "Sagittarius", "Gemini"],
    career_suitability: ["Entrepreneur", "Athlete", "Military", "Sales"],
    love_compatibility: ["Leo", "Sagittarius", "Aquarius"],
    lucky_numbers: [1, 9, 17],
    lucky_colors: ["Red", "Orange"],
    mantra: "I am the pioneer of new beginnings",
    elemental_traits: "Fiery, passionate, initiating energy"
  },
  {
    sign: "Taurus",
    element: "Earth",
    quality: "Fixed",
    ruler: "Venus",
    symbol: "♉",
    color: "#10B981",
    angle: 30,
    description: "The sign of stability, patience, and material comfort, representing earthly pleasures and security.",
    traits: ["Reliable", "Patient", "Practical", "Loyal", "Stubborn"],
    strengths: ["Reliability", "Patience", "Practicality", "Loyalty"],
    challenges: ["Stubbornness", "Possessiveness", "Resistance to change", "Materialism"],
    compatibility: ["Virgo", "Capricorn", "Cancer"],
    career_suitability: ["Banking", "Real Estate", "Agriculture", "Art"],
    love_compatibility: ["Virgo", "Capricorn", "Pisces"],
    lucky_numbers: [2, 6, 14],
    lucky_colors: ["Green", "Pink"],
    mantra: "I build lasting foundations of security and comfort",
    elemental_traits: "Grounded, sensual, stabilizing energy"
  },
  {
    sign: "Gemini",
    element: "Air",
    quality: "Mutable",
    ruler: "Mercury",
    symbol: "♊",
    color: "#F59E0B",
    angle: 60,
    description: "The sign of communication, adaptability, and intellectual curiosity, representing duality and versatility.",
    traits: ["Adaptable", "Outgoing", "Intelligent", "Curious", "Inconsistent"],
    strengths: ["Versatility", "Communication", "Intelligence", "Adaptability"],
    challenges: ["Inconsistency", "Nervousness", "Superficiality", "Indecisiveness"],
    compatibility: ["Libra", "Aquarius", "Aries"],
    career_suitability: ["Journalism", "Teaching", "Sales", "Public Relations"],
    love_compatibility: ["Libra", "Aquarius", "Leo"],
    lucky_numbers: [5, 14, 23],
    lucky_colors: ["Yellow", "Light Blue"],
    mantra: "I communicate ideas and connect with diverse perspectives",
    elemental_traits: "Mental, social, adaptable energy"
  },
  {
    sign: "Cancer",
    element: "Water",
    quality: "Cardinal",
    ruler: "Moon",
    symbol: "♋",
    color: "#3B82F6",
    angle: 90,
    description: "The sign of emotion, nurturing, and intuition, representing home, family, and deep feelings.",
    traits: ["Emotional", "Intuitive", "Protective", "Moody", "Sympathetic"],
    strengths: ["Intuition", "Loyalty", "Empathy", "Protectiveness"],
    challenges: ["Moodiness", "Over-sensitivity", "Clinginess", "Defensiveness"],
    compatibility: ["Scorpio", "Pisces", "Taurus"],
    career_suitability: ["Healthcare", "Hospitality", "Real Estate", "Counseling"],
    love_compatibility: ["Scorpio", "Pisces", "Virgo"],
    lucky_numbers: [2, 7, 11],
    lucky_colors: ["White", "Silver"],
    mantra: "I create emotional security and nurture those I love",
    elemental_traits: "Nurturing, intuitive, protective energy"
  },
  {
    sign: "Leo",
    element: "Fire",
    quality: "Fixed",
    ruler: "Sun",
    symbol: "♌",
    color: "#F97316",
    angle: 120,
    description: "The sign of creativity, leadership, and self-expression, representing royalty and dramatic flair.",
    traits: ["Creative", "Passionate", "Generous", "Arrogant", "Fixed"],
    strengths: ["Leadership", "Creativity", "Generosity", "Confidence"],
    challenges: ["Arrogance", "Stubbornness", "Egotism", "Drama"],
    compatibility: ["Aries", "Sagittarius", "Gemini"],
    career_suitability: ["Entertainment", "Management", "Politics", "Creative Arts"],
    love_compatibility: ["Aries", "Sagittarius", "Libra"],
    lucky_numbers: [1, 4, 10],
    lucky_colors: ["Gold", "Orange"],
    mantra: "I shine my light and inspire others through creative self-expression",
    elemental_traits: "Creative, confident, generous energy"
  },
  {
    sign: "Virgo",
    element: "Earth",
    quality: "Mutable",
    ruler: "Mercury",
    symbol: "♍",
    color: "#059669",
    angle: 150,
    description: "The sign of perfection, service, and analytical thinking, representing purity and practical wisdom.",
    traits: ["Analytical", "Helpful", "Reliable", "Precise", "Critical"],
    strengths: ["Analytical", "Reliability", "Practicality", "Helpfulness"],
    challenges: ["Criticalness", "Perfectionism", "Worry", "Overthinking"],
    compatibility: ["Taurus", "Capricorn", "Cancer"],
    career_suitability: ["Healthcare", "Research", "Accounting", "Editing"],
    love_compatibility: ["Taurus", "Capricorn", "Scorpio"],
    lucky_numbers: [5, 14, 23],
    lucky_colors: ["Navy", "Gray"],
    mantra: "I analyze, organize, and perfect to serve with practical wisdom",
    elemental_traits: "Earthy, analytical, service-oriented energy"
  },
  {
    sign: "Libra",
    element: "Air",
    quality: "Cardinal",
    ruler: "Venus",
    symbol: "♎",
    color: "#EC4899",
    angle: 180,
    description: "The sign of balance, harmony, and relationships, representing justice and aesthetic appreciation.",
    traits: ["Diplomatic", "Fair-minded", "Social", "Indecisive", "Cooperative"],
    strengths: ["Diplomacy", "Fairness", "Social grace", "Cooperation"],
    challenges: ["Indecisiveness", "People-pleasing", "Avoidance of conflict", "Superficiality"],
    compatibility: ["Gemini", "Aquarius", "Leo"],
    career_suitability: ["Law", "Diplomacy", "Art", "Human Resources"],
    love_compatibility: ["Gemini", "Aquarius", "Sagittarius"],
    lucky_numbers: [6, 15, 24],
    lucky_colors: ["Pink", "Light Blue"],
    mantra: "I create balance and harmony in all my relationships",
    elemental_traits: "Social, harmonious, justice-oriented energy"
  },
  {
    sign: "Scorpio",
    element: "Water",
    quality: "Fixed",
    ruler: "Pluto",
    symbol: "♏",
    color: "#7C3AED",
    angle: 210,
    description: "The sign of transformation, intensity, and mystery, representing depth and psychological insight.",
    traits: ["Passionate", "Stubborn", "Resourceful", "Brave", "Jealous"],
    strengths: ["Passion", "Resourcefulness", "Bravery", "Determination"],
    challenges: ["Jealousy", "Stubbornness", "Secrecy", "Intensity"],
    compatibility: ["Cancer", "Pisces", "Virgo"],
    career_suitability: ["Psychology", "Research", "Detective", "Surgery"],
    love_compatibility: ["Cancer", "Pisces", "Capricorn"],
    lucky_numbers: [8, 11, 18],
    lucky_colors: ["Dark Red", "Black"],
    mantra: "I transform through depth and embrace profound change",
    elemental_traits: "Intense, transformative, mysterious energy"
  },
  {
    sign: "Sagittarius",
    element: "Fire",
    quality: "Mutable",
    ruler: "Jupiter",
    symbol: "♐",
    color: "#DC2626",
    angle: 240,
    description: "The sign of exploration, philosophy, and optimism, representing freedom and higher learning.",
    traits: ["Generous", "Idealistic", "Humorous", "Adventurous", "Impatient"],
    strengths: ["Optimism", "Generosity", "Philosophical mind", "Adventure"],
    challenges: ["Impatience", "Restlessness", "Bluntness", "Irresponsibility"],
    compatibility: ["Aries", "Leo", "Libra"],
    career_suitability: ["Travel", "Publishing", "Education", "Philosophy"],
    love_compatibility: ["Aries", "Leo", "Aquarius"],
    lucky_numbers: [3, 9, 21],
    lucky_colors: ["Purple", "Turquoise"],
    mantra: "I explore horizons and seek higher wisdom through experience",
    elemental_traits: "Expansive, optimistic, freedom-loving energy"
  },
  {
    sign: "Capricorn",
    element: "Earth",
    quality: "Cardinal",
    ruler: "Saturn",
    symbol: "♑",
    color: "#047857",
    angle: 270,
    description: "The sign of ambition, discipline, and structure, representing achievement and worldly success.",
    traits: ["Responsible", "Disciplined", "Self-control", "Know-it-all", "Unforgiving"],
    strengths: ["Discipline", "Ambition", "Reliability", "Practicality"],
    challenges: ["Pessimism", "Rigidity", "Workaholism", "Emotional distance"],
    compatibility: ["Taurus", "Virgo", "Scorpio"],
    career_suitability: ["Business", "Finance", "Management", "Engineering"],
    love_compatibility: ["Taurus", "Virgo", "Pisces"],
    lucky_numbers: [8, 10, 22],
    lucky_colors: ["Brown", "Dark Green"],
    mantra: "I build lasting structures through discipline and persistence",
    elemental_traits: "Ambitious, practical, structural energy"
  },
  {
    sign: "Aquarius",
    element: "Air",
    quality: "Fixed",
    ruler: "Uranus",
    symbol: "♒",
    color: "#0891B2",
    angle: 300,
    description: "The sign of innovation, humanitarianism, and rebellion, representing progress and social consciousness.",
    traits: ["Progressive", "Original", "Independent", "Humanitarian", "Unemotional"],
    strengths: ["Innovation", "Independence", "Humanitarianism", "Originality"],
    challenges: ["Emotional detachment", "Rebellion", "Unpredictability", "Stubbornness"],
    compatibility: ["Gemini", "Libra", "Sagittarius"],
    career_suitability: ["Technology", "Science", "Social Work", "Innovation"],
    love_compatibility: ["Gemini", "Libra", "Aries"],
    lucky_numbers: [4, 11, 22],
    lucky_colors: ["Electric Blue", "Silver"],
    mantra: "I innovate for humanity and embrace progressive change",
    elemental_traits: "Intellectual, unconventional, progressive energy"
  },
  {
    sign: "Pisces",
    element: "Water",
    quality: "Mutable",
    ruler: "Neptune",
    symbol: "♓",
    color: "#6366F1",
    angle: 330,
    description: "The sign of spirituality, compassion, and imagination, representing dreams and artistic sensitivity.",
    traits: ["Compassionate", "Artistic", "Intuitive", "Gentle", "Fearful"],
    strengths: ["Compassion", "Intuition", "Artistic sensitivity", "Empathy"],
    challenges: ["Fearfulness", "Escapism", "Over-sensitivity", "Victim mentality"],
    compatibility: ["Cancer", "Scorpio", "Capricorn"],
    career_suitability: ["Arts", "Music", "Spiritual work", "Healing"],
    love_compatibility: ["Cancer", "Scorpio", "Taurus"],
    lucky_numbers: [7, 12, 16],
    lucky_colors: ["Sea Green", "Lavender"],
    mantra: "I flow with cosmic intuition and express divine compassion",
    elemental_traits: "Spiritual, compassionate, imaginative energy"
  }
];

interface ZodiacSign {
  sign: string;
  element: string;
  quality: string;
  ruler: string;
  description: string;
  traits: string[];
  strengths: string[];
  challenges: string[];
  compatibility: string[];
  career_suitability: string[];
  love_compatibility: string[];
  lucky_numbers: number[];
  lucky_colors: string[];
  mantra: string;
  elemental_traits: string;
  symbol: string;
}

const BirthChartPage: React.FC = () => {
  const navigate = useNavigate();
  const [birthChartData, setBirthChartData] = useState<BirthChartResponse['data'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Individual zodiac signs for display
  const [zodiacData, setZodiacData] = useState({
    sunSign: '',
    moonSign: '',
    ascendant: '',
    dominantPlanet: ''
  });
  
  const svgRef = useRef<SVGSVGElement>(null);

  // Fetch birth chart data from kundli_reports
  useEffect(() => {
    const fetchBirthChart = async () => {
      try {
        setIsLoading(true);
        const response = await reportsApi.getBirthChart();
        
        if (response.success && response.data) {
          setBirthChartData(response.data);
          setError(null);
          
          // Extract zodiac data from kundli_reports
          setZodiacData({
            sunSign: response.data.chart_data.sun_sign || '',
            moonSign: response.data.chart_data.moon_sign || '',
            ascendant: response.data.chart_data.ascendant || '',
            dominantPlanet: 'Sun' // Default, can be enhanced later
          });
        } else {
          setError(response.message || 'Failed to load birth chart');
          setBirthChartData(null);
          setZodiacData({ sunSign: '', moonSign: '', ascendant: '', dominantPlanet: '' });
        }
      } catch (err) {
        console.error('Error fetching birth chart:', err);
        setError('Failed to load birth chart data');
        setBirthChartData(null);
        setZodiacData({ sunSign: '', moonSign: '', ascendant: '', dominantPlanet: '' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBirthChart();
  }, []);

  // Zodiac insights from local data (no API – avoids slow/hanging LLM and endless loading)
  const getSignInfo = (signName: string): ZodiacSign | null =>
    zodiacSignsData.find((s) => s.sign === signName) ?? null;
  const sunSignInfo = getSignInfo(zodiacData.sunSign);
  const moonSignInfo = getSignInfo(zodiacData.moonSign);
  const ascendantInfo = getSignInfo(zodiacData.ascendant);

  // Draw professional astrological birth chart
  const drawCosmicWheel = (data: any) => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 450;
    const height = 450;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 180;

    // Create professional gradients
    const defs = svg.append("defs");
    
    // Background gradient
    const bgGradient = defs.append("radialGradient")
      .attr("id", "bgGradient")
      .attr("cx", "50%")
      .attr("cy", "50%")
      .attr("r", "50%");
    
    bgGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#1a1a2e")
      .attr("stop-opacity", 1);
    
    bgGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#0f0f1e")
      .attr("stop-opacity", 1);

    // Draw outer circle (wheel border)
    svg.append("circle")
      .attr("cx", centerX)
      .attr("cy", centerY)
      .attr("r", radius + 5)
      .attr("fill", "none")
      .attr("stroke", "#c9a961")
      .attr("stroke-width", 2);

    // Draw inner circle
    svg.append("circle")
      .attr("cx", centerX)
      .attr("cy", centerY)
      .attr("r", radius - 2)
      .attr("fill", "url(#bgGradient)")
      .attr("stroke", "#c9a961")
      .attr("stroke-width", 1);

    // Draw house circles (traditional 3-circle design)
    [radius * 0.8, radius * 0.6, radius * 0.4].forEach((r, i) => {
      svg.append("circle")
        .attr("cx", centerX)
        .attr("cy", centerY)
        .attr("r", r)
        .attr("fill", "none")
        .attr("stroke", "#c9a961")
        .attr("stroke-width", 0.5)
        .attr("opacity", 0.6);
    });

    // Draw zodiac signs with traditional positioning
    const zodiacSigns = [
      { sign: "Aries", symbol: "♈", angle: 0, color: "#ff6b6b" },
      { sign: "Taurus", symbol: "♉", angle: 30, color: "#4ecdc4" },
      { sign: "Gemini", symbol: "♊", angle: 60, color: "#ffe66d" },
      { sign: "Cancer", symbol: "♋", angle: 90, color: "#a8e6cf" },
      { sign: "Leo", symbol: "♌", angle: 120, color: "#ffd3b6" },
      { sign: "Virgo", symbol: "♍", angle: 150, color: "#ffaaa5" },
      { sign: "Libra", symbol: "♎", angle: 180, color: "#ff8b94" },
      { sign: "Scorpio", symbol: "♏", angle: 210, color: "#c9a961" },
      { sign: "Sagittarius", symbol: "♐", angle: 240, color: "#ffd93d" },
      { sign: "Capricorn", symbol: "♑", angle: 270, color: "#6bcf7f" },
      { sign: "Aquarius", symbol: "♒", angle: 300, color: "#4a90e2" },
      { sign: "Pisces", symbol: "♓", angle: 330, color: "#b19cd9" }
    ];

    // Draw zodiac segments
    zodiacSigns.forEach((sign, index) => {
      const startAngle = (sign.angle - 15) * Math.PI / 180;
      const endAngle = (sign.angle + 15) * Math.PI / 180;
      
      const x1 = centerX + radius * Math.cos(startAngle);
      const y1 = centerY + radius * Math.sin(startAngle);
      const x2 = centerX + radius * Math.cos(endAngle);
      const y2 = centerY + radius * Math.sin(endAngle);
      
      const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;
      
      // Draw segment
      svg.append("path")
        .attr("d", `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`)
        .attr("fill", "none")
        .attr("stroke", "#c9a961")
        .attr("stroke-width", 1)
        .attr("opacity", 0.8);
      
      // Draw sign symbol on outer edge
      const symbolAngle = sign.angle * Math.PI / 180;
      const symbolX = centerX + (radius - 15) * Math.cos(symbolAngle);
      const symbolY = centerY + (radius - 15) * Math.sin(symbolAngle);
      
      svg.append("text")
        .attr("x", symbolX)
        .attr("y", symbolY + 4)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", "#c9a961")
        .attr("font-size", "16px")
        .attr("font-weight", "bold")
        .attr("font-family", "serif")
        .text(sign.symbol);
      
      // Draw sign name
      const nameAngle = sign.angle * Math.PI / 180;
      const nameX = centerX + (radius - 35) * Math.cos(nameAngle);
      const nameY = centerY + (radius - 35) * Math.sin(nameAngle);
      
      svg.append("text")
        .attr("x", nameX)
        .attr("y", nameY + 3)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", "#c9a961")
        .attr("font-size", "10px")
        .attr("font-weight", "500")
        .text(sign.sign);
    });

    // Draw house lines (12 houses)
    for (let i = 0; i < 12; i++) {
      const angle = i * 30 * Math.PI / 180;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      svg.append("line")
        .attr("x1", centerX)
        .attr("y1", centerY)
        .attr("x2", x)
        .attr("y2", y)
        .attr("stroke", "#c9a961")
        .attr("stroke-width", 0.5)
        .attr("opacity", 0.4);
    }

    // Draw user's planets with traditional astrological symbols
    if (data && data.chart_data && data.chart_data.planets) {
      const planets = data.chart_data.planets;
      
      // Define planet symbols and colors
      const planetData = [
        { name: 'sun', symbol: '☉', color: '#ffd700', strokeColor: '#ff8c00' },
        { name: 'moon', symbol: '☽', color: '#c0c0c0', strokeColor: '#808080' },
        { name: 'mars', symbol: '♂', color: '#ff4444', strokeColor: '#cc0000' },
        { name: 'mercury', symbol: '☿', color: '#888888', strokeColor: '#666666' },
        { name: 'jupiter', symbol: '♃', color: '#ffaa44', strokeColor: '#cc8800' },
        { name: 'venus', symbol: '♀', color: '#ff88aa', strokeColor: '#cc6688' },
        { name: 'saturn', symbol: '♄', color: '#8888aa', strokeColor: '#666688' },
        { name: 'rahu', symbol: '☊', color: '#666666', strokeColor: '#444444' },
        { name: 'ketu', symbol: '☋', color: '#666666', strokeColor: '#444444' }
      ];

      // Draw planets based on their signs
      planetData.forEach((planet, index) => {
        if (planets[planet.name] && planets[planet.name].sign) {
          const signName = planets[planet.name].sign;
          const signData = zodiacSigns.find(s => s.sign === signName);
          
          if (signData) {
            // Calculate position based on sign angle with some variation to avoid overlap
            const baseAngle = signData.angle * Math.PI / 180;
            const angleVariation = (Math.random() - 0.5) * 0.5; // Random variation ±0.25 radians
            const finalAngle = baseAngle + angleVariation;
            
            // Different planets at different distances from center
            const distanceFromCenter = 0.45 + (index % 3) * 0.15; // 0.45, 0.6, 0.75
            
            const x = centerX + (radius * distanceFromCenter) * Math.cos(finalAngle);
            const y = centerY + (radius * distanceFromCenter) * Math.sin(finalAngle);
            
            // Draw planet circle with glow
            svg.append("circle")
              .attr("cx", x)
              .attr("cy", y)
              .attr("r", 10)
              .attr("fill", planet.color)
              .attr("stroke", planet.strokeColor)
              .attr("stroke-width", 2)
              .attr("filter", `drop-shadow(0 0 6px ${planet.color}40)`);
            
            svg.append("text")
              .attr("x", x)
              .attr("y", y + 3)
              .attr("text-anchor", "middle")
              .attr("dominant-baseline", "middle")
              .attr("fill", "#000000")
              .attr("font-size", "12px")
              .attr("font-weight", "bold")
              .attr("font-family", "serif")
              .text(planet.symbol);
            
            // Add degree label if available
            if (planets[planet.name].degree) {
              svg.append("text")
                .attr("x", x)
                .attr("y", y + 18)
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
                .attr("fill", "#ffffff")
                .attr("font-size", "8px")
                .attr("font-weight", "normal")
                .text(`${planets[planet.name].degree}°`);
            }
          }
        }
      });

      // Draw center point (Earth)
      svg.append("circle")
        .attr("cx", centerX)
        .attr("cy", centerY)
        .attr("r", 6)
        .attr("fill", "#8b4513")
        .attr("stroke", "#654321")
        .attr("stroke-width", 2);
      
      svg.append("text")
        .attr("x", centerX)
        .attr("y", centerY + 2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", "#ffffff")
        .attr("font-size", "8px")
        .attr("font-weight", "bold")
        .attr("font-family", "Arial, sans-serif")
        .text("⊕");
    }

    // Add degree markings around the outer edge
    for (let i = 0; i < 360; i += 10) {
      const angle = i * Math.PI / 180;
      const innerRadius = radius + 8;
      const outerRadius = radius + 12;
      
      const x1 = centerX + innerRadius * Math.cos(angle);
      const y1 = centerY + innerRadius * Math.sin(angle);
      const x2 = centerX + outerRadius * Math.cos(angle);
      const y2 = centerY + outerRadius * Math.sin(angle);
      
      const strokeWidth = (i % 30 === 0) ? 1 : 0.5;
      const strokeLength = (i % 30 === 0) ? 4 : 2;
      
      svg.append("line")
        .attr("x1", centerX + (radius + 8) * Math.cos(angle))
        .attr("y1", centerY + (radius + 8) * Math.sin(angle))
        .attr("x2", centerX + (radius + 8 + strokeLength) * Math.cos(angle))
        .attr("y2", centerY + (radius + 8 + strokeLength) * Math.sin(angle))
        .attr("stroke", "#c9a961")
        .attr("stroke-width", strokeWidth)
        .attr("opacity", 0.6);
    }
  };

  useEffect(() => {
    if (birthChartData && svgRef.current) {
      console.log('Drawing cosmic wheel with kundli data:', birthChartData);
      drawCosmicWheel(birthChartData);
    }
  }, [birthChartData]);

  const handleCompleteGettingStarted = () => {
    navigate('/onboarding/step-1');
  };

  if (isLoading && !birthChartData) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white">
        <AppNavbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading Birth Chart...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white">
        <AppNavbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="text-red-400 text-6xl mb-6">⚠️</div>
            <h2 className="text-2xl font-bold text-white mb-4">Birth Chart Error</h2>
            <p className="text-white/70 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 border border-white/20"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User doesn't have birth chart data - show educational content
  if (!birthChartData) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-25 pointer-events-none">
          <svg className="h-full w-full" viewBox="0 0 1200 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="chart_g1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(560 380) rotate(90) scale(420 640)">
                <stop stopColor="#F59E0B" stopOpacity="0.33" />
                <stop offset="1" stopColor="#0B1026" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="1200" height="800" fill="url(#chart_g1)" />
          </svg>
        </div>

        <AppNavbar />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-6">
              Birth Chart
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              Discover your cosmic blueprint - a personalized map of the heavens at the moment of your birth.
            </p>
          </div>

          {/* What is Birth Chart Section */}
          <div className="mb-16 bg-white/5 border border-white/10 rounded-3xl p-10 backdrop-blur-sm">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">What is a Birth Chart?</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
              <div className="space-y-6">
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <h3 className="text-xl font-semibold text-orange-400 mb-4 flex items-center">
                    <span className="text-2xl mr-3">🌟</span>
                    Your Cosmic Blueprint
                  </h3>
                  <p className="text-white/70 leading-relaxed">
                    A birth chart is a snapshot of the sky at the exact moment you were born. It shows the precise positions of the Sun, Moon, planets, and stars in relation to Earth, creating a unique cosmic map that's yours alone.
                  </p>
                </div>

                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <h3 className="text-xl font-semibold text-blue-400 mb-4 flex items-center">
                    <span className="text-2xl mr-3">🔮</span>
                    Personal Insights
                  </h3>
                  <p className="text-white/70 leading-relaxed">
                    Through your birth chart, you can understand your personality traits, life patterns, relationship dynamics, career potentials, and spiritual journey with remarkable accuracy.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <h3 className="text-xl font-semibold text-purple-400 mb-4 flex items-center">
                    <span className="text-2xl mr-3">⏰</span>
                    Timeless Wisdom
                  </h3>
                  <p className="text-white/70 leading-relaxed">
                    This ancient astrological tool, used for thousands of years, combines celestial wisdom with modern understanding to provide practical guidance for your life's journey.
                  </p>
                </div>

                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <h3 className="text-xl font-semibold text-pink-400 mb-4 flex items-center">
                    <span className="text-2xl mr-3">🎯</span>
                    Life Navigation
                  </h3>
                  <p className="text-white/70 leading-relaxed">
                    Your birth chart serves as a compass, helping you navigate life's challenges, make aligned decisions, and fulfill your highest potential.
                  </p>
                </div>
              </div>
            </div>

            {/* All Zodiac Signs */}
            <h3 className="text-2xl font-bold text-white mb-8 text-center">The Complete Zodiac Guide</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {zodiacSignsData.map((sign) => (
                <div key={sign.sign} className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-colors duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: sign.color + '20' }}>
                        <span className="text-lg" style={{ color: sign.color }}>{sign.symbol}</span>
                      </div>
                      <h4 className="text-lg font-bold text-white">{sign.sign}</h4>
                    </div>
                    <div className="text-sm">
                      <span className="px-2 py-1 rounded-full text-xs" style={{ backgroundColor: sign.color + '20', color: sign.color }}>
                        {sign.element}
                      </span>
                    </div>
                  </div>
                  <p className="text-white/60 text-sm leading-relaxed mb-3">
                    {sign.description}
                  </p>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {sign.traits.map((trait, index) => (
                        <span key={index} className="px-2 py-1 bg-white/10 rounded text-xs text-white/80">
                          {trait}
                        </span>
                      ))}
                    </div>
                    <div className="text-xs text-white/50 mt-3">
                      <span className="font-medium">Ruler:</span> {sign.ruler} | 
                      <span className="font-medium">Quality:</span> {sign.quality}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-orange-400/10 via-yellow-400/10 to-orange-300/10 border-2 border-orange-400/30 rounded-3xl p-12 backdrop-blur-sm">
              <h2 className="text-3xl font-bold text-white mb-6">Ready to Discover Your Cosmic Blueprint?</h2>
              <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
                Complete your onboarding process to generate your personalized Birth Chart with detailed planetary positions and astrological insights.
              </p>
              <button
                onClick={handleCompleteGettingStarted}
                className="bg-gradient-to-r from-orange-400 to-yellow-400 hover:from-orange-300 hover:to-yellow-300 text-gray-900 font-bold text-lg py-4 px-12 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Complete Getting Started
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // User has birth chart data - display their cosmic chart
  return (
    <CosmicBackground>
      <AppNavbar />

      <div className="pt-16"> {/* Add padding for sticky navbar */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">
            Your <GradientText>Cosmic</GradientText> Birth Chart
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            Your personalized map of the heavens at the moment of your birth
          </p>
        </div>

        {/* Zodiac Profile Display */}
        {zodiacData.sunSign && zodiacData.moonSign && zodiacData.ascendant ? (
          <div className="mb-12">
            <div className="bg-gradient-to-br from-purple-500/10 via-indigo-500/10 to-blue-500/10 border border-purple-400/30 rounded-3xl p-8 backdrop-blur-sm">
              <h2 className="text-3xl font-bold text-white mb-8 text-center flex items-center justify-center">
                <span className="text-4xl mr-3">✨</span>
                Your Zodiac Profile
                <span className="text-4xl ml-3">✨</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Sun Sign */}
                <div className="zodiac-card bg-gradient-to-br from-orange-500/20 to-yellow-500/20 border border-orange-400/30 rounded-2xl p-6 text-center hover:from-orange-500/30 hover:to-yellow-500/30 transition-all duration-300">
                  <div className="text-5xl mb-3">{zodiacIcons[zodiacData.sunSign] || '☉'}</div>
                  <h3 className="text-2xl font-bold text-orange-300 mb-2">{zodiacData.sunSign}</h3>
                  <p className="text-orange-200 text-sm">Sun Sign</p>
                  <p className="text-white/70 text-xs mt-2">Your core identity</p>
                </div>

                {/* Moon Sign */}
                <div className="zodiac-card bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/30 rounded-2xl p-6 text-center hover:from-blue-500/30 hover:to-cyan-500/30 transition-all duration-300">
                  <div className="text-5xl mb-3">{zodiacIcons[zodiacData.moonSign] || '☾'}</div>
                  <h3 className="text-2xl font-bold text-blue-300 mb-2">{zodiacData.moonSign}</h3>
                  <p className="text-blue-200 text-sm">Moon Sign</p>
                  <p className="text-white/70 text-xs mt-2">Your emotional nature</p>
                </div>

                {/* Ascendant */}
                <div className="zodiac-card bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-2xl p-6 text-center hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300">
                  <div className="text-5xl mb-3">{zodiacIcons[zodiacData.ascendant] || '⬆'}</div>
                  <h3 className="text-2xl font-bold text-purple-300 mb-2">{zodiacData.ascendant}</h3>
                  <p className="text-purple-200 text-sm">Ascendant</p>
                  <p className="text-white/70 text-xs mt-2">Your social mask</p>
                </div>

                {/* Dominant Planet */}
                <div className="zodiac-card bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-400/30 rounded-2xl p-6 text-center hover:from-emerald-500/30 hover:to-teal-500/30 transition-all duration-300">
                  <div className="text-5xl mb-3">🪐</div>
                  <h3 className="text-2xl font-bold text-emerald-300 mb-2">{zodiacData.dominantPlanet}</h3>
                  <p className="text-emerald-200 text-sm">Dominant Planet</p>
                  <p className="text-white/70 text-xs mt-2">Your ruling influence</p>
                </div>
              </div>

              {/* Summary Description */}
              <div className="mt-8 text-center">
                <p className="text-white/80 leading-relaxed max-w-3xl mx-auto">
                  As a <span className="text-orange-300 font-semibold">{zodiacData.sunSign}</span> with <span className="text-blue-300 font-semibold">{zodiacData.moonSign}</span> moon and <span className="text-purple-300 font-semibold">{zodiacData.ascendant}</span> rising, 
                  you embody a unique cosmic blend of energies, guided by the influence of <span className="text-emerald-300 font-semibold">{zodiacData.dominantPlanet}</span>.
                </p>
              </div>
            </div>
          </div>
        ) : birthChartData === null ? (
          /* User needs to generate insights first */
          <div className="mb-12 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 border border-white/10">
              <div className="text-6xl mb-6">🔮</div>
              <h3 className="text-2xl font-bold text-white mb-4">Generate Your Birth Chart</h3>
              <p className="text-white/80 text-lg mb-8">
                Complete your birth chart generation to unlock your personalized zodiac insights and cosmic profile.
              </p>
              <button
                onClick={() => navigate('/onboarding')}
                className="bg-gradient-to-r from-purple-400 to-blue-400 hover:from-purple-300 hover:to-blue-300 text-white font-bold text-lg py-3 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Generate Birth Chart
              </button>
            </div>
          </div>
        ) : (
          /* Loading state or other error */
          <div className="mb-12 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 border border-white/10">
              <div className="text-6xl mb-6">⚠️</div>
              <h3 className="text-2xl font-bold text-white mb-4">Birth Chart Data Not Available</h3>
              <p className="text-white/80 text-lg mb-8">
                Your zodiac profile data is not available yet. Please complete your birth chart generation to unlock your personalized cosmic insights.
              </p>
              <button
                onClick={() => navigate('/onboarding')}
                className="bg-gradient-to-r from-purple-400 to-blue-400 hover:from-purple-300 hover:to-blue-300 text-white font-bold text-lg py-3 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Complete Birth Chart
              </button>
            </div>
          </div>
        )}

        {/* Birth Chart Data Display */}
        <div className="space-y-8">
          {/* Zodiac Characteristics Overview */}
          {zodiacData.sunSign && zodiacData.moonSign && zodiacData.ascendant && (
            <div className="bg-gradient-to-br from-purple-500/10 via-indigo-500/10 to-blue-500/10 border border-purple-400/30 rounded-3xl p-8 backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center">
                <span className="text-3xl mr-3">✨</span>
                Your Cosmic Characteristics
                <span className="text-3xl ml-3">✨</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Sun Sign Core Identity */}
                <div className="text-center">
                  <div className="text-4xl mb-2">{zodiacIcons[zodiacData.sunSign] || '☉'}</div>
                  <h3 className="text-xl font-bold text-orange-300 mb-2">{zodiacData.sunSign} Sun</h3>
                  <p className="text-orange-200 text-sm mb-3">Core Identity & Ego</p>
                  <div className="text-white/80 text-sm leading-relaxed">
                    {getSunSignTraits(zodiacData.sunSign)}
                  </div>
                </div>

                {/* Moon Sign Emotional Nature */}
                <div className="text-center">
                  <div className="text-4xl mb-2">{zodiacIcons[zodiacData.moonSign] || '☽'}</div>
                  <h3 className="text-xl font-bold text-blue-300 mb-2">{zodiacData.moonSign} Moon</h3>
                  <p className="text-blue-200 text-sm mb-3">Emotional Nature</p>
                  <div className="text-white/80 text-sm leading-relaxed">
                    {getMoonSignTraits(zodiacData.moonSign)}
                  </div>
                </div>

                {/* Ascendant Social Mask */}
                <div className="text-center">
                  <div className="text-4xl mb-2">{zodiacIcons[zodiacData.ascendant] || '⬆'}</div>
                  <h3 className="text-xl font-bold text-purple-300 mb-2">{zodiacData.ascendant} Rising</h3>
                  <p className="text-purple-200 text-sm mb-3">Social Personality</p>
                  <div className="text-white/80 text-sm leading-relaxed">
                    {getAscendantTraits(zodiacData.ascendant)}
                  </div>
                </div>
              </div>

              {/* Overall Characteristics Summary */}
              <div className="bg-black/30 rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4 text-center">Your Cosmic Personality Blend</h3>
                <div className="text-white/90 leading-relaxed text-center">
                  <p className="mb-4">
                    As a <span className="text-orange-300 font-semibold">{zodiacData.sunSign}</span> with a <span className="text-blue-300 font-semibold">{zodiacData.moonSign}</span> moon and <span className="text-purple-300 font-semibold">{zodiacData.ascendant}</span> rising, 
                    you embody a unique cosmic blend of energies.
                  </p>
                  <p className="text-sm">
                    {getOverallCharacteristics(zodiacData.sunSign, zodiacData.moonSign, zodiacData.ascendant)}
                  </p>
                </div>
                
                {/* Element Balance */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <h4 className="text-md font-semibold text-white mb-3 text-center">Elemental Balance</h4>
                  <div className="flex justify-center space-x-4 text-xs">
                    <div className="text-center">
                      <div className="text-orange-400 font-bold">{getElementCount(zodiacData.sunSign, zodiacData.moonSign, zodiacData.ascendant, 'Fire')}</div>
                      <div className="text-white/70">Fire</div>
                    </div>
                    <div className="text-center">
                      <div className="text-green-400 font-bold">{getElementCount(zodiacData.sunSign, zodiacData.moonSign, zodiacData.ascendant, 'Earth')}</div>
                      <div className="text-white/70">Earth</div>
                    </div>
                    <div className="text-center">
                      <div className="text-blue-400 font-bold">{getElementCount(zodiacData.sunSign, zodiacData.moonSign, zodiacData.ascendant, 'Air')}</div>
                      <div className="text-white/70">Air</div>
                    </div>
                    <div className="text-center">
                      <div className="text-cyan-400 font-bold">{getElementCount(zodiacData.sunSign, zodiacData.moonSign, zodiacData.ascendant, 'Water')}</div>
                      <div className="text-white/70">Water</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Professional Astrological Birth Chart */}
          <div className="flex justify-center">
            <div className="bg-gradient-to-br from-slate-900/50 to-indigo-900/50 backdrop-blur-sm rounded-3xl p-8 border border-white/10 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-2 text-center">Professional Birth Chart</h2>
              <p className="text-white/70 text-center mb-6">Traditional astrological wheel with planetary positions</p>
              
              {/* Chart Container */}
              <div className="relative mb-8">
                <svg
                  ref={svgRef}
                  width="450"
                  height="450"
                  viewBox="0 0 450 450"
                  className="w-full max-w-md rounded-2xl overflow-hidden"
                />
              </div>
              
              {/* Professional Legend - Moved Below Chart */}
              <div className="bg-black/80 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex justify-around text-xs mb-3">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                    <span className="text-yellow-300 font-semibold">Sun (☉)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                    <span className="text-gray-300 font-semibold">Moon (☽)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                    <span className="text-purple-300 font-semibold">Ascendant (ASC)</span>
                  </div>
                </div>
                <div className="text-center text-white/60 text-xs">
                  Traditional astrological chart with 12 houses and zodiac signs
                </div>
                <div className="text-center text-white/50 text-xs mt-2">
                  Chart dynamically updates based on your birth data
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Zodiac Information (from local data – no API loading) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {sunSignInfo && (
                  <div className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border border-orange-400/30 rounded-3xl p-6 backdrop-blur-sm hover:from-orange-500/20 hover:to-yellow-500/20 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-orange-300 text-sm font-medium uppercase tracking-wider">Sun Sign</div>
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-orange-400/20 rounded-full flex items-center justify-center mr-3">
                          <span className="text-orange-400 text-xl">{sunSignInfo.symbol}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-orange-300">{sunSignInfo.sign}</div>
                          <div className="text-xs text-orange-200">
                            <span className="font-medium">Element:</span> {sunSignInfo.element} | 
                            <span className="font-medium"> Quality:</span> {sunSignInfo.quality}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-white/80 leading-relaxed mb-4 text-sm">{sunSignInfo.description}</p>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-orange-300 font-semibold mb-2 text-sm flex items-center">
                          <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                          Key Traits
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {sunSignInfo.traits?.slice(0, 4).map((trait, index) => (
                            <span key={index} className="px-2 py-1 bg-orange-400/20 rounded text-xs text-orange-200">
                              {trait}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {moonSignInfo && (
                  <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400/30 rounded-3xl p-6 backdrop-blur-sm hover:from-blue-500/20 hover:to-cyan-500/20 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-blue-300 text-sm font-medium uppercase tracking-wider">Moon Sign</div>
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-blue-400/20 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-400 text-xl">{moonSignInfo.symbol}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-300">{moonSignInfo.sign}</div>
                          <div className="text-xs text-blue-200">
                            <span className="font-medium">Element:</span> {moonSignInfo.element} | 
                            <span className="font-medium"> Quality:</span> {moonSignInfo.quality}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-white/80 leading-relaxed mb-4 text-sm">{moonSignInfo.description}</p>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-blue-300 font-semibold mb-2 text-sm flex items-center">
                          <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                          Emotional Traits
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {moonSignInfo.traits?.slice(0, 4).map((trait, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-400/20 rounded text-xs text-blue-200">
                              {trait}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {ascendantInfo && (
                  <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/30 rounded-3xl p-6 backdrop-blur-sm hover:from-purple-500/20 hover:to-pink-500/20 transition-all duration-300 lg:col-span-2 xl:col-span-1">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-purple-300 text-sm font-medium uppercase tracking-wider">Ascendant</div>
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-purple-400/20 rounded-full flex items-center justify-center mr-3">
                          <span className="text-purple-400 text-xl">{ascendantInfo.symbol}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-purple-300">{ascendantInfo.sign}</div>
                          <div className="text-xs text-purple-200">
                            <span className="font-medium">Element:</span> {ascendantInfo.element} | 
                            <span className="font-medium"> Quality:</span> {ascendantInfo.quality}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-white/80 leading-relaxed mb-4 text-sm">{ascendantInfo.description}</p>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-purple-300 font-semibold mb-2 text-sm flex items-center">
                          <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                          Social Traits
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {ascendantInfo.traits?.slice(0, 4).map((trait, index) => (
                            <span key={index} className="px-2 py-1 bg-purple-400/20 rounded text-xs text-purple-200">
                              {trait}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
          </div>
        </div>
      </div>
      </div> {/* Close padding container */}
    </CosmicBackground>
  );
};

export default BirthChartPage;
