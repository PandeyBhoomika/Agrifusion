import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Feather } from "@expo/vector-icons";
import Animated, {
  FadeIn,
  FadeInDown,
  ZoomIn,
} from "react-native-reanimated";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function ProofSubmittedScreen() {
  const router = useRouter();

  const { title, xpReward } = useLocalSearchParams<{
    title?: string;
    xpReward?: string;
  }>();

  return (
    <LinearGradient
      colors={["#F7FFF8", "#EEF9F1", "#E5F6E9"]}
      style={styles.container}
    >
      <StatusBar style="dark" />

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >

          {/* Success Icon */}

          <Animated.View
            entering={ZoomIn.duration(500)}
            style={styles.iconWrapper}
          >
            <View style={styles.outerCircle}>
              <View style={styles.innerCircle}>
                <Ionicons
                  name="checkmark"
                  size={56}
                  color="#22C55E"
                />
              </View>
            </View>
          </Animated.View>

          {/* Heading */}

          <Animated.View entering={FadeInDown.delay(150)}>
            <Text style={styles.title}>
              Proof Submitted
            </Text>

            <Text style={styles.subtitle}>
              Your field evidence has been uploaded successfully
              and is now waiting for verification.
            </Text>
          </Animated.View>

          {/* Divider */}

          <View style={styles.divider} />

          {/* Mission */}

          <Animated.View entering={FadeIn.delay(250)}>

            <Text style={styles.sectionLabel}>
              CURRENT TASK
            </Text>

            <Text style={styles.taskTitle}>
              {title || "Farming Task"}
            </Text>

            <Text style={styles.reward}>
              +{xpReward || 0} XP after approval
            </Text>

          </Animated.View>

          {/* Divider */}

          <View style={styles.divider} />
                    {/* Verification Timeline */}

          <Animated.View
            entering={FadeInDown.delay(350)}
            style={styles.timeline}
          >

            <View style={styles.timelineItem}>

              <View style={styles.timelineIconSuccess}>
                <Ionicons
                  name="image"
                  size={18}
                  color="#22C55E"
                />
              </View>

              <View style={styles.timelineText}>
                <Text style={styles.timelineTitle}>
                  Photo Uploaded
                </Text>

                <Text style={styles.timelineSub}>
                  Evidence stored successfully
                </Text>
              </View>

            </View>

            <View style={styles.line} />

            <View style={styles.timelineItem}>

              <View style={styles.timelineIconSuccess}>
                <Ionicons
                  name="location"
                  size={18}
                  color="#22C55E"
                />
              </View>

              <View style={styles.timelineText}>
                <Text style={styles.timelineTitle}>
                  Location Captured
                </Text>

                <Text style={styles.timelineSub}>
                  GPS coordinates verified
                </Text>
              </View>

            </View>

            <View style={styles.line} />

            <View style={styles.timelineItem}>

              <View style={styles.timelineIconPending}>
                <Ionicons
                  name="time-outline"
                  size={18}
                  color="#F59E0B"
                />
              </View>

              <View style={styles.timelineText}>
                <Text style={styles.timelineTitle}>
                  Verification Pending
                </Text>

                <Text style={styles.timelineSub}>
                  Your submission is waiting for review
                </Text>
              </View>

            </View>

          </Animated.View>

          <View style={styles.spacer} />

          <Animated.View entering={FadeIn.delay(500)}>

            <Text style={styles.pendingHeading}>
              What happens next?
            </Text>

            <Text style={styles.pendingText}>
              Your submission has safely reached our servers.
            </Text>

            <Text style={styles.pendingText}>
              Once verification is complete you'll automatically
              receive your XP, Green Coins and task completion.
            </Text>

          </Animated.View>


          <View style={{ height: 40 }} />
          {/* Bottom Actions */}

          <Animated.View
            entering={FadeInDown.delay(650)}
            style={styles.bottomContainer}
          >

            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.primaryButton}
              onPress={() => router.replace('/tasks')}
            >
              <Text style={styles.primaryButtonText}>
                View My Submissions
              </Text>

              <Ionicons
                name="arrow-forward"
                size={18}
                color="#ffffff"
              />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.secondaryButton}
              onPress={() => router.replace('/tasks')}
            >
              <Text style={styles.secondaryButtonText}>
                Return to Tasks
              </Text>
            </TouchableOpacity>

          </Animated.View>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FFF8",
  },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 35,
    paddingBottom: 45,
  },

  iconWrapper: {
    alignItems: "center",
    marginTop: 30,
    marginBottom: 30,
  },

  outerCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#ECFDF3",
    alignItems: "center",
    justifyContent: "center",
  },

  innerCircle: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: "#DDF8E7",
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 31,
    fontWeight: "800",
    textAlign: "center",
    color: "#173B2D",
    letterSpacing: -0.7,
  },

  subtitle: {
    marginTop: 14,
    fontSize: 16,
    lineHeight: 26,
    textAlign: "center",
    color: "#6B7D72",
    paddingHorizontal: 12,
  },

  divider: {
    height: 1,
    backgroundColor: "#E5EFE8",
    marginVertical: 34,
  },

  sectionLabel: {
    textAlign: "center",
    color: "#91A598",
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: "700",
  },

  taskTitle: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "700",
    color: "#173B2D",
    marginTop: 12,
  },

  reward: {
    textAlign: "center",
    marginTop: 8,
    color: "#3E9C5D",
    fontWeight: "700",
    fontSize: 15,
  },

  timeline: {
    marginTop: 10,
  },

  timelineItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  timelineIconSuccess: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#EAF8EE",
    justifyContent: "center",
    alignItems: "center",
  },

  timelineIconPending: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#FFF8E6",
    justifyContent: "center",
    alignItems: "center",
  },

  timelineText: {
    marginLeft: 18,
    flex: 1,
  },

  timelineTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#173B2D",
  },

  timelineSub: {
    marginTop: 4,
    fontSize: 14,
    color: "#7B8D83",
    lineHeight: 20,
  },

  line: {
    width: 2,
    height: 26,
    backgroundColor: "#D9ECDC",
    marginLeft: 22,
    marginVertical: 8,
  },

  spacer: {
    height: 40,
  },

  pendingHeading: {
    fontSize: 22,
    fontWeight: "700",
    color: "#173B2D",
    marginBottom: 14,
  },

  pendingText: {
    fontSize: 15,
    color: "#718277",
    lineHeight: 26,
    marginBottom: 10,
  },

  bottomContainer: {
    marginTop: 45,
  },

  primaryButton: {
    height: 58,
    borderRadius: 18,
    backgroundColor: "#2FA66B",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },

  primaryButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 17,
    marginRight: 8,
  },

  secondaryButton: {
    marginTop: 18,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#EEF8F1",
    justifyContent: "center",
    alignItems: "center",
  },

  secondaryButtonText: {
    color: "#2D6B46",
    fontWeight: "700",
    fontSize: 16,
  },
});
