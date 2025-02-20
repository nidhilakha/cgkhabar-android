import { View, Text, SafeAreaView, TouchableOpacity,StyleSheet } from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { AntDesign } from "@expo/vector-icons";
import SearchInput from "@/components/common/search.input";
import Header from "@/components/header/header";
import { useTheme } from "@/utils/ThemeContext"; // Import your theme context
import React, { useCallback, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useTheme } from "@/utils/ThemeContext";
import { useFocusEffect } from "expo-router";

export default function SearchScreen() {
  const [theme, setTheme] = useState("light");

  useFocusEffect(
    useCallback(() => {
      const fetchTheme = async () => {
        try {
          const storedTheme = await AsyncStorage.getItem("theme");
          // console.log("Stored Theme:", storedTheme); // Log the stored theme
          if (storedTheme) {
            setTheme(storedTheme);
          }
        } catch (error) {
          console.error("Error fetching theme:", error);
        }
      };
  
      fetchTheme();
    }, [])
  );


 


  return (
    <LinearGradient
    colors={theme === 'dark' ? ['#0C0C0C', '#0C0C0C'] : ['#F2F2F2', '#e3e3e3']}
    style={{ flex: 1, paddingTop: 50 }}
  >
            <Header />
      <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
     
        
    </View>

        <SearchInput />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginHorizontal: 16,
      marginBottom: 10,
      width: "90%",
    },
  
   
  });