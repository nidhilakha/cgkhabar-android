import Loader from "@/components/loader/loader";
import useUser from "@/hooks/auth/useUser";
import {
  AntDesign,
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { View, Text, ScrollView, Image, TouchableOpacity,StyleSheet } from "react-native";
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
import { useTheme } from "@/utils/ThemeContext";
import DarkModePopup from '@/components/DarkModePopup';
import Header from "@/components/header/header";

export default function ProfileScreen() {
  const { theme } = useTheme();
  const { user, loading, setUser, setRefetch } = useUser();
  const [image, setImage] = useState<any>(null);
  const [loader, setLoader] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const containerStyle = theme === 'dark' ? styles.darkContainer : styles.lightContainer;
  const [prevTheme, setPrevTheme] = useState(theme);

  useEffect(() => {
    if (prevTheme !== theme) {
      console.log("Current theme:", theme);
      setPrevTheme(theme);
    }
  }, [theme]);
  

  const toggleThemePopup = () => {
    setPopupVisible(!popupVisible);
  };
  
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



  const logoutHandler = async () => {
    setLoader(true); // Show loader during logout process

    try {
      await axios.get(`${SERVER_URI}/logout`, { withCredentials: true });
      console.log("logout");
      // Remove tokens from AsyncStorage
      await AsyncStorage.removeItem("access_token");
      await AsyncStorage.removeItem("refresh_token");

      // Optionally, reset user state if needed
      setUser(null); // Ensure this function or state setter exists and is properly set up

      // Redirect to login page after successful logout
      router.push("/(routes)/login");
    } catch (error) {
      console.error("Error during logout: ", error);
    } finally {
      setLoader(false); // Hide loader after logout process
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      setLoader(true);
      const base64Image = `data:image/jpeg;base64,${base64}`;
      setImage(base64Image);

      const accessToken = await AsyncStorage.getItem("access_token");
      const refreshToken = await AsyncStorage.getItem("refresh_token");

      try {
        const response = await axios.put(
          `${SERVER_URI}/update-user-avatar`,
          {
            avatar: base64Image,
          },
          {
            headers: {
              "access-token": accessToken,
              "refresh-token": refreshToken,
            },
          }
        );
        if (response.data) {
          setRefetch(true);
          setLoader(false);
        }
      } catch (error) {
        setLoader(false);
        console.log(error);
      }
    }
  };

  return (
    <>
      {loader || loading ? (
        <Loader />
      ) : (
        <LinearGradient  colors={["#F2F2F2", "#e3e3e3"]} style={{ flex: 1,paddingTop: 50 }}>
      <Header />
          <ScrollView  >
            <View style={{ flexDirection: "row", justifyContent: "center" }}>
              <View style={{ position: "relative" }}>
                <Image
                  source={{
                    uri:
                      image ||
                      user?.avatar?.url ||
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
                fontSize: 25,
                paddingVertical: 10,
                paddingHorizontal: 10,
                fontWeight: "600",

              }}
            >
              {user?.name}
            </Text>
            <View style={{ marginHorizontal: 10, marginTop: 30 }}>
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 20,
                  backgroundColor:"#fff",
                  paddingHorizontal: 10,
                  paddingVertical:10,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    columnGap: 30,
                  

                  }}
                >
                  <View
                    style={{
                      // borderWidth: 2,
                      // borderColor: "#D98B91",
                      padding: 15,
                      borderRadius: 100,
                      width: 55,
                      height: 55,
                      backgroundColor:"#D98B91"
                    }}
                  >
                    <FontAwesome
                      style={{ alignSelf: "center" }}
                      name="user"
                      size={20}
                      color={"#fff"}
                    />
                  </View>
                  <View>
                    <Text
                      style={{ fontSize: 16, fontFamily: "Nunito_700Bold" }}
                    >
                      Detail Profile
                    </Text>
                  </View>
                </View>
                <TouchableOpacity>
                  <AntDesign name="right" size={26} color={"#D98B91"} />
                </TouchableOpacity>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 20,
                  backgroundColor:"#fff",
                  paddingHorizontal: 10,
                  paddingVertical:10
                }}
                onPress={() => router.push("/(routes)/cart")}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    columnGap: 30,
                   
                  }}
                >
                  <View
                    style={{
                      // borderWidth: 2,
                      // borderColor: "#dde2ec",
                      padding: 15,
                      borderRadius: 100,
                      width: 55,
                      height: 55,
                      backgroundColor:"#D98B91"
                    }}
                  >
                    <MaterialCommunityIcons
                      style={{ alignSelf: "center" }}
                      name="book-account"
                      size={20}
                      color={"#fff"}
                    />
                  </View>
                  <View>
                    <Text
                      style={{ fontSize: 16, fontFamily: "Nunito_700Bold" }}
                    >
                      Saved News
                    </Text>
                  </View>
                </View>
                <TouchableOpacity>
                  <AntDesign name="right" size={26} color={"#D98B91"} />
                </TouchableOpacity>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 20,
                  backgroundColor:"#fff",
                  paddingVertical:10,
                  paddingHorizontal: 10,

                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    columnGap: 30,
                  }}
                >
                  <View
                    style={{
                      // borderWidth: 2,
                      // borderColor: "#dde2ec",
                      padding: 15,
                      borderRadius: 100,
                      width: 55,
                      height: 55,
                      backgroundColor:"#D98B91"

                    }}
                  >
                    <MaterialCommunityIcons
                      style={{ alignSelf: "center" }}
                      name="bell"
                      size={20}
                      color={"#fff"}
                    />
                  </View>
                  <View>
                    <Text
                      style={{ fontSize: 16, fontFamily: "Nunito_700Bold" }}
                    >
                      Notifications
                    </Text>
                  </View>
                </View>
                <TouchableOpacity>
                  <AntDesign name="right" size={26} color={"#D98B91"} />
                </TouchableOpacity>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 20,
                  paddingVertical:10,
                  backgroundColor:"#fff",
                  paddingHorizontal: 10,

                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    columnGap: 30,
                  }}
                >
                  <View
                    style={{
                      // borderWidth: 2,
                      // borderColor: "#dde2ec",
                      padding: 15,
                      borderRadius: 100,
                      width: 55,
                      height: 55,
                      backgroundColor:"#D98B91"

                    }}
                  >
                    <MaterialCommunityIcons
                      style={{ alignSelf: "center" }}
                      name="moon-waning-crescent"
                      size={20}
                      color={"#fff"}
                    />
                  </View>
                  <View>
                    <Text
                      style={{ fontSize: 16, fontFamily: "Nunito_700Bold" }}
                    >
                      Dark mode
                    </Text>
                  </View>
                </View>
                <TouchableOpacity  onPress={toggleThemePopup}>
                  <AntDesign name="right" size={26} color={"#D98B91"} />
                </TouchableOpacity>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 20,
                  paddingVertical:10,
                  backgroundColor:"#fff",
                  paddingHorizontal: 10,

                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    columnGap: 30,
                  }}
                >
                  <View
                    style={{
                      // borderWidth: 2,
                      // borderColor: "#dde2ec",
                      padding: 15,
                      borderRadius: 100,
                      width: 55,
                      height: 55,
                      backgroundColor:"#D98B91"

                    }}
                  >
                    <MaterialCommunityIcons
                      style={{ alignSelf: "center" }}
                      name="format-size"
                      size={20}
                      color={"#fff"}
                    />
                  </View>
                  <View>
                    <Text
                      style={{ fontSize: 16, fontFamily: "Nunito_700Bold" }}
                    >
                      Font Size
                    </Text>
                  </View>
                </View>
                <TouchableOpacity>
                  <AntDesign name="right" size={26} color={"#D98B91"} />
                </TouchableOpacity>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 20,
                  paddingVertical:10,
                  backgroundColor:"#fff",
                  paddingHorizontal: 10,

                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    columnGap: 30,
                  }}
                >
                  <View
                    style={{
                      // borderWidth: 2,
                      // borderColor: "#dde2ec",
                      padding: 15,
                      borderRadius: 100,
                      width: 55,
                      height: 55,
                      backgroundColor:"#D98B91"

                    }}
                  >
                    <MaterialCommunityIcons
                      style={{ alignSelf: "center" }}
                      name="share"
                      size={20}
                      color={"#fff"}
                    />
                  </View>
                  <View>
                    <Text
                      style={{ fontSize: 16, fontFamily: "Nunito_700Bold" }}
                    >
                      Share The App
                    </Text>
                  </View>
                </View>
                <TouchableOpacity>
                  <AntDesign name="right" size={26} color={"#D98B91"} />
                </TouchableOpacity>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 20,
                  paddingVertical:10,
                  backgroundColor:"#fff",
                  paddingHorizontal: 10,

                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    columnGap: 30,
                  }}
                >
                  <View
                    style={{
                      // borderWidth: 2,
                      // borderColor: "#dde2ec",
                      padding: 15,
                      borderRadius: 100,
                      width: 55,
                      height: 55,
                      backgroundColor:"#D98B91"

                    }}
                  >
                    <MaterialCommunityIcons
                      style={{ alignSelf: "center" }}
                      name="account-plus"
                      size={20}
                      color={"#fff"}
                    />
                  </View>
                  <View>
                    <Text
                      style={{ fontSize: 16, fontFamily: "Nunito_700Bold" }}
                    >
                      Invite Friends
                    </Text>
                  </View>
                </View>
                <TouchableOpacity>
                  <AntDesign name="right" size={26} color={"#D98B91"} />
                </TouchableOpacity>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 20,
                  paddingVertical:10,
                  backgroundColor:"#fff",
                  paddingHorizontal: 10,

                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    columnGap: 30,
                  }}
                >
                  <View
                    style={{
                      // borderWidth: 2,
                      // borderColor: "#dde2ec",
                      padding: 15,
                      borderRadius: 100,
                      width: 55,
                      height: 55,
                      backgroundColor:"#D98B91"

                    }}
                  >
                    <MaterialCommunityIcons
                      style={{ alignSelf: "center" }}
                      name="star"
                      size={20}
                      color={"#fff"}
                    />
                  </View>
                  <View>
                    <Text
                      style={{ fontSize: 16, fontFamily: "Nunito_700Bold" }}
                    >
                      Rate The App
                    </Text>
                  </View>
                </View>
                <TouchableOpacity>
                  <AntDesign name="right" size={26} color={"#D98B91"} />
                </TouchableOpacity>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 20,
                  paddingVertical:10,
                  backgroundColor:"#fff",
                  paddingHorizontal: 10,

                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    columnGap: 30,
                  }}
                >
                  <View
                    style={{
                      // borderWidth: 2,
                      // borderColor: "#dde2ec",
                      padding: 15,
                      borderRadius: 100,
                      width: 55,
                      height: 55,
                      backgroundColor:"#D98B91"

                    }}
                  >
                    <MaterialCommunityIcons
                      style={{ alignSelf: "center" }}
                      name="comment-alert"
                      size={20}
                      color={"#fff"}
                    />
                  </View>
                  <View>
                    <Text
                      style={{ fontSize: 16, fontFamily: "Nunito_700Bold" }}
                    >
                      Feedback
                    </Text>
                  </View>
                </View>
                <TouchableOpacity>
                  <AntDesign name="right" size={26} color={"#D98B91"} />
                </TouchableOpacity>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 20,
                  paddingVertical:10,
                  backgroundColor:"#fff",
                  paddingHorizontal: 10,

                }}
                onPress={() => logoutHandler()}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    columnGap: 30,
                  }}
                >
                  <View
                    style={{
                      // borderWidth: 2,
                      // borderColor: "#dde2ec",
                      padding: 15,
                      borderRadius: 100,
                      width: 55,
                      height: 55,
                      backgroundColor:"#D98B91"

                    }}
                  >
                    <Ionicons
                      style={{ alignSelf: "center" }}
                      name="log-out"
                      size={20}
                      color={"#fff"}
                    />
                  </View>
                  <Text
                    style={{ fontSize: 16, fontFamily: "Nunito_700Bold" }}
                  >
                    Log Out
                  </Text>
                </View>
                <TouchableOpacity>
                  <AntDesign name="right" size={26} color={"#D98B91"} />
                </TouchableOpacity>
              </TouchableOpacity>
            </View>

            <View>
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 20,
                }}
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
            </View>
          </ScrollView>
          <DarkModePopup
            visible={popupVisible}
            onClose={toggleThemePopup}
          />
        </LinearGradient>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  lightContainer: {
    flex: 1,
    backgroundColor: 'white',
 
  },
  darkContainer: {
    flex: 1,
    backgroundColor: '#2d3a4e',
    color:'#fff'
  
  },
  
});
