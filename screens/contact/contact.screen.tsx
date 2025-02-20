import { Entypo, FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { ScrollView, View, Text, StyleSheet, Linking, TouchableOpacity } from "react-native";
import Header from "@/components/header/header";

export default function ContactScreen() {
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
            { color: theme === "dark" ? "#FFFFFF" : "#000000",fontSize: largeFontSize==='large' ? 26 : 22 },
          ]}
        >
          Contact Us
        </Text>

        <Text
          style={[
            styles.text,
            {
              color: theme === "dark" ? "#E0E0E0" : "#333333",
              fontSize: largeFontSize === "large" ? 18 : 16,
            },
          ]}
        >
          If you have any questions or need assistance, feel free to reach out to us:
        </Text>

        <View style={styles.contactItem}>
          <Entypo name="mail" size={20} color={theme === "dark" ? "#FFFFFF" : "#000000"} />
          <Text

            style={[
              styles.contactText,
              {
                color: theme === "dark" ? "#E0E0E0" : "#333333",
                fontSize: largeFontSize === "large" ? 18 : 16,
              },
            ]}
            onPress={() => Linking.openURL("mailto:cgkhabar@gmail.com")}
          >
            cgkhabar@gmail.com
          </Text>
        </View>

        <View style={styles.contactItem}>
          <FontAwesome name="phone" size={20} color={theme === "dark" ? "#FFFFFF" : "#000000"} />
          <Text
  style={[
    styles.contactText,
    {
      color: theme === "dark" ? "#E0E0E0" : "#333333",
      fontSize: largeFontSize === "large" ? 18 : 16,
    },
  ]}            onPress={() => Linking.openURL("tel:+918305900001")}
          >
            +918305900001
          </Text>
          <Text
  style={[
    styles.contactText,
    {
      color: theme === "dark" ? "#E0E0E0" : "#333333",
      fontSize: largeFontSize === "large" ? 18 : 16,
    },
  ]}            onPress={() => Linking.openURL("tel:0771-3511808")}
          >
            0771-3511808
          </Text>
         
        </View>

        <View style={styles.contactItem}>
          <Entypo name="location-pin" size={20} color={theme === "dark" ? "#FFFFFF" : "#000000"} />
          <Text   style={[
              styles.contactText,
              {
                color: theme === "dark" ? "#E0E0E0" : "#333333",
                fontSize: largeFontSize === "large" ? 18 : 16,
              },
            ]}>
            Central Gondwana Khabar,{"\n"}
  Plot No. J-1, Sector-2,
   Agroha Society, Raipura, 
  Raipur, Chhattisgarh, India{"\n"}
  492013
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: theme === "dark" ? "#272829" : "#BF0000" },
          ]}
          onPress={() => Linking.openURL("https://www.cgkhabar.com")}
        >
          <Text style={styles.buttonText}>Visit Our Website</Text>
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
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
    textAlign: "justify",
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  contactText: {
    fontSize: 16,
    marginLeft: 10,
    // textDecorationLine: "underline",
  },
  button: {
    marginTop: 20,
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
