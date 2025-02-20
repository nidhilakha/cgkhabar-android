import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import React, { useRef, useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from "react-native";

interface CategoryType {
  _id: string;
  name: string;
}

interface CategoryHeaderProps {
  categories: CategoryType[];
  activeCategory: string;
  setActiveCategory: (category: string) => void;
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({ categories, activeCategory, setActiveCategory }) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const buttonWidth = 120;
  const spacing = 10;

  const [theme, setTheme] = useState("light");
  const [largeFontSize, setLargeFontSize] = useState('default'); // State for theme


  useFocusEffect(
    useCallback(() => {
      const fetchFont = async () => {
        try {
          const storedFont = await AsyncStorage.getItem("largeFontSize");
          // console.log("Stored Font:", storedFont); // Log the stored theme
          if (storedFont) {
            setLargeFontSize(storedFont);
          }
        } catch (error) {
          console.error("Error fetching theme:", error);
        }
      };
  
      fetchFont();
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      const fetchTheme = async () => {
        const storedTheme = await AsyncStorage.getItem("theme");
        setTheme(storedTheme || "light");
        // console.log("in home screen",storedTheme);
      };
      fetchTheme();
    }, [])
  );


  useEffect(() => {
    if (scrollViewRef.current) {
      const index = categories.findIndex(category => category._id === activeCategory);
      if (index !== -1) {
        const offset = (index * (buttonWidth + spacing)) - (Dimensions.get('window').width / 2) + (buttonWidth / 2);
        scrollViewRef.current.scrollTo({
          x: Math.max(offset, 0),
          animated: true,
        });
      }
    }
  }, [activeCategory, categories]);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        ref={scrollViewRef}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category._id}
            style={[
              styles.button,
              {
                backgroundColor: theme === 'light' ?
                (activeCategory === category._id ? "#BF0000" : "#fff"): (activeCategory === category._id ? "#BF0000" : "#272829")
              },
            ]}
            onPress={() => setActiveCategory(category._id)}
          >
            <Text style={[styles.text,{
                              color:theme === 'light' ?( activeCategory === category._id ? "#fff" : "#000"):(activeCategory === category._id ? "#fff" : "#fff"),fontSize: largeFontSize==='large' ? 22 : 18 

            },]}>
              {category.name || "anonymous"}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  button: {
    padding: 5,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginHorizontal: 5,
  },
  text: {
    fontSize: 18,
    fontWeight: "600",
    color: "#A6121F",
  },
});

export default CategoryHeader;
