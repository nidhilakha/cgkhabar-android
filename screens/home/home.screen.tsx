import React, { useCallback, useEffect, useState, Suspense, useContext, useRef } from "react";
import {
View,
Text,
  StyleSheet,
  Dimensions,
  FlatList,
  RefreshControl,
  ActivityIndicator,

} from "react-native";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import Header from "@/components/header/header";
import CategoryHeader from "@/components/header/categoryHeader";
import HomeBannerSlider from "@/components/home/home.banner.slider";
import Loader from "@/components/loader/loader";
import { SERVER_URI } from "@/utils/uri";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FrontScreen from "@/screens/auth/Front/Front.screen";
import NewsCard from "@/components/cards/news.cards";
import { BannerDataTypes } from "@/components/home/home.banner.slider"; // Import the BannerDataTypes interface
import { useFocusEffect } from "expo-router";
import AllCourses from "@/components/courses/all.courses";


// const AllCourses = React.lazy(() => import("@/components/courses/all.courses"));

// Define your tab navigation type if you have a tab navigator
type RootTabParamList = {
  Home: undefined;
};

const { width, height } = Dimensions.get("window");

const HomeScreen = () => {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [news, setNews] = useState<NewsType[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState("light");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [bannerData, setBannerData] = useState<BannerDataTypes[]>([]);
  const [largeFontSize, setLargeFontSize] = useState('default'); // State for theme
  const [isContentLoading, setIsContentLoading] = useState(true); // New state for loading

  const newsCache = useRef<Record<string, NewsType[]>>({});
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
  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoryResponse = await axios.get(`${SERVER_URI}/categories`);
        const fetchedCategories = [
          { _id: "All", name: "🏠︎ होम" },
          ...categoryResponse.data.categories,
        ];
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch banner data when activeCategory is "All"
  useEffect(() => {
    const fetchBannerData = async () => {
      try {
        const response = await axios.post(`${SERVER_URI}/news/banner`, {}, {
          withCredentials: true,
        });
        const data = response.data;
        const dataWithTimestamp = { ...data, timestamp: Date.now() }; // Add timestamp here
        await AsyncStorage.setItem("bannerData", JSON.stringify(dataWithTimestamp));
        setBannerData(data.news); // Update state
      } catch (error) {
        console.error("Error in fetchBannerData:", error);
        setBannerData([]); // Return an empty array on error
      }finally {
        setIsContentLoading(false); // Update content loading state after banners are fetched
      }
    };

    if (activeCategory === "All") {
      fetchBannerData(); // Fetch banner data when active category is "All"
    }
  }, [activeCategory]);

  // Fetch news based on active category and page

  const fetchNewsForCategory = async (categoryId: string, page: number) => {
    setLoading(true);
    try {
      const size = 3;
      const url =
        categoryId === "All"
          ? `${SERVER_URI}news?page=${page}&size=${size}`
          : `${SERVER_URI}news/categories/${categoryId}?page=${page}&size=${size}`;

      const newsResponse = await axios.get(url);
      const newsData =
        categoryId === "All"
          ? newsResponse.data.news
          : newsResponse.data.latestNews;

      if (newsData.length < size) {
        setHasMore(false);
      }

      setNews((prevNews) => {
        const existingIds = new Set(prevNews.map((n) => n._id));
        const newItems = newsData.filter((n: any) => !existingIds.has(n._id));
        return [...prevNews, ...newItems];
      });

      newsCache.current[categoryId] = newsData;
    } catch (error) {
      console.error("Error fetching news for category:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeCategory === "All") {
      setNews([]); // Clear news for "All"
      setLoading(false); // Stop loading indicator for "All"
      setHasMore(false); // No "load more" behavior for "All"
      return; // Skip fetching news for "All"
    }



    fetchNewsForCategory(activeCategory, page);
  }, [activeCategory, page]);

const handleRefresh = async () => {
  setLoading(true); // Show the loading indicator
  setNews([]); // Clear the news state
  setPage(1); // Reset to the first page
  setHasMore(true); // Enable load more
  await fetchNewsForCategory(activeCategory, 1); // Fetch the first page of data
  setLoading(false); // Hide the loading indicator
};

  

  const handleLoadMore = () => {
    if (hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setNews([]); // Reset news when category changes
    setPage(1); // Reset page to 1
    setHasMore(true); // Enable load more
  };

  console.log("Loading state:", loading);

 
  const renderLoadingScreen = () => (
    <FrontScreen/>
  );

  return isContentLoading?(
    renderLoadingScreen()
  ):(
    <LinearGradient
      colors={theme === "dark" ? ["#0C0C0C", "#0C0C0C"] : ["#F2F2F2", "#e3e3e3"]}
      style={{ flex: 1, paddingTop: 50 }}
    >
     
          <Header />
          <CategoryHeader
            categories={categories}
            activeCategory={activeCategory}
            setActiveCategory={handleCategoryChange}
          />
          <FlatList
            data={news}
            renderItem={({ item }) => <NewsCard item={item} />}
            keyExtractor={(item) => item._id.toString()}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            initialNumToRender={5}
            maxToRenderPerBatch={10}
            refreshing={loading}
            onRefresh={handleRefresh}
            windowSize={10}
            style={{ marginHorizontal: 15 }}
            ListHeaderComponent={
              <>
                {activeCategory === "All" && bannerData.length > 0 && (
                  <HomeBannerSlider data={bannerData} />
                )}
                {activeCategory === "All" && (
                  <AllCourses
                    setSelectedCategory={setActiveCategory}
                    refresh={false}
                  />
                )}
              </>
            }
          />
      
    </LinearGradient>
  );
};






const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  lightContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  darkContainer: {
    flex: 1,
    backgroundColor: "#2d3a4e",
  },
  container: {
    flex: 1,
    paddingTop: 50,
  },
  container2: {
    backgroundColor: "#FFFF",
    borderRadius: 12,
    padding: 8,
    marginVertical: 5,
  },
  container3: {
    backgroundColor: "#272829",
    borderRadius: 12,
    padding: 8,
    marginVertical: 5,
  },
  noNewsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noNewsText: {
    fontSize: 18,
    color: "#555",
  },
 
});

export default HomeScreen;
