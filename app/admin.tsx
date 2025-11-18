import {
  View,
  Text,
  FlatList,
  Button,
  Alert,
  StyleSheet,
  TextInput,
  Linking,
  TouchableOpacity,
} from "react-native";
import { useEffect, useState } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, Stack } from "expo-router";

const API_URL = "http://10.0.2.2:3000";
const TASKS_URL = `${API_URL}/tasks`;
const UPLOADS_URL = `${API_URL}/uploads`;

interface Document {
  id: number;
  filename: string;
  path: string; // This will be like 'uploads/abc123xyz'
}

interface PendingTask {
  id: number;
  status: string;
  requestedRole: {
    id: number;
    name: string;
  } | null;
  user: {
    id: number;
    name: string;
    email: string;
  };
  documents: Document[];
}

export default function AdminScreen() {
  const [tasks, setTasks] = useState<PendingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<{ [key: number]: string }>({});
  const router = useRouter();

  // Fetch all pending tasks
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await axios.get(`${TASKS_URL}/pending`, {
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

  // Handle Approve/Reject
  const handleUpdateTask = async (
    userId: number,
    taskId: number,
    action: "approve" | "reject"
  ) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const comment = comments[taskId] || "";
      await axios.post(
        `${TASKS_URL}/${userId}/${action}`,
        { comment: comment },
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

  const onCommentChange = (taskId: number, text: string) => {
    setComments((prev) => ({
      ...prev,
      [taskId]: text,
    }));
  };

  const openDocument = (path: string) => {
    // 'path' is 'uploads/abc123xyz', so we create the full URL
    const url = `${UPLOADS_URL}/${path}`;
    console.log("Opening URL:", url);
    Linking.openURL(url).catch(() => {
      Alert.alert("Error", "Could not open document.");
    });
  };

  const renderTask = ({ item }: { item: PendingTask }) => (
    <View style={styles.taskCard}>
      <Text style={styles.taskTitle}>{item.user.name}</Text>
      <Text>{item.user.email}</Text>

      <Text style={styles.requestedRole}>
        Requested Role: {item.requestedRole?.name || "N/A"}
      </Text>

      <View style={styles.docList}>
        <Text style={styles.docHeader}>Submitted Documents:</Text>
        {item.documents.length === 0 ? (
          <Text>No documents submitted.</Text>
        ) : (
          item.documents.map((doc) => (
            <TouchableOpacity
              key={doc.id}
              onPress={() => openDocument(doc.path)}
              style={styles.docButton}
            >
              <Text style={styles.docLink}>{doc.filename}</Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Reason for approval/rejection (optional)"
        value={comments[item.id] || ""}
        onChangeText={(text) => onCommentChange(item.id, text)}
      />

      <View style={styles.buttonContainer}>
        <Button
          title="Approve"
          onPress={() => handleUpdateTask(item.user.id, item.id, "approve")}
          color="#4CAF50"
        />
        <Button
          title="Reject"
          onPress={() => handleUpdateTask(item.user.id, item.id, "reject")}
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
    marginTop: 15,
  },
  docList: {
    marginTop: 10,
  },
  docHeader: {
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 5,
  },
  docButton: {
    paddingVertical: 5,
  },
  docLink: {
    color: "#007AFF",
    textDecorationLine: "underline",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
  },
  input: {
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
    backgroundColor: "#fafafa",
  },
});
