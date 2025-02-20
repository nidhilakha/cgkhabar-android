import Loader from "@/components/loader/loader";
import React from "react";
import useUser from "@/hooks/auth/useUser";
import messaging from '@react-native-firebase/messaging';

import {
  AntDesign,
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
  Linking,
  Share,
} from "react-native";
import {
  useFonts,
  Raleway_600SemiBold,
  Raleway_700Bold,
} from "@expo-google-fonts/raleway";
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
} from "@expo-google-fonts/nunito";
import { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { SERVER_URI } from "@/utils/uri";
import { router } from "expo-router";
// import { useTheme } from "@/utils/ThemeContext";
import Header from "@/components/header/header";
import { useTheme } from "@/utils/ThemeContext";
import { useFont } from "@/utils/FontContext";
import FrontScreen from "../auth/Front/Front.screen";

export default function ProfileScreen() {
  const { user, loading, setUser, setRefetch } = useUser();
  const [image, setImage] = useState<any>(null);
  const [loader, setLoader] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { largeFontSize, toggleFont } = useFont();
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);
  const playStoreUrl = "https://play.google.com/store/apps/details?id=com.cgkhabar.cgkhabarapp";

  // Function to handle opening the Play Store URL
  const handleRateApp = () => {
    Linking.openURL(playStoreUrl).catch((err) => console.error("Failed to open URL:", err));
  };
  const handleShareApp = async () => {
    try {
      await Share.share({
        message: `Check out this CG Khabar app: ${playStoreUrl}`,
      });
    } catch (error) {
      console.error("Error sharing app:", error);
    }
  };

  const handleInviteFriends = () => {
    const inviteMessage = `Hey! Check out this CG Khabar app: ${playStoreUrl}`;
    const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(inviteMessage)}`;

    Linking.openURL(whatsappUrl).catch((err) => console.error("Error opening WhatsApp:", err));
  };

  const handleToggleFontSize = () => toggleFont();

  const handleToggleTheme = () => toggleTheme();
  let [fontsLoaded, fontError] = useFonts({
    Raleway_600SemiBold,
    Raleway_700Bold,
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }


    // Consolidate the logic in useEffect to avoid any conditional hook calls
    // useEffect(() => {
    //   const checkPermission = async () => {
    //     try {
    //       const permissionGranted = await AsyncStorage.getItem("permissionGranted");
    //       if (permissionGranted === "true") {
    //         setIsNotificationEnabled(true); // If permission is granted, set switch to ON
    //       } else {
    //         setIsNotificationEnabled(false); // If not granted, set switch to OFF
    //       }
    //     } catch (error) {
    //       console.log("Error checking notification permission", error);
    //     }
    //   };
  
    //   checkPermission();
    // }, []);
  const logoutHandler = async () => {
    setLoader(true); 

    try {
      await axios.get(`${SERVER_URI}/logout`, { withCredentials: true });
      await AsyncStorage.removeItem("access_token");
      await AsyncStorage.removeItem("refresh_token");

  
      router.push("/(routes)/login");
    } catch (error) {
      console.error("Error during logout: ", error);
    } finally {
      setLoader(false); 
    }
  };

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission to access camera roll is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    if (!user) {
      Alert.alert("User data not available");
      return;
    }

    const formData = new FormData();
    formData.append("profile_picture", {
      uri: uri,
      name: "profile.jpg",
      type: "image/jpeg",
    } as any); // Cast to 'any'

    // const serverUri = process.env.SERVER_URI;
    const userId = user._id; // Ensure user type has _id defined

    try {
      const response = await fetch(
        `${SERVER_URI}update-profilepicture/${userId}`,
        {
          method: "PUT",
          body: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
          credentials: "include",
        }
      );

      const result = await response.json();
      if (response.ok) {
        Alert.alert("Profile picture updated successfully!");
      } else {
        Alert.alert(result.message || "Error uploading profile picture.");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      Alert.alert("Failed to upload image.");
    }
  };



  // const toggleNotification = async (value:any) => {
  //   try {
  //     if (value) {
  //       await requestNotificationPermission(); // Request permission when switched on
  //     } else {
  //       await denyNotificationPermission(); // Deny permission when switched off
  //     }
  //     setIsNotificationEnabled(value); // Set the switch state
  //   } catch (error) {
  //     console.log("Error toggling notification", error);
  //   }
  // };

  // const requestNotificationPermission = async () => {
  //   try {
  //     const authStatus = await messaging().requestPermission();
  //     const enabled =
  //       authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
  //       authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  //     if (enabled) {
  //       console.log("Notification permission granted");
  //       await AsyncStorage.setItem("permissionGranted", "true");
  //     } else {
  //       console.log("Notification permission denied");
  //       await AsyncStorage.setItem("permissionGranted", "false");
  //     }
  //   } catch (error) {
  //     console.error("Permission error:", error);
  //   }
  // };

  // const denyNotificationPermission = async () => {
  //   await AsyncStorage.setItem("permissionGranted", "false");
  //   console.log("Notification permission denied");
  // };


  
  return (
    
        <LinearGradient
        colors={theme === 'dark' ? ['#0C0C0C', '#0C0C0C'] : ['#F2F2F2', '#e3e3e3']}
        style={{ flex: 1, paddingTop: 50 }}
      >
          <Header />
          <ScrollView>
          {user && (
  <View>
    <View style={{ flexDirection: "row", justifyContent: "center" }}>
      <View style={{ position: "relative", marginTop: 20 }}>
        <Image
          source={{
            uri:
              image ||
              user?.profile_picture ||
              "https://res.cloudinary.com/dshp9jnuy/image/upload/v1665822253/avatars/nrxsg8sd9iy10bbsoenn.png",
          }}
          style={{ width: 90, height: 90, borderRadius: 100 }}
        />
        <TouchableOpacity
          style={{
            position: "absolute",
            bottom: 5,
            right: 0,
            width: 30,
            height: 30,
            backgroundColor: "#f5f5f5",
            borderRadius: 100,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={pickImage}
        >
          <Ionicons name="camera-outline" size={25} />
        </TouchableOpacity>
      </View>
    </View>
    <Text
      style={{
        textAlign: "center",
        fontSize: largeFontSize === "large" ? 29 : 25,
        paddingVertical: 10,
        paddingHorizontal: 10,
        fontWeight: "600",
        color: theme === "dark" ? "#fff" : "#000",
      }}
    >
      {user?.name}
    </Text>
  </View>
)}

            <View style={{ marginHorizontal: 10, marginTop: 30 }}>
            {user && (
              <TouchableOpacity  onPress={() => router.push("/(routes)/detail")}>

              <View style={{ marginTop: 10 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: 10,
                    paddingVertical:20,
                    backgroundColor: theme === "dark" ? "#272829" : "#fff",
                  }}
                >
                  <Text
                    style={{
                      fontSize: largeFontSize==="large" ? 20 : 16,
                      fontFamily: "Nunito_700Bold",
                      color: theme === "dark" ? "#fff" : "#000",
                    }}
                  >
                    Detail Profile
                  </Text>
                  <AntDesign name="right" size={26} color={theme === 'dark' ? "#fff" : "#D98B91"} />
                  </View>
              </View>
              </TouchableOpacity>
               )}
               {user && (
              <TouchableOpacity
             
                onPress={() => router.push("/(routes)/cart")}
              >
<View style={{ marginTop: 10 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: 10,
                    backgroundColor: theme === "dark" ? "#272829" : "#fff",
                    paddingVertical:20,
                  }}
                >
                  <Text
                    style={{
                      fontSize: largeFontSize==="large" ? 20 : 16,
                      fontFamily: "Nunito_700Bold",
                      color: theme === "dark" ? "#fff" : "#000",
                    }}
                  >
                    Saved News
                  </Text>

                  <AntDesign name="right" size={26} color={theme === 'dark' ? "#fff" : "#D98B91"} />
                  </View>
              </View>
              </TouchableOpacity>
               )}
               {user && (
              <View style={{ marginTop: 10 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: 10,
                    backgroundColor: theme === "dark" ? "#272829" : "#fff",
                    paddingVertical:20,
                  }}
                >
                  <Text
                    style={{
                      fontSize: largeFontSize==="large" ? 20 : 16,
                      fontFamily: "Nunito_700Bold",
                      color: theme === "dark" ? "#fff" : "#000",
                    }}
                  >
                    Notifications
                  </Text>

                  <AntDesign name="right" size={26} color={theme === 'dark' ? "#fff" : "#D98B91"} />

                </View>
              </View>
               )}
           
              <View style={{ marginTop: 10 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: 10,
                    backgroundColor: theme === "dark" ? "#272829" : "#fff",
                    paddingVertical:10,
                  }}
                >
                  <Text
                    style={{
                      fontSize: largeFontSize==="large" ? 20 : 16,
                      fontFamily: "Nunito_700Bold",
                      color: theme === "dark" ? "#fff" : "#000",
                    }}
                  >
                    Dark Mode
                  </Text>

                  <Switch
                    value={theme === "dark"}
                    onValueChange={handleToggleTheme}
                  />
                </View>
              </View>
              <View style={{ marginTop: 10 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: 10,
                    backgroundColor: theme === "dark" ? "#272829" : "#fff",
                    paddingVertical:10,
                  }}
                >
                  <Text
                    style={{
                      fontSize: largeFontSize==="large" ? 20 : 16,
                      fontFamily: "Nunito_700Bold",
                      color: theme === "dark" ? "#fff" : "#000",
                    }}
                  >
                    Increase Font Size
                  </Text>

                  <Switch
                    value={largeFontSize==="large"}
                    onValueChange={handleToggleFontSize}
                  />
                </View>
              </View>
              <TouchableOpacity onPress={handleShareApp}>

              <View style={{ marginTop: 10 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: 10,
                    backgroundColor: theme === "dark" ? "#272829" : "#fff",
                    paddingVertical:20,
                  }}
                >
                  <Text
                    style={{
                      fontSize: largeFontSize==="large" ? 20 : 16,
                      fontFamily: "Nunito_700Bold",
                      color: theme === "dark" ? "#fff" : "#000",
                    }}
                  >
                    Share the app
                  </Text>

                  <AntDesign name="right" size={26} color={theme === 'dark' ? "#fff" : "#D98B91"} />

                </View>
              </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleInviteFriends}>
              <View style={{ marginTop: 10 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: 10,
                    backgroundColor: theme === "dark" ? "#272829" : "#fff",
                    paddingVertical:20,
                  }}
                >
                  <Text
                    style={{
                      fontSize: largeFontSize==="large" ? 20 : 16,
                      fontFamily: "Nunito_700Bold",
                      color: theme === "dark" ? "#fff" : "#000",
                    }}
                  >
                    Invite Friends
                  </Text>

                  <AntDesign name="right" size={26} color={theme === 'dark' ? "#fff" : "#D98B91"} />

                </View>
              </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleRateApp}>
              <View style={{ marginTop: 10 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: 10,
                    backgroundColor: theme === "dark" ? "#272829" : "#fff",
                    paddingVertical:20,
                  }}
                >
                  <Text
                    style={{
                      fontSize: largeFontSize==="large" ? 20 : 16,
                      fontFamily: "Nunito_700Bold",
                      color: theme === "dark" ? "#fff" : "#000",
                    }}
                  >
                     Rate The App
                  </Text>

                  <AntDesign name="right" size={26} color={theme === 'dark' ? "#fff" : "#D98B91"} />

                </View>
              </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleRateApp}>
              <View style={{ marginTop: 10 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: 10,
                    backgroundColor: theme === "dark" ? "#272829" : "#fff",
                    paddingVertical:20,
                  }}
                >
                  <Text
                    style={{
                      fontSize: largeFontSize==="large" ? 20 : 16,
                      fontFamily: "Nunito_700Bold",
                      color: theme === "dark" ? "#fff" : "#000",
                    }}
                  >
                   Feedback
                  </Text>

                  <AntDesign name="right" size={26} color={theme === 'dark' ? "#fff" : "#D98B91"} />

                </View>
              </View>
              </TouchableOpacity>
              {user ? (
  <TouchableOpacity onPress={() => logoutHandler()}>
    <View style={{ marginTop: 10 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 10,
          backgroundColor: theme === "dark" ? "#272829" : "#fff",
          paddingVertical: 20,
        }}
      >
        <Text
          style={{
            fontSize: largeFontSize === "large" ? 20 : 16,
            fontFamily: "Nunito_700Bold",
            color: theme === "dark" ? "#fff" : "#000",
          }}
        >
          Log Out
        </Text>
        <AntDesign name="right" size={26} color={theme === "dark" ? "#fff" : "#D98B91"} />
      </View>
    </View>
  </TouchableOpacity>
) : (
  <TouchableOpacity  onPress={() => router.push("/(routes)/login")}>
    <View style={{ marginTop: 10 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 10,
          backgroundColor: theme === "dark" ? "#272829" : "#fff",
          paddingVertical: 20,
        }}
      >
        <Text
          style={{
            fontSize: largeFontSize === "large" ? 20 : 16,
            fontFamily: "Nunito_700Bold",
            color: theme === "dark" ? "#fff" : "#000",
          }}
        >
          Log In
        </Text>
        <AntDesign name="right" size={26} color={theme === "dark" ? "#fff" : "#D98B91"} />
      </View>
    </View>
  </TouchableOpacity>
)}

{!user && (
              <TouchableOpacity  onPress={() => router.push("/(routes)/sign-up")}>

              <View style={{ marginTop: 10 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: 10,
                    paddingVertical:20,
                    backgroundColor: theme === "dark" ? "#272829" : "#fff",
                  }}
                >
                  <Text
                    style={{
                      fontSize: largeFontSize==="large" ? 20 : 16,
                      fontFamily: "Nunito_700Bold",
                      color: theme === "dark" ? "#fff" : "#000",
                    }}
                  >
                    Sign Up
                  </Text>
                  <AntDesign name="right" size={26} color={theme === 'dark' ? "#fff" : "#D98B91"} />
                  </View>
              </View>
              </TouchableOpacity>
               )}

              
           
            </View>
            

            <View style={{ marginHorizontal: 10, marginTop: 30 }}>
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 20,
                }}

                onPress={() => router.push("/(routes)/terms")}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    columnGap: 30,
                  }}
                >
                  <View>
                    <Text
                      style={{
                        fontSize: 16,
                        fontFamily: "Nunito_700Bold",
                        paddingLeft: 20,
                        color: "#808080",
                      }}
                    >
                      Terms And Conditions
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 20,
                }}

                onPress={() => Linking.openURL("https://cgkhabar.com/policy")}
                >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    columnGap: 30,
                  }}
                >
                  <View>
                    <Text
                      style={{
                        fontSize: 16,
                        fontFamily: "Nunito_700Bold",
                        paddingLeft: 20,
                        color: "#808080",
                      }}
                    >
                     Privacy Policy
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 20,
                }}

                onPress={() => router.push("/(routes)/contact")}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    columnGap: 30,
                  }}
                >
                  <View>
                    <Text
                      style={{
                        fontSize: 16,
                        fontFamily: "Nunito_700Bold",
                        paddingLeft: 20,
                        color: "#808080",
                      }}
                    >
                      Contact Us
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </LinearGradient>
    
  );
}

const styles = StyleSheet.create({
  lightContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  darkContainer: {
    flex: 1,
    backgroundColor: "#2d3a4e",
    color: "#fff",
  },
});
