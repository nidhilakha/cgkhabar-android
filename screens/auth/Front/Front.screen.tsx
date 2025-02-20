import React, { useEffect, useRef } from "react";
import { View, Text, Image, Animated, TouchableOpacity } from "react-native";
import { useFonts } from "expo-font";
import { Raleway_700Bold } from "@expo-google-fonts/raleway";
import { Nunito_400Regular, Nunito_700Bold } from "@expo-google-fonts/nunito";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "@/styles/onboarding/onboard";
import { router } from "expo-router";

export default function FrontScreen() {
  let [fontsLoaded, fontError] = useFonts({
    Raleway_700Bold,
    Nunito_400Regular,
    Nunito_700Bold,
  });

  const fadeAnimLogo = useRef(new Animated.Value(0)).current; // Initial opacity of 0
  const fadeAnimText = useRef(new Animated.Value(0)).current; // Initial opacity of 0

  useEffect(() => {
    // Start fade-in animation for logo
    Animated.timing(fadeAnimLogo, {
      toValue: 1, // Fully visible
      duration: 500, // Animation duration for logo
      useNativeDriver: true, // Enable native driver for performance
    }).start();

    // Start fade-in animation for text
    Animated.timing(fadeAnimText, {
      toValue: 1, // Fully visible
      duration: 1000, // Animation duration for text
      delay: 1000, // Delay before the text appears
      useNativeDriver: true,
    }).start();

    // Redirect to login after 3 seconds
    const timeout = setTimeout(() => {
      router.push("/(tabs)");
    }, 2000);

    // Clean up the timeout on unmount
    return () => clearTimeout(timeout);
  }, [fadeAnimLogo, fadeAnimText]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <LinearGradient
      colors={["#A6121F", "#A6121F"]}
      style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
    >
      <View style={styles.firstContainer}>
        <View>
          {/* Logo with dissolve (fade-in) effect */}
          <Animated.Image
            source={require("@/assets/logo.png")}
            style={[styles.logo, { opacity: fadeAnimLogo }]}
          />
        </View>

        <View style={styles.titleWrapper}>
          {/* Typography animation for text */}
          <Animated.Text
            style={[
              styles.titleText1,
              { fontFamily: "Raleway_700Bold", color: "white", opacity: fadeAnimText },
            ]}
          >
            सच कहने का साहस!
          </Animated.Text>
        </View>
      </View>

      <View>
        {/* You can use other images or animations as needed */}
        <Image
          style={styles.onboardingpageoneicon}
          source={require("@/assets/onboarding/marketing.webm")}
        />
      </View>
    </LinearGradient>
  );
}
