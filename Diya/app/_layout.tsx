import { Stack } from "expo-router";
import { LanguageProvider } from "../context/LanguageContext";
import { UserProvider } from "../context/UserContext";
import { TaskProvider } from "../context/TaskContext";

// Root layout — wrapped with providers so every screen
// can access translations, user data, and tasks
export default function RootLayout() {
  return (
    <LanguageProvider>
      <UserProvider>
        <TaskProvider>
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
        </TaskProvider>
      </UserProvider>
    </LanguageProvider>
  );
}