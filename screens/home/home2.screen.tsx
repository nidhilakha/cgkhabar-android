import React, { useCallback, useEffect, useState, Suspense } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  Button,
  TouchableOpacity,
  Share,
} from "react-native";
import { router, useNavigation } from "expo-router";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";

import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import Header from "@/components/header/header";
import FontAwesome from "@expo/vector-icons/FontAwesome";

import CategoryHeader from "@/components/header/categoryHeader";
import HomeBannerSlider from "@/components/home/home.banner.slider";
import CourseCard from "@/components/cards/course.card";
import Loader from "@/components/loader/loader";
import { SERVER_URI } from "@/utils/uri";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AllCourses = React.lazy(() => import("@/components/courses/all.courses"));

const { width } = Dimensions.get("window");

const HomeScreen = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [news, setNews] = useState<NewsType[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleNewsCount, setVisibleNewsCount] = useState(5); // Number of news items to display
  const [savedNewsIds, setSavedNewsIds] = useState<string[]>([]); // To track saved news IDs
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  useEffect(() => {
    const fetchCategoriesAndNews = async () => {
      try {
        const categoryResponse = await axios.get(`${SERVER_URI}/categories`);
        const fetchedCategories = [
          { _id: "All", name: "All" },
          ...categoryResponse.data.categories,
        ];
        setCategories(fetchedCategories);

        const newsResponse = await axios.get(`${SERVER_URI}/news`);
        setNews(newsResponse.data.news);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchCategoriesAndNews();
  }, []);

  useEffect(() => {
    const fetchNewsAndSavedState = async () => {
      try {
        const newsResponse = await axios.get(`${SERVER_URI}/news`);
        setNews(newsResponse.data.news);

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

  const handleScrollEnd = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const categoryWidth = width; // Assuming each category has the full screen width
    const index = Math.floor(contentOffsetX / categoryWidth);

    if (categories.length > 0 && index >= 0 && index < categories.length) {
      const selectedCategory = categories[index]._id;
      setActiveCategory(selectedCategory);
      setVisibleNewsCount(5); // Reset visible news count when category changes
    }
  };

  const loadMoreNews = () => {
    setVisibleNewsCount((prevCount) => prevCount + 5); // Increment visible news count
  };

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

  const renderContent = () => {
    if (loading) {
      return <Loader />;
    }

    if (news.length === 0) {
      return (
        <View style={styles.noNewsContainer}>
          <Text style={styles.noNewsText}>No news available</Text>
        </View>
      );
    }

    const filteredNews =
      activeCategory === "All"
        ? news
        : news.filter(
            (item) => item.category && item.category._id === activeCategory
          );

    const displayedNews = filteredNews.slice(0, visibleNewsCount); // Slice the news array based on the visible count

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

    const handlePress = (item: NewsType) => {
      const simplifiedItem = {
        id: item._id,
        title: item.title,
        content: item.content,
        featured_image: item.featured_image,
        yt_url: item.yt_url,
        author: item.author,
        createdAt: item.createdAt,
      };
      const serializedItem = encodeURIComponent(JSON.stringify(simplifiedItem));
      router.push(`/course-details?item=${serializedItem}`);
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

    return (
      <View>
        <FlatList
          data={displayedNews}
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
          contentContainerStyle={{ paddingBottom: 60, marginHorizontal: 15 }}
        />

        {visibleNewsCount < filteredNews.length && (
          <TouchableOpacity
            style={{
              marginTop: 5,
              alignItems: "center",
              marginBottom: 50,
            }}
            onPress={loadMoreNews}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 15,
                backgroundColor: "#A6121F",
                width: "30%",
                paddingHorizontal: 8,
                alignContent: "center",
                borderRadius: 5,
                padding: 2,
              }}
            >
              Show More
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <LinearGradient colors={["#F2F2F2", "#e3e3e3"]} style={styles.container}>
      <Header />
      <CategoryHeader
        categories={categories}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
      >
        {categories.map((category) => (
          <ScrollView key={category._id} style={{ width }}>
            {activeCategory === "All" ? (
              <>
                <HomeBannerSlider />
                <Suspense fallback={<Loader />}>
                  <AllCourses
                    news={news}
                    setSelectedCategory={setActiveCategory}
                  />
                </Suspense>
              </>
            ) : (
              renderContent()
            )}
          </ScrollView>
        ))}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
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
});

export default HomeScreen;


