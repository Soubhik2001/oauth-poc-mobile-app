import { useEffect } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem("userToken");

      if (token) {
        // User is logged in → go to Home
        router.replace("/home");
      } else {
        // Not logged in → go to login
        router.replace("/(auth)/login");
      }
    };

    checkLogin();
  }, []);

  return null;
}
