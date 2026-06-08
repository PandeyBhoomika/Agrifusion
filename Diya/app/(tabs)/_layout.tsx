import { Tabs, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TabLayout() {
  const router = useRouter();
  
  // Track the authentication status (null means checking)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check real local storage for the auth token
    AsyncStorage.getItem('authToken').then(token => {
      setIsAuthenticated(!!token);
      
      // If no token exists, safely redirect to the public auth screen
      if (!token) {
        router.replace('/auth');
      }
    });
  }, []);

  // Show a loading indicator while reading from AsyncStorage to prevent screen flashing
  if (isAuthenticated === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  // If authenticated, allow them to view your protected tabs
  return (
    <Tabs>
      <Tabs.Screen
        name="dashboard"
        options={{ headerShown: false, title: "Dashboard" }}
      />

      <Tabs.Screen
        name="tasks"
        options={{ headerShown: false, title: "Tasks" }}
      />

      <Tabs.Screen
        name="learninghub"
        options={{ headerShown: false, title: "Learn" }}
      />

      <Tabs.Screen
        name="communitydashboard"
        options={{ headerShown: false, title: "Community" }}
      />
    </Tabs>
  );
}