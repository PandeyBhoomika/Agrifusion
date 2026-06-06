// Authentication & OTP API Service

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000/api";

// ---------------------- Interfaces ----------------------

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  fullName: string;
  email: string;
  state: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

// ---------------------- OTP APIs ----------------------

/**
 * SEND OTP
 */
export const sendOtp = async (
  email: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    return {
      success: res.ok,
      error: data.message,
    };
  } catch (err) {
    console.error("Send OTP error:", err);
    return { success: false, error: "Network error while sending OTP" };
  }
};

/**
 * VERIFY OTP
 */
export const verifyOtp = async (email: string, otp: string) => {
  try {
    // FIX: Removed the extra /api here. It now correctly uses the API_BASE_URL
    const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    const data = await res.json();

    return {
      success: res.ok,
      isNewUser: data.isNewUser,
      token: data.token,
      user: data.user,
      error: data.message,
    };
  } catch (err) {
    console.error("Verify OTP error:", err);
    return { success: false, error: "Network error while verifying OTP" };
  }
};

// ---------------------- LOGIN ----------------------

export const loginUser = async (
  credentials: LoginRequest
): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || "Login failed",
      };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      error: "Network error",
    };
  }
};

// ---------------------- SIGNUP ----------------------

export const signupUser = async (
  userData: SignupRequest
): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || "Signup failed",
      };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Signup error:", error);
    return {
      success: false,
      error: "Network error",
    };
  }
};