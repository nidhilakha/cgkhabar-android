import { Entypo, FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
} from "react-native";
import Header from "@/components/header/header";

export default function TermsScreen() {
  const [theme, setTheme] = useState("light");
  const [largeFontSize, setLargeFontSize] = useState("default");

  // Fetch the stored theme from AsyncStorage
  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem("theme");
        if (storedTheme) {
          setTheme(storedTheme);
        }
      } catch (error) {
        console.error("Error fetching theme:", error);
      }
    };

    fetchTheme();
  }, []);

  // Fetch the stored font size from AsyncStorage
  useEffect(() => {
    const fetchFont = async () => {
      try {
        const storedFont = await AsyncStorage.getItem("largeFontSize");
        if (storedFont) {
          setLargeFontSize(storedFont);
        }
      } catch (error) {
        console.error("Error fetching font size:", error);
      }
    };

    fetchFont();
  }, []);

  // Define the terms and conditions as static text
  const termsText = `
  Welcome to our CGKhabar App!

  By using this app, you agree to the following terms and conditions:
  
  1. **Content Usage**: All content provided in the app is for informational purposes only. Unauthorized distribution or modification is prohibited.
  
  2. **User Responsibilities**: Users are expected to use the app ethically and avoid any activity that violates our policies.
  
  3. **Privacy**: We respect your privacy and handle your data as per our Privacy Policy.
  
  4. **Changes to Terms**: These terms may be updated at any time. Continued use of the app signifies acceptance of any changes.
  
 
  `;

  return (
    <LinearGradient
    colors={theme === 'dark' ? ['#0C0C0C', '#0C0C0C'] : ['#F2F2F2', '#e3e3e3']}
    style={{ flex: 1, paddingTop: 50 }}
  >
      <Header />
      <ScrollView contentContainerStyle={styles.container}>
        <Text
          style={[
            styles.title,
            { color: theme === "dark" ? "#FFFFFF" : "#000000",fontSize: largeFontSize==='large' ? 26 : 22  },
          ]}
        >
          Terms and Conditions
        </Text>
        <Text
          style={[
            styles.termsText,
            { 
              color: theme === "dark" ? "#E0E0E0" : "#333333", 
              fontSize: largeFontSize === "large" ? 18 : 16 
            },
          ]}
        >
          {termsText}
        </Text>
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
  termsText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign:"justify",
  },
});
