import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function HomeScreen() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Check the user's role when the screen loads
    const fetchRole = async () => {
      const role = await AsyncStorage.getItem("userRole");
      setUserRole(role);
    };
    fetchRole();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear(); // Clear all user data
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Error", "Something went wrong while logging out.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome Home!</Text>

        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>
            Role:{" "}
            <Text style={{ fontWeight: "bold" }}>
              {userRole || "Loading..."}
            </Text>
          </Text>
        </View>

        {/* {userRole === "superadmin" && (
          <View style={styles.adminContainer}>
            <TouchableOpacity
              style={[styles.button, styles.dashboardButton]}
              onPress={() => router.push("/admin")}
            >
              <Text style={styles.buttonTextDark}>Go to Admin Dashboard</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.createUserButton]}
              onPress={() => router.push("/admin/create_user")}
            >
              <Text style={styles.buttonTextLight}>Create New User</Text>
            </TouchableOpacity>
          </View>
        )} */}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Text style={styles.buttonTextLight}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 20,
    textAlign: "center",
  },
  roleBadge: {
    backgroundColor: "#e9ecef",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 40,
  },
  roleText: {
    fontSize: 16,
    color: "#495057",
  },
  adminContainer: {
    width: "100%",
    gap: 15,
  },
  button: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dashboardButton: {
    backgroundColor: "#FFC107", // Amber
  },
  createUserButton: {
    backgroundColor: "#2196F3", // Blue
  },
  logoutButton: {
    backgroundColor: "#FF3B30", // Red
    marginTop: 20,
  },
  buttonTextLight: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  buttonTextDark: {
    color: "#333333",
    fontSize: 16,
    fontWeight: "700",
  },
  footer: {
    width: "100%",
    marginBottom: 20,
  },
});
