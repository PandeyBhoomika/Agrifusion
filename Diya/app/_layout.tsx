import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { View, ActivityIndicator, Text } from "react-native";

function RouteGuard({ children }: { children: React.ReactNode }) {
  // TODO: Replace with real check later
  const isAuthenticated = true;

  if (!isAuthenticated) {
    return <Text>Please log in to access this content.</Text>;
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
