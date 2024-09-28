import React from "react";
import { View, Text, ScrollView, TouchableOpacity,StyleSheet } from "react-native";

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
  return (
    <View style={{ padding: 10 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category._id}
            style={{
                padding: 5,
                backgroundColor:
                  activeCategory === category._id ? "red" : "#2d2d2d",
                borderRadius: 5,
                paddingHorizontal: 10,
                marginHorizontal: 5,
              }}
            onPress={() => setActiveCategory(category._id)}
          >
            <Text style={{ color: "white", fontSize: 18, fontWeight: "600" }}>
              {category.name ? category.name : "anonymous"}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export const styles = StyleSheet.create({
    catTab: {
      fontSize: 16,
      textAlign: "left",
      fontFamily: "Raleway_600SemiBold",
      color: "#fff",
    },
  });

export default CategoryHeader;
