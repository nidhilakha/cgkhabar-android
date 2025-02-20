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
// import { Video } from "expo-av"; // Import Video component
import Header from "@/components/header/header";
import { useFocusEffect } from "expo-router";
import { AppState, AppStateStatus } from "react-native";

const { width, height } = Dimensions.get("window");

export default function CartScreen() {
    const navigation = useNavigation();
  const [currentAppState, setCurrentAppState] = useState(AppState.currentState);

  const [cartItems, setCartItems] = useState<NewsType[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [theme, setTheme] = useState('light'); // State for theme
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentText, setCurrentText] = useState("");

  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem("theme");
        // console.log("Stored Theme:", storedTheme); // Log the stored theme
        if (storedTheme) {
          setTheme(storedTheme);
        }
      } catch (error) {
        console.error("Error fetching theme:", error);
      }
    };

    fetchTheme();
  }, []);

  const [largeFontSize, setLargeFontSize] = useState('default'); // State for theme

  useEffect(() => {
    const fetchFont = async () => {
      try {
        const storedFont = await AsyncStorage.getItem("largeFontSize");
        console.log("Stored Font:", storedFont); // Log the stored theme
        if (storedFont) {
          setLargeFontSize(storedFont);
        }
      } catch (error) {
        console.error("Error fetching theme:", error);
      }
    };

    fetchFont();
  }, []);

  
  useEffect(() => {
    const subscription = async () => {
      const cart: any = await AsyncStorage.getItem("cart");
      if (cart) {
        setCartItems(JSON.parse(cart));
      }
    };
    subscription();
  }, []);

  const handleBackPress = () => {
    if (isSpeaking) {
      handleStop(); // Stop audio first
      navigation.goBack(); // Navigate back immediately after stopping audio
      return true; // Prevent default back action (navigation)
    }
    return false; // Allow default back action when no audio is playing
  };

  useEffect(() => {
    // Add back button listener
    BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    };
  }, [isSpeaking]);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (currentAppState.match(/active/) && nextAppState.match(/inactive|background/)) {
        handleStop(); // Stop audio when the app goes to the background
      }
      setCurrentAppState(nextAppState);
    };
  
    useEffect(() => {
      const subscription = AppState.addEventListener("change", handleAppStateChange);
  
      // Cleanup subscription
      return () => {
        subscription.remove();
      };
    }, [currentAppState]);


   useFocusEffect(
        useCallback(() => {
          // Function to stop audio playback
          const stopAudio = () => {
            Speech.stop();
            setIsSpeaking(false);
          };
      
          // Add event listener to stop audio when the screen loses focus
          const unsubscribe = navigation.addListener('blur', stopAudio);
      
          // Cleanup function to remove the event listener
          return () => {
            unsubscribe();
          };
        }, [navigation])
      );

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
  const handlePress = (item: any) => {
    // Serialize only necessary fields
    const simplifiedItem = {
      id: item._id,
      title: item.title,
      content: item.content,
      featured_image: item.featured_image,
      yt_url: item.yt_url,
      author: item.author,
      createdAt: item.createdAt,
      category: item.category._id // Extracting the _id from category object
    };
    const serializedItem = encodeURIComponent(JSON.stringify(simplifiedItem));
    router.push(`/course-details?item=${serializedItem}`);
  };
  
 
    const cleanText = (html: string): string => {
      let cleaned = htmlToText(html, {
        wordwrap: false,
        selectors: [
          { selector: "a", format: "skip" }, // Skip anchor tags
          { selector: "img", format: "skip" }, // Skip image tags
          {
            selector: "p",
            options: {
              leadingLineBreaks: 1, // Add line breaks before paragraphs
              trailingLineBreaks: 1, // Add line breaks after paragraphs
            },
          },
        ],
        preserveNewlines: true, // Preserve newline characters
      });
    
      // Remove extra spaces, line breaks, and special characters
      cleaned = cleaned.replace(/\s+/g, " ").trim();
      return cleaned;
    };

    const handleStop = () => {
      Speech.stop();
      setIsSpeaking(false);
    };
    const handleSpeechStart= async (item: NewsType) =>{
      if (isSpeaking) {
        // If speech is already playing, stop it
        handleStop();
      } else {
        const textToRead = `${item.title}. ${cleanText(item.content)}`;
        setCurrentText(textToRead);
        // setIsModalVisible(true); // Show the ScrollingTextModal
        setIsSpeaking(true);
  
        Speech.speak(textToRead, {
          language: "hi-IN", // Change to Hindi
          pitch: 1.0,
          rate: 1.0,
          onDone: () => {
            setIsSpeaking(false);
          },
          onStopped: () => {
            setIsSpeaking(false);
          },
        });
      }
    };


    
  return (
    <LinearGradient
    colors={theme === 'dark' ? ['#0C0C0C', '#0C0C0C'] : ['#F2F2F2', '#e3e3e3']}
    style={{ flex: 1, paddingTop: 50 }}
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
              style={theme==='light'?styles.container:styles.container2}
                  onPress={() => handlePress(item)}
              >
                  <View style={styles.contentWrapper}>
                      <View style={{ flex: 2 }}>
                          <Text style={[
  theme === 'light' ? styles.title : styles.title2, // Apply base styles based on theme
  { fontSize: largeFontSize==='large' ? 24 : 20 } // Set font size conditionally
]}>{item?.title}</Text>
                         
                      </View>
                      <View style={{ position: 'relative' }}>
  <Image
               source={{
                 uri: getThumbnailUrl(item),
               }}
               style={styles.videoThumbnail}
               key={item._id || item.yt_url || item.featured_image || "default-key"}
               resizeMode="cover"
             />
  
  {/* YouTube Icon */}
  {item.yt_url && (
    <FontAwesome
    name="youtube-play"
    size={25} // Icon size
    color="red" // Icon color
    style={{
      position: "absolute",
      top: "50%", // Position the icon vertically in the center
      left: "50%", // Position the icon horizontally in the center
      transform: [
        { translateX: -15 }, // Adjust horizontally to center the icon
        { translateY: -15 }, // Adjust vertically to center the icon
      ],
      backgroundColor: "rgba(255, 255, 255, 0.8)", // Background color for visibility
      borderRadius: 50, // Optional: Rounded background
      padding: 8, // Padding inside the icon for spacing
    }}
  />
  )}
</View>
                  </View>
                  <View style={styles.buttonsWrapper}>
                      {/* <Text style={theme==='light'?styles.createdAt:styles.createdAt2 }>{"5 days ago"}</Text> */}
                      <View>
      <TouchableOpacity
        // onPress={handleSpeechStart}
        onPress={() => handleSpeechStart(item)}

        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 2,
          paddingHorizontal:5,
          borderWidth: 1,
          borderColor: "#9E9E9E",
          borderRadius: 20, // Rounded edges for the button
        }}
      >
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: 20, // Makes the icon container circular
            justifyContent: "center",
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#BF0000",
            marginRight: 8, // Adds space between icon and text
            backgroundColor:"#BF0000"
          }}
        >
          <FontAwesome
            name={isSpeaking ? "volume-off" : "volume-up"}
            size={12}
            color="#fff"
          />
        </View>
        <Text style={{ fontSize: 14,  color:theme === 'light'? "#333":"#9E9E9E" }}>{isSpeaking ? "ऑडियो रोकें" : "ऑडियो सुनें"} </Text>
      </TouchableOpacity>

    
    </View>
                      <View style={styles.buttons}>
                         
                          <TouchableOpacity
                              style={styles.button}
                              onPress={() => handleRemoveItem(item)}
                          >
                              <FontAwesome name="bookmark" size={16} color="red" />
                              <Text style={theme==='light'?styles.buttonText:styles.buttonText2}>सेव</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.button}>
                              <FontAwesome name="share" size={16} color={theme === 'dark' ? '#9E9E9E' : '#333'} />
                              <Text style={theme==='light'?styles.buttonText:styles.buttonText2}>शेयर</Text>
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
                // fontFamily: "Raleway_600SemiBold",
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
    // fontSize: 16,
    textAlign: "left",
    // fontFamily: "Raleway_600SemiBold",
  },
  title2: {
    // fontSize: 16,
    textAlign: "left",
    // fontFamily: "Raleway_600SemiBold",
    color:"#fff"
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
    gap: 4,
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
    width: width * 0.35, // 35% of the screen width
    height: undefined, // Automatically adjust height to maintain aspect ratio
    aspectRatio: 16 / 9, // Maintain a 16:9 aspect ratio
    marginLeft: 10,
    borderRadius: 10,
    marginTop: 10,
  },
});
