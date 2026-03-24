import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { apiFetch } from '../api/client';
import { useAuth } from '../auth/AuthContext';

type InsightStatus = {
  full_name?: string;
  date_of_birth?: string;
  time_of_birth?: string;
  place_of_birth?: string;
  gender?: string;
  birth_chart_data?: any;
  insights_generated: boolean;
};

type BirthChartResponse = {
  success: boolean;
  message?: string;
  birthChart?: any;
  cached?: boolean;
  sunSign?: string;
  moonSign?: string;
  ascendant?: string;
  dominantPlanet?: string;
};

type HoroscopeResponse = {
  success: boolean;
  data?: any;
  cached?: boolean;
};

type AppDataState = {
  insightStatus: InsightStatus | null;
  isInsightLoading: boolean;
  birthChart: BirthChartResponse | null;
  isBirthChartLoading: boolean;
  dailyHoroscope: any | null;
  isHoroscopeLoading: boolean;
  refreshAll: () => Promise<void>;
  refreshBirthChart: () => Promise<void>;
  refreshHoroscope: () => Promise<void>;
};

const AppDataContext = createContext<AppDataState | undefined>(undefined);

const STORAGE_KEY = 'astroai_app_cache_v1';
const TODAY_KEY = () => new Date().toDateString();

type CacheShape = {
  day: string;
  insightStatus?: InsightStatus | null;
  birthChart?: BirthChartResponse | null;
  dailyHoroscope?: any | null;
};

const readCache = (): CacheShape | null => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheShape;
    if (!parsed || parsed.day !== TODAY_KEY()) return null;
    return parsed;
  } catch {
    return null;
  }
};

const writeCache = (patch: Partial<CacheShape>) => {
  try {
    const current = readCache() || { day: TODAY_KEY() };
    const next: CacheShape = { ...current, ...patch, day: TODAY_KEY() };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
};

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const initial = readCache();
  const [insightStatus, setInsightStatus] = useState<InsightStatus | null>(initial?.insightStatus ?? null);
  const [birthChart, setBirthChart] = useState<BirthChartResponse | null>(initial?.birthChart ?? null);
  const [dailyHoroscope, setDailyHoroscope] = useState<any | null>(initial?.dailyHoroscope ?? null);

  const [isInsightLoading, setIsInsightLoading] = useState(false);
  const [isBirthChartLoading, setIsBirthChartLoading] = useState(false);
  const [isHoroscopeLoading, setIsHoroscopeLoading] = useState(false);

  // Prevent duplicate overlapping requests when users switch pages quickly
  const inflightRef = useRef<{ insight?: boolean; birthChart?: boolean; horoscope?: boolean }>({});

  const fetchInsightStatus = useCallback(async () => {
    if (!isAuthenticated) return;
    if (inflightRef.current.insight) return;
    inflightRef.current.insight = true;
    setIsInsightLoading(true);
    try {
      const res = await apiFetch('/api/profile/insight-status');
      if (res?.success && res?.profile) {
        const next: InsightStatus = {
          ...res.profile,
          insights_generated: Boolean(res.profile.insights_generated)
        };
        setInsightStatus(next);
        writeCache({ insightStatus: next });
      }
    } catch {
      // keep existing cached state
    } finally {
      inflightRef.current.insight = false;
      setIsInsightLoading(false);
    }
  }, [isAuthenticated]);

  const fetchBirthChart = useCallback(async () => {
    if (!isAuthenticated) return;
    if (inflightRef.current.birthChart) return;
    inflightRef.current.birthChart = true;
    setIsBirthChartLoading(true);
    try {
      const res = (await apiFetch('/api/birth-chart')) as BirthChartResponse;
      if (res?.success) {
        setBirthChart(res);
        writeCache({ birthChart: res });
      }
    } catch {
      // keep existing cached state
    } finally {
      inflightRef.current.birthChart = false;
      setIsBirthChartLoading(false);
    }
  }, [isAuthenticated]);

  const fetchHoroscope = useCallback(async () => {
    if (!isAuthenticated) return;
    if (inflightRef.current.horoscope) return;
    inflightRef.current.horoscope = true;
    setIsHoroscopeLoading(true);
    try {
      // Try the new /today endpoint first
      const res = (await apiFetch('/api/horoscope/today')) as HoroscopeResponse;
      if (res?.success && res.data) {
        setDailyHoroscope(res.data);
        writeCache({ dailyHoroscope: res.data });
      } else {
        // If /today fails, try the old /daily endpoint for backwards compatibility
        const fallbackRes = (await apiFetch('/api/horoscope/daily')) as HoroscopeResponse;
        if (fallbackRes?.success && fallbackRes.data) {
          setDailyHoroscope(fallbackRes.data);
          writeCache({ dailyHoroscope: fallbackRes.data });
        }
      }
    } catch (error) {
      console.error('Failed to fetch horoscope:', error);
      // keep existing cached state
    } finally {
      inflightRef.current.horoscope = false;
      setIsHoroscopeLoading(false);
    }
  }, [isAuthenticated]);

  const refreshAll = useCallback(async () => {
    await fetchInsightStatus();
    // Only fetch the rest if onboarding is completed
    const generated = (readCache()?.insightStatus ?? insightStatus)?.insights_generated;
    if (generated) {
      await Promise.all([fetchBirthChart(), fetchHoroscope()]);
    }
  }, [fetchInsightStatus, fetchBirthChart, fetchHoroscope, insightStatus]);

  const refreshBirthChart = useCallback(async () => {
    await fetchBirthChart();
  }, [fetchBirthChart]);

  const refreshHoroscope = useCallback(async () => {
    await fetchHoroscope();
  }, [fetchHoroscope]);

  // Prefetch core data once authenticated; keep UI warm across fast navigation
  useEffect(() => {
    if (!isAuthenticated) return;
    // Fire and forget; cached data renders immediately
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const value = useMemo<AppDataState>(() => {
    return {
      insightStatus,
      isInsightLoading,
      birthChart,
      isBirthChartLoading,
      dailyHoroscope,
      isHoroscopeLoading,
      refreshAll,
      refreshBirthChart,
      refreshHoroscope
    };
  }, [
    insightStatus,
    isInsightLoading,
    birthChart,
    isBirthChartLoading,
    dailyHoroscope,
    isHoroscopeLoading,
    refreshAll,
    refreshBirthChart,
    refreshHoroscope
  ]);

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
};

export const useAppData = () => {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
};

