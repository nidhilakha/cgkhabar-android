import React, { useState, useEffect } from "react";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import FontAwesome from "@expo/vector-icons/FontAwesome";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Image,
  Share,
} from "react-native";
import {
  useFonts,
  Raleway_700Bold,
  Raleway_600SemiBold,
} from "@expo-google-fonts/raleway";
import {
  Nunito_600SemiBold,
  Nunito_500Medium,
} from "@expo-google-fonts/nunito";
import axios from "axios";
import { SERVER_URI } from "@/utils/uri";
import { router } from "expo-router";
import CourseCard from "@/components/cards/course.card";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface CategoryType {
  _id: string;
  name: string;
}



interface AllCoursesProps {
  setSelectedCategory: (category: string) => void;
  news: NewsType[];
}

const AllCourses = ({ news, setSelectedCategory }: AllCoursesProps) => {
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [newsByCategory, setNewsByCategory] = useState<{
    [key: string]: NewsType[];
  }>({});
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [visibleCategories, setVisibleCategories] = useState<CategoryType[]>([]);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [savedNewsIds, setSavedNewsIds] = useState<string[]>([]); // To track saved news IDs
  const [thumbnailUrl, setThumbnailUrl] = useState(""); 
  const [news2, setNews2] = useState<NewsType[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoryResponse = await axios.get(`${SERVER_URI}/categories`, {
          withCredentials: true,
        });
        const categoriesData = categoryResponse.data.categories;
        setCategories(categoriesData);

        // Load the first category's news initially
        if (categoriesData.length > 0) {
          setVisibleCategories([categoriesData[0]]);
          await loadNewsForCategory(categoriesData[0]._id);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const loadNewsForCategory = async (categoryId: string) => {
    try {
      const newsResponse = await axios.get(
        `${SERVER_URI}/news/latest/${categoryId}`,
        { withCredentials: true }
      );
      const newsData = newsResponse.data.latestNews.slice(0, 5);
      setNewsByCategory((prev) => ({ ...prev, [categoryId]: newsData }));
    } catch (error) {
      console.error(`Error fetching news for category ${categoryId}:`, error);
    }
  };

  const loadMoreCategories = () => {
    if (currentCategoryIndex + 1 < categories.length) {
      const nextIndex = currentCategoryIndex + 1;
      const nextCategory = categories[nextIndex];
      setVisibleCategories((prev) => [...prev, nextCategory]);
      loadNewsForCategory(nextCategory._id);
      setCurrentCategoryIndex(nextIndex);
    }
  };


  useEffect(() => {
    const fetchNewsAndSavedState = async () => {
      try {
        const newsResponse = await axios.get(`${SERVER_URI}/news`);
        setNews2(newsResponse.data.news);

        // Get saved news from AsyncStorage
        const savedCartData = await AsyncStorage.getItem("cart");
        const savedItems = savedCartData ? JSON.parse(savedCartData) : [];
        const savedIds = savedItems.map((item: NewsType) => item._id); // Get saved news IDs
        setSavedNewsIds(savedIds);

        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchNewsAndSavedState();
  }, []);


  let [fontsLoaded] = useFonts({
    Raleway_700Bold,
    Nunito_600SemiBold,
    Raleway_600SemiBold,
    Nunito_500Medium,
  });

  if (!fontsLoaded) {
    return null;
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2467EC" />
      </View>
    );
  }


  const handleSave = async (item: NewsType) => {
    try {
      const existingCartData = await AsyncStorage.getItem("cart");
      const cartData = existingCartData ? JSON.parse(existingCartData) : [];
      const itemExists = cartData.some(
        (savedItem: any) => savedItem._id === item._id
      );

      let updatedCartData = [];
      let updatedSavedNewsIds = [];

      if (!itemExists) {
        // If item is not saved, add it to the cart
        updatedCartData = [...cartData, item];
        updatedSavedNewsIds = [...savedNewsIds, item._id];
      } else {
        // If item is already saved, remove it from the cart
        updatedCartData = cartData.filter(
          (savedItem: any) => savedItem._id !== item._id
        );
        updatedSavedNewsIds = savedNewsIds.filter(
          (id: string) => id !== item._id
        );
      }

      // Update AsyncStorage and local state
      await AsyncStorage.setItem("cart", JSON.stringify(updatedCartData));
      setSavedNewsIds(updatedSavedNewsIds);
    } catch (error) {
      console.error("Error saving item:", error);
    }
  };

  const extractVideoId = (url: string) => {
    const regex =
      /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const getThumbnailUrl = (item: NewsType) => {
    const videoId = extractVideoId(item.yt_url || "");
    return videoId
      ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      : item.featured_image ||
          "https://via.placeholder.com/300x200?text=No+Image";
  };

  const displayDate = (createdAt: string) => {
    const createdDate = new Date(createdAt);
    const now = new Date();
    const timeDiff = Math.floor(
      (now.getTime() - createdDate.getTime()) / 1000
    );

    const minutes = Math.floor(timeDiff / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 5) {
      return createdDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } else if (days >= 1) {
      return `${days} day${days > 1 ? "s" : ""} ago`;
    } else if (hours >= 1) {
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else if (minutes >= 1) {
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    }
    return "Just now";
  };

  const handleShare = async (item: NewsType) => {
    try {
      await Share.share({
        message: `Check out this news: ${item.title}\n\n`,
      });
    } catch (error) {
      console.error("Error sharing the news:", error);
    }
  };
  const handlePress = (item: any) => {
    const simplifiedItem = {
      id: item._id,
      title: item.title,
      content: item.content,
      featured_video: item.featured_video,
      yt_url: item.yt_url,
    };
    const serializedItem = encodeURIComponent(JSON.stringify(simplifiedItem));
    router.push(`/course-details?item=${serializedItem}`);
  };

  return (
    <View style={{ flex: 1, marginHorizontal: 16,marginTop:20 }}>
      {visibleCategories.map((category) => (
        <View key={category._id} style={{ marginBottom: 16 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <Text style={styles.cattext}>{category.name}</Text>
            <TouchableOpacity onPress={() => setSelectedCategory(category._id)}>
              <Text style={styles.viewallbtn}>View All</Text>
            </TouchableOpacity>
          </View>
          {newsByCategory[category._id]?.length > 0 ? (
            <FlatList
              data={newsByCategory[category._id]}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                style={styles.container2}
                onPress={() => handlePress(item)}
              >
                <View style={styles.contentWrapper}>
                  <View style={{ flex: 2 }}>
                    <Text style={styles.title}>{item.title}</Text>
                  </View>
                  <Image
                    // source={{ uri:  item.featured_image }}
                    source={{ uri: getThumbnailUrl(item) }}
                    style={styles.videoThumbnail}
                  />
                </View>
                <View style={styles.buttonsWrapper}>
                <Text style={styles.createdAt}>{displayDate(item.createdAt.toString())}</Text>
  
                  <View style={styles.buttons}>
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => handleSave(item)}
                    >
                      <FontAwesome
                        name="bookmark"
                        size={16}
                        color={savedNewsIds.includes(item._id) ? "red" : "#000"}
                      />
  
                      <Text style={styles.buttonText}> Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => handleShare(item)}
                    >
                      <FontAwesome name="share" size={16} color="#333" />
                      <Text style={styles.buttonText}> Share</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
              )}
             
            />
          ) : (
            <Text>No news available</Text>
          )}
        </View>
      ))}

      {loadingMore && (
        <View style={{ justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="small" color="#2467EC" />
        </View>
      )}

      {currentCategoryIndex + 1 < categories.length && (
        <TouchableOpacity
          onPress={loadMoreCategories}
          style={styles.loadMoreButton}
        >
          <Text style={styles.loadMoreText}>Load More</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cattext: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#A6121F",
  },
  viewallbtn: {
    fontSize: 15,
    color: "#fff",
    backgroundColor: "#2d2d2d",
    borderRadius: 5,
    padding: 2,
    paddingHorizontal: 10,
  },
  loadMoreButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  loadMoreText: {
    color: "red",
    fontSize: 16,
  },
  contentWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 16,
    textAlign: "left",
    fontFamily: "Raleway_600SemiBold",
  },
  buttonsWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  createdAt: {
    color: "#666",
    fontSize: 14,
  },
  buttons: {
    flexDirection: "row",
    alignItems: "center",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  buttonText: {
    color: "#333",
    fontSize: 14,
  },
  videoThumbnail: {
    width: wp(30),
    height: 90,
    resizeMode: "contain",
    marginLeft: 8,
    borderRadius: 10,
    marginTop: 10,
  },
  container2: {
    backgroundColor: "#FFFF",
    borderRadius: 12,
    padding: 8,
    marginVertical: 5,
  },
});

export default AllCourses;
