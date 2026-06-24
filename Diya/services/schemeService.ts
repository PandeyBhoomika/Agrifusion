import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GovernmentScheme {
  // Fields from MongoDB (_id comes as id after JSON serialisation)
  id: string;
  _id?: string;
  title: string;          // backend field name (was "name" in old mock)
  name?: string;          // kept for backward-compat with old mock data
  description: string;
  eligibility: string[];  // backend sends array; screen joins to string when needed
  state: string;          // 'National' | 'Maharashtra' | 'Kerala' etc.
  link: string;           // backend field name (was "applicationLink")
  applicationLink?: string;
  category: string;
  isActive: boolean;
  // Extra display fields computed on the frontend (not in DB)
  amount?: string;
  status?: string;
  department?: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api';

// ─── Normaliser ───────────────────────────────────────────────────────────────
// Backend and the old mock use different field names. This function makes
// both look the same so the schemes.tsx screen needs zero changes.

export const normaliseScheme = (raw: any): GovernmentScheme => ({
  id:              raw._id   || raw.id,
  title:           raw.title || raw.name || '',
  name:            raw.title || raw.name || '',          // keep for screen compat
  description:     raw.description || '',
  eligibility:     Array.isArray(raw.eligibility)
                     ? raw.eligibility
                     : [raw.eligibility || ''],
  state:           raw.state || 'National',
  link:            raw.link  || raw.applicationLink || '',
  applicationLink: raw.link  || raw.applicationLink || '', // keep for screen compat
  category:        raw.category || 'general',
  isActive:        raw.isActive !== undefined ? raw.isActive : true,
  // Display extras — not in DB, shown only when backend doesn't send them
  amount:          raw.amount     || '',
  status:          raw.status     || (raw.isActive !== false ? 'Active' : 'Inactive'),
  department:      raw.department || raw.state || '',
});

// ─── Fallback mock data (shown when API is unreachable) ───────────────────────

export const fallbackSchemes: GovernmentScheme[] = [
  {
    id: 'fb1', title: 'PM-KISAN Samman Nidhi', name: 'PM-KISAN Samman Nidhi',
    description: 'Direct income support of Rs. 6000 per year to land-holding farmer families.',
    eligibility: ['Small and marginal farmers', 'Must own cultivable land'],
    state: 'National', link: 'https://pmkisan.gov.in', applicationLink: 'https://pmkisan.gov.in',
    category: 'income-support', isActive: true, amount: '₹6,000/year', status: 'Active',
    department: 'Government of India',
  },
  {
    id: 'fb2', title: 'Pradhan Mantri Fasal Bima Yojana', name: 'Pradhan Mantri Fasal Bima Yojana',
    description: 'Crop insurance scheme providing financial support for crop loss due to natural calamities.',
    eligibility: ['All farmers including sharecroppers', 'Growing notified crops'],
    state: 'National', link: 'https://pmfby.gov.in', applicationLink: 'https://pmfby.gov.in',
    category: 'insurance', isActive: true, amount: '2% premium for Kharif', status: 'Active',
    department: 'Ministry of Agriculture',
  },
  {
    id: 'fb3', title: 'Kisan Credit Card (KCC)', name: 'Kisan Credit Card (KCC)',
    description: 'Affordable credit for agricultural operations, post-harvest expenses, and farm maintenance.',
    eligibility: ['All farmers including tenant farmers', 'Age 18-75 years'],
    state: 'National', link: 'https://www.nabard.org', applicationLink: 'https://www.nabard.org',
    category: 'credit', isActive: true, amount: 'Up to ₹3 lakh', status: 'Active',
    department: 'NABARD & Commercial Banks',
  },
  {
    id: 'fb4', title: 'Soil Health Card Scheme', name: 'Soil Health Card Scheme',
    description: 'Free soil testing and crop-wise nutrient recommendations for individual farms.',
    eligibility: ['All farmers', 'No restrictions on land size'],
    state: 'National', link: 'https://soilhealth.dac.gov.in', applicationLink: 'https://soilhealth.dac.gov.in',
    category: 'soil-health', isActive: true, amount: 'Free service', status: 'Active',
    department: 'Dept. of Agriculture & Farmers Welfare',
  },
];

// ─── API functions ─────────────────────────────────────────────────────────────

/**
 * Fetch schemes from backend.
 * Passes the user's saved state so the API filters National + state-specific schemes.
 * Falls back to fallbackSchemes if the API is unreachable.
 */
export const fetchGovernmentSchemes = async (
  userState?: string
): Promise<GovernmentScheme[]> => {
  try {
    // Get state from param or from AsyncStorage (saved at login / farm-profile setup)
    const state = userState || (await AsyncStorage.getItem('userState')) || '';

    const url = state
      ? `${API_BASE_URL}/schemes?state=${encodeURIComponent(state)}`
      : `${API_BASE_URL}/schemes`;

    console.log(`🌐 Fetching schemes from: ${url}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      console.warn('⚠️ API returned non-OK status, using fallback schemes');
      return fallbackSchemes;
    }

    const json = await response.json();

    // Backend returns { success: true, count: N, data: [...] }
    if (json.success && Array.isArray(json.data) && json.data.length > 0) {
      console.log(`✅ Loaded ${json.data.length} schemes from API`);
      return json.data.map(normaliseScheme);
    }

    console.warn('⚠️ API returned empty data, using fallback schemes');
    return fallbackSchemes;

  } catch (error) {
    console.error(
      `🚨 Connection failed: could not reach ${API_BASE_URL}/schemes.\n` +
      `   Make sure EXPO_PUBLIC_API_URL in your .env points to your laptop's Wi-Fi IP, not localhost!`
    );
    return fallbackSchemes;
  }
};

/**
 * Filter schemes by category on the frontend (avoids extra API round-trip).
 */
export const filterSchemesByCategory = (
  schemes: GovernmentScheme[],
  category: string
): GovernmentScheme[] => {
  if (category === 'all') return schemes;
  return schemes.filter(s => s.category === category);
};

/**
 * Search schemes by title, description, category, or state.
 */
export const searchSchemes = (
  schemes: GovernmentScheme[],
  query: string
): GovernmentScheme[] => {
  const q = query.toLowerCase().trim();
  if (!q) return schemes;
  return schemes.filter(s =>
    (s.title || s.name || '').toLowerCase().includes(q) ||
    s.description.toLowerCase().includes(q) ||
    s.category.toLowerCase().includes(q) ||
    s.state.toLowerCase().includes(q) ||
    (s.department || '').toLowerCase().includes(q)
  );
};

// Legacy exports — keeps older imports working without changes
export { fallbackSchemes as keralaSchemes };
export const fetchSchemesByCategory = (category: string) =>
  fallbackSchemes.filter(s => s.category === category);
export const getActiveSchemes = () =>
  fallbackSchemes.filter(s => s.isActive !== false);
