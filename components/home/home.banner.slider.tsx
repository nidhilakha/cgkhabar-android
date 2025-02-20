import React, { useCallback, useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import Swiper from "react-native-swiper";
import { styles } from "@/styles/home/banner.style"; // Ensure styles are imported
import { router } from "expo-router";
import { useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Category {
  _id: string;
  name: string; // Add any other properties you expect for the category
}
// Define the interface for Banner Data
export interface BannerDataTypes {
  featured_image: string;
  title: string;
  _id: string;
  content: string;
  yt_url: string;
  category: Category; // Update category to be of type Category
  author:string;
  createdAt:Date;
}

interface HomeBannerSliderProps {
  data: BannerDataTypes[]; // Ensure that data is always an array
}

const HomeBannerSlider: React.FC<HomeBannerSliderProps> = ({ data }) => {

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
    // Log the number of unique items
    const uniqueData = Array.from(new Set(data.map(item => item.title)))
      .map(title => data.find(item => item.title === title))
      .filter((item): item is BannerDataTypes => item !== undefined); // Type guard

    // console.log("Number of unique items in banner data:", uniqueData.length);
  }, [data]);

  const handlePress = (item: BannerDataTypes) => {
    // console.log("Full item:", item); // Log the full item to inspect its structure
    const simplifiedItem = {
      id: item._id,
      title: item.title,
      content: item.content,
      featured_image: item.featured_image || "", // Handle missing image
      yt_url: item.yt_url,
      author: item.author,
      createdAt: item.createdAt,
      category: item.category
    };
  

  
    const serializedItem = encodeURIComponent(JSON.stringify(simplifiedItem));
    router.push(`/course-details?item=${serializedItem}`);
  };

  // Create a unique data array based on titles
  const uniqueData = Array.from(new Set(data.map(item => item.title)))
    .map(title => data.find(item => item.title === title))
    .filter((item): item is BannerDataTypes => item !== undefined); // Type guard

  // Do not render the Swiper if uniqueData is empty
  if (uniqueData.length === 0) {
    return null; // Return null to avoid rendering the banner
  }

  return (
    <View style={styles.container}>
      <Swiper
        // dotStyle={styles.dot}
        // activeDotStyle={styles.activeDot}
        autoplay={true}
        autoplayTimeout={3}
        loop={true}
        showsPagination={false}
      >
        {uniqueData.map((item) => (
          <View key={item._id} style={styles.slide}>
            <TouchableOpacity onPress={() => handlePress(item)}>
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: item.featured_image }}
                  style={styles.image}
                  onError={(error) =>
                    console.log("Image load error: ", error.nativeEvent)
                  }
                />
                <View style={styles.gradientOverlay} />
                <Text
                  style={[
                    theme === "light"
                      ? styles.overlayTitle
                      : styles.overlayTitleDark,
                    { fontSize: largeFontSize === "large" ? 24 : 20 },
                  ]}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {item.title || "No Title"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        ))}
      </Swiper>
    </View>
  );
};

export default HomeBannerSlider;
