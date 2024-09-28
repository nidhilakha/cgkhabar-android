import React, { useRef, useEffect } from "react";
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
                backgroundColor: activeCategory === category._id ? "#BF0000" : "#fff",
              },
            ]}
            onPress={() => setActiveCategory(category._id)}
          >
            <Text style={[styles.text,{
                              color: activeCategory === category._id ? "#fff" : "#000",

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
