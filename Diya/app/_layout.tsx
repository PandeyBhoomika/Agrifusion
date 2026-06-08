import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  
  // ✅ FIX: Use state to track auth (null means it is currently checking)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // ✅ FIX: Check real storage for the token
    AsyncStorage.getItem('authToken').then(token => {
      setIsAuthenticated(!!token);
      
      // If no token is found, kick them to the login/auth screen
      if (!token) {
        router.replace('/auth');
      }
    });
  }, []);

  // Show a loading spinner while checking storage to prevent screen flashing
  if (isAuthenticated === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <RouteGuard>
      <Stack initialRouteName="splash">
        {/* NEW SPLASH SCREEN */}
        <Stack.Screen name="splash" options={{ headerShown: false }} />

        {/* Existing screens */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="language" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="otp-verification" options={{ headerShown: false }} />
        <Stack.Screen name="farm-profile" options={{ headerShown: false }} />
        <Stack.Screen name="rewards" options={{ headerShown: false }} />
        <Stack.Screen name="quiz" options={{ headerShown: false }} />
      </Stack>
    </RouteGuard>
  );
}