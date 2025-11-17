import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, Alert } from "react-native";
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
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Welcome to the App!</Text>

      {/* --- SUPERADMIN CONDITIONAL BUTTON --- */}
      {userRole === 'superadmin' && (
        <View style={styles.adminButton}>
          <Button
            title="Go to Admin Approval Panel"
            onPress={() => router.push('/admin')}
            color="#FFC107"
          />
        </View>
      )}
      {/* --- END --- */}

      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  adminButton: {
    marginVertical: 15,
  },
});
