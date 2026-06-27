import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Audio } from "expo-av";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ⚠️ IMPORTANT: set EXPO_PUBLIC_API_URL in Diya/.env to your machine's IPv4
// when testing on a real phone (localhost only works in the browser).
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.X:4000/api";

export default function ProofSubmissionScreen() {
  const router = useRouter();
  const { taskId, title, xpReward } = useLocalSearchParams<{
    taskId?: string;
    title?: string;
    xpReward?: string;
  }>();

  const [photo, setPhoto] = useState<string | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [location, setLocation] = useState<any>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  const [status, setStatus] = useState("Awaiting Submission");
  const [isLoading, setIsLoading] = useState(false);

  /* ------------------ PICK IMAGE (LIVE CAMERA ONLY) ------------------ */
  const pickImage = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Sorry, we need camera permissions to verify your work!");
      return;
    }

    // launchCameraAsync forces a live photo (anti-cheat)
    const res = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
    });

    if (!res.canceled) {
      setPhoto(res.assets[0].uri);
      autoCaptureMetadata();
    }
  };

  /* ------------------ RECORD AUDIO ------------------ */
  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true });

      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await rec.startAsync();

      setRecording(rec);
    } catch (e) {
      console.log("Recording error:", e);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    await recording.stopAndUnloadAsync();
    setAudioUri(recording.getURI());
    setRecording(null);
    autoCaptureMetadata();
  };

  /* ------------------ AUTO GPS + TIMESTAMP ------------------ */
  const autoCaptureMetadata = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;

    const loc = await Location.getCurrentPositionAsync({});
    setLocation({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      time: new Date().toISOString(),
      displayTime: new Date().toLocaleString(),
    });
  };

  /* ------------------ SUBMIT PROOF (FormData → multer backend) ------------------ */
  const submitProof = async () => {
    if (!photo) return;
    if (!taskId) {
      setStatus("No task selected ❌");
      Alert.alert("No task", "This screen was opened without a task. Go back and tap 'Submit Proof' on a specific task.");
      return;
    }

    setIsLoading(true);
    setStatus("Uploading proof... ☁️");

    try {
      const token = await AsyncStorage.getItem("authToken");

      const formData = new FormData();

      // ✅ Web fix: on web, expo-image-picker gives a blob: URI, and
      // React Native Web's FormData polyfill needs a real Blob/File object,
      // not the { uri, name, type } shorthand that only works on native.
      const filename = photo.split("/").pop()?.split("?")[0] || "proof.jpg";
      const photoMatch = /\.(\w+)$/.exec(filename);
      const photoType = photoMatch ? `image/${photoMatch[1]}` : `image/jpeg`;

      if (Platform.OS === "web") {
        const photoBlob = await (await fetch(photo)).blob();
        formData.append("photo", photoBlob, filename);
      } else {
        formData.append("photo", { uri: photo, name: filename, type: photoType } as any);
      }

      if (audioUri) {
        const audioName = audioUri.split("/").pop()?.split("?")[0] || "audio.m4a";
        if (Platform.OS === "web") {
          const audioBlob = await (await fetch(audioUri)).blob();
          formData.append("audio", audioBlob, audioName);
        } else {
          formData.append("audio", { uri: audioUri, name: audioName, type: "audio/m4a" } as any);
        }
      }

      // Backend parses location JSON and reads loc.lat / loc.lon, so send
      // those keys (not latitude/longitude) or GPS saves empty.
      if (location) {
        formData.append(
          "location",
          JSON.stringify({
            lat: location.latitude,
            lon: location.longitude,
            time: location.time,
          })
        );
      }

      formData.append("taskId", taskId);
      // NOTE: userId is intentionally NOT sent — the backend derives it
      // from the verified token (req.user.userId).

      const response = await fetch(`${API_BASE_URL}/proofs/submit`, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
          // Do NOT set Content-Type manually for FormData — the runtime
          // sets the multipart boundary automatically.
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const json = await response.json().catch(() => ({}));

      if (!response.ok || !json.success) {
        throw new Error(json.message || "Failed to save proof to the server.");
      }

      // Status reflects what the backend actually did. The current backend
      // auto-approves and awards XP immediately, so this will usually be
      // "Approved". If manual review is added later, it'll show "Pending".
      const backendStatus = json.data?.status;
      if (backendStatus === "Approved") {
        const xp = json.data?.xpAwarded ?? 0;
        setStatus(`Approved ✔️  +${xp} XP awarded!`);
      } else {
        setStatus("Submitted — awaiting review ⏳");
      }

      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (error: any) {
      console.error("Submission Error:", error);
      setStatus("Submission Failed ❌");
      Alert.alert("Upload Error", error?.message || "There was a problem submitting your proof.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#d4efdd", "#c8e8d4", "#b8dfc8"]} style={styles.gradient}>
      <StatusBar style="dark" backgroundColor="transparent" />
      <SafeAreaView style={styles.safe}>
        {/* --- HEADER --- */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={24} color="#14532d" />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={styles.headerTitle}>Submit Proof</Text>
            <Text style={styles.headerSub}>Field Evidence</Text>
          </View>
          <View style={{ width: 44 }} />
        </Animated.View>

        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          {/* --- MISSION BADGE --- */}
          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.missionCard}>
            <View style={styles.missionIconWrap}>
              <Ionicons name="leaf" size={24} color="#16a34a" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.missionLabel}>Current Mission</Text>
              <Text style={styles.missionTitleText}>{title || "Field Task"}</Text>
            </View>
          </Animated.View>

          {/* --- PHOTO PROOF --- */}
          <Animated.View entering={FadeInUp.delay(200).duration(400)}>
            <TouchableOpacity style={styles.uploadCard} onPress={pickImage} activeOpacity={0.8}>
              <View style={styles.iconCircle}>
                <Feather name="camera" size={28} color="#16a34a" />
              </View>
              <Text style={styles.uploadTitle}>{photo ? "Retake Photo" : "Capture Photo Proof"}</Text>
              <Text style={styles.uploadSub}>Tap to open live camera</Text>

              {photo && (
                <View style={styles.previewContainer}>
                  <Image source={{ uri: photo }} style={styles.previewImage} contentFit="cover" />
                  <View style={styles.successPill}>
                    <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
                    <Text style={styles.successPillText}>Photo captured</Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* --- AUDIO NOTE --- */}
          <Animated.View entering={FadeInUp.delay(300).duration(400)}>
            <TouchableOpacity
              style={[styles.uploadCard, recording && styles.recordingActive]}
              onPress={recording ? stopRecording : startRecording}
              activeOpacity={0.8}
            >
              <View style={[styles.iconCircle, recording && styles.iconCircleRecording]}>
                <Feather name="mic" size={28} color={recording ? "#ef4444" : "#16a34a"} />
              </View>
              <Text style={styles.uploadTitle}>
                {recording ? "Recording... Tap to stop" : "Add Voice Note (Optional)"}
              </Text>
              <Text style={styles.uploadSub}>Explain your process</Text>

              {audioUri && !recording && (
                <View style={styles.successPill}>
                  <MaterialIcons name="audiotrack" size={16} color="#16a34a" />
                  <Text style={styles.successPillText}>Audio attached</Text>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* --- METADATA --- */}
          <Animated.View entering={FadeInUp.delay(400).duration(400)} style={styles.metaCard}>
            <Text style={styles.metaTitle}>Auto-captured Data 📍</Text>

            <View style={styles.metaRow}>
              <View style={styles.metaIconBox}>
                <Feather name="map-pin" size={16} color="#166534" />
              </View>
              <Text style={styles.metaValue}>
                {location ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}` : "Location pending..."}
              </Text>
            </View>

            <View style={styles.metaRow}>
              <View style={styles.metaIconBox}>
                <Feather name="clock" size={16} color="#166534" />
              </View>
              <Text style={styles.metaValue}>
                {location ? location.displayTime : "Timestamp pending..."}
              </Text>
            </View>
          </Animated.View>

          {/* --- STATUS & SUBMIT --- */}
          <Animated.View entering={FadeInUp.delay(500).duration(400)}>
            <View style={styles.statusCard}>
              <Text style={styles.statusLabel}>Verification Status</Text>
              <Text
                style={[
                  styles.statusValue,
                  status.includes("Failed") && { color: "#ef4444" },
                  status.includes("Approved") && { color: "#16a34a" },
                ]}
              >
                {status}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, (!photo || isLoading) && styles.submitBtnDisabled]}
              onPress={submitProof}
              disabled={!photo || isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Text style={styles.submitText}>Submit for Verification</Text>
                  <Ionicons name="cloud-upload-outline" size={20} color="#ffffff" style={{ marginLeft: 8 }} />
                </>
              )}
            </TouchableOpacity>
          </Animated.View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

/* ------------------ STYLES ------------------ */
const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },

  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 16 : 8,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#14532d", letterSpacing: -0.5 },
  headerSub: { fontSize: 13, color: "#166534", marginTop: 2, fontWeight: "600" },
  headerButton: {
    padding: 10,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  container: { padding: 20 },

  missionCard: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 20,
    marginBottom: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.3)",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  missionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  missionLabel: { fontSize: 12, color: "#6b7280", fontWeight: "600", textTransform: "uppercase", marginBottom: 2 },
  missionTitleText: { fontSize: 16, fontWeight: "800", color: "#1f2937" },

  uploadCard: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.3)",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    alignItems: "center",
  },
  recordingActive: { borderColor: "#ef4444", backgroundColor: "#fef2f2" },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#f0fdf4",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  iconCircleRecording: { backgroundColor: "#fecaca" },
  uploadTitle: { fontSize: 16, fontWeight: "800", color: "#1f2937", marginBottom: 4 },
  uploadSub: { fontSize: 13, color: "#6b7280", fontWeight: "500" },

  previewContainer: { width: "100%", marginTop: 16, alignItems: "center" },
  previewImage: { width: "100%", height: 200, borderRadius: 16 },
  successPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dcfce7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  successPillText: { marginLeft: 6, color: "#166534", fontSize: 13, fontWeight: "700" },

  metaCard: {
    backgroundColor: "rgba(255,255,255,0.6)",
    padding: 18,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.2)",
  },
  metaTitle: { fontSize: 15, fontWeight: "800", color: "#14532d", marginBottom: 12 },
  metaRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  metaIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  metaValue: { flex: 1, fontSize: 13, color: "#374151", fontWeight: "600" },

  statusCard: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.2)",
  },
  statusLabel: { fontSize: 12, color: "#6b7280", fontWeight: "600", textTransform: "uppercase", marginBottom: 4 },
  statusValue: { fontSize: 16, fontWeight: "800", color: "#14532d" },

  submitBtn: {
    flexDirection: "row",
    backgroundColor: "#22c55e",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#22c55e",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitBtnDisabled: { backgroundColor: "#9ca3af", shadowOpacity: 0, elevation: 0 },
  submitText: { color: "#ffffff", fontSize: 16, fontWeight: "800", letterSpacing: 0.5 },
});