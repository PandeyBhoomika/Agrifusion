import AsyncStorage from '@react-native-async-storage/async-storage';

// Use the environment variable if available, otherwise fallback to the Android emulator IP
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:4000";
const API_BASE = `${BASE_URL}/api`;

// ── Helper: Get auth token from storage ─────────────────────────────
async function getAuthHeader() {
  const token = await AsyncStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
}

export const api = {
  // ── HEALTH ────────────────────────────────────────────────────
  health: async () => {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  // ── AUTH ──────────────────────────────────────────────────────
  login: async (data: any) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  register: async (data: any) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // ── USER ──────────────────────────────────────────────────────
  user: {
    getProfile: async () => {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_BASE}/user/profile`, {
        method: 'GET',
        headers,
      });
      return res.json();
    },

    updateProfile: async (data: any) => {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_BASE}/user/profile`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });
      return res.json();
    },

    addXP: async (amount: number) => {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_BASE}/user/xp`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ amount }),
      });
      return res.json();
    },
  },

  // ── TASKS ─────────────────────────────────────────────────────
  tasks: {
    getAll: async () => {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'GET',
        headers,
      });
      return res.json();
    },

    complete: async (taskId: string) => {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_BASE}/tasks/${taskId}/complete`, {
        method: 'POST',
        headers,
        body: JSON.stringify({}),
      });
      return res.json();
    },
  },
};