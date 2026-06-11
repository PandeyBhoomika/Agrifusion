import React, { useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

// Import the components you just moved!
import StartScreen from "../../components/crop-game/StartScreen";
import GameScreen from "../../components/crop-game/GameScreen";

export default function CropRotationGame() {
    const [screen, setScreen] = useState("start");

    return (
        <>
            {/* Hide the default header so the game takes up the full screen */}
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="dark" />

            {/* This mimics your old App.js logic! */}
            {screen === "start" ? (
                <StartScreen onStart={() => setScreen("game")} />
            ) : (
                <GameScreen />
            )}
        </>
    );
}