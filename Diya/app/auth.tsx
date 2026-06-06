

import React, { useState, useEffect } from "react";
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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { sendOtp } from "../services/authService";
import { fetchIndianStates } from "../services/stateService";

export default function AuthScreen() {
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [indianStates, setIndianStates] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    state: "",
    password: "",
  });

  // Fetch all states
  useEffect(() => {
    const loadStates = async () => {
      const states = await fetchIndianStates();
      setIndianStates(states);
    };
    loadStates();
  }, []);

  const handleInputChange = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  // -------------------------------
  // SEND OTP (Email)
  // -------------------------------
  const handleSendOtp = async () => {
    if (!formData.email.trim() || !formData.fullName.trim() || !formData.phone.trim() || !formData.state.trim() || !formData.password.trim()) {
      Alert.alert("Validation Error", "All fields are required");
      return;
    }

    if (formData.phone.length !== 10 || !/^\d+$/.test(formData.phone)) {
      Alert.alert("Validation Error", "Please enter a valid 10-digit phone number");
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
        Alert.alert("Error", msg);
      }
    } catch (error) {
      console.error("Send OTP Error:", error);
      Alert.alert("Error", "Unexpected error occurred while sending OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#FAF3E0", "#DFF2D8"]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.card}>
              <Text style={styles.header}>Join AgriFusion</Text>
              <Text style={styles.sub}>Create your account to get started</Text>

              {/* Full Name */}
              <View style={styles.field}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  value={formData.fullName}
                  onChangeText={(t) => handleInputChange("fullName", t)}
                  placeholder="Enter your full name"
                  style={styles.input}
                />
              </View>

              {/* Email */}
              <View style={styles.field}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  value={formData.email}
                  onChangeText={(t) => handleInputChange("email", t)}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                />
              </View>

              {/* Phone Number */}
              <View style={styles.field}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  value={formData.phone}
                  onChangeText={(t) => handleInputChange("phone", t)}
                  placeholder="Enter 10-digit phone number"
                  keyboardType="phone-pad"
                  maxLength={10}
                  style={styles.input}
                />
              </View>

              {/* State */}
              <View style={styles.field}>
                <Text style={styles.label}>State</Text>
                <TextInput
                  value={formData.state}
                  onChangeText={(t) => handleInputChange("state", t)}
                  placeholder="Type or select your state"
                  style={styles.input}
                />
                <Text style={styles.hint}>Example: {indianStates[0]}</Text>
              </View>

              {/* Password */}
              <View style={styles.field}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.row}>
                  <TextInput
                    value={formData.password}
                    onChangeText={(t) => handleInputChange("password", t)}
                    placeholder="Enter your password"
                    secureTextEntry={!showPassword}
                    style={[styles.input, { flex: 1 }]}
                  />
                  <TouchableOpacity
                    style={styles.eye}
                    onPress={() => setShowPassword((s) => !s)}
                  >
                    <Text>{showPassword ? "Hide" : "Show"}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Error Message */}
              {errorMessage ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              ) : null}

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submit, isLoading && styles.disabled]}
                onPress={handleSendOtp}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitText}>Continue to Verify</Text>
                )}
              </TouchableOpacity>

              <Text style={styles.disclaimer}>
                By signing up, you agree to our Terms and Privacy Policy
              </Text>

              {/* Login Link */}
              <View style={styles.loginLinkContainer}>
                <Text style={styles.loginLinkText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.push("/login")}>
                  <Text style={styles.loginLink}>Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  container: { flexGrow: 1, justifyContent: "center", padding: 24 },
  card: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: "#D1FAE5",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  header: {
    fontSize: 26,
    fontWeight: "800",
    color: "#166534",
    textAlign: "center",
    marginBottom: 8,
  },
  sub: {
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
    fontSize: 15,
  },
  field: { marginBottom: 16 },
  label: { color: "#166534", marginBottom: 8, fontWeight: "700" },
  input: {
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: "#D1FAE5",
  },
  hint: { color: "#9CA3AF", fontSize: 13, marginTop: 6 },
  row: { flexDirection: "row", alignItems: "center" },
  eye: {
    padding: 10,
    marginLeft: 8,
    backgroundColor: "#ECFDF5",
    borderRadius: 8,
  },
  errorBox: {
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    padding: 14,
    borderWidth: 2,
    borderColor: "#FCA5A5",
    marginBottom: 16,
  },
  errorText: { color: "#DC2626", textAlign: "center" },
  submit: {
    backgroundColor: "#10B981",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  disabled: { opacity: 0.6 },
  submitText: { color: "#fff", fontWeight: "800", fontSize: 17 },
  loginLinkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  loginLinkText: {
    fontSize: 14,
    color: "#6B7280",
  },
  loginLink: {
    fontSize: 14,
    color: "#16A34A",
    fontWeight: "700",
  },
  foot: {
    textAlign: "center",
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 32,
  },
  disclaimer: {
    textAlign: "center",
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 16,
  },
});