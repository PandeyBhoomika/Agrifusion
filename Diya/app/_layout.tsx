import { Stack } from "expo-router";

// Root layout — NO RouteGuard here.
// Public screens (splash, auth, otp) must be freely accessible.
// Protected screens handle their own auth check individually.
export default function RootLayout() {
  return (
    <Stack>
      {/* ── PUBLIC SCREENS (no auth needed) ── */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="splash" options={{ headerShown: false }} />
      <Stack.Screen name="language" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="otp-verification" options={{ headerShown: false }} />

      {/* ── PROTECTED SCREENS ── */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="farm-profile" options={{ headerShown: false }} />
      <Stack.Screen name="rewards/index" options={{ headerShown: false }} />
      <Stack.Screen name="schemes" options={{ headerShown: false }} />
      <Stack.Screen name="quiz" options={{ headerShown: false }} />
    </Stack>
  );
}
