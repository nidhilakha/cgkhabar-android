import useUser from "@/hooks/auth/useUser";
import { Tabs } from "expo-router";
import { Image, TouchableOpacity, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Href } from "expo-router";
import AntDesign from '@expo/vector-icons/AntDesign';


export default function TabsLayout() {
  const { user } = useUser();
  const router = useRouter();

  const handleTabPress = (routeName: string) => {
    if (routeName === "profile/index" && !user) {
      // Redirect to login if user is not authenticated
      router.push("/(routes)/login");
    } 
    if (routeName === "profile/index" && user) {
      router.push("/(tabs)/profile");

    }
    if (routeName === "courses/index") {
      router.push("/(tabs)/courses");

    }
    if (routeName === "search/index" ) {
      router.push("/(tabs)/search");

    }
    if (routeName === "index") {
      router.push("/(tabs)");

    }
  };
  return (

    <Tabs
    screenOptions={({ route }) => {
      return {
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
      };
    }}
  >
    <Tabs.Screen name="index" />
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