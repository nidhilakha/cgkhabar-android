import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Share,
  Modal,
  Dimensions,
  FlatList,
  BackHandler,
} from "react-native";
import { htmlToText } from "html-to-text";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router, useNavigation } from "expo-router";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { useFocusEffect } from "expo-router";
import * as Speech from "expo-speech";
import { AppState, AppStateStatus } from "react-native";

type NewsCardProps = {
  item: NewsType;
};

const { width, height } = Dimensions.get("window");
const { width: screenWidth } = Dimensions.get("window");

const NewsCard = React.memo(
  ({ item }: NewsCardProps) => {

  const navigation = useNavigation();
    const [isSaved, setIsSaved] = useState(false);
    const [currentAppState, setCurrentAppState] = useState(AppState.currentState);
  
    const [thumbnailUrl, setThumbnailUrl] = useState("");
    const [theme, setTheme] = useState("light");
    const [largeFontSize, setLargeFontSize] = useState("default"); // State for theme
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [showControls, setShowControls] = useState(false);
    const [currentText, setCurrentText] = useState("");
    const [isModalVisible, setIsModalVisible] = useState(false); // State for ScrollingTextModal visibility
    const [audioDuration, setAudioDuration] = useState(60); // Example audio duration in seconds
    const [currentAudio, setCurrentAudio] = useState(null); // Tracks the currently playing audio
    const audioRef = useRef<HTMLAudioElement | null>(null); // Ref to manage the audio element
  

      useFocusEffect(
        useCallback(() => {
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
        }, [])
      );
    
      useFocusEffect(
        useCallback(() => {
          const fetchTheme = async () => {
            const storedTheme = await AsyncStorage.getItem("theme");
            setTheme(storedTheme || "light");
            // console.log("in home screen",storedTheme);
          };
          fetchTheme();
        }, [])
      );
    
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
            setIsModalVisible(false); // Hide the modal when stopped
          };
      
          // Add event listener to stop audio when the screen loses focus
          const unsubscribe = navigation.addListener('blur', stopAudio);
      
          // Cleanup function to remove the event listener
          return () => {
            unsubscribe();
          };
        }, [navigation])
      );
    
      useEffect(() => {
        const checkIfSaved = async () => {
          try {
            const existingCartData = await AsyncStorage.getItem("cart");
            const cartData = existingCartData ? JSON.parse(existingCartData) : [];
            setIsSaved(
              cartData.some((savedItem: any) => savedItem._id === item._id)
            );
          } catch (error) {
            console.error("Error checking saved items:", error);
          }
        };
        checkIfSaved();
      }, [item._id]);
    
      useEffect(() => {
        const extractVideoId = (url: string) => {
          const regex =
            /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
          const match = url.match(regex);
          return match ? match[1] : null;
        };
    
        const videoId = extractVideoId(item.yt_url || "");
        setThumbnailUrl(
          videoId
            ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
            : "https://via.placeholder.com/300x200?text=No+Video"
        );
      }, [item.yt_url]);
    
      const contentPreview = useMemo(() => {
        return htmlToText(item.content).split(" ").slice(0, 10).join(" ") + "...";
      }, [item.content]);
    
  
    
      const handleSave = async () => {
        try {
          const existingCartData = await AsyncStorage.getItem("cart");
          const cartData = existingCartData ? JSON.parse(existingCartData) : [];
          const itemExists = cartData.some(
            (savedItem: any) => savedItem._id === item._id
          );
    
          if (!itemExists) {
            cartData.push(item);
            setIsSaved(true);
          } else {
            const updatedCartData = cartData.filter(
              (savedItem: any) => savedItem._id !== item._id
            );
            setIsSaved(false);
            await AsyncStorage.setItem("cart", JSON.stringify(updatedCartData));
          }
          await AsyncStorage.setItem("cart", JSON.stringify(cartData));
        } catch (error) {
          console.error("Error saving item:", error);
        }
      };
    
      const handleShare = async () => {
        try {
          const newsUrl = `myapp://news/${item._id}`; // Use your custom scheme
          const message = `Check out this news: ${item.title}\n\n${contentPreview}\n\nRead more at: ${newsUrl}`;
          console.log(message);
          await Share.share({
            message: message,
          });
        } catch (error) {
          console.error("Error sharing the news:", error);
        }
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
      
    
      const handleSpeechStart = () => {
        // Stop the currently playing speech immediately
        handleStop();
    
        // Set the new text to read
        const textToRead = `${item.title}. ${cleanText(item.content)}`;
        setCurrentText(textToRead);
    
        // Start the new speech immediately after stopping the previous one
        setIsSpeaking(true);
        Speech.speak(textToRead, {
          language: "hi-IN", // Language is Hindi
          pitch: 1.0,
          rate: 0.8,
          onDone: () => {
            setIsSpeaking(false);
          },
          onStopped: () => {
            setIsSpeaking(false);
          },
        });
      };
    
      const handleStop = () => {
        // Stop the speech and reset the speaking state
        Speech.stop();
        setIsSpeaking(false);
        setIsPaused(false);
      };
    
      const handlePlay = () => {
        if (isPaused) {
          Speech.resume();
          setIsSpeaking(true);
          setIsPaused(false);
        }
      };
    
      const handlePause = () => {
        if (isSpeaking) {
          Speech.pause();
          setIsSpeaking(false);
          setIsPaused(true);
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
        category: item.category._id,
      };
      const serializedItem = encodeURIComponent(JSON.stringify(simplifiedItem));
      router.push(`/course-details?item=${serializedItem}`);
    };
  
    return (
      <TouchableOpacity onPress={() => handlePress(item)}       style={theme === "light" ? styles.container : styles.container2}
>
        <View style={styles.contentWrapper}>
             <View style={{ flex: 2 }}>
                    <Text
                      style={[
                        theme === "light" ? styles.title : styles.title2, // Apply base styles based on theme
                        { fontSize: largeFontSize === "large" ? 24 : 20 }, // Set font size conditionally
                      ]}
                    >
                      {item.title}
                    </Text>
                  </View>
          <View style={{ position: "relative" }}>
            <Image
              source={{
                uri: getThumbnailUrl(item),
              }}
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
        {/* <Text style={theme==='light'?styles.createdAt:styles.createdAt2 }>{displayDate}</Text> */}

        <View>
        {isSpeaking ? (
  <TouchableOpacity
    onPress={handleStop}
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
        name="volume-off"
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
      ऑडियो रोकें
    </Text>
  </TouchableOpacity>
) : (
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
        name="volume-up"
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
      ऑडियो सुनें
    </Text>
  </TouchableOpacity>
)}

        </View>
        {/* Use ScrollingTextModal */}
        {/* <ScrollingTextModal
        isVisible={isModalVisible}
        text={currentText}
        isPlaying={isSpeaking}
        
        onPlay={handlePlay}
        onPause={handlePause}
        onStop={handleStop}
      /> */}
        <View style={styles.buttons}>
          <TouchableOpacity style={styles.button} onPress={handleSave}>
            <FontAwesome
              name="bookmark"
              size={14}
              color={
                theme === "light"
                  ? isSaved
                    ? "red"
                    : "#333"
                  : isSaved
                    ? "red"
                    : "#9E9E9E"
              }
            />
            <Text
              style={theme === "light" ? styles.buttonText : styles.buttonText2}
            >
              {" "}
              सेव
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleShare}>
            <FontAwesome
              name="share"
              size={14}
              color={theme === "dark" ? "#9E9E9E" : "#333"}
            />
            <Text
              style={theme === "light" ? styles.buttonText : styles.buttonText2}
            >
              {" "}
              शेयर
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      </TouchableOpacity>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFF",
    borderRadius: 10,
    padding: 8,
    marginVertical: 4,
  },
  container2: {
    backgroundColor: "#272829",
    borderRadius: 10,
    padding: 8,
    marginVertical: 4,
  },
  contentWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 20,
    textAlign: "left",
    // fontFamily: "Raleway_600SemiBold",
    fontWeight:500,
    color: "#000",
  },
  title2: {
    fontSize: 20,
    textAlign: "left",
    // fontFamily: "Raleway_600SemiBold",
    fontWeight:500,
    color: "#fff",
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
  videoThumbnail: {
    width: width * 0.35, // 35% of the screen width
    height: undefined, // Automatically adjust height to maintain aspect ratio
    aspectRatio: 16 / 9, // Maintain a 16:9 aspect ratio
    marginLeft: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  audioButton: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  audioButtonText: {
    marginLeft: 10,
    fontSize: 12,
    color: "#333",
  },
  controlContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#222",
    padding: 20,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  readingText: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 10,
  },
  controlButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  controlButton: {
    backgroundColor: "#555",
    padding: 15,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default React.memo(NewsCard);
