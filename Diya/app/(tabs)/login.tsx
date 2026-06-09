import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

// ✅ Fallback to the IP address we confirmed is working!
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.0.103:4000/api";

export default function LoginScreen() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false); // ✅ Added loading state

  const handleLogin = async () => {
    if (phone.trim() === "" || password.trim() === "") {
      Alert.alert("Error", "Please enter both fields");
      return;
    }

    setIsLoading(true);

    try {
      console.log(`🌐 Attempting login at: ${API_BASE_URL}/auth/login`);
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: phone, // Note: If your backend expects 'email' instead of 'phone', change the key here to 'email: phone'
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Backend returned an error (e.g., 401 Unauthorized)
        Alert.alert("Login Failed", data.message || "Invalid credentials");
        setIsLoading(false);
        return;
      }

      // ✅ Success! Save the real token and user data
      await AsyncStorage.setItem("loggedIn", "true");
      
      if (data.token) {
        await AsyncStorage.setItem("authToken", data.token); // Needed for Rewards fetching
      }
      if (data.user) {
        await AsyncStorage.setItem("user", JSON.stringify(data.user)); // Needed for Community posts
      }

      // Navigate to your main app
      router.replace("/dashboard");

    } catch (error) {
      console.error("Login network error:", error);
      Alert.alert(
        "Network Error", 
        "Could not connect to the server. Please check your connection."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back 👋</Text>
      <Text style={styles.subtitle}>Login to continue</Text>

      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        keyboardType="number-pad"
        value={phone}
        onChangeText={setPhone}
        editable={!isLoading}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        editable={!isLoading}
      />

      <TouchableOpacity 
        style={[styles.loginBtn, isLoading && styles.loginBtnDisabled]} 
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.loginText}>Login</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#F5FFF9",
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 6,
    color: "#064E3B",
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    color: "#6B7280",
    marginBottom: 40,
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
  },
  loginBtn: {
    backgroundColor: "#10B981",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
    elevation: 4,
    height: 54, // Fixed height so it doesn't jump when spinner appears
    justifyContent: 'center',
  },
  loginBtnDisabled: {
    backgroundColor: "#6EE7B7", // Lighter green when loading
    elevation: 0,
  },
  loginText: {
    textAlign: "center",
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
});