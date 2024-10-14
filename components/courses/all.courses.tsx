import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
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

// Define the type for the category
interface CategoryType {
  _id: string;
  name: string;
}

// Define the type for newsByCategory
interface NewsByCategoryType {
  [key: string]: NewsType[]; // Maps category ID to an array of news items
}

interface AllCoursesProps {
  setSelectedCategory: (category: string) => void;
}

const AllCourses = ({ setSelectedCategory }: AllCoursesProps) => {
  const [visibleCategories, setVisibleCategories] = useState<CategoryType[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [newsByCategory, setNewsByCategory] = useState<NewsByCategoryType>({});
  const [loading, setLoading] = useState(true);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Clear old cache
        await AsyncStorage.removeItem('categories');
        // Optional: Clear all previous news data
        const keys = await AsyncStorage.getAllKeys();
        await AsyncStorage.multiRemove(keys);

        // Fetch fresh categories
        const categoryResponse = await axios.get(`${SERVER_URI}/categories`, {
          withCredentials: true,
        });
        const categoriesData = categoryResponse.data.categories;
        setCategories(categoriesData);
        setVisibleCategories([categoriesData[0]]); // Show the first category initially

        // Load news for the first category
        if (categoriesData.length > 0) {
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
      // Fetch latest news from the server
      const newsResponse = await axios.get(
        `${SERVER_URI}/news/latest/${categoryId}`,
        { withCredentials: true }
      );

      // Filter out deleted items and update the cache
      const newsData = newsResponse.data.latestNews.filter((news: NewsType) => !news.deleted);
      setNewsByCategory((prev) => ({
        ...prev,
        [categoryId]: newsData,
      }));

      // Store the fresh news data in AsyncStorage
      await AsyncStorage.setItem(`news_${categoryId}`, JSON.stringify(newsData));
    } catch (error) {
      console.error(`Error fetching news for category ${categoryId}:`, error);
    }
  };

  const loadMoreCategories = () => {
    if (currentCategoryIndex + 1 < categories.length) {
      const nextIndex = currentCategoryIndex + 1;
      const nextCategory = categories[nextIndex];
      setVisibleCategories((prev) => [...prev, nextCategory]);
      // Load news for the next category only if not already cached
      if (!newsByCategory[nextCategory._id]) {
        loadNewsForCategory(nextCategory._id);
      }
      setCurrentCategoryIndex(nextIndex);
    }
  };

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

  const handlePress = (item: NewsType) => {
    const serializedItem = encodeURIComponent(JSON.stringify(item));
    router.push(`/course-details?item=${serializedItem}`);
  };

  return (
    <View style={{ flex: 1, marginHorizontal: 16, marginTop: 20 }}>
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
                <TouchableOpacity onPress={() => handlePress(item)}>
                  <CourseCard item={item} />
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
});

export default AllCourses;
