import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  Modal,
  FlatList,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, SlideInRight, SlideInLeft } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';

// Real Location and Storage Imports
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.103:4000/api';

const CROPS = [
  'Rice (Paddy)', 'Wheat', 'Maize (Corn)', 'Jowar (Sorghum)', 'Bajra (Pearl Millet)',
  'Ragi (Finger Millet)', 'Cotton', 'Sugarcane', 'Groundnut', 'Soybean',
  'Sunflower', 'Mustard / Rapeseed', 'Turmeric', 'Ginger', 'Onion', 'Potato',
  'Tomato', 'Chilli', 'Brinjal', 'Cabbage', 'Cauliflower', 'Peas',
  'Chickpea (Chana)', 'Pigeon Pea (Arhar)', 'Black Gram (Urad)', 'Green Gram (Moong)',
  'Lentil (Masoor)', 'Banana', 'Mango', 'Grapes', 'Pomegranate', 'Guava',
  'Papaya', 'Coconut', 'Arecanut', 'Cashew', 'Tea', 'Coffee',
];

const SOIL_TYPES = [
  { value: 'Alluvial', icon: '🟤', desc: 'Fertile, river deposits' },
  { value: 'Black (Regur)', icon: '⚫', desc: 'Retains water, cotton' },
  { value: 'Red', icon: '🔴', desc: 'Porous, coarse texture' },
  { value: 'Laterite', icon: '🧱', desc: 'Acidic, hilly terrain' },
  { value: 'Loamy', icon: '🌿', desc: 'Best for most crops' },
  { value: 'Clay', icon: '🪨', desc: 'High nutrients, dense' },
  { value: 'Sandy', icon: '🏖️', desc: 'Low moisture, arid' },
  { value: 'Mountain', icon: '⛰️', desc: 'Steep, terraced farms' },
];

const WATER_SOURCES = [
  { value: 'Abundant (River/Canal)', icon: '🌊' },
  { value: 'Borewell', icon: '💧' },
  { value: 'Rainfed Only', icon: '🌧️' },
  { value: 'Drip Irrigation', icon: '💦' },
  { value: 'Limited', icon: '⚠️' },
];

const FARMING_GOALS = [
  { id: 'profit', label: 'Maximum Profit', icon: '💰' },
  { id: 'organic', label: 'Organic Farming', icon: '🌱' },
  { id: 'quick-crop', label: 'Quick Harvest', icon: '⚡' },
  { id: 'low-effort', label: 'Low Effort', icon: '🌾' },
  { id: 'water-saving', label: 'Water Saving', icon: '💧' },
  { id: 'export', label: 'Export Quality', icon: '🌍' },
];

const SKILL_LEVELS = [
  { value: 'Beginner', icon: '🌱', desc: '0–2 years experience' },
  { value: 'Intermediate', icon: '🌿', desc: '3–7 years experience' },
  { value: 'Advanced', icon: '🌳', desc: '8+ years experience' },
  { value: 'Expert', icon: '🏆', desc: 'Master farmer' },
];

function detectSeason() {
  const m = new Date().getMonth() + 1; // 1-12
  if (m >= 6 && m <= 9) return 'Kharif (Monsoon) — Jun to Sep';
  if (m >= 10 || m <= 2) return 'Rabi (Winter) — Oct to Feb';
  return 'Zaid (Summer) — Mar to May';
}

// ─── Crop Search Modal ─────────────────────────────────────────────────────────

function CropModal({
  visible, selected, onClose, onConfirm,
}: {
  visible: boolean;
  selected: string[];
  onClose: () => void;
  onConfirm: (c: string[]) => void;
}) {
  const [q, setQ] = useState('');
  const [temp, setTemp] = useState<string[]>(selected);

  useEffect(() => { if (visible) setTemp(selected); }, [visible]);

  const filtered = CROPS.filter(c => c.toLowerCase().includes(q.toLowerCase()));

  const toggle = (crop: string) =>
    setTemp(p => p.includes(crop) ? p.filter(x => x !== crop) : [...p, crop]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={ms.wrap}>
        <View style={ms.header}>
          <Text style={ms.title}>Select Primary Crop(s)</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        <View style={ms.searchBar}>
          <Ionicons name="search" size={16} color="#9ca3af" style={{ marginRight: 8 }} />
          <TextInput
            value={q} onChangeText={setQ}
            placeholder="Search crop..." placeholderTextColor="#9ca3af"
            style={ms.searchInput} autoFocus
          />
          {q.length > 0 && (
            <TouchableOpacity onPress={() => setQ('')}>
              <Ionicons name="close-circle" size={16} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>

        {temp.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={ms.chipRow}>
            {temp.map(c => (
              <TouchableOpacity key={c} style={ms.chip} onPress={() => toggle(c)}>
                <Text style={ms.chipText}>{c}</Text>
                <Ionicons name="close" size={11} color="#fff" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <FlatList
          data={filtered} keyExtractor={i => i}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => {
            const sel = temp.includes(item);
            return (
              <TouchableOpacity style={[ms.item, sel && ms.itemSel]} onPress={() => toggle(item)} activeOpacity={0.7}>
                <Text style={[ms.itemText, sel && ms.itemTextSel]}>{item}</Text>
                {sel && <Ionicons name="checkmark-circle" size={20} color="#22c55e" />}
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={<Text style={ms.empty}>No crops found for "{q}"</Text>}
        />

        <View style={ms.foot}>
          <TouchableOpacity
            style={[ms.confirmBtn, temp.length === 0 && { opacity: 0.4 }]}
            onPress={() => { onConfirm(temp); onClose(); }}
            disabled={temp.length === 0}
          >
            <Text style={ms.confirmText}>
              Confirm{temp.length > 0 ? ` (${temp.length} selected)` : ''}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

// ─── Main 3-Step Screen ────────────────────────────────────────────────────────

export default function FarmProfile() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [goBack, setGoBack] = useState(false);
  const totalSteps = 3;

  const [isLoading, setIsLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [cropModal, setCropModal] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const [form, setForm] = useState({
    location: '', panchayat: '', district: '', state: '', farmSize: '',
    primaryCrops: [] as string[], soilType: '', waterAvailability: '',
    currentSeason: detectSeason(),
    farmingGoals: [] as string[], skillLevel: '', previousCrop: '',
  });

  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  // 1. High Accuracy GPS
  const handleGetLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Enable location permission in Settings, or enter your region manually.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      const [geo] = await Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });

      setForm(p => ({
        ...p,
        location: `${loc.coords.latitude.toFixed(4)}° N, ${loc.coords.longitude.toFixed(4)}° E`,
        panchayat: geo?.district || geo?.name || geo?.city || p.panchayat,
        district: geo?.subregion || geo?.city || p.district,
        state: geo?.region || p.state,
      }));
    } catch {
      Alert.alert('Error', 'Could not detect location. Please enter manually.');
    } finally {
      setLocationLoading(false);
    }
  };

  // 2. Step Validation
  const validate = (s: number) => {
    if (s === 1) {
      if (!form.panchayat.trim()) { Alert.alert('Required', 'Please enter your Panchayat / Village.'); return false; }
      if (!form.farmSize.trim() || isNaN(+form.farmSize)) { Alert.alert('Required', 'Please enter a valid farm size in acres.'); return false; }
    }
    if (s === 2) {
      if (form.primaryCrops.length === 0) { Alert.alert('Required', 'Please select at least one primary crop.'); return false; }
      if (!form.soilType) { Alert.alert('Required', 'Please select your soil type.'); return false; }
      if (!form.waterAvailability) { Alert.alert('Required', 'Please select your water source.'); return false; }
    }
    if (s === 3) {
      if (form.farmingGoals.length === 0) { Alert.alert('Required', 'Please select at least one farming goal.'); return false; }
      if (!form.skillLevel) { Alert.alert('Required', 'Please select your skill level.'); return false; }
    }
    return true;
  };

  const handleNext = () => {
    if (!validate(step)) return;
    if (step < totalSteps) { setGoBack(false); setStep(s => s + 1); }
    else handleSubmit();
  };

  const handleBack = () => {
    if (step > 1) { setGoBack(true); setStep(s => s - 1); }
  };

  const handleSkip = () =>
    Alert.alert('Skip Profile Setup?',
      'You can complete this later from your profile. Some personalised features will be unavailable.',
      [{ text: 'Stay', style: 'cancel' },
      {
        text: 'Skip for now', onPress: async () => {
          await AsyncStorage.setItem('profileComplete', 'true');
          router.replace('/(tabs)/dashboard');
        }
      }]);

  // 3. Real API Submit
  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('authToken');

      if (!token) {
        Alert.alert('Session Expired', 'Please sign in again.', [{ text: 'OK', onPress: () => router.replace('/login') }]);
        return;
      }

      const res = await fetch(`${API_BASE}/user/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          primaryCrops: form.primaryCrops,           // send the array, key matches backend
          farmSize: parseFloat(form.farmSize) || 0,
          soilType: form.soilType,
          region: [form.panchayat, form.district, form.state].filter(Boolean).join(', '),
          location: form.location,
          season: form.currentSeason,
          waterAvailability: form.waterAvailability,
          farmingGoals: form.farmingGoals,
          skillLevel: form.skillLevel,
          previousCrop: form.previousCrop,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || `Server error ${res.status}`);

      // Cache user and mark setup as finished
      if (data.user) await AsyncStorage.setItem('user', JSON.stringify(data.user));
      await AsyncStorage.setItem('profileComplete', 'true');

      router.replace('/(tabs)/dashboard');

    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save farm profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step Renders ─────────────────────────────────────────────────────────────

  const Slide = goBack ? SlideInLeft : SlideInRight;

  const renderStep1 = () => (
    <Animated.View key="s1" entering={Slide.duration(350)} style={s.stepContent}>
      <Text style={s.stepTitle}>📍 Location & Farm Details</Text>
      <Text style={s.stepSub}>We use this for accurate weather alerts and region-specific crop advice.</Text>

      <View style={s.field}>
        <Text style={s.label}>GPS Coordinates</Text>
        <View style={s.row}>
          <TextInput value={form.location} onChangeText={t => set('location', t)}
            placeholder="Tap 📡 or enter manually" placeholderTextColor="#9ca3af"
            onFocus={() => setFocusedField('loc')} onBlur={() => setFocusedField(null)}
            style={[s.input, { flex: 1 }, focusedField === 'loc' && s.inputFocus]}
            editable={!locationLoading} />
          <TouchableOpacity style={s.gpsBtn} onPress={handleGetLocation} disabled={locationLoading} activeOpacity={0.85}>
            {locationLoading ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="location" size={20} color="#fff" />}
          </TouchableOpacity>
        </View>
        <Text style={s.hint}>Used only for personalised recommendations.</Text>
      </View>

      <View style={s.field}>
        <Text style={s.label}>Panchayat / Village <Text style={s.req}>*</Text></Text>
        <TextInput value={form.panchayat} onChangeText={t => set('panchayat', t)}
          placeholder="E.g. Kharadi" placeholderTextColor="#9ca3af"
          onFocus={() => setFocusedField('pan')} onBlur={() => setFocusedField(null)}
          style={[s.input, focusedField === 'pan' && s.inputFocus]} />
      </View>

      <View style={s.rowGrid}>
        <View style={[s.field, { flex: 1, marginRight: 10 }]}>
          <Text style={s.label}>District</Text>
          <TextInput value={form.district} onChangeText={t => set('district', t)}
            placeholder="E.g. Pune" placeholderTextColor="#9ca3af"
            onFocus={() => setFocusedField('dis')} onBlur={() => setFocusedField(null)}
            style={[s.input, focusedField === 'dis' && s.inputFocus]} />
        </View>
        <View style={[s.field, { flex: 1 }]}>
          <Text style={s.label}>State</Text>
          <TextInput value={form.state} onChangeText={t => set('state', t)}
            placeholder="E.g. Maharashtra" placeholderTextColor="#9ca3af"
            onFocus={() => setFocusedField('sta')} onBlur={() => setFocusedField(null)}
            style={[s.input, focusedField === 'sta' && s.inputFocus]} />
        </View>
      </View>

      <View style={s.field}>
        <Text style={s.label}>Farm Size (acres) <Text style={s.req}>*</Text></Text>
        <TextInput value={form.farmSize} onChangeText={t => set('farmSize', t)}
          placeholder="E.g. 2.5" placeholderTextColor="#9ca3af" keyboardType="decimal-pad"
          onFocus={() => setFocusedField('fs')} onBlur={() => setFocusedField(null)}
          style={[s.input, focusedField === 'fs' && s.inputFocus]} />
      </View>
    </Animated.View>
  );

  const renderStep2 = () => (
    <Animated.View key="s2" entering={Slide.duration(350)} style={s.stepContent}>
      <Text style={s.stepTitle}>🌾 Crops & Resources</Text>
      <Text style={s.stepSub}>Helps us tailor irrigation schedules, fertiliser tips and mission cards.</Text>

      <View style={s.field}>
        <Text style={s.label}>Primary Crop(s) <Text style={s.req}>*</Text></Text>
        <TouchableOpacity
          style={[s.input, s.dropTrigger, form.primaryCrops.length > 0 && s.inputFocus]}
          onPress={() => setCropModal(true)} activeOpacity={0.8}>
          <Text style={form.primaryCrops.length > 0 ? s.dropVal : s.dropPlaceholder} numberOfLines={1}>
            {form.primaryCrops.length > 0 ? form.primaryCrops.join(', ') : 'Tap to search and select crops'}
          </Text>
          <Ionicons name="chevron-down" size={18} color="#9ca3af" />
        </TouchableOpacity>
        {form.primaryCrops.length > 0 && <Text style={s.hint}>{form.primaryCrops.length} crop(s) selected. Tap to edit.</Text>}
      </View>

      <View style={s.field}>
        <Text style={s.label}>Soil Type <Text style={s.req}>*</Text></Text>
        <View style={s.soilGrid}>
          {SOIL_TYPES.map((soil, idx) => {
            const sel = form.soilType === soil.value;
            return (
              <TouchableOpacity key={soil.value}
                style={[s.soilCard, sel && s.soilCardSel, { marginRight: idx % 2 === 0 ? '4%' : 0 }]}
                onPress={() => set('soilType', soil.value)} activeOpacity={0.75}>
                <Text style={s.soilIcon}>{soil.icon}</Text>
                <Text style={[s.soilLabel, sel && s.soilLabelSel]}>{soil.value}</Text>
                <Text style={[s.soilDesc, sel && s.soilDescSel]}>{soil.desc}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={s.field}>
        <Text style={s.label}>Water Source <Text style={s.req}>*</Text></Text>
        {WATER_SOURCES.map(w => {
          const sel = form.waterAvailability === w.value;
          return (
            <TouchableOpacity key={w.value}
              style={[s.radioRow, sel && s.radioRowSel]}
              onPress={() => set('waterAvailability', w.value)} activeOpacity={0.75}>
              <View style={[s.radioCircle, sel && s.radioCircleActive]}>
                {sel && <Ionicons name="checkmark" size={13} color="#fff" />}
              </View>
              <Text style={s.radioIcon}>{w.icon}</Text>
              <Text style={[s.radioLabel, sel && s.radioLabelSel]}>{w.value}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={s.field}>
        <Text style={s.label}>Current Agricultural Season</Text>
        <View style={s.seasonBox}>
          <Text style={s.seasonIcon}>🌤️</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.seasonText}>{form.currentSeason}</Text>
            <Text style={s.seasonSub}>Auto-detected from today's date</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );

  const renderStep3 = () => (
    <Animated.View key="s3" entering={Slide.duration(350)} style={s.stepContent}>
      <Text style={s.stepTitle}>🎯 Goals & Experience</Text>
      <Text style={s.stepSub}>So we can assign the most relevant sustainable farming missions to you.</Text>

      <View style={s.field}>
        <Text style={s.label}>Farming Goals <Text style={s.req}>*</Text></Text>
        <Text style={s.hint}>Select all that apply.</Text>
        <View style={s.goalGrid}>
          {FARMING_GOALS.map((goal, idx) => {
            const sel = form.farmingGoals.includes(goal.id);
            return (
              <TouchableOpacity key={goal.id}
                style={[
                  s.goalCard,
                  sel && s.goalCardSel,
                  { marginRight: idx % 3 !== 2 ? '3.5%' : 0, marginBottom: 10 },
                ]}
                onPress={() => set('farmingGoals', sel
                  ? form.farmingGoals.filter(g => g !== goal.id)
                  : [...form.farmingGoals, goal.id]
                )} activeOpacity={0.75}>
                {sel && <View style={s.goalCheck}><Ionicons name="checkmark-circle" size={15} color="#22c55e" /></View>}
                <Text style={s.goalIcon}>{goal.icon}</Text>
                <Text style={[s.goalLabel, sel && s.goalLabelSel]}>{goal.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={s.field}>
        <Text style={s.label}>Skill Level <Text style={s.req}>*</Text></Text>
        {SKILL_LEVELS.map(skill => {
          const sel = form.skillLevel === skill.value;
          return (
            <TouchableOpacity key={skill.value}
              style={[s.skillRow, sel && s.skillRowSel]}
              onPress={() => set('skillLevel', skill.value)} activeOpacity={0.75}>
              <Text style={s.skillIcon}>{skill.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[s.skillLabel, sel && s.skillLabelSel]}>{skill.value}</Text>
                <Text style={s.skillDesc}>{skill.desc}</Text>
              </View>
              {sel && <Ionicons name="checkmark-circle" size={22} color="#22c55e" />}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={s.field}>
        <Text style={s.label}>Previous Crop <Text style={s.opt}>(Optional)</Text></Text>
        <TextInput value={form.previousCrop} onChangeText={t => set('previousCrop', t)}
          placeholder="E.g. Wheat, Cotton" placeholderTextColor="#9ca3af"
          onFocus={() => setFocusedField('pc')} onBlur={() => setFocusedField(null)}
          style={[s.input, focusedField === 'pc' && s.inputFocus]} />
        <Text style={s.hint}>Helps suggest better crop rotation and soil recovery.</Text>
      </View>
    </Animated.View>
  );

  // ── Root render ───────────────────────────────────────────────────────────────
  return (
    <LinearGradient colors={['#d4efdd', '#c8e8d4', '#b8dfc8']} style={s.gradient}>
      <StatusBar style="dark" backgroundColor="transparent" />
      <SafeAreaView style={s.safe}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

          {/* Header */}
          <Animated.View entering={FadeInDown.delay(80).duration(400)} style={s.header}>
            <View>
              <Text style={s.headerTitle}>Farm Profile Setup</Text>
              <Text style={s.headerSub}>Step {step} of {totalSteps}</Text>
            </View>
            <TouchableOpacity style={s.skipBtn} onPress={handleSkip} activeOpacity={0.7}>
              <Text style={s.skipText}>Skip</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Progress bar */}
          <Animated.View entering={FadeInDown.delay(140).duration(400)} style={s.progressWrap}>
            <View style={s.track}>
              <View style={[s.fill, { width: `${(step / totalSteps) * 100}%` }]} />
            </View>
            <View style={s.stepsRow}>
              {['Location', 'Crops', 'Goals'].map((label, i) => {
                const n = i + 1;
                const done = step > n; const active = step === n;
                return (
                  <View key={n} style={s.dotWrap}>
                    <View style={[s.dot, active && s.dotActive, done && s.dotDone]}>
                      {done
                        ? <Ionicons name="checkmark" size={10} color="#fff" />
                        : <Text style={[s.dotNum, active && s.dotNumActive]}>{n}</Text>}
                    </View>
                    <Text style={[s.dotLabel, active && s.dotLabelActive]}>{label}</Text>
                  </View>
                );
              })}
            </View>
          </Animated.View>

          {/* Scrollable form with key={step} to force re-render/animation */}
          <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View key={step} style={s.card}>
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
            </View>
          </ScrollView>

          {/* Footer buttons */}
          <Animated.View entering={FadeInUp.delay(250).duration(400)} style={s.footer}>
            {step > 1 ? (
              <TouchableOpacity style={s.backBtn} onPress={handleBack} activeOpacity={0.75}>
                <Ionicons name="arrow-back" size={17} color="#166534" style={{ marginRight: 5 }} />
                <Text style={s.backBtnText}>Back</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ flex: 1, marginRight: 12 }} />
            )}
            <TouchableOpacity style={[s.nextBtn, isLoading && { opacity: 0.65 }]}
              onPress={handleNext} disabled={isLoading} activeOpacity={0.85}>
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={s.nextBtnText}>{step === totalSteps ? 'Complete Setup' : 'Continue'}</Text>
                  {step < totalSteps && <Ionicons name="arrow-forward" size={17} color="#fff" style={{ marginLeft: 5 }} />}
                </>
              )}
            </TouchableOpacity>
          </Animated.View>

        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Crop Modal */}
      <CropModal
        visible={cropModal}
        selected={form.primaryCrops}
        onClose={() => setCropModal(false)}
        onConfirm={crops => set('primaryCrops', crops)}
      />
    </LinearGradient>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: Platform.OS === 'android' ? 44 : 16, paddingBottom: 10 },
  headerTitle: { fontSize: 23, fontWeight: '800', color: '#14532d', letterSpacing: -0.4 },
  headerSub: { fontSize: 13, color: '#166534', marginTop: 2, fontWeight: '600' },
  skipBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: 'rgba(22,101,52,0.35)', backgroundColor: 'rgba(255,255,255,0.5)' },
  skipText: { fontSize: 13, color: '#166534', fontWeight: '700' },

  progressWrap: { paddingHorizontal: 24, marginBottom: 8 },
  track: { height: 5, backgroundColor: 'rgba(34,197,94,0.18)', borderRadius: 10, overflow: 'hidden', marginBottom: 12 },
  fill: { height: '100%', backgroundColor: '#22c55e', borderRadius: 10 },
  stepsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dotWrap: { alignItems: 'center', flex: 1 },
  dot: { width: 25, height: 25, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.6)', borderWidth: 2, borderColor: 'rgba(34,197,94,0.35)', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  dotActive: { backgroundColor: '#22c55e', borderColor: '#22c55e' },
  dotDone: { backgroundColor: '#16a34a', borderColor: '#16a34a' },
  dotNum: { fontSize: 10, fontWeight: '700', color: '#6b7280' },
  dotNumActive: { color: '#fff' },
  dotLabel: { fontSize: 11, color: '#6b7280', fontWeight: '600' },
  dotLabelActive: { color: '#14532d', fontWeight: '800' },

  scrollContent: { paddingHorizontal: 20, paddingBottom: 32 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 22, borderWidth: 1, borderColor: 'rgba(34,197,94,0.18)', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 16, elevation: 5 },
  stepContent: { width: '100%' },
  stepTitle: { fontSize: 18, fontWeight: '800', color: '#14532d', marginBottom: 5, letterSpacing: -0.3 },
  stepSub: { fontSize: 13, color: '#6b7280', marginBottom: 20, lineHeight: 19, fontWeight: '500' },

  field: { marginBottom: 20 },
  rowGrid: { flexDirection: 'row' },
  label: { fontSize: 13, fontWeight: '700', color: '#166534', marginBottom: 8 },
  req: { color: '#ef4444' },
  opt: { color: '#9ca3af', fontWeight: '500' },
  row: { flexDirection: 'row', alignItems: 'center' },
  input: { height: 52, backgroundColor: '#f9fafb', borderRadius: 14, paddingHorizontal: 16, borderWidth: 1.5, borderColor: '#e5e7eb', fontSize: 14.5, color: '#1f2937' },
  inputFocus: { borderColor: '#22c55e', backgroundColor: '#f0fdf4' },
  hint: { fontSize: 11.5, color: '#9ca3af', marginTop: 5, fontWeight: '500' },
  gpsBtn: { height: 52, width: 52, backgroundColor: '#22c55e', borderRadius: 14, marginLeft: 10, alignItems: 'center', justifyContent: 'center', shadowColor: '#22c55e', shadowOpacity: 0.35, shadowRadius: 6, elevation: 3 },

  dropTrigger: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dropPlaceholder: { color: '#9ca3af', fontSize: 14.5, flex: 1 },
  dropVal: { color: '#1f2937', fontSize: 13.5, fontWeight: '600', flex: 1 },

  // Using percentages to avoid 'gap' issues
  soilGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  soilCard: { width: '48%', backgroundColor: '#f9fafb', borderRadius: 13, borderWidth: 1.5, borderColor: '#e5e7eb', padding: 11, alignItems: 'center', marginBottom: 8 },
  soilCardSel: { backgroundColor: '#f0fdf4', borderColor: '#22c55e' },
  soilIcon: { fontSize: 22, marginBottom: 4 },
  soilLabel: { fontSize: 12.5, fontWeight: '700', color: '#374151', textAlign: 'center' },
  soilLabelSel: { color: '#14532d' },
  soilDesc: { fontSize: 10.5, color: '#9ca3af', textAlign: 'center', marginTop: 2 },
  soilDescSel: { color: '#166534' },

  radioRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 14, backgroundColor: '#f9fafb', borderRadius: 13, borderWidth: 1.5, borderColor: '#e5e7eb', marginBottom: 9 },
  radioRowSel: { backgroundColor: '#f0fdf4', borderColor: '#22c55e' },
  radioCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#d1d5db', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  radioCircleActive: { backgroundColor: '#22c55e', borderColor: '#22c55e' },
  radioIcon: { fontSize: 17, marginRight: 10 },
  radioLabel: { fontSize: 13.5, color: '#4b5563', fontWeight: '600', flex: 1 },
  radioLabelSel: { color: '#14532d', fontWeight: '800' },

  seasonBox: { backgroundColor: '#f0fdf4', padding: 15, borderRadius: 13, borderWidth: 1.5, borderColor: 'rgba(34,197,94,0.3)', flexDirection: 'row', alignItems: 'center' },
  seasonIcon: { fontSize: 26, marginRight: 12 },
  seasonText: { fontSize: 14.5, fontWeight: '800', color: '#14532d' },
  seasonSub: { fontSize: 11, color: '#166534', marginTop: 2, fontWeight: '500' },

  goalGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
  goalCard: { width: '31%', backgroundColor: '#f9fafb', borderRadius: 13, borderWidth: 1.5, borderColor: '#e5e7eb', padding: 11, alignItems: 'center', position: 'relative' },
  goalCardSel: { backgroundColor: '#f0fdf4', borderColor: '#22c55e' },
  goalCheck: { position: 'absolute', top: 5, right: 5 },
  goalIcon: { fontSize: 26, marginBottom: 5 },
  goalLabel: { fontSize: 11, fontWeight: '600', color: '#4b5563', textAlign: 'center' },
  goalLabelSel: { color: '#14532d', fontWeight: '800' },

  skillRow: { flexDirection: 'row', alignItems: 'center', padding: 13, backgroundColor: '#f9fafb', borderRadius: 13, borderWidth: 1.5, borderColor: '#e5e7eb', marginBottom: 9 },
  skillRowSel: { backgroundColor: '#f0fdf4', borderColor: '#22c55e' },
  skillIcon: { fontSize: 22, marginRight: 12 },
  skillLabel: { fontSize: 13.5, fontWeight: '700', color: '#374151' },
  skillLabelSel: { color: '#14532d' },
  skillDesc: { fontSize: 11.5, color: '#9ca3af', marginTop: 2 },

  footer: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 14, paddingBottom: Platform.OS === 'ios' ? 26 : 14 },
  backBtn: { flex: 1, paddingVertical: 15, borderRadius: 15, borderWidth: 1.5, borderColor: '#166534', alignItems: 'center', justifyContent: 'center', marginRight: 12, flexDirection: 'row' },
  backBtnText: { fontSize: 14.5, fontWeight: '800', color: '#166534' },
  nextBtn: { flex: 2, paddingVertical: 15, borderRadius: 15, backgroundColor: '#22c55e', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', shadowColor: '#22c55e', shadowOpacity: 0.35, shadowRadius: 8, elevation: 4 },
  nextBtnText: { fontSize: 14.5, fontWeight: '800', color: '#fff' },
});

// ─── Modal Styles ──────────────────────────────────────────────────────────────

const ms = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderColor: '#f3f4f6' },
  title: { fontSize: 17, fontWeight: '800', color: '#14532d' },
  searchBar: { flexDirection: 'row', alignItems: 'center', margin: 14, paddingHorizontal: 13, paddingVertical: 10, backgroundColor: '#f9fafb', borderRadius: 13, borderWidth: 1.5, borderColor: '#e5e7eb' },
  searchInput: { flex: 1, fontSize: 15, color: '#1f2937' },
  chipRow: { paddingHorizontal: 14, marginBottom: 6, maxHeight: 42 },
  chip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#22c55e', borderRadius: 20, paddingHorizontal: 11, paddingVertical: 5, marginRight: 7 },
  chipText: { fontSize: 12.5, color: '#fff', fontWeight: '700' },
  item: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderColor: '#f3f4f6' },
  itemSel: { backgroundColor: '#f0fdf4' },
  itemText: { fontSize: 15, color: '#374151', fontWeight: '500' },
  itemTextSel: { color: '#14532d', fontWeight: '700' },
  empty: { textAlign: 'center', color: '#9ca3af', fontSize: 14, paddingTop: 40 },
  foot: { paddingHorizontal: 20, paddingVertical: 14, paddingBottom: Platform.OS === 'ios' ? 30 : 14, borderTopWidth: 1, borderColor: '#f3f4f6' },
  confirmBtn: { backgroundColor: '#22c55e', borderRadius: 15, paddingVertical: 15, alignItems: 'center', shadowColor: '#22c55e', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  confirmText: { fontSize: 15, fontWeight: '800', color: '#fff' },
});