import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Audio } from "expo-av";
import { Feather, AntDesign, Ionicons } from "@expo/vector-icons";

export default function ProofSubmissionScreen() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [location, setLocation] = useState<any>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [status, setStatus] = useState("Not Submitted");

  /* ------------------ PICK IMAGE ------------------ */
  const pickImage = async () => {
    const res = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
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
      await rec.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
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
      lat: loc.coords.latitude.toFixed(5),
      lon: loc.coords.longitude.toFixed(5),
      time: new Date().toLocaleString(),
    });
  };

  /* ------------------ SUBMIT PROOF ------------------ */
  const submitProof = () => {
    setStatus("Pending Verification");
    setTimeout(() => {
      setStatus("AI Reviewing… 🤖");
      setTimeout(() => {
        setStatus("Approved ✔");
      }, 2500);
    }, 1500);
  };

  return (
    <LinearGradient
      colors={["#dff7e3", "#c6f0d4", "#c0ecd0"]}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* TITLE */}
        <Text style={styles.title}>Mission Proof Upload</Text>
        <Text style={styles.subtitle}>Submit your field evidence</Text>

        {/* MISSION BADGE */}
        <View style={styles.missionCard}>
          <Ionicons name="leaf-outline" size={32} color="#256d4b" />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.missionTitle}>Current Mission</Text>
            <Text style={styles.missionText}>Organic Mulching Application</Text>
          </View>
        </View>

        {/* PHOTO PROOF */}
        <TouchableOpacity style={styles.uploadCard} onPress={pickImage}>
          <View style={styles.iconCircle}>
            <Feather name="camera" size={30} color="#2f4633" />
          </View>
          <Text style={styles.uploadTitle}>Capture Photo Proof</Text>
          <Text style={styles.uploadSub}>Tap to open camera</Text>

          {photo && (
            <Image source={{ uri: photo }} style={styles.previewImage} />
          )}
        </TouchableOpacity>

        {/* AUDIO NOTE */}
        <TouchableOpacity
          style={styles.uploadCard}
          onPress={recording ? stopRecording : startRecording}
        >
          <View style={styles.iconCircle}>
            <Feather name="mic" size={26} color="#2f4633" />
          </View>
          <Text style={styles.uploadTitle}>
            {recording ? "Recording…" : "Add Voice Note"}
          </Text>
          <Text style={styles.uploadSub}>Explain your process</Text>

          {audioUri && <Text style={styles.audioText}>🎤 Audio Added</Text>}
        </TouchableOpacity>

        {/* METADATA */}
        <View style={styles.metaCard}>
          <Text style={styles.metaTitle}>Auto-captured Data</Text>

          <View style={styles.metaRow}>
            <Feather name="map-pin" size={18} color="#2f4633" />
            <Text style={styles.metaValue}>
              {location
                ? `${location.lat}, ${location.lon}`
                : "Location not captured yet"}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Feather name="clock" size={18} color="#2f4633" />
            <Text style={styles.metaValue}>
              {location ? location.time : "Timestamp pending"}
            </Text>
          </View>
        </View>

        {/* SUBMIT BUTTON */}
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={submitProof}
          disabled={!photo}
        >
          <Text style={styles.submitText}>Submit Proof</Text>
        </TouchableOpacity>

        {/* STATUS CARD */}
        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Verification Status</Text>
          <Text style={styles.statusValue}>{status}</Text>
        </View>

        <View style={{ height: 70 }} />
      </ScrollView>
    </LinearGradient>
  );
}

/* ------------------ STYLES ------------------ */
const styles = StyleSheet.create({
  container: {
    padding: 18,
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#2f4633",
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 14,
    color: "#446752",
    marginBottom: 20,
  },

  missionCard: {
    flexDirection: "row",
    backgroundColor: "#e5f7ea",
    padding: 16,
    borderRadius: 20,
    marginBottom: 22,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  missionTitle: {
    fontSize: 13,
    color: "#446752",
    fontWeight: "600",
  },

  missionText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2f4633",
  },

  uploadCard: {
    backgroundColor: "#f1fbf4",
    padding: 18,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    alignItems: "center",
  },

  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#d8efdd",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  uploadTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#274334",
  },

  uploadSub: {
    fontSize: 12,
    color: "#446752",
    marginTop: 2,
    marginBottom: 8,
  },

  previewImage: {
    width: "100%",
    height: 180,
    borderRadius: 16,
    marginTop: 12,
  },

  audioText: {
    marginTop: 8,
    fontSize: 14,
    color: "#2f4633",
    fontWeight: "600",
  },

  metaCard: {
    backgroundColor: "#eaf6ef",
    padding: 16,
    borderRadius: 18,
    marginBottom: 20,
  },

  metaTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2f4633",
    marginBottom: 10,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  metaValue: {
    marginLeft: 8,
    fontSize: 13,
    color: "#375a46",
  },

  submitBtn: {
    backgroundColor: "#256d4b",
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: "center",
    marginBottom: 22,
  },

  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },

  statusCard: {
    backgroundColor: "#e5f7ea",
    padding: 16,
    borderRadius: 20,
    alignItems: "center",
  },

  statusLabel: {
    fontSize: 14,
    color: "#446752",
  },

  statusValue: {
    fontSize: 20,
    fontWeight: "800",
    marginTop: 6,
    color: "#2f4633",
  },
});
