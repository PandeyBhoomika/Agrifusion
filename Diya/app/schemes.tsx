import React, { useState, useEffect, useCallback } from "react";
import { SafeAreaView, View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Linking, RefreshControl, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { fetchGovernmentSchemes, GovernmentScheme } from "../services/schemeService";
import { useLanguage } from "../context/LanguageContext";

const CATEGORIES = [
  { id: "all", label: "All Schemes", emoji: "📋" },
  { id: "financial-assistance", label: "Financial", emoji: "💰" },
  { id: "organic-farming", label: "Organic", emoji: "🌱" },
  { id: "soil-health", label: "Soil", emoji: "🧪" },
  { id: "irrigation", label: "Irrigation", emoji: "💧" },
  { id: "insurance", label: "Insurance", emoji: "🛡️" },
  { id: "credit", label: "Credit", emoji: "💳" },
  { id: "training", label: "Training", emoji: "🎓" },
];

export default function GovernmentSchemesScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  const [schemes, setSchemes] = useState<GovernmentScheme[]>([]);
  const [filteredSchemes, setFilteredSchemes] = useState<GovernmentScheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedSchemeId, setExpandedSchemeId] = useState<string | null>(null);

  const loadSchemes = async () => {
    try {
      const data = await fetchGovernmentSchemes();
      setSchemes(data);
    } catch (error) {
      console.error("Error loading schemes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSchemes(); }, []);

  useEffect(() => {
    let result = schemes;
    if (selectedCategory !== "all") result = result.filter(s => s.category === selectedCategory);
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(s =>
        s.name.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query) ||
        s.department.toLowerCase().includes(query) ||
        s.eligibility.toLowerCase().includes(query)
      );
    }
    setFilteredSchemes(result);
  }, [schemes, selectedCategory, searchQuery]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSchemes();
    setRefreshing(false);
  }, []);

  const handleApply = async (url: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) await Linking.openURL(url);
      else await Linking.openURL("https://keralaagriculture.gov.in");
    } catch (error) { console.warn("Unable to open URL:", error); }
  };

  const toggleExpand = (id: string) => {
    setExpandedSchemeId(expandedSchemeId === id ? null : id);
  };

  return (
    <LinearGradient colors={["#021F0F", "#042818", "#053B24"]} style={styles.mainContainer}>
      <StatusBar style="light" backgroundColor="#021F0F" />
      <SafeAreaView style={styles.safe}>

        {/* HEADER */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.headerTextWrap}>
            {/* ✅ Translated */}
            <Text style={styles.headerTitle}>{t.schemes.title}</Text>
            <Text style={styles.headerSubtitle}>{t.schemes.subtitle}</Text>
          </View>
        </Animated.View>

        {/* SEARCH BAR */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Feather name="search" size={20} color="#86efac" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              // ✅ Translated placeholder
              placeholder={t.schemes.searchPlaceholder}
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")} activeOpacity={0.7}>
                <Ionicons name="close-circle" size={20} color="#86efac" style={styles.clearIcon} />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        {/* CATEGORY SELECTOR */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.categoriesSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
            {CATEGORIES.map(category => {
              const isSelected = selectedCategory === category.id;
              return (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => setSelectedCategory(category.id)}
                  activeOpacity={0.8}
                  style={[styles.categoryTab, isSelected && styles.categoryTabSelected]}
                >
                  <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                  <Text style={[styles.categoryLabel, isSelected && styles.categoryLabelSelected]}>
                    {category.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Animated.View>

        {/* SCHEMES LIST */}
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#22c55e" />
          </View>
        ) : filteredSchemes.length === 0 ? (
          <ScrollView
            contentContainerStyle={styles.centerContainer}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22c55e" />}
          >
            <Ionicons name="document-text-outline" size={64} color="rgba(255,255,255,0.2)" />
            {/* ✅ Translated empty state */}
            <Text style={styles.emptyTitle}>{t.schemes.noSchemesTitle}</Text>
            <Text style={styles.emptySubtitle}>{t.schemes.noSchemesSubtitle}</Text>
          </ScrollView>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22c55e" />}
          >
            {filteredSchemes.map((scheme, index) => {
              const isExpanded = expandedSchemeId === scheme.id;
              return (
                <Animated.View key={scheme.id} entering={FadeInUp.delay(index * 50).duration(400)}>
                  <TouchableOpacity
                    onPress={() => toggleExpand(scheme.id)}
                    activeOpacity={0.9}
                    style={[styles.schemeCard, isExpanded && styles.schemeCardExpanded]}
                  >
                    <View style={styles.cardHeader}>
                      <View style={{ flex: 1 }}>
                        <View style={styles.badgeRow}>
                          <View style={styles.categoryBadge}>
                            <Text style={styles.categoryBadgeText}>
                              {scheme.category.replace("-", " ").toUpperCase()}
                            </Text>
                          </View>
                          {scheme.status === "Active" && (
                            <View style={styles.activeBadge}>
                              {/* ✅ Translated */}
                              <Text style={styles.activeBadgeText}>{t.schemes.active}</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.schemeName}>{scheme.name}</Text>
                      </View>
                      <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color="#86efac" style={styles.expandIcon} />
                    </View>

                    <Text style={styles.schemeDescShort} numberOfLines={isExpanded ? undefined : 2}>
                      {scheme.description}
                    </Text>

                    <View style={styles.amountSection}>
                      {/* ✅ Translated */}
                      <Text style={styles.amountLabel}>{t.schemes.support}</Text>
                      <Text style={styles.amountValue}>{scheme.amount}</Text>
                    </View>

                    {isExpanded && (
                      <View style={styles.expandedDetails}>
                        <View style={styles.divider} />
                        <View style={styles.detailRow}>
                          {/* ✅ Translated */}
                          <Text style={styles.detailLabel}>{t.schemes.department}</Text>
                          <Text style={styles.detailValue}>{scheme.department}</Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>{t.schemes.eligibility}</Text>
                          <Text style={styles.detailValue}>{scheme.eligibility}</Text>
                        </View>
                        <TouchableOpacity
                          style={styles.applyButton}
                          onPress={() => handleApply(scheme.applicationLink)}
                          activeOpacity={0.8}
                        >
                          <LinearGradient colors={["#22c55e", "#15803d"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.applyButtonGradient}>
                            {/* ✅ Translated */}
                            <Text style={styles.applyButtonText}>{t.schemes.applyNow}</Text>
                            <Feather name="external-link" size={16} color="#ffffff" style={{ marginLeft: 6 }} />
                          </LinearGradient>
                        </TouchableOpacity>
                      </View>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </ScrollView>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  safe: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center", marginRight: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  headerTextWrap: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: "800", color: "#ECFDF5" },
  headerSubtitle: { fontSize: 13, color: "#86efac", marginTop: 2, fontWeight: "500" },
  searchSection: { paddingHorizontal: 20, marginVertical: 12 },
  searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 16, paddingHorizontal: 16, height: 52, borderWidth: 1, borderColor: "rgba(34,197,94,0.15)" },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, color: "#ffffff", fontSize: 15, height: "100%" },
  clearIcon: { marginLeft: 8 },
  categoriesSection: { marginBottom: 8 },
  categoriesScroll: { paddingHorizontal: 20, gap: 8, paddingBottom: 8 },
  categoryTab: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.06)", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  categoryTabSelected: { backgroundColor: "#14532d", borderColor: "#22c55e" },
  categoryEmoji: { fontSize: 14, marginRight: 6 },
  categoryLabel: { color: "#a7f3d0", fontSize: 13, fontWeight: "600" },
  categoryLabelSelected: { color: "#ffffff" },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 40, paddingTop: 80 },
  emptyTitle: { color: "#ffffff", fontSize: 18, fontWeight: "700", marginTop: 16 },
  emptySubtitle: { color: "#94a3b8", fontSize: 14, textAlign: "center", marginTop: 8, lineHeight: 20 },
  schemeCard: { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 20, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: "rgba(34,197,94,0.15)" },
  schemeCardExpanded: { borderColor: "rgba(74,222,128,0.4)", backgroundColor: "rgba(255,255,255,0.07)" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  badgeRow: { flexDirection: "row", gap: 6, marginBottom: 8 },
  categoryBadge: { backgroundColor: "rgba(34,197,94,0.15)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  categoryBadgeText: { color: "#86efac", fontSize: 9, fontWeight: "700" },
  activeBadge: { backgroundColor: "rgba(251,191,36,0.15)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  activeBadgeText: { color: "#fde68a", fontSize: 9, fontWeight: "800" },
  schemeName: { fontSize: 17, fontWeight: "800", color: "#ffffff", marginBottom: 8 },
  expandIcon: { padding: 4 },
  schemeDescShort: { color: "#d1d5db", fontSize: 13, lineHeight: 18, marginBottom: 12 },
  amountSection: { backgroundColor: "rgba(0,0,0,0.2)", padding: 12, borderRadius: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  amountLabel: { color: "#86efac", fontSize: 12, fontWeight: "600" },
  amountValue: { color: "#fbbf24", fontSize: 14, fontWeight: "800" },
  expandedDetails: { marginTop: 12 },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.08)", marginVertical: 12 },
  detailRow: { marginBottom: 10 },
  detailLabel: { color: "#9ca3af", fontSize: 11, fontWeight: "700", textTransform: "uppercase", marginBottom: 4 },
  detailValue: { color: "#e5e7eb", fontSize: 13, lineHeight: 18 },
  applyButton: { marginTop: 16, borderRadius: 12, overflow: "hidden" },
  applyButtonGradient: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12 },
  applyButtonText: { color: "#ffffff", fontSize: 14, fontWeight: "700" },
});