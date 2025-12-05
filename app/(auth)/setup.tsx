import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import axios from "axios";
import { BASE_URL } from "../config";

export default function SetupAccount() {
  const router = useRouter();
  
  // Link: carphaapp://setup?token=xyz
  const params = useLocalSearchParams();
  const token = params.token as string;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      Alert.alert("Error", "Invalid invite link. Missing token.");
    }
  }, [token]);

  const handleSetup = async () => {
    if (!token) return Alert.alert("Error", "Missing invite token");
    if (!email || !password) return Alert.alert("Error", "Please fill all fields");
    if (password !== confirmPassword) return Alert.alert("Error", "Passwords do not match");

    setLoading(true);

    try {
      await axios.post(`${BASE_URL}/api/users/complete-invite`, {
        token: token,
        email: email,
        password: password,
      });

      Alert.alert("Success", "Account setup complete! You can now login.", [
        { text: "Go to Login", onPress: () => router.replace("/(auth)/login") }
      ]);

    } catch (error: any) {
      const msg = error.response?.data?.message || "Setup failed. Check your email and try again.";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Setup Account</Text>
      <Text style={styles.subtitle}>
        Verify your email and create a password to activate your account.
      </Text>

      <View style={styles.form}>
        <Text style={styles.label}>Confirm Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter the email you were invited with"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>New Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Min 6 characters"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Re-enter password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleSetup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Activate Account</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 32,
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "#fafafa",
  },
  button: {
    height: 48,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});