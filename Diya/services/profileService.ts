// services/profileService.ts
// Handles all farm profile API calls

import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:4000/api';

export interface FarmProfileData {
    primaryCrops: string[];
    farmSize: string;
    soilType: string;
    waterAvailability: string;
    region: string;
    location: string;
    season: string;
    farmingGoals: string[];
    skillLevel: string;
    previousCrop: string;
}

/**
 * Save/update the farmer's profile on the backend.
 * Called when the user completes the farm-profile setup screen.
 */
export const saveFarmProfile = async (
    profileData: FarmProfileData
): Promise<{ success: boolean; user?: any; error?: string }> => {
    try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) return { success: false, error: 'Not authenticated' };

        const res = await fetch(`${API_BASE}/user/profile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(profileData),
        });

        const data = await res.json();

        if (!res.ok) return { success: false, error: data.message || 'Save failed' };

        // Keep local cache fresh
        if (data.user) await AsyncStorage.setItem('user', JSON.stringify(data.user));

        return { success: true, user: data.user };
    } catch (err: any) {
        console.error('saveFarmProfile error:', err);
        return { success: false, error: 'Network error' };
    }
};

/**
 * Fetch the farmer's profile from the backend.
 * Useful for pre-filling the form if the user edits their profile later.
 */
export const getFarmProfile = async (): Promise<{
    success: boolean;
    profile?: FarmProfileData;
    error?: string;
}> => {
    try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) return { success: false, error: 'Not authenticated' };

        const res = await fetch(`${API_BASE}/user/profile`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });

        const data = await res.json();
        if (!res.ok) return { success: false, error: data.message };

        return { success: true, profile: data.profile };
    } catch (err: any) {
        console.error('getFarmProfile error:', err);
        return { success: false, error: 'Network error' };
    }
};
