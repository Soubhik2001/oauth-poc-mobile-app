import * as Location from "expo-location";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../config";

const API_URL = `${BASE_URL}/location`;

const withTimeout = (promise: Promise<any>, ms: number) => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("TIMEOUT")), ms);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
};

export const fetchUserLocationState = async (): Promise<string> => {
  try {
    // 1. Check Permissions & GPS
    const providerStatus = await Location.getProviderStatusAsync();
    if (!providerStatus.locationServicesEnabled) return "Location Off";

    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return "Permission Denied";

    let location: Location.LocationObject | null = null;
    try {
      location = (await withTimeout(
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        }),
        5000
      )) as Location.LocationObject;
    } catch (err) {
      console.log("GPS Timeout. Using Last Known...");
      location = await Location.getLastKnownPositionAsync();
    }

    if (!location) return "No GPS Data";

    // 2. Call Backend
    const token = await AsyncStorage.getItem("userToken");
    console.log(`[Frontend] Sending to ${API_URL}...`);

    const response = await axios.post(
      API_URL,
      { lat: location.coords.latitude, long: location.coords.longitude },
      { headers: { Authorization: token ? `Bearer ${token}` : "" } }
    );

    // 3. LOG THE EXACT RESPONSE
    console.log("[Frontend] Response:", JSON.stringify(response.data));

    // 4. Safely Return
    if (response.data && response.data.location) {
      return response.data.location; // Should be "Chapelton, Jamaica"
    } else {
      return "Unknown Response";
    }
  } catch (error: any) {
    console.error("[Frontend] Error:", error.message);
    return "Network Error";
  }
};
