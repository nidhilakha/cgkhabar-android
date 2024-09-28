import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useFonts, Raleway_700Bold } from "@expo-google-fonts/raleway";
import { Nunito_400Regular, Nunito_700Bold } from "@expo-google-fonts/nunito";
import { styles } from "@/styles/home/banner.style"; // Ensure you have the styles imported
import Swiper from "react-native-swiper";

import axios from "axios";
import { SERVER_URI } from "@/utils/uri";
import { router } from "expo-router";

// Define the interface directly in the same file
export interface BannerDataTypes {
  featured_image: string; // The URL of the featured image
  title: string;
  _id: string;
  content: string; // The ID of the news item
  yt_url: string;
}

export default function HomeBannerSlider() {
  const [fontsLoaded] = useFonts({
    Raleway_700Bold,
    Nunito_400Regular,
    Nunito_700Bold,
  });

  const [bannerNews, setBannerNews] = useState<BannerDataTypes[]>([]); // Use the interface here
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch the news with banners from the server
  useEffect(() => {
    const fetchBannerNews = async () => {
      try {
        const response = await axios.post(`${SERVER_URI}/news/banner`, {
          withCredentials: true,
        });

        if (response.data.success) {
          setBannerNews(response.data.news);
        } else {
          setError("Failed to load banners.");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        if (axios.isAxiosError(err) && err.response) {
          setError(
            `Axios error: ${err.response.status} ${err.response.statusText}`
          );
        } else {
          setError("An unknown error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBannerNews();
  }, []);

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return <Text>{error}</Text>;
  }
  const handlePress = (item: BannerDataTypes) => {
    const simplifiedItem = {
      id: item._id,
      title: item.title,
      content: item.content,
      // Ensure featured_image is handled correctly
      featured_image: item.featured_image || "", // Default to an empty string if undefined
      yt_url: item.yt_url,
    };
    const serializedItem = encodeURIComponent(JSON.stringify(simplifiedItem));
    router.push(`/course-details?item=${serializedItem}`);
  };

  return (
    <View style={styles.container}>
      <Swiper
        dotStyle={styles.dot}
        activeDotStyle={styles.activeDot}
        autoplay={true}
        autoplayTimeout={5}
      >
        {bannerNews.map((item: BannerDataTypes) => (
          <View key={item._id} style={styles.slide}>
            <TouchableOpacity onPress={() => handlePress(item)}>
              <Text
                style={styles.title}
                numberOfLines={2} // Limits the text to 2 lines
                ellipsizeMode="tail" // Adds '...' at the end of the truncated text
              >
                {item.title}
              </Text>
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: item.featured_image }} // Use featured_image from the news data
                  style={styles.image}
                />
              </View>
            </TouchableOpacity>
          </View>
        ))}
      </Swiper>
    </View>
  );
}
