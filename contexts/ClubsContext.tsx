import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  userApi,
  clubApi,
  ClubMembership,
  ClubMember,
  UserGlobalStats,
  UserClubStats,
  ApiError
} from '@/services/api';

interface ClubsContextType {
  myClubs: ClubMembership[];
  globalStats: UserGlobalStats | null;
  clubStats: Map<number, UserClubStats>;
  clubMembers: Map<number, ClubMember[]>;
  activeClubId: number | null;
  isLoading: boolean;
  error: string | null;
  fetchMyClubs: () => Promise<void>;
  fetchGlobalStats: () => Promise<void>;
  fetchClubStats: (clubId: number) => Promise<UserClubStats>;
  fetchClubMembers: (clubId: number) => Promise<ClubMember[]>;
  setActiveClub: (clubId: number | null) => void;
  clearError: () => void;
}

const ClubsContext = createContext<ClubsContextType | undefined>(undefined);

interface ClubsProviderProps {
  children: ReactNode;
}

export const ClubsProvider: React.FC<ClubsProviderProps> = ({ children }) => {
  const [myClubs, setMyClubs] = useState<ClubMembership[]>([]);
  const [globalStats, setGlobalStats] = useState<UserGlobalStats | null>(null);
  const [clubStats, setClubStats] = useState<Map<number, UserClubStats>>(new Map());
  const [clubMembers, setClubMembers] = useState<Map<number, ClubMember[]>>(new Map());
  const [activeClubId, setActiveClubId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = (err: unknown): string => {
    const apiError = err as ApiError;
    if (apiError.errors && apiError.errors.length > 0) {
      return apiError.errors[0].msg;
    }
    return apiError.error || 'An unexpected error occurred';
  };

  const fetchMyClubs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await userApi.getMyClubs();
      setMyClubs(data);
      // Set active club to first club if none selected
      if (data.length > 0 && activeClubId === null) {
        setActiveClubId(data[0].club_id);
      }
    } catch (err) {
      setError(handleError(err));
    } finally {
      setIsLoading(false);
    }
  }, [activeClubId]);

  const fetchGlobalStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await userApi.getMyStats();
      setGlobalStats(data);
    } catch (err) {
      setError(handleError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchClubStats = useCallback(async (clubId: number): Promise<UserClubStats> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await userApi.getClubStats(clubId);
      setClubStats(prev => new Map(prev).set(clubId, data));
      return data;
    } catch (err) {
      const errorMsg = handleError(err);
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchClubMembers = useCallback(async (clubId: number): Promise<ClubMember[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await clubApi.getMembers(clubId);
      setClubMembers(prev => new Map(prev).set(clubId, data));
      return data;
    } catch (err) {
      const errorMsg = handleError(err);
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setActiveClub = useCallback((clubId: number | null) => {
    setActiveClubId(clubId);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: ClubsContextType = {
    myClubs,
    globalStats,
    clubStats,
    clubMembers,
    activeClubId,
    isLoading,
    error,
    fetchMyClubs,
    fetchGlobalStats,
    fetchClubStats,
    fetchClubMembers,
    setActiveClub,
    clearError,
  };

  return <ClubsContext.Provider value={value}>{children}</ClubsContext.Provider>;
};

export const useClubs = (): ClubsContextType => {
  const context = useContext(ClubsContext);
  if (context === undefined) {
    throw new Error('useClubs must be used within a ClubsProvider');
  }
  return context;
};

export default ClubsContext;
