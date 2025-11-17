import { View, Text, FlatList, Button, Alert, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, Stack } from "expo-router";

const API_URL = "http://10.0.2.2:3000/tasks";

// --- UPDATE INTERFACE ---
// Define the shape of our Task object
interface PendingTask {
  id: number;
  status: string;
  // requestedRole is now an object, or null
  requestedRole: {
    id: number;
    name: string;
  } | null;
  user: {
    id: number;
    name: string;
    email: string;
  };
}
// --- END UPDATE ---

export default function AdminScreen() {
  const [tasks, setTasks] = useState<PendingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 1. Fetch all pending tasks
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await axios.get(`${API_URL}/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(response.data);
    } catch (error: any) {
      if (error.response?.status === 403) {
        Alert.alert(
          "Access Denied",
          "You are not authorized to view this page."
        );
        router.back();
      } else {
        console.error(
          "Fetch Tasks Error:",
          error.response?.data || error.message
        );
        Alert.alert("Error", "Could not fetch pending tasks.");
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // 2. Handle Approve/Reject
  const handleUpdateTask = async (
    userId: number,
    action: "approve" | "reject"
  ) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      await axios.post(
        `${API_URL}/${userId}/${action}`,
        {}, // Empty body
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("Success", `User ${action}d successfully.`);

      setTasks((currentTasks) =>
        currentTasks.filter((task) => task.user.id !== userId)
      );
    } catch (error: any) {
      console.error(
        "Update Task Error:",
        error.response?.data || error.message
      );
      Alert.alert("Error", `Could not ${action} task.`);
    }
  };

  const renderTask = ({ item }: { item: PendingTask }) => (
    <View style={styles.taskCard}>
      <Text style={styles.taskTitle}>{item.user.name}</Text>
      <Text>{item.user.email}</Text>

      {/* --- UPDATE RENDER --- */}
      <Text style={styles.requestedRole}>
        Requested Role: {item.requestedRole?.name || "N/A"}
      </Text>
      {/* --- END UPDATE --- */}

      <View style={styles.buttonContainer}>
        <Button
          title="Approve"
          onPress={() => handleUpdateTask(item.user.id, "approve")}
          color="#4CAF50"
        />
        <Button
          title="Reject"
          onPress={() => handleUpdateTask(item.user.id, "reject")}
          color="#F44336"
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Admin Dashboard" }} />

      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={() => (
          <Text style={styles.header}>Pending Approvals</Text>
        )}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>
            {loading ? "Loading..." : "No pending tasks."}
          </Text>
        )}
        onRefresh={fetchTasks}
        refreshing={loading}
      />
    </View>
  );
}

// ... (styles)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f5f5ff",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
  },
  taskCard: {
    backgroundColor: "white",
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  requestedRole: {
    fontSize: 16,
    color: "#333",
    marginVertical: 5,
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
  },
});
