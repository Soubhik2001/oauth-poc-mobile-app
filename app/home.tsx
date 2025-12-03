import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import TaskFollowUp from "../components/TaskFollowUp";
import { fetchUserLocationState } from "./services/location";

export default function HomeScreen() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);

  const [locationState, setLocationState] = useState<string>("Locating...");
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    // Fetch Role
    const role = await AsyncStorage.getItem("userRole");
    setUserRole(role);

    // Fetch Location
    console.log("UI: Fetching Location...");
    setLocationState("Updating...");

    const locationResult = await fetchUserLocationState();

    console.log("UI: Got Location:", locationResult);
    setLocationState(locationResult);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Welcome Home!</Text>

        <View style={styles.infoRow}>
          {/* Role Badge */}
          <View style={styles.badge}>
            <Text style={styles.badgeLabel}>Role</Text>
            <Text style={styles.badgeValue}>{userRole || "..."}</Text>
          </View>

          {/* Location Badge */}
          <View style={[styles.badge, styles.locationBadge]}>
            <Text style={styles.badgeLabel}>Location</Text>
            <Text style={[styles.badgeValue, { color: "#000" }]}>
              {locationState}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Application Status</Text>
        <TaskFollowUp />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Text style={styles.buttonTextLight}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 20,
    textAlign: "center",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    width: "100%",
    flexWrap: "wrap",
  },
  badge: {
    backgroundColor: "#e9ecef",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    minWidth: 100,
  },
  locationBadge: {
    backgroundColor: "#e3f2fd",
    borderWidth: 1,
    borderColor: "#90caf9",
  },
  badgeLabel: {
    fontSize: 12,
    color: "#888",
    textTransform: "uppercase",
    fontWeight: "600",
    marginBottom: 2,
  },
  badgeValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
    textAlign: "center",
  },
  section: {
    width: "100%",
    marginBottom: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
    marginLeft: 5,
  },
  button: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },
  logoutButton: {
    backgroundColor: "#FF3B30",
    marginTop: 10,
  },
  buttonTextLight: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  footer: {
    width: "100%",
    marginTop: 20,
  },
});
