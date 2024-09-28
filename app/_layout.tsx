import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import { Stack } from "expo-router";
import { ToastProvider } from "react-native-toast-notifications";
import { LogBox,Image } from "react-native";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    LogBox.ignoreAllLogs(true);
  }, []);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <ToastProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(routes)/welcome-intro/index" />
        <Stack.Screen name="(routes)/login/index" />
        <Stack.Screen name="(routes)/sign-up/index" />
        <Stack.Screen name="(routes)/forgot-password/index" />

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
        {/* <Stack.Screen
          name="(routes)/profile-details/index"
          options={{
            headerShown: true,
            title: "Profile Details",
            headerBackTitle: "Back",
          }}
        /> */}
     
      </Stack>
      {/* <Stack.Screen
  name="(routes)/full-screen-video/index"
  options={{
    headerShown: true,
    title: "Video",
  }}
/> */}


    </ToastProvider>
  );
}