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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, SlideInRight } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';

const SOIL_TYPES = [
  'Alluvial', 'Black (Regur)', 'Red', 'Laterite', 'Desert',
  'Mountain', 'Clay', 'Sandy', 'Loamy',
];

const WATER_AVAILABILITY = [
  'Abundant (River/Canal)', 'Borewell', 'Rainfed Only',
  'Limited', 'Drip Irrigation',
];

const SKILL_LEVELS = [
  'Beginner', 'Intermediate', 'Advanced', 'Expert',
];

const FARMING_GOALS = [
  { id: 'profit', label: 'Maximum Profit', icon: '💰' },
  { id: 'low-effort', label: 'Low Effort', icon: '🌾' },
  { id: 'organic', label: 'Organic Farming', icon: '🌱' },
  { id: 'quick-crop', label: 'Quick Harvest', icon: '⚡' },
];

export default function FarmProfile() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const totalSteps = 3;

  const [formData, setFormData] = useState({
    location: '',
    panchayat: '',
    state: '',
    district: '',
    farmSize: '',
    soilType: '',
    waterAvailability: '',
    currentSeason: '',
    skillLevel: '',
    farmingGoal: '',
    previousCrop: '',
  });

  // Auto-detect current season
  useEffect(() => {
    const month = new Date().getMonth() + 1; // 1-12
    let season = '';

    if (month >= 6 && month <= 9) {
      season = 'Kharif (Monsoon)';
    } else if (month >= 10 && month <= 3) {
      season = 'Rabi (Winter)';
    } else {
      season = 'Zaid (Summer)';
    }

    setFormData(prev => ({ ...prev, currentSeason: season }));
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGetLocation = async () => {
    setLocationLoading(true);

    try {
      // Simulate location detection
      await new Promise(resolve => setTimeout(resolve, 1500));

      const mockLocation = {
        panchayat: 'Kharadi',
        district: 'Pune',
        state: 'Maharashtra',
        location: '18.5511° N, 73.9368° E',
      };

      setFormData(prev => ({
        ...prev,
        location: mockLocation.location,
        panchayat: mockLocation.panchayat,
        district: mockLocation.district,
        state: mockLocation.state,
      }));

      Alert.alert('Success', 'Location detected successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to get location. Please enter manually.');
      console.error('Location error:', error);
    } finally {
      setLocationLoading(false);
    }
  };

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (!formData.location.trim() || !formData.panchayat.trim()) {
        Alert.alert('Required', 'Please provide your location details');
        return false;
      }
      if (!formData.farmSize.trim()) {
        Alert.alert('Required', 'Please enter your farm size');
        return false;
      }
    } else if (step === 2) {
      if (!formData.soilType) {
        Alert.alert('Required', 'Please select your soil type');
        return false;
      }
      if (!formData.waterAvailability) {
        Alert.alert('Required', 'Please select water availability');
        return false;
      }
    } else if (step === 3) {
      if (!formData.farmingGoal) {
        Alert.alert('Required', 'Please select your farming goal');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert('Success', 'Farm profile created successfully!');
      router.replace('/(tabs)/dashboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to save farm profile. Please try again.');
      console.error('Submit error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- UI RENDERERS ---

  const renderStepIndicator = () => (
    <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.stepIndicator}>
      {[1, 2, 3].map((step) => {
        const isActive = currentStep === step;
        const isComplete = currentStep > step;

        return (
          <View key={step} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={[
              styles.dot,
              isActive && styles.dotActive,
              isComplete && styles.dotComplete,
            ]} />
            {step < 3 && (
              <View style={[styles.dotLine, isComplete && styles.dotLineComplete]} />
            )}
          </View>
        );
      })}
    </Animated.View>
  );

  const renderStep1 = () => (
    <Animated.View key="step1" entering={SlideInRight.duration(400)} style={styles.stepContent}>
      <Text style={styles.stepTitle}>Location & Farm Details</Text>
      <Text style={styles.stepSubtitle}>Help us understand your farm better to provide accurate weather and crop data.</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Location (GPS)</Text>
        <View style={styles.row}>
          <TextInput
            value={formData.location}
            onChangeText={(t) => handleInputChange('location', t)}
            placeholder="Auto-detect or enter coordinates"
            placeholderTextColor="#9ca3af"
            onFocus={() => setFocusedField('location')}
            onBlur={() => setFocusedField(null)}
            style={[styles.input, { flex: 1 }, focusedField === 'location' && styles.inputFocused]}
            editable={!locationLoading}
          />
          <TouchableOpacity
            style={styles.gpsButton}
            onPress={handleGetLocation}
            disabled={locationLoading}
            activeOpacity={0.8}
          >
            {locationLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Ionicons name="location" size={20} color="#ffffff" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Panchayat / Village</Text>
        <TextInput
          value={formData.panchayat}
          onChangeText={(t) => handleInputChange('panchayat', t)}
          placeholder="Enter your panchayat name"
          placeholderTextColor="#9ca3af"
          onFocus={() => setFocusedField('panchayat')}
          onBlur={() => setFocusedField(null)}
          style={[styles.input, focusedField === 'panchayat' && styles.inputFocused]}
        />
      </View>

      <View style={styles.rowGrid}>
        <View style={[styles.field, { flex: 1, marginRight: 10 }]}>
          <Text style={styles.label}>District</Text>
          <TextInput
            value={formData.district}
            onChangeText={(t) => handleInputChange('district', t)}
            placeholder="E.g. Pune"
            placeholderTextColor="#9ca3af"
            onFocus={() => setFocusedField('district')}
            onBlur={() => setFocusedField(null)}
            style={[styles.input, focusedField === 'district' && styles.inputFocused]}
          />
        </View>

        <View style={[styles.field, { flex: 1 }]}>
          <Text style={styles.label}>State</Text>
          <TextInput
            value={formData.state}
            onChangeText={(t) => handleInputChange('state', t)}
            placeholder="E.g. MH"
            placeholderTextColor="#9ca3af"
            onFocus={() => setFocusedField('state')}
            onBlur={() => setFocusedField(null)}
            style={[styles.input, focusedField === 'state' && styles.inputFocused]}
          />
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Farm Size (in acres)</Text>
        <TextInput
          value={formData.farmSize}
          onChangeText={(t) => handleInputChange('farmSize', t)}
          placeholder="e.g., 2.5"
          placeholderTextColor="#9ca3af"
          keyboardType="decimal-pad"
          onFocus={() => setFocusedField('farmSize')}
          onBlur={() => setFocusedField(null)}
          style={[styles.input, focusedField === 'farmSize' && styles.inputFocused]}
        />
      </View>
    </Animated.View>
  );

  const renderStep2 = () => (
    <Animated.View key="step2" entering={SlideInRight.duration(400)} style={styles.stepContent}>
      <Text style={styles.stepTitle}>Soil & Water Resources</Text>
      <Text style={styles.stepSubtitle}>This helps us recommend the best irrigation and fertilizer schedules.</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Soil Type</Text>
        <View style={styles.optionsGrid}>
          {SOIL_TYPES.map((soil) => (
            <TouchableOpacity
              key={soil}
              activeOpacity={0.75}
              style={[styles.optionChip, formData.soilType === soil && styles.optionChipSelected]}
              onPress={() => handleInputChange('soilType', soil)}
            >
              <Text style={[styles.optionChipText, formData.soilType === soil && styles.optionChipTextSelected]}>
                {soil}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Water Availability</Text>
        {WATER_AVAILABILITY.map((water) => (
          <TouchableOpacity
            key={water}
            activeOpacity={0.75}
            style={[styles.radioOption, formData.waterAvailability === water && styles.radioOptionSelected]}
            onPress={() => handleInputChange('waterAvailability', water)}
          >
            <View style={[styles.radio, formData.waterAvailability === water && styles.radioActive]}>
              {formData.waterAvailability === water && <Ionicons name="checkmark" size={14} color="#ffffff" />}
            </View>
            <Text style={[styles.radioText, formData.waterAvailability === water && styles.radioTextSelected]}>{water}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Current Season</Text>
        <View style={styles.seasonBox}>
          <Text style={styles.seasonText}>🌤️ {formData.currentSeason}</Text>
          <Text style={styles.seasonSubtext}>(Auto-detected by region & date)</Text>
        </View>
      </View>
    </Animated.View>
  );

  const renderStep3 = () => (
    <Animated.View key="step3" entering={SlideInRight.duration(400)} style={styles.stepContent}>
      <Text style={styles.stepTitle}>Your Farming Goals</Text>
      <Text style={styles.stepSubtitle}>Personalize your dashboard and mission recommendations.</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Primary Farming Goal</Text>
        <View style={styles.goalGrid}>
          {FARMING_GOALS.map((goal) => (
            <TouchableOpacity
              key={goal.id}
              activeOpacity={0.75}
              style={[styles.goalCard, formData.farmingGoal === goal.id && styles.goalCardSelected]}
              onPress={() => handleInputChange('farmingGoal', goal.id)}
            >
              <Text style={styles.goalIcon}>{goal.icon}</Text>
              <Text style={[styles.goalLabel, formData.farmingGoal === goal.id && styles.goalLabelSelected]}>
                {goal.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Skill Level</Text>
        <View style={styles.optionsGrid}>
          {SKILL_LEVELS.map((skill) => (
            <TouchableOpacity
              key={skill}
              activeOpacity={0.75}
              style={[styles.optionChip, formData.skillLevel === skill && styles.optionChipSelected]}
              onPress={() => handleInputChange('skillLevel', skill)}
            >
              <Text style={[styles.optionChipText, formData.skillLevel === skill && styles.optionChipTextSelected]}>
                {skill}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Previous Crop (Optional)</Text>
        <TextInput
          value={formData.previousCrop}
          onChangeText={(t) => handleInputChange('previousCrop', t)}
          placeholder="E.g. Wheat, Cotton"
          placeholderTextColor="#9ca3af"
          onFocus={() => setFocusedField('previousCrop')}
          onBlur={() => setFocusedField(null)}
          style={[styles.input, focusedField === 'previousCrop' && styles.inputFocused]}
        />
        <Text style={styles.hint}>Helps us suggest better crop rotation practices.</Text>
      </View>
    </Animated.View>
  );

  return (
    <LinearGradient colors={['#d4efdd', '#c8e8d4', '#b8dfc8']} style={styles.gradient}>
      <StatusBar style="dark" backgroundColor="transparent" />
      <SafeAreaView style={styles.safe}>

        {/* HEADER */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.header}>
          <Text style={styles.headerTitle}>Farm Profile Setup</Text>
          <Text style={styles.headerSubtitle}>Customize your AgriFusion experience</Text>
        </Animated.View>

        {renderStepIndicator()}

        {/* SCROLLABLE FORM */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </View>
        </ScrollView>

        {/* BOTTOM NAVIGATION BUTTONS */}
        <Animated.View entering={FadeInUp.delay(300).duration(400)} style={styles.footer}>
          {currentStep > 1 ? (
            <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.75}>
              <Text style={styles.backBtnText}>Back</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ flex: 1, marginRight: 12 }} /> // Spacer when no back button
          )}

          <TouchableOpacity
            style={styles.nextBtn}
            onPress={handleNext}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.nextBtnText}>
                {currentStep === totalSteps ? 'Complete Setup' : 'Next Step'}
              </Text>
            )}
          </TouchableOpacity>
        </Animated.View>

      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },

  header: { paddingHorizontal: 24, paddingTop: Platform.OS === 'android' ? 40 : 16, paddingBottom: 16, alignItems: 'center' },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#14532d', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, color: '#166534', marginTop: 4, fontWeight: '600' },

  /* STEP INDICATOR (3 Dots) */
  stepIndicator: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: '#22c55e', backgroundColor: 'transparent' },
  dotActive: { backgroundColor: '#22c55e', transform: [{ scale: 1.2 }] },
  dotComplete: { backgroundColor: '#16a34a', borderColor: '#16a34a' },
  dotLine: { width: 30, height: 2, backgroundColor: 'rgba(34,197,94,0.3)', marginHorizontal: 8 },
  dotLineComplete: { backgroundColor: '#16a34a' },

  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },

  /* MAIN CARD */
  card: { backgroundColor: '#ffffff', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(34,197,94,0.2)', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 4 },
  stepContent: { width: '100%' },
  stepTitle: { fontSize: 20, fontWeight: '800', color: '#14532d', marginBottom: 6, letterSpacing: -0.3 },
  stepSubtitle: { fontSize: 13, color: '#6b7280', marginBottom: 24, fontWeight: '500', lineHeight: 20 },

  /* INPUTS */
  field: { marginBottom: 20 },
  rowGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: 14, fontWeight: '700', color: '#166534', marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center' },
  input: { height: 52, backgroundColor: '#f9fafb', borderRadius: 14, paddingHorizontal: 16, borderWidth: 1.5, borderColor: '#e5e7eb', fontSize: 15, color: '#1f2937' },
  inputFocused: { borderColor: '#22c55e', backgroundColor: '#f0fdf4' },
  hint: { fontSize: 12, color: '#9ca3af', marginTop: 6, fontWeight: '500' },

  gpsButton: { height: 52, width: 52, backgroundColor: '#22c55e', borderRadius: 14, marginLeft: 10, alignItems: 'center', justifyContent: 'center', shadowColor: '#22c55e', shadowOpacity: 0.3, shadowRadius: 6, elevation: 3 },

  /* CHIPS / SELECTORS */
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  optionChip: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#f9fafb', borderWidth: 1.5, borderColor: '#e5e7eb', marginRight: 8, marginBottom: 10 },
  optionChipSelected: { backgroundColor: '#22c55e', borderColor: '#22c55e', shadowColor: '#22c55e', shadowOpacity: 0.3, shadowRadius: 6, elevation: 3 },
  optionChipText: { fontSize: 13, fontWeight: '600', color: '#4b5563' },
  optionChipTextSelected: { color: '#ffffff', fontWeight: '700' },

  /* RADIO BUTTONS */
  radioOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#f9fafb', borderRadius: 14, borderWidth: 1.5, borderColor: '#e5e7eb', marginBottom: 10 },
  radioOptionSelected: { backgroundColor: '#f0fdf4', borderColor: '#22c55e' },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#9ca3af', marginRight: 12, alignItems: 'center', justifyContent: 'center' },
  radioActive: { backgroundColor: '#22c55e', borderColor: '#22c55e' },
  radioText: { fontSize: 14, color: '#4b5563', fontWeight: '600', flex: 1 },
  radioTextSelected: { color: '#14532d', fontWeight: '800' },

  /* SEASON BOX */
  seasonBox: { backgroundColor: '#f0fdf4', padding: 16, borderRadius: 14, borderWidth: 1.5, borderColor: 'rgba(34,197,94,0.3)', alignItems: 'center' },
  seasonText: { fontSize: 18, fontWeight: '800', color: '#14532d' },
  seasonSubtext: { fontSize: 12, color: '#166534', marginTop: 4, fontWeight: '500' },

  /* GOAL CARDS */
  goalGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  goalCard: { width: '48%', backgroundColor: '#f9fafb', borderRadius: 16, borderWidth: 1.5, borderColor: '#e5e7eb', padding: 16, alignItems: 'center' },
  goalCardSelected: { backgroundColor: '#f0fdf4', borderColor: '#22c55e', shadowColor: '#22c55e', shadowOpacity: 0.2, shadowRadius: 6, elevation: 3 },
  goalIcon: { fontSize: 32, marginBottom: 8 },
  goalLabel: { fontSize: 13, fontWeight: '600', color: '#4b5563', textAlign: 'center' },
  goalLabelSelected: { color: '#14532d', fontWeight: '800' },

  /* FOOTER BUTTONS */
  footer: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 16, paddingBottom: Platform.OS === 'ios' ? 24 : 16, backgroundColor: 'transparent' },
  backBtn: { flex: 1, paddingVertical: 16, borderRadius: 16, borderWidth: 1.5, borderColor: '#166534', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  backBtnText: { fontSize: 15, fontWeight: '800', color: '#166534' },
  nextBtn: { flex: 2, paddingVertical: 16, borderRadius: 16, backgroundColor: '#22c55e', alignItems: 'center', justifyContent: 'center', shadowColor: '#22c55e', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  nextBtnText: { fontSize: 15, fontWeight: '800', color: '#ffffff' },
});