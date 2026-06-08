import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import Reanimated, { FadeInDown, FadeInUp, ZoomIn } from "react-native-reanimated";

// Keep your existing service imports
import { sendOtp } from "../services/authService";
import { fetchIndianStates } from "../services/stateService";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// --- PARTICLE COMPONENT (from Splash Screen rules) ---
const Particle = ({ particle }: { particle: any }) => {
  const animY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let loop: Animated.CompositeAnimation;
    const timeout = setTimeout(() => {
      loop = Animated.loop(
        Animated.timing(animY, {
          toValue: -(screenHeight * 0.8),
          duration: particle.duration,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      loop.start();
    }, particle.delay);

    return () => {
      clearTimeout(timeout);
      if (loop) loop.stop();
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: particle.x,
          top: particle.y,
          width: particle.size,
          height: particle.size,
          borderRadius: particle.size / 2,
          backgroundColor: particle.color,
          opacity: particle.opacity,
          transform: [{ translateY: animY }],
        },
      ]}
    />
  );
};

export default function AuthScreen() {
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [indianStates, setIndianStates] = useState<string[]>([]);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    state: "",
    password: "",
  });

  // --- PARTICLES GENERATION ---
  const particles = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      x: Math.random() * screenWidth,
      y: screenHeight * 0.5 + Math.random() * (screenHeight * 0.5),
      size: Math.random() * 6 + 2,
      opacity: Math.random() * 0.25 + 0.1,
      color: ["#22c55e", "#4ade80", "#86efac"][Math.floor(Math.random() * 3)],
      duration: 5000 + Math.random() * 4000,
      delay: Math.random() * 2000,
    }));
  }, []);

  // Fetch all states
  useEffect(() => {
    const loadStates = async () => {
      const states = await fetchIndianStates();
      setIndianStates(states);
    };
    loadStates();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setErrorMessage("");
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // -------------------------------
  // SEND OTP (Sign Up Logic)
  // -------------------------------
  const handleSendOtp = async () => {
    if (!formData.email.trim() || !formData.fullName.trim() || !formData.phone.trim() || !formData.state.trim() || !formData.password.trim()) {
      setErrorMessage("All fields are required");
      return;
    }

    if (formData.phone.length !== 10 || !/^\d+$/.test(formData.phone)) {
      setErrorMessage("Please enter a valid 10-digit phone number");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await sendOtp(formData.email);

      if (response.success) {
        Alert.alert("Success", "OTP sent to your email!");
        router.push({
          pathname: "/otp-verification",
          params: {
            email: formData.email,
            fullName: formData.fullName,
            phone: formData.phone,
            state: formData.state,
            password: formData.password,
          },
        });
      } else {
        const msg = response.error || "Failed to send OTP";
        setErrorMessage(msg);
      }
    } catch (error) {
      console.error("Send OTP Error:", error);
      setErrorMessage("Unexpected error occurred while sending OTP");
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------------
  // MOCK LOGIN LOGIC
  // -------------------------------
  const handleLogin = () => {
    if (!formData.email.trim() || !formData.password.trim()) {
      setErrorMessage("Email and Password are required");
      return;
    }
    Alert.alert("Login", "Connect your Login API endpoint here!");
  };

  const onSubmit = isLogin ? handleLogin : handleSendOtp;

  return (
    <LinearGradient colors={["#021F0F", "#053B24", "#0A5C38"]} style={styles.gradient}>
      {/* Floating Particles Background */}
      {particles.map((p) => (
        <Particle key={p.id} particle={p} />
      ))}

      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

            {/* --- SMALL LOGO / HEADER --- */}
            <Reanimated.View entering={FadeInDown.delay(100).duration(500)} style={styles.logoContainer}>
              <View style={styles.logoGlow}>
                <Text style={styles.logoEmoji}>🌾</Text>
              </View>
              <Text style={styles.header}>AgriFusion</Text>
              <Text style={styles.sub}>Empowering Farmers Through Technology</Text>
            </Reanimated.View>

            {/* --- PILL TOGGLE (Login / Sign Up) --- */}
            <Reanimated.View entering={FadeInDown.delay(200).duration(500)} style={styles.toggleContainer}>
              <TouchableOpacity
                style={[styles.toggleBtn, isLogin && styles.toggleBtnActive]}
                onPress={() => { setIsLogin(true); setErrorMessage(""); }}
                activeOpacity={0.8}
              >
                <Text style={[styles.toggleText, isLogin && styles.toggleTextActive]}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, !isLogin && styles.toggleBtnActive]}
                onPress={() => { setIsLogin(false); setErrorMessage(""); }}
                activeOpacity={0.8}
              >
                <Text style={[styles.toggleText, !isLogin && styles.toggleTextActive]}>Sign Up</Text>
              </TouchableOpacity>
            </Reanimated.View>

            {/* --- FORM FIELDS --- */}
            <Reanimated.View entering={FadeInUp.delay(300).duration(500)} style={styles.formContainer}>

              {!isLogin && (
                <View style={styles.field}>
                  <Text style={styles.label}>Full Name</Text>
                  <TextInput
                    value={formData.fullName}
                    onChangeText={(t) => handleInputChange("fullName", t)}
                    placeholder="Enter your full name"
                    placeholderTextColor="rgba(187,247,208,0.4)"
                    onFocus={() => setFocusedField("fullName")}
                    onBlur={() => setFocusedField(null)}
                    style={[styles.input, focusedField === "fullName" && styles.inputFocused]}
                  />
                </View>
              )}

              <View style={styles.field}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  value={formData.email}
                  onChangeText={(t) => handleInputChange("email", t)}
                  placeholder="Enter your email"
                  placeholderTextColor="rgba(187,247,208,0.4)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  style={[styles.input, focusedField === "email" && styles.inputFocused]}
                />
              </View>

              {!isLogin && (
                <>
                  <View style={styles.field}>
                    <Text style={styles.label}>Phone Number</Text>
                    <TextInput
                      value={formData.phone}
                      onChangeText={(t) => handleInputChange("phone", t)}
                      placeholder="10-digit phone number"
                      placeholderTextColor="rgba(187,247,208,0.4)"
                      keyboardType="phone-pad"
                      maxLength={10}
                      onFocus={() => setFocusedField("phone")}
                      onBlur={() => setFocusedField(null)}
                      style={[styles.input, focusedField === "phone" && styles.inputFocused]}
                    />
                  </View>

                  <View style={styles.field}>
                    <Text style={styles.label}>State</Text>
                    <TextInput
                      value={formData.state}
                      onChangeText={(t) => handleInputChange("state", t)}
                      placeholder="Type your state"
                      placeholderTextColor="rgba(187,247,208,0.4)"
                      onFocus={() => setFocusedField("state")}
                      onBlur={() => setFocusedField(null)}
                      style={[styles.input, focusedField === "state" && styles.inputFocused]}
                    />
                    <Text style={styles.hint}>Example: {indianStates[0] || "Maharashtra"}</Text>
                  </View>
                </>
              )}

              <View style={styles.field}>
                <Text style={styles.label}>Password</Text>
                <View style={[styles.inputPasswordRow, focusedField === "password" && styles.inputFocused]}>
                  <TextInput
                    value={formData.password}
                    onChangeText={(t) => handleInputChange("password", t)}
                    placeholder="Enter your password"
                    placeholderTextColor="rgba(187,247,208,0.4)"
                    secureTextEntry={!showPassword}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    style={styles.inputPassword}
                  />
                  <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword((s) => !s)}>
                    <Feather name={showPassword ? "eye" : "eye-off"} size={20} color="#86efac" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Error Message */}
              {errorMessage ? (
                <Reanimated.View entering={ZoomIn.duration(300)} style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={18} color="#fca5a5" />
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </Reanimated.View>
              ) : null}

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitWrapper, isLoading && styles.disabled]}
                onPress={onSubmit}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#22c55e", "#16a34a"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitGradient}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.submitText}>{isLogin ? "Login to Dashboard" : "Continue to Verify"}</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <Text style={styles.disclaimer}>
                By proceeding, you agree to our Terms and Privacy Policy
              </Text>
            </Reanimated.View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  particle: { position: "absolute" },
  safe: { flex: 1 },
  container: { flexGrow: 1, justifyContent: "center", padding: 24, paddingBottom: 60 },

  /* HEADER / LOGO */
  logoContainer: { alignItems: "center", marginBottom: 30, marginTop: 20 },
  logoGlow: { width: 64, height: 64, borderRadius: 32, backgroundColor: "rgba(34,197,94,0.15)", borderWidth: 1, borderColor: "rgba(34,197,94,0.4)", alignItems: "center", justifyContent: "center", marginBottom: 12, shadowColor: "#22c55e", shadowOpacity: 0.5, shadowRadius: 15, elevation: 10 },
  logoEmoji: { fontSize: 32 },
  header: { fontSize: 28, fontWeight: "900", color: "#ECFDF5", letterSpacing: 0.5, marginBottom: 4 },
  sub: { color: "#BBF7D0", fontSize: 13, fontWeight: "500", opacity: 0.8 },

  /* PILL TOGGLE */
  toggleContainer: { flexDirection: "row", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 999, padding: 4, marginBottom: 30, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  toggleBtn: { flex: 1, paddingVertical: 12, borderRadius: 999, alignItems: "center" },
  toggleBtnActive: { backgroundColor: "#22c55e", shadowColor: "#22c55e", shadowOpacity: 0.4, shadowRadius: 8, elevation: 4 },
  toggleText: { color: "#BBF7D0", fontSize: 14, fontWeight: "600" },
  toggleTextActive: { color: "#021F0F", fontWeight: "800" },

  /* FORM FIELDS */
  formContainer: { width: "100%" },
  field: { marginBottom: 18 },
  label: { color: "#ECFDF5", fontSize: 13, fontWeight: "600", marginBottom: 8, marginLeft: 4 },
  input: { height: 54, backgroundColor: "rgba(0,0,0,0.25)", borderRadius: 14, paddingHorizontal: 16, color: "#ffffff", borderWidth: 1, borderColor: "rgba(34,197,94,0.15)", fontSize: 15 },
  inputFocused: { borderColor: "#22c55e", backgroundColor: "rgba(0,0,0,0.4)" },
  inputPasswordRow: { flexDirection: "row", alignItems: "center", height: 54, backgroundColor: "rgba(0,0,0,0.25)", borderRadius: 14, paddingHorizontal: 16, borderWidth: 1, borderColor: "rgba(34,197,94,0.15)" },
  inputPassword: { flex: 1, color: "#ffffff", fontSize: 15 },
  eyeBtn: { padding: 4 },
  hint: { color: "rgba(187,247,208,0.5)", fontSize: 12, marginTop: 6, marginLeft: 4 },

  /* ERROR MESSAGES */
  errorBox: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(239,68,68,0.15)", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "rgba(239,68,68,0.3)", marginBottom: 18 },
  errorText: { color: "#fca5a5", fontSize: 13, fontWeight: "500", marginLeft: 8 },

  /* SUBMIT BUTTON */
  submitWrapper: { borderRadius: 16, overflow: "hidden", marginTop: 10, shadowColor: "#22c55e", shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  submitGradient: { paddingVertical: 18, alignItems: "center", justifyContent: "center" },
  disabled: { opacity: 0.6 },
  submitText: { color: "#ffffff", fontWeight: "800", fontSize: 16, letterSpacing: 0.5 },

  disclaimer: { textAlign: "center", color: "rgba(187,247,208,0.5)", fontSize: 11, marginTop: 20 },
});