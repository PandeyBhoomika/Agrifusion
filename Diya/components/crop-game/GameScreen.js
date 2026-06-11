// screens/GameScreen.js
import React, {
    useState,
    useMemo,
    useRef,
    useEffect,
} from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Pressable,
    Platform,
    ScrollView,
} from "react-native";
import { WebView } from "react-native-webview";
import * as Speech from "expo-speech";
import { Dimensions } from "react-native";

// ---- Screen-based grid sizing ----
const { width } = Dimensions.get("window");
const GRID_SIZE = width * 0.82; // square grid, fits nicely in screen

// ----------------- Core Config -----------------

const ROWS = 3;
const COLS = 3;
const INITIAL_GRID = Array.from({ length: ROWS }, () =>
    Array(COLS).fill(0)
);

const CROPS = [
    {
        id: 1,
        emoji: "🌽",
        name: "Maize",
        type: "cereal",
        tip: "Maize needs lots of nitrogen. Partner it with a Legume!",
        soilImpact: -20,
    },
    {
        id: 2,
        emoji: "🫛",
        name: "Pea",
        type: "legume",
        tip: "Peas fix nitrogen in the soil. Great beside cereals.",
        soilImpact: +30,
    },
    {
        id: 3,
        emoji: "🍅",
        name: "Tomato",
        type: "veg",
        tip: "Tomatoes deplete nutrients. Avoid clustering veggies together.",
        soilImpact: -10,
    },
    {
        id: 4,
        emoji: "🥬",
        name: "Spinach",
        type: "leafy",
        tip: "Spinach is a light feeder, but don’t repeat leafy crops in same spot.",
        soilImpact: -5,
    },
    {
        id: 5,
        emoji: "🥜",
        name: "Groundnut",
        type: "legume",
        tip: "Groundnuts are soil improvers. Good after heavy feeders.",
        soilImpact: +20,
    },
    {
        id: 6,
        emoji: "🌻",
        name: "Sunflower",
        type: "oilseed",
        tip: "Sunflowers are deep rooted and heavy feeders. Rotate them wisely.",
        soilImpact: -15,
    },
];

const missions = [
    {
        id: 1,
        title: "Start Strong",
        text: "Target: Achieve 250+ total XP this Season.",
        check: (seasonXP) => seasonXP >= 250,
        reward: 100,
    },
    {
        id: 2,
        title: "Soil Protector",
        text: "Target: End the season with Soil Health at 120% or more.",
        check: (soilHealth) => soilHealth >= 120,
        reward: 150,
    },
];

const getCropById = (id) => CROPS.find((c) => c.id === id);

// ----------------- Phaser HTML (WebView) -----------------

const makePhaserHTML = () => {
    const phaserCrops = CROPS.map((c) => ({
        id: c.id,
        emoji: c.emoji,
        name: c.name,
    }));

    return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0"
    />
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      html, body {
        width: 100%;
        height: 100%;
        overflow: hidden;
        background: #57d3ff;
      }
      canvas {
        display: block;
        touch-action: none;
      }
      body, canvas {
        -webkit-user-select: none;
        -webkit-touch-callout: none;
      }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.js"></script>
  </head>
  <body>
    <script>
      const ROWS = ${ROWS};
      const COLS = ${COLS};
      const CELL_SIZE = 96; // tuned so full 3x3 fits in 320px height
      const CROPS = ${JSON.stringify(phaserCrops)};

      function sendToApp(obj) {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify(obj));
        }
      }

      class FarmScene extends Phaser.Scene {
        constructor() {
          super("FarmScene");
          this.gridCells = [];
          this.placedSprites = [];
        }

        create() {
          const width = this.sys.game.config.width;
          const height = this.sys.game.config.height;

          this.add.rectangle(width/2, height/2, width, height, 0x93e9ff);
          this.add.rectangle(width/2, height - 30, width, 60, 0x3baf6f).setDepth(-1);

          const gridW = COLS * CELL_SIZE;
          const startX = (width - gridW) / 2;
          const startY = 20;

          for (let r = 0; r < ROWS; r++) {
            this.gridCells[r] = [];
            this.placedSprites[r] = [];
            for (let c = 0; c < COLS; c++) {
              const x = startX + c * CELL_SIZE + CELL_SIZE/2;
              const y = startY + r * CELL_SIZE + CELL_SIZE/2;

              const cellBg = this.add.rectangle(
                x, y, CELL_SIZE - 12, CELL_SIZE - 12, 0x9b5a2a
              ).setStrokeStyle(4, 0x5b3516).setDepth(1);

              const label = this.add.text(x, y+16, "Tap", {
                fontFamily: "Arial",
                fontSize: 12,
                color: "#f3e1c6"
              }).setOrigin(0.5).setDepth(2);

              const hit = this.add.rectangle(
                x, y, CELL_SIZE - 12, CELL_SIZE - 12, 0x000000, 0
              ).setInteractive({ useHandCursor: true });

              hit.on("pointerdown", () => {
                sendToApp({ type: "CELL_CLICKED", row: r, col: c });
              });

              this.gridCells[r][c] = { x, y, cellBg, label, hit };
              this.placedSprites[r][c] = null;
            }
          }

          const handler = (event) => {
            let data;
            try { data = JSON.parse(event.data); } catch (e) { return; }
            if (!data || typeof data !== "object") return;

            if (data.type === "SYNC_GRID" && Array.isArray(data.grid)) {
              this.syncGrid(data.grid);
            }
          };

          window.addEventListener("message", handler);
          document.addEventListener("message", handler);
        }

        syncGrid(grid) {
          for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
              const cropId = grid[r][c];
              const cell = this.gridCells[r][c];

              if (this.placedSprites[r][c]) {
                this.placedSprites[r][c].destroy();
                this.placedSprites[r][c] = null;
              }

              if (!cropId) {
                cell.label.setText("Tap");
                continue;
              }

              const crop = CROPS.find(x => x.id === cropId);
              if (!crop) continue;

              cell.label.setText("");

              const container = this.add.container(cell.x, cell.y);

              const rect = this.add.rectangle(
                0, 0, CELL_SIZE - 18, CELL_SIZE - 18, 0xffffff
              ).setStrokeStyle(3, 0xfcd34d);

              const emoji = this.add.text(0, -6, crop.emoji, {
                fontFamily: "Arial",
                fontSize: 30
              }).setOrigin(0.5);

              const name = this.add.text(0, 18, crop.name, {
                fontFamily: "Arial",
                fontSize: 11,
                color: "#374151"
              }).setOrigin(0.5);

              container.add([rect, emoji, name]);
              container.setDepth(5);

              this.placedSprites[r][c] = container;

              this.tweens.add({
                targets: container,
                scaleX: 1.05,
                scaleY: 1.05,
                yoyo: true,
                duration: 150
              });
            }
          }
        }
      }

      const config = {
        type: Phaser.AUTO,
        width: window.innerWidth,
        height: 320,   // fixed height so full grid visible
        backgroundColor: "#57d3ff",
        input: {
          activePointers: 3,
          touch: true,
          mouse: true,
          dragDistanceThreshold: 4
        },
        scene: [FarmScene]
      };

      new Phaser.Game(config);
    </script>
  </body>
</html>
`;
};

// ----------------- React Native Game Screen -----------------

export default function GameScreen() {
    const [grid, setGrid] = useState(INITIAL_GRID);
    const [xp, setXp] = useState(0);
    const [soilHealth, setSoilHealth] = useState(100);
    const [turnsLeft, setTurnsLeft] = useState(5);
    const [level, setLevel] = useState(1);
    const [currentSeasonXP, setCurrentSeasonXP] = useState(0);
    const [missionIndex, setMissionIndex] = useState(0);
    const [selectedCropId, setSelectedCropId] = useState(CROPS[0].id);

    const [feedback, setFeedback] = useState(null); // {message, type}
    const [infoCrop, setInfoCrop] = useState(null);
    const [timeString, setTimeString] = useState("");

    const webviewRef = useRef(null);
    const html = useMemo(() => makePhaserHTML(), []);

    const MAX_HEALTH = 150;
    const currentMission = missions[missionIndex];

    // ---------- Time Stamp ----------
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            let hh = now.getHours();
            const mm = String(now.getMinutes()).padStart(2, "0");
            const suffix = hh >= 12 ? "PM" : "AM";
            if (hh === 0) hh = 12;
            else if (hh > 12) hh = hh - 12;
            setTimeString(`${hh}:${mm} ${suffix}`);
        };
        updateTime();
        const id = setInterval(updateTime, 30000);
        return () => clearInterval(id);
    }, []);

    // ---------- Voice Assistant (TTS) ----------
    const speakSummary = () => {
        try {
            Speech.stop();
            const soilPercent = Math.round((soilHealth / MAX_HEALTH) * 100);
            const missionLine = currentMission
                ? `Current mission is ${currentMission.title}. ${currentMission.text}`
                : "No mission selected.";
            const msg = `Time is ${timeString}. Your experience is ${xp} points. Soil health is ${soilPercent} percent. Seasons left ${turnsLeft}. Level ${level}. ${missionLine}`;
            Speech.speak(msg, {
                language: "en-IN",
                rate: 1.0,
                pitch: 1.0,
            });
        } catch (e) {
            console.log("Speech error:", e);
        }
    };

    // send updated grid to Phaser
    const syncGridToPhaser = (newGrid) => {
        if (!webviewRef.current) return;
        const msg = JSON.stringify({ type: "SYNC_GRID", grid: newGrid });
        webviewRef.current.postMessage(msg);
    };

    const showToast = (message, type) => {
        setFeedback({ message, type });
        setTimeout(() => setFeedback(null), 2000);
    };

    // placement scoring logic
    const evaluatePlacement = (gridAfter, r, c, isRemoving) => {
        if (isRemoving) return;

        const placedId = gridAfter[r][c];
        const placedCrop = getCropById(placedId);
        if (!placedCrop) return;

        let gainXP = 10; // base XP
        let comboCount = 0;
        let penalty = false;

        const neighbors = [
            [r - 1, c],
            [r + 1, c],
            [r, c - 1],
            [r, c + 1],
        ];

        neighbors.forEach(([nr, nc]) => {
            if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) return;
            const nbId = gridAfter[nr][nc];
            if (!nbId) return;
            const nbCrop = getCropById(nbId);

            if (
                (placedCrop.type === "legume" && nbCrop.type === "cereal") ||
                (placedCrop.type === "cereal" && nbCrop.type === "legume")
            ) {
                gainXP += 40;
                comboCount++;
            }

            if (nbCrop.type === placedCrop.type) {
                gainXP -= 15;
                penalty = true;
            }
        });

        const types = new Set(
            gridAfter
                .flat()
                .filter((id) => id !== 0)
                .map((id) => getCropById(id)?.type)
                .filter(Boolean)
        );
        if (types.size >= 3) {
            gainXP += 50;
        }

        if (gainXP !== 0) {
            setXp((prev) => prev + gainXP);
            setCurrentSeasonXP((prev) => prev + gainXP);
        }

        if (comboCount > 0) {
            showToast(
                `Eco Combo! Legume + Cereal Synergy (+${40 * comboCount} XP)`,
                "combo"
            );
        } else if (penalty) {
            showToast("Warning! Monoculture risk near that crop.", "error");
        } else {
            showToast(`Good placement! (+${gainXP} XP)`, "success");
        }
    };

    const handleMessageFromPhaser = (event) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === "CELL_CLICKED") {
                handlePlacement(data.row, data.col);
            }
        } catch (e) {
            console.log("Phaser message parse error", e);
        }
    };

    const handlePlacement = (r, c) => {
        if (!selectedCropId) {
            showToast("Select a crop first from the palette.", "error");
            return;
        }

        setGrid((prev) => {
            const newGrid = prev.map((row) => [...row]);
            const same = newGrid[r][c] === selectedCropId;
            newGrid[r][c] = same ? 0 : selectedCropId;

            evaluatePlacement(newGrid, r, c, same);
            syncGridToPhaser(newGrid);
            return newGrid;
        });
    };

    const handleAdvanceSeason = () => {
        if (turnsLeft <= 0) {
            showToast("All seasons completed!", "error");
            return;
        }

        let soilDelta = 0;
        let plantedCount = 0;
        grid.flat().forEach((id) => {
            const crop = getCropById(id);
            if (crop) {
                plantedCount++;
                soilDelta += crop.soilImpact;
            }
        });

        if (plantedCount === 0) {
            soilDelta -= 15;
            showToast(
                "Soil left bare! Plant something to protect your land.",
                "error"
            );
        }

        let newSoil = Math.max(0, Math.min(MAX_HEALTH, soilHealth + soilDelta));
        const change = newSoil - soilHealth;
        setSoilHealth(newSoil);

        const seasonStat =
            currentMission.id === 1 ? currentSeasonXP : newSoil;

        if (currentMission.check(seasonStat)) {
            const reward = currentMission.reward * level;
            setXp((prev) => prev + reward);
            showToast(
                `Mission complete: ${currentMission.title}! (+${reward} XP)`,
                "success"
            );
            if (missionIndex < missions.length - 1) {
                setMissionIndex((prev) => prev + 1);
            } else {
                setLevel((prev) => prev + 1);
                setMissionIndex(0);
            }
        } else {
            showToast("Mission failed this season. Try next time!", "error");
        }

        setTurnsLeft((prev) => prev - 1);
        setCurrentSeasonXP(0);
        const cleared = INITIAL_GRID;
        setGrid(cleared);
        syncGridToPhaser(cleared);

        console.log(
            change > 0
                ? `Soil improved (+${change})`
                : change < 0
                    ? `Soil depleted (${change})`
                    : "Soil stable"
        );
    };

    const soilPercent = Math.round((soilHealth / MAX_HEALTH) * 100);
    const currentCrop = getCropById(selectedCropId);

    return (
        <View style={styles.screen}>
            {feedback && (
                <View
                    style={[
                        styles.toast,
                        feedback.type === "success" && styles.toastSuccess,
                        feedback.type === "error" && styles.toastError,
                        feedback.type === "combo" && styles.toastCombo,
                    ]}
                >
                    <Text style={styles.toastText}>{feedback.message}</Text>
                </View>
            )}

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* HEADER */}
                <View style={styles.headerCard}>
                    <View style={styles.headerTopRow}>
                        <Text style={styles.headerTitle}>👩‍🌾 Crop Rotation Puzzle</Text>
                        <View style={styles.headerRight}>
                            <Text style={styles.timeText}>{timeString}</Text>
                            <TouchableOpacity
                                style={styles.voiceButton}
                                onPress={speakSummary}
                            >
                                <Text style={styles.voiceIcon}>🔊</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.headerStatsRow}>
                        <View style={styles.chip}>
                            <Text style={styles.chipLabel}>⭐ {xp} XP</Text>
                        </View>
                        <View style={styles.chip}>
                            <Text style={styles.chipLabel}>☀ Season: {turnsLeft}</Text>
                        </View>
                        <View style={styles.chip}>
                            <Text style={styles.chipLabel}>📚 Level: {level}</Text>
                        </View>
                    </View>
                </View>

                {/* SOIL HEALTH */}
                <View style={styles.soilCard}>
                    <View style={styles.soilRow}>
                        <Text style={styles.soilIcon}>🍃</Text>
                        <View style={styles.soilBarBg}>
                            <View
                                style={[
                                    styles.soilBarFill,
                                    { width: `${soilPercent}%` },
                                    soilPercent > 75
                                        ? styles.soilGood
                                        : soilPercent > 40
                                            ? styles.soilMedium
                                            : styles.soilLow,
                                ]}
                            />
                        </View>
                        <Text style={styles.soilText}>{soilPercent}%</Text>
                    </View>
                </View>

                {/* MISSION CARD */}
                <View style={styles.missionCard}>
                    <Text style={styles.missionTitle}>
                        ➜ Mission: {currentMission.title}
                    </Text>
                    <Text style={styles.missionBody}>{currentMission.text}</Text>
                    <View style={styles.rewardPill}>
                        <Text style={styles.rewardText}>
                            Reward: +{currentMission.reward} XP
                        </Text>
                    </View>
                </View>

                {/* GRID + BUTTON */}
                <View style={styles.gridWrapper}>
                    <View style={styles.gridCard}>
                        <View style={styles.gridInner}>
                            <WebView
                                ref={webviewRef}
                                style={styles.webview}
                                originWhitelist={["*"]}
                                source={{ html }}
                                onMessage={handleMessageFromPhaser}
                                javaScriptEnabled
                                domStorageEnabled
                                mixedContentMode="always"
                                androidLayerType="hardware"
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.advanceButton,
                            turnsLeft <= 0 && { opacity: 0.4 },
                        ]}
                        disabled={turnsLeft <= 0}
                        onPress={handleAdvanceSeason}
                    >
                        <Text style={styles.advanceButtonText}>
                            {turnsLeft > 1
                                ? `Advance to Next Season (${turnsLeft - 1} left)`
                                : turnsLeft === 1
                                    ? "Final Harvest!"
                                    : "Seasons Complete"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* CROP PALETTE */}
                <View style={styles.paletteCard}>
                    <Text style={styles.paletteTitle}>
                        🌱 Crop Palette: Tap to Select
                    </Text>
                    <View style={styles.paletteRow}>
                        {CROPS.map((crop) => (
                            <TouchableOpacity
                                key={crop.id}
                                style={[
                                    styles.cropTile,
                                    selectedCropId === crop.id && styles.cropTileSelected,
                                ]}
                                onPress={() => setSelectedCropId(crop.id)}
                                onLongPress={() => setInfoCrop(crop)}
                            >
                                <Text style={styles.cropEmoji}>{crop.emoji}</Text>
                                <Text style={styles.cropName}>{crop.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    {currentCrop && (
                        <Text style={styles.hintText}>
                            Selected: {currentCrop.emoji} {currentCrop.name} – long press
                            any crop for rotation tips.
                        </Text>
                    )}
                </View>
            </ScrollView>

            {/* INFO MODAL */}
            <Modal
                transparent
                visible={!!infoCrop}
                animationType="fade"
                onRequestClose={() => setInfoCrop(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        {infoCrop && (
                            <>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>
                                        {infoCrop.emoji} {infoCrop.name}
                                    </Text>
                                    <Pressable
                                        onPress={() => setInfoCrop(null)}
                                        style={styles.modalClose}
                                    >
                                        <Text style={{ color: "#fff", fontWeight: "bold" }}>
                                            ✕
                                        </Text>
                                    </Pressable>
                                </View>
                                <Text style={styles.modalTipTitle}>Rotation Tip:</Text>
                                <Text style={styles.modalTipBody}>{infoCrop.tip}</Text>
                                <Text style={styles.modalMeta}>
                                    Type:{" "}
                                    <Text style={{ fontWeight: "bold" }}>
                                        {infoCrop.type.toUpperCase()}
                                    </Text>{" "}
                                    | Soil Impact:{" "}
                                    <Text
                                        style={{
                                            fontWeight: "bold",
                                            color:
                                                infoCrop.soilImpact > 0 ? "#16a34a" : "#dc2626",
                                        }}
                                    >
                                        {infoCrop.soilImpact}
                                    </Text>
                                </Text>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

// ----------------- Styles -----------------

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#6EE7F9",
        paddingTop: Platform.OS === "android" ? 24 : 40,
    },
    scrollContent: {
        paddingHorizontal: 12,
        paddingBottom: 24,
    },

    headerCard: {
        backgroundColor: "#FACC15",
        borderRadius: 24,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
        elevation: 4,
    },
    headerTopRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "900",
        color: "#1E3A8A",
    },
    headerRight: {
        flexDirection: "row",
        alignItems: "center",
    },
    timeText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#1F2937",
        marginRight: 8,
    },
    voiceButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: "#4F46E5",
        alignItems: "center",
        justifyContent: "center",
    },
    voiceIcon: {
        fontSize: 16,
        color: "#fff",
    },

    headerStatsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    chip: {
        backgroundColor: "#FEF3C7",
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    chipLabel: {
        fontSize: 13,
        fontWeight: "700",
        color: "#374151",
    },

    soilCard: {
        backgroundColor: "#FEF9C3",
        borderRadius: 18,
        padding: 10,
        marginBottom: 10,
        borderWidth: 2,
        borderColor: "#FACC15",
    },
    soilRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    soilIcon: {
        fontSize: 20,
        marginRight: 6,
    },
    soilBarBg: {
        flex: 1,
        height: 12,
        borderRadius: 999,
        backgroundColor: "#E5E7EB",
        overflow: "hidden",
    },
    soilBarFill: {
        height: "100%",
        borderRadius: 999,
    },
    soilGood: { backgroundColor: "#22C55E" },
    soilMedium: { backgroundColor: "#FACC15" },
    soilLow: { backgroundColor: "#EF4444" },
    soilText: {
        width: 50,
        textAlign: "right",
        fontSize: 12,
        fontWeight: "700",
        color: "#374151",
        marginLeft: 6,
    },

    missionCard: {
        backgroundColor: "#4ADE80",
        borderRadius: 22,
        paddingVertical: 12,
        paddingHorizontal: 14,
        marginBottom: 12,
        borderWidth: 3,
        borderColor: "#22C55E",
    },
    missionTitle: {
        fontSize: 16,
        fontWeight: "900",
        color: "#14532D",
        marginBottom: 4,
    },
    missionBody: {
        fontSize: 13,
        color: "#064E3B",
        marginBottom: 8,
    },
    rewardPill: {
        alignSelf: "flex-start",
        backgroundColor: "#FBBF24",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
    },
    rewardText: {
        fontSize: 12,
        fontWeight: "900",
        color: "#92400E",
    },

    gridWrapper: {
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 6,
    },
    gridCard: {
        width: GRID_SIZE,
        height: GRID_SIZE,
        backgroundColor: "#047857",
        borderRadius: 32,
        padding: 10,
        borderWidth: 6,
        borderColor: "#854D0E",
        alignSelf: "center",
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
        elevation: 4,
    },
    gridInner: {
        flex: 1,
        borderRadius: 26,
        overflow: "hidden",
        backgroundColor: "transparent",
    },
    webview: {
        flex: 1,
    },

    advanceButton: {
        marginTop: 10,
        backgroundColor: "#6366F1",
        paddingVertical: 12,
        paddingHorizontal: 18,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 6,
        elevation: 3,
    },
    advanceButtonText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "900",
        textAlign: "center",
    },

    paletteCard: {
        backgroundColor: "#E0ECFF",
        borderRadius: 24,
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginTop: 8,
        marginBottom: 12,
        borderWidth: 3,
        borderColor: "#4F46E5",
    },
    paletteTitle: {
        fontSize: 15,
        fontWeight: "900",
        color: "#1E3A8A",
        marginBottom: 6,
        textAlign: "center",
    },
    paletteRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    cropTile: {
        width: "30%",
        aspectRatio: 0.85,
        backgroundColor: "#FEF9C3",
        borderRadius: 18,
        marginBottom: 8,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "#FACC15",
    },
    cropTileSelected: {
        borderColor: "#4F46E5",
        shadowColor: "#4F46E5",
        shadowOpacity: 0.4,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 6,
        elevation: 3,
    },
    cropEmoji: { fontSize: 26, marginBottom: 4 },
    cropName: {
        fontSize: 12,
        fontWeight: "800",
        color: "#1F2937",
    },
    hintText: {
        marginTop: 4,
        fontSize: 11,
        color: "#4B5563",
        textAlign: "center",
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.45)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    modalCard: {
        backgroundColor: "#FEFCE8",
        borderRadius: 24,
        padding: 16,
        width: "100%",
        maxWidth: 380,
        borderWidth: 3,
        borderColor: "#FBBF24",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "900",
        color: "#1E3A8A",
    },
    modalClose: {
        backgroundColor: "#F97373",
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    modalTipTitle: {
        fontSize: 14,
        fontWeight: "900",
        color: "#166534",
        marginTop: 4,
        marginBottom: 2,
    },
    modalTipBody: {
        fontSize: 13,
        color: "#374151",
        marginBottom: 8,
    },
    modalMeta: {
        fontSize: 12,
        color: "#4B5563",
        marginTop: 4,
    },

    toast: {
        position: "absolute",
        top: Platform.OS === "android" ? 30 : 50,
        left: 20,
        right: 20,
        zIndex: 20,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "#FFFFFF",
    },
    toastText: {
        color: "#ffffff",
        fontWeight: "900",
        fontSize: 12,
        textAlign: "center",
    },
    toastSuccess: { backgroundColor: "#22C55E" },
    toastError: { backgroundColor: "#EF4444" },
    toastCombo: { backgroundColor: "#FACC15" },
});

