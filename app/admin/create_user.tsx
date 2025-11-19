import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import axios from "axios";
import { useRouter, Stack } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://10.0.2.2:3000/api/users";

export default function CreateUserScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("");
  const [role, setRole] = useState("general public");

  const handleCreate = async () => {
    if (!name || !email || !password || !role) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("userToken");
      
      // Call the new Admin Endpoint
      await axios.post(
        API_URL, 
        { name, email, password, country, role },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("Success", "User created successfully!");
      router.back(); // Go back to dashboard
      
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Creation failed";
      Alert.alert("Error", String(msg));
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Stack.Screen options={{ title: "Create New User" }} />
      
      <Text style={styles.label}>Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />
      
      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" />
      
      <Text style={styles.label}>Password</Text>
      <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />
      
      <Text style={styles.label}>Country</Text>
      <TextInput style={styles.input} value={country} onChangeText={setCountry} />

      <Text style={styles.label}>Role</Text>
      <View style={styles.pickerWrap}>
        <Picker
          style={styles.picker}
          selectedValue={role}
          onValueChange={(itemValue) => setRole(itemValue)}
        >
          <Picker.Item label="General Public" value="general public" />
          <Picker.Item label="Medical Officer" value="medical officer" />
          <Picker.Item label="Epidemiologist" value="epidemiologist" />
          <Picker.Item label="Admin" value="admin" />
          <Picker.Item label="Super Admin" value="superadmin" />
        </Picker>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleCreate}>
        <Text style={styles.buttonText}>Create User</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff", flexGrow: 1 },
  label: { fontWeight: "bold", marginBottom: 5, marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 8,
    fontSize: 16,
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 20,
  },
  picker: { height: 50, width: "100%" },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});