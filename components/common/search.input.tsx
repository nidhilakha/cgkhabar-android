import React, { useEffect, useState } from "react";
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
import { widthPercentageToDP } from "react-native-responsive-screen";
import NewsCard from "../cards/news.cards";

const SearchInput: React.FC<{ homeScreen?: boolean }> = ({ homeScreen }) => {
  const [value, setValue] = useState("");
  const [news, setNews] = useState<NewsType[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsType[]>([]);
  const [loading, setLoading] = useState(false);

  const [fontsLoaded] = useFonts({
    Nunito_700Bold,
  });

  // Fetch all news data
  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${SERVER_URI}/news`);
      const fetchedNews = response.data.news;
      setNews(fetchedNews);
      if (!homeScreen) {
        setFilteredNews(fetchedNews);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(); // Load all news data on mount
  }, []);

  useEffect(() => {
    if (homeScreen && value === "") {
      setFilteredNews([]); // Clear filtered news on home screen if search is empty
    } else if (value) {
      const filtered = news.filter((item) =>
        item.title.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredNews(filtered);
    } else if (!homeScreen) {
      setFilteredNews(news); // Show all news if search is empty
    }
  }, [value, news, homeScreen]);

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
        {loading ? (
          <ActivityIndicator size="small" color="#2467EC" />
        ) : (
          <FlatList
            data={filteredNews}
            keyExtractor={(item) => item._id}
            initialNumToRender={5}
            maxToRenderPerBatch={10}
            renderItem={homeScreen ? 
              ({ item }) => (
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
              ) : ({ item }) => <NewsCard item={item} />
            }
          />
        )}
        {!homeScreen && filteredNews.length === 0 && !loading && (
          <Text style={styles.noDataText}>No data found</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 70,
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
    marginBottom: 10,
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
});

export default SearchInput;
