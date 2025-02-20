import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Pressable,
  Switch,
  FlatList,
  Dimensions,
  Platform,
  Linking,
  PermissionsAndroid,
  Button,
  Alert,
} from "react-native";
import React, { useCallback } from "react";
import messaging from "@react-native-firebase/messaging";
import { SERVER_URI } from "@/utils/uri";

import { Raleway_700Bold } from "@expo-google-fonts/raleway";
import { useFonts } from "expo-font";
import useUser from "@/hooks/auth/useUser";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";


interface Notification {
  _id: string;
  title: string;
  createdAt: string;
  featured_image?: string;
  content:string;
  yt_url?:string;
  author?:string;
  category?: {
    _id: string;
    name: string;
  };
}
const { width, height } = Dimensions.get("window");


export default function Header() {
  const [cartItems, setCartItems] = useState([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastReadTime, setLastReadTime] = useState<string | null>(null);
    const [theme, setTheme] = useState("light");
    const [largeFontSize, setLargeFontSize] = useState("default"); // State for theme
  const { user } = useUser();
// console.log(isNotificationEnabled);
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

  useEffect(() => {
    const fetchLastReadTime = async () => {
      const storedTime = await AsyncStorage.getItem("lastReadTime");
      setLastReadTime(storedTime);
    };
  
    fetchLastReadTime();
  }, []);

  useEffect(() => {
    const fetchNotificationPreference = async () => {
      const enabled = await AsyncStorage.getItem("isNotificationEnabled");
      
      // Ensure the state updates correctly from AsyncStorage
      setIsNotificationEnabled(enabled === "true");
    };
  
    fetchNotificationPreference();  // Ensure this runs immediately

    const fetchCartItems = async () => {
      try {
        const cart = await AsyncStorage.getItem("cart");
        setCartItems(cart ? JSON.parse(cart) : []);
      } catch (error) {
        console.error("Error fetching cart items:", error);
      }
    };

    fetchCartItems();

    // Poll for cart updates every 5 seconds
    const intervalId = setInterval(fetchCartItems, 5000);

    return () => clearInterval(intervalId);
  }, []);


  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`${SERVER_URI}/news/last3days`);
        const data: Notification[] = await response.json();
        setNotifications(data);
  
        // Get the timestamp of the latest news
        if (data.length > 0) {
          const latestNewsTime = data[0].createdAt; // Assuming the latest news is first in the list
          const storedTime = await AsyncStorage.getItem("lastReadTime");
  
          // Calculate unread count (only news added after last stored timestamp)
          if (storedTime) {
            const newCount = data.filter(
              (item) => new Date(item.createdAt) > new Date(storedTime)
            ).length;
            setUnreadCount(newCount);
          } else {
            // If no lastReadTime exists, consider all news as new
            setUnreadCount(data.length);
          }
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
  
    // Call the fetchNotifications function
    fetchNotifications();
  
  }, []);  // Em



  
const toggleDropdown = async () => {
  setIsDropdownVisible(true);

  if (notifications.length > 0) {
    const latestNewsTime = notifications[0].createdAt; // Get latest news timestamp

    await AsyncStorage.setItem("lastReadTime", latestNewsTime);
    setLastReadTime(latestNewsTime);
  }

  setUnreadCount(0); // Reset badge count
};

// console.log(PermissionsAndroid);




const toggleNotification = async () => {
  console.log("Button clicked");

  if (Platform.OS !== "android" || Platform.Version < 33) {
    console.log("✅ Notification permission is automatically granted on this Android version.");
    await AsyncStorage.setItem("permissionGranted", "true"); // Store as "true"
    await getFcmToken();  // <-- This ensures notifications work

    await Linking.openSettings(); // Just open settings
    return;
  }

  try {
    const status = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );
    console.log("Initial permission status:", status);

    if (!status) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );

      console.log("Permission request result:", granted);

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("✅ Notification permission granted");
        await AsyncStorage.setItem("permissionGranted", "true"); // Store as "true"
        await getFcmToken();  // <-- This ensures notifications work


      } else {
        console.log("❌ Notification permission denied");
        await AsyncStorage.setItem("permissionGranted", "false"); // Store as "true"

      }
    } else {
      console.log("🎉 Permission already granted!");
      await getFcmToken();  // <-- This ensures notifications work

    }

    console.log("Opening app settings...");
    await Linking.openSettings();
  } catch (error) {
    console.error("🚨 Error requesting notification permission:", error);
  }
};


const getFcmToken = async () => {
  try {

    
      const token = await messaging().getToken();
      await AsyncStorage.setItem("fcmToken", token);

      // Save token to the server
      await fetch(`${SERVER_URI}save-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
  
  } catch (error) {
    console.error("Error fetching FCM token:", error);
  }
};

  const handlePress = (item: Notification) => {
    const simplifiedItem = {
      id: item._id,
      title: item.title,
      content: item.content,
      featured_image: item.featured_image,
      yt_url: item.yt_url,
      author: item.author,
      createdAt: item.createdAt,
      category: item?.category?._id,
    };
    
    const serializedItem = encodeURIComponent(JSON.stringify(simplifiedItem));
    
    // Assuming you have a router from `next/router` or `react-router` to handle the navigation
    router.push(`/course-details?item=${serializedItem}`);
  };


  return (
    <>
      <View style={styles.container}>
        <View style={styles.headerWrapper}>
          <TouchableOpacity onPress={() => router.push("/(tabs)")}>
            <Image source={require("@/assets/logo.png")} style={styles.image} />
          </TouchableOpacity>
        </View>

        {/* Right side buttons */}
        <View style={styles.rightButtonsWrapper}>
          <TouchableOpacity
            style={styles.bellButton}
            onPress={() => router.push("/(routes)/cart")}
          >
            <View>
              <Feather name="bookmark" size={26} color={"black"} />
              <View style={styles.bellContainer}>
                <Text style={{ color: "#fff", fontSize: 14 }}>
                  {cartItems.length}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Bell Icon */}
          <TouchableOpacity style={styles.notificationButton} onPress={toggleDropdown}>
  <View>
    <Feather name="bell" size={26} color={"black"} />
    {unreadCount > 0 && (
      <View style={styles.NotificationContainer}>
        <Text style={{ color: "#fff", fontSize: 14 }}>{unreadCount}</Text>
      </View>
    )}
  </View>
</TouchableOpacity>

        </View>
      </View>

      {/* Modal for Notifications */}
      <Modal
  visible={isDropdownVisible}
  transparent={true}
  animationType="fade"
  onRequestClose={() => setIsDropdownVisible(false)}
>
  <Pressable
    style={styles.modalOverlay}
    onPress={() => setIsDropdownVisible(false)}
  >
    <View style={[styles.dropdown,{backgroundColor: theme === "light" ? "white" : "black"}]}>
      {/* Close Button with Left Arrow */}


      <View style={styles.dropdownItem}>
      <TouchableOpacity
        style={[styles.closeButton,]}
        onPress={() => setIsDropdownVisible(false)}
      >
       <Ionicons 
  name="arrow-back" 
  size={largeFontSize === "large" ? 28 : 24} 
  color={theme === "light" ? "black" : "white"} 
/>

      </TouchableOpacity>
      <Text style={[styles.text, { 
  fontSize: largeFontSize === "large" ? 24 : 20, 
  color: theme === "light" ? "black" : "white" 
}]}>


  Manage Notifications
</Text>

        {/* <Switch
          style={styles.switch}
          // value={isNotificationEnabled}
          onValueChange={toggleNotification}
        /> */}
   <TouchableOpacity
      onPress={toggleNotification}
      style={{
        flexDirection: "row",
        alignItems: "center",
    
      }}
    >
      <Ionicons name="settings-outline" size={20} color="gray" style={{ marginRight: 8 }} />
    </TouchableOpacity>
      </View>

      {/* FlatList for Notifications */}
      <FlatList
        data={notifications}
        keyExtractor={(item, index) => item._id || index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handlePress(item)}>
            <View style={[styles.notificationContainer, { backgroundColor: theme === "light" ? "white" : "#272829" }]}>
              <Image
                source={{
                  uri: item.featured_image || "https://via.placeholder.com/50",
                }}
                style={styles.image}
              />
           <View style={styles.textContainer}>

              <Text 
  style={[styles.title, { 
    fontSize: largeFontSize === "large" ? 22 : 18, 
    color: theme === "light" ? "black" : "white" 
  }]}
>
  {item.title || "No Title"}
</Text>

                <Text style={styles.createdAt}>
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleString()
                    : "No Date"}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.noNotifications}>No Notifications</Text>
        }
      />
    </View>
  </Pressable>
</Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    padding: 10,
    width: "100%",
    marginTop: -10,
    backgroundColor: "#A6121F",
  },

  headerWrapper: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,  // Make this take up remaining space
  },

  image: {
    width: 100,
    height: 50,
  },

  // Create a new wrapper for the buttons to align them to the right
  rightButtonsWrapper: {
    flexDirection: "row",  // Align buttons horizontally
    alignItems: "center",  // Vertically center the buttons
    marginLeft: "auto",  // Push to the right side
  },

  bellButton: {
    backgroundColor: "#fff",
    width: 45,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },

  bellContainer: {
    width: 20,
    height: 20,
    backgroundColor: "#BF0000",
    position: "absolute",
    borderRadius: 50,
    right: -5,
    top: -5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  NotificationContainer: {
    width: 20,
    height: 20,
    backgroundColor: "#BF0000",
    position: "absolute",
    borderRadius: 50,
    right: -5,
    top: -5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  notificationButton: {
    backgroundColor: "#fff",
    width: 45,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginLeft: 10,  // Optional: Adjust this to control space between buttons
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  
    width: width,  // Full width of the screen
    height: height,  // Full height of the screen
  },

  dropdown: {
    backgroundColor: "#fff",
    borderRadius: 8,
paddingHorizontal:10,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    width: width,  // Full width
    height: height , // 75% of screen height, leaving space for header and tabs
   
  },

  dropdownItem: {
    padding: 10,
    paddingVertical:20,
    paddingHorizontal: 20,
    fontSize: 16,
    color: "#333",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    flexDirection: "row",  
    justifyContent: "space-between",  // Ensures even spacing
    alignItems: "center",  
  },
  
  closeButton: {
    marginRight: 10,  // Adds spacing between arrow and text
  },
  text: {
    fontSize: 16,
    color: "#333",
  },

  switch: {
    marginLeft: "auto",  // Pushes the switch to the right side of the row
  },

  textContainer: {
    marginLeft: 10,
    flex: 1,
  },
  title: { fontWeight: "bold", fontSize: 16 },
  createdAt: { color: "gray", fontSize: 12 },
  noNotifications: { textAlign: "center", marginTop: 20 },
  notificationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal:10,
    paddingVertical:5
  },
});

