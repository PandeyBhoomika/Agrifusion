import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { userService } from "../services/userService";
import { refreshEngine } from "../engine/refresh.engine";

// ─────────────────────────────────────────────────────────────
// User Data Types
// ─────────────────────────────────────────────────────────────

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

  updateProfile: (
    profileData: Partial<UserProfile>
  ) => Promise<void>;

  setUser: (user: User | null) => void;
}

// ─────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────

const UserContext = createContext<UserContextType | undefined>(undefined);

// ─────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────

export function UserProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  // ---------------------------------------------------------
  // App Startup
  // ---------------------------------------------------------

  useEffect(() => {
    initializeUser();
  }, []);

  // ---------------------------------------------------------
  // Register Refresh Function with Refresh Engine
  // ---------------------------------------------------------

  useEffect(() => {
    refreshEngine.registerUserRefresh(refreshUser);
  }, []);

  // ---------------------------------------------------------
  // Initialize User
  // ---------------------------------------------------------

  const initializeUser = async () => {
    try {
      setLoading(true);
      setError(null);

      const token =
        await AsyncStorage.getItem("authToken");

      if (!token) {
        setUser(null);
        return;
      }

      const cachedUser =
        await AsyncStorage.getItem("user");

      if (cachedUser) {
        setUser(JSON.parse(cachedUser));
      }

      const userData =
        await userService.getProfile();

      if (userData) {
        setUser(userData);

        await AsyncStorage.setItem(
          "user",
          JSON.stringify(userData)
        );
      }
    } catch (err) {
      console.error(
        "Error initializing user:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load user"
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // Refresh User
  // ---------------------------------------------------------

  const refreshUser = async () => {
    try {
      setError(null);

      const userData =
        await userService.getProfile();

      if (userData) {
        setUser(userData);

        await AsyncStorage.setItem(
          "user",
          JSON.stringify(userData)
        );
      }
    } catch (err) {
      console.error(
        "Error refreshing user:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to refresh user"
      );
    }
  };

  // ---------------------------------------------------------
  // Update Profile
  // ---------------------------------------------------------

  const updateProfile = async (
    profileData: Partial<UserProfile>
  ) => {
    try {
      setError(null);

      const updatedUser =
        await userService.updateProfile(
          profileData
        );

      if (updatedUser) {
        setUser(updatedUser);

        await AsyncStorage.setItem(
          "user",
          JSON.stringify(updatedUser)
        );
      }
    } catch (err) {
      console.error(
        "Error updating profile:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update profile"
      );

      throw err;
    }
  };

  // ---------------------------------------------------------
  // Context Value
  // ---------------------------------------------------------

  const value: UserContextType = {
    user,
    loading,
    error,

    refreshUser,

    updateProfile,

    setUser,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────

export function useUser(): UserContextType {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error(
      "useUser must be used within a UserProvider"
    );
  }

  return context;
}