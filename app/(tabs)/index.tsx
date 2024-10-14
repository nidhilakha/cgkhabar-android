import HomeScreen from "@/screens/home/home.screen";
import { ThemeProvider } from "@/utils/ThemeContext";
import { useState } from "react";

export default function index() {
  const [activeCategory, setActiveCategory] = useState("All");

  return (
    <ThemeProvider>
      <HomeScreen />
    </ThemeProvider>
  );
}