import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Link, useRouter, Stack } from "expo-router";
import React, { useState } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage"; // ✅ Import added

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      const API_URL = "http://10.0.2.2:5000/api/users/login"; // Android emulator
      const response = await axios.post(API_URL, { email, password });

      if (response.status === 200) {
        const token = response.data?.token ?? "true";
        const userEmail = response.data?.email ?? email;
        console.log(response.data);
        
        await AsyncStorage.setItem("userToken", String(token));
        await AsyncStorage.setItem("userEmail", String(userEmail));

        Alert.alert("Success", "Login successful!");
        router.replace("/"); // go to home
      } else {
        Alert.alert("Error", "Invalid credentials");
      }
    } catch (error: any) {
      console.error("Login Error:", error);

      // If backend returned a response with JSON error message
      if (error.response && error.response.data) {
        const message =
          error.response.data.error ||
          error.response.data.message ||
          "Login failed";
        Alert.alert("Error", message);
        return;
      }

      // Network or unexpected error
      Alert.alert("Error", "Could not connect to server");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#aaa"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <Link href="/(auth)/register" style={styles.link}>
        Don’t have an account? Register
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 30 },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 15,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  link: { color: "#007AFF", marginTop: 20 },
});
