import React, { useEffect, useRef } from "react";
import { View, Text, Image, StyleSheet, Animated, Easing } from "react-native";
import { useRouter } from "expo-router";

export default function SplashScreen() {
  const router = useRouter();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      })
    ]).start();

    setTimeout(() => {
      router.replace("language");
    }, 2200);
  }, []);

  return (
    <View style={styles.container}>

      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          alignItems: "center",
        }}
      >
        {/* IMAGE WITHOUT ANY MODIFICATION */}
        <View style={styles.imageWrapper}>
          <Image
            source={require("../assets/images/splash1.png")} 
            style={styles.image}
          />
        </View>

        <Text style={styles.title}>AgriFusion</Text>
        <Text style={styles.subtitle}>
          Empowering Farmers Through Technology
        </Text>
      </Animated.View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#053B24",
    justifyContent: "center",
    alignItems: "center",
  },

  imageWrapper: {
    width: 260,
    height: 260,
    borderRadius: 20,
    overflow: "hidden",

    // Soft glow
    shadowColor: "#00FF7F",
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 20,
  },

  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  title: {
    marginTop: 20,
    fontSize: 34,
    fontWeight: "bold",
    color: "white",
    letterSpacing: 1,
  },

  subtitle: {
    fontSize: 15,
    color: "#C7FFDA",
    marginTop: 6,
  },
});