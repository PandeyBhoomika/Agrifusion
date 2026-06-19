import React, { useEffect, useRef, useState, useMemo } from "react";
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import Reanimated, { FadeInDown, FadeInUp, ZoomIn, FadeIn } from "react-native-reanimated";
import Svg, { Path, Defs, Pattern, Rect, Circle } from "react-native-svg";
import { useLanguage } from "../context/LanguageContext";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const Particle = ({ particle }: { particle: any }) => {
  const animY = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let loop: Animated.CompositeAnimation;
    const timeout = setTimeout(() => {
      loop = Animated.loop(
        Animated.timing(animY, { toValue: -(screenHeight * 0.8), duration: particle.duration, easing: Easing.linear, useNativeDriver: true })
      );
      loop.start();
    }, particle.delay);
    return () => { clearTimeout(timeout); if (loop) loop.stop(); };
  }, []);
  return (
    <Animated.View style={[styles.particle, { left: particle.x, top: particle.y, width: particle.size, height: particle.size, borderRadius: particle.size / 2, backgroundColor: particle.color, opacity: particle.opacity, transform: [{ translateY: animY }] }]} />
  );
};

export default function SplashScreen() {
  const router = useRouter();
  // ✅ Get translations
  const { t } = useLanguage();

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const loadWidthAnim = useRef(new Animated.Value(0)).current;
  const [tagline, setTagline] = useState("");

  const particles = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      x: Math.random() * screenWidth,
      y: screenHeight * 0.3 + Math.random() * (screenHeight * 0.7),
      size: Math.random() * 7 + 3,
      opacity: Math.random() * 0.35 + 0.15,
      color: ["#22c55e", "#4ade80", "#86efac"][Math.floor(Math.random() * 3)],
      duration: 4000 + Math.random() * 3000,
      delay: Math.random() * 3000,
    }));
  }, []);

  useEffect(() => {
    let typewriterInterval: any;
    const timers: any[] = [];
    // ✅ Use translated tagline
    const fullTagline = t.splash.tagline;

    timers.push(setTimeout(() => {
      const loop = Animated.loop(Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 1100, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 1100, useNativeDriver: true }),
      ]));
      loop.start();
    }, 300));

    timers.push(setTimeout(() => {
      let i = 0;
      // ✅ Reset tagline before starting typewriter
      setTagline("");
      typewriterInterval = setInterval(() => {
        setTagline(fullTagline.slice(0, i + 1));
        i++;
        if (i === fullTagline.length) clearInterval(typewriterInterval);
      }, 42);
    }, 1200));

    timers.push(setTimeout(() => {
      Animated.timing(loadWidthAnim, { toValue: 220, duration: 1000, useNativeDriver: false }).start();
    }, 2600));

    timers.push(setTimeout(() => { router.replace("/language"); }, 3800));

    return () => {
      timers.forEach(clearTimeout);
      if (typewriterInterval) clearInterval(typewriterInterval);
      pulseAnim.stopAnimation();
      loadWidthAnim.stopAnimation();
    };
  }, [router, t]);

  return (
    <LinearGradient colors={["#021F0F", "#042818", "#053B24", "#042818", "#021F0F"]} style={styles.container}>
      <StatusBar hidden backgroundColor="transparent" />

      {particles.map((p) => <Particle key={p.id} particle={p} />)}

      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg height="100%" width="100%">
          <Defs>
            <Pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <Circle cx="2" cy="2" r="1" fill="#FFFFFF" opacity="0.03" />
            </Pattern>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#grid)" />
          <Path d="M -20 120 Q 40 100 60 20 Q 50 80 10 100" fill="none" stroke="#22c55e" strokeWidth="4" opacity="0.06" />
          <Path d={`M ${screenWidth + 20} ${screenHeight - 100} Q ${screenWidth - 40} ${screenHeight - 80} ${screenWidth - 60} ${screenHeight - 20}`} fill="none" stroke="#22c55e" strokeWidth="4" opacity="0.06" />
        </Svg>
      </View>

      <View style={styles.logoContainer}>
        <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulseAnim }] }]} />
        <Reanimated.View entering={ZoomIn.duration(600).springify()} style={styles.outerGlow}>
          <LinearGradient colors={["#0A5C38", "#053B24", "#021F0F"]} style={styles.innerLogo}>
            <Image source={require("../assets/images/splash1.png")} style={styles.logoImage} contentFit="contain" />
          </LinearGradient>
        </Reanimated.View>
      </View>

      <View style={styles.titleContainer}>
        <Reanimated.Text entering={FadeInDown.delay(900).duration(500)} style={styles.title}>
          AgriFusion
        </Reanimated.Text>
        <Reanimated.View entering={FadeInDown.delay(1100).duration(400)} style={styles.divider} />
      </View>

      {/* ✅ Typewriter now uses translated tagline */}
      <Text style={styles.tagline}>{tagline}</Text>

      {/* ✅ Translated feature pills */}
      <View style={styles.pillsContainer}>
        <Reanimated.View entering={FadeInUp.delay(1800).duration(500)} style={styles.pill}>
          <Text style={styles.pillText}>🌱 {t.splash.smartTasks}</Text>
        </Reanimated.View>
        <Reanimated.View entering={FadeInUp.delay(2000).duration(500)} style={styles.pill}>
          <Text style={styles.pillText}>🏆 {t.splash.earnXP}</Text>
        </Reanimated.View>
        <Reanimated.View entering={FadeInUp.delay(2200).duration(500)} style={styles.pill}>
          <Text style={styles.pillText}>🤝 {t.splash.connect}</Text>
        </Reanimated.View>
      </View>

      <View style={styles.loadingContainer}>
        <Animated.View style={[styles.loadingFill, { width: loadWidthAnim }]}>
          <LinearGradient colors={["#22c55e", "#4ade80"]} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
        </Animated.View>
      </View>

      <Reanimated.Text entering={FadeIn.delay(3000).duration(600)} style={styles.versionText}>
        Made with 💚
      </Reanimated.Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  particle: { position: "absolute" },
  logoContainer: { alignItems: "center", justifyContent: "center", marginTop: 40, marginBottom: 30 },
  pulseRing: { position: "absolute", width: 240, height: 240, borderRadius: 120, borderWidth: 1, borderColor: "#22c55e", opacity: 0.2 },
  outerGlow: { width: 240, height: 240, borderRadius: 120, backgroundColor: "rgba(34,197,94,0.05)", borderWidth: 1.5, borderColor: "rgba(34,197,94,0.25)", alignItems: "center", justifyContent: "center" },
  innerLogo: { width: 180, height: 180, borderRadius: 90, borderWidth: 2, borderColor: "rgba(74,222,128,0.4)", shadowColor: "#22c55e", shadowOpacity: 0.5, shadowRadius: 30, elevation: 20, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  logoImage: { width: 140, height: 140 },
  titleContainer: { alignItems: "center", marginBottom: 16 },
  title: { fontSize: 42, fontWeight: "900", color: "#ECFDF5", letterSpacing: 3 },
  divider: { width: 60, height: 2, backgroundColor: "#22c55e", borderRadius: 1, marginTop: 8 },
  tagline: { fontSize: 15, color: "#BBF7D0", letterSpacing: 0.8, textAlign: "center", height: 20, marginBottom: 40 },
  pillsContainer: { alignItems: "center", gap: 10, marginBottom: 60 },
  pill: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(34,197,94,0.1)", borderWidth: 1, borderColor: "rgba(34,197,94,0.25)", borderRadius: 999, paddingHorizontal: 18, paddingVertical: 10 },
  pillText: { color: "#ECFDF5", fontSize: 14, fontWeight: "600" },
  loadingContainer: { position: "absolute", bottom: 100, width: 220, height: 5, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.08)", overflow: "hidden" },
  loadingFill: { height: "100%", borderRadius: 3 },
  versionText: { position: "absolute", bottom: 40, fontSize: 11, color: "rgba(187,247,208,0.45)", textAlign: "center" },
});