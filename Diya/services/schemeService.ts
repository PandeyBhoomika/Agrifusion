// Government Schemes Service - Fetch schemes from Kerala Agriculture Department

export interface GovernmentScheme {
  id: string;
  name: string;
  description: string;
  amount: string;
  status: string;
  department: string;
  eligibility: string;
  applicationLink: string;
  category: string;
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api';

/**
 * Kerala Government Agricultural Schemes
 * Source: Kerala State Agriculture Department
 */
export const keralaSchemes: GovernmentScheme[] = [
  {
    id: 'ks1',
    name: 'Karshaka Samridhi',
    description: 'Financial assistance for farmers to improve agricultural productivity',
    amount: '₹10,000 - ₹50,000',
    status: 'Active',
    department: 'Kerala Agriculture Department',
    eligibility: 'Small and marginal farmers with land up to 2 hectares',
    applicationLink: 'https://keralaagriculture.gov.in',
    category: 'financial-assistance'
  },
  {
    id: 'ks2',
    name: 'Subhiksha Keralam',
    description: 'Integrated farming development program for sustainable agriculture',
    amount: 'Up to ₹1,00,000',
    status: 'Active',
    department: 'Kerala Agriculture Department',
    eligibility: 'Farmers with minimum 0.25 acre of land',
    applicationLink: 'https://keralaagriculture.gov.in/subhiksha',
    category: 'integrated-farming'
  },
  {
    id: 'ks3',
    name: 'Kerala Vegetable and Fruit Promotion Programme',
    description: 'Support for vegetable and fruit cultivation including subsidy for planting materials',
    amount: '50% subsidy',
    status: 'Active',
    department: 'Vegetable and Fruit Promotion Council Keralam (VFPCK)',
    eligibility: 'All farmers engaged in vegetable and fruit cultivation',
    applicationLink: 'https://vfpck.org',
    category: 'horticulture'
  },
  {
    id: 'ks4',
    name: 'Organic Farming Assistance',
    description: 'Financial support for organic farming certification and inputs',
    amount: '₹15,000 - ₹30,000 per hectare',
    status: 'Active',
    department: 'Kerala State Organic Farming Board',
    eligibility: 'Farmers converting to organic farming',
    applicationLink: 'https://keralaagriculture.gov.in/organic',
    category: 'organic-farming'
  },
  {
    id: 'ks5',
    name: 'Coconut Development Board Schemes',
    description: 'Support for coconut plantation, rejuvenation and value addition',
    amount: 'Varies by scheme',
    status: 'Active',
    department: 'Coconut Development Board',
    eligibility: 'Coconut farmers and entrepreneurs',
    applicationLink: 'https://coconutboard.gov.in',
    category: 'plantation-crops'
  },
  {
    id: 'ks6',
    name: 'Rashtriya Krishi Vikas Yojana (RKVY)',
    description: 'State plan scheme for agriculture and allied sector development',
    amount: 'Project-based funding',
    status: 'Active',
    department: 'Kerala Agriculture Department',
    eligibility: 'Farmer groups, cooperatives, and institutions',
    applicationLink: 'https://rkvy.nic.in',
    category: 'development'
  },
  {
    id: 'ks7',
    name: 'Soil Health Card Scheme',
    description: 'Free soil testing and soil health card distribution',
    amount: 'Free service',
    status: 'Active',
    department: 'Department of Agriculture Development & Farmers Welfare',
    eligibility: 'All farmers',
    applicationLink: 'https://soilhealth.dac.gov.in',
    category: 'soil-health'
  },
  {
    id: 'ks8',
    name: 'PM-KISAN (Kerala)',
    description: 'Direct income support to farmer families',
    amount: '₹6,000/year',
    status: 'Active',
    department: 'Government of India (implemented by Kerala)',
    eligibility: 'Land-holding farmer families',
    applicationLink: 'https://pmkisan.gov.in',
    category: 'income-support'
  },
  {
    id: 'ks9',
    name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    description: 'Crop insurance scheme for all farmers',
    amount: '2% premium for Kharif, 1.5% for Rabi',
    status: 'Active',
    department: 'Ministry of Agriculture & Farmers Welfare',
    eligibility: 'All farmers including sharecroppers and tenant farmers',
    applicationLink: 'https://pmfby.gov.in',
    category: 'insurance'
  },
  {
    id: 'ks10',
    name: 'Kisan Credit Card (KCC)',
    description: 'Credit support for agriculture and allied activities',
    amount: 'Up to ₹3 lakh',
    status: 'Active',
    department: 'NABARD & Commercial Banks',
    eligibility: 'All farmers including tenant farmers',
    applicationLink: 'https://www.nabard.org/content1.aspx?id=523',
    category: 'credit'
  },
  {
    id: 'ks11',
    name: 'Micro Irrigation Scheme',
    description: 'Subsidy for drip and sprinkler irrigation systems',
    amount: '40-55% subsidy',
    status: 'Active',
    department: 'Kerala Agriculture Department',
    eligibility: 'Farmers with irrigation facilities',
    applicationLink: 'https://keralaagriculture.gov.in',
    category: 'irrigation'
  },
  {
    id: 'ks12',
    name: 'Krishibhavan Support Services',
    description: 'Extension services, training, and technical assistance',
    amount: 'Free service',
    status: 'Active',
    department: 'Local Krishibhavan offices',
    eligibility: 'All farmers',
    applicationLink: 'https://keralaagriculture.gov.in',
    category: 'training'
  }
];

/**
 * Fetch all government schemes from API or return Kerala schemes
 */
export const fetchGovernmentSchemes = async (): Promise<GovernmentScheme[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/schemes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn('Failed to fetch schemes from API, using Kerala schemes');
      return keralaSchemes;
    }

    const data = await response.json();
    
    if (data.schemes && Array.isArray(data.schemes)) {
      return data.schemes;
    }

    return keralaSchemes;
  } catch (error) {
    console.warn('Error fetching schemes, using Kerala schemes:', error);
    return keralaSchemes;
  }
};

/**
 * Fetch schemes by category
 * @param category - Category to filter by
 */
export const fetchSchemesByCategory = (category: string): GovernmentScheme[] => {
  return keralaSchemes.filter(scheme => scheme.category === category);
};

/**
 * Get active schemes (all Kerala schemes are active)
 */
export const getActiveSchemes = (): GovernmentScheme[] => {
  return keralaSchemes.filter(scheme => scheme.status === 'Active');
};

/**
 * Search schemes by name or description
 * @param query - Search query
 */
export const searchSchemes = (query: string): GovernmentScheme[] => {
  const lowerQuery = query.toLowerCase();
  return keralaSchemes.filter(
    scheme =>
      scheme.name.toLowerCase().includes(lowerQuery) ||
      scheme.description.toLowerCase().includes(lowerQuery) ||
      scheme.category.toLowerCase().includes(lowerQuery)
  );
};
