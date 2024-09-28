import React, { Suspense, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
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
import CourseCard from "@/components/cards/course.card";

interface CategoryType {
  _id: string;
  name: string;
}

interface AllCoursesProps {
  setSelectedCategory: (category: string) => void;
}

const AllCourses = ({ setSelectedCategory }: AllCoursesProps) => {
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [newsByCategory, setNewsByCategory] = useState<{ [key: string]: NewsType[] }>({});
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [visibleCategories, setVisibleCategories] = useState<CategoryType[]>([]);

  useEffect(() => {
    const fetchInitialCategoryAndNews = async () => {
      try {
        const categoryResponse = await axios.get(`${SERVER_URI}/categories`, { withCredentials: true });
        const categoriesData = categoryResponse.data.categories;
        console.log("category data",categoriesData);

        setCategories(categoriesData);

        if (categoriesData.length > 0) {
          const firstCategory = categoriesData[0];
          const newsResponse = await axios.get(`${SERVER_URI}/news/latest/${firstCategory._id}`, { withCredentials: true });
          const newsData = newsResponse.data.latestNews.slice(0, 5);
          console.log("news data",newsData);
          setNewsByCategory({ [firstCategory._id]: newsData });
          setVisibleCategories([firstCategory]);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching initial category and news:", error);
        setLoading(false);
      }
    };

    fetchInitialCategoryAndNews();
  }, []);

  const loadMoreCategories = async () => {
    if (loadingMore || visibleCategories.length >= categories.length) return;

    setLoadingMore(true);
    const nextCategory = categories[visibleCategories.length];

    try {
      const newsResponse = await axios.get(`${SERVER_URI}/news/latest/${nextCategory._id}`, { withCredentials: true });
      const newsData = newsResponse.data.latestNews.slice(0, 5);
      setNewsByCategory((prevNews) => ({ ...prevNews, [nextCategory._id]: newsData }));
      setVisibleCategories((prev) => [...prev, nextCategory]);
    } catch (error) {
      console.error(`Failed to fetch news for category ${nextCategory._id}:`, error);
    } finally {
      setLoadingMore(false);
    }
  };

  let [fontsLoaded, fontError] = useFonts({
    Raleway_700Bold,
    Nunito_600SemiBold,
    Raleway_600SemiBold,
    Nunito_500Medium,
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2467EC" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, marginHorizontal: 16 }}>
     {visibleCategories.map((category) => {
      return (
        <View key={category._id} style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <Text style={styles.cattext}>{category.name}</Text>
            <TouchableOpacity onPress={() => setSelectedCategory(category._id)}>
              <Text style={styles.viewallbtn}>View All</Text>
            </TouchableOpacity>
          </View>
          {newsByCategory[category._id]?.length > 0 ? (
            <FlatList
              data={newsByCategory[category._id]}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => {
                return <CourseCard item={item} />;
              }}
              onEndReached={loadMoreCategories}
              onEndReachedThreshold={0.5}
              ListEmptyComponent={<Text>No news available</Text>}
            />
          ) : (
            <Text>No news available</Text>
          )}
        </View>
      );
    })}


      {loadingMore && (
        <View style={{ justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="small" color="#2467EC" />
        </View>
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
});

export default AllCourses;
