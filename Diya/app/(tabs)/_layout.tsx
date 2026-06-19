import { Tabs, useRouter } from "expo-router";
import { useEffect, useState, useRef } from "react";
import { View, ActivityIndicator, Animated, Text, StyleSheet } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLanguage } from "../../context/LanguageContext";

const TabItem = ({ focused, iconName, label, isFontAwesome = false }: any) => {
  const scaleValue = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.spring(scaleValue, {
      toValue: focused ? 1.0 : 0.85,
      useNativeDriver: true,
      friction: 5,
      tension: 100,
    }).start();
  }, [focused]);

  const color = focused ? '#22c55e' : '#4b6b58';

  return (
    <Animated.View style={[styles.tabItemContainer, { transform: [{ scale: scaleValue }] }]}>
      {focused && <View style={styles.activeDot} />}
      {isFontAwesome ? (
        <FontAwesome5 name={iconName} size={20} color={color} style={styles.icon} />
      ) : (
        <Ionicons name={iconName} size={24} color={color} style={styles.icon} />
      )}
      <Text style={[styles.tabLabel, { color, fontWeight: focused ? '700' : '500' }]}>
        {label}
      </Text>
    </Animated.View>
  );
};

export default function TabLayout() {
  const router = useRouter();
  // ✅ Get translations
  const { t } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('authToken').then(token => {
      setIsAuthenticated(!!token);
      if (!token) router.replace('/auth');
    });
  }, []);

  if (isAuthenticated === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          <View style={styles.tabBarBackground}>
            <LinearGradient
              colors={['transparent', '#22c55e', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.glowLine}
            />
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          tabBarIcon: ({ focused }) => (
            // ✅ Translated tab labels
            <TabItem focused={focused} iconName="home" label={t.tabs.dashboard} />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabItem focused={focused} iconName="checkmark-circle" label={t.tabs.tasks} />
          ),
        }}
      />
      <Tabs.Screen
        name="learninghub"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabItem focused={focused} iconName="book-open" label={t.tabs.learn} isFontAwesome={true} />
          ),
        }}
      />
      <Tabs.Screen
        name="communitydashboard"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabItem focused={focused} iconName="people-circle" label={t.tabs.community} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#021F0F" },
  tabBar: { backgroundColor: '#021F0F', borderTopWidth: 0, height: 72, paddingBottom: 12, paddingTop: 8, shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 20, elevation: 20, position: 'absolute' },
  tabBarBackground: { flex: 1, backgroundColor: '#021F0F' },
  glowLine: { height: 1, width: '100%', opacity: 0.6 },
  tabItemContainer: { alignItems: 'center', justifyContent: 'center', width: 70 },
  activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22c55e', position: 'absolute', top: -8 },
  icon: { marginBottom: 4 },
  tabLabel: { fontSize: 10 },
});