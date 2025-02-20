import SearchScreen from "@/screens/search/search.screen";
import { EventRegister } from "react-native-event-listeners";
import { useContext, useEffect, useState } from "react";
import { ThemeProvider } from "@/utils/ThemeContext"; // Import ThemeProvider
import theme from "@/types/theme"
export default function Search() {

  return (
     <ThemeProvider>
   <SearchScreen />
   </ThemeProvider>
  );
}