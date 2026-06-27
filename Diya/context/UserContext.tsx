import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userService } from '../services/userService';

// ── User Data Types ─────────────────────────────────────────────────────
export interface UserProfile {
  primaryCrops: string[];
  farmSize: number;
  soilType: string;
  waterAvailability: string;
  region: string;
  location: string;
  season: string;
  farmingGoals: string[];
  skillLevel: string;
  previousCrop: string;
  profileCompleted: boolean;
}

export interface User {
  _id: string;
  email: string;
  fullName: string;
  state: string;
  profile: UserProfile;
  xp: number;
  level: number;
  greenCoins: number;
  streakDays: number;
  badges: string[];
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<void>;
  setUser: (user: User | null) => void;
}

// ── Context Creation ────────────────────────────────────────────────────
const UserContext = createContext<UserContextType | undefined>(undefined);

// ── Provider Component ──────────────────────────────────────────────────
export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user on app start
  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if user is logged in
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
        // Not logged in, don't load anything
        setUser(null);
        setLoading(false);
        return;
      }

      // Try to load from cache first
      const cachedUser = await AsyncStorage.getItem('user');
      if (cachedUser) {
        setUser(JSON.parse(cachedUser));
      }

      // Then fetch fresh data from API
      const userData = await userService.getProfile();
      if (userData) {
        setUser(userData);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (err) {
      console.error('Error initializing user:', err);
      setError(err instanceof Error ? err.message : 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      setError(null);
      const userData = await userService.getProfile();
      if (userData) {
        setUser(userData);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (err) {
      console.error('Error refreshing user:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh user data');
    }
  };

  const updateProfile = async (profileData: Partial<UserProfile>) => {
    try {
      setError(null);
      const updatedUser = await userService.updateProfile(profileData);
      if (updatedUser) {
        setUser(updatedUser);
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      throw err;
    }
  };

  const value: UserContextType = {
    user,
    loading,
    error,
    refreshUser,
    updateProfile,
    setUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

// ── Custom Hook ─────────────────────────────────────────────────────────
export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
