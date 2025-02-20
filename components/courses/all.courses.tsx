import React, { useState, useEffect, useCallback } from "react";
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
import { router, useFocusEffect } from "expo-router";
// import CourseCard from "@/components/cards/course.card";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScrollView } from "react-native-gesture-handler";
import NewsCard from "@/components/cards/news.cards";

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
  refresh: boolean; // Accept `refresh` as a prop

}

const AllCourses = ({ setSelectedCategory,refresh }: AllCoursesProps) => {
  const [visibleCategories, setVisibleCategories] = useState<CategoryType[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [newsByCategory, setNewsByCategory] = useState<NewsByCategoryType>({});
  const [loading, setLoading] = useState(true);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [largeFontSize, setLargeFontSize] = useState('default'); // State for theme
  const [isNavigating, setIsNavigating] = useState(false); // New state to track navigation

  const [latestNews, setLatestNews] = useState<NewsType[]>([]); // New state for latest news
  const [page, setPage] = useState(1);
  // const [loadingMore, setLoadingMore] = useState(false);
  const pageSize = 3; // Number of items to fetch per page

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

  useEffect(() => {
    const fetchAllNews = async () => {
      try {
        const categoryResponse = await axios.get(`${SERVER_URI}/featured-news`, {
          withCredentials: true,
        });

        const data = categoryResponse.data;
        
        if (data.success) {
          // Fetch only the first 10 news items
          const topNews = data.news.slice(0, 10); 
          setLatestNews(topNews); // Set the latest news in the state
        } else {
          console.error("Failed to fetch news");
        }
        
      } catch (error) {
        console.error("Error fetching news", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllNews();
  }, [refresh]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Clear old cache
        await AsyncStorage.removeItem('categories');
        // Optional: Clear all previous news data
        // const keys = await AsyncStorage.getAllKeys();
        // await AsyncStorage.multiRemove(keys);

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
  }, [refresh]);

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

  const stopLoadingData = () => {
    setLoadingMore(false);
  };
  return (
    <View style={{ flex: 1}}>
       <View style={{ marginBottom: 20 }}>
       <FlatList
  data={latestNews}
  keyExtractor={(item) => item._id}
  renderItem={({ item }) => <NewsCard item={item} />}
  initialNumToRender={3}
  maxToRenderPerBatch={3}
  windowSize={10}
  removeClippedSubviews={true} // Improve performance on large lists
/>

       
      </View>

      {visibleCategories.map((category) =>
  newsByCategory[category._id] && ( // Check if there is news for the category
    <View key={category._id} style={{ marginBottom: 16 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <Text style={[styles.cattext, { fontSize: largeFontSize === 'large' ? 24 : 20 }]}>{category.name}</Text>
        <TouchableOpacity onPress={() => setSelectedCategory(category._id)}>
          <Text style={[styles.viewallbtn, { fontSize: largeFontSize === 'large' ? 19 : 15 }]}>View All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={newsByCategory[category._id]}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              stopLoadingData(); // Stop loading more categories on card press
            }}
          >
            <NewsCard item={item} />
          </TouchableOpacity>
        )}
        onEndReached={loadMoreCategories}
        onEndReachedThreshold={0.9}
      />
    </View>
  )
)}

      {/* {loadingMore && (
        <View style={{ justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="small" color="#2467EC" />
        </View>
      )} */}

      {/* {currentCategoryIndex + 1 < categories.length && (
        <TouchableOpacity
          onPress={loadMoreCategories}
          style={styles.loadMoreButton}
        >
          <Text style={styles.loadMoreText}>Load More</Text>
        </TouchableOpacity>
      )} */}
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
