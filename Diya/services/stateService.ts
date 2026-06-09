// State Service - Fetch Indian states from API

import { indianStates as mockStates } from '../data/mockData';

// ✅ FIX 1: Removed hardcoded IP. Relies cleanly on EXPO_PUBLIC_API_URL
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api';

export interface StateResponse {
  success: boolean;
  data?: string[];
  error?: string;
}

/**
 * Fetch list of Indian states from API
 * Falls back to mock data if API fails
 */
export const fetchIndianStates = async (): Promise<string[]> => {
  try {
    // ✅ FIX 2: Removed the rogue "return mockStates;" that was blocking the API call!
    console.log(`🌐 Fetching states from: ${API_BASE_URL}/states`);

    const response = await fetch(`${API_BASE_URL}/states`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn('⚠️ Failed to fetch states from API, using mock data');
      return mockStates;
    }

    const data = await response.json();

    if (data.states && Array.isArray(data.states)) {
      return data.states;
    }

    return mockStates;
  } catch (error) {
    console.error('🚨 Connection Failed: Error fetching states, using mock data:', error);
    return mockStates;
  }
};

/**
 * Get mock states (for offline/testing)
 */
export const getMockStates = (): string[] => {
  return mockStates;
};