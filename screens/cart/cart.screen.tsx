import { SERVER_URI } from "@/utils/uri";
import { Entypo, FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useStripe } from "@stripe/stripe-react-native";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { router, useNavigation } from "expo-router";
import { htmlToText } from "html-to-text";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import * as Speech from "expo-speech";
import { Audio } from "expo-av";
import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  StyleSheet,
  Dimensions,
  BackHandler,
} from "react-native";
import Header from "@/components/header/header";
import { useFocusEffect } from "expo-router";
import { AppState, AppStateStatus } from "react-native";
import { useAudio } from "@/components/Audio/AudioContext";

const { width, height } = Dimensions.get("window");

export default function CartScreen() {
  const navigation = useNavigation();
  const [currentAppState, setCurrentAppState] = useState(AppState.currentState);
  const [cartItems, setCartItems] = useState<NewsType[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [theme, setTheme] = useState("light");
  const { playAudio, pauseAudio, stopAudio, resumeAudio, isSpeaking, isPaused, currentNewsItem, cleanText } = useAudio();

  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem("theme");
        if (storedTheme) setTheme(storedTheme);
      } catch (error) {
        console.error("Error fetching theme:", error);
      }
    };
    fetchTheme();
  }, []);

  const [largeFontSize, setLargeFontSize] = useState("default");

  useEffect(() => {
    const fetchFont = async () => {
      try {
        const storedFont = await AsyncStorage.getItem("largeFontSize");
        if (storedFont) setLargeFontSize(storedFont);
      } catch (error) {
        console.error("Error fetching font:", error);
      }
    };
    fetchFont();
  }, []);

  useEffect(() => {
    const subscription = async () => {
      const cart: any = await AsyncStorage.getItem("cart");
      if (cart) setCartItems(JSON.parse(cart));
    };
    subscription();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    const cart: any = await AsyncStorage.getItem("cart");
    setCartItems(cart ? JSON.parse(cart) : []);
    setRefreshing(false);
  };

  const handleRemoveItem = async (item: any) => {
    const existingCartData = await AsyncStorage.getItem("cart");
    const cartData = existingCartData ? JSON.parse(existingCartData) : [];
    const updatedCartData = cartData.filter((i: any) => i._id !== item._id);
    await AsyncStorage.setItem("cart", JSON.stringify(updatedCartData));
    setCartItems(updatedCartData);
  };

  const getThumbnailUrl = (item: NewsType) => {
    const videoId = extractVideoId(item.yt_url || "");
    return videoId
      ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      : item.featured_image || "https://via.placeholder.com/300x200?text=No+Image";
  };

  const extractVideoId = (url: string) => {
    const regex =
      /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handlePress = (item: any) => {
    const simplifiedItem = {
      id: item._id,
      title: item.title,
      content: item.content,
      featured_image: item.featured_image,
      featured_audio: item.featured_audio,
      slug: item.slug,
      yt_url: item.yt_url,
      author: item.author,
      createdAt: item.createdAt,
      category: item.category._id,
    };
    const serializedItem = encodeURIComponent(JSON.stringify(simplifiedItem));
    router.push(`/course-details?item=${serializedItem}`);
  };

  // Define audio control functions with item parameter
  const handleSpeechStart = (item: any) => playAudio(item);
  const handlePause = () => pauseAudio();
  const handlePlay = (item: any) => {
    if (isPaused && currentNewsItem?._id === item._id) resumeAudio();
  };
  const handleStop = () => stopAudio();

  return (
    <LinearGradient
      colors={theme === "dark" ? ["#0C0C0C", "#0C0C0C"] : ["#F2F2F2", "#e3e3e3"]}
      style={{ flex: 1, paddingTop: 50 }}
    >
      <Header />
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={theme === "light" ? styles.container : styles.container2}
            onPress={() => handlePress(item)}
          >
            <View style={styles.contentWrapper}>
              <View style={{ flex: 2 }}>
                <Text
                  style={[
                    theme === "light" ? styles.title : styles.title2,
                    { fontSize: largeFontSize === "large" ? 24 : 20 },
                  ]}
                >
                  {item?.title}
                </Text>
              </View>
              <View style={{ position: "relative" }}>
                <Image
                  source={{ uri: getThumbnailUrl(item) }}
                  style={styles.videoThumbnail}
                  key={item._id || item.yt_url || item.featured_image || "default-key"}
                  resizeMode="cover"
                />
                {item.yt_url && (
                  <FontAwesome
                    name="youtube-play"
                    size={25}
                    color="red"
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: [{ translateX: -15 }, { translateY: -15 }],
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                      borderRadius: 50,
                      padding: 8,
                    }}
                  />
                )}
              </View>
            </View>
            <View style={styles.buttonsWrapper}>
              <View style={{ width: 110 }}>
                {item.featured_audio ? (
                  isSpeaking && currentNewsItem?._id === item._id ? (
                    isPaused ? (
                      <TouchableOpacity
                        onPress={() => handlePlay(item)}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                          paddingVertical: 2,
                          paddingHorizontal: 5,
                          borderWidth: 1.5,
                          borderColor: "#9E9E9E",
                          borderRadius: 20,
                        }}
                      >
                        <View
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: 20,
                            justifyContent: "center",
                            alignItems: "center",
                            borderWidth: 1,
                            borderColor: "#BF0000",
                            marginRight: 8,
                            backgroundColor: "#BF0000",
                          }}
                        >
                          <FontAwesome name="play" size={12} color="#fff" />
                        </View>
                        <Text style={{ fontSize: 14, color: theme === "light" ? "#333" : "#9E9E9E" }}>
                          ऑडियो चलाएं
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={handlePause}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                          paddingVertical: 2,
                          paddingHorizontal: 5,
                          borderWidth: 1.5,
                          borderColor: "#9E9E9E",
                          borderRadius: 20,
                        }}
                      >
                        <View
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: 20,
                            justifyContent: "center",
                            alignItems: "center",
                            borderWidth: 1,
                            borderColor: "#BF0000",
                            marginRight: 8,
                            backgroundColor: "#BF0000",
                          }}
                        >
                          <FontAwesome name="pause" size={12} color="#fff" />
                        </View>
                        <Text style={{ fontSize: 14, color: theme === "light" ? "#333" : "#9E9E9E" }}>
                          ऑडियो रोकें
                        </Text>
                      </TouchableOpacity>
                    )
                  ) : (
                    <TouchableOpacity
                      onPress={() => handleSpeechStart(item)}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        paddingVertical: 2,
                        paddingHorizontal: 5,
                        borderWidth: 1.5,
                        borderColor: "#9E9E9E",
                        borderRadius: 20,
                      }}
                    >
                      <View
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 20,
                          justifyContent: "center",
                          alignItems: "center",
                          borderWidth: 1,
                          borderColor: "#BF0000",
                          marginRight: 8,
                          backgroundColor: "#BF0000",
                        }}
                      >
                        <FontAwesome name="volume-up" size={12} color="#fff" />
                      </View>
                      <Text style={{ fontSize: 14, color: theme === "light" ? "#333" : "#9E9E9E" }}>
                        ऑडियो सुनें
                      </Text>
                    </TouchableOpacity>
                  )
                ) : (
                  <View />
                )}
              </View>
              <View style={styles.buttons}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handleRemoveItem(item)}
                >
                  <FontAwesome name="bookmark" size={16} color="red" />
                  <Text style={theme === "light" ? styles.buttonText : styles.buttonText2}>
                    सेव
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button}>
                  <FontAwesome name="share" size={16} color={theme === "dark" ? "#9E9E9E" : "#333"} />
                  <Text style={theme === "light" ? styles.buttonText : styles.buttonText2}>
                    शेयर
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
            }}
          >
            <Text
              style={{
                fontSize: 24,
                marginTop: 20,
                color: "#333",
              }}
            >
              No News Saved!
            </Text>
          </View>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFF",
    marginHorizontal: 15,
    borderRadius: 12,
    padding: 8,
    marginVertical: 15,
  },
  container2: {
    backgroundColor: "#272829",
    marginHorizontal: 15,
    borderRadius: 12,
    padding: 8,
    marginVertical: 15,
  },
  contentWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    textAlign: "left",
  },
  title2: {
    textAlign: "left",
    color: "#fff",
  },
  content: {
    fontSize: 14,
    textAlign: "left",
    marginTop: 10,
    fontFamily: "Nunito_400Regular",
    color: "#666",
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 5,
    resizeMode: "cover",
    marginLeft: 10,
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
  createdAt2: {
    color: "#9E9E9E",
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
  buttonText2: {
    color: "#9E9E9E",
    fontSize: 14,
  },
  likesWrapper: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
    borderRadius: 5,
    paddingHorizontal: 10,
    height: 28,
  },
  likesText: {
    color: "#333",
    fontSize: 14,
    marginLeft: 4,
  },
  videoThumbnail: {
    width: width * 0.35,
    height: undefined,
    aspectRatio: 16 / 9,
    marginLeft: 10,
    borderRadius: 10,
    marginTop: 10,
  },
});