import { View, Text, Image, TouchableOpacity } from "react-native";
import React, { FC } from "react"; // Import FC here
import { useFonts } from "expo-font";
import { Raleway_700Bold } from "@expo-google-fonts/raleway";
import { Nunito_400Regular, Nunito_700Bold } from "@expo-google-fonts/nunito";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "@/styles/onboarding/onboard";
import { router } from "expo-router";
import Button from "@/components/button/button";

interface OnBoardingScreenProps {
  onComplete: () => void; // Define the type for onComplete
}

const OnBoardingScreen: FC<OnBoardingScreenProps> = ({ onComplete }) => { 
   let [fontsLoaded, fontError] = useFonts({
    Raleway_700Bold,
    Nunito_400Regular,
    Nunito_700Bold,
  });

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
          <Image source={require("@/assets/logo.png")} style={styles.logo} />
        </View>
        <View style={styles.titleWrapper}>
          {/* <Image source={require("@/assets/logo.png")} style={styles.titleTextShape1}/> */}
          <Text
            style={[
              styles.titleText1,
              { fontFamily: "Raleway_700Bold" },
              { color: "white" },
            ]}
          >
            सच कहने का साहस!
          </Text>
          {/* <Image source={require("@/assets/logo.png")}  style={styles.titleTextShape2}></Image> */}
        </View>
        <View>
          {/* <Image
            source={require("@/assets/logo.png")}
            style={styles.titleTextShape3}
          ></Image> */}
          {/* <Text
            style={[
              styles.titleText,
              { fontFamily: "Raleway_700Bold" },
              { color: "#fff" },
            ]}
          >
            Latest News!
          </Text> */}
        </View>

        {/* ------------------------ */}
        {/* <View style={styles.dscWrapper}>
          <Text style={[styles.dscp, { fontFamily: "Nunito_400Regular" }]}>
            Discover Today’s Top Stories with CG Khabar
          </Text>
        </View> */}
        {/* <TouchableOpacity
          style={styles.buttonWrapper}
          onPress={onComplete} 
         
        >
          <Text style={[styles.buttonText, { fontFamily: "Nunito_700Bold" }]}>
            Explore With Us ➔
          </Text>
         
        </TouchableOpacity> */}
        <TouchableOpacity
          style={styles.buttonWrapper}
          onPress={onComplete} 
        >
          <Text style={[styles.buttonText, { fontFamily: "Nunito_700Bold" }]}>
          Explore With Us ➔
          </Text>
         
        </TouchableOpacity>

            

      </View>
      <View >
      <Image style={styles.onboardingpageoneicon} source={require("@/assets/onboarding/marketing.webm")}  />
      </View>
     
    </LinearGradient>
  );
}

export default OnBoardingScreen;