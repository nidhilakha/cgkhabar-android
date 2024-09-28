import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from "react-native";
import { useFonts } from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { commonStyles } from "@/styles/common/common.styles"; // Verify this import path

// Replace with your categories
const interests = [
  { id: 1, name: "🚊 Travel" },
  { id: 2, name: "🏏 Sports" },
  { id: 3, name: "🎧 Music" },
  { id: 7, name: "👠 Fashion" },
  { id: 5, name: "👨🏼‍🎨 Art" },
  { id: 11, name: "✍🏻 Design" },
  { id: 4, name: "🛰 Technology" },
  { id: 6, name: "🩺 Healthcare" },
  { id: 15, name: "Food" },
  { id: 13, name: "📕 Books" },
  { id: 16, name: "📖 Stories" },

  { id: 8, name: "🎬 Entertainment" },
  { id: 9, name: "💵 Business" },
  { id:10, name: "🏭 Real Estate" },

  { id: 12, name: "💻 Programming" },
  
  { id: 14, name: "🌋 Geography" },
  { id: 17, name: "📷 Photography" },

  // Add more interests as needed
];

export default function WelcomeIntroScreen() {
  let [fontsLoaded, fontError] = useFonts({
    Raleway_700Bold: require("@expo-google-fonts/raleway"),
    Nunito_400Regular: require("@expo-google-fonts/nunito"),
    Nunito_700Bold: require("@expo-google-fonts/nunito"),
  });

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  if (!fontsLoaded || fontError) {
    console.log(fontError); // Log font loading error for debugging
    return null; // Handle font loading error gracefully
  }

  // Toggle interest selection
  const handleSelectInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests((prev) =>
        prev.filter((item) => item !== interest)
      );
    } else {
      setSelectedInterests((prev) => [...prev, interest]);
    }
  };

  const renderInterestButtons = () => {
    return interests.map((interest) => (
      <TouchableOpacity
        key={interest.id}
        style={[
          styles.interestButton,
          selectedInterests.includes(interest.name) && styles.selectedButton,
        ]}
        onPress={() => handleSelectInterest(interest.name)}
      >
        <Text
          style={[
            styles.interestText,
            selectedInterests.includes(interest.name)
              ? { color: "white" }
              : { color: "black" },
          ]}
        >
          {interest.name}
        </Text>
      </TouchableOpacity>
    ));
  };

  return (
    <LinearGradient
    colors={["#A6121F", "#A6121F"]}      style={{ flex: 1, paddingHorizontal: 16 }}
    >
      <ScrollView contentContainerStyle={{ paddingTop: 80 }}>
        <Text style={[commonStyles.title, { fontFamily: "Raleway_700Bold", marginBottom: 20,color:"#fff" }]}>
          Select Your Interests
        </Text>
        <View style={styles.interestsContainer}>{renderInterestButtons()}</View>
      </ScrollView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            commonStyles.welcomeButtonStyle,
            { backgroundColor: selectedInterests.length > 0 ? "#fff" : "#D98B91"},
          ]}
          disabled={selectedInterests.length === 0}
          onPress={() => {
            if (selectedInterests.length > 0) {
              router.push("/login");
            }
          }}
        >
          <Text style={[styles.buttonText, { fontFamily: "Nunito_700Bold" ,color: selectedInterests.length > 0 ? "#A6121F" : "#fff" }]}>
            Continue
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  interestButton: {
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    margin: 8,
    backgroundColor: "white",
  },
  selectedButton: {
    backgroundColor: "#D98B91",
    borderColor: "#D98B91",
  },
  interestText: {
    fontSize: 16,
    fontFamily: "Nunito_400Regular",
  },
  bottomContainer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    paddingTop:4
  },
});
