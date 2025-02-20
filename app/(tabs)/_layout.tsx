import useUser from "@/hooks/auth/useUser";
import { Tabs,useNavigation } from "expo-router";
import { Image, TouchableOpacity, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import AntDesign from '@expo/vector-icons/AntDesign';
import { useEffect, useState } from "react";
import { EventRegister } from "react-native-event-listeners";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function TabsLayout() {
  const { user, loading } = useUser(); // Assuming useUser gives you a loading state
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const navigation = useNavigation();
  const [activeCategory, setActiveCategory] = useState("All");
const[accesstoken,setaccesstoken]=useState(null);
  // Load activeCategory from AsyncStorage when the component mounts
  useEffect(() => {
    const loadActiveCategory = async () => {
      try {
        const storedCategory = await AsyncStorage.getItem("activeCategory");
        if (storedCategory) {
          setActiveCategory(storedCategory);
        }
      } catch (error) {
        console.error("Error loading activeCategory from AsyncStorage", error);
      }
    };

    loadActiveCategory();
  }, []);

  // Save activeCategory to AsyncStorage whenever it changes
  useEffect(() => {
    const saveActiveCategory = async () => {
      try {
        await AsyncStorage.setItem("activeCategory", activeCategory);
      } catch (error) {
        console.error("Error saving activeCategory to AsyncStorage", error);
      }
    };

    saveActiveCategory();
  }, [activeCategory]);

  useEffect(() => {
    const listener = EventRegister.addEventListener('ChangeTheme', (data) => {
      setDarkMode(data);
    });

    return () => {
      if (typeof listener === 'string') {
        EventRegister.removeEventListener(listener); 
      }
    };
  }, []);

  const handleTabPress = async (routeName: string) => {  // Marking the function as async
    if (routeName === "profile/index") {
      
  
      // if (!user) {
      //   console.log("user not exist");
      //   // Redirect to login if user is not authenticated
      //   router.push("/(routes)/login");
      // } else {
        router.push("/(tabs)/profile");
      // }
    } else if (routeName === "courses/index") {
      router.push("/(tabs)/courses");
    } else if (routeName === "search/index") {
      router.push("/(tabs)/search");
    } else if (routeName === "index") {
      // Set activeCategory to "All" when Home tab is clicked
      // setActiveCategory("All");
  
      // // Log the current value stored in AsyncStorage for activeCategory
      // try {
      //   const storedCategory = await AsyncStorage.getItem("activeCategory");
      //   console.log("Stored activeCategory from AsyncStorage:", storedCategory);
      // } catch (error) {
      //   console.error("Error reading from AsyncStorage:", error);
      // }
  
      router.push("/(tabs)");
    }
  };
  


  // useEffect(() => {
  //   const unsubscribe = navigation.addListener("tabPress", (e) => {
  //     console.log("tabPress triggered", e); // Check for tab press
  //   });

  //   return unsubscribe; // Clean up listener when component unmounts or updates
  // }, [navigation]);

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color }) => {
          let iconName;
          if (route.name === "index") {
            iconName = "home";
          } else if (route.name === "search/index") {
            iconName = "search1";
          } else if (route.name === "courses/index") {
            iconName = "playcircleo";
          } else if (route.name === "profile/index") {
            iconName = "user";
          }
          return (
            <AntDesign style={styles.footericon} name={iconName} size={28} color="black" />
          );
        },
        headerShown: false,
        tabBarShowLabel: false,
        tabBarButton: (props) => (
          <TouchableOpacity
            {...props}
            onPress={() => handleTabPress(route.name as string)}
          />
        ),
        tabBarStyle: {
          backgroundColor: '#2d2d2d', // Set the background color of the tab bar
        },
      })}
    >
      <Tabs.Screen name="index"  />
      <Tabs.Screen name="search/index" />
      <Tabs.Screen name="courses/index" />
      <Tabs.Screen name="profile/index" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  footericon: {
    color: "#fff",
  },
});
