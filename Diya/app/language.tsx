import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';

const LANG_KEY = 'app_language';
const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी (Hindi)' },
  { code: 'ml', label: 'മലയാളം (Malayalam)' },
  { code: 'ta', label: 'தமிழ் (Tamil)' },
  { code: 'te', label: 'తెలుగు (Telugu)' },
  { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
  { code: 'bn', label: 'বাংলা (Bengali)' },
  { code: 'mr', label: 'मराठी (Marathi)' },
  { code: 'gu', label: 'ગુજરાતી (Gujarati)' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)' },
];

export default function LanguageScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // ✅ FIX: Replaced localStorage with mobile-safe AsyncStorage
        const saved = await AsyncStorage.getItem(LANG_KEY);
        if (saved) setSelected(saved);
      } catch {
        // ignore
      }
    })();
  }, []);

  async function onContinue() {
    if (!selected) return;
    try {
      // ✅ FIX: Replaced localStorage with mobile-safe AsyncStorage
      await AsyncStorage.setItem(LANG_KEY, selected);
    } catch {
      // ignore
    }
    // go to auth and replace so user can't go back to language selection
    router.replace('/auth');
  }

  function renderItem({ item, index }: { item: typeof LANGUAGES[number]; index: number }) {
    const isActive = item.code === selected;
    return (
      <Animated.View entering={FadeInUp.delay(200 + index * 60).duration(400)}>
        <TouchableOpacity
          style={[styles.item, isActive && styles.itemActive]}
          onPress={() => setSelected(item.code)}
          accessibilityRole="button"
          accessibilityState={{ selected: isActive }}
          activeOpacity={0.75}
        >
          <Text style={[styles.label, isActive && styles.labelActive]}>{item.label}</Text>
          <View style={[styles.radioCircle, isActive && styles.radioCircleActive]}>
            {isActive && <Ionicons name="checkmark" size={16} color="#021F0F" />}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    // ✅ REDESIGN: Updated background colors to meet Auth/Onboarding design spec
    <LinearGradient
      colors={['#021F0F', '#053B24', '#0A5C38']}
      style={styles.gradient}
    >
      <StatusBar style="light" backgroundColor="transparent" />
      <SafeAreaView style={styles.container}>

        {/* --- HEADER --- */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="language" size={36} color="#22c55e" />
          </View>
          <Text style={styles.title}>Welcome to AgriFusion</Text>
          <Text style={styles.subtitle}>Select your preferred language</Text>
        </Animated.View>

        {/* --- LIST --- */}
        <FlatList
          data={LANGUAGES}
          keyExtractor={(i) => i.code}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />

        {/* --- FOOTER BUTTON --- */}
        <Animated.View entering={ZoomIn.delay(600).duration(400)} style={styles.bottomContainer}>
          <TouchableOpacity
            style={[styles.continue, !selected && styles.continueDisabled]}
            onPress={onContinue}
            disabled={!selected}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={selected ? ['#22c55e', '#16a34a'] : ['#4b6b58', '#4b6b58']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.btnGradient}
            >
              <Text style={styles.continueText}>{selected ? 'Continue →' : 'Choose a language'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  iconContainer: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#ECFDF5',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#BBF7D0',
    textAlign: 'center',
    fontWeight: '500',
  },
  list: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    paddingBottom: 110, // Avoid clearance issues with absolute positioned footer button
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.15)',
    marginBottom: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  itemActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderColor: '#4ade80',
  },
  label: {
    flex: 1,
    fontSize: 17,
    color: '#ECFDF5',
    fontWeight: '600',
  },
  labelActive: {
    color: '#4ade80',
    fontWeight: '700',
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleActive: {
    backgroundColor: '#4ade80',
    borderColor: '#4ade80',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 30,
    left: 24,
    right: 24,
  },
  continue: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  continueDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  btnGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});