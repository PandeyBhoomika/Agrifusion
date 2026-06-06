import { View, Text, TextInput, Button } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { verifyOtp } from "../services/authService";
import { useState } from "react";

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

    // If new user → go to dashboard or signup completion
    router.replace("/dashboard");
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
