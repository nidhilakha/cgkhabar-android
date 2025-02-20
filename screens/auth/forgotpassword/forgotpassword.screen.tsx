import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert
} from "react-native";
import React, { useState } from "react";
import { useFonts } from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SERVER_URI } from "@/utils/uri";
import { Toast } from "react-native-toast-notifications";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
 

  const handleSendOTP = async () => {
    console.log("Button clicked");
    Toast.show("Button clicked", {
      type: "danger",
    }); 

    if (!email) {
      Toast.show("enter valid email", {
        type: "danger",
      }); 
      return;
    }
  
    try {
      const response = await fetch(`${SERVER_URI}/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
  
      const result = await response.json();
  
      if (response.ok) {
        Toast.show("OTP sent to your email.", {
          type: "success",
        }); 
      
        router.push("/(routes)/reset-password");
      } else {
         Toast.show("Error", {
                type: "danger",
              }); 
       
      }
    } catch (error) {
      console.error("Error occurred:", error);
      Toast.show("Error", {
        type: "danger",
      }); 
    }
  };

  
  return (
    <LinearGradient colors={["#A6121F", "#A60303"]} style={styles.container}>
      <Text style={[styles.headerText, { fontFamily: "Raleway_700Bold" }]}>
        Forgot Password
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        keyboardType="email-address"
        value={email}
        onChangeText={(text) => setEmail(text)}
      />
      <TouchableOpacity style={styles.button} onPress={handleSendOTP}>
        <Text style={styles.buttonText}>Send OTP</Text>
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
