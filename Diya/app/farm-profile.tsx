import React, { useState, useEffect } from 'react';
import {
  SafeAreaView, View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Alert, ActivityIndicator,
  Platform, Modal, FlatList, KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, SlideInRight, SlideInLeft } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../context/LanguageContext';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.103:4000/api';

// ✅ Crops are now translated via t.crops.*
function getCrops(t: any): string[] {
  return [
    t.crops.rice, t.crops.wheat, t.crops.maize, t.crops.jowar, t.crops.bajra,
    t.crops.ragi, t.crops.cotton, t.crops.sugarcane, t.crops.groundnut, t.crops.soybean,
    t.crops.sunflower, t.crops.mustard, t.crops.turmeric, t.crops.ginger, t.crops.onion, t.crops.potato,
    t.crops.tomato, t.crops.chilli, t.crops.brinjal, t.crops.cabbage, t.crops.cauliflower, t.crops.peas,
    t.crops.chickpea, t.crops.pigeonPea, t.crops.blackGram, t.crops.greenGram,
    t.crops.lentil, t.crops.banana, t.crops.mango, t.crops.grapes, t.crops.pomegranate, t.crops.guava,
    t.crops.papaya, t.crops.coconut, t.crops.arecanut, t.crops.cashew, t.crops.tea, t.crops.coffee,
  ];
}

// ✅ These are now functions that take `t` — called inside the component
function getSoilTypes(t: any) {
  return [
    { value: 'Alluvial', icon: '🟤', label: t.farmData.soilAlluvial, desc: t.farmData.soilAlluvialDesc },
    { value: 'Black (Regur)', icon: '⚫', label: t.farmData.soilBlack, desc: t.farmData.soilBlackDesc },
    { value: 'Red', icon: '🔴', label: t.farmData.soilRed, desc: t.farmData.soilRedDesc },
    { value: 'Laterite', icon: '🧱', label: t.farmData.soilLaterite, desc: t.farmData.soilLateriteDesc },
    { value: 'Loamy', icon: '🌿', label: t.farmData.soilLoamy, desc: t.farmData.soilLoamyDesc },
    { value: 'Clay', icon: '🪨', label: t.farmData.soilClay, desc: t.farmData.soilClayDesc },
    { value: 'Sandy', icon: '🏖️', label: t.farmData.soilSandy, desc: t.farmData.soilSandyDesc },
    { value: 'Mountain', icon: '⛰️', label: t.farmData.soilMountain, desc: t.farmData.soilMountainDesc },
  ];
}

function getWaterSources(t: any) {
  return [
    { value: 'Abundant (River/Canal)', icon: '🌊', label: t.farmData.waterAbundant },
    { value: 'Borewell', icon: '💧', label: t.farmData.waterBorewell },
    { value: 'Rainfed Only', icon: '🌧️', label: t.farmData.waterRainfed },
    { value: 'Drip Irrigation', icon: '💦', label: t.farmData.waterDrip },
    { value: 'Limited', icon: '⚠️', label: t.farmData.waterLimited },
  ];
}

function getFarmingGoals(t: any) {
  return [
    { id: 'profit', label: t.farmData.goalProfit, icon: '💰' },
    { id: 'organic', label: t.farmData.goalOrganic, icon: '🌱' },
    { id: 'quick-crop', label: t.farmData.goalQuick, icon: '⚡' },
    { id: 'low-effort', label: t.farmData.goalLowEffort, icon: '🌾' },
    { id: 'water-saving', label: t.farmData.goalWater, icon: '💧' },
    { id: 'export', label: t.farmData.goalExport, icon: '🌍' },
  ];
}

function getSkillLevels(t: any) {
  return [
    { value: 'Beginner', icon: '🌱', label: t.farmData.skillBeginner, desc: t.farmData.skillBeginnerDesc },
    { value: 'Intermediate', icon: '🌿', label: t.farmData.skillIntermediate, desc: t.farmData.skillIntermediateDesc },
    { value: 'Advanced', icon: '🌳', label: t.farmData.skillAdvanced, desc: t.farmData.skillAdvancedDesc },
    { value: 'Expert', icon: '🏆', label: t.farmData.skillExpert, desc: t.farmData.skillExpertDesc },
  ];
}

function detectSeason(t: any): string {
  const m = new Date().getMonth() + 1;
  if (m >= 6 && m <= 9) return t.farmProfile.seasonKharif;
  if (m >= 10 || m <= 2) return t.farmProfile.seasonRabi;
  return t.farmProfile.seasonZaid;
}

// ─── Crop Search Modal ────────────────────────────────────────────────────────
function CropModal({
  visible, selected, onClose, onConfirm, t,
}: {
  visible: boolean;
  selected: string[];
  onClose: () => void;
  onConfirm: (c: string[]) => void;
  t: any;
}) {
  const [q, setQ] = useState('');
  const [temp, setTemp] = useState<string[]>(selected);

  useEffect(() => { if (visible) setTemp(selected); }, [visible]);

  const CROPS = getCrops(t);
const filtered = CROPS.filter(c => c.toLowerCase().includes(q.toLowerCase()));
  const toggle = (crop: string) =>
    setTemp(p => p.includes(crop) ? p.filter(x => x !== crop) : [...p, crop]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={ms.wrap}>
        <View style={ms.header}>
          <Text style={ms.title}>{t.farmProfile.selectCropsTitle}</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        <View style={ms.searchBar}>
          <Ionicons name="search" size={16} color="#9ca3af" style={{ marginRight: 8 }} />
          <TextInput
            value={q} onChangeText={setQ}
            placeholder={t.farmProfile.searchCrop}
            placeholderTextColor="#9ca3af"
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
          ListEmptyComponent={
            <Text style={ms.empty}>
              {t.farmProfile.noCropsFound.replace('{query}', q)}
            </Text>
          }
        />

        <View style={ms.foot}>
          <TouchableOpacity
            style={[ms.confirmBtn, temp.length === 0 && { opacity: 0.4 }]}
            onPress={() => { onConfirm(temp); onClose(); }}
            disabled={temp.length === 0}
          >
            <Text style={ms.confirmText}>
              {temp.length > 0
                ? t.farmProfile.confirmSelected.replace('{count}', String(temp.length))
                : t.common.confirm}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

// ─── Main 3-Step Screen ───────────────────────────────────────────────────────
export default function FarmProfile() {
  const router = useRouter();
  const { t } = useLanguage();

  // ✅ Build translated arrays inside component so they react to language changes
  const SOIL_TYPES = getSoilTypes(t);
  const WATER_SOURCES = getWaterSources(t);
  const FARMING_GOALS = getFarmingGoals(t);
  const SKILL_LEVELS = getSkillLevels(t);

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
    currentSeason: detectSeason(t),
    farmingGoals: [] as string[], skillLevel: '', previousCrop: '',
  });

  // ✅ Re-detect season label when language changes
  useEffect(() => {
    setForm(p => ({ ...p, currentSeason: detectSeason(t) }));
  }, [t]);

  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  const handleGetLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t.common.error, 'Enable location permission in Settings, or enter your region manually.');
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
      Alert.alert(t.common.error, 'Could not detect location. Please enter manually.');
    } finally {
      setLocationLoading(false);
    }
  };

  const validate = (step: number) => {
    if (step === 1) {
      if (!form.panchayat.trim()) { Alert.alert(t.common.required, t.farmProfile.enterPanchayat); return false; }
      if (!form.farmSize.trim() || isNaN(+form.farmSize)) { Alert.alert(t.common.required, t.farmProfile.enterFarmSize); return false; }
    }
    if (step === 2) {
      if (form.primaryCrops.length === 0) { Alert.alert(t.common.required, t.farmProfile.selectCrop); return false; }
      if (!form.soilType) { Alert.alert(t.common.required, t.farmProfile.selectSoil); return false; }
      if (!form.waterAvailability) { Alert.alert(t.common.required, t.farmProfile.selectWater); return false; }
    }
    if (step === 3) {
      if (form.farmingGoals.length === 0) { Alert.alert(t.common.required, t.farmProfile.selectGoal); return false; }
      if (!form.skillLevel) { Alert.alert(t.common.required, t.farmProfile.selectSkill); return false; }
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
    Alert.alert(
      t.farmProfile.skipConfirmTitle,
      t.farmProfile.skipConfirmMessage,
      [
        { text: t.farmProfile.skipStay, style: 'cancel' },
        {
          text: t.farmProfile.skipConfirm, onPress: async () => {
            await AsyncStorage.setItem('profileComplete', 'true');
            router.replace('/(tabs)/dashboard');
          }
        }
      ]
    );

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert(t.common.error, t.auth.sessionExpired, [{ text: 'OK', onPress: () => router.replace('/auth') }]);
        return;
      }
      const res = await fetch(`${API_BASE}/user/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          primaryCrop: form.primaryCrops.join(', '),
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
      if (data.user) await AsyncStorage.setItem('user', JSON.stringify(data.user));
      await AsyncStorage.setItem('profileComplete', 'true');
      router.replace('/(tabs)/dashboard');
    } catch (err: any) {
      Alert.alert(t.common.error, err.message || 'Failed to save farm profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const Slide = goBack ? SlideInLeft : SlideInRight;

  // ─── Step 1 ────────────────────────────────────────────────────────────────
  const renderStep1 = () => (
    <Animated.View key="s1" entering={Slide.duration(350)} style={s.stepContent}>
      <Text style={s.stepTitle}>{t.farmProfile.step1Title}</Text>
      <Text style={s.stepSub}>{t.farmProfile.step1Sub}</Text>

      <View style={s.field}>
        <Text style={s.label}>{t.farmProfile.gpsCoords}</Text>
        <View style={s.row}>
          <TextInput
            value={form.location} onChangeText={v => set('location', v)}
            placeholder={t.farmProfile.gpsPlaceholder}
            placeholderTextColor="#9ca3af"
            onFocus={() => setFocusedField('loc')} onBlur={() => setFocusedField(null)}
            style={[s.input, { flex: 1 }, focusedField === 'loc' && s.inputFocus]}
            editable={!locationLoading}
          />
          <TouchableOpacity style={s.gpsBtn} onPress={handleGetLocation} disabled={locationLoading} activeOpacity={0.85}>
            {locationLoading ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="location" size={20} color="#fff" />}
          </TouchableOpacity>
        </View>
        <Text style={s.hint}>{t.farmProfile.gpsHint}</Text>
      </View>

      <View style={s.field}>
        <Text style={s.label}>{t.farmProfile.panchayat} <Text style={s.req}>*</Text></Text>
        <TextInput value={form.panchayat} onChangeText={v => set('panchayat', v)}
          placeholder={t.farmProfile.panchayatPlaceholder} placeholderTextColor="#9ca3af"
          onFocus={() => setFocusedField('pan')} onBlur={() => setFocusedField(null)}
          style={[s.input, focusedField === 'pan' && s.inputFocus]} />
      </View>

      <View style={s.rowGrid}>
        <View style={[s.field, { flex: 1, marginRight: 10 }]}>
          <Text style={s.label}>{t.farmProfile.district}</Text>
          <TextInput value={form.district} onChangeText={v => set('district', v)}
            placeholder={t.farmProfile.districtPlaceholder} placeholderTextColor="#9ca3af"
            onFocus={() => setFocusedField('dis')} onBlur={() => setFocusedField(null)}
            style={[s.input, focusedField === 'dis' && s.inputFocus]} />
        </View>
        <View style={[s.field, { flex: 1 }]}>
          <Text style={s.label}>{t.farmProfile.stateName}</Text>
          <TextInput value={form.state} onChangeText={v => set('state', v)}
            placeholder={t.farmProfile.statePlaceholder} placeholderTextColor="#9ca3af"
            onFocus={() => setFocusedField('sta')} onBlur={() => setFocusedField(null)}
            style={[s.input, focusedField === 'sta' && s.inputFocus]} />
        </View>
      </View>

      <View style={s.field}>
        <Text style={s.label}>{t.farmProfile.farmSize} <Text style={s.req}>*</Text></Text>
        <TextInput value={form.farmSize} onChangeText={v => set('farmSize', v)}
          placeholder={t.farmProfile.farmSizePlaceholder} placeholderTextColor="#9ca3af"
          keyboardType="decimal-pad"
          onFocus={() => setFocusedField('fs')} onBlur={() => setFocusedField(null)}
          style={[s.input, focusedField === 'fs' && s.inputFocus]} />
      </View>
    </Animated.View>
  );

  // ─── Step 2 ────────────────────────────────────────────────────────────────
  const renderStep2 = () => (
    <Animated.View key="s2" entering={Slide.duration(350)} style={s.stepContent}>
      <Text style={s.stepTitle}>{t.farmProfile.step2Title}</Text>
      <Text style={s.stepSub}>{t.farmProfile.step2Sub}</Text>

      <View style={s.field}>
        <Text style={s.label}>{t.farmProfile.primaryCrops} <Text style={s.req}>*</Text></Text>
        <TouchableOpacity
          style={[s.input, s.dropTrigger, form.primaryCrops.length > 0 && s.inputFocus]}
          onPress={() => setCropModal(true)} activeOpacity={0.8}>
          <Text style={form.primaryCrops.length > 0 ? s.dropVal : s.dropPlaceholder} numberOfLines={1}>
            {form.primaryCrops.length > 0 ? form.primaryCrops.join(', ') : t.farmProfile.cropsPlaceholder}
          </Text>
          <Ionicons name="chevron-down" size={18} color="#9ca3af" />
        </TouchableOpacity>
        {form.primaryCrops.length > 0 && (
          <Text style={s.hint}>
            {t.farmProfile.cropsHint.replace('{count}', String(form.primaryCrops.length))}
          </Text>
        )}
      </View>

      <View style={s.field}>
        <Text style={s.label}>{t.farmProfile.soilType} <Text style={s.req}>*</Text></Text>
        <View style={s.soilGrid}>
          {/* ✅ Now using .label and .desc from translated arrays */}
          {SOIL_TYPES.map((soil, idx) => {
            const sel = form.soilType === soil.value;
            return (
              <TouchableOpacity key={soil.value}
                style={[s.soilCard, sel && s.soilCardSel, { marginRight: idx % 2 === 0 ? '4%' : 0 }]}
                onPress={() => set('soilType', soil.value)} activeOpacity={0.75}>
                <Text style={s.soilIcon}>{soil.icon}</Text>
                {/* ✅ soil.label instead of soil.value */}
                <Text style={[s.soilLabel, sel && s.soilLabelSel]}>{soil.label}</Text>
                <Text style={[s.soilDesc, sel && s.soilDescSel]}>{soil.desc}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={s.field}>
        <Text style={s.label}>{t.farmProfile.waterSource} <Text style={s.req}>*</Text></Text>
        {/* ✅ Now using .label from translated arrays */}
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
              {/* ✅ w.label instead of w.value */}
              <Text style={[s.radioLabel, sel && s.radioLabelSel]}>{w.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={s.field}>
        <Text style={s.label}>{t.farmProfile.currentSeason}</Text>
        <View style={s.seasonBox}>
          <Text style={s.seasonIcon}>🌤️</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.seasonText}>{form.currentSeason}</Text>
            <Text style={s.seasonSub}>{t.farmProfile.seasonAutoDetected}</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );

  // ─── Step 3 ────────────────────────────────────────────────────────────────
  const renderStep3 = () => (
    <Animated.View key="s3" entering={Slide.duration(350)} style={s.stepContent}>
      <Text style={s.stepTitle}>{t.farmProfile.step3Title}</Text>
      <Text style={s.stepSub}>{t.farmProfile.step3Sub}</Text>

      <View style={s.field}>
        <Text style={s.label}>{t.farmProfile.farmingGoals} <Text style={s.req}>*</Text></Text>
        <Text style={s.hint}>{t.farmProfile.goalsHint}</Text>
        <View style={s.goalGrid}>
          {/* ✅ FARMING_GOALS already uses t.farmData.goalXxx labels */}
          {FARMING_GOALS.map((goal, idx) => {
            const sel = form.farmingGoals.includes(goal.id);
            return (
              <TouchableOpacity key={goal.id}
                style={[s.goalCard, sel && s.goalCardSel, { marginRight: idx % 3 !== 2 ? '3.5%' : 0, marginBottom: 10 }]}
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
        <Text style={s.label}>{t.farmProfile.skillLevel} <Text style={s.req}>*</Text></Text>
        {/* ✅ Now using .label and .desc from translated arrays */}
        {SKILL_LEVELS.map(skill => {
          const sel = form.skillLevel === skill.value;
          return (
            <TouchableOpacity key={skill.value}
              style={[s.skillRow, sel && s.skillRowSel]}
              onPress={() => set('skillLevel', skill.value)} activeOpacity={0.75}>
              <Text style={s.skillIcon}>{skill.icon}</Text>
              <View style={{ flex: 1 }}>
                {/* ✅ skill.label instead of skill.value */}
                <Text style={[s.skillLabel, sel && s.skillLabelSel]}>{skill.label}</Text>
                <Text style={s.skillDesc}>{skill.desc}</Text>
              </View>
              {sel && <Ionicons name="checkmark-circle" size={22} color="#22c55e" />}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={s.field}>
        <Text style={s.label}>
          {t.farmProfile.previousCrop} <Text style={s.opt}>({t.common.optional})</Text>
        </Text>
        <TextInput value={form.previousCrop} onChangeText={v => set('previousCrop', v)}
          placeholder={t.farmProfile.previousCropPlaceholder} placeholderTextColor="#9ca3af"
          onFocus={() => setFocusedField('pc')} onBlur={() => setFocusedField(null)}
          style={[s.input, focusedField === 'pc' && s.inputFocus]} />
        <Text style={s.hint}>{t.farmProfile.previousCropHint}</Text>
      </View>
    </Animated.View>
  );

  // ─── Root Render ──────────────────────────────────────────────────────────
  return (
    <LinearGradient colors={['#d4efdd', '#c8e8d4', '#b8dfc8']} style={s.gradient}>
      <StatusBar style="dark" backgroundColor="transparent" />
      <SafeAreaView style={s.safe}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

          {/* Header */}
          <Animated.View entering={FadeInDown.delay(80).duration(400)} style={s.header}>
            <View>
              <Text style={s.headerTitle}>{t.farmProfile.title}</Text>
              <Text style={s.headerSub}>
                {t.farmProfile.stepOf
                  .replace('{current}', String(step))
                  .replace('{total}', String(totalSteps))}
              </Text>
            </View>
            <TouchableOpacity style={s.skipBtn} onPress={handleSkip} activeOpacity={0.7}>
              <Text style={s.skipText}>{t.farmProfile.skip}</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Progress bar */}
          <Animated.View entering={FadeInDown.delay(140).duration(400)} style={s.progressWrap}>
            <View style={s.track}>
              <View style={[s.fill, { width: `${(step / totalSteps) * 100}%` }]} />
            </View>
            <View style={s.stepsRow}>
              {[t.farmProfile.stepLocation, t.farmProfile.stepCrops, t.farmProfile.stepGoals].map((label, i) => {
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
                <Text style={s.backBtnText}>{t.farmProfile.back}</Text>
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
                  <Text style={s.nextBtnText}>
                    {step === totalSteps ? t.farmProfile.completeSetup : t.farmProfile.continue}
                  </Text>
                  {step < totalSteps && <Ionicons name="arrow-forward" size={17} color="#fff" style={{ marginLeft: 5 }} />}
                </>
              )}
            </TouchableOpacity>
          </Animated.View>

        </KeyboardAvoidingView>
      </SafeAreaView>

      <CropModal
        visible={cropModal}
        selected={form.primaryCrops}
        onClose={() => setCropModal(false)}
        onConfirm={crops => set('primaryCrops', crops)}
        t={t}
      />
    </LinearGradient>
  );
}

// ─── Styles (unchanged) ───────────────────────────────────────────────────────
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