import { View, Text, ScrollView, Image, TouchableOpacity,Share } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { htmlToText } from "html-to-text";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React, { useLayoutEffect, useState,useEffect } from "react";

import {
  useFonts,
  Raleway_600SemiBold,
  Raleway_700Bold,
} from "@expo-google-fonts/raleway";
import {
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_700Bold,
  Nunito_600SemiBold,
} from "@expo-google-fonts/nunito";
import Loader from "@/components/loader/loader";
import { Video } from "expo-av";
import { ResizeMode } from "expo-av";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import axios from "axios";
import { SERVER_URI } from "@/utils/uri";

export default function NewsDetailScreen() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { item } = useLocalSearchParams();
  const navigation = useNavigation();
  const [isSaved, setIsSaved] = useState(false); // State to track if news is saved

  const [newsItem, setNewsItem] = useState<NewsType | null>(null);
  const _id: NewsType = JSON.parse(item as string);

 
  // const [newsItem, setNewsItem] = useState(null);
  // const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchNewsItem = async () => {
      if (!_id) {
        console.warn('No ID provided');
        return;
      }

      try {
        const response = await axios.get(`${SERVER_URI}/news/${_id}`, { withCredentials: true });
        console.log('Fetched news item:', response.data);
        setNewsItem(response.data);

      } catch (error) {
        console.error('Error fetching news item:', error);
      }
    };

    fetchNewsItem();
  }, [_id]);

  let [fontsLoaded, fontError] = useFonts({
    Raleway_600SemiBold,
    Raleway_700Bold,
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_700Bold,
    Nunito_600SemiBold,
  });
 
  useEffect(() => {
    if (!newsItem) return; // Guard clause

    const checkIfSaved = async () => {
      const existingCartData = await AsyncStorage.getItem("cart");
      const cartData = existingCartData ? JSON.parse(existingCartData) : [];
      const itemExists = cartData.some((item: any) => item._id === newsItem._id);
      setIsSaved(itemExists);
    };

    checkIfSaved();
  }, [newsItem?._id]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "News Details",
      headerBackTitle: "Back",
      headerRight: () => (
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity onPress={handleAddToCart} style={{ marginRight: 10 }}>
            {isSaved ? (
              <FontAwesome name="bookmark" size={26} color="red" />
            ) : (
              <Feather name="bookmark" size={26} color="black" />
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare}>
            <Feather name="share-2" size={26} color="black" />
          </TouchableOpacity>
        </View>
        
      ),
    });
  }, [navigation, isSaved]);

  const handleAddToCart = async () => {
    if (!newsItem) return; // Guard clause

    const existingCartData = await AsyncStorage.getItem("cart");
    const cartData = existingCartData ? JSON.parse(existingCartData) : [];
    const itemExists = cartData.some((item: any) => item._id === newsItem._id);

    if (!itemExists) {
      cartData.push(newsItem);
      await AsyncStorage.setItem("cart", JSON.stringify(cartData));
    }
    router.push("/(routes)/cart");
  };
  // console.log("Video URI:", newsItem.featured_video);
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this news: ${newsItem?.title}\n\n${newsItem?.content}`,
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
          colors={["#E5ECF9", "#F6F7F9"]}
          style={{ flex: 1, paddingTop: 15 }}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ marginHorizontal: 16 }}>
              {newsItem.featured_video ? (
                <Video
                  source={{ uri: newsItem.featured_video || "fallback-video-url"}}
                  style={{
                    width: wp(86),
                    height: 220,
                    borderRadius: 5,
                    alignSelf: "center",
                  }}
                  useNativeControls
                  resizeMode={ResizeMode.CONTAIN}
                  shouldPlay
                />
              ) : (
                <Image
                  style={{
                    width: wp(86),
                    height: 220,
                    borderRadius: 5,
                    alignSelf: "center",
                    resizeMode: "cover",
                  }}
                  source={{ uri: newsItem.featured_image || "default-image-url" }}
                />
              )}
              <Text
                style={{
                  marginTop: 15,
                  fontSize: 24,
                  fontWeight: "700",
                  fontFamily: "Raleway_700Bold",
                }}
              >
                {newsItem.title}
              </Text>
              <Text
                style={{
                  color: "#525258",
                  fontSize: 16,
                  marginTop: 10,
                  textAlign: "justify",
                  fontFamily: "Nunito_500Medium",
                }}
              >
                {isExpanded
                  ? htmlToText(newsItem.content)
                  : htmlToText(newsItem.content).slice(0, 300) + "..."}
              </Text>
              {newsItem.content?.length > 300 && (
                <TouchableOpacity
                  style={{ marginTop: 5 }}
                  onPress={() => setIsExpanded(!isExpanded)}
                >
                  <Text
                    style={{
                      color: "#2467EC",
                      fontSize: 14,
                    }}
                  >
                    {isExpanded ? "Show Less" : "Show More"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={{ marginHorizontal: 16, marginTop: 20 }}>
              {/* Comments section can be uncommented and implemented if needed */}
              {/* {newsItem.comments.map((comment, index) => (
                <View key={index} style={{ marginTop: 15 }}>
                  <Text
                    style={{
                      fontWeight: "600",
                      fontFamily: "Nunito_600SemiBold",
                    }}
                  >
                    {comment.user.name || "Anonymous"}
                  </Text>
                  <Text
                    style={{
                      marginTop: 5,
                      color: "#525258",
                      fontFamily: "Nunito_400Regular",
                    }}
                  >
                    {comment.content}
                  </Text>
                  {comment.replies &&
                    comment.replies.length > 0 &&
                    comment.replies.map((reply, replyIndex) => (
                      <View
                        key={replyIndex}
                        style={{ marginTop: 10, paddingLeft: 20 }}
                      >
                        <Text
                          style={{
                            fontWeight: "600",
                            fontFamily: "Nunito_600SemiBold",
                          }}
                        >
                          {reply.user.name || "Anonymous"}
                        </Text>
                        <Text
                          style={{
                            marginTop: 5,
                            color: "#525258",
                            fontFamily: "Nunito_400Regular",
                          }}
                        >
                          {reply.content}
                        </Text>
                      </View>
                    ))}
                </View>
              ))} */}
            </View>
          </ScrollView>
        </LinearGradient>
      )}
    </>
  );
}
