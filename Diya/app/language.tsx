import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

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
        const saved = localStorage.getItem(LANG_KEY);
        if (saved) setSelected(saved);
      } catch {
        // ignore
      }
    })();
  }, []);

  async function onContinue() {
    if (!selected) return;
    try {
      localStorage.setItem(LANG_KEY, selected);
    } catch {
      // ignore
    }
    // go to auth and replace so user can't go back to language selection
    router.replace('/auth');
  }

  function renderItem({ item }: { item: typeof LANGUAGES[number] }) {
    const isActive = item.code === selected;
    return (
      <TouchableOpacity
        style={[styles.item, isActive && styles.itemActive]}
        onPress={() => setSelected(item.code)}
        accessibilityRole="button"
        accessibilityState={{ selected: isActive }}
      >
        <Text style={[styles.label, isActive && styles.labelActive]}>{item.label}</Text>
        {isActive && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
    );
  }

  return (
    <LinearGradient
      colors={['#FAF3E0', '#DFF2D8']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.headerIcon}>🌾</Text>
        </View>
        <Text style={styles.title}>Welcome to AgriFusion</Text>
        <Text style={styles.subtitle}>Select your preferred language</Text>
      </View>
      
      <FlatList
        data={LANGUAGES}
        keyExtractor={(i) => i.code}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
      
      <TouchableOpacity
        style={[styles.continue, !selected && styles.continueDisabled]}
        onPress={onContinue}
        disabled={!selected}
      >
        <Text style={styles.continueText}>{selected ? 'Continue →' : 'Choose a language'}</Text>
      </TouchableOpacity>
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
    paddingTop: 50,
    paddingBottom: 32,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  headerIcon: {
    fontSize: 45,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  list: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginBottom: 14,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  itemActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
    borderWidth: 2.5,
    shadowColor: '#10B981',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    transform: [{ scale: 1.02 }],
  },
  label: {
    flex: 1,
    fontSize: 18,
    color: '#374151',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  labelActive: {
    color: '#047857',
    fontWeight: '700',
  },
  checkmark: {
    fontSize: 24,
    color: '#10B981',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  continue: {
    marginHorizontal: 24,
    marginBottom: 40,
    marginTop: 20,
    paddingVertical: 18,
    borderRadius: 16,
    backgroundColor: '#10B981',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  continueDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
  continueText: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});