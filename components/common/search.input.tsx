import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Text,
  ActivityIndicator,
} from "react-native";
import { useFonts, Nunito_700Bold } from "@expo-google-fonts/nunito";
import { AntDesign } from "@expo/vector-icons";
import axios from "axios";
import { SERVER_URI } from "@/utils/uri";
import { router } from "expo-router";
import CourseCard from "../cards/course.card";
import { widthPercentageToDP } from "react-native-responsive-screen";

const SearchInput: React.FC<{ homeScreen?: boolean }> = ({ homeScreen }) => {
  const [value, setValue] = useState("");
  const [news, setNews] = useState<NewsType[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsType[]>([]);
  const [currentPage, setCurrentPage] = useState(1); // To track page for lazy loading
  const [loading, setLoading] = useState(false); // To show loading indicator

  const pageSize = 2; // Number of news items to fetch at a time
  
  const [fontsLoaded] = useFonts({
    Nunito_700Bold,
  });

  // Fetch initial data and load more as needed
  const fetchNews = async (page: number) => {
    try {
      setLoading(true);
      const response = await axios.get(`${SERVER_URI}/news`, {
        params: { page, limit: pageSize },
      });
      const newNews = response.data.news;

      setNews((prevNews) => [...prevNews, ...newNews]); // Append new data
      if (!homeScreen) {
        setFilteredNews((prevNews) => [...prevNews, ...newNews]);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(currentPage); // Load first page of data on mount
  }, [homeScreen]);

  useEffect(() => {
    if (homeScreen && value === "") {
      setFilteredNews([]);
    } else if (value) {
      const filtered = news.filter((item) =>
        item.title.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredNews(filtered);
    } else if (!homeScreen) {
      setFilteredNews(news);
    }
  }, [value, news, homeScreen]);

  const loadMoreNews = () => {
    setCurrentPage((prevPage) => prevPage + 1);
    fetchNews(currentPage + 1);
  };

  const renderCourseItem = useCallback(
    ({ item }: { item: NewsType }) => (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() =>
          router.push({
            pathname: "/(routes)/course-details",
            params: { item: JSON.stringify(item) },
          })
        }
      >
        <Text style={styles.itemText}>{item.title}</Text>
      </TouchableOpacity>
    ),
    []
  );

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.filteringContainer}>
        <View style={styles.searchContainer}>
          <TextInput
            style={[styles.input, { fontFamily: "Nunito_700Bold" }]}
            placeholder="Search"
            value={value}
            onChangeText={setValue}
            placeholderTextColor={"#C67cc"}
          />
          <TouchableOpacity
            style={styles.searchIconContainer}
            onPress={() => router.push("/(tabs)/search")}
          >
            <AntDesign name="search1" size={20} color={"#fff"} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.listContainer}>
        <FlatList
          data={filteredNews}
          keyExtractor={(item) => item._id}
          renderItem={homeScreen ? renderCourseItem : ({ item }) => <CourseCard item={item} />}
        />
        {!homeScreen && filteredNews.length === 0 && (
          <Text style={styles.noDataText}>Loading...</Text>
        )}
        {loading && (
          <ActivityIndicator size="small" color="#2467EC" />
        )}
      </View>

      {/* Load More Button */}
      {/* {!loading && filteredNews.length > 0 && (
        <TouchableOpacity style={styles.loadMoreButton} onPress={loadMoreNews}>
          <Text style={styles.loadMoreText}>Load More</Text>
        </TouchableOpacity>
      )} */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom:70
  },
  filteringContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom:10
  },
  searchIconContainer: {
    width: 36,
    height: 36,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "black",
    paddingVertical: 2,
    width: widthPercentageToDP("75%"),
    height: 48,
  },
  listContainer: {
    paddingHorizontal: 10,
  },
  itemContainer: {
    backgroundColor: "#fff",
    padding: 10,
    width: widthPercentageToDP("90%"),
    marginLeft: "1.5%",
    flexDirection: "row",
  },
  itemText: {
    fontSize: 14,
    paddingLeft: 10,
    width: widthPercentageToDP("75%"),
  },
  noDataText: {
    textAlign: "center",
    paddingTop: 50,
    fontSize: 20,
    fontWeight: "600",
  },
  loadMoreButton: {
    backgroundColor: "#2467EC",
    padding: 10,
    margin: 10,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  loadMoreText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default SearchInput;
