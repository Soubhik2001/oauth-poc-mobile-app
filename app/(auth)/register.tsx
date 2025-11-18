import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ScrollView,
  Button,
} from "react-native";
import axios from "axios";
import { useRouter, Link } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import * as DocumentPicker from "expo-document-picker";

const API_URL = "http://10.0.2.2:3000/api/users";

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("general public");
  const [country, setCountry] = useState("");
  const [documents, setDocuments] = useState<
    DocumentPicker.DocumentPickerAsset[]
  >([]);

  const pickDocuments = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/jpeg", "image/png", "application/pdf", "image/jpg"],
        multiple: true,
      });

      if (result.assets) {
        setDocuments((prevDocs) => [...prevDocs, ...result.assets]);
      }
    } catch (err) {
      Alert.alert("Error", "Could not pick documents.");
    }
  };

  const removeDocument = (docToRemove: DocumentPicker.DocumentPickerAsset) => {
    setDocuments((prevDocs) =>
      prevDocs.filter((doc) => doc.uri !== docToRemove.uri)
    );
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !role || !country) {
      Alert.alert("Validation", "Please fill all fields.");
      return;
    }

    if (
      (role === "epidemiologist" || role === "medical officer") &&
      documents.length === 0
    ) {
      Alert.alert(
        "Validation",
        "Identity documents are required for this role."
      );
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("role", role);
    formData.append("country", country);

    documents.forEach((doc) => {
      formData.append("documents", {
        uri: doc.uri,
        name: doc.name,
        type: doc.mimeType,
      } as any);
    });

    try {
      Alert.alert(
        "Uploading...",
        "Registering your account. This may take a moment."
      );

      const res = await axios.post(`${API_URL}/register`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      Alert.alert("Registered", res.data.message || "Registration successful!");
      router.replace("/(auth)/login");
    } catch (err: any) {
      console.error(
        "Register error:",
        err?.response?.data ?? err.message ?? err
      );
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Registration failed";
      Alert.alert("Error", String(msg));
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Country"
        value={country}
        onChangeText={setCountry}
      />

      <Text style={styles.label}>Select your Role:</Text>
      <View style={styles.pickerWrap}>
        <Picker
          style={styles.picker}
          selectedValue={role}
          onValueChange={(itemValue) => setRole(itemValue)}
        >
          <Picker.Item label="General Public" value="general public" />
          <Picker.Item label="Medical Officer" value="medical officer" />
          <Picker.Item label="Epidemiologist" value="epidemiologist" />
        </Picker>
      </View>

      {/* --- Conditional UI for file picking --- */}
      {(role === "epidemiologist" || role === "medical officer") && (
        <View style={styles.docContainer}>
          <Text style={styles.docHeader}>
            Identity Documents (PDF, PNG, JPG, JPEG)
          </Text>
          <Button title="Select Documents" onPress={pickDocuments} />
          {documents.map((doc) => (
            <View key={doc.uri} style={styles.docRow}>
              <Text style={styles.docName} numberOfLines={1}>
                {doc.name}
              </Text>
              <TouchableOpacity
                onPress={() => removeDocument(doc)}
                style={styles.removeButton}
              >
                <Text style={styles.removeButtonText}>X</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <Link href="/(auth)/login" style={styles.link}>
        Already have an account? Login
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: Platform.OS === "android" ? 60 : 80,
  },
  title: { fontSize: 26, fontWeight: "700", marginBottom: 20 },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    width: "100%",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    alignSelf: "flex-start",
    marginBottom: 5,
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 12,
    overflow: "hidden",
    width: "100%",
  },
  picker: { height: 50, width: "100%" },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
    width: "100%",
  },
  buttonText: { color: "white", fontWeight: "600" },
  link: {
    marginTop: 16,
    textAlign: "center", // Use text align instead of align items
    color: "#007AFF", // Added color from your login screen
  },
  docContainer: {
    width: "100%",
    marginVertical: 15,
    padding: 10,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
  },
  docHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  docName: {
    fontSize: 14,
    color: "#333",
    marginTop: 5,
    flex: 1,
  },
  docRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f4f4f4",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  removeButton: {
    backgroundColor: "#ff4d4d",
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  removeButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
});