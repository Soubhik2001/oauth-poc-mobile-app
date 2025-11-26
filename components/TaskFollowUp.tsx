import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";

const API_URL = "http://10.0.2.2:3000";

const AVAILABLE_ROLES = [
  { label: "Medical Officer", value: "medical officer" },
  { label: "Epidemiologist", value: "epidemiologist" },
  { label: "Admin", value: "admin" },
];

export default function TaskFollowUp() {
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState("medical officer");
  const [currentRole, setCurrentRole] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      console.log("--- FETCHING DATA START ---");
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      const roleFromStorage = await AsyncStorage.getItem("userRole");

      console.log("DEBUG: Raw role from AsyncStorage:", roleFromStorage);

      const normalizedRole = roleFromStorage
        ? roleFromStorage.toLowerCase().trim()
        : "";
      console.log("DEBUG: Normalized role:", normalizedRole);

      setCurrentRole(normalizedRole);

      const res = await axios.get(`${API_URL}/tasks/my-status`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("DEBUG: Task API Response Status:", res.data?.status);
      setTask(res.data);

      if (res.data?.requestedRole?.name) {
        setSelectedRole(res.data.requestedRole.name);
      }
    } catch (err) {
      console.log("DEBUG: Error fetching task (or new user):", err);
    } finally {
      setLoading(false);
      console.log("--- FETCHING DATA END ---");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        setFiles((prev) => [...prev, ...result.assets]);
      }
    } catch (err) {
      Alert.alert("Error", "Failed to pick file");
    }
  };

  const removeFile = (indexToRemove: number) => {
    setFiles((prevFiles) =>
      prevFiles.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleResubmit = async () => {
    const token = await AsyncStorage.getItem("userToken");
    const formData = new FormData();
    formData.append("role", selectedRole);

    files.forEach((file) => {
      // @ts-ignore
      formData.append("documents", {
        uri: file.uri,
        type: file.mimeType || "application/octet-stream",
        name: file.name,
      });
    });

    try {
      await axios.post(`${API_URL}/tasks/resubmit`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      Alert.alert("Success", "Application submitted successfully!");
      setFiles([]);
      fetchData();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Submission failed";
      Alert.alert("Error", errorMsg);
    }
  };

  const renderApplicationForm = (btnLabel: string) => (
    <View style={{ marginTop: 15 }}>
      <Text style={styles.subHeader}>Select Role</Text>
      <View style={styles.roleContainer}>
        {AVAILABLE_ROLES.map((role) => (
          <TouchableOpacity
            key={role.value}
            style={[
              styles.roleBtn,
              selectedRole === role.value && styles.roleBtnActive,
            ]}
            onPress={() => setSelectedRole(role.value)}
          >
            <Text
              style={[
                styles.roleBtnText,
                selectedRole === role.value && styles.roleBtnTextActive,
              ]}
            >
              {role.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.uploadButton} onPress={pickDocument}>
        <Ionicons
          name="cloud-upload-outline"
          size={20}
          color="#333"
          style={{ marginRight: 8 }}
        />
        <Text style={styles.uploadButtonText}>Attach Documents (Optional)</Text>
      </TouchableOpacity>

      {files.length > 0 && (
        <View style={styles.fileList}>
          {files.map((file, index) => (
            <View key={index} style={styles.fileItem}>
              <View style={styles.fileInfo}>
                <Ionicons name="document-text-outline" size={18} color="#666" />
                <Text
                  style={styles.fileName}
                  numberOfLines={1}
                  ellipsizeMode="middle"
                >
                  {file.name}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => removeFile(index)}
                style={styles.removeBtn}
              >
                <Ionicons name="close-circle" size={20} color="#ff3b30" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.submitButton} onPress={handleResubmit}>
        <Text style={styles.submitButtonText}>{btnLabel}</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) return <ActivityIndicator size="large" color="#007AFF" />;

  console.log("DEBUG: Rendering... Current Role is:", currentRole);
  
  if (
    currentRole &&
    currentRole !== "general public" &&
    currentRole !== "superadmin"
  ) {
    console.log("DEBUG: Guard Clause Triggered. Showing Verified View.");
    return (
      <View style={[styles.card, styles.successCard]}>
        <View style={{ marginBottom: 5 }}>
          <Text style={[styles.header, styles.successText]}>
            ✅ Verified User
          </Text>
          <Text style={styles.text}>
            Current Role:{" "}
            <Text style={[styles.bold, { textTransform: "capitalize" }]}>
              {currentRole}
            </Text>
          </Text>
          <Text style={[styles.subText, { marginTop: 10 }]}>
            You have already been verified. Role promotions are not available.
          </Text>
        </View>
      </View>
    );
  }

  // CASE 1: No Task Found
  if (!task) {
    console.log("DEBUG: Case 1 Triggered (No Task).");
    return (
      <View style={styles.card}>
        <Text style={styles.header}>Apply for Role Upgrade</Text>
        <Text style={styles.text}>
          You are currently a General Public user. Apply below to upgrade your
          role.
        </Text>
        {renderApplicationForm("Submit Application")}
      </View>
    );
  }

  // CASE 2: Pending Task
  if (task.status === "pending") {
    console.log("DEBUG: Case 2 Triggered (Pending).");
    return (
      <View style={[styles.card, styles.warningCard]}>
        <Text style={[styles.header, styles.warningText]}>⏳ Under Review</Text>
        <Text style={styles.text}>
          Requesting:{" "}
          <Text style={styles.bold}>{task.requestedRole?.name}</Text>
        </Text>
        <Text style={styles.subText}>
          Your application is pending. You cannot submit a new request until
          this is processed.
        </Text>
      </View>
    );
  }

  // CASE 3: Approved Task
  if (task.status === "approved") {
    console.log("DEBUG: Case 3 Triggered (Approved Fallback).");
    return (
      <View style={[styles.card, styles.successCard]}>
        <Text style={[styles.header, styles.successText]}>
          ✅ Verified User
        </Text>
        <Text style={styles.text}>
          Role: <Text style={styles.bold}>{task.requestedRole?.name}</Text>
        </Text>
      </View>
    );
  }

  // CASE 4: Rejected Task
  if (task.status === "rejected") {
    console.log("DEBUG: Case 4 Triggered (Rejected).");
    return (
      <View style={[styles.card, styles.errorCard]}>
        <Text style={[styles.header, styles.errorText]}>
          ❌ Application Rejected
        </Text>
        <View style={styles.reasonBox}>
          <Text style={styles.reasonText}>
            Reason: {task.comment || "No reason provided."}
          </Text>
        </View>

        <View style={styles.divider} />
        <Text style={styles.text}>Please fix the issues and try again.</Text>

        {renderApplicationForm("Update & Resubmit")}
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  text: { fontSize: 16, color: "#333", marginBottom: 5 },
  subText: { fontSize: 14, color: "#666" },
  bold: { fontWeight: "bold" },
  header: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  subHeader: { fontSize: 16, fontWeight: "600", marginBottom: 10 },
  divider: { height: 1, backgroundColor: "#ddd", marginVertical: 15 },

  warningCard: {
    backgroundColor: "#fffcf0",
    borderColor: "#ffeeba",
    borderWidth: 1,
  },
  warningText: { color: "#856404" },
  successCard: {
    backgroundColor: "#f0fff4",
    borderColor: "#c3e6cb",
    borderWidth: 1,
  },
  successText: { color: "#155724" },
  errorCard: {
    backgroundColor: "#fff",
    borderColor: "#f5c6cb",
    borderWidth: 1,
  },
  errorText: { color: "#721c24" },

  reasonBox: {
    backgroundColor: "#f8d7da",
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  reasonText: { color: "#721c24" },

  roleContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 15,
  },
  roleBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ccc",
    minWidth: "30%",
    alignItems: "center",
  },
  roleBtnActive: { backgroundColor: "#007AFF", borderColor: "#007AFF" },
  roleBtnText: { color: "#333", fontSize: 13 },
  roleBtnTextActive: { color: "white", fontWeight: "bold" },

  uploadButton: {
    backgroundColor: "#eee",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "center",
  },
  uploadButtonText: { color: "#333", fontWeight: "500" },

  submitButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: { color: "white", fontWeight: "bold", fontSize: 16 },

  fileList: { marginBottom: 20, gap: 8 },
  fileItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8f9fa",
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  fileInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  fileName: { marginLeft: 8, fontSize: 14, color: "#333", flex: 1 },
  removeBtn: { padding: 2 },
});
