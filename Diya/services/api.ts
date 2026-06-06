// Use the environment variable if available, otherwise fallback to the Android emulator IP
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:4000";

export const api = {
  health: async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    return res.json();
  },

  login: async (data: any) => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  register: async (data: any) => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};