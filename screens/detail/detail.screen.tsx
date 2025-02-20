import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import Header from "@/components/header/header";
import axios from "axios";
import { SERVER_URI } from "@/utils/uri";
import useUser from "@/hooks/auth/useUser";
import { Ionicons } from "@expo/vector-icons";

export default function DetailScreen() {
  const { user, loading, setUser, setRefetch } = useUser(); // Get user data and functions
  const [theme, setTheme] = useState("light");
  const [largeFontSize, setLargeFontSize] = useState("default");
  const [name, setName] = useState(user?.name || ""); // Initialize with user's name
  const [email, setEmail] = useState(user?.email || ""); // Initialize with user's email
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [showOldPassword, setShowOldPassword] = useState(false); // State to toggle old password visibility
  const [showNewPassword, setShowNewPassword] = useState(false); // State to toggle new password visibility

  // Fetch theme and font size from AsyncStorage
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem("theme");
        if (storedTheme) setTheme(storedTheme);

        const storedFont = await AsyncStorage.getItem("largeFontSize");
        if (storedFont) setLargeFontSize(storedFont);
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };

    fetchSettings();
  }, []);

  // Update user info
  const handleUpdate = async () => {
    try {
      const token = await AsyncStorage.getItem("token"); // Replace with your auth token retrieval
      const response = await axios.put(
        `${SERVER_URI}update-user-info`, // Replace with your API endpoint
        { name, email, oldPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update user context after successful update
      setUser(response.data.user); 
      setRefetch(true); // Trigger refetch if necessary

      Alert.alert("Success", "User information updated successfully");
    } catch (error: any) {
      console.error("Error updating user info:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to update information"
      );
    }
  };

  return (
    <LinearGradient
      colors={theme === "dark" ? ["#0C0C0C", "#0C0C0C"] : ["#F2F2F2", "#e3e3e3"]}
      style={{ flex: 1, paddingTop: 50 }}
    >
      <Header />
      <ScrollView contentContainerStyle={styles.container}>
        <Text
          style={[
            styles.title,
            {
              color: theme === "dark" ? "#FFFFFF" : "#000000",
              fontSize: largeFontSize === "large" ? 26 : 22,
            },
          ]}
        >
          Update User Info
        </Text>

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme === "dark" ? "#333333" : "#FFFFFF",
              color: theme === "dark" ? "#FFFFFF" : "#000000",
            },
          ]}
          placeholder="Name"
          placeholderTextColor={theme === "dark" ? "#AAAAAA" : "#555555"}
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme === "dark" ? "#333333" : "#FFFFFF",
              color: theme === "dark" ? "#FFFFFF" : "#000000",
            },
          ]}
          placeholder="Email"
          placeholderTextColor={theme === "dark" ? "#AAAAAA" : "#555555"}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          readOnly
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme === "dark" ? "#333333" : "#FFFFFF",
                color: theme === "dark" ? "#FFFFFF" : "#000000",
              },
            ]}
            placeholder="Old Password"
            placeholderTextColor={theme === "dark" ? "#AAAAAA" : "#555555"}
            value={oldPassword}
            onChangeText={setOldPassword}
            secureTextEntry={!showOldPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowOldPassword(!showOldPassword)}
          >
            <Ionicons name={showOldPassword ? "eye-off" : "eye"} size={24} color={theme === "dark" ? "#FFFFFF" : "#000000"} />
          </TouchableOpacity>
        </View>

        <View style={styles.passwordContainer}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme === "dark" ? "#333333" : "#FFFFFF",
                color: theme === "dark" ? "#FFFFFF" : "#000000",
              },
            ]}
            placeholder="New Password"
            placeholderTextColor={theme === "dark" ? "#AAAAAA" : "#555555"}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showNewPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowNewPassword(!showNewPassword)}
          >
            <Ionicons name={showNewPassword ? "eye-off" : "eye"} size={24} color={theme === "dark" ? "#FFFFFF" : "#000000"} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity  style={[
            styles.button,
            { backgroundColor: theme === "dark" ? "#272829" : "#BF0000" },
          ]} onPress={handleUpdate}>
          <Text style={styles.buttonText}>Update Info</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginVertical: 10,
    fontSize: 16,
  },
  passwordContainer: {
    position: "relative",
  },
  eyeIcon: {
    position: "absolute",
    right: 10,
    top: 23,
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
