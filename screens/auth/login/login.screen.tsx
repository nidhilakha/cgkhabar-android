

import {
  Raleway_700Bold,
  Raleway_600SemiBold,
} from "@expo-google-fonts/raleway";
import {
  Nunito_400Regular,
  Nunito_700Bold,
  Nunito_600SemiBold,
} from "@expo-google-fonts/nunito";
import { View, Text, ScrollView, Image, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import React, { useState } from "react";
import { styles } from "@/styles/onboarding/onboard";
import { Feather, Entypo, FontAwesome, Fontisto, Ionicons, SimpleLineIcons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { commonStyles } from "@/styles/common/common.styles";
import axios from "axios";
import { SERVER_URI } from "@/utils/uri";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Toast } from "react-native-toast-notifications";

export default function LoginScreen() {
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [buttonSpinner, setButtonSpinner] = useState(false);
  const [userInfo, setUserInfo] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState({
    password: "",
  });

  const [required, setRequired] = useState("");

  let [fontsLoaded, fontError] = useFonts({
    Raleway_700Bold,
    Nunito_400Regular,
    Nunito_700Bold,
    Nunito_600SemiBold,
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }

  const handlePasswordValidation = (value: string) => {
    const password = value;
    const passwordSpecialCharacter = /(?=.*[!@#$&*])/;
    const passwordOneNumber = /(?=.*[0-9])/;
    const passwordSixValue = /(?=.{6,})/;

    if (!passwordSpecialCharacter.test(password)) {
      setError({
        ...error,
        password: "Write at least one special character.",
      });
    } else if (!passwordOneNumber.test(password)) {
      setError({
        ...error,
        password: "Write at least one number.",
      });
    } else if (!passwordSixValue.test(password)) {
      setError({
        ...error,
        password: "Write at least 6 characters.",
      });
    } else {
      setError({
        ...error,
        password: "",
      });
    }

    setUserInfo({ ...userInfo, password: password });
  };

  const handleSignIn = async () => {
    try {
      const res = await axios.post(`${SERVER_URI}/login`, {
        email: userInfo.email,
        password: userInfo.password,
      });

      const accessToken = res.data.accessToken;
      const refreshToken = res.data.refreshToken;

      if (accessToken) {
        await AsyncStorage.setItem("access_token", accessToken);

        if (refreshToken) {
          await AsyncStorage.setItem("refresh_token", refreshToken);
        } else {
          // console.log('No refresh token provided in response.');
          await AsyncStorage.removeItem("refresh_token");
        }

        router.push("/");
      } else {
        throw new Error("Access token is missing in the response");
      }
    } catch (error) {
      // console.log(error);
      Toast.show("Email or password is not correct!", {
        type: "danger",
      });
    }
  };

  return (
    <LinearGradient colors={["#A6121F", "#A60303"]} style={{ flex: 1, paddingTop: 20 }}>
      {/* Skip Button */}
     
      <Text style={styles.welcomeText}>
        Welcome to
      </Text>
      <Image
        source={require("@/assets/logo.png")}
        style={styles.signInImage}
      />

     
      <Text style={[styles.learningText, { fontFamily: "Nunito_400Regular" }]}>
      सच कहने का साहस
      </Text>
      <Text style={[styles.logintext, { fontFamily: "Nunito_400Regular" }]}>
      Please login here!
      </Text>
      <View style={styles.inputContainer}>
        <View>
          <TextInput
            style={styles.input}
            keyboardType="email-address"
            value={userInfo.email}
            placeholder="Enter Email"
            onChangeText={(value) => setUserInfo({ ...userInfo, email: value })}
          />
          <Fontisto
            style={{ position: "absolute", left: 25, top: 17 }}
            name="email"
            size={20}
            color={"#D98B91"}

          />
          {required && (
            <View style={styles.errorContainer}>
              <Entypo name="cross" size={18} color={"#fff"} />
            </View>
          )}
        </View>
        <View>
          <TextInput
            style={[styles.input, { marginTop: 10 }]}
            keyboardType="default"
            secureTextEntry={!isPasswordVisible}
            placeholder="Enter Password"
            onChangeText={(value) => {
              setUserInfo({ ...userInfo, password: value });
              handlePasswordValidation(value);
            }}
          />

          <TouchableOpacity
            style={styles.visibleIcon}
            onPress={() => setPasswordVisible(!isPasswordVisible)}
          >
            {isPasswordVisible ? (
              <Ionicons
                name="eye-off-outline"
                size={23}
                color={"#D98B91"}
              />
            ) : (
              <Ionicons
                name="eye-outline"
                size={23}
                color={"#D98B91"}
              />
            )}
          </TouchableOpacity>
          <SimpleLineIcons
            style={{ position: "absolute", left: 25, top: 23 }}
            name="lock"
            size={20}
            color={"#D98B91"}
          />

          {error.password && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 10,
              }}
            >
              <Entypo name="cross" size={18} color={"#fff"} />
              <Text style={{ color: "#fff", fontSize: 14, marginTop: -1 }}>
                {error.password}
              </Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={() => router.push("/(routes)/forgot-password")}>
          <Text style={[styles.forgotSection, { fontFamily: "Nunito_600SemiBold" }]}>
            Forgot Password?
          </Text>
        </TouchableOpacity>
        

        <TouchableOpacity
          onPress={handleSignIn}
          style={{
            padding: 16,
            borderRadius: 8,
            marginHorizontal: 16,
            backgroundColor: "white",
            marginTop: 20,
          }}
        >
          {buttonSpinner ? (
            <ActivityIndicator size="small" color={"#A60303"} />
          ) : (
            <Text
              style={{
                color: "#A60303",
                textAlign: "center",
                fontSize: 22,
                fontFamily: "Raleway_700Bold",
              }}
            >
              Sign In <Entypo name="login" size={24} color="#A60303" />
            </Text>
          )}
        </TouchableOpacity>

        {/* <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 20,
            gap: 10,
          }}
        >
          <TouchableOpacity>
            <FontAwesome name="google" size={24} />
          </TouchableOpacity>
          <TouchableOpacity>
            <FontAwesome name="github" size={24} />
          </TouchableOpacity>
        </View> */}

        <View
          style={[
            styles.signUpRedirect,
            { flexDirection: "row", alignItems: "center", marginTop: 20 },
          ]}
        >
          <Text style={{ fontSize: 18, color: "#D98B91", fontFamily: "Nunito_600SemiBold" }}>
            Don't have an account?
          </Text>
          <TouchableOpacity onPress={() => router.push("/(routes)/sign-up")}>
            <Text
              style={{
                fontSize: 18,
                fontFamily: "Nunito_600SemiBold",
                color: "#fff",
                marginLeft: 5,
              }}
            >
              Sign Up
            </Text>

          </TouchableOpacity>
          
          

        </View>
      </View>
      <TouchableOpacity
        style={{alignItems: 'center', marginTop: 10, }}
        onPress={() => {
          console.log("Skip button pressed, navigating to tabs screen...");
          router.push("/");
        }}
      >
        <Text style={{ color: "#fff", fontWeight:"600", textDecorationLine: 'underline', fontSize: 22, fontFamily: "Nunito_600SemiBold" }}>
          Skip for now 
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}
