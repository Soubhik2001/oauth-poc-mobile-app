import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import axios from "axios";
import { useRouter } from "expo-router";
import { Picker } from "@react-native-picker/picker";

/**
 * Backend register endpoint accepts JSON:
 * POST http://10.0.2.2:5000/register
 * body: { name, email, password, role, country }
 *
 * On Android emulator use 10.0.2.2; on local device or Expo Go use appropriate IP.
 */

const API_URL = "http://10.0.2.2:3000/api/users";

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("general public");
  const [country, setCountry] = useState("");

  const handleRegister = async () => {
    if (!name || !email || !password || !role || !country) {
      Alert.alert("Validation", "Please fill all fields.");
      return;
    }

    try {
      const payload = { name, email, password, role, country };
      const res = await axios.post(`${API_URL}/register`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      Alert.alert("Registered", `Welcome ${res.data.name ?? name}`);
      router.replace("/(auth)/login");
    } catch (err: any) {
      console.error("Register error:", err?.response?.data ?? err.message ?? err);
      const msg = err?.response?.data?.error || "Registration failed";
      Alert.alert("Error", String(msg));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create account</Text>

      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
        autoCapitalize="words"
      />

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />

      <View style={styles.pickerWrap}>
        <Picker
          selectedValue={role}
          onValueChange={(val) => setRole(String(val))}
          style={styles.picker}
          mode="dropdown"
        >
          {/* <Picker.Item label="Admin" value="admin" /> */}
          <Picker.Item label="General Public" value="general public" />
          <Picker.Item label="Medical Officer" value="medical officer" />
          <Picker.Item label="Epidemiologist" value="epidemiologist" />
        </Picker>
      </View>

      <TextInput
        placeholder="Country"
        value={country}
        onChangeText={setCountry}
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.link}
        onPress={() => router.replace("/(auth)/login")}
      >
        <Text style={{ color: "#007AFF" }}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: Platform.OS === "android" ? 60 : 80 },
  title: { fontSize: 26, fontWeight: "700", marginBottom: 20 },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 12,
    overflow: "hidden",
  },
  picker: { height: 50, width: "100%" },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "white", fontWeight: "600" },
  link: { marginTop: 16, alignItems: "center" },
});