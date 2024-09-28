import HomeScreen from "@/screens/home/home.screen";
import { ThemeProvider } from "@/utils/ThemeContext";

export default function index() {
  return (
    <ThemeProvider>
      <HomeScreen />
    </ThemeProvider>
  );
}