import HomeScreen from "@/screens/home/home.screen";
// import { ThemeProvider } from "@/utils/ThemeContext";
import { useState } from "react";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function index() {
  const [activeCategory, setActiveCategory] = useState("All");

  return (

      <HomeScreen />
  );
}