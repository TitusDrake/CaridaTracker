import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { troopApi, Troop, TroopCreateData, TroopUpdateData, ApiError, AttendanceSignupData } from '@/services/api';

interface TroopsContextType {
  troops: Troop[];
  currentTroop: Troop | null;
  isLoading: boolean;
  error: string | null;
  fetchTroops: () => Promise<void>;
  fetchTroopById: (id: number) => Promise<Troop>;
  createTroop: (data: TroopCreateData) => Promise<Troop>;
  updateTroop: (id: number, data: TroopUpdateData) => Promise<Troop>;
  deleteTroop: (id: number) => Promise<void>;
  attendTroop: (troopId: number, signupData: AttendanceSignupData) => Promise<void>;
  cancelAttendance: (troopId: number, clubId: number) => Promise<void>;
  clearCurrentTroop: () => void;
  clearError: () => void;
}

const TroopsContext = createContext<TroopsContextType | undefined>(undefined);

interface TroopsProviderProps {
  children: ReactNode;
}

export const TroopsProvider: React.FC<TroopsProviderProps> = ({ children }) => {
  const [troops, setTroops] = useState<Troop[]>([]);
  const [currentTroop, setCurrentTroop] = useState<Troop | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = (err: unknown): string => {
    const apiError = err as ApiError;
    if (apiError.errors && apiError.errors.length > 0) {
      return apiError.errors[0].msg;
    }
    return apiError.error || 'An unexpected error occurred';
  };

  const fetchTroops = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await troopApi.getAll();
      setTroops(data);
    } catch (err) {
      setError(handleError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTroopById = useCallback(async (id: number): Promise<Troop> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await troopApi.getById(id);
      setCurrentTroop(data);
      return data;
    } catch (err) {
      const errorMsg = handleError(err);
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTroop = useCallback(async (data: TroopCreateData): Promise<Troop> => {
    setIsLoading(true);
    setError(null);
    try {
      const newTroop = await troopApi.create(data);
      setTroops(prev => [newTroop, ...prev]);
      return newTroop;
    } catch (err) {
      const errorMsg = handleError(err);
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTroop = useCallback(async (id: number, data: TroopUpdateData): Promise<Troop> => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedTroop = await troopApi.update(id, data);
      setTroops(prev => prev.map(t => t.id === id ? updatedTroop : t));
      if (currentTroop?.id === id) {
        setCurrentTroop(updatedTroop);
      }
      return updatedTroop;
    } catch (err) {
      const errorMsg = handleError(err);
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [currentTroop]);

  const deleteTroop = useCallback(async (id: number): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await troopApi.delete(id);
      setTroops(prev => prev.filter(t => t.id !== id));
      if (currentTroop?.id === id) {
        setCurrentTroop(null);
      }
    } catch (err) {
      const errorMsg = handleError(err);
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [currentTroop]);

  const attendTroop = useCallback(async (troopId: number, signupData: AttendanceSignupData): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await troopApi.attend(troopId, signupData);
      // Update local state to reflect attendance
      setTroops(prev => prev.map(t => {
        if (t.id === troopId) {
          return {
            ...t,
            is_attending: true,
            user_attendance_club_id: signupData.club_id,
            attendee_count: (t.attendee_count || 0) + 1,
          };
        }
        return t;
      }));
      if (currentTroop?.id === troopId) {
        setCurrentTroop(prev => prev ? {
          ...prev,
          is_attending: true,
          user_attendance_club_id: signupData.club_id,
          attendee_count: (prev.attendee_count || 0) + 1,
        } : null);
      }
    } catch (err) {
      const errorMsg = handleError(err);
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [currentTroop]);

  const cancelAttendance = useCallback(async (troopId: number, clubId: number): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await troopApi.cancelAttendance(troopId, clubId);
      // Update local state to reflect cancellation
      setTroops(prev => prev.map(t => {
        if (t.id === troopId) {
          return {
            ...t,
            is_attending: false,
            user_attendance_club_id: undefined,
            attendee_count: Math.max((t.attendee_count || 1) - 1, 0),
          };
        }
        return t;
      }));
      if (currentTroop?.id === troopId) {
        setCurrentTroop(prev => prev ? {
          ...prev,
          is_attending: false,
          user_attendance_club_id: undefined,
          attendee_count: Math.max((prev.attendee_count || 1) - 1, 0),
        } : null);
      }
    } catch (err) {
      const errorMsg = handleError(err);
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [currentTroop]);

  const clearCurrentTroop = useCallback(() => {
    setCurrentTroop(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: TroopsContextType = {
    troops,
    currentTroop,
    isLoading,
    error,
    fetchTroops,
    fetchTroopById,
    createTroop,
    updateTroop,
    deleteTroop,
    attendTroop,
    cancelAttendance,
    clearCurrentTroop,
    clearError,
  };

  return <TroopsContext.Provider value={value}>{children}</TroopsContext.Provider>;
};

export const useTroops = (): TroopsContextType => {
  const context = useContext(TroopsContext);
  if (context === undefined) {
    throw new Error('useTroops must be used within a TroopsProvider');
  }
  return context;
};

export default TroopsContext;
