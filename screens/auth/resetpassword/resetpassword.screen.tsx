import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import React, { useState } from "react";
import { useFonts } from "expo-font";
import { Nunito_600SemiBold } from "@expo-google-fonts/nunito";
import { LinearGradient } from "expo-linear-gradient";
import { Toast } from "react-native-toast-notifications"; // Add Toast for notifications
import { router } from "expo-router"; // Import router for navigation
import { SERVER_URI } from "@/utils/uri";

export default function ResetPasswordScreen() {
  const [email, setEmail] = useState(""); // Add state for email
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  let [fontsLoaded] = useFonts({ Nunito_600SemiBold });

  const handleResetPassword = async () => {
    if (!email || !otp || !newPassword) {
      Toast.show("Please fill in all fields", {
        type: "danger",
      });
      return;
    }

    try {
      const response = await fetch(`${SERVER_URI}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email, // Send email in the request body
          otp,
          newPassword,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        Toast.show("Password reset successfully!", {
          type: "success",
        });
        router.push("/(routes)/login"); // Navigate to login page after successful reset
      } else {
        Toast.show(result.message || "Error", {
          type: "danger",
        });
      }
    } catch (error) {
      console.error("Error occurred:", error);
      Toast.show("An error occurred", {
        type: "danger",
      });
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <LinearGradient colors={["#A6121F", "#A60303"]} style={styles.container}>
      <Text style={[styles.headerText, { fontFamily: "Nunito_600SemiBold" }]}>
        Reset Password
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Enter Email"
        keyboardType="email-address"
        value={email}
        onChangeText={(text) => setEmail(text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Enter OTP"
        keyboardType="numeric"
        value={otp}
        onChangeText={(text) => setOtp(text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Enter New Password"
        secureTextEntry
        value={newPassword}
        onChangeText={(text) => setNewPassword(text)}
      />

      <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
        <Text style={styles.buttonText}>Reset Password</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20 },
  headerText: { fontSize: 22, fontWeight: "bold", marginBottom: 20,color:"white" },
  input: { width: "100%", height: 50, borderWidth: 1, borderColor: "#ccc", borderRadius: 5, padding: 10, marginBottom: 20, backgroundColor: "white",
    color: "#A1A1A1", },
  button: { backgroundColor: "white", width: "100%", height: 45, justifyContent: "center", alignItems: "center", borderRadius: 5 },
  buttonText: { color: "#A6121F", fontSize: 18,fontWeight:"bold" },
});
