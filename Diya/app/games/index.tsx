import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function MiniGamesMenu() {
    const router = useRouter();

    return (
        <LinearGradient colors={['#F5FFF9', '#E6F4EA']} style={styles.container}>
            <StatusBar style="dark" />
            <SafeAreaView style={{ flex: 1 }}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#064E3B" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Mini Games 🎮</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Game List */}
                <View style={styles.content}>
                    <Animated.View entering={FadeInDown.duration(400)}>
                        <TouchableOpacity
                            style={styles.gameCard}
                            activeOpacity={0.8}
                            onPress={() => router.push('/games/crop-rotation')}
                        >
                            <View style={styles.gameIconWrap}>
                                <Text style={styles.gameEmoji}>🌽</Text>
                            </View>
                            <View style={styles.gameInfo}>
                                <Text style={styles.gameTitle}>Crop Rotation Master</Text>
                                <Text style={styles.gameSub}>Learn how to balance soil nutrients!</Text>
                            </View>
                            <Ionicons name="play-circle" size={32} color="#10B981" />
                        </TouchableOpacity>
                    </Animated.View>
                </View>

            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', elevation: 2 },
    headerTitle: { fontSize: 22, fontWeight: '800', color: '#064E3B' },
    content: { paddingHorizontal: 20 },
    gameCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 16, borderRadius: 20, borderWidth: 1, borderColor: '#D1D5DB', elevation: 3 },
    gameIconWrap: { width: 60, height: 60, borderRadius: 15, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    gameEmoji: { fontSize: 32 },
    gameInfo: { flex: 1 },
    gameTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
    gameSub: { fontSize: 12, color: '#6B7280' },
});