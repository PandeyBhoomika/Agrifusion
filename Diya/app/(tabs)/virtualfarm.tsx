import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  Pressable,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// --- INTERFACES ---
type HealthStatus = 'healthy' | 'attention' | 'critical';

interface FarmPlot {
  id: string;
  cropName: string;
  emoji: string;
  plantedDate: string;
  healthStatus: HealthStatus;
  statusIcon: string;
  healthScore: number;
  aiTip: string;
}

// --- HELPER: GENERATE 10x8 GRID MOCK DATA ---
const CROP_TYPES = [
  { name: 'Wheat', emoji: '🌾' },
  { name: 'Corn', emoji: '🌽' },
  { name: 'Tomato', emoji: '🍅' },
  { name: 'Leafy Greens', emoji: '🥬' },
  { name: 'Legumes', emoji: '🫘' }
];

const generateGrid = (): FarmPlot[] => {
  const grid: FarmPlot[] = [];
  for (let i = 0; i < 80; i++) { // 10 columns * 8 rows = 80 plots
    const crop = CROP_TYPES[Math.floor(Math.random() * CROP_TYPES.length)];
    
    // Randomize health status, heavily weighted towards 'healthy'
    const rand = Math.random();
    let status: HealthStatus = 'healthy';
    let icon = '✅';
    let score = Math.floor(Math.random() * 15) + 85; // 85-100
    let tip = "Crop is thriving. Maintain current watering schedule.";

    if (rand > 0.85) {
      status = 'critical';
      icon = '🐛';
      score = Math.floor(Math.random() * 30) + 30; // 30-60
      tip = `High pest risk detected in ${crop.name} plot. Apply organic neem oil immediately.`;
    } else if (rand > 0.65) {
      status = 'attention';
      icon = '💧';
      score = Math.floor(Math.random() * 20) + 65; // 65-85
      tip = `Soil moisture is low for ${crop.name}. Increase drip irrigation duration by 15 mins.`;
    }

    grid.push({
      id: `plot-${i}`,
      cropName: crop.name,
      emoji: crop.emoji,
      plantedDate: '12 May, 2024',
      healthStatus: status,
      statusIcon: icon,
      healthScore: score,
      aiTip: tip,
    });
  }
  return grid;
};

// --- COLOR CONFIGS ---
const STATUS_COLORS = {
  healthy: { bg: 'rgba(34, 197, 94, 0.2)', border: '#22c55e', text: '#166534' },
  attention: { bg: 'rgba(250, 204, 21, 0.2)', border: '#facc15', text: '#a16207' },
  critical: { bg: 'rgba(239, 68, 68, 0.2)', border: '#ef4444', text: '#991b1b' },
};

export default function VirtualFarmScreen() {
  const [plots] = useState<FarmPlot[]>(generateGrid());
  const [selectedPlot, setSelectedPlot] = useState<FarmPlot | null>(null);

  // --- STATS CALCULATION ---
  const stats = useMemo(() => {
    let healthy = 0, attention = 0, critical = 0;
    let totalScore = 0;
    plots.forEach(p => {
      if (p.healthStatus === 'healthy') healthy++;
      if (p.healthStatus === 'attention') attention++;
      if (p.healthStatus === 'critical') critical++;
      totalScore += p.healthScore;
    });
    return {
      healthy, attention, critical,
      overallHealth: Math.round(totalScore / plots.length)
    };
  }, [plots]);

  // Transform 1D array into 8 rows of 10 columns for the grid
  const rows = [];
  for (let i = 0; i < 8; i++) {
    rows.push(plots.slice(i * 10, i * 10 + 10));
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#d4efdd', '#c0e5ce', '#b0dcc2']} style={StyleSheet.absoluteFillObject} />
      
      {/* --- HEADER SECTION --- */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.farmName}>Bhoomika's Farm</Text>
          <View style={styles.weatherBadge}>
            <Ionicons name="partly-sunny" size={16} color="#fbbf24" />
            <Text style={styles.weatherText}>32°C, Mostly Clear</Text>
          </View>
        </View>
        
        <View style={styles.healthScoreContainer}>
          <Text style={styles.healthScoreLabel}>Farm Health</Text>
          <Text style={[styles.healthScoreNumber, { color: stats.overallHealth > 75 ? '#14532d' : '#991b1b' }]}>
            {stats.overallHealth}%
          </Text>
        </View>
      </View>

      {/* --- 2D VIRTUAL MAP (Scrollable Grid) --- */}
      <View style={styles.mapContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.gridPadding}>
            {rows.map((row, rowIndex) => (
              <View key={`row-${rowIndex}`} style={styles.row}>
                {row.map((plot) => {
                  const colors = STATUS_COLORS[plot.healthStatus];
                  return (
                    <TouchableOpacity 
                      key={plot.id} 
                      activeOpacity={0.7}
                      onPress={() => setSelectedPlot(plot)}
                      style={[
                        styles.plotCell, 
                        { backgroundColor: colors.bg, borderColor: colors.border }
                      ]}
                    >
                      <Text style={styles.plotEmoji}>{plot.emoji}</Text>
                      <View style={styles.statusBadge}>
                        <Text style={styles.statusIconText}>{plot.statusIcon}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </ScrollView>
        </ScrollView>
      </View>

      {/* --- BOTTOM STATS BAR --- */}
      <View style={styles.bottomStatsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statEmoji}>🌱</Text>
          <Text style={styles.statText}>Healthy: <Text style={{fontWeight: 'bold'}}>{stats.healthy}</Text></Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statEmoji}>⚠️</Text>
          <Text style={styles.statText}>Attention: <Text style={{fontWeight: 'bold'}}>{stats.attention}</Text></Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statEmoji}>🚨</Text>
          <Text style={styles.statText}>Critical: <Text style={{fontWeight: 'bold'}}>{stats.critical}</Text></Text>
        </View>
      </View>

      {/* --- BOTTOM SHEET MODAL (Plot Details) --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={selectedPlot !== null}
        onRequestClose={() => setSelectedPlot(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setSelectedPlot(null)} />
          
          {selectedPlot && (
            <View style={styles.bottomSheet}>
              {/* Drag Handle */}
              <View style={styles.dragHandle} />

              <View style={styles.sheetHeader}>
                <View style={styles.sheetTitleRow}>
                  <Text style={styles.sheetEmoji}>{selectedPlot.emoji}</Text>
                  <View>
                    <Text style={styles.sheetTitle}>{selectedPlot.cropName}</Text>
                    <Text style={styles.sheetSubtitle}>Planted: {selectedPlot.plantedDate}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => setSelectedPlot(null)} style={styles.closeBtn}>
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>

              {/* Health Progress Bar */}
              <View style={styles.healthSection}>
                <View style={styles.healthTextRow}>
                  <Text style={styles.healthLabel}>Plot Health</Text>
                  <Text style={[styles.healthValue, { color: STATUS_COLORS[selectedPlot.healthStatus].text }]}>
                    {selectedPlot.healthScore}%
                  </Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View 
                    style={[
                      styles.progressBarFill, 
                      { 
                        width: `${selectedPlot.healthScore}%`,
                        backgroundColor: STATUS_COLORS[selectedPlot.healthStatus].border 
                      }
                    ]} 
                  />
                </View>
              </View>

              {/* AI Tip Box */}
              <View style={styles.aiTipBox}>
                <View style={styles.aiTipHeader}>
                  <MaterialCommunityIcons name="robot-outline" size={20} color="#14532d" />
                  <Text style={styles.aiTipTitle}>AgriFusion AI Tip</Text>
                </View>
                <Text style={styles.aiTipText}>{selectedPlot.aiTip}</Text>
              </View>

              {/* Action Button */}
              <TouchableOpacity style={styles.logActionBtn}>
                <Text style={styles.logActionText}>Log Action</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>

    </View>
  );
}

const { width } = Dimensions.get('window');
const PLOT_SIZE = 64; // Size of each square plot
const PLOT_MARGIN = 4;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60, // Safe area for notch
    paddingBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  headerLeft: {
    flex: 1,
  },
  farmName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#14532d',
    marginBottom: 4,
  },
  weatherBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  weatherText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4b5563',
    marginLeft: 6,
  },
  healthScoreContainer: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    shadowColor: '#14532d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  healthScoreLabel: {
    fontSize: 12,
    color: '#4b5563',
    fontWeight: '600',
  },
  healthScoreNumber: {
    fontSize: 22,
    fontWeight: '900',
  },
  mapContainer: {
    flex: 1,
    paddingBottom: 70, // Space for the bottom bar
  },
  gridPadding: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
  },
  plotCell: {
    width: PLOT_SIZE,
    height: PLOT_SIZE,
    margin: PLOT_MARGIN,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plotEmoji: {
    fontSize: 32,
  },
  statusBadge: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  statusIconText: {
    fontSize: 10,
  },
  bottomStatsBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  statText: {
    fontSize: 14,
    color: '#4b5563',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  bottomSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  sheetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sheetEmoji: {
    fontSize: 40,
    marginRight: 16,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#14532d',
  },
  sheetSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
  },
  healthSection: {
    marginBottom: 24,
  },
  healthTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  healthLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  healthValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBarBg: {
    height: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  aiTipBox: {
    backgroundColor: '#f0fdf4', // Very light green
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  aiTipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiTipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#14532d',
    marginLeft: 8,
  },
  aiTipText: {
    fontSize: 15,
    color: '#1f2937',
    lineHeight: 22,
  },
  logActionBtn: {
    backgroundColor: '#166534',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
  },
  logActionText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
});