// screens/StartScreen.js
import React, { useEffect, useRef } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    StatusBar,
} from "react-native";

export default function StartScreen({ onStart }) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.85)).current;
    const floatAnim = useRef(new Animated.Value(0)).current;
    const playPulse = useRef(new Animated.Value(1)).current;

    // Fade + scale intro
    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 700,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 700,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    // Floating animation for clouds, farmer, bird
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(floatAnim, {
                    toValue: -8,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(floatAnim, {
                    toValue: 0,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    // Play button pulsing
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(playPulse, {
                    toValue: 1.07,
                    duration: 900,
                    useNativeDriver: true,
                }),
                Animated.timing(playPulse, {
                    toValue: 1,
                    duration: 900,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <Animated.View
            style={[
                styles.container,
                { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
            ]}
        >
            <StatusBar hidden />

            {/* Clouds floating */}
            <Animated.Text
                style={[
                    styles.cloud,
                    { top: 70, left: 40, transform: [{ translateY: floatAnim }] },
                ]}
            >
                ☁️
            </Animated.Text>
            <Animated.Text
                style={[
                    styles.cloud,
                    { top: 110, right: 40, transform: [{ translateY: floatAnim }] },
                ]}
            >
                ☁️
            </Animated.Text>

            {/* Title Card */}
            <View style={styles.titleBox}>
                <Text style={styles.gameTitle}>🌾 The Farm Land</Text>
                <Text style={styles.tagline}>Grow • Play • Harvest • Repeat</Text>
            </View>
            {/* WELCOME TEXT */}
            <Animated.Text
                style={[
                    {
                        fontSize: 28,
                        fontWeight: "900",
                        color: "#ffffff",
                        textShadowColor: "#00000040",
                        textShadowOffset: { width: 2, height: 2 },
                        textShadowRadius: 6,
                        marginTop: 18,
                        transform: [{ translateY: floatAnim }],
                    },
                ]}
            >
                👋 Welcome Farmers!
            </Animated.Text>


            {/* Farmer + Bird floating */}
            <Animated.View
                style={[styles.floatItem, { transform: [{ translateY: floatAnim }] }]}
            >
                <Text style={styles.emojiBig}>👩‍🌾</Text>
            </Animated.View>
            <Animated.View
                style={[styles.floatItem2, { transform: [{ translateY: floatAnim }] }]}
            >
                <Text style={styles.emojiBig}>🐦</Text>
            </Animated.View>

            {/* Cartoon Hills */}
            <View style={styles.hill2} />
            <View style={styles.hill1} />

            {/* Play Button */}
            <Animated.View style={{ transform: [{ scale: playPulse }] }}>
                <TouchableOpacity style={styles.playButton} onPress={onStart}>
                    <Text style={styles.playText}>Play</Text>
                </TouchableOpacity>
            </Animated.View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#7DD3FC", // sky blue
        alignItems: "center",
        justifyContent: "center",
    },

    // Clouds
    cloud: {
        position: "absolute",
        fontSize: 50,
        opacity: 0.8,
    },

    // Title
    titleBox: {
        marginTop: 40,
        backgroundColor: "rgba(255,255,255,0.9)",
        paddingVertical: 18,
        paddingHorizontal: 30,
        borderRadius: 25,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
    },

    gameTitle: {
        fontSize: 34,
        fontWeight: "900",
        color: "#1E3A8A",
    },

    tagline: {
        fontSize: 15,
        marginTop: 6,
        color: "#0F172A",
    },

    // Floating farmer/bird
    floatItem: {
        position: "absolute",
        top: 220,
        left: 40,
    },
    floatItem2: {
        position: "absolute",
        top: 260,
        right: 40,
    },
    emojiBig: {
        fontSize: 60,
    },

    // Cartoon hills
    hill1: {
        position: "absolute",
        bottom: 0,
        width: "120%",
        height: 260,
        backgroundColor: "#4ade80",
        borderTopLeftRadius: 2000,
        borderTopRightRadius: 2000,
    },

    hill2: {
        position: "absolute",
        bottom: -40,
        width: "140%",
        height: 300,
        backgroundColor: "#22c55e",
        borderTopLeftRadius: 2000,
        borderTopRightRadius: 2000,
    },

    // Play button
    playButton: {
        backgroundColor: "#FACC15",
        paddingVertical: 16,
        paddingHorizontal: 70,
        borderRadius: 90,
        marginTop: 60,
        shadowColor: "#b45309",
        shadowOpacity: 0.4,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 6,
    },

    playText: {
        fontSize: 26,
        fontWeight: "900",
        color: "#7c2d12",
    },
});
