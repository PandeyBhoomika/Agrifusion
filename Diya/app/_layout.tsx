import { Stack } from "expo-router";
import { LanguageProvider } from "../context/LanguageContext";

// Root layout — wrapped with LanguageProvider so every screen
// in the app can access translations via useLanguage()
export default function RootLayout() {
  return (
    <LanguageProvider>
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
    </LanguageProvider>
  );
}