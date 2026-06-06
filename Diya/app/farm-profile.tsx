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

const SOIL_TYPES = [
  'Alluvial',
  'Black (Regur)',
  'Red',
  'Laterite',
  'Desert',
  'Mountain',
  'Clay',
  'Sandy',
  'Loamy',
];

const WATER_AVAILABILITY = [
  'Abundant (River/Canal)',
  'Borewell',
  'Rainfed Only',
  'Limited',
  'Drip Irrigation',
];

const SKILL_LEVELS = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Expert',
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
      // TODO: Implement actual GPS location fetching
      // For now, simulate location detection
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock data - replace with actual GPS → reverse geocoding API
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
      // TODO: Replace with actual API call to save farm profile
      const response = await fetch('YOUR_API_URL/api/farm-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Store profile data locally if needed
      // await AsyncStorage.setItem('farmProfile', JSON.stringify(formData));
      
      Alert.alert('Success', 'Farm profile created successfully!');
      router.replace('/(tabs)/dashboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to save farm profile. Please try again.');
      console.error('Submit error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3].map((step) => (
        <View key={step} style={styles.stepItem}>
          <View style={[
            styles.stepCircle,
            currentStep >= step && styles.stepCircleActive,
            currentStep > step && styles.stepCircleComplete,
          ]}>
            <Text style={[
              styles.stepNumber,
              currentStep >= step && styles.stepNumberActive,
            ]}>
              {currentStep > step ? '✓' : step}
            </Text>
          </View>
          {step < 3 && (
            <View style={[
              styles.stepLine,
              currentStep > step && styles.stepLineActive,
            ]} />
          )}
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>📍 Location & Farm Details</Text>
      <Text style={styles.stepSubtitle}>Help us understand your farm better</Text>

      {/* Location */}
      <View style={styles.field}>
        <Text style={styles.label}>Location (GPS)</Text>
        <View style={styles.row}>
          <TextInput
            value={formData.location}
            onChangeText={(t) => handleInputChange('location', t)}
            placeholder="Auto-detect or enter coordinates"
            style={[styles.input, { flex: 1 }]}
            editable={!locationLoading}
          />
          <TouchableOpacity 
            style={styles.gpsButton} 
            onPress={handleGetLocation}
            disabled={locationLoading}
          >
            {locationLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.gpsButtonText}>📍 GPS</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Panchayat */}
      <View style={styles.field}>
        <Text style={styles.label}>Panchayat / Village</Text>
        <TextInput
          value={formData.panchayat}
          onChangeText={(t) => handleInputChange('panchayat', t)}
          placeholder="Enter your panchayat name"
          style={styles.input}
        />
      </View>

      {/* District */}
      <View style={styles.field}>
        <Text style={styles.label}>District</Text>
        <TextInput
          value={formData.district}
          onChangeText={(t) => handleInputChange('district', t)}
          placeholder="Enter your district"
          style={styles.input}
        />
      </View>

      {/* State */}
      <View style={styles.field}>
        <Text style={styles.label}>State</Text>
        <TextInput
          value={formData.state}
          onChangeText={(t) => handleInputChange('state', t)}
          placeholder="Enter your state"
          style={styles.input}
        />
      </View>

      {/* Farm Size */}
      <View style={styles.field}>
        <Text style={styles.label}>Farm Size (in acres)</Text>
        <TextInput
          value={formData.farmSize}
          onChangeText={(t) => handleInputChange('farmSize', t)}
          placeholder="e.g., 2.5"
          keyboardType="decimal-pad"
          style={styles.input}
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>🌱 Soil & Water Resources</Text>
      <Text style={styles.stepSubtitle}>Tell us about your farm resources</Text>

      {/* Soil Type */}
      <View style={styles.field}>
        <Text style={styles.label}>Soil Type</Text>
        <View style={styles.optionsGrid}>
          {SOIL_TYPES.map((soil) => (
            <TouchableOpacity
              key={soil}
              style={[
                styles.optionChip,
                formData.soilType === soil && styles.optionChipSelected,
              ]}
              onPress={() => handleInputChange('soilType', soil)}
            >
              <Text style={[
                styles.optionChipText,
                formData.soilType === soil && styles.optionChipTextSelected,
              ]}>
                {soil}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Water Availability */}
      <View style={styles.field}>
        <Text style={styles.label}>Water Availability</Text>
        {WATER_AVAILABILITY.map((water) => (
          <TouchableOpacity
            key={water}
            style={[
              styles.radioOption,
              formData.waterAvailability === water && styles.radioOptionSelected,
            ]}
            onPress={() => handleInputChange('waterAvailability', water)}
          >
            <View style={styles.radio}>
              {formData.waterAvailability === water && (
                <View style={styles.radioInner} />
              )}
            </View>
            <Text style={styles.radioText}>{water}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Current Season (Auto-detected) */}
      <View style={styles.field}>
        <Text style={styles.label}>Current Season</Text>
        <View style={styles.seasonBox}>
          <Text style={styles.seasonText}>🌾 {formData.currentSeason}</Text>
          <Text style={styles.seasonSubtext}>(Auto-detected)</Text>
        </View>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>🎯 Your Farming Preferences</Text>
      <Text style={styles.stepSubtitle}>Help us personalize recommendations</Text>

      {/* Farming Goal */}
      <View style={styles.field}>
        <Text style={styles.label}>Primary Farming Goal</Text>
        <View style={styles.goalGrid}>
          {FARMING_GOALS.map((goal) => (
            <TouchableOpacity
              key={goal.id}
              style={[
                styles.goalCard,
                formData.farmingGoal === goal.id && styles.goalCardSelected,
              ]}
              onPress={() => handleInputChange('farmingGoal', goal.id)}
            >
              <Text style={styles.goalIcon}>{goal.icon}</Text>
              <Text style={[
                styles.goalLabel,
                formData.farmingGoal === goal.id && styles.goalLabelSelected,
              ]}>
                {goal.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Skill Level (Optional) */}
      <View style={styles.field}>
        <Text style={styles.label}>Skill Level (Optional)</Text>
        <View style={styles.optionsGrid}>
          {SKILL_LEVELS.map((skill) => (
            <TouchableOpacity
              key={skill}
              style={[
                styles.optionChip,
                formData.skillLevel === skill && styles.optionChipSelected,
              ]}
              onPress={() => handleInputChange('skillLevel', skill)}
            >
              <Text style={[
                styles.optionChipText,
                formData.skillLevel === skill && styles.optionChipTextSelected,
              ]}>
                {skill}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Previous Crop */}
      <View style={styles.field}>
        <Text style={styles.label}>Previous Crop (Optional)</Text>
        <TextInput
          value={formData.previousCrop}
          onChangeText={(t) => handleInputChange('previousCrop', t)}
          placeholder="e.g., Wheat, Rice, Cotton"
          style={styles.input}
        />
        <Text style={styles.hint}>Helps us suggest better crop rotation</Text>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={['#FAF3E0', '#DFF2D8']} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Farm Profile Setup</Text>
          <Text style={styles.headerSubtitle}>
            Step {currentStep} of {totalSteps}
          </Text>
        </View>

        {renderStepIndicator()}

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </View>
        </ScrollView>

        {/* Navigation Buttons */}
        <View style={styles.footer}>
          {currentStep > 1 && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[
              styles.nextButton,
              currentStep === 1 && { flex: 1 },
            ]}
            onPress={handleNext}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.nextButtonText}>
                {currentStep === totalSteps ? 'Complete Setup' : 'Next →'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safe: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 16 : 8,
    paddingBottom: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#166534',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '600',
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  stepCircleActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  stepCircleComplete: {
    backgroundColor: '#047857',
    borderColor: '#047857',
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6B7280',
  },
  stepNumberActive: {
    color: '#fff',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 4,
  },
  stepLineActive: {
    backgroundColor: '#10B981',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: '#D1FAE5',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  stepContent: {
    // Container for step content
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#166534',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    fontWeight: '500',
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#166534',
    marginBottom: 8,
  },
  input: {
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#D1FAE5',
    fontSize: 15,
    color: '#111827',
  },
  hint: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 6,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gpsButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginLeft: 8,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gpsButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  optionChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F0FDF4',
    borderWidth: 2,
    borderColor: '#D1FAE5',
    marginRight: 8,
    marginBottom: 8,
  },
  optionChipSelected: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  optionChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
  },
  optionChipTextSelected: {
    color: '#fff',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1FAE5',
    marginBottom: 8,
  },
  radioOptionSelected: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#10B981',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
  },
  radioText: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
    flex: 1,
  },
  seasonBox: {
    backgroundColor: '#ECFDF5',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#10B981',
    alignItems: 'center',
  },
  seasonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#047857',
  },
  seasonSubtext: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '500',
  },
  goalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    marginHorizontal: -4,
  },
  goalCard: {
    width: '48%',
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1FAE5',
    padding: 16,
    margin: 4,
    alignItems: 'center',
  },
  goalCardSelected: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  goalIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  goalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#166534',
    textAlign: 'center',
  },
  goalLabelSelected: {
    color: '#047857',
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  backButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6B7280',
  },
  nextButton: {
    flex: 2,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.3,
  },
});
