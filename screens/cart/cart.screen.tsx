import { SERVER_URI } from "@/utils/uri";
import { Entypo, FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useStripe } from "@stripe/stripe-react-native";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { htmlToText } from "html-to-text";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";

import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  StyleSheet,
} from "react-native";
// import { Video } from "expo-av"; // Import Video component
import Header from "@/components/header/header";

export default function CartScreen() {
  const [cartItems, setCartItems] = useState<NewsType[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  
  useEffect(() => {
    const subscription = async () => {
      const cart: any = await AsyncStorage.getItem("cart");
      if (cart) {
        setCartItems(JSON.parse(cart));
      }
    };
    subscription();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    const cart: any = await AsyncStorage.getItem("cart");
    setCartItems(cart ? JSON.parse(cart) : []);
    setRefreshing(false);
  };

  // const handleCourseDetails = (courseDetails: any) => {
  //   router.push({
  //     pathname: "/(routes)/course-details",
  //     params: { item: JSON.stringify(courseDetails) },
  //   });
  // };

  const handleRemoveItem = async (item: any) => {
    const existingCartData = await AsyncStorage.getItem("cart");
    const cartData = existingCartData ? JSON.parse(existingCartData) : [];
    const updatedCartData = cartData.filter((i: any) => i._id !== item._id);
    await AsyncStorage.setItem("cart", JSON.stringify(updatedCartData));
    setCartItems(updatedCartData);
  };

  const getGifUrl = (videoUrl: string) => {
    const urlParts = videoUrl.split("/");
    if (urlParts.length > 6) {
      const cloudName = urlParts[3]; // e.g., 'dzbbadosd'
      const version = urlParts[6].substring(1); // e.g., '1726047638', removing 'v'
      const videoPublicId = urlParts.slice(7).join("/").replace(".mp4", ""); // Extract public ID without extension

      // Construct the GIF URL dynamically based on the video URL
      return `https://res.cloudinary.com/${cloudName}/video/upload/so_5,du_3,w_300,h_200,f_gif/v${version}/${videoPublicId}.gif`;
    } else {
      // Default GIF URL if featured_video is missing
      return "https://via.placeholder.com/300x200?text=No+Video";
    }
  };

  const handlePress = (item: any) => {
    // Serialize only necessary fields
    const simplifiedItem = {
      id: item._id,
      title: item.title,
      content: item.content,
      featured_video: item.featured_video,
      // Add other necessary fields
    };
    const serializedItem = encodeURIComponent(JSON.stringify(simplifiedItem));
    router.push(`/course-details?item=${serializedItem}`);
  };
  
 


  return (
    <LinearGradient
    colors={["#F2F2F2", "#e3e3e3"]}
      style={{ flex: 1,paddingTop: 50 }}
    >
      <Header />
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {
          const extractVideoId = (url: string) => {
              const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
              const match = url.match(regex);
              return match ? match[1] : null;
          };
      
          const videoId = extractVideoId(item.yt_url || "");
          const thumbnailUrl = videoId
              ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
              : "https://via.placeholder.com/300x200?text=No+Video";
      
          return (
              <TouchableOpacity
                  style={styles.container}
                  onPress={() => handlePress(item)}
              >
                  <View style={styles.contentWrapper}>
                      <View style={{ flex: 2 }}>
                          <Text style={styles.title}>{item?.title}</Text>
                         
                      </View>
                      <Image
                          source={{ uri: item.yt_url ? thumbnailUrl : item.featured_image }}
                          style={styles.videoThumbnail}
                          key={thumbnailUrl || item.featured_image}
                      />
                  </View>
                  <View style={styles.buttonsWrapper}>
                      <Text style={styles.createdAt}>{"5 days ago"}</Text>
                      <View style={styles.buttons}>
                         
                          <TouchableOpacity
                              style={styles.button}
                              onPress={() => handleRemoveItem(item)}
                          >
                              <FontAwesome name="bookmark" size={16} color="red" />
                              <Text style={styles.buttonText}>Unsave</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.button}>
                              <FontAwesome name="share" size={16} color="#333" />
                              <Text style={styles.buttonText}>Share</Text>
                          </TouchableOpacity>
                      </View>
                  </View>
              </TouchableOpacity>
          );
      }}
      
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
                fontFamily: "Raleway_600SemiBold",
              }}
            >
              No News Saved!
            </Text>
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
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
  buttons: {
    flexDirection: "row",
    alignItems: "center",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: 4,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  buttonText: {
    color: "#333",
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
    width: wp(30),
    height: 90,
    resizeMode: "contain",
    marginLeft: 8,
    borderRadius: 10,
    marginTop: 10,
  },
});
