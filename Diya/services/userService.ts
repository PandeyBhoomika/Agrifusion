// services/userService.ts
// Handles user data API calls (profile, XP, level, coins, badges)

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User, UserProfile } from '../context/UserContext';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:4000/api';

/**
 * Get complete user profile including gamification stats
 * This fetches: name, email, level, xp, greenCoins, streakDays, badges, etc.
 */
export const userService = {
  async getProfile(): Promise<User | null> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      // If no token, user is not logged in
      if (!token) {
        console.log('No auth token found - user not logged in');
        return null;
      }

      const res = await fetch(`${API_BASE}/user/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error(`Failed to fetch user profile (${res.status})`);
        throw new Error(`Failed to fetch user profile: ${res.status}`);
      }

      const data = await res.json();

      if (data.success && data.user) {
        return data.user;
      }
      if (data.user) {
        return data.user;
      }

      throw new Error('Unexpected API response format');
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  async updateProfile(profileData: Partial<UserProfile>): Promise<User | null> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const res = await fetch(`${API_BASE}/user/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (!res.ok) {
        throw new Error(`Failed to update profile (${res.status})`);
      }

      const data = await res.json();
      return data.user || null;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  async addXP(amount: number): Promise<User | null> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const res = await fetch(`${API_BASE}/user/xp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ amount }),
      });

      if (!res.ok) {
        throw new Error(`Failed to add XP (${res.status})`);
      }

      const data = await res.json();
      return data.user || null;
    } catch (error) {
      console.error('Error adding XP:', error);
      throw error;
    }
  },
};
