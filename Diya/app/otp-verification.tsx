import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp, ZoomIn } from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";

import { useLanguage } from "../context/LanguageContext";
import { verifyOtp, sendOtp } from "../services/authService";

export default function OtpVerification() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // ── Params passed from auth.tsx ──────────────────────────
  const email = Array.isArray(params.email) ? params.email[0] : params.email;
  const fullName = Array.isArray(params.fullName) ? params.fullName[0] : params.fullName;
  const phone = Array.isArray(params.phone) ? params.phone[0] : params.phone;
  const state = Array.isArray(params.state) ? params.state[0] : params.state;
  const password = Array.isArray(params.password) ? params.password[0] : params.password;
  const initialOtp = Array.isArray(params.otp) ? params.otp[0] : params.otp;

  const { t } = useLanguage();

  const [otpArray, setOtpArray] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(30);

  const inputRefs = useRef<TextInput[]>([]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    if (typeof initialOtp === "string" && initialOtp) {
      const digits = initialOtp.split("");
      const padded = [...digits, ...Array(Math.max(0, 6 - digits.length)).fill("")];
      setOtpArray(padded.slice(0, 6));
    }
  }, [initialOtp]);

  async function handleResend() {
    if (timer !== 0 || isResending) return;

    setIsResending(true);
    setError("");
    try {
      const res = await sendOtp(email as string);
      if (!res.success) {
        setError(res.error || t.common.error);
      } else {
        setTimer(30);
        if (res.otp) {
          const digits = res.otp.split("");
          const padded = [...digits, ...Array(Math.max(0, 6 - digits.length)).fill("")];
          setOtpArray(padded.slice(0, 6));
        } else {
          setOtpArray(["", "", "", "", "", ""]);
        }
        inputRefs.current[0]?.focus();
      }
    } catch (e) {
      console.error("Failed to resend OTP:", e);
      setError(t.common.error);
    } finally {
      setIsResending(false);
    }
  }

  const handleOtpChange = (text: string, index: number) => {
    setError("");
    const newOtp = [...otpArray];
    newOtp[index] = text;
    setOtpArray(newOtp);
    if (text !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && otpArray[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otpArray.join("");

    if (otpCode.length < 6) {
      setError(t.common.error);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await verifyOtp(
        email as string,
        otpCode,
        password as string,
        fullName as string,
        state as string,
        phone as string
      );
      if (!res.success) {
        setError(res.error || t.common.error);
        setIsLoading(false);
        return;
      }

      await AsyncStorage.setItem("authToken", res.token);
      await AsyncStorage.setItem("user", JSON.stringify(res.user));

      const isProfileFinished = res.user?.profile?.profileCompleted === true;
      await AsyncStorage.setItem("profileComplete", String(isProfileFinished));

      if (isProfileFinished) {
        router.replace("/dashboard");
      } else {
        router.replace("/farm-profile");
      }

    } catch (e) {
      console.error("Failed to verify/save auth data:", e);
      setError(t.common.error);
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#021F0F", "#053B24", "#0A5C38"]} style={styles.gradient}>
      <StatusBar style="light" backgroundColor="transparent" />
      <SafeAreaView style={styles.safe}>

        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            accessibilityLabel={t.common.back}
          >
            <Ionicons name="arrow-back" size={24} color="#86efac" />
          </TouchableOpacity>
        </Animated.View>

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={styles.content}>

            <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.titleContainer}>
              <View style={styles.iconGlow}>
                <Ionicons name="mail-open-outline" size={32} color="#4ade80" />
              </View>
              <Text style={styles.title}>Verification Code</Text>
              <Text style={styles.subtitle}>
                We've sent a 6-digit code to{"\n"}
                <Text style={styles.emailHighlight}>{email || "your email"}</Text>
              </Text>
            </Animated.View>

            <View style={styles.otpContainer}>
              {otpArray.map((digit, index) => {
                const isFilled = digit !== "";
                return (
                  <Animated.View key={index} entering={FadeInUp.delay(300 + index * 50).duration(400)}>
                    <TextInput
                      ref={(el) => { inputRefs.current[index] = el as TextInput; }}
                      style={[styles.otpBox, isFilled && styles.otpBoxFilled]}
                      value={digit}
                      onChangeText={(text) => handleOtpChange(text.replace(/[^0-9]/g, ""), index)}
                      onKeyPress={(e) => handleKeyPress(e, index)}
                      keyboardType="number-pad"
                      maxLength={1}
                      selectTextOnFocus
                      cursorColor="#4ade80"
                    />
                  </Animated.View>
                );
              })}
            </View>

            {error ? (
              <Animated.View entering={ZoomIn.duration(300)} style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color="#fca5a5" />
                <Text style={styles.errorText}>{error}</Text>
              </Animated.View>
            ) : null}

            <Animated.View entering={FadeInUp.delay(700).duration(400)} style={styles.resendContainer}>
              <Text style={styles.resendText}>Didn't receive the code? </Text>
              {timer > 0 ? (
                <Text style={styles.timerText}>Resend in {timer}s</Text>
              ) : isResending ? (
                <ActivityIndicator size="small" color="#4ade80" />
              ) : (
                <TouchableOpacity onPress={handleResend} activeOpacity={0.7}>
                  <Text style={styles.resendActiveText}>Resend OTP</Text>
                </TouchableOpacity>
              )}
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(800).duration(400)}>
              <TouchableOpacity
                style={[styles.submitWrapper, isLoading && styles.disabled]}
                onPress={handleVerify}
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
                    <ActivityIndicator color="#ffffff" accessibilityLabel={t.common.loading} />
                  ) : (
                    <Text style={styles.submitText}>{t.common.confirm}</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 40 : 20, paddingBottom: 10 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(34,197,94,0.2)" },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 20 },
  titleContainer: { alignItems: "center", marginBottom: 40 },
  iconGlow: { width: 72, height: 72, borderRadius: 36, backgroundColor: "rgba(34,197,94,0.1)", justifyContent: "center", alignItems: "center", marginBottom: 20, borderWidth: 1, borderColor: "rgba(34,197,94,0.3)", shadowColor: "#22c55e", shadowOpacity: 0.3, shadowRadius: 15, elevation: 8 },
  title: { fontSize: 28, fontWeight: "900", color: "#ECFDF5", letterSpacing: 0.5, marginBottom: 8 },
  subtitle: { fontSize: 15, color: "#BBF7D0", textAlign: "center", fontWeight: "500", opacity: 0.9, lineHeight: 22 },
  emailHighlight: { color: "#4ade80", fontWeight: "700" },
  otpContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 30, paddingHorizontal: 10 },
  otpBox: { width: 48, height: 60, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1.5, borderColor: "rgba(34,197,94,0.3)", borderRadius: 14, color: "#ffffff", fontSize: 24, fontWeight: "800", textAlign: "center" },
  otpBoxFilled: { backgroundColor: "rgba(34,197,94,0.15)", borderColor: "#4ade80", shadowColor: "#22c55e", shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  errorBox: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(239,68,68,0.15)", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "rgba(239,68,68,0.3)", marginBottom: 20 },
  errorText: { color: "#fca5a5", fontSize: 13, fontWeight: "500", marginLeft: 8, flex: 1 },
  resendContainer: { flexDirection: "row", justifyContent: "center", marginBottom: 30, alignItems: "center" },
  resendText: { color: "rgba(187,247,208,0.6)", fontSize: 14, fontWeight: "500" },
  timerText: { color: "#86efac", fontSize: 14, fontWeight: "700" },
  resendActiveText: { color: "#4ade80", fontSize: 14, fontWeight: "800", textDecorationLine: "underline" },
  submitWrapper: { borderRadius: 16, overflow: "hidden", shadowColor: "#22c55e", shadowOpacity: 0.4, shadowRadius: 12, elevation: 6 },
  submitGradient: { paddingVertical: 18, alignItems: "center", justifyContent: "center" },
  disabled: { opacity: 0.6 },
  submitText: { color: "#ffffff", fontWeight: "800", fontSize: 16, letterSpacing: 0.5 },
});