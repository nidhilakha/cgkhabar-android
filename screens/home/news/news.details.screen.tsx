import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Share,
  StyleSheet,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React, {
  useLayoutEffect,
  useState,
  useEffect,
  useCallback,
} from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import YoutubePlayer from "react-native-youtube-iframe";
import Loader from "../../../components/loader/loader";
import { SERVER_URI } from "../../../utils/uri";
import RenderHtml from "react-native-render-html";
import { useWindowDimensions } from "react-native";

// Utility function to extract YouTube video ID
const extractVideoId = (url: string) => {
  const regex =
    /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

export default function NewsDetailScreen() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { item } = useLocalSearchParams();
  const navigation = useNavigation();
  const [isSaved, setIsSaved] = useState(false); // State to track if news is saved
  const { width } = useWindowDimensions();

  const newsItem = JSON.parse(item as string);

  const videoUri = `${SERVER_URI}/videos/${newsItem.featured_video}`;

  const videoId = extractVideoId(newsItem.yt_url);
  const [playing, setPlaying] = useState(false);
  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const timeDiff = Math.floor((now.getTime() - date.getTime()) / 1000); // in seconds

    const minutes = Math.floor(timeDiff / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 5) {
      return date.toLocaleDateString("en-US", {
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
    } else {
      return "Just now";
    }
  };

  const createdAt = new Date(newsItem.createdAt);
  const displayDate = getRelativeTime(createdAt);

  const onStateChange = useCallback((state: any) => {
    if (state === "ended") {
      setPlaying(false);
    }
  }, []);

  useEffect(() => {
    const checkIfSaved = async () => {
      const existingCartData = await AsyncStorage.getItem("cart");
      const cartData = existingCartData ? JSON.parse(existingCartData) : [];
      const itemExists = cartData.some(
        (item: any) => item._id === newsItem._id
      );
      setIsSaved(itemExists);
    };

    checkIfSaved();
  }, [newsItem._id]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "News Details",
      headerBackTitleVisible: false, // Hides the back title
      headerLeft: () => null, // This removes the back arrow button
      headerRight: () => (
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity
            onPress={handleAddToCart}
            style={{ marginRight: 10 }}
          >
            {isSaved ? (
              <FontAwesome name="bookmark" size={26} color="white" />
            ) : (
              <Feather name="bookmark" size={26} color="white" />
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare}>
            <Feather name="share-2" size={26} color="white" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, isSaved]);

  const handleAddToCart = async () => {
    const existingCartData = await AsyncStorage.getItem("cart");
    const cartData = existingCartData ? JSON.parse(existingCartData) : [];
    const itemExists = cartData.some((item: any) => item._id === newsItem._id);

    if (!itemExists) {
      cartData.push(newsItem);
      await AsyncStorage.setItem("cart", JSON.stringify(cartData));
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this news: ${newsItem.title}\n\n${newsItem.content}`,
      });
    } catch (error) {
      console.error("Error sharing the news:", error);
    }
  };

  return (
    <>
      {!newsItem ? (
        <Loader />
      ) : (
        <LinearGradient
          colors={["#F2F2F2", "#e3e3e3"]}
          style={{ flex: 1, paddingTop: 15 }}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ marginHorizontal: 16 }}>
              <Text
                style={{
                  marginTop: 5,
                  fontSize: 20,
                  fontWeight: "700",
                  fontFamily: "Raleway_700Bold",
                  marginBottom: 20,
                  backgroundColor: "white",
                  padding: 5,
                  paddingHorizontal: 10,
                  borderRadius: 5,
                  color: "#A6121F",
                }}
              >
                {newsItem.title}
              </Text>

              {videoId && newsItem.yt_url ? (
                <View style={styles.playerContainer}>
                  <YoutubePlayer
                    height={200}
                    videoId={videoId}
                    play={playing}
                    onChangeState={onStateChange}
                  />
                </View>
              ) : (
                <View style={styles.playerContainer}>
                  <Image
                    source={{ uri: newsItem.featured_image }}
                    style={{ width: width, height: 200 }} // Adjust as needed
                    resizeMode="cover"
                  />
                </View>
              )}

              {/* {videoId && (
                <View style={styles.playerContainer}>
                <YoutubePlayer
                  height={200}
                  videoId={videoId}
                  play={playing}
                  onChangeState={onStateChange}
                />
              </View>
              )} */}
              <View
                style={{
                  marginTop: 10,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: "white",
                    backgroundColor: "#D96C75",
                    padding: 2,
                    borderRadius: 5,
                    paddingHorizontal: 5,
                  }}
                >
                 {newsItem.author
    ? newsItem.author.charAt(0).toUpperCase() + newsItem.author.slice(1)
    : "Unknown Author"}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: "white",
                    backgroundColor: "#D96C75",
                    padding: 2,
                    borderRadius: 5,
                    paddingHorizontal: 5,
                  }}
                >
                  {displayDate}
                </Text>
              </View>
              {/* Render HTML content, including base64 images */}
              <View
                style={{
                  marginHorizontal: 2,
                  backgroundColor: "white",
                  paddingHorizontal: 10,
                  borderRadius: 10,
                  marginVertical: 20,
                }}
              >
                <RenderHtml
                  contentWidth={width - 32} // Subtracting the margin from the width
                  source={{ html: newsItem.content }}
                />
              </View>

              {newsItem.content.length > 300 && (
                <TouchableOpacity
                  style={{
                    marginTop: 5,
                    alignItems: "center",
                    marginBottom: 50,
                  }}
                  onPress={() => setIsExpanded(!isExpanded)}
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
                    {isExpanded ? "Show Less" : "Show More"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </LinearGradient>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  playerContainer: {
    borderRadius: 10, // Adjust the radius as needed
    overflow: "hidden", // Ensures the border radius is applied to the content
    elevation: 5, // Optional: adds shadow on Android
    shadowColor: "#000", // Optional: shadow color for iOS
    shadowOffset: { width: 0, height: 2 }, // Optional: shadow offset
    shadowOpacity: 0.3, // Optional: shadow opacity
    shadowRadius: 4, // Optional: shadow radius
    height:180,
  },
});
