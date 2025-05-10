import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { router, Stack, useRouter } from "expo-router";
import { ToastProvider } from "react-native-toast-notifications";
import { LogBox, Image, Platform, Alert, View, TouchableOpacity } from "react-native";
import axios from "axios";
import { SERVER_URI } from "@/utils/uri";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Linking } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import firebase from '@react-native-firebase/app';
import TextTicker from "react-native-text-ticker";
import { AudioProvider, useAudio } from "@/components/Audio/AudioContext";
import { Easing } from "react-native";

export {
  ErrorBoundary,
} from "expo-router";

SplashScreen.preventAutoHideAsync();

type NotificationData = {
  _id: string;
  title: string;
  content: string;
  featured_image: string;
  yt_url: string;
  author: string;
  createdAt: string;
  category: {
    _id: string;
  };
};


const AudioBar = () => {
  const { isSpeaking, isPaused, currentNewsItem, pauseAudio, stopAudio, playAudio, cleanText } = useAudio();

  if (!isSpeaking || !currentNewsItem) return null;

  return (
    <View
      style={{
        position: "absolute",
        bottom: 60,
        left: 10,
        right: 10,
        backgroundColor: "black",
        padding: 15,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: 30,
        overflow: "hidden",
        zIndex: 1000,
      }}
    >
      <View style={{ flex: 1, overflow: "hidden", marginRight: 10 }}>
        <TextTicker
          style={{ fontSize: 16, color: "white" }}
          duration={80000}
          loop={false}
          easing={Easing.linear}
          bounce={false}
          marqueeDelay={1000}
          repeatSpacer={0}
        >
          {cleanText(currentNewsItem.content)} {/* Now cleanText is available */}
        </TextTicker>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity
          onPress={isPaused ? () => playAudio(currentNewsItem) : pauseAudio}
          style={{ marginRight: 15 }}
        >
          <FontAwesome name={isPaused ? "play" : "pause"} size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={stopAudio}>
          <FontAwesome name="close" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};


export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });
  const NOTIFICATIONS_KEY = "notifications";
  const saveNotification = async (notification: NotificationData) => {
    try {
      // Retrieve existing notifications
      const existingNotifications = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      const notifications = existingNotifications ? JSON.parse(existingNotifications) : [];
  
      // Append the new notification
      notifications.push(notification);
  
      // Save the updated list back to AsyncStorage
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
      
    } catch (error) {
      console.error("Error saving notification:", error);
    }
  };

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);









const firebaseConfig = {
  apiKey: "AIzaSyCXf6XJBox_8eqwLF1jV9dvqydBUBI8FQ8",
  authDomain: "cgkhabar-7fc19.firebaseapp.com", 
  projectId: "cgkhabar-7fc19",
  storageBucket: "cgkhabar-7fc19.appspot.com", 
  messagingSenderId: "771443512046", 
  appId: "1:771443512046:android:c7cfd62ec19128a4e9d9ff", 
};
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}


const [isPermissionPopupShown, setIsPermissionPopupShown] = useState(false);

  useEffect(() => {
    checkNotificationPermission();
    initializeNotificationListeners();

  }, []);

  const checkNotificationPermission = async () => {
    const isPermissionAsked = await AsyncStorage.getItem("isPermissionAsked");

    if (!isPermissionAsked) {
      setIsPermissionPopupShown(true); 
    } else {
      const permissionGranted = await AsyncStorage.getItem("permissionGranted");

    if (permissionGranted === "true" ) {  
      getFcmToken();
    }
    }
  };

  const requestNotificationPermission = async () => {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        await AsyncStorage.setItem("permissionGranted", "true");
        await AsyncStorage.setItem("isN`otificationEnabled", "true");

        getFcmToken();
      } else {
        await AsyncStorage.setItem("permissionGranted", "false");
      }
    } catch (error) {
      console.error("Permission error:", error);
    } finally {
      setIsPermissionPopupShown(false);
      await AsyncStorage.setItem("isPermissionAsked", "true");
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

  


  const renderPermissionPopup = () => {
    if (isPermissionPopupShown) {
      Alert.alert(
        "Allow Notifications",
        "This app would like to send you notifications.",
        [
          { text: "Don't Allow", onPress: () => denyPermission() },
          { text: "Allow", onPress: () => requestNotificationPermission() },
        ]
      );
    }
  };

  const denyPermission = async () => {
    await AsyncStorage.setItem("permissionGranted", "false");
    await AsyncStorage.setItem("isPermissionAsked", "true");

    setIsPermissionPopupShown(false);
  };

  useEffect(() => {
    renderPermissionPopup();
  }, [isPermissionPopupShown]);

  
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
    });
  
    return unsubscribe;
  }, []);
  
  
  async function subscribeToTopic() {
    await messaging().subscribeToTopic('news');
  }

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
    });
    return unsubscribe; 
}, []);




  useEffect(() => {
    LogBox.ignoreAllLogs(true);

  }, []);


 
 const initializeNotificationListeners = () => {
  messaging().onNotificationOpenedApp(async (remoteMessage) => {
    if (remoteMessage?.data) {
      const notification = remoteMessage.data as NotificationData;
      await saveNotification(notification);  

      handleNotificationRedirect(notification);
    }
  });
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    if (remoteMessage?.data) {
      const notification = remoteMessage.data as NotificationData;

      await saveNotification(notification);
    }
  });

  messaging().onMessage(async (remoteMessage) => {
    if (remoteMessage?.data) {
      const notification = remoteMessage.data as NotificationData;

      await saveNotification(notification);

      console.log("Foreground notification:", notification);
    }
  });
};


const handleNotificationRedirect = async (data: NotificationData) => {
  try {
    // Fetch news details using the ID
    console.log(data._id);
    console.log(SERVER_URI);
    const response = await fetch(`${SERVER_URI}breaking-news/${data._id}`);
    console.log(response);
    if (!response.ok) {
      throw new Error(`Failed to fetch news: ${response.statusText}`);
    }

    const result = await response.json();

    // Extract `news` object
    const newsDetails = result.news;
    if (!newsDetails) {
      throw new Error("News not found");
    }

    // Structure data in the required format
    const simplifiedItem = {
      id: newsDetails._id,
      title: newsDetails.title,
      content: newsDetails.content,
      featured_image: newsDetails.featured_image,
      yt_url: newsDetails.yt_url,
      author: newsDetails.author,
      createdAt: newsDetails.createdAt,
      category: newsDetails.category._id,
    };

    // Serialize and navigate
    const serializedItem = encodeURIComponent(JSON.stringify(simplifiedItem));
    router.push(`/course-details?item=${serializedItem}`);
  } catch (error) {
    console.error("Error fetching news details:", error);
  }
};


useEffect(() => {
  initializeNotificationListeners();
}, [])

  if (!loaded) {
    return null;
  }

  return (
    <AudioProvider>
      <RootLayoutNav />
      <AudioBar />
    </AudioProvider>
  );}

function RootLayoutNav() {
  return (
    <ToastProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(routes)/welcome-intro/index" />
        <Stack.Screen name="(routes)/login/index" />
        <Stack.Screen name="(routes)/sign-up/index" />
        <Stack.Screen name="(routes)/forgot-password/index" />
<Stack.Screen name="(routes)/video-player/index" options={{ title: 'Video Player' }} />
        <Stack.Screen
  name="(routes)/course-details/index"
  options={{
    headerShown: true, // Make sure the header is shown
    headerLeft: () => null, // This removes the back arrow button
    headerBackTitleVisible: false, // Hides the back title

    headerTitle: () => (
      <Image
        source={require("@/assets/logo.png")} // Replace with your image
        style={{ width: 80, height: 40 }} // Adjust image size as needed
        resizeMode="contain"
      />
    ),
    headerStyle: {
      backgroundColor: "#A6121F", // Set the background color to red
      
    },
    

  }}
/>

        
        <Stack.Screen
          name="(routes)/cart/index"
          options={{
            headerShown: false,
           
          }}
        />
      
      <Stack.Screen
          name="(routes)/terms/index"
          options={{
            headerShown: false,
           
          }}
        />
        <Stack.Screen
          name="(routes)/contact/index"
          options={{
            headerShown: false,
           
          }}
        />
    

      </Stack>
    


    </ToastProvider>
  );
}