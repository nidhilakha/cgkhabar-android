import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    StyleSheet
  } from "react-native";
  import React, { useState } from "react";
  import { useFonts } from "expo-font";
  import { Nunito_600SemiBold } from "@expo-google-fonts/nunito";
  import { LinearGradient } from "expo-linear-gradient";
  
  export default function OtpVerificationScreen() {
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    let [fontsLoaded] = useFonts({ Nunito_600SemiBold });
  
    const handleVerifyOTP = async () => {
      // Call backend API to verify OTP and set new password
      try {
        const response = await fetch("https://yourapi.com/reset-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ otp, newPassword }),
        });
        const result = await response.json();
        if (response.ok) {
          Alert.alert("Success", "Your password has been reset.");
          // Redirect to Login screen or another appropriate screen
        } else {
          Alert.alert("Error", result.message || "Failed to reset password.");
        }
      } catch (error) {
        Alert.alert("Error", "An error occurred. Please try again.");
      }
    };
  
    if (!fontsLoaded) {
      return null;
    }
  
    return (
      <LinearGradient colors={["#E5ECF9", "#F6F7F9"]} style={styles.container}>
        <Text style={[styles.headerText, { fontFamily: "Nunito_600SemiBold" }]}>
          Verify OTP & Reset Password
        </Text>
        <TextInput
          style={styles.inputBox}
          placeholder="Enter OTP"
          keyboardType="numeric"
          value={otp}
          onChangeText={(text) => setOtp(text)}
        />
        <TextInput
          style={styles.inputBox}
          placeholder="New Password"
          secureTextEntry
          value={newPassword}
          onChangeText={(text) => setNewPassword(text)}
        />
        <TouchableOpacity style={styles.button} onPress={handleVerifyOTP}>
          <Text style={styles.buttonText}>Reset Password</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }
  
  const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20 },
    headerText: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
    inputBox: { width: "100%", height: 50, borderWidth: 1, borderColor: "#ccc", borderRadius: 5, padding: 10, marginBottom: 20 },
    button: { backgroundColor: "black", width: "100%", height: 45, justifyContent: "center", alignItems: "center", borderRadius: 5 },
    buttonText: { color: "white", fontSize: 18 },
  });
  