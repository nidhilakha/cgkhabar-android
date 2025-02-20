import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Share,
  StyleSheet,
  Image,
  FlatList,
  Linking,
  Dimensions,
  BackHandler,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { Feather } from "@expo/vector-icons";
// import CourseCard from "@/components/cards/course.card";
import NewsCard from "@/components/cards/news.cards";

import React, {
  useLayoutEffect,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import YoutubePlayer from "react-native-youtube-iframe";
import Loader from "../../../components/loader/loader";
import { SERVER_URI } from "../../../utils/uri";
import RenderHtml from "react-native-render-html";
import { useWindowDimensions } from "react-native";
import axios from "axios";
import * as Speech from "expo-speech";
import { htmlToText } from "html-to-text";
import { useFocusEffect } from "expo-router";
import { AppState, AppStateStatus } from "react-native";
import WebView from "react-native-webview";


declare global {
  interface Window {
    twttr: any;
  }
}

// Utility function to extract YouTube video ID
const extractVideoId = (url: string) => {
  if (!url || typeof url !== 'string') {
    return null; // Return null if URL is undefined or not a string
  }
  const regex =
    /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null; // Return the video ID or null if not matched
};

const { width } = Dimensions.get("window");

export default function NewsDetailScreen() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { item } = useLocalSearchParams();
  const navigation = useNavigation();
  const [isSaved, setIsSaved] = useState(false); // State to track if news is saved
  const { width } = useWindowDimensions();
  const [moreNews, setMoreNews] = useState<NewsType[]>([]);
  const newsItem = JSON.parse(item as string);
// console.log("newsitem",newsItem);
const [relatedNews, setRelatedNews] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const videoUri = `${SERVER_URI}/videos/${newsItem.featured_video}`;

  const videoId = extractVideoId(newsItem.yt_url);
  const [playing, setPlaying] = useState(false);
  const [similarNews, setSimilarNews] = useState<NewsType[]>([]);

  const [theme, setTheme] = useState('light'); // State for theme
  const [largeFontSize, setLargeFontSize] = useState('default'); // State for theme
  const isFetchingRef = useRef(false);
  const [currentText, setCurrentText] = useState("");
  const [currentAppState, setCurrentAppState] = useState(AppState.currentState);
 
  useEffect(() => {
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
  }, []);

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

  useEffect(() => {
    if (!newsItem) {
      console.log("newsItem is still null or undefined.");
      return;
    }
  
    if (isFetchingRef.current) {
      return; // Prevent fetching if already fetching
    }
  
    const fetchSimilarNews = async () => {
      if (!newsItem.category) {
        console.log("newsItem.category or category._id is missing");
        return;
      }
  
      const categoryId = newsItem.category;
      // console.log("category id", categoryId);
      if (!categoryId) {
        return; // Exit if category ID is missing
      }
  
      isFetchingRef.current = true; // Mark as fetching
  
      try {
        const response = await fetch(`${SERVER_URI}/news/latest/${categoryId}`);
        const data = await response.json();
  
        if (Array.isArray(data.latestNews)) {
          const filteredNews = data.latestNews
            .filter((news: any) => news._id !== newsItem._id) // Exclude current news item
            .slice(0, 5); // Limit to 5 similar items
          setSimilarNews(filteredNews);
        } else {
          console.error("Unexpected data format:", data);
        }
      } catch (error) {
        console.error("Error fetching similar news:", error);
      } finally {
        isFetchingRef.current = false; // Mark fetching complete
      }
    };
  
    fetchSimilarNews();
  }, [newsItem?.category]); // Watching category only
  
  useEffect(() => {
    // Fetch related news
    const fetchRelatedNews = async () => {
      try {
        
        const response = await axios.get(`${SERVER_URI}/news/related`, {
          params: { title: newsItem.title },
        });
        // console.log(response);
        setRelatedNews(response.data.relatedNews);
      } catch (error) {
        console.error("Error fetching related news", error);
      }
    };

    if (newsItem?.title) {
      fetchRelatedNews();
    }
  }, [newsItem]);

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
  

  const handlePress = (selectedNewsItem: NewsType) => {
    const serializedItem = encodeURIComponent(JSON.stringify(selectedNewsItem));

    router.push(`/course-details?item=${serializedItem}`);
  };
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
      // Convert HTML content to plain text
      const plainTextContent = htmlToText(newsItem.content);
  
      // Get the first two lines of content (you can adjust the logic as needed)
      const contentLines = plainTextContent.split('\n').slice(0, 2).join('\n');
  
      // Create the message to share
      const message = `${newsItem.featured_image}\n\n**${newsItem.title}**\n\n${contentLines}...`;
  
      // Share the content
      await Share.share({
        message,
      });
    } catch (error) {
      console.error("Error sharing the news:", error);
    }
  };
  // Determine how much content to show
  const contentPreviewLength = 900;

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

    const handleSpeechStart = () => {
      if (isSpeaking) {
        // If speech is already playing, stop it
        handleStop();
      } else {
        const textToRead = `${newsItem.title}. ${cleanText(newsItem.content)}`;
        setCurrentText(textToRead);
        setIsSpeaking(true);
  
        Speech.speak(textToRead, {
          language: "hi-IN", // Change to Hindi
          pitch: 1.0,
          rate: 0.8,
  
          onDone: () => {
            setIsSpeaking(false);
          },
          onStopped: () => {
            setIsSpeaking(false);
          },
        });
      }
    };
  
 

  
    const handleStop = () => {
      Speech.stop();
      setIsSpeaking(false);
    };

    const extractTweetUrl = (htmlContent:any) => {
      const match = htmlContent.match(/https:\/\/twitter\.com\/.*?\/status\/\d+/);
      return match ? match[0] : null;
    };
  
    const tweetUrl = extractTweetUrl(newsItem.content);
  
    // Update HTML content to replace blockquote with a special tag (e.g., `__TWEET__`)
    const updatedContent = newsItem.content.replace(
      /<blockquote class="twitter-tweet">.*?<\/blockquote>/g,
      '__TWEET__'
    );


  return (
    <>
      {!newsItem ? (
        <Loader />
      ) : (
        <LinearGradient
        colors={theme === 'dark' ? ['#0C0C0C', '#0C0C0C'] : ['#F2F2F2', '#e3e3e3']}
        style={{ flex: 1, paddingTop: 30 }}
      >
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ marginHorizontal: 16 }}>
              
              <Text
                style={{
                 
                 fontSize: largeFontSize==='large' ? 24 : 20,
                  fontWeight: "700",
                  // fontFamily: "Raleway_700Bold",
                  marginBottom: 20,
 backgroundColor: theme === 'dark' ? '#272829' : 'white',          
         padding: 5,
                  paddingHorizontal: 10,
                  borderRadius: 5,
                  color: "#A6121F",
                  textAlign: "center",
                }}
              >
                {newsItem.title}
              </Text>

              {videoId && newsItem.yt_url ? (
                <View style={styles.playerContainer}>
                  <YoutubePlayer
      height={(width * 0.90 * 9) / 16} // Match the container's height
      videoId={videoId}
                    play={playing}
                    onChangeState={onStateChange}
                  />
                </View>
              ) : (
                <View style={styles.playerContainer}>
                  <Image
                    source={{ uri: newsItem.featured_image }}
                    style={{
                      width: width, 
                      height: (width ? (width * 0.90 * 9) / 16 : 200), // Default height as fallback
                    }}       
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
                  // marginTop: 10,
                  marginTop: largeFontSize==='large' ? 20 : 10,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: largeFontSize==='large' ? 18 : 14,
                    color: "white",
                    backgroundColor: "#D96C75",
                    padding: 2,
                    borderRadius: 5,
                    paddingHorizontal: 5,
                  }}
                >
                 {newsItem.author
    ? newsItem.author.charAt(0).toUpperCase() + newsItem.author.slice(1)
    : "रायपुर | संवाददाता"}
                </Text>

                <View>
          <TouchableOpacity
            onPress={handleSpeechStart}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 2,
              paddingHorizontal: 5,
              borderWidth: 1.5,
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
                backgroundColor: "#BF0000",
              }}
            >
              <FontAwesome
                name={isSpeaking ? "volume-off" : "volume-up"}
                size={12}
                color="#fff"
              />
            </View>
            <Text
              style={{
                fontSize: 12,
                color: theme === "light" ? "#333" : "#9E9E9E",
              }}
            >
              {isSpeaking ? "ऑडियो रोकें" : "ऑडियो सुनें"}
            </Text>
          </TouchableOpacity>
        </View>
        
                <Text
                  style={{
                    fontSize: largeFontSize==='large' ? 18 : 14,
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
            {/* Render HTML content conditionally */}
          

<View
  style={{
    marginHorizontal: 2,
    backgroundColor: theme === 'dark' ? '#272829' : 'white',
    paddingHorizontal: 10,
    borderRadius: 10,
    marginVertical: 20,
    position:"relative"
  }}
>
<RenderHtml
        source={{ html: updatedContent }}
        contentWidth={width - 32}
        baseStyle={{
          color: theme === 'dark' ? '#fff' : '#000',
          fontSize: largeFontSize === 'large' ? 22 : 18,
        }}
        tagsStyles={{
          p: {
            marginVertical: 2,
          },
          img: {
            width: 400,
            height: 250,
          },
          figure: {
            marginBottom: 16,
            alignItems: 'center',
          },
        }}
      />

      {/* If tweet URL is found, render WebView inside the content */}
      {tweetUrl && (
        <WebView
          source={{ uri: tweetUrl }}
          style={{ width: width - 32, height: 400 }}
          javaScriptEnabled={true}
          originWhitelist={['*']}
        />
      )}
  {/* Social Media Links Section */}
  <View style={styles.socialMediaContainer}>
  <Text
    style={{
      fontSize: largeFontSize === "large" ? 22 : 18,
      color: theme === "dark" ? "#fff" : "#000",textDecorationLine:"underline"
    }}
  >
    Follow CGKhabar on:
  </Text>

  <View style={styles.socialMediaLinks}>
    <TouchableOpacity onPress={() => Linking.openURL('https://www.facebook.com/cgkhabarnews')}>
    <FontAwesome
          name="facebook"
          size={largeFontSize === "large" ? 24 : 20}
          color={ theme === "dark" ? "#fff" : "#000"}
          style={{marginLeft:10}}

        />
    
    </TouchableOpacity>

    <TouchableOpacity onPress={() => Linking.openURL('https://x.com/cgkhabar')}>
    <FontAwesome
          name="twitter"
          size={largeFontSize === "large" ? 24 : 20}
          color={ theme === "dark" ? "#fff" : "#000"}
          style={{marginLeft:10}}

        />
    </TouchableOpacity>
 

    <TouchableOpacity onPress={() => Linking.openURL('https://instagram.com')}>
    <FontAwesome
          name="instagram"
          size={largeFontSize === "large" ? 24 : 20}
          color={ theme === "dark" ? "#fff" : "#000"}
          style={{marginLeft:10}}
        />
    </TouchableOpacity>
  </View>
</View>

</View>

           
          

<Text style={styles.similarNewsTitle}>Related News</Text>
<FlatList
                data={relatedNews}
                keyExtractor={(item) => newsItem._id}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => handlePress(item)}>
                    <NewsCard item={item} />
                  </TouchableOpacity>
                )}
                contentContainerStyle={styles.similarNewsContainer}
              />         

<Text style={styles.similarNewsTitle}>More News</Text>
<FlatList data={ similarNews}
                keyExtractor={(item) => newsItem._id}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => handlePress(item)}>
                    <NewsCard item={item} />
                  </TouchableOpacity>
                )}
                contentContainerStyle={styles.similarNewsContainer}
              />

            


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
    width: width * 0.90, // Use 95% of the screen width
    height: (width * 0.90 * 9) / 16, // Maintain 16:9 aspect ratio
      },
      
  similarNewsTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginVertical: 10,
    color: "#A6121F",
    marginLeft:10,
  },
  similarNewsContainer: {
    paddingHorizontal: 5,
    marginBottom:10
  },
  socialMediaContainer: {
    marginTop:20,
    marginBottom: 20,
    flexDirection: "row", // This ensures that everything is aligned in a single line.
    flexWrap: "wrap", // This allows wrapping if the screen is too small, ensuring responsiveness.
    alignItems: "center", // This vertically aligns the text to the center
  },
  socialMediaLinks: {
    flexDirection: "row",  // Align the social media links in a horizontal row
    alignItems: "center", // Vertically aligns the social media items
  },
});






