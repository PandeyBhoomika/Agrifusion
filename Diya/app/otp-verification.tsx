import { View, Text, TextInput, Button } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { verifyOtp } from "../services/authService";
import { useState } from "react";
// ✅ IMPORT ADDED HERE
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function OtpVerification() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const { email, fullName, phone, state, password } = params;

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const handleVerify = async () => {
    const res = await verifyOtp(email as string, otp);

    if (!res.success) {
      setError(res.error || "Invalid OTP");
      return;
    }

    // ✅ FIX: Save token and user data to local storage
    try {
      await AsyncStorage.setItem('authToken', res.token);
      await AsyncStorage.setItem('user', JSON.stringify(res.user));
      
      // ✅ FIX: Navigate based on whether they are a new or returning user
      router.replace(res.isNewUser ? '/farm-profile' : '/(tabs)/dashboard');
    } catch (e) {
      console.error("Failed to save auth data:", e);
      setError("Failed to save login session.");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Verify OTP</Text>
      <Text>Email: {email}</Text>

      <TextInput
        placeholder="Enter OTP"
        value={otp}
        onChangeText={setOtp}
        keyboardType="numeric"
        style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
      />

      {error ? <Text style={{ color: "red" }}>{error}</Text> : null}

      <Button title="Verify OTP" onPress={handleVerify} />
    </View>
  );
}