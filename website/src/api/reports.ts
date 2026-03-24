import { apiFetch } from './client';

export interface KundliReport {
  user_id: string;
  birth_details: {
    full_name: string;
    date_of_birth: string;
    time_of_birth: string;
    place_of_birth: string;
    latitude: number;
    longitude: number;
  };
  chart_data: {
    ascendant: string;
    moon_sign: string;
    sun_sign: string;
    nakshatra: string;
    planets: {
      sun: { sign: string; degree: number };
      moon: { sign: string; degree: number };
      mars: { sign: string; degree: number };
      mercury: { sign: string; degree: number };
      jupiter: { sign: string; degree: number };
      venus: { sign: string; degree: number };
      saturn: { sign: string; degree: number };
      rahu: { sign: string; degree: number };
      ketu: { sign: string; degree: number };
    };
    houses: {
      [key: string]: string;
    };
  };
  interpretation: {
    personality: string;
    strengths: string;
    challenges: string;
    career: string;
    relationships: string;
    health: string;
    spiritual_path: string;
    important_yogas: string[];
  };
  created_at: string;
}

export interface GenerateKundliResponse {
  success: boolean;
  source: 'cache' | 'generated';
  data?: KundliReport;
  redirectToOnboarding?: boolean;
}

export interface BirthChartResponse {
  success: boolean;
  source: 'database' | 'generated';
  data?: {
    birth_details: KundliReport['birth_details'];
    chart_data: KundliReport['chart_data'];
    interpretation?: KundliReport['interpretation'];
  };
  message?: string;
}

export const reportsApi = {
  generateKundli: async (): Promise<GenerateKundliResponse> => {
    return apiFetch('/api/reports/kundli', {
      method: 'GET'
    });
  },
  
  getBirthChart: async (): Promise<BirthChartResponse> => {
    return apiFetch('/api/reports/birth-chart', {
      method: 'GET'
    });
  }
};
