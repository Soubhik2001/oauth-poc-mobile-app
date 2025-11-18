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
import AsyncStorage from "@react-native-async-storage/async-storage";

const CLIENT_ID = 'my-client-id';
const CLIENT_SECRET = 'my-client-secret';
const REDIRECT_URI = 'http://localhost/callback'; // Mock URI for native app

const API_URL = "http://10.0.2.2:3000"; // Base URL

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
      const authResponse = await axios.post(`${API_URL}/oauth/authorize`, {
        email: email,
        password: password,
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
      });

      const { code } = authResponse.data;
      if (!code) {
        throw new Error("No authorization code received.");
      }

      const tokenResponse = await axios.post(`${API_URL}/oauth/token`, {
        grant_type: "authorization_code",
        code: code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
      });

      const { access_token, role } = tokenResponse.data;

      if (!access_token || !role) {
        throw new Error("Login succeeded but no token or role was received.");
      }

      await AsyncStorage.setItem("userToken", String(access_token));
      await AsyncStorage.setItem("userEmail", String(email));
      await AsyncStorage.setItem("userRole", String(role));

      Alert.alert("Success", "Login successful!");
      router.replace("/"); // go to home
    } catch (error: any) {
      console.error("Login Error:", error.response?.data || error.message);

      if (error.response && error.response.data) {
        const message =
          error.response.data.message ||
          error.response.data.error ||
          "Login failed";
        Alert.alert("Error", message);
        return;
      }

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
